import { NextResponse } from 'next/server';
import { isGuardResponse, requireAdmin } from '@/lib/apiGuard';
import { sanitizeString } from '@/lib/apiValidation';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ADMIN_STATUSES = new Set([
    'pending',
    'paid',
    'alert',
    'exonerado',
    'rechazado',
    'revision',
]);

/**
 * PATCH: el admin cambia estado de pago / alerta. No pasa por el cliente de RLS.
 */
export async function PATCH(request: Request) {
    const auth = await requireAdmin(request);
    if (isGuardResponse(auth)) return auth;

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
        return NextResponse.json(
            { error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
            { status: 503 }
        );
    }

    let body: Record<string, unknown> = {};
    try {
        body = (await request.json()) as Record<string, unknown>;
    } catch {
        return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
    }

    const id = String(body.id ?? '').trim();
    if (!UUID_RE.test(id)) {
        return NextResponse.json({ error: 'id de inscripción inválido' }, { status: 400 });
    }

    const upd: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.paymentStatus != null) {
        const status = String(body.paymentStatus).trim().toLowerCase();
        if (!ADMIN_STATUSES.has(status)) {
            return NextResponse.json({ error: 'paymentStatus inválido' }, { status: 400 });
        }
        upd.payment_status = status;
    }
    if (body.alertMessage !== undefined) {
        upd.alert_message = body.alertMessage == null ? null : sanitizeString(body.alertMessage) || null;
    }
    if (body.receiptUrl != null) {
        upd.receipt_url = sanitizeString(body.receiptUrl) || null;
    }

    if (Object.keys(upd).length <= 1) {
        return NextResponse.json({ error: 'Sin cambios' }, { status: 400 });
    }

    const { error } = await supabase.from('inscriptions').update(upd).eq('id', id);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
}
