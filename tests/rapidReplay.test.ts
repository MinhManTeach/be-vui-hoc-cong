import assert from 'node:assert/strict';
import { beforeEach, afterEach, test } from 'node:test';
import { QuestionSession } from '../src/utils/questionSession';

const spoken: any[] = [];
const queue = new Set<any>();
const voice = { name: 'Vietnamese', lang: 'vi-VN', localService: true, default: false };
let voices = [voice];
let cancels = 0, maxQueue = 0, fetches = 0;
const synth = {
  getVoices: () => voices,
  onvoiceschanged: null as (() => void) | null,
  cancel() { cancels++; queue.clear(); },
  speak(u: any) { spoken.push(u); queue.add(u); maxQueue = Math.max(maxQueue, queue.size); u.onstart?.(); },
};
Object.assign(globalThis, {
  // Exercise all replay cases even when configured Cloud endpoints fail.
  __CLOUD_TTS_CONFIGURED__: true,
  window: { location: { hostname: 'localhost', port: '3000' }, addEventListener() {}, speechSynthesis: synth },
  document: { hidden: false, addEventListener() {} },
  SpeechSynthesisUtterance: class { constructor(public text: string) {} },
  Audio: class { constructor() { throw new Error('Unavailable Cloud must never create audio'); } },
});
const { speechService: manager } = await import('../src/services/speech/SpeechService');
const { browserSpeechProvider: browser } = await import('../src/services/speech/BrowserSpeechProvider');
const { googleTTSProvider: cloud } = await import('../src/services/speech/GoogleTTSProvider');
const flush = async () => { for (let i = 0; i < 60; i++) await Promise.resolve(); };
const replay = (text = 'Có bao nhiêu chú bướm?', id = 'q1') => manager.speakVietnamese(text, { eventType: 'REPLAY', questionId: id, forceReplay: true });
const end = (u = spoken.at(-1)) => { queue.delete(u); u.onend(); };
beforeEach(() => {
  manager.stop(); manager.setEnabled(true); cloud.clearCache(); cloud.recheckBackend();
  spoken.length = 0; queue.clear(); cancels = maxQueue = fetches = 0;
  voices = [voice]; browser.initVoices();
  globalThis.fetch = (async () => { fetches++; return new Response('', { status: 503 }); }) as typeof fetch;
});
afterEach(() => manager.stop());

