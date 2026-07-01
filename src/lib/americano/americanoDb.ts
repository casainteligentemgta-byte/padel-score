import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AmericanoMatch,
  AmericanoPlayer,
  AmericanoSession,
} from '@/lib/americano/logic';
import type { AmericanoPointsGoal } from '@/types/americano';

type SessionRow = {
  id: string;
  name: string;
  base_venue: string;
  court_count: number;
  points_goal: number;
  status: string;
  created_at?: string;
  updated_at?: string;
};

type PlayerRow = {
  id: string;
  session_id: string;
  name: string;
  total_points: number;
  sort_order: number;
};

type MatchRow = {
  id: string;
  session_id: string;
  round_number: number;
  court_number: number;
  player_a1_id: string;
  player_a2_id: string;
  player_b1_id: string;
  player_b2_id: string;
  score_a: number;
  score_b: number;
  points_goal: number;
  status: string;
};

export function mapSession(row: SessionRow): AmericanoSession {
  return {
    id: row.id,
    name: row.name,
    baseVenue: row.base_venue,
    courtCount: row.court_count,
    pointsGoal: row.points_goal as AmericanoPointsGoal,
    status: row.status as AmericanoSession['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPlayer(row: PlayerRow): AmericanoPlayer {
  return {
    id: row.id,
    sessionId: row.session_id,
    name: row.name,
    totalPoints: row.total_points,
    sortOrder: row.sort_order,
  };
}

export function mapMatch(row: MatchRow): AmericanoMatch {
  return {
    id: row.id,
    sessionId: row.session_id,
    roundNumber: row.round_number,
    courtNumber: row.court_number,
    playerA1Id: row.player_a1_id,
    playerA2Id: row.player_a2_id,
    playerB1Id: row.player_b1_id,
    playerB2Id: row.player_b2_id,
    scoreA: row.score_a,
    scoreB: row.score_b,
    pointsGoal: row.points_goal as AmericanoPointsGoal,
    status: row.status as AmericanoMatch['status'],
  };
}

export type AmericanoBundle = {
  session: AmericanoSession;
  players: AmericanoPlayer[];
  matches: AmericanoMatch[];
};

export async function fetchAmericanoBundle(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<AmericanoBundle | null> {
  const [sessionRes, playersRes, matchesRes] = await Promise.all([
    supabase.from('americano_sessions').select('*').eq('id', sessionId).maybeSingle(),
    supabase
      .from('americano_players')
      .select('*')
      .eq('session_id', sessionId)
      .order('sort_order', { ascending: true }),
    supabase
      .from('americano_matches')
      .select('*')
      .eq('session_id', sessionId)
      .order('round_number', { ascending: true })
      .order('court_number', { ascending: true }),
  ]);

  if (sessionRes.error || !sessionRes.data) return null;
  if (playersRes.error || matchesRes.error) return null;

  return {
    session: mapSession(sessionRes.data as SessionRow),
    players: (playersRes.data as PlayerRow[]).map(mapPlayer),
    matches: (matchesRes.data as MatchRow[]).map(mapMatch),
  };
}
