/**
 * Servicio OCR para extraer montos de comprobantes de pago.
 * Usa Tesseract.js (cliente) para no depender de APIs externas.
 * Alternativa futura: Google Cloud Vision para mayor precisión.
 */

import Tesseract from 'tesseract.js';

/** Extrae números que parecen montos (ej. 50, 50.00, 50,00) del texto OCR */
function extractAmountsFromText(text: string): number[] {
  const amounts: number[] = [];
  // Buscar patrones: número opcionalmente con . o , decimal (ej. 25, 25.00, 25,50)
  const regex = /\b(\d{1,3}(?:[.,]\d{2})?)\b/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const normalized = m[1].replace(',', '.');
    const num = parseFloat(normalized);
    if (!isNaN(num) && num > 0 && num < 1e6) amounts.push(num);
  }
  return amounts;
}

/** Devuelve el monto más plausible (ej. el que más se repite o el mayor razonable) */
function pickBestAmount(amounts: number[]): number | null {
  if (amounts.length === 0) return null;
  if (amounts.length === 1) return amounts[0];
  // Ordenar y devolver el mayor que no sea claramente un año o referencia
  const filtered = amounts.filter((a) => a >= 1 && a <= 100000);
  if (filtered.length === 0) return amounts[0];
  const sorted = [...filtered].sort((a, b) => b - a);
  return sorted[0];
}

export interface OcrResult {
  text: string;
  amountExtracted: number | null;
  amountsFound: number[];
  confidence: number;
}

/**
 * Ejecuta OCR sobre una imagen (URL o File) y extrae un monto.
 * Pensado para comprobantes de pago (transferencias, depósitos).
 */
export async function extractAmountFromReceipt(
  imageSource: string | File
): Promise<OcrResult> {
  const result = await Tesseract.recognize(imageSource, 'spa+eng', {
    logger: () => {},
  });

  const text = result.data.text || '';
  const confidence = result.data.confidence ?? 0;
  const amounts = extractAmountsFromText(text);
  const amountExtracted = pickBestAmount(amounts);

  return {
    text: text.slice(0, 2000),
    amountExtracted: amountExtracted ?? null,
    amountsFound: amounts,
    confidence,
  };
}
