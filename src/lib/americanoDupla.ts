import { generateRoundRobinMatches, type Team as EngineTeam } from '@/lib/tournamentEngine';
import { TournamentType } from '@/types/tournament';

export const AMERICANO_POINTS_FORMAT = 'AMERICANO_POINTS';
export const AMERICANO_POINTS_GOAL_OPTIONS = [16, 24, 32] as const;
export const AMERICANO_DEFAULT_POINTS_GOAL = 24;
export const AMERICANO_DEFAULT_MATCH_MINUTES = 30;

export type AmericanoPointsGoal = (typeof AMERICANO_POINTS_GOAL_OPTIONS)[number];

export type AmericanoDuplaStanding = {
    id: string;
    name: string;
    photo?: string | null;
    played: number;
    pointsFor: number;
    pointsAgainst: number;
    pointDiff: number;
    wins: number;
};

export type AmericanoDuplaMatchResult = {
    team1Id: string;
    team2Id: string;
    score1: number;
    score2: number;
    finished: boolean;
};

export function resolveAmericanoPointsGoal(raw: unknown): AmericanoPointsGoal {
    const n = Number(raw);
    if (n === 16 || n === 24 || n === 32) return n;
    return AMERICANO_DEFAULT_POINTS_GOAL;
}

export function isAmericanoDuplaType(type: unknown): boolean {
    return String(type || '').toUpperCase() === TournamentType.AMERICANO_DUPLA;
}

export function isAmericanoPointsFormat(matchFormat: unknown): boolean {
    const f = String(matchFormat || '').toUpperCase();
    return f === AMERICANO_POINTS_FORMAT || f === TournamentType.AMERICANO_DUPLA;
}

export function isAmericanoDuplaTournament(tournament?: any): boolean {
    if (!tournament) return false;
    if (isAmericanoDuplaType(tournament.type)) return true;
    return isAmericanoPointsFormat(tournament.matchFormat || tournament.rrMatchFormat);
}

export function isAmericanoPointsMode(matchOrTournament?: any, tournament?: any): boolean {
    if (isAmericanoDuplaType(matchOrTournament?.type) || isAmericanoDuplaType(tournament?.type)) {
        return true;
    }
    const mf =
        matchOrTournament?.matchFormat ??
        matchOrTournament?.match_format ??
        matchOrTournament?.rrMatchFormat ??
        tournament?.matchFormat ??
        tournament?.rrMatchFormat;
    return isAmericanoPointsFormat(mf);
}

export function isAmericanoMatchComplete(a: number, b: number, goal: number): boolean {
    const left = Number(a) || 0;
    const right = Number(b) || 0;
    const target = Number(goal);
    if (!Number.isFinite(target) || target <= 0) return false;
    return left + right >= target;
}

export function applyAmericanoPoint(
    local: number,
    visitante: number,
    side: 'local' | 'visitante',
    delta: 1 | -1,
): { local: number; visitante: number } {
    const next = {
        local: Math.max(0, Number(local) || 0),
        visitante: Math.max(0, Number(visitante) || 0),
    };
    next[side] = Math.max(0, next[side] + delta);
    return next;
}

export function courtsForAmericanoDupla(numPairs: number, numCourts: number): number {
    const pairs = Math.max(0, Number(numPairs) || 0);
    const courts = Math.max(0, Number(numCourts) || 0);
    return Math.max(0, Math.min(Math.floor(pairs / 2), courts));
}

export function americanoSlotMinutes(matchDuration?: number, buffer?: number): number {
    const d = Number(matchDuration);
    const b = Number(buffer);
    const duration = Number.isFinite(d) && d > 0 ? d : AMERICANO_DEFAULT_MATCH_MINUTES;
    const buf = Number.isFinite(b) && b >= 0 ? b : 0;
    return Math.max(15, duration + buf);
}

export function matchDurationForAmericanoGoal(goal: unknown): number {
    const g = resolveAmericanoPointsGoal(goal);
    if (g === 16) return 20;
    if (g === 32) return 40;
    return AMERICANO_DEFAULT_MATCH_MINUTES;
}

/** Circle-method pair-vs-pair, 1-based indices, BYE omitted. */
export function generateAmericanoDuplaIndexPairings(numTeams: number): [number, number][] {
    const n = Math.floor(Number(numTeams) || 0);
    if (n < 2) return [];
    const teams: EngineTeam[] = Array.from({ length: n }, (_, i) => ({
        id: String(i + 1),
        name: `T${i + 1}`,
        groupId: 'A',
    }));
    return generateRoundRobinMatches('A', teams).map((m) => [
        Number(m.homeTeamId),
        Number(m.awayTeamId),
    ]);
}

