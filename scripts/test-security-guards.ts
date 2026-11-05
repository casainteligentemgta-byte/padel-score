import assert from 'node:assert/strict';
import {
  categoryPriceFromTournament,
  expectedAmountForInscription,
  expectedAmountForInscriptions,
  isPayableInscriptionStatus,
  resolveInscriptionCategory,
} from '../src/lib/inscriptionPricing';
import {
  caracasTodayDateString,
  invitationExpiryMs,
  isCaracasInscriptionClosed,
  toCaracasDateString,
} from '../src/lib/caracasTime';
import { validateSignupPassword } from '../src/lib/authValidators';
import { timingSafeEqualString } from '../src/lib/apiGuard';
import { isAdminAccess, isLegacyAdminEmail, isServerAdminAccess } from '../src/lib/adminAccess';
import { ACCESS_TOKEN_COOKIE, getAccessTokenFromRequest } from '../src/lib/authCookie';
import {
  assertNoSensitivePublicInscription,
  mapPublicInscriptionRow,
} from '../src/lib/publicInscriptions';
import {
  extractInscriptionEmail,
  extractInscriptionPhone,
  paymentApprovedEmailHtml,
} from '../src/lib/paymentApprovalNotify';
import { getPasswordRecoveryRedirectUrl, getPublicSiteUrl, PUBLIC_APP_ORIGIN } from '../src/lib/brand';
import {
  amountsMatch,
  isMercadoPagoMethod,
  normalizePaymentMethodSlug,
  resolveManualInscriptionPaymentStatus,
  validatePaymentAgainstCategoryPrice,
} from '../src/lib/paymentValidation';
import {
  isValidBirthDate,
  isValidPersonName,
  isValidVeCedula,
  isValidVeMobile,
  normalizeVeCedula,
} from '../src/lib/veIdentity';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`OK  ${name}`);
  } catch (e) {
    console.error(`ERR ${name}`);
    throw e;
  }
}

run('precios desde torneo, no del cliente', () => {
  const tournament = {
    inscriptionCategories: [
      { key: 'c7', name: 'C7', price: 40 },
      { key: 'c8', name: 'C8', price: 35 },
    ],
  };
  assert.equal(categoryPriceFromTournament(tournament, 'c7'), 40);
  assert.equal(
    expectedAmountForInscription({ id: '1', category_key: 'c8', category_price: 1 }, tournament),
    35
  );
  assert.equal(
    expectedAmountForInscription({ id: '1', category_key: 'c8' }, tournament),
    35
  );
  const sum = expectedAmountForInscriptions(
    [
      { id: 'a', tournament_id: 't1', category_key: 'c7' },
      { id: 'b', tournament_id: 't1', category_key: 'c8' },
    ],
    new Map([['t1', tournament]])
  );
  assert.equal(sum, 75);
  assert.equal(isPayableInscriptionStatus('pending'), true);
  assert.equal(isPayableInscriptionStatus('paid'), false);
  assert.equal(amountsMatch(40, 40), true);
  assert.equal(amountsMatch(40, 10), false);
});

run('timingSafeEqualString', () => {
  assert.equal(timingSafeEqualString('abc', 'abc'), true);
  assert.equal(timingSafeEqualString('abc', 'abd'), false);
  assert.equal(timingSafeEqualString('abc', 'ab'), false);
});

run('admin extra solo por lista exacta de env', () => {
  const prevPublic = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  const prevAdmin = process.env.ADMIN_EMAILS;
  process.env.NEXT_PUBLIC_ADMIN_EMAILS = 'owner@example.com';
  delete process.env.ADMIN_EMAILS;
  assert.equal(isLegacyAdminEmail('owner@example.com'), true);
  assert.equal(isLegacyAdminEmail('casainteligentemgta@gmail.com'), false);
  assert.equal(isAdminAccess('admin', 'x@y.com'), true);
  assert.equal(isAdminAccess('player', 'owner@example.com'), true);
  assert.equal(isAdminAccess('player', 'otro@example.com'), false);
  if (prevPublic === undefined) delete process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  else process.env.NEXT_PUBLIC_ADMIN_EMAILS = prevPublic;
  if (prevAdmin === undefined) delete process.env.ADMIN_EMAILS;
  else process.env.ADMIN_EMAILS = prevAdmin;
});

