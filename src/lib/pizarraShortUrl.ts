/**
 * URLs cortas tipo smartpadel58.com/s1/c2 (sede 1–8, cancha 1–n).
 * Debe coincidir con `src/app/[sede]/[cancha]/page.tsx` (SEDE_MAP) y CourtCard.
 */

export const SHORT_URL_SEDE_LABELS = [
  'El Bodeguero',
  'Elite',
  'Food Kart',
  'Margarita Padel',
  'Playa el Agua',
  'Sun Sol Costa Azul',
  'Sun Sol Pedro Gonzalez',
  'Tibisay',
] as const;

/** Índice 1–8 → nombre de sede (misma orden que S1…S8 en la ruta corta). */
export function venueNameFromSedeIndex(index: number): string | null {
  if (!Number.isFinite(index) || index < 1 || index > SHORT_URL_SEDE_LABELS.length) return null;
  return SHORT_URL_SEDE_LABELS[index - 1];
}

const VENUE_TO_INDEX = new Map<string, number>(
  SHORT_URL_SEDE_LABELS.map((name, i) => [name.trim().toLowerCase(), i + 1]),
);

export function sedeIndexFromVenueName(venueName: string): number | null {
  const v = venueName.trim().toLowerCase();
  const idx = VENUE_TO_INDEX.get(v);
  return idx ?? null;
}

export function buildPizarraShortPath(sedeIndex: number, courtNum: number): string {
  return `s${sedeIndex}/c${courtNum}`;
}

/** Misma tabla que la ruta dinámica `[sede]` (S1…S8 → nombre). */
export const SEDE_CODE_TO_VENUE: Record<string, string> = Object.fromEntries(
  SHORT_URL_SEDE_LABELS.map((name, i) => [`S${i + 1}`, name]),
);
