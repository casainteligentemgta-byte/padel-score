import { NextResponse } from 'next/server';
import { isGuardResponse, requireAuth } from '@/lib/apiGuard';
import { checkRateLimit } from '@/lib/rateLimit';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { isValidVeCedula, normalizeVeCedula } from '@/lib/veIdentity';

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Comprueba si una cédula ya está en otra ficha (service role / RPC, no depende de RLS).
 */
export async function POST(req: Request) {
    const auth = await requireAuth(req);
    if (isGuardResponse(auth)) return auth;

    if (!checkRateLimit(req, { max: 20, windowMs: 60_000, bucket: 'check-dni' })) {
        return NextResponse.json({ error: 'Demasiadas consultas. Intenta más tarde.' }, { status: 429 });
    }

    let body: { dni?: string; excludeId?: string } = {};
    try {
        body = (await req.json()) as { dni?: string; excludeId?: string };
    } catch {
        return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
    }

    const dni = String(body.dni || '').trim();
    if (!isValidVeCedula(dni)) {
        return NextResponse.json({ error: 'Cédula inválida.' }, { status: 400 });
    }

    const excludeId =
        typeof body.excludeId === 'string' && UUID_RE.test(body.excludeId.trim())
            ? body.excludeId.trim()
            : null;

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
        return NextResponse.json(
            { error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
            { status: 503 }
        );
    }

    const { data, error } = await supabase.rpc('participant_dni_taken', {
        p_dni: normalizeVeCedula(dni),
        p_exclude: excludeId,
    });
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ taken: Boolean(data) });
}
