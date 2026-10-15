import { DEFAULT_AVATAR, normalizeAvatar } from '../domain/avatar/avatar';
import { UserProgress, WorldId, WorldLevelData } from '../types/math';
import { REWARDS_CATALOG } from './rewards';
import { isOwned, syncEarnedBadges } from '../domain/shop/shop';
import { emptyPlayTime, normalizePlayTime } from '../domain/playtime/playtime';
import { ALL_PLUSH_FRIENDS } from '../data/plushFriends';
import { PlushFriend } from '../types/plush';
import { createRetention } from '../domain/retention/types';
import { natural, object, strings, validateRetention } from '../domain/retention/validation';
import { createRoom, reconcileRoom } from '../domain/room/room';

export const STORAGE_KEY = 'be_vui_hoc_cong_progress_v2';
export const LEGACY_STORAGE_KEY = 'be_vui_hoc_cong_progress_v1';
export const BACKUP_STORAGE_KEY = STORAGE_KEY + '_backup';
export const CORRUPT_STORAGE_KEY = STORAGE_KEY + '_corrupt';
export const SAVE_VERSION = 2;

export const LEVEL_TITLES: { level: number; title: string; minXp: number; maxXp: number }[] = [
  { level: 1, title: 'Nhà Thám Hiểm Nhí', minXp: 0, maxXp: 100 },
  { level: 2, title: 'Người Bạn Con Số', minXp: 100, maxXp: 250 },
  { level: 3, title: 'Chiến Binh Phép Cộng', minXp: 250, maxXp: 500 },
  { level: 4, title: 'Cao Thủ Số 10', minXp: 500, maxXp: 900 },
  { level: 5, title: 'Bậc Thầy Tách Số', minXp: 900, maxXp: 1400 },
  { level: 6, title: 'Nhà Toán Học Nhí', minXp: 1400, maxXp: 99999 },
];

export function getPlayerLevelInfo(xp: number) {
  for (let i = LEVEL_TITLES.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_TITLES[i].minXp) {
      const current = LEVEL_TITLES[i];
      const next = LEVEL_TITLES[i + 1] || null;
      const progressInLevel = next
        ? Math.min(100, Math.max(0, ((xp - current.minXp) / (current.maxXp - current.minXp)) * 100))
        : 100;
      return {
        level: current.level,
        title: current.title,
        currentXp: xp,
        minXp: current.minXp,
        maxXp: current.maxXp,
        percent: progressInLevel,
      };
    }
  }
  return {
    level: 1,
    title: LEVEL_TITLES[0].title,
    currentXp: xp,
    minXp: 0,
    maxXp: 100,
    percent: 0,
  };
}

export const INITIAL_PROGRESS: UserProgress = {
  avatar: {...DEFAULT_AVATAR},
  room: createRoom(),
  gameProgressVersion: 2,
  retention: createRetention(),
  childNickname: 'Bé Yêu',
  childAvatar: '🐰',
  currentLevel: 1,
  totalStars: 0,
  spentStars: 0,
  playTime: emptyPlayTime(),
  xp: 0,
  playerLevel: 1,
  unlockedWorlds: ['world_1_counting'],
  worldLevelsProgress: {
    world_1_counting: { completedLevels: [], levelStars: {} },
    world_2_merge: { completedLevels: [], levelStars: {} },
    world_3_add_10: { completedLevels: [], levelStars: {} },
    world_4_make_10: { completedLevels: [], levelStars: {} },
    world_5_split: { completedLevels: [], levelStars: {} },
    world_6_over_10: { completedLevels: [], levelStars: {} },
  },
  openedChests: [],
  equippedAccessories: {
    shirt: 'shirt_sky',
    backpack: 'backpack_yellow',
    item: 'none',
  },
  unlockedAccessories: ['shirt_sky', 'backpack_yellow', 'item_carrot'],
  unlockedPlushFriends: [],
  selectedCompanionId: null,
  claimedCheckpointRewards: [],
  stats: {
    todayTimeMinutes: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    streak: 0,
    bestStreak: 0,
    categoryAccuracy: {
      world_1_counting: { answered: 0, correct: 0 },
      world_2_merge: { answered: 0, correct: 0 },
      world_3_add_10: { answered: 0, correct: 0 },
      world_4_make_10: { answered: 0, correct: 0 },
      world_5_split: { answered: 0, correct: 0 },
      world_6_over_10: { answered: 0, correct: 0 },
    },
  },
  soundEnabled: true,
  speechEnabled: true,
  soundEffectsEnabled: true,
  musicEnabled: true,
  allUnlockedOverride: false,
};

