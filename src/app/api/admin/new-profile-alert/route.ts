import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authServerSupabase';
import { checkRateLimit } from '@/lib/rateLimit';
import { sendAdminNewProfileAlert } from '@/services/whatsappService';
import { sanitizeString } from '@/lib/apiValidation';

/**
 * POST: notifica al admin (WhatsApp) por un nuevo registro de perfil/ficha.
 * Requiere sesión; nombres se toman del cuerpo (formulario de registro del propio usuario).
 */
export async function POST(request: Request) {
  if (!checkRateLimit(request, { max: 6, windowMs: 60_000, bucket: 'new-profile-alert' })) {
    return NextResponse.json({ error: 'Demasiados avisos. Intenta más tarde.' }, { status: 429 });
  }
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const firstName = sanitizeString(body?.firstName);
    const lastName = sanitizeString(body?.lastName);
    if (!firstName) {
      return NextResponse.json({ error: 'Falta firstName' }, { status: 400 });
    }

    const result = await sendAdminNewProfileAlert({ firstName, lastName: lastName || '' });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'No se pudo enviar aviso al admin' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, sid: result.sid });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
