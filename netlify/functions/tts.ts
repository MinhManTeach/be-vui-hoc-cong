import type { Handler, HandlerEvent } from '@netlify/functions';

// In-memory cache for repeated phrases (key: cacheKey, value: base64 audio string)
const audioCache = new Map<string, string>();

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export const handler: Handler = async (event: HandlerEvent) => {
  // Handle CORS preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  const text = (event.queryStringParameters?.text || '').trim();
  if (!text) {
    return {
      statusCode: 400,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Text parameter is required' }),
    };
  }

  const cacheKey = `vi-VN_${text.toLowerCase()}`;

  // 1. Return cached audio if present
  if (audioCache.has(cacheKey)) {
    const cachedBase64 = audioCache.get(cacheKey)!;
    return {
      statusCode: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'audio/mpeg',
        'X-TTS-Source': 'Cache',
        'Cache-Control': 'public, max-age=86400',
      },
      body: cachedBase64,
      isBase64Encoded: true,
    };
  }

  // Read API key strictly from server environment variable (process.env)
  const googleApiKey = process.env.GOOGLE_TTS_API_KEY;

  // 2. Official Google Cloud Text-to-Speech API (Neural2 Vietnamese) if key is set
  if (googleApiKey) {
    try {
      const gCloudRes = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text },
            voice: { languageCode: 'vi-VN', name: 'vi-VN-Neural2-A', ssmlGender: 'FEMALE' },
            audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9, pitch: 1.1 },
          }),
        }
      );

      if (gCloudRes.ok) {
        const data = (await gCloudRes.json()) as { audioContent?: string };
        if (data.audioContent) {
          if (audioCache.size > 300) {
            const firstKey = audioCache.keys().next().value;
            if (firstKey) audioCache.delete(firstKey);
          }
          audioCache.set(cacheKey, data.audioContent);

          return {
            statusCode: 200,
            headers: {
              ...CORS_HEADERS,
              'Content-Type': 'audio/mpeg',
              'X-TTS-Source': 'Google-Cloud-Neural2',
              'Cache-Control': 'public, max-age=86400',
            },
            body: data.audioContent,
            isBase64Encoded: true,
          };
        }
      }
    } catch (err) {
      console.warn('[Netlify TTS Function] Google Cloud TTS API call failed, attempting fallback:', err);
    }
  }

  // 3. High-quality Google Vietnamese TTS endpoint fallback
  try {
    const encodedText = encodeURIComponent(text);
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodedText}`;

    const ttsRes = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
      },
    });

    if (!ttsRes.ok) {
      throw new Error(`Google TTS request failed with status: ${ttsRes.status}`);
    }

    const arrayBuffer = await ttsRes.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    if (audioCache.size > 300) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey) audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, base64Audio);

    return {
      statusCode: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'audio/mpeg',
        'X-TTS-Source': 'Google-TTS-Vietnamese',
        'Cache-Control': 'public, max-age=86400',
      },
      body: base64Audio,
      isBase64Encoded: true,
    };
  } catch (err: any) {
    console.error('[Netlify TTS Function] Error generating Vietnamese audio:', err);
    return {
      statusCode: 500,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Failed to synthesize Vietnamese audio',
        message: err?.message || String(err),
      }),
    };
  }
};
