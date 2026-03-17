import { getSupabaseClient } from './supabase/client';
import { dataService } from './dataService';
import { TournamentType } from '@/types/tournament';
import { MatchStatus } from '@/types/tournament';

const now = () => new Date().toISOString();

/**
 * Genera emparejamientos Round Robin (Berger) para n equipos.
 * Devuelve rondas; cada ronda es un array de [índiceA, índiceB] (0-based).
 */
function generateRoundRobinPairings(n: number): [number, number][][] {
  if (n < 2) return [];
  const rounds: [number, number][][] = [];
  const teams = Array.from({ length: n }, (_, i) => i);
  if (n % 2 === 1) teams.push(-1);
  const total = teams.length;
  const numRounds = total - 1;
  for (let r = 0; r < numRounds; r++) {
    const round: [number, number][] = [];
    for (let i = 0; i < total / 2; i++) {
      const a = teams[i];
      const b = teams[total - 1 - i];
      if (a !== -1 && b !== -1) round.push([a, b]);
    }
    rounds.push(round);
    const last = teams.pop()!;
    teams.splice(1, 0, last);
  }
  return rounds;
}

export type MaxTeamsByCategory = Record<string, number>;

/**
 * Inicializa un torneo con plazas placeholder por categoría y genera los grupos (Round Robin)
 * para que el cuadro sea visible desde el inicio.
 *
 * - Por cada categoría en maxTeamsByCategory inserta en `inscriptions` tantas filas como max_teams,
 *   con nombres genéricos 'Pareja 1', 'Pareja 2', ... y data.is_placeholder = true.
 * - Construye los equipos placeholder en el torneo y genera los partidos de fase de grupos (Round Robin).
 * - Actualiza el torneo con teams, groupAssignments y groupSize; crea los registros en tournament_matches.
 *
 * @param tournamentId - ID del torneo
 * @param maxTeamsByCategory - Objeto { [categoryKey]: maxTeams } por categoría
 */
