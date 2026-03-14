import Twilio from 'twilio';

const PADEL_LOG = '[Smart Padel · CEO]';

/**
 * Envía un mensaje de WhatsApp vía Twilio (IA CEO).
 * Usa TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER y YOUR_PHONE_NUMBER.
 */
export async function sendCEOMessage(message: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER?.trim();
  const toNumber = (process.env.YOUR_PHONE_NUMBER || process.env.TWILIO_DESTINATION_PHONE)?.trim();

  if (!accountSid || !authToken) {
    console.error(`${PADEL_LOG} ❌ TWILIO_ACCOUNT_SID o TWILIO_AUTH_TOKEN no configurados.`);
    return { success: false, error: 'Twilio no configurado' };
  }
  if (!fromNumber) {
    console.error(`${PADEL_LOG} ❌ TWILIO_WHATSAPP_NUMBER no configurado.`);
    return { success: false, error: 'Número de origen no configurado' };
  }
  if (!toNumber) {
    console.error(`${PADEL_LOG} ❌ YOUR_PHONE_NUMBER (o TWILIO_DESTINATION_PHONE) no configurado.`);
    return { success: false, error: 'Número de destino no configurado' };
  }

  const safeMessage = typeof message === 'string' && message.length > 0
    ? message.slice(0, 4096)
    : 'Sin contenido';

  try {
    const client = Twilio(accountSid, authToken);
    const result = await client.messages.create({
      body: safeMessage,
      from: fromNumber,
      to: toNumber,
    });

    console.log(`${PADEL_LOG} ✅ Mensaje enviado correctamente. SID: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorCode = err && typeof err === 'object' && 'code' in err ? (err as { code?: number }).code : undefined;
    console.error(`${PADEL_LOG} ❌ Error al enviar mensaje:`, errorMessage, errorCode != null ? `(code: ${errorCode})` : '');
    return { success: false, error: errorMessage };
  }
}
