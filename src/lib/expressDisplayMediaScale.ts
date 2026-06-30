export const EXPRESS_DISPLAY_MEDIA_SCALE_DEFAULT = 1;

export const EXPRESS_DISPLAY_MEDIA_SCALE_MIN = 0.5;
export const EXPRESS_DISPLAY_MEDIA_SCALE_MAX = 2.5;
export const EXPRESS_DISPLAY_MEDIA_SCALE_STEP = 0.05;

export type ExpressMediaScalePresetId = 'S' | 'M' | 'L' | 'XL';

export const EXPRESS_MEDIA_SCALE_PRESETS: {
  id: ExpressMediaScalePresetId;
  label: string;
  shortLabel: string;
  value: number;
}[] = [
  { id: 'S', label: 'Pequeño', shortLabel: 'S', value: 0.65 },
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

export function normalizeExpressDisplayMediaScale(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return EXPRESS_DISPLAY_MEDIA_SCALE_DEFAULT;
  return snapExpressScaleStep(
    n,
    EXPRESS_DISPLAY_MEDIA_SCALE_MIN,
    EXPRESS_DISPLAY_MEDIA_SCALE_MAX,
    EXPRESS_DISPLAY_MEDIA_SCALE_STEP,
  );
}

export function nearestExpressMediaScalePresetId(scale: number): ExpressMediaScalePresetId {
  const s = normalizeExpressDisplayMediaScale(scale);
  let best = EXPRESS_MEDIA_SCALE_PRESETS[0];
  let bestDist = Math.abs(s - best.value);
  for (const p of EXPRESS_MEDIA_SCALE_PRESETS) {
    const d = Math.abs(s - p.value);
    if (d < bestDist) {
      best = p;
      bestDist = d;
    }
  }
  return best.id;
}

/** Tamaño del QR en standby Express (px). */
export const EXPRESS_QR_CODE_SIZE_PX = 104;

/** Reserva para la tira informativa bajo vídeo/imágenes. */
export const EXPRESS_QR_TICKER_RESERVE_REM = 5;

/** Margen extra entre el QR y la franja de vídeo/imágenes. */
export const EXPRESS_QR_MEDIA_GAP_REM = 2.25;

/** Reserva inferior (vídeo + imágenes + tira + margen) en pantalla QR Express. */
export function expressQrDockPaddingBottom(mediaScale: number): string {
  const s = normalizeExpressDisplayMediaScale(mediaScale);
  const strip = `min(calc(26vh * ${s}), calc(12rem * ${s}))`;
  return `calc(${strip} + ${EXPRESS_QR_TICKER_RESERVE_REM}rem + ${EXPRESS_QR_MEDIA_GAP_REM}rem)`;
}

