import { MatchStatus, TournamentType } from '@/types/tournament';

/** Etiqueta de ronda del cuadro (alineado con el hub de categoría). */
export function getBracketStageLabel(match: any): string {
    if (!match) return '';
    if (match.stage === 'GROUP_STAGE') return 'Fase de Grupo';
    if (match.stage !== 'MAIN_DRAW') return 'Eliminatoria';

    if (match.roundName) {
        const name = String(match.roundName).toUpperCase();
        if (name.includes('SEMIFINAL')) return 'Semifinales';
        if (name.includes('CUARTOS')) return '4to';
        if (name.includes('OCTAVOS') || name.includes('8VO')) return '8vo';
        if (name.includes('16VOS') || name.includes('16VO')) return '16vo';
        if (name.includes('32VOS') || name.includes('32VO')) return '32vo';
        if (name.includes('64VOS') || name.includes('64VO')) return '64vo';
        if (name.includes('128VOS') || name.includes('128VO')) return '128vo';
        if (name.includes('FINAL') && !name.includes('OCTAVOS') && !name.includes('CUARTOS') && !name.includes('SEMI')) return 'Final';
        return match.roundName;
    }

    return 'Eliminatoria';
}

function isMatchFinished(status: any): boolean {
    return status === MatchStatus.FINISHED || status === 'COMPLETED';
}

/** Standings por pareja o jugador (misma lógica que el hub de categoría). */
export function calculateStandingsFromMatches(matches: any[], tournament: any): any[] {
    const standings: { [key: string]: any } = {};
    if (!Array.isArray(matches) || !tournament) return [];

    matches.filter((m) => isMatchFinished(m.status)).forEach((m) => {
        const isIndividual = tournament?.type === TournamentType.AMERICANO_INDIVIDUAL;

        const updateStats = (
            id: string,
            name: string,
            photo: string | null,
            gamesWon: number,
            gamesLost: number,
            setsWon: number = 0,
            setsLost: number = 0
        ) => {
            if (!standings[id]) {
                standings[id] = {
                    id,
                    name,
                    photo,
                    gamesWon: 0,
                    gamesLost: 0,
                    setsWon: 0,
                    setsLost: 0,
                    matchesWon: 0,
                    matchesPlayed: 0,
                };
            }
            standings[id].gamesWon += gamesWon;
            standings[id].gamesLost += gamesLost;
            standings[id].setsWon += setsWon;
            standings[id].setsLost += setsLost;
            standings[id].matchesPlayed += 1;
            if (setsWon > setsLost || (setsWon === 0 && setsLost === 0 && gamesWon > gamesLost)) {
                standings[id].matchesWon += 1;
            }
        };

        if (isIndividual) {
            const team1 = tournament.teams?.[m.team1Index - 1];
            const team2 = tournament.teams?.[m.team2Index - 1];

            if (team1) {
                updateStats(
                    team1.p1?.id || `p-${m.team1Index}-1`,
                    team1.p1?.name || `Jugador ${m.team1Index}-1`,
                    team1.p1?.photo ?? null,
                    m.games?.t1 || 0,
                    m.games?.t2 || 0,
                    m.sets?.t1 || 0,
                    m.sets?.t2 || 0
                );
                updateStats(
                    team1.p2?.id || `p-${m.team1Index}-2`,
                    team1.p2?.name,
                    team1.p2?.photo ?? null,
                    m.games?.t1 || 0,
                    m.games?.t2 || 0,
                    m.sets?.t1 || 0,
                    m.sets?.t2 || 0
                );
            }
            if (team2) {
                updateStats(
                    team2.p1?.id || `p-${m.team2Index}-1`,
                    team2.p1?.name || `Jugador ${m.team2Index}-1`,
                    team2.p1?.photo ?? null,
                    m.games?.t2 || 0,
                    m.games?.t1 || 0,
                    m.sets?.t2 || 0,
                    m.sets?.t1 || 0
                );
                updateStats(
                    team2.p2?.id || `p-${m.team2Index}-2`,
                    team2.p2?.name || `Jugador ${m.team2Index}-2`,
                    team2.p2?.photo ?? null,
                    m.games?.t2 || 0,
                    m.games?.t1 || 0,
                    m.sets?.t2 || 0,
                    m.sets?.t1 || 0
                );
            }
        } else {
            updateStats(
                `team-${m.team1Index}`,
                m.team1?.name || `Pareja ${m.team1Index}`,
                null,
                m.games?.t1 || 0,
                m.games?.t2 || 0,
                m.sets?.t1 || 0,
                m.sets?.t2 || 0
            );
            updateStats(
                `team-${m.team2Index}`,
                m.team2?.name || `Pareja ${m.team2Index}`,
                null,
                m.games?.t2 || 0,
                m.games?.t1 || 0,
                m.sets?.t2 || 0,
                m.sets?.t1 || 0
            );
        }
    });

    return Object.values(standings).sort((a: any, b: any) => {
        if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;
        const diffSetsA = a.setsWon - a.setsLost;
        const diffSetsB = b.setsWon - b.setsLost;
        if (diffSetsB !== diffSetsA) return diffSetsB - diffSetsA;
        const diffGamesA = a.gamesWon - a.gamesLost;
        const diffGamesB = b.gamesWon - b.gamesLost;
        if (diffGamesB !== diffGamesA) return diffGamesB - diffGamesA;
        return b.gamesWon - a.gamesWon;
    });
}

