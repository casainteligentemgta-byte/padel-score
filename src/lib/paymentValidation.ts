/**
 * Reglas de validación de pagos (Agente de Operaciones y Finanzas).
 * Compara el monto (OCR o capturado) con el precio de la categoría.
 * - Coincidencia directa (misma cifra) → pagado.
 * - Si se indica tasa BCV (VES por 1 USD), se acepta equivalencia:
 *   monto en Bs. del comprobante vs precio en USD de la categoría (caso Venezuela).
 */

export type PaymentStatus = 'pending' | 'paid' | 'alert';

export interface ValidationInput {
    amountExtracted: number | null | undefined;
    /** Normalmente en USD; debe ser el monto de la categoría. */
    categoryPrice: number;
    /**
     * Tasa BCV: bolívares por 1 dólar oficial.
     * Si se omite, solo se compara cifra contra cifra (puede fallar Bs. vs USD).
     */
    bcvVesPerUsd?: number | null;
}

export interface ValidationResult {
    paymentStatus: PaymentStatus;
    alertMessage: string | null;
    /** Explicación cuando el cierre es por tasa (éxito o apoyo a revisión). */
    matchNote?: string | null;
}

const TOLERANCE_DIRECT = 0.02;

/** Tolerancia en USD cuando se convierte monto Bs. → USD con BCV. */
function toleranceUsdBcv(categoryPrice: number) {
    return Math.max(0.25, categoryPrice * 0.02);
}

/** Tolerancia en Bs. cuando se convierte precio USD → Bs. */
function toleranceVes(vesRef: number) {
    return Math.max(3, Math.round(vesRef * 0.01 * 100) / 100);
}

export function validatePaymentAgainstCategoryPrice(input: ValidationInput): ValidationResult {
    const { amountExtracted, categoryPrice, bcvVesPerUsd: bcvIn } = input;
    const bcvVesPerUsd = bcvIn != null && Number.isFinite(bcvIn) && bcvIn > 0 ? bcvIn : null;

    if (categoryPrice <= 0) {
        return { paymentStatus: 'alert', alertMessage: 'Precio de categoría no definido.' };
    }

    if (amountExtracted == null || !Number.isFinite(amountExtracted) || amountExtracted <= 0) {
        return { paymentStatus: 'pending', alertMessage: null };
    }

    const amount = amountExtracted;
    const tolUsd = toleranceUsdBcv(categoryPrice);
    const directlyOk = Math.abs(amount - categoryPrice) <= TOLERANCE_DIRECT;
    if (directlyOk) {
        return { paymentStatus: 'paid', alertMessage: null, matchNote: 'Monto numérico coincide con el precio de la categoría.' };
    }

    if (bcvVesPerUsd) {
        const usdIfReceiptIsVes = amount / bcvVesPerUsd;
        if (Math.abs(usdIfReceiptIsVes - categoryPrice) <= tolUsd) {
            return {
                paymentStatus: 'paid',
                alertMessage: null,
                matchNote: `Equivale a ~${usdIfReceiptIsVes.toFixed(2)} USD según tasa BCV (~${bcvVesPerUsd.toFixed(2)} VES/USD). Alineado con el precio de la categoría (${categoryPrice.toFixed(2)} USD).`,
            };
        }

        const vesIfCategoryInUsd = categoryPrice * bcvVesPerUsd;
        const tolV = toleranceVes(vesIfCategoryInUsd);
        if (Math.abs(amount - vesIfCategoryInUsd) <= tolV) {
            return {
                paymentStatus: 'paid',
                alertMessage: null,
                matchNote: `Monto en Bs. (~${amount.toFixed(2)}) coincide con el equivalente a ${categoryPrice.toFixed(2)} USD a tasa BCV (~${vesIfCategoryInUsd.toFixed(2)} Bs. ±${tolV.toFixed(0)} Bs.).`,
            };
        }

        return {
            paymentStatus: 'alert',
            alertMessage: `Monto ${amount.toFixed(2)} no calza: precio categoría ${categoryPrice.toFixed(2)} USD, ni equiv. BCV (usando ~${bcvVesPerUsd.toFixed(2)} VES/USD: ~${usdIfReceiptIsVes.toFixed(2)} USD o ~${vesIfCategoryInUsd.toFixed(2)} Bs.). Revisar comprobante.`,
            matchNote: null,
        };
    }

    return {
        paymentStatus: 'alert',
        alertMessage: `Monto extraído (${amount.toFixed(2)}) no coincide con el precio de la categoría (${categoryPrice.toFixed(2)}). Revisar comprobante (o configure tasa BCV en servidor / BCV_VES_PER_USD).`,
    };
}
