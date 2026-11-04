/**
 * Quién cuenta como administrador.
 * Prioridad: role === 'admin' en profiles.
 * Extra: lista de emails. En APIs se usa ADMIN_EMAILS (solo servidor).
 * NEXT_PUBLIC_ADMIN_EMAILS queda para la UI y como fallback si ADMIN_EMAILS no está.
 */

function parseEmailList(raw: string | undefined): string[] {
    return String(raw || '')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
}

function publicAdminEmails(): string[] {
    return parseEmailList(process.env.NEXT_PUBLIC_ADMIN_EMAILS);
}

function serverAdminEmails(): string[] {
    const server = parseEmailList(process.env.ADMIN_EMAILS);
    if (server.length > 0) return server;
    return publicAdminEmails();
}

export function isLegacyAdminEmail(email: string | undefined | null): boolean {
    if (!email) return false;
    return publicAdminEmails().includes(email.toLowerCase())
        || parseEmailList(process.env.ADMIN_EMAILS).includes(email.toLowerCase());
}

/** UI / cliente: rol admin o email en la lista pública (o ADMIN_EMAILS si el bundle la inyecta). */
export function isAdminAccess(role: string | undefined | null, email: string | undefined | null): boolean {
    if ((role || '').toLowerCase() === 'admin') return true;
    return isLegacyAdminEmail(email);
}

/**
 * APIs: rol `admin` en profiles o email en ADMIN_EMAILS.
 * Si ADMIN_EMAILS está vacío, cae a NEXT_PUBLIC_ADMIN_EMAILS para no bloquear el lanzamiento
 * (el owner debe copiar la lista a ADMIN_EMAILS y dejar de exponerla).
 */
export function isServerAdminAccess(role: string | undefined | null, email: string | undefined | null): boolean {
    if ((role || '').toLowerCase() === 'admin') return true;
    if (!email) return false;
    return serverAdminEmails().includes(email.toLowerCase());
}
