/**
 * Publicidad en pantallas Express (/display/express/fast-N).
 * Playlists en `cancha_publicidad` con venue_name distinto al torneo para no mezclar contenidos.
 */

export const EXPRESS_PUBLICIDAD_VENUE_SUFFIX = ' · Express';

export function expressPublicidadVenueName(baseVenue: string): string {
  const base = String(baseVenue || '').trim();
  if (!base) return 'Express';
  if (base.endsWith(EXPRESS_PUBLICIDAD_VENUE_SUFFIX)) return base;
  return `${base}${EXPRESS_PUBLICIDAD_VENUE_SUFFIX}`;
}

/** Sede real a partir del venue de playlist Express. */
export function expressBaseVenueFromPublicidadVenue(venue: string): string {
  const v = String(venue || '').trim();
  if (v.endsWith(EXPRESS_PUBLICIDAD_VENUE_SUFFIX)) {
    return v.slice(0, -EXPRESS_PUBLICIDAD_VENUE_SUFFIX.length).trim();
  }
  return v;
}

export function expressSlugFromDisplayNum(displayNum: number): string {
  return `fast-${Math.max(1, Math.floor(displayNum))}`;
}

export function expressDisplayPath(displayNum: number): string {
  return `/display/express/${expressSlugFromDisplayNum(displayNum)}`;
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
      label: `Express ${slug.toUpperCase()}`,
      displayNum,
      slug,
    };
  });
}

export const DEFAULT_EXPRESS_COURT_COUNT = 4;
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
  return DEFAULT_EXPRESS_COURT_COUNT;
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

  const base = String(baseVenue || '').trim();
  if (base) {
    add(expressPublicidadVenueName(base));
    add(base);
  }

  return out;
}
