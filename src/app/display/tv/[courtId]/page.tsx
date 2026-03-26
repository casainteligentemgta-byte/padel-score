'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot as onSnapshotFirebase } from 'firebase/firestore';
import { MatchStatus } from '@/types/tournament';
import TVScoreboardDisplay from '@/components/TVScoreboardDisplay';
import { RefreshCw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useRouteSegment } from '@/lib/useRouteSegment';
import {
    partitionPlaylistRows,
    fetchCanchaPlaylistConfig,
    fetchCanchaTiraMessages,
    type CourtPlaylistRowDb,
} from '@/lib/courtPlaylists';

export default function TVCourtDisplayPage() {
    const courtId = useRouteSegment('courtId');
    const searchParams = useSearchParams();
    const complexFilter = searchParams.get('complex');
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
        const q = query(collection(db, 'tournaments'), where('status', '==', 'active'));
        const unsubFirebase = onSnapshotFirebase(q, (snapshot) => {
            let foundMatch = null;
            let foundTournament = null;
            snapshot.docs.forEach((tournamentDoc) => {
                const tData = tournamentDoc.data();
                if (complexFilter && tData.complexName !== complexFilter) return;
                const matches = tData.matches || [];
                const matchOnCourt = matches.find(
                    (m: any) =>
                        (m.court === parseInt(courtId) || m.courtIndex === parseInt(courtId) - 1) &&
                        m.status === MatchStatus.LIVE,
                );
                if (matchOnCourt) {
                    foundMatch = matchOnCourt;
                    foundTournament = { id: tournamentDoc.id, ...tData };
                    const team1 = matchOnCourt.team1Index > 0 ? tData.teams?.[matchOnCourt.team1Index - 1] : null;
                    const team2 = matchOnCourt.team2Index > 0 ? tData.teams?.[matchOnCourt.team2Index - 1] : null;
                    foundMatch.t1Name = team1 ? `${team1.p1.name} / ${team1.p2.name}` : 'TBD';
                    foundMatch.t2Name = team2 ? `${team2.p1.name} / ${team2.p2.name}` : 'TBD';

                    foundMatch.teamA = {
                        player1: { name: team1?.p1?.name || '---' },
                        player2: { name: team1?.p2?.name || '---' },
                        sets: matchOnCourt.sets?.t1 || 0,
                        games: matchOnCourt.games?.t1 || 0,
                        points: matchOnCourt.points?.t1 || 0,
                    };
                    foundMatch.teamB = {
                        player1: { name: team2?.p1?.name || '---' },
                        player2: { name: team2?.p2?.name || '---' },
                        sets: matchOnCourt.sets?.t2 || 0,
                        games: matchOnCourt.games?.t2 || 0,
                        points: matchOnCourt.points?.t2 || 0,
                    };

                    const prevSets: string[] = [];
                    if (matchOnCourt.games_sets) {
                        matchOnCourt.games_sets.forEach((set: any) => {
                            prevSets.push(`${set.t1}-${set.t2}`);
                        });
                    }
                    foundMatch.prevSets = prevSets;
                }
            });
            setActiveMatch(foundMatch);
            setTournament(foundTournament);
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
            const canchaKey = `cancha_${courtId}`;
            let q = supabase
                .from('cancha_publicidad')
                .select('orden, duracion_segundos, playlist_slot, media_content(*)')
                .eq('cancha_id', canchaKey)
                .order('orden', { ascending: true });
            if (complexFilter) q = q.eq('venue_name', complexFilter);
            const r1 = await q;
            let rows: CourtPlaylistRowDb[] = (r1.data as CourtPlaylistRowDb[]) || [];
            let err = r1.error;
            if (err && err.message?.includes('playlist_slot')) {
                let q2 = supabase
                    .from('cancha_publicidad')
                    .select('orden, duracion_segundos, media_content(*)')
                    .eq('cancha_id', canchaKey)
                    .order('orden', { ascending: true });
                if (complexFilter) q2 = q2.eq('venue_name', complexFilter);
                const r2 = await q2;
                rows = (r2.data as CourtPlaylistRowDb[]) || [];
                err = r2.error;
            }
            if (err) {
                console.warn('[TV Display] cancha_publicidad:', err.message);
                setCourtRows([]);
                return;
            }
            setCourtRows(rows);

            if (complexFilter) {
                const cfg = await fetchCanchaPlaylistConfig(supabase, canchaKey, complexFilter);
                setCarouselCfg(
                    cfg
                        ? {
                              imagen_loop: cfg.imagen_loop !== false,
                              imagen_pausa_entre_segundos: Math.max(0, Number(cfg.imagen_pausa_entre_segundos) || 0),
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
            unsubFirebase();
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
