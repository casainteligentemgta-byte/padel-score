import { NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE, getAccessTokenFromRequest } from '@/lib/authCookie';
import { getAuthUserFromToken } from '@/lib/authServerSupabase';

function cookieOptions(maxAge: number) {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge,
    };
}

export async function POST(request: Request) {
    const token = getAccessTokenFromRequest(request);
    if (!token) {
        return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }
    const user = await getAuthUserFromToken(token);
    if (!user) {
        return NextResponse.json({ error: 'Sesión inválida.' }, { status: 401 });
    }

    let expiresIn = 3600;
    try {
        const body = (await request.json()) as { expiresIn?: unknown };
        const n = Number(body?.expiresIn);
        if (Number.isFinite(n) && n > 60 && n <= 60 * 60 * 24 * 7) {
            expiresIn = Math.floor(n);
        }
    } catch {
        // body opcional
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(ACCESS_TOKEN_COOKIE, token, cookieOptions(expiresIn));
    return res;
}

export async function DELETE() {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ACCESS_TOKEN_COOKIE, '', cookieOptions(0));
    return res;
}
