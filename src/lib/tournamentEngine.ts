export type Team = {
  id: string;
  name: string;
  groupId: string;
};

export type Match = {
  id: string;
  phase: 'GROUP' | 'SEMIFINAL' | 'FINAL';
  groupId?: string;
  round?: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  finished: boolean;
};

export type TournamentState = {
  teams: Team[];
  groupMatches: Match[];
  semifinalMatches: Match[];
  finalMatch: Match | null;
};

export type RankedTeam = {
  teamId: string;
  teamName: string;
  groupId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  goalDiff: number;
  points: number;
};

export type RankingOptions = {
  /**
   * Último criterio cuando persiste empate tras:
   * Puntos -> Diferencia -> H2H(2 equipos) -> Goles/Puntos a favor
   */
  finalFallback?: 'team_id' | 'seeded';
  /**
   * Semilla usada por fallback seeded (determinista).
   */
  seed?: string;
};

const BYE_ID = '__BYE__';

export function calculatePoints(victories: number, draws: number): number {
  return victories * 3 + draws;
}

function pairId(a: string, b: string): string {
  return a < b ? `${a}__${b}` : `${b}__${a}`;
}

function assertFiniteScore(value: number | null, label: string) {
  if (value === null) return;
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} debe ser un número >= 0 o null`);
  }
}

/**
 * Round Robin (Circle Method).
 * - Si n es impar agrega BYE interno para equilibrar rondas.
 * - Genera exactamente C(n,2) partidos reales (sin incluir BYE).
 */
export function generateRoundRobinMatches(groupId: string, teams: Team[]): Match[] {
  const groupTeams = teams.filter((t) => t.groupId === groupId);
  if (groupTeams.length < 2) return [];

  const participants = [...groupTeams];
  if (participants.length % 2 !== 0) {
    participants.push({ id: BYE_ID, name: 'BYE', groupId });
  }

  const n = participants.length;
  const rounds = n - 1;
  const rotating = participants.slice(1);
  const fixed = participants[0];
  const matches: Match[] = [];
  let nextId = 1;

  for (let r = 0; r < rounds; r++) {
    const line = [fixed, ...rotating];
    for (let i = 0; i < n / 2; i++) {
      const home = line[i];
      const away = line[n - 1 - i];
      if (home.id === BYE_ID || away.id === BYE_ID) continue;
      matches.push({
        id: `${groupId}-R${r + 1}-M${nextId++}`,
        phase: 'GROUP',
        groupId,
        round: r + 1,
        homeTeamId: home.id,
        awayTeamId: away.id,
        homeScore: null,
        awayScore: null,
        finished: false,
      });
    }
    rotating.unshift(rotating.pop() as Team);
  }

  // Validación matemática estricta: C(n,2)
  const realN = groupTeams.length;
  const expected = (realN * (realN - 1)) / 2;
  if (matches.length !== expected) {
    throw new Error(
      `RoundRobin inconsistente en ${groupId}: generados=${matches.length}, esperados=${expected}`,
    );
  }

  return matches;
}

function initRankingRow(team: Team): RankedTeam {
  return {
    teamId: team.id,
    teamName: team.name,
    groupId: team.groupId,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    goalDiff: 0,
    points: 0,
  };
}

function applyMatchToTable(table: Map<string, RankedTeam>, m: Match): void {
  if (!m.finished || m.homeScore === null || m.awayScore === null) return;
  assertFiniteScore(m.homeScore, 'homeScore');
  assertFiniteScore(m.awayScore, 'awayScore');

  const home = table.get(m.homeTeamId);
  const away = table.get(m.awayTeamId);
  if (!home || !away) return;

  home.played += 1;
  away.played += 1;
  home.pointsFor += m.homeScore;
  home.pointsAgainst += m.awayScore;
  away.pointsFor += m.awayScore;
  away.pointsAgainst += m.homeScore;

  if (m.homeScore > m.awayScore) {
    home.wins += 1;
    away.losses += 1;
  } else if (m.homeScore < m.awayScore) {
    away.wins += 1;
    home.losses += 1;
  } else {
    home.draws += 1;
    away.draws += 1;
  }
}

function finalizeTable(table: Map<string, RankedTeam>): RankedTeam[] {
  return Array.from(table.values()).map((r) => ({
    ...r,
    goalDiff: r.pointsFor - r.pointsAgainst,
    points: calculatePoints(r.wins, r.draws),
  }));
}

function buildHeadToHeadWinnerMap(matches: Match[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of matches) {
    if (!m.finished || m.homeScore === null || m.awayScore === null) continue;
    if (m.homeScore === m.awayScore) continue;
    map.set(pairId(m.homeTeamId, m.awayTeamId), m.homeScore > m.awayScore ? m.homeTeamId : m.awayTeamId);
  }
  return map;
}

function seededValue(seed: string, id: string): number {
  const s = `${seed}::${id}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function compareFinalFallback(a: RankedTeam, b: RankedTeam, options?: RankingOptions): number {
  const mode = options?.finalFallback ?? 'team_id';
  if (mode === 'seeded') {
    const seed = options?.seed ?? 'default-seed';
    const av = seededValue(seed, a.teamId);
    const bv = seededValue(seed, b.teamId);
    if (av !== bv) return av - bv;
  }
  return a.teamId.localeCompare(b.teamId);
}

