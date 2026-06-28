import { SHORT_URL_SEDE_LABELS } from '@/lib/pizarraShortUrl';

/** Canchas Express por sede (misma base que Generador Maestro / URLs cortas). */
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

/** Fallback si la sede no está en la tabla (hasta 4 pistas). */
export const EXPRESS_DEFAULT_COURT_COUNT = 4;

export function normalizeExpressClubSlug(raw: string): string {
  return String(raw ?? '').trim();
}

export function expressCourtNumbersForClub(clubSlug: string): string[] {
  const slug = normalizeExpressClubSlug(clubSlug);
  const lower = slug.toLowerCase();

  for (const label of SHORT_URL_SEDE_LABELS) {
    if (label.toLowerCase() === lower) {
      const count = EXPRESS_VENUE_COURT_COUNTS[label] ?? EXPRESS_DEFAULT_COURT_COUNT;
      return Array.from({ length: count }, (_, i) => String(i + 1));
    }
  }

  const direct = EXPRESS_VENUE_COURT_COUNTS[slug];
  if (direct != null && direct > 0) {
    return Array.from({ length: direct }, (_, i) => String(i + 1));
  }

  return Array.from({ length: EXPRESS_DEFAULT_COURT_COUNT }, (_, i) => String(i + 1));
}

export function sortCourtNumbers(values: Iterable<string>): string[] {
  return Array.from(new Set(Array.from(values).map(String).filter(Boolean))).sort(
    (a, b) => Number(a) - Number(b) || a.localeCompare(b),
  );
}
