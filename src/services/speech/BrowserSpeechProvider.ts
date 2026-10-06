/**
 * Browser Web Speech API Provider with strict Vietnamese voice filtering.
 * CRITICAL RULE 1: NEVER uses an English or default non-Vietnamese voice to read Vietnamese text!
 * CRITICAL RULE 2: Holds activeUtterance reference to prevent iOS Safari GC bugs.
 * CRITICAL RULE 3: Never triggers speak() inside onvoiceschanged.
 */

export interface BrowserVoiceInfo {
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

export class BrowserSpeechProvider {
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private allVoices: SpeechSynthesisVoice[] = [];
  private vietnameseVoices: SpeechSynthesisVoice[] = [];
  private isLoaded: boolean = false;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private isCurrentlySpeaking: boolean = false;
  private boundSynth: SpeechSynthesis | null = null;
  private listeners = new Set<() => void>();
  private waiting = 0;
  public subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  public getVoiceState = (): 'ready' | 'loading' | 'unavailable' => this.selectedVoice ? 'ready' : this.waiting > 0 ? 'loading' : 'unavailable';
  private notify() { for (const listener of this.listeners) listener(); }

  constructor() {
    this.initVoices();
  }

  public initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const loadVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        this.allVoices = voices;

        // Strict Vietnamese filter
        this.vietnameseVoices = voices.filter(voice => (voice.lang || '').toLowerCase().startsWith('vi'));
        this.vietnameseVoices.sort((a, b) => Number(b.lang.toLowerCase() === 'vi-vn') - Number(a.lang.toLowerCase() === 'vi-vn'));

        if (this.vietnameseVoices.length > 0) {
          this.selectedVoice = this.vietnameseVoices[0];
        } else {
          this.selectedVoice = null;
        }

        this.isLoaded = true;
        this.notify();
      } catch (err) {
        this.selectedVoice = null;
        this.notify();
      }
    };

    loadVoices();
    // Do NOT call speak() in onvoiceschanged! Only update voice list.
    if (this.boundSynth !== window.speechSynthesis) {
      this.boundSynth = window.speechSynthesis;
      if (typeof this.boundSynth.addEventListener === 'function') this.boundSynth.addEventListener('voiceschanged', loadVoices);
      else {
        const previous = this.boundSynth.onvoiceschanged;
        this.boundSynth.onvoiceschanged = event => { previous?.call(window.speechSynthesis, event); loadVoices(); };
      }
    }
  }

  /** One finite event wait per request; cancellation removes timer and listener. */
  public waitForVietnameseVoice(signal: AbortSignal, timeoutMs = 1500): Promise<boolean> {
    this.initVoices();
    if (signal.aborted || typeof window === 'undefined' || !('speechSynthesis' in window)) return Promise.resolve(false);
    if (this.selectedVoice) return Promise.resolve(true);
    return new Promise(resolve => {
      let settled = false;
      let timer: ReturnType<typeof setTimeout>;
      const finish = (available: boolean) => {
        if (settled) return;
        settled = true; clearTimeout(timer); unsubscribe(); signal.removeEventListener('abort', abort);
        this.waiting--; this.notify(); resolve(available);
      };
      const abort = () => finish(false);
      const unsubscribe = this.subscribe(() => { if (this.selectedVoice) finish(true); });
      timer = setTimeout(() => finish(false), timeoutMs);
      signal.addEventListener('abort', abort, { once: true });
      this.waiting++; this.notify();
    });
  }

  public isAvailable(): boolean {
    if (!this.isLoaded) {
      this.initVoices();
    }
    return this.selectedVoice !== null;
  }

  public getSelectedVoice(): SpeechSynthesisVoice | null {
    return this.selectedVoice;
  }

  public getVietnameseVoicesInfo(): BrowserVoiceInfo[] {
    return this.vietnameseVoices.map((v) => ({
      name: v.name,
      lang: v.lang,
      localService: v.localService,
      default: v.default,
    }));
  }

  public getAllVoicesCount(): number {
    return this.allVoices.length;
  }

  public speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      generation?: number;
      isGenerationValid?: (gen: number) => boolean;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;

    const reqGen = options?.generation ?? 0;
    const isValid = () => (options?.isGenerationValid ? options.isGenerationValid(reqGen) : true);

    if (!isValid()) {
      return false;
    }

    // Safety check: MUST have genuine Vietnamese voice
    if (!this.selectedVoice) {
      return false;
    }

    try {
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      this.activeUtterance = utterance; // Prevent iOS GC
      utterance.voice = this.selectedVoice;
      utterance.lang = 'vi-VN';
      utterance.rate = options?.rate ?? 0.9;
      utterance.pitch = options?.pitch ?? 1.05;
      utterance.volume = 1.0;

      const ownsUtterance = () => this.activeUtterance === utterance && isValid();
      const detach = () => { utterance.onstart = utterance.onend = utterance.onerror = null; };
      utterance.onstart = () => {
        if (!ownsUtterance()) return;
        this.isCurrentlySpeaking = true;
        options?.onStart?.();
      };

      utterance.onend = () => {
        if (!ownsUtterance()) return;
        detach();
        this.isCurrentlySpeaking = false;
        this.activeUtterance = null;
        if (isValid()) {
          options?.onEnd?.();
        }
      };

      utterance.onerror = (e) => {
        if (!ownsUtterance()) return;
        detach();
        this.isCurrentlySpeaking = false;
        this.activeUtterance = null;
        console.warn('[TTS] Browser speech synthesis error:', e);
        options?.onError?.(e);
      };

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      this.isCurrentlySpeaking = false;
      this.activeUtterance = null;
      console.error('[TTS] Browser speak exception:', err);
      options?.onError?.(err);
      return false;
    }
  }

  public stop() {
    const previous = this.activeUtterance;
    this.activeUtterance = null;
    this.isCurrentlySpeaking = false;
    if (previous) previous.onstart = previous.onend = previous.onerror = null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    this.activeUtterance = null;
    this.isCurrentlySpeaking = false;
  }

  public isSpeaking(): boolean {
    return this.isCurrentlySpeaking;
  }
}

export const browserSpeechProvider = new BrowserSpeechProvider();
