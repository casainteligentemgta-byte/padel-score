#!/usr/bin/env node
/**
 * Ejercicio: marca un partido como FINISHED para que aparezca en la pestaña Finalizados del hub.
 *
 * Uso:
 *   npm run exercise:finish-match -- <tournament_uuid>
 *   npm run exercise:finish-match -- <tournament_uuid> <match_uuid>
 *   npm run exercise:finish-match -- <tournament_uuid> --order 4
 *   npm run exercise:finish-match -- --name "Fragmento del nombre del torneo"
 *
 * Opciones:
 *   --2-0 | --straight  → victoria 2-0 en dos sets a 6 (sin STB).
 *   --force              → sobrescribe aunque el partido ya esté FINISHED (corrige marcador / hub).
 *   (sin flag) y formato distinto de un solo set / best-of-3 completo → 2-1 con super tie-break 10-6 (aunque en BD tieBreakType sea TB).
 *
 * Requiere .env.local con NEXT_PUBLIC_SUPABASE_URL y (recomendado) SUPABASE_SERVICE_ROLE_KEY.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const envPath = resolve(root, '.env.local');
const TAG = '[ejercicio · finalizar partido]';

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

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key =
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY)?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !key) {
  console.error(`${TAG} Faltan NEXT_PUBLIC_SUPABASE_URL o clave Supabase en .env.local`);
  process.exit(1);
}

const supabase = createClient(url, key);

function inferOrderFromId(id) {
  if (typeof id !== 'string' || !id) return null;
  const m = id.match(/^m-[^-]+-(\d+)-/);
  if (m) {
    const k = parseInt(m[1], 10);
    if (!Number.isFinite(k)) return null;
    return k >= 1 ? k : k + 1;
  }
  const m2 = id.match(/^match-(\d+)-/);
  if (m2) {
    const idx = parseInt(m2[1], 10);
    return Number.isFinite(idx) ? idx + 1 : null;
  }
  return null;
}

function orderOfMatchRow(r) {
  const d = r.data || {};
  for (const k of ['match_number', 'matchNumber', 'order', 'orden']) {
    const n = Number(d[k]);
    if (Number.isFinite(n) && n >= 1) return Math.floor(n);
  }
  return inferOrderFromId(r.id);
}

function isFinishedLike(data) {
  if (!data || typeof data !== 'object') return false;
  const s = String(data.status || '').toUpperCase();
  if (['FINISHED', 'FINALIZADO', 'COMPLETE', 'COMPLETED'].includes(s)) return true;
  const end = data.finishedAt || data.actualEndTime;
  if (end && !isNaN(new Date(end).getTime())) return true;
  const t1 = Number(data.sets?.t1 ?? 0);
  const t2 = Number(data.sets?.t2 ?? 0);
  if (t1 >= 2 || t2 >= 2) return true;
  return false;
}

/**
 * Cierre coherente con la app: dos sets a 6 + STB como desempate (matchScoringRules TWO_NORMAL_SETS + STB).
 */
