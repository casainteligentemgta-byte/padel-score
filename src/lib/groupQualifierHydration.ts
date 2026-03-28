import { MatchStatus } from '@/types/tournament';

type GroupTeamRow = {
    id: string;
    name: string;
    tNum: number;
    PJ: number;
    PG: number;
    JF: number;
    JC: number;
    Pts: number;
};

function fullName(p: any): string {
    if (!p) return '';
    return [p.name, p.lastName].filter(Boolean).join(' ').trim() || (typeof p.name === 'string' ? p.name : '') || '';
}

function resolveH2H(teamA: GroupTeamRow, teamB: GroupTeamRow, matchesInGroup: any[]): number {
    const h2h = matchesInGroup.filter(
        (m) =>
            m.status === MatchStatus.FINISHED &&
            ((m.team1Index === teamA.tNum && m.team2Index === teamB.tNum) ||
                (m.team1Index === teamB.tNum && m.team2Index === teamA.tNum)),
    );
    let wA = 0;
    let wB = 0;
    for (const m of h2h) {
        const g1 = m.games?.t1 ?? 0;
        const g2 = m.games?.t2 ?? 0;
        if (m.team1Index === teamA.tNum) {
            if (g1 > g2) wA++;
            else wB++;
        } else {
            if (g2 > g1) wA++;
            else wB++;
        }
    }
    return wB - wA;
}

function sortStandings(teams: GroupTeamRow[], matchesInGroup: any[]): GroupTeamRow[] {
    return [...teams].sort((a, b) => {
        if (b.Pts !== a.Pts) return b.Pts - a.Pts;
        const diffA = a.JF - a.JC;
        const diffB = b.JF - b.JC;
        if (diffB !== diffA) return diffB - diffA;
        return resolveH2H(a, b, matchesInGroup);
    });
}

/** Etiquetas tipo "1° Grupo A", "2º Grupo B", "Por Definir (1°A)". */
export function parseGroupQualifierLabel(text: string | undefined | null): { rank: number; letter: string } | null {
    if (!text || typeof text !== 'string') return null;
    const t = text.trim();
    const m1 = t.match(/(\d+)\s*[°ºª]?\s*Grupo\s*([A-Za-z])\b/i);
    if (m1) return { rank: parseInt(m1[1], 10), letter: m1[2].toUpperCase() };
    if (/por\s+definir|definir/i.test(t)) {
        const m2 = t.match(/\(?\s*(\d+)\s*[°ºª]?\s*([A-Za-z])\s*\)?/);
        if (m2) return { rank: parseInt(m2[1], 10), letter: m2[2].toUpperCase() };
    }
    return null;
}

function buildLetterToGroupKey(assignments: Record<string, string[]>): Record<string, string> {
    const keys = Object.keys(assignments).sort();
    const map: Record<string, string> = {};
    keys.forEach((k, i) => {
        map[String.fromCharCode(65 + i)] = k;
    });
    return map;
}

function teamDisplayName(team: any, fallbackTNum: number): string {
    const p1 = fullName(team?.p1)?.trim() || team?.p1Name || '';
    const p2 = fullName(team?.p2)?.trim() || team?.p2Name || '';
    if (p1 && p2) return `${p1} / ${p2}`;
    if (p1 || p2) return p1 || p2;
    return team?.name || `Pareja ${fallbackTNum}`;
}

/**
 * Si todos los partidos de grupo entre equipos de `groupKey` están finalizados,
 * devuelve la tabla ordenada (índice 0 = 1º del grupo). Si no, null.
 */
function computeSortedGroup(
    tournament: any,
    matches: any[],
    groupKey: string,
): GroupTeamRow[] | null {
    const assignments = tournament?.groupAssignments?.[groupKey];
    if (!assignments?.length) return null;
    const teamsList = tournament?.teams ?? [];
    const teamIds = assignments as string[];
    if (teamIds.some((tid) => teamsList.findIndex((t: any) => String(t?.id) === String(tid)) < 0)) {
        return null;
    }

    const tNums = teamIds.map((tid) => {
        const idx = teamsList.findIndex((t: any) => String(t?.id) === String(tid));
        return idx + 1;
    });

    if (tNums.length === 0) return null;

    const intraMatches = matches.filter(
        (m) =>
            m.stage === 'GROUP_STAGE' &&
            tNums.includes(m.team1Index) &&
            tNums.includes(m.team2Index),
    );
    if (intraMatches.length === 0) return null;
    if (!intraMatches.every((m) => m.status === MatchStatus.FINISHED)) return null;

    const rows: GroupTeamRow[] = teamIds.map((tid) => {
        const teamIdx = teamsList.findIndex((t: any) => String(t?.id) === String(tid));
        const tNum = teamIdx + 1;
        const team = teamsList[teamIdx];
        let PJ = 0;
        let PG = 0;
        let JF = 0;
        let JC = 0;
        intraMatches
            .filter((m) => m.status === MatchStatus.FINISHED && (m.team1Index === tNum || m.team2Index === tNum))
            .forEach((m) => {
                const side = m.team1Index === tNum ? 't1' : 't2';
                const opp = side === 't1' ? 't2' : 't1';
                PJ++;
                JF += m.games?.[side] ?? 0;
                JC += m.games?.[opp] ?? 0;
                const sWon = m.sets?.[side] ?? 0;
                const sLost = m.sets?.[opp] ?? 0;
                const gWon = m.games?.[side] ?? 0;
                const gLost = m.games?.[opp] ?? 0;
                if (sWon > sLost || (sWon === sLost && gWon > gLost)) PG++;
            });
        const name = teamDisplayName(team, tNum);
        return { id: String(tid), name, tNum, PJ, PG, JF, JC, Pts: PG * 3 };
    });

    return sortStandings(rows, intraMatches);
}

