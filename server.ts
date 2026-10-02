import type { HandlerEvent } from '@netlify/functions';
import { createTtsHandler } from './netlify/lib/tts';
import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Share the production TTS policy with the local server.
const ttsHandler = createTtsHandler();
const handleTts = async (req: Request, res: Response) => {
  const params = new URLSearchParams(req.originalUrl.split('?')[1] ?? '');
  const result = await ttsHandler({
    httpMethod: req.method, headers: req.headers, rawQuery: params.toString(),
    body: req.body ? JSON.stringify(req.body) : null,
    queryStringParameters: Object.fromEntries(params),
    multiValueQueryStringParameters: Object.fromEntries([...new Set(params.keys())].map(key => [key, params.getAll(key)])),
  } as unknown as HandlerEvent);
  res.status(result.statusCode);
  for (const [name, value] of Object.entries(result.headers ?? {})) res.setHeader(name, String(value));
  res.send(result.isBase64Encoded ? Buffer.from(result.body ?? '', 'base64') : result.body);
};
app.all('/api/tts', handleTts);
app.all('/.netlify/functions/tts', handleTts);
app.use(['/api', '/.netlify/functions'], (_req, res) => res.status(404).json({ error: 'Not found' }));

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
