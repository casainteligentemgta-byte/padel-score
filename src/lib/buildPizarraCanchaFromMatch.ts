import { MatchStatus } from '@/types/tournament';

const teamLineForPizarra = (t: { full?: string; p1?: string; p2?: string } | null | undefined) => {
    if (!t) return 'Equipo';
    const full = typeof t.full === 'string' ? t.full.trim() : '';
    if (full) return full;
    const p1 = typeof t.p1 === 'string' ? t.p1.trim() : '';
    const p2 = typeof t.p2 === 'string' ? t.p2.trim() : '';
    if (p1 && p2) return `${p1} / ${p2}`;
    return p1 || p2 || 'Equipo';
};

export type CourtTransferOverlay = {
    title: string;
    subtitle: string;
    ts: number;
    expires_at: number;
};

/**
 * Construye el JSON `data` de `pizarra_cancha_state` alineado con la sincronización del marcador (score page).
 */
export function buildPizarraCanchaPayload(opts: {
    tournamentId: string;
    match: Record<string, any>;
    tournament: Record<string, any> | null | undefined;
    isGoldenPoint: boolean;
    previousData?: Record<string, unknown> | null;
    courtTransferOverlay?: CourtTransferOverlay | null;
}): Record<string, unknown> {
    const { tournamentId, match, tournament, isGoldenPoint, previousData, courtTransferOverlay } = opts;
    const isLive = match?.status === MatchStatus.LIVE;
    const isFinished = match?.status === MatchStatus.FINISHED;
    const isStb =
        match.superTiebreak === true ||
        match.matchFormat === 'SUPER_TIEBREAK' ||
        match.matchFormat === 'SET_3_STB';
    const isTb = !!match.isTiebreak;

    const nombreEquipo1 = teamLineForPizarra(match.team1);
    const nombreEquipo2 = teamLineForPizarra(match.team2);

    const data = { ...(previousData || {}) };
    const marcadorPrev = (data.marcador as Record<string, unknown>) || {};
    const eq1 = (marcadorPrev.equipo_1 as Record<string, unknown>) || {};
    const eq2 = (marcadorPrev.equipo_2 as Record<string, unknown>) || {};

    const prevNonce = data.pizarra_refresh_nonce;
    const nonce =
        typeof prevNonce === 'number' && Number.isFinite(prevNonce) ? prevNonce + 1 : 1;

    const out: Record<string, unknown> = {
        ...data,
        estado: isFinished ? 'finalizado' : 'en_vivo',
        pizarra_refresh_nonce: nonce,
        torneo_id: tournamentId,
        partido_id: match.id,
        marcador: {
            ...marcadorPrev,
            status: match.status,
            puntos: { local: match.points?.t1 || '0', visitante: match.points?.t2 || '0' },
            games: { local: match.games?.t1 || 0, visitante: match.games?.t2 || 0 },
            sets: { local: match.sets?.t1 || 0, visitante: match.sets?.t2 || 0 },
            historico_sets: (match.setScores || []).map((s: any) => ({
                local: s.t1 ?? s.local ?? 0,
                visitante: s.t2 ?? s.visitante ?? 0,
            })),
            saque: { equipo: match.server?.team || 1, jugador: match.server?.player || 1 },
            modo_puntos: isStb ? 'super_tiebreak' : isTb ? 'tiebreak' : 'normal',
            super_tiebreak: !!match.superTiebreak,
            golden_point: isGoldenPoint,
            match_format: match.matchFormat || tournament?.matchFormat,
            tie_break_type: match.tieBreakType || tournament?.tieBreakType,
            equipo_1: { nombre: nombreEquipo1, color: eq1.color || '#CCFF00' },
            equipo_2: { nombre: nombreEquipo2, color: eq2.color || '#FF5500' },
            ultimo_update: Date.now(),
        },
    };

    if (courtTransferOverlay) {
        out.court_transfer_overlay = courtTransferOverlay;
    } else {
        delete out.court_transfer_overlay;
    }

    return out;
}

export function matchCourtNumber(m: { court?: number; courtIndex?: number } | null | undefined): number {
    if (!m) return 1;
    return Number(m.court ?? (m.courtIndex != null ? (m.courtIndex as number) + 1 : 1)) || 1;
}
