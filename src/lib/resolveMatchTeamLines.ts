/**
 * Misma resolución de nombres que el marcador del torneo (score / grilla),
 * para rellenar marker y pizarra cuando solo hay match + tournament en BD.
 */

// Detecta placeholders tipo "Jugador 1", "Pareja 2", etc. para no mostrarlos como si fueran nombres reales.
const PH = /^(pareja\s*\d*|jugador\s*\d*|player\s*\d*|equipo\s*\d*|placeholder|tbd|\?|j\d+|p\d+)$/i;

function isReal(s: string) {
    if (!s) return false;
    const trimmed = s.trim();
    if (!trimmed || trimmed === '?' || trimmed === '-') return false;
    return !PH.test(trimmed);
}

function resolveNames(
    embeddedTeam: any,
    teamIdx: number,
    matchTeamName: string | undefined,
    matchTeamId: string | undefined,
    teams: any[],
): string {
    if (embeddedTeam) {
        if (embeddedTeam.isTBD) {
            return (embeddedTeam.teamLabel || 'TBD').trim() || 'TBD';
        }
        /** Master / cuadro suelen persistir la línea en `full` sin objetos p1/p2. */
        const fullLine =
            typeof embeddedTeam.full === 'string' ? embeddedTeam.full.trim() : '';
        if (isReal(fullLine)) {
            const parts = fullLine.split(/\s*\/\s*/).map((s: string) => s.trim()).filter(Boolean);
            if (parts.length >= 2) return fullLine;
            if (parts.length === 1 && isReal(parts[0])) return parts[0];
        }
        const altLine = typeof embeddedTeam.name === 'string' ? embeddedTeam.name.trim() : '';
        if (isReal(altLine)) {
            const parts = altLine.split(/\s*\/\s*/).map((s: string) => s.trim()).filter(Boolean);
            if (parts.length >= 2) return altLine;
            if (parts.length === 1 && isReal(parts[0])) return parts[0];
        }
        const p1n = (embeddedTeam.p1?.name || embeddedTeam.p1Name || '').trim();
        const p2n = (embeddedTeam.p2?.name || embeddedTeam.p2Name || '').trim();
        if (isReal(p1n) || isReal(p2n)) {
            const p1f = isReal(p1n) ? p1n : '?';
            const p2f = isReal(p2n) ? p2n : '';
            return [p1f, p2f].filter(Boolean).join(' / ');
        }
    }
    if (matchTeamName && isReal(matchTeamName)) {
        const parts = matchTeamName.split('/').map((s: string) => s.trim()).filter(isReal);
        if (parts.length >= 2) return matchTeamName.trim();
        if (parts.length === 1) return parts[0];
    }
    const byId = matchTeamId ? teams.find((tm: any) => tm.id === matchTeamId || tm.teamId === matchTeamId) : null;
    const byIdx = teamIdx > 0 ? teams[teamIdx - 1] : (teams[teamIdx] ?? null);
    const tData = byId || byIdx || null;
    if (tData) {
        const fullLine = (tData.full || tData.teamName || tData.name || '').toString().trim();
        if (isReal(fullLine)) {
            const parts = fullLine.split(/\s*\/\s*/).map((s: string) => s.trim()).filter(Boolean);
            if (parts.length >= 2) return fullLine;
            if (parts.length === 1 && isReal(parts[0])) return parts[0];
        }
        const p1n = (tData.p1?.name || tData.p1Name || '').trim();
        const p2n = (tData.p2?.name || tData.p2Name || '').trim();
        if (isReal(p1n) || isReal(p2n)) {
            return [p1n, p2n].filter(isReal).join(' / ');
        }
    }
    return (matchTeamName || '').trim() || '';
}

export function resolveMatchTeamLines(
    match: any,
    tournament: any | null | undefined,
): { team1: string; team2: string } {
    const teams: any[] = tournament?.teams || [];
    const line1 = resolveNames(
        match?.team1,
        match?.team1Index ?? 0,
        match?.team1Name,
        match?.team1Id || match?.team1?.id,
        teams,
    );
    const line2 = resolveNames(
        match?.team2,
        match?.team2Index ?? 0,
        match?.team2Name,
        match?.team2Id || match?.team2?.id,
        teams,
    );
    return {
        team1: line1 || 'Equipo 1',
        team2: line2 || 'Equipo 2',
    };
}

/** Nombre genérico de marcador / placeholder que conviene sustituir por datos del partido. */
export function isGenericEquipoNombre(nombre: string | undefined | null, defaultLabel: string): boolean {
    const s = (nombre || '').trim();
    if (!s) return true;
    if (s === defaultLabel) return true;
    if (/^(equipo|jugador|pareja|player|tbd)\s*\d*$/i.test(s)) return true;
    if (s === '?' || s === '-') return true;
    return false;
}
