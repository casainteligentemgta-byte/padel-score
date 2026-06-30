'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  fetchCanchaPlaylistConfig,
  fetchCanchaPlaylistRowsForVenues,
  fetchCanchaTiraMessages,
  normalizeCourtPlaylistRows,
  partitionPlaylistRows,
  type CourtPlaylistRowDb,
} from '@/lib/courtPlaylists';

export type CourtPlaylistsState = {
  rows: CourtPlaylistRowDb[];
  videoUrls: string[];
  imageItems: { url: string; duracionSeg: number }[];
  videoIndex: number;
  imageIndex: number;
  currentVideoUrl: string | null;
  currentImageUrl: string | null;
  imagenLoop: boolean;
  imagenPausaEntreSeg: number;
  /** >0: avanzar vídeo cada N minutos (timer); 0: avanzar al terminar el clip */
  videoCambioCadaMinutos: number;
  /** true si hay que usar loop en el <video> y no confiar solo en onEnded */
  videoAdvanceByTimer: boolean;
  tickerMessages: { id: string; mensaje: string }[];
  onVideoEnded: () => void;
  /** Para forzar reinicio si cambia la lista */
  videoKey: string;
  imageKey: string;
};

/**
 * Playlists separadas (vídeo secuencial, imágenes con duración + loop/pausa) y tira por cancha.
 * `venueName`: filtro por sede (misma URL que query `complex` o `venue` en /display/court).
 * `venueFallbacks`: sedes alternativas si la principal no tiene medios (p. ej. Express → torneo).
 */
