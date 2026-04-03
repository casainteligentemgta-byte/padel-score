'use server';

import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  canchaIdCandidates,
  canchaIdStoredForPublicidadTables,
  normalizeCanchaIdKey,
} from '@/lib/courtPlaylists';

type Err = { ok: false; error: string };

function serviceMissing(): Err {
  return {
    ok: false,
    error:
      'Servidor sin credenciales Supabase. Añade SUPABASE_SERVICE_ROLE_KEY en Vercel (Environment Variables) y vuelve a desplegar.',
  };
}

/** Solo estas columnas existen en cancha_playlist_config; el resto se ignora (evita p. ej. split_ratio → INTEGER). */
const PLAYLIST_CONFIG_INT_KEYS = [
  'video_cambio_cada_minutos',
  'imagen_cambio_cada_minutos',
  'tira_cambio_cada_minutos',
  'imagen_pausa_entre_segundos',
] as const;

function sanitizePlaylistConfigPatch(patch: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of PLAYLIST_CONFIG_INT_KEYS) {
    if (key in patch && patch[key] !== undefined) {
      out[key] = Math.max(0, Math.floor(Number(patch[key]) || 0));
    }
  }
  if ('imagen_loop' in patch && patch.imagen_loop !== undefined) {
    out.imagen_loop = Boolean(patch.imagen_loop);
  }
  return out;
}

/**
 * `cancha_publicidad` (y similares) tienen FK a `public.canchas(cancha_id)`.
 * En producción puede existir `1` o `cancha_1`; debemos escribir exactamente el id que ya está (o crear `cancha_N` por defecto).
 */
async function resolveCanchaIdForPublicidadFk(
  supabase: SupabaseClient,
  courtKey: string,
): Promise<{ ok: true; storageId: string; variants: string[] } | Err> {
  const canonical = normalizeCanchaIdKey(courtKey.trim());
  const variants = canchaIdCandidates(canonical);
  if (!variants.length) return { ok: false, error: 'Cancha inválida.' };
  const preferred = canchaIdStoredForPublicidadTables(courtKey.trim());

  const { data: hits, error: selErr } = await supabase
    .from('canchas')
    .select('cancha_id')
    .in('cancha_id', variants);

  if (selErr) {
    console.warn('[publicidad] canchas lookup:', selErr.message);
  }

  const existing = new Set((hits || []).map((r: { cancha_id: string }) => r.cancha_id));
  if (existing.size > 0) {
    const pickOrder = [preferred, ...variants.filter((v) => v !== preferred)];
    for (const id of pickOrder) {
      if (existing.has(id)) return { ok: true, storageId: id, variants };
    }
  }

  const iso = new Date().toISOString();
  const { error: upErr } = await supabase.from('canchas').upsert(
    { cancha_id: preferred, last_seen: null, updated_at: iso },
    { onConflict: 'cancha_id' },
  );
  if (upErr) {
    return { ok: false, error: upErr.message || 'No se pudo registrar la cancha en canchas.' };
  }
  return { ok: true, storageId: preferred, variants };
}

/**
 * Las Server Actions no deben usar throw hacia el cliente en producción:
 * Next.js oculta el mensaje real. Devolvemos { ok, error } siempre.
 */

function sanitizeMediaContentInsert(payload: Record<string, unknown>): Record<string, unknown> {
  const row = { ...payload };
  if (row.duracion_segundos != null && row.duracion_segundos !== '') {
    row.duracion_segundos = Math.max(0, Math.round(Number(row.duracion_segundos) || 0));
  }
  if (row.file_size_bytes != null && row.file_size_bytes !== '') {
    row.file_size_bytes = Math.max(0, Math.floor(Number(row.file_size_bytes) || 0));
  }
  return row;
}

export async function addMediaContentAction(
  payload: Record<string, unknown>,
): Promise<{ ok: true; data: Record<string, unknown> } | Err> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return serviceMissing();
  try {
    const row = sanitizeMediaContentInsert(payload);
    const { error, data } = await supabase.from('media_content').insert([row]).select().single();
    if (error) return { ok: false, error: error.message || 'No se pudo crear el contenido.' };
    revalidatePath('/admin/publicidad');
    return { ok: true, data: data as Record<string, unknown> };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al crear contenido.' };
  }
}

export async function deleteMediaAction(id: string): Promise<{ ok: true } | Err> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return serviceMissing();
  try {
    const { error } = await supabase.from('media_content').delete().eq('id', id);
    if (error) return { ok: false, error: error.message || 'No se pudo eliminar.' };
    revalidatePath('/admin/publicidad');
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al eliminar.' };
  }
}

