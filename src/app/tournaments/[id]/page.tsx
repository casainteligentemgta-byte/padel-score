'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Clock,
    Calendar,
    MapPin,
    Play,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    RefreshCw,
    DollarSign,
    Plus,
    User,
    Link as LinkIcon,
    Share2,
    Copy,
    MessageCircle,
    Send,
    Mail,
    X
} from 'lucide-react';
import Link from 'next/link';
import { MatchStatus, TournamentType, ScheduleConfig } from '@/types/tournament';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { ScheduleEngine } from '@/services/ScheduleEngine';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export default function TournamentDashboard({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, profile, isAdmin, isMarker, loading: authLoading } = useAuth();
    const [tournament, setTournament] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('Todas');
    const [selectedMatch, setSelectedMatch] = useState<any>(null);
    const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const isOwner = tournament?.ownerId === user?.uid;
    const canManage = isOwner || isAdmin || isMarker;

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!id || !user || authLoading) return;

        console.log(`[Dashboard] Setting up real-time listener for tournament ID: ${id}`);
        const docRef = doc(db, 'tournaments', id);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const tourneyData = { id: docSnap.id, ...docSnap.data() } as any;

                // Security check for owner or roles (simulated for now)
                if (tourneyData.ownerId === user.uid || isAdmin || isMarker) {
                    setTournament(tourneyData);

                    if (tourneyData.matches) {
                        // RE-ENRICH matches on the fly so we don't have to change the JSX
                        // This avoids the 1MB Firestore limit while keeping the UI working
                        const enriched = tourneyData.matches.map((m: any) => {
                            const team1 = tourneyData.teams?.[m.team1Index - 1];
                            const team2 = tourneyData.teams?.[m.team2Index - 1];

                            const getPlayerName = (p: any, teamIdx: number, slot: 1 | 2) => {
                                const name = p?.name?.trim();
                                if (name && name !== '') return name;
                                const index = (teamIdx * 2) - (slot === 1 ? 1 : 0);
                                return `Jugador ${index}`;
                            };

                            return {
                                ...m,
                                team1: {
                                    name: team1 ? `${getPlayerName(team1.p1, m.team1Index, 1)} y ${getPlayerName(team1.p2, m.team1Index, 2)}` : `Equipo ${m.team1Index}`,
                                    photo1: team1?.p1.photo || null,
                                    photo2: team1?.p2.photo || null
                                },
                                team2: {
                                    name: team2 ? `${getPlayerName(team2.p1, m.team2Index, 1)} y ${getPlayerName(team2.p2, m.team2Index, 2)}` : `Equipo ${m.team2Index}`,
                                    photo1: team2?.p1.photo || null,
                                    photo2: team2?.p2.photo || null
                                }
                            };
                        });
                        setMatches(enriched);
                    }
                } else {
                    console.warn('[Dashboard] Unauthorized access detected via snapshot');
                    router.push('/');
                }
            } else {
                console.error('[Dashboard] Tournament doc does not exist');
            }
            setLoading(false);
        }, (error) => {
            console.error('[Dashboard] Snapshot error:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id, user, authLoading, isAdmin, isMarker, router]);

    const stripMatches = (matches: any[]) => matches.map(m => {
        const { team1, team2, ...rest } = m;
        return rest;
    });

    const generateMatches = async () => {
        if (!tournament) return;
        setLoading(true);
        try {
            console.log('[Dashboard] Generating schedule...');
            if (!tournament.teams || tournament.teams.length < 2) {
                alert('Se necesitan al menos 2 parejas para generar partidos');
                return;
            }

            const schedule = ScheduleEngine.generateSchedule({
                tournamentId: id,
                numTeams: tournament.teams.length,
                numCourts: tournament.totalCourts || 4,
                clubHoursStart: tournament.startTime || "08:00",
                clubHoursEnd: tournament.endTime || "22:00",
                startDate: tournament.startDate ? new Date(tournament.startDate) : new Date(),
                matchDurationMinutes: 90,
                bufferMinutes: tournament.bufferMinutes || 15,
                type: tournament.type || TournamentType.AMERICANO_INDIVIDUAL
            });

            const lightMatches = (schedule.matches || []).map((m: any, idx: number) => {
                return {
                    id: `match-${idx}-${Date.now()}`,
                    ...m,
                    courtName: tournament.courtNames?.[m.courtIndex] || `Pista ${m.courtIndex + 1}`,
                    status: MatchStatus.PENDING
                };
            }).sort((a, b) => {
                const timeDiff = new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
                if (timeDiff !== 0) return timeDiff;
                return a.courtIndex - b.courtIndex;
            });

            console.log(`[Dashboard] Generated ${lightMatches.length} matches, saving to DB...`);
            await updateDoc(doc(db, 'tournaments', id), {
                matches: lightMatches,
                updatedAt: new Date()
            });

            // To update local state immediately with names/fotos:
            const enriched = lightMatches.map((m: any) => {
                const team1 = tournament.teams?.[m.team1Index - 1];
                const team2 = tournament.teams?.[m.team2Index - 1];
                return {
                    ...m,
                    team1: {
                        name: team1 ? `${team1.p1.name} y ${team1.p2.name}` : `Equipo ${m.team1Index}`,
                        photo1: team1?.p1.photo || null,
                        photo2: team1?.p2.photo || null
                    },
                    team2: {
                        name: team2 ? `${team2.p1.name} y ${team2.p2.name}` : `Equipo ${m.team2Index}`,
                        photo1: team2?.p1.photo || null,
                        photo2: team2?.p2.photo || null
                    }
                };
            });

            setMatches(enriched);
            alert(`¡Se han generado ${lightMatches.length} partidos correctamente!`);
        } catch (error) {
            console.error('[Dashboard] Error generating matches:', error);
            alert('Error al generar los partidos. Revisa la configuración del torneo.');
        } finally {
            setLoading(false);
        }
    };

    const finishMatch = async (matchId: string) => {
        setUpdatingId(matchId);
        try {
            const updatedMatches = matches.map(m => {
                if (m.id === matchId) {
                    // Use actual score if available, otherwise final set-game string
                    const finalScore = m.score || (m.sets ? `${m.sets.t1}-${m.sets.t2}` : '0-0');
                    return { ...m, status: MatchStatus.FINISHED, actualEndTime: new Date(), score: finalScore };
                }
                return m;
            });
            const autocorrected = ScheduleEngine.recalculateRemainingMatches(updatedMatches, tournament.bufferMinutes || 15);
            const finalMatches = updatedMatches.map(m => {
                const update = autocorrected.find(u => u.id === m.id);
                return update ? { ...m, scheduledTime: update.scheduledTime } : m;
            });

            await updateDoc(doc(db, 'tournaments', id), {
                matches: stripMatches(finalMatches),
                updatedAt: new Date()
            });
            setMatches(finalMatches);
        } catch (error) {
            console.error(error);
        } finally {
            setUpdatingId(null);
        }
    };

    const startMatch = async (matchId: string) => {
        setUpdatingId(matchId);
        try {
            const updatedMatches = matches.map(m =>
                m.id === matchId ? {
                    ...m,
                    status: MatchStatus.LIVE,
                    actualStartTime: new Date(),
                    score: '0-0',
                    sets: { t1: 0, t2: 0 },
                    games: { t1: 0, t2: 0 }
                } : m
            );
            await updateDoc(doc(db, 'tournaments', id), {
                matches: stripMatches(updatedMatches),
                updatedAt: new Date()
            });
            setMatches(updatedMatches);
        } catch (error) {
            console.error(error);
        } finally {
            setUpdatingId(null);
        }
    };

    const updateMatchScore = async (matchId: string, sets: { t1: number, t2: number }, games: { t1: number, t2: number }) => {
        const scoreStr = `${sets.t1}-${sets.t2} (${games.t1}-${games.t2})`;

        // Optimistic update for immediate feedback in modal
        const updatedMatches = matches.map(m =>
            m.id === matchId ? { ...m, sets, games, score: scoreStr } : m
        );

        setMatches(updatedMatches);

        // Also update the selectedMatch state so the modal re-renders
        if (selectedMatch && selectedMatch.id === matchId) {
            setSelectedMatch({ ...selectedMatch, sets, games, score: scoreStr });
        }

        try {
            await updateDoc(doc(db, 'tournaments', id), {
                matches: stripMatches(updatedMatches),
                updatedAt: new Date()
            });
        } catch (error) {
            console.error("[Dashboard] Error updating score in Firebase:", error);
        }
    };

    const reactivateMatch = async (matchId: string) => {
        setUpdatingId(matchId);
        try {
            const updatedMatches = matches.map(m =>
                m.id === matchId ? { ...m, status: MatchStatus.LIVE, actualEndTime: null } : m
            );
            await updateDoc(doc(db, 'tournaments', id), {
                matches: stripMatches(updatedMatches),
                updatedAt: new Date()
            });
            setMatches(updatedMatches);
            setIsScoreModalOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
            <RefreshCw className="w-8 h-8 text-padel-primary animate-spin" />
            <p className="text-gray-500 animate-pulse font-medium text-sm">Cargando torneo...</p>
            <button
                onClick={() => router.push('/')}
                className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400 transition-all uppercase font-bold tracking-widest"
            >
                VOLVER AL INICIO
            </button>
        </div>
    );

    if (!tournament) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-center p-6">
            <Trophy className="w-12 h-12 text-gray-800" />
            <h1 className="text-xl font-bold">Torneo no encontrado</h1>
            <p className="text-gray-400 text-sm max-w-xs">No pudimos encontrar el torneo solicitado o no tienes permisos para acceder.</p>
            <button
                onClick={() => router.push('/')}
                className="mt-6 px-8 py-3 bg-padel-primary text-black rounded-xl font-bold text-sm uppercase"
            >
                REGRESAR AL INICIO
            </button>
        </div>
    );

    const tabs = ['Todas', 'En Vivo', 'Pendientes', 'Finalizados', 'Ranking'];

    const calculateStandings = () => {
        const standings: { [key: string]: any } = {};

        matches.filter(m => m.status === MatchStatus.FINISHED).forEach(m => {
            const isIndividual = tournament?.type === TournamentType.AMERICANO_INDIVIDUAL;

            // Helper to update standing for a player or team
            const updateStats = (id: string, name: string, photo: string | null, gamesWon: number, gamesLost: number) => {
                if (!standings[id]) {
                    standings[id] = { id, name, photo, gamesWon: 0, gamesLost: 0, matchesWon: 0, matchesPlayed: 0 };
                }
                standings[id].gamesWon += gamesWon;
                standings[id].gamesLost += gamesLost;
                standings[id].matchesPlayed += 1;
                if (gamesWon > gamesLost) standings[id].matchesWon += 1;
            };

            if (isIndividual) {
                const team1 = tournament.teams[m.team1Index - 1];
                const team2 = tournament.teams[m.team2Index - 1];

                if (team1) {
                    updateStats(team1.p1.id || `p-${m.team1Index}-1`, team1.p1.name, team1.p1.photo, m.games?.t1 || 0, m.games?.t2 || 0);
                    updateStats(team1.p2.id || `p-${m.team1Index}-2`, team1.p2.name, team1.p2.photo, m.games?.t1 || 0, m.games?.t2 || 0);
                }
                if (team2) {
                    updateStats(team2.p1.id || `p-${m.team2Index}-1`, team2.p1.name, team2.p1.photo, m.games?.t2 || 0, m.games?.t1 || 0);
                    updateStats(team2.p2.id || `p-${m.team2Index}-2`, team2.p2.name, team2.p2.photo, m.games?.t2 || 0, m.games?.t1 || 0);
                }
            } else {
                updateStats(`team-${m.team1Index}`, m.team1.name || `Pareja ${m.team1Index}`, null, m.games?.t1 || 0, m.games?.t2 || 0);
                updateStats(`team-${m.team2Index}`, m.team2.name || `Pareja ${m.team2Index}`, null, m.games?.t2 || 0, m.games?.t1 || 0);
            }
        });

        return Object.values(standings).sort((a: any, b: any) => {
            // First criteria: Matches Won
            if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;

            // Second criteria: Game Difference
            const diffA = a.gamesWon - a.gamesLost;
            const diffB = b.gamesWon - b.gamesLost;
            if (diffB !== diffA) return diffB - diffA;

            // Third criteria: Games Won
            return b.gamesWon - a.gamesWon;
        });
    };

    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white font-outfit">
            {/* Header */}
            <header className="bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 flex-shrink-0">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/tournaments" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold leading-tight">{tournament?.name}</h1>
                            <p className="text-xs text-padel-primary font-medium tracking-tight uppercase italic">{tournament?.complexName || 'Margarita Padel'} • {tournament?.category}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                    >
                        <Share2 className="w-5 h-5 text-padel-primary" />
                    </button>
                </div>
                {/* Round/Filter Selector */}
                <div className="max-w-4xl mx-auto px-2 overflow-x-auto hide-scrollbar">
                    <nav className="flex space-x-1 p-1">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 min-w-[100px] py-3 text-xs font-bold border-b-2 transition-all ${activeTab === tab ? 'border-padel-primary text-padel-primary' : 'border-transparent text-gray-500'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Content Area */}
            <div className="ipad-scroll-area">
                <main className="max-w-4xl mx-auto w-full px-4 py-10">
                    <AnimatePresence mode="wait">
                        {activeTab === 'Ranking' ? (
                            <motion.div
                                key="ranking"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <div className="bg-white/5 rounded-[32px] border border-white/10 overflow-hidden">
                                    <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter">Tabla de Posiciones</h3>
                                            <div className="bg-padel-primary/20 px-3 py-1 rounded-full">
                                                <span className="text-[10px] font-black text-padel-primary uppercase tracking-tighter">
                                                    {tournament?.type === TournamentType.AMERICANO_INDIVIDUAL ? 'Individual' : 'Por Parejas'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-white/[0.01] border-b border-white/5">
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest text-center">Pos</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Participante</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest text-center">PJ</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-padel-primary tracking-widest text-center">PG</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest text-center">GF</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest text-center">GC</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest text-center">Dif</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {calculateStandings().length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-bold uppercase italic text-xs">Aún no hay partidos finalizados</td>
                                                    </tr>
                                                ) : calculateStandings().map((entry: any, index: number) => (
                                                    <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors group">
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-black italic text-sm ${index === 0 ? 'bg-padel-primary text-black' : index === 1 ? 'bg-gray-400 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-white/5 text-gray-400'}`}>
                                                                {index + 1}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5 flex-shrink-0">
                                                                    {entry.photo ? <img src={entry.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-600 uppercase">P</div>}
                                                                </div>
                                                                <span className="font-black italic uppercase text-xs tracking-tighter text-white truncate max-w-[120px]">{entry.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center text-xs font-bold text-gray-400">{entry.matchesPlayed}</td>
                                                        <td className="px-6 py-4 text-center text-xs font-black text-padel-primary">{entry.matchesWon}</td>
                                                        <td className="px-6 py-4 text-center text-xs font-bold text-gray-200">{entry.gamesWon}</td>
                                                        <td className="px-6 py-4 text-center text-xs font-bold text-gray-500">{entry.gamesLost}</td>
                                                        <td className="px-6 py-4 text-center text-sm font-black italic text-white">{(entry.gamesWon - entry.gamesLost) > 0 ? '+' : ''}{entry.gamesWon - entry.gamesLost}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="matches"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                {matches.length === 0 ? (
                                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center gap-6 bg-white/5 rounded-[32px] border border-white/5">
                                        <div className="w-20 h-20 bg-padel-primary/20 rounded-full flex items-center justify-center">
                                            <Trophy className="w-10 h-10 text-padel-primary" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Sin Partidos</h3>
                                            <p className="text-gray-400 text-sm max-w-xs px-6 font-medium">Genera el fixture completo basándote en las parejas anotadas y disponibilidad de pistas.</p>
                                        </div>
                                        <button
                                            onClick={generateMatches}
                                            disabled={loading}
                                            className="bg-padel-primary text-black px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-[0_10px_40px_rgba(204,255,0,0.3)] disabled:opacity-50"
                                        >
                                            {loading ? 'GENERANDO...' : 'GENERAR CALENDARIO'}
                                        </button>
                                    </div>
                                ) : matches
                                    .filter(m => {
                                        if (activeTab === 'Todas') return true;
                                        if (activeTab === 'En Vivo') return m.status === MatchStatus.LIVE;
                                        if (activeTab === 'Pendientes') return m.status === MatchStatus.PENDING;
                                        if (activeTab === 'Finalizados') return m.status === MatchStatus.FINISHED;
                                        return true;
                                    })
                                    .map((match, idx) => (
                                        <motion.section
                                            key={match.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="space-y-3"
                                        >
                                            <div className="flex items-center justify-between px-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`material-symbols-outlined text-sm ${match.status === MatchStatus.LIVE ? 'text-padel-primary' : 'text-gray-500'}`}>
                                                        {match.status === MatchStatus.LIVE ? 'chair' : 'schedule'}
                                                    </span>
                                                    <span className="text-[10px] font-bold tracking-wider uppercase text-gray-500 italic">
                                                        {match.courtName} • <span className="text-white/40">Horario Tentativo:</span> {formatTime(match.scheduledTime)}
                                                    </span>
                                                </div>
                                                {match.status === MatchStatus.LIVE && (
                                                    <div className="flex items-center gap-1 bg-padel-primary/20 px-2 py-0.5 rounded-full">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-padel-primary animate-pulse"></span>
                                                        <span className="text-[10px] font-black text-padel-primary uppercase tracking-tighter">En Vivo</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/10">
                                                <div className="p-5 space-y-4">
                                                    {/* Team 1 */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative flex">
                                                                <div className="w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden bg-white/5 relative z-10">
                                                                    {match.team1.photo1 ? <img src={match.team1.photo1} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-600">{(match.team1Index * 2) - 1}</div>}
                                                                </div>
                                                                <div className="w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden bg-white/5 -ml-5">
                                                                    {match.team1.photo2 ? <img src={match.team1.photo2} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-600">{match.team1Index * 2}</div>}
                                                                </div>
                                                            </div>
                                                            <span className={`font-black italic uppercase text-xs tracking-tighter ${match.status === MatchStatus.FINISHED && match.score?.includes('-') ? 'opacity-40' : 'text-white'}`}>{match.team1.name}</span>
                                                        </div>
                                                        <div className="flex gap-1.5">
                                                            <span className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg text-sm font-black italic text-white/20">{match.sets?.t1 || 0}</span>
                                                            <span className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-black italic shadow-lg ${match.status === MatchStatus.FINISHED ? 'bg-padel-primary text-black' : 'bg-white/10 text-white'}`}>{match.games?.t1 || 0}</span>
                                                        </div>
                                                    </div>

                                                    <div className="h-px bg-white/5 w-full"></div>

                                                    {/* Team 2 */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative flex">
                                                                <div className="w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden bg-white/5 relative z-10">
                                                                    {match.team2.photo1 ? <img src={match.team2.photo1} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-600">{(match.team2Index * 2) - 1}</div>}
                                                                </div>
                                                                <div className="w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden bg-white/5 -ml-5">
                                                                    {match.team2.photo2 ? <img src={match.team2.photo2} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-600">{match.team2Index * 2}</div>}
                                                                </div>
                                                            </div>
                                                            <span className={`font-black italic uppercase text-xs tracking-tighter ${match.status !== MatchStatus.LIVE ? 'opacity-40 text-white' : 'text-white'}`}>{match.team2.name}</span>
                                                        </div>
                                                        <div className="flex gap-1.5">
                                                            <span className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg text-sm font-black italic text-white/20">{match.sets?.t2 || 0}</span>
                                                            <span className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-black italic shadow-lg ${match.status === MatchStatus.FINISHED ? 'bg-padel-primary text-black' : 'bg-white/10 text-white'}`}>{match.games?.t2 || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {match.status === MatchStatus.PENDING && (
                                                    <button
                                                        onClick={() => startMatch(match.id)}
                                                        className="w-full h-[60px] bg-white/5 hover:bg-white/10 text-white font-black text-xs flex items-center justify-center gap-2 transition-colors uppercase italic tracking-widest border-t border-white/5"
                                                    >
                                                        <Play className="w-4 h-4 text-padel-primary" />
                                                        Iniciar Partido
                                                    </button>
                                                )}

                                                {match.status === MatchStatus.LIVE && (
                                                    <div className="grid grid-cols-2 divide-x divide-white/5 border-t border-white/5">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedMatch(match);
                                                                setIsScoreModalOpen(true);
                                                            }}
                                                            disabled={!canManage}
                                                            className="h-[60px] bg-white/5 hover:bg-white/10 text-white font-black text-[10px] flex items-center justify-center gap-2 transition-colors uppercase italic tracking-widest disabled:opacity-30"
                                                        >
                                                            <Plus className="w-4 h-4 text-padel-primary" />
                                                            MARCADOR
                                                        </button>
                                                        <button
                                                            onClick={() => finishMatch(match.id)}
                                                            disabled={!canManage}
                                                            className="h-[60px] bg-padel-primary hover:bg-padel-primary/90 text-black font-black text-[10px] flex items-center justify-center gap-2 transition-colors uppercase italic tracking-widest disabled:opacity-50"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            Finalizar
                                                        </button>
                                                    </div>
                                                )}

                                                {match.status === MatchStatus.FINISHED && (
                                                    <div className="grid grid-cols-1 border-t border-white/5">
                                                        {canManage ? (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedMatch(match);
                                                                    setIsScoreModalOpen(true);
                                                                }}
                                                                className="w-full h-[60px] bg-[#ccff00]/5 hover:bg-[#ccff00]/10 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-padel-primary italic tracking-widest transition-colors"
                                                            >
                                                                <RefreshCw className="w-3 h-3" />
                                                                Corregir Resultado: {match.score || 'N/A'}
                                                            </button>
                                                        ) : (
                                                            <div className="w-full h-[60px] bg-[#ccff00]/5 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-padel-primary italic tracking-widest">
                                                                Resultado Final: {match.score || 'N/A'}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.section>
                                    ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            {/* Score Management Modal */}
            <AnimatePresence>
                {isScoreModalOpen && selectedMatch && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="bg-[#0f0f0f] w-full max-w-lg rounded-[40px] border border-white/10 overflow-hidden shadow-2xl mb-4"
                        >
                            <div className="p-8 space-y-8">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Marcador en Vivo</h3>
                                    <button
                                        onClick={() => setIsScoreModalOpen(false)}
                                        className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Team 1 Score */}
                                    <div className="flex items-center justify-between bg-white/[0.02] p-6 rounded-[32px] border border-white/5">
                                        <span className="font-black italic uppercase text-xs tracking-tighter truncate max-w-[150px]">{selectedMatch.team1.name}</span>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">Sets</span>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => updateMatchScore(selectedMatch.id, { ...selectedMatch.sets, t1: Math.max(0, (selectedMatch.sets?.t1 || 0) - 1) }, selectedMatch.games)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">-</button>
                                                    <span className="w-10 text-center font-black text-xl italic">{selectedMatch.sets?.t1 || 0}</span>
                                                    <button onClick={() => updateMatchScore(selectedMatch.id, { ...selectedMatch.sets, t1: (selectedMatch.sets?.t1 || 0) + 1 }, selectedMatch.games)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">+</button>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[10px] font-bold text-padel-primary uppercase">Juegos</span>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => updateMatchScore(selectedMatch.id, selectedMatch.sets, { ...selectedMatch.games, t1: Math.max(0, (selectedMatch.games?.t1 || 0) - 1) })} className="w-8 h-8 rounded-lg bg-padel-primary/10 text-padel-primary flex items-center justify-center">-</button>
                                                    <span className="w-10 text-center font-black text-xl italic text-padel-primary">{selectedMatch.games?.t1 || 0}</span>
                                                    <button onClick={() => updateMatchScore(selectedMatch.id, selectedMatch.sets, { ...selectedMatch.games, t1: (selectedMatch.games?.t1 || 0) + 1 })} className="w-8 h-8 rounded-lg bg-padel-primary/10 text-padel-primary flex items-center justify-center">+</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Team 2 Score */}
                                    <div className="flex items-center justify-between bg-white/[0.02] p-6 rounded-[32px] border border-white/5">
                                        <span className="font-black italic uppercase text-xs tracking-tighter truncate max-w-[150px]">{selectedMatch.team2.name}</span>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">Sets</span>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => updateMatchScore(selectedMatch.id, { ...selectedMatch.sets, t2: Math.max(0, (selectedMatch.sets?.t2 || 0) - 1) }, selectedMatch.games)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">-</button>
                                                    <span className="w-10 text-center font-black text-xl italic">{selectedMatch.sets?.t2 || 0}</span>
                                                    <button onClick={() => updateMatchScore(selectedMatch.id, { ...selectedMatch.sets, t2: (selectedMatch.sets?.t2 || 0) + 1 }, selectedMatch.games)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">+</button>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center gap-3">
                                                <span className="text-[10px] font-bold text-padel-primary uppercase">Juegos</span>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => updateMatchScore(selectedMatch.id, selectedMatch.sets, { ...selectedMatch.games, t2: Math.max(0, (selectedMatch.games?.t2 || 0) - 1) })} className="w-8 h-8 rounded-lg bg-padel-primary/10 text-padel-primary flex items-center justify-center">-</button>
                                                    <span className="w-10 text-center font-black text-xl italic text-padel-primary">{selectedMatch.games?.t2 || 0}</span>
                                                    <button onClick={() => updateMatchScore(selectedMatch.id, selectedMatch.sets, { ...selectedMatch.games, t2: (selectedMatch.games?.t2 || 0) + 1 })} className="w-8 h-8 rounded-lg bg-padel-primary/10 text-padel-primary flex items-center justify-center">+</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {selectedMatch.status === MatchStatus.LIVE ? (
                                        <button
                                            onClick={() => {
                                                finishMatch(selectedMatch.id);
                                                setIsScoreModalOpen(false);
                                            }}
                                            className="w-full py-5 bg-padel-primary text-black font-black uppercase italic tracking-widest rounded-3xl"
                                        >
                                            Finalizar Partido
                                        </button>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => reactivateMatch(selectedMatch.id)}
                                                className="py-5 bg-white/5 text-white font-black uppercase italic tracking-widest rounded-3xl text-[10px]"
                                            >
                                                Reactivar
                                            </button>
                                            <button
                                                onClick={() => setIsScoreModalOpen(false)}
                                                className="py-5 bg-padel-primary text-black font-black uppercase italic tracking-widest rounded-3xl text-[10px]"
                                            >
                                                Confirmar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation Bar */}
            <nav className="bg-[#0a0a0a] border-t border-white/5 px-8 py-3 pb-8 flex justify-between items-center z-50 flex-shrink-0">
                <Link href="/tournaments" className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
                    <Trophy className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Torneos</span>
                </Link>
                <button
                    onClick={() => setActiveTab('Todas')}
                    className={`flex flex-col items-center gap-1 ${activeTab !== 'Ranking' ? 'text-padel-primary' : 'text-gray-500 hover:text-white'} transition-colors`}
                >
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: activeTab !== 'Ranking' ? "'FILL' 1" : "" }}>account_tree</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Cuadros</span>
                </button>
                <button
                    onClick={() => setActiveTab('Ranking')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'Ranking' ? 'text-padel-primary' : 'text-gray-500 hover:text-white'} transition-colors`}
                >
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: activeTab === 'Ranking' ? "'FILL' 1" : "" }}>analytics</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Ranking</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
                    <User className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Perfil</span>
                </button>
            </nav>

            {/* Share Modal */}
            <AnimatePresence>
                {isShareModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#0f0f0f] w-full max-w-sm rounded-[32px] border border-white/10 overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">Compartir Torneo</h3>
                                <button onClick={() => setIsShareModalOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => {
                                            const text = encodeURIComponent(`🎾 ¡Sigue los resultados de ${tournament?.name} en vivo por Padel Score!`);
                                            const url = encodeURIComponent(window.location.href);
                                            window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
                                        }}
                                        className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                                            <MessageCircle className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#25D366]">WhatsApp</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            const url = encodeURIComponent(window.location.href);
                                            const text = encodeURIComponent(`🎾 ¡Sigue los resultados de ${tournament?.name} en vivo por Padel Score!`);
                                            window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
                                        }}
                                        className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-[#0088cc]/10 border border-[#0088cc]/20 hover:bg-[#0088cc]/20 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center text-white">
                                            <Send className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#0088cc]">Telegram</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            const subject = encodeURIComponent(`Torneo de Padel: ${tournament?.name}`);
                                            const body = encodeURIComponent(`¡Hola! Te invito a seguir los resultados del torneo ${tournament?.name} en vivo aquí:\n\n${window.location.href}`);
                                            window.location.href = `mailto:?subject=${subject}&body=${body}`;
                                        }}
                                        className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Correo</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                        className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-padel-primary/10 border border-padel-primary/20 hover:bg-padel-primary/20 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-padel-primary flex items-center justify-center text-black">
                                            {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-padel-primary">{copied ? 'Copiado' : 'Link'}</span>
                                    </button>
                                </div>

                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between gap-3">
                                    <span className="text-[10px] text-gray-500 font-medium truncate">{window.location.href}</span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                        className="text-padel-primary hover:scale-110 transition-transform"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>

                                <p className="text-[9px] text-center text-gray-600 uppercase font-bold tracking-widest italic py-2">
                                    Para compartir en Instagram, copia el link y pégalo en tu biografía o historias.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}

function formatTime(dateVal: any) {
    if (!dateVal) return 'TBD';
    try {
        let date: Date;
        // Manejar Timestamps de Firestore
        if (dateVal && typeof dateVal.toDate === 'function') {
            date = dateVal.toDate();
        } else {
            date = new Date(dateVal);
        }

        if (isNaN(date.getTime())) return 'TBD';

        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).toUpperCase();
    } catch {
        return 'TBD';
    }
}

