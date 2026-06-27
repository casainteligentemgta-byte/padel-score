/** Base tipográfica nombres Express (~13px a escala 1). */
export const EXPRESS_PLAYER_NAME_BASE_REM = 0.8125;

export const EXPRESS_DISPLAY_NAME_SCALE_DEFAULT = 1.25;

export const EXPRESS_DISPLAY_NAME_SCALE_MIN = 0.85;
export const EXPRESS_DISPLAY_NAME_SCALE_MAX = 1.6;

export type ExpressNameScalePresetId = 'S' | 'M' | 'L' | 'XL';

export const EXPRESS_NAME_SCALE_PRESETS: {
  id: ExpressNameScalePresetId;
  label: string;
  shortLabel: string;
  value: number;
}[] = [
  { id: 'S', label: 'Pequeño', shortLabel: 'S', value: 0.85 },
  { id: 'M', label: 'Normal', shortLabel: 'M', value: 1 },
  { id: 'L', label: 'Grande', shortLabel: 'L', value: 1.25 },
  { id: 'XL', label: 'Muy grande', shortLabel: 'XL', value: 1.5 },
];

export function normalizeExpressDisplayNameScale(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return EXPRESS_DISPLAY_NAME_SCALE_DEFAULT;
  return Math.min(
    EXPRESS_DISPLAY_NAME_SCALE_MAX,
    Math.max(EXPRESS_DISPLAY_NAME_SCALE_MIN, Math.round(n * 100) / 100),
  );
}

export function expressPlayerNameFontSize(scale: number): string {
  const s = normalizeExpressDisplayNameScale(scale);
  return `calc(${EXPRESS_PLAYER_NAME_BASE_REM}rem * ${s})`;
}

export function nearestExpressNameScalePresetId(scale: number): ExpressNameScalePresetId {
  const s = normalizeExpressDisplayNameScale(scale);
  let best = EXPRESS_NAME_SCALE_PRESETS[0];
  let bestDist = Math.abs(s - best.value);
  for (const p of EXPRESS_NAME_SCALE_PRESETS) {
    const d = Math.abs(s - p.value);
    if (d < bestDist) {
      best = p;
      bestDist = d;
    }
  }
  return best.id;
}
