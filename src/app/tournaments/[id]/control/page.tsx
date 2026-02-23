'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Clock,
    Activity,
    Settings,
    LayoutDashboard,
    Play,
    CheckCircle2,
    Monitor,
    Users,
    ChevronRight,
    MapPin,
    AlertCircle,
    Maximize2,
    Volume2,
    MonitorPlay,
    Tv
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { MatchStatus, TournamentType } from '@/types/tournament';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

export default function ControlPanel({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, isAdmin, isMarker, loading: authLoading } = useAuth();
    const [tournament, setTournament] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!id || authLoading) return;

        const docRef = doc(db, 'tournaments', id);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const tourneyData = { id: docSnap.id, ...docSnap.data() } as any;
                setTournament(tourneyData);

                if (tourneyData.matches) {
                    const enriched = tourneyData.matches.map((m: any) => {
                        const team1 = m.team1Index > 0 ? tourneyData.teams?.[m.team1Index - 1] : null;
                        const team2 = m.team2Index > 0 ? tourneyData.teams?.[m.team2Index - 1] : null;

                        const getPlayerName = (p: any, teamIdx: number, slot: 1 | 2) => {
                            if (teamIdx <= 0) return 'Por definir';
                            const name = p?.name?.trim();
                            if (name && name !== '') return name;
                            return `Jugador ${slot}`;
                        };

                        return {
                            ...m,
                            team1: {
                                name: team1 ? `${getPlayerName(team1.p1, m.team1Index, 1)} y ${getPlayerName(team1.p2, m.team1Index, 2)}` : (m.team1Index <= 0 ? 'Por definir' : `Equipo ${m.team1Index}`),
                                photo1: team1?.p1.photo || null,
                                photo2: team1?.p2.photo || null
                            },
                            team2: {
                                name: team2 ? `${getPlayerName(team2.p1, m.team2Index, 1)} y ${getPlayerName(team2.p2, m.team2Index, 2)}` : (m.team2Index <= 0 ? 'Por definir' : `Equipo ${m.team2Index}`),
                                photo1: team2?.p1.photo || null,
                                photo2: team2?.p2.photo || null
                            }
                        };
                    });
                    setMatches(enriched);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id, authLoading]);

    const formatTime = (dateStr: any) => {
        if (!dateStr) return '--:--';
        try {
            const date = new Date(dateStr);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        } catch { return '--:--'; }
    };

    if (loading) return (
        <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
            <MonitorPlay className="w-12 h-12 text-padel-primary animate-pulse" />
            <p className="text-padel-primary font-black italic uppercase tracking-widest text-xs">Iniciando Dirección de Competición...</p>
        </div>
    );

    const liveMatches = matches.filter(m => m.status === MatchStatus.LIVE);
    const pendingMatches = matches.filter(m => m.status === MatchStatus.PENDING).slice(0, 10);
    const completedCount = matches.filter(m => m.status === MatchStatus.FINISHED).length;
    const totalCount = matches.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className="h-screen bg-[#050505] text-white flex overflow-hidden font-outfit relative">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 p-4 lg:p-6 gap-4 pl-24 md:pl-28">
                {/* Top Banner / Header */}
                <header className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-4 rounded-3xl backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-padel-primary/20 rounded-2xl border border-padel-primary/30">
                            <LayoutDashboard className="w-6 h-6 text-padel-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black italic uppercase tracking-tighter">{tournament?.name}</h1>
                                <span className="px-2 py-0.5 bg-padel-primary/10 text-padel-primary text-[8px] font-black rounded uppercase tracking-widest border border-padel-primary/20">Modo Director</span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">{tournament?.category} • {tournament?.complexName || 'Margarita Padel'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="hidden lg:flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Progreso</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            className="h-full bg-padel-primary shadow-[0_0_10px_#ccff00]"
                                        />
                                    </div>
                                    <span className="text-xs font-black italic text-padel-primary">{completedCount}/{totalCount}</span>
                                </div>
                            </div>
                            <div className="w-px h-8 bg-white/5" />
                            <div className="text-right">
                                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Hora Local</p>
                                <p className="text-lg font-black italic text-white leading-none">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</p>
                            </div>
                        </div>
                        <Link
                            href={`/tournaments/${id}/control/broadcasting`}
                            className="w-12 h-12 flex items-center justify-center bg-padel-primary/10 border border-padel-primary/20 rounded-2xl hover:bg-padel-primary/20 transition-all text-padel-primary group"
                            title="Configurar Streamer y Pizarra"
                        >
                            <Tv className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </Link>
                        <button className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                            <Settings className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </header>

                {/* Main Control Grid */}
                <main className="flex-1 min-h-0 grid grid-cols-12 gap-4">

                    {/* Left Section - Live Controls (Large) */}
                    <div className="col-span-8 flex flex-col gap-4 min-h-0">
                        <section className="flex-1 bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-6 flex flex-col min-h-0">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]" />
                                    <h2 className="text-sm font-black italic uppercase tracking-widest text-white">Partidos en Curso <span className="text-gray-600 ml-2">({liveMatches.length})</span></h2>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
                                        <Volume2 className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
                                        <Maximize2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 xl:grid-cols-2 gap-4 content-start">
                                {liveMatches.length === 0 ? (
                                    <div className="col-span-full h-full flex flex-col items-center justify-center opacity-20 py-20">
                                        <Activity className="w-12 h-12 mb-4" />
                                        <p className="font-black italic uppercase text-xs tracking-widest">No hay partidos activos en este momento</p>
                                    </div>
                                ) : liveMatches.map(match => (
                                    <motion.div
                                        layoutId={match.id}
                                        key={match.id}
                                        className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col gap-4 hover:border-padel-primary/40 transition-all group"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-1 bg-padel-primary text-black text-[9px] font-black rounded-md italic uppercase tracking-tighter">PISTA {match.court}</span>
                                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest italic">{match.groupName ? `Grupo ${match.groupName}` : 'Torneo'}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">Ref: {match.id.slice(-4)}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Team 1 Row */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative flex -space-x-2">
                                                        <div className={`w-8 h-8 rounded-full border border-white/10 bg-white/5 overflow-hidden ring-2 ${match.server?.team === 1 && match.server?.player === 1 ? 'ring-padel-primary' : 'ring-transparent'}`}>
                                                            {match.team1.photo1 ? <img src={match.team1.photo1} className="w-full h-full object-cover" /> : null}
                                                        </div>
                                                        <div className={`w-8 h-8 rounded-full border border-white/10 bg-white/5 overflow-hidden ring-2 ${match.server?.team === 1 && match.server?.player === 2 ? 'ring-padel-primary' : 'ring-transparent'}`}>
                                                            {match.team1.photo2 ? <img src={match.team1.photo2} className="w-full h-full object-cover" /> : null}
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-black uppercase italic tracking-tighter max-w-[120px] truncate">{match.team1.name}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <span className="w-6 h-8 flex items-center justify-center bg-white/5 rounded-md text-[10px] font-black text-gray-500">{match.sets?.t1 || 0}</span>
                                                    <span className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-md text-xs font-black text-white">{match.games?.t1 || 0}</span>
                                                    <span className="w-10 h-8 flex items-center justify-center bg-padel-primary text-black rounded-md text-sm font-black italic shadow-[0_0_15px_rgba(204,255,0,0.3)]">{match.points?.t1 || '0'}</span>
                                                </div>
                                            </div>

                                            {/* Divider */}
                                            <div className="h-px bg-white/5 w-full" />

                                            {/* Team 2 Row */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative flex -space-x-2">
                                                        <div className={`w-8 h-8 rounded-full border border-white/10 bg-white/5 overflow-hidden ring-2 ${match.server?.team === 2 && match.server?.player === 1 ? 'ring-padel-primary' : 'ring-transparent'}`}>
                                                            {match.team2.photo1 ? <img src={match.team2.photo1} className="w-full h-full object-cover" /> : null}
                                                        </div>
                                                        <div className={`w-8 h-8 rounded-full border border-white/10 bg-white/5 overflow-hidden ring-2 ${match.server?.team === 2 && match.server?.player === 2 ? 'ring-padel-primary' : 'ring-transparent'}`}>
                                                            {match.team2.photo2 ? <img src={match.team2.photo2} className="w-full h-full object-cover" /> : null}
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-black uppercase italic tracking-tighter max-w-[120px] truncate">{match.team2.name}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <span className="w-6 h-8 flex items-center justify-center bg-white/5 rounded-md text-[10px] font-black text-gray-500">{match.sets?.t2 || 0}</span>
                                                    <span className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-md text-xs font-black text-white">{match.games?.t2 || 0}</span>
                                                    <span className="w-10 h-8 flex items-center justify-center bg-padel-primary text-black rounded-md text-sm font-black italic shadow-[0_0_15px_rgba(204,255,0,0.3)]">{match.points?.t2 || '0'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {(isAdmin || isMarker) ? (
                                            <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <Link
                                                    href={`/tournaments/${id}/score/${match.id}`}
                                                    className="flex-1 py-2 bg-white/5 border border-white/5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all hover:bg-padel-primary hover:text-black text-center flex items-center justify-center gap-2"
                                                >
                                                    <MonitorPlay className="w-3 h-3" />
                                                    Pizarra
                                                </Link>
                                                <Link
                                                    href={`/tournaments/${id}/display/${match.id}`}
                                                    target="_blank"
                                                    className="flex-1 py-2 bg-white/5 border border-white/5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all hover:bg-[#fb923c] hover:text-black text-center flex items-center justify-center gap-2"
                                                >
                                                    <Monitor className="w-3 h-3" />
                                                    TV Pista
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="mt-2 w-full py-2 bg-white/5 border border-white/5 rounded-xl text-[8px] font-black uppercase tracking-widest opacity-20 text-center">
                                                Solo Selección de Árbitro
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Section - Sidebar (Pending + Ranking) */}
                    <div className="col-span-4 flex flex-col gap-4 min-h-0">
                        {/* Pending Matches */}
                        <section className="flex-1 bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-6 flex flex-col min-h-0">
                            <div className="flex items-center gap-3 mb-6">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <h2 className="text-sm font-black italic uppercase tracking-widest text-white">Siguientes Encuentros</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                                {pendingMatches.map(match => (
                                    <div key={match.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-white/20 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="text-center w-12 border-r border-white/10 pr-4">
                                                <p className="text-[10px] font-black italic leading-none text-padel-primary">{formatTime(match.scheduledTime)}</p>
                                                <p className="text-[7px] font-bold text-gray-600 uppercase tracking-tighter mt-1">Pista {match.court}</p>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-[9px] font-black uppercase tracking-tighter text-white truncate max-w-[120px]">{match.team1.name}</p>
                                                <p className="text-[7px] font-bold text-gray-600 uppercase italic">vs</p>
                                                <p className="text-[9px] font-black uppercase tracking-tighter text-white truncate max-w-[120px]">{match.team2.name}</p>
                                            </div>
                                        </div>
                                        <button className="p-2 bg-padel-primary/10 text-padel-primary rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                            <Play className="w-3 h-3 fill-current" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Top Performers (Simplified Ranking) */}
                        <section className="h-[280px] bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-6 flex flex-col min-h-0">
                            <div className="flex items-center gap-3 mb-6">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                <h2 className="text-sm font-black italic uppercase tracking-widest text-white">Líderes</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                                {[1, 2, 3].map(pos => (
                                    <div key={pos} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black italic ${pos === 1 ? 'bg-amber-500 text-black' : 'bg-white/5 text-gray-500'}`}>{pos}</div>
                                            <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Participante {pos}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black italic text-padel-primary">+34</span>
                                            <p className="text-[6px] font-bold text-gray-600 uppercase">Dif. Juegos</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </main>

                {/* Footer / Status Bar */}
                <footer className="h-10 flex items-center justify-between px-6 border border-white/5 bg-white/[0.01] rounded-2xl flex-shrink-0">
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_green]" />
                            <span className="text-[8px] font-black uppercase text-gray-600 tracking-widest">Sincronizado con Firebase Realtime</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity className="w-3 h-3 text-gray-600" />
                            <span className="text-[8px] font-black uppercase text-gray-600 tracking-widest">API Latency: 42ms</span>
                        </div>
                    </div>
                    <div className="text-[8px] font-black tracking-[0.3em] uppercase text-gray-700 italic flex items-center gap-2">
                        PADEL SMART Pro System <div className="w-1 h-1 bg-gray-800 rounded-full" /> 2024
                    </div>
                </footer>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
