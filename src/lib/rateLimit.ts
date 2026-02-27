/**
 * Rate limit simple en memoria (por IP).
 * En producción con múltiples instancias usar Redis o similar.
 */

const WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 40;     // por minuto por IP

const store = new Map<string, number[]>();

function getClientId(req: Request): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    if (forwarded) return forwarded.split(',')[0].trim();
    if (realIp) return realIp;
    return 'unknown';
}

function prune(key: string) {
    const now = Date.now();
    const timestamps = store.get(key) ?? [];
    const valid = timestamps.filter(t => now - t < WINDOW_MS);
    if (valid.length === 0) store.delete(key);
    else store.set(key, valid);
    return valid;
}

/** Devuelve true si se permite la petición, false si se excedió el límite. */
export function checkRateLimit(req: Request): boolean {
    const key = getClientId(req);
    const valid = prune(key);
    if (valid.length >= MAX_REQUESTS) return false;
    valid.push(Date.now());
    store.set(key, valid);
    return true;
}
