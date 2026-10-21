import assert from 'node:assert/strict';
import { test } from 'node:test';
import { INITIAL_PROGRESS, getCurrentWorldId } from '../src/utils/storage';
import type { UserProgress, WorldId } from '../src/types/math';

const fresh = () => structuredClone(INITIAL_PROGRESS);
const finish = (p: UserProgress, world: WorldId) => {
  p.worldLevelsProgress[world] = { completedLevels: [1, 2, 3, 4, 5, 6, 7, 8], levelStars: {}, bossCompleted: true };
};

test('new child: hero stands on world 1', () => {
  assert.equal(getCurrentWorldId(fresh()), 'world_1_counting');
});

test('hero never stands on a locked world', () => {
  // Bug report: with worlds 1-4 open, the hero sat on locked world 5 ("Cần 28 sao").
  const p = fresh();
  p.unlockedWorlds = ['world_1_counting', 'world_2_merge', 'world_3_add_10', 'world_4_make_10'];
  for (const w of ['world_1_counting', 'world_2_merge', 'world_3_add_10'] as WorldId[]) finish(p, w);
  p.worldLevelsProgress.world_4_make_10.completedLevels = [1, 2];
  assert.equal(getCurrentWorldId(p), 'world_4_make_10');
});

test('hero stays on the unfinished world even if stars opened the next one early', () => {
  const p = fresh();
  p.unlockedWorlds = ['world_1_counting', 'world_2_merge'];
  p.worldLevelsProgress.world_1_counting.completedLevels = [1, 2, 3, 4, 5];
  assert.equal(getCurrentWorldId(p), 'world_1_counting');
});

test('every open world finished: hero waits on the last open world', () => {
  const p = fresh();
  p.unlockedWorlds = ['world_1_counting', 'world_2_merge'];
  finish(p, 'world_1_counting');
  finish(p, 'world_2_merge');
  assert.equal(getCurrentWorldId(p), 'world_2_merge');
});

test('unlock order in the save does not matter, map order does', () => {
  const p = fresh();
  p.unlockedWorlds = ['world_3_add_10', 'world_1_counting', 'world_2_merge'];
  finish(p, 'world_1_counting');
  assert.equal(getCurrentWorldId(p), 'world_2_merge');
});
