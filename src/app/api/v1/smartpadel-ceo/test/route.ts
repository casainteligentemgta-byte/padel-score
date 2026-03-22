import { NextResponse } from 'next/server';
import { sendCEOMessage } from '@/lib/ceo-messenger';

/**
 * GET: Verifica que las variables de Twilio estén configuradas (sin mostrar valores).
 * POST: Envía un mensaje de prueba a WhatsApp para comprobar que todo funciona.
 */
export async function GET() {
  const accountSid = !!process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = !!process.env.TWILIO_AUTH_TOKEN?.trim();
  const fromNumber = !!process.env.TWILIO_WHATSAPP_NUMBER?.trim();
  const toNumber = !!(
    process.env.YOUR_PHONE_NUMBER?.trim() ||
    process.env.TWILIO_DESTINATION_PHONE?.trim()
  );

  const allOk = accountSid && authToken && fromNumber && toNumber;

  return NextResponse.json({
    ok: allOk,
    message: allOk
      ? 'Variables de Twilio configuradas. Usa POST a esta misma URL para enviar un mensaje de prueba.'
      : 'Faltan variables en .env.local. Revisa TWILIO_* y YOUR_PHONE_NUMBER.',
    config: {
      TWILIO_ACCOUNT_SID: accountSid ? '✓' : '✗',
      TWILIO_AUTH_TOKEN: authToken ? '✓' : '✗',
      TWILIO_WHATSAPP_NUMBER: fromNumber ? '✓' : '✗',
      YOUR_PHONE_NUMBER: toNumber ? '✓' : '✗',
    },
  });
}

export async function POST() {
  const testMessage = `🧪 *Smart Padel – Prueba IA CEO*\n\nSi recibes este mensaje, la integración Twilio + WhatsApp está funcionando correctamente.\n\n_Enviado desde el test del webhook._`;

  const result = await sendCEOMessage(testMessage);

  if (!result.success) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: 'Mensaje de prueba enviado. Revisa tu WhatsApp.',
    sid: result.sid,
  });
}
