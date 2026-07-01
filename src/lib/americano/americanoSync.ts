import type { SupabaseClient } from '@supabase/supabase-js';
import { MatchStatus } from '@/types/tournament';

export type SyncedAmericanoStanding = {
  playerId: string;
  name: string;
  totalPoints: number;
  rank: number;
};

export async function syncAmericanoSessionToTournament(
  supabase: SupabaseClient,
  sessionId: string,
  tournamentId: string,
): Promise<SyncedAmericanoStanding[]> {
  const [{ data: session }, { data: players }, { data: amMatches }, { data: tmRows }, { data: tRow }] =
    await Promise.all([
      supabase.from('americano_sessions').select('*').eq('id', sessionId).maybeSingle(),
      supabase
        .from('americano_players')
        .select('id, name, total_points, sort_order')
        .eq('session_id', sessionId)
        .order('total_points', { ascending: false })
        .order('sort_order', { ascending: true }),
      supabase
        .from('americano_matches')
        .select('*')
        .eq('session_id', sessionId)
        .eq('status', 'finished'),
      supabase.from('tournament_matches').select('id, data').eq('tournament_id', tournamentId),
      supabase.from('tournaments').select('data').eq('id', tournamentId).maybeSingle(),
    ]);

  if (!session || !tRow) return [];

  const standings: SyncedAmericanoStanding[] = (players ?? []).map((p, idx) => ({
    playerId: p.id as string,
    name: p.name as string,
    totalPoints: p.total_points as number,
    rank: idx + 1,
  }));

  const tournamentData = (tRow.data ?? {}) as Record<string, any>;
  const nextData = {
    ...tournamentData,
    americanoSessionId: sessionId,
    americanoStandings: standings,
    americanoFinishedAt: new Date().toISOString(),
    status: tournamentData.status === 'Programado' ? 'Finalizado' : tournamentData.status,
  };

  await supabase
    .from('tournaments')
    .update({ data: nextData, updated_at: new Date().toISOString() })
    .eq('id', tournamentId);

  const tournamentMatches = tmRows ?? [];
  for (const am of amMatches ?? []) {
    const round = am.round_number as number;
    const court = am.court_number as number;
    const target = tournamentMatches.find((tm) => {
      const d = (tm.data ?? {}) as Record<string, any>;
      const sameRound = Number(d.roundNumber) === round;
      const courtIdx = Number(d.courtIndex ?? d.court ?? 0);
      const sameCourt = courtIdx + 1 === court || courtIdx === court;
      return (
        (d.format === 'AMERICANO_ROTATIVE' || d.stage === 'AMERICANO') && sameRound && sameCourt
      );
    });

    if (!target) continue;

    const prev = (target.data ?? {}) as Record<string, any>;
    const merged = {
      ...prev,
      status: MatchStatus.FINISHED,
      games: { t1: am.score_a, t2: am.score_b },
      scoreA: am.score_a,
      scoreB: am.score_b,
    };

    await supabase
      .from('tournament_matches')
      .update({ data: merged, updated_at: new Date().toISOString() })
      .eq('id', target.id);
  }

  return standings;
}
