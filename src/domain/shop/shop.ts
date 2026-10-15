import type { AccessoryType, BunnyAccessory, UserProgress, WorldId } from '../../types/math';
import { REWARDS_CATALOG } from '../../utils/rewards';

const ALL_WORLD_IDS: WorldId[] = ['world_1_counting', 'world_2_merge', 'world_3_add_10', 'world_4_make_10', 'world_5_split', 'world_6_over_10'];

/** Slots that always had something on: removing writes 'none' so the default outfit does not come back. */
export const EMPTY_SLOT = 'none';

export function findItem(id: string | undefined): BunnyAccessory | undefined {
  return REWARDS_CATALOG.find(item => item.id === id);
}

export function availableStars(progress: UserProgress): number {
  return Math.max(0, progress.totalStars - (progress.spentStars ?? 0));
}

export function isOwned(progress: UserProgress, item: BunnyAccessory): boolean {
  if (progress.allUnlockedOverride) return true;
  if (item.type === 'badge') return progress.unlockedAccessories.includes(item.id) || isBadgeEarned(progress, item);
  return item.price === 0 || progress.unlockedAccessories.includes(item.id);
}

function bossDone(progress: UserProgress, world: WorldId) {
  return progress.worldLevelsProgress[world]?.bossCompleted === true;
}

export function isBadgeEarned(progress: UserProgress, item: BunnyAccessory): boolean {
  if (item.type !== 'badge' || !item.earnedBy) return false;
  return item.earnedBy === 'all' ? ALL_WORLD_IDS.every(world => bossDone(progress, world)) : bossDone(progress, item.earnedBy);
}

/** Adds badges for finished worlds; returns the same object when nothing changed. */
export function syncEarnedBadges(progress: UserProgress): { progress: UserProgress; newBadges: string[] } {
  const newBadges = REWARDS_CATALOG
    .filter(item => item.type === 'badge' && isBadgeEarned(progress, item) && !progress.unlockedAccessories.includes(item.id))
    .map(item => item.id);
  if (newBadges.length === 0) return { progress, newBadges };
  return { progress: { ...progress, unlockedAccessories: [...progress.unlockedAccessories, ...newBadges] }, newBadges };
}

export type BuyResult =
  | { ok: true; progress: UserProgress; item: BunnyAccessory }
  | { ok: false; reason: 'unknown' | 'owned' | 'not_for_sale' | 'not_enough'; missing?: number };

/** Buying spends stars once, marks the item owned and puts it on Thỏ Bông. */
export function buyItem(progress: UserProgress, id: string): BuyResult {
  const item = findItem(id);
  if (!item) return { ok: false, reason: 'unknown' };
  if (item.type === 'badge') return { ok: false, reason: 'not_for_sale' };
  if (isOwned(progress, item)) return { ok: false, reason: 'owned' };
  const wallet = availableStars(progress);
  if (wallet < item.price) return { ok: false, reason: 'not_enough', missing: item.price - wallet };
  return {
    ok: true,
    item,
    progress: {
      ...progress,
      spentStars: (progress.spentStars ?? 0) + item.price,
      unlockedAccessories: [...progress.unlockedAccessories, item.id],
      equippedAccessories: { ...progress.equippedAccessories, [item.type]: item.id },
    },
  };
}

/** Wear an owned item, or take it off when it is already on. */
export function toggleWearable(equipped: UserProgress['equippedAccessories'], item: { type: AccessoryType; id: string }) {
  if (equipped[item.type] !== item.id) return { ...equipped, [item.type]: item.id };
  const keepsSlot = item.type === 'shirt' || item.type === 'backpack' || item.type === 'item';
  return { ...equipped, [item.type]: keepsSlot ? EMPTY_SLOT : undefined };
}

/** Cheapest item the child cannot afford yet, to show "còn thiếu X sao". */
export function nextGoal(progress: UserProgress): { item: BunnyAccessory; missing: number } | null {
  const wallet = availableStars(progress);
  const target = REWARDS_CATALOG
    .filter(item => item.type !== 'badge' && !isOwned(progress, item) && item.price > wallet)
    .sort((a, b) => a.price - b.price)[0];
  return target ? { item: target, missing: target.price - wallet } : null;
}
