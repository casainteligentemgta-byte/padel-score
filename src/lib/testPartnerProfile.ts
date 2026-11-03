/**
 * Constantes históricas del perfil de prueba 888888 (migración 054).
 * El atajo de auto-confirmación se retiró de producción.
 */

export const TEST_PARTNER_CODE = '888888';

export const TEST_PARTNER_DISPLAY_NAME = 'Smart Padel Player Test';

/** UUID fijo: debe existir en auth.users + profiles (ver migración 054). */
export const TEST_PARTNER_USER_ID = '0f888888-8888-4888-8888-888888888888' as const;

export const TEST_PARTNER_EMAIL = 'test.smartplayer@smartpadel.local';

export function isTestPartnerUserId(id: string | null | undefined): boolean {
  if (!id) return false;
  return String(id) === TEST_PARTNER_USER_ID;
}

export function isTestPartnerCode(code: string | null | undefined): boolean {
  if (!code) return false;
  return String(code).trim().toUpperCase().replace(/\s/g, '') === TEST_PARTNER_CODE;
}
