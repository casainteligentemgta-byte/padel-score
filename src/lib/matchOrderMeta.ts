/**
 * Metadatos de orden de partido para hub, marker, SQL y exportaciones.
 * Mantiene alineados camelCase y snake_case.
 */

const ORDER_KEYS = ['match_number', 'matchNumber', 'order', 'orden'] as const;

function firstDefinedOrder(data: Record<string, unknown>): number | null {
  for (const k of ORDER_KEYS) {
    const n = Number(data[k]);
    if (Number.isFinite(n) && n >= 1) return Math.floor(n);
  }
  return null;
}

/**
 * Infiere número de partido 1-based desde ids habituales:
 * - `m-{catKey}-{n}-{suffix}` → n si n≥1; si n===0 legacy (generador maestro antiguo) → n+1.
 *   Los generadores actuales usan n = orden de partido (1, 2, 3…), alineado con tournamentService.
 * - `match-{idx}-...` (new-tournament) → idx+1
 */
export function inferMatchOrderFromId(id: unknown): number | null {
  if (typeof id !== 'string' || !id) return null;
  const m = id.match(/^m-[^-]+-(\d+)-/);
  if (m) {
    const k = parseInt(m[1], 10);
    if (!Number.isFinite(k)) return null;
    return k >= 1 ? k : k + 1;
  }
  const m2 = id.match(/^match-(\d+)-/);
  if (m2) {
    const idx = parseInt(m2[1], 10);
    return Number.isFinite(idx) ? idx + 1 : null;
  }
  const m3 = id.match(/^sf-[^-]+-(\d+)-/);
  if (m3) {
    const n = parseInt(m3[1], 10);
    return Number.isFinite(n) && n >= 1 ? 100 + n - 1 : null;
  }
  return null;
}

/**
 * Rellena / unifica los cuatro campos de orden en una copia del objeto partido (sin mutar el original).
 */
export function syncMatchOrderFields(data: Record<string, any>): Record<string, any> {
  const out = { ...data };
  let n = firstDefinedOrder(out);
  if (n == null) n = inferMatchOrderFromId(out.id);
  if (n != null && Number.isFinite(n) && n >= 1) {
    out.match_number = n;
    out.matchNumber = n;
    out.order = n;
    out.orden = n;
  }
  return out;
}
