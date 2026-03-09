'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Tv,
    Circle,
    Trophy,
    Play,
    Volume2,
    Maximize2,
    LayoutDashboard,
    Zap,
    History,
    Clock,
    Calendar
} from 'lucide-react';
import SponsorCarousel from './publicidad/SponsorCarousel';

interface TVScoreboardDisplayProps {
    teamAName?: string;
    teamBName?: string;
    currentPointsA?: string;
    currentPointsB?: string;
    gamesA?: number;
    gamesB?: number;
    setsA?: number;
    setsB?: number;
    prevSets?: string[]; // e.g., ["6-4", "3-6"]
    serverIndicator?: 'A' | 'B';
    smartPadelColor?: string;
    adsPlaylist?: string[];
    forcedAds?: boolean;
    tournamentId?: string;
    tournamentCategory?: string;
    tournamentPhase?: string;
}

const TennisBall = () => (
    <motion.div
        animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 15, -15, 0],
            boxShadow: ["0 0 30px #ccff0088", "0 0 50px #ccff00ff", "0 0 30px #ccff0088"]
        }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="w-14 h-14 bg-[#ccff00] rounded-full flex items-center justify-center overflow-hidden border-2 border-black/20 relative shadow-inner"
    >
        {/* Tennis ball seams with better definition */}
        <div className="absolute inset-0 border-[4px] border-white/40 rounded-full scale-110 translate-x-7" />
        <div className="absolute inset-0 border-[4px] border-white/40 rounded-full scale-110 -translate-x-7" />
        <div className="w-3 h-3 bg-white/30 rounded-full absolute top-3 left-3 blur-[1px]" />
    </motion.div>
);

