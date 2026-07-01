'use server';

import { revalidatePath } from 'next/cache';
import {
  generateRotativeRotation,
  pointsDeltaForMatch,
  validateMatchScores,
  type AmericanoMatch,
} from '@/lib/americano/logic';
import {
  flattenPlayersFromTeams,
  normalizeAmericanoPointsGoal,
} from '@/lib/americano/tournamentBridge';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { TournamentType } from '@/types/tournament';
import type { AmericanoPointsGoal } from '@/types/americano';

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

async function insertAmericanoSessionCore(input: {
  name: string;
  baseVenue: string;
  courtCount: number;
  pointsGoal: AmericanoPointsGoal;
  playerNames: string[];
  tournamentId?: string | null;
}): Promise<ActionResult<{ sessionId: string }>> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return { ok: false, error: 'Servidor sin SUPABASE_SERVICE_ROLE_KEY.' };
  }

  const name = String(input.name || '').trim() || 'Americano';
  const baseVenue = String(input.baseVenue || '').trim();
  const courtCount = Math.min(12, Math.max(1, Number(input.courtCount) || 1));
  const pointsGoal = input.pointsGoal;
  const playerNames = input.playerNames.map((n) => String(n || '').trim()).filter(Boolean);

  if (playerNames.length < 4) {
    return { ok: false, error: 'Mínimo 4 jugadores con nombre.' };
  }

  const { data: sessionRow, error: sessionErr } = await supabase
    .from('americano_sessions')
    .insert({
      name,
      base_venue: baseVenue,
      court_count: courtCount,
      points_goal: pointsGoal,
      status: 'live',
      tournament_id: input.tournamentId ?? null,
    })
    .select('id')
    .single();

  if (sessionErr || !sessionRow) {
    return { ok: false, error: sessionErr?.message ?? 'No se pudo crear la sesión.' };
  }

  const sessionId = sessionRow.id as string;

  const { data: playerRows, error: playersErr } = await supabase
    .from('americano_players')
    .insert(
      playerNames.map((playerName, idx) => ({
        session_id: sessionId,
        name: playerName,
        sort_order: idx,
      })),
    )
    .select('id, name, sort_order');

  if (playersErr || !playerRows?.length) {
    await supabase.from('americano_sessions').delete().eq('id', sessionId);
    return { ok: false, error: playersErr?.message ?? 'No se pudieron crear los jugadores.' };
  }

  const rotativePlayers = playerRows.map((p) => ({
    id: p.id as string,
    name: p.name as string,
  }));

  const rotation = generateRotativeRotation(rotativePlayers, courtCount, pointsGoal);
  const matchInserts = rotation.rounds.flatMap((round) =>
    round.matches.map((m) => ({
      session_id: sessionId,
      round_number: round.roundNumber,
      court_number: m.courtNumber,
      player_a1_id: m.playerA1Id,
      player_a2_id: m.playerA2Id,
      player_b1_id: m.playerB1Id,
      player_b2_id: m.playerB2Id,
      points_goal: m.pointsGoal,
      status: 'pending',
    })),
  );

  if (matchInserts.length === 0) {
    await supabase.from('americano_sessions').delete().eq('id', sessionId);
    return { ok: false, error: 'No se generaron partidos. Revisa jugadores y canchas.' };
  }

  const { error: matchesErr } = await supabase.from('americano_matches').insert(matchInserts);
  if (matchesErr) {
    await supabase.from('americano_sessions').delete().eq('id', sessionId);
    return { ok: false, error: matchesErr.message };
  }

  return { ok: true, data: { sessionId } };
}

export async function createAmericanoSession(input: {
  name: string;
  baseVenue: string;
  courtCount: number;
  pointsGoal: AmericanoPointsGoal;
  playerNames: string[];
}): Promise<ActionResult<{ sessionId: string }>> {
  const result = await insertAmericanoSessionCore(input);
  if (result.ok) {
    revalidatePath('/americano');
    revalidatePath(`/americano/session/${result.data.sessionId}`);
    revalidatePath(`/americano/tv/${result.data.sessionId}`);
  }
  return result;
}

export async function createAmericanoSessionFromTournament(input: {
  tournamentId: string;
}): Promise<ActionResult<{ sessionId: string }>> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return { ok: false, error: 'Servidor sin SUPABASE_SERVICE_ROLE_KEY.' };
  }

  const tournamentId = String(input.tournamentId || '').trim();
  if (!tournamentId) {
    return { ok: false, error: 'Torneo no indicado.' };
  }

  const { data: existing } = await supabase
    .from('americano_sessions')
    .select('id, status')
    .eq('tournament_id', tournamentId)
    .neq('status', 'finished')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    return { ok: true, data: { sessionId: existing.id as string } };
  }

  const { data: tournamentRow, error: tournamentErr } = await supabase
    .from('tournaments')
    .select('id, data')
    .eq('id', tournamentId)
    .maybeSingle();

  if (tournamentErr || !tournamentRow) {
    return { ok: false, error: tournamentErr?.message ?? 'Torneo no encontrado.' };
  }

  const tournament = (tournamentRow.data ?? {}) as Record<string, any>;
  if (tournament.type !== TournamentType.AMERICANO_INDIVIDUAL) {
    return { ok: false, error: 'Este torneo no es americano individual.' };
  }

  const players = flattenPlayersFromTeams(tournament.teams ?? []);
  if (players.length < 4) {
    return { ok: false, error: 'El torneo necesita al menos 4 jugadores inscritos.' };
  }

  const result = await insertAmericanoSessionCore({
    name: String(tournament.name || 'Americano'),
    baseVenue: String(tournament.complexName || ''),
    courtCount: Math.max(1, Number(tournament.totalCourts) || (tournament.courtNames?.length ?? 2)),
    pointsGoal: normalizeAmericanoPointsGoal(tournament.pointsGoal ?? 24),
    playerNames: players.map((p) => p.name),
    tournamentId,
  });

  if (!result.ok) return result;

  const sessionId = result.data.sessionId;
  const nextData = {
    ...tournament,
    americanoSessionId: sessionId,
  };

  await supabase
    .from('tournaments')
    .update({ data: nextData, updated_at: new Date().toISOString() })
    .eq('id', tournamentId);

  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath(`/americano/session/${sessionId}`);
  revalidatePath(`/americano/tv/${sessionId}`);

  return result;
}

