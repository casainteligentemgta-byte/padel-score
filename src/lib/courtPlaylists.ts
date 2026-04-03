import type { SupabaseClient } from '@supabase/supabase-js';

export type PlaylistSlot = 'video' | 'imagen' | 'legacy';

/**
 * Unifica `cancha_1` y `1` para admin y mapas.
 * El heartbeat de pizarra escribe `cancha_N`; las tarjetas de sede usan clave numérica `N`.
 */
export function normalizeCanchaIdKey(raw: unknown): string {
  const s = String(raw ?? '').trim();
  const m = s.match(/^cancha_(.+)$/i);
  return m ? m[1].trim() : s;
}

function canchaIdCandidates(canchaId: string): string[] {
  const id = String(canchaId || '').trim();
  if (!id) return [];
  const m = id.match(/^cancha_(\d+)$/i);
  if (m) return [id, m[1]];
  if (/^\d+$/.test(id)) return [id, `cancha_${id}`];
  return [id];
}

async function enrichRowsWithMediaById(
  supabase: SupabaseClient,
  rows: CourtPlaylistRowDb[],
): Promise<CourtPlaylistRowDb[]> {
  const missing = rows.filter((r) => !r.media_content?.url && r.media_id).map((r) => r.media_id);
  if (!missing.length) return rows;
  const ids = Array.from(new Set(missing));
  const { data } = await supabase
    .from('media_content')
    .select('id, tipo, url, nombre_sponsor, nombre')
    .in('id', ids);
  const byId = new Map(
    ((data || []) as Array<{ id: string; tipo: string; url: string; nombre_sponsor?: string | null; nombre?: string | null }>).map((m) => [
      String(m.id),
      m,
    ]),
  );
  return rows.map((r) => {
    if (r.media_content?.url) return r;
    const m = byId.get(String(r.media_id));
    if (!m) return r;
    return {
      ...r,
      media_content: {
        id: String(m.id || ''),
        tipo: String(m.tipo || ''),
        url: String(m.url || ''),
        nombre_sponsor: m.nombre_sponsor ?? null,
        nombre: m.nombre ?? null,
      },
    };
  });
}

