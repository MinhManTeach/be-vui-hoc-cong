import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {toggleTap} from '../src/utils/tapCount';

test('tapping every one of 7 pictures counts exactly 7', () => {
  let tapped: number[] = [];
  for (let i = 0; i < 7; i++) tapped = toggleTap(tapped, i, 7);
  assert.equal(tapped.length, 7);
});

test('tapping a counted picture again un-counts it instead of adding more', () => {
  let tapped = toggleTap([], 2, 7);
  tapped = toggleTap(tapped, 2, 7);
  assert.deepEqual(tapped, []);
});

test('taps left over from a bigger previous question never push the count past the pictures shown', () => {
  // Câu trước có 9 hình, bé đã chạm hình số 8 và 9; câu này chỉ có 7 con cá.
  let tapped = [7, 8];
  for (let i = 0; i < 7; i++) tapped = toggleTap(tapped, i, 7);
  assert.equal(tapped.length, 7);
  assert.deepEqual(tapped, [0, 1, 2, 3, 4, 5, 6]);
});

test('every VisualCounters on a question screen is keyed by the question, so taps reset for each new question', () => {
  for (const file of ['src/pages/GameScreen.tsx', 'src/pages/ChallengeScreen.tsx', 'src/pages/DailyAdventureScreen.tsx']) {
    const uses = readFileSync(file, 'utf8').match(/<VisualCounters[\s\S]*?\/>/g) ?? [];
    assert(uses.length > 0, file);
    for (const use of uses) assert.match(use, /key=\{[^}]*\bq(uestion)?\.id\b/, `${file}: ${use}`);
  }
});
