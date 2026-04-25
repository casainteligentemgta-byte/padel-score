/**
 * Perfil de prueba: código 888888 — mismo UUID en toda la app, migración 054 (auth + profiles) y atajos en API.
 * "Smart Padel Player Test" acepta la reserva de pareja automáticamente vía /api/inscriptions/auto-confirm-test-partner
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