export type CourtPlaylistRowDb = {
  id: string;
  cancha_id: string;
  venue_name?: string;
  media_id: string;
  orden: number;
  duracion_segundos: number;
  playlist_slot?: PlaylistSlot;
  posicion_pantalla?: string | null;
  media_content?: {
    id: string;
    tipo: string;
    url: string;
    nombre_sponsor?: string | null;
    nombre?: string | null;
  } | null;
  publicidad?: {
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
      posicion_pantalla: row.posicion_pantalla ? String(row.posicion_pantalla) : null,
      media_content: normalizeMediaContent(row.media_content ?? row.publicidad),
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
  const canchaIds = canchaIdCandidates(canchaId);
  const hasPlayableRows = (rows: CourtPlaylistRowDb[]) =>
    rows.some((x) => Boolean(x.media_content?.url));

  const vn = venueName?.trim() || null;
  let q = supabase
    .from('cancha_publicidad')
    .select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla, media_content(*)')
    .in('cancha_id', canchaIds)
    .order('orden', { ascending: true });
  if (vn) q = q.eq('venue_name', vn);
  const r = await q;
  if (!r.error && ((r.data as unknown[]) || []).length > 0) {
    const norm = await enrichRowsWithMediaById(supabase, normalizeCourtPlaylistRows((r.data as unknown[]) || []));
    if (hasPlayableRows(norm)) return { ...r, data: norm };
  }
  if (vn) {
    const rLike = await supabase
      .from('cancha_publicidad')
      .select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla, media_content(*)')
      .in('cancha_id', canchaIds)
      .ilike('venue_name', vn)
      .order('orden', { ascending: true });
    if (!rLike.error && ((rLike.data as unknown[]) || []).length > 0) {
      const norm = await enrichRowsWithMediaById(supabase, normalizeCourtPlaylistRows((rLike.data as unknown[]) || []));
      if (hasPlayableRows(norm)) return { ...rLike, data: norm };
    }
  }

  // Algunas BD exponen la relación como `publicidad` en lugar de `media_content`.
  let qRelFallback = supabase
    .from('cancha_publicidad')
    .select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla, publicidad(*)')
    .in('cancha_id', canchaIds)
    .order('orden', { ascending: true });
  if (vn) qRelFallback = qRelFallback.eq('venue_name', vn);
  const rRelFallback = await qRelFallback;
  if (!rRelFallback.error && ((rRelFallback.data as unknown[]) || []).length > 0) {
    const norm = await enrichRowsWithMediaById(supabase, normalizeCourtPlaylistRows((rRelFallback.data as unknown[]) || []));
    if (hasPlayableRows(norm)) return { ...rRelFallback, data: norm };
  }
  if (vn) {
    const rRelLike = await supabase
      .from('cancha_publicidad')
      .select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla, publicidad(*)')
      .in('cancha_id', canchaIds)
      .ilike('venue_name', vn)
      .order('orden', { ascending: true });
    if (!rRelLike.error && ((rRelLike.data as unknown[]) || []).length > 0) {
      const norm = await enrichRowsWithMediaById(supabase, normalizeCourtPlaylistRows((rRelLike.data as unknown[]) || []));
      if (hasPlayableRows(norm)) return { ...rRelLike, data: norm };
    }
  }

  // Fallback: sin sede (cuando no coincide venue_name en la data).
  let q2 = supabase
    .from('cancha_publicidad')
    .select('id, cancha_id, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla, media_content(*)')
    .in('cancha_id', canchaIds)
    .order('orden', { ascending: true });
  const r2 = await q2;
  if (!r2.error) {
    const norm = await enrichRowsWithMediaById(supabase, normalizeCourtPlaylistRows((r2.data as unknown[]) || []));
    if (hasPlayableRows(norm) || norm.length > 0) return { ...r2, data: norm };
  }

  let q3 = supabase
    .from('cancha_publicidad')
    .select('id, cancha_id, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla, publicidad(*)')
    .in('cancha_id', canchaIds)
    .order('orden', { ascending: true });
  const r3 = await q3;
  if (!r3.error) {
    const norm = await enrichRowsWithMediaById(supabase, normalizeCourtPlaylistRows((r3.data as unknown[]) || []));
    return { ...r3, data: norm };
  }

  // Fallback final: sin relaciones embebidas (evita fallos de schema cache/FK en PostgREST).
  // Luego resolvemos media por `media_id` con query independiente.
  let q4 = supabase
    .from('cancha_publicidad')
    .select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla')
    .in('cancha_id', canchaIds)
    .order('orden', { ascending: true });
  if (vn) {
    q4 = q4.ilike('venue_name', vn);
  }
  const r4 = await q4;
  if (!r4.error) {
    const norm = await enrichRowsWithMediaById(supabase, normalizeCourtPlaylistRows((r4.data as unknown[]) || []));
    if (hasPlayableRows(norm) || norm.length > 0) return { ...r4, data: norm };
  }

  const r5 = await supabase
    .from('cancha_publicidad')
    .select('id, cancha_id, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla')
    .in('cancha_id', canchaIds)
    .order('orden', { ascending: true });
  if (!r5.error) {
    const norm = await enrichRowsWithMediaById(supabase, normalizeCourtPlaylistRows((r5.data as unknown[]) || []));
    return { ...r5, data: norm };
  }
  return r3;
}

export async function fetchCanchaPlaylistConfig(
  supabase: SupabaseClient,
  canchaId: string,
  venueName: string,
): Promise<CanchaPlaylistConfig | null> {
  if (!venueName.trim()) return null;
  const canchaIds = canchaIdCandidates(canchaId);
  const { data, error } = await supabase
    .from('cancha_playlist_config')
    .select('*')
    .in('cancha_id', canchaIds)
    .eq('venue_name', venueName.trim())
    .maybeSingle();
  if (!error && data) return data as CanchaPlaylistConfig;

  // Fallback: algunas instalaciones no guardan/filtran por venue_name.
  const { data: data2, error: error2 } = await supabase
    .from('cancha_playlist_config')
    .select('*')
    .in('cancha_id', canchaIds)
    .limit(1)
    .maybeSingle();
  if (error2 || !data2) return null;
  return data2 as CanchaPlaylistConfig;
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
  const canchaIds = canchaIdCandidates(canchaId);
  const vn = venueName?.trim();
  if (vn) {
    const { data: links, error: e1 } = await supabase
      .from('cancha_tira')
      .select('tira_informativa_id, orden')
      .in('cancha_id', canchaIds)
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

    // Fallback 1: cancha_tira sin filtrar por sede.
    const { data: links2, error: e1b } = await supabase
      .from('cancha_tira')
      .select('tira_informativa_id, orden')
      .in('cancha_id', canchaIds)
      .order('orden', { ascending: true });
    if (!e1b && links2?.length) {
      const ids = links2.map((l: { tira_informativa_id: string }) => l.tira_informativa_id);
      const { data: msgs, error: e2 } = await supabase
        .from('tira_informativa')
        .select('id, mensaje, activo')
        .in('id', ids)
        .eq('activo', true);
      if (!e2 && msgs?.length) {
        const order = new Map(ids.map((id, i) => [id, i]));
        return (msgs as { id: string; mensaje: string }[])
          .filter((m) => order.has(m.id))
          .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
      }
    }
  }
  // Fallback 2: mensajes globales.
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
