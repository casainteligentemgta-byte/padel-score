/**
 * Autenticación en APIs usando Supabase (JWT de sesión).
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isServerAdminAccess } from '@/lib/adminAccess';
import { getAccessTokenFromRequest } from '@/lib/authCookie';

type Request = globalThis.Request;

const getSupabaseServer = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!url || !key) return null;
    return createClient(url, key);
};

function getRequestToken(req: Request): string | null {
    return getAccessTokenFromRequest(req);
}

export type AuthUser = { uid: string; email?: string };
export type AuthUserWithRole = AuthUser & { role: string };

/**
 * Obtiene el usuario a partir del JWT de Supabase (Bearer token).
 * Opcionalmente lee el rol desde la tabla profiles.
 */
export async function getAuthUserFromToken(token: string | null | undefined): Promise<AuthUser | null> {
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

export async function getAuthUser(req: Request): Promise<AuthUser | null> {
    return getAuthUserFromToken(getRequestToken(req));
}

/**
 * Igual que getAuthUser pero además devuelve el rol desde profiles.
 */
export async function getAuthUserWithRoleFromToken(token: string | null | undefined): Promise<AuthUserWithRole | null> {
    if (!token) return null;
    const user = await getAuthUserFromToken(token);
    if (!user) return null;
    if (isServerAdminAccess(undefined, user.email)) {
        return { ...user, role: 'admin' };
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!url || !key) {
        return { ...user, role: 'player' };
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
        const role = isServerAdminAccess(dbRole, user.email) ? 'admin' : dbRole;
        return { ...user, role };
    } catch {
        return { ...user, role: 'player' };
    }
}

export async function getAuthUserWithRole(req: Request): Promise<AuthUserWithRole | null> {
    return getAuthUserWithRoleFromToken(getRequestToken(req));
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
