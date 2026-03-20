'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService } from '@/lib/dataService';
import { useRouteSegment } from '@/lib/useRouteSegment';
import TVScoreboardDisplay from '@/components/TVScoreboardDisplay';
import type { Match } from '@/types/tournament';

type TournamentRow = any;

function getCourtNum(m: any): number | null {
  const n = Number(m?.court ?? (m?.courtIndex != null ? (m.courtIndex as number) + 1 : null));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function toLiveStatus(status: any): boolean {
  return String(status ?? '').toUpperCase() === 'LIVE';
}

export default function TVCourtDisplayByTournamentPage() {
  const tournamentId = useRouteSegment('id');
  const courtId = useRouteSegment('courtId');
  const courtNum = useMemo(() => {
    const n = Number(courtId);
    return Number.isFinite(n) ? n : 1;
  }, [courtId]);

  const [tournament, setTournament] = useState<TournamentRow | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tournamentId) return;

    setLoading(true);

    const unsubT = dataService.subscribeToTournament(tournamentId, (t) => setTournament(t));
    const unsubM = dataService.subscribeToMatches(tournamentId, (ms) => {
      setMatches(ms as any);
      setLoading(false);
    });

    return () => {
      unsubT?.();
      unsubM?.();
    };
  }, [tournamentId]);

  const activeMatch = useMemo(() => {
    const live = matches.filter((m) => toLiveStatus(m?.status));
    if (live.length === 0) return null;

    const exact = live.find((m) => getCourtNum(m) === courtNum);
    return exact || live[0];
  }, [matches, courtNum]);

  const resolvedTeam = useMemo(() => {
    if (!tournament || !activeMatch) return { t1: null as any, t2: null as any };
    const team1Index = (activeMatch as any)?.team1Index ?? (activeMatch as any)?.team1_id;
    const team2Index = (activeMatch as any)?.team2Index ?? (activeMatch as any)?.team2_id;

    const t1 =
      typeof team1Index === 'number' && team1Index > 0 && Array.isArray(tournament.teams)
        ? tournament.teams[team1Index - 1]
        : null;
    const t2 =
      typeof team2Index === 'number' && team2Index > 0 && Array.isArray(tournament.teams)
        ? tournament.teams[team2Index - 1]
        : null;

    return { t1, t2 };
  }, [tournament, activeMatch]);

  const playerNames = useMemo(() => {
    const t1 = resolvedTeam.t1;
    const t2 = resolvedTeam.t2;

    const fallbackA1 = (activeMatch as any)?.t1Name || 'ESPERANDO';
    const fallbackB1 = (activeMatch as any)?.t2Name || 'ACTIVO';

    const a1 = t1?.p1?.name || t1?.p1Name || (typeof fallbackA1 === 'string' ? fallbackA1.split(' / ')[0] : 'ESPERANDO');
    const a2 = t1?.p2?.name || t1?.p2Name || (typeof fallbackA1 === 'string' ? fallbackA1.split(' / ')[1] : 'PARTIDO');
    const b1 = t2?.p1?.name || t2?.p1Name || (typeof fallbackB1 === 'string' ? fallbackB1.split(' / ')[0] : 'SISTEMA');
    const b2 = t2?.p2?.name || t2?.p2Name || (typeof fallbackB1 === 'string' ? fallbackB1.split(' / ')[1] : 'ACTIVO');

    return { a1, a2, b1, b2 };
  }, [resolvedTeam, activeMatch]);

  const prevSets = useMemo(() => {
    const gs = (activeMatch as any)?.games_sets;
    if (!Array.isArray(gs) || gs.length === 0) return [];
    return gs.map((s: any) => `${s?.t1 ?? 0}-${s?.t2 ?? 0}`);
  }, [activeMatch]);

  const serverTeam = useMemo(() => {
    const server = (activeMatch as any)?.server;
    const st = (activeMatch as any)?.serverTeam;
    if (st === 'A' || st === 'B') return st;
    if (server?.team === 1) return 'A';
    if (server?.team === 2) return 'B';
    return 'A';
  }, [activeMatch]);

  const forcedAds = !activeMatch || Boolean((activeMatch as any)?.forcedAds);

  const setsA = (activeMatch as any)?.sets?.t1 ?? 0;
  const setsB = (activeMatch as any)?.sets?.t2 ?? 0;
  const gamesA = (activeMatch as any)?.games?.t1 ?? 0;
  const gamesB = (activeMatch as any)?.games?.t2 ?? 0;

  const currentPointsA = (activeMatch as any)?.points?.t1 ?? String((activeMatch as any)?.puntos?.local ?? 0);
  const currentPointsB = (activeMatch as any)?.points?.t2 ?? String((activeMatch as any)?.puntos?.visitante ?? 0);

  const tournamentName = tournament?.name || 'TORNEO SMART PADEL';
  const tournamentPhase = 'EN VIVO';
  const tournamentCategory = tournament?.category || 'Categoría Libre';

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center"
        >
          <div className="w-14 h-14 border-t-4 border-[#ccff00] rounded-full animate-spin mx-auto" />
          <div className="mt-4 text-xs font-black uppercase tracking-[0.4em] text-gray-500">Cargando TV…</div>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${tournamentId}_${courtNum}_${activeMatch?.id ?? 'none'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0"
      >
        <TVScoreboardDisplay
          tournamentName={tournamentName}
          tournamentPhase={tournamentPhase}
          tournamentCategory={tournamentCategory}
          playerA1={playerNames.a1}
          playerA2={playerNames.a2}
          playerB1={playerNames.b1}
          playerB2={playerNames.b2}
          setsA={Number(setsA) || 0}
          setsB={Number(setsB) || 0}
          gamesA={Number(gamesA) || 0}
          gamesB={Number(gamesB) || 0}
          currentPointsA={currentPointsA}
          currentPointsB={currentPointsB}
          prevSets={prevSets}
          serverTeam={serverTeam as any}
          isGoldPoint={(activeMatch as any)?.isGoldPoint}
          forcedAds={forcedAds}
          adsPlaylist={[]}
          carouselPlaylist={[]}
          tickerMessages={[]}
          tournamentId={tournamentId}
        />
      </motion.div>
    </AnimatePresence>
  );
}

