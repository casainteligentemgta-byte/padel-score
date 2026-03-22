#!/usr/bin/env node
/**
 * Abre las inscripciones de un torneo por nombre.
 * Uso: node scripts/open-tournament-inscriptions.mjs "Express Bodeguero"
 *   o: npm run open-inscriptions -- "Express Bodeguero"
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const envPath = resolve(root, '.env.local');

const PADEL = '[Smart Padel · Inscripciones]';

function loadEnvLocal() {
  if (!existsSync(envPath)) {
    console.error(`${PADEL} No se encontró .env.local`);
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

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY)?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !key) {
  console.error(`${PADEL} Faltan NEXT_PUBLIC_SUPABASE_URL o clave de Supabase en .env.local`);
  process.exit(1);
}

const supabase = createClient(url, key);
const searchName = (process.argv[2] || 'Express Bodeguero').trim();

async function main() {
  console.log(`\n${PADEL} Buscando torneo: "${searchName}"\n`);

  const { data: rows, error: listError } = await supabase
    .from('tournaments')
    .select('id, data, created_at');

  if (listError) {
    console.error(`${PADEL} Error al listar torneos:`, listError.message);
    process.exit(1);
  }

  const normalizedSearch = searchName.toLowerCase();
  const found = (rows || []).find((r) => {
    const name = (r.data && r.data.name) ? String(r.data.name).toLowerCase() : '';
    return name.includes(normalizedSearch) || normalizedSearch.includes(name);
  });

  if (!found) {
    console.log(`${PADEL} No se encontró ningún torneo con nombre que contenga "${searchName}".`);
    console.log('Torneos disponibles:', (rows || []).map((r) => r.data?.name || r.id).join(', ') || '(ninguno)');
    process.exit(1);
  }

  const tournamentId = found.id;
  const currentData = found.data || {};
  const merged = { ...currentData, registrationStatus: 'open' };

  const { error: updateError } = await supabase
    .from('tournaments')
    .update({ data: merged, updated_at: new Date().toISOString() })
    .eq('id', tournamentId);

  if (updateError) {
    console.error(`${PADEL} Error al actualizar:`, updateError.message);
    process.exit(1);
  }

  console.log(`${PADEL} Inscripciones abiertas para: ${currentData.name || tournamentId} (id: ${tournamentId})\n`);
}

main();
