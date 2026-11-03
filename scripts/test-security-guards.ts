import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import {
  amountsMatch,
  buildMercadoPagoManifest,
  mercadoPagoDataId,
  parseMercadoPagoSignatureHeader,
  verifyMercadoPagoWebhookSignature,
} from '../src/lib/mercadopagoWebhook';
import {
  categoryPriceFromTournament,
  expectedAmountForInscription,
  expectedAmountForInscriptions,
  isPayableInscriptionStatus,
} from '../src/lib/inscriptionPricing';
import { timingSafeEqualString } from '../src/lib/apiGuard';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`OK  ${name}`);
  } catch (e) {
    console.error(`ERR ${name}`);
    throw e;
  }
}

run('parse x-signature', () => {
  const p = parseMercadoPagoSignatureHeader(
    'ts=1704908010,v1=618c85345248dd820d5fd456117c2ab2ef8eda45a0282ff693eac24131a5e839'
  );
  assert.equal(p?.ts, '1704908010');
  assert.ok(p?.v1?.startsWith('618c'));
  assert.equal(parseMercadoPagoSignatureHeader(null), null);
  assert.equal(parseMercadoPagoSignatureHeader('nope'), null);
});

run('manifest + HMAC oficial', () => {
  const secret = 'test-secret';
  const dataId = '999999999';
  const requestId = 'req-1';
  const ts = '1704908010';
  const manifest = buildMercadoPagoManifest({ dataId, requestId, ts });
  assert.equal(manifest, 'id:999999999;request-id:req-1;ts:1704908010;');
  const v1 = createHmac('sha256', secret).update(manifest).digest('hex');
  assert.equal(
    verifyMercadoPagoWebhookSignature({
      xSignature: `ts=${ts},v1=${v1}`,
      xRequestId: requestId,
      dataId,
      secret,
    }),
    true
  );
  assert.equal(
    verifyMercadoPagoWebhookSignature({
      xSignature: `ts=${ts},v1=${v1}`,
      xRequestId: requestId,
      dataId,
      secret: 'otro',
    }),
    false
  );
});

run('data.id query en minúsculas', () => {
  const url = 'https://app.example/api/webhooks/mercadopago?data.id=AbC123';
  assert.equal(mercadoPagoDataId(url, 'ZZZ'), 'abc123');
});

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

console.log('Todos los guards de seguridad OK');
