import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createNativeSpeech, type NativeTts, type NativeVoice } from '../src/native/nativeSpeech';

const voice = (lang: string): NativeVoice => ({ name: lang, lang, localService: true, default: false, voiceURI: lang });
function fakeTts(voices: NativeVoice[], supported: string[] = []) {
  const calls: any[] = [];
  let finish: () => void = () => {};
  const tts: NativeTts = {
    speak: options => { calls.push(options); return new Promise(done => { finish = done; }); },
    stop: async () => { calls.push('stop'); finish(); },
    getSupportedVoices: async () => ({ voices }),
    isLanguageSupported: async ({ lang }) => ({ supported: supported.includes(lang) }),
  };
  return { tts, calls, end: () => finish() };
}
const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };

test('lists phone voices with their index and tells listeners', async () => {
  const { tts } = fakeTts([voice('en-US'), voice('vi-VN')]);
  const { speechSynthesis } = createNativeSpeech(tts);
  let changed = 0;
  speechSynthesis.onvoiceschanged = () => changed++;
  speechSynthesis.addEventListener('voiceschanged', () => changed++);
  await speechSynthesis.ready;
  assert.equal(changed, 2);
  assert.deepEqual(speechSynthesis.getVoices().map(v => [v.lang, v.index]), [['en-US', 0], ['vi-VN', 1]]);
});

test('offers a Vietnamese voice when the engine speaks it but names none', async () => {
  const { tts } = fakeTts([voice('en-US')], ['vi-VN']);
  const { speechSynthesis } = createNativeSpeech(tts);
  await speechSynthesis.ready;
  const vi = speechSynthesis.getVoices().find(v => v.lang === 'vi-VN');
  assert.ok(vi);
  assert.equal(vi.index, undefined);
});

test('speaks with the chosen voice and fires start then end', async () => {
  const { tts, calls, end } = fakeTts([voice('vi-VN')]);
  const { speechSynthesis, SpeechSynthesisUtterance } = createNativeSpeech(tts);
  await speechSynthesis.ready;
  const u = new SpeechSynthesisUtterance('một cộng một');
  u.voice = speechSynthesis.getVoices()[0];
  u.rate = 0.9;
  const events: string[] = [];
  u.onstart = () => events.push('start');
  u.onend = () => events.push('end');
  speechSynthesis.speak(u);
  assert.equal(speechSynthesis.speaking, true);
  assert.deepEqual(calls[0], { text: 'một cộng một', lang: 'vi-VN', rate: 0.9, pitch: 1, volume: 1, voice: 0 });
  end(); await flush();
  assert.deepEqual(events, ['start', 'end']);
  assert.equal(speechSynthesis.speaking, false);
});

test('cancel stops the engine and the stopped utterance does not end', async () => {
  const { tts, calls } = fakeTts([voice('en-US')]);
  const { speechSynthesis, SpeechSynthesisUtterance } = createNativeSpeech(tts);
  const u = new SpeechSynthesisUtterance('hello');
  let ended = false;
  u.onend = () => { ended = true; };
  speechSynthesis.speak(u);
  speechSynthesis.cancel();
  await flush();
  assert.ok(calls.includes('stop'));
  assert.equal(ended, false);
  assert.equal(speechSynthesis.speaking, false);
});
