import assert from 'node:assert/strict';
import { beforeEach, afterEach, test } from 'node:test';
import { QuestionSession } from '../src/utils/questionSession';

class Deferred<T> {
  resolve!: (value: T) => void;
  reject!: (error: unknown) => void;
  promise = new Promise<T>((resolve, reject) => { this.resolve = resolve; this.reject = reject; });
}
const audios: FakeAudio[] = [];
const utterances: any[] = [];
let playDeferred = false;
let voices = [{ name: 'Vietnamese', lang: 'vi-VN', localService: true, default: false }];
class FakeAudio {
  src = ''; currentTime = 0; preload = ''; paused = false;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onplay: (() => void) | null = null;
  onplaying: (() => void) | null = null;
  playback = new Deferred<void>();
  constructor() { audios.push(this); }
  play() { if (!playDeferred) { this.onplay?.(); this.playback.resolve(); } return this.playback.promise; }
  pause() { this.paused = true; }
  load() {}
}
const synth = {
  getVoices: () => voices,
  onvoiceschanged: null as null | (() => void),
  cancel() {},
  speak(u: any) { utterances.push(u); u.onstart?.(); },
};
Object.assign(globalThis, {
  window: { location: { hostname: 'localhost', port: '' }, addEventListener() {}, speechSynthesis: synth },
  document: { hidden: false, addEventListener() {} },
  Audio: FakeAudio,
  SpeechSynthesisUtterance: class { constructor(public text: string) {} },
});
const { speechService: manager, speechManager, mathExpressionToSpeech } = await import('../src/services/speech/SpeechService');
const { googleTTSProvider: cloud } = await import('../src/services/speech/GoogleTTSProvider');
const { browserSpeechProvider: browser } = await import('../src/services/speech/BrowserSpeechProvider');
const flush = async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); };
const lastAudio = () => audios.at(-1)!;
const audioResponse = () => ({ ok: true, blob: async () => new Blob(['test'], { type: 'audio/mpeg' }) }) as Response;
beforeEach(() => {
  manager.stop(); manager.setEnabled(true); cloud.clearCache(); cloud.recheckBackend();
  audios.length = utterances.length = 0; playDeferred = false;
  voices = [{ name: 'Vietnamese', lang: 'vi-VN', localService: true, default: false }];
  browser.initVoices();
  globalThis.fetch = (async () => audioResponse()) as typeof fetch;
});
afterEach(() => { manager.stop(); cloud.clearCache(); });

test('all entry points share one manager; duplicate active request plays once', async () => {
  assert.equal(speechManager, manager);
  const options = { eventType: 'QUESTION_CHANGED' as const, questionId: 'q1' };
  const first = manager.speakVietnamese('Con hãy đếm nhé!', options);
  await flush();
  assert.equal(await manager.speakVietnamese('Con hãy đếm nhé!', options), false);
  assert.equal(audios.length, 1);
  assert.equal(utterances.length, 0);
  assert.equal(manager.isSpeaking(), true);
  lastAudio().onended!();
  assert.equal(await first, true);
  assert.equal(manager.isSpeaking(), false, 'end must not set speaking back to true');
});

test('cancelled delayed request settles and never starts', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const pending = manager.speakVietnamese('Câu cũ', { delayMs: 400 });
  manager.stop();
  assert.equal(await pending, false);
  t.mock.timers.tick(1000); await flush();
  assert.equal(audios.length, 0);
});

test('deduped scoped speech retains playback and the original question cleanup', async () => {
  const session = new QuestionSession();
  session.begin();
  const options = { questionId: 'same-question' };
  session.ownSpeech(manager.speakScoped('Đọc một lần', options)); await flush();
  const original = lastAudio();
  session.ownSpeech(manager.speakScoped('Đọc một lần', options)); await flush();
  assert.equal(original.paused, false);
  assert.equal(audios.length, 1);
  session.dispose();
  assert.equal(original.paused, true);
});

test('latest question aborts old fetch; its late response cannot create audio', async () => {
  const response = new Deferred<Response>();
  const signals: AbortSignal[] = [];
  globalThis.fetch = ((_: any, options: any) => { signals.push(options.signal); return signals.length === 1 ? response.promise : Promise.resolve(audioResponse()); }) as typeof fetch;
  const old = manager.speakVietnamese('Câu hỏi cũ');
  const next = manager.speakVietnamese('Câu hỏi mới');
  assert(signals[0].aborted);
  assert.equal(await old, false);
  await flush();
  response.resolve(audioResponse()); await flush();
  assert.equal(audios.length, 1);
  assert.equal(lastAudio().paused, false);
  lastAudio().onended!();
  assert.equal(await next, true);
});

test('question change while voice plays cancels old audio; stale callbacks cannot touch new audio', async () => {
  let oldEnded = 0, oldErrors = 0;
  const old = manager.speakVietnamese('Câu đang đọc', { onEnd: () => oldEnded++, onError: () => oldErrors++ });
  await flush();
  const oldAudio = lastAudio();
  const staleEnd = oldAudio.onended!, staleError = oldAudio.onerror!;
  const cleanupOldQuestion = manager.speakQuestion('Câu chờ', 400);
  const next = manager.speakVietnamese('Câu kế tiếp');
  cleanupOldQuestion();
  assert.equal(await old, false);
  await flush();
  const nextAudio = lastAudio();
  staleEnd(); staleError(); await flush();
  assert(oldAudio.paused);
  assert.equal(nextAudio.paused, false);
  assert.equal(cloud.getCurrentAudio(), nextAudio);
  assert.equal(manager.isSpeaking(), true);
  assert.equal(oldEnded + oldErrors, 0);
  nextAudio.onended!();
  assert.equal(await next, true);
});

