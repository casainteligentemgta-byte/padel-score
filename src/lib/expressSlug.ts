/** Prefijo URL/DB para pistas Express (scan-go-3 → slug de ruta, sin cambiar branding TV). */
export const EXPRESS_CANCHA_PREFIX = 'scan-go';

const LEGACY_PREFIX = 'fast';

export function expressSlugFromCourtNumber(courtNumber: string | number): string {
  const n = String(courtNumber ?? '').trim().replace(/^scan-go-/i, '').replace(/^fast-/i, '');
  if (!n || !/^\d+$/.test(n)) return '';
  return `${EXPRESS_CANCHA_PREFIX}-${n}`;
}

export function expressSlugFromDisplayNum(displayNum: number): string {
  return expressSlugFromCourtNumber(Math.max(1, Math.floor(displayNum)));
}

export function courtNumFromExpressSlug(slug: string): string {
  const t = String(slug ?? '').trim();
  const m = t.match(/^(?:scan-go|fast)-(\d+)$/i);
  if (m) return m[1];
  return t.replace(/^(?:scan-go|fast)-/i, '');
}

export function isValidExpressSlug(slug: string): boolean {
  return /^(?:scan-go|fast)-\d+$/i.test(String(slug ?? '').trim());
}

export function normalizeExpressSlug(slug: string): string {
  const n = courtNumFromExpressSlug(slug);
  return n ? expressSlugFromCourtNumber(n) : String(slug ?? '').trim();
}

export function isLegacyExpressSlug(slug: string): boolean {
  return /^fast-\d+$/i.test(String(slug ?? '').trim());
}

/** Marca visible en pantallas TV Express (/display/express/[slug]). */
export const EXPRESS_TV_BRAND = 'SmartPadel58';

/** Etiqueta de cancha en TV / control (p. ej. CANCHA 3). */
export function expressSlugDisplayLabel(slug: string): string {
  const n = courtNumFromExpressSlug(slug);
  return n ? `CANCHA ${n}` : EXPRESS_TV_BRAND;
}

export function expressDisplayPath(displayNum: number): string {
  return `/display/express/${expressSlugFromDisplayNum(displayNum)}`;
}
