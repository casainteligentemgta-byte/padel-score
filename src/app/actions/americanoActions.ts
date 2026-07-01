'use server';

import { revalidatePath } from 'next/cache';
import {
  generateRotativeRotation,
  pointsDeltaForMatch,
  validateMatchScores,
  type AmericanoMatch,
} from '@/lib/americano/logic';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import type { AmericanoPointsGoal } from '@/types/americano';

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

export async function createAmericanoSession(input: {
  name: string;
  baseVenue: string;
  courtCount: number;
  pointsGoal: AmericanoPointsGoal;
  playerNames: string[];
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

  revalidatePath('/americano');
  revalidatePath(`/americano/session/${sessionId}`);
  revalidatePath(`/americano/tv/${sessionId}`);

  return { ok: true, data: { sessionId } };
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
    return { ok: false, error: matchUpdateErr.message };
  }

  const deltas = pointsDeltaForMatch({ ...match, scoreA, scoreB });
  const playerIds = [
    match.playerA1Id,
    match.playerA2Id,
    match.playerB1Id,
    match.playerB2Id,
  ];

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

  revalidatePath(`/americano/session/${match.sessionId}`);
  revalidatePath(`/americano/tv/${match.sessionId}`);

  return { ok: true, data: undefined as void };
}
