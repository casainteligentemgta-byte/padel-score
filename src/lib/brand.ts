/** Logo por defecto del evento (Smart Padel); se puede sustituir desde la cabecera del evento. */
export const DEFAULT_EVENT_SPONSOR_LOGO_URL =
    'https://smartpadel-assets.s3.amazonaws.com/logo-smart-padel-neon.png';

/** Dominio público de producción (QR Express, WhatsApp, emails). */
export const PUBLIC_APP_ORIGIN = 'https://smartpadel58.com';

/** URL base sin barra final; prioriza NEXT_PUBLIC_APP_URL (Vercel / .env.local). */
export function getAppBaseUrl(): string {
    const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (fromEnv) return fromEnv.replace(/\/+$/, '');
    if (typeof process.env.VERCEL_URL === 'string' && process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL.replace(/\/+$/, '')}`;
    }
    return PUBLIC_APP_ORIGIN;
}