export const DEFAULT_GAME_PROGRESS: UserProgress = INITIAL_PROGRESS;

export interface WorldConfig {
  id: WorldId;
  name: string;
  adventureName: string;
  subtitle: string;
  icon: string;
  minStarsToUnlock: number;
  bgGradient: string;
  accentColor: string;
  description: string;
  totalLevels: number;
}

export const ALL_WORLDS: WorldConfig[] = [
  {
    id: 'world_1_counting',
    name: 'Bé Tập Đếm',
    adventureName: 'Khu Vườn Đếm Số',
    subtitle: 'Làm quen số 1 - 10 cùng các bạn động vật',
    icon: '🌼',
    minStarsToUnlock: 0,
    bgGradient: 'from-emerald-400 via-teal-300 to-green-100',
    accentColor: '#10B981',
    description: 'Hoa tươi khoe sắc, bướm lượn quanh cây. Bé tập đếm các đồ vật đáng yêu!',
    totalLevels: 8,
  },
  {
    id: 'world_2_merge',
    name: 'Gộp Hai Nhóm',
    adventureName: 'Rừng Gộp Nhóm',
    subtitle: 'Khám phá bí mật của phép cộng',
    icon: '🍎',
    minStarsToUnlock: 5,
    bgGradient: 'from-amber-400 via-orange-300 to-yellow-100',
    accentColor: '#F59E0B',
    description: 'Gộp những quả táo ngon lành và nấm rơm vào chung một giỏ!',
    totalLevels: 8,
  },
  {
    id: 'world_3_add_10',
    name: 'Cộng Trong Phạm Vi 10',
    adventureName: 'Đảo Phép Cộng',
    subtitle: 'Vượt sóng biển xanh săn kho báu số học',
    icon: '🏝️',
    minStarsToUnlock: 12,
    bgGradient: 'from-cyan-400 via-sky-300 to-blue-100',
    accentColor: '#0EA5E9',
    description: 'Biển xanh cát vàng rực rỡ, tìm chìa khóa mở rương kho báu!',
    totalLevels: 8,
  },
  {
    id: 'world_4_make_10',
    name: 'Ngôi Nhà Số 10',
    adventureName: 'Vương Quốc Số 10',
    subtitle: 'Mở cánh cổng lâu đài huyền diệu',
    icon: '🏰',
    minStarsToUnlock: 20,
    bgGradient: 'from-purple-400 via-violet-300 to-fuchsia-100',
    accentColor: '#8B5CF6',
    description: 'Tìm người bạn ghép cặp tạo thành 10 để thắp sáng viên ngọc bảo vệ lâu đài!',
    totalLevels: 8,
  },
  {
    id: 'world_5_split',
    name: 'Tách Số Thông Minh',
    adventureName: 'Thung Lũng Tách Số',
    subtitle: 'Chia kẹo vào hai giỏ nhiệm màu',
    icon: '🌈',
    minStarsToUnlock: 28,
    bgGradient: 'from-pink-400 via-rose-300 to-red-100',
    accentColor: '#EC4899',
    description: 'Cầu vồng bắc ngang suối, bé khéo léo tách số thành 2 phần kỳ diệu.',
    totalLevels: 8,
  },
  {
    id: 'world_6_over_10',
    name: 'Cộng Vượt 10',
    adventureName: 'Hành Tinh Vượt 10',
    subtitle: 'Nạp năng lượng cho tên lửa vũ trụ',
    icon: '🚀',
    minStarsToUnlock: 36,
    bgGradient: 'from-indigo-600 via-purple-600 to-slate-900',
    accentColor: '#6366F1',
    description: 'Tuyệt chiêu tạo 10 trước giúp tên lửa vút bay tới các vì sao xa xôi!',
    totalLevels: 8,
  },
];

// Keep the v2 key/root version; retention is independently versioned.
export function isFutureSave(raw: unknown): boolean {
  const data = object(raw);
  const retention = object(data.retention);
  const room = object(data.room);
  return (typeof object(data.avatar).version === 'number' && (object(data.avatar).version as number) > 1) ||
    (typeof data.gameProgressVersion === 'number' && data.gameProgressVersion > SAVE_VERSION) ||
    (typeof room.version === 'number' && room.version > 1) ||
    (typeof retention.version === 'number' && retention.version > 1) ||
    (typeof object(retention.dailyAdventure).definitionVersion === 'number' && (object(retention.dailyAdventure).definitionVersion as number) > 1);
}

