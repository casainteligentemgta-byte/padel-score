import type { SupabaseClient } from '@supabase/supabase-js';
import {
  courtNumFromExpressSlug,
  expressSlugFromCourtNumber,
  isLegacyExpressSlug,
  normalizeExpressSlug,
} from '@/lib/expressSlug';
import { normalizeExpressMatch, type ExpressMatch } from '@/types/expressMatch';

/** Códigos posibles de cancha (scan-go-N y legacy fast-N). */
export function expressCanchaCodesForCourt(courtNumber: string): string[] {
  const slug = expressSlugFromCourtNumber(courtNumber);
  const n = courtNumFromExpressSlug(slug);
  if (!n) return [];
  return [`scan-go-${n}`, `fast-${n}`];
}

export function expressCanonicalCanchaCode(courtNumber: string): string {
  return expressSlugFromCourtNumber(courtNumber);
}

export function expressLegacyCanchaCode(courtNumber: string): string {
  const n = courtNumFromExpressSlug(expressSlugFromCourtNumber(courtNumber));
  return n ? `fast-${n}` : '';
}

/** Busca fila express por número de cancha (soporta legacy fast-N). */
export async function findExpressMatchByCourt(
  supabase: SupabaseClient,
  courtNumber: string,
): Promise<Record<string, unknown> | null> {
  for (const code of expressCanchaCodesForCourt(courtNumber)) {
    const { data, error } = await supabase
      .from('express_matches')
      .select('*')
      .eq('cancha_code', code)
      .maybeSingle();
    if (error) {
      console.error('[expressMatchDb] find by court:', code, error);
      continue;
    }
    if (data) return data as Record<string, unknown>;
  }
  return null;
}

export type ExpressSessionUpdateResult =
  | { ok: true; match: ExpressMatch }
  | { ok: false; reason: 'error' | 'stale_session'; message: string };

const OPTIONAL_EXPRESS_COLUMNS = [
  'server_team',
  'server_player',
  'third_set_mode',
  'warmup_ends_at',
  'match_started_at',
  'chrono_elapsed_sec',
  'match_ended_at',
  'side_change_until',
] as const;

const EXTENDED_EXPRESS_COLUMNS = [
  ...OPTIONAL_EXPRESS_COLUMNS,
  'team_a_p1_first',
  'team_a_p1_last',
  'team_a_p2_first',
  'team_a_p2_last',
  'team_b_p1_first',
  'team_b_p1_last',
  'team_b_p2_first',
  'team_b_p2_last',
  'base_venue',
  'qr_expires_at',
  'display_name_scale',
  'display_media_scale',
  'display_ticker_phrases',
] as const;

function stripColumns<T extends Record<string, unknown>>(
  payload: T,
  keys: readonly string[],
): T {
  const next = { ...payload };
  for (const key of keys) {
    delete next[key];
  }
  return next;
}

function stripOptionalExpressColumns<T extends Record<string, unknown>>(payload: T): T {
  return stripColumns(payload, OPTIONAL_EXPRESS_COLUMNS);
}

function stripExtendedExpressColumns<T extends Record<string, unknown>>(payload: T): T {
  return stripColumns(payload, EXTENDED_EXPRESS_COLUMNS);
}

function isMissingColumnError(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes('column') && (m.includes('does not exist') || m.includes('could not find'));
}

function isCanchaCodeConstraintError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('cancha_code') &&
    (m.includes('check constraint') ||
      m.includes('violates check') ||
      m.includes('express_matches_cancha_code'))
  );
}

function insertCanchaCodesForCourt(courtNumber: string): string[] {
  const canonical = expressCanonicalCanchaCode(courtNumber);
  const legacy = expressLegacyCanchaCode(courtNumber);
  if (!canonical) return [];
  return legacy && legacy !== canonical ? [canonical, legacy] : [canonical];
}

function payloadForCourtAttempt(
  updates: Record<string, unknown>,
  attempt: number,
): Record<string, unknown> {
  if (attempt === 0) return { ...updates };
  if (attempt === 1) return stripOptionalExpressColumns(updates);
  return stripExtendedExpressColumns(updates);
}

