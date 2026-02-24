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
    History
} from 'lucide-react';

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
}

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
        "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
        "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
    ],
    forcedAds = false
}: TVScoreboardDisplayProps) {
    const [isAdsMode, setIsAdsMode] = useState(forcedAds);
    const [currentAdIdx, setCurrentAdIdx] = useState(0);

    // Sync with external control
    useEffect(() => {
        setIsAdsMode(forcedAds);
    }, [forcedAds]);

    const isGoldPoint = currentPointsA === "40" && currentPointsB === "40";

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
                        className="h-full flex flex-col p-12 lg:p-20 relative"
                    >
                        {/* Background Ambiance */}
                        <div className="absolute inset-0 pointer-events-none opacity-20">
                            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px]" style={{ backgroundColor: `${smartPadelColor}22` }} />
                            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px]" />
                        </div>

                        {/* SECTION SUPERIOR: Equipos */}
                        <header className="grid grid-cols-2 gap-20 relative z-10 mb-12">
                            {/* Equipo A */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-2 w-16 rounded-full" style={{ backgroundColor: smartPadelColor }} />
                                    <span className="text-gray-500 font-black uppercase tracking-[0.4em] text-sm italic">Pareja 1</span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <h2 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-tight drop-shadow-2xl">
                                        {teamAName.includes(' / ') ? teamAName.split(' / ')[0] : teamAName}<br />
                                        <span className="opacity-80">{teamAName.includes(' / ') ? teamAName.split(' / ')[1] : ''}</span>
                                    </h2>
                                    {serverIndicator === 'A' && (
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="p-3 bg-padel-primary rounded-full shadow-[0_0_30px_#ccff00]"
                                        >
                                            <div className="w-5 h-5 bg-black rounded-full" />
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Equipo B */}
                            <div className="flex flex-col items-end gap-4 text-right">
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-500 font-black uppercase tracking-[0.4em] text-sm italic">Pareja 2</span>
                                    <div className="h-2 w-16 bg-blue-600 rounded-full" />
                                </div>
                                <div className="flex items-center gap-6 justify-end">
                                    {serverIndicator === 'B' && (
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="p-3 bg-padel-primary rounded-full shadow-[0_0_30px_#ccff00]"
                                        >
                                            <div className="w-5 h-5 bg-black rounded-full" />
                                        </motion.div>
                                    )}
                                    <h2 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-tight drop-shadow-2xl">
                                        {teamBName.includes(' / ') ? teamBName.split(' / ')[0] : teamBName}<br />
                                        <span className="opacity-80">{teamBName.includes(' / ') ? teamBName.split(' / ')[1] : ''}</span>
                                    </h2>
                                </div>
                            </div>
                        </header>

                        {/* SECTION CENTRAL: Game Actual (Héroe) */}
                        <main className="flex-1 flex flex-col items-center justify-center relative z-10">
                            <div className="relative group">
                                {/* Glow Effect */}
                                <div className="absolute inset-[-40px] bg-white/5 rounded-[5rem] blur-[60px] opacity-30 animate-pulse" />

                                <div className="bg-gradient-to-br from-black/80 to-black/40 backdrop-blur-3xl border-4 border-white/5 rounded-[6rem] p-16 lg:px-40 flex flex-col items-center shadow-2xl relative overflow-hidden">
                                    {/* Scanlines */}
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />

                                    <span className="text-gray-600 font-black uppercase tracking-[0.6em] text-xl mb-8 italic">MARCADOR ACTUAL</span>

                                    <div className="flex items-center gap-12 lg:gap-24">
                                        <AnimatePresence mode="popLayout">
                                            <motion.span
                                                key={currentPointsA}
                                                initial={{ y: 80, opacity: 0, scale: 0.8 }}
                                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                                exit={{ y: -80, opacity: 0, scale: 0.8 }}
                                                transition={{ type: "spring", damping: 15 }}
                                                className="text-[18rem] lg:text-[28rem] font-black italic tracking-tighter leading-none"
                                                style={{ color: smartPadelColor, textShadow: `0 0 60px ${smartPadelColor}44` }}
                                            >
                                                {currentPointsA}
                                            </motion.span>
                                        </AnimatePresence>

                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-4 h-4 rounded-full bg-white/10" />
                                            <div className="w-4 h-4 rounded-full bg-white/10" />
                                        </div>

                                        <AnimatePresence mode="popLayout">
                                            <motion.span
                                                key={currentPointsB}
                                                initial={{ y: 80, opacity: 0, scale: 0.8 }}
                                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                                exit={{ y: -80, opacity: 0, scale: 0.8 }}
                                                transition={{ type: "spring", damping: 15 }}
                                                className="text-[18rem] lg:text-[28rem] font-black italic tracking-tighter leading-none text-white drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
                                            >
                                                {currentPointsB}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>

                                    {/* Gold Point Banner */}
                                    <AnimatePresence>
                                        {isGoldPoint && (
                                            <motion.div
                                                initial={{ y: 100, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: 50, opacity: 0 }}
                                                className="absolute bottom-12 px-12 py-3 bg-red-600 rounded-[2rem] flex items-center gap-4 shadow-[0_20px_50px_rgba(220,38,38,0.4)]"
                                            >
                                                <Zap className="w-6 h-6 text-white fill-white animate-bounce" />
                                                <span className="text-2xl font-black italic uppercase tracking-[0.4em] text-white">PUNTO DE ORO</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </main>

                        {/* SECTION INFERIOR: El Partido (Historial) */}
                        <footer className="mt-12 relative z-10">
                            <div className="bg-white/5 border border-white/10 rounded-[4rem] p-10 flex items-center justify-between backdrop-blur-md shadow-2xl overflow-hidden relative group">
                                <div className="absolute top-0 left-0 w-2 h-full bg-padel-primary" />

                                <div className="flex items-center gap-20">
                                    {/* Stats Team A */}
                                    <div className="flex items-center gap-12">
                                        <div className="flex flex-col">
                                            <span className="text-gray-500 font-black uppercase text-[10px] tracking-widest mb-1 italic">Sets Ganados</span>
                                            <span className="text-7xl font-black italic text-white leading-none">{setsA}</span>
                                        </div>
                                        <div className="flex flex-col px-10 border-l border-white/10">
                                            <span className="text-gray-500 font-black uppercase text-[10px] tracking-widest mb-1 italic">Games Set Actual</span>
                                            <span className="text-5xl font-black italic text-padel-primary leading-none">{gamesA}</span>
                                        </div>
                                    </div>

                                    {/* Previous Sets History */}
                                    <div className="flex items-center gap-4 px-12 border-l border-white/10">
                                        <History className="w-5 h-5 text-gray-700" />
                                        <div className="flex gap-3">
                                            {prevSets.map((set, idx) => (
                                                <div key={idx} className="px-5 py-2 bg-black/40 rounded-2xl border border-white/5 flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-gray-600 mr-2 italic">S{idx + 1}</span>
                                                    <span className="text-sm font-black italic tracking-widest text-white/60">{set}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Team B */}
                                <div className="flex items-center gap-20">
                                    <div className="flex flex-col items-end px-10 border-r border-white/10">
                                        <span className="text-gray-500 font-black uppercase text-[10px] tracking-widest mb-1 italic">Games Set Actual</span>
                                        <span className="text-5xl font-black italic text-padel-primary leading-none">{gamesB}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-gray-500 font-black uppercase text-[10px] tracking-widest mb-1 italic">Sets Ganados</span>
                                        <span className="text-7xl font-black italic text-white leading-none">{setsB}</span>
                                    </div>
                                </div>
                            </div>
                        </footer>
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
                            <video
                                key={currentAdIdx}
                                src={adsPlaylist[currentAdIdx]}
                                autoPlay
                                muted
                                loop={false}
                                onEnded={() => setCurrentAdIdx(prev => (prev + 1) % adsPlaylist.length)}
                                className="w-full h-full object-cover"
                            />

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
            <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100]">
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em] italic mb-1">PRO SYSTEM</span>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">
                        SMART <span className="text-padel-primary">PADEL</span>
                    </h1>
                </div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                .font-outfit { font-family: 'Outfit', sans-serif; }
                body { background: #000; margin: 0; padding: 0; }
            `}</style>
        </div>
    );
}
