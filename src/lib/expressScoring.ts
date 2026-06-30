import {
  emptyExpressPlayerFields,
  syncExpressTeamNameFields,
} from '@/lib/expressPlayerNames';
import {
  isExpressThirdSetDeciderMode,
  normalizeExpressThirdSetMode,
} from '@/lib/expressThirdSetMode';
import {
  expressServerAfterGameWon,
  expressServerAfterTiebreakPoint,
  EXPRESS_SERVER_DEFAULT,
  normalizeExpressServer,
} from '@/lib/expressServer';
import { winsTiebreakPoints } from '@/lib/matchScoringRules';
import { normalizeExpressPoint } from '@/lib/expressPoints';
import { EXPRESS_SIDE_CHANGE_MS, EXPRESS_WARMUP_MS } from '@/lib/expressSessionMeta';
import {
  EXPRESS_SET_SLOTS,
  type ExpressMatch,
  type ExpressPoint,
} from '@/types/expressMatch';

const REGULAR_POINTS: ExpressPoint[] = ['0', '15', '30', '40', 'AD'];

function normalizeExpressPoints(state: ExpressMatch): void {
  state.team_a_points = normalizeExpressPoint(state.team_a_points);
  state.team_b_points = normalizeExpressPoint(state.team_b_points);
}

function cloneMatch(state: ExpressMatch): ExpressMatch {
  return JSON.parse(JSON.stringify(state)) as ExpressMatch;
}

function normalizeSets(state: ExpressMatch): void {
  if (!state.sets_a || state.sets_a.length !== EXPRESS_SET_SLOTS) {
    state.sets_a = [0, 0, 0];
  }
  if (!state.sets_b || state.sets_b.length !== EXPRESS_SET_SLOTS) {
    state.sets_b = [0, 0, 0];
  }
}

function teamPointsKey(team: 'a' | 'b'): 'team_a_points' | 'team_b_points' {
  return team === 'a' ? 'team_a_points' : 'team_b_points';
}

function teamGamesKey(team: 'a' | 'b'): 'team_a_games' | 'team_b_games' {
  return team === 'a' ? 'team_a_games' : 'team_b_games';
}

function nextRegularPoint(current: ExpressPoint | string): ExpressPoint | null {
  const idx = REGULAR_POINTS.indexOf(current as ExpressPoint);
  if (idx < 0 || idx >= REGULAR_POINTS.length - 1) return null;
  return REGULAR_POINTS[idx + 1];
}

function prevRegularPoint(current: ExpressPoint | string): ExpressPoint | null {
  const idx = REGULAR_POINTS.indexOf(current as ExpressPoint);
  if (idx <= 0) return null;
  return REGULAR_POINTS[idx - 1];
}

function isNumericScoreMode(state: ExpressMatch): boolean {
  return state.modo_puntos === 'tiebreak' || state.modo_puntos === 'super_tiebreak';
}

function tiebreakTarget(state: ExpressMatch): number {
  return state.modo_puntos === 'super_tiebreak' ? 10 : 7;
}

function isThirdSetDeciderPlay(state: ExpressMatch): boolean {
  if (state.current_set !== 3) return false;
  return isExpressThirdSetDeciderMode(normalizeExpressThirdSetMode(state.third_set_mode));
}

function applyThirdSetEntry(state: ExpressMatch): void {
  const mode = normalizeExpressThirdSetMode(state.third_set_mode);
  state.team_a_games = 0;
  state.team_b_games = 0;
  state.team_a_points = '0';
  state.team_b_points = '0';

  if (mode === 'tiebreak') {
    state.modo_puntos = 'tiebreak';
  } else if (mode === 'super') {
    state.modo_puntos = 'super_tiebreak';
  } else {
    state.modo_puntos = 'normal';
  }
}

/** Solo marcador: evita pisar nombres u otros campos en cada punto. */
export function pickExpressScorePatch(state: ExpressMatch): Partial<ExpressMatch> {
  return {
    team_a_points: state.team_a_points,
    team_b_points: state.team_b_points,
    team_a_games: state.team_a_games,
    team_b_games: state.team_b_games,
    sets_a: state.sets_a,
    sets_b: state.sets_b,
    current_set: state.current_set,
    modo_puntos: state.modo_puntos,
    is_active: state.is_active,
    server_team: state.server_team,
    server_player: state.server_player,
    warmup_ends_at: state.warmup_ends_at ?? null,
    match_started_at: state.match_started_at ?? null,
    chrono_elapsed_sec: state.chrono_elapsed_sec ?? 0,
    match_ended_at: state.match_ended_at ?? null,
    side_change_until: state.side_change_until ?? null,
  };
}

