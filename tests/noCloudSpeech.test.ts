import assert from 'node:assert/strict';
import { beforeEach, afterEach, test } from 'node:test';

type Voice = { name: string; lang: string; localService: boolean; default: boolean };
let voices: Voice[] = [];
const vi = (lang = 'vi-VN'): Voice => ({ name: `Voice ${lang}`, lang, localService: true, default: false });
const spoken: any[] = [];
const listeners = new Set<() => void>();
let fetched = 0, audioCreated = 0;
const originalHandler = () => {};
const synth = {
  onvoiceschanged: originalHandler,
  getVoices: () => voices,
  addEventListener: (_event: string, listener: () => void) => listeners.add(listener),
  cancel() {},
  speak(u: any) { spoken.push(u); u.onstart?.(); },
};
Object.assign(globalThis, {
  __CLOUD_TTS_CONFIGURED__: false,
  window: { location: { hostname: 'localhost', port: '3000' }, addEventListener() {}, speechSynthesis: synth },
  document: { hidden: false, addEventListener() {} },
  SpeechSynthesisUtterance: class { constructor(public text: string) {} },
  Audio: class { constructor() { audioCreated++; } },
});
const { speechService: manager } = await import('../src/services/speech/SpeechService');
const { browserSpeechProvider: browser } = await import('../src/services/speech/BrowserSpeechProvider');
const { googleTTSProvider: cloud } = await import('../src/services/speech/GoogleTTSProvider');
const { cloudTtsConfigured } = await import('../src/services/speech/cloudConfig');
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
const changed = () => { synth.onvoiceschanged(); for (const listener of listeners) listener(); };
beforeEach(() => {
  manager.stop(); manager.setEnabled(true); voices = [vi()]; spoken.length = 0; fetched = audioCreated = 0;
  browser.initVoices();
  globalThis.fetch = (async () => { fetched++; throw new Error('Network must not be used in no-cloud mode'); }) as typeof fetch;
});
afterEach(() => manager.stop());

for (const taps of [5, 20]) test(`No-cloud replay burst ${taps} taps speaks only once without any fetch`, async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  for (let i = 0; i < taps; i++) {
    manager.replayQuestion('Có bao nhiêu chú bướm?', 'same-question');
    t.mock.timers.tick(50); await flush(); assert.equal(spoken.length, 0);
  }
  t.mock.timers.tick(249); await flush(); assert.equal(spoken.length, 0);
  t.mock.timers.tick(1); await flush(); assert.equal(spoken.length, 1);
  assert.equal(spoken[0].voice.lang, 'vi-VN'); assert.equal(fetched, 0); assert.equal(audioCreated, 0);
  spoken[0].onend(); t.mock.timers.tick(10000); await flush(); assert.equal(spoken.length, 1);
});

