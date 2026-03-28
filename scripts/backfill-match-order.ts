#!/usr/bin/env npx tsx
/**
 * Rellena y unifica match_number / matchNumber / order / orden en tournament_matches.data
 * usando la misma lógica que la app (syncMatchOrderFields).
 *
 * Uso:
 *   npx tsx scripts/backfill-match-order.ts --dry-run
 *   npx tsx scripts/backfill-match-order.ts
 *   npx tsx scripts/backfill-match-order.ts --tournament <uuid>
 *   npx tsx scripts/backfill-match-order.ts --tournament <uuid> --dedupe-order
 *     (asigna orden 1..N por fecha programada + id; corrige torneos viejos del generador maestro 0-based)
 *
 * Requiere .env.local con NEXT_PUBLIC_SUPABASE_URL.
 * Recomendado: SUPABASE_SERVICE_ROLE_KEY (evita bloqueos RLS al actualizar).
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { syncMatchOrderFields } from '../src/lib/matchOrderMeta';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const envPath = resolve(root, '.env.local');
const TAG = '[backfill · orden partidos]';

function loadEnvLocal() {
  if (!existsSync(envPath)) {
    console.error(`${TAG} No se encontró .env.local`);
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
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
          val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
}

function parseArgs() {
  const argv = process.argv.slice(2);
  let dryRun = false;
  let tournamentId: string | null = null;
  let dedupeOrder = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dry-run') dryRun = true;
    else if (argv[i] === '--dedupe-order') dedupeOrder = true;
    else if (argv[i] === '--tournament' && argv[i + 1]) {
      tournamentId = argv[++i]!;
    }
  }
  return { dryRun, tournamentId, dedupeOrder };
}

function dataNeedsWrite(
  prev: Record<string, unknown> | null | undefined,
  merged: Record<string, unknown>,
): boolean {
  const orderKeys = ['match_number', 'matchNumber', 'order', 'orden'] as const;
  const raw = prev && typeof prev === 'object' ? { ...prev } : {};
  delete raw.id;
  for (const k of orderKeys) {
    const a = merged[k];
    const b = raw[k];
    if (a !== b && !(a == null && b == null)) return true;
  }
  if (prev && typeof prev === 'object' && 'id' in prev) return true;
  return false;
}

loadEnvLocal();
const { dryRun, tournamentId, dedupeOrder } = parseArgs();

if (dedupeOrder && !tournamentId) {
  console.error(`${TAG} --dedupe-order requiere --tournament <uuid>`);
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key =
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY)?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !key) {
  console.error(`${TAG} Faltan NEXT_PUBLIC_SUPABASE_URL o clave Supabase en .env.local`);
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_KEY) {
  console.warn(`${TAG} Aviso: sin service role se usa anon; si RLS bloquea updates, añade SUPABASE_SERVICE_ROLE_KEY.`);
}

const supabase = createClient(url, key);
const PAGE = 500;

async function dedupeOrdersOneTournament(tid: string, dry: boolean) {
  const { data: rows, error } = await supabase
    .from('tournament_matches')
    .select('id, tournament_id, data')
    .eq('tournament_id', tid);
  if (error) {
    console.error(`${TAG} dedupe:`, error.message);
    process.exit(1);
  }
  const list = rows || [];
  list.sort((a, b) => {
    const ta = new Date(String((a.data as any)?.scheduledTime || 0)).getTime();
    const tb = new Date(String((b.data as any)?.scheduledTime || 0)).getTime();
    if (ta !== tb) return ta - tb;
    return String(a.id).localeCompare(String(b.id));
  });
  let toWrite = 0;
  let written = 0;
  const errors: string[] = [];
  for (let i = 0; i < list.length; i++) {
    const row = list[i]!;
    const prev = (row.data && typeof row.data === 'object' ? row.data : {}) as Record<string, unknown>;
    const ord = i + 1;
    const merged = {
      ...prev,
      match_number: ord,
      matchNumber: ord,
      order: ord,
      orden: ord,
    };
    if ('id' in merged) delete merged.id;
    if (!dataNeedsWrite(prev, merged)) continue;
    toWrite++;
    if (dry) continue;
    const { error: upErr } = await supabase
      .from('tournament_matches')
      .update({ data: merged, updated_at: new Date().toISOString() })
      .eq('id', row.id)
      .eq('tournament_id', row.tournament_id);
    if (upErr) errors.push(`${row.id}: ${upErr.message}`);
    else written++;
  }
  console.log(
    `${TAG} dedupe-order ${dry ? '(dry-run) ' : ''}torneo ${tid}: ${list.length} partidos, filas a escribir: ${toWrite}.` +
      (dry ? '' : ` Actualizadas: ${written}.`),
  );
  if (errors.length) {
    errors.slice(0, 15).forEach((e) => console.error('  ', e));
    process.exit(1);
  }
}

async function main() {
  if (dedupeOrder && tournamentId) {
    await dedupeOrdersOneTournament(tournamentId, dryRun);
    return;
  }

  let from = 0;
  let scanned = 0;
  let toUpdate = 0;
  let updated = 0;
  const errors: string[] = [];

  for (;;) {
    let q = supabase
      .from('tournament_matches')
      .select('id, tournament_id, data')
      .order('id', { ascending: true })
      .range(from, from + PAGE - 1);

    if (tournamentId) q = q.eq('tournament_id', tournamentId);

    const { data: rows, error } = await q;
    if (error) {
      console.error(`${TAG} Error al leer:`, error.message);
      process.exit(1);
    }
    if (!rows?.length) break;

    for (const row of rows) {
      scanned++;
      const prev = row.data as Record<string, unknown> | undefined;
      const merged = syncMatchOrderFields({
        ...(prev && typeof prev === 'object' ? prev : {}),
        id: row.id,
      });
      if ('id' in merged) delete merged.id;

      if (!dataNeedsWrite(prev, merged)) continue;
      toUpdate++;

      if (dryRun) continue;

      const { error: upErr } = await supabase
        .from('tournament_matches')
        .update({
          data: merged,
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id)
        .eq('tournament_id', row.tournament_id);

      if (upErr) errors.push(`${row.id}: ${upErr.message}`);
      else updated++;
    }

    if (rows.length < PAGE) break;
    from += PAGE;
  }

  console.log(
    `${TAG} ${dryRun ? '(dry-run) ' : ''}Escaneados: ${scanned}. Filas a actualizar: ${toUpdate}.` +
      (dryRun ? '' : ` Actualizadas: ${updated}.`),
  );
  if (errors.length) {
    console.error(`${TAG} Errores (${errors.length}):`);
    errors.slice(0, 20).forEach((e) => console.error('  ', e));
    if (errors.length > 20) console.error(`  … y ${errors.length - 20} más`);
    process.exit(1);
  }
}

main();
