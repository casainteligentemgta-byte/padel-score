import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authServerSupabase';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import {
    buildPizarraCanchaPayload,
    matchCourtNumber,
} from '@/lib/buildPizarraCanchaFromMatch';

type Ctx = { params: Promise<{ id: string; matchId: string }> };

function normalizeStatus(s: string | undefined): string {
    return (s || '').trim().toUpperCase();
}

export async function POST(req: Request, ctx: Ctx) {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
        return NextResponse.json(
            { error: 'Servidor sin SUPABASE_SERVICE_ROLE_KEY (traslado atómico no disponible).' },
            { status: 501 }
        );
    }

    const { id: tournamentId, matchId } = await ctx.params;
    let body: { toCourt?: number; isGoldenPoint?: boolean };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
    }

    const toCourt = Number(body?.toCourt);
    if (!Number.isFinite(toCourt) || toCourt < 1 || toCourt > 99) {
        return NextResponse.json({ error: 'toCourt inválido' }, { status: 400 });
    }

    const [{ data: tRow, error: tErr }, { data: mRow, error: mErr }, { data: prof }] = await Promise.all([
        supabase.from('tournaments').select('owner_id, data').eq('id', tournamentId).single(),
        supabase.from('tournament_matches').select('data').eq('tournament_id', tournamentId).eq('id', matchId).single(),
        supabase.from('profiles').select('role, marker_canchas').eq('id', auth.uid).maybeSingle(),
    ]);

    if (tErr || !tRow) {
        return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 });
    }
    if (mErr || !mRow?.data) {
        return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });
    }

    const match = mRow.data as Record<string, any>;
    const fromCourt = matchCourtNumber(match);
    const role = (prof?.role || 'player').toLowerCase();
    const markerCanchas: string[] = Array.isArray(prof?.marker_canchas) ? prof.marker_canchas : [];
    const canchaFromId = `cancha_${fromCourt}`;

    const isOwner = tRow.owner_id === auth.uid;
    const isAdmin = role === 'admin';
    const isMarkerHere = role === 'marker' && markerCanchas.includes(canchaFromId);

    if (!isOwner && !isAdmin && !isMarkerHere) {
        return NextResponse.json(
            { error: 'No autorizado para trasladar este partido desde esta cancha.' },
            { status: 403 }
        );
    }

    if (normalizeStatus(match.status) !== 'LIVE') {
        return NextResponse.json({ error: 'Solo se puede trasladar un partido en vivo.' }, { status: 400 });
    }

    if (fromCourt === toCourt) {
        return NextResponse.json({ error: 'El partido ya está en esa pista.' }, { status: 400 });
    }

    const tData = (tRow.data || {}) as Record<string, any>;
    const courtNames: string[] = Array.isArray(tData.courtNames) ? tData.courtNames : [];
    const courtName =
        courtNames[toCourt - 1]?.trim() || `Pista ${toCourt}`;

    const { data: pizarraOrigin } = await supabase
        .from('pizarra_cancha_state')
        .select('data')
        .eq('cancha_id', canchaFromId)
        .maybeSingle();

    const now = Date.now();
    const overlay = {
        title: 'PARTIDO TRASLADADO',
        subtitle: 'CONTINÚA AQUÍ',
        ts: now,
        expires_at: now + 12000,
    };

    const matchForPayload = {
        ...match,
        court: toCourt,
        courtIndex: toCourt - 1,
        courtName,
    };

    const pizarraDestination = buildPizarraCanchaPayload({
        tournamentId,
        match: matchForPayload,
        tournament: tData,
        isGoldenPoint: body.isGoldenPoint !== false,
        previousData: (pizarraOrigin?.data as Record<string, unknown>) || null,
        courtTransferOverlay: overlay,
    });

    const { data: rpcResult, error: rpcErr } = await supabase.rpc('change_match_court_atomic', {
        p_tournament_id: tournamentId,
        p_match_id: matchId,
        p_from_court: fromCourt,
        p_to_court: toCourt,
        p_pizarra_destination: pizarraDestination,
        p_court_name: courtName,
    });

    if (rpcErr) {
        console.error('[change-court] rpc', rpcErr);
        return NextResponse.json({ error: rpcErr.message || 'Error en traslado' }, { status: 500 });
    }

    const result = rpcResult as { ok?: boolean; error?: string } | null;
    if (!result?.ok) {
        const code = result?.error || 'unknown';
        const msg =
            code === 'destination_has_live_match'
                ? 'La pista de destino ya tiene un partido en vivo.'
                : code === 'from_court_mismatch'
                  ? 'La cancha de origen no coincide con el partido (actualiza y reintenta).'
                  : code === 'match_not_live'
                    ? 'El partido no está en vivo.'
                    : 'No se pudo completar el traslado.';
        return NextResponse.json({ error: msg, code }, { status: 409 });
    }

    return NextResponse.json({
        ok: true,
        fromCourt,
        toCourt,
        courtName,
        match: { ...match, court: toCourt, courtIndex: toCourt - 1, courtName },
    });
}
