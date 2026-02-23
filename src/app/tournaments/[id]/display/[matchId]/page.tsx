'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { MatchStatus } from '@/types/tournament';
import { Trophy, Zap, Star, Megaphone } from 'lucide-react';

export default function FullScreenDisplay({ params }: { params: Promise<{ id: string, matchId: string }> }) {
    const { id, matchId } = use(params);
    const [tournament, setTournament] = useState<any>(null);
    const [match, setMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<'score' | 'ad'>('score');
    const [currentAdIdx, setCurrentAdIdx] = useState(0);

    // Settings
    const primaryColor = tournament?.broadcastingSettings?.primaryColor || '#ccff00';
    const adMedia = tournament?.broadcastingSettings?.adMediaUrls || [];
    const adFreq = tournament?.broadcastingSettings?.adFrequencySeconds || 60;
    const adDur = tournament?.broadcastingSettings?.adDurationSeconds || 10;
    const funEnabled = tournament?.broadcastingSettings?.funAnimationsEnabled !== false;

    // Data Sync
    useEffect(() => {
        if (!id) return;
        const docRef = doc(db, 'tournaments', id);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const tourneyData = { id: docSnap.id, ...docSnap.data() } as any;
                setTournament(tourneyData);
                if (tourneyData.matches) {
                    const found = tourneyData.matches.find((m: any) => m.id === matchId);
                    if (found) {
                        const team1 = found.team1Index > 0 ? tourneyData.teams?.[found.team1Index - 1] : null;
                        const team2 = found.team2Index > 0 ? tourneyData.teams?.[found.team2Index - 1] : null;
                        setMatch({
                            ...found,
                            t1Name: team1 ? `${team1.p1.name} / ${team1.p2.name}` : 'TBD',
                            t2Name: team2 ? `${team2.p1.name} / ${team2.p2.name}` : 'TBD',
                        });
                    }
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [id, matchId]);

    // Mode Switching logic (Every X seconds switch to AD for adDur seconds)
    useEffect(() => {
        if (adMedia.length === 0) return;

        const interval = setInterval(() => {
            setMode('ad');
            setTimeout(() => {
                setMode('score');
                setCurrentAdIdx(prev => (prev + 1) % adMedia.length);
            }, adDur * 1000);
        }, adFreq * 1000);

        return () => clearInterval(interval);
    }, [adFreq, adDur, adMedia.length]);

    if (loading || !match) return (
        <div className="h-screen bg-black flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-padel-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="h-screen w-screen bg-[#050505] text-white overflow-hidden font-outfit relative">
            <AnimatePresence mode="wait">
                {mode === 'score' ? (
                    <motion.div
                        key="score"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full w-full flex flex-col p-12 lg:p-20 relative"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: primaryColor }} />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
                        </div>

                        {/* Tournament Header */}
                        <div className="flex justify-between items-end border-b border-white/10 pb-8 mb-12 relative z-10">
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter truncate max-w-2xl">{tournament?.name}</h1>
                                <p className="text-xl lg:text-2xl font-bold uppercase tracking-[0.4em] text-gray-500 mt-2">{tournament?.category} • Pista {match.court}</p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-4 justify-end">
                                    <div className="w-4 h-4 rounded-full bg-red-600 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.5)]" />
                                    <span className="text-3xl font-black italic uppercase tracking-widest text-white">EN VIVO</span>
                                </div>
                                <p className="text-xl font-bold text-gray-600 uppercase mt-2">Margarita Padel Club</p>
                            </div>
                        </div>

                        {/* Scoreboard Content */}
                        <div className="flex-1 flex flex-col justify-center gap-12 relative z-10">
                            {/* Match Header Info */}
                            <div className="flex justify-center mb-4">
                                <div className="px-10 py-3 bg-white/5 border border-white/10 rounded-full flex items-center gap-4">
                                    <Trophy className="w-6 h-6 text-amber-500" />
                                    <span className="text-xl font-black italic uppercase tracking-widest text-gray-400">FASE DE GRUPOS</span>
                                </div>
                            </div>

                            {/* Teams Grid */}
                            <div className="grid grid-cols-12 items-center gap-8">
                                {/* Team 1 */}
                                <div className="col-span-5 flex flex-col items-end gap-6">
                                    <div className="flex flex-col items-end">
                                        <h2 className="text-6xl lg:text-7xl font-black italic uppercase tracking-tighter text-white text-right leading-tight">
                                            {match.t1Name.split(' / ')[0]}<br />
                                            <span style={{ color: primaryColor }}>{match.t1Name.split(' / ')[1]}</span>
                                        </h2>
                                    </div>
                                    <div className="flex gap-4">
                                        {[1, 2, 3].map(setNum => {
                                            const currentSet = (match.sets?.t1 || 0) + (match.sets?.t2 || 0) + 1;
                                            return (
                                                <div key={setNum} className={`w-20 h-24 lg:w-24 lg:h-28 rounded-3xl flex flex-col items-center justify-center border-2 transition-all ${setNum === currentSet ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5'}`}>
                                                    <span className="text-[10px] font-black uppercase text-gray-600 mb-2">Set {setNum}</span>
                                                    <span className={`text-4xl lg:text-5xl font-black italic ${setNum === currentSet ? 'text-white' : 'text-white/20'}`}>
                                                        {setNum < currentSet ? match.games?.t1 : setNum === currentSet ? (match.games?.t1 || 0) : '-'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Points Center */}
                                <div className="col-span-2 flex flex-col items-center justify-center h-full">
                                    <div className="w-full aspect-square flex flex-col items-center justify-center border-x-8 border-black/30 relative" style={{ backgroundColor: primaryColor }}>
                                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black via-transparent to-transparent" />
                                        <span className="text-2xl font-black italic text-black/40 uppercase tracking-tighter mb-4 z-10">PUNTOS</span>
                                        <div className="flex items-center gap-4 z-10">
                                            <AnimatePresence mode="wait">
                                                <motion.span
                                                    key={match.points?.t1}
                                                    initial={{ y: 20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    className="text-8xl lg:text-9xl font-black italic text-black tracking-tighter leading-none"
                                                >
                                                    {match.points?.t1 || '0'}
                                                </motion.span>
                                            </AnimatePresence>
                                            <span className="text-5xl font-black italic text-black/20">:</span>
                                            <AnimatePresence mode="wait">
                                                <motion.span
                                                    key={match.points?.t2}
                                                    initial={{ y: 20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    className="text-8xl lg:text-9xl font-black italic text-black tracking-tighter leading-none"
                                                >
                                                    {match.points?.t2 || '0'}
                                                </motion.span>
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Serving Indicator */}
                                    <div className="mt-8 flex items-center gap-12">
                                        <motion.div
                                            animate={match.server?.team === 1 ? { scale: [1, 1.2, 1], opacity: 1 } : { opacity: 0.1 }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: primaryColor, boxShadow: `0 0 20px ${primaryColor}` }}
                                        />
                                        <motion.div
                                            animate={match.server?.team === 2 ? { scale: [1, 1.2, 1], opacity: 1 } : { opacity: 0.1 }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: primaryColor, boxShadow: `0 0 20px ${primaryColor}` }}
                                        />
                                    </div>
                                </div>

                                {/* Team 2 */}
                                <div className="col-span-5 flex flex-col items-start gap-6">
                                    <div className="flex flex-col items-start">
                                        <h2 className="text-6xl lg:text-7xl font-black italic uppercase tracking-tighter text-white text-left leading-tight">
                                            {match.t2Name.split(' / ')[0]}<br />
                                            <span style={{ color: primaryColor }}>{match.t2Name.split(' / ')[1]}</span>
                                        </h2>
                                    </div>
                                    <div className="flex gap-4">
                                        {[1, 2, 3].map(setNum => {
                                            const currentSet = (match.sets?.t1 || 0) + (match.sets?.t2 || 0) + 1;
                                            return (
                                                <div key={setNum} className={`w-20 h-24 lg:w-24 lg:h-28 rounded-3xl flex flex-col items-center justify-center border-2 transition-all ${setNum === currentSet ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5'}`}>
                                                    <span className="text-[10px] font-black uppercase text-gray-600 mb-2">Set {setNum}</span>
                                                    <span className={`text-4xl lg:text-5xl font-black italic ${setNum === currentSet ? 'text-white' : 'text-white/20'}`}>
                                                        {setNum < currentSet ? match.games?.t2 : setNum === currentSet ? (match.games?.t2 || 0) : '-'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Banners / Sponsors */}
                        <div className="mt-12 overflow-hidden h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center px-12 relative">
                            <div className="flex items-center gap-12 animate-marquee whitespace-nowrap">
                                <span className="text-2xl font-black italic uppercase tracking-tighter text-white opacity-20">SMART PADEL PRO SYSTEM</span>
                                <div className="w-2 h-2 rounded-full bg-padel-primary" />
                                <span className="text-2xl font-black italic uppercase tracking-tighter text-padel-primary">{tournament?.broadcastingSettings?.bannerText || 'BIENVENIDOS AL MEJOR PADEL DEL MUNDO'}</span>
                                <div className="w-2 h-2 rounded-full bg-padel-primary" />
                                <span className="text-2xl font-black italic uppercase tracking-tighter text-white opacity-20">SMART PADEL PRO SYSTEM</span>
                                <div className="w-2 h-2 rounded-full bg-padel-primary" />
                                <span className="text-2xl font-black italic uppercase tracking-tighter text-white">SÍGUENOS EN @PADELSMART.IO</span>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="ad"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="h-full w-full bg-black flex items-center justify-center relative"
                    >
                        {adMedia[currentAdIdx]?.endsWith('.mp4') ? (
                            <video
                                src={adMedia[currentAdIdx]}
                                autoPlay
                                muted
                                loop
                                className="w-full h-full object-cover"
                            />
                        ) : adMedia[currentAdIdx] ? (
                            <img
                                src={adMedia[currentAdIdx]}
                                className="w-full h-full object-contain p-12 lg:p-32"
                            />
                        ) : (
                            <div className="text-center space-y-8">
                                <Megaphone className="w-32 h-32 text-padel-primary mx-auto animate-bounce" />
                                <h1 className="text-6xl font-black italic uppercase tracking-tighter">Espacio Reservado</h1>
                                <p className="text-2xl font-bold uppercase tracking-widest text-[#fb923c]">Patrocinador en espera</p>
                            </div>
                        )}

                        {/* Point Notification Overlay (If funEnabled and score just changed) */}
                        {funEnabled && match.points?.t1 === '0' && match.points?.t2 === '0' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1.5 }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            >
                                <div className="p-12 bg-padel-primary text-black rounded-full font-black italic text-8xl shadow-[0_0_100px_#ccff00]">
                                    GAME!
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                
                .font-outfit {
                    font-family: 'Outfit', sans-serif;
                }

                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }

                .animate-marquee {
                    animation: marquee 20s linear infinite;
                }
            `}</style>
        </div>
    );
}
