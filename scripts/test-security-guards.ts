import assert from 'node:assert/strict';
import {
  categoryPriceFromTournament,
  expectedAmountForInscription,
  expectedAmountForInscriptions,
  isPayableInscriptionStatus,
} from '../src/lib/inscriptionPricing';
import { timingSafeEqualString } from '../src/lib/apiGuard';
import { isAdminAccess, isLegacyAdminEmail } from '../src/lib/adminAccess';
import {
  amountsMatch,
  isMercadoPagoMethod,
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

console.log('Todos los guards de seguridad OK');
