'use client';

import { useState, useEffect, use, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { MatchStatus } from '@/types/tournament';
import { Trophy, Zap, Star, Megaphone, QrCode, Volume2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function FullScreenDisplay({ params }: { params: Promise<{ id: string, matchId: string }> }) {
    const { id, matchId } = use(params);
    const [tournament, setTournament] = useState<any>(null);
    const [match, setMatch] = useState<any>(null);
    const [nextMatch, setNextMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<'score' | 'ad'>('score');
    const [currentAdIdx, setCurrentAdIdx] = useState(0);
    const prevScore = useRef<string>('');

    // Settings
    const isFinal = match?.roundName?.toLowerCase().includes('final') || match?.roundName?.toLowerCase().includes('definición');
    const primaryColor = isFinal ? '#FFD700' : (tournament?.broadcastingSettings?.primaryColor || '#ccff00');
    const adMedia = tournament?.broadcastingSettings?.adMediaUrls || [];
    const adFreq = tournament?.broadcastingSettings?.adFrequencySeconds || 60;
    const adDur = tournament?.broadcastingSettings?.adDurationSeconds || 10;
    const funEnabled = tournament?.broadcastingSettings?.funAnimationsEnabled !== false;

    // Audio AI (Speech Synthesis)
    useEffect(() => {
        if (!match || !match.points) return;
        const currentScore = `${match.points.t1}-${match.points.t2}`;
        if (prevScore.current !== currentScore && prevScore.current !== '') {
            const utterance = new SpeechSynthesisUtterance(`${match.points.t1}, ${match.points.t2}`);
            utterance.lang = 'es-ES';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
        prevScore.current = currentScore;
    }, [match?.points?.t1, match?.points?.t2]);

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
                            court: found.court || (found.courtIndex !== undefined ? found.courtIndex + 1 : undefined),
                            t1Name: team1 ? `${team1.p1.name} / ${team1.p2.name}` : 'TBD',
                            t2Name: team2 ? `${team2.p1.name} / ${team2.p2.name}` : 'TBD',
                        });

                        // Siguiente partido en esta pista
                        const next = tourneyData.matches
                            .filter((m: any) => m.court === found.court && m.status === MatchStatus.PENDING)
                            .sort((a: any, b: any) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())[0];

                        if (next) {
                            const nt1 = next.team1Index > 0 ? tourneyData.teams?.[next.team1Index - 1] : null;
                            const nt2 = next.team2Index > 0 ? tourneyData.teams?.[next.team2Index - 1] : null;
                            setNextMatch({
                                ...next,
                                t1Name: nt1 ? `${nt1.p1.name} / ${nt1.p2.name}` : 'TBD',
                                t2Name: nt2 ? `${nt2.p1.name} / ${nt2.p2.name}` : 'TBD',
                            });
                        }
                    }
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [id, matchId]);

    // Mode Switching logic
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
        <div className={`h-screen w-screen text-white overflow-hidden font-outfit relative transition-colors duration-1000 ${isFinal ? 'bg-[#000] border-8 border-[#FFD700]/20' : 'bg-[#050505]'}`}>

            {/* Grand Final FX (Sparkles/Glow) */}
            {isFinal && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    <motion.div
                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#FFD70011_0%,_transparent_70%)]"
                    />
                </div>
            )}

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
                                <h1 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter truncate max-w-2xl">
                                    {isFinal && <span className="text-[#FFD700] mr-4 text-6xl">★</span>}
                                    {tournament?.name}
                                </h1>
                                <p className="text-xl lg:text-2xl font-bold uppercase tracking-[0.4em] text-gray-500 mt-2">{tournament?.category} • Pista {match.court}</p>
                            </div>

                            {/* QR CODE SECTION */}
                            <div className="flex items-center gap-12">
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-3 mb-2">
                                        <QrCode className="w-4 h-4 text-gray-500" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Live Brackets</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] transform -rotate-1 hover:rotate-0 transition-transform">
                                        <QRCodeSVG value={`${window.location.origin}/tournaments/${id}`} size={90} level="H" />
                                    </div>
                                </div>
                                <div className="text-right border-l-2 border-white/5 pl-12">
                                    <div className="flex items-center gap-4 justify-end mb-1">
                                        <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.8)]" />
                                        <span className={`text-4xl font-black italic uppercase tracking-tighter ${isFinal ? 'text-[#FFD700]' : 'text-white'}`}>
                                            {isFinal ? 'GRAN FINAL' : 'DIRECTO'}
                                        </span>
                                    </div>
                                    <p className="text-xl font-bold text-gray-600 uppercase tracking-widest">Margarita Padel Center</p>
                                </div>
                            </div>
                        </div>

                        {/* Scoreboard Content */}
                        <div className="flex-1 flex flex-col justify-center gap-12 relative z-10">
                            {/* Match Header Info */}
                            <div className="flex justify-center mb-4">
                                <div className={`px-10 py-3 ${isFinal ? 'bg-[#FFD700]/10 border-[#FFD700]/30' : 'bg-white/5 border-white/10'} border rounded-full flex items-center gap-4`}>
                                    {isFinal ? <Star className="w-6 h-6 text-[#FFD700] fill-[#FFD700]" /> : <Trophy className="w-6 h-6 text-amber-500" />}
                                    <span className={`text-xl font-black italic uppercase tracking-widest ${isFinal ? 'text-[#FFD700]' : 'text-gray-400'}`}>
                                        {match.roundName || 'FASE DE GRUPOS'}
                                    </span>
                                </div>
                            </div>

                            {/* Teams Grid */}
                            <div className="grid grid-cols-12 items-center gap-4 lg:gap-12">
                                {/* Team 1 */}
                                <div className="col-span-5 flex flex-col items-end gap-10">
                                    <div className="flex flex-col items-end relative">
                                        <div className="absolute -right-8 inset-y-0 w-2 bg-gradient-to-b from-transparent via-white/20 to-transparent rounded-full" />
                                        <h2 className="text-7xl lg:text-[7rem] font-black italic uppercase tracking-tighter text-white text-right leading-[0.85] filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                                            {match.t1Name.split(' / ')[0]}<br />
                                            <span style={{ color: primaryColor }}>{match.t1Name.split(' / ')[1]}</span>
                                        </h2>
                                    </div>
                                    <div className="flex gap-4">
                                        {[1, 2, 3].map(setNum => {
                                            const currentSet = (match.sets?.t1 || 0) + (match.sets?.t2 || 0) + 1;
                                            const isPast = setNum < currentSet;
                                            const isCurrent = setNum === currentSet;
                                            return (
                                                <div key={setNum} className={`w-24 h-32 lg:w-32 lg:h-40 rounded-[3rem] flex flex-col items-center justify-center border-2 transition-all duration-500 overflow-hidden relative ${isCurrent ? 'bg-white/10 border-white/20 scale-110 shadow-2xl z-20' : 'bg-black/20 border-white/5 opacity-40'}`}>
                                                    {isCurrent && <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />}
                                                    <span className="text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">SET {setNum}</span>
                                                    <motion.span
                                                        key={isCurrent ? match.games?.t1 : match.games_sets?.[setNum - 1]?.t1}
                                                        initial={isCurrent ? { scale: 1.5, opacity: 0 } : {}}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className={`text-6xl lg:text-7xl font-black italic ${isCurrent ? 'text-white' : 'text-white/40'}`}
                                                    >
                                                        {isPast ? (match.games_sets?.[setNum - 1]?.t1 || 0) : isCurrent ? (match.games?.t1 || 0) : '-'}
                                                    </motion.span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Points Center Hub */}
                                <div className="col-span-2 flex flex-col items-center justify-center relative min-h-[500px]">
                                    {/* Serve Indicator Glows */}
                                    <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none">
                                        <AnimatePresence>
                                            {match.server?.team === 1 && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                                                    className="absolute left-[-100px] inset-y-0 w-32 bg-gradient-to-r from-[#ccff0022] to-transparent blur-3xl"
                                                />
                                            )}
                                            {match.server?.team === 2 && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
                                                    className="absolute right-[-100px] inset-y-0 w-32 bg-gradient-to-l from-[#ccff0022] to-transparent blur-3xl"
                                                />
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="relative group w-full">
                                        <div className="absolute inset-[-4px] bg-white/5 rounded-[4rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                                        <div className={`w-full aspect-[4/5] lg:aspect-square flex flex-col items-center justify-center rounded-[3.5rem] border-4 border-white/10 relative overflow-hidden shadow-2xl ${isFinal ? 'bg-gradient-to-br from-[#FFD700] to-[#B8860B]' : 'bg-gradient-to-br from-[#111] to-[#000]'}`}>

                                            {/* Digital Scanline Effect */}
                                            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />

                                            {!isFinal && <div className="absolute top-0 inset-x-0 h-1" style={{ backgroundColor: primaryColor }} />}

                                            <span className={`text-xl lg:text-2xl font-black italic mb-6 z-10 tracking-[0.4em] ${isFinal ? 'text-black/60' : 'text-white/20'}`}>PUNTOS</span>

                                            <div className="flex items-center gap-2 lg:gap-6 z-10">
                                                <AnimatePresence mode="popLayout">
                                                    <motion.span
                                                        key={match.points?.t1}
                                                        initial={{ y: 40, opacity: 0, scale: 0.8 }}
                                                        animate={{ y: 0, opacity: 1, scale: 1 }}
                                                        exit={{ y: -40, opacity: 0, scale: 0.8 }}
                                                        className={`text-8xl lg:text-[11rem] font-black italic tracking-tighter leading-none ${isFinal ? 'text-black' : 'text-white'}`}
                                                    >
                                                        {match.points?.t1 || '0'}
                                                    </motion.span>
                                                </AnimatePresence>
                                                <span className={`text-4xl lg:text-6xl font-black italic opacity-20 ${isFinal ? 'text-black' : 'text-white'}`}>:</span>
                                                <AnimatePresence mode="popLayout">
                                                    <motion.span
                                                        key={match.points?.t2}
                                                        initial={{ y: 40, opacity: 0, scale: 0.8 }}
                                                        animate={{ y: 0, opacity: 1, scale: 1 }}
                                                        exit={{ y: -40, opacity: 0, scale: 0.8 }}
                                                        className={`text-8xl lg:text-[11rem] font-black italic tracking-tighter leading-none ${isFinal ? 'text-black' : 'text-white'}`}
                                                    >
                                                        {match.points?.t2 || '0'}
                                                    </motion.span>
                                                </AnimatePresence>
                                            </div>

                                            {/* Golden Point Alert */}
                                            {(match.points?.t1 === '40' && match.points?.t2 === '40') && (
                                                <motion.div
                                                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.95, 1, 0.95] }}
                                                    transition={{ repeat: Infinity, duration: 1 }}
                                                    className="absolute bottom-10 px-6 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.5em] rounded-full"
                                                >
                                                    Punto de Oro
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Service Logic */}
                                    <div className="absolute -bottom-16 flex items-center gap-16">
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                animate={match.server?.team === 1 ? { scale: [1, 1.4, 1], rotate: [0, 90, 0] } : { scale: 0.5, opacity: 0.2 }}
                                                className="w-4 h-4 bg-padel-primary rounded-sm shadow-[0_0_20px_#ccff00]"
                                            />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${match.server?.team === 1 ? 'text-white' : 'text-white/20'}`}>SAQUE</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${match.server?.team === 2 ? 'text-white' : 'text-white/20'}`}>SAQUE</span>
                                            <motion.div
                                                animate={match.server?.team === 2 ? { scale: [1, 1.4, 1], rotate: [0, 90, 0] } : { scale: 0.5, opacity: 0.2 }}
                                                className="w-4 h-4 bg-padel-primary rounded-sm shadow-[0_0_20px_#ccff00]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Team 2 */}
                                <div className="col-span-5 flex flex-col items-start gap-10">
                                    <div className="flex flex-col items-start relative">
                                        <div className="absolute -left-8 inset-y-0 w-2 bg-gradient-to-b from-transparent via-white/20 to-transparent rounded-full" />
                                        <h2 className="text-7xl lg:text-[7rem] font-black italic uppercase tracking-tighter text-white text-left leading-[0.85] filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                                            {match.t2Name.split(' / ')[0]}<br />
                                            <span style={{ color: primaryColor }}>{match.t2Name.split(' / ')[1]}</span>
                                        </h2>
                                    </div>
                                    <div className="flex gap-4">
                                        {[1, 2, 3].map(setNum => {
                                            const currentSet = (match.sets?.t1 || 0) + (match.sets?.t2 || 0) + 1;
                                            const isPast = setNum < currentSet;
                                            const isCurrent = setNum === currentSet;
                                            return (
                                                <div key={setNum} className={`w-24 h-32 lg:w-32 lg:h-40 rounded-[3rem] flex flex-col items-center justify-center border-2 transition-all duration-500 overflow-hidden relative ${isCurrent ? 'bg-white/10 border-white/20 scale-110 shadow-2xl z-20' : 'bg-black/20 border-white/5 opacity-40'}`}>
                                                    {isCurrent && <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />}
                                                    <span className="text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">SET {setNum}</span>
                                                    <motion.span
                                                        key={isCurrent ? match.games?.t2 : match.games_sets?.[setNum - 1]?.t2}
                                                        initial={isCurrent ? { scale: 1.5, opacity: 0 } : {}}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className={`text-6xl lg:text-7xl font-black italic ${isCurrent ? 'text-white' : 'text-white/40'}`}
                                                    >
                                                        {isPast ? (match.games_sets?.[setNum - 1]?.t2 || 0) : isCurrent ? (match.games?.t2 || 0) : '-'}
                                                    </motion.span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Banners / Sponsors / NEXT UP */}
                        <div className="mt-12 overflow-hidden h-28 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center px-16 relative">
                            <div className="flex items-center gap-16 animate-marquee whitespace-nowrap">
                                <span className="text-3xl font-black italic uppercase tracking-tighter text-white opacity-20">SMART PADEL PRO SYSTEM</span>
                                <div className="w-3 h-3 rounded-full bg-padel-primary shadow-[0_0_10px_#ccff00]" />
                                <span className="text-3xl font-black italic uppercase tracking-tighter text-padel-primary">
                                    {tournament?.broadcastingSettings?.bannerText || 'BIENVENIDOS AL MEJOR PADEL DEL MUNDO'}
                                </span>
                                {nextMatch && (
                                    <>
                                        <div className="w-3 h-3 rounded-full bg-white opacity-20" />
                                        <span className="text-3xl font-bold italic uppercase tracking-tighter text-white px-8 py-2 bg-white/10 rounded-2xl">
                                            A CONTINUACIÓN EN ESTA PISTA: {nextMatch.t1Name} vs {nextMatch.t2Name}
                                        </span>
                                    </>
                                )}
                                <div className="w-3 h-3 rounded-full bg-padel-primary shadow-[0_0_10px_#ccff00]" />
                                <span className="text-3xl font-black italic uppercase tracking-tighter text-white opacity-20">SMART PADEL PRO SYSTEM</span>
                                <div className="w-3 h-3 rounded-full bg-padel-primary shadow-[0_0_10px_#ccff00]" />
                                <span className="text-3xl font-black italic uppercase tracking-tighter text-white">SÍGUENOS EN @PADELSMART.IO</span>
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
                            <video src={adMedia[currentAdIdx]} autoPlay muted loop className="w-full h-full object-cover" />
                        ) : adMedia[currentAdIdx] ? (
                            <img src={adMedia[currentAdIdx]} className="w-full h-full object-contain p-12 lg:p-32" />
                        ) : (
                            <div className="text-center space-y-12 relative z-10">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-48 h-48 bg-padel-primary/10 rounded-full flex items-center justify-center mx-auto border-4 border-padel-primary/20 backdrop-blur-xl shadow-[0_0_100px_rgba(204,255,0,0.1)]"
                                >
                                    <Megaphone className="w-24 h-24 text-padel-primary filter drop-shadow-[0_0_20px_rgba(204,255,0,0.5)]" />
                                </motion.div>
                                <div className="space-y-4">
                                    <h1 className="text-8xl font-black italic uppercase tracking-tighter text-white leading-none">
                                        Espacio <span className="text-padel-primary">Publicitario</span><br />
                                        <span className="text-5xl opacity-40">Disponible</span>
                                    </h1>
                                    <p className="text-2xl font-bold uppercase tracking-[0.5em] text-[#fb923c] animate-pulse">
                                        Tu marca aquí • Padel Smart TV
                                    </p>
                                </div>
                                <div className="flex items-center justify-center gap-8 pt-8">
                                    <div className="h-px w-24 bg-gradient-to-r from-transparent to-white/20" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Contactar a Dirección</span>
                                    <div className="h-px w-24 bg-gradient-to-l from-transparent to-white/20" />
                                </div>
                            </div>
                        )}

                        {/* Point Notification Overlay */}
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
                .font-outfit { font-family: 'Outfit', sans-serif; }
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .animate-marquee { animation: marquee 30s linear infinite; }
                body { background: black; margin: 0; padding: 0; }
            `}</style>
        </div>
    );
}

