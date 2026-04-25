import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authServerSupabase';
import { sendProfileWelcomeMessage } from '@/services/whatsappService';
import { sanitizeString } from '@/lib/apiValidation';

/**
 * POST: envía mensaje de bienvenida por WhatsApp (Twilio) al completar perfil / ficha.
 * Requiere sesión; el teléfono debe ser el del usuario (mismo flujo que el formulario de registro).
 */
export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const phone = sanitizeString(body?.phone);
    const firstName = sanitizeString(body?.firstName);

    if (!phone || !firstName) {
      return NextResponse.json(
        { error: 'Faltan phone o firstName' },
        { status: 400 }
      );
    }

    const result = await sendProfileWelcomeMessage({ phone, firstName });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'No se pudo enviar WhatsApp' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, sid: result.sid });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
