import type { SupabaseClient } from '@supabase/supabase-js';
import { buildCourtHeadline } from '@/lib/pizarraHeaderLabels';
import { courtNumFromExpressSlug } from '@/lib/expressSlug';
import { sendTelegramMessage } from '@/lib/telegramBot';
import { normalizeExpressClubSlug, resolveCanonicalExpressVenue } from '@/lib/expressVenueCourts';

const TELEGRAM_MATCH_STARTED_EVENT = 'telegram_match_started';

function expressMatchCourtLabel(match: { base_venue: string; cancha_code: string }): string {
  const venue = resolveCanonicalExpressVenue(match.base_venue) ?? match.base_venue.trim();
  const courtNum = courtNumFromExpressSlug(match.cancha_code);
  const headline = buildCourtHeadline(venue || null, courtNum);
  return headline || match.cancha_code;
}

async function wasTelegramMatchStartedNotified(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from('express_activity_logs')
    .select('id', { count: 'exact', head: true })
    .eq('event_type', TELEGRAM_MATCH_STARTED_EVENT)
    .contains('details', { session_id: sessionId });

  if (error) {
    console.error('[expressTelegram] notify dedupe check:', error);
    return false;
  }
  return (count ?? 0) > 0;
}

async function markTelegramMatchStartedNotified(
  supabase: SupabaseClient,
  payload: { sessionId: string; clubSlug: string; canchaCode: string },
): Promise<void> {
  const { error } = await supabase.from('express_activity_logs').insert({
    event_type: TELEGRAM_MATCH_STARTED_EVENT,
    club_slug: payload.clubSlug,
    cancha_code: payload.canchaCode,
    details: { session_id: payload.sessionId },
  });
  if (error) console.error('[expressTelegram] notify log:', error);
}

/**
 * Verifica en BD que la sesión está activa y avisa al staff del club por Telegram.
 * Idempotente por session_id; no envía errores al chat.
 */
export async function notifyTelegramMatchStarted(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<{ sent: boolean }> {
  const sid = String(sessionId ?? '').trim();
  if (!sid) return { sent: false };

  const { data: match, error: fetchError } = await supabase
    .from('express_matches')
    .select('session_id, is_active, base_venue, cancha_code')
    .eq('session_id', sid)
    .maybeSingle();

  if (fetchError || !match?.is_active) {
    return { sent: false };
  }

  if (await wasTelegramMatchStartedNotified(supabase, sid)) {
    return { sent: false };
  }

  const clubSlug = normalizeExpressClubSlug(String(match.base_venue ?? ''));
  const canonical = resolveCanonicalExpressVenue(clubSlug) ?? clubSlug;
  const clubSlugs = Array.from(new Set([clubSlug, canonical].filter(Boolean)));

  const { data: staffRows, error: staffError } = await supabase
    .from('club_staff')
    .select('telegram_chat_id')
    .eq('is_active', true)
    .not('telegram_chat_id', 'is', null)
    .in('club_slug', clubSlugs);

  if (staffError) {
    console.error('[expressTelegram] staff lookup:', staffError);
    return { sent: false };
  }

  const courtLabel = expressMatchCourtLabel({
    base_venue: String(match.base_venue ?? ''),
    cancha_code: String(match.cancha_code ?? ''),
  });

  const chatIds = Array.from(
    new Set(
      (staffRows ?? [])
        .map((row) => row.telegram_chat_id)
        .filter((id): id is number => id != null),
    ),
  );

  if (chatIds.length === 0) {
    return { sent: false };
  }

  const message = `✅ Cancha activa: ${courtLabel} - Partida iniciada`;

  let sentAny = false;
  for (const chatId of chatIds) {
    const ok = await sendTelegramMessage(chatId, message);
    if (ok) sentAny = true;
  }

  if (sentAny) {
    await markTelegramMatchStartedNotified(supabase, {
      sessionId: sid,
      clubSlug,
      canchaCode: String(match.cancha_code ?? ''),
    });
  }

  return { sent: sentAny };
}
