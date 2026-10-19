// Runs first in main.tsx, before any module reads window.speechSynthesis.
// Only the store app (Capacitor) on a phone without Web Speech is changed;
// the website on lopso.vn keeps using the browser's own voices.
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { createNativeSpeech } from './nativeSpeech';

if (Capacitor.isNativePlatform() && !('speechSynthesis' in window)) {
  Object.assign(window, createNativeSpeech(TextToSpeech));
}
