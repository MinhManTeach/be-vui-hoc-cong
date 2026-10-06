/**
 * Primary Google Cloud / Neural Vietnamese TTS Provider
 * Supports Google AI Studio Preview, Local Development, and Netlify Production.
 * Enforces Generation Tokens so stale async responses never play.
 * Manages a single active HTMLAudioElement with full disposal.
 */

import { cloudTtsConfigured } from './cloudConfig';

export type AppEnvironment = 'Google AI Studio Preview' | 'Local Development' | 'Netlify Production';

export function detectEnvironment(): AppEnvironment {
  if (typeof window === 'undefined') return 'Local Development';
  const host = window.location.hostname || '';
  if (host.includes('netlify.app')) {
    return 'Netlify Production';
  }
  if (
    host.includes('run.app') ||
    host.includes('googleusercontent.com') ||
    host.includes('aistudio') ||
    window.location.port === '3000'
  ) {
    return 'Google AI Studio Preview';
  }
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'Local Development';
  }
  return 'Google AI Studio Preview';
}

export interface CloudSpeechResult {
  started: boolean;
  completed: boolean;
  cancelled: boolean;
  error?: unknown;
}

interface CloudRequest {
  controller: AbortController | null;
  timer: ReturnType<typeof setTimeout> | null;
  audio: HTMLAudioElement | null;
  started: boolean;
  settled: boolean;
  resolve: (result: CloudSpeechResult) => void;
}

export class GoogleTTSProvider {
  constructor(private configured = cloudTtsConfigured()) {}
  public isConfigured() { return this.configured; }
  private active: CloudRequest | null = null;
  private audioBlobCache = new Map<string, string>();
  private audioBlobSizes = new Map<string, number>();
  private cachedBytes = 0;
  private backendAvailable = true;
  private activeEndpointUsed = detectEnvironment() === 'Netlify Production' ? '/.netlify/functions/tts' : '/api/tts';

  public isBackendAvailable() { return this.configured && this.backendAvailable; }
  public getActiveEndpoint() { return this.activeEndpointUsed; }
  public recheckBackend() { this.backendAvailable = true; }
  public getCurrentAudio() { return this.active?.audio ?? null; }
  public isPlaying() { return !!this.active?.started; }

  public speak(text: string, options?: {
    generation?: number;
    isGenerationValid?: (gen: number) => boolean;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: unknown) => void;
  }): Promise<CloudSpeechResult> {
    const generation = options?.generation ?? 0;
    const generationValid = () => options?.isGenerationValid?.(generation) ?? true;
    if (!this.configured || typeof window === 'undefined' || !generationValid()) {
      return Promise.resolve({ started: false, completed: false, cancelled: true });
    }
    this.stop();
    return new Promise(resolve => {
      const request: CloudRequest = { controller: null, timer: null, audio: null, started: false, settled: false, resolve };
      this.active = request;
      const valid = () => this.active === request && !request.settled && generationValid();
      const finish = (completed: boolean, error?: unknown) => {
        if (!valid()) return;
        const started = request.started || (request.audio?.currentTime ?? 0) > 0;
        this.dispose(request, { started, completed, cancelled: false, error });
        if (error) this.evictCachedAudio(text);
        if (completed) options?.onEnd?.();
        else if (error) options?.onError?.(error);
      };
      const start = () => {
        if (!valid() || request.started) return;
        request.started = true;
        options?.onStart?.();
      };

      const run = async () => {
        let url = this.audioBlobCache.get(text);
        if (!url) {
          const endpoints = detectEnvironment() === 'Netlify Production'
            ? ['/.netlify/functions/tts', '/api/tts']
            : ['/api/tts', '/.netlify/functions/tts'];
          for (const endpoint of endpoints) {
            if (!valid()) return;
            // The timer closes over this controller, never a newer request's controller.
            const controller = new AbortController();
            request.controller = controller;
            const timer = setTimeout(() => controller.abort(), 3500);
            request.timer = timer;
            try {
              const response = await fetch(`${endpoint}?text=${encodeURIComponent(text)}`, { signal: controller.signal });
              if (!valid()) return;
              if (!response.ok) continue;
              const blob = await response.blob();
              if (!valid()) return;
              if (controller.signal.aborted || !blob.type.toLowerCase().startsWith('audio/') || !blob.size || blob.size > 500_000) continue;
              // Bound cached object URLs and revoke every evicted URL.
              while (this.audioBlobCache.size && (this.audioBlobCache.size >= 128 || this.cachedBytes + blob.size > 4_000_000)) {
                const oldest = this.audioBlobCache.keys().next().value!;
                this.evictCachedAudio(oldest);
              }
              url = URL.createObjectURL(blob);
              this.audioBlobCache.set(text, url);
              this.audioBlobSizes.set(text, blob.size);
              this.cachedBytes += blob.size;
              this.activeEndpointUsed = endpoint;
              this.backendAvailable = true;
              break;
            } catch {
              if (!valid()) return;
            } finally {
              clearTimeout(timer);
              if (request.timer === timer) request.timer = null;
              if (request.controller === controller) request.controller = null;
            }
          }
        }
        if (!valid()) return;
        if (!url) {
          // Retry on the next request after a transient network failure.
          this.backendAvailable = false;
          finish(false, new Error('Cloud TTS unavailable'));
          return;
        }
        const audio = new Audio();
        request.audio = audio;
        audio.preload = 'auto';
        audio.src = url;
        // onplay is conservative: once playback may have begun, never replay via fallback.
        audio.onplay = start;
        audio.onplaying = start;
        audio.onended = () => { start(); finish(true); };
        audio.onerror = () => finish(false, new Error('Cloud audio playback failed'));
        try {
          const playback = audio.play();
          if (playback) playback.then(start, error => finish(false, error));
          else start();
        } catch (error) { finish(false, error); }
      };
      void run().catch(error => finish(false, error));
    });
  }

  private dispose(request: CloudRequest, result: CloudSpeechResult) {
    if (request.settled) return;
    request.settled = true;
    if (this.active === request) this.active = null;
    if (request.timer !== null) clearTimeout(request.timer);
    request.timer = null;
    request.controller?.abort();
    request.controller = null;
    const audio = request.audio;
    request.audio = null;
    if (audio) {
      audio.onended = audio.onerror = audio.onplay = audio.onplaying = null;
      try { audio.pause(); audio.currentTime = 0; audio.src = ''; audio.load(); } catch {}
    }
    request.resolve(result);
  }

  public stop() {
    if (this.active) this.dispose(this.active, { started: this.active.started, completed: false, cancelled: true });
  }

  private evictCachedAudio(text: string) {
    const url = this.audioBlobCache.get(text);
    if (url) URL.revokeObjectURL(url);
    this.cachedBytes -= this.audioBlobSizes.get(text) ?? 0;
    this.audioBlobCache.delete(text);
    this.audioBlobSizes.delete(text);
  }

  public clearCache() {
    this.stop();
    this.audioBlobCache.forEach(url => URL.revokeObjectURL(url));
    this.audioBlobCache.clear();
    this.audioBlobSizes.clear();
    this.cachedBytes = 0;
  }
}

export const googleTTSProvider = new GoogleTTSProvider();
