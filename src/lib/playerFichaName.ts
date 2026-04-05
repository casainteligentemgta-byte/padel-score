/**
 * Formato de ficha (pizarra / listados): primer nombre, inicial del segundo nombre,
 * primer apellido. Ej.: "Juan Carlos García López" → "Juan C. García".
 * Con 2 tokens: nombre + apellido tal cual.
 */

export function formatPlayerFichaName(raw: string): string {
    const name = (raw || '').trim();
    if (!name) return '';

    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return name;

    const first = parts[0];
    const lowerFirst = first.toLowerCase();

    if (lowerFirst === 'jugador' || lowerFirst === 'pareja' || lowerFirst === 'equipo') {
        return name;
    }

    if (/^\d+$/.test(parts[parts.length - 1])) {
        return name;
    }

    if (parts.length === 2) {
        return `${parts[0]} ${parts[1]}`;
    }

    const secondInitial = parts[1].charAt(0).toUpperCase();
    const firstSurname = parts[2];
    return `${first} ${secondInitial}. ${firstSurname}`;
}
