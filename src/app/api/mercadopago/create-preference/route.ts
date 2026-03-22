import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

function getClient(): Preference | null {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) return null;
  const config = new MercadoPagoConfig({ accessToken: token });
  return new Preference(config);
}

/**
 * POST: crea una preferencia de pago (checkout) en Mercado Pago.
 * Body: { inscriptionIds: string[], amount: number, title: string, payerEmail?: string, successUrl?: string, failureUrl?: string }
 * Devuelve { initPoint } para redirigir al usuario.
 */
export async function POST(request: Request) {
  const client = getClient();
  if (!client) {
    return NextResponse.json(
      { error: 'Mercado Pago no configurado (MERCADOPAGO_ACCESS_TOKEN).' },
      { status: 501 }
    );
  }

  try {
    const body = await request.json();
    const inscriptionIds = body?.inscriptionIds;
    const amount = Number(body?.amount);
    const title = String(body?.title || 'Inscripción torneo').slice(0, 200);
    const payerEmail = body?.payerEmail ? String(body.payerEmail).trim() : undefined;
    const baseUrl = body?.baseUrl || (request.headers.get('origin') || '').replace(/\/$/, '');
    const successUrl = body?.successUrl || `${baseUrl}/tournaments/${body?.tournamentId || ''}/inscribirme?mp=success`;
    const failureUrl = body?.failureUrl || `${baseUrl}/tournaments/${body?.tournamentId || ''}/inscribirme?mp=failure`;
    const pendingUrl = body?.pendingUrl || `${baseUrl}/tournaments/${body?.tournamentId || ''}/inscribirme?mp=pending`;

    if (!Array.isArray(inscriptionIds) || inscriptionIds.length === 0) {
      return NextResponse.json({ error: 'inscriptionIds es obligatorio (array).' }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'amount debe ser un número mayor que 0.' }, { status: 400 });
    }

    const externalReference = inscriptionIds.join(',');

    const preferenceBody: any = {
      items: [
        {
          title,
          quantity: 1,
          unit_price: amount,
          currency_id: body?.currencyId || 'USD',
        },
      ],
      external_reference: externalReference,
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
      },
      auto_return: 'approved' as const,
    };
    if (payerEmail) {
      preferenceBody.payer = { email: payerEmail };
    }

    const result = await client.create({ body: preferenceBody });
    const res = result as any;
    const initPoint = res?.init_point || res?.sandbox_init_point;

    if (!initPoint) {
      return NextResponse.json({ error: 'Mercado Pago no devolvió URL de pago.' }, { status: 500 });
    }

    return NextResponse.json({ initPoint, preferenceId: res?.id });
  } catch (e: any) {
    console.error('[mercadopago/create-preference]', e);
    return NextResponse.json(
      { error: e?.message || 'Error al crear la preferencia.' },
      { status: 500 }
    );
  }
}
