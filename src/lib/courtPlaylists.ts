import type { SupabaseClient } from '@supabase/supabase-js';

export type PlaylistSlot = 'video' | 'imagen' | 'legacy';

export type CourtPlaylistRowDb = {
  id: string;
  cancha_id: string;
  venue_name?: string;
  media_id: string;
  orden: number;
  duracion_segundos: number;
  playlist_slot?: PlaylistSlot;
  media_content?: {
    id: string;
    tipo: string;
    url: string;
    nombre_sponsor?: string | null;
    nombre?: string | null;
  } | null;
};

function normalizeMediaContent(raw: unknown): CourtPlaylistRowDb['media_content'] {
  if (!raw) return null;
  if (Array.isArray(raw)) {
    const first = raw[0] as Record<string, unknown> | undefined;
    if (!first) return null;
    return {
      id: String(first.id || ''),
      tipo: String(first.tipo || ''),
      url: String(first.url || ''),
      nombre_sponsor: (first.nombre_sponsor as string | null | undefined) ?? null,
      nombre: (first.nombre as string | null | undefined) ?? null,
    };
  }
  const m = raw as Record<string, unknown>;
  return {
    id: String(m.id || ''),
    tipo: String(m.tipo || ''),
    url: String(m.url || ''),
    nombre_sponsor: (m.nombre_sponsor as string | null | undefined) ?? null,
    nombre: (m.nombre as string | null | undefined) ?? null,
  };
}

export function normalizeCourtPlaylistRows(rows: unknown[]): CourtPlaylistRowDb[] {
  return (rows || []).map((r) => {
    const row = (r || {}) as Record<string, unknown>;
    return {
      id: String(row.id || ''),
      cancha_id: String(row.cancha_id || ''),
      venue_name: row.venue_name ? String(row.venue_name) : undefined,
      media_id: String(row.media_id || ''),
      orden: Number(row.orden || 0),
      duracion_segundos: Number(row.duracion_segundos || 0),
      playlist_slot: (row.playlist_slot as PlaylistSlot | undefined) ?? undefined,
      media_content: normalizeMediaContent(row.media_content),
    };
  });
}

export type CanchaPlaylistConfig = {
  venue_name: string;
  cancha_id: string;
  imagen_loop: boolean;
  imagen_pausa_entre_segundos: number;
  /** 0 = loop continuo (avance natural); >0 = minutos entre cambios forzados */
  video_cambio_cada_minutos?: number;
  imagen_cambio_cada_minutos?: number;
  tira_cambio_cada_minutos?: number;
};

/** Clasifica fila de cancha_publicidad en vídeo o imagen (slot + tipo). */
export function playlistRowKind(a: {
  playlist_slot?: string | null;
  media_content?: { tipo?: string | null } | { tipo?: string | null }[] | null;
}): 'video' | 'imagen' {
  const ps = a.playlist_slot || 'legacy';
  if (ps === 'imagen') return 'imagen';
  if (ps === 'video') return 'video';
  const mc = normalizeMediaContent(a.media_content as unknown);
  const tipo = String(mc?.tipo || '');
  return tipo === 'imagen' ? 'imagen' : 'video';
}

export async function fetchCanchaPlaylistRows(
  supabase: SupabaseClient,
  canchaId: string,
  venueName?: string | null,
) {
  const vn = venueName?.trim() || null;
  let q = supabase
    .from('cancha_publicidad')
    .select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, media_content(*)')
    .eq('cancha_id', canchaId)
    .order('orden', { ascending: true });
  if (vn) q = q.eq('venue_name', vn);
  const r = await q;
  if (!r.error) return r;

  // BD antigua sin columna venue_name: no filtrar por sede.
  let q2 = supabase
    .from('cancha_publicidad')
    .select('id, cancha_id, media_id, orden, duracion_segundos, media_content(*)')
    .eq('cancha_id', canchaId)
    .order('orden', { ascending: true });
  return await q2;
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
  patch: {
    imagen_loop?: boolean;
    imagen_pausa_entre_segundos?: number;
    video_cambio_cada_minutos?: number;
    imagen_cambio_cada_minutos?: number;
    tira_cambio_cada_minutos?: number;
  },
) {
  const vn = venueName.trim();
  const { data: existing } = await supabase
    .from('cancha_playlist_config')
    .select('*')
    .eq('cancha_id', canchaId)
    .eq('venue_name', vn)
    .maybeSingle();

  const ex = (existing || {}) as Record<string, unknown>;
  const row: Record<string, unknown> = {
    venue_name: vn,
    cancha_id: canchaId,
    imagen_loop: patch.imagen_loop ?? (ex.imagen_loop as boolean) ?? true,
    imagen_pausa_entre_segundos:
      patch.imagen_pausa_entre_segundos !== undefined
        ? Math.max(0, Number(patch.imagen_pausa_entre_segundos) || 0)
        : Math.max(0, Number(ex.imagen_pausa_entre_segundos) || 0),
    video_cambio_cada_minutos:
      patch.video_cambio_cada_minutos !== undefined
        ? Math.max(0, Math.floor(Number(patch.video_cambio_cada_minutos) || 0))
        : Math.max(0, Math.floor(Number(ex.video_cambio_cada_minutos) || 0)),
    imagen_cambio_cada_minutos:
      patch.imagen_cambio_cada_minutos !== undefined
        ? Math.max(0, Math.floor(Number(patch.imagen_cambio_cada_minutos) || 0))
        : Math.max(0, Math.floor(Number(ex.imagen_cambio_cada_minutos) || 0)),
    tira_cambio_cada_minutos:
      patch.tira_cambio_cada_minutos !== undefined
        ? Math.max(0, Math.floor(Number(patch.tira_cambio_cada_minutos) || 0))
        : Math.max(0, Math.floor(Number(ex.tira_cambio_cada_minutos) || 0)),
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
    const mc = normalizeMediaContent((r as unknown as { media_content?: unknown }).media_content);
    const row = { ...r, media_content: mc } as CourtPlaylistRowDb;
    const tipo = String(row.media_content?.tipo || '');
    const isImg = tipo === 'imagen';
    const isVid = tipo.includes('video') || tipo === 'video_url' || tipo === 'video_file';
    const slot = row.playlist_slot || 'legacy';
    if (slot === 'legacy') {
      if (isImg) imagen.push(row);
      else if (isVid) video.push(row);
      else video.push(row);
      continue;
    }
    if (slot === 'imagen') imagen.push(row);
    else video.push(row);
  }
  video.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  imagen.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  return { video, imagen };
}
