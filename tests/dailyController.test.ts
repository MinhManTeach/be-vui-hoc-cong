import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { DailyController } from "../src/domain/retention/dailyController";
import { dailyQuestion } from "../src/domain/retention/dailyQuestion";
import { WORLD_ORDER } from "../src/domain/retention/types";
import {
  INITIAL_PROGRESS,
  loadProgress,
  saveProgress,
  STORAGE_KEY,
} from "../src/utils/storage";
import { addPlayedMinute } from "../src/domain/playtime/playtime";
import type { UserProgress } from "../src/types/math";

const stored = new Map<string, string>();
let quota = false;
Object.assign(globalThis, {
  window: {},
  localStorage: {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (quota) throw new Error("quota");
      stored.set(key, value);
    },
    removeItem: (key: string) => stored.delete(key),
  },
});
beforeEach(() => {
  stored.clear();
  quota = false;
});
test('Missing adventure with durable reward receipt fails safely without replay', () => {
  const c = start(); complete(c); c.claim();
  const p = structuredClone(c.progress); p.retention!.dailyAdventure = null;
  stored.set(STORAGE_KEY, JSON.stringify(p));
  assert.throws(() => start(p), /adventure unavailable/);
  assert.equal(JSON.parse(stored.get(STORAGE_KEY)!).retention.rewardReceipts.length, 1);
});
const clock = { day: () => "2026-10-06" };
function start(
  p = structuredClone(INITIAL_PROGRESS),
  publish: (p: UserProgress) => void = () => {},
) {
  const c = new DailyController(p, publish, clock);
  c.enter();
  return c;
}
function solve(c: DailyController) {
  const q = c.question()!;
  assert.equal(c.answer(q.id, q.answer), "correct");
  return q;
}
function learn(c: DailyController) {
  c.open("learn");
  for (let i = 0; i < 5; i++) solve(c);
}
function play(c: DailyController) {
  c.open("play");
  for (let i = 0; i < 3; i++) solve(c);
}
function complete(c: DailyController) {
  learn(c);
  play(c);
  c.open("help");
  solve(c);
  solve(c);
}

