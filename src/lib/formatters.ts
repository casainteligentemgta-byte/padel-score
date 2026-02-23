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