export function migrateProgress(value: unknown): UserProgress {
  const raw = object(value);
  const result = structuredClone(INITIAL_PROGRESS);
  result.avatar = normalizeAvatar(raw.avatar);
  for (const field of ['currentLevel', 'totalStars', 'xp'] as const) result[field] = natural(raw[field], result[field]);
  if (raw.xp === undefined || raw.xp === null) result.xp = result.totalStars * 15;
  result.spentStars = Math.min(natural(raw.spentStars, 0), result.totalStars);
  for (const field of ['childNickname', 'childAvatar'] as const) {
    if (typeof raw[field] === 'string') result[field] = raw[field];
  }
  for (const field of ['soundEnabled', 'speechEnabled', 'soundEffectsEnabled', 'musicEnabled', 'allUnlockedOverride'] as const) {
    if (typeof raw[field] === 'boolean') result[field] = raw[field];
  }
  if (raw.soundEffectsEnabled === undefined && typeof raw.soundEnabled === 'boolean') result.soundEffectsEnabled = raw.soundEnabled;
  result.unlockedWorlds = strings(raw.unlockedWorlds).filter((id): id is WorldId => ALL_WORLDS.some(w => w.id === id));
  if (!result.unlockedWorlds.includes('world_1_counting')) result.unlockedWorlds.unshift('world_1_counting');
  for (const field of ['openedChests', 'unlockedPlushFriends', 'claimedCheckpointRewards'] as const) result[field] = strings(raw[field]);
  result.unlockedAccessories = [...new Set([...INITIAL_PROGRESS.unlockedAccessories, ...strings(raw.unlockedAccessories)])];
  result.selectedCompanionId = typeof raw.selectedCompanionId === 'string' ? raw.selectedCompanionId : null;
  const accessories = object(raw.equippedAccessories);
  for (const slot of ['hat', 'glasses', 'shirt', 'backpack', 'item', 'badge'] as const) {
    if (typeof accessories[slot] === 'string') result.equippedAccessories[slot] = accessories[slot];
  }
  const levels = object(raw.worldLevelsProgress);
  for (const world of ALL_WORLDS) {
    const data = object(levels[world.id]);
    const stars = object(data.levelStars);
    result.worldLevelsProgress[world.id] = {
      completedLevels: Array.isArray(data.completedLevels) ? [...new Set(data.completedLevels.filter((n): n is number => Number.isInteger(n) && n >= 1 && n <= world.totalLevels))] : [],
      levelStars: Object.fromEntries(Object.entries(stars).filter(([key, n]) => /^[1-8]$/.test(key) && Number.isInteger(n) && (n as number) >= 0 && (n as number) <= 3).map(([key, n]) => [key, n as number])),
      ...(typeof data.bossCompleted === 'boolean' ? { bossCompleted: data.bossCompleted } : {}),
    };
  }
  const stats = object(raw.stats);
  for (const field of ['todayTimeMinutes', 'totalAnswered', 'totalCorrect', 'streak', 'bestStreak'] as const) result.stats[field] = natural(stats[field], result.stats[field]);
  const accuracy = object(stats.categoryAccuracy);
  for (const world of ALL_WORLDS) {
    const entry = object(accuracy[world.id]);
    result.stats.categoryAccuracy[world.id] = { answered: natural(entry.answered), correct: natural(entry.correct) };
  }
  result.playerLevel = getPlayerLevelInfo(result.xp).level;
  result.retention = validateRetention(raw.retention);
  result.playTime = normalizePlayTime(raw.playTime);
  return reconcileRoom(reconcileOpenedCheckpoints(result), raw.room);
}

function parseSave(text: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid save root');
  return parsed as Record<string, unknown>;
}
function preserveCorrupt(text: string): boolean {
  try {
    if (localStorage.getItem(CORRUPT_STORAGE_KEY) === null) localStorage.setItem(CORRUPT_STORAGE_KEY, text);
    return true;
  } catch { return false; }
}

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return structuredClone(INITIAL_PROGRESS);
  try {
    const text = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (text === null) return structuredClone(INITIAL_PROGRESS);
    let parsed: Record<string, unknown>;
    try { parsed = parseSave(text); }
    catch {
      preserveCorrupt(text);
      const backup = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (backup === null) return structuredClone(INITIAL_PROGRESS);
      parsed = parseSave(backup);
      return migrateProgress(parsed);
    }
    const migrated = migrateProgress(parsed);
    if (!isFutureSave(parsed) && JSON.stringify(migrated) !== localStorage.getItem(STORAGE_KEY)) saveProgress(migrated);
    return migrated;
  } catch { return structuredClone(INITIAL_PROGRESS); }
}

