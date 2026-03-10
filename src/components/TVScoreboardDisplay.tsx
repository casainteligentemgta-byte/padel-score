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
    playerA1?: string;
    playerA2?: string;
    playerB1?: string;
    playerB2?: string;
    currentPointsA?: string | number;
    currentPointsB?: string | number;
    setsA?: number;
    setsB?: number;
    gamesA?: number;
    gamesB?: number;
    prevSets?: string[];
    serverTeam?: 'A' | 'B';
    isGoldPoint?: boolean;
    forcedAds?: boolean;
    adsPlaylist?: string[];
    carouselPlaylist?: string[];
    tournamentId?: string;
    tournamentCategory?: string;
    tournamentPhase?: string;
    tournamentName?: string;
    teamANumber?: number | string;
    teamBNumber?: number | string;
    tickerMessages?: { id: string; mensaje: string }[];
    smartPadelColor?: string;
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
        <div className="absolute inset-0 border-[4px] border-white/40 rounded-full scale-110 translate-x-7" />
        <div className="absolute inset-0 border-[4px] border-white/40 rounded-full scale-110 -translate-x-7" />
        <div className="w-3 h-3 bg-white/30 rounded-full absolute top-3 left-3 blur-[1px]" />
    </motion.div>
);

export default function TVScoreboardDisplay({
    playerA1 = "JUGADOR 1",
    playerA2 = "JUGADOR 2",
    playerB1 = "JUGADOR 3",
    playerB2 = "JUGADOR 4",
    currentPointsA = "0",
    currentPointsB = "0",
    setsA = 0,
    setsB = 0,
    gamesA = 0,
    gamesB = 0,
    prevSets = [],
    serverTeam = 'A',
    isGoldPoint = false,
    forcedAds = false,
    adsPlaylist = [],
    carouselPlaylist = [],
    tournamentId = "global",
    tournamentCategory = "Suma 8 / Masculino",
    tournamentPhase = "Fase de Grupos",
    tournamentName = "TORNEO SMART PADEL",
    teamANumber = 1,
    teamBNumber = 2,
    tickerMessages = [],
    smartPadelColor = "#ccff00"
}: TVScoreboardDisplayProps) {
    const [isAdsMode, setIsAdsMode] = useState(forcedAds);
    const [currentAdIdx, setCurrentAdIdx] = useState(0);
    const [currentCarouselIdx, setCurrentCarouselIdx] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        setIsAdsMode(forcedAds);
    }, [forcedAds]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (carouselPlaylist.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentCarouselIdx(prev => (prev + 1) % carouselPlaylist.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [carouselPlaylist]);

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
            <AnimatePresence mode="wait">
                {!isAdsMode ? (
                    <motion.div
                        key="scoreboard"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full grid grid-rows-[10fr_25fr_40fr_25fr] p-6 lg:p-12 relative overflow-hidden"
                    >
                        {/* Background Ambiance */}
                        <div className="absolute inset-0 pointer-events-none opacity-20">
                            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px]" style={{ backgroundColor: `${smartPadelColor}22` }} />
                            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px]" />
                        </div>

                        {/* ROW 1: Header */}
                        <div className="flex justify-between items-center relative z-10 px-8 lg:px-16">
                            <div className="flex flex-col">
                                <span className="text-padel-primary font-black uppercase tracking-[0.3em] text-[12px] italic mb-1">
                                    {tournamentName}
                                </span>
                                <span className="text-white/60 font-bold uppercase tracking-[0.2em] text-[10px] italic mb-2">
                                    {tournamentPhase}
                                </span>
                                <div className="flex flex-col">
                                    <h3 className="text-2xl lg:text-4xl font-black italic uppercase tracking-tighter text-white leading-none break-words max-w-[40vw]">
                                        {tournamentCategory.includes(' / ') ? tournamentCategory.split(' / ')[0] : tournamentCategory}
                                    </h3>
                                    {tournamentCategory.includes(' / ') && (
                                        <span className="text-gray-500 text-sm lg:text-xl font-bold uppercase tracking-[0.2em] mt-1 opacity-80">{tournamentCategory.split(' / ')[1]}</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-6 bg-white/5 backdrop-blur-3xl px-6 py-3 rounded-3xl border border-white/10 shadow-2xl">
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-2 text-gray-400 font-black text-[11px] tracking-widest uppercase mb-0.5 italic">
                                        <Calendar className="w-2.5 h-2.5" />
                                        {formatDate(currentTime)}
                                    </div>
                                    <div className="text-3xl lg:text-4xl font-black italic tabular-nums tracking-tighter text-padel-primary leading-none">
                                        {formatTime(currentTime)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ROW 2: Players */}
                        <div className="grid grid-cols-2 gap-8 lg:gap-12 items-center relative z-10 px-8 lg:px-16">
                            {/* Team A */}
                            <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col gap-4 border-l-8 border-padel-primary pl-6 lg:pl-10 py-6 bg-gradient-to-r from-padel-primary/10 to-transparent rounded-r-[3rem]">
                                <div className="flex items-center gap-4 mb-2">
                                    <span className="text-padel-primary/60 font-black uppercase tracking-[0.2em] text-[15px] italic">JUGADOR A</span>
                                </div>
                                <div className="flex items-center gap-6 lg:gap-8">
                                    <div className="relative flex-shrink-0">
                                        {serverTeam === 'A' ? <TennisBall /> : <div className="w-14 h-14 rounded-full border-2 border-white/5 bg-white/2" />}
                                    </div>
                                    <h2 className="text-4xl md:text-5xl lg:text-[4.2vw] font-black italic uppercase tracking-tighter leading-[0.9] drop-shadow-2xl break-words">
                                        {playerA1}<br />
                                        <span className="opacity-40 text-3xl md:text-4xl lg:text-[3.2vw]">{playerA2}</span>
                                    </h2>
                                </div>
                            </motion.div>

                            {/* Team B */}
                            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col items-start gap-4 border-l-8 border-blue-600 pl-6 lg:pl-10 py-6 bg-gradient-to-r from-blue-600/10 to-transparent rounded-r-[3rem] text-left">
                                <div className="flex items-center gap-4 mb-2">
                                    <span className="text-blue-600/60 font-black uppercase tracking-[0.2em] text-[15px] italic">JUGADOR B</span>
                                </div>
                                <div className="flex items-center gap-6 lg:gap-8">
                                    <div className="relative flex-shrink-0">
                                        {serverTeam === 'B' ? <TennisBall /> : <div className="w-14 h-14 rounded-full border-2 border-white/5 bg-white/2" />}
                                    </div>
                                    <h2 className="text-4xl md:text-5xl lg:text-[4.2vw] font-black italic uppercase tracking-tighter leading-[0.9] drop-shadow-2xl break-words">
                                        {playerB1}<br />
                                        <span className="opacity-40 text-3xl md:text-4xl lg:text-[3.2vw]">{playerB2}</span>
                                    </h2>
                                </div>
                            </motion.div>
                        </div>

                        {/* ROW 3: Points */}
                        <div className="flex items-center justify-center gap-12 lg:gap-24 relative z-10">
                            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center justify-center bg-black/40 backdrop-blur-2xl w-[25vw] h-[25vw] max-w-[300px] max-h-[300px] rounded-[4rem] border-2 border-padel-primary/30 shadow-[0_0_100px_rgba(204,255,0,0.15)] relative group">
                                <span className={`text-[12vw] lg:text-[180px] font-black italic leading-none transition-all duration-300 ${isGoldPoint ? 'text-padel-primary animate-pulse drop-shadow-[0_0_30px_#ccff00]' : 'text-white'}`}>{currentPointsA}</span>
                                {isGoldPoint && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -top-6 left-1/2 -translate-x-1/2 bg-padel-primary text-black px-6 py-2 rounded-full font-black italic text-sm tracking-widest uppercase shadow-2xl">PUNTO DE ORO</motion.div>}
                            </motion.div>

                            <div className="flex flex-col items-center gap-4">
                                <div className="h-2 w-20 bg-padel-primary/40 rounded-full" />
                                <span className="text-6xl font-black italic text-white/10 uppercase tracking-tighter">VS</span>
                                <div className="h-2 w-20 bg-blue-600/40 rounded-full" />
                            </div>

                            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center justify-center bg-black/40 backdrop-blur-2xl w-[25vw] h-[25vw] max-w-[300px] max-h-[300px] rounded-[4rem] border-2 border-blue-600/30 shadow-[0_0_100px_rgba(37,99,235,0.15)] relative group">
                                <span className={`text-[12vw] lg:text-[180px] font-black italic leading-none transition-all duration-300 ${isGoldPoint ? 'text-blue-500 animate-pulse drop-shadow-[0_0_30px_#2563eb]' : 'text-white'}`}>{currentPointsB}</span>
                            </motion.div>
                        </div>

                        {/* ROW 4: Ads & Stats */}
                        <div className="grid grid-cols-[2fr_3fr_2fr] gap-4 items-stretch px-8 relative z-10 min-h-0 overflow-hidden">
                            {/* Ads Left: Video */}
                            <div className="bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden relative group">
                                {adsPlaylist.length > 0 ? (
                                    <video
                                        key={`small-ad-${currentAdIdx}`}
                                        src={adsPlaylist[currentAdIdx]}
                                        autoPlay
                                        muted
                                        playsInline
                                        loop={adsPlaylist.length === 1}
                                        onEnded={() => {
                                            if (adsPlaylist.length > 1) {
                                                setCurrentAdIdx(prev => (prev + 1) % adsPlaylist.length);
                                            }
                                        }}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center opacity-20 gap-2">
                                        <Tv size={40} />
                                        <span className="text-[10px] font-black uppercase tracking-widest italic">Padel Ads Video</span>
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/60 rounded-full border border-white/10 flex items-center gap-2 text-white">
                                    <div className="w-2 h-2 rounded-full bg-padel-primary animate-pulse" />
                                    <span className="text-[8px] font-black uppercase italic tracking-widest">Publicidad</span>
                                </div>
                            </div>

                            {/* Center: Sets info */}
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-4 flex-1">
                                    <div className="flex items-center gap-6 bg-white/5 backdrop-blur-xl px-8 rounded-3xl border border-white/10 shadow-xl">
                                        <div className="flex flex-col">
                                            <span className="text-gray-600 font-black uppercase text-[10px] tracking-[0.2em] italic">SET GANADOS</span>
                                            <span className="text-6xl font-black italic text-white leading-none">{setsA}</span>
                                        </div>
                                        <div className="h-10 w-[1px] bg-white/10" />
                                        <div className="flex flex-col">
                                            <span className="text-padel-primary font-black uppercase text-[10px] tracking-[0.1em] italic">GAMES SET</span>
                                            <span className="text-5xl font-black italic text-padel-primary/80 leading-none">{gamesA}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-6 bg-white/5 backdrop-blur-xl px-8 rounded-3xl border border-white/10 shadow-xl text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-padel-primary font-black uppercase text-[10px] tracking-[0.1em] italic">GAMES SET</span>
                                            <span className="text-5xl font-black italic text-padel-primary/80 leading-none">{gamesB}</span>
                                        </div>
                                        <div className="h-10 w-[1px] bg-white/10" />
                                        <div className="flex flex-col items-end">
                                            <span className="text-gray-600 font-black uppercase text-[10px] tracking-[0.2em] italic">SET GANADOS</span>
                                            <span className="text-6xl font-black italic text-white leading-none">{setsB}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center gap-3">
                                    {prevSets.length > 0 ? prevSets.map((set, idx) => (
                                        <div key={idx} className="px-4 py-2 bg-black/80 rounded-xl border border-white/10 flex items-center gap-2">
                                            <span className="text-[9px] font-black text-white/30 italic">S{idx + 1}</span>
                                            <span className="text-xl font-black italic tracking-widest text-padel-primary">{set}</span>
                                        </div>
                                    )) : (
                                        <div className="flex items-center gap-3 opacity-20 py-2">
                                            <History className="w-4 h-4 text-gray-400" />
                                            <span className="text-[10px] font-black uppercase tracking-widest italic text-gray-400">Historial del Partido</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Ads Right: Carousel */}
                            <div className="bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden relative group flex items-center justify-center">
                                <AnimatePresence mode="wait">
                                    {carouselPlaylist.length > 0 ? (
                                        <motion.img
                                            key={`carousel-${currentCarouselIdx}`}
                                            src={carouselPlaylist[currentCarouselIdx]}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.6 }}
                                            className="w-full h-full object-contain p-6"
                                        />
                                    ) : (
                                        <SponsorCarousel tournamentId={tournamentId} className="w-full h-full" />
                                    )}
                                </AnimatePresence>
                                <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-black/60 rounded-full border border-white/10 flex items-center gap-2 text-white">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    <span className="text-[8px] font-black uppercase italic tracking-widest">Sponsors</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="ads-only"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full w-full bg-black relative flex items-center justify-center"
                    >
                        {adsPlaylist.length > 0 ? (
                            <video
                                key={`full-ad-${currentAdIdx}`}
                                src={adsPlaylist[currentAdIdx]}
                                autoPlay
                                muted
                                playsInline
                                loop={adsPlaylist.length === 1}
                                onEnded={() => {
                                    if (adsPlaylist.length > 1) {
                                        setCurrentAdIdx(prev => (prev + 1) % adsPlaylist.length);
                                    }
                                }}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-8">
                                <div className="w-48 h-48 rounded-full border-4 border-padel-primary/20 flex items-center justify-center relative">
                                    <Tv size={80} className="text-padel-primary/40" />
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute -inset-4 border-t-4 border-padel-primary rounded-full" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">SMART PADEL PRO SYSTEM</h2>
                                    <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-xs italic">A la espera de contenido publicitario...</p>
                                </div>
                            </div>
                        )}

                        <div className="absolute top-12 left-12 p-8 bg-black/60 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-3xl">
                            <div className="flex flex-col">
                                <span className="text-padel-primary font-black uppercase tracking-[0.4em] text-[15px] italic mb-1">
                                    {tournamentName}
                                </span>
                                <span className="text-white/40 font-bold uppercase tracking-[0.2em] text-[12px] italic">
                                    {tournamentPhase}
                                </span>
                            </div>
                        </div>

                        <div className="absolute bottom-12 right-12 p-8 bg-black/60 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-3xl flex items-center gap-8">
                            <div className="flex flex-col items-end">
                                <span className="text-gray-400 font-black text-xs tracking-widest uppercase mb-1">{formatDate(currentTime)}</span>
                                <span className="text-6xl font-black italic tabular-nums text-padel-primary">{formatTime(currentTime)}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-t border-white/10 z-50 flex items-center overflow-hidden">
                <div className="flex items-center whitespace-nowrap animate-marquee">
                    {tickerMessages.length > 0 ? tickerMessages.map((msg: any, i: number) => (
                        <div key={msg.id} className="flex items-center gap-4 mx-8">
                            <div className="w-2 h-2 rounded-full bg-padel-primary" />
                            <span className="text-xl font-black italic uppercase tracking-widest text-white/80">{msg.mensaje}</span>
                        </div>
                    )) : (
                        <div className="flex items-center gap-4 mx-8">
                            <div className="w-2 h-2 rounded-full bg-padel-primary" />
                            <span className="text-xl font-black italic uppercase tracking-widest text-white/20">SMART PADEL PRO TV • EL MEJOR PADEL DEL MUNDO • BIENVENIDOS</span>
                        </div>
                    )}
                    {/* Duplicate for seamless loop */}
                    {tickerMessages.length > 0 ? tickerMessages.map((msg: any, i: number) => (
                        <div key={`${msg.id}-dup`} className="flex items-center gap-4 mx-8">
                            <div className="w-2 h-2 rounded-full bg-padel-primary" />
                            <span className="text-xl font-black italic uppercase tracking-widest text-white/80">{msg.mensaje}</span>
                        </div>
                    )) : (
                        <div className="flex items-center gap-4 mx-8">
                            <div className="w-2 h-2 rounded-full bg-padel-primary" />
                            <span className="text-xl font-black italic uppercase tracking-widest text-white/20">SMART PADEL PRO TV • EL MEJOR PADEL DEL MUNDO • BIENVENIDOS</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

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
