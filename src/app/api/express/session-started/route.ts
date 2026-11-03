import { NextResponse } from 'next/server';
import { notifyTelegramMatchStarted } from '@/lib/expressTelegramNotify';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

/** Notifica al staff del club cuando un jugador activa la sesión Express (QR escaneado). */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = String(body?.session_id ?? '').trim();

    if (!sessionId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ ok: true });
    }

    const { data: match } = await supabase
      .from('express_matches')
      .select('id, is_active')
      .eq('session_id', sessionId)
      .maybeSingle();
    if (!match || !match.is_active) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    await notifyTelegramMatchStarted(supabase, sessionId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[api/express/session-started]', error);
    return NextResponse.json({ ok: true });
  }
}
