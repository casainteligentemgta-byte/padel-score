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
    .select('*, media_content(*)')
    .eq('cancha_id', canchaId)
    .order('orden', { ascending: true });

  if (!primary.error) return primary;

  return supabase
    .from('cancha_publicidad')
    .select('*, publicidad(*)')
    .eq('cancha_id', canchaId)
    .order('orden', { ascending: true });
}