run('pago móvil coincidente queda pending hasta admin', () => {
  const ok = validatePaymentAgainstCategoryPrice({
    amountExtracted: 2268,
    categoryPrice: 40,
    bcvVesPerUsd: 56.7,
  });
  assert.equal(ok.paymentStatus, 'pending');
  assert.equal(ok.amountMatches, true);
  const bad = validatePaymentAgainstCategoryPrice({
    amountExtracted: 5,
    categoryPrice: 40,
    bcvVesPerUsd: 56.7,
  });
  assert.equal(bad.paymentStatus, 'alert');
  assert.equal(bad.amountMatches, false);

  const resolved = resolveManualInscriptionPaymentStatus({
    categoryPrice: 40,
    amountExtracted: 40,
    bcvVesPerUsd: 56.7,
  });
  assert.equal(resolved.paymentStatus, 'pending');
  const free = resolveManualInscriptionPaymentStatus({ categoryPrice: 0 });
  assert.equal(free.paymentStatus, 'paid');
});

run('migración 075 protege role y oculta profiles', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const sql = readFileSync(
    join(here, '../supabase/migrations/075_profiles_inscription_security.sql'),
    'utf8'
  );
  assert.match(sql, /protect_profiles_privileged_columns/);
  assert.match(sql, /No autorizado a cambiar role/);
  assert.match(sql, /NEW\.role := 'player'/);
  assert.match(sql, /DROP POLICY IF EXISTS "Public profiles are viewable"/);
  assert.match(sql, /DROP POLICY IF EXISTS "Permitir búsqueda por código único"/);
  assert.match(sql, /DROP POLICY IF EXISTS "profiles_insert_by_definer"/);
  assert.match(sql, /lookup_profile_by_unique_code/);
  assert.match(sql, /profiles_select_own_or_admin/);
});

run('identidad venezolana (cédula, teléfono, nombre)', () => {
  assert.equal(normalizeVeCedula('v-12.345.678'), 'V12345678');
  assert.equal(isValidVeCedula('V-12.345.678'), true);
  assert.equal(isValidVeCedula('123'), false);
  assert.equal(isValidVeMobile('+58 412 1234567'), true);
  assert.equal(isValidVeMobile('02121234567'), false);
  assert.equal(isValidPersonName('María José'), true);
  assert.equal(isValidPersonName('X'), false);
  assert.equal(isValidBirthDate('1990-05-12'), true);
  assert.equal(isValidBirthDate('3000-01-01'), false);
});

run('Mercado Pago se reconoce como método retirado', () => {
  assert.equal(isMercadoPagoMethod('Mercado Pago'), true);
  assert.equal(isMercadoPagoMethod('mercadopago'), true);
  assert.equal(isMercadoPagoMethod('MP'), true);
  assert.equal(isMercadoPagoMethod('Pago Móvil'), false);
  assert.equal(isMercadoPagoMethod('Transferencia Bancaria'), false);
});

run('fecha civil Caracas no usa UTC de toISOString', () => {
  const after20Caracas = new Date('2026-11-05T01:30:00.000Z'); // 21:30 America/Caracas del 4
  assert.equal(caracasTodayDateString(after20Caracas), '2026-11-04');
  assert.equal(toCaracasDateString('2026-11-05'), '2026-11-05');
  assert.equal(isCaracasInscriptionClosed('2026-11-05', 'open', after20Caracas), false);
  assert.equal(isCaracasInscriptionClosed('2026-11-04', 'open', after20Caracas), true);
  const beforeClose = new Date('2026-11-04T19:00:00.000Z'); // 15:00 Caracas
  assert.equal(isCaracasInscriptionClosed('2026-11-04', 'open', beforeClose), false);
});

