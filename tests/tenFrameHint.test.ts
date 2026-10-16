import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { InteractiveToyTenFrame } from '../src/components/InteractiveToyTenFrame';
import { activateTenFrameHint, isTenFrameHintActive, tenFrameHintPlan, tenFrameHintTargets } from '../src/utils/tenFrameHint';
import type { Question } from '../src/types/math';

const question = (a: number, b: number): Question => ({ id: `${a}-${b}`, worldId: 'world_3_add_10', type: 'add_basic', operandA: a, operandB: b, answer: a + b, choices: [a + b], itemTheme: 'star', prompt: `${a} + ${b} = ?` });
function frame(q: Question, active: boolean) {
  const plan = tenFrameHintPlan(q)!;
  return renderToStaticMarkup(createElement(InteractiveToyTenFrame, { initialCountA: q.operandA, additionCount: plan.additionCount, label: plan.label, hintInstruction: plan.instruction, highlightEmptySlots: active, itemIcon: '⭐' }));
}
const markedCells = (html: string) => [...html.matchAll(/data-hint-target="true" aria-label="Ô (\d+), thêm vào đây"/g)].map(match => Number(match[1]));
for (const [a, b, expected] of [[5, 3, [6, 7, 8]], [4, 2, [5, 6]], [6, 3, [7, 8, 9]], [8, 2, [9, 10]]] as const) {
  test(`${a}+${b}: domain hint targets exactly ${expected.join(',')}`, () => {
    const q = question(a, b), plan = tenFrameHintPlan(q)!;
    assert.equal(plan.additionCount, b); assert.deepEqual(tenFrameHintTargets(a, plan.additionCount, true), [...expected]);
  });
  test(`${a}+${b}: rendered ten-frame marks only target cells and leaves all ten cells visible`, () => {
    const html = frame(question(a, b), true);
    assert.deepEqual(markedCells(html), [...expected]);
    assert.equal([...html.matchAll(/aria-label="Ô \d+,/g)].length, 10);
    assert.equal([...html.matchAll(/class="ten-frame-hint-marker"/g)].length, b);
    assert.ok(html.includes(`Thêm ${b} ngôi sao vào ${b} ô đánh dấu nhé!`));
  });
}
test('Inactive hint has no highlighted cells or hint marker', () => {
  const html = frame(question(5, 3), false);
  assert.deepEqual(markedCells(html), []); assert.ok(!html.includes('ten-frame-hint-marker'));
  assert.ok(html.includes('Đã có 5 ⭐ • Thêm 3 ⭐')); assert.ok(!html.includes('Còn thiếu 5'));
});
test('Question change clears old hint immediately, even with identical operands', () => {
  const hint = activateTenFrameHint(null, 'question-a:1');
  assert.equal(isTenFrameHintActive(hint, 'question-b:1'), false);
  assert.equal(isTenFrameHintActive(null, 'question-b:1'), false);
  assert.deepEqual(markedCells(frame(question(5, 3), isTenFrameHintActive(hint, 'question-b:1'))), []);
});
test('Repeated hint activation keeps the same state and stable target markup', () => {
  let key = activateTenFrameHint(null, 'same:1'); const before = frame(question(5, 3), true);
  for (let i = 0; i < 20; i++) assert.equal(activateTenFrameHint(key, 'same:1'), key);
  assert.equal(frame(question(5, 3), true), before); assert.equal(markedCells(before).length, 3);
});
test('Make-ten retains the missing-to-ten step without revealing its answer in the inactive label', () => {
  const q = { ...question(5, 5), type: 'make_10' as const, worldId: 'world_4_make_10' as const };
  const plan = tenFrameHintPlan(q)!;
  assert.equal(plan.additionCount, 5); assert.equal(plan.label, 'Đã có 5 • Thêm mấy để đủ 10?');
  assert.deepEqual(tenFrameHintTargets(5, plan.additionCount, true), [6, 7, 8, 9, 10]); assert.ok(plan.instruction.includes('để đủ 10'));
});
test('Cross-ten hints only complete the first ten-frame; later steps do not reuse old targets', () => {
  const q = { ...question(8, 5), type: 'over_10' as const, worldId: 'world_6_over_10' as const, needToMake10: 2, remainder: 3 };
  assert.deepEqual(tenFrameHintTargets(8, tenFrameHintPlan(q, 1)!.additionCount, true), [9, 10]);
  assert.equal(tenFrameHintPlan(q, 2), null); assert.equal(tenFrameHintPlan(q, 3), null);
  assert.equal(isTenFrameHintActive('same:1', 'same:2'), false);
});
test('Reduced motion preserves static target markers, border and glow while disabling pulse', () => {
  const css = readFileSync(new URL('../src/components/tenFrameHint.css', import.meta.url), 'utf8');
  assert.match(css, /border:\s*3px solid/); assert.match(css, /box-shadow:/);
  assert.match(css, /animation:\s*ten-frame-hint-pulse 650ms ease-in-out 3;/);
  assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*animation:\s*none;[\s\S]*transform:\s*none;/);
  const html = frame(question(5, 3), true); assert.deepEqual(markedCells(html), [6, 7, 8]);
  assert.equal([...html.matchAll(/class="ten-frame-hint-marker"/g)].length, 3);
});
test('Invalid or overflowing counts cannot mark cells outside the ten-frame', () => {
  assert.deepEqual(tenFrameHintTargets(8, 9, true), [9, 10]);
  assert.deepEqual(tenFrameHintTargets(11, 2, true), []); assert.deepEqual(tenFrameHintTargets(5, -1, true), []);
});
