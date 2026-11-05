'use client';

/** Sincroniza el JWT de Supabase a cookie httpOnly para /admin en el servidor. */
export async function syncAuthSessionCookie(
    accessToken: string | null | undefined,
    expiresIn?: number | null
): Promise<void> {
    try {
        if (accessToken) {
            await fetch('/api/auth/session', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ expiresIn: expiresIn ?? 3600 }),
            });
            return;
        }
        await fetch('/api/auth/session', { method: 'DELETE' });
    } catch (e) {
        console.warn('[auth] No se pudo sincronizar la cookie de sesión:', e);
    }
}