function sortByBaseCriteria(rows: RankedTeam[], h2hWinner: Map<string, string>, options?: RankingOptions): RankedTeam[] {
  const out = [...rows];
  out.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    const key = pairId(a.teamId, b.teamId);
    const winner = h2hWinner.get(key);
    if (winner === a.teamId) return -1;
    if (winner === b.teamId) return 1;
    if (b.pointsFor !== a.pointsFor) return b.pointsFor - a.pointsFor;
    return compareFinalFallback(a, b, options);
  });
  return out;
}

function sortMiniTableChunk(
  chunk: RankedTeam[],
  scopedMatches: Match[],
  groupId: string,
  options?: RankingOptions,
): RankedTeam[] {
  if (chunk.length <= 2) return chunk;
  const ids = new Set(chunk.map((r) => r.teamId));
  const miniMatches = scopedMatches.filter((m) => ids.has(m.homeTeamId) && ids.has(m.awayTeamId));
  const miniTeams: Team[] = chunk.map((r) => ({ id: r.teamId, name: r.teamName, groupId }));
  const miniTable = new Map<string, RankedTeam>();
  for (const t of miniTeams) miniTable.set(t.id, initRankingRow(t));
  for (const m of miniMatches) applyMatchToTable(miniTable, m);
  const miniRowsRaw = finalizeTable(miniTable);
  const miniRows = sortByBaseCriteria(miniRowsRaw, buildHeadToHeadWinnerMap(miniMatches), {
    ...options,
    finalFallback: 'team_id',
  });
  const miniPos = new Map(miniRows.map((r, i) => [r.teamId, i]));
  const out = [...chunk];
  out.sort((a, b) => {
    const pa = miniPos.get(a.teamId) ?? 0;
    const pb = miniPos.get(b.teamId) ?? 0;
    if (pa !== pb) return pa - pb;
    if (b.pointsFor !== a.pointsFor) return b.pointsFor - a.pointsFor;
    return compareFinalFallback(a, b, options);
  });
  return out;
}

function rankGroupWithOptions(
  teams: Team[],
  groupMatches: Match[],
  groupId: string,
  options?: RankingOptions,
): RankedTeam[] {
  const groupTeams = teams.filter((t) => t.groupId === groupId);
  const groupIds = new Set(groupTeams.map((t) => t.id));
  const scopedMatches = groupMatches.filter(
    (m) =>
      m.phase === 'GROUP' &&
      m.groupId === groupId &&
      groupIds.has(m.homeTeamId) &&
      groupIds.has(m.awayTeamId),
  );
  const table = new Map<string, RankedTeam>();
  for (const t of groupTeams) table.set(t.id, initRankingRow(t));
  for (const m of scopedMatches) applyMatchToTable(table, m);
  const rows = finalizeTable(table);
  const h2hWinner = buildHeadToHeadWinnerMap(scopedMatches);
  const base = sortByBaseCriteria(rows, h2hWinner, options);

  // Mini-tabla para empates múltiples en (P, Δ)
  const result: RankedTeam[] = [];
  for (let i = 0; i < base.length; ) {
    const jStart = i;
    let j = i + 1;
    while (j < base.length && base[j].points === base[jStart].points && base[j].goalDiff === base[jStart].goalDiff) j++;
    const chunk = base.slice(jStart, j);
    const resolved = chunk.length >= 3 ? sortMiniTableChunk(chunk, scopedMatches, groupId, options) : chunk;
    result.push(...resolved);
    i = j;
  }
  return result;
}

