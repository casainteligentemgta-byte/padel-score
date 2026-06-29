import { SHORT_URL_SEDE_LABELS } from '@/lib/pizarraShortUrl';

/** Canchas Express por sede (fuente única para Telegram, admin y TV). */
export const EXPRESS_VENUE_COURT_COUNTS: Record<string, number> = {
  'El Bodeguero': 3,
  Elite: 4,
  'Food Kart': 3,
  'Margarita Padel': 6,
  'Playa el Agua': 3,
  'Sun Sol Costa Azul': 4,
  'Sun Sol Pedro Gonzalez': 2,
  Tibisay: 3,
};

/** Si no se reconoce la sede (evita mostrar 4 canchas por defecto en clubes pequeños). */
export const EXPRESS_DEFAULT_COURT_COUNT = 3;

/** Alias → nombre canónico (club_slug, Telegram, ?complex=). */
const EXPRESS_VENUE_ALIASES: Record<string, string> = {
  bodeguero: 'El Bodeguero',
  'el bodeguero': 'El Bodeguero',
  elite: 'Elite',
  foodkart: 'Food Kart',
  'food kart': 'Food Kart',
  margarita: 'Margarita Padel',
  'margarita padel': 'Margarita Padel',
  tibisay: 'Tibisay',
  'sun sol costa azul': 'Sun Sol Costa Azul',
  'costa azul': 'Sun Sol Costa Azul',
  'sun sol pedro gonzalez': 'Sun Sol Pedro Gonzalez',
  'pedro gonzalez': 'Sun Sol Pedro Gonzalez',
  pedrogonzalez: 'Sun Sol Pedro Gonzalez',
  'playa el agua': 'Playa el Agua',
};

export function normalizeExpressClubSlug(raw: string): string {
  return String(raw ?? '').trim();
}

/** Nombre canónico de sede para BD/Telegram (p. ej. bodeguero → El Bodeguero). */
export function resolveExpressClubSlugForDb(raw: string): string {
  const trimmed = normalizeExpressClubSlug(raw);
  return resolveCanonicalExpressVenue(trimmed) ?? trimmed;
}

function normalizeVenueLookupKey(raw: string): string {
  return String(raw ?? '')
    .trim()
    .replace(/\s*·\s*express\s*$/i, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/** Resuelve el nombre oficial de sede a partir de slug, alias o ?complex=. */
export function resolveCanonicalExpressVenue(raw: string): string | null {
  const key = normalizeVenueLookupKey(raw);
  if (!key) return null;

  for (const label of SHORT_URL_SEDE_LABELS) {
    if (label.toLowerCase() === key) return label;
  }

  const alias = EXPRESS_VENUE_ALIASES[key];
  if (alias) return alias;

  for (const label of SHORT_URL_SEDE_LABELS) {
    const labelKey = label.toLowerCase();
    if (key.includes(labelKey) || labelKey.includes(key)) return label;
  }

  const direct = EXPRESS_VENUE_COURT_COUNTS[raw.trim()];
  if (direct != null) return raw.trim();

  return null;
}

export function expressCourtCountForClub(clubSlug: string): number {
  const canonical = resolveCanonicalExpressVenue(clubSlug);
  if (canonical) {
    const count = EXPRESS_VENUE_COURT_COUNTS[canonical];
    if (count != null && count > 0) return count;
  }
  return EXPRESS_DEFAULT_COURT_COUNT;
}

export function expressCourtNumbersForClub(clubSlug: string): string[] {
  const count = expressCourtCountForClub(clubSlug);
  return Array.from({ length: count }, (_, i) => String(i + 1));
}

export function sortCourtNumbers(values: Iterable<string>): string[] {
  return Array.from(new Set(Array.from(values).map(String).filter(Boolean))).sort(
    (a, b) => Number(a) - Number(b) || a.localeCompare(b),
  );
}

/** Filtra números de cancha al máximo configurado para la sede. */
export function clampCourtNumbersForClub(clubSlug: string, courtNumbers: Iterable<string>): string[] {
  const max = expressCourtCountForClub(clubSlug);
  return sortCourtNumbers(courtNumbers).filter((n) => {
    const num = Number(n);
    return Number.isFinite(num) && num >= 1 && num <= max;
  });
}

/** Lista ordenada alfabéticamente para selects admin. */
export const EXPRESS_VENUE_OPTIONS = [...SHORT_URL_SEDE_LABELS].sort((a, b) =>
  a.localeCompare(b, 'es'),
);
