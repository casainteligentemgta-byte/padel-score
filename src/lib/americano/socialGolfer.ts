import type { AmericanoPointsGoal } from '@/types/americano';
import type { RotativeMatchSlot, RotativePlayer, RotativeRotationResult } from '@/lib/americano/logic';

function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function incPair(map: Map<string, number>, a: string, b: string, weight = 1) {
  const key = pairKey(a, b);
  map.set(key, (map.get(key) ?? 0) + weight);
}

function pairScore(map: Map<string, number>, a: string, b: string): number {
  return map.get(pairKey(a, b)) ?? 0;
}

/** Dos formaciones posibles dentro de un bloque de 4 jugadores. */
function matchSlotsFromFour(
  group: RotativePlayer[],
  courtNumber: number,
  pointsGoal: AmericanoPointsGoal,
): RotativeMatchSlot[] {
  const [a, b, c, d] = group;
  return [
    {
      courtNumber,
      playerA1Id: a.id,
      playerA2Id: b.id,
      playerB1Id: c.id,
      playerB2Id: d.id,
      pointsGoal,
    },
    {
      courtNumber,
      playerA1Id: a.id,
      playerA2Id: c.id,
      playerB1Id: b.id,
      playerB2Id: d.id,
      pointsGoal,
    },
  ];
}

function scoreMatchSlot(
  slot: RotativeMatchSlot,
  partnerCounts: Map<string, number>,
  opponentCounts: Map<string, number>,
): number {
  let score = 0;
  const partners: [string, string][] = [
    [slot.playerA1Id, slot.playerA2Id],
    [slot.playerB1Id, slot.playerB2Id],
  ];
  const teamA = [slot.playerA1Id, slot.playerA2Id];
  const teamB = [slot.playerB1Id, slot.playerB2Id];

  for (const [x, y] of partners) {
    score += pairScore(partnerCounts, x, y) * 10;
  }
  for (const a of teamA) {
    for (const b of teamB) {
      score += pairScore(opponentCounts, a, b) * 3;
    }
  }
  return score;
}

function applyMatchSlot(
  slot: RotativeMatchSlot,
  partnerCounts: Map<string, number>,
  opponentCounts: Map<string, number>,
) {
  incPair(partnerCounts, slot.playerA1Id, slot.playerA2Id);
  incPair(partnerCounts, slot.playerB1Id, slot.playerB2Id);
  for (const a of [slot.playerA1Id, slot.playerA2Id]) {
    for (const b of [slot.playerB1Id, slot.playerB2Id]) {
      incPair(opponentCounts, a, b);
    }
  }
}

/** Genera combinaciones de k elementos de arr. */
function combinations<T>(arr: T[], k: number): T[][] {
  if (k <= 0) return [[]];
  if (arr.length < k) return [];
  if (k === 1) return arr.map((x) => [x]);
  const out: T[][] = [];
  for (let i = 0; i <= arr.length - k; i++) {
    const head = arr[i];
    for (const tail of combinations(arr.slice(i + 1), k - 1)) {
      out.push([head, ...tail]);
    }
  }
  return out;
}

function bestMatchesForActive(
  active: RotativePlayer[],
  courtCount: number,
  pointsGoal: AmericanoPointsGoal,
  partnerCounts: Map<string, number>,
  opponentCounts: Map<string, number>,
): RotativeMatchSlot[] {
  const groupSize = 4;
  if (active.length < groupSize) return [];

  type SearchResult = { slots: RotativeMatchSlot[]; score: number };

  const search = (
    remaining: RotativePlayer[],
    courtNum: number,
    acc: RotativeMatchSlot[],
    score: number,
  ): SearchResult | null => {
    if (courtNum > courtCount) {
      return remaining.length === 0 ? { slots: acc, score } : null;
    }
    const groupsLeft = courtCount - courtNum + 1;
    if (remaining.length < groupsLeft * groupSize) return null;

    let best: SearchResult | null = null;
    for (const combo of combinations(remaining, groupSize)) {
      const comboIds = new Set(combo.map((p) => p.id));
      const rest = remaining.filter((p) => !comboIds.has(p.id));
      for (const slot of matchSlotsFromFour(combo, courtNum, pointsGoal)) {
        const slotScore = score + scoreMatchSlot(slot, partnerCounts, opponentCounts);
        const sub = search(rest, courtNum + 1, [...acc, slot], slotScore);
        if (sub && (!best || sub.score < best.score)) best = sub;
      }
    }
    return best;
  };

  const result = search(active, 1, [], 0);
  if (result?.slots.length) return result.slots;

  const fallback: RotativeMatchSlot[] = [];
  for (let c = 0; c < courtCount; c++) {
    const chunk = active.slice(c * groupSize, c * groupSize + groupSize);
    if (chunk.length < groupSize) break;
    fallback.push(matchSlotsFromFour(chunk, c + 1, pointsGoal)[0]);
  }
  return fallback;
}

