/**
 * Quién cuenta como administrador.
 * Prioridad: role === 'admin' en profiles.
 * Extra: lista explícita en NEXT_PUBLIC_ADMIN_EMAILS (emails separados por coma).
 * No se usa coincidencia parcial de dominio.
 */

function adminEmailsFromEnv(): string[] {
    const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS || '';
    return raw
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
}

export function isLegacyAdminEmail(email: string | undefined | null): boolean {
    if (!email) return false;
    return adminEmailsFromEnv().includes(email.toLowerCase());
}

/** Rol admin en BD o correo listado en env. */
export function isAdminAccess(role: string | undefined | null, email: string | undefined | null): boolean {
    if ((role || '').toLowerCase() === 'admin') return true;
    return isLegacyAdminEmail(email);
}
