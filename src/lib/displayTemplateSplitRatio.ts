/**
 * `display_templates.split_ratio` en BD: entero 0–100 (% columna izquierda del bloque media).
 * En UI / lógica de layout: siempre 0–1 (legado float 0–1 también se acepta al leer).
 */

export function splitRatioFromDatabase(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0.5;
  if (n > 1) return Math.min(1, Math.max(0, n / 100));
  return Math.min(1, Math.max(0, n));
}

/**
 * Valor a persistir en columna INTEGER 0–100.
 * - Si viene en 0–1 (p. ej. slider 0.65) → Math.round(ratio * 100) → 65.
 * - Si ya viene en 0–100 (p. ej. 65.4) → Math.round(clamp) → 65.
 */
export function splitRatioToDatabase(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 50;
  if (n > 1) return Math.round(Math.min(100, Math.max(0, n)));
  return Math.round(Math.min(1, Math.max(0, n)) * 100);
}