/** Campos mutables para UPDATE en Supabase (sin id, created_at, cancha_code). */
export function pickScorePatch(state: ExpressMatch): Partial<ExpressMatch> {
  return {
    ...pickExpressScorePatch(state),
    ...syncExpressTeamNameFields(state),
    team_a_p1_first: state.team_a_p1_first,
    team_a_p1_last: state.team_a_p1_last,
    team_a_p2_first: state.team_a_p2_first,
    team_a_p2_last: state.team_a_p2_last,
    team_b_p1_first: state.team_b_p1_first,
    team_b_p1_last: state.team_b_p1_last,
    team_b_p2_first: state.team_b_p2_first,
    team_b_p2_last: state.team_b_p2_last,
    team_a_avatar: state.team_a_avatar,
    team_b_avatar: state.team_b_avatar,
    third_set_mode: normalizeExpressThirdSetMode(state.third_set_mode),
    punto_de_oro: state.punto_de_oro,
  };
}

/** Reset de marcador + nueva sesión (TV vuelve a QR). */
export function buildExpressSessionReset(sessionId: string): Partial<ExpressMatch> {
  return {
    session_id: sessionId,
    ...emptyExpressPlayerFields(),
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
    third_set_mode: 'full',
    is_active: false,
    qr_expires_at: null,
    server_team: EXPRESS_SERVER_DEFAULT.team,
    server_player: EXPRESS_SERVER_DEFAULT.player,
    warmup_ends_at: null,
    match_started_at: null,
    chrono_elapsed_sec: 0,
    match_ended_at: null,
    side_change_until: null,
  };
}

/** Inicia el cronómetro del partido (sin calentamiento). */
export function buildExpressStartMatch(): Partial<ExpressMatch> {
  return {
    warmup_ends_at: null,
    match_started_at: new Date().toISOString(),
  };
}

/** Calentamiento de 5 min antes de iniciar el cronómetro. */
export function buildExpressStartWarmup(): Partial<ExpressMatch> {
  return {
    warmup_ends_at: new Date(Date.now() + EXPRESS_WARMUP_MS).toISOString(),
    match_started_at: null,
  };
}

/** Nuevo partido en la misma sesión (mantiene nombres y ajustes de TV). */
export function buildExpressNewMatch(
  current: ExpressMatch,
  opts?: { withWarmup?: boolean },
): Partial<ExpressMatch> {
  const now = Date.now();
  const withWarmup = opts?.withWarmup === true;
  return {
    session_id: current.session_id,
    team_a_points: '0',
    team_b_points: '0',
    team_a_games: 0,
    team_b_games: 0,
    sets_a: [0, 0, 0],
    sets_b: [0, 0, 0],
    current_set: 1,
    modo_puntos: 'normal',
    third_set_mode: normalizeExpressThirdSetMode(current.third_set_mode),
    is_active: true,
    match_ended_at: null,
    chrono_elapsed_sec: 0,
    side_change_until: null,
    server_team: EXPRESS_SERVER_DEFAULT.team,
    server_player: EXPRESS_SERVER_DEFAULT.player,
    warmup_ends_at: withWarmup ? new Date(now + EXPRESS_WARMUP_MS).toISOString() : null,
    match_started_at: withWarmup ? null : new Date(now).toISOString(),
  };
}