export async function renameMediaAction(id: string, nombre: string): Promise<{ ok: true } | Err> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return serviceMissing();
  try {
    const { error } = await supabase
      .from('media_content')
      .update({ nombre, nombre_sponsor: nombre.replace(/\.[^/.]+$/, '') })
      .eq('id', id);
    if (error) return { ok: false, error: error.message || 'No se pudo renombrar.' };
    revalidatePath('/admin/publicidad');
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al renombrar.' };
  }
}

export async function addTickerAction(mensaje: string, orden: number): Promise<{ ok: true } | Err> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return serviceMissing();
  const ordenInt = Math.max(0, Math.floor(Number(orden) || 0));
  try {
    const { error } = await supabase.from('tira_informativa').insert({ mensaje, orden: ordenInt, activo: true });
    if (error) return { ok: false, error: error.message || 'No se pudo añadir el mensaje.' };
    revalidatePath('/admin/publicidad');
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al añadir tira.' };
  }
}

export async function deleteTickerAction(id: string): Promise<{ ok: true } | Err> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return serviceMissing();
  try {
    const { error } = await supabase.from('tira_informativa').delete().eq('id', id);
    if (error) return { ok: false, error: error.message || 'No se pudo eliminar el mensaje.' };
    revalidatePath('/admin/publicidad');
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al eliminar tira.' };
  }
}

/** Filas `playlist_slot = legacy`: decidir si pertenecen al slot vídeo o imagen (misma regla que `partitionPlaylistRows`). */
function legacyRowMatchesPlaylistSlot(
  row: {
    media_content?: { tipo?: string | null } | { tipo?: string | null }[] | null;
  },
  slot: 'video' | 'imagen',
): boolean {
  const raw = row.media_content;
  const mc = Array.isArray(raw) ? raw[0] : raw;
  const tipo = String(mc?.tipo ?? '').toLowerCase();
  if (tipo === 'imagen') return slot === 'imagen';
  return slot === 'video';
}

export async function savePlaylistAction(
  courtKey: string,
  venueName: string,
  mediaIds: string[],
  slot: 'video' | 'imagen',
  durSeconds: number,
): Promise<{ ok: true } | Err> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return serviceMissing();

  const cleanVenueName = venueName.trim();

  try {
    const resolved = await resolveCanchaIdForPublicidadFk(supabase, courtKey.trim());
    if (!resolved.ok) return resolved;
    const { storageId: storageCanchaId, variants: courtIdVariants } = resolved;

    // 1) Quitar filas ya etiquetadas con este slot (mismo venue exacto que el insert).
    const { error: delSlotErr } = await supabase
      .from('cancha_publicidad')
      .delete()
      .in('cancha_id', courtIdVariants)
      .eq('venue_name', cleanVenueName)
      .eq('playlist_slot', slot);

    if (delSlotErr) {
      console.error('Error al borrar playlist por slot:', delSlotErr);
      return { ok: false, error: `Al limpiar playlist: ${delSlotErr.message}` };
    }

    // 2) Quitar filas legacy que correspondan a este tipo de medio (playlist_slot es NOT NULL; nunca fue NULL).
    const { data: legacyRows, error: legSelErr } = await supabase
      .from('cancha_publicidad')
      .select('id, media_content(tipo)')
      .in('cancha_id', courtIdVariants)
      .eq('venue_name', cleanVenueName)
      .eq('playlist_slot', 'legacy');

    if (legSelErr) {
      console.error('Error al listar legacy cancha_publicidad:', legSelErr);
      return { ok: false, error: `Al limpiar playlist legacy: ${legSelErr.message}` };
    }

    const legacyIds = (legacyRows || [])
      .filter((r) => legacyRowMatchesPlaylistSlot(r, slot))
      .map((r) => r.id);

    if (legacyIds.length > 0) {
      const { error: delLegErr } = await supabase.from('cancha_publicidad').delete().in('id', legacyIds);
      if (delLegErr) {
        console.error('Error al borrar filas legacy:', delLegErr);
        return { ok: false, error: `Al limpiar playlist antigua: ${delLegErr.message}` };
      }
    }

    const orderedUniqueIds = (() => {
      const seen = new Set<string>();
      const out: string[] = [];
      for (const id of mediaIds) {
        const t = String(id || '').trim();
        if (!t || seen.has(t)) continue;
        seen.add(t);
        out.push(t);
      }
      return out;
    })();

    if (orderedUniqueIds.length > 0) {
      const durInt = Math.max(1, Math.round(Number(durSeconds) || 10));
      const rows = orderedUniqueIds.map((mid, i) => ({
        cancha_id: storageCanchaId,
        venue_name: cleanVenueName,
        media_id: mid,
        orden: i + 1,
        duracion_segundos: durInt,
        playlist_slot: slot,
      }));

      const { error: insErr } = await supabase.from('cancha_publicidad').insert(rows);
      if (insErr) {
        console.error('Error al insertar nueva playlist:', insErr);
        return { ok: false, error: insErr.message || 'Error al guardar la playlist.' };
      }
    }

    revalidatePath('/admin/publicidad');
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al guardar playlist.' };
  }
}

