import { getSupabaseClient } from './supabase/client';

export type LastPartner = {
  id: string;
  name: string;
  avatar_url: string | null;
};

/**
 * Obtiene los últimos 5 user_id con los que el usuario actual ha compartido equipo,
 * consultando tournament_matches (data.team1/team2.p1.p2.id) y inscriptions (participant_id + data.partnerId).
 * Devuelve nombre y foto de perfil (profiles + participants.data.photo) para mostrar en el Hub.
 */
export async function getLastPartners(currentUserId: string): Promise<LastPartner[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const partnerEntries: { id: string; at: string }[] = [];

  // 1) Tabla teams: parejas aceptadas o invitaciones (player_a_id, player_b_id)
  try {
    const { data: teams } = await supabase
      .from('teams')
      .select('player_a_id, player_b_id, updated_at')
      .or(`player_a_id.eq.${currentUserId},player_b_id.eq.${currentUserId}`)
      .order('updated_at', { ascending: false })
      .limit(50);

    (teams || []).forEach((row: any) => {
      const other = row.player_a_id === currentUserId ? row.player_b_id : row.player_a_id;
      if (other && other !== currentUserId)
        partnerEntries.push({ id: other, at: row.updated_at || row.created_at || '' });
    });
  } catch {
    // teams table puede no existir
  }

  // 2) Inscriptions: quien se inscribió (participant_id) y su compañero (data.partnerId)
  try {
    const { data: insAsParticipant } = await supabase
      .from('inscriptions')
      .select('participant_id, data, created_at')
      .eq('participant_id', currentUserId)
      .order('created_at', { ascending: false })
      .limit(30);
    (insAsParticipant || []).forEach((row: any) => {
      const partnerId = row.data?.partnerId;
      if (partnerId && partnerId !== currentUserId && typeof partnerId === 'string')
        partnerEntries.push({ id: partnerId, at: row.created_at || '' });
    });
    const { data: insWhereIAmPartner } = await supabase
      .from('inscriptions')
      .select('participant_id, data, created_at')
      .eq('data->>partnerId', currentUserId)
      .order('created_at', { ascending: false })
      .limit(30);
    (insWhereIAmPartner || []).forEach((row: any) => {
      const partnerId = row.participant_id;
      if (partnerId && partnerId !== currentUserId)
        partnerEntries.push({ id: partnerId, at: row.created_at || '' });
    });
  } catch {
    // ignore (p. ej. si data->>partnerId no está soportado en tu versión)
  }

  // 3) Tournament matches: partidos donde el usuario aparece en team1 o team2 (data JSONB)
  try {
    const { data: matches } = await supabase
      .from('tournament_matches')
      .select('id, tournament_id, data, created_at')
      .order('created_at', { ascending: false })
      .limit(300);

    (matches || []).forEach((row: any) => {
      const d = row.data || {};
      const team1 = d.team1 || {};
      const team2 = d.team2 || {};
      const t1p1 = team1.p1?.id;
      const t1p2 = team1.p2?.id;
      const t2p1 = team2.p1?.id;
      const t2p2 = team2.p2?.id;
      const at = row.created_at || '';

      if (t1p1 === currentUserId && t1p2 && t1p2 !== currentUserId) partnerEntries.push({ id: t1p2, at });
      else if (t1p2 === currentUserId && t1p1 && t1p1 !== currentUserId) partnerEntries.push({ id: t1p1, at });
      else if (t2p1 === currentUserId && t2p2 && t2p2 !== currentUserId) partnerEntries.push({ id: t2p2, at });
      else if (t2p2 === currentUserId && t2p1 && t2p1 !== currentUserId) partnerEntries.push({ id: t2p1, at });
    });
  } catch {
    // ignore
  }

  // Ordenar por fecha más reciente y tomar los 5 únicos (primera aparición = más reciente)
  const seen = new Set<string>();
  const uniquePartnerIds: string[] = [];
  const sorted = [...partnerEntries].sort((a, b) => (b.at > a.at ? 1 : b.at < a.at ? -1 : 0));
  for (const { id } of sorted) {
    if (seen.has(id)) continue;
    seen.add(id);
    uniquePartnerIds.push(id);
    if (uniquePartnerIds.length >= 5) break;
  }

  if (uniquePartnerIds.length === 0) return [];

  // 4) Nombres y fotos: profiles (name) y participants (data.photo) por owner_id
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', uniquePartnerIds);

  const profileMap = new Map<string, { name: string }>();
  (profiles || []).forEach((p: any) => profileMap.set(p.id, { name: (p.name || '').trim() || 'Jugador' }));

  const { data: participants } = await supabase
    .from('participants')
    .select('owner_id, data')
    .in('owner_id', uniquePartnerIds);

  const photoMap = new Map<string, string>();
  (participants || []).forEach((p: any) => {
    const photo = (p.data && typeof p.data === 'object' && p.data.photo) ? String(p.data.photo) : null;
    if (photo) photoMap.set(p.owner_id, photo);
  });

  // Respeta el orden de uniquePartnerIds
  return uniquePartnerIds.map(id => ({
    id,
    name: profileMap.get(id)?.name ?? 'Jugador',
    avatar_url: photoMap.get(id) ?? null,
  }));
}
