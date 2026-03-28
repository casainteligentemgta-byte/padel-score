import { MatchStatus } from '@/types/tournament';

function roundUpper(x: any): string {
    return String(x?.roundName || '').toUpperCase();
}

function isConsolation(x: any): boolean {
    return roundUpper(x).includes('CONSOL');
}

export function isKnockoutSemifinal(x: any): boolean {
    return roundUpper(x).includes('SEMIFINAL') || x?.stage === 'SEMIFINAL';
}

/** Final del cuadro principal (no consolación). */
export function isMainDrawFinal(x: any): boolean {
    if (!x || isConsolation(x)) return false;
    const u = roundUpper(x);
    if (x.stage === 'FINAL') return true;
    if (u === 'FINAL') return true;
    if (u.includes('FINAL') && !u.includes('SEMIFINAL')) return true;
    if (x.isFinal === true) return true;
    return false;
}

function mainSemifinals(matches: any[]): any[] {
    return matches
        .filter((m) => isKnockoutSemifinal(m) && !isConsolation(m))
        .sort((a, b) => {
            const ta = new Date(a.scheduledTime || a.time || 0).getTime();
            const tb = new Date(b.scheduledTime || b.time || 0).getTime();
            if (ta !== tb) return ta - tb;
            return String(a.id || '').localeCompare(String(b.id || ''));
        });
}

function fullName(p: any): string {
    if (!p) return '';
    return [p.name, p.lastName].filter(Boolean).join(' ').trim() || (typeof p.name === 'string' ? p.name : '') || '';
}

function displayLine(team: any, fallbackName: string | undefined, idx: number): string {
    const p1 = fullName(team?.p1)?.trim() || team?.p1Name || '';
    const p2 = fullName(team?.p2)?.trim() || team?.p2Name || '';
    if (p1 && p2) return `${p1} / ${p2}`;
    if (p1 || p2) return p1 || p2;
    if (typeof team?.name === 'string' && team.name.trim()) return team.name.trim();
    const fb = (fallbackName || '').trim();
    if (fb) return fb;
    return `Pareja ${idx}`;
}

/**
 * Equipo ganador de un partido ya FINISHED (por sets).
 */
export function winnerSlotFromFinishedMatch(
    finishedMatch: any,
    tournament: any | undefined,
): { idx: number; team: any; name: string } | null {
    if (!finishedMatch || finishedMatch.status !== MatchStatus.FINISHED) return null;
    const t1 = Number(finishedMatch.sets?.t1 ?? 0);
    const t2 = Number(finishedMatch.sets?.t2 ?? 0);
    if (t1 === t2) return null;
    const win1 = t1 > t2;
    const idx = Number(win1 ? finishedMatch.team1Index : finishedMatch.team2Index);
    if (!Number.isFinite(idx) || idx < 1) return null;
    const raw = win1 ? finishedMatch.team1 : finishedMatch.team2;
    const nameFallback = (win1 ? finishedMatch.team1Name : finishedMatch.team2Name) as string | undefined;

    const teamsList = tournament?.teams ?? [];
    const fromT = teamsList[idx - 1];

    let team: any;
    if (fromT && typeof fromT === 'object') {
        team = { ...fromT };
        delete team.isTBD;
        delete team.teamLabel;
    } else if (raw && typeof raw === 'object') {
        team = { ...raw };
        delete team.isTBD;
        delete team.teamLabel;
    } else {
        const parts = (nameFallback || '').split(/\s*\/\s*/);
        team = {
            p1: { name: (parts[0] || '').trim() || `J${idx * 2 - 1}` },
            p2: { name: (parts[1] || '').trim() || '' },
        };
    }

    const name = displayLine(team, nameFallback, idx);
    return { idx, team, name };
}

/**
 * Rellena la final con los ganadores de las semifinales del cuadro principal
 * (1.ª semi programada → lado 1, 2.ª → lado 2), copiando equipo y nombres.
 */
export function hydrateFinalFromFinishedSemifinals(matches: any[], tournament?: any): any[] {
    if (!Array.isArray(matches) || matches.length === 0) return matches;

    const semis = mainSemifinals(matches);
    if (semis.length === 0) return matches;

    return matches.map((m) => {
        if (!isMainDrawFinal(m)) return m;
        let next = { ...m };
        const s0 = semis[0];
        const s1 = semis[1];
        if (s0?.status === MatchStatus.FINISHED) {
            const w = winnerSlotFromFinishedMatch(s0, tournament);
            if (w) {
                next = { ...next, team1Index: w.idx, team1: w.team, team1Name: w.name };
            }
        }
        if (s1?.status === MatchStatus.FINISHED) {
            const w = winnerSlotFromFinishedMatch(s1, tournament);
            if (w) {
                next = { ...next, team2Index: w.idx, team2: w.team, team2Name: w.name };
            }
        }
        return next;
    });
}
