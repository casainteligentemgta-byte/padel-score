/**
 * Formato de ficha: primer nombre completo, segundo nombre solo inicial,
 * segundo apellido completo (patrón típico: Nombre1 Nombre2 Apellido1 Apellido2 → "Nombre1 N. Apellido2").
 * Con 3 tokens se asume Nombre + Apellido1 + Apellido2 → "Nombre A. Apellido2".
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
    const secondSurname = parts[parts.length - 1];
    return `${first} ${secondInitial}. ${secondSurname}`;
}
