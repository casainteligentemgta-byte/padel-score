'use client';

import { useState, useEffect, useMemo } from 'react';
import { MatchStatus } from '@/types/tournament';
import TVScoreboardDisplay from '@/components/TVScoreboardDisplay';
import { RefreshCw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { dataService } from '@/lib/dataService';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useRouteSegment } from '@/lib/useRouteSegment';
import {
    partitionPlaylistRows,
    fetchCanchaPlaylistConfig,
    fetchCanchaPlaylistRows,
    fetchCanchaTiraMessages,
    normalizeCourtPlaylistRows,
    type CourtPlaylistRowDb,
} from '@/lib/courtPlaylists';

export default function TVCourtDisplayPage() {
    const courtId = useRouteSegment('courtId');
    const router = useRouter();
    const searchParams = useSearchParams();
    const complexFilter = searchParams.get('complex');
    const nativeMode = searchParams.get('native') === '1';
    const premiumMode = searchParams.get('premium') === '1';
    const supabase = getSupabaseClient();

    const [loading, setLoading] = useState(true);
    const [activeMatch, setActiveMatch] = useState<any>(null);
    const [tournament, setTournament] = useState<any>(null);
    const [tickerMessages, setTickerMessages] = useState<{ id: string; mensaje: string }[]>([]);
    const [courtRows, setCourtRows] = useState<CourtPlaylistRowDb[]>([]);
    const [carouselCfg, setCarouselCfg] = useState<{
        imagen_loop: boolean;
        imagen_pausa_entre_segundos: number;
    } | null>(null);

    useEffect(() => {
        // En TV de cancha, mantener comportamiento local por defecto.
        // Solo saltar a vista premium si se solicita explícitamente con ?premium=1.
        if (nativeMode || !premiumMode) return;
        const torneoId = String(activeMatch?.tournamentId || '').trim();
        const partidoId = String(activeMatch?.id || '').trim();
        const status = String(activeMatch?.status || '').trim();
        if (!torneoId || !partidoId || partidoId.startsWith('live_')) return;
        const isActive = status === MatchStatus.LIVE || status === 'LIVE';
        if (!isActive) return;
        router.replace(`/tournaments/${encodeURIComponent(torneoId)}/display/${encodeURIComponent(partidoId)}`);
    }, [nativeMode, premiumMode, activeMatch?.id, activeMatch?.status, activeMatch?.tournamentId, router]);

    useEffect(() => {
        const unsubscribeMatches = dataService.subscribeToLiveMatches((allMatches) => {
            const matchIndex = parseInt(courtId) - 1;
            const courtMatch = allMatches.find(m => 
                (m.court === parseInt(courtId) || m.courtIndex === matchIndex) &&
                (!complexFilter || m.complexName === complexFilter)
            );

            if (courtMatch) {
                const tData = {
                    id: courtMatch.tournamentId,
                    name: courtMatch.tournamentName,
                    primaryColor: courtMatch.primaryColor
                };

                const teamA = {
                    player1: { name: courtMatch.team1?.p1?.name || (courtMatch.t1Name?.split(' / ')[0]) || '---' },
                    player2: { name: courtMatch.team1?.p2?.name || (courtMatch.t1Name?.split(' / ')[1]) || '---' },
                    sets: courtMatch.sets?.t1 || 0,
                    games: courtMatch.games?.t1 || 0,
                    points: courtMatch.points?.t1 || 0,
                };
                const teamB = {
                    player1: { name: courtMatch.team2?.p1?.name || (courtMatch.t2Name?.split(' / ')[0]) || '---' },
                    player2: { name: courtMatch.team2?.p2?.name || (courtMatch.t2Name?.split(' / ')[1]) || '---' },
                    sets: courtMatch.sets?.t2 || 0,
                    games: courtMatch.games?.t2 || 0,
                    points: courtMatch.points?.t2 || 0,
                };

                const prevSets: string[] = [];
                if (courtMatch.games_sets) {
                    courtMatch.games_sets.forEach((set: any) => {
                        prevSets.push(`${set.t1}-${set.t2}`);
                    });
                }

                setActiveMatch({
                    ...courtMatch,
                    teamA,
                    teamB,
                    prevSets
                });
                setTournament(tData);
            } else {
                setActiveMatch(null);
                setTournament(null);
            }
            setLoading(false);
        });

        const fetchTicker = async () => {
            if (!supabase) return;
            try {
                const msgs = await fetchCanchaTiraMessages(supabase, `cancha_${courtId}`, complexFilter);
                setTickerMessages(msgs);
            } catch (e) {
                console.warn('[TV Display] Tira informativa:', e);
                setTickerMessages([]);
            }
        };
        void fetchTicker();

        const tickerChannel = supabase
            ?.channel('tira-changes-tv')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tira_informativa' }, () => fetchTicker())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'cancha_tira' }, () => fetchTicker())
            .subscribe();

        const initDisplay = async () => {
            if (!supabase) return;
            const res = await fetchCanchaPlaylistRows(supabase, `cancha_${courtId}`, complexFilter);
            if (res.error) {
                console.warn('[TV Display] cancha_publicidad:', res.error.message);
                setCourtRows([]);
                return;
            }
            setCourtRows(normalizeCourtPlaylistRows((res.data as unknown[]) || []));

            if (complexFilter) {
                const cfg = await fetchCanchaPlaylistConfig(supabase, `cancha_${courtId}`, complexFilter);
                setCarouselCfg(
                    cfg
                        ? {
                              imagen_loop: cfg.imagen_loop !== false,
                              imagen_pausa_entre_segundos: Math.max(
                                  0,
                                  Math.floor(Number(cfg.imagen_pausa_entre_segundos) || 0),
                              ),
                          }
                        : null,
                );
            } else {
                setCarouselCfg(null);
            }
        };
        void initDisplay();

        const displayChannel = supabase
            ?.channel(`display-changes-tv-${courtId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'cancha_publicidad', filter: `cancha_id=eq.cancha_${courtId}` },
                () => initDisplay(),
            )
            .on('postgres_changes', { event: '*', schema: 'public', table: 'media_content' }, () => initDisplay())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'cancha_playlist_config' }, () => initDisplay())
            .subscribe();

        return () => {
            unsubscribeMatches();
            tickerChannel?.unsubscribe();
            displayChannel?.unsubscribe();
        };
    }, [courtId, complexFilter, supabase]);

    const { finalVideos, finalCarousel, carouselDurationsSec } = useMemo(() => {
        const { video, imagen } = partitionPlaylistRows(courtRows);
        const finalVideos = video
            .map((r) => r.media_content?.url)
            .filter((u): u is string => Boolean(u));
        const finalCarousel = imagen
            .map((r) => r.media_content?.url)
            .filter((u): u is string => Boolean(u));
        const carouselDurationsSec = imagen.map((r) => Math.max(1, Number(r.duracion_segundos) || 10));
        return { finalVideos, finalCarousel, carouselDurationsSec };
    }, [courtRows]);

    if (loading) {
        return (
            <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
                <RefreshCw className="w-12 h-12 text-padel-primary animate-spin" />
                <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-xs">Cargando Sincronización...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black overflow-hidden flex items-center justify-center p-8">
            <TVScoreboardDisplay
                tournamentName={tournament?.name || (activeMatch ? 'TORNEO SMART PADEL' : 'SMART PADEL PRO SYSTEM')}
                tournamentPhase={activeMatch ? activeMatch.phase || 'Fase de Grupos' : `CANCHA ${courtId}`}
                tournamentCategory={activeMatch ? activeMatch.category || tournament?.category || 'Categoría Libre' : 'SISTEMA ACTIVO'}
                playerA1={activeMatch?.teamA?.player1?.name || 'ESPERANDO'}
                playerA2={activeMatch?.teamA?.player2?.name || 'PARTIDO'}
                playerB1={activeMatch?.teamB?.player1?.name || 'SISTEMA'}
                playerB2={activeMatch?.teamB?.player2?.name || 'ACTIVO'}
                setsA={activeMatch?.teamA?.sets || 0}
                setsB={activeMatch?.teamB?.sets || 0}
                gamesA={activeMatch?.teamA?.games || 0}
                gamesB={activeMatch?.teamB?.games || 0}
                currentPointsA={String(activeMatch?.teamA?.points || 0)}
                currentPointsB={String(activeMatch?.teamB?.points || 0)}
                prevSets={activeMatch?.prevSets || []}
                serverTeam={activeMatch?.serverTeam || 'A'}
                isGoldPoint={activeMatch?.isGoldPoint}
                forcedAds={!activeMatch || activeMatch.forcedAds}
                adsPlaylist={finalVideos}
                carouselPlaylist={finalCarousel}
                carouselDurationsSec={finalCarousel.length ? carouselDurationsSec : undefined}
                carouselLoop={carouselCfg?.imagen_loop !== false}
                carouselPauseBetweenSec={carouselCfg?.imagen_pausa_entre_segundos ?? 0}
                tickerMessages={tickerMessages}
                tournamentId={tournament?.id}
            />
        </div>
    );
}