export async function finishAmericanoSession(input: {
  sessionId: string;
}): Promise<ActionResult<void>> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return { ok: false, error: 'Servidor sin SUPABASE_SERVICE_ROLE_KEY.' };
  }

  const sessionId = String(input.sessionId || '').trim();
  if (!sessionId) {
    return { ok: false, error: 'Sesión no indicada.' };
  }

  const { data: session, error: sessionErr } = await supabase
    .from('americano_sessions')
    .select('id, tournament_id, status')
    .eq('id', sessionId)
    .maybeSingle();

  if (sessionErr || !session) {
    return { ok: false, error: sessionErr?.message ?? 'Sesión no encontrada.' };
  }

  const { error: updateErr } = await supabase
    .from('americano_sessions')
    .update({ status: 'finished', updated_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (updateErr) {
    return { ok: false, error: updateErr.message };
  }

  if (session.tournament_id) {
    revalidatePath(`/tournaments/${session.tournament_id}`);
  }
  revalidatePath(`/americano/session/${sessionId}`);
  revalidatePath(`/americano/tv/${sessionId}`);

  return { ok: true, data: undefined as void };
}

export async function submitMatchResult(input: {
  matchId: string;
  scoreA: number;
  scoreB: number;
}): Promise<ActionResult<void>> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return { ok: false, error: 'Servidor sin SUPABASE_SERVICE_ROLE_KEY.' };
  }

  const matchId = String(input.matchId || '').trim();
  const scoreA = Number(input.scoreA);
  const scoreB = Number(input.scoreB);

  if (!matchId) {
    return { ok: false, error: 'Partido no indicado.' };
  }

  const { data: row, error: fetchErr } = await supabase
    .from('americano_matches')
    .select('*')
    .eq('id', matchId)
    .maybeSingle();

  if (fetchErr || !row) {
    return { ok: false, error: fetchErr?.message ?? 'Partido no encontrado.' };
  }

  if (row.status === 'finished') {
    return { ok: false, error: 'Este partido ya tiene resultado.' };
  }

  const pointsGoal = row.points_goal as AmericanoPointsGoal;
  const validationError = validateMatchScores(scoreA, scoreB, pointsGoal);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const sessionId = row.session_id as string;

  const { error: rpcErr } = await supabase.rpc('submit_americano_match_result', {
    p_match_id: matchId,
    p_score_a: scoreA,
    p_score_b: scoreB,
  });

  if (!rpcErr) {
    revalidatePath(`/americano/session/${sessionId}`);
    revalidatePath(`/americano/tv/${sessionId}`);

    const { data: sessionRow } = await supabase
      .from('americano_sessions')
      .select('tournament_id')
      .eq('id', sessionId)
      .maybeSingle();

    if (sessionRow?.tournament_id) {
      revalidatePath(`/tournaments/${sessionRow.tournament_id}`);
    }

    return { ok: true, data: undefined as void };
  }

  // Fallback si la migración RPC aún no está aplicada
  const match: AmericanoMatch = {
    id: row.id,
    sessionId: row.session_id,
    roundNumber: row.round_number,
    courtNumber: row.court_number,
    playerA1Id: row.player_a1_id,
    playerA2Id: row.player_a2_id,
    playerB1Id: row.player_b1_id,
    playerB2Id: row.player_b2_id,
    scoreA,
    scoreB,
    pointsGoal,
    status: 'finished',
  };

  const { error: matchUpdateErr } = await supabase
    .from('americano_matches')
    .update({
      score_a: scoreA,
      score_b: scoreB,
      status: 'finished',
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId)
    .eq('status', 'pending');

  if (matchUpdateErr) {
    return { ok: false, error: rpcErr.message || matchUpdateErr.message };
  }

  const deltas = pointsDeltaForMatch({ ...match, scoreA, scoreB });
  const playerIds = [match.playerA1Id, match.playerA2Id, match.playerB1Id, match.playerB2Id];

  const { data: players, error: playersErr } = await supabase
    .from('americano_players')
    .select('id, total_points')
    .in('id', playerIds);

  if (playersErr || !players?.length) {
    return { ok: false, error: 'No se pudieron actualizar los puntos de los jugadores.' };
  }

  for (const player of players) {
    const add = deltas.get(player.id as string) ?? 0;
    const next = (player.total_points as number) + add;
    const { error: updErr } = await supabase
      .from('americano_players')
      .update({ total_points: next })
      .eq('id', player.id);
    if (updErr) {
      return { ok: false, error: updErr.message };
    }
  }

  revalidatePath(`/americano/session/${sessionId}`);
  revalidatePath(`/americano/tv/${sessionId}`);

  const { data: sessionRow } = await supabase
    .from('americano_sessions')
    .select('tournament_id')
    .eq('id', sessionId)
    .maybeSingle();

  if (sessionRow?.tournament_id) {
    revalidatePath(`/tournaments/${sessionRow.tournament_id}`);
  }

  return { ok: true, data: undefined as void };
}
