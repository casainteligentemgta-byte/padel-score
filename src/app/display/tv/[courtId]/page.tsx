'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot as onSnapshotFirebase } from 'firebase/firestore';
import { MatchStatus } from '@/types/tournament';
import TVScoreboardDisplay from '@/components/TVScoreboardDisplay';
import { RefreshCw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { dataService } from '@/lib/dataService';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useRouteSegment } from '@/lib/useRouteSegment';

export default function TVCourtDisplayPage() {
    const courtId = useRouteSegment('courtId');
    const searchParams = useSearchParams();
    const complexFilter = searchParams.get('complex');
    const supabase = getSupabaseClient();

    const [loading, setLoading] = useState(true);
    const [activeMatch, setActiveMatch] = useState<any>(null);
    const [tournament, setTournament] = useState<any>(null);
    const [tickerMessages, setTickerMessages] = useState<any[]>([]);
    const [courtPlaylist, setCourtPlaylist] = useState<any[]>([]);

    useEffect(() => {
        // 1. Firebase Live Match Subscription
        const q = query(collection(db, 'tournaments'), where('status', '==', 'active'));
        const unsubFirebase = onSnapshotFirebase(q, (snapshot) => {
            let foundMatch = null;
            let foundTournament = null;
            snapshot.docs.forEach(tournamentDoc => {
                const tData = tournamentDoc.data();
                if (complexFilter && tData.complexName !== complexFilter) return;
                const matches = tData.matches || [];
                const matchOnCourt = matches.find((m: any) =>
                    (m.court === parseInt(courtId) || m.courtIndex === parseInt(courtId) - 1) &&
                    m.status === MatchStatus.LIVE
                );
                if (matchOnCourt) {
                    foundMatch = matchOnCourt;
                    foundTournament = { id: tournamentDoc.id, ...tData };
                    const team1 = matchOnCourt.team1Index > 0 ? tData.teams?.[matchOnCourt.team1Index - 1] : null;
                    const team2 = matchOnCourt.team2Index > 0 ? tData.teams?.[matchOnCourt.team2Index - 1] : null;
                    foundMatch.t1Name = team1 ? `${team1.p1.name} / ${team1.p2.name}` : 'TBD';
                    foundMatch.t2Name = team2 ? `${team2.p1.name} / ${team2.p2.name}` : 'TBD';

                    // Solo extraer nombres para playerA1, A2 etc
                    foundMatch.teamA = {
                        player1: { name: team1?.p1?.name || '---' },
                        player2: { name: team1?.p2?.name || '---' },
                        sets: matchOnCourt.sets?.t1 || 0,
                        games: matchOnCourt.games?.t1 || 0,
                        points: matchOnCourt.points?.t1 || 0
                    };
                    foundMatch.teamB = {
                        player1: { name: team2?.p1?.name || '---' },
                        player2: { name: team2?.p2?.name || '---' },
                        sets: matchOnCourt.sets?.t2 || 0,
                        games: matchOnCourt.games?.t2 || 0,
                        points: matchOnCourt.points?.t2 || 0
                    };

                    const prevSets: string[] = [];
                    if (matchOnCourt.games_sets) {
                        matchOnCourt.games_sets.forEach((set: any) => { prevSets.push(`${set.t1}-${set.t2}`); });
                    }
                    foundMatch.prevSets = prevSets;
                }
            });
            setActiveMatch(foundMatch);
            setTournament(foundTournament);
            setLoading(false);
        });

        // 2. Supabase Ticker Subscription
        const fetchTicker = async () => {
            try {
                const data = await dataService.getTiraInformativa();
                setTickerMessages(Array.isArray(data) ? data : []);
            } catch (e) {
                console.warn('[TV Display] Tira informativa:', e);
                setTickerMessages([]);
            }
        };
        fetchTicker();

        const tickerChannel = supabase?.channel('tira-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tira_informativa' }, () => fetchTicker())
            .subscribe();

        // 3. Supabase Playlist por cancha (cancha_publicidad)
        const initDisplay = async () => {
            if (!supabase) return;
            const canchaKey = `cancha_${courtId}`;
            const { data, error } = await supabase
                .from('cancha_publicidad')
                .select('orden, duracion_segundos, media_content(*)')
                .eq('cancha_id', canchaKey)
                .order('orden', { ascending: true });
            if (error) {
                console.warn('[TV Display] cancha_publicidad:', error.message);
                setCourtPlaylist([]);
                return;
            }
            setCourtPlaylist((data as any[]) || []);
        };
        initDisplay();

        const displayChannel = supabase?.channel('display-changes-v2')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'cancha_publicidad', filter: `cancha_id=eq.cancha_${courtId}` }, () => initDisplay())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'media_content' }, () => initDisplay())
            .subscribe();

        return () => {
            unsubFirebase();
            tickerChannel?.unsubscribe();
            displayChannel?.unsubscribe();
        };
    }, [courtId, complexFilter, supabase]);

    if (loading) {
        return (
            <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
                <RefreshCw className="w-12 h-12 text-padel-primary animate-spin" />
                <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-xs">Cargando Sincronización...</p>
            </div>
        );
    }

    // Playlist final desde cancha_publicidad ordenada por orden.
    const finalVideos = courtPlaylist
        .map((r: any) => r?.media_content)
        .filter((m: any) => m?.tipo && String(m.tipo).includes('video'))
        .map((m: any) => m.url)
        .filter(Boolean);

    const finalCarousel = courtPlaylist
        .map((r: any) => r?.media_content)
        .filter((m: any) => m?.tipo === 'imagen')
        .map((m: any) => m.url)
        .filter(Boolean);

    return (
        <div className="min-h-screen bg-black overflow-hidden flex items-center justify-center p-8">
            <TVScoreboardDisplay
                tournamentName={tournament?.name || (activeMatch ? "TORNEO SMART PADEL" : "SMART PADEL PRO SYSTEM")}
                tournamentPhase={activeMatch ? (activeMatch.phase || "Fase de Grupos") : `CANCHA ${courtId}`}
                tournamentCategory={activeMatch ? (activeMatch.category || tournament?.category || "Categoría Libre") : "SISTEMA ACTIVO"}
                playerA1={activeMatch?.teamA?.player1?.name || "ESPERANDO"}
                playerA2={activeMatch?.teamA?.player2?.name || "PARTIDO"}
                playerB1={activeMatch?.teamB?.player1?.name || "SISTEMA"}
                playerB2={activeMatch?.teamB?.player2?.name || "ACTIVO"}
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
                tickerMessages={tickerMessages}
                tournamentId={tournament?.id}
            />
        </div>
    );
}
