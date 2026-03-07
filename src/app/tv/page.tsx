'use client';

import { useState, useEffect } from 'react';
import { dataService } from '@/lib/dataService';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, doc } from 'firebase/firestore';
import { Trophy, Zap, Radio, Clock, Thermometer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchStatus } from '@/types/tournament';

export default function TVKioskPage() {
    const [liveMatch, setLiveMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [temp, setTemp] = useState<number | null>(null);

    // Reloj digital para el TV
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch temperatura (Isla de Margarita)
    useEffect(() => {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=11.0&longitude=-63.9&current_weather=true')
            .then(r => r.json())
            .then(data => setTemp(Math.round(data.current_weather?.temperature ?? 0)))
            .catch(() => { });
    }, []);

    // Escuchar partidos en vivo globalmente de ambas fuentes
    useEffect(() => {
        let firebaseMatch: any = null;
        let supabaseMatches: any[] = [];

        // 1. Firebase Source
        const q = query(collection(db, 'tournaments'));
        const unsubscribeFirebase = onSnapshot(q, (snapshot) => {
            let foundMatch: any = null;
            snapshot.docs.forEach(docSnap => {
                if (foundMatch) return;
                const tournament = docSnap.data();
                if (tournament.matches) {
                    const active = tournament.matches.find((m: any) =>
                        m.status === MatchStatus.LIVE ||
                        m.status === 'LIVE' ||
                        m.status === 'IN_PROGRESS' ||
                        m.status === 'STARTED'
                    );
                    if (active) {
                        const team1 = active.team1Index > 0 ? tournament.teams?.[active.team1Index - 1] : active.team1;
                        const team2 = active.team2Index > 0 ? tournament.teams?.[active.team2Index - 1] : active.team2;

                        foundMatch = {
                            ...active,
                            tournamentName: tournament.name,
                            tournamentId: docSnap.id,
                            category: tournament.category,
                            t1Name: team1 ? (team1.p1?.name ? `${team1.p1.name} / ${team1.p2.name}` : (team1.name || 'TBD')) : 'TBD',
                            t2Name: team2 ? (team2.p1?.name ? `${team2.p1.name} / ${team2.p2.name}` : (team2.name || 'TBD')) : 'TBD',
                            primaryColor: tournament.broadcastingSettings?.primaryColor || '#ccff00',
                            bannerText: tournament.broadcastingSettings?.bannerText || 'SMART PADEL PRO TV'
                        };
                    }
                }
            });
            firebaseMatch = foundMatch;
            updateDisplay();
        });

        // 2. Supabase Source (Polling for now, or use live subscription if needed)
        const fetchSupabase = async () => {
            try {
                const live = await dataService.getLiveMatches();
                supabaseMatches = live || [];
                updateDisplay();
            } catch (err) {
                console.warn('TV: Error fetching Supabase matches', err);
            }
        };

        const updateDisplay = () => {
            // Prioridad: Firebase (históricamente más confiable para live scores)
            // sino cualquier partido en Supabase marcado como LIVE
            const finalMatch = firebaseMatch || (supabaseMatches.length > 0 ? supabaseMatches[0] : null);
            setLiveMatch(finalMatch);
            setLoading(false);
        };

        fetchSupabase();
        const supInterval = setInterval(fetchSupabase, 10000);

        return () => {
            unsubscribeFirebase();
            clearInterval(supInterval);
        };
    }, []);

    if (loading) {
        return (
            <div className="h-screen bg-black flex items-center justify-center">
                <div className="w-20 h-20 border-t-4 border-padel-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-[#050505] text-white overflow-hidden font-outfit select-none">
            <AnimatePresence mode="wait">
                {!liveMatch ? (
                    /* PANTALLA DE ESPERA (KIOSKO) */
                    <motion.div
                        key="waiting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full w-full flex flex-col items-center justify-center p-20 text-center relative"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-padel-primary/10 via-transparent to-transparent opacity-50" />

                        <motion.div
                            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            className="mb-12"
                        >
                            <Trophy className="w-40 h-40 text-padel-primary opacity-20" />
                        </motion.div>

                        <h1 className="text-7xl font-black italic uppercase tracking-tighter mb-4">
                            SISTEMA <span className="text-padel-primary">PADEL SCORE</span>
                        </h1>
                        <p className="text-2xl font-bold text-gray-500 uppercase tracking-[0.5em] mb-12">
                            Esperando partidos en vivo
                        </p>

                        <div className="flex gap-8 items-center bg-white/5 px-10 py-5 rounded-3xl border border-white/10">
                            <Clock className="w-8 h-8 text-padel-primary" />
                            <span className="text-5xl font-black tabular-nums tabular-nums">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </motion.div>
                ) : (
                    /* MARCADOR EN VIVO AUTOMÁTICO */
                    <motion.div
                        key="active-tv"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="h-full w-full flex flex-col p-12 lg:p-16 relative"
                    >
                        {/* Background FX */}
                        <div className="absolute top-0 right-0 w-[50%] h-[50%] opacity-20 blur-[150px] rounded-full" style={{ backgroundColor: liveMatch.primaryColor }} />
                        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-600 opacity-10 blur-[150px] rounded-full" />

                        {/* Top Bar TV Style */}
                        <div className="flex justify-between items-center mb-10 relative z-10 border-b-2 border-white/10 pb-8">
                            <div className="flex items-center gap-6">
                                <div className="bg-red-600 px-6 py-2 rounded-xl flex items-center gap-3 shadow-[0_10px_30px_rgba(220,38,38,0.4)]">
                                    <Radio className="w-6 h-6 text-white animate-pulse" />
                                    <span className="text-2xl font-black uppercase italic tracking-widest text-white">LIVE TV</span>
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">{liveMatch.tournamentName}</h2>
                                    <p className="label-cancha text-xl text-padel-primary">Pista {liveMatch.court} • {liveMatch.category}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center bg-white/5 backdrop-blur-md border border-white/10 px-8 py-3 rounded-[2rem] shadow-2xl"
                                style={{ minWidth: 'fit-content' }}>
                                <div className="text-6xl font-black italic tracking-tighter tabular-nums text-white leading-none">
                                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="flex items-center justify-between w-full mt-3 pt-3 border-t border-white/10 gap-6">
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 whitespace-nowrap">
                                        {currentTime.toLocaleDateString('es-VE', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()}
                                    </span>
                                    {temp !== null && (
                                        <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                                            <Thermometer className="w-4 h-4 text-padel-primary" />
                                            <span className="text-2xl font-black italic text-padel-primary">{temp}°C</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Match Graphics */}
                        <div className="flex-1 flex flex-col justify-center relative z-10">
                            <div className="grid grid-cols-12 items-center gap-4">
                                {/* Team 1 Name */}
                                <div className="col-span-4 text-right">
                                    <motion.h3
                                        key={liveMatch.t1Name}
                                        initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                                        className="text-6xl lg:text-8xl font-black italic uppercase tracking-tighter leading-none"
                                    >
                                        {liveMatch.t1Name.split(' / ').map((name: string, i: number) => (
                                            <span key={i} className={i === 1 ? 'block' : ''} style={i === 1 ? { color: liveMatch.primaryColor } : {}}>{name}{i === 0 ? ' ' : ''}</span>
                                        ))}
                                    </motion.h3>
                                </div>

                                {/* SCORE CENTER */}
                                <div className="col-span-4 flex flex-col items-center justify-center p-8">
                                    <div className="bg-black/80 border-4 border-white/10 rounded-[4rem] p-10 flex flex-col items-center justify-center shadow-[0_50px_100px_rgba(0,0,0,0.6)] w-full relative overflow-hidden">
                                        {/* Point indicator Glow */}
                                        <div className="absolute inset-x-0 top-0 h-1 bg-padel-primary opacity-30 shadow-[0_0_20px_#ccff00]" />

                                        <div className="flex items-center gap-12 mb-6">
                                            <AnimatePresence mode="wait">
                                                <motion.span key={liveMatch.points?.t1} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                                    className="text-[12rem] lg:text-[16rem] font-black italic leading-none tabular-nums text-white tracking-tighter"
                                                >
                                                    {liveMatch.points?.t1 || '0'}
                                                </motion.span>
                                            </AnimatePresence>
                                            <span className="text-8xl font-black italic opacity-20 text-white">:</span>
                                            <AnimatePresence mode="wait">
                                                <motion.span key={liveMatch.points?.t2} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                                    className="text-[12rem] lg:text-[16rem] font-black italic leading-none tabular-nums text-white tracking-tighter"
                                                >
                                                    {liveMatch.points?.t2 || '0'}
                                                </motion.span>
                                            </AnimatePresence>
                                        </div>

                                        {/* Set Summary */}
                                        <div className="flex gap-4">
                                            {[1, 2, 3].map(setNum => {
                                                const currentSet = (liveMatch.sets?.t1 || 0) + (liveMatch.sets?.t2 || 0) + 1;
                                                return (
                                                    <div key={setNum} className={`px-6 py-3 rounded-2xl border-2 transition-all flex flex-col items-center ${setNum === currentSet ? 'bg-padel-primary/20 border-padel-primary' : 'bg-white/5 border-white/5 opacity-30'}`}>
                                                        <span className="text-[10px] font-black uppercase mb-1">SET {setNum}</span>
                                                        <div className="flex gap-3 text-2xl font-black">
                                                            <span>{liveMatch.games_sets?.[setNum - 1]?.t1 || (setNum === currentSet ? liveMatch.games?.t1 : 0) || 0}</span>
                                                            <span className="opacity-30">-</span>
                                                            <span>{liveMatch.games_sets?.[setNum - 1]?.t2 || (setNum === currentSet ? liveMatch.games?.t2 : 0) || 0}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Serve / Punto de Oro */}
                                    <div className="mt-8 flex items-center gap-20">
                                        <motion.div animate={liveMatch.server?.team === 1 ? { scale: [1, 1.5, 1], opacity: 1 } : { opacity: 0.1 }} transition={{ repeat: Infinity, duration: 1 }} className="w-8 h-8 rounded-full shadow-[0_0_40px_rgba(204,255,0,0.8)]" style={{ backgroundColor: liveMatch.primaryColor }} />
                                        <div className="text-padel-primary font-black uppercase text-xs tracking-[0.5em] italic">Servicio</div>
                                        <motion.div animate={liveMatch.server?.team === 2 ? { scale: [1, 1.5, 1], opacity: 1 } : { opacity: 0.1 }} transition={{ repeat: Infinity, duration: 1 }} className="w-8 h-8 rounded-full shadow-[0_0_40px_rgba(204,255,0,0.8)]" style={{ backgroundColor: liveMatch.primaryColor }} />
                                    </div>
                                </div>

                                {/* Team 2 Name */}
                                <div className="col-span-4 text-left">
                                    <motion.h3
                                        key={liveMatch.t2Name}
                                        initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                                        className="text-6xl lg:text-8xl font-black italic uppercase tracking-tighter leading-none"
                                    >
                                        {liveMatch.t2Name.split(' / ').map((name: string, i: number) => (
                                            <span key={i} className={i === 1 ? 'block' : ''} style={i === 1 ? { color: liveMatch.primaryColor } : {}}>{name}{i === 0 ? ' ' : ''}</span>
                                        ))}
                                    </motion.h3>
                                </div>
                            </div>
                        </div>

                        {/* News Ticker / Footer Branding */}
                        <div className="h-28 bg-white/5 -mx-16 -mb-16 border-t border-white/10 flex items-center overflow-hidden">
                            <div className="flex items-center gap-16 animate-tv-ticker whitespace-nowrap px-16">
                                <Zap className="w-8 h-8 text-padel-primary" />
                                <span className="text-4xl font-black italic uppercase italic tracking-widest">{liveMatch.bannerText}</span>
                                <div className="w-3 h-3 bg-padel-primary rounded-full" />
                                <span className="text-4xl font-black italic uppercase italic tracking-widest text-gray-500">SÍGUENOS EN @PADELSMART.IO</span>
                                <div className="w-3 h-3 bg-padel-primary rounded-full" />
                                <span className="text-4xl font-black italic uppercase italic tracking-widest text-padel-primary">EL MEJOR PADEL DEL CARIBE</span>
                                <Zap className="w-8 h-8 text-padel-primary" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes tvTicker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-tv-ticker {
                    animation: tvTicker 25s linear infinite;
                }
                body { overflow: hidden; background: black; }
            `}</style>
        </div>
    );
}
