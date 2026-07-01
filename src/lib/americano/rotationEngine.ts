import { americanoPointsDuration } from '@/lib/americano/pointsPresets';
import type {
  AmericanoCourtMatch,
  AmericanoPlayer,
  AmericanoRound,
  AmericanoScheduleConfig,
  AmericanoScheduleResult,
} from '@/types/americano';

const DEFAULT_BUFFER_MIN = 2;

function rotateCircle<T>(list: T[]): T[] {
  if (list.length <= 1) return [...list];
  const [first, ...rest] = list;
  const last = rest.pop()!;
  return [first, last, ...rest];
}

function pairGroupOfFour(
  group: AmericanoPlayer[],
  court: number,
  pointsGoal: AmericanoScheduleConfig['pointsGoal'],
  roundIndex: number,
): AmericanoCourtMatch {
  const pattern = roundIndex % 2;
  const [a, b, c, d] = group;
  if (pattern === 0) {
    return {
      court,
      teamA: [a.id, b.id],
      teamB: [c.id, d.id],
      pointsGoal,
    };
  }
  return {
    court,
    teamA: [a.id, c.id],
    teamB: [b.id, d.id],
    pointsGoal,
  };
}

/**
 * Genera rondas de americano individual (parejas rotativas).
 * Algoritmo: rotación circular + asignación a canchas por bloques de 4.
 */
export function generateAmericanoIndividualSchedule(
  config: AmericanoScheduleConfig,
): AmericanoScheduleResult {
  const warnings: string[] = [];
  const { players, numCourts, pointsGoal, bufferMinutes = DEFAULT_BUFFER_MIN } = config;

  if (players.length < 4) {
    return {
      rounds: [],
      totalRounds: 0,
      restingPerRound: 0,
      estimatedMinutes: 0,
      warnings: ['Se necesitan al menos 4 jugadores.'],
    };
  }

  if (numCourts < 1) {
    return {
      rounds: [],
      totalRounds: 0,
      restingPerRound: 0,
      estimatedMinutes: 0,
      warnings: ['Indica al menos 1 cancha.'],
    };
  }

  const slotsPerRound = numCourts * 4;
  const restingPerRound = Math.max(0, players.length - slotsPerRound);

  if (players.length % 4 !== 0) {
    warnings.push(
      `Con ${players.length} jugadores, ${restingPerRound} descansa(n) cada ronda. Ideal: múltiplo de 4.`,
    );
  }

  if (players.length > slotsPerRound) {
    warnings.push(
      `Hay más jugadores (${players.length}) que plazas por ronda (${slotsPerRound}). Rotación con descansos.`,
    );
  }

  const roundCount = Math.max(players.length - 1, 1);
  const rounds: AmericanoRound[] = [];
  let order = [...players];

  for (let r = 0; r < roundCount; r++) {
    if (r > 0) order = rotateCircle(order);

    const active = order.slice(0, Math.min(slotsPerRound, order.length));
    const resting = order.slice(active.length).map((p) => p.id);
    const matches: AmericanoCourtMatch[] = [];

    for (let c = 0; c < numCourts; c++) {
      const chunk = active.slice(c * 4, c * 4 + 4);
      if (chunk.length < 4) break;
      matches.push(pairGroupOfFour(chunk, c + 1, pointsGoal, r));
    }

    if (matches.length > 0) {
      rounds.push({ round: r + 1, matches, restingPlayerIds: resting });
    }
  }

  const { max: matchMaxMin } = americanoPointsDuration(pointsGoal);
  const estimatedMinutes =
    rounds.length * (matchMaxMin + bufferMinutes) - (rounds.length > 0 ? bufferMinutes : 0);

  return {
    rounds,
    totalRounds: rounds.length,
    restingPerRound,
    estimatedMinutes,
    warnings,
  };
}

export function playerNameById(players: AmericanoPlayer[], id: string): string {
  return players.find((p) => p.id === id)?.name ?? id;
}
