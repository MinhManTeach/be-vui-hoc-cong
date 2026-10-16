import { ALL_PLUSH_FRIENDS } from '../data/plushFriends';
import type { UserProgress } from '../types/math';

export type CompanionReaction = 'IDLE' | 'THINKING' | 'HAPPY' | 'ENCOURAGE' | 'CELEBRATE';
export type FriendInteraction = 'PET' | 'HIGH_FIVE' | 'HELLO';

function isOwned(progress: UserProgress, id: string | null | undefined): id is string {
  return !!id && progress.unlockedPlushFriends.includes(id) && ALL_PLUSH_FRIENDS.some(friend => friend.id === id);
}

export function resolveCompanion(progress: UserProgress, id = progress.selectedCompanionId): string {
  return isOwned(progress, id) ? id : 'bunny';
}

export function selectCompanion(progress: UserProgress, id: string): UserProgress {
  if (!isOwned(progress, id) || progress.selectedCompanionId === id) return progress;
  return { ...progress, selectedCompanionId: id };
}

export function homeCompanionCopy(companionId: string | null | undefined) {
  const friend = ALL_PLUSH_FRIENDS.find(friend => friend.id === companionId);
  return {
    greeting: friend
      ? `Chào con! ${friend.name} đang chờ con cùng phiêu lưu!`
      : 'Chào con! Mình cùng đi phiêu lưu nhé!',
    instruction: 'Chạm nút bên dưới để bắt đầu hành trình nhé!',
    companionId: friend?.id ?? null,
  };
}

export function reactionFor(event: 'correct' | 'wrong' | 'hint' | 'complete' | 'question'): CompanionReaction {
  return ({ correct: 'HAPPY', wrong: 'ENCOURAGE', hint: 'THINKING', complete: 'CELEBRATE', question: 'IDLE' } as const)[event];
}

export function friendInteraction(action: FriendInteraction) {
  return {
    PET: { reaction: 'HAPPY' as const, text: 'Ấm áp quá! Cảm ơn bạn!', symbol: '♥' },
    HIGH_FIVE: { reaction: 'CELEBRATE' as const, text: 'Đập tay nào! Mình làm được!', symbol: '✋' },
    HELLO: { reaction: 'HAPPY' as const, text: 'Chào bạn! Cùng mình khám phá nhé!', symbol: '👋' },
  }[action];
}
