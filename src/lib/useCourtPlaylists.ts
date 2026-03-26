'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  fetchCanchaPlaylistConfig,
  fetchCanchaPlaylistRows,
  fetchCanchaTiraMessages,
  partitionPlaylistRows,
  type CourtPlaylistRowDb,
} from '@/lib/courtPlaylists';

export type CourtPlaylistsState = {
  videoUrls: string[];
  imageItems: { url: string; duracionSeg: number }[];
  videoIndex: number;
  imageIndex: number;
  currentVideoUrl: string | null;
  currentImageUrl: string | null;
  imagenLoop: boolean;
  imagenPausaEntreSeg: number;
  tickerMessages: { id: string; mensaje: string }[];
  onVideoEnded: () => void;
  /** Para forzar reinicio si cambia la lista */
  videoKey: string;
  imageKey: string;
};

/**
 * Playlists separadas (vídeo secuencial, imágenes con duración + loop/pausa) y tira por cancha.
 * `venueName`: filtro por sede (misma URL que query `complex` o `venue` en /display/court).
 */
export function useCourtPlaylists(canchaId: string, venueName: string | null | undefined): CourtPlaylistsState {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [rows, setRows] = useState<CourtPlaylistRowDb[]>([]);
  const [imagenLoop, setImagenLoop] = useState(true);
  const [imagenPausa, setImagenPausa] = useState(0);
  const [tickerMessages, setTickerMessages] = useState<{ id: string; mensaje: string }[]>([]);
  const [videoIndex, setVideoIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  const load = useCallback(async () => {
    if (!supabase || !canchaId) {
      setRows([]);
      setTickerMessages([]);
      return;
    }
    const { data, error } = await fetchCanchaPlaylistRows(supabase, canchaId, venueName);
    if (error) {
      setRows([]);
    } else {
      setRows((data as unknown as CourtPlaylistRowDb[]) || []);
    }

    if (venueName?.trim()) {
      const cfg = await fetchCanchaPlaylistConfig(supabase, canchaId, venueName);
      if (cfg) {
        setImagenLoop(cfg.imagen_loop !== false);
        setImagenPausa(Math.max(0, Number(cfg.imagen_pausa_entre_segundos) || 0));
      } else {
        setImagenLoop(true);
        setImagenPausa(0);
      }
    } else {
      setImagenLoop(true);
      setImagenPausa(0);
    }

    const msgs = await fetchCanchaTiraMessages(supabase, canchaId, venueName);
    setTickerMessages(msgs);
  }, [supabase, canchaId, venueName]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!supabase || !canchaId) return;

    const ch = supabase
      .channel(`court_pl_${canchaId}_${venueName || 'all'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cancha_publicidad' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media_content' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cancha_playlist_config' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cancha_tira' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tira_informativa' }, load)
      .subscribe();

    return () => {
      ch.unsubscribe();
    };
  }, [supabase, canchaId, venueName, load]);

  const { video, imagen } = useMemo(() => partitionPlaylistRows(rows), [rows]);

  const videoUrls = useMemo(
    () =>
      video
        .map((r) => r.media_content?.url)
        .filter((u): u is string => Boolean(u)),
    [video],
  );

  const imageItems = useMemo(
    () =>
      imagen
        .map((r) => {
          const u = r.media_content?.url;
          if (!u) return null;
          return { url: u, duracionSeg: Math.max(1, Number(r.duracion_segundos ?? 10)) };
        })
        .filter(Boolean) as { url: string; duracionSeg: number }[],
    [imagen],
  );

  useEffect(() => {
    setVideoIndex(0);
  }, [videoUrls.join('|')]);

  useEffect(() => {
    setImageIndex(0);
  }, [imageItems.map((x) => x.url).join('|')]);

  useEffect(() => {
    if (!imageItems.length) return;
    setImageIndex((i) => Math.min(i, imageItems.length - 1));
  }, [imageItems.length]);

  useEffect(() => {
    if (!imageItems.length) return;
    const row = imageItems[imageIndex];
    if (!row) return;
    const ms = row.duracionSeg * 1000 + imagenPausa * 1000;
    const t = window.setTimeout(() => {
      setImageIndex((prev) => {
        const next = prev + 1;
        if (next >= imageItems.length) {
          return imagenLoop ? 0 : prev;
        }
        return next;
      });
    }, ms);
    return () => window.clearTimeout(t);
  }, [imageItems, imageIndex, imagenLoop, imagenPausa]);

  const onVideoEnded = useCallback(() => {
    if (videoUrls.length <= 1) return;
    setVideoIndex((i) => (i + 1) % videoUrls.length);
  }, [videoUrls.length]);

  const vi = videoUrls.length ? videoIndex % videoUrls.length : 0;
  const ii = imageItems.length ? Math.min(imageIndex, imageItems.length - 1) : 0;

  const currentVideoUrl = videoUrls.length ? videoUrls[vi] ?? null : null;
  const currentImageUrl = imageItems.length ? imageItems[ii]?.url ?? null : null;

  return {
    videoUrls,
    imageItems,
    videoIndex: vi,
    imageIndex: ii,
    currentVideoUrl,
    currentImageUrl,
    imagenLoop,
    imagenPausaEntreSeg: imagenPausa,
    tickerMessages,
    onVideoEnded,
    videoKey: `${vi}-${videoUrls[vi] || ''}`,
    imageKey: `${ii}-${imageItems[ii]?.url || ''}`,
  };
}
