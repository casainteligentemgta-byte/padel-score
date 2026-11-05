import { NextResponse, type NextRequest } from 'next/server';
import { isServerAdminAccess } from '@/lib/adminAccess';
import { isGuardResponse, requireAdminOrStaff, requireAuth } from '@/lib/apiGuard';
import { ACCESS_TOKEN_COOKIE } from '@/lib/authCookie';
import { getAuthUserWithRoleFromToken } from '@/lib/authServerSupabase';

/**
 * Protege /api/admin/*: exige JWT de Supabase.
 * - La mayoría de rutas: rol admin, marker o staff.
 * - /api/admin/new-profile-alert: cualquier usuario autenticado (aviso al registrar ficha).
 *
 * Protege /admin: rol admin o ADMIN_EMAILS (cookie httpOnly del JWT).
 */
const SESSION_ONLY_ADMIN_PATHS = new Set(['/api/admin/new-profile-alert']);

function redirectToLogin(request: NextRequest, nextPath: string) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('next', nextPath || '/admin');
    return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
        const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
        if (!token) {
            return redirectToLogin(request, pathname);
        }
        const auth = await getAuthUserWithRoleFromToken(token);
        if (!auth || !isServerAdminAccess(auth.role, auth.email)) {
            return redirectToLogin(request, pathname);
        }
        return NextResponse.next();
    }

    if (!pathname.startsWith('/api/admin')) {
        return NextResponse.next();
    }

    if (SESSION_ONLY_ADMIN_PATHS.has(pathname)) {
        const auth = await requireAuth(request);
        if (isGuardResponse(auth)) return auth;
        return NextResponse.next();
    }

    const auth = await requireAdminOrStaff(request);
    if (isGuardResponse(auth)) return auth;
    return NextResponse.next();
}

export const config = {
    matcher: ['/api/admin/:path*', '/admin', '/admin/:path*'],
};
