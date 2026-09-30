import { ItemTheme, Question, WorldId } from '../types/math';

const THEMES: ItemTheme[] = ['apple', 'star', 'fish', 'balloon', 'car', 'rabbit', 'butterfly', 'flower', 'strawberry'];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Generate distinct distractors around the correct answer
function generateChoices(correctAnswer: number, count: number = 3, minAllowed: number = 1, maxAllowed: number = 20): number[] {
  const choices = new Set<number>([correctAnswer]);
  
  const potentialOffsets = [-1, 1, -2, 2, -3, 3, -4, 4];
  const shuffledOffsets = shuffle(potentialOffsets);

  for (const offset of shuffledOffsets) {
    if (choices.size >= count) break;
    const candidate = correctAnswer + offset;
    if (candidate >= minAllowed && candidate <= maxAllowed && candidate !== correctAnswer) {
      choices.add(candidate);
    }
  }

  // Fallback if needed
  let fallback = minAllowed;
  while (choices.size < count) {
    if (!choices.has(fallback)) {
      choices.add(fallback);
    }
    fallback++;
  }

  return shuffle(Array.from(choices));
}

export function generateQuestion(worldId: WorldId): Question {
  const id = `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const itemTheme = pickRandom(THEMES);

  switch (worldId) {
    case 'world_1_counting': {
      // Numbers 1 to 10
      const count = randomInt(1, 10);
      const choices = generateChoices(count, 3, 1, 10);
      
      const themeNamesVi: Record<ItemTheme, string> = {
        apple: 'quả táo',
        star: 'ngôi sao',
        fish: 'chú cá',
        balloon: 'quả bóng bay',
        car: 'chiếc ô tô',
        rabbit: 'bạn thỏ',
        butterfly: 'chú bướm',
        flower: 'bông hoa',
        strawberry: 'quả dâu',
      };

      return {
        id,
        worldId,
        type: 'count',
        prompt: `Có bao nhiêu ${themeNamesVi[itemTheme]}?`,
        operandA: count,
        answer: count,
        choices,
        itemTheme,
        hintExplanation: `Con hãy chạm vào từng hình để đếm: 1, 2, 3... nhé! Có tất cả ${count} hình.`,
      };
    }

    case 'world_2_merge': {
      // Group A + Group B <= 10
      const a = randomInt(1, 5);
      const b = randomInt(1, Math.min(5, 10 - a));
      const answer = a + b;
      const choices = generateChoices(answer, 3, 2, 10);

      return {
        id,
        worldId,
        type: 'merge',
        prompt: `Có ${a} thêm ${b}. Có tất cả bao nhiêu?`,
        operandA: a,
        operandB: b,
        answer,
        choices,
        itemTheme,
        hintExplanation: `Gộp nhóm ${a} và nhóm ${b} lại: ${a} + ${b} = ${answer}!`,
      };
    }

    case 'world_3_add_10': {
      // Addition within 10
      const a = randomInt(1, 7);
      const b = randomInt(1, 10 - a);
      const answer = a + b;
      const choices = generateChoices(answer, 3, 2, 10);

      return {
        id,
        worldId,
        type: 'add_basic',
        prompt: `Tính: ${a} + ${b} = ?`,
        operandA: a,
        operandB: b,
        answer,
        choices,
        itemTheme,
        hintExplanation: `Đếm tiếp từ ${a}: thêm ${b} bước nữa là được ${answer}!`,
      };
    }

    case 'world_4_make_10': {
      // Making 10: 1+9, 2+8, 3+7, 4+6, 5+5, 6+4, 7+3, 8+2, 9+1
      const a = randomInt(1, 9);
      const answer = 10 - a;
      const choices = generateChoices(answer, 3, 1, 9);

      return {
        id,
        worldId,
        type: 'make_10',
        prompt: `${a} cần thêm mấy để thành 10?`,
        operandA: a,
        operandB: answer,
        answer,
        choices,
        itemTheme,
        hintExplanation: `Đếm thêm từ ${a} đến 10 cần đúng ${answer} bạn nữa!`,
      };
    }

    case 'world_5_split': {
      // Split number (3 to 9) into 2 parts
      const target = randomInt(3, 9);
      const splitA = randomInt(1, target - 1);
      const splitB = target - splitA;

      return {
        id,
        worldId,
        type: 'split',
        prompt: `Tách ${target} quả vào hai giỏ: giỏ thứ nhất có ${splitA}, giỏ thứ hai có mấy?`,
        operandA: target,
        splitA,
        splitB,
        answer: splitB,
        choices: generateChoices(splitB, 3, 1, target),
        itemTheme,
        targetSplit: target,
        hintExplanation: `Vì ${splitA} + ${splitB} = ${target}, nên trong giỏ còn lại có ${splitB} quả!`,
      };
    }

    case 'world_6_over_10': {
      // Addition over 10 using the "Make 10 First" strategy
      // Supported: 9+2, 9+4, 9+6, 8+3, 8+5, 8+7, 7+4, 7+5, 7+6, 6+5, 6+7
      const pairs = [
        { a: 9, b: 2 },
        { a: 9, b: 3 },
        { a: 9, b: 4 },
        { a: 9, b: 5 },
        { a: 9, b: 6 },
        { a: 8, b: 3 },
        { a: 8, b: 4 },
        { a: 8, b: 5 },
        { a: 8, b: 6 },
        { a: 8, b: 7 },
        { a: 7, b: 4 },
        { a: 7, b: 5 },
        { a: 7, b: 6 },
        { a: 6, b: 5 },
        { a: 6, b: 7 },
      ];
      const selected = pickRandom(pairs);
      const a = selected.a;
      const b = selected.b;
      const needToMake10 = 10 - a;
      const remainder = b - needToMake10;
      const answer = a + b;
      const choices = generateChoices(answer, 4, 11, 18);

      return {
        id,
        worldId,
        type: 'over_10',
        prompt: `${a} + ${b} = ?`,
        operandA: a,
        operandB: b,
        needToMake10,
        remainder,
        answer,
        choices,
        itemTheme,
        hintExplanation: `Con hãy thử lấy ${needToMake10} từ số ${b} để giúp số ${a} tạo thành 10 nhé. Ta có 10 + ${remainder} = ${answer}!`,
      };
    }
  }
}

// Teacher mode test helper to verify make-10 calculation strategy
export function verifyMake10Strategy(a: number, b: number): {
  a: number;
  b: number;
  needToMake10: number;
  remainder: number;
  answer: number;
  stepText: string;
} {
  const needToMake10 = 10 - a;
  const remainder = b - needToMake10;
  const answer = a + b;
  return {
    a,
    b,
    needToMake10,
    remainder,
    answer,
    stepText: `${a} + ${b} = ${a} + ${needToMake10} + ${remainder} = 10 + ${remainder} = ${answer}`,
  };
}
