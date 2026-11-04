/**
 * Reglas de validación de pagos (Agente de Operaciones y Finanzas).
 * Compara el monto (OCR o capturado) con el precio de la categoría.
 * En torneos por equipos, el precio de la categoría es el de la inscripción de la pareja
 * completa (un pago = un equipo en esa categoría), no por jugador.
 * - Coincidencia directa o BCV → amountMatches; paymentStatus sigue pending
 *   hasta que un admin valide (Pago Móvil / transferencia nunca auto-pagados).
 */

export type PaymentStatus = 'pending' | 'paid' | 'alert';

export interface ValidationInput {
    amountExtracted: number | null | undefined;
    /** En USD: monto de inscripción de la categoría (por equipo/pareja en formatos por pareja). */
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
    /** El monto calza con el precio (el admin puede validar; el jugador no queda pagado). */
    amountMatches: boolean;
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
        return { paymentStatus: 'alert', alertMessage: 'Precio de categoría no definido.', amountMatches: false };
    }

    if (amountExtracted == null || !Number.isFinite(amountExtracted) || amountExtracted <= 0) {
        return { paymentStatus: 'pending', alertMessage: null, amountMatches: false };
    }

    const amount = amountExtracted;
    const tolUsd = toleranceUsdBcv(categoryPrice);
    const directlyOk = Math.abs(amount - categoryPrice) <= TOLERANCE_DIRECT;
    if (directlyOk) {
        return {
            paymentStatus: 'pending',
            alertMessage: null,
            matchNote: 'Monto numérico coincide con el precio de la categoría.',
            amountMatches: true,
        };
    }

    if (bcvVesPerUsd) {
        const usdIfReceiptIsVes = amount / bcvVesPerUsd;
        if (Math.abs(usdIfReceiptIsVes - categoryPrice) <= tolUsd) {
            return {
                paymentStatus: 'pending',
                alertMessage: null,
                matchNote: `Equivale a ~${usdIfReceiptIsVes.toFixed(2)} USD según tasa BCV (~${bcvVesPerUsd.toFixed(2)} VES/USD). Alineado con el precio de la categoría (${categoryPrice.toFixed(2)} USD).`,
                amountMatches: true,
            };
        }

        const vesIfCategoryInUsd = categoryPrice * bcvVesPerUsd;
        const tolV = toleranceVes(vesIfCategoryInUsd);
        if (Math.abs(amount - vesIfCategoryInUsd) <= tolV) {
            return {
                paymentStatus: 'pending',
                alertMessage: null,
                matchNote: `Monto en Bs. (~${amount.toFixed(2)}) coincide con el equivalente a ${categoryPrice.toFixed(2)} USD a tasa BCV (~${vesIfCategoryInUsd.toFixed(2)} Bs. ±${tolV.toFixed(0)} Bs.).`,
                amountMatches: true,
            };
        }

        return {
            paymentStatus: 'alert',
            alertMessage: `Monto ${amount.toFixed(2)} no calza: precio categoría ${categoryPrice.toFixed(2)} USD, ni equiv. BCV (usando ~${bcvVesPerUsd.toFixed(2)} VES/USD: ~${usdIfReceiptIsVes.toFixed(2)} USD o ~${vesIfCategoryInUsd.toFixed(2)} Bs.). Revisar comprobante.`,
            matchNote: null,
            amountMatches: false,
        };
    }

    return {
        paymentStatus: 'alert',
        alertMessage: `Monto extraído (${amount.toFixed(2)}) no coincide con el precio de la categoría (${categoryPrice.toFixed(2)}). Revisar comprobante (o configure tasa BCV en servidor / BCV_VES_PER_USD).`,
        amountMatches: false,
    };
}

export type ManualPaymentMethodSlug = 'pago_movil' | 'transferencia';

/** Normaliza el método a slug estable (`pago_movil` / `transferencia`) o ''. */
export function normalizePaymentMethodSlug(raw: string | null | undefined): string {
    const s = String(raw || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\s_-]+/g, '');
    if (!s) return '';
    if (s.includes('pagomovil') || (s.includes('pago') && s.includes('movil'))) return 'pago_movil';
    if (s.includes('transfer')) return 'transferencia';
    return s;
}

export function isManualBankPaymentMethod(raw: string | null | undefined): boolean {
    const slug = normalizePaymentMethodSlug(raw);
    return slug === 'pago_movil' || slug === 'transferencia';
}

export function paymentMethodLabel(slugOrName: string | null | undefined): string {
    const slug = normalizePaymentMethodSlug(slugOrName);
    if (slug === 'pago_movil') return 'Pago Móvil';
    if (slug === 'transferencia') return 'Transferencia Bancaria';
    return String(slugOrName || '').trim();
}

/**
 * Estado que debe persistirse al crear una inscripción de Pago Móvil / transferencia.
 * Nunca marca `paid` si hay precio o método manual: el admin valida a mano.
 */
export function resolveManualInscriptionPaymentStatus(input: {
    categoryPrice: number;
    amountExtracted?: number | null;
    bcvVesPerUsd?: number | null;
    paymentMethod?: string | null;
}): { paymentStatus: 'pending' | 'paid'; alertMessage: string | null } {
    const manual = isManualBankPaymentMethod(input.paymentMethod) || !!normalizePaymentMethodSlug(input.paymentMethod);
    if (manual || input.categoryPrice > 0) {
        if (!(input.categoryPrice > 0)) {
            return { paymentStatus: 'pending', alertMessage: null };
        }
        const verification = validatePaymentAgainstCategoryPrice({
            amountExtracted: input.amountExtracted,
            categoryPrice: input.categoryPrice,
            bcvVesPerUsd: input.bcvVesPerUsd,
        });
        return { paymentStatus: 'pending', alertMessage: verification.alertMessage };
    }
    return { paymentStatus: 'paid', alertMessage: null };
}

/** Checkout de Mercado Pago retirado: se rechaza en API y se oculta en UI. */
export function isMercadoPagoMethod(method: string | null | undefined): boolean {
    const s = String(method || '').toLowerCase().replace(/\s+/g, '');
    return s.includes('mercadopago') || s === 'mp';
}

const AMOUNT_TOLERANCE = 0.05;

export function amountsMatch(expected: number, received: number, tolerance = AMOUNT_TOLERANCE): boolean {
    if (!Number.isFinite(expected) || !Number.isFinite(received)) return false;
    if (expected <= 0 || received <= 0) return false;
    return Math.abs(expected - received) <= tolerance;
}
