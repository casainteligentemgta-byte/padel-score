import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { buildExpressSessionReset } from '@/lib/expressScoring';
import {
  clampCourtNumbersForClub,
  expressCourtNumbersForClub,
  resolveExpressClubSlugForDb,
} from '@/lib/expressVenueCourts';
import { courtNumberFromExpressSlug, expressCanchaCodeFromCourtNumber } from '@/lib/tvDeviceAuth';
import { EXPRESS_QR_WINDOW_MS } from '@/lib/expressQrWindow';

const QR_WINDOW_MS = EXPRESS_QR_WINDOW_MS;
const QR_WINDOW_LABEL = '5 min';

const EXPRESS_SESSION_META_RESET_KEYS = [
  'warmup_ends_at',
  'match_started_at',
  'chrono_elapsed_sec',
  'match_ended_at',
  'side_change_until',
] as const;

function isMissingExpressSessionMetaColumn(error: PostgrestError | null): boolean {
  const msg = String(error?.message ?? '').toLowerCase();
  return (
    msg.includes('warmup_ends_at') ||
    msg.includes('match_started_at') ||
    msg.includes('chrono_elapsed_sec') ||
    msg.includes('match_ended_at') ||
    msg.includes('side_change_until')
  );
}

function stripExpressSessionMetaFields(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...payload };
  for (const key of EXPRESS_SESSION_META_RESET_KEYS) {
    delete out[key];
  }
  return out;
}

function buildExpressTelegramResetPayload(
  sessionId: string,
  baseVenue: string,
  qrExpiresAt: string,
): Record<string, unknown> {
  return {
    ...buildExpressSessionReset(sessionId),
    base_venue: baseVenue,
    qr_expires_at: qrExpiresAt,
  };
}

export async function resolveExpressCourtNumbersForClub(
  supabase: SupabaseClient,
  clubSlug: string,
): Promise<string[]> {
  const slug = resolveExpressClubSlugForDb(clubSlug);
  const found = new Set<string>();

  const { data: devices } = await supabase
    .from('tv_devices')
    .select('court_number')
    .eq('club_slug', slug)
    .eq('is_authorized', true)
    .order('court_number');

  for (const row of devices ?? []) {
    if (row.court_number != null) found.add(String(row.court_number));
  }

  const { data: matches } = await supabase
    .from('express_matches')
    .select('cancha_code')
    .eq('base_venue', slug);

  for (const row of matches ?? []) {
    const n = courtNumberFromExpressSlug(String(row.cancha_code ?? ''));
    if (n) found.add(n);
  }

  if (found.size > 0) {
    const clamped = clampCourtNumbersForClub(slug, found);
    if (clamped.length > 0) return clamped;
  }
  return expressCourtNumbersForClub(slug);
}

export type ExpressTelegramActionResult =
  | { ok: true; courtNumber: string; message: string }
  | { ok: false; message: string };

async function persistExpressBoardReset(
  supabase: SupabaseClient,
  canchaCode: string,
  baseVenue: string,
  qrExpiresAt: string,
): Promise<PostgrestError | null> {
  const sessionId = crypto.randomUUID();
  const fullPayload = buildExpressTelegramResetPayload(sessionId, baseVenue, qrExpiresAt);

  const { data: existing } = await supabase
    .from('express_matches')
    .select('id')
    .eq('cancha_code', canchaCode)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from('express_matches').insert([{
      cancha_code: canchaCode,
      ...fullPayload,
    }]);
    if (!error || !isMissingExpressSessionMetaColumn(error)) return error;
    const { error: legacyError } = await supabase.from('express_matches').insert([
      stripExpressSessionMetaFields({
        cancha_code: canchaCode,
        ...fullPayload,
      }),
    ]);
    return legacyError;
  }

  const { error } = await supabase
    .from('express_matches')
    .update(fullPayload)
    .eq('cancha_code', canchaCode);

  if (!error || !isMissingExpressSessionMetaColumn(error)) return error;

  const { error: legacyError } = await supabase
    .from('express_matches')
    .update(stripExpressSessionMetaFields(fullPayload))
    .eq('cancha_code', canchaCode);

  return legacyError;
}

export async function applyExpressQrActivation(
  supabase: SupabaseClient,
  clubSlug: string,
  courtNumber: string,
): Promise<ExpressTelegramActionResult> {
  const canchaCode = expressCanchaCodeFromCourtNumber(courtNumber);
  if (!canchaCode) {
    return { ok: false, message: 'Cancha inválida.' };
  }

  const slug = resolveExpressClubSlugForDb(clubSlug);

  const { data: existing } = await supabase
    .from('express_matches')
    .select('id, is_active, session_id')
    .eq('cancha_code', canchaCode)
    .maybeSingle();

  if (existing?.is_active) {
    return {
      ok: true,
      courtNumber,
      message: `⚠️ Cancha ${courtNumber} · partido en curso. Usa Reset para limpiar la pizarra.`,
    };
  }

  const expiresAt = new Date(Date.now() + QR_WINDOW_MS).toISOString();
  const sessionId = existing?.session_id || crypto.randomUUID();

  if (!existing) {
    const { error } = await supabase.from('express_matches').insert([
      {
        cancha_code: canchaCode,
        session_id: sessionId,
        base_venue: slug,
        qr_expires_at: expiresAt,
        is_active: false,
      },
    ]);
    if (error) {
      console.error('[expressTelegram] insert:', error);
      return { ok: false, message: 'Error al activar la cancha.' };
    }
  } else {
    const { error } = await supabase
      .from('express_matches')
      .update({
        qr_expires_at: expiresAt,
        base_venue: slug,
      })
      .eq('cancha_code', canchaCode);

    if (error) {
      console.error('[expressTelegram] activate update:', error);
      return { ok: false, message: 'Error al activar la cancha.' };
    }
  }

  return {
    ok: true,
    courtNumber,
    message: `✅ Cancha ${courtNumber} · QR activo ${QR_WINDOW_LABEL}`,
  };
}

export async function applyExpressBoardReset(
  supabase: SupabaseClient,
  clubSlug: string,
  courtNumber: string,
): Promise<ExpressTelegramActionResult> {
  const canchaCode = expressCanchaCodeFromCourtNumber(courtNumber);
  if (!canchaCode) {
    return { ok: false, message: 'Cancha inválida.' };
  }

  const slug = resolveExpressClubSlugForDb(clubSlug);
  const qrExpiresAt = new Date(Date.now() + QR_WINDOW_MS).toISOString();
  const error = await persistExpressBoardReset(supabase, canchaCode, slug, qrExpiresAt);

  if (error) {
    console.error('[expressTelegram] reset:', error);
    const migrationHint = isMissingExpressSessionMetaColumn(error)
      ? ' Ejecuta la migración 070_express_session_meta en Supabase.'
      : '';
    return { ok: false, message: `Error al resetear la cancha.${migrationHint}` };
  }

  return {
    ok: true,
    courtNumber,
    message: `🔄 Cancha ${courtNumber} reseteada · QR activo ${QR_WINDOW_LABEL}`,
  };
}

export function buildExpressStaffTelegramKeyboard(courtNumbers: string[]): {
  inline_keyboard: { text: string; callback_data: string }[][];
} {
  return {
    inline_keyboard: courtNumbers.map((courtNumber) => [
      {
        text: `🎾 QR Cancha ${courtNumber}`,
        callback_data: `activate_${courtNumber}`,
      },
      {
        text: `🔄 Reset ${courtNumber}`,
        callback_data: `reset_${courtNumber}`,
      },
    ]),
  };
}