run('categoría real y precio, no GENERAL/0', () => {
  const resolved = resolveInscriptionCategory(
    {
      category: 'QUINTA',
      inscriptionPrice: 120,
      inscriptionCategories: [{ key: 'QUINTA', name: 'QUINTA Masculino', price: 120 }],
    },
    'GENERAL'
  );
  assert.equal(resolved.key, 'QUINTA');
  assert.equal(resolved.price, 120);
  const fromName = resolveInscriptionCategory(
    { inscriptionCategories: [{ key: 'quinta_masc', name: 'QUINTA Masculino', price: 120 }] },
    'QUINTA Masculino'
  );
  assert.equal(fromName.key, 'quinta_masc');
  assert.equal(fromName.price, 120);
});

run('pago móvil queda pending y normaliza método', () => {
  assert.equal(normalizePaymentMethodSlug('Pago Móvil'), 'pago_movil');
  assert.equal(normalizePaymentMethodSlug('Transferencia Bancaria'), 'transferencia');
  const paidWouldBeWrong = resolveManualInscriptionPaymentStatus({
    categoryPrice: 120,
    amountExtracted: 120,
    paymentMethod: 'pago_movil',
  });
  assert.equal(paidWouldBeWrong.paymentStatus, 'pending');
});

run('reserva de invitación 2h con timestamp naive UTC', () => {
  const created = '2026-11-04T18:00:00';
  const expires = '2026-11-04T20:00:00';
  assert.equal(invitationExpiryMs({ expires_at: expires }), Date.parse('2026-11-04T20:00:00Z'));
  assert.equal(invitationExpiryMs({ created_at: created }), Date.parse('2026-11-04T20:00:00Z'));
});

run('contraseña de registro unificada 8-16 con complejidad', () => {
  assert.equal(validateSignupPassword('Abc1!xxx').valid, true);
  assert.equal(validateSignupPassword('abc1!xxx').valid, false);
  assert.equal(validateSignupPassword('Abcdefgh').valid, false);
  assert.equal(validateSignupPassword('Ab1!x').valid, false);
  assert.equal(validateSignupPassword('Abcdefghijklmno1!').valid, false);
});

run('migración 076 fuerza pending en INSERT', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const sql = readFileSync(
    join(here, '../supabase/migrations/076_inscription_payment_pending.sql'),
    'utf8'
  );
  assert.match(sql, /ALTER COLUMN payment_status SET DEFAULT 'pending'/);
  assert.match(sql, /inscriptions_force_manual_pending/);
  assert.match(sql, /BEFORE INSERT ON public.inscriptions/);
});

run('recuperación de contraseña usa SITE_URL canónico', () => {
  const prevSite = process.env.NEXT_PUBLIC_SITE_URL;
  const prevApp = process.env.NEXT_PUBLIC_APP_URL;
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.NEXT_PUBLIC_APP_URL;
  assert.equal(getPublicSiteUrl(), PUBLIC_APP_ORIGIN);
  assert.equal(getPasswordRecoveryRedirectUrl(), `${PUBLIC_APP_ORIGIN}/reset-password`);
  process.env.NEXT_PUBLIC_SITE_URL = 'https://smartpadel58.com/';
  assert.equal(getPasswordRecoveryRedirectUrl(), 'https://smartpadel58.com/reset-password');
  if (prevSite === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = prevSite;
  if (prevApp === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
  else process.env.NEXT_PUBLIC_APP_URL = prevApp;
});

run('admin de API prefiere ADMIN_EMAILS', () => {
  const prevPublic = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  const prevAdmin = process.env.ADMIN_EMAILS;
  process.env.NEXT_PUBLIC_ADMIN_EMAILS = 'public@example.com';
  process.env.ADMIN_EMAILS = 'server@example.com';
  assert.equal(isServerAdminAccess('player', 'server@example.com'), true);
  assert.equal(isServerAdminAccess('player', 'public@example.com'), false);
  assert.equal(isServerAdminAccess('admin', 'x@y.com'), true);
  delete process.env.ADMIN_EMAILS;
  assert.equal(isServerAdminAccess('player', 'public@example.com'), true);
  if (prevPublic === undefined) delete process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  else process.env.NEXT_PUBLIC_ADMIN_EMAILS = prevPublic;
  if (prevAdmin === undefined) delete process.env.ADMIN_EMAILS;
  else process.env.ADMIN_EMAILS = prevAdmin;
});

run('migración 077 confirma inscripción reservada', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const sql = readFileSync(
    join(here, '../supabase/migrations/077_confirm_reserved_inscription.sql'),
    'utf8'
  );
  assert.match(sql, /confirm_reserved_inscription/);
  assert.match(sql, /inscription_status = 'CONFIRMED'/);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public.confirm_reserved_inscription/);
});