export default function TVScoreboardDisplay({
    teamAName = "Juan Pérez / Leo Messi",
    teamBName = "Galán / Lebrón",
    currentPointsA = "30",
    currentPointsB = "15",
    gamesA = 4,
    gamesB = 2,
    setsA = 1,
    setsB = 0,
    prevSets = ["6-4"],
    serverIndicator = 'A',
    smartPadelColor = "#ccff00",
    adsPlaylist = [
        "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
    ],
    forcedAds = false,
    tournamentId = "global",
    tournamentCategory = "Primera / Masculino",
    tournamentPhase = "Fase de Grupos"
}: TVScoreboardDisplayProps) {
    const [isAdsMode, setIsAdsMode] = useState(forcedAds);
    const [currentAdIdx, setCurrentAdIdx] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Sync with external control
    useEffect(() => {
        setIsAdsMode(forcedAds);
    }, [forcedAds]);

    // Clock effect
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const isGoldPoint = currentPointsA === "40" && currentPointsB === "40";

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        }).toUpperCase();
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    return (
        <div className="fixed inset-0 bg-[#08080c] text-white font-outfit overflow-hidden select-none">
            {/* Layer 1: Scoreboard Display */}
            <AnimatePresence mode="wait">
                {!isAdsMode ? (
                    <motion.div
                        key="scoreboard"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full grid grid-rows-[10fr_30fr_50fr_10fr] p-8 lg:p-12 relative overflow-hidden"
                    >
                        {/* Background Ambiance */}
                        <div className="absolute inset-0 pointer-events-none opacity-20">
                            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px]" style={{ backgroundColor: `${smartPadelColor}22` }} />
                            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px]" />
                        </div>

                        {/* ROW 1 (10%): Header Info */}
                        <div className="flex justify-between items-center relative z-10 px-8">
                            {/* Torneo & Categoria */}
                            <div className="flex flex-col">
                                <span className="text-padel-primary font-black uppercase tracking-[0.5em] text-[12px] italic mb-1.5">
                                    {tournamentPhase}
                                </span >
                                <div className="flex flex-col">
                                    <h3 className="text-2xl lg:text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
                                        {tournamentCategory.includes(' / ') ? tournamentCategory.split(' / ')[0] : tournamentCategory}
                                    </h3>
                                    {tournamentCategory.includes(' / ') && (
                                        <span className="text-gray-500 text-sm lg:text-xl font-bold uppercase tracking-[0.2em] mt-1 opacity-80">{tournamentCategory.split(' / ')[1]}</span>
                                    )}
                                </div>
                            </div>

                            {/* Clock & Date */}
                            <div className="flex items-center gap-6 bg-white/5 backdrop-blur-3xl px-6 py-3 rounded-3xl border border-white/10 shadow-2xl">
                                <div className="flex flex-col items-end border-r border-white/10 pr-6">
                                    <div className="flex items-center gap-2 text-gray-500 font-black text-[9px] tracking-widest uppercase mb-0.5 italic">
                                        <Calendar className="w-2.5 h-2.5" />
                                        {formatDate(currentTime)}
                                    </div>
                                    <div className="text-3xl lg:text-4xl font-black italic tabular-nums tracking-tighter text-padel-primary leading-none">
                                        {formatTime(currentTime)}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse mb-1" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">LIVE TV</span>
                                </div>
                            </div>
                        </div>

                        {/* ROW 2 (30%): Equipos */}
                        <div className="grid grid-cols-2 gap-12 items-center relative z-10 px-8">
                            {/* Equipo A */}
                            <motion.div
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="flex flex-col gap-4 border-l-8 border-padel-primary pl-10 py-6 bg-gradient-to-r from-padel-primary/10 to-transparent rounded-r-[3rem]"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-padel-primary/40 font-black uppercase tracking-[0.5em] text-[10px] italic">Lado Servidor</span>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="relative">
                                        {serverIndicator === 'A' ? (
                                            <TennisBall />
                                        ) : (
                                            <div className="w-14 h-14 rounded-full border-2 border-white/5 bg-white/2" />
                                        )}
                                    </div>
                                    <h2 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] drop-shadow-2xl">
                                        {teamAName.includes(' / ') ? (
                                            <>
                                                {teamAName.split(' / ')[0]}<br />
                                                <span className="opacity-40 text-4xl lg:text-5xl">{teamAName.split(' / ')[1]}</span>
                                            </>
                                        ) : teamAName}
                                    </h2>
                                </div>
                            </motion.div>

                            {/* Equipo B */}
                            <motion.div
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="flex flex-col items-end gap-4 border-r-8 border-blue-600 pr-10 py-6 bg-gradient-to-l from-blue-600/10 to-transparent rounded-l-[3rem] text-right"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-blue-600/40 font-black uppercase tracking-[0.5em] text-[10px] italic">Lado Receptor</span>
                                </div>
                                <div className="flex items-center gap-8 justify-end">
                                    <h2 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] drop-shadow-2xl">
                                        {teamBName.includes(' / ') ? (
                                            <>
                                                {teamBName.split(' / ')[0]}<br />
                                                <span className="opacity-40 text-4xl lg:text-5xl">{teamBName.split(' / ')[1]}</span>
                                            </>
                                        ) : teamBName}
                                    </h2>
                                    <div className="relative">
                                        {serverIndicator === 'B' ? (
                                            <TennisBall />
                                        ) : (
                                            <div className="w-14 h-14 rounded-full border-2 border-white/5 bg-white/2" />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* ROW 3 (50%): Puntuación Hero Area */}
                        <div className="flex items-center justify-center relative z-10">
                            <div className="relative group w-full max-w-6xl">
                                {/* Glow Effect */}
                                <div className="absolute inset-[-60px] bg-padel-primary/5 rounded-[8rem] blur-[80px] opacity-40 animate-pulse" />

                                <div className="bg-gradient-to-br from-black/95 to-[#0a0a10] backdrop-blur-[50px] border-4 border-white/5 rounded-[6rem] py-16 lg:py-24 px-20 lg:px-40 flex flex-col items-center shadow-2xl relative overflow-hidden">
                                    {/* Scanlines Effect */}
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none" />

                                    <div className="flex items-center gap-12 lg:gap-32 mb-4">
                                        <AnimatePresence mode="popLayout">
                                            <motion.div
                                                key={currentPointsA}
                                                initial={{ y: 120, opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
                                                animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                                exit={{ y: -120, opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
                                                transition={{ type: "spring", damping: 12, stiffness: 100 }}
                                                className="text-[18rem] lg:text-[28rem] font-black italic tracking-tighter leading-none select-none"
                                                style={{ color: smartPadelColor, textShadow: `0 0 80px ${smartPadelColor}33, 0 20px 40px rgba(0,0,0,0.5)` }}
                                            >
                                                {currentPointsA}
                                            </motion.div>
                                        </AnimatePresence>

                                        <div className="flex flex-col gap-6 py-10 opacity-20">
                                            <div className="w-6 h-6 rounded-full bg-white shadow-[0_0_20px_white]" />
                                            <div className="w-6 h-6 rounded-full bg-white shadow-[0_0_20px_white]" />
                                        </div>

                                        <AnimatePresence mode="popLayout">
                                            <motion.div
                                                key={currentPointsB}
                                                initial={{ y: 120, opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
                                                animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                                exit={{ y: -120, opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
                                                transition={{ type: "spring", damping: 12, stiffness: 100 }}
                                                className="text-[18rem] lg:text-[28rem] font-black italic tracking-tighter leading-none text-white drop-shadow-[0_40px_60px_rgba(0,0,0,0.9)] select-none"
                                            >
                                                {currentPointsB}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>

                                    {/* Gold Point Indicator */}
                                    <AnimatePresence>
                                        {isGoldPoint && (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -5 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                className="absolute bottom-12 px-16 py-4 bg-red-600 rounded-full flex items-center gap-6 shadow-[0_0_60px_rgba(220,38,38,0.6)] border-4 border-red-500/50"
                                            >
                                                <Zap className="w-8 h-8 text-white fill-white animate-pulse" />
                                                <span className="text-3xl font-black italic uppercase tracking-[0.5em] text-white">PUNTO DE ORO</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* ROW 4 (10%): Partido Stats / Sponsors */}
                        <div className="grid grid-cols-[1fr_2fr_1fr] gap-8 items-center px-8 relative z-10">
                            {/* Sets Local */}
                            <div className="flex items-center gap-8 bg-white/5 backdrop-blur-xl p-6 rounded-[3rem] border border-white/10 h-[100px] shadow-xl">
                                <div className="flex flex-col">
                                    <span className="text-gray-600 font-black uppercase text-[10px] tracking-[0.3em] italic mb-1">SET GANADOS</span>
                                    <span className="text-6xl font-black italic text-white leading-none">{setsA}</span>
                                </div>
                                <div className="h-10 w-[1px] bg-white/10" />
                                <div className="flex flex-col">
                                    <span className="text-padel-primary font-black uppercase text-[10px] tracking-[0.2em] italic mb-1">GAMES SET</span>
                                    <span className="text-5xl font-black italic text-padel-primary/80 leading-none">{gamesA}</span>
                                </div>
                            </div>

                            {/* Dynamic Sponsor Middle / Previous Sets History */}
                            <div className="flex flex-col gap-4 items-center h-full justify-center">
                                <div className="flex gap-4">
                                    {prevSets.length > 0 ? prevSets.map((set, idx) => (
                                        <div key={idx} className="px-6 py-2 bg-black/80 rounded-2xl border border-white/10 flex items-center gap-3 shadow-2xl">
                                            <span className="text-[10px] font-black text-white/30 italic">S{idx + 1}</span>
                                            <span className="text-2xl font-black italic tracking-widest text-padel-primary">{set}</span>
                                        </div>
                                    )) : (
                                        <div className="flex items-center gap-3 opacity-30">
                                            <History className="w-5 h-5" />
                                            <span className="text-xs font-black uppercase tracking-widest italic text-gray-500">HISTORIAL DE PARTIDO</span>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full max-w-lg h-24 bg-white/5 rounded-[2rem] overflow-hidden border border-white/10 relative group">
                                    <SponsorCarousel tournamentId={tournamentId} className="h-full w-full" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                </div>
                            </div>

                            {/* Sets Visitante */}
                            <div className="flex items-center justify-end gap-8 bg-white/5 backdrop-blur-xl p-6 rounded-[3rem] border border-white/10 h-[100px] shadow-xl">
                                <div className="flex flex-col items-end">
                                    <span className="text-padel-primary font-black uppercase text-[10px] tracking-[0.2em] italic mb-1">GAMES SET</span>
                                    <span className="text-5xl font-black italic text-padel-primary/80 leading-none">{gamesB}</span>
                                </div>
                                <div className="h-10 w-[1px] bg-white/10" />
                                <div className="flex flex-col items-end">
                                    <span className="text-gray-600 font-black uppercase text-[10px] tracking-[0.3em] italic mb-1">SET GANADOS</span>
                                    <span className="text-6xl font-black italic text-white leading-none">{setsB}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="ads"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="h-full w-full bg-black relative"
                    >
                        <div className="absolute inset-0 bg-black flex items-center justify-center">
                            {/* Playlist simple generator */}
                            {adsPlaylist.length > 0 ? (
                                <video
                                    key={currentAdIdx}
                                    src={adsPlaylist[currentAdIdx]}
                                    autoPlay
                                    muted
                                    loop={false}
                                    onEnded={() => setCurrentAdIdx(prev => (prev + 1) % adsPlaylist.length)}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-6">
                                    <Tv className="w-24 h-24 text-gray-800 animate-pulse" />
                                    <p className="text-gray-600 font-black uppercase tracking-[0.4em] italic">Esperando Contenido...</p>
                                </div>
                            )}

                            {/* Ads Label */}
                            <div className="absolute top-10 right-10 flex items-center gap-4 bg-black/60 backdrop-blur-xl px-8 py-3 rounded-full border border-white/10">
                                <div className="w-3 h-3 rounded-full bg-padel-primary animate-pulse" />
                                <span className="text-sm font-black uppercase italic tracking-[0.3em] text-white">Publicidad Smart Padel</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle ADS Button - Discreto en la esquina */}
            <button
                onClick={() => setIsAdsMode(!isAdsMode)}
                className="fixed bottom-10 right-10 z-[100] p-5 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-2xl transition-all group overflow-hidden"
            >
                <div className="relative z-10 flex items-center gap-3">
                    <Tv className={`w-5 h-5 transition-transform group-hover:scale-110 ${isAdsMode ? 'text-padel-primary' : 'text-gray-600'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest italic group-hover:text-padel-primary transition-colors">
                        {isAdsMode ? 'Volver al Marcador' : '📺 Modo TV / ADS'}
                    </span>
                </div>
                <div className="absolute inset-0 bg-padel-primary opacity-0 group-hover:opacity-5 transition-opacity" />
            </button>

            {/* Brand Logo Watermark */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[50]">
                <div className="flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity">
                    <span className="text-[8px] font-black text-gray-700 uppercase tracking-[0.5em] italic mb-1">PRO SYSTEM</span>
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter">
                        SMART <span className="text-padel-primary">PADEL</span>
                    </h1>
                </div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                .font-outfit { font-family: 'Outfit', sans-serif; }
                body { background: #000; margin: 0; padding: 0; overflow: hidden; }
            `}</style>
        </div>
    );
}
