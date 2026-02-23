'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    RefreshCw,
    Undo2,
    CheckCircle2,
    Stethoscope,
    Monitor,
    Timer,
    Thermometer,
    Minus,
    Plus,
    RotateCcw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { MatchStatus } from '@/types/tournament';
import { useAuth } from '@/lib/AuthContext';

export default function RefereeScoreboard({ params }: { params: Promise<{ id: string, matchId: string }> }) {
    const { id, matchId } = use(params);
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [tournament, setTournament] = useState<any>(null);
    const [match, setMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const primaryColor = tournament?.broadcastingSettings?.primaryColor || '#ccff00';
    const [history, setHistory] = useState<any[]>([]);
    const [duration, setDuration] = useState(0);
    const [isGoldenPoint, setIsGoldenPoint] = useState(true);
    const [isMedicalTimeout, setIsMedicalTimeout] = useState(false);
    const [medicalTimeRemaining, setMedicalTimeRemaining] = useState(180); // 3 minutes

    // Timer logic
    useEffect(() => {
        let interval: any;
        if (match?.status === MatchStatus.LIVE) {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [match?.status]);

    // Medical Timer logic
    useEffect(() => {
        let interval: any;
        if (isMedicalTimeout && medicalTimeRemaining > 0) {
            interval = setInterval(() => {
                setMedicalTimeRemaining(prev => prev - 1);
            }, 1000);
        } else if (medicalTimeRemaining === 0) {
            setIsMedicalTimeout(false);
        }
        return () => clearInterval(interval);
    }, [isMedicalTimeout, medicalTimeRemaining]);

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (!id || authLoading) return;

        const docRef = doc(db, 'tournaments', id);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const tourneyData = { id: docSnap.id, ...docSnap.data() } as any;
                setTournament(tourneyData);

                if (tourneyData.matches) {
                    const foundMatch = tourneyData.matches.find((m: any) => m.id === matchId);
                    if (foundMatch) {
                        const team1 = foundMatch.team1Index > 0 ? tourneyData.teams?.[foundMatch.team1Index - 1] : null;
                        const team2 = foundMatch.team2Index > 0 ? tourneyData.teams?.[foundMatch.team2Index - 1] : null;

                        const getPlayerNames = (team: any, idx: number) => {
                            if (idx <= 0) return { p1: 'Por definir', p2: 'Por definir', full: 'Por definir' };
                            return {
                                p1: team?.p1?.name || 'Jugador 1',
                                p2: team?.p2?.name || 'Jugador 2',
                                full: `${team?.p1?.name || 'J1'} / ${team?.p2?.name || 'J2'}`
                            };
                        };

                        setMatch({
                            ...foundMatch,
                            court: foundMatch.court || (foundMatch.courtIndex !== undefined ? foundMatch.courtIndex + 1 : undefined),
                            team1: {
                                ...getPlayerNames(team1, foundMatch.team1Index),
                                p1Photo: team1?.p1?.photo || null,
                                p2Photo: team1?.p2?.photo || null
                            },
                            team2: {
                                ...getPlayerNames(team2, foundMatch.team2Index),
                                p1Photo: team2?.p1?.photo || null,
                                p2Photo: team2?.p2?.photo || null
                            }
                        });

                        if (tourneyData.scoringSystem) {
                            setIsGoldenPoint(tourneyData.scoringSystem === 'GOLDEN_POINT');
                        }
                    }
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id, matchId, authLoading]);

    const saveHistory = () => {
        if (match) {
            setHistory(prev => [...prev, JSON.parse(JSON.stringify(match))].slice(-10));
        }
    };

    const undoPoint = async () => {
        if (history.length === 0) return;
        const previousState = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));

        const updatedMatches = tournament.matches.map((m: any) =>
            m.id === matchId ? {
                ...m,
                points: previousState.points,
                games: previousState.games,
                sets: previousState.sets,
                server: previousState.server
            } : m
        );
        await updateDoc(doc(db, 'tournaments', id), { matches: updatedMatches });
    };

    const updateScore = async (side: 't1' | 't2', action: 'plus' | 'minus') => {
        if (!tournament || !match) return;

        if (action === 'minus') {
            undoPoint();
            return;
        }

        saveHistory();

        const points = ['0', '15', '30', '40', 'AD'];
        const currentPoints = match.points?.[side] || '0';
        const otherSide = side === 't1' ? 't2' : 't1';
        const otherPoints = match.points?.[otherSide] || '0';

        let newPoints = { ...match.points };

        if (currentPoints === '40') {
            if (otherPoints === '40') {
                if (isGoldenPoint) {
                    await winGame(side);
                    return;
                } else {
                    newPoints[side] = 'AD';
                }
            } else if (otherPoints === 'AD') {
                newPoints[otherSide] = '40';
            } else {
                await winGame(side);
                return;
            }
        } else if (currentPoints === 'AD') {
            await winGame(side);
            return;
        } else {
            const nextIdx = points.indexOf(currentPoints) + 1;
            newPoints[side] = points[nextIdx];
        }

        const updatedMatches = tournament.matches.map((m: any) =>
            m.id === matchId ? { ...m, points: newPoints } : m
        );
        await updateDoc(doc(db, 'tournaments', id), { matches: updatedMatches });
    };

    const winGame = async (side: 't1' | 't2') => {
        let newGames = { t1: match.games?.t1 || 0, t2: match.games?.t2 || 0 };
        newGames[side]++;

        // Auto-switch server on game win
        const currentServer = match.server || { team: 1, player: 1 };
        let nextServer = { ...currentServer };
        if (currentServer.player === 1) nextServer.player = 2;
        else {
            nextServer.player = 1;
            nextServer.team = currentServer.team === 1 ? 2 : 1;
        }

        if (newGames[side] >= 6) {
            let newSets = { t1: match.sets?.t1 || 0, t2: match.sets?.t2 || 0 };
            newSets[side]++;

            const updatedMatches = tournament.matches.map((m: any) =>
                m.id === matchId ? {
                    ...m,
                    games: { t1: 0, t2: 0 },
                    points: { t1: '0', t2: '0' },
                    sets: newSets,
                    server: nextServer
                } : m
            );
            await updateDoc(doc(db, 'tournaments', id), { matches: updatedMatches });
        } else {
            const updatedMatches = tournament.matches.map((m: any) =>
                m.id === matchId ? {
                    ...m,
                    games: newGames,
                    points: { t1: '0', t2: '0' },
                    server: nextServer
                } : m
            );
            await updateDoc(doc(db, 'tournaments', id), { matches: updatedMatches });
        }
    };

    const toggleServingPlayer = async () => {
        if (!match) return;
        saveHistory();
        const currentServer = match.server || { team: 1, player: 1 };
        const updatedMatches = tournament.matches.map((m: any) =>
            m.id === matchId ? { ...m, server: { ...currentServer, player: currentServer.player === 1 ? 2 : 1 } } : m
        );
        await updateDoc(doc(db, 'tournaments', id), { matches: updatedMatches });
    };

    const toggleServingTeam = async () => {
        if (!match) return;
        saveHistory();
        const currentServer = match.server || { team: 1, player: 1 };
        const updatedMatches = tournament.matches.map((m: any) =>
            m.id === matchId ? { ...m, server: { ...currentServer, team: currentServer.team === 1 ? 2 : 1 } } : m
        );
        await updateDoc(doc(db, 'tournaments', id), { matches: updatedMatches });
    };

    const handleMedicalTimeout = async () => {
        if (!tournament || !match) return;
        const newStatus = isMedicalTimeout ? MatchStatus.LIVE : MatchStatus.PAUSED;

        if (!isMedicalTimeout) {
            setMedicalTimeRemaining(180); // Reset to 3 mins
        }

        setIsMedicalTimeout(!isMedicalTimeout);

        const updatedMatches = tournament.matches.map((m: any) =>
            m.id === matchId ? { ...m, status: newStatus } : m
        );
        await updateDoc(doc(db, 'tournaments', id), { matches: updatedMatches });
    };

    if (loading) return (
        <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-padel-primary animate-spin" />
        </div>
    );

    if (!match) return <div className="h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-black italic uppercase">Partido no encontrado</div>;

    const server = match.server || { team: 1, player: 1 };

    return (
        <div className="fixed inset-0 bg-[#0a0a0a] text-white flex flex-col font-sans select-none overflow-hidden touch-none p-6">
            {/* Top Bar */}
            <header className="flex items-center justify-between mb-8 px-4">
                <div className="flex gap-10">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black italic text-gray-500 tracking-widest uppercase">Duración</span>
                        <span className="text-3xl font-black italic text-padel-primary tracking-tighter">{formatDuration(duration)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black italic text-gray-500 tracking-widest uppercase">Temperatura</span>
                        <span className="text-3xl font-black italic text-white tracking-tighter">28°C</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleMedicalTimeout}
                        className={`flex items-center gap-3 px-6 py-3 border rounded-2xl text-[10px] font-black italic uppercase tracking-widest transition-all ${isMedicalTimeout ? 'bg-[#c2410c] border-[#c2410c] text-white' : 'bg-[#c2410c]/20 border-[#c2410c]/40 text-[#fb923c] hover:bg-[#c2410c]/30'}`}
                    >
                        <Stethoscope className={`w-4 h-4 ${isMedicalTimeout ? 'animate-pulse' : ''}`} />
                        {isMedicalTimeout ? 'Reanudar Partido' : 'Asistencia Médica'}
                    </button>
                    <button className="flex items-center gap-3 px-6 py-3 bg-[#262626] border border-white/10 rounded-2xl text-[10px] font-black italic uppercase tracking-widest text-gray-300 hover:bg-[#333] transition-all">
                        <Monitor className="w-4 h-4" />
                        Mesa Técnica
                    </button>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black italic text-gray-500 tracking-widest uppercase">Pista Central</span>
                    <span className="text-xl font-black italic text-white uppercase tracking-tighter">Finales - Open</span>
                </div>
            </header>

            {/* Main Content: Two Teams */}
            <main className="flex-1 flex gap-6 px-2">
                {/* Team 1 Card */}
                <div className="flex-1 bg-[#141414] border border-white/5 rounded-[3rem] p-10 flex flex-col items-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-padel-primary/5 to-transparent opacity-50" />

                    {/* Players Header */}
                    <div className="flex justify-center gap-16 mb-8 relative z-10">
                        {/* Player 1 */}
                        <div className="flex flex-col items-center gap-4">
                            <div
                                onClick={toggleServingTeam}
                                className={`relative w-28 h-28 rounded-full border-4 transition-all duration-500 cursor-pointer ${server.team === 1 && server.player === 1 ? 'border-padel-primary scale-110 shadow-[0_0_40px_rgba(204,255,0,0.4)] z-20' : 'border-white/5 opacity-40 hover:opacity-100'}`}
                            >
                                <div className="w-full h-full rounded-full overflow-hidden">
                                    <img src={match.team1.p1Photo || `https://ui-avatars.com/api/?name=${match.team1.p1}&background=222&color=fff`} className="w-full h-full object-cover" />
                                </div>
                                {server.team === 1 && server.player === 1 && (
                                    <>
                                        <div className="absolute inset-0 bg-padel-primary/10 animate-pulse rounded-full" />
                                        <motion.div
                                            animate={{ y: [0, -8, 0], scale: [1, 0.9, 1] }}
                                            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-padel-primary rounded-full shadow-[0_5px_15px_rgba(204,255,0,0.6)] flex items-center justify-center border-4 border-black z-30 overflow-hidden"
                                        >
                                            <div className="absolute inset-0 border-[1.5px] border-black/10 rounded-full scale-75 rotate-45" />
                                            <div className="absolute inset-0 border-[1.5px] border-black/10 rounded-full scale-75 -rotate-45" />
                                        </motion.div>
                                    </>
                                )}
                            </div>
                            <div className="text-center">
                                <span className="block text-sm font-black italic uppercase tracking-tighter">{match.team1.p1}</span>
                                {server.team === 1 && server.player === 1 && (
                                    <span className="text-[9px] font-black italic text-padel-primary uppercase tracking-[0.2em] mt-1 block">Saca</span>
                                )}
                            </div>
                        </div>

                        {/* Player 2 */}
                        <div className="flex flex-col items-center gap-4">
                            <div
                                onClick={toggleServingTeam}
                                className={`relative w-28 h-28 rounded-full border-4 transition-all duration-500 cursor-pointer ${server.team === 1 && server.player === 2 ? 'scale-110 z-20' : 'border-white/5 opacity-40 hover:opacity-100'}`}
                                style={server.team === 1 && server.player === 2 ? { borderColor: primaryColor, boxShadow: `0 0 40px ${primaryColor}66` } : {}}
                            >
                                <div className="w-full h-full rounded-full overflow-hidden">
                                    <img src={match.team1.p2Photo || `https://ui-avatars.com/api/?name=${match.team1.p2}&background=222&color=fff`} className="w-full h-full object-cover" />
                                </div>
                                {server.team === 1 && server.player === 2 && (
                                    <>
                                        <div className="absolute inset-0 animate-pulse rounded-full" style={{ backgroundColor: `${primaryColor}1a` }} />
                                        <motion.div
                                            animate={{ y: [0, -8, 0], scale: [1, 0.9, 1] }}
                                            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center border-4 border-black z-30 overflow-hidden"
                                            style={{ backgroundColor: primaryColor, boxShadow: `0 5px 15px ${primaryColor}99` }}
                                        >
                                            <div className="absolute inset-0 border-[1.5px] border-black/10 rounded-full scale-75 rotate-45" />
                                            <div className="absolute inset-0 border-[1.5px] border-black/10 rounded-full scale-75 -rotate-45" />
                                        </motion.div>
                                    </>
                                )}
                            </div>
                            <div className="text-center">
                                <span className="block text-sm font-black italic uppercase tracking-tighter">{match.team1.p2}</span>
                                {server.team === 1 && server.player === 2 && (
                                    <span className="text-[9px] font-black italic uppercase tracking-[0.2em] mt-1 block" style={{ color: primaryColor }}>Saca</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sets Progression */}
                    <div className="flex gap-4 mb-12 relative z-10">
                        {[1, 2, 3].map(setNum => {
                            const currentSet = (match.sets?.t1 || 0) + (match.sets?.t2 || 0) + 1;
                            const isCurrent = setNum === currentSet;
                            return (
                                <div key={setNum} className="flex flex-col items-center gap-2">
                                    <span className="text-[8px] font-black italic text-gray-500 uppercase tracking-widest">Set {setNum}</span>
                                    <div
                                        className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl font-black italic transition-all duration-500 ${isCurrent ? 'text-black scale-110 shadow-lg' : 'bg-white/5 border-white/5 text-gray-500'}`}
                                        style={isCurrent ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                                    >
                                        {setNum < currentSet ? match.games?.t1 : isCurrent ? match.games?.t1 : '-'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Points Interaction */}
                    <div className="flex-1 flex items-center justify-center w-full relative z-10 gap-10">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateScore('t1', 'minus')}
                            className="w-20 h-40 bg-white/5 border border-white/5 rounded-[2rem] flex items-center justify-center hover:bg-white/10 transition-all text-gray-500"
                        >
                            <Minus className="w-8 h-8" />
                        </motion.button>

                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black italic text-gray-500 uppercase tracking-[0.3em] mb-4">Puntos</span>
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={match.points?.t1}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-[14rem] font-black italic leading-none tracking-tighter text-white"
                                >
                                    {match.points?.t1 || '0'}
                                </motion.span>
                            </AnimatePresence>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateScore('t1', 'plus')}
                            className="w-20 h-40 bg-padel-primary/10 border border-padel-primary/20 rounded-[2rem] flex items-center justify-center hover:bg-padel-primary/20 transition-all text-padel-primary"
                        >
                            <Plus className="w-8 h-8" />
                        </motion.button>
                    </div>
                </div>

                {/* Team 2 Card */}
                <div className="flex-1 bg-[#141414] border border-white/5 rounded-[3rem] p-10 flex flex-col items-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-bl from-white/5 to-transparent opacity-50" />

                    {/* Golden Point Status Indicator */}
                    <div className="absolute top-8 right-12 z-20">
                        <button
                            onClick={() => setIsGoldenPoint(!isGoldenPoint)}
                            className={`px-4 py-2 rounded-full border-2 text-[8px] font-black uppercase tracking-widest transition-all ${isGoldenPoint ? 'border-[#ccff00] text-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.2)]' : 'border-white/10 text-gray-600'}`}
                            style={isGoldenPoint ? { borderColor: primaryColor, color: primaryColor, boxShadow: `0 0 15px ${primaryColor}33` } : {}}
                        >
                            {isGoldenPoint ? 'Punto de Oro Activo' : 'Punto de Oro'}
                        </button>
                    </div>

                    {/* Players Header */}
                    <div className="flex justify-center gap-16 mb-8 relative z-10">
                        {/* Player 1 */}
                        <div className="flex flex-col items-center gap-4">
                            <div
                                onClick={toggleServingTeam}
                                className={`relative w-28 h-28 rounded-full border-4 transition-all duration-500 cursor-pointer ${server.team === 2 && server.player === 1 ? 'scale-110 z-20' : 'border-white/5 opacity-40 hover:opacity-100'}`}
                                style={server.team === 2 && server.player === 1 ? { borderColor: primaryColor, boxShadow: `0 0 40px ${primaryColor}66` } : {}}
                            >
                                <div className="w-full h-full rounded-full overflow-hidden">
                                    <img src={match.team2.p1Photo || `https://ui-avatars.com/api/?name=${match.team2.p1}&background=222&color=fff`} className="w-full h-full object-cover" />
                                </div>
                                {server.team === 2 && server.player === 1 && (
                                    <>
                                        <div className="absolute inset-0 bg-padel-primary/10 animate-pulse rounded-full" />
                                        <motion.div
                                            animate={{ y: [0, -8, 0], scale: [1, 0.9, 1] }}
                                            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-padel-primary rounded-full shadow-[0_5px_15px_rgba(204,255,0,0.6)] flex items-center justify-center border-4 border-black z-30 overflow-hidden"
                                        >
                                            <div className="absolute inset-0 border-[1.5px] border-black/10 rounded-full scale-75 rotate-45" />
                                            <div className="absolute inset-0 border-[1.5px] border-black/10 rounded-full scale-75 -rotate-45" />
                                        </motion.div>
                                    </>
                                )}
                            </div>
                            <div className="text-center">
                                <span className="block text-sm font-black italic uppercase tracking-tighter">{match.team2.p1}</span>
                                {server.team === 2 && server.player === 1 && (
                                    <span className="text-[9px] font-black italic text-padel-primary uppercase tracking-[0.2em] mt-1 block">Saca</span>
                                )}
                            </div>
                        </div>

                        {/* Player 2 */}
                        <div className="flex flex-col items-center gap-4">
                            <div
                                onClick={toggleServingTeam}
                                className={`relative w-28 h-28 rounded-full border-4 transition-all duration-500 cursor-pointer ${server.team === 2 && server.player === 2 ? 'border-padel-primary scale-110 shadow-[0_0_40px_rgba(204,255,0,0.4)] z-20' : 'border-white/5 opacity-40 hover:opacity-100'}`}
                            >
                                <div className="w-full h-full rounded-full overflow-hidden">
                                    <img src={match.team2.p2Photo || `https://ui-avatars.com/api/?name=${match.team2.p2}&background=222&color=fff`} className="w-full h-full object-cover" />
                                </div>
                                {server.team === 2 && server.player === 2 && (
                                    <>
                                        <div className="absolute inset-0 bg-padel-primary/10 animate-pulse rounded-full" />
                                        <motion.div
                                            animate={{ y: [0, -8, 0], scale: [1, 0.9, 1] }}
                                            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-padel-primary rounded-full shadow-[0_5px_15px_rgba(204,255,0,0.6)] flex items-center justify-center border-4 border-black z-30 overflow-hidden"
                                        >
                                            <div className="absolute inset-0 border-[1.5px] border-black/10 rounded-full scale-75 rotate-45" />
                                            <div className="absolute inset-0 border-[1.5px] border-black/10 rounded-full scale-75 -rotate-45" />
                                        </motion.div>
                                    </>
                                )}
                            </div>
                            <div className="text-center">
                                <span className="block text-sm font-black italic uppercase tracking-tighter">{match.team2.p2}</span>
                                {server.team === 2 && server.player === 2 && (
                                    <span className="text-[9px] font-black italic text-padel-primary uppercase tracking-[0.2em] mt-1 block">Saca</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sets Progression */}
                    <div className="flex gap-4 mb-12 relative z-10">
                        {[1, 2, 3].map(setNum => {
                            const currentSet = (match.sets?.t1 || 0) + (match.sets?.t2 || 0) + 1;
                            const isCurrent = setNum === currentSet;
                            return (
                                <div key={setNum} className="flex flex-col items-center gap-2">
                                    <span className="text-[8px] font-black italic text-gray-500 uppercase tracking-widest">Set {setNum}</span>
                                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl font-black italic transition-all duration-500 ${isCurrent ? 'bg-padel-primary border-padel-primary text-black scale-110 shadow-lg' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                                        {setNum < currentSet ? match.games?.t2 : isCurrent ? match.games?.t2 : '-'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Points Interaction */}
                    <div className="flex-1 flex items-center justify-center w-full relative z-10 gap-10">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateScore('t2', 'minus')}
                            className="w-20 h-40 bg-white/5 border border-white/5 rounded-[2rem] flex items-center justify-center hover:bg-white/10 transition-all text-gray-500"
                        >
                            <Minus className="w-8 h-8" />
                        </motion.button>

                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black italic text-gray-500 uppercase tracking-[0.3em] mb-4">Puntos</span>
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={match.points?.t2}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-[14rem] font-black italic leading-none tracking-tighter text-white"
                                >
                                    {match.points?.t2 || '0'}
                                </motion.span>
                            </AnimatePresence>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateScore('t2', 'plus')}
                            className="w-20 h-40 bg-padel-primary/10 border border-padel-primary/20 rounded-[2rem] flex items-center justify-center hover:bg-padel-primary/20 transition-all text-padel-primary"
                        >
                            <Plus className="w-8 h-8" />
                        </motion.button>
                    </div>
                </div>
            </main>

            {/* Bottom Actions */}
            <footer className="mt-8 flex items-center justify-between px-4 pb-4">
                <div className="flex gap-8">
                    <button
                        onClick={() => router.back()}
                        className="text-[10px] font-black italic uppercase tracking-widest text-gray-500 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Corregir Sorteo
                    </button>
                    <button className="text-[10px] font-black italic uppercase tracking-widest text-gray-500 hover:text-white transition-colors flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Cambio Lado
                    </button>
                </div>

                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-8 py-3 rounded-[2rem] cursor-pointer hover:bg-white/10 transition-all group" onClick={() => setIsGoldenPoint(!isGoldenPoint)}>
                    <div className={`w-3 h-3 rounded-full ${isGoldenPoint ? 'bg-padel-primary shadow-[0_0_10px_#ccff00]' : 'bg-gray-600'}`} />
                    <span className="text-[10px] font-black italic uppercase tracking-widest text-gray-300">Punto de Oro: <span className={isGoldenPoint ? 'text-padel-primary' : 'text-gray-500'}>{isGoldenPoint ? 'ON' : 'OFF'}</span></span>
                </div>

                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-4 bg-white text-black px-12 py-5 rounded-[2rem] text-[11px] font-black italic uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all group"
                >
                    Siguiente Juego
                    <ChevronLeft className="w-5 h-5 rotate-180" />
                </button>
            </footer>

            {/* Medical Timeout Overlay */}
            <AnimatePresence>
                {isMedicalTimeout && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-10"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="text-center space-y-8"
                        >
                            <div className="relative inline-block">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-[#c2410c]/20 blur-3xl rounded-full"
                                />
                                <Stethoscope className="w-32 h-32 text-[#fb923c] relative z-10 mx-auto" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Asistencia Médica</h2>
                                <p className="text-[#fb923c] font-bold uppercase tracking-[0.3em] text-xs">Tiempo de Recuperación</p>
                            </div>

                            <div className="text-[12rem] font-black italic leading-none tracking-tighter text-white font-mono">
                                {Math.floor(medicalTimeRemaining / 60)}:{String(medicalTimeRemaining % 60).padStart(2, '0')}
                            </div>

                            <button
                                onClick={handleMedicalTimeout}
                                className="px-12 py-6 bg-white text-black rounded-[2rem] font-black italic uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
                            >
                                Reanudar Partido
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                body {
                    background-color: #0a0a0a;
                    overscroll-behavior: none;
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: italic;
                    font-weight: 900;
                    font-display: swap;
                }
            `}</style>
        </div>
    );
}
