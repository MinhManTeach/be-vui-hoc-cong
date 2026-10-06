import type { Question } from '../types/math';

export function tenFrameHintPlan(q: Question, step: 1 | 2 | 3 = 1) {
  if (!['add_basic', 'make_10', 'over_10'].includes(q.type) || q.type === 'over_10' && step !== 1) return null;
  const makeTen = q.type !== 'add_basic';
  const count = makeTen ? 10 - q.operandA : q.operandB ?? 0;
  const additionCount = Math.max(0, Math.min(10 - q.operandA, count));
  return {
    additionCount,
    label: makeTen ? `Đã có ${q.operandA} • Thêm mấy để đủ 10?` : `Đã có ${q.operandA} ⭐ • Thêm ${additionCount} ⭐`,
    instruction: makeTen ? `Thêm ${additionCount} ngôi sao vào ${additionCount} ô đánh dấu để đủ 10 nhé!` : `Thêm ${additionCount} ngôi sao vào ${additionCount} ô đánh dấu nhé!`,
  };
}
export function tenFrameHintTargets(initial: number, addition: number, active: boolean): number[] {
  if (!active || !Number.isInteger(initial) || !Number.isInteger(addition) || initial < 0 || initial > 10 || addition < 0) return [];
  return Array.from({ length: Math.min(addition, 10 - initial) }, (_, i) => initial + i + 1);
}
export function activateTenFrameHint(currentKey: string | null, questionKey: string): string { return currentKey === questionKey ? currentKey : questionKey; }
export function isTenFrameHintActive(hintKey: string | null, questionKey: string): boolean { return hintKey === questionKey; }
