'use client';

import { useEffect, useState } from 'react';
import { Trophy, Zap, Users, ChevronRight, Radio, Crosshair } from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { MatchStatus } from '@/types/tournament';
import { useSearchParams } from 'next/navigation';
import { buildMarkerRoomHref } from '@/app/tournaments/event/components/MatchCards';

export default function LiveBracketsPage() {
    const searchParams = useSearchParams();
    const isTVMode = searchParams.get('tv') === 'true';
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = dataService.subscribeToLiveMatches((liveMatches) => {
            setMatches(liveMatches);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-padel-primary/20 rounded-full animate-ping absolute inset-0" />
                    <Zap className="w-8 h-8 text-padel-primary relative z-10" />
                </div>
            </div>
        );
    }

    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white font-outfit relative">
            {!isTVMode && <Sidebar />}

            <div className={`ipad-scroll-area flex flex-col p-8 md:p-12 ${isTVMode ? '' : 'pl-24 md:pl-32'}`}>
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3 flex-shrink-0 w-full">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="px-3 py-1 bg-red-600/10 border border-red-600/30 rounded-full flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                <span className="text-[8px] font-black uppercase text-red-500 tracking-[0.2em] italic">Transmisión en directo</span>
                            </div>
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
                            CENTRAL <span className="text-padel-primary">DE MARCADORES</span>
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium uppercase tracking-[0.3em] text-[10px]">Resultados en tiempo real • Smart Padel System</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="glass p-4 rounded-2xl flex items-center gap-6 border-white/5">
                            <div className="text-right border-r border-white/10 pr-6">
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none mb-1">Partidos Activos</p>
                                <p className="text-3xl font-black text-padel-primary italic tabular-nums">{matches.length}</p>
                            </div>
                            <div className="hidden md:flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-[8px] font-black uppercase text-gray-500 tracking-widest">
                                    <div className="w-1 h-1 rounded-full bg-padel-primary" /> Multi-Pista v1.0
                                </div>
                                <div className="flex items-center gap-2 text-[8px] font-black uppercase text-gray-500 tracking-widest">
                                    <div className="w-1 h-1 rounded-full bg-blue-500" /> Latencia 0.2s
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1">
                    {matches.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-[50vh] flex flex-col items-center justify-center text-center glass border-dashed border-2 border-white/5 rounded-[3rem]"
                        >
                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 relative">
                                <Trophy className="w-10 h-10 text-gray-800" />
                                <div className="absolute inset-0 rounded-full border border-white/10 animate-pulse" />
                            </div>
                            <h2 className="text-3xl font-black italic uppercase text-gray-500 tracking-tighter">Esperando el próximo punto...</h2>
                            <p className="text-gray-600 max-w-sm mt-4 text-sm font-medium leading-relaxed">
                                No se han detectado partidos activos en este momento. <br />
                                <span className="opacity-50 italic">Inicia un partido desde el panel de control para verlo aquí.</span>
                            </p>
                            <Link href="/tournaments" className="mt-8 bg-white/5 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-padel-primary hover:text-black transition-all border border-white/10">
                                Explorar Torneos
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {matches.map((m, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={`${m.tournamentId}-${m.id}`}
                                    className="glass group relative overflow-hidden border-white/10 hover:border-padel-primary/40 transition-all rounded-[2.5rem] cursor-pointer"
                                    title="Doble clic: abrir sala marker"
                                    onDoubleClick={(e) => {
                                        e.preventDefault();
                                        const url = buildMarkerRoomHref(m, idx);
                                        window.open(url, '_blank', 'noopener,noreferrer');
                                    }}
                                >
                                    {/* Accent Background */}
                                    <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 rounded-full pointer-events-none transition-opacity group-hover:opacity-30" style={{ backgroundColor: m.primaryColor }} />

                                    <div className="p-8 relative z-10">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.primaryColor }} />
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{m.tournamentName}</p>
                                                </div>
                                                <h3 className="label-cancha text-2xl leading-tight mt-1">
                                                    Pista {m.court} • <span className="text-padel-primary opacity-80">{m.category}</span>
                                                </h3>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="bg-red-600 px-3 py-1 rounded-full flex items-center gap-2 shadow-[0_5px_15px_rgba(220,38,38,0.3)]">
                                                    <Radio className="w-3 h-3 text-white animate-pulse" />
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Live</span>
                                                </div>
                                                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">En curso 45:12</p>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            {/* Score Layout */}
                                            <div className="grid grid-cols-11 items-center gap-2 bg-black/40 p-4 rounded-3xl border border-white/5">
                                                {/* T1 */}
                                                <div className="col-span-4 flex flex-col items-end pr-4 border-r border-white/10">
                                                    <p className="text-xs font-black italic uppercase text-gray-400 mb-1">Pareja 1</p>
                                                    <p className="text-base font-black italic uppercase leading-none text-white truncate w-full text-right">{m.t1Name}</p>
                                                </div>

                                                {/* Sets */}
                                                <div className="col-span-3 flex justify-center gap-2 px-2">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="flex gap-1.5">
                                                            {(m.games?.t1_sets || [m.games?.t1 || 0]).map((g: number, i: number) => (
                                                                <div key={i} className="w-6 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                                                                    <span className="text-xs font-black italic tabular-nums text-gray-300">{g}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="h-0.5 w-full bg-white/5 rounded-full" />
                                                        <div className="flex gap-1.5">
                                                            {(m.games?.t2_sets || [m.games?.t2 || 0]).map((g: number, i: number) => (
                                                                <div key={i} className="w-6 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                                                                    <span className="text-xs font-black italic tabular-nums text-gray-300">{g}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* T2 */}
                                                <div className="col-span-4 flex flex-col items-start pl-4 border-l border-white/10">
                                                    <p className="text-xs font-black italic uppercase text-gray-400 mb-1">Pareja 2</p>
                                                    <p className="text-base font-black italic uppercase leading-none text-white truncate w-full">{m.t2Name}</p>
                                                </div>
                                            </div>

                                            {/* Current Score Overlay */}
                                            <div className="mt-6 flex items-center justify-center gap-8 py-4 px-8 bg-padel-primary rounded-2xl shadow-[0_20px_40px_rgba(204,255,0,0.15)] relative overflow-hidden group/score">
                                                <div className="absolute inset-0 bg-black opacity-0 group-hover/score:opacity-5 transition-opacity" />
                                                <div className="text-5xl font-black italic text-black tabular-nums tracking-tighter leading-none">{m.points?.t1 || '0'}</div>
                                                <div className="flex flex-col items-center">
                                                    <div className="w-1 h-6 bg-black/20 rounded-full" />
                                                </div>
                                                <div className="text-5xl font-black italic text-black tabular-nums tracking-tighter leading-none">{m.points?.t2 || '0'}</div>

                                                {/* Server indicator inside */}
                                                <div className="absolute bottom-2 flex gap-12">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${m.server?.team === 1 ? 'bg-black animate-pulse' : 'bg-black/10'}`} />
                                                    <div className={`w-1.5 h-1.5 rounded-full ${m.server?.team === 2 ? 'bg-black animate-pulse' : 'bg-black/10'}`} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center bg-white/5 -mx-8 -mb-8 px-8 py-6 group-hover:bg-white/[0.08] transition-colors">
                                            <div className="flex items-center gap-6 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] italic">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-3 h-3 text-padel-primary/40" />
                                                    <span>12.4k Espectadores</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Zap className="w-3 h-3 text-padel-primary/40" />
                                                    <span>Streaming HD</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        window.open(buildMarkerRoomHref(m, idx), '_blank', 'noopener,noreferrer');
                                                    }}
                                                    className="bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 hover:text-white py-3 px-5 rounded-2xl border border-emerald-500/40 hover:border-emerald-400/60 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest italic"
                                                    title="Abrir la sala de marcador (misma URL que doble clic en la tarjeta)"
                                                >
                                                    <Crosshair className="w-4 h-4 shrink-0" />
                                                    Marcador
                                                </button>
                                                <Link
                                                    href={`/tournaments/${m.tournamentId}/display/${m.id}`}
                                                    className="bg-white/5 hover:bg-padel-primary text-white hover:text-black py-3 px-6 rounded-2xl border border-white/10 hover:border-transparent transition-all flex items-center gap-3 font-black uppercase text-[10px] tracking-widest italic"
                                                >
                                                    Ver Brackets <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>


            </div>

        </div>
    );
}
