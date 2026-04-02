/** Con `venue_name` (migración 017+). */
const CANCHA_PUBLICIDAD_BASE_VENUE =
  'id, cancha_id, venue_name, media_id, orden, duracion_segundos, posicion_pantalla';
/** Sin `venue_name` (tablas antiguas). */
const CANCHA_PUBLICIDAD_BASE = 'id, cancha_id, media_id, orden, duracion_segundos, posicion_pantalla';

/**
 * Carga la playlist de publicidad por cancha.
 * Prueba `media_content`; si falla (FK), intenta `publicidad`.
 * Si falla por columna `venue_name` ausente, repite sin esa columna.
 */
export async function selectCanchaPublicidadPlaylist(
  supabase: { from: (t: string) => any },
  canchaId: string,
  venueName?: string | null,
) {
  const vn = venueName?.trim() || null;

  let res = await (() => {
    let q = supabase
      .from('cancha_publicidad')
      .select(`${CANCHA_PUBLICIDAD_BASE_VENUE}, media_content(*)`)
      .eq('cancha_id', canchaId);
    if (vn) q = q.eq('venue_name', vn);
    return q.order('orden', { ascending: true });
  })();
  if (!res.error) return res;

  res = await (() => {
    let q = supabase
      .from('cancha_publicidad')
      .select(`${CANCHA_PUBLICIDAD_BASE}, media_content(*)`)
      .eq('cancha_id', canchaId);
    if (vn) q = q.eq('venue_name', vn);
    return q.order('orden', { ascending: true });
  })();
  if (!res.error) return res;

  res = await (() => {
    let q = supabase
      .from('cancha_publicidad')
      .select(`${CANCHA_PUBLICIDAD_BASE_VENUE}, publicidad(*)`)
      .eq('cancha_id', canchaId);
    if (vn) q = q.eq('venue_name', vn);
    return q.order('orden', { ascending: true });
  })();
  if (!res.error) return res;

  let q = supabase
    .from('cancha_publicidad')
    .select(`${CANCHA_PUBLICIDAD_BASE}, publicidad(*)`)
    .eq('cancha_id', canchaId);
  if (vn) q = q.eq('venue_name', vn);
  return q.order('orden', { ascending: true });
}