test('Replay once waits 300ms then speaks exactly once', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const p = replay(); t.mock.timers.tick(299); await flush(); assert.equal(spoken.length, 0); assert.equal(fetches, 0);
  t.mock.timers.tick(1); await flush(); assert.equal(spoken.length, 1); end(); assert.equal(await p, true);
});
for (const taps of [5, 20]) test(`Replay ${taps} rapid taps keeps only the final request, no queue`, async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const pending: Promise<boolean>[] = [];
  for (let i = 0; i < taps; i++) { pending.push(replay()); t.mock.timers.tick(50); await flush(); assert.equal(spoken.length, 0); }
  t.mock.timers.tick(249); await flush(); assert.equal(spoken.length, 0);
  t.mock.timers.tick(1); await flush(); assert.equal(spoken.length, 1); assert.equal(maxQueue, 1);
  assert.deepEqual(await Promise.all(pending.slice(0, -1)), Array(taps - 1).fill(false));
  end(); assert.equal(await pending.at(-1), true); t.mock.timers.tick(10000); await flush(); assert.equal(spoken.length, 1);
});
test('Every tap resets the deadline even when a burst spans multiple throttle windows', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  for (let i = 0; i < 10; i++) { void replay(); t.mock.timers.tick(250); await flush(); assert.equal(spoken.length, 0); }
  t.mock.timers.tick(50); await flush(); assert.equal(spoken.length, 1); assert.equal(maxQueue, 1); end();
});
test('Replay while currently speaking immediately cancels old speech and speaks once after quiet period', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const old = manager.speakVietnamese('Câu đang đọc'); await flush(); assert.equal(queue.size, 1);
  const oldUtterance = spoken[0], before = cancels;
  const next = replay(); assert.ok(cancels > before); assert.equal(queue.size, 0); assert.equal(await old, false);
  assert.equal(oldUtterance.onend, null); assert.equal(oldUtterance.onerror, null);
  t.mock.timers.tick(300); await flush(); assert.equal(spoken.length, 2); assert.equal(maxQueue, 1); end(); assert.equal(await next, true);
});
test('Question changes during replay debounce: old question never speaks', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const session = new QuestionSession(); session.begin(); session.ownSpeech(manager.replayQuestion('Câu hỏi cũ', 'old'));
  t.mock.timers.tick(200); session.begin(); session.ownSpeech(manager.speakQuestion('Câu hỏi mới', 400, { questionId: 'new' }));
  t.mock.timers.tick(100); await flush(); assert.equal(spoken.length, 0);
  t.mock.timers.tick(300); await flush(); assert.equal(spoken.length, 1); assert.equal(spoken[0].text, 'Câu hỏi mới'); end(); session.dispose();
});
test('Repeated render/question intents cannot duplicate or override the replay for the same question session', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] }); const session = new QuestionSession(); session.begin();
  const renderQuestion = () => session.once('QUESTION_CHANGED', () => session.ownSpeech(manager.speakQuestion('Câu hiện tại', 400, { questionId: 'same' })));
  renderQuestion(); session.ownSpeech(manager.replayQuestion('Câu hiện tại', 'same'));
  for (let i = 0; i < 20; i++) assert.equal(renderQuestion(), false);
  t.mock.timers.tick(1000); await flush(); assert.equal(spoken.length, 1); assert.equal(maxQueue, 1); end(); session.dispose();
});
test('voiceschanged during debounce and playback never creates another speech intent', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] }); const p = replay();
  for (let i = 0; i < 10; i++) synth.onvoiceschanged?.();
  t.mock.timers.tick(300); await flush(); assert.equal(spoken.length, 1);
  for (let i = 0; i < 10; i++) synth.onvoiceschanged?.();
  await flush(); assert.equal(spoken.length, 1); end(); assert.equal(await p, true);
});
for (const callback of ['onend', 'onerror', 'onstart']) test(`Stale ${callback} from cancelled utterance is ignored during replay and new playback`, async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const old = manager.speakVietnamese('Giọng cũ'); await flush(); const stale = spoken[0][callback];
  const next = replay(); assert.equal(await old, false); stale(new Error('stale')); assert.equal(queue.size, 0);
  t.mock.timers.tick(300); await flush(); stale(new Error('stale'));
  assert.equal(manager.isSpeaking(), true); assert.equal(spoken.length, 2); assert.equal(maxQueue, 1);
  end(); assert.equal(await next, true); assert.equal(manager.isSpeaking(), false);
});
test('Cloud 503 during a replay burst falls back once with a Vietnamese Browser voice', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  for (let i = 0; i < 20; i++) { void replay(); t.mock.timers.tick(20); }
  t.mock.timers.tick(300); await flush(); assert.equal(fetches, 2); assert.equal(spoken.length, 1);
  assert.equal(spoken[0].voice.lang, 'vi-VN'); assert.equal(manager.getStatus().activeEngine, 'Browser Vietnamese Voice'); end();
});
test('Late voices after a cancelled replay wait only speak the latest request', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] }); voices = []; synth.onvoiceschanged?.();
  const old = replay('Câu trước', 'old'); t.mock.timers.tick(300); await flush();
  const next = replay('Câu sau', 'new'); assert.equal(await old, false);
  voices = [voice]; synth.onvoiceschanged?.(); await flush(); assert.equal(spoken.length, 0);
  t.mock.timers.tick(300); await flush(); assert.equal(spoken.length, 1); assert.equal(spoken[0].text, 'Câu sau'); end(); assert.equal(await next, true);
});
test('Replay cleanup on unmount removes the pending timer and cannot cancel a newer question', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const cleanup = manager.replayQuestion('Sẽ bị hủy', 'old'); cleanup(); t.mock.timers.tick(300); await flush(); assert.equal(spoken.length, 0);
  const oldCleanup = manager.replayQuestion('Cũng bị thay', 'older');
  const next = manager.speakVietnamese('Câu mới nhất'); oldCleanup(); await flush(); assert.equal(spoken.length, 1);
  end(); assert.equal(await next, true);
});
