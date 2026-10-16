import type { UserProgress } from '../../types/math';
import { isDay } from '../retention/clock';

/** Minutes played today and the parent's daily limit (0 = no limit). */
export interface PlayTime {
  day: string;
  minutes: number;
  limitMinutes: number;
  /** Extra minutes a parent granted today after the limit was reached. */
  extraMinutes: number;
}

export const LIMIT_OPTIONS = [0, 15, 20, 30, 45] as const;

export function emptyPlayTime(): PlayTime {
  return { day: '', minutes: 0, limitMinutes: 0, extraMinutes: 0 };
}

export function normalizePlayTime(raw: unknown): PlayTime {
  const value = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const count = (n: unknown, max: number) => (typeof n === 'number' && Number.isInteger(n) && n >= 0 ? Math.min(n, max) : 0);
  const limit = count(value.limitMinutes, 600);
  return {
    day: isDay(value.day) ? value.day : '',
    minutes: count(value.minutes, 24 * 60),
    limitMinutes: (LIMIT_OPTIONS as readonly number[]).includes(limit) ? limit : 0,
    extraMinutes: count(value.extraMinutes, 600),
  };
}

/** Today's numbers; a new calendar day starts from zero but keeps the parent's limit. */
export function today(progress: UserProgress, day: string): PlayTime {
  const current = progress.playTime ?? emptyPlayTime();
  return current.day === day ? current : { ...current, day, minutes: 0, extraMinutes: 0 };
}

export function addPlayedMinute(progress: UserProgress, day: string): UserProgress {
  const t = today(progress, day);
  return { ...progress, playTime: { ...t, minutes: t.minutes + 1 } };
}

export function isTimeUp(progress: UserProgress, day: string): boolean {
  const t = today(progress, day);
  return t.limitMinutes > 0 && t.minutes >= t.limitMinutes + t.extraMinutes;
}

export function setDailyLimit(progress: UserProgress, day: string, limitMinutes: number): UserProgress {
  return { ...progress, playTime: { ...today(progress, day), limitMinutes } };
}

export function grantExtraMinutes(progress: UserProgress, day: string, minutes = 10): UserProgress {
  const t = today(progress, day);
  // Extend from now, so a child who kept the break screen open still gets the full extra time.
  const base = Math.max(t.minutes - t.limitMinutes, t.extraMinutes);
  return { ...progress, playTime: { ...t, extraMinutes: base + minutes } };
}
