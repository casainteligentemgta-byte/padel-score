'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Barlow_Condensed } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import BouncingBall from '@/components/BouncingBall';
import { CourtAdVideoOrIframe } from '@/components/CourtAdVideoOrIframe';
import { getSupabaseClient } from '@/lib/supabase/client';
import { dataService } from '@/lib/dataService';
import {
  canchaIdStoredForPublicidadTables,
  fetchCanchaPlaylistRows,
  fetchCanchaTiraMessages,
  normalizeCourtPlaylistRows,
  partitionPlaylistRows,
} from '@/lib/courtPlaylists';
import { resolveMatchTeamLines } from '@/lib/resolveMatchTeamLines';

/** Tipografía de nombres: mismo aspecto en TV (vh alto) y laptop (vw útil), con trazo compacto. */
const pizarraPlayerNames = Barlow_Condensed({
  weight: '900',
  subsets: ['latin'],
  display: 'swap',
});

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(s: string): boolean {
  return UUID_RE.test(String(s).trim());
}

type ServerPlayer = 'A1' | 'A2' | 'B1' | 'B2';

function getCourtNum(m: any): number | null {
  const n = Number(m?.court ?? (m?.courtIndex != null ? (m.courtIndex as number) + 1 : null));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function isLiveLike(m: any): boolean {
  const s = String(m?.status ?? '').toUpperCase();
  return (
    s === 'LIVE' ||
    s === 'IN_PROGRESS' ||
    s === 'EN_CURSO' ||
    s === 'WARM_UP' ||
    s === 'PAUSED'
  );
}

/** Une `data` JSONB con campos de fila; el marcador escribe en la raíz del JSON interno. */
function normalizeMatchForBoard(m: any): any {
  if (!m || typeof m !== 'object') return m;
  const inner = (m as any).data && typeof (m as any).data === 'object' ? (m as any).data : {};
  const { data: _d, ...rest } = m as any;
  return { ...inner, ...rest, id: rest.id };
}

function sameTournamentId(a: string, b: string): boolean {
  return (
    String(a || '')
      .replace(/-/g, '')
      .toLowerCase() ===
    String(b || '')
      .replace(/-/g, '')
      .toLowerCase()
  );
}

/** El marker escribe el juego en vivo en `pizarra_cancha_state.data` (no siempre en tournament_matches). */
function canchaStateMatchesMatch(canchaData: any, tournamentId: string, matchId: string): boolean {
  if (!canchaData || typeof canchaData !== 'object') return false;
  const mid = String(matchId || '').trim();
  const pid = String(canchaData.partido_id || canchaData.active_match_id || '').trim();
  if (!mid || pid !== mid) return false;
  return sameTournamentId(String(canchaData.torneo_id || ''), tournamentId);
}

/** Convierte marcador de cancha (local/visitante) al shape que usa computeBoardView (t1/t2). */
function mergeCanchaMarcadorIntoMatch(matchRaw: any, lm: any | null | undefined): any {
  const m = normalizeMatchForBoard(matchRaw);
  if (!lm || typeof lm !== 'object') return m;
  const out: any = { ...m };
  const puntos = lm.puntos;
  if (puntos && typeof puntos === 'object') {
    out.points = {
      t1: String((puntos as any).local ?? m.points?.t1 ?? '0'),
      t2: String((puntos as any).visitante ?? m.points?.t2 ?? '0'),
    };
  }
  if (lm.games && typeof lm.games === 'object') {
    out.games = {
      t1: Number((lm.games as any).local ?? 0),
      t2: Number((lm.games as any).visitante ?? 0),
    };
  }
  if (lm.sets && typeof lm.sets === 'object') {
    out.sets = {
      t1: Number((lm.sets as any).local ?? 0),
      t2: Number((lm.sets as any).visitante ?? 0),
    };
  }
  if (Array.isArray(lm.historico_sets) && lm.historico_sets.length > 0) {
    out.setScores = lm.historico_sets.map((h: any) => ({
      t1: h.local ?? 0,
      t2: h.visitante ?? 0,
    }));
  }
  if (lm.saque && typeof lm.saque === 'object') {
    out.server = {
      team: Number((lm.saque as any).equipo ?? 1),
      player: Number((lm.saque as any).jugador ?? 1),
    };
  }
  return out;
}

/** Clave `cancha_N` alineada con la sala marker: `courtId` en URL o pista del partido. */
function resolvePizarraCanchaIdForBoard(match: any, courtIdParam: string): string {
  const n = Number(courtIdParam);
  if (Number.isFinite(n) && n > 0) return `cancha_${Math.floor(n)}`;
  return dataService.courtToPizarraCanchaId(match);
}

/** Lee puntos con todas las variantes que usa el marcador / pizarra legacy. */
function extractDisplayPoints(match: any): [string, string] {
  const m = match || {};
  const p = m.points;
  if (p && typeof p === 'object' && !Array.isArray(p) && ('t1' in p || 't2' in p)) {
    return [String((p as any).t1 ?? '0'), String((p as any).t2 ?? '0')];
  }
  if (p && typeof p === 'object' && !Array.isArray(p)) {
    const a = (p as any).team1 ?? (p as any).local;
    const b = (p as any).team2 ?? (p as any).visitante;
    if (a != null || b != null) return [String(a ?? '0'), String(b ?? '0')];
  }
  const pun = m.puntos;
  if (pun && typeof pun === 'object') {
    return [String(pun.local ?? pun.t1 ?? '0'), String(pun.visitante ?? pun.t2 ?? '0')];
  }
  const tb = m.tiebreakScore;
  if (tb && typeof tb === 'object') {
    return [String((tb as any).t1 ?? '0'), String((tb as any).t2 ?? '0')];
  }
  const stb = m.superTiebreakScore;
  if (stb && typeof stb === 'object') {
    return [String((stb as any).t1 ?? '0'), String((stb as any).t2 ?? '0')];
  }
  return [
    String(m.currentPointsA ?? '0'),
    String(m.currentPointsB ?? '0'),
  ];
}

function splitTeamLine(line: string, d1: string, d2: string): [string, string] {
  const parts = line
    .split(/\s*\/\s*/)
    .map((x) => x.trim())
    .filter(Boolean);
  if (parts.length >= 2) return [parts[0].toUpperCase(), parts[1].toUpperCase()];
  if (parts.length === 1) return [parts[0].toUpperCase(), d2];
  return [d1, d2];
}

type BoardView = {
  teamA: [string, string];
  teamB: [string, string];
  set1A: string;
  set1B: string;
  set2A: string;
  set2B: string;
  pointsA: string;
  pointsB: string;
  serverPlayer: ServerPlayer;
  tournamentLabel: string;
  venueLabel: string;
  categoryGenderLine: string;
  tickerPrimary: string;
  tickerSecondary: string;
};

const DEFAULT_BOARD: BoardView = {
  teamA: ['LUIS V. M.', 'HECTOR L. M.'],
  teamB: ['JAVIER V. L.', 'CARLOS G. H.'],
  set1A: '6',
  set1B: '4',
  set2A: '2',
  set2B: '6',
  pointsA: '40',
  pointsB: '30',
  serverPlayer: 'A2',
  tournamentLabel: 'COPA BUCHANNAS',
  venueLabel: 'EL BODEGUERO',
  categoryGenderLine: '10:30 AM | 24°C | CATEGORIA: +40 | GENERO: MASCULINO',
  tickerPrimary: 'BIENVENIDOS A SMART PADEL TV',
  tickerSecondary: 'SMART PADEL TV',
};

function computeBoardView(matchRaw: any, tournament: any | null): BoardView {
  const match = normalizeMatchForBoard(matchRaw);
  const { team1: line1, team2: line2 } = resolveMatchTeamLines(match, tournament);
  const teamA = splitTeamLine(line1, 'JUGADOR A1', 'JUGADOR A2');
  const teamB = splitTeamLine(line2, 'JUGADOR B1', 'JUGADOR B2');

  const gs = Array.isArray(match?.games_sets) ? match.games_sets : [];
  const scoreSets = Array.isArray(match?.setScores) ? match.setScores : [];

  let set1A = '0';
  let set1B = '0';
  let set2A = '0';
  let set2B = '0';

  if (gs.length >= 1) {
    set1A = String(gs[0]?.t1 ?? 0);
    set1B = String(gs[0]?.t2 ?? 0);
  } else {
    const s1 = scoreSets[0] ?? {};
    set1A = String(s1.t1 ?? s1.team1 ?? '0');
    set1B = String(s1.t2 ?? s1.team2 ?? '0');
  }

  if (gs.length >= 2) {
    set2A = String(gs[1]?.t1 ?? 0);
    set2B = String(gs[1]?.t2 ?? 0);
  } else {
    const s2 = scoreSets[1] ?? {};
    set2A = String(s2.t1 ?? s2.team1 ?? '0');
    set2B = String(s2.t2 ?? s2.team2 ?? '0');
  }

  const [pt1, pt2] = extractDisplayPoints(match);

  const gNow = match?.games;
  const hasGs = gs.length > 0;
  const hasSs = scoreSets.length > 0;
  if (!hasGs && !hasSs && gNow && typeof gNow === 'object') {
    set1A = String((gNow as any).t1 ?? 0);
    set1B = String((gNow as any).t2 ?? 0);
    set2A = '0';
    set2B = '0';
  } else if (!hasGs && scoreSets.length === 1 && gNow && typeof gNow === 'object') {
    set2A = String((gNow as any).t1 ?? 0);
    set2B = String((gNow as any).t2 ?? 0);
  }

  const serveTeam =
    match?.serverTeam === 'B' || match?.server?.team === 2 || match?.saque?.equipo === 2 ? 'B' : 'A';
  const rawJ = match?.saque?.jugador ?? match?.serverPlayer ?? match?.server?.player ?? null;
  let sp: ServerPlayer;
  if (rawJ === 'A1' || rawJ === 'A2' || rawJ === 'B1' || rawJ === 'B2') sp = rawJ;
  else if (Number(rawJ) === 2) sp = `${serveTeam}2` as ServerPlayer;
  else sp = `${serveTeam}1` as ServerPlayer;

  const tName = String(
    match?.tournamentName ?? tournament?.name ?? tournament?.title ?? 'TORNEO',
  ).trim();
  const tournamentLabel = tName.toUpperCase() || 'TORNEO';

  const venue = String(
    match?.venueName ??
      match?.complexName ??
      tournament?.complexName ??
      tournament?.venueName ??
      tournament?.sede ??
      '',
  ).trim();
  const venueLabel = (venue || 'SEDE').toUpperCase();

  const catRaw = String(match?.category ?? tournament?.category ?? '').trim();
  const [catPart, genPart] = catRaw.split('/').map((x) => x.trim());
  const cat = catPart || 'CATEGORIA';
  const gen =
    genPart ||
    String(match?.phase ?? match?.tournamentPhase ?? tournament?.gender ?? 'GENERO').trim() ||
    'GENERO';
  const now = new Date();
  const hhmm = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
  const temp = Number.isFinite(Number(match?.temperatureC))
    ? `${Math.round(Number(match.temperatureC))}°C`
    : '24°C';
  const categoryGenderLine = `${hhmm.toUpperCase()} | ${temp} | CATEGORIA: ${cat.toUpperCase()} | GENERO: ${gen.toUpperCase()}`;

  const tickerPrimary = `PARTIDO EN CURSO · ${tName.toUpperCase()} · ${venue.toUpperCase() || 'SEDE'}`;
  const tickerSecondary = `SMART PADEL TV · ${line1.toUpperCase()} VS ${line2.toUpperCase()} · ${cat.toUpperCase()} · ${gen.toUpperCase()}`;

  return {
    teamA,
    teamB,
    set1A,
    set1B,
    set2A,
    set2B,
    pointsA: pt1,
    pointsB: pt2,
    serverPlayer: sp,
    tournamentLabel,
    venueLabel,
    categoryGenderLine,
    tickerPrimary,
    tickerSecondary,
  };
}

function pickMatchFromList(
  matches: any[],
  opts: {
    matchId?: string;
    courtNum?: number | null;
    viewBracket?: boolean;
    complexFilter?: string | null;
  },
): any | null {
  if (!matches?.length) return null;
  const complex = opts.complexFilter?.trim().toLowerCase() || '';

  const filterComplex = (m: any) => {
    if (!complex) return true;
    const v = String(m?.venueName ?? m?.complexName ?? '').toLowerCase();
    return v.includes(complex) || complex.includes(v);
  };

  const list = complex ? matches.filter(filterComplex) : matches;

  // IDs de partido pueden ser UUID o ids internos (p. ej. m-xxxxx-1-yyyyy); siempre priorizar matchId exacto.
  if (opts.matchId?.trim()) {
    const mid = opts.matchId.trim();
    const hit = list.find((m) => String(m.id) === mid);
    if (hit) return hit;
  }

  if (opts.courtNum != null && Number.isFinite(opts.courtNum)) {
    const onCourt = list.filter((m) => getCourtNum(m) === opts.courtNum);
    const live = onCourt.find(isLiveLike);
    if (live) return live;
    if (onCourt[0]) return onCourt[0];
  }

  if (opts.viewBracket) {
    const live = list.find(isLiveLike);
    if (live) return live;
  }

  return list[0] ?? null;
}

export default function PizarraConceptPage() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const tournamentId = searchParams.get('tournamentId') || '';
  const matchIdParam = searchParams.get('matchId') || '';
  const courtIdParam = searchParams.get('courtId') || '';
  const viewParam = searchParams.get('view') || '';
  const tournamentIdsParam = searchParams.get('tournamentIds') || '';
  const complexParam = searchParams.get('complex') || searchParams.get('venue') || '';

  const courtNum = useMemo(() => {
    const n = Number(courtIdParam);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [courtIdParam]);

  const viewBracket = viewParam.toLowerCase() === 'bracket';
  const multiTournamentIds = useMemo(
    () =>
      tournamentIdsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    [tournamentIdsParam],
  );

  const [venueLogoUrl] = useState('/logos/logo-bodeguero-oficial.png');
  const [matchSnapshot, setMatchSnapshot] = useState<any>(null);
  const [tournamentSnapshot, setTournamentSnapshot] = useState<any>(null);

  const [loadError, setLoadError] = useState<string | null>(null);
  /** Marcador en vivo desde `pizarra_cancha_state` (misma fuente que el marker). */
  const [canchaMarcador, setCanchaMarcador] = useState<any>(null);

  /** Playlists desde `cancha_publicidad` (misma fuente que Smart Display / admin publicidad). */
  const [adsPlaylist, setAdsPlaylist] = useState<string[]>([]);
  const [carouselPlaylist, setCarouselPlaylist] = useState<string[]>([]);
  const [carouselDurations, setCarouselDurations] = useState<number[]>([]);
  const [currentAdIdx, setCurrentAdIdx] = useState(0);
  const [currentCarouselIdx, setCurrentCarouselIdx] = useState(0);
  /** Mensajes de tira informativa (`cancha_tira` + `tira_informativa`), misma lógica que /display/court. */
  const [tiraMessages, setTiraMessages] = useState<{ id: string; mensaje: string }[]>([]);

  const tournamentCacheRef = useRef<{ tid: string; data: any } | null>(null);

  const publicidadCanchaId = useMemo(() => {
    if (matchSnapshot) {
      return canchaIdStoredForPublicidadTables(
        resolvePizarraCanchaIdForBoard(matchSnapshot, courtIdParam),
      );
    }
    const n = Number(courtIdParam);
    if (Number.isFinite(n) && n > 0) return canchaIdStoredForPublicidadTables(String(Math.floor(n)));
    return canchaIdStoredForPublicidadTables('1');
  }, [matchSnapshot, courtIdParam]);

  const publicidadVenueName = useMemo(() => {
    const fromUrl = complexParam.trim();
    if (fromUrl) return fromUrl;
    const t = tournamentSnapshot;
    return String(t?.complexName ?? t?.venueName ?? (t as any)?.complex?.name ?? '').trim();
  }, [complexParam, tournamentSnapshot]);

  const loadPlaylists = useCallback(async () => {
    if (!supabase) return;
    const result = await fetchCanchaPlaylistRows(
      supabase as any,
      publicidadCanchaId,
      publicidadVenueName || null,
    );
    if (result.error || result.data == null) return;
    const rows = normalizeCourtPlaylistRows((result.data as unknown[]) || []);
    const { video, imagen } = partitionPlaylistRows(rows);
    setAdsPlaylist(video.map((r) => r.media_content?.url ?? '').filter(Boolean));
    const imgUrls = imagen.map((r) => r.media_content?.url ?? '').filter(Boolean);
    const imgDurs = imagen.map((r) => Math.max(3, Number(r.duracion_segundos) || 8));
    setCarouselPlaylist(imgUrls);
    setCarouselDurations(imgDurs);
    setCurrentAdIdx(0);
    setCurrentCarouselIdx(0);
  }, [supabase, publicidadCanchaId, publicidadVenueName]);

  const loadTiraMessages = useCallback(async () => {
    if (!supabase) return;
    const msgs = await fetchCanchaTiraMessages(
      supabase as any,
      publicidadCanchaId,
      publicidadVenueName || null,
    );
    setTiraMessages(Array.isArray(msgs) ? msgs : []);
  }, [supabase, publicidadCanchaId, publicidadVenueName]);

  const effectiveMatchIdForCancha = useMemo(() => {
    if (!matchSnapshot) return '';
    return (
      matchIdParam.trim() ||
      String(normalizeMatchForBoard(matchSnapshot).id ?? (matchSnapshot as any)?.id ?? '').trim()
    );
  }, [matchIdParam, matchSnapshot]);

  const effectiveTournamentIdForCancha = useMemo(() => {
    const fromUrl = tournamentId.trim();
    if (fromUrl) return fromUrl;
    const m = matchSnapshot ? normalizeMatchForBoard(matchSnapshot) : null;
    return String(
      (m as any)?.tournament_id ?? (matchSnapshot as any)?.tournamentId ?? '',
    ).trim();
  }, [tournamentId, matchSnapshot]);

  const board = useMemo(() => {
    if (!matchSnapshot) return DEFAULT_BOARD;
    const merged = mergeCanchaMarcadorIntoMatch(matchSnapshot, canchaMarcador);
    return computeBoardView(merged, tournamentSnapshot);
  }, [matchSnapshot, tournamentSnapshot, canchaMarcador]);

  /** Texto del marquee inferior: prioriza tira de admin; si no hay, tickers derivados del partido. */
  const footerTickerSegments = useMemo(() => {
    const tiraParts = tiraMessages.map((m) => String(m.mensaje ?? '').trim()).filter(Boolean);
    if (tiraParts.length > 0) return { source: 'tira' as const, parts: tiraParts };
    const fromBoard = [board.tickerPrimary, board.tickerSecondary].filter(Boolean);
    return {
      source: 'board' as const,
      parts: fromBoard.length > 0 ? fromBoard : [board.tickerPrimary || 'SMART PADEL TV'],
    };
  }, [tiraMessages, board.tickerPrimary, board.tickerSecondary]);

  const refreshFromTournament = useCallback(
    async (tid: string, matchesFromSub: any[] | null) => {
      let tournament =
        tournamentCacheRef.current?.tid === tid ? tournamentCacheRef.current.data : null;
      if (!tournament) {
        tournament = await dataService.getTournament(tid);
        tournamentCacheRef.current = { tid, data: tournament };
      }

      const mid = matchIdParam.trim();
      if (mid) {
        let m: any | null = null;
        try {
          const r = await fetch(
            `/api/pizarra/match?tournamentId=${encodeURIComponent(tid)}&matchId=${encodeURIComponent(mid)}`,
            { cache: 'no-store' },
          );
          if (r.ok) {
            const j = await r.json();
            m = j?.match ?? null;
          }
        } catch {
          /* fallback cliente */
        }
        if (!m) m = await dataService.getMatchById(tid, mid);
        if (!m) {
          setLoadError('No se encontró el partido o no hay acceso de lectura (id / RLS / API).');
          return;
        }
        setLoadError(null);
        setTournamentSnapshot(tournament);
        setMatchSnapshot(m);
        return;
      }

      const list = matchesFromSub ?? (await dataService.getMatches(tid));
      const picked = pickMatchFromList(list, {
        matchId: matchIdParam,
        courtNum,
        viewBracket,
        complexFilter: complexParam || null,
      });
      if (!picked) {
        setLoadError('No hay partido para mostrar (revisa torneo, pista o ID).');
        return;
      }
      setLoadError(null);
      setTournamentSnapshot(tournament);
      setMatchSnapshot(picked);
    },
    [matchIdParam, courtNum, viewBracket, complexParam],
  );

  useEffect(() => {
    tournamentCacheRef.current = null;
  }, [tournamentId]);

  // Marker: el juego en vivo vive en `pizarra_cancha_state`; fusionamos `marcador` si coincide torneo+partido+pista.
  useEffect(() => {
    const tid = effectiveTournamentIdForCancha;
    const mid = effectiveMatchIdForCancha;
    if (!tid || !matchSnapshot || !mid) {
      setCanchaMarcador(null);
      return;
    }
    const cid = resolvePizarraCanchaIdForBoard(matchSnapshot, courtIdParam);
    const apply = (d: any) => {
      if (!canchaStateMatchesMatch(d, tid, mid)) {
        setCanchaMarcador(null);
        return;
      }
      setCanchaMarcador(d?.marcador ?? null);
    };
    void dataService.getPizarraCanchaState(cid).then((row) => apply(row?.data));
    const unsub = dataService.subscribePizarraCanchaState(cid, (row) => apply(row?.data));
    return () => {
      unsub?.();
    };
  }, [effectiveTournamentIdForCancha, effectiveMatchIdForCancha, matchSnapshot, courtIdParam]);

  // Publicidad + tira informativa (mismas tablas que /admin/publicidad por sede/pista).
  useEffect(() => {
    if (!supabase) return;
    void loadPlaylists();
    void loadTiraMessages();
    const poll = window.setInterval(() => {
      void loadPlaylists();
      void loadTiraMessages();
    }, 45_000);
    const ch = supabase
      .channel(`pizarra_concept_pub_${publicidadCanchaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cancha_publicidad',
          filter: `cancha_id=eq.${publicidadCanchaId}`,
        },
        () => void loadPlaylists(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cancha_tira' }, () => {
        void loadTiraMessages();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tira_informativa' }, () => {
        void loadTiraMessages();
      })
      .subscribe();
    return () => {
      window.clearInterval(poll);
      supabase.removeChannel(ch);
    };
  }, [supabase, loadPlaylists, loadTiraMessages, publicidadCanchaId]);

  useEffect(() => {
    if (carouselPlaylist.length <= 1) return;
    const dur = (carouselDurations[currentCarouselIdx] ?? 8) * 1000;
    const id = window.setTimeout(() => {
      setCurrentCarouselIdx((prev) => (prev + 1) % carouselPlaylist.length);
    }, dur);
    return () => window.clearTimeout(id);
  }, [carouselPlaylist, currentCarouselIdx, carouselDurations]);

  // Un torneo: suscripción + polling. Con matchId, cada tick relee solo esa fila (getMatchById).
  useEffect(() => {
    if (!tournamentId) return;
    let cancelled = false;
    void refreshFromTournament(tournamentId, null);
    const unsub = dataService.subscribeToMatches(tournamentId, () => {
      if (cancelled) return;
      void refreshFromTournament(tournamentId, null);
    });
    const pollMs = matchIdParam.trim() ? 1200 : 2500;
    const poll = window.setInterval(() => {
      if (cancelled) return;
      void refreshFromTournament(tournamentId, null);
    }, pollMs);
    return () => {
      cancelled = true;
      unsub?.();
      window.clearInterval(poll);
    };
  }, [tournamentId, matchIdParam, refreshFromTournament]);

  // Varios torneos (p. ej. ?tournamentIds=a,b): primer partido en vivo entre ellos, refresco periódico
  useEffect(() => {
    if (tournamentId || multiTournamentIds.length === 0) return;
    let cancelled = false;

    const tick = async () => {
      try {
        const live = await dataService.getLiveMatches();
        if (cancelled) return;
        const allowed = new Set(multiTournamentIds);
        const pick = live.find((m: any) => allowed.has(String(m.tournamentId)));
        if (!pick) {
          setLoadError('Ningún partido en vivo en los torneos seleccionados.');
          return;
        }
        setLoadError(null);
        const tournament = await dataService.getTournament(String(pick.tournamentId));
        setTournamentSnapshot(tournament);
        setMatchSnapshot(pick);
      } catch {
        if (!cancelled) setLoadError('No se pudo cargar el estado de los torneos.');
      }
    };

    void tick();
    const id = window.setInterval(tick, 8000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [tournamentId, multiTournamentIds]);

  // Sin torneo: intento por matchId + Supabase (enlace directo)
  useEffect(() => {
    if (tournamentId || multiTournamentIds.length > 0 || !matchIdParam || !isUuid(matchIdParam)) return;
    if (!supabase) return;
    let cancelled = false;

    const load = async () => {
      const { data: row } = await supabase
        .from('tournament_matches')
        .select('tournament_id, data')
        .eq('id', matchIdParam)
        .maybeSingle();
      if (cancelled || !row) {
        if (!cancelled) setLoadError('Partido no encontrado.');
        return;
      }
      const tid = String((row as any).tournament_id || '');
      const merged = { id: matchIdParam, ...((row as any).data || {}) };
      const tournament = await dataService.getTournament(tid);
      setLoadError(null);
      setTournamentSnapshot(tournament);
      setMatchSnapshot(merged);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [supabase, tournamentId, multiTournamentIds.length, matchIdParam]);

  return (
    <div className="h-dvh w-screen overflow-hidden bg-[#0f1115] text-white">
      <div className="mx-auto flex h-full w-full max-w-[1800px] flex-col overflow-hidden px-4 pt-0 pb-2 sm:px-6 lg:px-10">
        {loadError && (
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-amber-400/90">
            {loadError}
          </p>
        )}
        {matchSnapshot &&
          String(normalizeMatchForBoard(matchSnapshot).status ?? '')
            .toUpperCase()
            .trim() === 'PENDING' &&
          !canchaMarcador && (
            <p className="mb-2 max-w-2xl px-3 text-center text-[11px] font-semibold leading-snug text-amber-200/95">
              Este partido está <span className="font-black">PENDING</span> (no iniciado en el cuadro). Si ya marcas desde la
              sala marker, la pizarra usará ese marcador; si no, en el panel del árbitro pulsa «Empezar partido» para
              sincronizar el estado en la base de datos.
            </p>
          )}
        <header className="mb-1 flex shrink-0 flex-col items-center gap-1 text-center">
          <div className="mt-3 flex h-[clamp(2.3rem,4.4vh,3.5rem)] w-[clamp(2.3rem,4.4vh,3.5rem)] items-center justify-center overflow-hidden rounded-2xl border border-[#d6b35a]/50 bg-[#0e2238] shadow-[0_0_22px_rgba(214,179,90,0.25)]">
            {venueLogoUrl ? (
              <img
                src={venueLogoUrl}
                alt="Logo sede o patrocinante"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#10243d] px-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#ccff00]">
                BODEGUERO
              </div>
            )}
          </div>
          <div className="-mt-1 flex flex-col items-center">
            <h1 className="text-[clamp(1rem,2.6vh,1.8rem)] font-bold tracking-[0.03em] text-white/95">
              {board.venueLabel}
            </h1>
            <p className="-mt-1 text-[clamp(0.85rem,1.9vh,1.25rem)] font-semibold tracking-[0.05em] text-white/85">
              {board.tournamentLabel}
            </p>
            <p className="-mt-1 text-[clamp(0.6rem,1.25vh,0.78rem)] font-semibold uppercase tracking-[0.12em] text-[#90b6da]">
              {board.categoryGenderLine}
            </p>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-2">
        <main className="flex min-h-0 max-h-[min(48vh,calc(100dvh-15rem))] shrink-0 items-start justify-center overflow-hidden">
          <aside
            className={`w-full max-w-[980px] overflow-hidden rounded-3xl border border-[#ccff00]/35 bg-[#0e1014] p-[clamp(0.55rem,1.6vh,1.25rem)] shadow-[0_0_40px_rgba(0,0,0,0.9),0_0_55px_rgba(204,255,0,0.14),inset_0_0_45px_rgba(255,255,255,0.03)] ${pizarraPlayerNames.className}`}
          >
            <div className="mb-2 grid grid-cols-[1fr_clamp(2.7rem,5.7vw,4.5rem)_clamp(2.7rem,5.7vw,4.5rem)_clamp(2.7rem,5.7vw,4.5rem)] gap-2 border-b border-[#ccff00]/30 pb-1 text-center text-[clamp(0.58rem,1.2vh,0.75rem)] font-extrabold uppercase tracking-[0.16em] text-[#ccff00] drop-shadow-[0_0_6px_rgba(204,255,0,0.28)]">
              <span className="text-left">Jugadores</span>
              <span>Set 1</span>
              <span>Set 2</span>
              <span>PUNTOS</span>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_clamp(2.7rem,5.7vw,4.5rem)_clamp(2.7rem,5.7vw,4.5rem)_clamp(2.7rem,5.7vw,4.5rem)] items-center gap-2 rounded-2xl border border-[#ccff00]/45 bg-gradient-to-r from-[#171a20] via-[#1a1e25] to-[#1d2129] p-[clamp(0.52rem,1.45vh,0.95rem)] shadow-[0_0_18px_rgba(204,255,0,0.18),inset_0_0_18px_rgba(204,255,0,0.04)]">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="h-5 w-5 shrink-0">
                    {board.serverPlayer === 'A1' || board.serverPlayer === 'A2' ? (
                      <BouncingBall size={12} duration={850} bounceHeight={0.4} />
                    ) : (
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-white/25" />
                    )}
                  </div>
                  <span
                    className={`truncate text-[clamp(1.02rem,min(2.85vh,4.8vw),1.58rem)] font-black uppercase tracking-[0.05em] antialiased leading-[1.02] ${
                      board.serverPlayer === 'A1'
                        ? 'text-[#ccff00] drop-shadow-[0_0_12px_rgba(204,255,0,0.75)]'
                        : 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.22)]'
                    }`}
                  >
                    {board.teamA[0]}
                  </span>
                  <span className="text-white/70">/</span>
                  <span
                    className={`truncate text-[clamp(1.02rem,min(2.85vh,4.8vw),1.58rem)] font-black uppercase tracking-[0.05em] antialiased leading-[1.02] ${
                      board.serverPlayer === 'A2'
                        ? 'text-[#ccff00] drop-shadow-[0_0_12px_rgba(204,255,0,0.75)]'
                        : 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.22)]'
                    }`}
                  >
                    {board.teamA[1]}
                  </span>
                </div>
                <span className="text-center text-[clamp(1.25rem,4.1vh,2.35rem)] font-extrabold text-white drop-shadow-[0_0_12px_rgba(204,255,0,0.35)]">
                  {board.set1A}
                </span>
                <span className="text-center text-[clamp(1.25rem,4.1vh,2.35rem)] font-extrabold text-white drop-shadow-[0_0_12px_rgba(204,255,0,0.35)]">
                  {board.set2A}
                </span>
                <span className="text-center text-[clamp(1.55rem,4.9vh,3rem)] font-black text-white drop-shadow-[0_0_18px_rgba(204,255,0,0.5)]">
                  {board.pointsA}
                </span>
              </div>

              <div className="grid grid-cols-[1fr_clamp(2.7rem,5.7vw,4.5rem)_clamp(2.7rem,5.7vw,4.5rem)_clamp(2.7rem,5.7vw,4.5rem)] items-center gap-2 rounded-2xl border border-white/25 bg-[#14171c] p-[clamp(0.52rem,1.45vh,0.95rem)] shadow-[inset_0_0_34px_rgba(255,255,255,0.03)]">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="h-5 w-5 shrink-0">
                    {board.serverPlayer === 'B1' || board.serverPlayer === 'B2' ? (
                      <BouncingBall size={12} duration={850} bounceHeight={0.4} />
                    ) : (
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-white/25" />
                    )}
                  </div>
                  <span
                    className={`truncate text-[clamp(1.02rem,min(2.85vh,4.8vw),1.58rem)] font-black uppercase tracking-[0.05em] antialiased leading-[1.02] ${
                      board.serverPlayer === 'B1'
                        ? 'text-[#ccff00] drop-shadow-[0_0_12px_rgba(204,255,0,0.75)]'
                        : 'text-white/90'
                    }`}
                  >
                    {board.teamB[0]}
                  </span>
                  <span className="text-white/70">/</span>
                  <span
                    className={`truncate text-[clamp(1.02rem,min(2.85vh,4.8vw),1.58rem)] font-black uppercase tracking-[0.05em] antialiased leading-[1.02] ${
                      board.serverPlayer === 'B2'
                        ? 'text-[#ccff00] drop-shadow-[0_0_12px_rgba(204,255,0,0.75)]'
                        : 'text-white/90'
                    }`}
                  >
                    {board.teamB[1]}
                  </span>
                </div>
                <span className="text-center text-[clamp(1.25rem,4.1vh,2.35rem)] font-extrabold text-white drop-shadow-[0_0_10px_rgba(204,255,0,0.22)]">
                  {board.set1B}
                </span>
                <span className="text-center text-[clamp(1.25rem,4.1vh,2.35rem)] font-extrabold text-white drop-shadow-[0_0_10px_rgba(204,255,0,0.22)]">
                  {board.set2B}
                </span>
                <span className="text-center text-[clamp(1.55rem,4.9vh,3rem)] font-black text-white drop-shadow-[0_0_14px_rgba(204,255,0,0.28)]">
                  {board.pointsB}
                </span>
              </div>
            </div>
          </aside>
        </main>

        <section className="grid min-h-0 w-full flex-1 grid-cols-2 gap-3">
          <div className="relative h-[clamp(132px,28vh,320px)] overflow-hidden rounded-2xl border border-[#ccff00]/35 bg-[#10131a] shadow-[0_0_20px_rgba(204,255,0,0.12)] sm:h-[clamp(152px,32vh,380px)]">
            {adsPlaylist.length > 0 ? (
              <CourtAdVideoOrIframe
                key={`ad-${currentAdIdx}`}
                videoKey={`ad-${currentAdIdx}`}
                url={adsPlaylist[currentAdIdx]}
                className="h-full w-full object-contain bg-black"
                loop={adsPlaylist.length === 1}
                onEnded={() => {
                  if (adsPlaylist.length > 1) {
                    setCurrentAdIdx((prev) => (prev + 1) % adsPlaylist.length);
                  }
                }}
                title="Publicidad vídeo"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/45">
                <span className="px-3 text-center text-[clamp(0.6rem,1.35vh,0.95rem)] font-bold uppercase tracking-[0.12em]">
                  ESPACIO PUBLICITARIO DISPONIBLE
                </span>
              </div>
            )}
          </div>

          <div className="relative h-[clamp(132px,28vh,320px)] overflow-hidden rounded-2xl border border-[#ccff00]/35 bg-[#10131a] shadow-[0_0_20px_rgba(204,255,0,0.12)] sm:h-[clamp(152px,32vh,380px)]">
            {carouselPlaylist.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.img
                  key={`carousel-${currentCarouselIdx}`}
                  src={carouselPlaylist[currentCarouselIdx]}
                  alt=""
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.45 }}
                  className="absolute inset-0 h-full w-full object-contain object-center bg-black"
                />
              </AnimatePresence>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/45">
                <span className="px-3 text-center text-[clamp(0.6rem,1.35vh,0.95rem)] font-bold uppercase tracking-[0.12em]">
                  ESPACIO PUBLICITARIO DISPONIBLE
                </span>
              </div>
            )}
          </div>
        </section>
        </div>

        <footer className="mt-2 w-full shrink-0 overflow-hidden rounded-2xl border border-[#ccff00]/25 bg-black/55 py-[clamp(0.3rem,1vh,0.75rem)] shadow-[0_0_20px_rgba(204,255,0,0.12)]">
          <div className="flex whitespace-nowrap animate-marquee">
            {[0, 1].map((half) => (
              <div key={half} className="flex shrink-0 items-center">
                {footerTickerSegments.parts.map((segment, i) => (
                  <Fragment key={`${half}-${i}`}>
                    <span className="mx-8 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[#ccff00] shadow-[0_0_10px_rgba(204,255,0,0.7)]" />
                    <span
                      className={`mr-12 text-[clamp(0.72rem,1.55vh,1rem)] font-black uppercase tracking-[0.14em] ${
                        footerTickerSegments.source === 'tira'
                          ? i % 2 === 0
                            ? 'text-[#ccff00]'
                            : 'text-white/90'
                          : i === 0
                            ? 'text-white/90'
                            : 'text-[#ccff00]'
                      }`}
                    >
                      {segment}
                    </span>
                  </Fragment>
                ))}
              </div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
