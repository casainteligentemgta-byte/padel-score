'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

export type AdMode = 'fija' | 'programada' | 'carrusel';

export interface AdState {
  mode: AdMode;
  currentImageUrl: string | null;
  isVisible: boolean;
}

type PlaylistItem = {
  url: string;
  duracion_segundos: number;
  orden: number;
};

export function useAdBanner(canchaId?: string): AdState {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!supabase || !canchaId) {
      setPlaylist([]);
      setIndex(0);
      return;
    }

    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from('cancha_publicidad')
        .select('orden, duracion_segundos, media_content(url)')
        .eq('cancha_id', canchaId)
        .order('orden', { ascending: true });

      if (!mounted) return;
      if (error) {
        setPlaylist([]);
        setIndex(0);
        return;
      }

      const items: PlaylistItem[] = ((data as any[]) || [])
        .map((r) => ({
          url: String(r?.media_content?.url || ''),
          duracion_segundos: Number(r?.duracion_segundos || 10),
          orden: Number(r?.orden || 0),
        }))
        .filter((x) => !!x.url);

      setPlaylist(items);
      setIndex(0);
    };

    load();

    const ch = supabase
      .channel(`cancha_publicidad_${canchaId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cancha_publicidad', filter: `cancha_id=eq.${canchaId}` }, load)
      .subscribe();

    return () => {
      mounted = false;
      ch.unsubscribe();
    };
  }, [supabase, canchaId]);

  useEffect(() => {
    if (!playlist.length) return;
    const seconds = Math.max(1, Number(playlist[index]?.duracion_segundos || 10));
    const t = window.setTimeout(() => {
      setIndex((prev) => (prev + 1) % playlist.length);
    }, seconds * 1000);
    return () => window.clearTimeout(t);
  }, [playlist, index]);

  const current = playlist[index];
  return {
    mode: playlist.length > 1 ? 'carrusel' : 'fija',
    currentImageUrl: current?.url || null,
    isVisible: Boolean(current?.url),
  };
}

