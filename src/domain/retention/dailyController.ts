import type { Question, UserProgress } from "../../types/math";
import { dailyQuestion } from "./dailyQuestion";
import { commitRetentionUpdate } from "../../utils/storage";
import { deviceClock, type Clock } from "./clock";
import {
  applyDailyEvent,
  claimDailyReward,
  controlDailyMiniGame,
  ensureDailyAdventure,
  startDailyMiniGame,
} from "./dailyAdventure";
import type { TaskId } from "./types";

/** UI commands save synchronously before publishing feedback or navigating. */
export class DailyController {
  progress: UserProgress;
  private cached: Question | null = null;
  constructor(
    progress: UserProgress,
    private publish: (p: UserProgress) => void,
    private clock: Clock = deviceClock,
    private factory = dailyQuestion,
  ) {
    this.progress = progress;
  }
  private commit(update: (p: UserProgress) => UserProgress) {
    const next = commitRetentionUpdate(this.progress, update);
    this.progress = next;
    this.publish(next);
    return next;
  }
  enter() {
    const next = this.commit((p) => ensureDailyAdventure(p, this.clock));
    if (!next.retention?.dailyAdventure) throw new Error('Daily adventure unavailable; reload or recover the save');
    return next;
  }
  get adventure() {
    return this.progress.retention!.dailyAdventure!;
  }
  get task(): TaskId | null {
    return (
      (["learn", "play", "help"] as TaskId[]).find(
        (t) => !this.adventure.completedTaskIds.includes(t),
      ) ?? null
    );
  }
  open(task: TaskId): boolean {
    if (task !== this.task) return false;
    if (task === "play") {
      this.commit((p) =>
        startDailyMiniGame(p, `${this.adventure.adventureId}:game`),
      );
      this.commit((p) => controlDailyMiniGame(p, { type: "RESUME" }));
    }
    return true;
  }
  pause() {
    this.commit((p) => controlDailyMiniGame(p, { type: "PAUSE" }));
  }
  question(): Question | null {
    const task = this.task;
    if (!task) return null;
    const slot =
      task === "play"
        ? this.progress.retention!.miniGameSession?.roundId
        : this.adventure.taskProgress[task];
    if (slot === undefined) return null;
    const id = `${this.adventure.adventureId}:${task}:${slot}`;
    if (this.cached?.id !== id)
      this.cached = { ...this.factory(this.adventure.learningWorldId, id), id };
    return this.cached;
  }
  answer(questionId: string, answer: number): "correct" | "retry" | "ignored" {
    const q = this.question();
    const task = this.task;
    if (
      !q ||
      !task ||
      questionId !== q.id ||
      (task === "play" &&
        this.progress.retention!.miniGameSession?.status !== "active")
    )
      return "ignored";
    if (answer !== q.answer) return "retry";
    const a = this.adventure;
    this.commit((p) =>
      task === "play"
        ? applyDailyEvent(
            p,
            {
              type: "MiniGameRoundCompleted",
              adventureId: a.adventureId,
              sessionId: p.retention!.miniGameSession!.sessionId,
              roundId: p.retention!.miniGameSession!.roundId,
              worldId: q.worldId,
            },
            this.clock,
          )
        : applyDailyEvent(
            p,
            {
              type: "QuestionCompleted",
              adventureId: a.adventureId,
              taskId: task,
              questionId: q.id,
              worldId: q.worldId,
            },
            this.clock,
          ),
    );
    return "correct";
  }
  claim() {
    return this.commit(claimDailyReward);
  }
}
