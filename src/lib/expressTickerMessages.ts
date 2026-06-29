export const EXPRESS_TICKER_PHRASE_MAX = 10;
export const EXPRESS_TICKER_PHRASE_CHAR_MAX = 120;

/** Normaliza frases guardadas en express_matches.display_ticker_phrases. */
export function normalizeExpressTickerPhrases(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    const text = String(item ?? '').trim();
    if (!text) continue;
    out.push(text.slice(0, EXPRESS_TICKER_PHRASE_CHAR_MAX));
    if (out.length >= EXPRESS_TICKER_PHRASE_MAX) break;
  }
  return out;
}

/** Combina frases de pizarra + mensajes admin en la tira. */
export function mergeExpressTickerMessages(
  adminMessages: { id: string; mensaje: string; highlight?: boolean }[],
  customPhrases: string[],
): { id: string; mensaje: string; highlight?: boolean }[] {
  const custom = normalizeExpressTickerPhrases(customPhrases).map((mensaje, i) => ({
    id: `express-board-${i}`,
    mensaje,
    highlight: true as const,
  }));
  if (!custom.length) return adminMessages;
  if (!adminMessages.length) return custom;
  return [...custom, ...adminMessages];
}
