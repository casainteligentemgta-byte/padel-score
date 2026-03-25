import { getSupabaseClient } from '@/lib/supabase/client';

/** Registra fallo de reproducción de video en pizarra (tabla error_logs). */
export function logDisplayVideoError(canchaId: string, mediaUrl: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  let archivoNombre = '';
  try {
    const u = new URL(mediaUrl, typeof window !== 'undefined' ? window.location.origin : 'https://localhost');
    archivoNombre = u.pathname.split('/').pop() || mediaUrl;
  } catch {
    archivoNombre = mediaUrl.split('/').pop() || mediaUrl;
  }
  void supabase.from('error_logs').insert({
    cancha_id: canchaId,
    archivo_nombre: archivoNombre,
    archivo_url: mediaUrl,
    mensaje: 'video_onError',
  });
}