/** True only after a durable write; future schemas are never downgraded. */
export function saveProgress(progress: UserProgress): boolean {
  if (typeof window === 'undefined' || isFutureSave(progress)) return false;
  try {
    const next = JSON.stringify(progress);
    for (const key of [STORAGE_KEY, LEGACY_STORAGE_KEY, BACKUP_STORAGE_KEY]) {
      const previous = localStorage.getItem(key);
      if (previous === null) continue;
      let parsed: Record<string, unknown>;
      try { parsed = parseSave(previous); }
      catch { if (key !== BACKUP_STORAGE_KEY && !preserveCorrupt(previous)) return false; continue; }
      if (isFutureSave(parsed)) return false;
    }
    const previous = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (previous !== null && previous !== next) {
      let valid = false;
      try { parseSave(previous); valid = true; } catch { if (!preserveCorrupt(previous)) return false; }
      if (valid) localStorage.setItem(BACKUP_STORAGE_KEY, previous);
    }
    localStorage.setItem(STORAGE_KEY, next);
    return true;
  } catch { return false; }
}

/** Publish the returned snapshot/animation only after this succeeds. */
export function commitRetentionUpdate(progress: UserProgress, update: (current: UserProgress) => UserProgress): UserProgress {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      let parsed: Record<string, unknown> | null = null;
      try { parsed = parseSave(saved); } catch { /* recovery write still preserves corrupt data */ }
      if (parsed && (isFutureSave(parsed) || JSON.stringify(migrateProgress(parsed)) !== JSON.stringify(migrateProgress(progress)))) {
        throw new Error('Retention save conflict; reload the latest progress before retrying');
      }
    }
  }
  const next = update(progress);
  if (next === progress) return progress;
  if (!saveProgress(next)) throw new Error('Retention save failed; do not publish this update');
  return next;
}
// Shop items are bought with stars; only badges are awarded automatically (one per finished world).
export function checkAndUpdateUnlockedRewards(progress: UserProgress): { newRewards: string[]; updatedProgress: UserProgress } {
  const { progress: updatedProgress, newBadges } = syncEarnedBadges(progress);
  return { newRewards: newBadges, updatedProgress };
}

// Record question answer result
export function recordAnswerResult(
  progress: UserProgress,
  worldId: WorldId,
  isCorrect: boolean
): { updatedProgress: UserProgress; starsEarned: number; xpEarned: number; newlyUnlockedReward: string | null } {
  let starsEarned = 0;
  let xpEarned = 0;
  const newStreak = isCorrect ? progress.stats.streak + 1 : 0;
  const bestStreak = Math.max(progress.stats.bestStreak, newStreak);

  if (isCorrect) {
    starsEarned = 1;
    xpEarned = 10;
    // Combo bonus
    if (newStreak >= 3) {
      xpEarned += 5;
    }
    if (newStreak % 5 === 0) {
      starsEarned += 1;
      xpEarned += 15;
    }
  }

  const newTotalStars = progress.totalStars + starsEarned;
  const newXp = (progress.xp || 0) + xpEarned;
  const levelInfo = getPlayerLevelInfo(newXp);

  // Check world unlock progress
  const unlockedWorlds = [...progress.unlockedWorlds];
  ALL_WORLDS.forEach((world) => {
    if (!unlockedWorlds.includes(world.id) && newTotalStars >= world.minStarsToUnlock) {
      unlockedWorlds.push(world.id);
    }
  });

  const catStats = progress.stats.categoryAccuracy[worldId] || { answered: 0, correct: 0 };
  const updatedCategory = {
    ...progress.stats.categoryAccuracy,
    [worldId]: {
      answered: catStats.answered + 1,
      correct: catStats.correct + (isCorrect ? 1 : 0),
    },
  };

  const updatedProgress: UserProgress = {
    ...progress,
    totalStars: newTotalStars,
    xp: newXp,
    playerLevel: levelInfo.level,
    unlockedWorlds,
    stats: {
      ...progress.stats,
      totalAnswered: progress.stats.totalAnswered + 1,
      totalCorrect: progress.stats.totalCorrect + (isCorrect ? 1 : 0),
      streak: newStreak,
      bestStreak,
      categoryAccuracy: updatedCategory,
    },
  };

  const { newRewards, updatedProgress: finalProgress } = checkAndUpdateUnlockedRewards(updatedProgress);
  saveProgress(finalProgress);

  return {
    updatedProgress: finalProgress,
    starsEarned,
    xpEarned,
    newlyUnlockedReward: newRewards.length > 0 ? newRewards[0] : null,
  };
}