/**
 * Función pura e inmutable:
 * recibe equipos + resultados y devuelve ranking ordenado.
 * Orden estricto:
 * 1) Puntos, 2) Diferencia, 3) Head-to-Head (solo empate de 2), 4) Puntos/Goles a favor.
 * Si persiste empate (o empate múltiple), desempata por teamId para mantener determinismo.
 */
export function rankGroup(teams: Team[], groupMatches: Match[], groupId: string): RankedTeam[] {
  return rankGroupWithOptions(teams, groupMatches, groupId);
}

export function rankGroupAdvanced(
  teams: Team[],
  groupMatches: Match[],
  groupId: string,
  options?: RankingOptions,
): RankedTeam[] {
  return rankGroupWithOptions(teams, groupMatches, groupId, options);
}

export function buildSemifinalsCross(
  groupAStanding: RankedTeam[],
  groupBStanding: RankedTeam[],
): [Match, Match] {
  if (groupAStanding.length < 2 || groupBStanding.length < 2) {
    throw new Error('Se necesitan al menos 2 clasificados por grupo');
  }

  const a1 = groupAStanding[0];
  const a2 = groupAStanding[1];
  const b1 = groupBStanding[0];
  const b2 = groupBStanding[1];

  if (a1.groupId === b2.groupId || b1.groupId === a2.groupId) {
    throw new Error('Cruce inválido: semifinal con rivales del mismo grupo');
  }

  const sf1: Match = {
    id: 'SF1',
    phase: 'SEMIFINAL',
    homeTeamId: a1.teamId,
    awayTeamId: b2.teamId,
    homeScore: null,
    awayScore: null,
    finished: false,
  };
  const sf2: Match = {
    id: 'SF2',
    phase: 'SEMIFINAL',
    homeTeamId: b1.teamId,
    awayTeamId: a2.teamId,
    homeScore: null,
    awayScore: null,
    finished: false,
  };

  return [sf1, sf2];
}

export function buildFinalFromSemifinals(sf1: Match, sf2: Match): Match {
  if (!sf1.finished || !sf2.finished || sf1.homeScore === null || sf1.awayScore === null || sf2.homeScore === null || sf2.awayScore === null) {
    throw new Error('Las semifinales deben estar finalizadas para generar la final');
  }
  if (sf1.homeScore === sf1.awayScore || sf2.homeScore === sf2.awayScore) {
    throw new Error('No se admiten empates en semifinales');
  }

  const winner1 = sf1.homeScore > sf1.awayScore ? sf1.homeTeamId : sf1.awayTeamId;
  const winner2 = sf2.homeScore > sf2.awayScore ? sf2.homeTeamId : sf2.awayTeamId;

  return {
    id: 'FINAL',
    phase: 'FINAL',
    homeTeamId: winner1,
    awayTeamId: winner2,
    homeScore: null,
    awayScore: null,
    finished: false,
  };
}

export function createTournamentState(teams: Team[]): TournamentState {
  const groupIds = Array.from(new Set(teams.map((t) => t.groupId))).sort();
  const groupMatches = groupIds.flatMap((g) => generateRoundRobinMatches(g, teams));
  return {
    teams: [...teams],
    groupMatches,
    semifinalMatches: [],
    finalMatch: null,
  };
}

/**
 * Helper de alto nivel:
 * - Calcula standings de dos grupos (A/B)
 * - Genera semifinales en X con top-2 de cada grupo
 */
export function buildPlayoffsFromGroupResults(
  teams: Team[],
  groupMatches: Match[],
  groupAId: string,
  groupBId: string,
): { groupAStanding: RankedTeam[]; groupBStanding: RankedTeam[]; semifinals: [Match, Match] } {
  const groupAStanding = rankGroup(teams, groupMatches, groupAId);
  const groupBStanding = rankGroup(teams, groupMatches, groupBId);
  const semifinals = buildSemifinalsCross(groupAStanding, groupBStanding);
  return { groupAStanding, groupBStanding, semifinals };
}
