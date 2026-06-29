import type { ExpressMatch } from '@/types/expressMatch';

/** Ventana QR tras comando Telegram del encargado (5 min). */
export const EXPRESS_QR_WINDOW_MS = 5 * 60_000;

/** QR visible en standby solo durante la ventana activa (Telegram). */
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

/** Cuenta atrás legible en TV (ej. 4:32). */
export function formatExpressQrCountdown(secondsLeft: number): string {
  const s = Math.max(0, Math.floor(secondsLeft));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}
