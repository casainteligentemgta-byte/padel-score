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
 *  • La columna de media se parte con split_ratio (float 0–1).
 *  • SmartClock usa la fuente Orbitron cuando clock_style === 'classic' (digital).
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Tv } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { CourtAdVideoOrIframe } from '@/components/CourtAdVideoOrIframe';
import SponsorCarousel from '@/components/publicidad/SponsorCarousel';
import {
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
};

// ─── SmartClock ───────────────────────────────────────────────────────────────

interface SmartClockProps {
  clockStyle: DisplayTemplate['clock_style'];
  clockColor: string;
}

function SmartClock({ clockStyle, clockColor }: SmartClockProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const date = now
    .toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
    .toUpperCase();

  // Orbitron (digital) cargado via font-face en globals.css o via next/font en layout.
  const isDigital = clockStyle === 'classic';
  const isThin = clockStyle === 'minimal';

  const fontClass = isDigital
    ? 'font-orbitron tabular-nums'   // requiere @import de Orbitron en globals.css
    : isThin
    ? 'font-light tabular-nums'
    : 'font-black italic tabular-nums';

  const sizeClass = isDigital
    ? 'text-3xl lg:text-4xl tracking-widest'
    : isThin
    ? 'text-3xl lg:text-4xl tracking-tight'
    : 'text-4xl lg:text-5xl tracking-tighter';

  return (
    <div className="flex items-center gap-6 bg-white/5 backdrop-blur-3xl px-8 py-4 rounded-[2rem] border border-white/10 shadow-3xl">
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-2 text-gray-400 font-bold text-[13px] tracking-widest uppercase mb-1 italic">
          <Calendar className="w-3.5 h-3.5" />
          {date}
        </div>
        <motion.div
          key={time}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`${fontClass} ${sizeClass} leading-none drop-shadow-[0_0_15px_rgba(0,0,0,0.3)]`}
          style={{
            color: clockColor,
            textShadow: `0 0 20px ${clockColor}55`,
            fontFamily: isDigital ? "'Orbitron', monospace" : undefined,
          }}
        >
          {time}
        </motion.div>
      </div>
    </div>
  );
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
  const [template, setTemplate] = useState<DisplayTemplate>(
    defaultTemplate ?? DEFAULT_TEMPLATE,
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
        setTemplate(data as DisplayTemplate);
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
    setMatch({
      playerA1: d.team1?.p1?.name ?? d.team1Name ?? 'JUGADOR 1',
      playerA2: d.team1?.p2?.name ?? 'JUGADOR 2',
      playerB1: d.team2?.p1?.name ?? d.team2Name ?? 'JUGADOR 3',
      playerB2: d.team2?.p2?.name ?? 'JUGADOR 4',
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

    // Carga inicial
    const init = async () => {
      // Intenta encontrar la cancha por ID string (ej. cancha_1, 1, Pista 1…)
      const courtNum = Number(
        canchaId.replace(/[^0-9]/g, '') || '0',
      );
      const query = supabase
        .from('canchas')
        .select('id, current_template_id')
        .or(
          [
            courtNum ? `nombre.ilike.%Pista ${courtNum}%` : null,
            courtNum ? `nombre.ilike.%Cancha ${courtNum}%` : null,
            courtNum ? `nombre.ilike.%${courtNum}%` : null,
            `nombre.ilike.%${canchaId}%`,
          ]
            .filter(Boolean)
            .join(','),
        )
        .maybeSingle();

      const { data: canchaData } = await query;

      if (canchaData?.current_template_id) {
        await loadTemplate(canchaData.current_template_id);
      }
      await loadPlaylists();
      await loadMatch();

      // Suscribirse a la cancha por UUID
      if (canchaData?.id) {
        canchaSub = supabase
          .channel(`smart_display_cancha_${canchaData.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'canchas',
              filter: `id=eq.${canchaData.id}`,
            },
            async (payload) => {
              const newTemplateId =
                (payload.new as any)?.current_template_id ?? null;
              if (newTemplateId) await loadTemplate(newTemplateId);
              await loadPlaylists();
            },
          )
          .subscribe();
      }
    };
    init();

    return () => {
      if (canchaSub) supabase.removeChannel(canchaSub);
      if (templateSub) supabase.removeChannel(templateSub);
    };
  }, [supabase, canchaId, loadTemplate, loadPlaylists, loadMatch]);

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
          setTemplate(payload.new as DisplayTemplate);
          // Resetear la ref para que loadTemplate recargue si hay cambio de ID
          templateIdRef.current = (payload.new as any)?.id ?? null;
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

  const leftPct = Math.round(template.split_ratio * 100);
  const rightPct = 100 - leftPct;

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
    tickerMessages = [],
  } = match;

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
        className="relative z-10 h-full w-full overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateRows,
          // --neon-color se hereda por todos los hijos: .glow-neon y cualquier
          // uso de var(--neon-color) en el marcador. El Admin puede cambiarlo
          // guardando un color distinto en display_templates.clock_color (DB).
          '--neon-color': smartPadelColor,
        } as React.CSSProperties}
      >
        {/* ── ROW 1: HEADER ─────────────────────────────────────────────── */}
        <div className="flex justify-between items-center px-12 lg:px-24 border-b border-white/10 bg-black/50 backdrop-blur-2xl">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center gap-3 px-4 py-1.5 rounded-full border"
                style={{
                  backgroundColor: `${smartPadelColor}18`,
                  borderColor: `${smartPadelColor}40`,
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor]"
                  style={{ backgroundColor: smartPadelColor }}
                />
                <span
                  className="font-black uppercase tracking-[0.4em] text-[14px] italic"
                  style={{ color: smartPadelColor }}
                >
                  {tournamentName}
                </span>
              </div>
              <span className="text-white/40 font-bold uppercase tracking-[0.3em] text-[12px] italic">
                {tournamentPhase}
              </span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-black italic uppercase tracking-tighter text-white leading-tight break-words max-w-[50vw]">
              {tournamentCategory}
            </h1>
          </div>

          {/* Right: PRO label + SmartClock */}
          <div className="flex items-center gap-8">
            <div className="hidden lg:flex flex-col items-end border-r border-white/10 pr-8">
              <span
                className="font-black uppercase tracking-[0.5em] text-[10px] italic mb-1"
                style={{ color: smartPadelColor }}
              >
                PADEL SCORE
              </span>
              <span className="text-white font-black italic text-xl tracking-tighter">
                PRO SYSTEM
              </span>
            </div>

            <SmartClock
              clockStyle={template.clock_style}
              clockColor={template.clock_color}
            />
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
              <h2 className="text-3xl lg:text-[2.2vw] font-black italic uppercase tracking-tighter leading-none text-white truncate">
                {playerA1}
              </h2>
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-8 h-8 shrink-0" />
              <h2 className="text-2xl lg:text-[1.8vw] font-black italic uppercase tracking-tighter leading-none text-white truncate">
                {playerA2}
              </h2>
            </div>
          </div>

          {/* Center Points */}
          <div className="flex items-center justify-center gap-6">
            {/* Points A */}
            <div className="flex flex-col items-center gap-2">
              {/* score-card como contenedor con --neon-color heredado */}
              <div className="score-card w-[12vh] h-[12vh] flex items-center justify-center">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={`pa-${currentPointsA}`}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`text-[8vh] font-black italic leading-none ${
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
                    className="text-[1.2vh] font-black italic px-1.5 py-0.5 bg-white/5 rounded-md border border-white/5"
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
              <div className="score-card w-[12vh] h-[12vh] flex items-center justify-center">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={`pb-${currentPointsB}`}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`text-[8vh] font-black italic leading-none ${
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
                    className="text-[1.2vh] font-black italic px-1.5 py-0.5 bg-white/5 rounded-md border border-white/5"
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
              <h2 className="text-3xl lg:text-[2.2vw] font-black italic uppercase tracking-tighter leading-none text-white truncate">
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
              <h2 className="text-2xl lg:text-[1.8vw] font-black italic uppercase tracking-tighter leading-none text-white truncate">
                {playerB2}
              </h2>
              <div className="w-8 h-8 shrink-0" />
            </div>
          </div>
        </motion.div>

        {/* ── ROW 3: MEDIA — sub-grid dinamico por split_ratio ──────────── */}
        <div className="relative min-h-0 overflow-hidden p-8">
          {/*
           * Sub-grid de 2 columnas controlado por split_ratio del template.
           * Usamos CSS transition en lugar de framer-motion para grid-template-columns
           * ya que framer-motion tampoco interpola ese valor.
           */}
          <div
            className="grid gap-8 h-full"
            style={{
              gridTemplateColumns: `${leftPct}fr ${rightPct}fr`,
              transition: 'grid-template-columns 0.6s ease-in-out',
            }}
          >
            {/* LEFT: Video slot */}
            <div className="bg-black/60 backdrop-blur-2xl rounded-[3rem] border-2 border-white/10 overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,0.5)] min-h-0">
              {adsPlaylist.length > 0 ? (
                <CourtAdVideoOrIframe
                  key={`ad-${currentAdIdx}`}
                  videoKey={`ad-${currentAdIdx}`}
                  url={adsPlaylist[currentAdIdx]}
                  className="h-full w-full object-cover"
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
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                ) : (
                  <SponsorCarousel
                    tournamentId={tournamentId ?? 'global'}
                    className="w-full h-full"
                  />
                )}
              </AnimatePresence>
              {/* Badge */}
              <div className="absolute top-8 right-8 z-20 px-5 py-2 bg-black/80 rounded-full border border-blue-600/30 flex items-center gap-3">
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