function buildFinishedPayload(prev, tournamentData, nowIso, straightWin) {
  const tf =
    prev.matchFormat ||
    prev.match_format ||
    tournamentData?.matchFormat ||
    tournamentData?.rrMatchFormat ||
    'TWO_NORMAL_SETS';
  const tbt =
    prev.tieBreakType ||
    prev.tie_break_type ||
    tournamentData?.tieBreakType ||
    'STB';

  const fmtUp = String(tf || '').toUpperCase();
  const isOneSet = ['ONE_SET_6', 'ONE_SET_9'].includes(fmtUp);
  const isBest3NoStb = ['THREE_SETS', 'BEST_OF_3', '3SETS'].includes(fmtUp);
  // Sin --2-0: preferir cierre 2-1 + STB para formatos de “dos sets a 6” (no un set, no BO3 a sets completos).
  const stbDecider = !isOneSet && !isBest3NoStb;

  const base = {
    ...prev,
    status: 'FINISHED',
    finishedAt: nowIso,
    actualEndTime: nowIso,
    matchFormat: tf,
    tieBreakType: tbt,
    games: { t1: 0, t2: 0 },
    points: { t1: '0', t2: '0' },
    superTiebreak: false,
    isTiebreak: false,
  };

  if (isOneSet) {
    if (fmtUp === 'ONE_SET_9') {
      return {
        ...base,
        sets: { t1: 1, t2: 0 },
        superTiebreakScore: null,
        setScores: [{ t1: 9, t2: 7 }],
        score: '1-0 (9-7)',
      };
    }
    return {
      ...base,
      sets: { t1: 1, t2: 0 },
      superTiebreakScore: null,
      setScores: [{ t1: 6, t2: 4 }],
      score: '1-0 (6-4)',
    };
  }

  if (straightWin || !stbDecider) {
    return {
      ...base,
      sets: { t1: 2, t2: 0 },
      superTiebreakScore: null,
      setScores: [{ t1: 6, t2: 4 }, { t1: 6, t2: 3 }],
      score: '2-0 (6-4, 6-3)',
    };
  }

  // 1-1 en sets a 6 juegos → super tie-break a 10 (equipo 1 gana 10-6)
  return {
    ...base,
    sets: { t1: 2, t2: 1 },
    superTiebreakScore: { t1: 10, t2: 6 },
    setScores: [{ t1: 6, t2: 4 }, { t1: 4, t2: 6 }],
    score: '2-1 (6-4, 4-6, STB 10-6)',
  };
}

async function resolveTournamentId(argName) {
  const { data: rows, error } = await supabase.from('tournaments').select('id, data');
  if (error) throw error;
  const q = argName.toLowerCase();
  const found = (rows || []).find((r) => {
    const name = r.data?.name ? String(r.data.name).toLowerCase() : '';
    return name.includes(q) || q.includes(name);
  });
  if (!found) {
    console.error(`${TAG} No hay torneo cuyo nombre contenga "${argName}".`);
    console.log('IDs disponibles (primeros 10):', (rows || []).slice(0, 10).map((r) => `${r.id} → ${r.data?.name || '(sin nombre)'}`).join('\n'));
    process.exit(1);
  }
  return found.id;
}

