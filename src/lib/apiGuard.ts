/**
 * Guardas reutilizables para rutas API.
 * - Sesión Supabase (JWT Bearer)
 * - Rol admin / staff (marker)
 * - Secreto compartido para webhooks y crons
 */

import { NextResponse } from 'next/server';
import {
    getAuthUser,
    getAuthUserWithRole,
    requireAuth,
    requireRole,
    type AuthUser,
    type AuthUserWithRole,
} from '@/lib/authServerSupabase';

export { getAuthUser, getAuthUserWithRole, requireAuth, requireRole };
export type { AuthUser, AuthUserWithRole };

export function isGuardResponse(value: unknown): value is NextResponse {
    return value instanceof NextResponse;
}

const STAFF_ROLES = ['admin', 'marker', 'staff'] as const;

/** Comparación en tiempo constante para secretos. */
export function timingSafeEqualString(a: string, b: string): boolean {
    const encoder = new TextEncoder();
    const left = encoder.encode(a);
    const right = encoder.encode(b);
    const max = Math.max(left.length, right.length);
    let diff = left.length ^ right.length;
    for (let i = 0; i < max; i++) {
        diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
    }
    return diff === 0;
}

export function getBearerToken(req: Request): string | null {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    return auth.slice(7).trim() || null;
}

/**
 * Extrae un secreto compartido de cabeceras habituales:
 * Authorization: Bearer …, x-webhook-secret, x-api-secret, X-Telegram-Bot-Api-Secret-Token.
 */
export function getProvidedSharedSecret(req: Request): string | null {
    const bearer = getBearerToken(req);
    if (bearer) return bearer;
    const headerNames = [
        'x-webhook-secret',
        'x-api-secret',
        'x-cron-secret',
        'x-telegram-bot-api-secret-token',
    ];
    for (const name of headerNames) {
        const value = req.headers.get(name)?.trim();
        if (value) return value;
    }
    return null;
}

export type SharedSecretOptions = {
    /** Nombres de variables de entorno aceptadas (se prueba cada una). */
    envKeys: readonly string[];
    /**
     * Si true y no hay secreto configurado fuera de producción, deja pasar
     * (solo crons locales). Webhooks deben fallar cerrados.
     */
    allowInDevIfMissing?: boolean;
};

/**
 * Exige un secreto compartido. Si falta la env o no coincide, 401.
 */
export function requireSharedSecret(
    req: Request,
    options: SharedSecretOptions
): { ok: true } | NextResponse {
    const configured = options.envKeys
        .map((key) => process.env[key]?.trim())
        .filter((v): v is string => Boolean(v));

    if (configured.length === 0) {
        if (options.allowInDevIfMissing && process.env.NODE_ENV !== 'production') {
            return { ok: true };
        }
        return NextResponse.json(
            { error: 'No autorizado. Falta el secreto del servidor.' },
            { status: 401 }
        );
    }

    const provided = getProvidedSharedSecret(req);
    if (!provided) {
        return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const matches = configured.some((secret) => timingSafeEqualString(provided, secret));
    if (!matches) {
        return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }
    return { ok: true };
}

/** Sesión válida + rol admin. */
export async function requireAdmin(req: Request): Promise<AuthUserWithRole | NextResponse> {
    return requireRole(req, ['admin']);
}

/** Sesión válida + admin, marker o staff. */
export async function requireAdminOrStaff(req: Request): Promise<AuthUserWithRole | NextResponse> {
    return requireRole(req, STAFF_ROLES);
}

/** Cron Vercel: Authorization Bearer CRON_SECRET. */
export function requireCronSecret(req: Request): { ok: true } | NextResponse {
    return requireSharedSecret(req, {
        envKeys: ['CRON_SECRET'],
        allowInDevIfMissing: true,
    });
}

/** Webhook Telegram: header oficial o Bearer TELEGRAM_WEBHOOK_SECRET. */
export function requireTelegramWebhookSecret(req: Request): { ok: true } | NextResponse {
    return requireSharedSecret(req, {
        envKeys: ['TELEGRAM_WEBHOOK_SECRET'],
    });
}

/** Webhook interno (Supabase → CEO / WhatsApp). */
export function requireInternalWebhookSecret(req: Request): { ok: true } | NextResponse {
    return requireSharedSecret(req, {
        envKeys: ['SMARTPADEL_CEO_WEBHOOK_SECRET', 'WEBHOOK_SECRET'],
    });
}