run('migración 078 cierra inscriptions_public_read y publica RPC sin PII', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const sql = readFileSync(
    join(here, '../supabase/migrations/078_inscriptions_select_own_or_admin.sql'),
    'utf8'
  );
  assert.match(sql, /DROP POLICY IF EXISTS "inscriptions_public_read"/);
  assert.match(sql, /inscriptions_select_own_or_admin/);
  assert.match(sql, /data->>'partnerId'/);
  assert.match(sql, /is_admin_user\(\)/);
  assert.match(sql, /list_tournament_inscriptions_public/);
  assert.doesNotMatch(sql, /pizarra_cancha/);
  assert.doesNotMatch(sql, /participant_email/);
  assert.doesNotMatch(sql, /payment_status/);
  assert.doesNotMatch(sql, /receipt_url/);
});

run('roster público no filtra email ni pago', () => {
  const mapped = mapPublicInscriptionRow({
    id: '11111111-1111-4111-8111-111111111111',
    tournament_id: '22222222-2222-4222-8222-222222222222',
    category_key: 'c7',
    participant_name: 'Ana',
    participant_email: 'hidden@example.com',
    receipt_url: 'https://secret',
    payment_status: 'paid',
    group_name: 'A',
    is_placeholder: false,
    data: { partnerName: 'Luis', phone: '04141234567', email: 'hidden@example.com' },
  });
  assert.equal(mapped.participantName, 'Ana');
  assert.equal(mapped.data.partnerName, 'Luis');
  assert.equal(mapped.categoryKey, 'c7');
  assert.equal((mapped as { participantEmail?: string }).participantEmail, undefined);
  assert.equal((mapped as { paymentStatus?: string }).paymentStatus, undefined);
  assertNoSensitivePublicInscription(mapped);
});

run('cookie JWT se lee de Bearer o Cookie', () => {
  const bearer = new Request('https://x.test', {
    headers: { authorization: 'Bearer abc.def' },
  });
  assert.equal(getAccessTokenFromRequest(bearer), 'abc.def');
  const cookie = new Request('https://x.test', {
    headers: { cookie: `${ACCESS_TOKEN_COOKIE}=tok123; other=1` },
  });
  assert.equal(getAccessTokenFromRequest(cookie), 'tok123');
});

run('aviso de pago extrae email y teléfono del JSONB', () => {
  const row = {
    participant_email: 'ana@example.com',
    participant_name: 'Ana',
    data: { phone: '+584121234567', partnerName: 'Luis' },
  };
  assert.equal(extractInscriptionEmail(row), 'ana@example.com');
  assert.equal(extractInscriptionPhone(row), '+584121234567');
  const html = paymentApprovedEmailHtml({
    playerName: 'Ana',
    tournamentName: 'Open',
    dashboardUrl: 'https://smartpadel58.com/dashboard',
  });
  assert.match(html, /aprobado/);
  assert.match(html, /Open/);
});

console.log('Todos los guards de seguridad OK');
