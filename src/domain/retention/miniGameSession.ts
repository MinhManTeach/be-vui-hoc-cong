import type { MiniGameSession } from './types';
export type MiniGameEvent =
  | { type: 'START' | 'SESSION_COMPLETED' | 'PAUSE' | 'RESUME' | 'CANCEL' }
  | { type: 'ROUND_COMPLETED'; roundId: string };
export function validId(id: unknown): id is string {
  return typeof id === 'string' && /^[A-Za-z0-9_:-]{1,160}$/.test(id);
}
export function roundId(sessionId: string, index: number) { return `${sessionId}:round:${index}`; }
export function createMiniGameSession(sessionId: string, roundCount = 3): MiniGameSession {
  if (!validId(sessionId) || sessionId.length > 120 || !Number.isInteger(roundCount) || roundCount < 1 || roundCount > 10) throw new Error('Invalid mini-game session');
  return { sessionId, roundId: roundId(sessionId, 1), roundCount, completedRounds: [], status: 'active' };
}
export function transitionMiniGameSession(session: MiniGameSession, event: MiniGameEvent): MiniGameSession {
  if (session.status === 'completed' || session.status === 'cancelled') return session;
  if (event.type === 'CANCEL') return { ...session, status: 'cancelled' };
  if (event.type === 'PAUSE' && session.status === 'active') return { ...session, status: 'paused' };
  if (event.type === 'RESUME' && session.status === 'paused') return { ...session, status: 'active' };
  if (event.type !== 'ROUND_COMPLETED' || session.status !== 'active' || event.roundId !== session.roundId || session.completedRounds.includes(event.roundId)) return session;
  const completedRounds = [...session.completedRounds, event.roundId];
  const complete = completedRounds.length === session.roundCount;
  return { ...session, completedRounds, status: complete ? 'completed' : 'active', roundId: complete ? session.roundId : roundId(session.sessionId, completedRounds.length + 1) };
}