export function generateAmericanoDuplaPairings<T extends { id?: string }>(
    teams: T[],
): Array<{ team1: T; team2: T; team1Index: number; team2Index: number }> {
    if (!Array.isArray(teams) || teams.length < 2) return [];
    return generateAmericanoDuplaIndexPairings(teams.length).map(([i, j]) => ({
        team1: teams[i - 1],
        team2: teams[j - 1],
        team1Index: i,
        team2Index: j,
    }));
}

export function americanoScoreFromMatch(match: any): { t1: number; t2: number } {
    const g1 = Number(match?.games?.t1 ?? match?.games?.local);
    const g2 = Number(match?.games?.t2 ?? match?.games?.visitante);
    if (Number.isFinite(g1) && Number.isFinite(g2)) {
        return { t1: g1, t2: g2 };
    }
    const p1 = Number(match?.points?.t1 ?? match?.puntos?.local);
    const p2 = Number(match?.points?.t2 ?? match?.puntos?.visitante);
    if (Number.isFinite(p1) && Number.isFinite(p2)) {
        return { t1: p1, t2: p2 };
    }
    const score = String(match?.score || '');
    const mm = score.match(/(\d+)\s*[-–]\s*(\d+)/);
    if (mm) return { t1: Number(mm[1]), t2: Number(mm[2]) };
    return { t1: 0, t2: 0 };
}

function pairKey(a: string, b: string): string {
    return a < b ? `${a}__${b}` : `${b}__${a}`;
}

function h2hWinnerMap(matches: AmericanoDuplaMatchResult[]): Map<string, string> {
    const map = new Map<string, string>();
    for (const m of matches) {
        if (!m.finished) continue;
        if (m.score1 === m.score2) continue;
        const winner = m.score1 > m.score2 ? m.team1Id : m.team2Id;
        map.set(pairKey(m.team1Id, m.team2Id), winner);
    }
    return map;
}

/**
 * Ranking Americano dupla fija:
 * 1) puntos a favor, 2) diferencia, 3) enfrentamiento directo.
 */
export function rankAmericanoDupla(
    teams: Array<{ id: string; name: string; photo?: string | null }>,
    matches: AmericanoDuplaMatchResult[],
): AmericanoDuplaStanding[] {
    const table = new Map<string, AmericanoDuplaStanding>();
    for (const t of teams) {
        table.set(t.id, {
            id: t.id,
            name: t.name,
            photo: t.photo ?? null,
            played: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            pointDiff: 0,
            wins: 0,
        });
    }

    for (const m of matches) {
        if (!m.finished) continue;
        const a = table.get(m.team1Id);
        const b = table.get(m.team2Id);
        if (!a || !b) continue;
        a.played += 1;
        b.played += 1;
        a.pointsFor += m.score1;
        a.pointsAgainst += m.score2;
        b.pointsFor += m.score2;
        b.pointsAgainst += m.score1;
        if (m.score1 > m.score2) a.wins += 1;
        else if (m.score2 > m.score1) b.wins += 1;
    }

    for (const row of table.values()) {
        row.pointDiff = row.pointsFor - row.pointsAgainst;
    }

    const h2h = h2hWinnerMap(matches);
    const rows = [...table.values()];
    rows.sort((x, y) => {
        if (y.pointsFor !== x.pointsFor) return y.pointsFor - x.pointsFor;
        if (y.pointDiff !== x.pointDiff) return y.pointDiff - x.pointDiff;
        const winner = h2h.get(pairKey(x.id, y.id));
        if (winner === x.id) return -1;
        if (winner === y.id) return 1;
        return x.id.localeCompare(y.id);
    });
    return rows;
}

export function buildAmericanoDuplaStandings(tournament: any, matches: any[]): AmericanoDuplaStanding[] {
    const teams = (Array.isArray(tournament?.teams) ? tournament.teams : []).map((team: any, idx: number) => ({
        id: `team-${idx + 1}`,
        name: `${team?.p1?.name || team?.p1Name || 'J1'} / ${team?.p2?.name || team?.p2Name || 'J2'}`,
        photo: team?.p1?.photo || null,
    }));

    const results: AmericanoDuplaMatchResult[] = (Array.isArray(matches) ? matches : [])
        .filter((m) => {
            const s = String(m?.status || '').toUpperCase();
            return s === 'FINISHED' || s === 'COMPLETED' || s === 'FINALIZADO';
        })
        .map((m) => {
            const score = americanoScoreFromMatch(m);
            return {
                team1Id: `team-${Number(m.team1Index) || 0}`,
                team2Id: `team-${Number(m.team2Index) || 0}`,
                score1: score.t1,
                score2: score.t2,
                finished: true,
            };
        })
        .filter((m) => m.team1Id !== 'team-0' && m.team2Id !== 'team-0');

    return rankAmericanoDupla(teams, results);
}
