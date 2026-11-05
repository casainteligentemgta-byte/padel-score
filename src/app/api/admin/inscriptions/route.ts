import { NextResponse } from 'next/server';
import { isGuardResponse, requireAdmin } from '@/lib/apiGuard';
import { sanitizeString } from '@/lib/apiValidation';
import { notifyPlayerPaymentStatus, type PaymentNotifyStatus } from '@/lib/paymentApprovalNotify';
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

    const { data: previous, error: prevErr } = await supabase
        .from('inscriptions')
        .select('id, participant_name, participant_email, tournament_name, owner_id, user_id, participant_id, payment_status, data')
        .eq('id', id)
        .maybeSingle();
    if (prevErr) {
        return NextResponse.json({ error: prevErr.message }, { status: 500 });
    }

    const { error } = await supabase.from('inscriptions').update(upd).eq('id', id);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const nextStatus = typeof upd.payment_status === 'string' ? upd.payment_status : null;
    const prevStatus = previous?.payment_status != null ? String(previous.payment_status) : null;
    let notify: Awaited<ReturnType<typeof notifyPlayerPaymentStatus>> | undefined;
    if (nextStatus && nextStatus !== prevStatus) {
        try {
            notify = await notifyPlayerPaymentStatus({
                row: previous || { id },
                status: nextStatus as PaymentNotifyStatus,
                note: typeof upd.alert_message === 'string' ? upd.alert_message : null,
            });
            if (nextStatus === 'paid') {
                const recipient =
                    previous?.participant_id || previous?.owner_id || previous?.user_id || null;
                if (recipient) {
                    await supabase.from('notifications').insert({
                        user_id: recipient,
                        sender_id: auth.uid,
                        type: 'payment_approved',
                        message: `Tu pago para ${previous?.tournament_name || 'el torneo'} fue aprobado.`,
                        is_read: false,
                    });
                }
            }
        } catch (e) {
            console.warn('[admin/inscriptions] aviso al jugador:', e);
        }
    }

    return NextResponse.json({ ok: true, notify });
}
