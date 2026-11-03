import { NextResponse } from 'next/server';
import { isGuardResponse, requireAuth } from '@/lib/apiGuard';
import { sanitizeString } from '@/lib/apiValidation';
import { getBcvVesPerUsd } from '@/lib/bcvRate';
import {
    categoryPriceFromTournament,
    flattenTournamentRow,
} from '@/lib/inscriptionPricing';
import { isMercadoPagoMethod, resolveManualInscriptionPaymentStatus } from '@/lib/paymentValidation';
import { checkPaymentRateLimit } from '@/lib/rateLimit';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sanitizeJsonValue(value: unknown): unknown {
    if (typeof value === 'string') return sanitizeString(value);
    if (Array.isArray(value)) return value.map(sanitizeJsonValue);
    if (value && typeof value === 'object') {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            out[k] = sanitizeJsonValue(v);
        }
        return out;
    }
    return value;
}

/**
 * POST: crea una inscripción. Precio y payment_status salen del torneo / validación
 * del servidor; el cliente no puede marcar pagado ni bajar el monto.
 */
export async function POST(request: Request) {
    const auth = await requireAuth(request);
    if (isGuardResponse(auth)) return auth;

    if (!checkPaymentRateLimit(request, 'inscriptions')) {
        return NextResponse.json({ error: 'Demasiadas inscripciones. Intenta más tarde.' }, { status: 429 });
    }

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

    const tournamentId = sanitizeString(body.tournamentId);
    const categoryKey = sanitizeString(body.categoryKey);
    if (!tournamentId || !UUID_RE.test(tournamentId)) {
        return NextResponse.json({ error: 'tournamentId inválido' }, { status: 400 });
    }
    if (!categoryKey) {
        return NextResponse.json({ error: 'categoryKey es obligatorio' }, { status: 400 });
    }

    const { data: existing, error: existErr } = await supabase
        .from('inscriptions')
        .select('id, category_key, payment_status')
        .eq('tournament_id', tournamentId)
        .or(`user_id.eq.${auth.uid},owner_id.eq.${auth.uid}`);
    if (existErr) {
        return NextResponse.json({ error: existErr.message }, { status: 500 });
    }
    const blocking = (existing || []).some(
        (row) =>
            String(row.category_key || '') === categoryKey &&
            String(row.payment_status || '').toLowerCase() !== 'rechazado'
    );
    if (blocking) {
        return NextResponse.json(
            {
                error: 'Ya tienes una inscripción activa en esta categoría. Si el club rechazó tu pago, podrás volver a intentar cuando el estado sea «Rechazado».',
            },
            { status: 409 }
        );
    }

    const { data: trow, error: tErr } = await supabase
        .from('tournaments')
        .select('id, data')
        .eq('id', tournamentId)
        .maybeSingle();
    if (tErr || !trow) {
        return NextResponse.json({ error: 'Torneo no encontrado.' }, { status: 404 });
    }

    const tournament = flattenTournamentRow(trow as { id: string; data?: Record<string, unknown> | null });
    const categoryPrice = categoryPriceFromTournament(tournament, categoryKey);
    const paymentMethod = sanitizeString(body.paymentMethod);
    if (isMercadoPagoMethod(paymentMethod)) {
        return NextResponse.json(
            { error: 'Mercado Pago ya no está disponible. Usa Pago Móvil o Transferencia bancaria.' },
            { status: 400 }
        );
    }

    const amountExtractedRaw = body.amountExtracted ?? body.paymentAmount;
    const amountExtracted =
        amountExtractedRaw === undefined || amountExtractedRaw === null || amountExtractedRaw === ''
            ? null
            : Number(String(amountExtractedRaw).replace(',', '.'));
    // Tasa BCV solo del servidor (el cliente no puede inventar equivalencia Bs/USD).
    const bcv = await getBcvVesPerUsd();
    const bcvVesPerUsd = bcv.vesPerUsd;

    const resolved = resolveManualInscriptionPaymentStatus({
        categoryPrice,
        amountExtracted,
        bcvVesPerUsd,
    });
    const paymentStatus = resolved.paymentStatus;
    const alertMessage = resolved.alertMessage;

    const nowIso = new Date().toISOString();
    const tournamentName =
        (typeof tournament.name === 'string' && tournament.name.trim()) ||
        sanitizeString(body.tournamentName) ||
        'Torneo';

    const { data: row, error: insErr } = await supabase
        .from('inscriptions')
        .insert({
            user_id: auth.uid,
            owner_id: auth.uid,
            tournament_id: tournamentId,
            tournament_name: tournamentName,
            category_key: categoryKey,
            category_price: categoryPrice,
            participant_name: sanitizeString(body.participantName),
            participant_email: sanitizeString(body.participantEmail),
            participant_id: body.participantId ? String(body.participantId).trim() : null,
            amount_extracted: amountExtracted != null && Number.isFinite(amountExtracted) ? amountExtracted : null,
            receipt_url: sanitizeString(body.receiptUrl) || null,
            payment_status: paymentStatus,
            alert_message: alertMessage,
            data: sanitizeJsonValue({
                paymentMethod,
                paymentDate: sanitizeString(body.paymentDate),
                paymentBank: sanitizeString(body.paymentBank),
                paymentAmount: amountExtracted,
                paymentReference: sanitizeString(body.paymentReference),
                partnerId: body.partnerId ? String(body.partnerId).trim() : undefined,
                partnerName: sanitizeString(body.partnerName),
                legalSignaturePath: sanitizeString(body.legalSignaturePath) || null,
                legalBiometricPath: sanitizeString(body.legalBiometricPath) || null,
                acceptedTermsVersion: sanitizeString(body.acceptedTermsVersion) || null,
            }),
            created_at: nowIso,
            updated_at: nowIso,
        })
        .select('id')
        .single();

    if (insErr) {
        return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({
        id: row?.id,
        categoryPrice,
        paymentStatus,
        alertMessage,
    });
}
