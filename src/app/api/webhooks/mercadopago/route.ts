import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { dataService } from '@/lib/dataService';
import {
    expectedAmountForInscription,
    flattenTournamentRow,
    isPayableInscriptionStatus,
    type InscriptionPriceRow,
    type TournamentPriceSource,
} from '@/lib/inscriptionPricing';
import {
    amountsMatch,
    mercadoPagoDataId,
    MERCADOPAGO_EXPECTED_CURRENCY,
    verifyMercadoPagoWebhookSignature,
} from '@/lib/mercadopagoWebhook';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

const getClient = () => {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) return null;
    const config = new MercadoPagoConfig({ accessToken: token });
    return new Payment(config);
};

/**
 * POST: notificación de Mercado Pago.
 * Valida x-signature (HMAC), reconsulta el pago en la API, comprueba monto/moneda
 * e inscripción pendiente, y es idempotente por payment_id.
 */
export async function POST(request: Request) {
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim();
    if (!secret) {
        console.error('[webhooks/mercadopago] Falta MERCADOPAGO_WEBHOOK_SECRET');
        return NextResponse.json({ error: 'Webhook no configurado' }, { status: 401 });
    }

    const paymentClient = getClient();
    if (!paymentClient) {
        console.warn('[webhooks/mercadopago] MERCADOPAGO_ACCESS_TOKEN no configurado');
        return NextResponse.json({ ok: false }, { status: 501 });
    }

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
        return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 });
    }

    let body: { type?: string; action?: string; data?: { id?: string } } = {};
    try {
        body = (await request.json()) as typeof body;
    } catch {
        return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
    }

    const dataId = mercadoPagoDataId(request.url, body?.data?.id);
    const validSig = verifyMercadoPagoWebhookSignature({
        xSignature: request.headers.get('x-signature'),
        xRequestId: request.headers.get('x-request-id'),
        dataId,
        secret,
    });
    if (!validSig) {
        return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
    }

    const type = body?.type || body?.action;
    const isPayment = type === 'payment' || String(type || '').startsWith('payment.');
    if (!isPayment || !dataId) {
        return NextResponse.json({ ok: true });
    }

    try {
        const paymentId = String(dataId);
        const payment = await paymentClient.get({ id: paymentId });
        const status = String((payment as { status?: string })?.status || '');
        const externalRef = (payment as { external_reference?: unknown })?.external_reference;
        const transactionAmount = Number((payment as { transaction_amount?: unknown })?.transaction_amount);
        const currencyId = String((payment as { currency_id?: unknown })?.currency_id || '').toUpperCase();

        if (status !== 'approved' || !externalRef || typeof externalRef !== 'string') {
            return NextResponse.json({ ok: true });
        }

        const { data: already } = await supabase
            .from('mercadopago_processed_payments')
            .select('payment_id')
            .eq('payment_id', paymentId)
            .maybeSingle();
        if (already?.payment_id) {
            return NextResponse.json({ ok: true, idempotent: true });
        }

        const inscriptionIds = externalRef.split(',').map((s) => s.trim()).filter(Boolean);
        if (inscriptionIds.length === 0) {
            return NextResponse.json({ ok: true });
        }

        const { data: rows, error: insErr } = await supabase
            .from('inscriptions')
            .select('id, tournament_id, category_key, category_price, payment_status')
            .in('id', inscriptionIds);
        if (insErr) {
            console.error('[webhooks/mercadopago] inscriptions:', insErr);
            return NextResponse.json({ error: 'Error leyendo inscripciones' }, { status: 500 });
        }

        const inscriptions = (rows || []) as InscriptionPriceRow[];
        if (inscriptions.length === 0) {
            return NextResponse.json({ ok: true });
        }

        const alreadyPaid = inscriptions.every(
            (ins) => String(ins.payment_status || '').toLowerCase() === 'paid'
        );
        if (alreadyPaid) {
            await supabase.from('mercadopago_processed_payments').upsert(
                {
                    payment_id: paymentId,
                    inscription_ids: inscriptionIds,
                    amount: transactionAmount,
                    currency_id: currencyId,
                },
                { onConflict: 'payment_id' }
            );
            return NextResponse.json({ ok: true, idempotent: true });
        }

        const payable = inscriptions.filter((ins) => isPayableInscriptionStatus(ins.payment_status));
        if (payable.length === 0) {
            return NextResponse.json({ ok: true, skipped: 'not_pending' });
        }

        const tournamentIds = [...new Set(payable.map((i) => String(i.tournament_id || '')).filter(Boolean))];
        const tournamentById = new Map<string, TournamentPriceSource>();
        if (tournamentIds.length > 0) {
            const { data: trows } = await supabase.from('tournaments').select('id, data').in('id', tournamentIds);
            for (const t of trows || []) {
                tournamentById.set(String((t as { id: string }).id), flattenTournamentRow(t as { id: string; data?: Record<string, unknown> }));
            }
        }

        const expectedAmount = payable.reduce(
            (sum, ins) => sum + expectedAmountForInscription(ins, tournamentById.get(String(ins.tournament_id || ''))),
            0
        );

        if (currencyId && currencyId !== MERCADOPAGO_EXPECTED_CURRENCY) {
            console.error('[webhooks/mercadopago] moneda inesperada', { paymentId, currencyId, expected: MERCADOPAGO_EXPECTED_CURRENCY });
            return NextResponse.json({ ok: true, skipped: 'currency_mismatch' });
        }
        if (!amountsMatch(expectedAmount, transactionAmount)) {
            console.error('[webhooks/mercadopago] monto no coincide', {
                paymentId,
                expectedAmount,
                transactionAmount,
            });
            return NextResponse.json({ ok: true, skipped: 'amount_mismatch' });
        }

        const { error: lockErr } = await supabase.from('mercadopago_processed_payments').insert({
            payment_id: paymentId,
            inscription_ids: inscriptionIds,
            amount: transactionAmount,
            currency_id: currencyId || MERCADOPAGO_EXPECTED_CURRENCY,
        });
        if (lockErr) {
            if (String(lockErr.message || '').includes('duplicate') || lockErr.code === '23505') {
                return NextResponse.json({ ok: true, idempotent: true });
            }
            console.error('[webhooks/mercadopago] lock:', lockErr);
            return NextResponse.json({ error: 'No se pudo registrar el pago' }, { status: 500 });
        }

        for (const ins of payable) {
            try {
                const { data: updated, error: upErr } = await supabase
                    .from('inscriptions')
                    .update({
                        payment_status: 'paid',
                        alert_message: null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', ins.id)
                    .in('payment_status', ['pending', 'alert', 'revision'])
                    .select('id')
                    .maybeSingle();
                if (upErr) {
                    console.error('[webhooks/mercadopago] update', ins.id, upErr);
                    continue;
                }
                if (!updated) continue;
                try {
                    const full = await dataService.getInscriptionById(ins.id);
                    if (full) {
                        await dataService.assignPlayersToTournament(
                            full.tournamentId,
                            full.categoryKey,
                            full.participantName,
                            full.partnerName
                        );
                    }
                } catch (_) {
                    /* asignación de cupo no bloquea el pago */
                }
            } catch (e) {
                console.error('[webhooks/mercadopago] Error actualizando inscripción', ins.id, e);
            }
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error('[webhooks/mercadopago] Error:', e);
        return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
    }
}
