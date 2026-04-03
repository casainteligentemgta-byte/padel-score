'use server'
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { normalizeCanchaIdKey } from '@/lib/courtPlaylists';

/**
 * Acciones para Admin Publicidad que evaden RLS usando el Service Role.
 */

// --- BIBLIOTECA MEDIA ---

export async function addMediaContentAction(payload: any) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) throw new Error('Servidor no configurado');
  const { error, data } = await supabase.from('media_content').insert([payload]).select().single();
  if (error) throw new Error(error.message);
  revalidatePath('/admin/publicidad');
  return data;
}

export async function deleteMediaAction(id: string) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) throw new Error('Servidor no configurado');
  const { error } = await supabase.from('media_content').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/publicidad');
}

export async function renameMediaAction(id: string, nombre: string) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) throw new Error('Servidor no configurado');
  const { error } = await supabase
    .from('media_content')
    .update({ nombre, nombre_sponsor: nombre.replace(/\.[^/.]+$/, '') })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/publicidad');
}

// --- TICKER ---

export async function addTickerAction(mensaje: string, orden: number) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) throw new Error('Servidor no configurado');
  const { error } = await supabase.from('tira_informativa').insert({ mensaje, orden, activo: true });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/publicidad');
}

export async function deleteTickerAction(id: string) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) throw new Error('Servidor no configurado');
  const { error } = await supabase.from('tira_informativa').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/publicidad');
}

// --- PLAYLISTS POR CANCHA ---

export async function savePlaylistAction(
  courtKey: string, 
  venueName: string, 
  mediaIds: string[], 
  slot: 'video' | 'imagen', 
  durSeconds: number
) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) throw new Error('Servidor no configurado');

  const cleanCourtKey = courtKey.trim();
  const cleanVenueName = venueName.trim();

  // 1. Borrar anteriores del mismo tipo de manera agresiva
  // Borramos los que coinciden con el slot O los que no tienen slot (migración legacy)
  const { error: delErr } = await supabase
    .from('cancha_publicidad')
    .delete()
    .eq('cancha_id', cleanCourtKey)
    .eq('venue_name', cleanVenueName)
    .or(`playlist_slot.eq.${slot},playlist_slot.is.null`);
  
  if (delErr) {
    console.error('Error al borrar playlist previa:', delErr);
    throw new Error(`Error al limpiar playlist previa: ${delErr.message}`);
  }

  // 2. Insertar nuevas (sin duplicados: mismo id dos veces rompe índices únicos por slot+orden)
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
    const rows = orderedUniqueIds.map((mid, i) => ({
      cancha_id: cleanCourtKey,
      venue_name: cleanVenueName,
      media_id: mid,
      orden: i + 1,
      duracion_segundos: durSeconds || 10,
      playlist_slot: slot
    }));
    
    const { error: insErr } = await supabase.from('cancha_publicidad').insert(rows);
    if (insErr) {
      console.error('Error al insertar nueva playlist:', insErr);
      throw new Error(`Error al guardar: ${insErr.message}`);
    }
  }

  revalidatePath('/admin/publicidad');
}

export async function saveTiraPlaylistAction(courtKey: string, venueName: string, tiraIds: string[]) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) throw new Error('Servidor no configurado');

  const cleanVenueName = venueName.trim();
  const cleanCourtKey = courtKey.trim();

  const { error: delErr } = await supabase
    .from('cancha_tira')
    .delete()
    .eq('cancha_id', cleanCourtKey)
    .eq('venue_name', cleanVenueName);
  
  if (delErr) throw new Error(delErr.message);

  if (tiraIds.length > 0) {
    const rows = tiraIds.map((tid, i) => ({
      cancha_id: cleanCourtKey,
      venue_name: cleanVenueName,
      tira_informativa_id: tid,
      orden: i + 1
    }));
    const { error: insErr } = await supabase.from('cancha_tira').insert(rows);
    if (insErr) throw new Error(insErr.message);
  }

  revalidatePath('/admin/publicidad');
}

export async function upsertPlaylistConfigAction(venueName: string, canchaId: string, patch: any) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) throw new Error('Servidor no configurado');

  const { error } = await supabase.from('cancha_playlist_config').upsert({
    venue_name: venueName.trim(),
    cancha_id: canchaId.trim(),
    ...patch,
    updated_at: new Date().toISOString()
  }, { onConflict: 'venue_name,cancha_id' });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/publicidad');
}

export async function fetchAssignmentsAction(venueName?: string, keys?: string[]) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) throw new Error('Servidor no configurado');

  const v = venueName?.trim();
  let q = supabase
    .from('cancha_publicidad')
    .select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, media_content(*)');
  
  if (v) q = q.ilike('venue_name', v);
  if (keys && keys.length > 0) q = q.in('cancha_id', keys);

  const { data, error } = await q.order('orden', { ascending: true });
  if (error) {
    console.error('Error in fetchAssignmentsAction:', error);
    throw new Error(error.message);
  }

  const assignments = (data || []).map((r: any) => ({
    ...r,
    venue_name: (r.venue_name || '').trim(),
    cancha_id: normalizeCanchaIdKey(r.cancha_id),
  }));

  // Cargar configuración de todas las canchas para este venue para evitar filtros complejos en loop
  const { data: config } = await supabase
    .from('cancha_playlist_config')
    .select('*')
    .eq('venue_name', v || '');
  
  // Y tiras
  const { data: tiras } = await supabase
    .from('cancha_tira')
    .select('cancha_id, tira_informativa_id, orden, venue_name')
    .eq('venue_name', v || '');

  const configNorm = (config || []).map((r: any) => ({
    ...r,
    cancha_id: normalizeCanchaIdKey(r.cancha_id),
  }));
  const tirasNorm = (tiras || []).map((r: any) => ({
    ...r,
    cancha_id: normalizeCanchaIdKey(r.cancha_id),
  }));

  return { assignments, config: configNorm, tiras: tirasNorm };
}
