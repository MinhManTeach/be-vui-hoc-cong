import type { Question, WorldId } from "../../types/math";

/** Reproducible from the durable slot ID, including after a reload. */
export function dailyQuestion(worldId: WorldId, id: string): Question {
  let seed = 0;
  for (const char of id)
    seed = (Math.imul(seed, 31) + char.charCodeAt(0)) >>> 0;
  const a = 1 + (seed % 5);
  const b = 1 + ((seed >>> 4) % 4);
  const base = { id, worldId, itemTheme: "apple" as const };
  let q: Omit<Question, "choices">;
  switch (worldId) {
    case "world_1_counting": {
      const n = 1 + (seed % 10);
      q = {
        ...base,
        type: "count",
        operandA: n,
        answer: n,
        prompt: "Có bao nhiêu quả táo?",
        hintExplanation: "Con chạm từng quả táo để đếm nhé!",
      };
      break;
    }
    case "world_2_merge":
    case "world_3_add_10":
      q = {
        ...base,
        type: worldId === "world_2_merge" ? "merge" : "add_basic",
        operandA: a,
        operandB: b,
        answer: a + b,
        prompt: `Có ${a} quả táo, thêm ${b} quả. Có tất cả bao nhiêu?`,
        hintExplanation: `Con đếm nhóm ${a} quả rồi đếm tiếp ${b} quả nhé!`,
      };
      break;
    case "world_4_make_10":
      q = {
        ...base,
        type: "make_10",
        operandA: a,
        operandB: 10 - a,
        answer: 10 - a,
        prompt: `${a} cần thêm mấy để thành 10?`,
        hintExplanation: `Con đếm thêm từ ${a} đến 10 nhé!`,
      };
      break;
    case "world_5_split":
      q = {
        ...base,
        type: "split",
        operandA: a + b,
        targetSplit: a + b,
        splitA: a,
        splitB: b,
        answer: b,
        prompt: `Tách ${a + b} quả vào hai giỏ. Một giỏ có ${a}, giỏ kia có mấy?`,
        hintExplanation: `Con đếm ${a + b} quả, dành ${a} quả cho giỏ đầu nhé!`,
      };
      break;
    case "world_6_over_10": {
      const x = 6 + (seed % 4);
      const y = 11 - x + ((seed >>> 4) % 3);
      q = {
        ...base,
        type: "over_10",
        operandA: x,
        operandB: y,
        answer: x + y,
        needToMake10: 10 - x,
        remainder: y - (10 - x),
        prompt: `${x} thêm ${y} bằng bao nhiêu?`,
        hintExplanation: `Thêm ${10 - x} vào ${x} để đủ 10, rồi thêm ${y - (10 - x)} nữa nhé!`,
      };
      break;
    }
  }
  const max = worldId === "world_6_over_10" ? 20 : 10;
  const choices = [q.answer];
  for (let offset = 1; choices.length < 3; offset++)
    for (const n of [q.answer - offset, q.answer + offset])
      if (n >= 1 && n <= max && choices.length < 3) choices.push(n);
  const rotate = seed % 3;
  return {
    ...q,
    choices: [...choices.slice(rotate), ...choices.slice(0, rotate)],
  };
}