// Complete a level within a world
export function recordLevelCompletion(
  progress: UserProgress,
  worldId: WorldId,
  levelNumber: number,
  earnedStars: number, // 1 to 3
  isBoss: boolean = false
): {
  updatedProgress: UserProgress;
  xpEarned: number;
  newlyUnlockedReward: string | null;
  newlyUnlockedPlush: PlushFriend | null;
} {
  const worldData: WorldLevelData = progress.worldLevelsProgress[worldId] || { completedLevels: [], levelStars: {} };
  const existingStars = worldData.levelStars[levelNumber] || 0;
  const bestStars = Math.max(existingStars, earnedStars);

  const completedSet = new Set(worldData.completedLevels);
  completedSet.add(levelNumber);

  // XP bonuses for level completion
  let xpBonus = 50;
  if (earnedStars === 3) {
    xpBonus += 50; // Perfect bonus!
  }
  if (isBoss) {
    xpBonus += 100;
  }

  // Star delta
  const starDelta = Math.max(0, bestStars - existingStars);
  const newTotalStars = progress.totalStars + starDelta;
  const newXp = (progress.xp || 0) + xpBonus;
  const levelInfo = getPlayerLevelInfo(newXp);

  const updatedWorldData: WorldLevelData = {
    ...worldData,
    completedLevels: Array.from(completedSet),
    levelStars: {
      ...worldData.levelStars,
      [levelNumber]: bestStars,
    },
    bossCompleted: isBoss || worldData.bossCompleted,
  };

  // Check if this unlocked next world
  const unlockedWorlds = [...progress.unlockedWorlds];
  ALL_WORLDS.forEach((world) => {
    if (!unlockedWorlds.includes(world.id) && newTotalStars >= world.minStarsToUnlock) {
      unlockedWorlds.push(world.id);
    }
  });

  const updatedProgress: UserProgress = {
    ...progress,
    totalStars: newTotalStars,
    xp: newXp,
    playerLevel: levelInfo.level,
    unlockedWorlds,
    worldLevelsProgress: {
      ...progress.worldLevelsProgress,
      [worldId]: updatedWorldData,
    },
  };

  const { newRewards, updatedProgress: afterRewardsProgress } = checkAndUpdateUnlockedRewards(updatedProgress);

  // Check and claim checkpoint plush reward deterministically
  const { updatedProgress: plushProgress, unlockedPlush } = checkAndClaimPlushReward(
    afterRewardsProgress,
    worldId,
    levelNumber
  );

  const finalProgress = reconcileRoom(plushProgress);
  saveProgress(finalProgress);

  return {
    updatedProgress: finalProgress,
    xpEarned: xpBonus,
    newlyUnlockedReward: newRewards.length > 0 ? newRewards[0] : null,
    newlyUnlockedPlush: unlockedPlush,
  };
}

// Existing chest IDs are the durable receipt; repair progression without re-awarding XP/stars.
function reconcileOpenedCheckpoints(progress: UserProgress): UserProgress {
  let updated = progress;
  for (const world of ALL_WORLDS) {
    for (const level of [3, 6]) {
      if (!updated.openedChests.includes(`chest_${world.id}_lvl_${level}`)) continue;
      const data = updated.worldLevelsProgress[world.id];
      if (!data.completedLevels.includes(level)) {
        updated = {
          ...updated,
          worldLevelsProgress: {
            ...updated.worldLevelsProgress,
            [world.id]: { ...data, completedLevels: [...data.completedLevels, level].sort((a, b) => a - b) },
          },
        };
      }
      updated = claimPlushReward(updated, world.id, level).updatedProgress;
    }
  }
  return {
    ...updated,
    unlockedWorlds: Array.from(new Set([
      ...updated.unlockedWorlds,
      ...ALL_WORLDS.filter(w => updated.totalStars >= w.minStarsToUnlock).map(w => w.id),
    ])),
  };
}