export function calculateNextState(
  currentState: ExpressMatch,
  team: 'a' | 'b',
  action: 'increment' | 'decrement',
): Partial<ExpressMatch> {
  if (!currentState.is_active && action === 'increment') {
    return {};
  }

  if (currentState.warmup_ends_at) {
    const warmupEnd = new Date(currentState.warmup_ends_at).getTime();
    if (Number.isFinite(warmupEnd) && warmupEnd > Date.now()) {
      return {};
    }
  }

  const state = cloneMatch(currentState);
  normalizeSets(state);
  normalizeExpressPoints(state);
  const server = normalizeExpressServer(state.server_team, state.server_player);
  state.server_team = server.team;
  state.server_player = server.player;

  const rival = team === 'a' ? 'b' : 'a';
  const pointsKey = teamPointsKey(team);
  const rivalPointsKey = teamPointsKey(rival);
  const gamesKey = teamGamesKey(team);
  const rivalGamesKey = teamGamesKey(rival);

  if (action === 'decrement') {
    if (isNumericScoreMode(state)) {
      const currentPts = parseInt(String(state[pointsKey]), 10) || 0;
      state[pointsKey] = Math.max(0, currentPts - 1).toString();
    } else {
      const prev = prevRegularPoint(state[pointsKey]);
      if (prev) state[pointsKey] = prev;
    }
    return pickScorePatch(state);
  }

  const currentPts = state[pointsKey];
  const rivalPts = state[rivalPointsKey];
  let wonGame = false;
  let wonSetDirect = false;

  if (isNumericScoreMode(state)) {
    const target = tiebreakTarget(state);
    const pts = (parseInt(String(currentPts), 10) || 0) + 1;
    const rPts = parseInt(String(rivalPts), 10) || 0;
    state[pointsKey] = pts.toString();

    const totalPoints = pts + rPts;
    const nextServer = expressServerAfterTiebreakPoint(totalPoints, server);
    state.server_team = nextServer.team;
    state.server_player = nextServer.player;

    if (winsTiebreakPoints(pts, rPts, target)) {
      if (isThirdSetDeciderPlay(state)) {
        const setIdx = 2;
        state.sets_a[setIdx] = team === 'a' ? pts : rPts;
        state.sets_b[setIdx] = team === 'b' ? pts : rPts;
        state.team_a_points = String(team === 'a' ? pts : rPts);
        state.team_b_points = String(team === 'b' ? pts : rPts);
        wonSetDirect = true;
      } else {
        wonGame = true;
      }
    }
  } else if (state.punto_de_oro) {
    if (currentPts === '40') {
      wonGame = true;
    } else {
      const next = nextRegularPoint(currentPts);
      if (next) state[pointsKey] = next;
    }
  } else {
    if (currentPts === '40' && rivalPts === '40') {
      state[pointsKey] = 'AD';
    } else if (currentPts === '40' && rivalPts === 'AD') {
      state.team_a_points = '40';
      state.team_b_points = '40';
    } else if (
      currentPts === 'AD' ||
      (currentPts === '40' && rivalPts !== '40' && rivalPts !== 'AD')
    ) {
      wonGame = true;
    } else {
      const next = nextRegularPoint(currentPts);
      if (next) state[pointsKey] = next;
    }
  }

  if (wonSetDirect) {
    state.is_active = false;
    return pickScorePatch(state);
  }

  if (wonGame) {
    state[gamesKey] += 1;
    state.team_a_points = '0';
    state.team_b_points = '0';
    state.modo_puntos = 'normal';

    const totalGames = state.team_a_games + state.team_b_games;
    const nextServer = expressServerAfterGameWon(totalGames);
    state.server_team = nextServer.team;
    state.server_player = nextServer.player;

    if (totalGames % 2 === 1) {
      state.side_change_until = new Date(Date.now() + EXPRESS_SIDE_CHANGE_MS).toISOString();
    }

    const tGames = state[gamesKey];
    const rGames = state[rivalGamesKey];
    let wonSet = false;

    if (tGames === 6 && rGames === 6) {
      state.modo_puntos = 'tiebreak';
    } else if (tGames === 7 && rGames === 6) {
      wonSet = true;
    } else if (tGames >= 6 && tGames - rGames >= 2) {
      wonSet = true;
    }

    if (wonSet) {
      const setIdx = state.current_set - 1;
      if (setIdx >= 0 && setIdx < EXPRESS_SET_SLOTS) {
        state.sets_a[setIdx] = state.team_a_games;
        state.sets_b[setIdx] = state.team_b_games;
      }

      let setsWonA = 0;
      let setsWonB = 0;
      for (let i = 0; i <= setIdx; i++) {
        if (state.sets_a[i] > state.sets_b[i]) setsWonA++;
        else if (state.sets_b[i] > state.sets_a[i]) setsWonB++;
      }

      if (setsWonA === 2 || setsWonB === 2) {
        state.is_active = false;
      } else {
        state.current_set = Math.min(EXPRESS_SET_SLOTS, state.current_set + 1);
        if (state.current_set === 3) {
          applyThirdSetEntry(state);
        } else {
          state.team_a_games = 0;
          state.team_b_games = 0;
          state.modo_puntos = 'normal';
        }
      }
    }
  }

  return pickScorePatch(state);
}
