export const formatDNI = (value: string) => {
    // Si no hay valor, devolver vacío
    if (!value) return '';

    // Extraer solo los números
    const digits = value.replace(/\D/g, '');
    if (!digits) {
        // Si empieza por E o V pero no tiene números aún, permitir solo el prefijo
        const upper = value.toUpperCase();
        if (upper.startsWith('E')) return 'E-';
        return 'V-';
    }

    // Determinar el prefijo basado en la entrada original o por defecto V-
    const prefix = value.toUpperCase().startsWith('E') ? 'E-' : 'V-';

    // Formatear el número con puntos
    const formattedNumber = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${prefix}${formattedNumber}`;
};

/**
 * Formatea una fecha en DD/MM/AAAA (orden venezolano: día → mes → año).
 * Acepta string ISO, Date, timestamp numérico, o Firestore Timestamp ({seconds}).
 */
export const formatDate = (value: string | Date | number | { seconds: number } | null | undefined): string => {
    if (!value) return 'Sin fecha';
    let date: Date;
    if (typeof value === 'object' && 'seconds' in (value as any)) {
        date = new Date((value as { seconds: number }).seconds * 1000);
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

