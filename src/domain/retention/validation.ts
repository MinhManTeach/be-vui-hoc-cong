import { STICKERS } from '../../data/stickers';
import { isDay } from './clock';
import { createRetention, TASK_TARGETS, WORLD_ORDER } from './types';
import type { DailyAdventure, MiniGameSession, RetentionProgress, TaskId } from './types';
import { roundId, validId } from './miniGameSession';

export function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
export function strings(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === 'string' && item.length > 0 && item.length <= 500))] : [];
}
export function natural(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : fallback;
}
function daily(value: unknown): DailyAdventure | null {
  const a = object(value); const tasks = object(a.taskProgress);
  if (a.definitionVersion !== 1 || !isDay(a.createdDay) || a.adventureId !== `daily:${a.createdDay}:v1` ||
    !WORLD_ORDER.includes(a.learningWorldId as any) || !validId(a.companionId) || !STICKERS.some(s => s.id === a.rewardStickerId)) return null;
  if (Object.keys(TASK_TARGETS).some(task => !Number.isInteger(tasks[task]) || (tasks[task] as number) < 0 || (tasks[task] as number) > TASK_TARGETS[task as TaskId])) return null;
  const taskProgress = { learn: tasks.learn as number, play: tasks.play as number, help: tasks.help as number };
  const completedTaskIds = (Object.keys(TASK_TARGETS) as TaskId[]).filter(task => taskProgress[task] === TASK_TARGETS[task]);
  const receipt = `${a.adventureId}:DailyRewardClaimed`;
  const claimed = a.claimReceipt === receipt;
  const complete = completedTaskIds.length === 3;
  if (claimed && !complete) return null;
  return {
    adventureId: a.adventureId as string, definitionVersion: 1, createdDay: a.createdDay,
    learningWorldId: a.learningWorldId as DailyAdventure['learningWorldId'], companionId: a.companionId as string,
    taskProgress, completedTaskIds, rewardStickerId: a.rewardStickerId as string,
    status: claimed ? 'claimed' : complete ? 'completed' : 'active',
    rewardState: claimed ? 'claimed' : complete ? 'available' : 'locked', claimReceipt: claimed ? receipt : null,
  };
}
function miniSession(value: unknown): MiniGameSession | null {
  const s = object(value);
  const count = natural(s.roundCount);
  if (!validId(s.sessionId) || s.sessionId.length > 120 || count < 1 || count > 10 || !Array.isArray(s.completedRounds)) return null;
  const rounds = strings(s.completedRounds);
  if (rounds.length !== s.completedRounds.length || rounds.length > count || rounds.some((id, i) => id !== roundId(s.sessionId as string, i + 1))) return null;
  if (!['active', 'paused', 'completed', 'cancelled'].includes(s.status as string)) return null;
  if ((s.status === 'completed') !== (rounds.length === count)) return null;
  const expectedRound = roundId(s.sessionId, Math.min(count, rounds.length + 1));
  if (s.roundId !== expectedRound) return null;
  return { sessionId: s.sessionId, roundId: expectedRound, roundCount: count, completedRounds: rounds, status: s.status as MiniGameSession['status'] };
}
/** Repair independent sections; claimed receipts/ownership never depend on modal state. */
export function validateRetention(value: unknown): RetentionProgress {
  const raw = object(value); const r = createRetention();
  if (typeof raw.version === 'number' && raw.version > 1) return r;
  r.dailyAdventure = daily(raw.dailyAdventure);
  r.adventureDays = strings(raw.adventureDays).filter(isDay).sort();
  r.rewardReceipts = strings(raw.rewardReceipts).filter(id => /^daily:\d{4}-\d{2}-\d{2}:v1:DailyRewardClaimed$/.test(id) && isDay(id.slice(6, 16)));
  r.eventReceipts = strings(raw.eventReceipts);
  r.stickers = strings(raw.stickers).filter(id => STICKERS.some(s => s.id === id));
  r.miniGameSession = miniSession(raw.miniGameSession);
  const a = r.dailyAdventure;
  if (a) {
    const receipt = `${a.adventureId}:DailyRewardClaimed`;
    if (a.claimReceipt || r.rewardReceipts.includes(receipt)) {
      if (!r.rewardReceipts.includes(receipt)) r.rewardReceipts.push(receipt);
      if (!r.stickers.includes(a.rewardStickerId)) r.stickers.push(a.rewardStickerId);
      a.status = 'claimed'; a.rewardState = 'claimed'; a.claimReceipt = receipt;
    }
  }
  const days = [...r.adventureDays, ...r.rewardReceipts.map(id => id.slice(6, 16))];
  if (a) days.push(a.createdDay);
  if (isDay(raw.dayHighWater)) days.push(raw.dayHighWater);
  r.dayHighWater = days.sort().at(-1) ?? null;
  return r;
}
