/** Con `venue_name` (migración 017+). */
const CANCHA_PUBLICIDAD_BASE_VENUE =
  'id, cancha_id, venue_name, media_id, orden, duracion_segundos';
/** Sin `venue_name` (tablas antiguas). */
const CANCHA_PUBLICIDAD_BASE = 'id, cancha_id, media_id, orden, duracion_segundos';

/**
 * Carga la playlist de publicidad por cancha.
 * Prueba `media_content`; si falla (FK), intenta `publicidad`.
 * Si falla por columna `venue_name` ausente, repite sin esa columna.
 */
export async function selectCanchaPublicidadPlaylist(
  supabase: { from: (t: string) => any },
  canchaId: string,
) {
  let res = await supabase
    .from('cancha_publicidad')
    .select(`${CANCHA_PUBLICIDAD_BASE_VENUE}, media_content(*)`)
    .eq('cancha_id', canchaId)
    .order('orden', { ascending: true });
  if (!res.error) return res;

  res = await supabase
    .from('cancha_publicidad')
    .select(`${CANCHA_PUBLICIDAD_BASE}, media_content(*)`)
    .eq('cancha_id', canchaId)
    .order('orden', { ascending: true });
  if (!res.error) return res;

  res = await supabase
    .from('cancha_publicidad')
    .select(`${CANCHA_PUBLICIDAD_BASE_VENUE}, publicidad(*)`)
    .eq('cancha_id', canchaId)
    .order('orden', { ascending: true });
  if (!res.error) return res;

  return supabase
    .from('cancha_publicidad')
    .select(`${CANCHA_PUBLICIDAD_BASE}, publicidad(*)`)
    .eq('cancha_id', canchaId)
    .order('orden', { ascending: true });
}
