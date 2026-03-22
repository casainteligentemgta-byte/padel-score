import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { dataService } from '@/lib/dataService';

const getClient = () => {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) return null;
  const config = new MercadoPagoConfig({ accessToken: token });
  return new Payment(config);
};

/**
 * POST: notificación de Mercado Pago (webhook).
 * Body: { type, data: { id } } — data.id es el ID del pago.
 * Al recibir type=payment, consultamos el pago en MP; si status=approved,
 * external_reference contiene los IDs de inscripción separados por coma y los marcamos como pagados.
 */
export async function POST(request: Request) {
  const paymentClient = getClient();
  if (!paymentClient) {
    console.warn('[webhooks/mercadopago] MERCADOPAGO_ACCESS_TOKEN no configurado');
    return NextResponse.json({ ok: false }, { status: 501 });
  }

  try {
    const body = await request.json();
    const { type, data } = body || {};
    if (type !== 'payment' || !data?.id) {
      return NextResponse.json({ ok: true }); // 200 para que MP no reintente
    }

    const paymentId = String(data.id);
    const payment = await paymentClient.get({ id: paymentId });
    const status = (payment as any)?.status;
    const externalRef = (payment as any)?.external_reference;

    if (status !== 'approved' || !externalRef || typeof externalRef !== 'string') {
      return NextResponse.json({ ok: true });
    }

    const inscriptionIds = externalRef.split(',').map((s: string) => s.trim()).filter(Boolean);
    for (const id of inscriptionIds) {
      try {
        await dataService.updateInscription(id, { paymentStatus: 'paid', alertMessage: null });
        try {
          const ins = await dataService.getInscriptionById(id);
          if (ins) {
            await dataService.assignPlayersToTournament(
              ins.tournamentId,
              ins.categoryKey,
              ins.participantName,
              ins.partnerName
            );
          }
        } catch (_) {}
      } catch (e) {
        console.error('[webhooks/mercadopago] Error actualizando inscripción', id, e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[webhooks/mercadopago] Error:', e);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
