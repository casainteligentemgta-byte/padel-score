import { NextResponse, type NextRequest } from 'next/server';
import { isGuardResponse, requireAdminOrStaff, requireAuth } from '@/lib/apiGuard';

/**
 * Protege /api/admin/*: exige JWT de Supabase.
 * - La mayoría de rutas: rol admin, marker o staff.
 * - /api/admin/new-profile-alert: cualquier usuario autenticado (aviso al registrar ficha).
 */
const SESSION_ONLY_ADMIN_PATHS = new Set(['/api/admin/new-profile-alert']);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
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
    matcher: ['/api/admin/:path*'],
};
