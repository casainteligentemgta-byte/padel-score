'use client';

import { useState, useEffect } from 'react';
import { MatchStatus } from '@/types/tournament';
import { dataService } from '@/lib/dataService';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useRouteSegment } from '@/lib/useRouteSegment';

export default function GenericStreamOverlay() {
    const courtId = useRouteSegment('courtId');
    const searchParams = useSearchParams();
    const complexFilter = searchParams.get('complex');

    const [activeMatch, setActiveMatch] = useState<any>(null);
    const [tournament, setTournament] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentSponsorIdx, setCurrentSponsorIdx] = useState(0);

    useEffect(() => {
        const unsubscribe = dataService.subscribeToLiveMatches((allMatches) => {
            const matchIndex = parseInt(courtId) - 1;
            const courtMatch = allMatches.find(m => 
                (m.court === parseInt(courtId) || m.courtIndex === matchIndex) &&
                (!complexFilter || m.complexName === complexFilter)
            );

            if (courtMatch) {
                setActiveMatch({
                    ...courtMatch,
                    team1Name: courtMatch.t1Name || 'TBD',
                    team2Name: courtMatch.t2Name || 'TBD',
                });
                setTournament({
                    id: courtMatch.tournamentId,
                    name: courtMatch.tournamentName,
                    broadcastingSettings: {
                        primaryColor: courtMatch.primaryColor,
                        bannerText: courtMatch.bannerText
                    }
                });
            } else {
                setActiveMatch(null);
                setTournament(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [courtId, complexFilter]);

    // Sponsor rotation
    const sponsors = tournament?.broadcastingSettings?.sponsors || [];
    useEffect(() => {
        if (sponsors.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSponsorIdx(prev => (prev + 1) % sponsors.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [sponsors.length]);

    if (loading) return null;

    if (!activeMatch) {
        // En espera de señal
        return (
            <div className="fixed inset-0 bg-transparent flex items-center justify-center font-outfit">
                <div className="bg-black/80 px-10 py-5 rounded-3xl border border-white/10 flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase text-padel-primary animate-pulse tracking-[0.4em]">YouTube Broadcast</span>
                    <h2 className="text-2xl font-black italic uppercase text-white mt-1">Cancha {courtId}</h2>
                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-2">Waiting for live signal...</p>
                </div>
            </div>
        );
    }

    const primaryColor = tournament?.broadcastingSettings?.primaryColor || '#ccff00';
    const isMedicalTimeout = activeMatch.status === MatchStatus.PAUSED;

    return (
        <div className="fixed inset-0 pointer-events-none font-outfit overflow-hidden">
            {/* Bottom Scoreboard */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-10">
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-[#0f0f0f]/80 backdrop-blur-xl border-white/10 rounded-[2rem] overflow-hidden flex items-stretch h-24 shadow-2xl relative"
                >
                    <div className="absolute -top-3 left-10 px-4 py-1 rounded-full z-20" style={{ backgroundColor: primaryColor }}>
                        <span className="text-[10px] font-black italic uppercase tracking-widest text-black">
                            {tournament?.name} • PISTA {courtId}
                        </span>
                    </div>

                    {/* Team 1 */}
                    <div className="flex-1 flex items-center px-8 relative">
                        <div className="flex flex-col flex-1 min-w-0">
                            <h3 className="text-xl font-black italic uppercase text-white truncate tracking-tighter">
                                {activeMatch.team1Name}
                            </h3>
                            {activeMatch.server?.team === 1 && (
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor, boxShadow: `0 0 8px ${primaryColor}` }} />
                                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: primaryColor }}>Servicio</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black italic text-lg bg-white/10" style={{ border: `1px solid ${primaryColor}20`, color: primaryColor }}>
                                {activeMatch.games?.t1 || 0}
                            </div>
                        </div>
                    </div>

                    {/* Points Divider */}
                    <div className="w-32 flex flex-col items-center justify-center border-x-4 border-black/20" style={{ backgroundColor: primaryColor }}>
                        <span className="text-[10px] font-black italic text-black/40 uppercase mb-1 tracking-tighter">Puntos</span>
                        <span className="text-4xl font-black italic text-black leading-none tracking-tighter">
                            {activeMatch.points?.t1} : {activeMatch.points?.t2}
                        </span>
                    </div>

                    {/* Team 2 */}
                    <div className="flex-1 flex items-center px-8 text-right relative justify-end">
                        <div className="flex items-center gap-2 mr-4">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black italic text-lg bg-white/10" style={{ border: `1px solid ${primaryColor}20`, color: primaryColor }}>
                                {activeMatch.games?.t2 || 0}
                            </div>
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <h3 className="text-xl font-black italic uppercase text-white truncate tracking-tighter">
                                {activeMatch.team2Name}
                            </h3>
                            {activeMatch.server?.team === 2 && (
                                <div className="flex items-center gap-2 mt-1 justify-end">
                                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: primaryColor }}>Servicio</span>
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor, boxShadow: `0 0 8px ${primaryColor}` }} />
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Sponsor Bar */}
                <AnimatePresence mode="wait">
                    {sponsors.length > 0 && (
                        <motion.div
                            key={currentSponsorIdx}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            className="absolute bottom-36 left-10 flex items-center gap-4 bg-black/60 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl"
                        >
                            <span className="text-xs font-black italic uppercase text-white tracking-widest" style={{ color: primaryColor }}>
                                {sponsors[currentSponsorIdx].name}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* LIVE Indicator Corner */}
            <div className="absolute top-10 right-10 flex items-center gap-3">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black italic text-white/40 uppercase tracking-widest">YouTube Live</span>
                    <span className="text-lg font-black italic text-white uppercase tracking-tighter">Smart <span className="text-padel-primary">Padel</span></span>
                </div>
                <div className="p-3 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                </div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                body { background: transparent !important; margin: 0; overflow: hidden; }
                .font-outfit { font-family: 'Outfit', sans-serif; }
            `}</style>
        </div>
    );
}
