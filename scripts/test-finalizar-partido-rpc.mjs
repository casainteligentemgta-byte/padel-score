#!/usr/bin/env node
/**
 * Pruebas manuales del RPC `finalizar_partido_y_liberar_cancha` (migración 023).
 *
 * Requiere .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   TEST_RPC_OWNER_EMAIL, TEST_RPC_OWNER_PASSWORD       → dueño del torneo (happy path)
 *   TEST_RPC_FORBIDDEN_EMAIL, TEST_RPC_FORBIDDEN_PASSWORD → usuario sin permiso sobre ese torneo
 *
 * Params del partido (uno de):
 *   Variables: TEST_RPC_MATCH_ID, TEST_RPC_TOURNAMENT_ID, TEST_RPC_CANCHA_ID (ej. cancha_1)
 *   CLI: node scripts/test-finalizar-partido-rpc.mjs -- <matchId> <tournamentUuid> <canchaId>
 *
 * Uso:
 *   npm run test:rpc-finalizar
 *   npm run test:rpc-finalizar -- m_xxx 2f7bfbbe-2430-49c5-8d71-83780d7a6be3 cancha_1
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const envPath = resolve(root, '.env.local');

function loadEnvLocal() {
  if (!existsSync(envPath)) {
    console.error('No se encontró .env.local en la raíz del proyecto.');
    process.exit(1);
  }
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eq = trimmed.indexOf('=');
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const OWNER_EMAIL = process.env.TEST_RPC_OWNER_EMAIL;
const OWNER_PASS = process.env.TEST_RPC_OWNER_PASSWORD;
const FORBIDDEN_EMAIL = process.env.TEST_RPC_FORBIDDEN_EMAIL;
const FORBIDDEN_PASS = process.env.TEST_RPC_FORBIDDEN_PASSWORD;

// `npm run test:rpc-finalizar -- a b c` → argv = [a,b,c] (npm no deja "--" en process.argv).
// `node script.mjs -- a b` → argv = ['--','a','b']
const argv = process.argv.slice(2);
const dash = argv.indexOf('--');
const cliArgs = dash >= 0 ? argv.slice(dash + 1) : argv;

const RPC_PARAMS = {
  p_match_id:
    cliArgs[0] || process.env.TEST_RPC_MATCH_ID || 'MATCH_ID_AQUI',
  p_tournament_id:
    cliArgs[1] || process.env.TEST_RPC_TOURNAMENT_ID || 'UUID_TORNEO_AQUI',
  p_cancha_id: cliArgs[2] || process.env.TEST_RPC_CANCHA_ID || 'cancha_1',
  p_final_data: {
    resultado: '6-4 6-3',
    estado: 'finalizado',
    status: 'FINISHED',
    score: '6-4 6-3',
    finishedAt: new Date().toISOString(),
    actualEndTime: new Date().toISOString(),
  },
};

const rpcName = 'finalizar_partido_y_liberar_cancha';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local');
  process.exit(1);
}

if (
  RPC_PARAMS.p_match_id === 'MATCH_ID_AQUI' ||
  RPC_PARAMS.p_tournament_id === 'UUID_TORNEO_AQUI'
) {
  console.error(
    'Configura TEST_RPC_MATCH_ID y TEST_RPC_TOURNAMENT_ID en .env.local o pásalos tras --:\n' +
      '  npm run test:rpc-finalizar -- <matchId> <tournamentUuid> [canchaId]'
  );
  process.exit(1);
}

if (!OWNER_EMAIL || !OWNER_PASS || !FORBIDDEN_EMAIL || !FORBIDDEN_PASS) {
  console.error(
    'Faltan credenciales de prueba en .env.local:\n' +
      '  TEST_RPC_OWNER_EMAIL, TEST_RPC_OWNER_PASSWORD\n' +
      '  TEST_RPC_FORBIDDEN_EMAIL, TEST_RPC_FORBIDDEN_PASSWORD'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function login(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Login falló (${email}): ${error.message}`);
}

async function logout() {
  await supabase.auth.signOut();
}

async function callRpc(label) {
  const { data, error } = await supabase.rpc(rpcName, RPC_PARAMS);
  console.log(`\n[${label}]`);
  console.log('error:', error);
  console.log('data :', data);
  return { data, error };
}

function assert(condition, message) {
  if (!condition) throw new Error(`❌ ${message}`);
  console.log(`✅ ${message}`);
}

async function testHappyPath() {
  await login(OWNER_EMAIL, OWNER_PASS);
  const { data, error } = await callRpc('HAPPY_PATH');

  assert(error == null, 'No hay error de cliente');
  assert(data?.ok === true, 'RPC devuelve { ok: true }');
  await logout();
}

async function testForbidden() {
  await login(FORBIDDEN_EMAIL, FORBIDDEN_PASS);
  const { data, error } = await callRpc('FORBIDDEN');

  assert(error == null, 'No hay error de cliente (la función responde controladamente)');
  assert(data?.ok === false, 'RPC devuelve ok=false');
  assert(data?.error === 'forbidden', "RPC devuelve error='forbidden'");
  await logout();
}

async function testNoAuth() {
  await logout();
  const { data, error } = await callRpc('NO_AUTH');

  assert(error == null, 'No hay error de cliente (la función responde controladamente)');
  assert(data?.ok === false, 'RPC devuelve ok=false');
  assert(data?.error === 'not_authenticated', "RPC devuelve error='not_authenticated'");
}

async function runAll() {
  try {
    await testHappyPath();
    await testForbidden();
    await testNoAuth();
    console.log('\n🎉 Todas las pruebas pasaron');
  } catch (e) {
    console.error('\n', e?.message || e);
    process.exit(1);
  }
}

runAll();