export function useCourtPlaylists(
  canchaId: string,
  venueName: string | null | undefined,
  venueFallbacks?: (string | null | undefined)[],
): CourtPlaylistsState {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [rows, setRows] = useState<CourtPlaylistRowDb[]>([]);
  const [imagenLoop, setImagenLoop] = useState(true);
  const [imagenPausa, setImagenPausa] = useState(0);
  const [videoCambioMinutos, setVideoCambioMinutos] = useState(0);
  const [imagenCambioMinutos, setImagenCambioMinutos] = useState(0);
  const [tickerMessages, setTickerMessages] = useState<{ id: string; mensaje: string }[]>([]);
  const [videoIndex, setVideoIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  const venueCandidates = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    const add = (v: string | null | undefined) => {
      const t = String(v ?? '').trim();
      if (!t) return;
      const k = t.toLowerCase();
      if (seen.has(k)) return;
      seen.add(k);
      out.push(t);
    };
    add(venueName);
    for (const f of venueFallbacks ?? []) add(f);
    return out;
  }, [venueName, venueFallbacks]);

  const resolvedVenueName = venueCandidates[0] ?? venueName ?? null;
  const venueCandidatesKey = useMemo(() => venueCandidates.join('\x1e'), [venueCandidates]);
  const venueCandidatesRef = useRef(venueCandidates);
  venueCandidatesRef.current = venueCandidates;
  const loadDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    const venues = venueCandidatesRef.current;
    if (!supabase || !canchaId) {
      setRows([]);
      setTickerMessages([]);
      return;
    }
    const { data, error } = await fetchCanchaPlaylistRowsForVenues(supabase, canchaId, venues);
    if (error) {
      console.error('[useCourtPlaylists] fetch error:', error.message, { canchaId, venues });
    } else {
      const next = normalizeCourtPlaylistRows((data as unknown[]) || []);
      setRows((prev) => (next.length > 0 ? next : prev));
    }

    const cfgVenue = resolvedVenueName?.trim();
    if (cfgVenue) {
      const cfg = await fetchCanchaPlaylistConfig(supabase, canchaId, cfgVenue);
      if (cfg) {
        setImagenLoop(cfg.imagen_loop !== false);
        setImagenPausa(Math.max(0, Math.floor(Number(cfg.imagen_pausa_entre_segundos) || 0)));
        setVideoCambioMinutos(Math.max(0, Math.floor(Number(cfg.video_cambio_cada_minutos) || 0)));
        setImagenCambioMinutos(Math.max(0, Math.floor(Number(cfg.imagen_cambio_cada_minutos) || 0)));
      } else {
        setImagenLoop(true);
        setImagenPausa(0);
        setVideoCambioMinutos(0);
        setImagenCambioMinutos(0);
      }
    } else {
      setImagenLoop(true);
      setImagenPausa(0);
      setVideoCambioMinutos(0);
      setImagenCambioMinutos(0);
    }

    const msgs = await fetchCanchaTiraMessages(supabase, canchaId, resolvedVenueName);
    setTickerMessages((prev) => (msgs.length > 0 ? msgs : prev));
  }, [supabase, canchaId, venueCandidatesKey, resolvedVenueName]);

  const scheduleLoad = useCallback(() => {
    if (loadDebounceRef.current) clearTimeout(loadDebounceRef.current);
    loadDebounceRef.current = setTimeout(() => {
      loadDebounceRef.current = null;
      void load();
    }, 400);
  }, [load]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!supabase || !canchaId) return;

    const ch = supabase
      .channel(`court_pl_${canchaId}_${resolvedVenueName || 'all'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cancha_publicidad' }, scheduleLoad)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media_content' }, scheduleLoad)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cancha_playlist_config' }, scheduleLoad)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cancha_tira' }, scheduleLoad)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tira_informativa' }, scheduleLoad)
      .subscribe();

    return () => {
      if (loadDebounceRef.current) clearTimeout(loadDebounceRef.current);
      ch.unsubscribe();
    };
  }, [supabase, canchaId, resolvedVenueName, scheduleLoad]);

  const { video, imagen } = useMemo(() => partitionPlaylistRows(rows), [rows]);

  const videoUrls = useMemo(
    () =>
      video
        .map((r) => r.media_content?.url)
        .filter((u): u is string => Boolean(u)),
    [video],
  );

  const imageItems = useMemo(() => {
    const secEach = imagenCambioMinutos > 0 ? imagenCambioMinutos * 60 : null;
    return imagen
      .map((r) => {
        const u = r.media_content?.url;
        if (!u) return null;
        const dur = secEach ?? Math.max(1, Number(r.duracion_segundos ?? 10));
        return { url: u, duracionSeg: dur };
      })
      .filter(Boolean) as { url: string; duracionSeg: number }[];
  }, [imagen, imagenCambioMinutos]);

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

  useEffect(() => {
    if (!imageItems.length) return;
    const nextIdx = (imageIndex + 1) % imageItems.length;
    const nextUrl = imageItems[nextIdx]?.url;
    if (!nextUrl) return;
    const img = new window.Image();
    img.src = nextUrl;
  }, [imageItems, imageIndex]);

  const videoAdvanceByTimer = videoCambioMinutos > 0 && videoUrls.length > 0;

  useEffect(() => {
    if (!videoUrls.length || videoCambioMinutos <= 0) return;
    const ms = videoCambioMinutos * 60 * 1000;
    const id = window.setInterval(() => {
      setVideoIndex((i) => (i + 1) % videoUrls.length);
    }, ms);
    return () => window.clearInterval(id);
  }, [videoUrls.join('|'), videoCambioMinutos, videoUrls.length]);

  const onVideoEnded = useCallback(() => {
    if (videoUrls.length <= 1) return;
    setVideoIndex((i) => (i + 1) % videoUrls.length);
  }, [videoUrls.length]);

  const vi = videoUrls.length ? videoIndex % videoUrls.length : 0;
  const ii = imageItems.length ? Math.min(imageIndex, imageItems.length - 1) : 0;

  const currentVideoUrl = videoUrls.length ? videoUrls[vi] ?? null : null;
  const currentImageUrl = imageItems.length ? imageItems[ii]?.url ?? null : null;

  return {
    rows,
    videoUrls,
    imageItems,
    videoIndex: vi,
    imageIndex: ii,
    currentVideoUrl,
    currentImageUrl,
    imagenLoop,
    imagenPausaEntreSeg: imagenPausa,
    videoCambioCadaMinutos: videoCambioMinutos,
    videoAdvanceByTimer,
    tickerMessages,
    onVideoEnded,
    videoKey: `${vi}-${videoUrls[vi] || ''}`,
    imageKey: `${ii}-${imageItems[ii]?.url || ''}`,
  };
}
