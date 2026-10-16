import assert from 'node:assert/strict';
import {test} from 'node:test';
import {generateQuestion} from '../src/utils/questionGenerator';
import type {WorldId} from '../src/types/math';

const WORLDS: WorldId[] = ['world_1_counting', 'world_2_merge', 'world_3_add_10', 'world_4_make_10', 'world_5_split', 'world_6_over_10'];

for (const world of WORLDS) test(`every ${world} question is solvable and its choices are fair`, () => {
  for (let i = 0; i < 2000; i++) {
    const q = generateQuestion(world);
    assert(q.choices.includes(q.answer), `answer missing: ${q.prompt}`);
    assert.equal(new Set(q.choices).size, q.choices.length, `duplicate choice: ${q.choices}`);
    assert(q.choices.every(c => Number.isInteger(c) && c >= 0), `bad choice ${q.choices}`);
    const a = q.operandA, b = q.operandB ?? 0;
    switch (q.type) {
      case 'count': assert(a >= 1 && a <= 10 && q.answer === a); break;
      case 'merge': case 'add_basic': assert.equal(q.answer, a + b); assert(q.answer <= 10); break;
      case 'make_10': assert.equal(a + q.answer, 10); break;
      case 'split': assert.equal(q.splitA! + q.answer, q.targetSplit); assert(q.answer >= 1); break;
      case 'over_10':
        assert.equal(q.answer, a + b); assert(q.answer > 10 && q.answer <= 18);
        assert.equal(a + q.needToMake10!, 10); assert.equal(q.needToMake10! + q.remainder!, b); assert(q.remainder! >= 1);
        assert(q.needToMake10! >= 1 && q.needToMake10! <= 4, 'step 1 offers only 1–4');
        break;
    }
    assert(!/undefined|NaN/.test(q.prompt + (q.hintExplanation ?? '')), q.prompt);
  }
});
