import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { buildExpressSessionReset } from '@/lib/expressScoring';
import {
  clampCourtNumbersForClub,
  expressCourtNumbersForClub,
  resolveExpressClubSlugForDb,
} from '@/lib/expressVenueCourts';
import { courtNumberFromExpressSlug, expressCanchaCodeFromCourtNumber } from '@/lib/tvDeviceAuth';
import { courtNumFromExpressSlug, expressSlugFromCourtNumber } from '@/lib/expressSlug';
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

function isExpressRlsGuardError(error: PostgrestError | null): boolean {
  const msg = String(error?.message ?? '').toLowerCase();
  return (
    msg.includes('express_matches:') ||
    msg.includes('actualización no permitida') ||
    msg.includes('qr_expires_at solo puede borrarse')
  );
}

function expressCanchaCodesForLookup(courtNumber: string): string[] {
  const primary = expressCanchaCodeFromCourtNumber(courtNumber);
  if (!primary) return [];
  const n = courtNumFromExpressSlug(primary);
  if (!n) return [primary];
  const codes = [expressSlugFromCourtNumber(n), `fast-${n}`];
  return [...new Set(codes)];
}

async function findExpressMatchRow(
  supabase: SupabaseClient,
  courtNumber: string,
): Promise<{ id: string; cancha_code: string; is_active?: boolean; session_id?: string } | null> {
  for (const canchaCode of expressCanchaCodesForLookup(courtNumber)) {
    const { data } = await supabase
      .from('express_matches')
      .select('id, cancha_code, is_active, session_id')
      .eq('cancha_code', canchaCode)
      .maybeSingle();
    if (data?.id) {
      return {
        id: String(data.id),
        cancha_code: String(data.cancha_code),
        is_active: Boolean(data.is_active),
        session_id: data.session_id ? String(data.session_id) : undefined,
      };
    }
  }
  return null;
}

function expressTelegramResetErrorMessage(error: PostgrestError | null): string {
  if (isMissingExpressSessionMetaColumn(error)) {
    return 'Error al resetear la cancha. Ejecuta 070_express_session_meta en Supabase.';
  }
  if (isExpressRlsGuardError(error)) {
    return 'Error al resetear la cancha. Ejecuta 071_express_rls_hardening en Supabase.';
  }
  return 'Error al resetear la cancha.';
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
  courtNumber: string,
  baseVenue: string,
  qrExpiresAt: string,
): Promise<PostgrestError | null> {
  const sessionId = crypto.randomUUID();
  const insertCanchaCode = expressCanchaCodeFromCourtNumber(courtNumber);
  if (!insertCanchaCode) {
    return { message: 'Cancha inválida', details: '', hint: '', code: '22P02' } as PostgrestError;
  }

  const existing = await findExpressMatchRow(supabase, courtNumber);
  const targetCanchaCode = existing?.cancha_code ?? insertCanchaCode;
  const shouldMigrateLegacySlug =
    existing != null &&
    /^fast-/i.test(existing.cancha_code) &&
    insertCanchaCode !== existing.cancha_code;

  const fullPayload = {
    ...buildExpressTelegramResetPayload(sessionId, baseVenue, qrExpiresAt),
    ...(shouldMigrateLegacySlug ? { cancha_code: insertCanchaCode } : {}),
  };

  if (!existing) {
    const { error } = await supabase.from('express_matches').insert([{
      cancha_code: insertCanchaCode,
      ...fullPayload,
    }]);
    if (!error || !isMissingExpressSessionMetaColumn(error)) return error;
    const { error: legacyError } = await supabase.from('express_matches').insert([
      stripExpressSessionMetaFields({
        cancha_code: insertCanchaCode,
        ...fullPayload,
      }),
    ]);
    return legacyError;
  }

  const { error } = await supabase
    .from('express_matches')
    .update(fullPayload)
    .eq('cancha_code', targetCanchaCode);

  if (!error || !isMissingExpressSessionMetaColumn(error)) return error;

  const { error: legacyError } = await supabase
    .from('express_matches')
    .update(stripExpressSessionMetaFields(fullPayload))
    .eq('cancha_code', targetCanchaCode);

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

  const existing = await findExpressMatchRow(supabase, courtNumber);

  if (existing?.is_active) {
    return {
      ok: true,
      courtNumber,
      message: `⚠️ Cancha ${courtNumber} · partido en curso. Usa Reset para limpiar la pizarra.`,
    };
  }

  const expiresAt = new Date(Date.now() + QR_WINDOW_MS).toISOString();
  const sessionId = existing?.session_id || crypto.randomUUID();
  const targetCanchaCode = existing?.cancha_code ?? canchaCode;

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
      .eq('cancha_code', targetCanchaCode);

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
  const error = await persistExpressBoardReset(supabase, courtNumber, slug, qrExpiresAt);

  if (error) {
    console.error('[expressTelegram] reset:', error);
    return { ok: false, message: expressTelegramResetErrorMessage(error) };
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