export type CategoryPodium = {
    first: { name: string };
    second?: { name: string };
    source: 'final' | 'standings';
};

function pickWinnerFromFinal(finalMatch: any): CategoryPodium {
    const s1 = finalMatch.sets?.t1 ?? 0;
    const s2 = finalMatch.sets?.t2 ?? 0;
    const g1 = finalMatch.games?.t1 ?? 0;
    const g2 = finalMatch.games?.t2 ?? 0;
    let winnerSide: 't1' | 't2' = 't1';
    if (s2 > s1) winnerSide = 't2';
    else if (s1 === s2 && g2 > g1) winnerSide = 't2';

    const winIdx = winnerSide === 't1' ? finalMatch.team1Index : finalMatch.team2Index;
    const loseIdx = winnerSide === 't1' ? finalMatch.team2Index : finalMatch.team1Index;
    const winName =
        (winnerSide === 't1' ? finalMatch.team1?.name : finalMatch.team2?.name) || `Pareja ${winIdx ?? '?'}`;
    const loseName =
        (winnerSide === 't1' ? finalMatch.team2?.name : finalMatch.team1?.name) || `Pareja ${loseIdx ?? '?'}`;

    return {
        first: { name: winName },
        second: { name: loseName },
        source: 'final',
    };
}

/**
 * Campeón y subcampeón de una categoría (torneo).
 * Prioridad: final del cuadro principal; si no hay, 1.º y 2.º de la clasificación general.
 */
export function resolveCategoryPodium(matches: any[], tournament: any): CategoryPodium | null {
    const list = Array.isArray(matches) ? matches : [];
    const mainFinished = list.filter((m: any) => isMatchFinished(m.status) && m.stage === 'MAIN_DRAW');

    let finalMatch = mainFinished.find((m: any) => getBracketStageLabel(m) === 'Final');

    if (!finalMatch && mainFinished.length) {
        const bracketed = mainFinished.filter((m: any) => m.bracketPosition?.round != null);
        if (bracketed.length) {
            const maxR = Math.max(...bracketed.map((m: any) => m.bracketPosition.round));
            const lastRound = bracketed.filter((m: any) => m.bracketPosition.round === maxR);
            if (lastRound.length === 1) finalMatch = lastRound[0];
        }
    }

    if (finalMatch) {
        return pickWinnerFromFinal(finalMatch);
    }

    if (!tournament) return null;

    const standings = calculateStandingsFromMatches(list, tournament);
    if (standings.length === 0) return null;

    return {
        first: { name: standings[0].name },
        second: standings.length > 1 ? { name: standings[1].name } : undefined,
        source: 'standings',
    };
}
