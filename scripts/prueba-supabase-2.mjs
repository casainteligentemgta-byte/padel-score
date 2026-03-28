#!/usr/bin/env node
/**
 * Prueba 2: torneo más reciente + partidos (equivalente a SQL B + vista tipo "finalizados").
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const envPath = resolve(root, '.env.local');

function loadEnvLocal() {
  if (!existsSync(envPath)) throw new Error('No .env.local');
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq > 0) {
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      process.env[t.slice(0, eq).trim()] = v;
    }
  }
}

function finishedLike(data) {
  if (!data || typeof data !== 'object') return false;
  const s = String(data.status || '').toUpperCase();
  if (['FINISHED', 'FINALIZADO', 'COMPLETE', 'COMPLETED'].includes(s)) return true;
  if (data.finishedAt || data.actualEndTime) {
    const ms = new Date(data.finishedAt || data.actualEndTime).getTime();
    if (!isNaN(ms) && ms > 0) return true;
  }
  const t1 = Number(data.sets?.t1 ?? 0);
  const t2 = Number(data.sets?.t2 ?? 0);
  if (t1 >= 2 || t2 >= 2) return true;
  return false;
}

loadEnvLocal();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key =
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY)?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
if (!url || !key) {
  console.error('[prueba-2] Falta URL o clave Supabase');
  process.exit(1);
}

const supabase = createClient(url, key);

const { data: tourneys, error: e1 } = await supabase
  .from('tournaments')
  .select('id, data, created_at')
  .order('created_at', { ascending: false })
  .limit(1);

if (e1) {
  console.error('[prueba-2] Error torneos:', e1.message);
  process.exit(1);
}
const t = tourneys?.[0];
if (!t) {
  console.log('[prueba-2] No hay torneos.');
  process.exit(0);
}

console.log('\n=== Torneo más reciente (prueba B) ===');
console.log('id:', t.id);
console.log('nombre:', t.data?.name ?? '(sin nombre)');
console.log('created_at:', t.created_at);

const { data: matches, error: e2 } = await supabase
  .from('tournament_matches')
  .select('id, data, updated_at')
  .eq('tournament_id', t.id)
  .order('updated_at', { ascending: false });

if (e2) {
  console.error('[prueba-2] Error partidos:', e2.message);
  process.exit(1);
}

console.log('\n=== Partidos de ese torneo ===');
for (const m of matches || []) {
  const d = m.data || {};
  console.log({
    id: m.id,
    status: d.status,
    finished_at: d.finishedAt,
    actual_end: d.actualEndTime,
    sets: d.sets,
    score: d.score,
    updated_at: m.updated_at,
  });
}

const fin = (matches || []).filter((m) => finishedLike(m.data));
console.log('\n=== Cuenta como finalizado (prueba tipo SQL 2) ===');
console.log('total partidos:', (matches || []).length);
console.log('finalizados_like:', fin.length);
fin.forEach((m) => console.log('  -', m.id, m.data?.status, m.data?.sets));
