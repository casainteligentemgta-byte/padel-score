'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BouncingBall from '@/components/BouncingBall';
import { getSupabaseClient } from '@/lib/supabase/client';
import { dataService } from '@/lib/dataService';
import { resolveMatchTeamLines } from '@/lib/resolveMatchTeamLines';

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

function splitTeamLine(line: string, d1: string, d2: string): [string, string] {
  const parts = line
    .split(/\s*\/\s*/)
    .map((x) => x.trim())
    .filter(Boolean);
  if (parts.length >= 2) return [parts[0].toUpperCase(), parts[1].toUpperCase()];
  if (parts.length === 1) return [parts[0].toUpperCase(), d2];
  return [d1, d2];
}

function applyMatchToBoard(
  match: any,
  tournament: any | null,
  setters: {
    setTeamA: (v: [string, string]) => void;
    setTeamB: (v: [string, string]) => void;
    setSet1A: (v: string) => void;
    setSet1B: (v: string) => void;
    setSet2A: (v: string) => void;
    setSet2B: (v: string) => void;
    setPointsA: (v: string) => void;
    setPointsB: (v: string) => void;
    setServerPlayer: (v: ServerPlayer) => void;
    setTournamentLabel: (v: string) => void;
    setVenueLabel: (v: string) => void;
    setCategoryGenderLine: (v: string) => void;
    setTickerPrimary: (v: string) => void;
    setTickerSecondary: (v: string) => void;
  },
) {
  const { team1: line1, team2: line2 } = resolveMatchTeamLines(match, tournament);
  setters.setTeamA(splitTeamLine(line1, 'JUGADOR A1', 'JUGADOR A2'));
  setters.setTeamB(splitTeamLine(line2, 'JUGADOR B1', 'JUGADOR B2'));

  const gs = Array.isArray(match?.games_sets) ? match.games_sets : [];
  const scoreSets = Array.isArray(match?.setScores) ? match.setScores : [];

  if (gs.length >= 1) {
    setters.setSet1A(String(gs[0]?.t1 ?? 0));
    setters.setSet1B(String(gs[0]?.t2 ?? 0));
  } else {
    const s1 = scoreSets[0] ?? {};
    setters.setSet1A(String(s1.t1 ?? s1.team1 ?? '0'));
    setters.setSet1B(String(s1.t2 ?? s1.team2 ?? '0'));
  }

  if (gs.length >= 2) {
    setters.setSet2A(String(gs[1]?.t1 ?? 0));
    setters.setSet2B(String(gs[1]?.t2 ?? 0));
  } else {
    const s2 = scoreSets[1] ?? {};
    setters.setSet2A(String(s2.t1 ?? s2.team1 ?? '0'));
    setters.setSet2B(String(s2.t2 ?? s2.team2 ?? '0'));
  }

  setters.setPointsA(String(match?.points?.t1 ?? match?.puntos?.local ?? match?.currentPointsA ?? '0'));
  setters.setPointsB(String(match?.points?.t2 ?? match?.puntos?.visitante ?? match?.currentPointsB ?? '0'));

  const serveTeam =
    match?.serverTeam === 'B' || match?.server?.team === 2 || match?.saque?.equipo === 2 ? 'B' : 'A';
  const rawJ = match?.saque?.jugador ?? match?.serverPlayer ?? match?.server?.player ?? null;
  let sp: ServerPlayer;
  if (rawJ === 'A1' || rawJ === 'A2' || rawJ === 'B1' || rawJ === 'B2') sp = rawJ;
  else if (Number(rawJ) === 2) sp = `${serveTeam}2` as ServerPlayer;
  else sp = `${serveTeam}1` as ServerPlayer;
  setters.setServerPlayer(sp);

  const tName = String(
    match?.tournamentName ?? tournament?.name ?? tournament?.title ?? 'TORNEO',
  ).trim();
  setters.setTournamentLabel(tName.toUpperCase() || 'TORNEO');

  const venue = String(
    match?.venueName ??
      match?.complexName ??
      tournament?.complexName ??
      tournament?.venueName ??
      tournament?.sede ??
      '',
  ).trim();
  setters.setVenueLabel((venue || 'SEDE').toUpperCase());

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
  setters.setCategoryGenderLine(
    `${hhmm.toUpperCase()} | ${temp} | CATEGORIA: ${cat.toUpperCase()} | GENERO: ${gen.toUpperCase()}`,
  );

  setters.setTickerPrimary(`PARTIDO EN CURSO · ${tName.toUpperCase()} · ${venue.toUpperCase() || 'SEDE'}`);
  setters.setTickerSecondary(
    `SMART PADEL TV · ${line1.toUpperCase()} VS ${line2.toUpperCase()} · ${cat.toUpperCase()} · ${gen.toUpperCase()}`,
  );
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

  if (opts.matchId && isUuid(opts.matchId)) {
    const hit = list.find((m) => String(m.id) === opts.matchId);
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
  const [venueLabel, setVenueLabel] = useState('EL BODEGUERO');
  const [tournamentLabel, setTournamentLabel] = useState('COPA BUCHANNAS');
  const [categoryGenderLine, setCategoryGenderLine] = useState(
    '10:30 AM | 24°C | CATEGORIA: +40 | GENERO: MASCULINO',
  );
  const [tickerPrimary, setTickerPrimary] = useState('BIENVENIDOS A SMART PADEL TV');
  const [tickerSecondary, setTickerSecondary] = useState('SMART PADEL TV');

  const [teamA, setTeamA] = useState(['LUIS V. M.', 'HECTOR L. M.']);
  const [teamB, setTeamB] = useState(['JAVIER V. L.', 'CARLOS G. H.']);
  const [set1A, setSet1A] = useState('6');
  const [set1B, setSet1B] = useState('4');
  const [set2A, setSet2A] = useState('2');
  const [set2B, setSet2B] = useState('6');
  const [pointsA, setPointsA] = useState('40');
  const [pointsB, setPointsB] = useState('30');
  const [serverPlayer, setServerPlayer] = useState<ServerPlayer>('A2');

  const [loadError, setLoadError] = useState<string | null>(null);

  const setters = useMemo(
    () => ({
      setTeamA,
      setTeamB,
      setSet1A,
      setSet1B,
      setSet2A,
      setSet2B,
      setPointsA,
      setPointsB,
      setServerPlayer,
      setTournamentLabel,
      setVenueLabel,
      setCategoryGenderLine,
      setTickerPrimary,
      setTickerSecondary,
    }),
    [],
  );

  const refreshFromTournament = useCallback(
    async (tid: string, matches: any[]) => {
      const tournament = await dataService.getTournament(tid);
      const picked = pickMatchFromList(matches, {
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
      applyMatchToBoard(picked, tournament, setters);
    },
    [matchIdParam, courtNum, viewBracket, complexParam, setters],
  );

  // Un torneo: suscripción en vivo a todos los partidos y re-resolución del activo
  useEffect(() => {
    if (!tournamentId) return;
    let cancelled = false;
    const unsub = dataService.subscribeToMatches(tournamentId, (matches) => {
      if (cancelled) return;
      void refreshFromTournament(tournamentId, matches);
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [tournamentId, refreshFromTournament]);

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
        applyMatchToBoard(pick, tournament, setters);
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
  }, [tournamentId, multiTournamentIds, setters]);

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
      applyMatchToBoard(merged, tournament, setters);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [supabase, tournamentId, multiTournamentIds.length, matchIdParam, setters]);

  return (
    <div className="h-dvh w-screen overflow-hidden bg-[#0f1115] text-white">
      <div className="mx-auto flex h-full w-full max-w-[1800px] flex-col overflow-hidden px-4 pt-0 pb-2 sm:px-6 lg:px-10">
        {loadError && (
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-amber-400/90">
            {loadError}
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
              {venueLabel}
            </h1>
            <p className="-mt-1 text-[clamp(0.85rem,1.9vh,1.25rem)] font-semibold tracking-[0.05em] text-white/85">
              {tournamentLabel}
            </p>
            <p className="-mt-1 text-[clamp(0.6rem,1.25vh,0.78rem)] font-semibold uppercase tracking-[0.12em] text-[#90b6da]">
              {categoryGenderLine}
            </p>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 items-start justify-center overflow-hidden">
          <aside className="w-full max-w-[980px] overflow-hidden rounded-3xl border border-[#ccff00]/35 bg-[#0e1014] p-[clamp(0.55rem,1.6vh,1.25rem)] shadow-[0_0_40px_rgba(0,0,0,0.9),0_0_55px_rgba(204,255,0,0.14),inset_0_0_45px_rgba(255,255,255,0.03)]">
            <div className="mb-2 grid grid-cols-[1fr_clamp(2.7rem,5.7vw,4.5rem)_clamp(2.7rem,5.7vw,4.5rem)_clamp(2.7rem,5.7vw,4.5rem)] gap-2 border-b border-[#ccff00]/30 pb-1 text-center text-[clamp(0.58rem,1.2vh,0.75rem)] font-extrabold uppercase tracking-[0.16em] text-[#ccff00] drop-shadow-[0_0_6px_rgba(204,255,0,0.28)]">
              <span className="text-left">Jugadores</span>
              <span>Set 1</span>
              <span>Set 2</span>
              <span>PUNTOS</span>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_clamp(2.7rem,5.7vw,4.5rem)_clamp(2.7rem,5.7vw,4.5rem)_clamp(2.7rem,5.7vw,4.5rem)] items-center gap-2 rounded-2xl border border-[#ccff00]/45 bg-gradient-to-r from-[#171a20] via-[#1a1e25] to-[#1d2129] p-[clamp(0.45rem,1.3vh,0.85rem)] shadow-[0_0_18px_rgba(204,255,0,0.18),inset_0_0_18px_rgba(204,255,0,0.04)]">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="h-4 w-4 shrink-0">
                    {serverPlayer === 'A1' || serverPlayer === 'A2' ? (
                      <BouncingBall size={10} duration={850} bounceHeight={0.4} />
                    ) : (
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-white/25" />
                    )}
                  </div>
                  <span
                    className={`truncate text-[clamp(0.75rem,1.8vh,1.12rem)] font-black uppercase tracking-tight antialiased ${
                      serverPlayer === 'A1'
                        ? 'text-[#ccff00] drop-shadow-[0_0_12px_rgba(204,255,0,0.75)]'
                        : 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.22)]'
                    }`}
                  >
                    {teamA[0]}
                  </span>
                  <span className="text-white/70">/</span>
                  <span
                    className={`truncate text-[clamp(0.75rem,1.8vh,1.12rem)] font-black uppercase tracking-tight antialiased ${
                      serverPlayer === 'A2'
                        ? 'text-[#ccff00] drop-shadow-[0_0_12px_rgba(204,255,0,0.75)]'
                        : 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.22)]'
                    }`}
                  >
                    {teamA[1]}
                  </span>
                </div>
                <span className="text-center text-[clamp(1.25rem,4.1vh,2.35rem)] font-extrabold text-white drop-shadow-[0_0_12px_rgba(204,255,0,0.35)]">
                  {set1A}
                </span>
                <span className="text-center text-[clamp(1.25rem,4.1vh,2.35rem)] font-extrabold text-white drop-shadow-[0_0_12px_rgba(204,255,0,0.35)]">
                  {set2A}
                </span>
                <span className="text-center text-[clamp(1.55rem,4.9vh,3rem)] font-black text-white drop-shadow-[0_0_18px_rgba(204,255,0,0.5)]">
                  {pointsA}
                </span>
              </div>

              <div className="grid grid-cols-[1fr_clamp(2.7rem,5.7vw,4.5rem)_clamp(2.7rem,5.7vw,4.5rem)_clamp(2.7rem,5.7vw,4.5rem)] items-center gap-2 rounded-2xl border border-white/25 bg-[#14171c] p-[clamp(0.45rem,1.3vh,0.85rem)] shadow-[inset_0_0_34px_rgba(255,255,255,0.03)]">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="h-4 w-4 shrink-0">
                    {serverPlayer === 'B1' || serverPlayer === 'B2' ? (
                      <BouncingBall size={10} duration={850} bounceHeight={0.4} />
                    ) : (
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-white/25" />
                    )}
                  </div>
                  <span
                    className={`truncate text-[clamp(0.75rem,1.8vh,1.12rem)] font-black uppercase tracking-tight antialiased ${
                      serverPlayer === 'B1'
                        ? 'text-[#ccff00] drop-shadow-[0_0_12px_rgba(204,255,0,0.75)]'
                        : 'text-white/90'
                    }`}
                  >
                    {teamB[0]}
                  </span>
                  <span className="text-white/70">/</span>
                  <span
                    className={`truncate text-[clamp(0.75rem,1.8vh,1.12rem)] font-black uppercase tracking-tight antialiased ${
                      serverPlayer === 'B2'
                        ? 'text-[#ccff00] drop-shadow-[0_0_12px_rgba(204,255,0,0.75)]'
                        : 'text-white/90'
                    }`}
                  >
                    {teamB[1]}
                  </span>
                </div>
                <span className="text-center text-[clamp(1.25rem,4.1vh,2.35rem)] font-extrabold text-white drop-shadow-[0_0_10px_rgba(204,255,0,0.22)]">
                  {set1B}
                </span>
                <span className="text-center text-[clamp(1.25rem,4.1vh,2.35rem)] font-extrabold text-white drop-shadow-[0_0_10px_rgba(204,255,0,0.22)]">
                  {set2B}
                </span>
                <span className="text-center text-[clamp(1.55rem,4.9vh,3rem)] font-black text-white drop-shadow-[0_0_14px_rgba(204,255,0,0.28)]">
                  {pointsB}
                </span>
              </div>
            </div>
          </aside>
        </main>

        <section className="mt-2 grid w-full shrink-0 grid-cols-2 gap-3">
          <div className="relative h-[clamp(98px,17vh,196px)] overflow-hidden rounded-2xl border border-[#ccff00]/35 bg-[#10131a] shadow-[0_0_20px_rgba(204,255,0,0.12)]">
            <div className="flex h-full w-full items-center justify-center text-white/45">
              <span className="px-3 text-center text-[clamp(0.6rem,1.35vh,0.95rem)] font-bold uppercase tracking-[0.12em]">
                ESPACIO PUBLICITARIO DISPONIBLE
              </span>
            </div>
          </div>

          <div className="relative h-[clamp(98px,17vh,196px)] overflow-hidden rounded-2xl border border-[#ccff00]/35 bg-[#10131a] shadow-[0_0_20px_rgba(204,255,0,0.12)]">
            <div className="flex h-full w-full items-center justify-center text-white/45">
              <span className="px-3 text-center text-[clamp(0.6rem,1.35vh,0.95rem)] font-bold uppercase tracking-[0.12em]">
                ESPACIO PUBLICITARIO DISPONIBLE
              </span>
            </div>
          </div>
        </section>

        <footer className="mt-2 w-full shrink-0 overflow-hidden rounded-2xl border border-[#ccff00]/25 bg-black/55 py-[clamp(0.3rem,1vh,0.75rem)] shadow-[0_0_20px_rgba(204,255,0,0.12)]">
          <div className="flex whitespace-nowrap animate-marquee">
            {[0, 1].map((half) => (
              <div key={half} className="flex shrink-0 items-center">
                <span className="mx-8 inline-block h-2.5 w-2.5 rounded-full bg-[#ccff00] shadow-[0_0_10px_rgba(204,255,0,0.7)]" />
                <span className="mr-12 text-[clamp(0.72rem,1.55vh,1rem)] font-black uppercase tracking-[0.14em] text-white/90">
                  {tickerPrimary}
                </span>
                <span className="mx-8 inline-block h-2.5 w-2.5 rounded-full bg-[#ccff00] shadow-[0_0_10px_rgba(204,255,0,0.7)]" />
                <span className="mr-12 text-[clamp(0.72rem,1.55vh,1rem)] font-black uppercase tracking-[0.14em] text-[#ccff00]">
                  {tickerSecondary}
                </span>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
