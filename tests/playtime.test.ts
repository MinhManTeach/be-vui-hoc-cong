import assert from 'node:assert/strict';
import {test} from 'node:test';
import {INITIAL_PROGRESS, migrateProgress} from '../src/utils/storage';
import {addPlayedMinute, grantExtraMinutes, isTimeUp, normalizePlayTime, setDailyLimit, today} from '../src/domain/playtime/playtime';

const D1 = '2026-11-02', D2 = '2026-11-03';
const play = (p: any, n: number, day = D1) => { for (let i = 0; i < n; i++) p = addPlayedMinute(p, day); return p; };

test('no limit by default, minutes still counted', () => {
  const p = play(structuredClone(INITIAL_PROGRESS), 90);
  assert.equal(today(p, D1).minutes, 90);
  assert.equal(isTimeUp(p, D1), false);
});

test('limit reached shows the break; parent extension adds 10 minutes from now', () => {
  let p = setDailyLimit(structuredClone(INITIAL_PROGRESS), D1, 20);
  p = play(p, 19); assert.equal(isTimeUp(p, D1), false);
  p = play(p, 1); assert.equal(isTimeUp(p, D1), true);
  p = play(p, 5); // break screen stayed open
  p = grantExtraMinutes(p, D1); assert.equal(isTimeUp(p, D1), false);
  p = play(p, 9); assert.equal(isTimeUp(p, D1), false);
  p = play(p, 1); assert.equal(isTimeUp(p, D1), true);
});

test('a new day starts from zero and keeps the limit', () => {
  let p = play(setDailyLimit(structuredClone(INITIAL_PROGRESS), D1, 15), 30);
  assert.equal(isTimeUp(p, D2), false);
  p = addPlayedMinute(p, D2);
  assert.deepEqual(p.playTime, {day: D2, minutes: 1, limitMinutes: 15, extraMinutes: 0});
});

test('saved play time is validated', () => {
  assert.deepEqual(normalizePlayTime({day: 'x', minutes: -3, limitMinutes: 17}), {day: '', minutes: 0, limitMinutes: 0, extraMinutes: 0});
  assert.equal(migrateProgress({playTime: {day: D1, minutes: 12, limitMinutes: 30, extraMinutes: 0}}).playTime!.limitMinutes, 30);
});
