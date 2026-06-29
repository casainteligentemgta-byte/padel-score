import type { ExpressPoint } from '@/types/expressMatch';

const REGULAR_POINTS: ExpressPoint[] = ['0', '15', '30', '40', 'AD'];

/** Asegura puntos como string canónico (evita 15 numérico → fallos en la cadena 0/15/30/40). */
export function normalizeExpressPoint(raw: unknown): ExpressPoint | string {
  const s = String(raw ?? '0').trim().toUpperCase();
  if (REGULAR_POINTS.includes(s as ExpressPoint)) return s as ExpressPoint;
  if (/^\d+$/.test(s)) return s;
  return '0';
}
