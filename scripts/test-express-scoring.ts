import assert from 'node:assert/strict';
import {
  buildExpressNewMatch,
  calculateNextState,
  pickExpressScorePatch,
} from '../src/lib/expressScoring';
import {
  expressMatchEndedSummary,
  expressMatchWinner,
  EXPRESS_SIDE_CHANGE_MS,
} from '../src/lib/expressSessionMeta';
import type { ExpressMatch } from '../src/types/expressMatch';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`OK  ${name}`);
  } catch (e) {
    console.error(`ERR ${name}`);
    throw e;
  }
}

function baseMatch(overrides: Partial<ExpressMatch> = {}): ExpressMatch {
  return {
    id: 'id-1',
    cancha_code: 'fast-1',
    session_id: 'sess-1',
    team_a_name: 'EQUIPO A',
    team_b_name: 'EQUIPO B',
    team_a_p1_first: 'Ana',
    team_a_p1_last: 'A',
    team_a_p2_first: 'Luis',
    team_a_p2_last: 'A',
    team_b_p1_first: 'Bea',
    team_b_p1_last: 'B',
    team_b_p2_first: 'Carlos',
    team_b_p2_last: 'B',
    team_a_avatar: null,
    team_b_avatar: null,
    team_a_points: '0',
    team_b_points: '0',
    team_a_games: 0,
    team_b_games: 0,
    sets_a: [0, 0, 0],
    sets_b: [0, 0, 0],
    current_set: 1,
    modo_puntos: 'normal',
    punto_de_oro: true,
    third_set_mode: 'full',
    is_active: true,
    base_venue: 'club',
    display_name_scale: 1,
    display_media_scale: 1,
    qr_expires_at: null,
    display_ticker_phrases: [],
    server_team: 1,
    server_player: 1,
    warmup_ends_at: null,
    match_started_at: null,
    chrono_elapsed_sec: 0,
    match_ended_at: null,
    side_change_until: null,
    created_at: '',
    updated_at: '',
    ...overrides,
  };
}

run('punto de oro: 40 gana juego', () => {
  const s = baseMatch({ team_a_points: '40', team_b_points: '30' });
  const patch = calculateNextState(s, 'a', 'increment');
  assert.equal(patch.team_a_games, 1);
  assert.equal(patch.team_a_points, '0');
});

run('cambio de lado tras juego impar', () => {
  const before = Date.now();
  const s = baseMatch({ team_a_points: '40', team_b_points: '30' });
  const patch = calculateNextState(s, 'a', 'increment');
  assert.ok(patch.side_change_until);
  const until = new Date(String(patch.side_change_until)).getTime();
  assert.ok(until - before >= EXPRESS_SIDE_CHANGE_MS - 50);
});

run('no marca puntos durante calentamiento', () => {
  const future = new Date(Date.now() + 60_000).toISOString();
  const s = baseMatch({ warmup_ends_at: future });
  const patch = calculateNextState(s, 'a', 'increment');
  assert.deepEqual(patch, {});
});

run('2 sets a 6-0 finaliza partido', () => {
  let s = baseMatch();
  for (let set = 0; set < 2; set++) {
    for (let g = 0; g < 6; g++) {
      s = { ...s, team_a_points: '40', team_b_points: '0', punto_de_oro: true } as ExpressMatch;
      const patch = calculateNextState(s, 'a', 'increment');
      s = { ...s, ...patch } as ExpressMatch;
    }
  }
  assert.equal(s.is_active, false);
  assert.equal(expressMatchWinner(s), 'a');
});

run('buildExpressNewMatch mantiene session y nombres', () => {
  const ended = baseMatch({
    is_active: false,
    match_ended_at: new Date().toISOString(),
    sets_a: [6, 6, 0],
    sets_b: [0, 4, 0],
    team_a_p1_first: 'Pepe',
  });
  const reset = buildExpressNewMatch(ended, { withWarmup: true });
  assert.equal(reset.session_id, ended.session_id);
  assert.equal(reset.is_active, true);
  assert.ok(reset.warmup_ends_at);
  assert.equal(reset.match_started_at, null);
  assert.deepEqual(reset.sets_a, [0, 0, 0]);
});

run('expressMatchEndedSummary requiere ganador', () => {
  const ended = baseMatch({
    is_active: false,
    match_ended_at: new Date().toISOString(),
    sets_a: [6, 6, 0],
    sets_b: [0, 4, 0],
  });
  assert.equal(expressMatchEndedSummary(ended), true);
  const idle = baseMatch({ is_active: false, match_ended_at: null });
  assert.equal(expressMatchEndedSummary(idle), false);
});

run('pickExpressScorePatch incluye meta de sesión', () => {
  const s = baseMatch({
    side_change_until: new Date().toISOString(),
    chrono_elapsed_sec: 120,
  });
  const patch = pickExpressScorePatch(s);
  assert.equal(patch.chrono_elapsed_sec, 120);
  assert.ok(patch.side_change_until);
});

console.log('\nTodos los tests express scoring pasaron.');
