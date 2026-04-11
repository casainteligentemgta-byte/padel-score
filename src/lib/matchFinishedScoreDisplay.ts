/**
 * Texto de resultado para partidos finalizados: el STB no es un "tercer set",
 * sino desempate a 10 cuando el marcador de sets va 1-1.
 */

function normSetRow(row: any): { t1: number; t2: number } | null {
    if (!row || typeof row !== 'object') return null;
    const t1 = Number(row.t1 ?? row.local ?? row.team1);
    const t2 = Number(row.t2 ?? row.visitante ?? row.team2);
    if (!Number.isFinite(t1) || !Number.isFinite(t2)) return null;
    return { t1, t2 };
}

/** Si hay 3 filas en setScores, sets 1-1 y la tercera parece STB (sin flags en BD). */
export function inferStbFromSetScoresOnly(match: any): boolean {
    const setScores = match?.setScores;
    if (!Array.isArray(setScores) || setScores.length < 3) return false;
    const s1 = normSetRow(setScores[0]);
    const s2 = normSetRow(setScores[1]);
    const s3 = normSetRow(setScores[2]);
    if (!s1 || !s2 || !s3) return false;
    const w1 = (s1.t1 > s1.t2 ? 1 : 0) + (s2.t1 > s2.t2 ? 1 : 0);
    const w2 = (s1.t2 > s1.t1 ? 1 : 0) + (s2.t2 > s2.t1 ? 1 : 0);
    if (w1 !== 1 || w2 !== 1) return false;
    if (s3.t1 === s3.t2) return false;
    const mx = Math.max(s3.t1, s3.t2);
    return mx >= 7;
}

function matchHasSuperTiebreak(match: any): boolean {
    const mf = match?.matchFormat;
    if (match?.superTiebreak === true) return true;
    if (mf === 'SET_3_STB' || mf === 'SUPER_TIEBREAK') return true;
    const stb = match?.superTiebreakScore;
    if (stb && typeof stb === 'object') {
        const a = Number(stb.t1 ?? 0);
        const b = Number(stb.t2 ?? 0);
        if (a > 0 || b > 0) return true;
    }
    const tbt = String(match?.tieBreakType ?? '').toUpperCase();
    if (tbt === 'STB') return true;
    return false;
}

/** Líneas listas para mostrar (cada una puede ir en un renglón). */
export function getFinishedMatchScoreLines(match: any): string[] {
    const setScores = Array.isArray(match?.setScores) ? match.setScores : [];
    const explicitStb = matchHasSuperTiebreak(match);
    const inferredStb = inferStbFromSetScoresOnly(match);
    const useStbLayout = explicitStb || inferredStb;
    const stbObj = match?.superTiebreakScore;
    const lines: string[] = [];

    if (useStbLayout && setScores.length >= 2) {
        const s1 = normSetRow(setScores[0]);
        const s2 = normSetRow(setScores[1]);
        if (s1) lines.push(`SET 1 · ${s1.t1}-${s1.t2}`);
        if (s2) lines.push(`SET 2 · ${s2.t1}-${s2.t2}`);

        let stbT1 = Number(stbObj?.t1 ?? 0);
        let stbT2 = Number(stbObj?.t2 ?? 0);
        if (stbT1 === 0 && stbT2 === 0 && setScores.length >= 3) {
            const third = normSetRow(setScores[2]);
            if (third && (third.t1 > 0 || third.t2 > 0)) {
                stbT1 = third.t1;
                stbT2 = third.t2;
            }
        }

        lines.push(`STB · ${stbT1}-${stbT2}`);
        return lines;
    }

    for (let i = 0; i < setScores.length; i++) {
        const r = normSetRow(setScores[i]);
        if (r) lines.push(`SET ${i + 1} · ${r.t1}-${r.t2}`);
    }

    if (lines.length === 0) {
        const t1 = Number(match?.sets?.t1 ?? 0);
        const t2 = Number(match?.sets?.t2 ?? 0);
        const g1 = match?.games?.t1;
        const g2 = match?.games?.t2;
        if (g1 != null && g2 != null) {
            lines.push(`Sets ${t1}-${t2} (${g1}-${g2})`);
        } else {
            lines.push(`Sets ${t1}-${t2}`);
        }
    }

    return lines;
}
