/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Unified export of the new multi-provider Vietnamese Speech System
 */

export {
  SpeechService,
  speechService,
  speechManager,
  numberToVietnamese,
  mathExpressionToSpeech,
  sanitizeSpeechText,
} from '../services/speech/SpeechService';
export type {
  ActiveSpeechEngine,
  SpeechRequestOptions,
  SpeechDebugStats,
  SpeechEventType,
} from '../services/speech/SpeechService';
export { browserSpeechProvider } from '../services/speech/BrowserSpeechProvider';
export { googleTTSProvider } from '../services/speech/GoogleTTSProvider';
