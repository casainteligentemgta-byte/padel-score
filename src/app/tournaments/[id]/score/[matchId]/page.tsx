'use client';

import { useState, useEffect, use, useRef } from 'react';
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
import RefereeRemoteControl from '@/components/RefereeRemoteControl';
import { Bluetooth, LayoutDashboard, Search, ListFilter } from 'lucide-react';

export default function RefereeScoreboard({ params }: { params: Promise<{ id: string, matchId: string }> }) {
    const { id, matchId } = use(params);
    const router = useRouter();
    const { user, profile, isAdmin, isMarker, loading: authLoading } = useAuth();
    const [tournament, setTournament] = useState<any>(null);
    const [match, setMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showMatchSelector, setShowMatchSelector] = useState(false);

    const canControl = isAdmin || isMarker || tournament?.ownerId === user?.uid;

    const primaryColor = tournament?.broadcastingSettings?.primaryColor || '#ccff00';
    const [history, setHistory] = useState<any[]>([]);
    const [duration, setDuration] = useState(0);
    const [isGoldenPoint, setIsGoldenPoint] = useState(true);
    const [isMedicalTimeout, setIsMedicalTimeout] = useState(false);
    const [medicalTimeRemaining, setMedicalTimeRemaining] = useState(180); // 3 minutes

    // ── Timer robusto ────────────────────────────────────────────────────────
    // Usamos refs para que el intervalo no se destruya en cada snapshot de Firestore.
    // El reloj corre sin pausa desde startMatch() hasta que el último punto es anotado.
    const timerRef = useRef<any>(null);
    const prevStatusRef = useRef<string>('');

    useEffect(() => {
        if (!match) return;

        const status = match.status as string;

        // Partido FINALIZADO: detener reloj y fijar duración total
        if (status === MatchStatus.FINISHED) {
            if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
            if (match.startedAt && match.finishedAt) {
                const total = Math.floor((new Date(match.finishedAt).getTime() - new Date(match.startedAt).getTime()) / 1000);
                setDuration(total);
            }
            prevStatusRef.current = status;
            return;
        }

        // Partido LIVE: arrancar el reloj solo si no estaba ya corriendo
        if (status === MatchStatus.LIVE) {
            if (!timerRef.current) {
                // Sincronizar desde startedAt por si venimos de una recarga
                if (match.startedAt) {
                    const elapsed = Math.floor((Date.now() - new Date(match.startedAt).getTime()) / 1000);
                    setDuration(elapsed);
                }
                timerRef.current = setInterval(() => {
                    setDuration(prev => prev + 1);
                }, 1000);
            }
            prevStatusRef.current = status;
            return;
        }

        // Cualquier otro estado (PENDING, etc.): detener si estaba corriendo
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        prevStatusRef.current = status;

        return () => {
            if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        };
        // Solo re-ejecutar cuando el status o el startedAt cambian (no en cada snapshot de puntos)
    }, [match?.status, match?.startedAt, match?.finishedAt]);

    const startMatch = async () => {
        if (!tournament || !match) return;
        // Usar match.id (ID real resuelto) — NO matchId (param URL como 'court_2')
        const realId = match.id;
        const updatedMatches = tournament.matches.map((m: any) =>
            m.id === realId ? { ...m, status: MatchStatus.LIVE, startedAt: new Date().toISOString() } : m
        );
        await updateDoc(doc(db, 'tournaments', id), { matches: updatedMatches });
    };

    // Medical Timer logic — reinicia en loop hasta que el árbitro pulse Reanudar
    useEffect(() => {
        if (!isMedicalTimeout) return;

        const interval = setInterval(() => {
            setMedicalTimeRemaining(prev => {
                if (prev <= 1) {
                    // Llegó a 0 → reiniciar automáticamente
                    return 180;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isMedicalTimeout]);

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
                    // Buscar por id exacto primero
                    let foundMatch = tourneyData.matches.find((m: any) => m.id === matchId);

                    // Fallback: si no se encontró por id, buscar por court o courtIndex
                    // (cuando la URL viene como /score/court_1 o /score/1)
                    if (!foundMatch) {
                        const courtNum = matchId.startsWith('court_')
                            ? parseInt(matchId.replace('court_', ''))
                            : parseInt(matchId);
                        if (!isNaN(courtNum)) {
                            foundMatch = tourneyData.matches.find((m: any) =>
                                m.court === courtNum ||
                                m.courtIndex === courtNum - 1 ||
                                m.courtIndex === courtNum
                            ) ?? tourneyData.matches[courtNum - 1] ?? null;
                        }
                    }

                    // Último fallback: primer partido disponible si sólo hay uno
                    if (!foundMatch && tourneyData.matches.length === 1) {
                        foundMatch = tourneyData.matches[0];
                    }
                    if (foundMatch) {
                        // Formato legado: team por índice desde el array teams
                        const legacyTeam1 = foundMatch.team1Index > 0 ? tourneyData.teams?.[foundMatch.team1Index - 1] : null;
                        const legacyTeam2 = foundMatch.team2Index > 0 ? tourneyData.teams?.[foundMatch.team2Index - 1] : null;

                        // Formato nuevo: team embebido directamente en el match (p1Name/p2Name)
                        const embeddedTeam1 = foundMatch.team1 && (foundMatch.team1.p1Name || foundMatch.team1.p1?.name) ? foundMatch.team1 : null;
                        const embeddedTeam2 = foundMatch.team2 && (foundMatch.team2.p1Name || foundMatch.team2.p1?.name) ? foundMatch.team2 : null;

                        /**
                         * Resuelve nombres de jugadores desde cualquier formato:
                         *  - embeddedTeam: objeto del match con p1Name / p2Name (formato nuevo)
                         *  - legacyTeam:   objeto del array teams con p1.name / p2.name (formato legacy)
                         *  - matchItem:    el propio match puede tener team1Name / team2Name como string fallback
                         */
                        const resolveNames = (
                            embeddedTeam: any,
                            legacyTeam: any,
                            idx: number,
                            matchTeamName?: string
                        ) => {
                            // 1. Formato nuevo embebido
                            const p1n =
                                embeddedTeam?.p1Name?.trim() ||
                                embeddedTeam?.p1?.name?.trim() ||
                                legacyTeam?.p1Name?.trim() ||
                                legacyTeam?.p1?.name?.trim() ||
                                '';
                            const p2n =
                                embeddedTeam?.p2Name?.trim() ||
                                embeddedTeam?.p2?.name?.trim() ||
                                legacyTeam?.p2Name?.trim() ||
                                legacyTeam?.p2?.name?.trim() ||
                                '';

                            // 2. Fallback: split del nombre compuesto "Jugador1 / Jugador2"
                            const nameFallback = matchTeamName || embeddedTeam?.name || legacyTeam?.name || '';
                            const parts = nameFallback.split('/').map((s: string) => s.trim());

                            const p1Final = p1n || parts[0] || (idx > 0 ? `Jugador ${(idx * 2) - 1}` : 'Jugador 1');
                            const p2Final = p2n || parts[1] || (idx > 0 ? `Jugador ${idx * 2}` : 'Jugador 2');

                            // Fotos: solo disponibles en formato legacy
                            const p1Photo = embeddedTeam?.p1?.photo || legacyTeam?.p1?.photo || null;
                            const p2Photo = embeddedTeam?.p2?.photo || legacyTeam?.p2?.photo || null;

                            return { p1: p1Final, p2: p2Final, full: `${p1Final} / ${p2Final}`, p1Photo, p2Photo };
                        };

                        const t1 = resolveNames(embeddedTeam1, legacyTeam1, foundMatch.team1Index ?? 0, foundMatch.team1Name);
                        const t2 = resolveNames(embeddedTeam2, legacyTeam2, foundMatch.team2Index ?? 0, foundMatch.team2Name);

                        setMatch({
                            ...foundMatch,
                            court: foundMatch.court || (foundMatch.courtIndex !== undefined ? foundMatch.courtIndex + 1 : undefined),
                            team1: t1,
                            team2: t2,
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
            m.id === match.id ? {
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

        // ── Rotación de sacador (regla pádel) ────────────────────────────
        // Tras cada game, saca SIEMPRE el equipo contrario.
        // Dentro del equipo, los jugadores alternan: P1 la 1ª vez, P2 la 2ª, etc.
        // Se calcula por el total de games jugados hasta ahora (antes de resetear).
        const totalGamesPlayed = (match.games?.t1 || 0) + (match.games?.t2 || 0); // games disputados en el set actual antes de este punto
        const currentServer = match.server || { team: 1, player: 1 };
        const nextTeam = currentServer.team === 1 ? 2 : 1;
        // Cuántas veces le ha tocado servir al nextTeam: cada dos games cambia de equipo,
        // así que el jugador alterna en cada turno de ese equipo.
        // Contamos cuántos turnos de saque ha tenido el nextTeam hasta ahora.
        // Turno global = totalGamesPlayed (0-indexed). Si es par → equipo inicial saca, impar → otro.
        // El jugador dentro del equipo alterna cada turno que le toca a ese equipo.
        const nextTeamServeCount = Math.floor((totalGamesPlayed + 1) / 2); // turnos que le tocan al nextTeam desde inicio
        const nextPlayer: 1 | 2 = (nextTeamServeCount % 2 === 0) ? 1 : 2;
        const nextServer = { team: nextTeam as 1 | 2, player: nextPlayer };
        // ─────────────────────────────────────────────────────────────────

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

    // ── Lógica de selección de sacador ───────────────────────────────────
    // Un estado local para detectar doble-click rápido
    const lastClickRef = { team: 0, player: 0, ts: 0 };
    const DOUBLE_CLICK_MS = 350;

    const setSpecificServer = async (team: number, player: number) => {
        if (!tournament || !match) return;
        const updatedMatches = tournament.matches.map((m: any) =>
            m.id === matchId ? { ...m, server: { team, player } } : m
        );
        await updateDoc(doc(db, 'tournaments', id), { matches: updatedMatches });
    };

    const handlePlayerIconClick = async (team: number, player: number) => {
        const now = Date.now();
        const isSamePlayer = lastClickRef.team === team && lastClickRef.player === player;
        const isDoubleClick = isSamePlayer && (now - lastClickRef.ts) < DOUBLE_CLICK_MS;

        lastClickRef.team = team;
        lastClickRef.player = player;
        lastClickRef.ts = now;

        if (isDoubleClick) {
            // Doble click: revertir (undo del servidor)
            await undoPoint();
        } else {
            // Single click: asignar este jugador como sacador
            await setSpecificServer(team, player);
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

    if (!canControl) {
        return (
            <div className="h-screen bg-[#0a0a0a] flex items-center justify-center p-10">
                <div className="max-w-md w-full bg-[#111] border border-white/10 rounded-[2.5rem] p-10 text-center">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Monitor className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-white">Acceso Restringido</h2>
                    <p className="text-gray-400 text-sm font-medium mb-8">Solo el personal autorizado (ADMIN o MARKER) puede controlar el marcador de este partido.</p>
                    <button
                        onClick={() => router.push(`/tournaments/${id}`)}
                        className="w-full py-4 bg-white text-black rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all"
                    >
                        Volver al Torneo
                    </button>
                </div>
            </div>
        );
    }

    if (!match) return <div className="h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-black italic uppercase">Partido no encontrado</div>;

    const server = match.server || { team: 1, player: 1 };

    return (
        <div className="fixed inset-0 bg-[#0a0a0a] text-white flex flex-col font-sans select-none overflow-hidden touch-none p-3">
            {/* Top Bar */}
            <header className="flex items-center justify-between mb-2 px-1">
                {/* ── Izquierda: Atrás + Reloj/Iniciar + Temperatura ── */}
                <div className="flex items-center gap-6">
                    {/* Botón Atrás */}
                    <button
                        onClick={() => router.push(`/tournaments/${id}`)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                        title="Volver al torneo"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-400" />
                    </button>

                    {/* Reloj + Botón Iniciar */}
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-black italic text-gray-500 tracking-widest uppercase">Duración</span>
                        {match.status === MatchStatus.FINISHED ? (
                            <span className="text-3xl font-black italic text-white/40 tracking-tighter">{formatDuration(duration)}</span>
                        ) : match.status === MatchStatus.LIVE ? (
                            <span className="text-3xl font-black italic text-padel-primary tracking-tighter tabular-nums">{formatDuration(duration)}</span>
                        ) : (
                            /* Estado PENDING: botón de inicio */
                            <button
                                onClick={startMatch}
                                className="flex items-center gap-2 px-4 py-2 bg-padel-primary text-black text-[10px] font-black italic uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_5px_20px_rgba(204,255,0,0.35)]"
                            >
                                <Timer className="w-3.5 h-3.5" />
                                Iniciar Partido
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[10px] font-black italic text-gray-500 tracking-widest uppercase">Temperatura</span>
                        <span className="text-3xl font-black italic text-white tracking-tighter">28°C</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <RefereeRemoteControl
                        onTeamAPoint={() => updateScore('t1', 'plus')}
                        onTeamBPoint={() => updateScore('t2', 'plus')}
                        onUndo={() => undoPoint()}
                    />
                    <button
                        onClick={() => setShowMatchSelector(true)}
                        className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl text-[10px] font-black italic uppercase tracking-widest transition-all active:scale-95 bg-white border border-white/80 text-gray-800 hover:bg-white/90 shadow-md"
                    >
                        {/* Flechas circulares SVG */}
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-5 h-5 flex-shrink-0 text-gray-800"
                        >
                            <path d="M17 2l4 4-4 4" />
                            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                            <path d="M7 22l-4-4 4-4" />
                            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                        </svg>
                        Cambiar Cancha
                    </button>
                    <button
                        onClick={handleMedicalTimeout}
                        className={`flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl text-[10px] font-black italic uppercase tracking-widest transition-all active:scale-95 ${isMedicalTimeout
                            ? 'bg-red-600 border border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                            : 'bg-white border border-white/80 text-red-600 hover:bg-white/90 shadow-md'
                            }`}
                    >
                        {/* Cruz roja / blanca SVG */}
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className={`w-5 h-5 flex-shrink-0 ${isMedicalTimeout ? 'text-white animate-pulse' : 'text-red-600'}`}
                        >
                            <rect x="9" y="2" width="6" height="20" rx="2" />
                            <rect x="2" y="9" width="20" height="6" rx="2" />
                        </svg>
                        {isMedicalTimeout ? 'Reanudar' : 'Asistencia'}
                    </button>
                </div>

                <div className="flex flex-col items-center gap-0.5">
                    {/* Pista — más grande */}
                    <span className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">
                        Pista {match.court ?? '-'}
                    </span>
                    {/* Fase / Ronda — mediano */}
                    {(match.roundName || match.groupName) && (
                        <span className="text-sm font-black italic text-white/70 uppercase tracking-tight leading-none">
                            {match.roundName || match.groupName}
                        </span>
                    )}
                    {/* Categoría — más pequeño */}
                    {tournament?.category && (
                        <span className="text-[10px] font-black italic text-gray-500 uppercase tracking-widest leading-none">
                            {tournament.category.replace(/_/g, ' ')}
                        </span>
                    )}
                </div>
            </header>

            {/* Main Content: Two Teams */}
            <main className="flex-1 flex gap-3 px-1">
                {/* Team 1 Card */}
                <div className="flex-1 bg-[#141414] border border-white/5 rounded-[2rem] p-4 flex flex-col items-center relative overflow-hidden group">

                    <div className="absolute inset-0 bg-gradient-to-br from-padel-primary/5 to-transparent opacity-50" />

                    {/* Players Header */}
                    <div className="flex justify-center gap-5 mb-3 relative z-10">
                        {/* Player 1 */}
                        <div className="flex flex-col items-center gap-4">
                            <div
                                onClick={() => handlePlayerIconClick(1, 1)}
                                className={`relative w-16 h-16 rounded-full border-4 transition-all duration-500 cursor-pointer ${server.team === 1 && server.player === 1 ? 'border-padel-primary scale-110 shadow-[0_0_20px_rgba(204,255,0,0.4)] z-20' : 'border-white/5 opacity-40 hover:opacity-100'}`}
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
                            <span className="block text-sm font-black italic uppercase tracking-tighter text-center">{match.team1.p1}</span>
                        </div>

                        {/* Player 2 */}
                        <div className="flex flex-col items-center gap-4">
                            <div
                                onClick={() => handlePlayerIconClick(1, 2)}
                                className={`relative w-16 h-16 rounded-full border-4 transition-all duration-500 cursor-pointer ${server.team === 1 && server.player === 2 ? 'scale-110 z-20' : 'border-white/5 opacity-40 hover:opacity-100'}`}
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
                            <span className="block text-sm font-black italic uppercase tracking-tighter text-center">{match.team1.p2}</span>
                        </div>
                    </div>


                    {/* Games & Sets — Team 1 */}
                    <div className="relative z-10 flex items-stretch gap-px mx-auto mb-3 rounded-2xl overflow-hidden border border-white/10 w-fit">
                        {/* Games */}
                        <div className="flex flex-col items-center px-6 py-2 bg-white/5">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Games</span>
                            <span className="text-2xl font-black italic leading-none" style={{ color: primaryColor }}>
                                {match.games?.t1 ?? 0}
                            </span>
                        </div>
                        {/* Divider */}
                        <div className="w-px bg-white/10" />
                        {/* Sets */}
                        <div className="flex flex-col items-center px-6 py-2 bg-white/5">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Sets</span>
                            <span className="text-2xl font-black italic leading-none text-white">
                                {match.sets?.t1 ?? 0}
                            </span>
                        </div>
                    </div>

                    {/* Points Interaction */}
                    <div className="flex-1 flex items-center justify-center w-full relative z-10 gap-8">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateScore('t1', 'minus')}
                            className="w-14 h-28 bg-white/5 border border-white/5 rounded-[1.5rem] flex items-center justify-center hover:bg-white/10 transition-all text-gray-500"
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
                                    className="text-[6rem] font-black leading-none tracking-tighter text-white"
                                >
                                    {match.points?.t1 || '0'}
                                </motion.span>
                            </AnimatePresence>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateScore('t1', 'plus')}
                            className="w-14 h-28 bg-padel-primary/10 border border-padel-primary/20 rounded-[1.5rem] flex items-center justify-center hover:bg-padel-primary/20 transition-all text-padel-primary"
                        >
                            <Plus className="w-8 h-8" />
                        </motion.button>
                    </div>
                </div>


                {/* Team 2 Card */}
                <div className="flex-1 bg-[#141414] border border-white/5 rounded-[2.5rem] p-6 flex flex-col items-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-bl from-white/5 to-transparent opacity-50" />



                    {/* Players Header */}
                    <div className="flex justify-center gap-5 mb-3 relative z-10">
                        {/* Player 1 */}
                        <div className="flex flex-col items-center gap-4">
                            <div
                                onClick={() => handlePlayerIconClick(2, 1)}
                                className={`relative w-16 h-16 rounded-full border-4 transition-all duration-500 cursor-pointer ${server.team === 2 && server.player === 1 ? 'scale-110 z-20' : 'border-white/5 opacity-40 hover:opacity-100'}`}
                                style={server.team === 2 && server.player === 1 ? { borderColor: primaryColor, boxShadow: `0 0 40px ${primaryColor}66` } : {}}
                            >
                                <div className="w-full h-full rounded-full overflow-hidden">
                                    <img src={match.team2.p1Photo || `https://ui-avatars.com/api/?name=${match.team2.p1}&background=222&color=fff`} className="w-full h-full object-cover" />
                                </div>
                                {server.team === 2 && server.player === 1 && (
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
                            <span className="block text-sm font-black italic uppercase tracking-tighter text-center">{match.team2.p1}</span>
                        </div>

                        {/* Player 2 */}
                        <div className="flex flex-col items-center gap-4">
                            <div
                                onClick={() => handlePlayerIconClick(2, 2)}
                                className={`relative w-16 h-16 rounded-full border-4 transition-all duration-500 cursor-pointer ${server.team === 2 && server.player === 2 ? 'scale-110 z-20' : 'border-white/5 opacity-40 hover:opacity-100'}`}
                                style={server.team === 2 && server.player === 2 ? { borderColor: primaryColor, boxShadow: `0 0 40px ${primaryColor}66` } : {}}
                            >
                                <div className="w-full h-full rounded-full overflow-hidden">
                                    <img src={match.team2.p2Photo || `https://ui-avatars.com/api/?name=${match.team2.p2}&background=222&color=fff`} className="w-full h-full object-cover" />
                                </div>
                                {server.team === 2 && server.player === 2 && (
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
                            <span className="block text-sm font-black italic uppercase tracking-tighter text-center">{match.team2.p2}</span>
                        </div>
                    </div>


                    {/* Games & Sets — Team 2 */}
                    <div className="relative z-10 flex items-stretch gap-px mx-auto mb-3 rounded-2xl overflow-hidden border border-white/10 w-fit">
                        {/* Games */}
                        <div className="flex flex-col items-center px-6 py-2 bg-white/5">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Games</span>
                            <span className="text-2xl font-black italic leading-none" style={{ color: primaryColor }}>
                                {match.games?.t2 ?? 0}
                            </span>
                        </div>
                        {/* Divider */}
                        <div className="w-px bg-white/10" />
                        {/* Sets */}
                        <div className="flex flex-col items-center px-6 py-2 bg-white/5">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Sets</span>
                            <span className="text-2xl font-black italic leading-none text-white">
                                {match.sets?.t2 ?? 0}
                            </span>
                        </div>
                    </div>

                    {/* Points Interaction */}
                    <div className="flex-1 flex items-center justify-center w-full relative z-10 gap-8">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateScore('t2', 'minus')}
                            className="w-14 h-28 bg-white/5 border border-white/5 rounded-[1.5rem] flex items-center justify-center hover:bg-white/10 transition-all text-gray-500"
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
                                    className="text-[6rem] font-black leading-none tracking-tighter text-white"
                                >
                                    {match.points?.t2 || '0'}
                                </motion.span>
                            </AnimatePresence>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateScore('t2', 'plus')}
                            className="w-14 h-28 bg-padel-primary/10 border border-padel-primary/20 rounded-[1.5rem] flex items-center justify-center hover:bg-padel-primary/20 transition-all text-padel-primary"
                        >
                            <Plus className="w-8 h-8" />
                        </motion.button>
                    </div>
                </div>
            </main>

            {/* Bottom Actions */}
            <footer className="flex items-center justify-center px-4 pb-3 pt-2">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-8 py-3 rounded-[2rem] cursor-pointer hover:bg-white/10 transition-all" onClick={() => setIsGoldenPoint(!isGoldenPoint)}>
                    <div className={`w-3 h-3 rounded-full ${isGoldenPoint ? 'bg-padel-primary shadow-[0_0_10px_#ccff00]' : 'bg-gray-600'}`} />
                    <span className="text-[10px] font-black italic uppercase tracking-widest text-gray-300">Punto de Oro: <span className={isGoldenPoint ? 'text-padel-primary' : 'text-gray-500'}>{isGoldenPoint ? 'ON' : 'OFF'}</span></span>
                </div>
            </footer>

            {/* Overlays */}
            <AnimatePresence>
                {/* Medical Timeout Overlay — Animación cinematográfica */}
                {isMedicalTimeout && (
                    <motion.div
                        key="medical-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.4 } }}
                        className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
                        style={{ background: 'radial-gradient(ellipse at center, #1a0000 0%, #000 70%)' }}
                    >
                        {/* Fondo rojo pulsante */}
                        <motion.div
                            animate={{ opacity: [0.08, 0.18, 0.08] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute inset-0"
                            style={{ background: 'radial-gradient(ellipse at center, #dc2626 0%, transparent 70%)' }}
                        />

                        {/* Radar rings */}
                        {[0, 1, 2, 3].map(i => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full border border-red-600/40"
                                initial={{ width: 80, height: 80, opacity: 0.9 }}
                                animate={{ width: 700, height: 700, opacity: 0 }}
                                transition={{
                                    duration: 3.5,
                                    repeat: Infinity,
                                    delay: i * 0.85,
                                    ease: 'easeOut'
                                }}
                            />
                        ))}

                        {/* Cruz médica central */}
                        <div className="relative flex items-center justify-center z-10 mb-10">
                            {/* Glow */}
                            <motion.div
                                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute w-40 h-40 rounded-full blur-3xl"
                                style={{ backgroundColor: '#dc2626' }}
                            />
                            {/* Cruz SVG */}
                            <motion.svg
                                viewBox="0 0 80 80"
                                className="w-32 h-32 relative z-10"
                                animate={{ scale: [1, 1.06, 1] }}
                                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <rect x="30" y="5" width="20" height="70" rx="5" fill="#dc2626" />
                                <rect x="5" y="30" width="70" height="20" rx="5" fill="#dc2626" />
                                {/* Brillo interior */}
                                <rect x="30" y="5" width="8" height="70" rx="5" fill="white" opacity="0.15" />
                                <rect x="5" y="30" width="70" height="8" rx="5" fill="white" opacity="0.15" />
                            </motion.svg>
                        </div>

                        {/* Texto principal */}
                        <div className="relative z-10 text-center space-y-3 mb-12 px-8">
                            <motion.h2
                                animate={{ opacity: [1, 0.6, 1] }}
                                transition={{ duration: 2.2, repeat: Infinity }}
                                className="text-5xl font-black uppercase tracking-tighter text-white"
                                style={{ textShadow: '0 0 40px rgba(220,38,38,0.8)' }}
                            >
                                Asistencia Médica
                            </motion.h2>
                            <motion.div
                                className="flex items-center justify-center gap-2"
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1.1, repeat: Infinity }}
                            >
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="text-red-400 font-black uppercase tracking-[0.4em] text-xs">
                                    Partido en pausa
                                </span>
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                            </motion.div>
                        </div>

                        {/* Líneas de escaneo */}
                        <motion.div
                            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent z-10"
                            animate={{ top: ['10%', '90%', '10%'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        />

                        {/* Botón Reanudar */}
                        <motion.button
                            onClick={handleMedicalTimeout}
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.04 }}
                            className="relative z-20 px-14 py-5 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.25em] shadow-2xl text-sm"
                            style={{ boxShadow: '0 0 40px rgba(255,255,255,0.2)' }}
                        >
                            ▶ Reanudar Partido
                        </motion.button>

                        {/* Partículas flotantes */}
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 rounded-full bg-red-500/60"
                                style={{
                                    left: `${8 + i * 7.5}%`,
                                    bottom: '-10px',
                                }}
                                animate={{
                                    y: [0, -(300 + (i % 4) * 80)],
                                    opacity: [0, 0.8, 0],
                                    x: [0, (i % 2 === 0 ? 1 : -1) * (10 + i * 3)],
                                }}
                                transition={{
                                    duration: 3.5 + (i % 4) * 0.6,
                                    repeat: Infinity,
                                    delay: i * 0.28,
                                    ease: 'easeOut',
                                }}
                            />
                        ))}
                    </motion.div>
                )}


                {/* Match Selector Overlay */}
                {showMatchSelector && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
                        onClick={() => setShowMatchSelector(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#111] border border-white/10 rounded-[3rem] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Selector de Cancha</h3>
                                    <p className="text-xs font-black italic text-padel-primary uppercase tracking-[0.2em] mt-1">Sincronización en tiempo real</p>
                                </div>
                                <button onClick={() => setShowMatchSelector(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all text-gray-500">
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-4">
                                {tournament?.matches?.filter((m: any) => m.status === MatchStatus.LIVE).map((m: any) => (
                                    <button
                                        key={m.id}
                                        onClick={() => {
                                            router.push(`/tournaments/${id}/score/${m.id}`);
                                            setShowMatchSelector(false);
                                        }}
                                        className={`w-full p-6 rounded-3xl border text-left transition-all ${m.id === matchId ? 'bg-padel-primary/10 border-padel-primary shadow-[0_0_20px_rgba(204,255,0,0.1)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center">
                                                    <span className="text-lg font-black italic">{m.court || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] font-black italic text-gray-500 uppercase tracking-widest">Cancha {m.court}</span>
                                                    <span className="block text-sm font-bold uppercase truncate max-w-[300px]">
                                                        {tournament.teams?.[m.team1Index - 1]?.p1?.name || 'Eq 1'} vs {tournament.teams?.[m.team2Index - 1]?.p1?.name || 'Eq 2'}
                                                    </span>
                                                </div>
                                            </div>
                                            {m.id === matchId && (
                                                <div className="px-3 py-1 bg-padel-primary rounded-full text-[8px] font-black text-black uppercase tracking-widest">Activo</div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                                {tournament?.matches?.filter((m: any) => m.status === MatchStatus.LIVE).length === 0 && (
                                    <div className="text-center py-20 opacity-30 italic font-black uppercase text-sm tracking-widest">No hay partidos en curso</div>
                                )}
                            </div>
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
