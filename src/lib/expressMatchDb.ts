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

function stripOptionalExpressColumns<T extends Record<string, unknown>>(payload: T): T {
  const next = { ...payload };
  for (const key of OPTIONAL_EXPRESS_COLUMNS) {
    delete next[key];
  }
  return next;
}

function isMissingColumnError(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes('column') && (m.includes('does not exist') || m.includes('could not find'));
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

  for (let attempt = 0; attempt < 2; attempt++) {
    const { data, error } = await supabase
      .from('express_matches')
      .update(payload)
      .eq('session_id', sessionId)
      .select('*')
      .maybeSingle();

    if (error) {
      if (attempt === 0 && isMissingColumnError(error.message)) {
        payload = stripOptionalExpressColumns(payload);
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
 * UPDATE por cancha (Telegram). Migra fast-N → scan-go-N si aplica.
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

  let payload: Record<string, unknown> = { ...updates };
  if (existing && String(existing.cancha_code ?? '') !== targetCode) {
    payload.cancha_code = targetCode;
  }

  const rowId = existing?.id ? String(existing.id) : null;

  for (let attempt = 0; attempt < 2; attempt++) {
    const query = rowId
      ? supabase.from('express_matches').update(payload).eq('id', rowId)
      : supabase.from('express_matches').insert([{ ...payload, cancha_code: targetCode }]);

    const { data, error } = await (rowId ? query.select('*').maybeSingle() : query.select('*').single());

    if (error) {
      if (attempt === 0 && isMissingColumnError(error.message)) {
        payload = stripOptionalExpressColumns(payload);
        if (!rowId) payload.cancha_code = targetCode;
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
