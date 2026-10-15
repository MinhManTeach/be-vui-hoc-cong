import { browserSpeechProvider, BrowserVoiceInfo } from './BrowserSpeechProvider';

/**
 * Convert numbers 0-100 to natural Vietnamese words for clear preschool pronunciation.
 */
export function numberToVietnamese(n: number): string {
  if (isNaN(n)) return '';
  n = Math.floor(n);
  if (n === 0) return 'không';
  if (n < 0) return 'âm ' + numberToVietnamese(Math.abs(n));

  const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

  if (n <= 9) return ones[n];

  if (n === 10) return 'mười';
  if (n < 20) {
    const unit = n % 10;
    if (unit === 1) return 'mười một';
    if (unit === 5) return 'mười lăm';
    return 'mười ' + ones[unit];
  }

  if (n < 100) {
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    let tenStr = ones[ten] + ' mươi';
    if (unit === 0) return tenStr;
    if (unit === 1) return ones[ten] + ' mươi mốt';
    if (unit === 4) return ones[ten] + ' mươi tư';
    if (unit === 5) return ones[ten] + ' mươi lăm';
    return tenStr + ' ' + ones[unit];
  }

  if (n === 100) return 'một trăm';

  return String(n);
}

/**
 * Remove emojis, decorative symbols, HTML, and extra whitespace before sending to TTS.
 */
export function sanitizeSpeechText(text: string): string {
  if (!text) return '';
  return text
    // Normalize unicode composition
    .normalize('NFKC')
    // Remove HTML tags if any
    .replace(/<[^>]*>/g, '')
    // Remove emojis and unicode pictographs
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ''
    )
    // Remove decorative symbols
    .replace(/[✨🎉⭐🔥🎁🏆🏅🎖️💎🍎🧺🚗🐟🎈🐰🦋🌸🍓🔴🔵●🎮🔊🗑️⚙️💡]/g, '')
    // Replace duplicate spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Convert math formulas like "8 + 5 = ?" or "1 + ? = 10" into natural spoken Vietnamese phrases.
 */
export function mathExpressionToSpeech(text: string): string {
  if (!text) return '';

  let cleaned = sanitizeSpeechText(text);

  // Pattern: "1 + ? = 10" or "A + ? = B"
  const missingAddendRegex = /(\d+)\s*\+\s*\?\s*=\s*(\d+)/i;
  if (missingAddendRegex.test(cleaned)) {
    cleaned = cleaned.replace(missingAddendRegex, (_, a, total) => {
      const aVi = numberToVietnamese(parseInt(a, 10));
      const totalVi = numberToVietnamese(parseInt(total, 10));
      return `${aVi} cần thêm mấy để tạo thành ${totalVi}?`;
    });
  }

  // Pattern: "A cần thêm mấy để thành 10"
  const make10Regex = /(\d+)\s*cần thêm mấy để(?: thành)?\s*(\d+)/i;
  if (make10Regex.test(cleaned)) {
    cleaned = cleaned.replace(make10Regex, (_, a, b) => {
      const aVi = numberToVietnamese(parseInt(a, 10));
      const bVi = numberToVietnamese(parseInt(b, 10));
      return `${aVi} cần thêm mấy để tạo thành ${bVi}?`;
    });
  }

  // Pattern: "A + B = ?" or "Tính: A + B = ?"
  const addRegex = /(\d+)\s*\+\s*(\d+)(?:\s*=\s*\??)?/g;
  cleaned = cleaned.replace(addRegex, (_, a, b) => {
    const aVi = numberToVietnamese(parseInt(a, 10));
    const bVi = numberToVietnamese(parseInt(b, 10));
    return `${aVi} cộng ${bVi} bằng bao nhiêu?`;
  });

  // Pattern: "Tách X ..."
  const splitRegex = /Tách\s*(\d+)/i;
  if (splitRegex.test(cleaned)) {
    cleaned = cleaned.replace(splitRegex, (_, a) => {
      const aVi = numberToVietnamese(parseInt(a, 10));
      return `Con hãy giúp Thỏ Bông tách số ${aVi} nhé!`;
    });
  }

  // Pattern: "Có bao nhiêu X?"
  const countRegex = /Có bao nhiêu\s+(.*?)[\?\.\!]?$/i;
  if (countRegex.test(cleaned)) {
    cleaned = cleaned.replace(countRegex, (_, item) => {
      return `Con hãy đếm xem có bao nhiêu ${item.trim()} nhé!`;
    });
  }

  return cleaned.trim();
}

