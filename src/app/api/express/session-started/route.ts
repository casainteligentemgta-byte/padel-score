import { NextResponse } from 'next/server';
import { notifyTelegramMatchStarted } from '@/lib/expressTelegramNotify';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

/** Notifica al staff del club cuando un jugador activa la sesión Express (QR escaneado). */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = String(body?.session_id ?? '').trim();

    if (!sessionId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ ok: true });
    }

    await notifyTelegramMatchStarted(supabase, sessionId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[api/express/session-started]', error);
    return NextResponse.json({ ok: true });
  }
}
