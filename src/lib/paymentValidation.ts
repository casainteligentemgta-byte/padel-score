/**
 * Reglas de validación de pagos (Agente de Operaciones y Finanzas).
 * Compara el Monto Extraído (OCR) contra el Precio de la Categoría.
 * - Si coinciden → inscripción Pagada.
 * - Si no → genera alerta para el administrador.
 */

export type PaymentStatus = 'pending' | 'paid' | 'alert';

export interface ValidationInput {
    amountExtracted: number | null | undefined;
    categoryPrice: number;
}

export interface ValidationResult {
    paymentStatus: PaymentStatus;
    alertMessage: string | null;
}

const TOLERANCE = 0.02;

export function validatePaymentAgainstCategoryPrice(input: ValidationInput): ValidationResult {
    const { amountExtracted, categoryPrice } = input;

    if (categoryPrice <= 0) {
        return { paymentStatus: 'alert', alertMessage: 'Precio de categoría no definido.' };
    }

    if (amountExtracted == null || amountExtracted <= 0) {
        return { paymentStatus: 'pending', alertMessage: null };
    }

    const diff = Math.abs(amountExtracted - categoryPrice);
    if (diff <= TOLERANCE) {
        return { paymentStatus: 'paid', alertMessage: null };
    }

    return {
        paymentStatus: 'alert',
        alertMessage: `Monto extraído (${amountExtracted.toFixed(2)}) no coincide con el precio de la categoría (${categoryPrice.toFixed(2)}). Revisar comprobante.`,
    };
}
