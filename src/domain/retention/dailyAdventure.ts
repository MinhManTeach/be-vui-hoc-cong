import type { UserProgress, WorldId } from '../../types/math';
import { ALL_PLUSH_FRIENDS } from '../../data/plushFriends';
import { STICKERS } from '../../data/stickers';
import type { Clock } from './clock';
import { isDay } from './clock';
import { createRetention, TASK_TARGETS, WORLD_ORDER } from './types';
import type { RetentionProgress, TaskId } from './types';
import { createMiniGameSession, transitionMiniGameSession, validId } from './miniGameSession';
import type { MiniGameEvent } from './miniGameSession';

export type DailyEvent =
  | { type: 'QuestionCompleted'; adventureId: string; questionId: string; taskId: 'learn' | 'help'; worldId: WorldId }
  | { type: 'CompanionInteractionCompleted'; adventureId: string; interactionId: string; companionId: string }
  | { type: 'MiniGameRoundCompleted'; adventureId: string; sessionId: string; roundId: string; worldId: WorldId }
  | { type: 'MiniGameSessionCompleted'; adventureId: string; sessionId: string };

/** Star unlocks alone do not imply a child has practised an advanced skill. */
export function eligibleDailyWorlds(progress: UserProgress): WorldId[] {
  return WORLD_ORDER.filter(world => progress.unlockedWorlds.includes(world) && (world === WORLD_ORDER[0] ||
    (progress.stats.categoryAccuracy[world]?.answered ?? 0) > 0 ||
    (progress.worldLevelsProgress[world]?.completedLevels.length ?? 0) > 0));
}
function currentDay(clock: Clock, retention: RetentionProgress): string {
  const day = clock.day();
  if (!isDay(day)) throw new Error('Invalid calendar day');
  return retention.dayHighWater && day < retention.dayHighWater ? retention.dayHighWater : day;
}
function addReceipt(retention: RetentionProgress, receipt: string) {
  if (!retention.eventReceipts.includes(receipt)) retention.eventReceipts.push(receipt);
}
function finishTasks(retention: RetentionProgress) {
  const adventure = retention.dailyAdventure!;
  for (const task of Object.keys(TASK_TARGETS) as TaskId[]) {
    if (adventure.taskProgress[task] >= TASK_TARGETS[task] && !adventure.completedTaskIds.includes(task)) {
      adventure.completedTaskIds.push(task);
      addReceipt(retention, `${adventure.adventureId}:DailyTaskCompleted:${task}`);
    }
  }
  adventure.completedTaskIds = (Object.keys(TASK_TARGETS) as TaskId[]).filter(task => adventure.taskProgress[task] >= TASK_TARGETS[task]);
  if (adventure.completedTaskIds.length === 3) {
    adventure.status = 'completed'; adventure.rewardState = 'available';
    addReceipt(retention, `${adventure.adventureId}:DailyAdventureCompleted`);
  }
}
export function ensureDailyAdventure(progress: UserProgress, clock: Clock): UserProgress {
  const retention = progress.retention ?? createRetention();
  const day = currentDay(clock, retention);
  const previous = retention.dailyAdventure;
  if (previous && (previous.status !== 'claimed' || day <= previous.createdDay)) return progress;
  const adventureId = `daily:${day}:v1`;
  // Durable receipts survive a damaged/missing adventure section.
  if (retention.rewardReceipts.includes(`${adventureId}:DailyRewardClaimed`)) return progress;
  const worlds = eligibleDailyWorlds(progress);
  const learningWorldId = worlds[worlds.length - 1] ?? WORLD_ORDER[0];
  const selected = progress.selectedCompanionId;
  const companionId = selected && progress.unlockedPlushFriends.includes(selected) && ALL_PLUSH_FRIENDS.some(f => f.id === selected) ? selected : 'bunny';
  const stickerIndex = day.split('').reduce((total, char) => total + char.charCodeAt(0), 0) % STICKERS.length;
  return { ...progress, retention: { ...retention, dayHighWater: day, miniGameSession: null, dailyAdventure: {
    adventureId, definitionVersion: 1, createdDay: day, status: 'active', learningWorldId, companionId,
    taskProgress: { learn: 0, play: 0, help: 0 }, completedTaskIds: [], rewardStickerId: STICKERS[stickerIndex].id,
    rewardState: 'locked', claimReceipt: null,
  } } };
}
export function startDailyMiniGame(progress: UserProgress, sessionId: string): UserProgress {
  const r = progress.retention; const a = r?.dailyAdventure;
  if (!r || !a || a.status !== 'active' || a.taskProgress.play >= 1 || r.miniGameSession && r.miniGameSession.status !== 'cancelled' || !validId(sessionId) || sessionId.length > 120) return progress;
  const receipt = `${a.adventureId}:MiniGameStarted:${sessionId}`;
  if (r.eventReceipts.includes(receipt)) return progress;
  const session = createMiniGameSession(sessionId);
  return { ...progress, retention: { ...r, miniGameSession: session, eventReceipts: [...r.eventReceipts, receipt] } };
}
export function controlDailyMiniGame(progress: UserProgress, event: MiniGameEvent): UserProgress {
  // Completion must go through confirmed gameplay, not this lifecycle control API.
  if (!['PAUSE', 'RESUME', 'CANCEL', 'START'].includes(event.type) || !progress.retention?.miniGameSession) return progress;
  const session = transitionMiniGameSession(progress.retention.miniGameSession, event);
  return session === progress.retention.miniGameSession ? progress : { ...progress, retention: { ...progress.retention, miniGameSession: session } };
}
export function applyDailyEvent(progress: UserProgress, event: DailyEvent, clock: Clock): UserProgress {
  const existing = progress.retention; const current = existing?.dailyAdventure;
  if (!existing || !current || current.status !== 'active' || event.adventureId !== current.adventureId) return progress;
  let receipt: string; let task: TaskId; let increment = 1; let session = existing.miniGameSession;
  if (event.type === 'QuestionCompleted') {
    if (!validId(event.questionId) || !['learn', 'help'].includes(event.taskId) || event.worldId !== current.learningWorldId || !eligibleDailyWorlds(progress).includes(event.worldId)) return progress;
    task = event.taskId; receipt = `${current.adventureId}:QuestionCompleted:${event.questionId}`;
  } else if (event.type === 'CompanionInteractionCompleted') {
    if (!validId(event.interactionId) || event.companionId !== current.companionId) return progress;
    task = 'help'; increment = 2; receipt = `${current.adventureId}:CompanionInteractionCompleted:${event.interactionId}`;
  } else {
    if (!session || event.sessionId !== session.sessionId || !eligibleDailyWorlds(progress).includes(current.learningWorldId)) return progress;
    task = 'play';
    if (event.type === 'MiniGameRoundCompleted') {
      if (event.worldId !== current.learningWorldId) return progress;
      const updated = transitionMiniGameSession(session, { type: 'ROUND_COMPLETED', roundId: event.roundId });
      if (updated === session) return progress;
      session = updated; receipt = `${current.adventureId}:MiniGameRoundCompleted:${event.roundId}`;
      increment = session.status === 'completed' ? 1 : 0;
    } else {
      if (session.status !== 'completed') return progress;
      receipt = `${current.adventureId}:MiniGameSessionCompleted:${session.sessionId}`;
    }
  }
  if (existing.eventReceipts.includes(receipt) || current.taskProgress[task] >= TASK_TARGETS[task]) return progress;
  const day = currentDay(clock, existing);
  const r = structuredClone(existing);
  r.dayHighWater = day; r.miniGameSession = session;
  if (!r.adventureDays.includes(day)) r.adventureDays.push(day);
  addReceipt(r, receipt);
  r.dailyAdventure!.taskProgress[task] = Math.min(TASK_TARGETS[task], current.taskProgress[task] + increment);
  if (session?.status === 'completed') addReceipt(r, `${current.adventureId}:MiniGameSessionCompleted:${session.sessionId}`);
  finishTasks(r);
  return { ...progress, retention: r };
}
export function claimDailyReward(progress: UserProgress): UserProgress {
  const existing = progress.retention; const a = existing?.dailyAdventure;
  if (!existing || !a || a.status !== 'completed' || a.rewardState !== 'available' || !STICKERS.some(s => s.id === a.rewardStickerId)) return progress;
  const receipt = `${a.adventureId}:DailyRewardClaimed`;
  if (existing.rewardReceipts.includes(receipt) || a.claimReceipt) return progress;
  const r = structuredClone(existing);
  r.rewardReceipts.push(receipt); addReceipt(r, receipt);
  if (!r.stickers.includes(a.rewardStickerId)) r.stickers.push(a.rewardStickerId);
  r.dailyAdventure!.status = 'claimed'; r.dailyAdventure!.rewardState = 'claimed'; r.dailyAdventure!.claimReceipt = receipt;
  return { ...progress, retention: r };
}
