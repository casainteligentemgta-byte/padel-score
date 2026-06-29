import type { SupabaseClient } from '@supabase/supabase-js';
import { buildExpressSessionReset } from '@/lib/expressScoring';
import {
  clampCourtNumbersForClub,
  expressCourtNumbersForClub,
  normalizeExpressClubSlug,
} from '@/lib/expressVenueCourts';
import { courtNumberFromExpressSlug, expressCanchaCodeFromCourtNumber } from '@/lib/tvDeviceAuth';

const QR_WINDOW_MS = 60_000;

export async function resolveExpressCourtNumbersForClub(
  supabase: SupabaseClient,
  clubSlug: string,
): Promise<string[]> {
  const slug = normalizeExpressClubSlug(clubSlug);
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

export async function applyExpressQrActivation(
  supabase: SupabaseClient,
  clubSlug: string,
  courtNumber: string,
): Promise<ExpressTelegramActionResult> {
  const canchaCode = expressCanchaCodeFromCourtNumber(courtNumber);
  if (!canchaCode) {
    return { ok: false, message: 'Cancha inválida.' };
  }

  const slug = normalizeExpressClubSlug(clubSlug);

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
    message: `✅ Cancha ${courtNumber} · QR activo 1 min`,
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

  const slug = normalizeExpressClubSlug(clubSlug);
  const reset = buildExpressSessionReset(crypto.randomUUID());
  const qrExpiresAt = new Date(Date.now() + QR_WINDOW_MS).toISOString();

  const { data: existing } = await supabase
    .from('express_matches')
    .select('id')
    .eq('cancha_code', canchaCode)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from('express_matches').insert([
      {
        cancha_code: canchaCode,
        base_venue: slug,
        qr_expires_at: qrExpiresAt,
        ...reset,
      },
    ]);
    if (error) {
      console.error('[expressTelegram] reset insert:', error);
      return { ok: false, message: 'Error al resetear la cancha.' };
    }
  } else {
    const { error } = await supabase
      .from('express_matches')
      .update({
        ...reset,
        base_venue: slug,
        qr_expires_at: qrExpiresAt,
      })
      .eq('cancha_code', canchaCode);

    if (error) {
      console.error('[expressTelegram] reset update:', error);
      return { ok: false, message: 'Error al resetear la cancha.' };
    }
  }

  return {
    ok: true,
    courtNumber,
    message: `🔄 Cancha ${courtNumber} reseteada · QR activo 1 min`,
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
