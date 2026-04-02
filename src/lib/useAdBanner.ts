'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { selectCanchaPublicidadPlaylist } from '@/lib/canchaPublicidadQuery';

export type AdMode = 'fija' | 'programada' | 'carrusel';

export interface AdState {
  mode: AdMode;
  /** URL actual (imagen o video); compatible con pantallas que solo usan currentImageUrl */
  currentImageUrl: string | null;
  currentMediaUrl: string | null;
  currentMediaKind: 'image' | 'video' | null;
  isVisible: boolean;
}

type PlaylistItem = {
  url: string;
  duracion_segundos: number;
  orden: number;
  kind: 'image' | 'video';
};

function rowMedia(row: any): { url: string; kind: 'image' | 'video' } | null {
  const m = row?.media_content ?? row?.publicidad;
  if (!m?.url) return null;
  const tipo = String(m.tipo || '');
  const isVid =
    tipo.includes('video') ||
    tipo === 'video_url' ||
    tipo === 'video_file' ||
    /\.(mp4|webm|mov|m4v)(\?|$)/i.test(String(m.url));
  return { url: String(m.url), kind: isVid ? 'video' : 'image' };
}

/**
 * Playlist por cancha: tabla `cancha_publicidad` con embed `media_content` o `publicidad`,
 * `.eq('cancha_id', canchaId).order('orden', { ascending: true })`.
 */
export function useAdBanner(canchaId?: string | null, venueName?: string | null): AdState {
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
      const { data, error } = await selectCanchaPublicidadPlaylist(supabase, canchaId, venueName);
      if (!mounted) return;
      if (error || !data) {
        setPlaylist([]);
        setIndex(0);
        return;
      }

      const items: PlaylistItem[] = (data as any[])
        .map((r) => {
          const m = rowMedia(r);
          if (!m) return null;
          return {
            url: m.url,
            kind: m.kind,
            duracion_segundos: Math.max(1, Number(r.duracion_segundos ?? 10)),
            orden: Number(r.orden ?? 0),
          };
        })
        .filter(Boolean) as PlaylistItem[];

      setPlaylist(items);
      setIndex(0);
    };

    load();

    const filter = venueName 
      ? `and(cancha_id.eq.${canchaId},venue_name.ilike.${venueName})`
      : `cancha_id.eq.${canchaId}`;

    const ch = supabase
      .channel(`cancha_publicidad_${canchaId}_${venueName || 'global'}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'cancha_publicidad', 
        filter: filter 
      }, load)
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
  const url = current?.url || null;
  const kind = current?.kind || null;

  return {
    mode: playlist.length > 1 ? 'carrusel' : 'fija',
    currentImageUrl: url,
    currentMediaUrl: url,
    currentMediaKind: kind,
    isVisible: Boolean(url),
  };
}
