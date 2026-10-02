import type { HandlerEvent, HandlerResponse } from '@netlify/functions';

export const TTS_LIMITS = {
  textChars: 500, queryBytes: 8192, responseBytes: 700_000,
  audioBytes: 500_000, cacheBytes: 4_000_000, cacheEntries: 128,
  cacheTtlMs: 900_000, timeoutMs: 2500, concurrent: 4,
  synthesesPerMinute: 60, cooldownMs: 30_000,
} as const;
const VOICE = 'vi-VN-Neural2-A';
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const fail = (statusCode: number, error: string, extra = {}): HandlerResponse => ({
  statusCode, headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8', ...extra },
  body: JSON.stringify({ error }),
});
const audioResponse = (body: string): HandlerResponse => ({
  statusCode: 200, headers: { ...headers, 'Content-Type': 'audio/mpeg' }, body, isBase64Encoded: true,
});
async function readBounded(response: Response, signal: AbortSignal): Promise<unknown> {
  if (signal.aborted) throw new Error();
  if (!response.headers.get('content-type')?.toLowerCase().includes('application/json')) throw new Error();
  if (Number(response.headers.get('content-length')) > TTS_LIMITS.responseBytes || !response.body) throw new Error();
  const reader = response.body.getReader();
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener('abort', cancel, { once: true });
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > TTS_LIMITS.responseBytes) throw new Error();
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } finally {
    signal.removeEventListener('abort', cancel);
    await reader.cancel().catch(() => {});
  }
}
function validatedAudio(data: unknown): string {
  const value = (data as { audioContent?: unknown } | null)?.audioContent;
  if (typeof value !== 'string' || !value || value.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) throw new Error();
  const bytes = Buffer.from(value, 'base64');
  if (bytes.length < 3 || bytes.length > TTS_LIMITS.audioBytes || bytes.toString('base64') !== value) throw new Error();
  if (bytes.subarray(0, 3).toString('ascii') !== 'ID3' && !(bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)) throw new Error();
  return value;
}
// Per warm instance safeguards only; NOT distributed rate limiting.
// No IPs, client identifiers, persistent child data, or analytics are collected.
export function createTtsHandler(options: { fetch?: typeof fetch; now?: () => number; timeoutMs?: number } = {}) {
  const cache = new Map<string, { audio: string; bytes: number; expires: number }>();
  const pending = new Map<string, Promise<HandlerResponse>>();
  let cachedBytes = 0, windowStart = 0, syntheses = 0, unavailableUntil = 0;
  const now = options.now ?? Date.now;
  const drop = (key: string) => {
    const entry = cache.get(key);
    if (entry) cachedBytes -= entry.bytes;
    cache.delete(key);
  };
  return async (event: HandlerEvent): Promise<HandlerResponse> => {
    if (event.httpMethod !== 'GET') return fail(405, 'Method not allowed', { Allow: 'GET' });
    const requestHeaders = Object.fromEntries(Object.entries(event.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
    if (requestHeaders['sec-fetch-site'] === 'cross-site') return fail(403, 'Request not allowed');
    if (event.body) return fail(400, 'Invalid request');
    const rawQuery = event.rawQuery ?? '';
    if (Buffer.byteLength(rawQuery, 'utf8') > TTS_LIMITS.queryBytes) return fail(413, 'Request too large');
    if (/%(?![0-9a-f]{2})/i.test(rawQuery)) return fail(400, 'Invalid request');
    const query = event.queryStringParameters ?? {};
    const params = new URLSearchParams(rawQuery);
    if (Object.values(event.multiValueQueryStringParameters ?? {}).some(values => values && values.length > 1) ||
        [...params.keys()].some(key => params.getAll(key).length > 1)) return fail(400, 'Invalid request');
    if (Object.keys(query).some(key => !['text', 'language', 'voice'].includes(key))) return fail(400, 'Invalid request');
    if ((query.language !== undefined && query.language !== 'vi-VN') || (query.voice !== undefined && query.voice !== VOICE)) return fail(400, 'Unsupported voice');
    if (typeof query.text !== 'string' || !query.text.trim() || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(query.text)) return fail(400, 'Invalid text');
    if (Array.from(query.text).length > TTS_LIMITS.textChars) return fail(413, 'Text too long');
    const text = query.text.trim().normalize('NFC');
    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey) return fail(503, 'Speech temporarily unavailable');
    const timestamp = now();
    for (const [key, entry] of cache) if (entry.expires <= timestamp) drop(key);
    const cached = cache.get(text);
    if (cached) { cache.delete(text); cache.set(text, cached); return audioResponse(cached.audio); }
    if (pending.has(text)) return pending.get(text)!;
    if (timestamp < unavailableUntil) return fail(503, 'Speech temporarily unavailable', { 'Retry-After': '30' });
    if (timestamp - windowStart >= 60_000) { windowStart = timestamp; syntheses = 0; }
    if (syntheses >= TTS_LIMITS.synthesesPerMinute || pending.size >= TTS_LIMITS.concurrent) return fail(429, 'Speech temporarily busy', { 'Retry-After': '60' });
    syntheses++;
    const synthesize = async (): Promise<HandlerResponse> => {
      const controller = new AbortController();
      let timedOut = false;
      let timer: ReturnType<typeof setTimeout>;
      const deadline = new Promise<never>((_, reject) => {
        timer = setTimeout(() => { timedOut = true; controller.abort(); reject(new Error()); }, options.timeoutMs ?? TTS_LIMITS.timeoutMs);
      });
      try {
        const work = async () => {
          const response = await (options.fetch ?? fetch)('https://texttospeech.googleapis.com/v1/text:synthesize', {
            method: 'POST', signal: controller.signal, redirect: 'error',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
            body: JSON.stringify({
              input: { text }, voice: { languageCode: 'vi-VN', name: VOICE, ssmlGender: 'FEMALE' },
              audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9, pitch: 1.1 },
            }),
          });
          if (!response.ok) { await response.body?.cancel(); throw new Error(); }
          return validatedAudio(await readBounded(response, controller.signal));
        };
        const audio = await Promise.race([work(), deadline]);
        const bytes = Buffer.byteLength(audio, 'ascii');
        while (cache.size && (cache.size >= TTS_LIMITS.cacheEntries || cachedBytes + bytes > TTS_LIMITS.cacheBytes)) drop(cache.keys().next().value!);
        cache.set(text, { audio, bytes, expires: now() + TTS_LIMITS.cacheTtlMs });
        cachedBytes += bytes;
        return audioResponse(audio);
      } catch {
        unavailableUntil = now() + TTS_LIMITS.cooldownMs;
        return fail(timedOut ? 504 : 502, 'Speech temporarily unavailable');
      } finally { clearTimeout(timer!); controller.abort(); }
    };
    const result = synthesize();
    pending.set(text, result);
    try { return await result; } finally { pending.delete(text); }
  };
}
