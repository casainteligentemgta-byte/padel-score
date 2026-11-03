import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { isGuardResponse, requireCronSecret } from '@/lib/apiGuard';
import {
  buildExpressDailyReportMessage,
  expressReportDayBoundsUtc,
  fetchPizarraActivationsForDay,
} from '@/lib/expressActivityReport';
import { isPrimaryProductionDeployment } from '@/lib/deploymentTier';
import { notifyTelegramAdmin } from '@/lib/telegramBot';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Informe diario 23:59 VE — activaciones de pizarra Express (Vercel Cron). */
export async function GET(req: Request) {
  const cron = requireCronSecret(req);
  if (isGuardResponse(cron)) return cron;

  if (!isPrimaryProductionDeployment()) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'staging deployment' });
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
