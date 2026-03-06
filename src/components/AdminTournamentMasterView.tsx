'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid,
    Tv,
    Monitor,
    MessageSquare,
    Clock,
    Trophy,
    Timer,
    Zap,
    AlertTriangle,
    Play,
    Pause,
    ExternalLink,
    ChevronRight,
    Users,
    Activity,
    ShieldAlert
} from 'lucide-react';
import { MatchStatus, TournamentType } from '@/types/tournament';
import { dataService } from '@/lib/dataService';
import Link from 'next/link';

interface AdminTournamentMasterViewProps {
    tournamentId: string;
    isAdmin: boolean;
}

const PadelRallyAnimation = () => (
    <div className="hidden md:flex items-center gap-6 h-12 relative px-6 bg-white/5 rounded-2xl border border-white/10 overflow-hidden group">
        <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-8 h-8 relative"
        >
            {/* Racket 1 */}
            <div className="w-full h-full border-2 border-padel-primary rounded-full rotate-[-45deg] bg-black shadow-[0_0_10px_rgba(204,255,0,0.2)] flex items-center justify-center">
                <div className="w-4 h-4 border border-padel-primary/30 rounded-full" />
                <div className="absolute -bottom-2 -right-1 w-2 h-4 bg-padel-primary rounded-full origin-top rotate-0" />
            </div>
        </motion.div>

        <div className="w-24 relative h-full flex items-center">
            <motion.div
                animate={{
                    x: [0, 80],
                    y: [0, -15, 0],
                }}
                transition={{
                    x: { duration: 0.75, repeat: Infinity, repeatType: "reverse", ease: "linear" },
                    y: { duration: 0.375, repeat: Infinity, repeatType: "reverse", ease: "easeOut" }
                }}
                className="w-2.5 h-2.5 bg-padel-primary rounded-full shadow-[0_0_15px_#ccff00] z-10"
            />
        </div>

        <motion.div
            animate={{ y: [8, -8, 8] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-8 h-8 relative"
        >
            {/* Racket 2 */}
            <div className="w-full h-full border-2 border-white/20 rounded-full rotate-[45deg] bg-black flex items-center justify-center">
                <div className="w-4 h-4 border border-white/5 rounded-full" />
                <div className="absolute -bottom-2 -left-1 w-2 h-4 bg-white/10 rounded-full origin-top rotate-0" />
            </div>
        </motion.div>
    </div>
);

export default function AdminTournamentMasterView({ tournamentId, isAdmin }: AdminTournamentMasterViewProps) {
    const [tournament, setTournament] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tournamentId) return;

        // Load initially
        const loadInitial = async () => {
            try {
                const tourney = await dataService.getTournament(tournamentId);
                if (tourney) setTournament(tourney);

                const mList = await dataService.getMatches(tournamentId);
                setMatches(mList);
            } catch (err) {
                console.error("Error loading tournament data in Admin Master View:", err);
            } finally {
                setLoading(false);
            }
        };

        loadInitial();

        // 1. Suscripción al Torneo
        const tourneyChannel = dataService.subscribeToTournament(tournamentId, (tourney) => {
            setTournament(tourney);
        });

        // 2. Suscripción a Partidos
        const matchesChannel = dataService.subscribeToMatches(tournamentId, (mList) => {
            // Need latest tournament teams for enrichment
            // We use the local 'tournament' variable but it might be stale in this closure
            // Better to handle enrichment in the render or a separate useEffect
            setMatches(mList);
        });

        return () => {
            tourneyChannel();
            matchesChannel();
        };
    }, [tournamentId]);

    // Derived state: enriched matches
    const enrichedMatches = matches.map(m => {
        const t1 = (m.team1Index > 0 && tournament?.teams) ? tournament.teams[m.team1Index - 1] : null;
        const t2 = (m.team2Index > 0 && tournament?.teams) ? tournament.teams[m.team2Index - 1] : null;

        return {
            ...m,
            court: m.court || (m.courtIndex !== undefined ? m.courtIndex + 1 : undefined),
            playerNames: {
                team1: t1 ? `${t1.p1?.name || 'J1'} / ${t1.p2?.name || 'J2'}` : (m.team1?.teamLabel || (m.team1Name || 'Por definir')),
                team2: t2 ? `${t2.p1?.name || 'J1'} / ${t2.p2?.name || 'J2'}` : (m.team2?.teamLabel || (m.team2Name || 'Por definir'))
            }
        };
    });

    const toggleAds = async (matchId: string, currentStatus: boolean) => {
        await dataService.updateMatch(tournamentId, matchId, { forcedAds: !currentStatus });
    };

    const toggleRefereeCall = async (matchId: string, currentStatus: boolean) => {
        await dataService.updateMatch(tournamentId, matchId, { needsReferee: !currentStatus });
    };

    if (!isAdmin) {
        return (
            <div className="h-screen bg-[#0a0a0a] flex items-center justify-center p-10">
                <div className="max-w-md text-center">
                    <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-6 opacity-20" />
                    <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-4">Acceso Denegado</h2>
                    <p className="text-gray-500">Este panel es de uso exclusivo para Administradores del Torneo.</p>
                </div>
            </div>
        );
    }

    if (loading) return (
        <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
            <Zap className="w-12 h-12 text-[#ccff00] animate-pulse" />
        </div>
    );

    // Stats calculations
    const activeMatches = enrichedMatches.filter(m => m.status === MatchStatus.LIVE);
    const finishedMatches = enrichedMatches.filter(m => m.status === MatchStatus.FINISHED);
    const pendingMatches = enrichedMatches.filter(m => m.status === MatchStatus.PENDING);
    const upcomingMatches = pendingMatches.slice(0, 5);

    return (
        <div className="min-h-screen bg-[#080808] text-white p-6 md:p-10 font-sans">
            {/* Header Stats */}
            <header className="mb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-6 mb-2">
                            <div className="flex items-center gap-3">
                                <Activity className="w-5 h-5 text-[#ccff00]" />
                                <span className="text-[10px] font-black italic uppercase tracking-[0.4em] text-[#ccff00]">Centro de Comando Maestro</span>
                            </div>
                            <PadelRallyAnimation />
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter">
                            TOURNEY <span className="text-[#ccff00]">ADMIN CONTROL</span>
                        </h1>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-[#111] border border-white/5 rounded-3xl p-6 flex flex-col items-center min-w-[120px]">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">En Curso</span>
                            <span className="text-3xl font-black italic text-[#ccff00] leading-none">{activeMatches.length}</span>
                        </div>
                        <div className="bg-[#111] border border-white/5 rounded-3xl p-6 flex flex-col items-center min-w-[120px]">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Finalizados</span>
                            <span className="text-3xl font-black italic text-white leading-none">{finishedMatches.length}</span>
                        </div>
                        <div className="bg-[#111] border border-white/5 rounded-3xl p-6 flex flex-col items-center min-w-[120px]">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Restantes</span>
                            <span className="text-3xl font-black italic text-gray-600 leading-none">{pendingMatches.length}</span>
                        </div>
                    </div>
                </div>

                {/* Waiting List Bar */}
                <div className="bg-[#111]/50 border border-white/5 rounded-[2rem] p-4 flex items-center gap-6 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-3 px-4 py-2 border-r border-white/10 shrink-0">
                        <Clock className="w-4 h-4 text-padel-primary" />
                        <span className="text-[10px] font-black italic uppercase tracking-widest">En Espera:</span>
                    </div>
                    <div className="flex gap-4">
                        {upcomingMatches.map((m, idx) => (
                            <div key={m.id} className="bg-white/5 px-6 py-3 rounded-2xl flex items-center gap-4 shrink-0 hover:bg-white/10 transition-all border border-white/5">
                                <span className="text-[10px] font-black italic text-padel-primary">#{idx + 1}</span>
                                <span className="text-xs font-bold uppercase tracking-tight truncate max-w-[150px]">{m.team1Index} vs {m.team2Index}</span>
                                <span className="text-[9px] font-black text-gray-600 bg-black/40 px-2 py-1 rounded-md">{m.scheduledTime instanceof Date ? m.scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : m.scheduledTime}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* Courts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                {activeMatches.map((match) => (
                    <motion.div
                        key={match.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`bg-[#121212] border-2 rounded-[3.5rem] overflow-hidden transition-all duration-500 flex flex-col relative group ${match.needsReferee ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]' : 'border-white/5 hover:border-padel-primary/30'}`}
                    >
                        {/* Court Info Header */}
                        <div className="p-6 pb-0 flex justify-between items-start">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                                    <span className="text-[9px] font-black italic text-[#ccff00] uppercase tracking-widest">EN VIVO</span>
                                </div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">CANCHA {match.court}</h3>
                            </div>
                            <div className={`p-3 rounded-2xl border transition-all ${match.isBluetoothConnected ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-white/5 border-white/10 text-gray-600'}`}>
                                <Zap className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Category & Time */}
                        <div className="px-6 mt-2 flex gap-3">
                            <span className="text-[8px] font-black italic bg-white/5 border border-white/10 px-3 py-1.5 rounded-full uppercase tracking-widest text-gray-400">
                                {tournament?.category || '4TA MASCULINO'}
                            </span>
                            <div className="flex items-center gap-2 text-[8px] font-black italic text-gray-500 bg-white/5 px-3 py-1.5 rounded-full uppercase tracking-widest">
                                <Timer className="w-3 h-3" />
                                32 min
                            </div>
                        </div>

                        {/* Scores Section */}
                        <div className="flex-1 p-8 flex flex-col justify-center gap-8">
                            {/* Team 1 Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-xs font-black italic uppercase text-white truncate tracking-tighter">{match.playerNames.team1}</span>
                                    <div className="flex gap-1 mt-2">
                                        {(match.setsHistory || []).map((s: any, i: number) => (
                                            <span key={i} className="text-[10px] font-bold text-gray-600">{s.t1}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 shrink-0">
                                    <div className="text-2xl font-black italic text-gray-600">{match.sets?.t1 || 0}</div>
                                    <div className="w-14 h-14 bg-padel-primary/10 border border-padel-primary/30 rounded-2xl flex items-center justify-center text-2xl font-black italic text-padel-primary shadow-[0_0_20px_rgba(204,255,0,0.1)]">
                                        {match.games?.t1 || 0}
                                    </div>
                                    <div className="w-12 text-center text-4xl font-black italic leading-none">{match.points?.t1 || '0'}</div>
                                </div>
                            </div>

                            {/* Divider with Center Glow */}
                            <div className="relative h-px bg-white/5 w-full">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-px bg-gradient-to-r from-transparent via-padel-primary/40 to-transparent blur-sm" />
                            </div>

                            {/* Team 2 Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-xs font-black italic uppercase text-white truncate tracking-tighter">{match.playerNames.team2}</span>
                                    <div className="flex gap-1 mt-2">
                                        {(match.setsHistory || []).map((s: any, i: number) => (
                                            <span key={i} className="text-[10px] font-bold text-gray-600">{s.t2}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 shrink-0">
                                    <div className="text-2xl font-black italic text-gray-600">{match.sets?.t2 || 0}</div>
                                    <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl font-black italic text-white">
                                        {match.games?.t2 || 0}
                                    </div>
                                    <div className="w-12 text-center text-4xl font-black italic leading-none">{match.points?.t2 || '0'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Action Bar */}
                        <div className="p-4 bg-white/[0.02] border-t border-white/5 flex gap-3">
                            <Link
                                href={`/tournaments/${tournamentId}/score/${match.id}`}
                                className="flex-1 py-4 bg-white text-black rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black italic uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                            >
                                <Users className="w-4 h-4" />
                                Intervenir
                            </Link>

                            <button
                                onClick={() => toggleAds(match.id, !!match.forcedAds)}
                                className={`w-16 h-14 rounded-2xl flex items-center justify-center transition-all ${match.forcedAds ? 'bg-[#ccff00] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]' : 'bg-white/5 border border-white/10 text-gray-500 hover:bg-white/10'}`}
                                title="Modo Publicidad"
                            >
                                <Tv className="w-5 h-5" />
                            </button>

                            <button
                                onClick={() => toggleRefereeCall(match.id, !!match.needsReferee)}
                                className={`w-16 h-14 rounded-2xl flex items-center justify-center transition-all ${match.needsReferee ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse' : 'bg-white/5 border border-white/10 text-gray-500 hover:bg-white/10'}`}
                                title="Llamar Árbitro / Alerta"
                            >
                                <ShieldAlert className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Warning Overlay if Needs Referee */}
                        {match.needsReferee && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
                        )}
                    </motion.div>
                ))}

                {activeMatches.length === 0 && (
                    <div className="col-span-full py-40 border-4 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center text-center">
                        <Monitor className="w-20 h-20 text-white/5 mb-6" />
                        <h3 className="text-2xl font-black italic uppercase text-white/20 tracking-tighter">Sin Partidos Activos</h3>
                        <p className="text-gray-600 mt-2 font-medium">Inicia partidos desde el Dashboard para verlos aquí.</p>
                    </div>
                )}
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
