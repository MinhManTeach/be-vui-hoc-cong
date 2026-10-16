import type { WorldId } from '../../types/math';

export type TaskId = 'learn' | 'play' | 'help';
export interface DailyAdventure {
  adventureId: string;
  definitionVersion: 1;
  createdDay: string;
  status: 'active' | 'completed' | 'claimed';
  learningWorldId: WorldId;
  companionId: string;
  taskProgress: Record<TaskId, number>;
  completedTaskIds: TaskId[];
  rewardStickerId: string;
  rewardState: 'locked' | 'available' | 'claimed';
  claimReceipt: string | null;
}
export interface MiniGameSession {
  sessionId: string;
  roundId: string;
  roundCount: number;
  completedRounds: string[];
  status: 'active' | 'paused' | 'completed' | 'cancelled';
}
export interface RetentionProgress {
  version: 1;
  dailyAdventure: DailyAdventure | null;
  adventureDays: string[];
  dayHighWater: string | null;
  rewardReceipts: string[];
  eventReceipts: string[];
  stickers: string[];
  miniGameSession: MiniGameSession | null;
}
export const ADVENTURE_DAY_MILESTONES = [3, 7, 14] as const;
export const TASK_TARGETS: Record<TaskId, number> = { learn: 5, play: 1, help: 2 };
export const WORLD_ORDER: readonly WorldId[] = ['world_1_counting', 'world_2_merge', 'world_3_add_10', 'world_4_make_10', 'world_5_split', 'world_6_over_10'];
export function createRetention(): RetentionProgress {
  return { version: 1, dailyAdventure: null, adventureDays: [], dayHighWater: null, rewardReceipts: [], eventReceipts: [], stickers: [], miniGameSession: null };
}
export function earnedAdventureDayMilestones(retention: RetentionProgress): number[] {
  return ADVENTURE_DAY_MILESTONES.filter(days => retention.adventureDays.length >= days);
}
