'use client';

/**
 * SmartDisplay — pizarra TV con layout dinámico por template.
 *
 * Arquitectura:
 *  • Suscripción dual:
 *    1. Supabase: tabla `tournament_matches` → refresh de datos de partido.
 *    2. Supabase: tabla `canchas`            → recarga de template en vivo.
 *  • Firebase RTDB: `canchas/${canchaId}`   → marcador en tiempo real (canal rápido).
 *  • El layout CSS grid se recalcula desde los campos del DisplayTemplate:
 *    header_vh / score_vh / media_vh / ticker_vh.
 *  • orientation + split_ratio: en landscape columnas (vídeo|carousel); en portrait filas.
 *  • font_scale + --pizarra-font-scale (en portrait ~0,85×) para la base tipográfica.
 *  • split_ratio en UI (0–1); en BD suele ser entero 0–100.
 *  • SmartClock usa la fuente Orbitron cuando clock_style === 'classic' (digital).
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { CourtAdVideoOrIframe } from '@/components/CourtAdVideoOrIframe';
import SponsorCarousel from '@/components/publicidad/SponsorCarousel';
import { splitRatioFromDatabase } from '@/lib/displayTemplateSplitRatio';
import {
  canchaIdCandidates,
  canchaIdStoredForPublicidadTables,
  fetchCanchaPlaylistRows,
  normalizeCourtPlaylistRows,
  partitionPlaylistRows,
} from '@/lib/courtPlaylists';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DisplayTemplate {
  id: string;
  name: string;
  header_vh: number;
  score_vh: number;
  media_vh: number;
  ticker_vh: number;
  /** Float 0-1: fracción de ancho del slot de vídeo (izquierda). */
  split_ratio: number;
  /** 'modern' = bold italic | 'classic' = Orbitron digital | 'minimal' = thin */
  clock_style: 'modern' | 'classic' | 'minimal';
  clock_color: string;
  /** landscape = vídeo|carrusel en columnas; portrait = vídeo arriba, carrusel abajo (filas). */
  orientation: 'landscape' | 'portrait';
  /** Escala base; la UI aplica --pizarra-font-scale (en portrait suele reducirse ligeramente). */
  font_scale: number;
}

interface MatchData {
  playerA1?: string;
  playerA2?: string;
  playerB1?: string;
  playerB2?: string;
  currentPointsA?: string | number;
  currentPointsB?: string | number;
  setsA?: number;
  setsB?: number;
  gamesA?: number;
  gamesB?: number;
  prevSets?: string[];
  serverTeam?: 'A' | 'B';
  isGoldPoint?: boolean;
  tournamentName?: string;
  tournamentCategory?: string;
  tournamentPhase?: string;
  elapsedSeconds?: number;
  temperatureC?: number | string;
  tickerMessages?: { id: string; mensaje: string }[];
}

