import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import {
  buildExpressDailyReportMessage,
  expressReportDayBoundsUtc,
  fetchPizarraActivationsForDay,
  isCronAuthorized,
} from '@/lib/expressActivityReport';
import { notifyTelegramAdmin } from '@/lib/telegramBot';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Informe diario 23:59 VE — activaciones de pizarra Express (Vercel Cron). */
export async function GET(req: Request) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
    }

    const bounds = expressReportDayBoundsUtc(new Date());
    const rows = await fetchPizarraActivationsForDay(supabase, bounds);
    const message = buildExpressDailyReportMessage(rows, bounds.dayLabel);

    await notifyTelegramAdmin(message);

    return NextResponse.json({
      ok: true,
      day: bounds.dayLabel,
      activations: rows.length,
    });
  } catch (error) {
    console.error('[cron/express-daily-report]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
