// Android's WebView has no window.speechSynthesis, so inside the store app the
// app's Web Speech calls would read nothing aloud. This file provides the same
// small surface (speechSynthesis + SpeechSynthesisUtterance) on top of the
// phone's own text-to-speech engine, so the rest of the app stays unchanged.

export interface NativeVoice {
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
  voiceURI: string;
}

/** The parts of @capacitor-community/text-to-speech this file uses. */
export interface NativeTts {
  speak(options: { text: string; lang?: string; rate?: number; pitch?: number; volume?: number; voice?: number }): Promise<void>;
  stop(): Promise<void>;
  getSupportedVoices(): Promise<{ voices: NativeVoice[] }>;
  isLanguageSupported(options: { lang: string }): Promise<{ supported: boolean }>;
}

type Handler = ((event: Event) => void) | null;
type Voice = NativeVoice & { index?: number };

/** Languages the apps speak; offered even when the phone lists no named voice for them. */
const APP_LANGS = ['vi-VN', 'en-US'];

const event = (type: string, extra: object = {}) => Object.assign(new Event(type), extra);

export function createNativeSpeech(tts: NativeTts) {
  class Utterance extends EventTarget {
    text: string;
    lang = '';
    voice: Voice | null = null;
    rate = 1;
    pitch = 1;
    volume = 1;
    onstart: Handler = null;
    onend: Handler = null;
    onerror: Handler = null;
    onboundary: Handler = null;
    onmark: Handler = null;
    onpause: Handler = null;
    onresume: Handler = null;
    constructor(text = '') { super(); this.text = text; }
  }

  class Synthesis extends EventTarget {
    speaking = false;
    pending = false;
    paused = false;
    onvoiceschanged: Handler = null;
    private voices: Voice[] = [];
    private current: Utterance | null = null;
    readonly ready: Promise<void>;

    constructor() {
      super();
      this.ready = this.loadVoices();
    }

    private async loadVoices() {
      try {
        const { voices } = await tts.getSupportedVoices();
        const list: Voice[] = voices.map((v, index) => ({ ...v, index }));
        for (const lang of APP_LANGS) {
          const prefix = lang.slice(0, 2);
          if (list.some(v => v.lang.toLowerCase().startsWith(prefix))) continue;
          const { supported } = await tts.isLanguageSupported({ lang }).catch(() => ({ supported: false }));
          if (supported) list.push({ name: `Giọng máy (${lang})`, lang, localService: true, default: false, voiceURI: lang });
        }
        this.voices = list;
      } catch {
        this.voices = [];
      }
      const changed = event('voiceschanged');
      this.onvoiceschanged?.(changed);
      this.dispatchEvent(changed);
    }

    getVoices() { return this.voices.slice(); }

    speak(u: Utterance) {
      const fire = (type: 'start' | 'end' | 'error', extra: object = {}) => {
        const e = event(type, { utterance: u, ...extra });
        u[`on${type}`]?.(e);
        u.dispatchEvent(e);
      };
      this.current = u;
      this.speaking = true;
      fire('start');
      tts.speak({
        text: u.text,
        lang: u.voice?.lang || u.lang || undefined,
        rate: u.rate,
        pitch: u.pitch,
        volume: u.volume,
        voice: u.voice?.index,
      }).then(
        () => { if (this.current === u) { this.current = null; this.speaking = false; fire('end'); } },
        (error) => { if (this.current === u) { this.current = null; this.speaking = false; fire('error', { error: String(error) }); } },
      );
    }

    /** Stops speech; like the browser, the stopped utterance gets no end event here. */
    cancel() {
      this.current = null;
      this.speaking = false;
      void tts.stop().catch(() => {});
    }

    pause() {}
    resume() {}
  }

  return { speechSynthesis: new Synthesis(), SpeechSynthesisUtterance: Utterance };
}