function labelFromSide(match: any, side: 1 | 2): string {
    const team = side === 1 ? match.team1 : match.team2;
    const nm = side === 1 ? match.team1Name : match.team2Name;
    if (team?.teamLabel && typeof team.teamLabel === 'string') return team.teamLabel;
    if (typeof nm === 'string') return nm;
    return '';
}

function cloneTeamForMatch(tournament: any, tNum: number): any {
    const teamsList = tournament?.teams ?? [];
    const raw = teamsList[tNum - 1];
    if (!raw || typeof raw !== 'object') return null;
    const copy = { ...raw };
    delete copy.isTBD;
    delete copy.teamLabel;
    return copy;
}

function hydrateSide(
    match: any,
    side: 1 | 2,
    rankingsByLetter: Record<string, GroupTeamRow[] | null>,
    tournament: any,
): any {
    const team = side === 1 ? match.team1 : match.team2;
    const labelText = labelFromSide(match, side);
    const parsed = parseGroupQualifierLabel(labelText);
    if (!parsed) return match;

    const ranked = rankingsByLetter[parsed.letter];
    if (!ranked || ranked.length === 0) return match;

    const placeIdx = parsed.rank - 1;
    if (placeIdx < 0 || placeIdx >= ranked.length) return match;

    const winner = ranked[placeIdx];
    const hydrated = cloneTeamForMatch(tournament, winner.tNum);
    if (!hydrated) return match;

    const idx = Number(side === 1 ? match.team1Index : match.team2Index);
    const already = !team?.isTBD && idx === winner.tNum;
    if (already) return match;

    const display = winner.name || teamDisplayName(hydrated, winner.tNum);
    if (side === 1) {
        return {
            ...match,
            team1: hydrated,
            team1Index: winner.tNum,
            team1Name: display,
        };
    }
    return {
        ...match,
        team2: hydrated,
        team2Index: winner.tNum,
        team2Name: display,
    };
}

/**
 * Rellena equipos TBD en semifinales/final/cuartos cuando la etiqueta es "N° Grupo L"
 * y todos los partidos de ese grupo ya terminaron.
 */
/** True si la hidratación de clasificados cambió datos persistibles del partido. */
export function knockoutHydrationDiffers(before: any, after: any): boolean {
    if (!before || !after || String(before.id) !== String(after.id)) return false;
    if (Number(before.team1Index ?? 0) !== Number(after.team1Index ?? 0)) return true;
    if (Number(before.team2Index ?? 0) !== Number(after.team2Index ?? 0)) return true;
    if (String(before.team1Name ?? '') !== String(after.team1Name ?? '')) return true;
    if (String(before.team2Name ?? '') !== String(after.team2Name ?? '')) return true;
    if (!!before.team1?.isTBD !== !!after.team1?.isTBD) return true;
    if (!!before.team2?.isTBD !== !!after.team2?.isTBD) return true;
    if (String(before.team1?.teamLabel ?? '') !== String(after.team1?.teamLabel ?? '')) return true;
    if (String(before.team2?.teamLabel ?? '') !== String(after.team2?.teamLabel ?? '')) return true;
    return false;
}

export function hydrateGroupQualifierSlots(matches: any[], tournament: any): any[] {
    if (!tournament?.groupAssignments || !Array.isArray(matches)) return matches;

    const letterToKey = buildLetterToGroupKey(tournament.groupAssignments as Record<string, string[]>);
    const rankingsByLetter: Record<string, GroupTeamRow[] | null> = {};
    for (const letter of Object.keys(letterToKey)) {
        const gKey = letterToKey[letter];
        rankingsByLetter[letter] = computeSortedGroup(tournament, matches, gKey);
    }

    return matches.map((m) => {
        if (m.stage === 'GROUP_STAGE') return m;
        let next = m;
        next = hydrateSide(next, 1, rankingsByLetter, tournament);
        next = hydrateSide(next, 2, rankingsByLetter, tournament);
        return next;
    });
}
