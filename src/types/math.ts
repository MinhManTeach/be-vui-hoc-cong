import type { RetentionProgress } from '../domain/retention/types';

export type WorldId = 
  | 'world_1_counting' 
  | 'world_2_merge' 
  | 'world_3_add_10' 
  | 'world_4_make_10' 
  | 'world_5_split' 
  | 'world_6_over_10';

export type MiniGameId = 
  | 'game_carrot' 
  | 'game_bubble' 
  | 'game_train' 
  | 'game_apple_tree';

export type ItemTheme = 'apple' | 'star' | 'fish' | 'balloon' | 'car' | 'rabbit' | 'butterfly' | 'flower' | 'strawberry';

export interface Question {
  id: string;
  worldId: WorldId;
  type: 'count' | 'merge' | 'add_basic' | 'make_10' | 'split' | 'over_10';
  prompt: string;
  operandA: number;
  operandB?: number;
  answer: number;
  choices: number[];
  itemTheme: ItemTheme;
  hintExplanation?: string;
  // For split questions:
  targetSplit?: number;
  splitA?: number;
  splitB?: number;
  // For over 10:
  needToMake10?: number;
  remainder?: number;
}

export type AccessoryType = 'hat' | 'glasses' | 'shirt' | 'backpack' | 'item' | 'badge';

export interface BunnyAccessory {
  id: string;
  name: string;
  type: AccessoryType;
  emoji: string;
  unlockStars: number;
  description: string;
}

export interface WorldLevelData {
  completedLevels: number[];
  levelStars: Record<number, number>; // levelNumber -> stars (1-3)
  bossCompleted?: boolean;
}

export interface UserProgress {
  gameProgressVersion?: number;
  retention?: RetentionProgress;
  childNickname?: string;
  childAvatar?: string;
  currentLevel: number;
  totalStars: number;
  xp: number;
  playerLevel: number; // 1 to 6+
  unlockedWorlds: WorldId[];
  worldLevelsProgress: Record<WorldId, WorldLevelData>;
  openedChests: string[]; // list of chest IDs opened
  equippedAccessories: {
    hat?: string;
    glasses?: string;
    shirt?: string;
    backpack?: string;
    item?: string;
    badge?: string;
  };
  unlockedAccessories: string[];
  // Plush Friend Journey Fields
  unlockedPlushFriends: string[]; // List of plush friend IDs unlocked
  selectedCompanionId: string | null; // ID of active companion plush friend
  claimedCheckpointRewards: string[]; // List of checkpoint IDs already rewarded to prevent duplicates
  stats: {
    todayTimeMinutes: number;
    totalAnswered: number;
    totalCorrect: number;
    streak: number;
    bestStreak: number;
    categoryAccuracy: Record<WorldId, { answered: number; correct: number }>;
  };
  soundEnabled: boolean;
  speechEnabled: boolean;
  soundEffectsEnabled?: boolean;
  musicEnabled?: boolean;
  allUnlockedOverride?: boolean;
}
