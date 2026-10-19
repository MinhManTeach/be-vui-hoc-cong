import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {generateCarrotRound} from '../src/pages/games/MiniGameRabbitCarrot';

test('carrot game does not always place the right answer between the two wrong ones', () => {
  let notMiddle = 0;
  for (let i = 0; i < 200; i++) {
    const {answer, choices} = generateCarrotRound();
    assert.equal(new Set(choices).size, 3);
    assert(choices.includes(answer));
    const sorted = [...choices].sort((x, y) => x - y);
    if (sorted[1] !== answer) notMiddle++;
  }
  assert(notMiddle > 0);
});

test('carrot and train games ignore taps while the right answer is being celebrated', () => {
  for (const file of ['src/pages/games/MiniGameRabbitCarrot.tsx', 'src/pages/games/MiniGameTrain10.tsx']) {
    const source = readFileSync(file, 'utf8');
    assert.match(source, /const handle\w+ = \(\w+: number\) => \{\s*if \(locked\.current\) return;/, file);
    assert.match(source, /locked\.current = true;[\s\S]*?recordAnswerResult\([\s\S]*?setTimeout\(\(\) => \{\s*locked\.current = false;/, file);
  }
});