export async function saveTiraPlaylistAction(
  courtKey: string,
  venueName: string,
  tiraIds: string[],
): Promise<{ ok: true } | Err> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return serviceMissing();

  const cleanVenueName = venueName.trim();

  try {
    const resolved = await resolveCanchaIdForPublicidadFk(supabase, courtKey.trim());
    if (!resolved.ok) return resolved;
    const { storageId: storageCanchaId, variants: courtIdVariants } = resolved;

    const { error: delErr } = await supabase
      .from('cancha_tira')
      .delete()
      .in('cancha_id', courtIdVariants)
      .eq('venue_name', cleanVenueName);

    if (delErr) return { ok: false, error: delErr.message || 'No se pudo limpiar la tira.' };

    if (tiraIds.length > 0) {
      const rows = tiraIds.map((tid, i) => ({
        cancha_id: storageCanchaId,
        venue_name: cleanVenueName,
        tira_informativa_id: tid,
        orden: i + 1,
      }));
      const { error: insErr } = await supabase.from('cancha_tira').insert(rows);
      if (insErr) return { ok: false, error: insErr.message || 'No se pudo guardar la tira.' };
    }

    revalidatePath('/admin/publicidad');
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al guardar tira.' };
  }
}

export async function upsertPlaylistConfigAction(
  venueName: string,
  canchaId: string,
  patch: Record<string, unknown>,
): Promise<{ ok: true } | Err> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return serviceMissing();

  try {
    const safePatch = sanitizePlaylistConfigPatch(patch);
    const resolved = await resolveCanchaIdForPublicidadFk(supabase, canchaId.trim());
    if (!resolved.ok) return resolved;
    const storageCanchaId = resolved.storageId;
    const iso = new Date().toISOString();

    const { error } = await supabase.from('cancha_playlist_config').upsert(
      {
        venue_name: venueName.trim(),
        cancha_id: storageCanchaId,
        ...safePatch,
        updated_at: iso,
      },
      { onConflict: 'venue_name,cancha_id' },
    );

    if (error) return { ok: false, error: error.message || 'No se pudo guardar la configuración.' };
    revalidatePath('/admin/publicidad');
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al guardar configuración.' };
  }
}

export type FetchAssignmentsOk = {
  assignments: unknown[];
  config: unknown[];
  tiras: unknown[];
};

export async function fetchAssignmentsAction(
  venueName?: string,
  keys?: string[],
): Promise<{ ok: true } & FetchAssignmentsOk | Err> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return serviceMissing();

  const v = venueName?.trim();
  try {
    let q = supabase
      .from('cancha_publicidad')
      .select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, media_content(*)');

    if (v) q = q.ilike('venue_name', v);
    if (keys && keys.length > 0) q = q.in('cancha_id', keys);

    const { data, error } = await q.order('orden', { ascending: true });
    if (error) {
      console.error('Error in fetchAssignmentsAction:', error);
      return { ok: false, error: error.message || 'No se pudieron cargar las asignaciones.' };
    }

    const assignments = (data || []).map((r: Record<string, unknown>) => ({
      ...r,
      venue_name: String(r.venue_name || '').trim(),
      cancha_id: normalizeCanchaIdKey(String(r.cancha_id || '')),
    }));

    let qConfig = supabase.from('cancha_playlist_config').select('*');
    if (v) qConfig = qConfig.ilike('venue_name', v);
    const { data: config } = await qConfig;

    let qTiras = supabase
      .from('cancha_tira')
      .select('cancha_id, tira_informativa_id, orden, venue_name');
    if (v) qTiras = qTiras.ilike('venue_name', v);
    const { data: tiras } = await qTiras;

    const configNorm = (config || []).map((r: Record<string, unknown>) => ({
      ...r,
      cancha_id: normalizeCanchaIdKey(String(r.cancha_id || '')),
    }));
    const tirasNorm = (tiras || []).map((r: Record<string, unknown>) => ({
      ...r,
      cancha_id: normalizeCanchaIdKey(String(r.cancha_id || '')),
    }));

    return { ok: true, assignments, config: configNorm, tiras: tirasNorm };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al cargar asignaciones.' };
  }
}