export async function initializeTournamentWithPlaceholders(
  tournamentId: string,
  maxTeamsByCategory: MaxTeamsByCategory
): Promise<{ inscriptionsCreated: number; matchesCreated: number }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase no configurado');
  }

  const tournament = await dataService.getTournament(tournamentId);
  if (!tournament) {
    throw new Error('Torneo no encontrado');
  }

  const ownerId = tournament.ownerId;
  const tournamentName = (tournament as any).name ?? (tournament as any).eventName ?? 'Torneo';
  const inscriptionCategories = (tournament as any).inscriptionCategories as Array<{ key: string; name?: string; price?: number }> | undefined;
  const categoryPrice = (key: string) => {
    const cat = inscriptionCategories?.find((c: any) => c.key === key);
    return cat?.price ?? 0;
  };

  let inscriptionsCreated = 0;
  let matchesCreated = 0;

  // groupSize por defecto para repartir equipos en grupos (ej. 4 por grupo)
  const defaultGroupSize = 4;

  const existingCategories = Array.isArray((tournament as any).categories) ? (tournament as any).categories : [];
  const existingTeams = Array.isArray((tournament as any).teams) ? (tournament as any).teams : [];
  const updatedCategories: any[] = [...existingCategories];
  let rootTeams: any[] = [...existingTeams];
  let rootGroupAssignments: Record<string, string[]> = { ...((tournament as any).groupAssignments || {}) };
  let rootGroupSize = (tournament as any).groupSize ?? defaultGroupSize;

  const categoryKeys = Object.keys(maxTeamsByCategory);
  const isSingleCategory = categoryKeys.length === 1;

  for (const categoryKey of categoryKeys) {
    const maxTeams = Math.max(2, Math.floor(maxTeamsByCategory[categoryKey] || 0));
    if (maxTeams < 2) continue;

    // 1) Insertar inscripciones placeholder (con group_name para la grilla)
    const gsForInsert = defaultGroupSize < maxTeams ? defaultGroupSize : maxTeams;
    const rows = Array.from({ length: maxTeams }, (_, i) => ({
      owner_id: ownerId,
      tournament_id: tournamentId,
      tournament_name: tournamentName,
      category_key: categoryKey,
      category_price: categoryPrice(categoryKey),
      participant_name: `Pareja ${i + 1}`,
      participant_email: null,
      participant_id: null,
      amount_extracted: null,
      receipt_url: null,
      payment_status: 'pending',
      alert_message: null,
      is_placeholder: true,
      group_name: String.fromCharCode(65 + Math.floor(i / gsForInsert)),
      data: {},
      created_at: now(),
      updated_at: now(),
    }));

    const { error: insErr } = await supabase.from('inscriptions').insert(rows);
    if (insErr) throw insErr;
    inscriptionsCreated += rows.length;

    // 2) Construir equipos placeholder para esta categoría
    const teamId = () => crypto.randomUUID?.() ?? `t_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const teams = Array.from({ length: maxTeams }, (_, i) => ({
      id: teamId(),
      p1: { id: `ph_${i + 1}_p1`, name: `Pareja ${i + 1}` },
      p2: { id: `ph_${i + 1}_p2`, name: '' },
    }));

    const gs = defaultGroupSize < maxTeams ? defaultGroupSize : maxTeams;
    const groups: any[][] = [];
    for (let i = 0; i < teams.length; i += gs) {
      groups.push(teams.slice(i, i + gs));
    }
    const groupAssignments: Record<string, string[]> = {};
    groups.forEach((chunk, idx) => {
      const groupName = String.fromCharCode(65 + idx);
      groupAssignments[groupName] = chunk.map((t: any) => String(t.id));
    });

    // 3) Generar partidos Round Robin (fase de grupos) — inserción masiva
    const pairingsByRound = generateRoundRobinPairings(maxTeams);
    const matchIdPrefix = `m-${categoryKey}`;
    const ts = Date.now().toString(36);
    const teamIdToIndex = new Map(teams.map((t, idx) => [t.id, idx + 1]));
    let matchIndex = 0;
    const startDate = (tournament as any).startDate ?? new Date().toISOString().split('T')[0];
    const startTime = (tournament as any).startTime ?? '08:00';
    const [startH = 8, startM = 0] = startTime.split(':').map(Number);
    const matchDuration = 90;
    const buffer = 0;
    let slotMinutes = 0;

    const matchPayloads: any[] = [];
    for (const round of pairingsByRound) {
      for (const [idx1, idx2] of round) {
        const t1 = teams[idx1];
        const t2 = teams[idx2];
        if (!t1 || !t2) continue;
        const scheduledTime = new Date(startDate + 'T00:00:00');
        scheduledTime.setHours(startH, startM + slotMinutes, 0, 0);
        slotMinutes += matchDuration + buffer;

        matchPayloads.push({
          id: `${matchIdPrefix}-${matchIndex++}-${ts}`,
          team1: t1,
          team2: t2,
          team1Name: t1.p1?.name ? (t1.p2?.name ? `${t1.p1.name} / ${t1.p2.name}` : t1.p1.name) : 'TBD',
          team2Name: t2.p1?.name ? (t2.p2?.name ? `${t2.p1.name} / ${t2.p2.name}` : t2.p1.name) : 'TBD',
          team1Index: teamIdToIndex.get(t1.id),
          team2Index: teamIdToIndex.get(t2.id),
          roundName: 'Fase de Grupos',
          status: MatchStatus.PENDING,
          stage: 'GROUP_STAGE',
          scheduledTime: scheduledTime.toISOString(),
          categoryId: categoryKey,
        });
      }
    }
    if (matchPayloads.length > 0) {
      const { inserted } = await dataService.createMatchesBulk(tournamentId, matchPayloads);
      matchesCreated += inserted;
    }

    if (isSingleCategory) {
      rootTeams = teams;
      rootGroupAssignments = groupAssignments;
      rootGroupSize = gs;
    } else {
      const catId = categoryKey;
      const existingIdx = updatedCategories.findIndex((c: any) => (c.id || c.category) === catId);
      const categoryPayload = {
        id: catId,
        category: categoryKey,
        gender: (tournament as any).gender ?? 'MALE',
        type: TournamentType.ROUND_ROBIN,
        teams,
        groupSize: gs,
        groupAssignments,
      };
      if (existingIdx >= 0) {
        updatedCategories[existingIdx] = { ...updatedCategories[existingIdx], ...categoryPayload };
      } else {
        updatedCategories.push(categoryPayload);
      }
    }
  }

  // 4) Actualizar torneo: teams, groupAssignments, groupSize y categories (si hay varias)
  const updatePayload: any = {
    ...tournament,
    teams: rootTeams,
    groupAssignments: rootGroupAssignments,
    groupSize: rootGroupSize,
    type: (tournament as any).type ?? TournamentType.ROUND_ROBIN,
  };
  if (!isSingleCategory && updatedCategories.length > 0) {
    updatePayload.categories = updatedCategories;
  }
  await dataService.updateTournament(tournamentId, updatePayload);

  return { inscriptionsCreated, matchesCreated };
}

/**
 * Facade amigable para el lanzador de torneo.
 *
 * Genera la estructura completa del torneo (placeholders por categoría,
 * grupos Round Robin y partidos) reutilizando la lógica central de
 * `initializeTournamentWithPlaceholders`.
 */
export async function generateTournamentStructure(
  tournamentId: string,
  maxTeamsByCategory: MaxTeamsByCategory
): Promise<{ inscriptionsCreated: number; matchesCreated: number }> {
  return initializeTournamentWithPlaceholders(tournamentId, maxTeamsByCategory);
}

/** Datos de la pareja real para sustituir un placeholder de inscripción */
export type RealTeamInscriptionData = {
  participant_name?: string;
  participant_email?: string | null;
  participant_id?: string | null;
  payment_status?: 'pending' | 'paid' | 'alert';
  /** Datos extra (partnerName, partnerId, paymentMethod, etc.) */
  data?: Record<string, unknown>;
};

/**
 * Busca el primer placeholder disponible en una categoría y lo sustituye por la pareja real.
 * Útil cuando un usuario se inscribe y debe ocupar una plaza ya reservada en el cuadro.
 *
 * @returns id de la inscripción actualizada o null si no hay placeholder libre
 */
export async function replacePlaceholderWithRealTeam(
  tournamentId: string,
  categoryKey: string,
  realTeamData: RealTeamInscriptionData
): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase no configurado');

  const { data: placeholder } = await supabase
    .from('inscriptions')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('category_key', categoryKey)
    .eq('is_placeholder', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!placeholder) return null;

  const updatePayload: Record<string, unknown> = {
    participant_name: realTeamData.participant_name ?? null,
    participant_email: realTeamData.participant_email ?? null,
    participant_id: realTeamData.participant_id ?? null,
    payment_status: realTeamData.payment_status ?? 'paid',
    is_placeholder: false,
    data: realTeamData.data ?? {},
    updated_at: now(),
  };

  const { error } = await supabase
    .from('inscriptions')
    .update(updatePayload)
    .eq('id', placeholder.id);

  if (error) throw error;
  return placeholder.id;
}

/**
 * Datos completos de una inscripción real (pareja) para ocupar un placeholder.
 *
 * Nota: el esquema real de `inscriptions` no tiene columnas `team_name`, `player1_id`, `player2_id`.
 * En su lugar usamos:
 * - `participant_name` para el nombre visible del equipo (p. ej. "Juan / Pedro")
 * - `participant_id` para el participante principal (p1)
 * - `data.partnerId` para el segundo jugador (p2)
 * - `data.user1Id` y `data.user2Id` para vincular al usuario dueño de cada jugador (si aplica)
 */
export type RealInscriptionTeamData = {
  teamName: string;
  /** ID del participante principal (p1) en la tabla participants */
  player1ParticipantId: string;
  /** ID del participante compañero (p2), opcional */
  player2ParticipantId?: string | null;
  /** IDs de usuario (Auth) opcionales, por si quieres enlazar al owner de cada jugador */
  user1Id?: string | null;
  user2Id?: string | null;
  /** Estado de pago / inscripción */
  paymentStatus?: 'pending' | 'paid' | 'alert';
  /** Datos adicionales (email, método de pago, etc.) */
  extraData?: Record<string, unknown>;
};

/**
 * Maneja la conversión de un placeholder en inscripción real cuando una pareja
 * completa su registro y pago.
 *
 * Lógica:
 * 1) Buscar el primer placeholder disponible en `inscriptions`:
 *    - `tournament_id` = torneo
 *    - `category_key` = categoría
 *    - `is_placeholder` = true
 *    - ordenado por `group_name` (A, B, C, ...) y `created_at` ascendente
 *      para rellenar primero los grupos iniciales.
 * 2) Hacer UPDATE sobre ese registro:
 *    - `is_placeholder` → false
 *    - `participant_name` → nombre del equipo real (p. ej. "Juan / Pedro")
 *    - `participant_id` → participantId del jugador principal
 *    - `payment_status` → 'confirmed' (mapeado a 'paid') o el que se pase
 *    - `data` → se extiende con partnerId, user1Id, user2Id, etc.
 *
 * Como conservamos el mismo `id` de inscripción, todos los partidos que ya
 * usaban ese equipo/inscripción verán automáticamente reflejados los nombres
 * reales en el dashboard y pizarras.
 */
export async function handleRealInscription(
  tournamentId: string,
  categoryKey: string,
  teamData: RealInscriptionTeamData
): Promise<{ success: boolean; inscriptionId?: string; message?: string; error?: unknown }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: new Error('Supabase no configurado') };
  }

  try {
    // 1) Buscar primer placeholder disponible en esa categoría, priorizando grupos A, B, C...
    const { data: placeholder, error: searchError } = await supabase
      .from('inscriptions')
      .select('id, group_name, data')
      .eq('tournament_id', tournamentId)
      .eq('category_key', categoryKey)
      .eq('is_placeholder', true)
      .order('group_name', { ascending: true, nullsFirst: true })
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (searchError) throw searchError;
    if (!placeholder) {
      return {
        success: false,
        message: 'No hay cupos disponibles (placeholders) para esta categoría.',
      };
    }

    // 2) UPDATE del placeholder → inscripción real
    const existingData = (placeholder as any).data ?? {};
    const mergedData = {
      ...existingData,
      partnerId: teamData.player2ParticipantId ?? existingData.partnerId ?? null,
      user1Id: teamData.user1Id ?? existingData.user1Id ?? null,
      user2Id: teamData.user2Id ?? existingData.user2Id ?? null,
      ...teamData.extraData,
    };

    const paymentStatus = teamData.paymentStatus ?? 'paid';

    const { error: updateError } = await supabase
      .from('inscriptions')
      .update({
        participant_name: teamData.teamName,
        participant_id: teamData.player1ParticipantId,
        payment_status: paymentStatus,
        is_placeholder: false,
        data: mergedData,
        updated_at: now(),
      })
      .eq('id', (placeholder as any).id);

    if (updateError) throw updateError;

    return {
      success: true,
      inscriptionId: (placeholder as any).id as string,
      message: 'Inscripción procesada y cupo asignado.',
    };
  } catch (error) {
    console.error('[handleRealInscription] Error transformando placeholder en inscripción real:', error);
    return { success: false, error };
  }
}