async function main() {
  const raw = process.argv.slice(2).filter((a) => a !== '--');
  const straightWin = raw.includes('--2-0') || raw.includes('--straight');
  const force = raw.includes('--force');
  const argv = raw.filter((a) => a !== '--2-0' && a !== '--straight' && a !== '--force');

  let tournamentId;
  let matchId;
  let orderFilter = null;

  if (argv[0] === '--name' && argv[1]) {
    tournamentId = await resolveTournamentId(argv[1]);
    const rest = argv.slice(2).filter((x) => x !== '--2-0' && x !== '--straight' && x !== '--force');
    if (rest[0] === '--order' && rest[1]) {
      orderFilter = parseInt(rest[1], 10);
      if (!Number.isFinite(orderFilter) || orderFilter < 1) {
        console.error(`${TAG} --order debe ser un entero ≥ 1`);
        process.exit(1);
      }
    } else {
      matchId = rest[0] && !rest[0].startsWith('--') ? rest[0] : null;
    }
  } else if (argv[0]) {
    tournamentId = argv[0];
    if (argv[1] === '--order' && argv[2]) {
      orderFilter = parseInt(argv[2], 10);
      if (!Number.isFinite(orderFilter) || orderFilter < 1) {
        console.error(`${TAG} --order debe ser un entero ≥ 1`);
        process.exit(1);
      }
    } else {
      matchId = argv[1] && !argv[1].startsWith('--') ? argv[1] : null;
    }
  } else {
    console.log(`
${TAG}

Marca un partido como finalizado (aparece en Finalizados del hub).

  npm run exercise:finish-match -- <tournament_uuid>
  npm run exercise:finish-match -- <tournament_uuid> <match_uuid>
  npm run exercise:finish-match -- <tournament_uuid> --order 4
  npm run exercise:finish-match -- <tournament_uuid> --2-0
  npm run exercise:finish-match -- --name "Texto del nombre del torneo"
  npm run exercise:finish-match -- --name "Texto" <match_uuid_opcional>
  npm run exercise:finish-match -- --name "Texto" --order 4
  npm run exercise:finish-match -- --name "Texto" --order 4 --2-0 --force

  --2-0 / --straight  → 2-0 en dos sets a 6 (sin super tie-break).
  --force             → vuelve a escribir el JSON del partido aunque ya esté finalizado.
  Sin flag (formato dos sets, no BO3) → 2-1 con STB 10-6.
`);
    process.exit(0);
  }

  const { data: tRow } = await supabase.from('tournaments').select('data').eq('id', tournamentId).maybeSingle();

  const { data: matchRows, error: mErr } = await supabase
    .from('tournament_matches')
    .select('id, data')
    .eq('tournament_id', tournamentId);

  if (mErr) {
    console.error(`${TAG} Error leyendo partidos:`, mErr.message);
    process.exit(1);
  }

  if (!matchRows?.length) {
    console.error(`${TAG} No hay partidos para tournament_id=${tournamentId}`);
    process.exit(1);
  }

  let row;
  if (orderFilter != null) {
    const candidates = matchRows.filter((r) => orderOfMatchRow(r) === orderFilter);
    if (!candidates.length) {
      console.error(`${TAG} No hay partido con orden/número ${orderFilter} en ese torneo.`);
      matchRows.forEach((r) => console.log(`  ${r.id}  order=${orderOfMatchRow(r)}  status=${r.data?.status}`));
      process.exit(1);
    }
    row =
      candidates.find((r) => !isFinishedLike(r.data)) ||
      candidates[candidates.length - 1];
  } else if (matchId) {
    row = matchRows.find((r) => r.id === matchId);
    if (!row) {
      console.error(`${TAG} No existe match_id=${matchId} en ese torneo.`);
      process.exit(1);
    }
  } else {
    row = matchRows.find((r) => !isFinishedLike(r.data));
    if (!row) {
      console.log(`${TAG} Todos los partidos ya están finalizados. Elige uno por UUID:`);
      matchRows.forEach((r) => console.log(`  ${r.id}  status=${r.data?.status}`));
      process.exit(0);
    }
  }

  if (isFinishedLike(row.data) && !force) {
    console.log(
      `${TAG} El partido ${row.id} ya está finalizado (status=${row.data?.status}). Nada que hacer. Añade --force para sobrescribir.`,
    );
    process.exit(0);
  }

  const nowIso = new Date().toISOString();
  const prev = row.data || {};
  const merged = buildFinishedPayload(prev, tRow?.data || {}, nowIso, straightWin);

  const { error: upErr } = await supabase
    .from('tournament_matches')
    .update({ data: merged, updated_at: nowIso })
    .eq('tournament_id', tournamentId)
    .eq('id', row.id);

  if (upErr) {
    console.error(`${TAG} Error al actualizar:`, upErr.message);
    process.exit(1);
  }

  console.log(`
${TAG} Listo${force ? ' (--force: sobrescrito)' : ''}.
  Torneo:  ${tournamentId}
  Partido: ${row.id}
  Resumen: ${merged.score}
  sets: ${JSON.stringify(merged.sets)} | setScores: ${JSON.stringify(merged.setScores)}${
    merged.superTiebreakScore ? ` | STB: ${JSON.stringify(merged.superTiebreakScore)}` : ''
  }

Abre el hub del torneo → pestaña "Finalizados" y deberías ver este partido.
`);
}

main().catch((e) => {
  console.error(TAG, e);
  process.exit(1);
});
