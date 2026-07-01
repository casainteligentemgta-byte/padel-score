import { americanoPointsDuration } from '@/lib/americano/pointsPresets';
import { generateRotativeRotation, playerNameById } from '@/lib/americano/logic';
import type {
  AmericanoCourtMatch,
  AmericanoPlayer,
  AmericanoRound,
  AmericanoScheduleConfig,
  AmericanoScheduleResult,
} from '@/types/americano';

export { playerNameById };

/**
 * Genera rondas de americano individual (parejas rotativas).
 * Delega en generateRotativeRotation (algoritmo circular + bloques de 4).
 */
export function generateAmericanoIndividualSchedule(
  config: AmericanoScheduleConfig,
): AmericanoScheduleResult {
  const { players, numCourts, pointsGoal, bufferMinutes = 2 } = config;
  const rotation = generateRotativeRotation(players, numCourts, pointsGoal);

  if (rotation.rounds.length === 0) {
    return {
      rounds: [],
      totalRounds: 0,
      restingPerRound: 0,
      estimatedMinutes: 0,
      warnings: rotation.warnings,
    };
  }

  const slotsPerRound = numCourts * 4;
  const restingPerRound = Math.max(0, players.length - slotsPerRound);

  const rounds: AmericanoRound[] = rotation.rounds.map((round) => ({
    round: round.roundNumber,
    restingPlayerIds: round.restingPlayerIds,
    matches: round.matches.map(
      (m): AmericanoCourtMatch => ({
        court: m.courtNumber,
        teamA: [m.playerA1Id, m.playerA2Id],
        teamB: [m.playerB1Id, m.playerB2Id],
        pointsGoal: m.pointsGoal,
      }),
    ),
  }));

  const { max: matchMaxMin } = americanoPointsDuration(pointsGoal);
  const estimatedMinutes =
    rounds.length * (matchMaxMin + bufferMinutes) - (rounds.length > 0 ? bufferMinutes : 0);

  return {
    rounds,
    totalRounds: rounds.length,
    restingPerRound,
    estimatedMinutes,
    warnings: rotation.warnings,
  };
}