test('stale play promise rejection cannot dispose a newer audio or launch fallback', async () => {
  playDeferred = true;
  const old = manager.speakVietnamese('Audio cũ chờ play'); await flush();
  const oldAudio = lastAudio();
  const next = manager.speakVietnamese('Audio mới chờ play'); await flush();
  const nextAudio = lastAudio();
  oldAudio.playback.reject(new Error('late rejection')); await flush();
  assert.equal(await old, false);
  assert.equal(cloud.getCurrentAudio(), nextAudio);
  assert.equal(nextAudio.paused, false);
  assert.equal(utterances.length, 0);
  nextAudio.playback.resolve(); await flush(); nextAudio.onended!();
  assert.equal(await next, true);
});

test('cloud error after playback starts must not replay entire phrase via browser', async () => {
  const pending = manager.speakVietnamese('Con hãy đếm các bông hoa nhé!'); await flush();
  lastAudio().onerror!();
  assert.equal(await pending, false);
  assert.equal(utterances.length, 0);
  assert.equal(manager.isSpeaking(), false);
});

test('blocked cloud playback falls back once to Vietnamese after disposing cloud', async () => {
  playDeferred = true;
  const pending = manager.speakVietnamese('Xin chào bé!'); await flush();
  const audio = lastAudio();
  audio.playback.reject(new Error('NotAllowedError')); await flush();
  assert.equal(utterances.length, 1);
  assert(audio.paused);
  assert.equal(cloud.getCurrentAudio(), null);
  assert.equal(utterances[0].lang, 'vi-VN');
  assert.equal(utterances[0].voice.lang, 'vi-VN');
  assert.equal(utterances[0].text, 'Xin chào bé!');
  utterances[0].onend();
  assert.equal(await pending, true);
});

test('stale browser start/end/error never cancel or clear the new utterance', async () => {
  globalThis.fetch = async () => new Response(null, { status: 503 });
  let oldCallbacks = 0;
  const old = manager.speakVietnamese('Giọng Việt cũ', { onEnd: () => oldCallbacks++, onError: () => oldCallbacks++ }); await flush();
  const previous = utterances[0];
  const callbacks = [previous.onstart, previous.onend, previous.onerror];
  const next = manager.speakVietnamese('Giọng Việt mới'); await flush();
  callbacks.forEach(callback => callback({ error: 'interrupted' }));
  assert.equal(await old, false);
  assert.equal(oldCallbacks, 0);
  assert.equal(browser.isSpeaking(), true);
  utterances[1].onend();
  assert.equal(await next, true);
});

test('fetch timeout is cleared and cannot abort the next endpoint', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const response = new Deferred<Response>();
  const signals: AbortSignal[] = [];
  globalThis.fetch = ((_: any, options: any) => {
    signals.push(options.signal);
    return signals.length === 1
      ? new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('first fails')), 2000))
      : response.promise;
  }) as typeof fetch;
  const pending = manager.speakVietnamese('Hai endpoint'); await flush();
  t.mock.timers.tick(2000); await flush();
  assert.equal(signals.length, 2);
  t.mock.timers.tick(1500); await flush();
  assert.equal(signals[1].aborted, false, 'first endpoint timeout must not abort the second endpoint');
  response.resolve(audioResponse()); await flush();
  lastAudio().onended!();
  assert.equal(await pending, true);
  t.mock.timers.tick(4000);
  assert.equal(signals[1].aborted, false, 'completed fetch timeout must be cleared');
});

test('audio time advanced before queued play callbacks still prevents full fallback replay', async () => {
  playDeferred = true;
  const pending = manager.speakVietnamese('Cloud đã đọc một phần'); await flush();
  lastAudio().currentTime = 0.1;
  lastAudio().onerror!();
  assert.equal(await pending, false);
  assert.equal(utterances.length, 0);
});

test('HTML responses are rejected; voiceschanged never replays speech; no English fallback', async () => {
  globalThis.fetch = async () => new Response('<html>', { headers: { 'Content-Type': 'text/html' } });
  voices = [{ name: 'English', lang: 'en-US', localService: true, default: true }];
  synth.onvoiceschanged?.();
  assert.equal(await manager.speakVietnamese('Tiếng Việt'), false);
  assert.equal(utterances.length, 0);
  assert.equal(audios.length, 0);
  voices = [{ name: 'Vietnamese', lang: 'vi-VN', localService: true, default: false }];
  synth.onvoiceschanged?.();
  assert.equal(utterances.length, 0);
  assert.equal(mathExpressionToSpeech('8 + 5 = ?'), 'tám cộng năm bằng bao nhiêu?');
});

for (const status of [503, 429, 504, 502]) {
  test(`Cloud HTTP ${status} falls back exactly once to Browser Vietnamese Speech`, async () => {
    globalThis.fetch = async () => new Response(JSON.stringify({ error: 'Speech temporarily unavailable' }), {
      status, headers: { 'Content-Type': 'application/json' },
    });
    const pending = manager.speakVietnamese('Con hãy đếm nhé!');
    await flush();
    assert.equal(audios.length, 0);
    assert.equal(utterances.length, 1);
    assert.equal(utterances[0].lang, 'vi-VN');
    utterances[0].onend();
    assert.equal(await pending, true);
    assert.equal(manager.isSpeaking(), false);
  });
}
