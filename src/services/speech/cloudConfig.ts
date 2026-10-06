declare const __CLOUD_TTS_CONFIGURED__: boolean;

export function cloudTtsConfigured(): boolean {
  return typeof __CLOUD_TTS_CONFIGURED__ !== 'undefined' && __CLOUD_TTS_CONFIGURED__ === true;
}
