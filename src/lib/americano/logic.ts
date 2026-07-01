import type { AmericanoPointsGoal } from '@/types/americano';

export type AmericanoSessionStatus = 'draft' | 'live' | 'finished';
export type AmericanoMatchStatus = 'pending' | 'finished';

export interface AmericanoSession {
  id: string;
  name: string;
  baseVenue: string;
  courtCount: number;
  pointsGoal: AmericanoPointsGoal;
  status: AmericanoSessionStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AmericanoPlayer {
  id: string;
  sessionId: string;
  name: string;
  totalPoints: number;
  sortOrder: number;
}

export interface AmericanoMatch {
  id: string;
  sessionId: string;
  roundNumber: number;
  courtNumber: number;
  playerA1Id: string;
  playerA2Id: string;
  playerB1Id: string;
  playerB2Id: string;
  scoreA: number;
  scoreB: number;
  pointsGoal: AmericanoPointsGoal;
  status: AmericanoMatchStatus;
}

/** Jugador mínimo para el generador de rotación (id + nombre). */
export interface RotativePlayer {
  id: string;
  name: string;
}

export interface RotativeMatchSlot {
  courtNumber: number;
  playerA1Id: string;
  playerA2Id: string;
  playerB1Id: string;
  playerB2Id: string;
  pointsGoal: AmericanoPointsGoal;
}

export interface RotativeRound {
  roundNumber: number;
  matches: RotativeMatchSlot[];
  restingPlayerIds: string[];
}

export interface RotativeRotationResult {
  rounds: RotativeRound[];
  warnings: string[];
}

function rotateCircle<T>(list: T[]): T[] {
  if (list.length <= 1) return [...list];
  const [first, ...rest] = list;
  const last = rest.pop()!;
  return [first, last, ...rest];
}

function pairGroupOfFour(
  group: RotativePlayer[],
  courtNumber: number,
  pointsGoal: AmericanoPointsGoal,
  roundIndex: number,
): RotativeMatchSlot {
  const pattern = roundIndex % 2;
  const [a, b, c, d] = group;
  if (pattern === 0) {
    return {
      courtNumber,
      playerA1Id: a.id,
      playerA2Id: b.id,
      playerB1Id: c.id,
      playerB2Id: d.id,
      pointsGoal,
    };
  }
  return {
    courtNumber,
    playerA1Id: a.id,
    playerA2Id: c.id,
    playerB1Id: b.id,
    playerB2Id: d.id,
    pointsGoal,
  };
}

/**
 * Genera rondas de americano individual con rotación circular y bloques de 4 por cancha.
 */
export function generateRotativeRotation(
  players: RotativePlayer[],
  courtCount: number,
  pointsGoal: AmericanoPointsGoal = 24,
): RotativeRotationResult {
  const warnings: string[] = [];

  if (players.length < 4) {
    return { rounds: [], warnings: ['Se necesitan al menos 4 jugadores.'] };
  }
  if (courtCount < 1) {
    return { rounds: [], warnings: ['Indica al menos 1 cancha.'] };
  }

  const slotsPerRound = courtCount * 4;
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
  const rounds: RotativeRound[] = [];
  let order = [...players];

  for (let r = 0; r < roundCount; r++) {
    if (r > 0) order = rotateCircle(order);

    const active = order.slice(0, Math.min(slotsPerRound, order.length));
    const resting = order.slice(active.length).map((p) => p.id);
    const matches: RotativeMatchSlot[] = [];

    for (let c = 0; c < courtCount; c++) {
      const chunk = active.slice(c * 4, c * 4 + 4);
      if (chunk.length < 4) break;
      matches.push(pairGroupOfFour(chunk, c + 1, pointsGoal, r));
    }

    if (matches.length > 0) {
      rounds.push({ roundNumber: r + 1, matches, restingPlayerIds: resting });
    }
  }

  return { rounds, warnings };
}

/** Suma puntos de un partido terminado a cada jugador (puntos de su lado). */
export function pointsDeltaForMatch(
  match: Pick<AmericanoMatch, 'playerA1Id' | 'playerA2Id' | 'playerB1Id' | 'playerB2Id' | 'scoreA' | 'scoreB'>,
): Map<string, number> {
  const delta = new Map<string, number>();
  delta.set(match.playerA1Id, match.scoreA);
  delta.set(match.playerA2Id, match.scoreA);
  delta.set(match.playerB1Id, match.scoreB);
  delta.set(match.playerB2Id, match.scoreB);
  return delta;
}

export function validateMatchScores(
  scoreA: number,
  scoreB: number,
  pointsGoal: AmericanoPointsGoal,
): string | null {
  if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB)) {
    return 'Los puntos deben ser enteros.';
  }
  if (scoreA < 0 || scoreB < 0) {
    return 'Los puntos no pueden ser negativos.';
  }
  const max = Math.max(scoreA, scoreB);
  const min = Math.min(scoreA, scoreB);
  if (max !== pointsGoal) {
    return `El ganador debe llegar a ${pointsGoal} puntos.`;
  }
  if (scoreA === scoreB) {
    return 'No puede haber empate.';
  }
  if (max + min > pointsGoal + pointsGoal - 1) {
    return 'Marcador inválido para este formato.';
  }
  return null;
}

export function playerNameById(players: Pick<AmericanoPlayer, 'id' | 'name'>[], id: string): string {
  return players.find((p) => p.id === id)?.name ?? id.slice(0, 8);
}
