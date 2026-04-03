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
import { BouncingBall } from '@/components/BouncingBall';
import { CourtAdVideoOrIframe } from '@/components/CourtAdVideoOrIframe';

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
    /** Por slide: duración en segundos (misma longitud que carouselPlaylist o se repite el último) */
    carouselDurationsSec?: number[];
    carouselLoop?: boolean;
    /** Pausa extra entre fotos (seg), sumada a la duración de cada slide */
    carouselPauseBetweenSec?: number;
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
    carouselDurationsSec,
    carouselLoop = true,
    carouselPauseBetweenSec = 0,
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
        setCurrentCarouselIdx(0);
    }, [carouselPlaylist.join('|')]);

    useEffect(() => {
        if (carouselPlaylist.length <= 1) return;
        const idx = currentCarouselIdx;
        const dur =
            carouselDurationsSec && carouselDurationsSec.length > 0
                ? carouselDurationsSec[Math.min(idx, carouselDurationsSec.length - 1)] ?? 8
                : 8;
        const ms = Math.max(1, dur) * 1000 + Math.max(0, carouselPauseBetweenSec) * 1000;
        const timer = window.setTimeout(() => {
            setCurrentCarouselIdx((prev) => {
                const next = prev + 1;
                if (next >= carouselPlaylist.length) {
                    return carouselLoop ? 0 : prev;
                }
                return next;
            });
        }, ms);
        return () => window.clearTimeout(timer);
    }, [
        carouselPlaylist,
        currentCarouselIdx,
        carouselDurationsSec,
        carouselLoop,
        carouselPauseBetweenSec,
    ]);

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
                        className="relative flex h-full w-full min-h-0 flex-col overflow-hidden bg-[#08080c] font-outfit"
                    >
                        <div className="pointer-events-none absolute inset-0 z-0 opacity-20">
                            <div className="absolute top-[-20%] left-[-10%] h-[50%] w-[50%] rounded-full blur-[150px]" style={{ backgroundColor: `${smartPadelColor}22` }} />
                            <div className="absolute bottom-[-20%] right-[-10%] h-[50%] w-[50%] rounded-full bg-blue-600/10 blur-[150px]" />
                        </div>

                        <div className="relative z-10 grid min-h-0 flex-1 grid-rows-[10vh_23vh_minmax(0,1fr)] overflow-hidden">
                        {/* ROW 1: Header (Top Strip) - ENHANCED VISIBILITY */}
                        <div className="flex justify-between items-center relative z-10 px-12 lg:px-24 border-b border-white/10 bg-black/50 backdrop-blur-2xl">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3 bg-padel-primary/10 px-4 py-1.5 rounded-full border border-padel-primary/30">
                                        <div className="w-2.5 h-2.5 rounded-full bg-padel-primary animate-pulse shadow-[0_0_8px_#ccff00]" />
                                        <span className="text-padel-primary font-black uppercase tracking-[0.4em] text-[14px] italic">
                                            {tournamentName}
                                        </span>
                                    </div>
                                    <span className="text-white/40 font-bold uppercase tracking-[0.3em] text-[12px] italic">
                                        {tournamentPhase}
                                    </span>
                                </div>
                                <div className="flex flex-col mt-1">
                                    <h3 className="text-3xl lg:text-5xl font-black italic uppercase tracking-tighter text-white leading-tight break-words max-w-[50vw]">
                                        {tournamentCategory}
                                    </h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                {/* Branded Label */}
                                <div className="hidden lg:flex flex-col items-end border-r border-white/10 pr-8">
                                    <span className="text-padel-primary font-black uppercase tracking-[0.5em] text-[10px] italic mb-1">PADEL SCORE</span>
                                    <span className="text-white font-black italic text-xl tracking-tighter">PRO SYSTEM</span>
                                </div>

                                {/* Clock Box */}
                                <div className="flex items-center gap-6 bg-white/5 backdrop-blur-3xl px-8 py-4 rounded-[2rem] border border-white/10 shadow-3xl">
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-2 text-gray-400 font-bold text-[13px] tracking-widest uppercase mb-1 italic">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(currentTime)}
                                        </div>
                                        <div className="text-4xl lg:text-5xl font-black italic tabular-nums tracking-tighter text-[#ccff00] leading-none drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                                            {formatTime(currentTime)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ROW 2: Compact Scoreboard (Players + Points + Sets) */}
                        <div className="grid grid-cols-[3fr_4fr_3fr] gap-6 items-center relative z-10 px-8 lg:px-16 bg-white/[0.03] border-b border-white/5">
                            {/* Team A Info */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-black/40">
                                        {serverTeam === 'A' ? <div className="w-4 h-4 bg-[#ccff00] rounded-full shadow-[0_0_10px_#ccff00]" /> : null}
                                    </div>
                                    <h2 className="text-3xl lg:text-[2.2vw] font-black italic uppercase tracking-tighter leading-none text-white truncate">
                                        {playerA1}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-3 opacity-40">
                                    <div className="w-8 h-8" />
                                    <h2 className="text-2xl lg:text-[1.8vw] font-black italic uppercase tracking-tighter leading-none text-white truncate">
                                        {playerA2}
                                    </h2>
                                </div>
                            </div>

                            {/* Center Points Display */}
                            <div className="flex items-center justify-center gap-6">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="bg-black/80 w-[12vh] h-[12vh] rounded-3xl border-2 border-padel-primary/40 flex items-center justify-center shadow-[0_0_40px_rgba(204,255,0,0.15)]">
                                        <span className={`text-[8vh] font-black italic ${isGoldPoint ? 'text-padel-primary animate-pulse' : 'text-white'}`}>{currentPointsA}</span>
                                    </div>
                                    <div className="flex gap-1.5 pt-1">
                                        {prevSets.map((s, i) => (
                                            <span key={i} className="text-[1.2vh] font-black italic text-padel-primary/60 px-1.5 py-0.5 bg-white/5 rounded-md border border-white/5">{s.split('-')[0]}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center opacity-20">
                                    <div className="h-0.5 w-8 bg-white mb-2" />
                                    <span className="text-2xl font-black italic">VS</span>
                                    <div className="h-0.5 w-8 bg-white mt-2" />
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                    <div className="bg-black/80 w-[12vh] h-[12vh] rounded-3xl border-2 border-blue-600/40 flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.15)]">
                                        <span className={`text-[8vh] font-black italic ${isGoldPoint ? 'text-blue-500 animate-pulse' : 'text-white'}`}>{currentPointsB}</span>
                                    </div>
                                    <div className="flex gap-1.5 pt-1">
                                        {prevSets.map((s, i) => (
                                            <span key={i} className="text-[1.2vh] font-black italic text-blue-400/60 px-1.5 py-0.5 bg-white/5 rounded-md border border-white/5">{s.split('-')[1]}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Team B Info */}
                            <div className="flex flex-col gap-2 items-end text-right">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-3xl lg:text-[2.2vw] font-black italic uppercase tracking-tighter leading-none text-white truncate">
                                        {playerB1}
                                    </h2>
                                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-black/40">
                                        {serverTeam === 'B' ? <div className="w-4 h-4 bg-blue-600 rounded-full shadow-[0_0_10px_#2563eb]" /> : null}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 opacity-40">
                                    <h2 className="text-2xl lg:text-[1.8vw] font-black italic uppercase tracking-tighter leading-none text-white truncate">
                                        {playerB2}
                                    </h2>
                                    <div className="w-8 h-8" />
                                </div>
                            </div>
                        </div>

                        {/* ROW 3: HEROS ADS (Big Split-Screen) */}
                        <div className="relative z-10 grid min-h-0 grid-cols-2 gap-8 overflow-hidden p-8">
                            {/* Ads Left: Video Slot */}
                            <div className="bg-black/60 backdrop-blur-2xl rounded-[3rem] border-2 border-white/10 overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                                {adsPlaylist.length > 0 ? (
                                    <CourtAdVideoOrIframe
                                        key={`large-ad-${currentAdIdx}`}
                                        videoKey={`large-ad-${currentAdIdx}`}
                                        url={adsPlaylist[currentAdIdx]}
                                        className="h-full w-full object-cover"
                                        loop={adsPlaylist.length === 1}
                                        onEnded={() => {
                                            if (adsPlaylist.length > 1) {
                                                setCurrentAdIdx((prev) => (prev + 1) % adsPlaylist.length);
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center opacity-30 gap-6">
                                        <div className="p-8 rounded-full bg-padel-primary/10 border-4 border-padel-primary/20">
                                            <Tv size={80} className="text-padel-primary" />
                                        </div>
                                        <span className="text-xl font-black uppercase tracking-[0.4em] italic text-padel-primary/60">SMART VIDEO ADS</span>
                                    </div>
                                )}
                                <div className="absolute top-8 left-8 z-20 px-5 py-2 bg-black/80 rounded-full border border-padel-primary/30 flex items-center gap-3 text-white">
                                    <div className="w-3 h-3 rounded-full bg-padel-primary animate-pulse shadow-[0_0_10px_#ccff00]" />
                                    <span className="text-[12px] font-black uppercase italic tracking-widest text-padel-primary">Publicidad</span>
                                </div>
                            </div>

                            {/* Ads Right: Image Carousel */}
                            <div className="bg-black/60 backdrop-blur-2xl rounded-[3rem] border-2 border-white/10 overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,0.5)] flex items-center justify-center">
                                <AnimatePresence mode="wait">
                                    {carouselPlaylist.length > 0 ? (
                                        <motion.img
                                            key={`carousel-${currentCarouselIdx}`}
                                            src={carouselPlaylist[currentCarouselIdx]}
                                            initial={{ opacity: 0, scale: 1.1 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.8 }}
                                            className="w-full h-full object-contain p-12"
                                        />
                                    ) : (
                                        <SponsorCarousel tournamentId={tournamentId} className="w-full h-full" />
                                    )}
                                </AnimatePresence>
                                <div className="absolute top-8 right-8 z-20 px-5 py-2 bg-black/80 rounded-full border border-blue-600/30 flex items-center gap-3 text-white">
                                    <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse shadow-[0_0_10px_#2563eb]" />
                                    <span className="text-[12px] font-black uppercase italic tracking-widest text-blue-400">Sponsors</span>
                                </div>
                            </div>
                        </div>
                        </div>

                        {/* Tira a ancho real del viewport (fuera del grid con overflow/transform) */}
                        <div className="pizarra-ticker-bleed pizarra-ticker-bleed--flush relative z-0 box-border flex min-h-[4.5rem] shrink-0 flex-col items-stretch border-t border-white/10 bg-black/60 py-3 backdrop-blur-3xl">
                            <div className="marquee-ticker-viewport">
                            <div className="marquee-track animate-marquee">
                                <div className="marquee-half">
                                    <span className="marquee-enter-gap" aria-hidden />
                                    {tickerMessages.length > 0 ? tickerMessages.map((msg: any) => (
                                        <div key={msg.id} className="flex shrink-0 items-center gap-6 mx-12">
                                            <div className="w-3 h-3 rounded-full bg-padel-primary shadow-[0_0_10px_#ccff00]" />
                                            <span className="whitespace-nowrap text-2xl font-black italic uppercase tracking-[0.2em] text-white underline decoration-padel-primary/40 underline-offset-8">
                                                {msg.mensaje}
                                            </span>
                                        </div>
                                    )) : (
                                        <div className="flex shrink-0 items-center gap-6 mx-12">
                                            <div className="w-3 h-3 rounded-full bg-padel-primary/30" />
                                            <span className="text-2xl font-black italic uppercase tracking-[0.3em] text-padel-primary/40">tira informativa TV a la espera de contenido.</span>
                                        </div>
                                    )}
                                </div>
                                <div className="marquee-half">
                                    <span className="marquee-enter-gap" aria-hidden />
                                    {tickerMessages.length > 0 ? tickerMessages.map((msg: any) => (
                                        <div key={`${msg.id}-dup`} className="flex shrink-0 items-center gap-6 mx-12">
                                            <div className="w-3 h-3 rounded-full bg-padel-primary shadow-[0_0_10px_#ccff00]" />
                                            <span className="whitespace-nowrap text-2xl font-black italic uppercase tracking-[0.2em] text-white underline decoration-padel-primary/40 underline-offset-8">
                                                {msg.mensaje}
                                            </span>
                                        </div>
                                    )) : (
                                        <div className="flex shrink-0 items-center gap-6 mx-12">
                                            <div className="w-3 h-3 rounded-full bg-padel-primary/30" />
                                            <span className="text-2xl font-black italic uppercase tracking-[0.3em] text-padel-primary/40">tira informativa TV a la espera de contenido.</span>
                                        </div>
                                    )}
                                </div>
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
                            <CourtAdVideoOrIframe
                                key={`full-ad-${currentAdIdx}`}
                                videoKey={`full-ad-${currentAdIdx}`}
                                url={adsPlaylist[currentAdIdx]}
                                className="h-full w-full object-cover"
                                loop={adsPlaylist.length === 1}
                                onEnded={() => {
                                    if (adsPlaylist.length > 1) {
                                        setCurrentAdIdx((prev) => (prev + 1) % adsPlaylist.length);
                                    }
                                }}
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-12">
                                <div className="relative">
                                    <div className="absolute -inset-20 bg-padel-primary/10 blur-[100px] rounded-full animate-pulse" />
                                    <h1 className="text-[120px] font-black italic uppercase tracking-tighter flex items-center gap-10 relative z-10">
                                        <span className="text-padel-primary drop-shadow-[0_0_50px_rgba(204,255,0,0.3)]">SMART</span>
                                        <div className="mb-8">
                                            <BouncingBall size={100} />
                                        </div>
                                        <span className="text-white">PADEL</span>
                                    </h1>
                                </div>
                                <div className="text-center space-y-4 relative z-10">
                                    <h2 className="text-3xl font-black italic uppercase tracking-[0.3em] text-white/40">PRO SYSTEM</h2>
                                    <div className="h-1 w-24 bg-padel-primary/30 mx-auto rounded-full" />
                                    <p className="text-padel-primary/60 font-black uppercase tracking-[0.5em] text-sm italic animate-pulse">
                                        Esperando Contenido Publicitario
                                    </p>
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
