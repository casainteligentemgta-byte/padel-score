/**
 * Quién cuenta como administrador en la app.
 * Debe coincidir con AuthContext (acceso a /admin y acciones de admin).
 */

export function isLegacyAdminEmail(email: string | undefined | null): boolean {
    if (!email) return false;
    const e = email.toLowerCase();
    return (
        e.includes('casainteligente') ||
        e.includes('casanteligente') ||
        e.includes('casainteligentemgta') ||
        e === 'casainteligentemgta@gmail.com'
    );
}

/** Rol admin en BD o correos con privilegios históricos (misma regla que el cliente). */
export function isAdminAccess(role: string | undefined | null, email: string | undefined | null): boolean {
    if ((role || '').toLowerCase() === 'admin') return true;
    return isLegacyAdminEmail(email);
}
