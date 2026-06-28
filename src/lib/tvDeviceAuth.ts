import { courtNumFromExpressSlug } from '@/lib/expressMatchToMarcador';

/** Número de pista desde slug fast-N o valor ya numérico. */
export function normalizeTvCourtNumber(raw: string): string {
  const t = String(raw ?? '').trim();
  if (!t) return '';
  const m = t.match(/^fast-(\d+)$/i);
  return m ? m[1] : t.replace(/^fast-/i, '');
}

export function expressCanchaCodeFromCourtNumber(courtNumber: string): string {
  const n = normalizeTvCourtNumber(courtNumber);
  return n ? `fast-${n}` : '';
}

export function courtNumberFromExpressSlug(slug: string): string {
  return courtNumFromExpressSlug(slug);
}

export function generateTvPinCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function normalizeClubSlug(raw: unknown): string {
  return String(raw ?? '').trim();
}

export function normalizeDeviceToken(raw: unknown): string {
  return String(raw ?? '').trim();
}
