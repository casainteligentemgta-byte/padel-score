/** Logo por defecto del evento (Smart Padel); se puede sustituir desde la cabecera del evento. */
export const DEFAULT_EVENT_SPONSOR_LOGO_URL =
    'https://smartpadel-assets.s3.amazonaws.com/logo-smart-padel-neon.png';

/** Dominio público de producción (QR Express, WhatsApp, emails). */
export const PUBLIC_APP_ORIGIN = 'https://smartpadel58.com';

function stripTrailingSlash(url: string): string {
    return url.replace(/\/+$/, '');
}

/** URL base sin barra final; prioriza NEXT_PUBLIC_APP_URL (Vercel / .env.local). */
export function getAppBaseUrl(): string {
    const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (fromEnv) return stripTrailingSlash(fromEnv);
    if (typeof process.env.VERCEL_URL === 'string' && process.env.VERCEL_URL) {
        return `https://${stripTrailingSlash(process.env.VERCEL_URL)}`;
    }
    return PUBLIC_APP_ORIGIN;
}

/**
 * Origen canónico para emails de Auth (recuperación / confirmación).
 * Prefiere NEXT_PUBLIC_SITE_URL; si no, NEXT_PUBLIC_APP_URL; si no, smartpadel58.com.
 * Nunca usa window.location.origin (preview/localhost rompe el redirect de Supabase).
 */
export function getPublicSiteUrl(): string {
    const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (site) return stripTrailingSlash(site);
    const app = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (app && !/localhost|127\.0\.0\.1/.test(app)) return stripTrailingSlash(app);
    return PUBLIC_APP_ORIGIN;
}

export function getPasswordRecoveryRedirectUrl(): string {
    return `${getPublicSiteUrl()}/reset-password`;
}