function rotateForRestBalance(players: RotativePlayer[], restCounts: Map<string, number>): RotativePlayer[] {
  return [...players].sort((a, b) => {
    const ra = restCounts.get(a.id) ?? 0;
    const rb = restCounts.get(b.id) ?? 0;
    if (ra !== rb) return ra - rb;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });
}

type PlayerWithOrder = RotativePlayer & { sortOrder?: number };

/**
 * Genera rotación optimizada (social golfer greedy): minimiza parejas y rivales repetidos.
 */
export function generateBalancedRotation(
  players: PlayerWithOrder[],
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

  if (players.length > 16) {
    warnings.push('Más de 16 jugadores: se usa rotación circular clásica por rendimiento.');
    return generateCircleFallback(players, courtCount, pointsGoal, warnings);
  }

  const roundCount = Math.max(players.length - 1, 1);
  const partnerCounts = new Map<string, number>();
  const opponentCounts = new Map<string, number>();
  const restCounts = new Map<string, number>();
  const rounds: RotativeRotationResult['rounds'] = [];

  let order = players.map((p, idx) => ({ ...p, sortOrder: p.sortOrder ?? idx }));

  for (let r = 0; r < roundCount; r++) {
    order = rotateForRestBalance(order, restCounts);
    const active = order.slice(0, Math.min(slotsPerRound, order.length));
    const resting = order.slice(active.length);

    for (const p of resting) {
      restCounts.set(p.id, (restCounts.get(p.id) ?? 0) + 1);
    }

    const matches = bestMatchesForActive(active, courtCount, pointsGoal, partnerCounts, opponentCounts);
    for (const m of matches) {
      applyMatchSlot(m, partnerCounts, opponentCounts);
    }

    if (matches.length > 0) {
      rounds.push({
        roundNumber: r + 1,
        matches,
        restingPlayerIds: resting.map((p) => p.id),
      });
    }

    // Rotación suave para la siguiente ronda
    if (r < roundCount - 1 && order.length > 1) {
      const [first, ...rest] = order;
      order = [...rest, first];
    }
  }

  return { rounds, warnings };
}

function generateCircleFallback(
  players: RotativePlayer[],
  courtCount: number,
  pointsGoal: AmericanoPointsGoal,
  warnings: string[],
): RotativeRotationResult {
  const slotsPerRound = courtCount * 4;
  const roundCount = Math.max(players.length - 1, 1);
  const rounds: RotativeRotationResult['rounds'] = [];
  let order = [...players];

  const rotateCircle = <T,>(list: T[]): T[] => {
    if (list.length <= 1) return [...list];
    const [first, ...rest] = list;
    const last = rest.pop()!;
    return [first, last, ...rest];
  };

  for (let r = 0; r < roundCount; r++) {
    if (r > 0) order = rotateCircle(order);
    const active = order.slice(0, Math.min(slotsPerRound, order.length));
    const resting = order.slice(active.length).map((p) => p.id);
    const matches: RotativeMatchSlot[] = [];
    for (let c = 0; c < courtCount; c++) {
      const chunk = active.slice(c * 4, c * 4 + 4);
      if (chunk.length < 4) break;
      const [a, b, c2, d] = chunk;
      const pattern = r % 2;
      matches.push(
        pattern === 0
          ? {
              courtNumber: c + 1,
              playerA1Id: a.id,
              playerA2Id: b.id,
              playerB1Id: c2.id,
              playerB2Id: d.id,
              pointsGoal,
            }
          : {
              courtNumber: c + 1,
              playerA1Id: a.id,
              playerA2Id: c2.id,
              playerB1Id: b.id,
              playerB2Id: d.id,
              pointsGoal,
            },
      );
    }
    if (matches.length > 0) {
      rounds.push({ roundNumber: r + 1, matches, restingPlayerIds: resting });
    }
  }

  return { rounds, warnings };
}
