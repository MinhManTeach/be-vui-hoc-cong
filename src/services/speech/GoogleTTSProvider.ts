/**
 * Primary Google Cloud / Neural Vietnamese TTS Provider
 * Supports Google AI Studio Preview, Local Development, and Netlify Production.
 * Enforces Generation Tokens so stale async responses never play.
 * Manages a single active HTMLAudioElement with full disposal.
 */

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

export class GoogleTTSProvider {
  private currentAudio: HTMLAudioElement | null = null;
  private audioBlobCache = new Map<string, string>(); // normalized text -> blob URL
  private isCurrentlyPlaying: boolean = false;
  private backendAvailable: boolean = true;
  private hasLoggedFallback: boolean = false;
  private activeEndpointUsed: string = '';
  private currentFetchAbort: AbortController | null = null;

  constructor() {
    this.activeEndpointUsed =
      detectEnvironment() === 'Netlify Production' ? '/.netlify/functions/tts' : '/api/tts';
  }

  public isBackendAvailable(): boolean {
    return this.backendAvailable;
  }

  public getActiveEndpoint(): string {
    return this.activeEndpointUsed;
  }

  public recheckBackend() {
    this.backendAvailable = true;
    this.hasLoggedFallback = false;
  }

  public getCurrentAudio(): HTMLAudioElement | null {
    return this.currentAudio;
  }

  /**
   * Speak Vietnamese audio via Cloud TTS backend.
   * Generation token checks prevent stale responses from ever playing.
   */
  public async speak(
    text: string,
    options?: {
      generation?: number;
      isGenerationValid?: (gen: number) => boolean;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const reqGen = options?.generation ?? 0;
    const isValid = () => (options?.isGenerationValid ? options.isGenerationValid(reqGen) : true);

    if (!isValid()) {
      return false;
    }

    if (!this.backendAvailable) {
      return false;
    }

    this.stop();

    try {
      let audioUrl = this.audioBlobCache.get(text);

      if (!audioUrl) {
        const env = detectEnvironment();
        const endpointsToTry =
          env === 'Netlify Production'
            ? ['/.netlify/functions/tts', '/api/tts']
            : ['/api/tts', '/.netlify/functions/tts'];

        let fetchSuccess = false;

        for (const ep of endpointsToTry) {
          if (!isValid()) return false;

          try {
            this.currentFetchAbort = new AbortController();
            const timeoutId = setTimeout(() => {
              if (this.currentFetchAbort) this.currentFetchAbort.abort();
            }, 3500); // 3.5s timeout for fast response

            const res = await fetch(`${ep}?text=${encodeURIComponent(text)}`, {
              signal: this.currentFetchAbort.signal,
            });
            clearTimeout(timeoutId);

            if (!isValid()) {
              return false;
            }

            if (res.ok) {
              const blob = await res.blob();
              audioUrl = URL.createObjectURL(blob);
              this.audioBlobCache.set(text, audioUrl);
              this.activeEndpointUsed = ep;
              fetchSuccess = true;
              break;
            } else if (res.status === 404) {
              continue;
            }
          } catch {
            continue;
          } finally {
            this.currentFetchAbort = null;
          }
        }

        if (!isValid()) {
          return false;
        }

        if (!fetchSuccess || !audioUrl) {
          this.backendAvailable = false;
          if (!this.hasLoggedFallback) {
            console.log('[TTS] Cloud backend unavailable. Falling back to browser Vietnamese TTS.');
            this.hasLoggedFallback = true;
          }
          return false;
        }
      }

      if (!isValid()) {
        return false;
      }

      // Single active Audio element management with complete disposal
      this.disposeAudio();

      const audio = new Audio();
      this.currentAudio = audio;
      audio.preload = 'auto';
      audio.src = audioUrl;

      return new Promise<boolean>((resolve) => {
        let isResolved = false;

        const cleanupAndResolve = (success: boolean) => {
          if (isResolved) return;
          isResolved = true;
          this.isCurrentlyPlaying = false;
          this.disposeAudio();
          resolve(success);
        };

        audio.onended = () => {
          if (!isValid()) {
            cleanupAndResolve(false);
            return;
          }
          options?.onEnd?.();
          cleanupAndResolve(true);
        };

        audio.onerror = (e) => {
          console.warn('[TTS] Cloud Audio error:', e);
          options?.onError?.(new Error('Audio playback failed'));
          cleanupAndResolve(false);
        };

        // Guard against iOS/Safari play promise rejections
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (!isValid()) {
                audio.pause();
                cleanupAndResolve(false);
                return;
              }
              this.isCurrentlyPlaying = true;
            })
            .catch((playErr) => {
              console.warn('[TTS] Audio play() blocked or rejected:', playErr);
              options?.onError?.(playErr);
              cleanupAndResolve(false);
            });
        } else {
          this.isCurrentlyPlaying = true;
        }
      });
    } catch (err) {
      this.backendAvailable = false;
      if (!this.hasLoggedFallback) {
        console.log('[TTS] Cloud backend unavailable. Falling back to browser Vietnamese TTS.');
        this.hasLoggedFallback = true;
      }
      options?.onError?.(err);
      return false;
    }
  }

  private disposeAudio() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.src = '';
        this.currentAudio.onended = null;
        this.currentAudio.onerror = null;
        this.currentAudio.onplay = null;
        this.currentAudio.load();
      } catch {}
      this.currentAudio = null;
    }
    this.isCurrentlyPlaying = false;
  }

  public stop() {
    if (this.currentFetchAbort) {
      try {
        this.currentFetchAbort.abort();
      } catch {}
      this.currentFetchAbort = null;
    }
    this.disposeAudio();
  }

  public isPlaying(): boolean {
    return this.isCurrentlyPlaying;
  }

  public clearCache() {
    this.audioBlobCache.forEach((url) => URL.revokeObjectURL(url));
    this.audioBlobCache.clear();
  }
}

export const googleTTSProvider = new GoogleTTSProvider();
