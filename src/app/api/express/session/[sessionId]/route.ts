import { NextResponse } from 'next/server';
import { updateExpressMatchBySession } from '@/lib/expressMatchDb';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { normalizeExpressMatch, type ExpressMatch } from '@/types/expressMatch';

type Ctx = { params: Promise<{ sessionId: string }> };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_UPDATE_KEYS = new Set<keyof ExpressMatch | string>([
    'session_id',
    'team_a_name',
    'team_b_name',
    'team_a_p1_first',
    'team_a_p1_last',
    'team_a_p2_first',
    'team_a_p2_last',
    'team_b_p1_first',
    'team_b_p1_last',
    'team_b_p2_first',
    'team_b_p2_last',
    'team_a_avatar',
    'team_b_avatar',
    'team_a_points',
    'team_b_points',
    'team_a_games',
    'team_b_games',
    'sets_a',
    'sets_b',
    'current_set',
    'modo_puntos',
    'punto_de_oro',
    'third_set_mode',
    'is_active',
    'display_name_scale',
    'display_media_scale',
    'display_ticker_phrases',
    'qr_expires_at',
    'server_team',
    'server_player',
    'warmup_ends_at',
    'match_started_at',
    'chrono_elapsed_sec',
    'match_ended_at',
    'side_change_until',
]);

function sanitizeUpdates(raw: unknown): Partial<ExpressMatch> {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
        if (!ALLOWED_UPDATE_KEYS.has(key)) continue;
        if (key === 'id' || key === 'cancha_code' || key === 'created_at') continue;
        out[key] = value;
    }
    return out as Partial<ExpressMatch>;
}

/**
 * PATCH: actualiza el partido Express si el session_id (token del QR) coincide.
 * GET: snapshot para el mando (opcional).
 */
export async function GET(_req: Request, { params }: Ctx) {
    const { sessionId } = await params;
    if (!UUID_RE.test(sessionId)) {
        return NextResponse.json({ error: 'session_id inválido' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
        return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 });
    }

    const { data, error } = await supabase
        .from('express_matches')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
        return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ match: normalizeExpressMatch(data as Record<string, unknown>) });
}

export async function PATCH(req: Request, { params }: Ctx) {
    const { sessionId } = await params;
    if (!UUID_RE.test(sessionId)) {
        return NextResponse.json({ error: 'session_id inválido', reason: 'error' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
        return NextResponse.json({ error: 'Servicio no disponible', reason: 'error' }, { status: 503 });
    }

    let body: { updates?: unknown } = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'JSON inválido', reason: 'error' }, { status: 400 });
    }

    const updates = sanitizeUpdates(body.updates ?? body);
    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: 'Sin cambios permitidos', reason: 'error' }, { status: 400 });
    }

    const result = await updateExpressMatchBySession(supabase, sessionId, updates);
    if (!result.ok) {
        const status = result.reason === 'stale_session' ? 409 : 500;
        return NextResponse.json(
            { ok: false, error: result.message, reason: result.reason },
            { status }
        );
    }

    return NextResponse.json({ ok: true, match: result.match });
}