test("Daily entry saves definition before publishing its snapshot", () => {
  const c = start(undefined, (p) =>
    assert.deepEqual(
      JSON.parse(stored.get(STORAGE_KEY)!).retention,
      p.retention,
    ),
  );
  assert.equal(c.task, "learn");
  assert.equal(c.adventure.taskProgress.learn, 0);
});
test("Daily resume preserves adventure and generated question", () => {
  const c = start();
  solve(c);
  const q = c.question();
  const r = start(loadProgress());
  assert.equal(r.adventure.adventureId, c.adventure.adventureId);
  assert.deepEqual(r.question(), q);
});
test("Reload after learning task moves to mini-game without replay", () => {
  const c = start();
  learn(c);
  const r = start(loadProgress());
  assert.equal(r.task, "play");
  assert.equal(r.open("learn"), false);
});
test("Reload inside mini-game resumes exact round and question", () => {
  const c = start();
  learn(c);
  c.open("play");
  solve(c);
  c.pause();
  const q = c.question();
  const r = start(loadProgress());
  assert.equal(r.progress.retention!.miniGameSession!.status, "paused");
  r.open("play");
  assert.deepEqual(r.question(), q);
  assert.equal(
    r.progress.retention!.miniGameSession!.completedRounds.length,
    1,
  );
});
test("Leaving a mini-game pauses it and rejects answers until resume", () => {
  const c = start();
  learn(c);
  c.open("play");
  const q = c.question()!;
  c.pause();
  assert.equal(c.answer(q.id, q.answer), "ignored");
  c.open("play");
  assert.equal(c.answer(q.id, q.answer), "correct");
});
test("Next task stays locked until current task completes", () => {
  const c = start();
  assert.equal(c.open("play"), false);
  assert.equal(c.open("help"), false);
  assert.equal(c.progress.retention!.miniGameSession, null);
});
test("Learning has exactly five successes; retry has no penalty", () => {
  const c = start();
  const q = c.question()!;
  assert.equal(c.answer(q.id, -1), "retry");
  assert.equal(c.adventure.taskProgress.learn, 0);
  learn(c);
  assert.equal(c.adventure.taskProgress.learn, 5);
  assert.equal(c.task, "play");
  assert.equal(c.progress.totalStars, 0);
  assert.equal(c.progress.xp, 0);
});
test("Duplicate answer event cannot complete the next question", () => {
  const c = start();
  const q = solve(c);
  assert.equal(c.answer(q.id, q.answer), "ignored");
  assert.equal(c.adventure.taskProgress.learn, 1);
});
test("Mini-game finishes at three rounds without endless mode", () => {
  const c = start();
  learn(c);
  play(c);
  const s = c.progress.retention!.miniGameSession!;
  assert.equal(s.status, "completed");
  assert.equal(s.roundCount, 3);
  assert.equal(s.completedRounds.length, 3);
  assert.equal(c.task, "help");
  assert.equal(c.open("play"), false);
});
test("Duplicate last round cannot count as a help question", () => {
  const c = start();
  learn(c);
  c.open("play");
  solve(c);
  solve(c);
  const q = solve(c);
  assert.equal(c.answer(q.id, q.answer), "ignored");
  assert.equal(c.adventure.taskProgress.help, 0);
});
test("Two skill-safe help interactions complete the adventure", () => {
  const c = start();
  complete(c);
  assert.equal(c.adventure.status, "completed");
  assert.equal(c.adventure.rewardState, "available");
  assert.equal(c.task, null);
});
test("Reward receipt is durable before reward UI receives state", () => {
  const c = start();
  complete(c);
  let published = false;
  const r = new DailyController(
    c.progress,
    (p) => {
      published = true;
      assert.deepEqual(
        JSON.parse(stored.get(STORAGE_KEY)!).retention.rewardReceipts,
        p.retention!.rewardReceipts,
      );
    },
    clock,
  );
  r.claim();
  assert.equal(published, true);
  assert.equal(r.adventure.status, "claimed");
});
test("Double chest clicks award a single receipt and sticker", () => {
  const c = start();
  complete(c);
  c.claim();
  c.claim();
  assert.equal(c.progress.retention!.rewardReceipts.length, 1);
  assert.equal(c.progress.retention!.stickers.length, 1);
});
test("Reload after reward animation starts keeps ownership and completion", () => {
  const c = start();
  complete(c);
  c.claim();
  const r = start(loadProgress());
  assert.equal(r.adventure.status, "claimed");
  assert.equal(r.task, null);
  assert.deepEqual(
    r.progress.retention!.stickers,
    c.progress.retention!.stickers,
  );
});
test("Reopening completed day cannot restart tasks or change rewards", () => {
  const c = start();
  complete(c);
  c.claim();
  const r = start(loadProgress());
  assert.equal(r.open("learn"), false);
  r.claim();
  assert.equal(r.progress.retention!.rewardReceipts.length, 1);
});
test("Missing or unavailable companion uses Bunny fallback", () => {
  const p = structuredClone(INITIAL_PROGRESS);
  p.selectedCompanionId = "plush_bear_honey";
  assert.equal(start(p).adventure.companionId, "bunny");
});
test("Owned selected companion is pinned without companion schema changes", () => {
  const p = structuredClone(INITIAL_PROGRESS);
  p.selectedCompanionId = "plush_bear_honey";
  p.unlockedPlushFriends = ["plush_bear_honey"];
  const c = start(p);
  assert.equal(c.adventure.companionId, "plush_bear_honey");
  assert.equal(c.progress.selectedCompanionId, p.selectedCompanionId);
});
test("Unlocked but unpractised worlds never enter Daily learning range", () => {
  const p = structuredClone(INITIAL_PROGRESS);
  p.unlockedWorlds = [...WORLD_ORDER];
  p.allUnlockedOverride = true;
  const c = start(p);
  assert.equal(c.adventure.learningWorldId, "world_1_counting");
  assert.equal(c.question()!.worldId, "world_1_counting");
});
test("Save failure publishes no success and leaves progress unchanged", () => {
  const c = start();
  const before = c.progress;
  quota = true;
  const q = c.question()!;
  assert.throws(() => c.answer(q.id, q.answer), /save failed/);
  assert.equal(c.progress, before);
  assert.equal(c.adventure.taskProgress.learn, 0);
});
test("Concurrent stale tab cannot overwrite latest progress", () => {
  const c = start();
  const stale = new DailyController(c.progress, () => {}, clock);
  solve(c);
  const q = stale.question()!;
  assert.throws(() => stale.answer(q.id, q.answer), /conflict/);
  assert.equal(loadProgress().retention!.dailyAdventure!.taskProgress.learn, 1);
});
for (const world of WORLD_ORDER)
  test(`Deterministic Daily questions stay within ${world} range`, () => {
    for (let slot = 0; slot < 100; slot++) {
      const id = `daily:2026-10-06:v1:learn:${slot}`;
      const q = dailyQuestion(world, id);
      assert.deepEqual(q, dailyQuestion(world, id));
      assert.equal(q.choices.length, 3);
      assert.equal(new Set(q.choices).size, 3);
      assert.ok(q.choices.includes(q.answer));
      assert.ok(
        q.choices.every(
          (n) => n >= 1 && n <= (world === "world_6_over_10" ? 20 : 10),
        ),
      );
      if (world === "world_6_over_10")
        assert.ok(q.answer > 10 && q.answer <= 20);
      else assert.ok(q.answer <= 10);
      if (q.type === "split") assert.equal(q.splitA! + q.answer, q.targetSplit);
      if (q.type === "make_10") assert.equal(q.operandA + q.answer, 10);
    }
  });

test('A play minute counted by App mid-adventure is not a save conflict and is kept', () => {
  const c = start();
  c.open("learn");
  const saved = JSON.parse(stored.get(STORAGE_KEY)!);
  assert.ok(saveProgress(addPlayedMinute(saved, clock.day())));
  solve(c);
  assert.equal(JSON.parse(stored.get(STORAGE_KEY)!).playTime.minutes, 1);
});
