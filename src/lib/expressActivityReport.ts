import type { SupabaseClient } from '@supabase/supabase-js';
import { getAppBaseUrl } from '@/lib/brand';
import { expressVenuePathSlug } from '@/lib/expressShortUrl';
import { resolveCanonicalExpressVenue } from '@/lib/expressVenueCourts';

export const EXPRESS_ACTIVITY_STAFF_LOGIN = 'staff_telegram_login';
export const EXPRESS_ACTIVITY_PIZARRA = 'pizarra_activated';

export const EXPRESS_REPORT_TIMEZONE = process.env.EXPRESS_REPORT_TIMEZONE?.trim() || 'America/Caracas';

/** Medianoche → fin de día (23:59:59.999) en zona horaria del informe. */
export function expressReportDayBoundsUtc(referenceDate = new Date()): { start: Date; end: Date; dayLabel: string } {
  const dayLabel = new Intl.DateTimeFormat('en-CA', {
    timeZone: EXPRESS_REPORT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(referenceDate);

  const [y, m, d] = dayLabel.split('-').map((x) => Number(x));
  const start = new Date(Date.UTC(y, m - 1, d, 4, 0, 0, 0));
  const end = new Date(Date.UTC(y, m - 1, d + 1, 3, 59, 59, 999));
  return { start, end, dayLabel };
}

export function formatExpressReportDate(dayLabel: string): string {
  const [y, m, d] = dayLabel.split('-').map((x) => Number(x));
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return dt.toLocaleDateString('es-VE', {
    timeZone: EXPRESS_REPORT_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatExpressNotifyTimestamp(date = new Date()): string {
  return date.toLocaleString('es-VE', {
    timeZone: EXPRESS_REPORT_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export async function logExpressStaffTelegramLogin(
  supabase: SupabaseClient,
  payload: { clubSlug: string; staffName: string; staffId: string; telegramChatId: number },
): Promise<void> {
  const { error } = await supabase.from('express_activity_logs').insert({
    event_type: EXPRESS_ACTIVITY_STAFF_LOGIN,
    club_slug: payload.clubSlug,
    staff_name: payload.staffName,
    details: {
      staff_id: payload.staffId,
      telegram_chat_id: payload.telegramChatId,
    },
  });
  if (error) console.error('[expressActivity] staff login log:', error);
}

export function buildStaffLoginTelegramMessage(payload: {
  staffName: string;
  clubSlug: string;
  at?: Date;
}): string {
  const venue = resolveCanonicalExpressVenue(payload.clubSlug) ?? payload.clubSlug;
  const pathCode = expressVenuePathSlug(venue);
  return (
    `🔐 *Staff vinculado en Telegram*\n\n` +
    `🏢 Sede: \`${venue}\` · código \`${pathCode}\`\n` +
    `👤 Nombre: ${payload.staffName}\n` +
    `🕐 ${formatExpressNotifyTimestamp(payload.at)} (VE)`
  );
}

type PizarraRow = { club_slug: string | null; cancha_code: string | null };

export async function fetchPizarraActivationsForDay(
  supabase: SupabaseClient,
  bounds: { start: Date; end: Date },
): Promise<PizarraRow[]> {
  const { data, error } = await supabase
    .from('express_activity_logs')
    .select('club_slug, cancha_code')
    .eq('event_type', EXPRESS_ACTIVITY_PIZARRA)
    .gte('created_at', bounds.start.toISOString())
    .lte('created_at', bounds.end.toISOString());

  if (error) {
    console.error('[expressActivity] fetch activations:', error);
    return [];
  }
  return (data ?? []) as PizarraRow[];
}

export function buildExpressDailyReportMessage(rows: PizarraRow[], dayLabel: string): string {
  const dateStr = formatExpressReportDate(dayLabel);
  const total = rows.length;

  if (total === 0) {
    return `📊 *Informe Express*\n_${dateStr}_\n\nSin activaciones de pizarra hoy.`;
  }

  const byClub = new Map<string, Map<string, number>>();
  for (const row of rows) {
    const club = resolveCanonicalExpressVenue(String(row.club_slug ?? '')) ?? String(row.club_slug ?? 'Sin sede');
    const cancha = String(row.cancha_code ?? '?');
    if (!byClub.has(club)) byClub.set(club, new Map());
    const courts = byClub.get(club)!;
    courts.set(cancha, (courts.get(cancha) ?? 0) + 1);
  }

  const clubLines = [...byClub.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'es'))
    .map(([club, courts]) => {
      const clubTotal = [...courts.values()].reduce((s, n) => s + n, 0);
      const courtLines = [...courts.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([code, n]) => `  · ${code}: ${n}`)
        .join('\n');
      return `*${club}*: ${clubTotal}\n${courtLines}`;
    })
    .join('\n\n');

  return (
    `📊 *Informe Express*\n_${dateStr}_\n\n` +
    `🎾 Activaciones de pizarra: *${total}*\n\n` +
    clubLines +
    `\n\n_${getAppBaseUrl()}_`
  );
}

export function isCronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== 'production';
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}
