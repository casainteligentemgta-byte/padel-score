'use server';

import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { normalizeCanchaIdKey } from '@/lib/courtPlaylists';

type Err = { ok: false; error: string };

function serviceMissing(): Err {
  return {
    ok: false,
    error:
      'Servidor sin credenciales Supabase. Añade SUPABASE_SERVICE_ROLE_KEY en Vercel (Environment Variables) y vuelve a desplegar.',
  };
}

/** Columnas INTEGER en cancha_playlist_config: el cliente puede enviar decimales (p. ej. pausa 0.5 s). */
const PLAYLIST_CONFIG_INT_KEYS = new Set([
  'video_cambio_cada_minutos',
  'imagen_cambio_cada_minutos',
  'tira_cambio_cada_minutos',
  'imagen_pausa_entre_segundos',
]);

function sanitizePlaylistConfigPatch(patch: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(patch)) {
    if (PLAYLIST_CONFIG_INT_KEYS.has(key)) {
      out[key] = Math.max(0, Math.floor(Number(raw) || 0));
    } else if (key === 'imagen_loop') {
      out[key] = Boolean(raw);
    } else {
      out[key] = raw;
    }
  }
  return out;
}

/**
 * Las Server Actions no deben usar throw hacia el cliente en producción:
 * Next.js oculta el mensaje real. Devolvemos { ok, error } siempre.
 */

export async function addMediaContentAction(
  payload: Record<string, unknown>,
): Promise<{ ok: true; data: Record<string, unknown> } | Err> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return serviceMissing();
  try {
    const { error, data } = await supabase.from('media_content').insert([payload]).select().single();
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
  try {
    const { error } = await supabase.from('tira_informativa').insert({ mensaje, orden, activo: true });
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

export async function savePlaylistAction(
  courtKey: string,
  venueName: string,
  mediaIds: string[],
  slot: 'video' | 'imagen',
  durSeconds: number,
): Promise<{ ok: true } | Err> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return serviceMissing();

  const cleanCourtKey = courtKey.trim();
  const cleanVenueName = venueName.trim();

  try {
    const { error: delErr } = await supabase
      .from('cancha_publicidad')
      .delete()
      .eq('cancha_id', cleanCourtKey)
      .eq('venue_name', cleanVenueName)
      .or(`playlist_slot.eq.${slot},playlist_slot.is.null`);

    if (delErr) {
      console.error('Error al borrar playlist previa:', delErr);
      return { ok: false, error: `Al limpiar playlist: ${delErr.message}` };
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
        cancha_id: cleanCourtKey,
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
  const cleanCourtKey = courtKey.trim();

  try {
    const { error: delErr } = await supabase
      .from('cancha_tira')
      .delete()
      .eq('cancha_id', cleanCourtKey)
      .eq('venue_name', cleanVenueName);

    if (delErr) return { ok: false, error: delErr.message || 'No se pudo limpiar la tira.' };

    if (tiraIds.length > 0) {
      const rows = tiraIds.map((tid, i) => ({
        cancha_id: cleanCourtKey,
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
    const { error } = await supabase.from('cancha_playlist_config').upsert(
      {
        venue_name: venueName.trim(),
        cancha_id: canchaId.trim(),
        ...safePatch,
        updated_at: new Date().toISOString(),
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

    const { data: config } = await supabase.from('cancha_playlist_config').select('*').eq('venue_name', v || '');

    const { data: tiras } = await supabase
      .from('cancha_tira')
      .select('cancha_id, tira_informativa_id, orden, venue_name')
      .eq('venue_name', v || '');

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
