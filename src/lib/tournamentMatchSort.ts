/**
 * Orden de partidos en vistas del torneo: primero por horario programado (cronológico),
 * luego por número de partido / orden o posición de bracket.
 */

function toMs(v: unknown): number {
    if (v == null) return 0;
    if (typeof (v as { toDate?: () => Date })?.toDate === 'function') {
        return (v as { toDate: () => Date }).toDate().getTime();
    }
    const t = v as { seconds?: number; nanoseconds?: number };
    if (typeof t.seconds === 'number') {
        return t.seconds * 1000 + Math.floor((t.nanoseconds ?? 0) / 1e6);
    }
    if (typeof v === 'string' || v instanceof Date) {
        const x = new Date(v as string | Date).getTime();
        return Number.isFinite(x) ? x : 0;
    }
    return 0;
}

type MatchLike = Record<string, unknown> | null | undefined;

function firstScheduleField(m: MatchLike): unknown {
    if (!m) return null;
    const c = m as Record<string, unknown>;
    const pick = (...keys: string[]) => {
        for (const k of keys) {
            const v = c[k];
            if (v != null && v !== '') return v;
        }
        return null;
    };
    // camelCase (JSON) + snake_case (columnas / API)
    return pick(
        'scheduledStartTime',
        'scheduled_start_time',
        'scheduledTime',
        'scheduled_time',
        'time',
        'startTime',
        'start_time'
    );
}

/** Milisegundos del inicio programado (prioriza campos alineados con el marcador / Supabase / Firebase). */
export function toMatchScheduleMs(m: { scheduledStartTime?: unknown; scheduledTime?: unknown; time?: unknown } | null | undefined): number {
    if (!m) return 0;
    const v = firstScheduleField(m);
    return toMs(v);
}

/**
 * Número estable para desempate: `match_number`, `bracketPosition`, etc.
 * Valores altos = sin dato, van al final entre empates de hora.
 */
export function getMatchOrderKey(m: Record<string, unknown> | null | undefined): number {
    if (!m) return 1e9;
    const n = Number(m.match_number ?? m.matchNumber ?? m.match_order ?? m.order ?? m.orden);
    if (Number.isFinite(n) && n > 0) return n;
    const bp = m.bracketPosition as { round?: number; matchInRound?: number; position?: number } | undefined;
    if (bp && typeof bp === 'object') {
        const r = Number(bp.round);
        const g = Number(bp.matchInRound ?? bp.position);
        if (Number.isFinite(r) && r > 0 && Number.isFinite(g) && g >= 0) {
            return r * 100_000 + g;
        }
    }
    return 1e9;
}

/** Compara para Array.sort: horario ASC, luego nº de partido ASC. */
export function compareTournamentMatches(a: Record<string, unknown>, b: Record<string, unknown>): number {
    const ta = toMatchScheduleMs(a);
    const tb = toMatchScheduleMs(b);
    if (ta !== tb) return ta - tb;
    return getMatchOrderKey(a) - getMatchOrderKey(b);
}

/** Copia ordenada; no muta el array de entrada. */
export function sortTournamentMatchesForDisplay<T extends Record<string, unknown>>(matches: T[] | null | undefined): T[] {
    if (!matches?.length) return [];
    return [...matches].sort(compareTournamentMatches);
}
