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
        this.vietnameseVoices = voices.filter((voice) => {
          const lang = (voice.lang || '').toLowerCase();
          const name = (voice.name || '').toLowerCase();
          return (
            lang === 'vi-vn' ||
            lang === 'vi_vn' ||
            lang.startsWith('vi') ||
            name.includes('vietnamese') ||
            name.includes('vietnam') ||
            name.includes('tiếng việt')
          );
        });

        if (this.vietnameseVoices.length > 0) {
          this.selectedVoice = this.vietnameseVoices[0];
          console.log('[TTS] Browser Vietnamese Voice ready:', {
            name: this.selectedVoice.name,
            lang: this.selectedVoice.lang,
          });
        } else {
          this.selectedVoice = null;
        }

        this.isLoaded = true;
      } catch (err) {
        console.warn('[TTS] Failed to query browser voices:', err);
      }
    };

    loadVoices();
    // Do NOT call speak() in onvoiceschanged! Only update voice list.
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
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
      console.warn('[TTS] Cannot speak via browser: No Vietnamese voice found.');
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

      utterance.onstart = () => {
        if (!isValid()) {
          this.stop();
          return;
        }
        this.isCurrentlySpeaking = true;
      };

      utterance.onend = () => {
        this.isCurrentlySpeaking = false;
        this.activeUtterance = null;
        if (isValid()) {
          options?.onEnd?.();
        }
      };

      utterance.onerror = (e) => {
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
