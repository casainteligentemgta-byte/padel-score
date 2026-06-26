import {
  EXPRESS_SET_SLOTS,
  type ExpressMatch,
  type ExpressPoint,
} from '@/types/expressMatch';

const REGULAR_POINTS: ExpressPoint[] = ['0', '15', '30', '40', 'AD'];

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

function winsTiebreakPoints(pts: number, rivalPts: number): boolean {
  return pts >= 7 && pts - rivalPts >= 2;
}

/** Campos mutables para UPDATE en Supabase (sin id, created_at, cancha_code). */
export function pickScorePatch(state: ExpressMatch): Partial<ExpressMatch> {
  return {
    session_id: state.session_id,
    team_a_name: state.team_a_name,
    team_b_name: state.team_b_name,
    team_a_avatar: state.team_a_avatar,
    team_b_avatar: state.team_b_avatar,
    team_a_points: state.team_a_points,
    team_b_points: state.team_b_points,
    team_a_games: state.team_a_games,
    team_b_games: state.team_b_games,
    sets_a: state.sets_a,
    sets_b: state.sets_b,
    current_set: state.current_set,
    modo_puntos: state.modo_puntos,
    punto_de_oro: state.punto_de_oro,
    is_active: state.is_active,
  };
}

/** Reset de marcador + nueva sesión (TV vuelve a QR). */
export function buildExpressSessionReset(sessionId: string): Partial<ExpressMatch> {
  return {
    session_id: sessionId,
    team_a_name: 'EQUIPO A',
    team_b_name: 'EQUIPO B',
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
    is_active: false,
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

  const state = cloneMatch(currentState);
  normalizeSets(state);

  const rival = team === 'a' ? 'b' : 'a';
  const pointsKey = teamPointsKey(team);
  const rivalPointsKey = teamPointsKey(rival);
  const gamesKey = teamGamesKey(team);
  const rivalGamesKey = teamGamesKey(rival);

  if (action === 'decrement') {
    if (state.modo_puntos === 'tiebreak') {
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

  if (state.modo_puntos === 'tiebreak') {
    const pts = (parseInt(String(currentPts), 10) || 0) + 1;
    const rPts = parseInt(String(rivalPts), 10) || 0;
    state[pointsKey] = pts.toString();
    if (winsTiebreakPoints(pts, rPts)) {
      wonGame = true;
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

  if (wonGame) {
    state[gamesKey] += 1;
    state.team_a_points = '0';
    state.team_b_points = '0';
    state.modo_puntos = 'normal';

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
        state.team_a_games = 0;
        state.team_b_games = 0;
      }
    }
  }

  return pickScorePatch(state);
}
