import { MatchStatus } from '@/types/tournament';
import { ScheduleEngine } from '@/services/ScheduleEngine';

/** Quita campos de vista / metadatos de fila antes de persistir en `tournament_matches.data`. */
export function stripMatchForPersistence(m: any) {
    if (!m || typeof m !== 'object') return m;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { team1, team2, id: _id, tournament_id: _tid, ...rest } = m;
    return rest;
}

/**
 * `matches` debe incluir el partido cerrado ya fusionado (status FINISHED, sets, tiempos, etc.).
 * Devuelve la lista completa con propagación de ganador al cuadro y horarios recalculados.
 */
export function computeMatchesAfterMatchFinish(
    matches: any[],
    matchId: string,
    bufferMinutes: number
): any[] {
    const finishedMatch = matches.find((m) => m.id === matchId);
    if (!finishedMatch) return matches;

    const finalScore =
        finishedMatch.score ||
        (finishedMatch.sets ? `${finishedMatch.sets.t1}-${finishedMatch.sets.t2}` : '0-0');
    const t1 = Number(finishedMatch.sets?.t1 ?? 0);
    const t2 = Number(finishedMatch.sets?.t2 ?? 0);
    const winnerIndex =
        finishedMatch.sets && t1 > t2
            ? finishedMatch.team1Index
            : finishedMatch.team2Index;

    const roundUpper = (x: any) => (x.roundName || '').toUpperCase();
    const isSemi = (x: any) => roundUpper(x).includes('SEMIFINAL') || x.stage === 'SEMIFINAL';
    const isFinalMatch = (x: any) =>
        x.roundName === 'FINAL' || roundUpper(x) === 'FINAL' || x.stage === 'FINAL';

    const updatedMatches = matches.map((m) => {
        if (m.id === matchId) {
            return { ...m, status: MatchStatus.FINISHED, score: finalScore };
        }

        if (
            finishedMatch.stage === 'MAIN_DRAW' &&
            m.stage === 'MAIN_DRAW' &&
            finishedMatch.bracketPosition
        ) {
            const nextRound = finishedMatch.bracketPosition.round + 1;
            const nextPos = Math.ceil(finishedMatch.bracketPosition.position / 2);
            const isTeam1 = finishedMatch.bracketPosition.position % 2 !== 0;

            if (
                m.bracketPosition?.round === nextRound &&
                m.bracketPosition?.position === nextPos
            ) {
                return {
                    ...m,
                    [isTeam1 ? 'team1Index' : 'team2Index']: winnerIndex,
                };
            }
        }

        if (
            finishedMatch.stage === 'MAIN_DRAW' &&
            isSemi(finishedMatch) &&
            !finishedMatch.bracketPosition &&
            isFinalMatch(m)
        ) {
            const semis = matches
                .filter((mx: any) => isSemi(mx))
                .sort(
                    (a: any, b: any) =>
                        new Date(a.scheduledTime || 0).getTime() -
                            new Date(b.scheduledTime || 0).getTime() ||
                        String(a.id || '').localeCompare(String(b.id || ''))
                );
            const semiIndex = semis.findIndex((s: any) => s.id === matchId);
            if (semiIndex === 0) return { ...m, team1Index: winnerIndex };
            if (semiIndex === 1) return { ...m, team2Index: winnerIndex };
        }

        return m;
    });

    const autocorrected = ScheduleEngine.recalculateRemainingMatches(
        updatedMatches,
        bufferMinutes
    );
    return updatedMatches.map((m) => {
        const update = autocorrected.find((u) => u.id === m.id);
        return update ? { ...m, scheduledTime: update.scheduledTime } : m;
    });
}

export type MatchFinishUpdateFn = (
    tournamentId: string,
    matchId: string,
    data: any
) => Promise<void>;

/**
 * Persiste el cierre y las actualizaciones derivadas (cuadro + horarios).
 * Caller debe pasar `matches` con el partido `matchId` ya fusionado al estado final deseado.
 */
export async function persistMatchFinishWithPropagation(params: {
    tournamentId: string;
    bufferMinutes: number;
    matches: any[];
    matchId: string;
    updateMatch: MatchFinishUpdateFn;
}): Promise<{ finalMatches: any[] }> {
    const { tournamentId, bufferMinutes, matches, matchId, updateMatch } = params;
    const finalMatches = computeMatchesAfterMatchFinish(matches, matchId, bufferMinutes);
    const finished = finalMatches.find((m) => m.id === matchId);
    if (!finished) {
        throw new Error(`[persistMatchFinishWithPropagation] Partido no encontrado: ${matchId}`);
    }

    await updateMatch(tournamentId, matchId, stripMatchForPersistence(finished));

    const others = finalMatches.filter((m) => m.id !== matchId);
    const settled = await Promise.allSettled(
        others.map((m) =>
            updateMatch(tournamentId, m.id, {
                ...stripMatchForPersistence(m),
                scheduledTime: m.scheduledTime,
            })
        )
    );
    settled.forEach((r, i) => {
        if (r.status === 'rejected') {
            console.warn(
                '[persistMatchFinishWithPropagation] Fallo al actualizar partido derivado:',
                others[i]?.id,
                r.reason,
            );
        }
    });

    return { finalMatches };
}

/** Misma regla que el dashboard para disparar auto-generación del cuadro principal. */
export function shouldSuggestAutoMainDraw(
    isRoundRobin: boolean,
    finalMatches: any[],
    finishedMatchStage: string | undefined
): boolean {
    const hasBracketNow = finalMatches.some((m) => m.stage === 'MAIN_DRAW');
    const groupMatches = finalMatches.filter((m) => m.stage === 'GROUP_STAGE');
    const allGroupsFinished =
        groupMatches.length > 0 &&
        groupMatches.every((m) => m.status === MatchStatus.FINISHED);
    return (
        isRoundRobin &&
        !hasBracketNow &&
        finishedMatchStage === 'GROUP_STAGE' &&
        allGroupsFinished
    );
}
