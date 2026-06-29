import type { SupabaseClient } from '@supabase/supabase-js';
import { buildExpressSessionReset } from '@/lib/expressScoring';
import {
  findExpressMatchByCourt,
  updateExpressMatchByCourt,
} from '@/lib/expressMatchDb';
import {
  clampCourtNumbersForClub,
  expressCourtNumbersForClub,
  normalizeExpressClubSlug,
  resolveCanonicalExpressVenue,
} from '@/lib/expressVenueCourts';
import { courtNumberFromExpressSlug, expressCanchaCodeFromCourtNumber } from '@/lib/tvDeviceAuth';
import { EXPRESS_QR_WINDOW_MS } from '@/lib/expressQrWindow';

const QR_WINDOW_MS = EXPRESS_QR_WINDOW_MS;
const QR_WINDOW_LABEL = '5 min';

function resolveClubVenue(clubSlug: string): string {
  const slug = normalizeExpressClubSlug(clubSlug);
  return resolveCanonicalExpressVenue(slug) ?? slug;
}

export async function resolveExpressCourtNumbersForClub(
  supabase: SupabaseClient,
  clubSlug: string,
): Promise<string[]> {
  const slug = normalizeExpressClubSlug(clubSlug);
  const venue = resolveClubVenue(slug);
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

  const venueFilters = Array.from(new Set([venue, slug].filter(Boolean)));
  for (const v of venueFilters) {
    const { data: matches } = await supabase
      .from('express_matches')
      .select('cancha_code')
      .eq('base_venue', v);

    for (const row of matches ?? []) {
      const n = courtNumberFromExpressSlug(String(row.cancha_code ?? ''));
      if (n) found.add(n);
    }
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

  const venue = resolveClubVenue(clubSlug);
  const existing = await findExpressMatchByCourt(supabase, courtNumber);

  if (existing?.is_active) {
    return {
      ok: true,
      courtNumber,
      message: `⚠️ Cancha ${courtNumber} · partido en curso. Usa Reset para limpiar la pizarra.`,
    };
  }

  const expiresAt = new Date(Date.now() + QR_WINDOW_MS).toISOString();
  const sessionId = existing?.session_id ? String(existing.session_id) : crypto.randomUUID();

  const result = await updateExpressMatchByCourt(supabase, courtNumber, {
    session_id: sessionId,
    base_venue: venue,
    qr_expires_at: expiresAt,
    is_active: false,
  });

  if (!result.ok) {
    console.error('[expressTelegram] activate:', result.message);
    return { ok: false, message: 'Error al activar la cancha.' };
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

  const venue = resolveClubVenue(clubSlug);
  const reset = buildExpressSessionReset(crypto.randomUUID());
  const qrExpiresAt = new Date(Date.now() + QR_WINDOW_MS).toISOString();

  const result = await updateExpressMatchByCourt(supabase, courtNumber, {
    ...reset,
    base_venue: venue,
    qr_expires_at: qrExpiresAt,
  });

  if (!result.ok) {
    console.error('[expressTelegram] reset:', result.message);
    return { ok: false, message: `Error al resetear la cancha: ${result.message}` };
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
