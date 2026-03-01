/**
 * Verificación de autenticación Firebase en el servidor (API routes).
 * Si FIREBASE_SERVICE_ACCOUNT_KEY está en .env.local: se exige token y rol.
 * Si no está: las APIs siguen abiertas (puedes añadir la clave más tarde para activar la protección).
 * Obtener clave: Firebase Console → Configuración → Cuentas de servicio → Generar nueva clave privada.
 */

import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Request es la Web API estándar (fetch), no se exporta desde next/server en Next 16
type Request = globalThis.Request;

let adminApp: admin.app.App | null = null;

function getAdminApp(): admin.app.App | null {
    if (adminApp) return adminApp;
    const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!key) return null;
    try {
        const parsed = JSON.parse(key) as Record<string, unknown>;
        const serviceAccount: admin.ServiceAccount = {
            projectId: parsed.project_id as string,
            clientEmail: parsed.client_email as string,
            privateKey: parsed.private_key as string
        };
        if (admin.apps.length === 0) {
            adminApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.projectId
            });
        } else {
            adminApp = admin.apps[0] as admin.app.App;
        }
        return adminApp;
    } catch (e) {
        console.error('[authServer] Invalid FIREBASE_SERVICE_ACCOUNT_KEY:', e);
        return null;
    }
}

function getBearerToken(req: Request): string | null {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    return auth.slice(7).trim() || null;
}

export type AuthUser = { uid: string; email?: string };
export type AuthUserWithRole = AuthUser & { role: string };

export async function getAuthUser(req: Request): Promise<AuthUser | null> {
    const token = getBearerToken(req);
    if (!token) return null;
    const app = getAdminApp();
    if (!app) return null;
    try {
        const decoded = await app.auth().verifyIdToken(token);
        return { uid: decoded.uid, email: decoded.email ?? undefined };
    } catch {
        return null;
    }
}

export async function getAuthUserWithRole(req: Request): Promise<AuthUserWithRole | null> {
    const user = await getAuthUser(req);
    if (!user) return null;
    const app = getAdminApp();
    if (!app) return { ...user, role: 'player' };
    try {
        const doc = await app.firestore().collection('users').doc(user.uid).get();
        const role = (doc.data()?.role as string) ?? 'player';
        return { ...user, role };
    } catch {
        return { ...user, role: 'player' };
    }
}

/** Si la cuenta de servicio no está configurada, no bloqueamos (para poder configurarla después). */
function isAuthEnabled(): boolean {
    return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
}

export async function requireAuth(req: Request): Promise<AuthUser | NextResponse> {
    if (!isAuthEnabled()) return { uid: 'anonymous', email: undefined };
    const user = await getAuthUser(req);
    if (user) return user;
    return NextResponse.json(
        { error: 'No autorizado. Inicia sesión e incluye el token en Authorization: Bearer <token>.' },
        { status: 401 }
    );
}

export async function requireRole(
    req: Request,
    allowedRoles: readonly string[]
): Promise<AuthUserWithRole | NextResponse> {
    if (!isAuthEnabled()) return { uid: 'anonymous', email: undefined, role: 'admin' };
    const user = await getAuthUserWithRole(req);
    if (!user) {
        return NextResponse.json(
            { error: 'No autorizado. Inicia sesión e incluye el token en Authorization: Bearer <token>.' },
            { status: 401 }
        );
    }
    const role = user.role?.toLowerCase?.() ?? 'player';
    if (!allowedRoles.map(r => r.toLowerCase()).includes(role)) {
        return NextResponse.json(
            { error: 'No tienes permiso para esta acción.' },
            { status: 403 }
        );
    }
    return user;
}
