import { courtNumFromExpressSlug, expressSlugFromCourtNumber } from '@/lib/expressSlug';

/** Número de pista desde slug scan-go-N / fast-N (legacy) o valor numérico. */
export function normalizeTvCourtNumber(raw: string): string {
  const t = String(raw ?? '').trim();
  if (!t) return '';
  if (/^(?:scan-go|fast)-\d+$/i.test(t)) return courtNumFromExpressSlug(t);
  return t.replace(/^(?:scan-go|fast)-/i, '');
}

export function expressCanchaCodeFromCourtNumber(courtNumber: string): string {
  return expressSlugFromCourtNumber(courtNumber);
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