export type ActiveSpeechEngine =
  | 'Browser Vietnamese Voice'
  | 'Voice unavailable (Chế độ êm dịu)'
  | 'None';

export type SpeechEventType =
  | 'QUESTION_CHANGED'
  | 'ANSWER_CORRECT'
  | 'ANSWER_WRONG'
  | 'REPLAY'
  | 'UI_CLICK'
  | 'SYSTEM';

export interface SpeechRequestOptions {
  eventType?: SpeechEventType;
  questionId?: string;
  forceReplay?: boolean;
  debounceMs?: number;
  delayMs?: number;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export interface SpeechDebugStats {
  activeEngine: ActiveSpeechEngine;
  currentSpeechId: string | null;
  currentGeneration: number;
  isSpeaking: boolean;
  requestCount: number;
  playCount: number;
  dedupedCount: number;
  cancelledCount: number;
  hasBrowserVietnameseVoice: boolean;
  browserVoiceName: string | null;
  browserVietnameseVoices: BrowserVoiceInfo[];
  totalBrowserVoices: number;
  language: string;
}

/**
 * SpeechManager - The Unified Single Speech Controller.
 * Enforces:
 * 1. Global playback lock (only ONE speech at any time)
 * 2. Generation token (stale responses cannot play)
 * 3. Uses only the device's own Vietnamese voice (no network, no cost)
 * 4. Deduplication of identical requests within 1200ms
 * 5. Debounce & Double-tap protection for iOS Safari / iPad
 * 6. Page visibility & interruption management
 */
export class SpeechService {
  private enabled: boolean = true;
  private currentSpeechId: string | null = null;
  private speechGeneration: number = 0;
  private isCurrentlySpeaking: boolean = false;
  private currentActiveEngine: ActiveSpeechEngine = 'Browser Vietnamese Voice';
  private lastSpokenText: string = '';
  private lastSpeechKey: string = '';
  private lastSpeechTimestamp: number = 0;

  private pendingTimer: any = null;
  private activeRequest: { generation: number; key: string; voiceAbort: AbortController; resolve: (value: boolean) => void } | null = null;

  // Debug counters
  private requestCount: number = 0;
  private playCount: number = 0;
  private dedupedCount: number = 0;
  private cancelledCount: number = 0;

  private lastPraisedIndex: number = -1;
  private lastGentleIndex: number = -1;

  private readonly praisePhrases = [
    'Chính xác! Con giỏi lắm!',
    'Tuyệt vời! Con làm đúng rồi!',
    'Đúng rồi! Bé xuất sắc quá!',
    'Hay quá! Thỏ Bông rất tự hào về con!',
    'Chuẩn xác! Tiếp tục phát huy nhé!',
  ];

  private readonly gentlePhrases = [
    'Gần đúng rồi! Con suy nghĩ thêm một chút nhé!',
    'Cố lên nào! Con đếm lại thật kỹ nhé!',
    'Chưa chính xác rồi! Con thử lại lần nữa nhé!',
  ];

  constructor() {
    this.setupVisibilityListeners();
  }

