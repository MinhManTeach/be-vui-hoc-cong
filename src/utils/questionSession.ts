/** Owns one question's events, transitions and speech cleanup across React renders. */
export class QuestionSession {
  private generation = 0;
  private timers = new Set<ReturnType<typeof setTimeout>>();
  private events = new Set<string>();
  private speechCleanups = new Set<() => void>();
  private answerLocked = false;

  public begin() {
    this.dispose();
    this.events.clear();
    this.answerLocked = false;
  }

  public tryAnswer(): boolean {
    if (this.answerLocked) return false;
    this.clearTimers();
    this.answerLocked = true;
    return true;
  }

  public releaseAnswer() { this.answerLocked = false; }

  public once(event: string, action: () => void): boolean {
    if (this.events.has(event)) return false;
    this.events.add(event);
    action();
    return true;
  }

  public ownSpeech(cleanup: () => void) {
    // SpeechManager replaces playback. Keep prior ownership when a new call is deduped.
    this.speechCleanups.add(cleanup);
  }

  public schedule(action: () => void, delay: number) {
    const generation = this.generation;
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      if (generation === this.generation) action();
    }, delay);
    this.timers.add(timer);
    return timer;
  }

  private clearTimers() {
    this.generation++;
    this.timers.forEach(clearTimeout);
    this.timers.clear();
  }

  public dispose() {
    this.clearTimers();
    this.speechCleanups.forEach(cleanup => cleanup());
    this.speechCleanups.clear();
    this.answerLocked = true;
  }
}
