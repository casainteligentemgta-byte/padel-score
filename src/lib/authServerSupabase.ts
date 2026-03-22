/**
 * Autenticación en APIs usando Supabase (JWT de sesión).
 * Sustituye authServer (Firebase) para que las rutas funcionen con login Supabase.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdminAccess } from '@/lib/adminAccess';

type Request = globalThis.Request;

const getSupabaseServer = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!url || !key) return null;
    return createClient(url, key);
};

function getBearerToken(req: Request): string | null {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    return auth.slice(7).trim() || null;
}

export type AuthUser = { uid: string; email?: string };
export type AuthUserWithRole = AuthUser & { role: string };

/**
 * Obtiene el usuario a partir del JWT de Supabase (Bearer token).
 * Opcionalmente lee el rol desde la tabla profiles.
 */
export async function getAuthUser(req: Request): Promise<AuthUser | null> {
    const token = getBearerToken(req);
    if (!token) return null;
    const supabase = getSupabaseServer();
    if (!supabase) return null;
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return null;
        return { uid: user.id, email: user.email ?? undefined };
    } catch {
        return null;
    }
}

/**
 * Igual que getAuthUser pero además devuelve el rol desde profiles.
 */
export async function getAuthUserWithRole(req: Request): Promise<AuthUserWithRole | null> {
    const token = getBearerToken(req);
    if (!token) return null;
    const user = await getAuthUser(req);
    if (!user) return null;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!url || !key) {
        const role = isAdminAccess(undefined, user.email) ? 'admin' : 'player';
        return { ...user, role };
    }
    try {
        const clientWithToken = createClient(url, key, {
            global: { headers: { Authorization: `Bearer ${token}` } },
        });
        const { data: profile } = await clientWithToken
            .from('profiles')
            .select('role')
            .eq('id', user.uid)
            .single();
        const dbRole = (profile?.role as string) ?? 'player';
        const role = isAdminAccess(dbRole, user.email) ? 'admin' : dbRole;
        return { ...user, role };
    } catch {
        const role = isAdminAccess(undefined, user.email) ? 'admin' : 'player';
        return { ...user, role };
    }
}

function isAuthConfigured(): boolean {
    return Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
    );
}

/**
 * Exige autenticación. Si no hay token válido de Supabase, devuelve 401.
 */
export async function requireAuth(req: Request): Promise<AuthUser | NextResponse> {
    if (!isAuthConfigured()) {
        return NextResponse.json(
            { error: 'Error de configuración del servidor: faltan variables de Supabase (NEXT_PUBLIC_SUPABASE_*).' },
            { status: 500 }
        );
    }
    const user = await getAuthUser(req);
    if (user) return user;
    return NextResponse.json(
        { error: 'No autorizado. Inicia sesión e incluye el token en el header Authorization (Bearer).' },
        { status: 401 }
    );
}

/**
 * Exige autenticación y uno de los roles indicados.
 */
export async function requireRole(
    req: Request,
    allowedRoles: readonly string[]
): Promise<AuthUserWithRole | NextResponse> {
    if (!isAuthConfigured()) {
        return NextResponse.json(
            { error: 'Error de configuración del servidor: faltan variables de Supabase.' },
            { status: 500 }
        );
    }
    const user = await getAuthUserWithRole(req);
    if (!user) {
        return NextResponse.json(
            { error: 'No autorizado. Debes iniciar sesión para realizar esta acción.' },
            { status: 401 }
        );
    }
    const role = user.role?.toLowerCase?.() ?? 'player';
    if (!allowedRoles.map(r => r.toLowerCase()).includes(role)) {
        return NextResponse.json(
            { error: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}.` },
            { status: 403 }
        );
    }
    return user;
}