/**
 * UPDATE por session_id con verificación de fila afectada.
 * Reintenta sin columnas opcionales si el esquema aún no tiene migraciones 067–070.
 */
export async function updateExpressMatchBySession(
  supabase: SupabaseClient,
  sessionId: string,
  updates: Partial<ExpressMatch>,
): Promise<ExpressSessionUpdateResult> {
  let payload: Record<string, unknown> = { ...updates };

  for (let attempt = 0; attempt < 3; attempt++) {
    payload = payloadForCourtAttempt(updates as Record<string, unknown>, attempt);

    const { data, error } = await supabase
      .from('express_matches')
      .update(payload)
      .eq('session_id', sessionId)
      .select('*')
      .maybeSingle();

    if (error) {
      if (attempt < 2 && isMissingColumnError(error.message)) {
        continue;
      }
      return { ok: false, reason: 'error', message: error.message };
    }

    if (!data) {
      return {
        ok: false,
        reason: 'stale_session',
        message: 'Sesión no encontrada (¿reset desde Telegram?). Escanea el QR de nuevo.',
      };
    }

    return { ok: true, match: normalizeExpressMatch(data as Record<string, unknown>) };
  }

  return { ok: false, reason: 'error', message: 'No se pudo guardar el marcador.' };
}

export type ExpressCourtUpdateResult =
  | { ok: true; match: ExpressMatch }
  | { ok: false; message: string };

/**
 * UPDATE por cancha (Telegram). Conserva cancha_code existente (fast-N o scan-go-N).
 * Reintenta con menos columnas y con slug legacy si el esquema aún no migró a scan-go.
 */
export async function updateExpressMatchByCourt(
  supabase: SupabaseClient,
  courtNumber: string,
  updates: Partial<ExpressMatch>,
): Promise<ExpressCourtUpdateResult> {
  const existing = await findExpressMatchByCourt(supabase, courtNumber);
  const targetCode = expressCanonicalCanchaCode(courtNumber);
  if (!targetCode) {
    return { ok: false, message: 'Cancha inválida.' };
  }

  const rowId = existing?.id ? String(existing.id) : null;
  const insertCodes = insertCanchaCodesForCourt(courtNumber);
  const maxAttempts = rowId ? 3 : Math.max(3, insertCodes.length * 3);
  let lastMessage = 'No se pudo actualizar la cancha.';

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const payload = payloadForCourtAttempt(updates as Record<string, unknown>, attempt % 3);
    const insertCode = insertCodes[Math.floor(attempt / 3)] ?? insertCodes[insertCodes.length - 1];

    const query = rowId
      ? supabase.from('express_matches').update(payload).eq('id', rowId)
      : supabase
          .from('express_matches')
          .insert([{ ...payload, cancha_code: insertCode }]);

    const { data, error } = await (rowId ? query.select('*').maybeSingle() : query.select('*').single());

    if (error) {
      lastMessage = error.message;
      const canRetryColumns = attempt % 3 < 2 && isMissingColumnError(error.message);
      const canRetryLegacyInsert =
        !rowId &&
        isCanchaCodeConstraintError(error.message) &&
        attempt < maxAttempts - 1;
      if (canRetryColumns || canRetryLegacyInsert) {
        continue;
      }
      return { ok: false, message: error.message };
    }

    if (!data) {
      return { ok: false, message: 'No se pudo actualizar la cancha.' };
    }

    return { ok: true, match: normalizeExpressMatch(data as Record<string, unknown>) };
  }

  return { ok: false, message: lastMessage };
}

/** Normaliza slug de ruta / filtro realtime. */
export function expressMatchSlugCodes(slug: string): string[] {
  const canonical = normalizeExpressSlug(slug);
  const n = courtNumFromExpressSlug(canonical);
  if (!n) return [canonical];
  const codes = [`scan-go-${n}`];
  if (isLegacyExpressSlug(slug) || isLegacyExpressSlug(canonical)) {
    codes.push(`fast-${n}`);
  }
  return codes;
}
