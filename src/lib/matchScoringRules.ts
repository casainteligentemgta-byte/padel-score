/**
 * Reglas de marcador según el formato del torneo (creación en /new-tournament).
 *
 * Nombres en UI (referencia):
 * - ONE_SET_6: un set a 6 juegos.
 * - ONE_SET_9: un set “largo” a 9 juegos (TB de set en 8-8).
 * - TWO_SHORT_SETS: dos sets cortos a 4 juegos; si el partido va 1-1 en sets → tramo decisivo (STB o TB según tieBreakType).
 * - TWO_NORMAL_SETS: dos sets largos a 6 juegos; si 1-1 en sets → mismo decisivo.
 *
 * - Juego: puntos 0/15/30/40/AD (o punto de oro si aplica).
 * - Tie-break **dentro** de un set (6-6, 4-4, 8-8…): siempre a 7 con margen 2 (no usa tieBreakType del torneo).
 * - Tras **1-1 en sets** (solo formatos con usesSuperTiebreakDecider): tieBreakType STB → 10 puntos con margen 2; TB → 7.
 */

export type MatchFormatId =
    | 'ONE_SET_6'
    | 'ONE_SET_9'
    | 'TWO_SHORT_SETS'
    | 'TWO_NORMAL_SETS'
    | string;

export interface ScoringRules {
    /** Juegos necesarios para ganar el set (salvo TB). */
    gamesToWinSet: number;
    /** Marcador de juegos a partir del cual se juega tie-break del set (ej. 6-6, 4-4, 8-8). */
    tiebreakGamesEntry: number;
    /** Puntos para ganar el tie-break de set (siempre 7 con margen 2 en la app). */
    setTiebreakPointsToWin: number;
    /** Sets que hay que ganar para cerrar el partido. */
    setsToWinMatch: number;
    /** Tras 1-1 en sets, el tercer segmento es super tie-break (no set al mejor de juegos). */
    usesSuperTiebreakDecider: boolean;
    /** Puntos para ganar el super tie-break (10 o 7 según torneo). */
    superTiebreakPointsToWin: number;
}

const DEFAULT_SET_TB = 7;

export function getScoringRules(
    matchFormat: MatchFormatId | undefined,
    tieBreakType: 'TB' | 'STB' | undefined
): ScoringRules {
    const stbPts = tieBreakType === 'STB' ? 10 : 7;

    switch (matchFormat) {
        case 'ONE_SET_9':
            return {
                gamesToWinSet: 9,
                tiebreakGamesEntry: 8,
                setTiebreakPointsToWin: DEFAULT_SET_TB,
                setsToWinMatch: 1,
                usesSuperTiebreakDecider: false,
                superTiebreakPointsToWin: stbPts,
            };
        case 'TWO_SHORT_SETS':
            return {
                gamesToWinSet: 4,
                tiebreakGamesEntry: 4,
                setTiebreakPointsToWin: DEFAULT_SET_TB,
                setsToWinMatch: 2,
                usesSuperTiebreakDecider: true,
                superTiebreakPointsToWin: stbPts,
            };
        case 'TWO_NORMAL_SETS':
            return {
                gamesToWinSet: 6,
                tiebreakGamesEntry: 6,
                setTiebreakPointsToWin: DEFAULT_SET_TB,
                setsToWinMatch: 2,
                usesSuperTiebreakDecider: true,
                superTiebreakPointsToWin: stbPts,
            };
        case 'ONE_SET_6':
        default:
            return {
                gamesToWinSet: 6,
                tiebreakGamesEntry: 6,
                setTiebreakPointsToWin: DEFAULT_SET_TB,
                setsToWinMatch: 1,
                usesSuperTiebreakDecider: false,
                superTiebreakPointsToWin: stbPts,
            };
    }
}

/** El set en curso termina por juegos (sin contar el punto del TB que cierra el set). */
export function isSetCompleteByGames(
    g1: number,
    g2: number,
    gamesToWin: number
): boolean {
    const a = Math.max(g1, g2);
    const diff = Math.abs(g1 - g2);
    if (a >= gamesToWin && diff >= 2) return true;
    if (a > gamesToWin) return true;
    return false;
}

export function shouldEnterSetTiebreak(
    g1: number,
    g2: number,
    tiebreakGamesEntry: number
): boolean {
    return g1 === tiebreakGamesEntry && g2 === tiebreakGamesEntry;
}

/** Gana el tie-break de set o STB: >= target y diferencia >= 2. */
export function winsTiebreakPoints(
    nextLeader: number,
    trailer: number,
    target: number
): boolean {
    return nextLeader >= target && nextLeader - trailer >= 2;
}
