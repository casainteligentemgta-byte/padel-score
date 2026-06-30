import { randomUUID } from 'node:crypto';
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

export function expressLegacyCanchaCode(courtNumber: string): string {
  const n = courtNumFromExpressSlug(expressSlugFromCourtNumber(courtNumber));
  return n ? `fast-${n}` : '';
}

export function expressCanonicalCanchaCode(courtNumber: string): string {
  return expressSlugFromCourtNumber(courtNumber);
}

/** Busca fila express por número de cancha (soporta legacy fast-N). */
export async function findExpressMatchByCourt(
  supabase: SupabaseClient,
  courtNumber: string,
): Promise<Record<string, unknown> | null> {
  const rows = await findAllExpressMatchesByCourt(supabase, courtNumber);
  return rows[0] ?? null;
}

/** Todas las filas duplicadas (scan-go-N y fast-N a la vez). */
export async function findAllExpressMatchesByCourt(
  supabase: SupabaseClient,
  courtNumber: string,
): Promise<Record<string, unknown>[]> {
  const found: Record<string, unknown>[] = [];
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
    if (data) found.push(data as Record<string, unknown>);
  }
  return found;
}

/**
 * Si existen fast-N y scan-go-N, conserva scan-go-N y borra el legacy.
 */
export async function dedupeExpressCourtRows(
  supabase: SupabaseClient,
  courtNumber: string,
): Promise<Record<string, unknown> | null> {
  const rows = await findAllExpressMatchesByCourt(supabase, courtNumber);
  if (rows.length === 0) return null;
  if (rows.length === 1) return rows[0];

  const canonicalCode = expressCanonicalCanchaCode(courtNumber);
  const keeper =
    rows.find((r) => String(r.cancha_code ?? '') === canonicalCode) ?? rows[0];

  for (const row of rows) {
    if (String(row.id) === String(keeper.id)) continue;
    const { error } = await supabase.from('express_matches').delete().eq('id', String(row.id));
    if (error) {
      console.error('[expressMatchDb] dedupe delete:', row.cancha_code, error);
    }
  }

  return keeper;
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
  'display_name_scale',
  'display_media_scale',
  'display_ticker_phrases',
] as const;

function stripOptionalExpressColumns<T extends Record<string, unknown>>(payload: T): T {
  const next = { ...payload };
  for (const key of OPTIONAL_EXPRESS_COLUMNS) {
    delete next[key];
  }
  return next;
}

function stripCanchaCode(payload: Record<string, unknown>): Record<string, unknown> {
  const next = { ...payload };
  delete next.cancha_code;
  return next;
}

function isMissingColumnError(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes('column') && (m.includes('does not exist') || m.includes('could not find'));
}

function isCanchaCodeError(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes('cancha_code') || m.includes('cancha_code_format_chk');
}

function isRetryableExpressError(message: string): boolean {
  return isMissingColumnError(message) || isCanchaCodeError(message);
}

/**
 * UPDATE por session_id con verificación de fila afectada.
 */
export async function updateExpressMatchBySession(
  supabase: SupabaseClient,
  sessionId: string,
  updates: Partial<ExpressMatch>,
): Promise<ExpressSessionUpdateResult> {
  let payload: Record<string, unknown> = { ...updates };
  let stripOptional = false;
  let stripCode = false;

  for (let attempt = 0; attempt < 4; attempt++) {
    let body = { ...payload };
    if (stripOptional) body = stripOptionalExpressColumns(body);
    if (stripCode) body = stripCanchaCode(body);

    const { data, error } = await supabase
      .from('express_matches')
      .update(body)
      .eq('session_id', sessionId)
      .select('*')
      .maybeSingle();

    if (error) {
      if (!stripOptional && isMissingColumnError(error.message)) {
        stripOptional = true;
        continue;
      }
      if (!stripCode && isCanchaCodeError(error.message)) {
        stripCode = true;
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

async function insertExpressCourtRow(
  supabase: SupabaseClient,
  courtNumber: string,
  payload: Record<string, unknown>,
): Promise<{ data: Record<string, unknown> | null; error: string | null }> {
  const codes = [
    expressCanonicalCanchaCode(courtNumber),
    expressLegacyCanchaCode(courtNumber),
  ].filter((c, i, a) => c && a.indexOf(c) === i);

  let lastError: string | null = null;
  for (const code of codes) {
    const { data, error } = await supabase
      .from('express_matches')
      .insert([{ ...payload, cancha_code: code }])
      .select('*')
      .single();
    if (!error && data) {
      return { data: data as Record<string, unknown>, error: null };
    }
    lastError = error?.message ?? 'insert failed';
    if (!isCanchaCodeError(lastError)) break;
  }
  return { data: null, error: lastError };
}

/**
 * UPDATE por cancha (Telegram). Migra fast-N → scan-go-N si aplica.
 */
export async function updateExpressMatchByCourt(
  supabase: SupabaseClient,
  courtNumber: string,
  updates: Partial<ExpressMatch>,
): Promise<ExpressCourtUpdateResult> {
  const targetCode = expressCanonicalCanchaCode(courtNumber);
  if (!targetCode) {
    return { ok: false, message: 'Cancha inválida.' };
  }

  const existing = await dedupeExpressCourtRows(supabase, courtNumber);
  let payload: Record<string, unknown> = { ...updates };
  let stripOptional = false;
  let stripCode = false;

  if (existing && String(existing.cancha_code ?? '') !== targetCode) {
    payload.cancha_code = targetCode;
  }

  const rowId = existing?.id ? String(existing.id) : null;

  for (let attempt = 0; attempt < 5; attempt++) {
    if (!rowId) {
      let body = { ...payload };
      if (stripOptional) body = stripOptionalExpressColumns(body);
      const inserted = await insertExpressCourtRow(supabase, courtNumber, body);
      if (inserted.data) {
        return { ok: true, match: normalizeExpressMatch(inserted.data) };
      }
      if (inserted.error) {
        if (!stripOptional && isRetryableExpressError(inserted.error)) {
          stripOptional = true;
          continue;
        }
        return { ok: false, message: inserted.error };
      }
      continue;
    }

    let body = { ...payload };
    if (stripOptional) body = stripOptionalExpressColumns(body);
    if (stripCode) body = stripCanchaCode(body);

    const { data, error } = await supabase
      .from('express_matches')
      .update(body)
      .eq('id', rowId)
      .select('*')
      .maybeSingle();

    if (error) {
      if (!stripOptional && isMissingColumnError(error.message)) {
        stripOptional = true;
        continue;
      }
      if (!stripCode && isCanchaCodeError(error.message)) {
        stripCode = true;
        continue;
      }
      return { ok: false, message: error.message };
    }

    if (!data) {
      return { ok: false, message: 'No se pudo actualizar la cancha.' };
    }

    return { ok: true, match: normalizeExpressMatch(data as Record<string, unknown>) };
  }

  return { ok: false, message: 'No se pudo actualizar la cancha.' };
}

/** UUID seguro en servidor (Telegram / API). */
export function expressNewSessionId(): string {
  return randomUUID();
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
