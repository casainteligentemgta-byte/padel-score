/**
 * Capa de compatibilidad sobre `tournamentEngine.ts`.
 * Mantiene la API histórica de este archivo para no romper imports existentes.
 */

export { MatchStatus } from '@/types/tournament';
import { MatchStatus } from '@/types/tournament';
import {
  buildSemifinalsCross,
  calculatePoints as calculatePointsEngine,
  generateRoundRobinMatches,
  rankGroup,
  type Team as EngineTeam,
  type Match as EngineMatch,
  type RankedTeam as EngineRankedTeam,
} from '@/lib/tournamentEngine';

export interface Team {
  id: string;
  name: string;
}

export interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  score1?: number;
  score2?: number;
  status: MatchStatus;
  group?: string;
  round?: number;
  isBye?: boolean;
}

export interface RankedTeam extends Team {
  matchesPlayed: number;
  victories: number;
  draws: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  totalPoints: number;
}

export interface TournamentState {
  groups: { [key: string]: Team[] };
  matches: Match[];
}

function toEngineTeam(groupName: string, t: Team): EngineTeam {
  return { id: t.id, name: t.name, groupId: groupName };
}

function toLegacyMatch(m: EngineMatch): Match {
  return {
    id: m.id,
    team1Id: m.homeTeamId,
    team2Id: m.awayTeamId,
    score1: m.homeScore ?? undefined,
    score2: m.awayScore ?? undefined,
    status: m.finished ? MatchStatus.FINISHED : MatchStatus.PENDING,
    group: m.groupId,
    round: m.round,
    isBye: false,
  };
}

/**
 * Round Robin con Circle Method.
 */
export function generateRoundRobin(teams: Team[], groupName: string): Match[] {
  const engineTeams = teams.map((t) => toEngineTeam(groupName, t));
  return generateRoundRobinMatches(groupName, engineTeams).map(toLegacyMatch);
}

export function calculatePoints(victories: number, draws: number): number {
  return calculatePointsEngine(victories, draws);
}

function toEngineGroupMatch(groupName: string, m: Match): EngineMatch {
  return {
    id: m.id,
    phase: 'GROUP',
    groupId: groupName,
    round: m.round,
    homeTeamId: m.team1Id,
    awayTeamId: m.team2Id,
    homeScore: m.score1 ?? null,
    awayScore: m.score2 ?? null,
    finished: m.status === MatchStatus.FINISHED,
  };
}

function toLegacyRanked(groupName: string, row: EngineRankedTeam, nameById: Map<string, string>): RankedTeam {
  return {
    id: row.teamId,
    name: nameById.get(row.teamId) || row.teamName,
    matchesPlayed: row.played,
    victories: row.wins,
    draws: row.draws,
    losses: row.losses,
    pointsFor: row.pointsFor,
    pointsAgainst: row.pointsAgainst,
    pointDiff: row.goalDiff,
    totalPoints: row.points,
  };
}

/**
 * Ranking puro e inmutable.
 */
export function getRanking(teams: Team[], matches: Match[]): RankedTeam[] {
  if (!teams.length) return [];
  const groupName = matches.find((m) => m.group)?.group || 'GROUP_A';
  const engineTeams = teams.map((t) => toEngineTeam(groupName, t));
  const nameById = new Map(teams.map((t) => [t.id, t.name]));
  const engineMatches = matches
    .filter((m) => m.team1Id !== 'BYE' && m.team2Id !== 'BYE')
    .map((m) => toEngineGroupMatch(groupName, m));

  return rankGroup(engineTeams, engineMatches, groupName).map((r) => toLegacyRanked(groupName, r, nameById));
}

/**
 * Semifinales en cruce X.
 */
export function generateSemifinals(rankingA: RankedTeam[], rankingB: RankedTeam[]): Match[] {
  if (rankingA.length < 2 || rankingB.length < 2) {
    throw new Error('Se necesitan al menos 2 equipos clasificados por grupo.');
  }

  const toEngineRow = (r: RankedTeam, groupId: string): EngineRankedTeam => ({
    teamId: r.id,
    teamName: r.name,
    groupId,
    played: r.matchesPlayed,
    wins: r.victories,
    draws: r.draws,
    losses: r.losses,
    pointsFor: r.pointsFor,
    pointsAgainst: r.pointsAgainst,
    goalDiff: r.pointDiff,
    points: r.totalPoints,
  });

  const [sf1, sf2] = buildSemifinalsCross(
    rankingA.map((r) => toEngineRow(r, 'A')),
    rankingB.map((r) => toEngineRow(r, 'B')),
  );

  return [sf1, sf2].map((m, i) => ({
    id: m.id || `SF${i + 1}`,
    team1Id: m.homeTeamId,
    team2Id: m.awayTeamId,
    status: MatchStatus.PENDING,
    group: 'PLAYOFFS',
    round: 1,
    isBye: false,
  }));
}
