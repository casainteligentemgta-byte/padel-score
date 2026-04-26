export const formatDNI = (value: string) => {
    if (!value) return '';

    const upper = value.toUpperCase();
    const prefix = upper.startsWith('E') ? 'E-' : 'V-';

    // Extract only digits from the input
    const digits = value.replace(/\D/g, '');

    if (!digits) return prefix;

    // Standard Venezuelan format: prefix (V-/E-) followed by dots every 3 digits
    const formattedNumber = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${prefix}${formattedNumber}`;
};

/**
 * Formatea una fecha en DD/MM/AAAA (orden venezolano: día → mes → año).
 * Acepta string ISO, Date, timestamp numérico, o Firestore Timestamp ({seconds}).
 * Para strings YYYY-MM-DD (solo fecha) se interpretan como fecha local para evitar
 * que UTC muestre el día anterior (ej. 24/01/1979 guardado como 1979-01-24 → no mostrar 23/01).
 */
export const formatDate = (value: string | Date | number | { seconds: number } | null | undefined): string => {
    if (!value) return 'Sin fecha';
    let date: Date;
    if (typeof value === 'object' && 'seconds' in (value as any)) {
        date = new Date((value as { seconds: number }).seconds * 1000);
    } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}(T|$)/.test(value.trim())) {
        const [y, m, d] = value.trim().split(/[-T]/).map(Number);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
            date = new Date(y, m - 1, d);
        } else {
            date = new Date(value);
        }
    } else {
        date = new Date(value as string | number | Date);
    }
    if (isNaN(date.getTime())) return 'Sin fecha';
    return date.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * Formatea fecha + hora: DD/MM/AAAA HH:MM
 */
export const formatDateTime = (value: string | Date | number | null | undefined): string => {
    if (!value) return '-';
    const date = new Date(value as string | number | Date);
    if (isNaN(date.getTime())) return '-';
    return `${date.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${date.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
};

/**
 * Teléfono para listas admin: mismo aspecto siempre (+ y grupos de 3 dígitos).
 * Normaliza entradas típicas VE (0414…, 414… sin país, +58…).
 */
export function formatPhoneForAdminList(raw: string | null | undefined): string {
    const trimmed = String(raw ?? '').trim();
    if (!trimmed) return '—';

    let d = trimmed.replace(/\D/g, '');
    if (!d) return trimmed;

    while (d.startsWith('00')) d = d.slice(2);

    if (d.startsWith('0') && d.length >= 11) {
        d = '58' + d.slice(1);
    }
    if (d.length === 10 && /^4\d{9}$/.test(d)) {
        d = '58' + d;
    }

    const parts: string[] = [];
    for (let i = 0; i < d.length; i += 3) {
        parts.push(d.slice(i, i + 3));
    }
    return `+${parts.join(' ')}`;
}

/**
 * Nombre/apellido en listas admin: primera letra de cada palabra en mayúscula (resto en minúsculas, locale es-VE).
 */
export function formatPersonNameForAdminList(raw: string | null | undefined): string {
    const s = String(raw ?? '').trim();
    if (!s || s === '—') return s || '—';

    return s
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => {
            const lower = word.toLocaleLowerCase('es-VE');
            return lower.charAt(0).toLocaleUpperCase('es-VE') + lower.slice(1);
        })
        .join(' ');
}

