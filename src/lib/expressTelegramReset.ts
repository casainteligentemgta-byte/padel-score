import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { buildExpressSessionReset } from '@/lib/expressScoring';
import { updateExpressMatchByCourt } from '@/lib/expressMatchDb';
import { EXPRESS_QR_WINDOW_MS } from '@/lib/expressQrWindow';

const QR_WINDOW_MINUTES = Math.max(1, Math.round(EXPRESS_QR_WINDOW_MS / 60_000));

export type ExpressBoardResetResult =
  | { ok: true; sessionId: string }
  | { ok: false; message: string };

function isMissingRpcError(error: PostgrestError | null): boolean {
  const msg = String(error?.message ?? '').toLowerCase();
  return (
    msg.includes('resetear_express_cancha_telegram') &&
    (msg.includes('does not exist') || msg.includes('could not find'))
  );
}

function isExpressRlsGuardError(message: string): boolean {
  const msg = message.toLowerCase();
  return (
    msg.includes('express_matches:') ||
    msg.includes('actualización no permitida') ||
    msg.includes('qr_expires_at solo puede borrarse')
  );
}

function formatExpressResetError(message: string): string {
  if (isExpressRlsGuardError(message)) {
    return 'Error al resetear la cancha. Falta la función resetear_express_cancha_telegram (migración 072) o service_role en el servidor.';
  }
  if (message.toLowerCase().includes('does not exist')) {
    return `Error al resetear la cancha: ${message}. Ejecuta 071_express_schema_repair.sql en Supabase.`;
  }
  return `Error al resetear la cancha: ${message}`;
}

async function resetExpressBoardViaRpc(
  supabase: SupabaseClient,
  courtNumber: string,
  baseVenue: string,
): Promise<ExpressBoardResetResult> {
  const courtNum = Number(courtNumber);
  if (!Number.isFinite(courtNum) || courtNum < 1) {
    return { ok: false, message: 'Cancha inválida.' };
  }

  const { data, error } = await supabase.rpc('resetear_express_cancha_telegram', {
    p_court_number: courtNum,
    p_base_venue: baseVenue,
    p_qr_window_minutes: QR_WINDOW_MINUTES,
  });

  if (error) {
    if (isMissingRpcError(error)) {
      return { ok: false, message: '__rpc_missing__' };
    }
    return { ok: false, message: error.message };
  }

  const payload = data as { ok?: boolean; message?: string; session_id?: string } | null;
  if (payload?.ok === true && payload.session_id) {
    return { ok: true, sessionId: String(payload.session_id) };
  }

  return {
    ok: false,
    message: String(payload?.message ?? 'No se pudo resetear la cancha.'),
  };
}

async function resetExpressBoardViaTable(
  supabase: SupabaseClient,
  courtNumber: string,
  baseVenue: string,
): Promise<ExpressBoardResetResult> {
  const reset = buildExpressSessionReset(crypto.randomUUID());
  const qrExpiresAt = new Date(Date.now() + EXPRESS_QR_WINDOW_MS).toISOString();

  const result = await updateExpressMatchByCourt(supabase, courtNumber, {
    ...reset,
    base_venue: baseVenue,
    qr_expires_at: qrExpiresAt,
  });

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  return { ok: true, sessionId: result.match.session_id };
}

export async function resetExpressBoardForTelegram(
  supabase: SupabaseClient,
  courtNumber: string,
  baseVenue: string,
): Promise<ExpressBoardResetResult> {
  const rpcResult = await resetExpressBoardViaRpc(supabase, courtNumber, baseVenue);
  if (rpcResult.ok) return rpcResult;
  if (rpcResult.message !== '__rpc_missing__') {
    return rpcResult;
  }

  console.warn('[expressTelegram] reset RPC no disponible; usando fallback por tabla');
  return resetExpressBoardViaTable(supabase, courtNumber, baseVenue);
}

export function expressBoardResetUserMessage(
  result: ExpressBoardResetResult,
  courtNumber: string,
  qrWindowLabel: string,
): string {
  if (result.ok) {
    return `🔄 Cancha ${courtNumber} reseteada · QR activo ${qrWindowLabel}`;
  }
  return formatExpressResetError(result.message);
}
