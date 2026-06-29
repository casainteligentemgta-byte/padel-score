/** Base tipográfica nombres Express (~13px a escala 1). */
export const EXPRESS_PLAYER_NAME_BASE_REM = 0.8125;

export const EXPRESS_DISPLAY_NAME_SCALE_DEFAULT = 1.25;

export const EXPRESS_DISPLAY_NAME_SCALE_MIN = 0.85;
export const EXPRESS_DISPLAY_NAME_SCALE_MAX = 2.5;
export const EXPRESS_DISPLAY_NAME_SCALE_STEP = 0.05;

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

function snapExpressScaleStep(
  n: number,
  min: number,
  max: number,
  step: number,
): number {
  const snapped = Math.round(n / step) * step;
  return Math.min(max, Math.max(min, Number(snapped.toFixed(2))));
}

export function normalizeExpressDisplayNameScale(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return EXPRESS_DISPLAY_NAME_SCALE_DEFAULT;
  return snapExpressScaleStep(
    n,
    EXPRESS_DISPLAY_NAME_SCALE_MIN,
    EXPRESS_DISPLAY_NAME_SCALE_MAX,
    EXPRESS_DISPLAY_NAME_SCALE_STEP,
  );
}

export function expressPlayerNameFontSize(scale: number): string {
  const s = normalizeExpressDisplayNameScale(scale);
  return `calc(${EXPRESS_PLAYER_NAME_BASE_REM}rem * ${s})`;
}

/** Base celdas de juegos/puntos (~11px a escala 1). */
export const EXPRESS_SCORE_CELL_BASE_REM = 0.6875;
/** Base cabeceras SET (~9px a escala 1). */
export const EXPRESS_SET_HEADER_BASE_REM = 0.5625;
/** Base cabecera POINTS (~8px a escala 1). */
export const EXPRESS_POINTS_HEADER_BASE_REM = 0.5;
/** Ancho columna set / points (rem a escala 1). */
export const EXPRESS_SET_COL_WIDTH_REM = 2.35;
export const EXPRESS_PTS_COL_WIDTH_REM = 3.1;

export function expressPizarraFontSize(baseRem: number, scale: number): string {
  const s = normalizeExpressDisplayNameScale(scale);
  return `calc(${baseRem}rem * ${s})`;
}

export function expressPizarraColWidth(baseRem: number, scale: number): string {
  const s = normalizeExpressDisplayNameScale(scale);
  return `calc(${baseRem}rem * ${s})`;
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
