import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';

const app = readFileSync('src/App.tsx', 'utf8');

test('Challenge reports every answer, right or wrong, back to App', () => {
  const source = readFileSync('src/pages/ChallengeScreen.tsx', 'utf8');
  const calls = source.match(/recordAnswerResult\([^)]*\);\s*\n\s*onUpdateProgress\(result\.updatedProgress\);/g) ?? [];
  assert.equal(calls.length, (source.match(/recordAnswerResult\(/g) ?? []).length);
  assert.equal(calls.length, 2);
});

test('"Next level" into level 3 or 6 returns to the trail so the chest is opened, not played', () => {
  const select = app.match(/const handleSelectLevel = [\s\S]*?\n  \};/)![0];
  assert.match(select, /if \(levelNumber === 3 \|\| levelNumber === 6\) \{\s*setCurrentScreen\('world_trail'\);\s*return;\s*\}/);
  assert(select.indexOf("'world_trail'") < select.indexOf("setCurrentScreen('level_play')"));
});

test('Parent Corner direct world jump always starts at level 1', () => {
  const direct = app.match(/onSelectDirectWorld=\{\(wId\) => \{[\s\S]*?\}\}/)![0];
  assert.match(direct, /setSelectedLevelNumber\(1\);\s*setCurrentScreen\('level_play'\)/);
});