// Claim the chest and complete its checkpoint in the same saved update.
export function recordChestOpen(
  progress: UserProgress,
  chestId: string
): { updatedProgress: UserProgress; reward: string | null; starsBonus: number; xpBonus: number } {
  if (progress.openedChests.includes(chestId)) {
    const repaired = reconcileRoom(reconcileOpenedCheckpoints(progress));
    saveProgress(repaired);
    return { updatedProgress: repaired, reward: null, starsBonus: 0, xpBonus: 0 };
  }

  const currentUnlocked = new Set(progress.unlockedAccessories);
  // A chest is a free gift from the shop; badges still have to be earned.
  const lockedItems = REWARDS_CATALOG.filter(r => r.type !== 'badge' && !isOwned(progress, r));
  const rewardedItem = lockedItems.length > 0
    ? lockedItems[Math.floor(Math.random() * lockedItems.length)].id
    : null;
  if (rewardedItem) currentUnlocked.add(rewardedItem);

  const starsBonus = 3;
  const xpBonus = 50;
  const newXp = (progress.xp || 0) + xpBonus;
  const updated = reconcileRoom(reconcileOpenedCheckpoints({
    ...progress,
    totalStars: progress.totalStars + starsBonus,
    xp: newXp,
    playerLevel: getPlayerLevelInfo(newXp).level,
    openedChests: [...progress.openedChests, chestId],
    unlockedAccessories: Array.from(currentUnlocked),
  }));

  saveProgress(updated);
  return { updatedProgress: updated, reward: rewardedItem, starsBonus, xpBonus };
}

// Check and claim checkpoint plush friend reward (determinisic, strictly once per checkpoint)
function claimPlushReward(
  progress: UserProgress,
  worldId: WorldId,
  completedLevel: number
): { updatedProgress: UserProgress; unlockedPlush: PlushFriend | null } {
  const friend = ALL_PLUSH_FRIENDS.find(
    (f) => f.worldId === worldId && f.requiredLevel === completedLevel
  );
  if (!friend) {
    return { updatedProgress: progress, unlockedPlush: null };
  }

  const claimed = progress.claimedCheckpointRewards || [];
  if (claimed.includes(friend.checkpointId)) {
    return { updatedProgress: progress, unlockedPlush: null };
  }

  const currentUnlockedPlushies = progress.unlockedPlushFriends || [];
  const newUnlocked = Array.from(new Set([...currentUnlockedPlushies, friend.id]));
  const newClaimed = [...claimed, friend.checkpointId];

  // Automatically equip as companion if child has no companion yet
  const newCompanion = progress.selectedCompanionId || friend.id;

  const updated: UserProgress = {
    ...progress,
    unlockedPlushFriends: newUnlocked,
    claimedCheckpointRewards: newClaimed,
    selectedCompanionId: newCompanion,
  };

  return { updatedProgress: updated, unlockedPlush: friend };
}

export function checkAndClaimPlushReward(progress: UserProgress, worldId: WorldId, completedLevel: number) {
  const result = claimPlushReward(progress, worldId, completedLevel);
  if (result.updatedProgress !== progress) saveProgress(result.updatedProgress);
  return result;
}

export function resetGameProgress(keepSettings: boolean = true): UserProgress {
  let preservedSettings = {
    soundEnabled: true,
    speechEnabled: true,
    soundEffectsEnabled: true,
    musicEnabled: true,
  };

  if (keepSettings && typeof window !== 'undefined') {
    try {
      const existingRaw = localStorage.getItem(STORAGE_KEY);
      if (existingRaw) {
        const parsed = JSON.parse(existingRaw);
        if (isFutureSave(parsed)) return loadProgress();
        const existing = migrateProgress(parsed);
        if (existing) {
          preservedSettings = {
            soundEnabled: existing.soundEnabled ?? true,
            speechEnabled: existing.speechEnabled ?? true,
            soundEffectsEnabled: existing.soundEffectsEnabled ?? true,
            musicEnabled: existing.musicEnabled ?? true,
          };
        }
      }
    } catch {
      // Continue with defaults if parse fails
    }
  }

  const cleanProgress: UserProgress = {
    ...structuredClone(DEFAULT_GAME_PROGRESS),
    ...preservedSettings,
  };

  if (typeof window !== 'undefined') {
    try {
      // Clean only game keys - NEVER call localStorage.clear()
      if (!saveProgress(cleanProgress)) return loadProgress();
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.removeItem(BACKUP_STORAGE_KEY);
      localStorage.removeItem(CORRUPT_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to reset storage:', e);
    }
  }

  return cleanProgress;
}

export function resetProgress(): UserProgress {
  return resetGameProgress(true);
}
