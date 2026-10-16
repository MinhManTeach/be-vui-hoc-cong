import { useSyncExternalStore } from 'react';
import { browserSpeechProvider } from './BrowserSpeechProvider';

export function useSpeechAvailability(enabled: boolean) {
  const state = useSyncExternalStore(browserSpeechProvider.subscribe, browserSpeechProvider.getVoiceState, () => 'unavailable' as const);
  const canRead = enabled && state === 'ready';
  const message = !enabled ? 'Giọng đọc đang tắt' : state === 'loading' ? 'Đang tải giọng tiếng Việt…' : 'Thiết bị chưa có giọng tiếng Việt';
  return { canRead, message };
}
