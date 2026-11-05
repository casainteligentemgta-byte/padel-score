/** Cookie httpOnly con el JWT de Supabase para middleware / layout de /admin. */
export const ACCESS_TOKEN_COOKIE = 'sp-access-token';

export function getAccessTokenFromRequest(req: Request): string | null {
    const auth = req.headers.get('authorization');
    if (auth?.startsWith('Bearer ')) {
        const token = auth.slice(7).trim();
        if (token) return token;
    }

    const header = req.headers.get('cookie');
    if (!header) return null;
    for (const part of header.split(';')) {
        const trimmed = part.trim();
        const eq = trimmed.indexOf('=');
        if (eq <= 0) continue;
        const key = trimmed.slice(0, eq).trim();
        if (key !== ACCESS_TOKEN_COOKIE) continue;
        const raw = trimmed.slice(eq + 1).trim();
        if (!raw) return null;
        try {
            return decodeURIComponent(raw);
        } catch {
            return raw;
        }
    }
    return null;
}
