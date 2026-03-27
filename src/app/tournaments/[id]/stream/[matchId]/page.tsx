'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService } from '@/lib/dataService';
import { MatchStatus } from '@/types/tournament';
import { Monitor, Layout, Tv } from 'lucide-react';
import { useRouteSegment } from '@/lib/useRouteSegment';

export default function StreamerOverlay() {
    const id = useRouteSegment('id');
    const matchId = useRouteSegment('matchId');
    const [tournament, setTournament] = useState<any>(null);
    const [match, setMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentSponsorIdx, setCurrentSponsorIdx] = useState(0);

    // Dynamic styles from settings
    const primaryColor = tournament?.broadcastingSettings?.primaryColor || '#ccff00';
    const sponsors = tournament?.broadcastingSettings?.sponsors || [];
    const bannerText = tournament?.broadcastingSettings?.bannerText || '';
    const showLiveIndicator = tournament?.broadcastingSettings?.showLiveIndicator !== false;

    // Sponsor rotation
    useEffect(() => {
        if (sponsors.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSponsorIdx(prev => (prev + 1) % sponsors.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [sponsors.length]);

    // Fetch tournament data
    useEffect(() => {
        if (!id) return;
        const unsub = dataService.subscribeToTournament(id, (data) => {
            if (data) setTournament(data);
            setLoading(false);
        });
        return () => { if (unsub) unsub(); };
    }, [id]);

    // Fetch match data
    useEffect(() => {
        if (!id || !matchId) return;
        const unsub = dataService.subscribeToMatches(id, (matches) => {
            const foundMatch = matches.find((m: any) => m.id === matchId);
            if (foundMatch && tournament) {
                const team1 = foundMatch.team1Index > 0 ? tournament.teams?.[foundMatch.team1Index - 1] : null;
                const team2 = foundMatch.team2Index > 0 ? tournament.teams?.[foundMatch.team2Index - 1] : null;

                setMatch({
                    ...foundMatch,
                    team1Name: team1 ? `${team1.p1.name} / ${team1.p2.name}` : 'TBD',
                    team2Name: team2 ? `${team2.p1.name} / ${team2.p2.name}` : 'TBD',
                });
            } else if (foundMatch) {
                // If tournament not yet loaded, set match with what we have
                setMatch(foundMatch);
            }
        });
        return () => { if (unsub) unsub(); };
    }, [id, matchId, tournament]);

    if (loading || !match) return null;

    const isMedicalTimeout = match.status === MatchStatus.PAUSED;

    return (
        <div className="fixed inset-0 pointer-events-none font-outfit overflow-hidden">
            {/* Minimal Background (Chroma Green option or transparent) */}
            {/* <div className="absolute inset-0 bg-[#00ff00] -z-10" /> */}

            {/* Bottom Scoreboard (Classic TV Style) */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-10">
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass border-white/10 rounded-[2rem] overflow-hidden flex items-stretch h-24 shadow-2xl relative"
                >
                    {/* Event Info Label */}
                    <div className="absolute -top-3 left-10 px-4 py-1 rounded-full z-20" style={{ backgroundColor: primaryColor }}>
                        <span className="text-[10px] font-black italic uppercase tracking-widest text-black">
                            {tournament?.name} • {tournament?.category}
                        </span>
                    </div>

                    {/* Team 1 Section */}
                    <div className="flex-1 flex items-center px-8 relative">
                        <div className="flex flex-col flex-1 min-w-0">
                            <h3 className="text-xl font-black italic uppercase text-white truncate tracking-tighter">
                                {match.team1Name}
                            </h3>
                            {match.server?.team === 1 && (
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="flex items-center gap-2 mt-1"
                                >
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor, boxShadow: `0 0 8px ${primaryColor}` }} />
                                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: primaryColor }}>Servicio</span>
                                </motion.div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            {[1, 2, 3].map(setNum => {
                                const currentSetCount = (match.sets?.t1 || 0) + (match.sets?.t2 || 0) + 1;
                                if (setNum > currentSetCount && !match.games?.t1 && !match.games?.t2) return null;
                                return (
                                    <div key={setNum} className={`w-8 h-8 rounded-lg flex items-center justify-center font-black italic text-lg ${setNum === currentSetCount ? 'bg-white/10 text-white' : 'text-white/20'}`} style={setNum === currentSetCount ? { border: `1px solid ${primaryColor}20`, color: primaryColor } : {}}>
                                        {setNum === currentSetCount ? (match.games?.t1 || 0) : '-'}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Separation / Points Divider */}
                    <div className="w-32 flex flex-col items-center justify-center border-x-4 border-black/20" style={{ backgroundColor: primaryColor }}>
                        <span className="text-[10px] font-black italic text-black/40 uppercase mb-1 tracking-tighter">Puntos</span>
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={match.points?.t1 + match.points?.t2}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-4xl font-black italic text-black leading-none tracking-tighter"
                            >
                                {match.points?.t1} : {match.points?.t2}
                            </motion.span>
                        </AnimatePresence>
                    </div>

                    {/* Team 2 Section */}
                    <div className="flex-1 flex items-center px-8 text-right relative justify-end">
                        <div className="flex items-center gap-2 mr-4">
                            {[1, 2, 3].map(setNum => {
                                const currentSetCount = (match.sets?.t1 || 0) + (match.sets?.t2 || 0) + 1;
                                if (setNum > currentSetCount && !match.games?.t1 && !match.games?.t2) return null;
                                return (
                                    <div key={setNum} className={`w-8 h-8 rounded-lg flex items-center justify-center font-black italic text-lg ${setNum === currentSetCount ? 'bg-white/10 text-white' : 'text-white/20'}`} style={setNum === currentSetCount ? { border: `1px solid ${primaryColor}20`, color: primaryColor } : {}}>
                                        {setNum === currentSetCount ? (match.games?.t2 || 0) : '-'}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <h3 className="text-xl font-black italic uppercase text-white truncate tracking-tighter">
                                {match.team2Name}
                            </h3>
                            {match.server?.team === 2 && (
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="flex items-center gap-2 mt-1 justify-end"
                                >
                                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: primaryColor }}>Servicio</span>
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor, boxShadow: `0 0 8px ${primaryColor}` }} />
                                </motion.div>
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
                            <span className="text-[9px] font-black uppercase text-white/40 italic tracking-widest">Sponsored by</span>
                            {sponsors[currentSponsorIdx].logoUrl ? (
                                <img src={sponsors[currentSponsorIdx].logoUrl} className="h-6 object-contain grayscale brightness-200" />
                            ) : null}
                            <span className="text-xs font-black italic uppercase text-white tracking-widest" style={{ color: primaryColor }}>
                                {sponsors[currentSponsorIdx].name}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Medical Timeout Alert Overlay */}
            <AnimatePresence>
                {isMedicalTimeout && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center"
                    >
                        <div className="bg-[#c2410c] px-12 py-6 rounded-full border-4 border-white inline-flex flex-col items-center gap-2 shadow-[0_0_50px_rgba(194,65,12,0.6)] animate-pulse">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Asistencia Médica</h2>
                            <span className="text-xs font-bold text-white/70 uppercase lg:tracking-[0.5em]">Partido Pausado</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* LIVE Indicator Corner */}
            <div className="absolute top-10 right-10 flex items-center gap-3">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black italic text-white/40 uppercase tracking-widest">Live Broadcast</span>
                    <span className="text-lg font-black italic text-white uppercase tracking-tighter">Smart <span className="text-padel-primary">Padel</span></span>
                </div>
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                    <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
                </div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                
                .font-outfit {
                    font-family: 'Outfit', sans-serif;
                }

                .glass {
                    background: rgba(15, 15, 15, 0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }

                body {
                    background: transparent !important;
                }
            `}</style>
        </div>
    );
}
