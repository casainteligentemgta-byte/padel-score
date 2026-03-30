/** Columnas base de `cancha_publicidad` (sin `playlist_slot`: no todas las BD lo tienen). */
const CANCHA_PUBLICIDAD_BASE =
  'id, cancha_id, venue_name, media_id, orden, duracion_segundos';

/**
 * Carga la playlist de publicidad por cancha.
 * Prueba el embed `media_content`; si falla (nombre de FK distinto), intenta `publicidad`.
 */
export async function selectCanchaPublicidadPlaylist(
  supabase: { from: (t: string) => any },
  canchaId: string,
) {
  const primary = await supabase
    .from('cancha_publicidad')
    .select(`${CANCHA_PUBLICIDAD_BASE}, media_content(*)`)
    .eq('cancha_id', canchaId)
    .order('orden', { ascending: true });

  if (!primary.error) return primary;

  return supabase
    .from('cancha_publicidad')
    .select(`${CANCHA_PUBLICIDAD_BASE}, publicidad(*)`)
    .eq('cancha_id', canchaId)
    .order('orden', { ascending: true });
}
