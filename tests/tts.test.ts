import assert from 'node:assert/strict';
import { beforeEach, afterEach, test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import type { HandlerEvent } from '@netlify/functions';
import { createTtsHandler, TTS_LIMITS } from '../netlify/lib/tts';

const originalKey = process.env.GOOGLE_TTS_API_KEY;
beforeEach(() => { process.env.GOOGLE_TTS_API_KEY = 'unit-test-placeholder'; });
afterEach(() => {
  if (originalKey === undefined) delete process.env.GOOGLE_TTS_API_KEY;
  else process.env.GOOGLE_TTS_API_KEY = originalKey;
});
const event = (text = 'Con hãy đếm nhé!', extra: Partial<HandlerEvent> = {}): HandlerEvent => ({
  httpMethod: 'GET', headers: {}, body: null,
  rawQuery: new URLSearchParams({ text }).toString(),
  queryStringParameters: { text }, multiValueQueryStringParameters: {},
  ...extra,
} as HandlerEvent);
const mp3 = Buffer.concat([Buffer.from('ID3'), Buffer.alloc(20)]).toString('base64');
const successful = (audioContent = mp3) => new Response(JSON.stringify({ audioContent }), {
  headers: { 'Content-Type': 'application/json' },
});
const blockedFetch = (async () => { throw new Error('must not call upstream'); }) as typeof fetch;

test('missing API key safely returns 503 without upstream request, even after a cached success', async () => {
  let calls = 0;
  const handler = createTtsHandler({ fetch: (async () => { calls++; return successful(); }) as typeof fetch });
  assert.equal((await handler(event())).statusCode, 200);
  delete process.env.GOOGLE_TTS_API_KEY;
  const result = await handler(event());
  assert.equal(result.statusCode, 503);
  assert.equal(result.headers?.['Cache-Control'], 'no-store');
  assert.equal(calls, 1);
});
for (const method of ['POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD']) {
  test('rejects method ' + method, async () => {
    const result = await createTtsHandler({ fetch: blockedFetch })(event('', { httpMethod: method }));
    assert.equal(result.statusCode, 405);
    assert.equal(result.headers?.Allow, 'GET');
  });
}
test('rejects missing and empty text', async () => {
  const handler = createTtsHandler({ fetch: blockedFetch });
  for (const request of [event(''), event('   '), event('x', { queryStringParameters: {} })]) {
    assert.equal((await handler(request)).statusCode, 400);
  }
});
test('rejects oversized text, including whitespace before normalization', async () => {
  const handler = createTtsHandler({ fetch: blockedFetch });
  assert.equal((await handler(event('a'.repeat(501)))).statusCode, 413);
  assert.equal((await handler(event(' '.repeat(501) + 'x'))).statusCode, 413);
});
test('rejects malformed query, duplicate parameters, control characters, body and unknown fields', async () => {
  const handler = createTtsHandler({ fetch: blockedFetch });
  for (const request of [
    event('x', { rawQuery: 'text=%GG' }),
    event('x', { rawQuery: 'text=x&text=y' }),
    event('x', { multiValueQueryStringParameters: { text: ['x', 'y'] } }),
    event('x\u0000'), event('x', { body: '{broken' }),
    event('x', { queryStringParameters: { text: 'x', apiKey: 'ignored-placeholder' } }),
  ]) assert.equal((await handler(request)).statusCode, 400);
});
test('limits total query payload bytes', async () => {
  const result = await createTtsHandler({ fetch: blockedFetch })(event('x', { rawQuery: 'text=' + 'x'.repeat(8192) }));
  assert.equal(result.statusCode, 413);
});
test('validates Vietnamese language and fixed voice', async () => {
  const handler = createTtsHandler({ fetch: (async () => successful()) as typeof fetch });
  for (const query of [{ text: 'x', language: 'en-US' }, { text: 'x', voice: 'arbitrary' }]) {
    assert.equal((await handler(event('x', { queryStringParameters: query }))).statusCode, 400);
  }
  assert.equal((await handler(event('x', { queryStringParameters: { text: 'x', language: 'vi-VN', voice: 'vi-VN-Neural2-A' } }))).statusCode, 200);
});
test('denies browser cross-site use and grants no wildcard CORS', async () => {
  const result = await createTtsHandler({ fetch: blockedFetch })(event('x', { headers: { 'Sec-Fetch-Site': 'cross-site' } }));
  assert.equal(result.statusCode, 403);
  assert.equal(result.headers?.['Access-Control-Allow-Origin'], undefined);
});
test('upstream timeout aborts request and returns generic 504', async () => {
  let signal: AbortSignal;
  const handler = createTtsHandler({ timeoutMs: 10, fetch: (async (_url, options) => {
    signal = options!.signal as AbortSignal;
    return await new Promise<Response>(() => {});
  }) as typeof fetch });
  const result = await handler(event());
  assert.equal(result.statusCode, 504);
  assert(signal!.aborted);
  assert(!result.body?.includes('unit-test-placeholder'));
});
test('timeout covers stalled upstream response body', async () => {
  const handler = createTtsHandler({ timeoutMs: 10, fetch: (async () => new Response(new ReadableStream({ start() {} }), {
    headers: { 'Content-Type': 'application/json' },
  })) as typeof fetch });
  assert.equal((await handler(event())).statusCode, 504);
});
test('upstream HTTP failure and network error never leak response or secret', async () => {
  for (const fetcher of [
    async () => new Response('private upstream details', { status: 403 }),
    async () => { throw new Error('unit-test-placeholder internal details'); },
  ]) {
    const result = await createTtsHandler({ fetch: fetcher as typeof fetch })(event());
    assert.equal(result.statusCode, 502);
    assert.equal(result.body, JSON.stringify({ error: 'Speech temporarily unavailable' }));
  }
});
test('rejects HTML, invalid JSON, absent audio, invalid base64 and non-MP3 audio', async () => {
  for (const response of [
    new Response('<html>bad</html>', { headers: { 'Content-Type': 'text/html' } }),
    new Response('{broken', { headers: { 'Content-Type': 'application/json' } }),
    new Response('{}', { headers: { 'Content-Type': 'application/json' } }),
    successful('%%%='), successful(Buffer.from('<html>bad</html>').toString('base64')),
  ]) {
    assert.equal((await createTtsHandler({ fetch: (async () => response) as typeof fetch })(event())).statusCode, 502);
  }
});
test('rejects oversized upstream response and oversized audio', async () => {
  for (const response of [
    new Response('x', { headers: { 'Content-Type': 'application/json', 'Content-Length': '700001' } }),
    new Response('x'.repeat(700001), { headers: { 'Content-Type': 'application/json' } }),
    successful(Buffer.concat([Buffer.from('ID3'), Buffer.alloc(500_000)]).toString('base64')),
  ]) assert.equal((await createTtsHandler({ fetch: (async () => response) as typeof fetch })(event())).statusCode, 502);
});
test('successful MP3 has correct Content-Type; key is a header, never a URL', async () => {
  const handler = createTtsHandler({ fetch: (async (url, options) => {
    assert.equal(url, 'https://texttospeech.googleapis.com/v1/text:synthesize');
    assert.equal(new Headers(options?.headers).get('x-goog-api-key'), 'unit-test-placeholder');
    assert.equal(options?.redirect, 'error');
    const payload = JSON.parse(String(options?.body));
    assert.equal(payload.voice.languageCode, 'vi-VN');
    assert.equal(payload.audioConfig.audioEncoding, 'MP3');
    return successful();
  }) as typeof fetch });
  const result = await handler(event());
  assert.equal(result.statusCode, 200);
  assert.equal(result.headers?.['Content-Type'], 'audio/mpeg');
  assert.equal(result.isBase64Encoded, true);
  assert.equal(result.body, mp3);
});
test('identical concurrent requests share one synthesis and completed successes are cached', async () => {
  let calls = 0, release!: () => void;
  const handler = createTtsHandler({ fetch: (async () => {
    calls++; await new Promise<void>(resolve => { release = resolve; }); return successful();
  }) as typeof fetch });
  const first = handler(event());
  const second = handler(event());
  release();
  assert.equal((await first).statusCode, 200);
  assert.equal((await second).statusCode, 200);
  assert.equal((await handler(event())).statusCode, 200);
  assert.equal(calls, 1);
});
test('cache expires and preserves case-sensitive input', async () => {
  let clock = 100_000, calls = 0;
  const handler = createTtsHandler({ now: () => clock, fetch: (async () => { calls++; return successful(); }) as typeof fetch });
  await handler(event('A')); await handler(event('a'));
  assert.equal(calls, 2);
  clock += TTS_LIMITS.cacheTtlMs;
  await handler(event('A'));
  assert.equal(calls, 3);
});
test('cache is bounded by entry count', async () => {
  let clock = 100_000, calls = 0;
  const handler = createTtsHandler({ now: () => clock, fetch: (async () => { calls++; return successful(); }) as typeof fetch });
  for (let i = 0; i < 129; i++) { clock += 1100; await handler(event(String(i))); }
  await handler(event('0'));
  assert.equal(calls, 130);
});
test('cache is bounded by bytes', async () => {
  let clock = 100_000, calls = 0;
  const large = Buffer.concat([Buffer.from('ID3'), Buffer.alloc(399_997)]).toString('base64');
  const handler = createTtsHandler({ now: () => clock, fetch: (async () => { calls++; return successful(large); }) as typeof fetch });
  for (let i = 0; i < 8; i++) await handler(event(String(i)));
  await handler(event('0'));
  assert.equal(calls, 9);
});
test('errors are not cached; cooldown reduces retries and recovery is possible', async () => {
  let clock = 100_000, calls = 0;
  const handler = createTtsHandler({ now: () => clock, fetch: (async () => {
    calls++; return calls === 1 ? new Response('', { status: 500 }) : successful();
  }) as typeof fetch });
  assert.equal((await handler(event())).statusCode, 502);
  assert.equal((await handler(event())).statusCode, 503);
  assert.equal(calls, 1);
  clock += TTS_LIMITS.cooldownMs;
  assert.equal((await handler(event())).statusCode, 200);
  assert.equal(calls, 2);
});
test('per-instance synthesis budget returns 429 and resets; cached requests remain available', async () => {
  let clock = 100_000, calls = 0;
  const handler = createTtsHandler({ now: () => clock, fetch: (async () => { calls++; return successful(); }) as typeof fetch });
  for (let i = 0; i < 60; i++) assert.equal((await handler(event(String(i)))).statusCode, 200);
  assert.equal((await handler(event('new'))).statusCode, 429);
  assert.equal((await handler(event('0'))).statusCode, 200);
  assert.equal(calls, 60);
  clock += 60_000;
  assert.equal((await handler(event('new'))).statusCode, 200);
});
test('per-instance concurrent upstream requests are capped', async () => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const handler = createTtsHandler({ fetch: (async () => { await gate; return successful(); }) as typeof fetch });
  const requests = Array.from({ length: 4 }, (_, i) => handler(event(String(i))));
  assert.equal((await handler(event('excess'))).statusCode, 429);
  release();
  assert((await Promise.all(requests)).every(r => r.statusCode === 200));
});
test('Netlify routing gives /api/tts and other API requests precedence over SPA fallback', () => {
  const config = readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8');
  assert(!existsSync(new URL('../public/_redirects', import.meta.url)), 'file-based SPA rules run before TOML');
  const rules = [...config.matchAll(/\[\[redirects\]\]([\s\S]*?)(?=\[|$)/g)].map(m => m[1]);
  assert.equal(rules.length, 2);
  assert.match(rules[0], /from = "\/api\/\*"/);
  assert.match(rules[0], /to = "\/\.netlify\/functions\/:splat"/);
  assert.match(rules[0], /force = true/);
  assert.match(rules[1], /from = "\/\*"/);
  assert.match(rules[1], /to = "\/index.html"/);
  assert.match(config, /command = "npm run build"/);
  assert.match(config, /publish = "dist"/);
  assert.match(config, /functions = "netlify\/functions"/);
});
