import type { AmericanoPointsGoal } from '@/types/americano';
import { validateMatchScores } from '@/lib/americano/logic';

export type AmericanoScoreState = {
  scoreA: number;
  scoreB: number;
  pointsGoal: AmericanoPointsGoal;
};

export function nextAmericanoScore(
  state: AmericanoScoreState,
  team: 'a' | 'b',
  action: 'increment' | 'decrement',
): AmericanoScoreState | null {
  let { scoreA, scoreB, pointsGoal } = state;
  const delta = action === 'increment' ? 1 : -1;

  if (team === 'a') {
    const next = scoreA + delta;
    if (next < 0 || next > pointsGoal) return null;
    scoreA = next;
  } else {
    const next = scoreB + delta;
    if (next < 0 || next > pointsGoal) return null;
    scoreB = next;
  }

  return { scoreA, scoreB, pointsGoal };
}

export function isAmericanoMatchComplete(state: AmericanoScoreState): boolean {
  const max = Math.max(state.scoreA, state.scoreB);
  if (max !== state.pointsGoal) return false;
  return validateMatchScores(state.scoreA, state.scoreB, state.pointsGoal) === null;
}

export function canTapAmericanoScore(state: AmericanoScoreState): boolean {
  return !isAmericanoMatchComplete(state);
}
