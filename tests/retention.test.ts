import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { INITIAL_PROGRESS, STORAGE_KEY, LEGACY_STORAGE_KEY, BACKUP_STORAGE_KEY, CORRUPT_STORAGE_KEY, loadProgress, saveProgress, commitRetentionUpdate, resetGameProgress } from '../src/utils/storage';
import { ensureDailyAdventure, applyDailyEvent, startDailyMiniGame, claimDailyReward, eligibleDailyWorlds, controlDailyMiniGame } from '../src/domain/retention/dailyAdventure';
import { earnedAdventureDayMilestones } from '../src/domain/retention/types';
import { deviceClock, isDay } from '../src/domain/retention/clock';
import { createMiniGameSession, transitionMiniGameSession } from '../src/domain/retention/miniGameSession';
import { STICKERS } from '../src/data/stickers';
import type { Clock } from '../src/domain/retention/clock';

const stored = new Map<string, string>();
let failWrite = false;
Object.assign(globalThis, { window: {}, localStorage: {
  getItem: (key: string) => stored.get(key) ?? null,
  setItem: (key: string, value: string) => { if (failWrite) throw new Error('quota'); stored.set(key, value); },
  removeItem: (key: string) => stored.delete(key),
} });
beforeEach(() => { stored.clear(); failWrite = false; });
const clock = (day = '2026-10-06'): Clock => ({ day: () => day });
const fresh = () => structuredClone(INITIAL_PROGRESS);
const started = () => ensureDailyAdventure(fresh(), clock());
const question = (p: ReturnType<typeof fresh>, id: string, taskId: 'learn' | 'help' = 'learn', day = '2026-10-06') => applyDailyEvent(p, {
  type: 'QuestionCompleted', adventureId: p.retention!.dailyAdventure!.adventureId,
  questionId: id, taskId, worldId: 'world_1_counting',
}, clock(day));
function completed() {
  let p = started();
  for (let i = 0; i < 5; i++) p = question(p, `learn-${i}`);
  p = question(p, 'help-1', 'help'); p = question(p, 'help-2', 'help');
  p = startDailyMiniGame(p, 'session-1');
  for (let i = 1; i <= 3; i++) p = applyDailyEvent(p, {
    type: 'MiniGameRoundCompleted', adventureId: p.retention!.dailyAdventure!.adventureId,
    sessionId: 'session-1', roundId: `session-1:round:${i}`, worldId: 'world_1_counting',
  }, clock());
  return p;
}

