import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { ALL_WORLDS, INITIAL_PROGRESS, STORAGE_KEY, LEGACY_STORAGE_KEY, loadProgress, recordChestOpen, recordLevelCompletion } from '../src/utils/storage';
import { ALL_PLUSH_FRIENDS } from '../src/data/plushFriends';
import type { UserProgress, WorldId } from '../src/types/math';

const stored = new Map<string, string>();
Object.assign(globalThis, {
  window: {},
  localStorage: { getItem: (key: string) => stored.get(key) ?? null, setItem: (key: string, value: string) => stored.set(key, value) },
});
const fresh = () => structuredClone(INITIAL_PROGRESS);
const currentLevel = (p: UserProgress, world: WorldId) =>
  Array.from({ length: 8 }, (_, i) => i + 1).find(level => !p.worldLevelsProgress[world].completedLevels.includes(level));
beforeEach(() => stored.clear());

for (const world of ALL_WORLDS) {
  for (const checkpoint of [3, 6]) {
    test(`${world.id}: chest ${checkpoint} opens the next level and survives refresh`, () => {
      let p = fresh();
      for (let level = 1; level < checkpoint; level++) p = recordLevelCompletion(p, world.id, level, 3).updatedProgress;
      const before = structuredClone(p);
      const chest = recordChestOpen(p, `chest_${world.id}_lvl_${checkpoint}`);
      assert.equal(currentLevel(chest.updatedProgress, world.id), checkpoint + 1);
      assert.equal(chest.updatedProgress.totalStars, before.totalStars + 3);
      assert.equal(chest.updatedProgress.xp, before.xp + 50);
      assert.deepEqual(p, before, 'must not mutate the caller save');
      const friend = ALL_PLUSH_FRIENDS.find(f => f.worldId === world.id && f.requiredLevel === checkpoint);
      if (friend) {
        assert(chest.updatedProgress.unlockedPlushFriends.includes(friend.id));
        assert(chest.updatedProgress.claimedCheckpointRewards.includes(friend.checkpointId));
      }
      const reloaded = loadProgress();
      const repeated = recordChestOpen(reloaded, `chest_${world.id}_lvl_${checkpoint}`);
      assert.equal(repeated.starsBonus, 0);
      assert.equal(repeated.xpBonus, 0);
      assert.equal(repeated.reward, null);
      assert.deepEqual(repeated.updatedProgress, reloaded);
      if (friend) assert.equal(reloaded.claimedCheckpointRewards.filter(id => id === friend.checkpointId).length, 1);
    });
  }
}

for (const key of [STORAGE_KEY, LEGACY_STORAGE_KEY]) {
  test(`${key}: repair old opened checkpoints without changing earned rewards or settings`, () => {
    const p = fresh();
    p.worldLevelsProgress.world_1_counting = { completedLevels: [1, 2, 4, 5], levelStars: { 1: 3, 2: 2, 4: 1, 5: 3 } };
    p.openedChests = ['chest_world_1_counting_lvl_3', 'chest_world_1_counting_lvl_6'];
    p.totalStars = 20;
    p.xp = 123;
    p.childNickname = 'Bé An';
    p.speechEnabled = false;
    p.selectedCompanionId = 'existing-companion';
    stored.set(key, JSON.stringify(p));
    stored.set('unrelated', 'keep');
    const repaired = loadProgress();
    assert.equal(currentLevel(repaired, 'world_1_counting'), 7);
    assert.equal(repaired.totalStars, 20);
    assert.equal(repaired.xp, 123);
    assert.deepEqual(repaired.worldLevelsProgress.world_1_counting.levelStars, p.worldLevelsProgress.world_1_counting.levelStars);
    assert.deepEqual(repaired.unlockedAccessories, p.unlockedAccessories);
    assert.equal(repaired.childNickname, p.childNickname);
    assert.equal(repaired.speechEnabled, false);
    assert.equal(repaired.selectedCompanionId, 'existing-companion');
    assert.equal(repaired.gameProgressVersion, 2);
    assert.equal(stored.get('unrelated'), 'keep');
    assert.deepEqual(loadProgress(), repaired, 'repair must be idempotent');
  });
}

test('a plush already earned by playing level 3 is not granted again by its chest', () => {
  const played = recordLevelCompletion(fresh(), 'world_1_counting', 3, 3).updatedProgress;
  const chest = recordChestOpen(played, 'chest_world_1_counting_lvl_3').updatedProgress;
  assert.deepEqual(chest.claimedCheckpointRewards, played.claimedCheckpointRewards);
  assert.deepEqual(chest.unlockedPlushFriends, played.unlockedPlushFriends);
});
