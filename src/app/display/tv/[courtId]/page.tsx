'use client';

import { useState, useEffect, use } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { MatchStatus } from '@/types/tournament';
import TVScoreboardDisplay from '@/components/TVScoreboardDisplay';
import { RefreshCw, MapPin } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function TVCourtDisplayPage({ params }: { params: Promise<{ courtId: string }> }) {
    const { courtId } = use(params);
    const searchParams = useSearchParams();
    const complexFilter = searchParams.get('complex');

    const [loading, setLoading] = useState(true);
    const [activeMatch, setActiveMatch] = useState<any>(null);
    const [tournament, setTournament] = useState<any>(null);

    useEffect(() => {
        // Encontrar torneos activos
        const q = query(collection(db, 'tournaments'), where('status', '==', 'active'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let foundMatch = null;
            let foundTournament = null;

            snapshot.docs.forEach(tournamentDoc => {
                const tData = tournamentDoc.data();

                // Filtro por complejo
                if (complexFilter && tData.complexName !== complexFilter) return;

                const matches = tData.matches || [];
                const matchOnCourt = matches.find((m: any) =>
                    (m.court === parseInt(courtId) || m.courtIndex === parseInt(courtId) - 1) &&
                    m.status === MatchStatus.LIVE
                );

                if (matchOnCourt) {
                    foundMatch = matchOnCourt;
                    foundTournament = { id: tournamentDoc.id, ...tData };

                    // Enriquecer datos de equipo
                    const team1 = matchOnCourt.team1Index > 0 ? tData.teams?.[matchOnCourt.team1Index - 1] : null;
                    const team2 = matchOnCourt.team2Index > 0 ? tData.teams?.[matchOnCourt.team2Index - 1] : null;

                    foundMatch.t1Name = team1 ? `${team1.p1.name} / ${team1.p2.name}` : 'TBD';
                    foundMatch.t2Name = team2 ? `${team2.p1.name} / ${team2.p2.name}` : 'TBD';

                    // Historial de sets anteriores
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

        return () => unsubscribe();
    }, [courtId, complexFilter]);

    if (loading) {
        return (
            <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
                <RefreshCw className="w-12 h-12 text-padel-primary animate-spin" />
                <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-xs">Cargando Sincronización...</p>
            </div>
        );
    }

    if (!activeMatch) {
        return (
            <div className="h-screen bg-[#08080c] flex flex-col items-center justify-center p-20 text-center">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-padel-primary rounded-full blur-[200px]" />
                </div>

                <div className="relative z-10 space-y-8">
                    <div className="inline-flex p-8 rounded-full bg-white/5 border border-white/10 mb-8">
                        <MapPin className="w-16 h-16 text-gray-700" />
                    </div>
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white">
                        ESPERANDO <span className="text-padel-primary">PARTIDO</span>
                    </h1>
                    <p className="text-2xl text-gray-500 font-bold uppercase tracking-[0.3em] max-w-2xl mx-auto">
                        PISTA {courtId} {complexFilter ? `• ${complexFilter}` : ''}
                    </p>
                    <div className="flex items-center justify-center gap-3 text-padel-primary/40 animate-pulse mt-12">
                        <div className="w-3 h-3 rounded-full bg-current" />
                        <span className="font-black uppercase tracking-widest text-sm">Signal Waiting...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <TVScoreboardDisplay
            teamAName={activeMatch.t1Name}
            teamBName={activeMatch.t2Name}
            currentPointsA={activeMatch.points?.t1 || "0"}
            currentPointsB={activeMatch.points?.t2 || "0"}
            gamesA={activeMatch.games?.t1 || 0}
            gamesB={activeMatch.games?.t2 || 0}
            setsA={activeMatch.sets?.t1 || 0}
            setsB={activeMatch.sets?.t2 || 0}
            prevSets={activeMatch.prevSets}
            serverIndicator={activeMatch.server?.team === 1 ? 'A' : activeMatch.server?.team === 2 ? 'B' : undefined}
            smartPadelColor={tournament?.broadcastingSettings?.primaryColor || "#ccff00"}
            adsPlaylist={tournament?.broadcastingSettings?.adMediaUrls}
            forcedAds={activeMatch.forcedAds || false}
        />
    );
}
