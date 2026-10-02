import assert from 'node:assert/strict';
import { test, beforeEach, afterEach } from 'node:test';
import { GoogleTTSProvider } from '../src/services/speech/GoogleTTSProvider';

const originalCreate = URL.createObjectURL, originalRevoke = URL.revokeObjectURL, originalFetch = globalThis.fetch;
let created = 0, revoked: string[] = [], fetched = 0, failPlayback = false;
class FakeAudio {
  currentTime = 0; preload = ''; src = '';
  onended: (() => void) | null = null; onerror: (() => void) | null = null;
  onplay: (() => void) | null = null; onplaying: (() => void) | null = null;
  play() {
    if (failPlayback) return Promise.reject(new Error('Playback blocked'));
    this.onplay?.(); queueMicrotask(() => this.onended?.()); return Promise.resolve();
  }
  pause() {} load() {}
}
Object.assign(globalThis, { window: { location: { hostname: 'localhost', port: '' } }, Audio: FakeAudio });
beforeEach(() => {
  created = fetched = 0; revoked = []; failPlayback = false;
  URL.createObjectURL = () => 'blob:test-' + (++created);
  URL.revokeObjectURL = url => { revoked.push(url); };
  globalThis.fetch = async () => { fetched++; return new Response(new Blob(['audio'], { type: 'audio/mpeg' })); };
});
afterEach(() => {
  URL.createObjectURL = originalCreate; URL.revokeObjectURL = originalRevoke; globalThis.fetch = originalFetch;
});
test('browser audio cache caps entries and revokes evicted and cleared object URLs', async () => {
  const provider = new GoogleTTSProvider();
  for (let i = 0; i < 130; i++) assert((await provider.speak(String(i))).completed);
  assert.equal(created, 130);
  assert.equal(revoked.length, 2);
  await provider.speak('129');
  assert.equal(fetched, 130);
  await provider.speak('0');
  assert.equal(fetched, 131);
  provider.clearCache();
  assert.equal(revoked.length, 131);
  assert.equal(new Set(revoked).size, 131);
});
test('browser audio cache also caps total bytes', async () => {
  globalThis.fetch = async () => { fetched++; return new Response(new Blob([new Uint8Array(400_000)], { type: 'audio/mpeg' })); };
  const provider = new GoogleTTSProvider();
  for (let i = 0; i < 11; i++) await provider.speak(String(i));
  assert.equal(revoked.length, 1);
  await provider.speak('0');
  assert.equal(fetched, 12);
  provider.clearCache();
  assert.equal(revoked.length, 12);
});
test('oversized and empty audio responses never enter browser cache', async () => {
  for (const bytes of [0, 500_001]) {
    globalThis.fetch = async () => new Response(new Blob([new Uint8Array(bytes)], { type: 'audio/mpeg' }));
    const provider = new GoogleTTSProvider();
    assert.equal((await provider.speak('x')).completed, false);
    provider.clearCache();
  }
  assert.equal(created, 0);
});
test('audio playback errors evict cached audio so the next attempt can recover', async () => {
  const provider = new GoogleTTSProvider();
  failPlayback = true;
  assert.equal((await provider.speak('x')).completed, false);
  assert.equal(revoked.length, 1);
  failPlayback = false;
  assert((await provider.speak('x')).completed);
  assert.equal(fetched, 2);
  provider.clearCache();
  assert.equal(revoked.length, 2);
});
