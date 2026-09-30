import { googleTTSProvider, detectEnvironment, AppEnvironment } from './GoogleTTSProvider';
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
  | 'Google Cloud / Neural TTS'
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
  environment: AppEnvironment;
  isCloudAvailable: boolean;
  activeEndpoint: string;
  language: string;
}

/**
 * SpeechManager - The Unified Single Speech Controller.
 * Enforces:
 * 1. Global playback lock (only ONE speech at any time)
 * 2. Generation token (stale responses cannot play)
 * 3. Never plays Cloud TTS and Browser TTS simultaneously
 * 4. Deduplication of identical requests within 1200ms
 * 5. Debounce & Double-tap protection for iOS Safari / iPad
 * 6. Page visibility & interruption management
 */
export class SpeechService {
  private enabled: boolean = true;
  private currentSpeechId: string | null = null;
  private speechGeneration: number = 0;
  private isCurrentlySpeaking: boolean = false;
  private currentActiveEngine: ActiveSpeechEngine = 'Google Cloud / Neural TTS';
  private lastSpokenText: string = '';
  private lastSpeechKey: string = '';
  private lastSpeechTimestamp: number = 0;
  private lastReplayTimestamp: number = 0;

  private pendingTimer: any = null;

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
    return this.isCurrentlySpeaking || googleTTSProvider.isPlaying() || browserSpeechProvider.isSpeaking();
  }

  /**
   * Stop all current speech completely (Cloud Audio, Browser Speech, and pending timers).
   * Increments generation token so any in-flight response is discarded.
   */
  public stop() {
    this.speechGeneration++;
    if (this.pendingTimer) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
    googleTTSProvider.stop();
    browserSpeechProvider.stop();
    this.isCurrentlySpeaking = false;
    this.currentSpeechId = null;
  }

  public cancel() {
    this.stop();
  }

  /**
   * Primary entry point for speech.
   * Ensures Deduplication, Generation Token validation, and single active playback.
   */
  public async speakVietnamese(
    rawText: string,
    options?: SpeechRequestOptions
  ): Promise<boolean> {
    if (!this.enabled) return false;

    const normalized = mathExpressionToSpeech(rawText);
    if (!normalized) return false;

    const eventType = options?.eventType || 'SYSTEM';
    const questionId = options?.questionId || '';
    const speechKey = `${eventType}:${questionId}:${normalized}`;

    const now = Date.now();

    // 1. Double-tap throttling for user-initiated replay (min 350ms between clicks)
    if (options?.forceReplay) {
      if (now - this.lastReplayTimestamp < 350) {
        this.cancelledCount++;
        console.log(`[TTS DOUBLE-TAP BLOCKED] ${speechKey}`);
        return false;
      }
      this.lastReplayTimestamp = now;
    } else {
      // 2. Deduplication check: ignore identical event + question + text within 1200ms
      if (speechKey === this.lastSpeechKey && now - this.lastSpeechTimestamp < 1200) {
        this.dedupedCount++;
        console.log(`[TTS DEDUPED] ${speechKey}`);
        return false;
      }
    }

    this.lastSpeechKey = speechKey;
    this.lastSpeechTimestamp = now;
    this.lastSpokenText = normalized;

    // 3. Handle delay or debounce
    const delay = options?.delayMs ?? options?.debounceMs ?? 0;

    if (delay > 0) {
      this.stop();
      return new Promise<boolean>((resolve) => {
        this.pendingTimer = setTimeout(async () => {
          this.pendingTimer = null;
          const result = await this.executeSpeech(normalized, speechKey, options);
          resolve(result);
        }, delay);
      });
    }

    return this.executeSpeech(normalized, speechKey, options);
  }

  /**
   * Internal execution pipeline:
   * 1. Invalidate previous generation
   * 2. Try Cloud TTS (drop if stale)
   * 3. Fallback to Browser Speech ONCE if Cloud fails
   * 4. NEVER play both simultaneously
   */
  private async executeSpeech(
    text: string,
    speechKey: string,
    options?: SpeechRequestOptions
  ): Promise<boolean> {
    // Increment generation token: any prior request waiting for fetch/audio is now DEAD
    this.stop();
    const reqGen = ++this.speechGeneration;
    this.currentSpeechId = speechKey;
    this.requestCount++;

    console.log(`[TTS REQUEST] id: ${speechKey}, gen: ${reqGen}`);

    const isGenStillValid = () => this.enabled && reqGen === this.speechGeneration;

    // Step 1: Try Cloud TTS Provider
    try {
      const cloudSuccess = await googleTTSProvider.speak(text, {
        generation: reqGen,
        isGenerationValid: isGenStillValid,
        onEnd: () => {
          if (isGenStillValid()) {
            this.isCurrentlySpeaking = false;
            console.log(`[TTS END] Cloud TTS finished: ${speechKey}`);
            options?.onEnd?.();
          }
        },
        onError: (err) => {
          console.warn('[TTS] Cloud TTS error in manager:', err);
        },
      });

      // Check generation token again after async await
      if (!isGenStillValid()) {
        this.cancelledCount++;
        console.log(`[TTS CANCEL] Dropped stale Cloud TTS response, gen: ${reqGen}`);
        return false;
      }

      if (cloudSuccess) {
        this.playCount++;
        this.isCurrentlySpeaking = true;
        this.currentActiveEngine = 'Google Cloud / Neural TTS';
        console.log(`[TTS PLAY] Cloud TTS: ${speechKey}, gen: ${reqGen}`);
        // CRITICAL: Successfully played via Cloud TTS -> RETURN TRUE. NEVER TOUCH BROWSER SPEECH!
        return true;
      }
    } catch {
      // Cloud TTS failed or timed out
    }

    // Check generation token before attempting fallback
    if (!isGenStillValid()) {
      this.cancelledCount++;
      return false;
    }

    // Step 2: Fallback to Browser Vietnamese Voice (ONLY if genuine vi-VN voice exists)
    if (browserSpeechProvider.isAvailable()) {
      try {
        const browserSuccess = browserSpeechProvider.speak(text, {
          generation: reqGen,
          isGenerationValid: isGenStillValid,
          onEnd: () => {
            if (isGenStillValid()) {
              this.isCurrentlySpeaking = false;
              console.log(`[TTS END] Browser Speech finished: ${speechKey}`);
              options?.onEnd?.();
            }
          },
          onError: () => {
            if (isGenStillValid()) {
              this.isCurrentlySpeaking = false;
            }
          },
        });

        if (browserSuccess && isGenStillValid()) {
          this.playCount++;
          this.isCurrentlySpeaking = true;
          this.currentActiveEngine = 'Browser Vietnamese Voice';
          console.log(`[TTS PLAY] Browser Speech: ${speechKey}, gen: ${reqGen}`);
          return true;
        }
      } catch (browserErr) {
        console.warn('[TTS] Browser fallback exception:', browserErr);
      }
    }

    // Step 3: Last fallback - graceful silence
    this.isCurrentlySpeaking = false;
    this.currentActiveEngine = 'Voice unavailable (Chế độ êm dịu)';
    console.log(`[TTS END] No speech played (fallback completed): ${speechKey}`);
    options?.onEnd?.();
    return false;
  }

  /**
   * Alias for backward compatibility
   */
  public speak(text: string, options?: SpeechRequestOptions) {
    this.speakVietnamese(text, options);
  }

  public replay() {
    if (this.lastSpokenText) {
      this.speakVietnamese(this.lastSpokenText, {
        eventType: 'REPLAY',
        forceReplay: true,
      });
    }
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

    this.speakVietnamese(rawPrompt, {
      ...options,
      eventType: 'QUESTION_CHANGED',
      delayMs,
    });

    return () => this.stop();
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

  public recheckCloudBackend() {
    googleTTSProvider.recheckBackend();
  }

  /**
   * Returns live system status and debug metrics for Teacher Mode
   */
  public getStatus(): SpeechDebugStats {
    const browserVoice = browserSpeechProvider.getSelectedVoice();
    const env = detectEnvironment();
    const isCloud = googleTTSProvider.isBackendAvailable();

    return {
      activeEngine: this.isCurrentlySpeaking
        ? this.currentActiveEngine
        : isCloud
        ? 'Google Cloud / Neural TTS'
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
      environment: env,
      isCloudAvailable: isCloud,
      activeEndpoint: googleTTSProvider.getActiveEndpoint(),
      language: 'vi-VN',
    };
  }
}

export const speechService = new SpeechService();
export const speechManager = speechService;
