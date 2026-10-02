import type { Handler } from '@netlify/functions';
import { createTtsHandler } from '../lib/tts';

export const handler: Handler = createTtsHandler();
