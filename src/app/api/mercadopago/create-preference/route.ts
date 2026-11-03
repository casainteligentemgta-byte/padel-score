import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { isGuardResponse, requireAuth, getAuthUserWithRole } from '@/lib/apiGuard';
import { getAppBaseUrl } from '@/lib/brand';
import {
    expectedAmountForInscription,
    flattenTournamentRow,
    isPayableInscriptionStatus,
    type InscriptionPriceRow,
    type TournamentPriceSource,
} from '@/lib/inscriptionPricing';
import { checkPaymentRateLimit } from '@/lib/rateLimit';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

function getClient(): Preference | null {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) return null;
    const config = new MercadoPagoConfig({ accessToken: token });
    return new Preference(config);
}

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * POST: crea una preferencia de pago.
 * Body: { inscriptionIds: string[], payerEmail?: string }
 * El monto y la moneda salen de la BD (categoría / inscripción), no del cliente.
 */
export async function POST(request: Request) {
    const auth = await requireAuth(request);
    if (isGuardResponse(auth)) return auth;

    if (!checkPaymentRateLimit(request, 'mp-preference')) {
        return NextResponse.json({ error: 'Demasiadas solicitudes de pago. Intenta más tarde.' }, { status: 429 });
    }

    const client = getClient();
    if (!client) {
        return NextResponse.json(
            { error: 'Mercado Pago no configurado (MERCADOPAGO_ACCESS_TOKEN).' },
            { status: 501 }
        );
    }

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
        return NextResponse.json(
            { error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
            { status: 503 }
        );
    }

    try {
        const body = await request.json().catch(() => ({}));
        const rawIds = Array.isArray(body?.inscriptionIds) ? body.inscriptionIds : [];
        const inscriptionIds: string[] = Array.from(
            new Set(
                rawIds
                    .map((id: unknown) => String(id ?? '').trim())
                    .filter((id: string) => id.length > 0)
            )
        );
        const payerEmail = body?.payerEmail ? String(body.payerEmail).trim() : undefined;

        if (inscriptionIds.length === 0) {
            return NextResponse.json({ error: 'inscriptionIds es obligatorio (array).' }, { status: 400 });
        }
        if (inscriptionIds.some((id) => !UUID_RE.test(id))) {
            return NextResponse.json({ error: 'Hay inscriptionIds inválidos.' }, { status: 400 });
        }

        const { data: rows, error: insErr } = await supabase
            .from('inscriptions')
            .select('id, tournament_id, category_key, category_price, payment_status, owner_id, user_id, tournament_name, participant_name')
            .in('id', inscriptionIds);

        if (insErr) {
            return NextResponse.json({ error: insErr.message }, { status: 500 });
        }

        const inscriptions = (rows || []) as Array<
            InscriptionPriceRow & { owner_id?: string | null; user_id?: string | null; tournament_name?: string | null }
        >;
        if (inscriptions.length !== inscriptionIds.length) {
            return NextResponse.json({ error: 'Una o más inscripciones no existen.' }, { status: 404 });
        }

        const withRole = await getAuthUserWithRole(request);
        const isAdmin = (withRole?.role || '').toLowerCase() === 'admin';
        if (!isAdmin) {
            const allOwned = inscriptions.every((ins) => {
                const owner = String(ins.owner_id || ins.user_id || '');
                return owner === auth.uid;
            });
            if (!allOwned) {
                return NextResponse.json({ error: 'No puedes pagar estas inscripciones.' }, { status: 403 });
            }
        }

        for (const ins of inscriptions) {
            if (!isPayableInscriptionStatus(ins.payment_status)) {
                return NextResponse.json(
                    { error: `La inscripción ${ins.id} no está pendiente de pago.` },
                    { status: 409 }
                );
            }
        }

        const tournamentIds = [...new Set(inscriptions.map((i) => String(i.tournament_id || '')).filter(Boolean))];
        if (tournamentIds.length !== 1) {
            return NextResponse.json(
                { error: 'Todas las inscripciones deben pertenecer al mismo torneo.' },
                { status: 400 }
            );
        }

        const tournamentId = tournamentIds[0];
        const { data: trow, error: tErr } = await supabase
            .from('tournaments')
            .select('id, data')
            .eq('id', tournamentId)
            .maybeSingle();
        if (tErr || !trow) {
            return NextResponse.json({ error: 'Torneo no encontrado.' }, { status: 404 });
        }

        const tournament = flattenTournamentRow(trow as { id: string; data?: Record<string, unknown> | null });
        const tournamentById = new Map<string, TournamentPriceSource>([[tournamentId, tournament]]);
        const amount = inscriptions.reduce(
            (sum, ins) => sum + expectedAmountForInscription(ins, tournamentById.get(String(ins.tournament_id || ''))),
            0
        );

        if (!Number.isFinite(amount) || amount <= 0) {
            return NextResponse.json(
                { error: 'El precio de la categoría es 0; no se crea preferencia de pago.' },
                { status: 400 }
            );
        }

        const tournamentName =
            (typeof tournament.name === 'string' && tournament.name.trim()) ||
            inscriptions[0]?.tournament_name ||
            'Torneo';
        const title = `Inscripción: ${String(tournamentName).slice(0, 160)}`;

        const baseUrl = getAppBaseUrl();
        const successUrl = `${baseUrl}/tournaments/${tournamentId}/inscribirme?mp=success`;
        const failureUrl = `${baseUrl}/tournaments/${tournamentId}/inscribirme?mp=failure`;
        const pendingUrl = `${baseUrl}/tournaments/${tournamentId}/inscribirme?mp=pending`;

        const externalReference = inscriptionIds.join(',');

        const preferenceBody: Record<string, unknown> = {
            items: [
                {
                    title,
                    quantity: 1,
                    unit_price: amount,
                    currency_id: 'USD',
                },
            ],
            external_reference: externalReference,
            back_urls: {
                success: successUrl,
                failure: failureUrl,
                pending: pendingUrl,
            },
            auto_return: 'approved' as const,
            metadata: {
                tournament_id: tournamentId,
                expected_amount: amount,
                currency_id: 'USD',
            },
        };
        if (payerEmail) {
            preferenceBody.payer = { email: payerEmail };
        }

        const result = await client.create({ body: preferenceBody as never });
        const res = result as { init_point?: string; sandbox_init_point?: string; id?: string };
        const initPoint = res?.init_point || res?.sandbox_init_point;

        if (!initPoint) {
            return NextResponse.json({ error: 'Mercado Pago no devolvió URL de pago.' }, { status: 500 });
        }

        return NextResponse.json({
            initPoint,
            preferenceId: res?.id,
            amount,
            currencyId: 'USD',
        });
    } catch (e: unknown) {
        console.error('[mercadopago/create-preference]', e);
        const message = e instanceof Error ? e.message : 'Error al crear la preferencia.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
