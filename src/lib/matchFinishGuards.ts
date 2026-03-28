import { getScoringRules } from '@/lib/matchScoringRules';

/**
 * Criterio alineado con winSet del marcador sala (score): sets >= a ganar el partido,
 * respetando desempate a super tie-break (1-1 sin STB activo → no cerrar).
 */
export function shouldAutoFinishBySetsReferee(match: any, tournament: any): boolean {
    if (!match) return false;
    const s = String(match?.status || '').trim().toUpperCase();
    if (s === 'FINISHED' || s === 'FINALIZADO' || s === 'COMPLETE' || s === 'COMPLETED') return false;

    const rules = getScoringRules(
        match?.matchFormat || tournament?.matchFormat,
        match?.tieBreakType || tournament?.tieBreakType
    );
    let need = rules.setsToWinMatch;
    const needRaw = Number(match?.sets_to_win_match ?? match?.setsToWinMatch);
    if (Number.isFinite(needRaw) && needRaw >= 1) need = needRaw;

    const t1 = Number(match?.sets?.t1 ?? 0);
    const t2 = Number(match?.sets?.t2 ?? 0);
    if (t1 < need && t2 < need) return false;
    if (rules.usesSuperTiebreakDecider && t1 === 1 && t2 === 1 && !match.superTiebreak) return false;
    return true;
}
