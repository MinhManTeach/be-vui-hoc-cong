import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {REWARDS_CATALOG} from '../src/utils/rewards';
import {INITIAL_PROGRESS, migrateProgress, recordChestOpen, recordLevelCompletion} from '../src/utils/storage';
import {availableStars, buyItem, EMPTY_SLOT, isOwned, nextGoal, syncEarnedBadges, toggleWearable} from '../src/domain/shop/shop';
import {BunnyCharacter} from '../src/components/BunnyCharacter';
import type {UserProgress} from '../src/types/math';

const stored = new Map<string, string>();
Object.assign(globalThis, {window: {}, localStorage: {getItem: (k: string) => stored.get(k) ?? null, setItem: (k: string, v: string) => stored.set(k, v), removeItem: (k: string) => stored.delete(k)}});
const fresh = (stars = 0): UserProgress => ({...structuredClone(INITIAL_PROGRESS), totalStars: stars});

test('starter outfit is owned and free; everything else costs stars', () => {
  const p = fresh();
  for (const id of ['shirt_sky', 'backpack_yellow', 'item_carrot']) assert(isOwned(p, REWARDS_CATALOG.find(i => i.id === id)!));
  for (const item of REWARDS_CATALOG.filter(i => i.type !== 'badge' && i.price > 0)) assert.equal(isOwned(p, item), false, item.id);
});

test('buying spends stars once, owns and wears the item, keeps totalStars for world unlocks', () => {
  const p = fresh(10);
  const r = buyItem(p, 'hat_bow');
  assert(r.ok);
  assert.equal(r.progress.totalStars, 10);
  assert.equal(availableStars(r.progress), 7);
  assert(r.progress.unlockedAccessories.includes('hat_bow'));
  assert.equal(r.progress.equippedAccessories.hat, 'hat_bow');
  const again = buyItem(r.progress, 'hat_bow');
  assert.deepEqual(again, {ok: false, reason: 'owned'});
  assert.equal(availableStars(r.progress), 7);
});

test('cannot buy without enough stars and is told how many are missing', () => {
  assert.deepEqual(buyItem(fresh(2), 'hat_crown'), {ok: false, reason: 'not_enough', missing: 16});
  assert.deepEqual(buyItem(fresh(99), 'nope'), {ok: false, reason: 'unknown'});
});

test('badges are never for sale; finishing a world boss awards its badge', () => {
  assert.deepEqual(buyItem(fresh(99), 'badge_master_10'), {ok: false, reason: 'not_for_sale'});
  const p = fresh();
  p.worldLevelsProgress.world_4_make_10.bossCompleted = true;
  const {progress, newBadges} = syncEarnedBadges(p);
  assert.deepEqual(newBadges, ['badge_master_10']);
  assert(isOwned(progress, REWARDS_CATALOG.find(i => i.id === 'badge_master_10')!));
  assert.equal(isOwned(progress, REWARDS_CATALOG.find(i => i.id === 'badge_cosmic')!), false);
});

test('boss level completion awards the badge through the real progression path', () => {
  const {updatedProgress, newlyUnlockedReward} = recordLevelCompletion(fresh(), 'world_1_counting', 8, 3, true);
  assert.equal(newlyUnlockedReward, 'badge_counting_star');
  assert(updatedProgress.unlockedAccessories.includes('badge_counting_star'));
});

test('stars alone no longer hand out shop items', () => {
  const {updatedProgress} = recordLevelCompletion(fresh(40), 'world_1_counting', 1, 3);
  assert.equal(updatedProgress.unlockedAccessories.includes('hat_crown'), false);
});

test('a chest gift is a shop item, never a badge or something already owned', () => {
  for (let i = 0; i < 30; i++) {
    const {reward} = recordChestOpen(fresh(), `chest_world_1_counting_lvl_3_${i}`);
    const item = REWARDS_CATALOG.find(x => x.id === reward)!;
    assert(item && item.type !== 'badge' && item.price > 0, String(reward));
  }
});

test('taking off the carrot keeps it off (default outfit does not come back)', () => {
  const p = fresh();
  const off = toggleWearable(p.equippedAccessories, {type: 'item', id: 'item_carrot'});
  assert.equal(off.item, EMPTY_SLOT);
  const html = renderToStaticMarkup(createElement(BunnyCharacter, {...off, showSpeechBubble: false}));
  assert(!html.includes('data-wearable-id="item_carrot"'));
  assert.equal(toggleWearable(off, {type: 'item', id: 'item_carrot'}).item, 'item_carrot');
});

test('saves keep spent stars and never let spending exceed earnings', () => {
  assert.equal(migrateProgress({totalStars: 12, spentStars: 5}).spentStars, 5);
  assert.equal(migrateProgress({totalStars: 3, spentStars: 50}).spentStars, 3);
  assert.equal(migrateProgress({totalStars: 3}).spentStars, 0);
});

test('next goal is the cheapest item still out of reach', () => {
  const goal = nextGoal(fresh(3))!;
  assert.equal(goal.item.price, 4);
  assert.equal(goal.missing, 1);
});
