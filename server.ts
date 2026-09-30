import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Audio in-memory cache for repeated phrases (key: normalized text, value: Buffer)
const audioCache = new Map<string, Buffer>();

// TTS API Route & Netlify Functions endpoint (Server-side proxy, no secrets exposed to client!)
const handleTts = async (req: Request, res: Response) => {
  const text = (req.query.text as string || '').trim();
  if (!text) {
    res.status(400).json({ error: 'Text parameter is required' });
    return;
  }

  // Check cache first
  const cacheKey = `vi-VN_${text.toLowerCase()}`;
  if (audioCache.has(cacheKey)) {
    const cachedBuffer = audioCache.get(cacheKey)!;
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-TTS-Source', 'Cache');
    res.send(cachedBuffer);
    return;
  }

  const googleApiKey = process.env.GOOGLE_TTS_API_KEY;

  // 1. If Google Cloud Text-to-Speech API key is set, use Official Google Cloud TTS
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
        const data = await gCloudRes.json() as { audioContent?: string };
        if (data.audioContent) {
          const audioBuffer = Buffer.from(data.audioContent, 'base64');
          audioCache.set(cacheKey, audioBuffer);
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('X-TTS-Source', 'Google-Cloud-Neural2');
          res.send(audioBuffer);
          return;
        }
      }
    } catch (err) {
      console.warn('[TTS Server] Google Cloud TTS API call failed, falling back to Google Translate TTS:', err);
    }
  }

  // 2. High-quality Google Vietnamese TTS endpoint fallback
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
    const audioBuffer = Buffer.from(arrayBuffer);

    // Cache the audio buffer (limits cache to 300 phrases to avoid unbounded memory)
    if (audioCache.size > 300) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey) audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, audioBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-TTS-Source', 'Google-TTS-Vietnamese');
    res.send(audioBuffer);
  } catch (err: any) {
    console.error('[TTS Server] Error generating Vietnamese audio:', err);
    res.status(500).json({ error: 'Failed to synthesize Vietnamese audio', message: err.message });
  }
};

app.get('/api/tts', handleTts);
app.get('/.netlify/functions/tts', handleTts);

// Diagnostic route for voice debug
app.get('/api/tts-status', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    provider: process.env.GOOGLE_TTS_API_KEY ? 'Google Cloud Text-to-Speech (Neural2)' : 'Google Vietnamese TTS Service',
    locale: 'vi-VN',
    cachedPhrasesCount: audioCache.size,
  });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Bé Vui Học Cộng] Server running on http://0.0.0.0:${PORT} in ${isDev ? 'development' : 'production'} mode`);
  });
}

startServer();