test('No Cloud config uses the Browser provider directly with zero endpoint requests', async () => {
  assert.equal(cloudTtsConfigured(), false); assert.equal(cloud.isConfigured(), false);
  const p = manager.speakVietnamese('Con đếm quả táo nhé!', { questionId: 'no-cloud' }); await flush();
  assert.equal(spoken.length, 1); assert.equal(spoken[0].lang, 'vi-VN');
  assert.equal(manager.getStatus().activeEngine, 'Browser Vietnamese Voice');
  assert.equal(fetched, 0); assert.equal(audioCreated, 0); spoken[0].onend(); assert.equal(await p, true);
});
test('Unconfigured Google provider itself cannot fetch even when called directly', async () => {
  await cloud.speak('Một'); assert.equal(fetched, 0); assert.equal(audioCreated, 0); assert.equal(cloud.isBackendAvailable(), false);
});
test('Vietnamese selection prefers exact vi-VN over other vi languages', () => {
  voices = [vi('vi'), vi('vi-US'), vi('en-US'), vi('vi-VN')]; changed();
  assert.equal(browser.getSelectedVoice()!.lang, 'vi-VN');
});
test('Vietnamese selection accepts vi-prefixed language when exact vi-VN is absent', () => {
  voices = [vi('en-US'), vi('vi')]; changed(); assert.equal(browser.getSelectedVoice()!.lang, 'vi');
});
test('English voice with a misleading Vietnamese name is never selected', () => {
  voices = [{ ...vi('en-US'), name: 'Vietnamese English' }]; changed();
  assert.equal(browser.isAvailable(), false); assert.equal(browser.getSelectedVoice(), null);
});
test('Delayed voiceschanged fulfils the current request once without replacing the app handler', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] }); voices = []; changed();
  const p = manager.speakVietnamese('Giọng tải sau'); await flush();
  assert.equal(browser.getVoiceState(), 'loading'); assert.equal(spoken.length, 0);
  t.mock.timers.tick(500); voices = [vi()]; changed(); await flush();
  assert.equal(synth.onvoiceschanged, originalHandler); assert.equal(spoken.length, 1);
  changed(); await flush(); assert.equal(spoken.length, 1); spoken[0].onend(); assert.equal(await p, true);
  t.mock.timers.tick(5000); assert.equal(spoken.length, 1); assert.equal(fetched, 0);
});
test('Empty voices time out once; later voice arrival never replays an expired request', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] }); voices = []; changed();
  const p = manager.speakVietnamese('Danh sách trống'); await flush(); t.mock.timers.tick(1500); await flush();
  assert.equal(await p, false); assert.equal(browser.getVoiceState(), 'unavailable');
  voices = [vi()]; changed(); t.mock.timers.tick(10000); await flush();
  assert.equal(spoken.length, 0); assert.equal(fetched, 0); assert.equal(browser.getVoiceState(), 'ready');
});
test('An English-only list cannot produce English fallback after the bounded wait', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] }); voices = [vi('en-US')]; changed();
  const p = manager.speakVietnamese('Không đọc bằng tiếng Anh'); await flush(); t.mock.timers.tick(1500); await flush();
  assert.equal(await p, false); assert.equal(spoken.length, 0); assert.equal(fetched, 0);
});
test('Duplicate requests while waiting do not create a second voice wait or utterance', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] }); voices = []; changed();
  const options = { questionId: 'same', eventType: 'QUESTION_CHANGED' as const };
  const p = manager.speakVietnamese('Một câu', options); await flush();
  assert.equal(await manager.speakVietnamese('Một câu', options), false);
  voices = [vi()]; changed(); await flush(); assert.equal(spoken.length, 1);
  spoken[0].onend(); assert.equal(await p, true);
});
test('Duplicate active Browser speech stays one active utterance', async () => {
  const p = manager.speakVietnamese('Một lần'); await flush();
  assert.equal(await manager.speakVietnamese('Một lần'), false); assert.equal(spoken.length, 1);
  spoken[0].onend(); assert.equal(await p, true);
});
test('Latest request wins when voices arrive after the previous question was cancelled', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] }); voices = []; changed();
  const old = manager.speakVietnamese('Câu cũ'); await flush();
  const next = manager.speakVietnamese('Câu mới'); await flush(); assert.equal(await old, false);
  voices = [vi()]; changed(); await flush(); assert.equal(spoken.length, 1); assert.equal(spoken[0].text, 'Câu mới');
  spoken[0].onend(); assert.equal(await next, true); assert.equal(fetched, 0);
});
test('Unmount cancellation clears the voice wait so a late event cannot speak', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] }); voices = []; changed();
  const cleanup = manager.speakQuestion('Câu chờ', 0); await flush(); cleanup();
  voices = [vi()]; changed(); t.mock.timers.tick(5000); await flush();
  assert.equal(spoken.length, 0); assert.equal(manager.isSpeaking(), false);
});
test('Stale Browser callbacks cannot stop or finish the latest utterance', async () => {
  const old = manager.speakVietnamese('Đang đọc cũ'); await flush();
  const staleEnd = spoken[0].onend, staleError = spoken[0].onerror, staleStart = spoken[0].onstart;
  const next = manager.speakVietnamese('Đang đọc mới'); await flush();
  assert.equal(await old, false); staleEnd(); staleError(new Error('late')); staleStart();
  assert.equal(manager.isSpeaking(), true); assert.equal(spoken.length, 2);
  spoken[1].onend(); assert.equal(await next, true); assert.equal(manager.isSpeaking(), false);
});
test('Unsupported SpeechSynthesis stays silent without crashing or network requests', async () => {
  const win = (globalThis as any).window; const saved = win.speechSynthesis; delete win.speechSynthesis;
  try { assert.equal(await manager.speakVietnamese('Không hỗ trợ'), false); assert.equal(fetched, 0); }
  finally { win.speechSynthesis = saved; }
});
test('An unavailable voice causes no console spam or automatic retries', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const warnings = t.mock.method(console, 'warn', () => {});
  voices = []; changed();
  const p = manager.speakVietnamese('Chờ hữu hạn'); await flush();
  t.mock.timers.tick(1500); await flush(); assert.equal(await p, false);
  t.mock.timers.tick(30000); await flush();
  assert.equal(warnings.mock.callCount(), 0); assert.equal(fetched, 0); assert.equal(spoken.length, 0);
});