for (const key of [LEGACY_STORAGE_KEY, STORAGE_KEY]) test(`${key}: retention migration preserves existing child's progress`, () => {
  const old = fresh(); delete old.retention;
  old.xp = 234; old.totalStars = 20; old.childNickname = 'Bé An';
  old.unlockedPlushFriends = ['plush_bear_honey']; old.selectedCompanionId = 'plush_bear_honey';
  old.claimedCheckpointRewards = ['cp_world_1_3']; old.soundEnabled = false; old.speechEnabled = false;
  old.worldLevelsProgress.world_1_counting = { completedLevels: [1], levelStars: { 1: 2 } };
  stored.set(key, JSON.stringify(old));
  const migrated = loadProgress();
  for (const field of ['xp', 'totalStars', 'worldLevelsProgress', 'unlockedPlushFriends', 'selectedCompanionId', 'unlockedAccessories', 'equippedAccessories', 'claimedCheckpointRewards', 'soundEnabled', 'speechEnabled'] as const) assert.deepEqual(migrated[field], old[field]);
  assert.equal(migrated.retention!.version, 1);
  assert.deepEqual(migrated.retention!.adventureDays, []);
  assert.deepEqual(loadProgress(), migrated, 'migration must be idempotent');
});
test('missing retention defaults without inventing historical days', () => {
  const p = fresh(); delete p.retention; p.stats.totalAnswered = 100;
  stored.set(STORAGE_KEY, JSON.stringify(p));
  assert.deepEqual(loadProgress().retention!.adventureDays, []);
});
test('malformed retention recovers sections independently and preserves earned ownership/receipts', () => {
  const p = claimDailyReward(completed());
  stored.set(STORAGE_KEY, JSON.stringify({ ...p, retention: { ...p.retention, dailyAdventure: { broken: true }, miniGameSession: 'bad' } }));
  const recovered = loadProgress();
  assert.equal(recovered.retention!.dailyAdventure, null);
  assert.deepEqual(recovered.retention!.stickers, p.retention!.stickers);
  assert.deepEqual(recovered.retention!.rewardReceipts, p.retention!.rewardReceipts);
  assert.equal(recovered.xp, p.xp);
  assert.equal(claimDailyReward(recovered), recovered);
});
for (const future of ['root', 'retention']) test(`future ${future} schema is never overwritten`, () => {
  const p = fresh();
  const raw = JSON.stringify(future === 'root' ? { ...p, gameProgressVersion: 99 } : { ...p, retention: { ...p.retention, version: 99 } });
  stored.set(STORAGE_KEY, raw);
  const loaded = loadProgress();
  assert.equal(saveProgress(loaded), false);
  assert.equal(stored.get(STORAGE_KEY), raw);
});
test('uncontrolled legacy JSON fields and wrong numeric types do not enter runtime state', () => {
  stored.set(STORAGE_KEY, JSON.stringify({ ...fresh(), xp: 'lots', totalStars: -2, worldLevelsProgress: { world_1_counting: 'bad' }, injected: 'unknown' }));
  const p = loadProgress();
  assert.equal(p.totalStars, 0); assert.equal(typeof p.xp, 'number');
  assert.equal('injected' in p, false);
  assert.deepEqual(p.worldLevelsProgress.world_1_counting.completedLevels, []);
});
test('corrupt JSON is preserved and last valid backup can recover progress', () => {
  const p = fresh(); p.xp = 300; stored.set(BACKUP_STORAGE_KEY, JSON.stringify(p));
  stored.set(STORAGE_KEY, '{broken');
  assert.equal(loadProgress().xp, 300);
  assert.equal(stored.get(CORRUPT_STORAGE_KEY), '{broken');
});
test('corrupt save without backup is retained before first replacement', () => {
  stored.set(STORAGE_KEY, '{broken'); const p = loadProgress();
  assert.equal(stored.get(CORRUPT_STORAGE_KEY), '{broken');
  assert.equal(saveProgress(p), true); assert.equal(stored.get(CORRUPT_STORAGE_KEY), '{broken');
});
test('daily creation has three tasks and a published deterministic sticker', () => {
  const p = started(); const a = p.retention!.dailyAdventure!;
  assert.equal(a.definitionVersion, 1); assert.equal(a.createdDay, '2026-10-06');
  assert.deepEqual(Object.keys(a.taskProgress), ['learn', 'play', 'help']);
  assert.equal(a.companionId, 'bunny');
  assert(STICKERS.some(s => s.id === a.rewardStickerId));
  assert.deepEqual(ensureDailyAdventure(fresh(), clock()), p);
  assert.equal(ensureDailyAdventure(p, clock()), p);
});
test('reload mid-task and date rollover keep the unfinished adventure', () => {
  let p = question(started(), 'q1'); saveProgress(p); p = loadProgress();
  const next = ensureDailyAdventure(p, clock('2026-10-07'));
  assert.equal(next.retention!.dailyAdventure!.taskProgress.learn, 1);
  assert.equal(next.retention!.dailyAdventure!.createdDay, '2026-10-06');
});
test('same question cannot count twice with duplicate callback or different task', () => {
  const p = question(started(), 'q1');
  assert.equal(question(p, 'q1'), p); assert.equal(question(p, 'q1', 'help'), p);
});
test('completed task caps at five and task/adventure completion receipts occur once', () => {
  let p = completed(); const before = structuredClone(p.retention);
  p = question(p, 'extra');
  assert.deepEqual(p.retention, before);
  assert.equal(p.retention!.dailyAdventure!.status, 'completed');
  assert.equal(p.retention!.dailyAdventure!.completedTaskIds.length, 3);
  assert.equal(p.retention!.eventReceipts.filter(r => r.endsWith(':DailyAdventureCompleted')).length, 1);
});
test('early claim does nothing; claimed sticker survives reload without changing XP/stars', () => {
  const early = started(); assert.equal(claimDailyReward(early), early);
  const p = completed(); const won = claimDailyReward(p);
  assert.equal(won.xp, p.xp); assert.equal(won.totalStars, p.totalStars);
  assert.equal(won.retention!.stickers.length, 1);
  assert.equal(claimDailyReward(won), won);
  saveProgress(won); const reloaded = loadProgress();
  assert.equal(claimDailyReward(reloaded), reloaded);
  assert.equal(reloaded.retention!.rewardReceipts.length, 1);
});
test('already owned sticker is not duplicated by a later adventure', () => {
  const p = completed(); p.retention!.stickers = [p.retention!.dailyAdventure!.rewardStickerId];
  assert.equal(claimDailyReward(p).retention!.stickers.length, 1);
});
test('days are distinct and absence never resets the total', () => {
  let p = question(started(), 'q1'); p = question(p, 'q2');
  assert.deepEqual(p.retention!.adventureDays, ['2026-10-06']);
  p = question(p, 'q3', 'learn', '2026-11-06');
  assert.deepEqual(p.retention!.adventureDays, ['2026-10-06', '2026-11-06']);
});
test('clock rollback/timezone change cannot reopen an already claimed adventure', () => {
  const p = claimDailyReward(completed());
  assert.equal(ensureDailyAdventure(p, clock('2026-10-05')), p);
  const next = ensureDailyAdventure(p, clock('2026-10-07'));
  assert.notEqual(next.retention!.dailyAdventure!.adventureId, p.retention!.dailyAdventure!.adventureId);
  assert.equal(ensureDailyAdventure(next, clock('2026-10-06')), next);
  assert.deepEqual(next.retention!.rewardReceipts, p.retention!.rewardReceipts);
});
test('stale adventure and out-of-range learning events cannot advance tasks', () => {
  const p = started();
  for (const event of [
    { adventureId: 'old', worldId: 'world_1_counting' },
    { adventureId: p.retention!.dailyAdventure!.adventureId, worldId: 'world_6_over_10' },
  ]) assert.equal(applyDailyEvent(p, { type: 'QuestionCompleted', taskId: 'learn', questionId: 'q1', ...event } as any, clock()), p);
  assert.deepEqual(eligibleDailyWorlds(fresh()), ['world_1_counting']);
  const unlocked = fresh(); unlocked.allUnlockedOverride = true;
  assert.deepEqual(eligibleDailyWorlds(unlocked), ['world_1_counting']);
});
test('unlocked but unpractised advanced skills are not selected automatically', () => {
  const p = fresh(); p.unlockedWorlds.push('world_6_over_10');
  assert.deepEqual(eligibleDailyWorlds(p), ['world_1_counting']);
});
test('companion interaction only counts the selected friend, with bunny fallback', () => {
  const p = started(); const event = { type: 'CompanionInteractionCompleted' as const, adventureId: p.retention!.dailyAdventure!.adventureId, interactionId: 'hug', companionId: 'bunny' };
  assert.equal(applyDailyEvent(p, { ...event, companionId: 'locked' }, clock()), p);
  const next = applyDailyEvent(p, event, clock());
  assert.equal(next.retention!.dailyAdventure!.taskProgress.help, 2);
  assert.equal(applyDailyEvent(next, event, clock()), next);
});
test('three rounds complete exactly one finite session; out-of-order/duplicate rounds are ignored', () => {
  let s = createMiniGameSession('s1');
  assert.equal(transitionMiniGameSession(s, { type: 'ROUND_COMPLETED', roundId: 's1:round:3' }), s);
  for (let i = 1; i <= 3; i++) {
    const event = { type: 'ROUND_COMPLETED' as const, roundId: `s1:round:${i}` };
    s = transitionMiniGameSession(s, event);
    assert.equal(transitionMiniGameSession(s, event), s);
  }
  assert.equal(s.status, 'completed'); assert.equal(s.completedRounds.length, 3);
  assert.equal(transitionMiniGameSession(s, { type: 'SESSION_COMPLETED' }), s);
});
test('pause/resume/cancel and early session completion respect terminal state', () => {
  const s = createMiniGameSession('s');
  assert.equal(transitionMiniGameSession(s, { type: 'SESSION_COMPLETED' }), s);
  const paused = transitionMiniGameSession(s, { type: 'PAUSE' });
  assert.equal(transitionMiniGameSession(paused, { type: 'ROUND_COMPLETED', roundId: 's:round:1' }), paused);
  const resumed = transitionMiniGameSession(paused, { type: 'RESUME' });
  assert.equal(resumed.status, 'active');
  const cancelled = transitionMiniGameSession(resumed, { type: 'CANCEL' });
  assert.equal(cancelled.status, 'cancelled');
  assert.equal(transitionMiniGameSession(cancelled, { type: 'RESUME' }), cancelled);
});
test('mini-game completion, reload and duplicate session callback advance play once', () => {
  const p = completed(); saveProgress(p); const loaded = loadProgress();
  const event = { type: 'MiniGameSessionCompleted' as const, adventureId: loaded.retention!.dailyAdventure!.adventureId, sessionId: 'session-1' };
  assert.equal(applyDailyEvent(loaded, event, clock()), loaded);
  assert.equal(loaded.retention!.dailyAdventure!.taskProgress.play, 1);
});
test('transaction failure does not publish a claimed reward or mutate caller state', () => {
  const p = completed(); saveProgress(p); const before = structuredClone(p);
  failWrite = true;
  assert.throws(() => commitRetentionUpdate(p, claimDailyReward), /save/i);
  assert.deepEqual(p, before);
  failWrite = false; assert.equal(loadProgress().retention!.dailyAdventure!.rewardState, 'available');
});
test('3/7/14 milestones survive absence and contain no consecutive-day requirement', () => {
  const p = started();
  for (const [count, expected] of [[3, [3]], [7, [3, 7]], [14, [3, 7, 14]]] as const) {
    p.retention!.adventureDays = Array.from({ length: count }, (_, i) => `2026-09-${String(i + 1).padStart(2, '0')}`);
    assert.deepEqual(earnedAdventureDayMilestones(p.retention!), expected);
  }
  assert.deepEqual(earnedAdventureDayMilestones(ensureDailyAdventure(p, clock('2027-01-01')).retention!), [3, 7, 14]);
});
test('real clock adapter returns a valid calendar day and invalid dates are rejected', () => {
  assert(isDay(deviceClock.day()));
  assert(isDay('2028-02-29')); assert(!isDay('2026-02-29')); assert(!isDay('2026-13-01'));
  assert.throws(() => ensureDailyAdventure(fresh(), clock('not-a-day')), /calendar/);
});
test('a cancelled daily mini-game can restart with a fresh session but not the reused ID', () => {
  const p = controlDailyMiniGame(startDailyMiniGame(started(), 'cancelled-1'), { type: 'CANCEL' });
  assert.equal(startDailyMiniGame(p, 'cancelled-1'), p);
  const next = startDailyMiniGame(p, 'new-1');
  assert.equal(next.retention!.miniGameSession!.sessionId, 'new-1');
});
test('paused mini-game survives reload; advanced mini-game rounds cannot enter a beginner daily', () => {
  let p = startDailyMiniGame(started(), 's1');
  p = controlDailyMiniGame(p, { type: 'PAUSE' }); saveProgress(p); p = loadProgress();
  const event = { type: 'MiniGameRoundCompleted' as const, adventureId: p.retention!.dailyAdventure!.adventureId, sessionId: 's1', roundId: 's1:round:1', worldId: 'world_1_counting' as const };
  assert.equal(applyDailyEvent(p, event, clock()), p);
  p = controlDailyMiniGame(p, { type: 'RESUME' });
  assert.equal(applyDailyEvent(p, { ...event, worldId: 'world_6_over_10' }, clock()), p);
  p = applyDailyEvent(p, event, clock()); saveProgress(p); p = loadProgress();
  assert.equal(p.retention!.miniGameSession!.completedRounds.length, 1);
  assert.equal(p.retention!.miniGameSession!.roundId, 's1:round:2');
});
test('future adventure definition blocks writes and reset without destroying the original save', () => {
  const p = started();
  const raw = JSON.stringify({ ...p, retention: { ...p.retention, dailyAdventure: { ...p.retention!.dailyAdventure, definitionVersion: 2 } } });
  stored.set(STORAGE_KEY, raw); const loaded = loadProgress();
  assert.equal(saveProgress(loaded), false); resetGameProgress();
  assert.equal(stored.get(STORAGE_KEY), raw);
});
test('stale snapshot cannot overwrite a reward already claimed or later gameplay', () => {
  const p = completed(); saveProgress(p);
  const claimed = commitRetentionUpdate(p, claimDailyReward);
  assert.throws(() => commitRetentionUpdate(p, claimDailyReward), /conflict/i);
  assert.deepEqual(loadProgress().retention, claimed.retention);
  const later = loadProgress(); later.xp += 10; saveProgress(later);
  assert.throws(() => commitRetentionUpdate(claimed, next => ensureDailyAdventure(next, clock('2026-10-07'))), /conflict/i);
  assert.equal(loadProgress().xp, later.xp);
});
test('a damaged adventure cannot reopen the same reward date using fresh gameplay IDs', () => {
  const p = claimDailyReward(completed());
  stored.set(STORAGE_KEY, JSON.stringify({ ...p, retention: { ...p.retention, dailyAdventure: null } }));
  const recovered = loadProgress();
  assert.equal(ensureDailyAdventure(recovered, clock()), recovered);
  assert.equal(ensureDailyAdventure(recovered, clock('2026-10-05')), recovered);
  assert.equal(ensureDailyAdventure(recovered, clock('2026-10-07')).retention!.dailyAdventure!.createdDay, '2026-10-07');
});
test('partial retention damage does not discard valid days, stickers and receipts', () => {
  const p = claimDailyReward(completed());
  stored.set(STORAGE_KEY, JSON.stringify({ ...p, retention: { ...p.retention, version: 'broken', miniGameSession: { status: 'completed', completedRounds: [] } } }));
  const recovered = loadProgress().retention!;
  assert.deepEqual(recovered.adventureDays, p.retention!.adventureDays);
  assert.deepEqual(recovered.stickers, p.retention!.stickers);
  assert.deepEqual(recovered.rewardReceipts, p.retention!.rewardReceipts);
  assert.equal(recovered.miniGameSession, null);
});
test('reset clears retention and recovery keys while preserving unrelated data/settings', () => {
  const p = claimDailyReward(completed()); p.speechEnabled = false; saveProgress(p);
  stored.set(CORRUPT_STORAGE_KEY, '{old'); stored.set('unrelated', 'keep');
  const clean = resetGameProgress();
  assert.deepEqual(clean.retention!.stickers, []); assert.equal(clean.speechEnabled, false);
  assert.equal(stored.has(BACKUP_STORAGE_KEY), false); assert.equal(stored.has(CORRUPT_STORAGE_KEY), false);
  assert.equal(stored.get('unrelated'), 'keep');
});
test('backup can still be read when corrupt-snapshot preservation runs out of storage', () => {
  const p = fresh(); p.xp = 400;
  stored.set(BACKUP_STORAGE_KEY, JSON.stringify(p)); stored.set(STORAGE_KEY, '{broken');
  failWrite = true;
  assert.equal(loadProgress().xp, 400);
  assert.equal(saveProgress(fresh()), false);
  assert.equal(stored.get(STORAGE_KEY), '{broken');
});
test('invalid session IDs are rejected without altering adventure progress', () => {
  const p = started();
  assert.equal(startDailyMiniGame(p, 'x'.repeat(121)), p);
  assert.equal(startDailyMiniGame(p, 'child name with spaces'), p);
});
