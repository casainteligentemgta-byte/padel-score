import { NextResponse } from 'next/server';
import { sendAdminWelcomeMessage } from '@/services/whatsappService';
import { sanitizeString } from '@/lib/apiValidation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inscriptionId = sanitizeString(body?.inscriptionId);
    const phone = sanitizeString(body?.phone);
    const playerName = sanitizeString(body?.playerName);
    const tournamentName = sanitizeString(body?.tournamentName);

    // `inscriptionId` es opcional: el servicio solo lo usa para logs/relación cuando aplique.
    if (!phone || !playerName || !tournamentName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (phone, playerName, tournamentName)' },
        { status: 400 }
      );
    }

    const result = await sendAdminWelcomeMessage({
      phone,
      playerName,
      tournamentName,
      inscriptionId: inscriptionId || undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'No se pudo enviar WhatsApp' }, { status: 400 });
    }

    return NextResponse.json({ success: true, sid: result.sid });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 });
  }
}

