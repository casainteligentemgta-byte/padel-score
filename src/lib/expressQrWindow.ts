import type { ExpressMatch } from '@/types/expressMatch';

/** QR visible en standby solo durante la ventana activa (Telegram, 60 s). */
export function isExpressQrWindowOpen(match: ExpressMatch, nowMs = Date.now()): boolean {
  if (match.is_active) return false;
  const exp = match.qr_expires_at;
  if (!exp) return false;
  const t = new Date(exp).getTime();
  if (Number.isNaN(t)) return false;
  return t > nowMs;
}

export function expressQrWindowSecondsLeft(match: ExpressMatch, nowMs = Date.now()): number | null {
  if (!match.qr_expires_at) return null;
  const t = new Date(match.qr_expires_at).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.ceil((t - nowMs) / 1000));
}
