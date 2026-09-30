import assert from 'node:assert/strict';
import { test } from 'node:test';
import { QuestionSession } from '../src/utils/questionSession';

test('rapid answer events cannot schedule duplicate praise/rewards/transitions', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const session = new QuestionSession();
  session.begin();
  let rewarded = 0, spoken = 0, advanced = 0;
  const answer = () => {
    if (!session.tryAnswer()) return;
    rewarded++;
    session.once('ANSWER_CORRECT', () => spoken++);
    session.schedule(() => advanced++, 1200);
  };
  answer(); answer(); answer();
  t.mock.timers.tick(1200);
  assert.deepEqual({ rewarded, spoken, advanced }, { rewarded: 1, spoken: 1, advanced: 1 });
});

test('one question event speaks once; the next question may use the same event', () => {
  const session = new QuestionSession();
  let count = 0;
  session.begin();
  session.once('QUESTION_CHANGED', () => count++);
  session.once('QUESTION_CHANGED', () => count++);
  assert.equal(count, 1);
  session.begin();
  session.once('QUESTION_CHANGED', () => count++);
  assert.equal(count, 2);
});

test('question change/unmount clears pending speech and transition timers', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const session = new QuestionSession();
  session.begin();
  let oldEvents = 0, cleanups = 0;
  session.ownSpeech(() => cleanups++);
  session.schedule(() => oldEvents++, 800);
  session.begin();
  t.mock.timers.tick(1000);
  assert.equal(oldEvents, 0);
  assert.equal(cleanups, 1);
  session.schedule(() => oldEvents++, 700);
  session.dispose();
  t.mock.timers.tick(1000);
  assert.equal(oldEvents, 0);
});

test('a new answer cancels the previous attempt delayed hint', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const session = new QuestionSession();
  session.begin();
  assert(session.tryAnswer());
  session.schedule(() => session.releaseAnswer(), 700);
  let hints = 0;
  session.schedule(() => hints++, 800);
  t.mock.timers.tick(700);
  assert(session.tryAnswer());
  t.mock.timers.tick(200);
  assert.equal(hints, 0);
});
