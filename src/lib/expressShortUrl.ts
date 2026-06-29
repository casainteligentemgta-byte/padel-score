import { getAppBaseUrl } from '@/lib/brand';
import { expressCourtCountForClub, resolveCanonicalExpressVenue } from '@/lib/expressVenueCourts';
import { SHORT_URL_SEDE_LABELS } from '@/lib/pizarraShortUrl';

/** Códigos cortos manuales por sede Express (URLs y Telegram). */
export const EXPRESS_VENUE_PATH_CODES: Record<string, string> = {
  'El Bodeguero': 'BD',
  'Food Kart': 'FK',
  Elite: 'ELITE',
  'Margarita Padel': 'MP',
  'Playa el Agua': 'ELAGUA',
  'Sun Sol Pedro Gonzalez': 'SSPG',
  'Sun Sol Costa Azul': 'SSCA',
  Tibisay: 'TBS',
};

const EXPRESS_PATH_CODE_TO_VENUE: Record<string, string> = Object.fromEntries(
  Object.entries(EXPRESS_VENUE_PATH_CODES).map(([venue, code]) => [code.toUpperCase(), venue]),
);

function legacyAutoSlug(canonicalVenue: string): string {
  return String(canonicalVenue ?? '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
}

/** Sede canónica → código de URL (ej. El Bodeguero → BD). */
export function expressVenuePathSlug(canonicalVenue: string): string {
  const canonical = resolveCanonicalExpressVenue(canonicalVenue) ?? canonicalVenue.trim();
  const code = EXPRESS_VENUE_PATH_CODES[canonical];
  if (code) return code;
  return legacyAutoSlug(canonical);
}

/** Slug de URL → nombre canónico de sede Express (código manual o legacy). */
export function resolveExpressVenueFromPathSlug(raw: string): string | null {
  const compact = String(raw ?? '')
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
  if (!compact) return null;

  const byCode = EXPRESS_PATH_CODE_TO_VENUE[compact];
  if (byCode) return byCode;

  for (const label of SHORT_URL_SEDE_LABELS) {
    if (legacyAutoSlug(label) === compact) return label;
  }
  return null;
}

/** Segmento de cancha en URL corta: C1, c2, … */
export function parseExpressCourtPathSegment(raw: string): number | null {
  const m = String(raw ?? '')
    .trim()
    .toUpperCase()
    .match(/^C(\d+)$/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n >= 1 ? n : null;
}

export function isExpressShortCourtValid(canonicalVenue: string, courtNum: number): boolean {
  const max = expressCourtCountForClub(canonicalVenue);
  return courtNum >= 1 && courtNum <= max;
}

/** Ruta corta Express: /BD/C1 */
export function buildExpressShortDisplayPath(canonicalVenue: string, courtNum: number): string {
  return `/${expressVenuePathSlug(canonicalVenue)}/C${courtNum}`;
}

export function buildExpressShortDisplayUrl(canonicalVenue: string, courtNum: number): string {
  return `${getAppBaseUrl()}${buildExpressShortDisplayPath(canonicalVenue, courtNum)}`;
}

/** Destino interno tras resolver la URL corta. */
export function buildExpressDisplayPathFromShortUrl(
  canonicalVenue: string,
  courtNum: number,
): string {
  const params = new URLSearchParams();
  params.set('complex', canonicalVenue);
  return `/display/express/scan-go-${courtNum}?${params.toString()}`;
}
