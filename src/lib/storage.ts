import { createClient } from '@/lib/supabase/client';

const BUCKET = 'publicidad';

/**
 * Sube un archivo al bucket "publicidad" de Supabase Storage.
 * Devuelve la URL pública del archivo.
 */
export async function uploadToSupabase(
  file: File,
  path?: string
): Promise<string> {
  const supabase = createClient();
  const name = path || `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

  const { error } = await supabase.storage.from(BUCKET).upload(name, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(name);
  return publicUrl;
}

/**
 * Elimina un archivo del bucket por su path (ej. "1234-video.mp4").
 */
export async function deleteFromSupabase(path: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
