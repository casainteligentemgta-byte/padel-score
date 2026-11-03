/**
 * Rate limit simple en memoria (por IP).
 * En producción con múltiples instancias usar Redis o similar.
 */

const WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 40;     // por minuto por IP (por defecto)

const store = new Map<string, number[]>();

function getClientId(req: Request): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    if (forwarded) return forwarded.split(',')[0].trim();
    if (realIp) return realIp;
    return 'unknown';
}

function prune(key: string, windowMs: number) {
    const now = Date.now();
    const timestamps = store.get(key) ?? [];
    const valid = timestamps.filter((t) => now - t < windowMs);
    if (valid.length === 0) store.delete(key);
    else store.set(key, valid);
    return valid;
}

export type RateLimitOptions = {
    /** Tope de peticiones en la ventana. */
    max?: number;
    /** Ventana en ms (por defecto 60s). */
    windowMs?: number;
    /** Prefijo para no mezclar cupos entre rutas. */
    bucket?: string;
};

/** Devuelve true si se permite la petición, false si se excedió el límite. */
export function checkRateLimit(req: Request, options?: RateLimitOptions): boolean {
    const max = options?.max ?? MAX_REQUESTS;
    const windowMs = options?.windowMs ?? WINDOW_MS;
    const key = `${options?.bucket ?? 'default'}:${getClientId(req)}`;
    const valid = prune(key, windowMs);
    if (valid.length >= max) return false;
    valid.push(Date.now());
    store.set(key, valid);
    return true;
}

/** Límites más estrictos para altas de inscripción / preferencias de pago. */
export function checkPaymentRateLimit(req: Request, bucket: string): boolean {
    return checkRateLimit(req, { max: 8, windowMs: 60 * 1000, bucket });
}