interface SmartDisplayProps {
  /** ID de la cancha (ej. "cancha_1" o "1"). Usado para suscripciones y playlists. */
  canchaId: string;
  /** ID del torneo para suscripción en tiempo real a tournament_matches. */
  tournamentId?: string;
  /** ID del partido activo en esta pizarra. */
  matchId?: string;
  /** Template a usar cuando canchas.current_template_id sea null. */
  defaultTemplate?: DisplayTemplate;
  /** Datos iniciales del partido (SSR/ISR prop). */
  initialMatchData?: MatchData;
  /** Color de marca por defecto. */
  smartPadelColor?: string;
  /** Nombre de la sede para playlists de publicidad. */
  venueName?: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_TEMPLATE: DisplayTemplate = {
  id: 'default',
  name: 'Default 10/23/59/8',
  header_vh: 10,
  score_vh: 23,
  media_vh: 59,
  ticker_vh: 8,
  split_ratio: 0.5,
  clock_style: 'modern',
  clock_color: '#ccff00',
  orientation: 'landscape',
  font_scale: 1,
};

function normalizeDisplayTemplateFromRow(row: Record<string, unknown>): DisplayTemplate {
  const split_ratio = splitRatioFromDatabase(row.split_ratio);
  const orientation: 'landscape' | 'portrait' =
    row.orientation === 'portrait' ? 'portrait' : 'landscape';
  let font_scale = Number(row.font_scale);
  if (!Number.isFinite(font_scale) || font_scale <= 0) font_scale = 1;
  font_scale = Math.min(4, Math.max(0.5, font_scale));

  return {
    id: String(row.id ?? DEFAULT_TEMPLATE.id),
    name: String(row.name ?? DEFAULT_TEMPLATE.name),
    header_vh: Number(row.header_vh) || DEFAULT_TEMPLATE.header_vh,
    score_vh: Number(row.score_vh) || DEFAULT_TEMPLATE.score_vh,
    media_vh: Number(row.media_vh) || DEFAULT_TEMPLATE.media_vh,
    ticker_vh: Number(row.ticker_vh) || DEFAULT_TEMPLATE.ticker_vh,
    split_ratio,
    clock_style: (['modern', 'classic', 'minimal'] as const).includes(
      row.clock_style as DisplayTemplate['clock_style'],
    )
      ? (row.clock_style as DisplayTemplate['clock_style'])
      : 'modern',
    clock_color: String(row.clock_color ?? DEFAULT_TEMPLATE.clock_color),
    orientation,
    font_scale,
  };
}

// ─── SmartDisplay ─────────────────────────────────────────────────────────────

export default function SmartDisplay({
  canchaId,
  tournamentId,
  matchId,
  defaultTemplate,
  initialMatchData,
  smartPadelColor = '#ccff00',
  venueName,
}: SmartDisplayProps) {
  const supabase = getSupabaseClient();

  // ── State ──────────────────────────────────────────────────────────────────
  const [template, setTemplate] = useState<DisplayTemplate>(() =>
    normalizeDisplayTemplateFromRow({
      ...DEFAULT_TEMPLATE,
      ...(defaultTemplate ?? {}),
    } as Record<string, unknown>),
  );
  const [match, setMatch] = useState<MatchData>(initialMatchData ?? {});
  const [adsPlaylist, setAdsPlaylist] = useState<string[]>([]);
  const [carouselPlaylist, setCarouselPlaylist] = useState<string[]>([]);
  const [carouselDurations, setCarouselDurations] = useState<number[]>([]);
  const [currentAdIdx, setCurrentAdIdx] = useState(0);
  const [currentCarouselIdx, setCurrentCarouselIdx] = useState(0);

  const templateIdRef = useRef<string | null>(null);

  // ── Fetch template by ID ───────────────────────────────────────────────────
  const loadTemplate = useCallback(
    async (templateId: string) => {
      if (!supabase) return;
      if (templateIdRef.current === templateId) return; // no-op si ya está cargado
      const { data, error } = await supabase
        .from('display_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      if (!error && data) {
        templateIdRef.current = templateId;
        setTemplate(normalizeDisplayTemplateFromRow(data as Record<string, unknown>));
      }
    },
    [supabase],
  );

  // ── Fetch playlists from cancha_publicidad ─────────────────────────────────
  const loadPlaylists = useCallback(async () => {
    if (!supabase) return;
    const result = await fetchCanchaPlaylistRows(supabase as any, canchaId, venueName);
    if (result.error || !result.data) return;
    const rows = normalizeCourtPlaylistRows((result.data as unknown[]) || []);
    const { video, imagen } = partitionPlaylistRows(rows);
    setAdsPlaylist(video.map((r) => r.media_content?.url ?? '').filter(Boolean));
    const imgUrls = imagen.map((r) => r.media_content?.url ?? '').filter(Boolean);
    const imgDurs = imagen.map((r) => r.duracion_segundos ?? 8);
    setCarouselPlaylist(imgUrls);
    setCarouselDurations(imgDurs);
    setCurrentAdIdx(0);
    setCurrentCarouselIdx(0);
  }, [supabase, canchaId, venueName]);

  // ── Fetch match data ───────────────────────────────────────────────────────
  const loadMatch = useCallback(async () => {
    if (!supabase || !tournamentId || !matchId) return;
    const { data, error } = await supabase
      .from('tournament_matches')
      .select('data')
      .eq('tournament_id', tournamentId)
      .eq('id', matchId)
      .single();
    if (error || !data) return;
    const d = (data as any).data ?? {};
    let pa1 = d.team1?.p1?.name ?? '';
    let pa2 = d.team1?.p2?.name ?? '';
    if (!pa1 && d.team1Name && String(d.team1Name).includes('/')) {
      const parts = String(d.team1Name).split('/');
      pa1 = parts[0].trim();
      pa2 = parts[1] ? parts[1].trim() : pa2;
    } else if (!pa1) {
      pa1 = d.team1Name ?? 'JUGADOR 1';
      if (!pa2) pa2 = 'JUGADOR 2';
    } else if (!pa2) {
      pa2 = '';
    }

    let pb1 = d.team2?.p1?.name ?? '';
    let pb2 = d.team2?.p2?.name ?? '';
    if (!pb1 && d.team2Name && String(d.team2Name).includes('/')) {
      const parts = String(d.team2Name).split('/');
      pb1 = parts[0].trim();
      pb2 = parts[1] ? parts[1].trim() : pb2;
    } else if (!pb1) {
      pb1 = d.team2Name ?? 'JUGADOR 3';
      if (!pb2) pb2 = 'JUGADOR 4';
    } else if (!pb2) {
      pb2 = '';
    }

    setMatch({
      playerA1: pa1,
      playerA2: pa2,
      playerB1: pb1,
      playerB2: pb2,
      currentPointsA: d.points?.local ?? d.currentPointsA ?? '0',
      currentPointsB: d.points?.visitante ?? d.currentPointsB ?? '0',
      setsA: d.sets?.local ?? d.sets?.t1 ?? 0,
      setsB: d.sets?.visitante ?? d.sets?.t2 ?? 0,
      gamesA: d.games?.local ?? 0,
      gamesB: d.games?.visitante ?? 0,
      prevSets: d.setScores?.map((s: any) => `${s.t1 ?? s.team1 ?? 0}-${s.t2 ?? s.team2 ?? 0}`) ?? [],
      serverTeam: d.saque?.equipo === 2 ? 'B' : 'A',
      isGoldPoint: d.golden_point ?? false,
      tournamentName: d.tournamentName ?? 'SMART PADEL',
      tournamentCategory: d.category ?? d.tournamentCategory ?? '',
      tournamentPhase: d.phase ?? d.tournamentPhase ?? '',
      tickerMessages: [],
    });
  }, [supabase, tournamentId, matchId]);

  // ── Suscripción a cancha en Supabase (para detectar cambio de template) ────
  useEffect(() => {
    if (!supabase) return;

    let templateSub: ReturnType<typeof supabase.channel> | null = null;
    let canchaSub: ReturnType<typeof supabase.channel> | null = null;

    // Carga inicial: PK compuesta (venue_name, cancha_id) — misma lógica que pizarra torneo
    const init = async () => {
      const preferredVenue = String(venueName ?? '').trim();
      const storageCanchaId = canchaIdStoredForPublicidadTables(canchaId);
      const keys = canchaIdCandidates(storageCanchaId);

      let canchaData: {
        cancha_id: string;
        venue_name?: string | null;
        current_template_id: string | null;
      } | null = null;

      if (keys.length) {
        if (preferredVenue) {
          const { data: r1 } = await supabase
            .from('canchas')
            .select('cancha_id, venue_name, current_template_id')
            .eq('venue_name', preferredVenue)
            .in('cancha_id', keys)
            .limit(1);
          canchaData = r1?.[0] ?? null;
        }
        if (!canchaData) {
          const { data: r2 } = await supabase
            .from('canchas')
            .select('cancha_id, venue_name, current_template_id')
            .eq('venue_name', '')
            .in('cancha_id', keys)
            .limit(1);
          canchaData = r2?.[0] ?? null;
        }
      }

      if (canchaData?.current_template_id) {
        await loadTemplate(canchaData.current_template_id);
      }
      await loadPlaylists();
      await loadMatch();

      const filterCanchaId = String(canchaData?.cancha_id || storageCanchaId);
      const watchVenue = String(canchaData?.venue_name ?? (preferredVenue || '')).trim();

      canchaSub = supabase
        .channel(`smart_display_cancha_${watchVenue}_${filterCanchaId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'canchas',
            filter: `cancha_id=eq.${filterCanchaId}`,
          },
          async (payload) => {
            const row = payload.new as { venue_name?: string | null; current_template_id?: string | null };
            if (String(row?.venue_name ?? '').trim() !== watchVenue) return;
            const newTemplateId = row?.current_template_id ?? null;
            if (newTemplateId) await loadTemplate(newTemplateId);
            await loadPlaylists();
          },
        )
        .subscribe();
    };
    init();

    return () => {
      if (canchaSub) supabase.removeChannel(canchaSub);
      if (templateSub) supabase.removeChannel(templateSub);
    };
  }, [supabase, canchaId, venueName, loadTemplate, loadPlaylists, loadMatch]);

  // ── Suscripción a display_templates (para cuando cambian valores del template activo) ─
  useEffect(() => {
    if (!supabase || template.id === 'default') return;
    const templateSub = supabase
      .channel(`smart_display_template_${template.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'display_templates',
          filter: `id=eq.${template.id}`,
        },
        (payload) => {
          setTemplate(normalizeDisplayTemplateFromRow(payload.new as Record<string, unknown>));
          templateIdRef.current = (payload.new as { id?: string })?.id ?? null;
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(templateSub);
    };
  }, [supabase, template.id]);

  // ── Suscripción a tournament_matches (datos del partido) ───────────────────
  useEffect(() => {
    if (!supabase || !tournamentId || !matchId) return;

    const matchChannel = supabase
      .channel(`smart_display_match_${tournamentId}_${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_matches',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        async () => {
          // Full reload para consistencia (patrón del proyecto)
          await loadMatch();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchChannel);
    };
  }, [supabase, tournamentId, matchId, loadMatch]);

  // ── Carousel timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (carouselPlaylist.length <= 1) return;
    const dur = (carouselDurations[currentCarouselIdx] ?? 8) * 1000;
    const id = window.setTimeout(() => {
      setCurrentCarouselIdx((prev) => (prev + 1) % carouselPlaylist.length);
    }, dur);
    return () => window.clearTimeout(id);
  }, [carouselPlaylist, currentCarouselIdx, carouselDurations]);

  // ── Derived grid string from template ─────────────────────────────────────
  const gridTemplateRows = `${template.header_vh}vh ${template.score_vh}vh ${template.media_vh}vh ${template.ticker_vh}vh`;

  /** Entero 0–100: en landscape = fracción del ancho del vídeo; en portrait = fracción del alto. */
  const splitRounded = Math.round(splitRatioFromDatabase(template.split_ratio) * 100);
  const splitPercent = Number.isFinite(splitRounded)
    ? Math.min(100, Math.max(0, splitRounded))
    : 50;

  const isPortrait = template.orientation === 'portrait';
  const pizarraFontScale = isPortrait ? template.font_scale * 0.85 : template.font_scale;

  const {
    playerA1 = 'JUGADOR 1',
    playerA2 = 'JUGADOR 2',
    playerB1 = 'JUGADOR 3',
    playerB2 = 'JUGADOR 4',
    currentPointsA = '0',
    currentPointsB = '0',
    setsA = 0,
    setsB = 0,
    gamesA = 0,
    gamesB = 0,
    prevSets = [],
    serverTeam = 'A',
    isGoldPoint = false,
    tournamentName = 'SMART PADEL',
    tournamentCategory = '',
    tournamentPhase = '',
    elapsedSeconds,
    temperatureC,
    tickerMessages = [],
  } = match;

  const [headerNow, setHeaderNow] = useState(new Date());
  const [elapsedSec, setElapsedSec] = useState<number>(Math.max(0, Number(elapsedSeconds) || 0));

  useEffect(() => {
    setElapsedSec(Math.max(0, Number(elapsedSeconds) || 0));
  }, [elapsedSeconds, matchId]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setHeaderNow(new Date());
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const courtNumber = String(canchaId ?? '').match(/\d+/)?.[0] ?? String(canchaId ?? '').trim();
  const courtLabel = courtNumber ? `PISTA ${courtNumber}` : 'PISTA';
  const [categoryLabelRaw, genderLabelRaw] = String(tournamentCategory || '')
    .split('/')
    .map((v) => v.trim());
  const categoryLabel = categoryLabelRaw || 'CATEGORIA';
  const genderLabel = genderLabelRaw || tournamentPhase || 'GENERO';
  const venueLabel = String(venueName || '').trim() || 'SEDE';
  const tournamentLabel = String(tournamentName || '').trim() || 'TORNEO';
  const dateLabel = headerNow
    .toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long' })
    .toUpperCase();
  const hourLabel = headerNow.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const temperatureLabel = Number.isFinite(Number(temperatureC))
    ? `${Math.round(Number(temperatureC))}°C`
    : '--°C';
  const elapsedLabel = `${String(Math.floor(elapsedSec / 60)).padStart(2, '0')}:${String(
    elapsedSec % 60,
  ).padStart(2, '0')}`;

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-[#08080c] text-white font-outfit overflow-hidden select-none">
      {/* Ambient glow background */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-20">
        <div
          className="absolute top-[-20%] left-[-10%] h-[50%] w-[50%] rounded-full blur-[150px]"
          style={{ backgroundColor: `${smartPadelColor}22` }}
        />
        <div className="absolute bottom-[-20%] right-[-10%] h-[50%] w-[50%] bg-blue-600/10 blur-[150px]" />
      </div>

      {/*
       * Dynamic Grid — rows vinculadas al template activo.
       * Framer-motion no puede interpolar grid-template-rows directamente,
       * por lo que usamos un AnimatePresence con key={template.id} para
       * hacer un cross-fade suave entre un layout y otro cuando el template
       * cambie (equivalente a score_vh cambia → fade out / fade in).
       */}
      <AnimatePresence mode="wait">
      <motion.div
        key={template.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="relative z-10 h-full w-full overflow-hidden transition-all duration-700"
        style={{
          display: 'grid',
          gridTemplateRows,
          // --neon-color se hereda por todos los hijos: .glow-neon y cualquier
          // uso de var(--neon-color) en el marcador. El Admin puede cambiarlo
          // guardando un color distinto en display_templates.clock_color (DB).
          '--neon-color': smartPadelColor,
          ['--pizarra-font-scale' as string]: String(pizarraFontScale),
          fontSize: 'calc(1rem * var(--pizarra-font-scale))',
        } as React.CSSProperties}
      >
        {/* ── ROW 1: HEADER ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-start px-8 lg:px-16 py-3 border-b border-white/10 bg-black/55 backdrop-blur-2xl gap-4">
          {/* Izquierda: pista + categoria/genero */}
          <div className="flex flex-col items-start gap-1 min-w-0">
            <span
              className="text-2xl lg:text-3xl font-black italic uppercase tracking-tight leading-none"
              style={{ color: smartPadelColor }}
            >
              {courtLabel}
            </span>
            <span className="text-sm lg:text-base font-bold uppercase tracking-wide text-white/90 leading-tight truncate max-w-[32vw]">
              {categoryLabel}
            </span>
            <span className="text-xs lg:text-sm font-bold uppercase tracking-[0.18em] text-white/65 leading-tight truncate max-w-[32vw]">
              {genderLabel}
            </span>
          </div>

          {/* Centro: torneo + tiempo partido + sede */}
          <div className="flex flex-col items-center justify-start">
            <span className="text-sm lg:text-base font-black uppercase tracking-[0.14em] text-white/85 text-center max-w-[28vw] truncate">
              {tournamentLabel}
            </span>
            <span className="text-[10px] lg:text-xs font-bold uppercase tracking-[0.25em] text-white/50">
              TIEMPO PARTIDO
            </span>
            <span className="text-4xl lg:text-6xl font-black tabular-nums italic leading-none text-white">
              {elapsedLabel}
            </span>
            <span className="text-xs lg:text-sm font-bold uppercase tracking-[0.18em] text-white/60 text-center max-w-[28vw] truncate">
              {venueLabel}
            </span>
          </div>

          {/* Derecha: fecha + hora/temperatura */}
          <div className="flex flex-col items-end gap-0.5 min-w-0 text-right">
            <span className="text-xs lg:text-sm font-bold uppercase tracking-[0.14em] text-white/65">
              {dateLabel}
            </span>
            <span className="text-sm lg:text-base font-black tabular-nums italic tracking-wide">
              <span style={{ color: template.clock_color }}>{hourLabel}</span>
              <span className="text-white/50"> · {temperatureLabel}</span>
            </span>
          </div>
        </div>

        {/* ── ROW 2: SCOREBOARD ─────────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-[3fr_4fr_3fr] gap-6 items-center px-8 lg:px-16 bg-white/[0.03] border-b border-white/5 min-h-0"
          animate={{ opacity: 1 }}
          key={`score-${currentPointsA}-${currentPointsB}`}
          initial={{ opacity: 0.7 }}
          transition={{ duration: 0.35 }}
        >
          {/* Team A */}
          <div className="score-card flex flex-col gap-3 px-5 py-4">
            <div className="flex items-center gap-3">
              {/* Indicador de saque */}
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-black/40 shrink-0">
                {serverTeam === 'A' && (
                  <div
                    className="w-4 h-4 rounded-full shadow-[0_0_10px_var(--neon-color)]"
                    style={{ backgroundColor: 'var(--neon-color)' }}
                  />
                )}
              </div>
              <h2 className="text-5xl lg:text-[3.1vw] font-black italic uppercase tracking-tighter leading-none text-white truncate">
                {playerA1}
              </h2>
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-8 h-8 shrink-0" />
              <h2 className="text-4xl lg:text-[2.5vw] font-black italic uppercase tracking-tighter leading-none text-white truncate">
                {playerA2}
              </h2>
            </div>
          </div>

          {/* Center Points */}
          <div className="flex items-center justify-center gap-6">
            {/* Points A */}
            <div className="flex flex-col items-center gap-2">
              {/* score-card como contenedor con --neon-color heredado */}
              <div className="score-card w-[14vh] h-[14vh] flex items-center justify-center">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={`pa-${currentPointsA}`}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`text-[10vh] font-black italic leading-none ${
                      isGoldPoint || currentPointsA === '40'
                        ? 'glow-neon animate-pulse'
                        : 'text-white'
                    }`}
                  >
                    {currentPointsA}
                  </motion.span>
                </AnimatePresence>
              </div>
              {/* Sets previos */}
              <div className="flex gap-1.5 pt-1">
                {prevSets.map((s, i) => (
                  <span
                    key={i}
                    className="text-[2vh] font-black italic px-2 py-1 bg-white/5 rounded-md border border-white/5"
                    style={{ color: 'color-mix(in srgb, var(--neon-color) 60%, transparent)' }}
                  >
                    {s.split('-')[0]}
                  </span>
                ))}
              </div>
            </div>

            {/* VS divider */}
            <div className="flex flex-col items-center justify-center opacity-20">
              <div className="h-0.5 w-8 bg-white mb-2" />
              <span className="text-2xl font-black italic">VS</span>
              <div className="h-0.5 w-8 bg-white mt-2" />
            </div>

            {/* Points B */}
            <div className="flex flex-col items-center gap-2">
              <div className="score-card w-[14vh] h-[14vh] flex items-center justify-center">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={`pb-${currentPointsB}`}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`text-[10vh] font-black italic leading-none ${
                      isGoldPoint || currentPointsB === '40'
                        ? 'glow-neon animate-pulse'
                        : 'text-white'
                    }`}
                  >
                    {currentPointsB}
                  </motion.span>
                </AnimatePresence>
              </div>
              {/* Sets previos */}
              <div className="flex gap-1.5 pt-1">
                {prevSets.map((s, i) => (
                  <span
                    key={i}
                    className="text-[2vh] font-black italic px-2 py-1 bg-white/5 rounded-md border border-white/5"
                    style={{ color: 'color-mix(in srgb, var(--neon-color) 60%, transparent)' }}
                  >
                    {s.split('-')[1]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Team B */}
          <div className="score-card flex flex-col gap-3 items-end text-right px-5 py-4">
            <div className="flex items-center gap-3">
              <h2 className="text-5xl lg:text-[3.1vw] font-black italic uppercase tracking-tighter leading-none text-white truncate">
                {playerB1}
              </h2>
              {/* Indicador de saque */}
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-black/40 shrink-0">
                {serverTeam === 'B' && (
                  <div
                    className="w-4 h-4 rounded-full shadow-[0_0_10px_var(--neon-color)]"
                    style={{ backgroundColor: 'var(--neon-color)' }}
                  />
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <h2 className="text-4xl lg:text-[2.5vw] font-black italic uppercase tracking-tighter leading-none text-white truncate">
                {playerB2}
              </h2>
              <div className="w-8 h-8 shrink-0" />
            </div>
          </div>
        </motion.div>

        {/* ── ROW 3: MEDIA — sub-grid: columnas (horizontal) o filas (vertical) ─ */}
        <div className="relative min-h-0 overflow-hidden p-4">
          <div
            className="grid h-full w-full gap-4 transition-all duration-700 ease-in-out"
            style={{
              gridTemplateColumns: isPortrait ? '1fr' : `${splitPercent}% 1fr`,
              gridTemplateRows: isPortrait ? `${splitPercent}% 1fr` : '1fr',
            }}
          >
            {/* LEFT: Video slot */}
            <div className="bg-black/60 backdrop-blur-2xl rounded-[3rem] border-2 border-white/10 overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,0.5)] min-h-0">
              {adsPlaylist.length > 0 ? (
                <CourtAdVideoOrIframe
                  key={`ad-${currentAdIdx}`}
                  videoKey={`ad-${currentAdIdx}`}
                  url={adsPlaylist[currentAdIdx]}
                  className="h-full w-full object-contain"
                  loop={adsPlaylist.length === 1}
                  onEnded={() => {
                    if (adsPlaylist.length > 1) {
                      setCurrentAdIdx((prev) => (prev + 1) % adsPlaylist.length);
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center opacity-30 gap-6">
                  <div
                    className="p-8 rounded-full border-4"
                    style={{
                      backgroundColor: `${smartPadelColor}18`,
                      borderColor: `${smartPadelColor}30`,
                    }}
                  >
                    <Tv size={80} style={{ color: smartPadelColor }} />
                  </div>
                  <span
                    className="text-xl font-black uppercase tracking-[0.4em] italic"
                    style={{ color: `${smartPadelColor}99` }}
                  >
                    SMART VIDEO ADS
                  </span>
                </div>
              )}
              {/* Badge */}
              <div className="absolute top-8 left-8 z-20 px-5 py-2 bg-black/80 rounded-full border border-white/20 flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: smartPadelColor }}
                />
                <span
                  className="text-[12px] font-black uppercase italic tracking-widest"
                  style={{ color: smartPadelColor }}
                >
                  Publicidad
                </span>
              </div>
            </div>

            {/* RIGHT: Sponsor Carousel slot */}
            <div className="bg-black/60 backdrop-blur-2xl rounded-[3rem] border-2 border-white/10 overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,0.5)] min-h-0">
              <AnimatePresence mode="wait">
                {carouselPlaylist.length > 0 ? (
                  <motion.img
                    key={`carousel-${currentCarouselIdx}`}
                    src={carouselPlaylist[currentCarouselIdx]}
                    alt="Sponsor"
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0 h-full w-full object-contain object-center"
                  />
                ) : (
                  <SponsorCarousel
                    tournamentId={tournamentId ?? 'global'}
                    className="w-full h-full"
                  />
                )}
              </AnimatePresence>
              {/* Badge */}
              <div
                className={`absolute z-20 px-5 py-2 bg-black/80 rounded-full border border-blue-600/30 flex items-center gap-3 ${
                  isPortrait ? 'bottom-8 right-8' : 'top-8 right-8'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse shadow-[0_0_10px_#2563eb]" />
                <span className="text-[12px] font-black uppercase italic tracking-widest text-blue-400">
                  Sponsors
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 4: TICKER ─────────────────────────────────────────────── */}
        <div className="relative z-0 flex min-h-[4.5rem] shrink-0 flex-col items-stretch border-t border-white/10 bg-black/60 py-4 backdrop-blur-3xl overflow-hidden sm:min-h-[5rem]">
          <div className="overflow-hidden w-full flex items-center" style={{ height: '100%' }}>
            <div className="flex whitespace-nowrap animate-marquee gap-0">
              {/* Two halves for seamless loop */}
              {[0, 1].map((half) => (
                <div key={half} className="flex shrink-0 items-center">
                  <span className="inline-block w-24" aria-hidden />
                  {tickerMessages.length > 0 ? (
                    tickerMessages.map((msg) => (
                      <div
                        key={`${msg.id}-${half}`}
                        className="flex shrink-0 items-center gap-6 mx-12"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: smartPadelColor,
                            boxShadow: `0 0 10px ${smartPadelColor}`,
                          }}
                        />
                        <span className="whitespace-nowrap text-3xl font-black italic uppercase tracking-[0.2em] text-white underline decoration-white/20 underline-offset-8 sm:text-4xl">
                          {msg.mensaje}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex shrink-0 items-center gap-6 mx-12">
                      <div
                        className="w-3 h-3 rounded-full opacity-30"
                        style={{ backgroundColor: smartPadelColor }}
                      />
                      <span
                        className="text-3xl font-black italic uppercase tracking-[0.3em] opacity-30 sm:text-4xl"
                        style={{ color: smartPadelColor }}
                      >
                        tira informativa TV · en espera de contenido.
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      </AnimatePresence>
    </div>
  );
}
