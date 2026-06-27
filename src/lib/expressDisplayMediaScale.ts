export const EXPRESS_DISPLAY_MEDIA_SCALE_DEFAULT = 1;

export const EXPRESS_DISPLAY_MEDIA_SCALE_MIN = 0.5;
export const EXPRESS_DISPLAY_MEDIA_SCALE_MAX = 1.75;

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

export function normalizeExpressDisplayMediaScale(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return EXPRESS_DISPLAY_MEDIA_SCALE_DEFAULT;
  return Math.min(
    EXPRESS_DISPLAY_MEDIA_SCALE_MAX,
    Math.max(EXPRESS_DISPLAY_MEDIA_SCALE_MIN, Math.round(n * 100) / 100),
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

/** Reserva inferior (vídeo + imágenes + tira) en pantalla QR Express. */
export function expressQrDockPaddingBottom(mediaScale: number): string {
  const s = normalizeExpressDisplayMediaScale(mediaScale);
  const strip = `min(calc(26vh * ${s}), calc(12rem * ${s}))`;
  return `calc(${strip} + 5rem)`;
}
