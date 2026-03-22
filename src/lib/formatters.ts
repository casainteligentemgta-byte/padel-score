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

