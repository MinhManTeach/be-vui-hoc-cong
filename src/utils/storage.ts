import { UserProgress, WorldId, WorldLevelData } from '../types/math';
import { REWARDS_CATALOG } from './rewards';
import { ALL_PLUSH_FRIENDS } from '../data/plushFriends';
import { PlushFriend } from '../types/plush';

export const STORAGE_KEY = 'be_vui_hoc_cong_progress_v2';
export const LEGACY_STORAGE_KEY = 'be_vui_hoc_cong_progress_v1';

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
  gameProgressVersion: 2,
  childNickname: 'Bé Yêu',
  childAvatar: '🐰',
  currentLevel: 1,
  totalStars: 0,
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
    item: 'item_carrot',
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

// Migration helper to safely convert v1 data to v2
function migrateProgress(raw: Record<string, unknown>): UserProgress {
  const result: UserProgress = {
    ...INITIAL_PROGRESS,
    ...raw,
    equippedAccessories: {
      ...INITIAL_PROGRESS.equippedAccessories,
      ...(raw.equippedAccessories as object),
    },
    unlockedAccessories: Array.isArray(raw.unlockedAccessories)
      ? Array.from(new Set([...INITIAL_PROGRESS.unlockedAccessories, ...(raw.unlockedAccessories as string[])]))
      : INITIAL_PROGRESS.unlockedAccessories,
    unlockedPlushFriends: Array.isArray(raw.unlockedPlushFriends)
      ? (raw.unlockedPlushFriends as string[])
      : [],
    selectedCompanionId: typeof raw.selectedCompanionId === 'string' ? (raw.selectedCompanionId as string) : null,
    claimedCheckpointRewards: Array.isArray(raw.claimedCheckpointRewards)
      ? (raw.claimedCheckpointRewards as string[])
      : [],
    stats: {
      ...INITIAL_PROGRESS.stats,
      ...((raw.stats as object) || {}),
      categoryAccuracy: {
        ...INITIAL_PROGRESS.stats.categoryAccuracy,
        ...((raw.stats as { categoryAccuracy?: Record<WorldId, { answered: number; correct: number }> })?.categoryAccuracy || {}),
      },
    },
  };

  // Populate worldLevelsProgress if missing
  if (!result.worldLevelsProgress || typeof result.worldLevelsProgress !== 'object') {
    result.worldLevelsProgress = {
      world_1_counting: { completedLevels: [], levelStars: {} },
      world_2_merge: { completedLevels: [], levelStars: {} },
      world_3_add_10: { completedLevels: [], levelStars: {} },
      world_4_make_10: { completedLevels: [], levelStars: {} },
      world_5_split: { completedLevels: [], levelStars: {} },
      world_6_over_10: { completedLevels: [], levelStars: {} },
    };
  } else {
    // Ensure all 6 worlds exist
    const worlds: WorldId[] = ['world_1_counting', 'world_2_merge', 'world_3_add_10', 'world_4_make_10', 'world_5_split', 'world_6_over_10'];
    worlds.forEach((w) => {
      if (!result.worldLevelsProgress[w]) {
        result.worldLevelsProgress[w] = { completedLevels: [], levelStars: {} };
      }
    });
  }

  if (result.xp === undefined || result.xp === null) {
    result.xp = result.totalStars * 15;
  }
  const levelInfo = getPlayerLevelInfo(result.xp);
  result.playerLevel = levelInfo.level;
  result.gameProgressVersion = 2;

  return reconcileOpenedCheckpoints(result);
}

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return INITIAL_PROGRESS;
  try {
    // Check v2 first
    const rawV2 = localStorage.getItem(STORAGE_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      const migrated = migrateProgress(parsed);
      if (JSON.stringify(migrated) !== rawV2) saveProgress(migrated);
      return migrated;
    }

    // Try migrating v1
    const rawV1 = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (rawV1) {
      const parsedV1 = JSON.parse(rawV1);
      const migrated = migrateProgress(parsedV1);
      saveProgress(migrated);
      return migrated;
    }

    return INITIAL_PROGRESS;
  } catch (err) {
    console.error('Error loading progress', err);
    return INITIAL_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress', e);
  }
}

// Check newly unlocked rewards based on star count
export function checkAndUpdateUnlockedRewards(progress: UserProgress): { newRewards: string[]; updatedProgress: UserProgress } {
  const currentUnlocked = new Set(progress.unlockedAccessories);
  const newlyUnlocked: string[] = [];

  REWARDS_CATALOG.forEach((reward) => {
    if (progress.totalStars >= reward.unlockStars && !currentUnlocked.has(reward.id)) {
      newlyUnlocked.push(reward.id);
      currentUnlocked.add(reward.id);
    }
  });

  if (newlyUnlocked.length > 0) {
    const updated = {
      ...progress,
      unlockedAccessories: Array.from(currentUnlocked),
    };
    saveProgress(updated);
    return { newRewards: newlyUnlocked, updatedProgress: updated };
  }

  return { newRewards: [], updatedProgress: progress };
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
  const { updatedProgress: finalProgress, unlockedPlush } = checkAndClaimPlushReward(
    afterRewardsProgress,
    worldId,
    levelNumber
  );

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
    const repaired = reconcileOpenedCheckpoints(progress);
    saveProgress(repaired);
    return { updatedProgress: repaired, reward: null, starsBonus: 0, xpBonus: 0 };
  }

  const currentUnlocked = new Set(progress.unlockedAccessories);
  const lockedItems = REWARDS_CATALOG.filter(r => !currentUnlocked.has(r.id));
  const rewardedItem = lockedItems.length > 0
    ? lockedItems[Math.floor(Math.random() * lockedItems.length)].id
    : null;
  if (rewardedItem) currentUnlocked.add(rewardedItem);

  const starsBonus = 3;
  const xpBonus = 50;
  const newXp = (progress.xp || 0) + xpBonus;
  const updated = reconcileOpenedCheckpoints({
    ...progress,
    totalStars: progress.totalStars + starsBonus,
    xp: newXp,
    playerLevel: getPlayerLevelInfo(newXp).level,
    openedChests: [...progress.openedChests, chestId],
    unlockedAccessories: Array.from(currentUnlocked),
  });

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
        const existing = JSON.parse(existingRaw);
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
    ...DEFAULT_GAME_PROGRESS,
    ...preservedSettings,
  };

  if (typeof window !== 'undefined') {
    try {
      // Clean only game keys - NEVER call localStorage.clear()
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanProgress));
    } catch (e) {
      console.error('Failed to reset storage:', e);
    }
  }

  return cleanProgress;
}

export function resetProgress(): UserProgress {
  return resetGameProgress(true);
}
