import { NextResponse } from 'next/server';
import { sendPaymentStatusUpdateMessage } from '@/services/whatsappService';
import { sanitizeString } from '@/lib/apiValidation';

type Status =
  | 'paid'
  | 'rechazado'
  | 'revision'
  | 'alert'
  | 'exonerado'
  | 'pending';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inscriptionId = sanitizeString(body?.inscriptionId);
    const phone = sanitizeString(body?.phone);
    const playerName = sanitizeString(body?.playerName);
    const tournamentName = sanitizeString(body?.tournamentName);
    const status = sanitizeString(body?.status) as Status;
    const note = sanitizeString(body?.note) || null;

    const allowed: Status[] = ['paid', 'rechazado', 'revision', 'alert', 'exonerado', 'pending'];
    if (!phone || !playerName || !tournamentName || !allowed.includes(status)) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (phone, playerName, tournamentName, status válido)' },
        { status: 400 },
      );
    }

    const result = await sendPaymentStatusUpdateMessage({
      phone,
      playerName,
      tournamentName,
      status,
      note,
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

