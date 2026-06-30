/**
 * Publicidad en pantallas Express (/display/express/scan-go-N).
 * Playlists en `cancha_publicidad` con venue_name distinto al torneo para no mezclar contenidos.
 */

import { expressCourtCountForClub, resolveCanonicalExpressVenue } from '@/lib/expressVenueCourts';
import { EXPRESS_TV_BRAND, expressDisplayPath, expressSlugFromDisplayNum } from '@/lib/expressSlug';

/** Punto medio Unicode U+00B7 — debe coincidir con venue_name en cancha_publicidad (admin Express). */
const EXPRESS_VENUE_MIDDLE_DOT = '\u00B7';

/** Sufijo playlist Express: espacio + · + espacio + Express (no guión). */
export const EXPRESS_PUBLICIDAD_VENUE_SUFFIX = ` ${EXPRESS_VENUE_MIDDLE_DOT} Express`;

export function expressPublicidadVenueName(baseVenue: string): string {
  const base = String(baseVenue || '').trim();
  if (!base) return 'Express';
  if (base.endsWith(EXPRESS_PUBLICIDAD_VENUE_SUFFIX)) return base;
  // Normaliza variantes erróneas guardadas con guión o bullet distinto
  const normalized = base
    .replace(/\s*[-–]\s*Express\s*$/i, EXPRESS_PUBLICIDAD_VENUE_SUFFIX)
    .replace(/\s*•\s*Express\s*$/i, EXPRESS_PUBLICIDAD_VENUE_SUFFIX);
  if (normalized.endsWith(EXPRESS_PUBLICIDAD_VENUE_SUFFIX)) return normalized;
  return `${normalized}${EXPRESS_PUBLICIDAD_VENUE_SUFFIX}`;
}

/** Sede real a partir del venue de playlist Express. */
export function expressBaseVenueFromPublicidadVenue(venue: string): string {
  const v = String(venue || '').trim();
  if (v.endsWith(EXPRESS_PUBLICIDAD_VENUE_SUFFIX)) {
    return v.slice(0, -EXPRESS_PUBLICIDAD_VENUE_SUFFIX.length).trim();
  }
  return v;
}

export function expressDisplayPathForNum(displayNum: number): string {
  return expressDisplayPath(displayNum);
}

/**
 * URL de TV Express con query para sede (publicidad) y complejo (cabecera).
 * `venue` = clave de playlist Express; `complex` = nombre legible de la sede.
 */
export function buildExpressDisplayUrl(displayNum: number, baseVenue: string): string {
  const base = String(baseVenue || '').trim();
  const params = new URLSearchParams();
  if (base) {
    params.set('complex', base);
    params.set('venue', expressPublicidadVenueName(base));
  }
  const qs = params.toString();
  return `${expressDisplayPath(displayNum)}${qs ? `?${qs}` : ''}`;
}

export type ExpressCourtDef = {
  key: string;
  label: string;
  displayNum: number;
  slug: string;
};

export function buildExpressCourts(count: number): ExpressCourtDef[] {
  const n = Math.min(MAX_EXPRESS_COURT_COUNT, Math.max(1, Math.floor(count) || 1));
  return Array.from({ length: n }, (_, i) => {
    const displayNum = i + 1;
    const slug = expressSlugFromDisplayNum(displayNum);
    return {
      key: String(displayNum),
      label: `${EXPRESS_TV_BRAND} ${displayNum}`,
      displayNum,
      slug,
    };
  });
}

export const DEFAULT_EXPRESS_COURT_COUNT = 3;
export const MAX_EXPRESS_COURT_COUNT = 16;

const COURT_COUNT_STORAGE_KEY = 'express_publicidad_court_counts';

export function loadExpressCourtCounts(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(COURT_COUNT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed)) {
      const n = Math.floor(Number(v));
      if (k && Number.isFinite(n) && n >= 1) {
        out[k] = Math.min(MAX_EXPRESS_COURT_COUNT, n);
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function saveExpressCourtCount(baseVenue: string, count: number): void {
  if (typeof window === 'undefined') return;
  const key = String(baseVenue || '').trim().toLowerCase();
  if (!key) return;
  const all = loadExpressCourtCounts();
  all[key] = Math.min(MAX_EXPRESS_COURT_COUNT, Math.max(1, Math.floor(count) || DEFAULT_EXPRESS_COURT_COUNT));
  window.localStorage.setItem(COURT_COUNT_STORAGE_KEY, JSON.stringify(all));
}

export function expressCourtCountForVenue(baseVenue: string): number {
  const key = String(baseVenue || '').trim().toLowerCase();
  const stored = loadExpressCourtCounts()[key];
  if (stored && stored >= 1) return stored;
  return expressCourtCountForClub(baseVenue);
}

/** Orden de búsqueda de playlist en TV Express (Express · sede, luego sede torneo). */
export function expressPlaylistVenueCandidates(
  baseVenue: string,
  explicitVenueParam?: string | null,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const add = (raw: string) => {
    const v = String(raw || '').trim();
    if (!v) return;
    const key = v.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(v);
  };

  const explicit = String(explicitVenueParam || '').trim();
  if (explicit.includes('Express')) add(explicit);

  const baseRaw = String(baseVenue || '').trim();
  const base = resolveCanonicalExpressVenue(baseRaw) ?? baseRaw;
  if (base) {
    add(expressPublicidadVenueName(base));
    add(base);
    // Variante legacy con guión (por si en BD quedó "El Bodeguero - Express")
    add(`${base} - Express`);
  }

  return out;
}