  private setupVisibilityListeners() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          // Immediately stop speech when user leaves or switches apps on iPad
          this.stop();
        }
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', () => {
        this.stop();
      });
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (!val) {
      this.stop();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public isSpeaking(): boolean {
    return this.isCurrentlySpeaking || browserSpeechProvider.isSpeaking();
  }

  /**
   * Stop all current speech completely (Browser Speech and pending timers).
   * Increments generation token so any in-flight response is discarded.
   */
  public stop() {
    this.speechGeneration++;
    if (this.pendingTimer !== null) clearTimeout(this.pendingTimer);
    this.pendingTimer = null;
    const previous = this.activeRequest;
    this.activeRequest = null;
    this.lastSpeechKey = '';
    if (previous) { previous.voiceAbort.abort(); this.cancelledCount++; previous.resolve(false); }
    browserSpeechProvider.stop();
    this.isCurrentlySpeaking = false;
    this.currentSpeechId = null;
  }

  public cancel() { this.stop(); }

  public speakVietnamese(rawText: string, options?: SpeechRequestOptions): Promise<boolean> {
    if (!this.enabled) return Promise.resolve(false);
    const text = mathExpressionToSpeech(rawText);
    if (!text) return Promise.resolve(false);
    const key = `${options?.eventType || 'SYSTEM'}:${options?.questionId || ''}:${text}`;
    const now = Date.now();
    const isReplay = options?.eventType === 'REPLAY';
    // Replays replace the pending intent even when their text/key is identical.
    // Ordinary render/question intents retain the existing duplicate protection.
    if (!isReplay && !options?.forceReplay && (this.activeRequest?.key === key || (key === this.lastSpeechKey && now - this.lastSpeechTimestamp < 1200))) {
      this.dedupedCount++;
      return Promise.resolve(false);
    }

    this.stop();
    const generation = this.speechGeneration;
    this.lastSpeechKey = key;
    this.lastSpeechTimestamp = now;
    this.lastSpokenText = text;
    this.currentSpeechId = key;
    this.requestCount++;
    return new Promise(resolve => {
      const request = { generation, key, resolve, voiceAbort: new AbortController() };
      this.activeRequest = request;
      const valid = () => this.enabled && this.activeRequest === request && generation === this.speechGeneration;
      const finish = (played: boolean, error?: unknown) => {
        if (!valid()) return;
        this.activeRequest = null;
        this.currentSpeechId = null;
        this.isCurrentlySpeaking = false;
        resolve(played);
        if (error) options?.onError?.(error);
        else options?.onEnd?.();
      };
      const started = (engine: ActiveSpeechEngine) => {
        if (!valid() || this.isCurrentlySpeaking) return;
        this.currentActiveEngine = engine;
        this.isCurrentlySpeaking = true;
        this.playCount++;
      };
      const run = async () => {
        if (!valid()) return;
        const available = await browserSpeechProvider.waitForVietnameseVoice(request.voiceAbort.signal);
        if (!valid()) return;
        const accepted = available && browserSpeechProvider.speak(text, {
          generation,
          isGenerationValid: valid,
          onStart: () => started('Browser Vietnamese Voice'),
          onEnd: () => finish(true),
          onError: error => finish(false, error),
        });
        if (!valid()) return;
        if (!accepted) {
          this.currentActiveEngine = 'Voice unavailable (Chế độ êm dịu)';
          finish(false);
        }
      };
      const execute = () => { if (valid()) void run().catch(error => finish(false, error)); };
      const delay = isReplay ? 300 : options?.delayMs ?? options?.debounceMs ?? 0;
      if (delay > 0) {
        this.pendingTimer = setTimeout(() => {
          if (!valid()) return;
          this.pendingTimer = null;
          execute();
        }, delay);
      } else execute();
    });
  }

  /**
   * Alias for backward compatibility
   */
  public speak(text: string, options?: SpeechRequestOptions) {
    return this.speakVietnamese(text, options);
  }

  /** Cleanup can cancel only the request created by this call. */
  public speakScoped(text: string, options?: SpeechRequestOptions): () => void {
    const previousGeneration = this.speechGeneration;
    void this.speakVietnamese(text, options);
    const generation = this.speechGeneration;
    return () => {
      if (generation !== previousGeneration && generation === this.speechGeneration) this.stop();
    };
  }

  public replay() {
    if (this.lastSpokenText) {
      this.speakVietnamese(this.lastSpokenText, {
        eventType: 'REPLAY',
        forceReplay: true,
      });
    }
  }

  public replayQuestion(prompt: string, questionId: string): () => void {
    return this.speakScoped(prompt, { eventType: 'REPLAY', questionId, forceReplay: true });
  }

  /**
   * Speak a question with automatic debouncing and cancellation handle
   */
  public speakQuestion(
    rawPrompt: string,
    delayMs: number = 350,
    options?: Omit<SpeechRequestOptions, 'delayMs' | 'eventType'>
  ): () => void {
    if (!this.enabled) return () => {};

    return this.speakScoped(rawPrompt, {
      ...options,
      eventType: 'QUESTION_CHANGED',
      delayMs,
    });

  }

  /**
   * Get random praise string WITHOUT speaking it
   */
  public getRandomPraisePhrase(): string {
    let index = Math.floor(Math.random() * this.praisePhrases.length);
    if (index === this.lastPraisedIndex) {
      index = (index + 1) % this.praisePhrases.length;
    }
    this.lastPraisedIndex = index;
    return this.praisePhrases[index];
  }

  /**
   * Speak a random praise phrase (only 1 speech request)
   */
  public speakRandomPraise(options?: Omit<SpeechRequestOptions, 'eventType'>): string {
    const phrase = this.getRandomPraisePhrase();
    this.speakVietnamese(phrase, {
      ...options,
      eventType: 'ANSWER_CORRECT',
    });
    return phrase;
  }

  /**
   * Get random gentle retry string WITHOUT speaking it
   */
  public getRandomGentlePhrase(): string {
    let index = Math.floor(Math.random() * this.gentlePhrases.length);
    if (index === this.lastGentleIndex) {
      index = (index + 1) % this.gentlePhrases.length;
    }
    this.lastGentleIndex = index;
    return this.gentlePhrases[index];
  }

  /**
   * Speak a gentle retry phrase (only 1 speech request)
   */
  public speakGentleRetry(options?: Omit<SpeechRequestOptions, 'eventType'>): string {
    const phrase = this.getRandomGentlePhrase();
    this.speakVietnamese(phrase, {
      ...options,
      eventType: 'ANSWER_WRONG',
    });
    return phrase;
  }

  public testSpeech(customText?: string) {
    const textToTest = customText || 'Xin chào! Mình là Thỏ Bông. Chúng mình cùng học toán nhé!';
    this.speakVietnamese(textToTest, {
      eventType: 'UI_CLICK',
      forceReplay: true,
    });
  }

  public hasVietnameseVoice(): boolean {
    return browserSpeechProvider.isAvailable();
  }

  public getDetectedVoiceName(): string | null {
    const v = browserSpeechProvider.getSelectedVoice();
    return v ? `${v.name} (${v.lang})` : null;
  }

  /**
   * Returns live system status and debug metrics for Teacher Mode
   */
  public getStatus(): SpeechDebugStats {
    const browserVoice = browserSpeechProvider.getSelectedVoice();

    return {
      activeEngine: this.isCurrentlySpeaking
        ? this.currentActiveEngine
        : browserSpeechProvider.isAvailable()
        ? 'Browser Vietnamese Voice'
        : 'Voice unavailable (Chế độ êm dịu)',
      currentSpeechId: this.currentSpeechId,
      currentGeneration: this.speechGeneration,
      isSpeaking: this.isSpeaking(),
      requestCount: this.requestCount,
      playCount: this.playCount,
      dedupedCount: this.dedupedCount,
      cancelledCount: this.cancelledCount,
      hasBrowserVietnameseVoice: browserSpeechProvider.isAvailable(),
      browserVoiceName: browserVoice ? `${browserVoice.name} (${browserVoice.lang})` : null,
      browserVietnameseVoices: browserSpeechProvider.getVietnameseVoicesInfo(),
      totalBrowserVoices: browserSpeechProvider.getAllVoicesCount(),
      language: 'vi-VN',
    };
  }
}

export const speechService = new SpeechService();
export const speechManager = speechService;
