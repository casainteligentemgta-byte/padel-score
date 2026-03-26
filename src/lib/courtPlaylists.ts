import type { SupabaseClient } from '@supabase/supabase-js';

export type PlaylistSlot = 'video' | 'imagen' | 'legacy';

export type CourtPlaylistRowDb = {
  id: string;
  cancha_id: string;
  venue_name?: string;
  media_id: string;
  orden: number;
  duracion_segundos: number;
  playlist_slot: PlaylistSlot;
  media_content?: {
    id: string;
    tipo: string;
    url: string;
    nombre_sponsor?: string | null;
    nombre?: string | null;
  } | null;
};

export type CanchaPlaylistConfig = {
  venue_name: string;
  cancha_id: string;
  imagen_loop: boolean;
  imagen_pausa_entre_segundos: number;
};

export async function fetchCanchaPlaylistRows(
  supabase: SupabaseClient,
  canchaId: string,
  venueName?: string | null,
) {
  const vn = venueName?.trim() || null;
  let q = supabase
    .from('cancha_publicidad')
    .select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, media_content(*)')
    .eq('cancha_id', canchaId)
    .order('orden', { ascending: true });
  if (vn) q = q.eq('venue_name', vn);
  const r = await q;
  if (!r.error) return r;
  let q2 = supabase
    .from('cancha_publicidad')
    .select('id, cancha_id, media_id, orden, duracion_segundos, media_content(*)')
    .eq('cancha_id', canchaId)
    .order('orden', { ascending: true });
  if (vn) q2 = q2.eq('venue_name', vn);
  return q2;
}

export async function fetchCanchaPlaylistConfig(
  supabase: SupabaseClient,
  canchaId: string,
  venueName: string,
): Promise<CanchaPlaylistConfig | null> {
  if (!venueName.trim()) return null;
  const { data, error } = await supabase
    .from('cancha_playlist_config')
    .select('*')
    .eq('cancha_id', canchaId)
    .eq('venue_name', venueName.trim())
    .maybeSingle();
  if (error || !data) return null;
  return data as CanchaPlaylistConfig;
}

export async function upsertCanchaPlaylistConfig(
  supabase: SupabaseClient,
  venueName: string,
  canchaId: string,
  patch: { imagen_loop?: boolean; imagen_pausa_entre_segundos?: number },
) {
  const row = {
    venue_name: venueName.trim(),
    cancha_id: canchaId,
    imagen_loop: patch.imagen_loop ?? true,
    imagen_pausa_entre_segundos: Math.max(0, Number(patch.imagen_pausa_entre_segundos) || 0),
    updated_at: new Date().toISOString(),
  };
  return supabase.from('cancha_playlist_config').upsert(row, { onConflict: 'venue_name,cancha_id' });
}

export async function fetchCanchaTiraMessages(
  supabase: SupabaseClient,
  canchaId: string,
  venueName: string | null | undefined,
): Promise<{ id: string; mensaje: string }[]> {
  const vn = venueName?.trim();
  if (vn) {
    const { data: links, error: e1 } = await supabase
      .from('cancha_tira')
      .select('tira_informativa_id, orden')
      .eq('cancha_id', canchaId)
      .eq('venue_name', vn)
      .order('orden', { ascending: true });
    if (!e1 && links?.length) {
      const ids = links.map((l: { tira_informativa_id: string }) => l.tira_informativa_id);
      const { data: msgs, error: e2 } = await supabase
        .from('tira_informativa')
        .select('id, mensaje, activo')
        .in('id', ids)
        .eq('activo', true);
      if (e2 || !msgs?.length) return [];
      const order = new Map(ids.map((id, i) => [id, i]));
      return (msgs as { id: string; mensaje: string }[])
        .filter((m) => order.has(m.id))
        .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    }
  }
  const { data: all, error } = await supabase
    .from('tira_informativa')
    .select('id, mensaje')
    .eq('activo', true)
    .order('orden', { ascending: true });
  if (error || !all) return [];
  return all as { id: string; mensaje: string }[];
}

export function partitionPlaylistRows(rows: CourtPlaylistRowDb[]) {
  const video: CourtPlaylistRowDb[] = [];
  const imagen: CourtPlaylistRowDb[] = [];
  for (const r of rows) {
    const tipo = String(r.media_content?.tipo || '');
    const isImg = tipo === 'imagen';
    const isVid = tipo.includes('video') || tipo === 'video_url' || tipo === 'video_file';
    const slot = r.playlist_slot || 'legacy';
    if (slot === 'legacy') {
      if (isImg) imagen.push(r);
      else if (isVid) video.push(r);
      else video.push(r);
      continue;
    }
    if (slot === 'imagen') imagen.push(r);
    else video.push(r);
  }
  video.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  imagen.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  return { video, imagen };
}
