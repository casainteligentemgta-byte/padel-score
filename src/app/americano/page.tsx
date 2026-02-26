'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Plus,
    X,
    Users,
    Zap,
    Clock,
    ChevronUp,
    ChevronDown,
    Medal,
    Activity,
    CheckCircle2,
    AlertCircle,
    Swords,
    Crown,
    TrendingUp,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import {
    collection,
    addDoc,
    getDocs,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    doc,
    updateDoc,
    increment,
    writeBatch,
    limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AmericanoPlayer {
    id: string;
    name: string;
    totalPoints: number;
    wins: number;
    losses: number;
    matchesPlayed: number;
    avatar?: string;
}

interface AmericanoMatch {
    id: string;
    playerA1Id: string;
    playerA2Id: string;
    playerB1Id: string;
    playerB2Id: string;
    playerA1Name: string;
    playerA2Name: string;
    playerB1Name: string;
    playerB2Name: string;
    scoreA: number;
    scoreB: number;
    playedAt: any;
    tournamentId?: string;
}

// ─── Mock Data (initial seed if Firestore is empty) ──────────────────────────

const MOCK_PLAYERS: Omit<AmericanoPlayer, 'id'>[] = [
    { name: 'Carlos M.', totalPoints: 0, wins: 0, losses: 0, matchesPlayed: 0 },
    { name: 'Luis R.', totalPoints: 0, wins: 0, losses: 0, matchesPlayed: 0 },
    { name: 'Juan P.', totalPoints: 0, wins: 0, losses: 0, matchesPlayed: 0 },
    { name: 'Pedro S.', totalPoints: 0, wins: 0, losses: 0, matchesPlayed: 0 },
    { name: 'Andrés V.', totalPoints: 0, wins: 0, losses: 0, matchesPlayed: 0 },
    { name: 'Miguel A.', totalPoints: 0, wins: 0, losses: 0, matchesPlayed: 0 },
    { name: 'Roberto F.', totalPoints: 0, wins: 0, losses: 0, matchesPlayed: 0 },
    { name: 'Diego L.', totalPoints: 0, wins: 0, losses: 0, matchesPlayed: 0 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getRankColor(rank: number) {
    if (rank === 1) return 'from-yellow-400 to-amber-500';
    if (rank === 2) return 'from-zinc-300 to-zinc-400';
    if (rank === 3) return 'from-amber-600 to-amber-700';
    return 'from-zinc-700 to-zinc-800';
}

function formatTime(ts: any) {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AmericanoDashboard() {
    const { user } = useAuth();

    const [players, setPlayers] = useState<AmericanoPlayer[]>([]);
    const [matches, setMatches] = useState<AmericanoMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
    const [seeded, setSeeded] = useState(false);

    // Modal state
    const [selectedA1, setSelectedA1] = useState('');
    const [selectedA2, setSelectedA2] = useState('');
    const [selectedB1, setSelectedB1] = useState('');
    const [selectedB2, setSelectedB2] = useState('');
    const [scoreA, setScoreA] = useState<number>(0);
    const [scoreB, setScoreB] = useState<number>(0);
    const [pointsGoal, setPointsGoal] = useState<number>(24);
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState('');

    // New player state
    const [newPlayerName, setNewPlayerName] = useState('');
    const [addingPlayer, setAddingPlayer] = useState(false);

    // ── Seed mock players if collection is empty ──────────────────────────────
    const seedIfEmpty = useCallback(async () => {
        if (seeded) return;
        const snap = await getDocs(collection(db, 'americano_players'));
        if (snap.empty && !seeded) {
            const batch = writeBatch(db);
            MOCK_PLAYERS.forEach(p => {
                const ref = doc(collection(db, 'americano_players'));
                batch.set(ref, { ...p, createdAt: serverTimestamp() });
            });
            await batch.commit();
        }
        setSeeded(true);
    }, [seeded]);

    // ── Realtime listeners ────────────────────────────────────────────────────
    useEffect(() => {
        seedIfEmpty();

        const unsubPlayers = onSnapshot(
            query(collection(db, 'americano_players'), orderBy('totalPoints', 'desc')),
            (snap) => {
                setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() } as AmericanoPlayer)));
                setLoading(false);
            }
        );

        const unsubMatches = onSnapshot(
            query(collection(db, 'americano_matches'), orderBy('playedAt', 'desc'), limit(10)),
            (snap) => {
                setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() } as AmericanoMatch)));
            }
        );

        return () => { unsubPlayers(); unsubMatches(); };
    }, [seedIfEmpty]);

    // ── Add Result ────────────────────────────────────────────────────────────
    const handleAddResult = async () => {
        setModalError('');
        const selected = [selectedA1, selectedA2, selectedB1, selectedB2];

        // Validation
        if (selected.some(s => !s)) {
            setModalError('Debes seleccionar los 4 jugadores.');
            return;
        }
        if (new Set(selected).size !== 4) {
            setModalError('Los 4 jugadores deben ser diferentes.');
            return;
        }
        if (scoreA === scoreB) {
            setModalError('El resultado no puede ser empate. Ingresa un ganador.');
            return;
        }
        if (scoreA > pointsGoal || scoreB > pointsGoal) {
            setModalError(`Los puntos no pueden superar el máximo de ${pointsGoal}.`);
            return;
        }

        setSubmitting(true);
        try {
            const getPlayer = (id: string) => players.find(p => p.id === id)!;
            const pA1 = getPlayer(selectedA1);
            const pA2 = getPlayer(selectedA2);
            const pB1 = getPlayer(selectedB1);
            const pB2 = getPlayer(selectedB2);

            const winnerScore = Math.max(scoreA, scoreB);
            const loserScore = Math.min(scoreA, scoreB);
            const teamAWon = scoreA > scoreB;

            // Write match
            await addDoc(collection(db, 'americano_matches'), {
                playerA1Id: selectedA1,
                playerA2Id: selectedA2,
                playerB1Id: selectedB1,
                playerB2Id: selectedB2,
                playerA1Name: pA1.name,
                playerA2Name: pA2.name,
                playerB1Name: pB1.name,
                playerB2Name: pB2.name,
                scoreA,
                scoreB,
                pointsGoal,
                playedAt: serverTimestamp(),
            });

            // Update player stats in batch
            const batch = writeBatch(db);

            const updatePlayer = (id: string, won: boolean, points: number) => {
                const ref = doc(db, 'americano_players', id);
                batch.update(ref, {
                    totalPoints: increment(points),
                    matchesPlayed: increment(1),
                    wins: won ? increment(1) : increment(0),
                    losses: !won ? increment(1) : increment(0),
                });
            };

            if (teamAWon) {
                updatePlayer(selectedA1, true, winnerScore);
                updatePlayer(selectedA2, true, winnerScore);
                updatePlayer(selectedB1, false, loserScore);
                updatePlayer(selectedB2, false, loserScore);
            } else {
                updatePlayer(selectedA1, false, loserScore);
                updatePlayer(selectedA2, false, loserScore);
                updatePlayer(selectedB1, true, winnerScore);
                updatePlayer(selectedB2, true, winnerScore);
            }

            await batch.commit();

            // Reset modal
            setSelectedA1(''); setSelectedA2(''); setSelectedB1(''); setSelectedB2('');
            setScoreA(0); setScoreB(0); setPointsGoal(24);
            setShowModal(false);
        } catch (e: any) {
            setModalError('Error al guardar: ' + e.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Add Player ────────────────────────────────────────────────────────────
    const handleAddPlayer = async () => {
        if (!newPlayerName.trim()) return;
        setAddingPlayer(true);
        try {
            await addDoc(collection(db, 'americano_players'), {
                name: newPlayerName.trim(),
                totalPoints: 0,
                wins: 0,
                losses: 0,
                matchesPlayed: 0,
                createdAt: serverTimestamp(),
            });
            setNewPlayerName('');
            setShowAddPlayerModal(false);
        } catch (e: any) {
            alert('Error: ' + e.message);
        } finally {
            setAddingPlayer(false);
        }
    };


    // ── Derived stats ─────────────────────────────────────────────────────────
    const leader = players[0];
    const totalMatchesPlayed = matches.length;

    // ── Player selector for modal ─────────────────────────────────────────────
    const usedIds = [selectedA1, selectedA2, selectedB1, selectedB2].filter(Boolean);
    const availableFor = (current: string) =>
        players.filter(p => p.id === current || !usedIds.includes(p.id));

    const PlayerSelect = ({
        value, onChange, label, color
    }: {
        value: string; onChange: (v: string) => void; label: string; color: string;
    }) => (
        <div className="space-y-1">
            <p className={`text-[9px] font-black uppercase tracking-widest ${color}`}>{label}</p>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm font-bold text-white outline-none focus:border-padel-primary transition-colors"
            >
                <option value="">— Seleccionar —</option>
                {availableFor(value).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>
        </div>
    );

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="ipad-screen-container bg-[#0a0a0b] text-white relative">
            <Sidebar />

            {/* Background glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 -left-20 w-[500px] h-[500px] bg-padel-primary/5 blur-[120px] rounded-full" />
                <div className="absolute -bottom-32 -right-20 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="ipad-scroll-area pl-20 lg:pl-24">

                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-padel-primary/10 border border-padel-primary/20 rounded-2xl flex items-center justify-center">
                            <Swords className="w-5 h-5 text-padel-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none">
                                AMERICANO <span className="text-padel-primary">PRO</span>
                            </h1>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                Ranking en tiempo real
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowAddPlayerModal(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-black uppercase tracking-wide transition-all"
                        >
                            <Users className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Jugador</span>
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-padel-primary text-black font-black text-sm uppercase tracking-wide hover:bg-white transition-all shadow-lg shadow-padel-primary/20 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            Añadir Resultado
                        </button>
                    </div>
                </div>

                {/* ── KPI Strip ── */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                        {
                            icon: <Crown className="w-4 h-4 text-yellow-400" />,
                            label: 'Líder',
                            value: leader ? leader.name : '—',
                            sub: leader ? `${leader.totalPoints} pts` : '',
                            color: 'border-yellow-500/20 bg-yellow-500/5',
                        },
                        {
                            icon: <Activity className="w-4 h-4 text-padel-primary" />,
                            label: 'Partidos Jugados',
                            value: totalMatchesPlayed.toString(),
                            sub: 'registrados',
                            color: 'border-padel-primary/20 bg-padel-primary/5',
                        },
                        {
                            icon: <Users className="w-4 h-4 text-blue-400" />,
                            label: 'Jugadores',
                            value: players.length.toString(),
                            sub: 'inscritos',
                            color: 'border-blue-500/20 bg-blue-500/5',
                        },
                    ].map((kpi, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className={`border rounded-2xl p-3 ${kpi.color}`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {kpi.icon}
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{kpi.label}</span>
                            </div>
                            <p className="text-xl font-black text-white leading-none truncate">{kpi.value}</p>
                            {kpi.sub && <p className="text-[9px] text-zinc-600 font-bold mt-0.5">{kpi.sub}</p>}
                        </motion.div>
                    ))}
                </div>

                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                    {/* ── Ranking Table ── */}
                    <div className="lg:col-span-7 bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-padel-primary" />
                                <span className="text-sm font-black uppercase tracking-wider">Ranking General</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-padel-primary/10 border border-padel-primary/20">
                                <Zap className="w-3 h-3 text-padel-primary animate-pulse" />
                                <span className="text-[9px] font-black uppercase text-padel-primary tracking-widest">Live</span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-8 h-8 border-2 border-padel-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-800/50">
                                {/* Header row */}
                                <div className="grid grid-cols-12 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                                    <span className="col-span-1">#</span>
                                    <span className="col-span-5">Jugador</span>
                                    <span className="col-span-2 text-center">PJ</span>
                                    <span className="col-span-2 text-center">V/D</span>
                                    <span className="col-span-2 text-right">Pts</span>
                                </div>

                                <AnimatePresence>
                                    {players.map((player, idx) => (
                                        <motion.div
                                            key={player.id}
                                            layout
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3, delay: idx * 0.03 }}
                                            className={`grid grid-cols-12 items-center px-4 py-3 hover:bg-white/3 transition-colors ${idx === 0 ? 'bg-yellow-500/5' : ''}`}
                                        >
                                            {/* Rank */}
                                            <div className="col-span-1 flex items-center">
                                                {idx < 3 ? (
                                                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${getRankColor(idx + 1)} flex items-center justify-center`}>
                                                        {idx === 0 ? <Crown className="w-3 h-3 text-black" /> : (
                                                            <span className="text-[10px] font-black text-black">{idx + 1}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-black text-zinc-600 w-6 text-center">{idx + 1}</span>
                                                )}
                                            </div>

                                            {/* Player */}
                                            <div className="col-span-5 flex items-center gap-2.5">
                                                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${getRankColor(idx + 1)} flex items-center justify-center text-[10px] font-black text-black flex-shrink-0`}>
                                                    {getInitials(player.name)}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-black leading-none ${idx === 0 ? 'text-yellow-400' : 'text-white'}`}>
                                                        {player.name}
                                                    </p>
                                                    {idx === 0 && (
                                                        <p className="text-[8px] text-yellow-500/70 font-bold uppercase mt-0.5">Líder</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* PJ */}
                                            <div className="col-span-2 text-center">
                                                <span className="text-sm font-bold text-zinc-400">{player.matchesPlayed}</span>
                                            </div>

                                            {/* V/D */}
                                            <div className="col-span-2 text-center flex items-center justify-center gap-1">
                                                <span className="text-xs font-black text-green-400">{player.wins}</span>
                                                <span className="text-[10px] text-zinc-700">/</span>
                                                <span className="text-xs font-black text-red-400">{player.losses}</span>
                                            </div>

                                            {/* Points */}
                                            <div className="col-span-2 text-right">
                                                <span className={`text-base font-black ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-zinc-300' : idx === 2 ? 'text-amber-600' : 'text-white'}`}>
                                                    {player.totalPoints}
                                                </span>
                                                <span className="text-[9px] text-zinc-600 ml-0.5">pts</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {players.length === 0 && !loading && (
                                    <div className="py-12 text-center text-zinc-600 text-sm">
                                        No hay jugadores aún
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Recent Matches Feed ── */}
                    <div className="lg:col-span-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
                        <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2 shrink-0">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-black uppercase tracking-wider">Últimos Resultados</span>
                        </div>

                        <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/50">
                            <AnimatePresence>
                                {matches.slice(0, 5).map((match, idx) => {
                                    const teamAWon = match.scoreA > match.scoreB;
                                    return (
                                        <motion.div
                                            key={match.id}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="p-3 hover:bg-white/3 transition-colors"
                                        >
                                            {/* Time + goal badge */}
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    {formatTime(match.playedAt)}
                                                </p>
                                                {(match as any).pointsGoal && (
                                                    <span className="text-[8px] font-black text-padel-primary/70 bg-padel-primary/10 border border-padel-primary/20 rounded-md px-1.5 py-0.5">
                                                        /{(match as any).pointsGoal} pts
                                                    </span>
                                                )}
                                            </div>

                                            {/* Teams vs Score */}
                                            <div className="flex items-center gap-2">
                                                {/* Team A */}
                                                <div className={`flex-1 text-right ${teamAWon ? '' : 'opacity-50'}`}>
                                                    <p className="text-[10px] font-black text-white leading-tight truncate">{match.playerA1Name}</p>
                                                    <p className="text-[10px] font-black text-zinc-400 leading-tight truncate">{match.playerA2Name}</p>
                                                </div>

                                                {/* Score */}
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <span className={`text-lg font-black leading-none ${teamAWon ? 'text-padel-primary' : 'text-zinc-500'}`}>
                                                        {match.scoreA}
                                                    </span>
                                                    <span className="text-zinc-700 font-black text-sm">—</span>
                                                    <span className={`text-lg font-black leading-none ${!teamAWon ? 'text-padel-primary' : 'text-zinc-500'}`}>
                                                        {match.scoreB}
                                                    </span>
                                                </div>

                                                {/* Team B */}
                                                <div className={`flex-1 ${!teamAWon ? '' : 'opacity-50'}`}>
                                                    <p className="text-[10px] font-black text-white leading-tight truncate">{match.playerB1Name}</p>
                                                    <p className="text-[10px] font-black text-zinc-400 leading-tight truncate">{match.playerB2Name}</p>
                                                </div>
                                            </div>

                                            {/* Winner badge */}
                                            <div className="mt-1.5 flex justify-center">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-padel-primary/70 flex items-center gap-1">
                                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                                    {teamAWon ? `${match.playerA1Name} / ${match.playerA2Name}` : `${match.playerB1Name} / ${match.playerB2Name}`} ganan
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            {matches.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-40 text-zinc-600 gap-2">
                                    <Trophy className="w-8 h-8 opacity-30" />
                                    <p className="text-xs font-bold">Sin partidos aún</p>
                                </div>
                            )}
                        </div>

                        {/* CTA add result */}
                        <div className="p-3 border-t border-zinc-800 shrink-0">
                            <button
                                onClick={() => setShowModal(true)}
                                className="w-full py-2.5 rounded-xl border border-padel-primary/30 text-padel-primary text-xs font-black uppercase tracking-wider hover:bg-padel-primary/10 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Registrar Partido
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pb-20" />
            </div>

            {/* ── Modal: Añadir Resultado ── */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                            className="bg-[#111] border border-zinc-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl shadow-black/60 space-y-4"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Nuevo Partido</p>
                                    <h3 className="text-base font-black italic uppercase tracking-tight text-white">
                                        Registrar <span className="text-padel-primary">Resultado</span>
                                    </h3>
                                </div>
                                <button onClick={() => setShowModal(false)} className="text-zinc-600 hover:text-white p-1 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* ── Puntos del set ── */}
                            <div className="space-y-1.5">
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-padel-primary" /> Puntos del Set
                                </p>
                                <div className="grid grid-cols-5 gap-1.5">
                                    {[8, 12, 16, 20, 24].map(pts => (
                                        <button
                                            key={pts}
                                            onClick={() => {
                                                setPointsGoal(pts);
                                                setScoreA(s => Math.min(s, pts));
                                                setScoreB(s => Math.min(s, pts));
                                            }}
                                            className={`py-2.5 rounded-xl text-sm font-black transition-all ${pointsGoal === pts
                                                    ? 'bg-padel-primary text-black shadow-lg shadow-padel-primary/30 scale-105'
                                                    : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                                }`}
                                        >
                                            {pts}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[8px] text-zinc-600 font-bold text-center">
                                    Máximo: <span className="text-padel-primary">{pointsGoal} pts</span> · El marcador no puede superar este valor
                                </p>
                            </div>

                            {/* Team A */}
                            <div className="space-y-2 p-3 rounded-xl border border-blue-500/20 bg-blue-500/5">
                                <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-1">
                                    <Users className="w-3 h-3" /> Pareja A
                                </p>
                                <PlayerSelect value={selectedA1} onChange={setSelectedA1} label="Jugador A1" color="text-blue-300" />
                                <PlayerSelect value={selectedA2} onChange={setSelectedA2} label="Jugador A2" color="text-blue-300" />
                            </div>

                            {/* Score */}
                            <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Resultado Final</p>
                                <div className="flex items-center gap-3 justify-center">
                                    {/* Team A Score */}
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-[9px] text-blue-400 font-black uppercase">Pareja A</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setScoreA(s => Math.max(0, s - 1))}
                                                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white font-black transition-all active:scale-90"
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                            <span className={`text-3xl font-black w-10 text-center transition-colors ${scoreA === pointsGoal ? 'text-padel-primary' : 'text-white'
                                                }`}>{scoreA}</span>
                                            <button
                                                onClick={() => setScoreA(s => Math.min(pointsGoal, s + 1))}
                                                disabled={scoreA >= pointsGoal}
                                                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white font-black transition-all active:scale-90 disabled:opacity-30"
                                            >
                                                <ChevronUp className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* vs + goal bar */}
                                    <div className="flex flex-col items-center gap-0.5">
                                        <span className="text-xl font-black text-zinc-700">vs</span>
                                        <span className="text-[8px] font-black text-zinc-600 bg-zinc-900 border border-zinc-800 rounded-md px-1.5 py-0.5">
                                            /{pointsGoal}
                                        </span>
                                    </div>

                                    {/* Team B Score */}
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-[9px] text-padel-primary font-black uppercase">Pareja B</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setScoreB(s => Math.max(0, s - 1))}
                                                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white font-black transition-all active:scale-90"
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                            <span className={`text-3xl font-black w-10 text-center transition-colors ${scoreB === pointsGoal ? 'text-padel-primary' : 'text-white'
                                                }`}>{scoreB}</span>
                                            <button
                                                onClick={() => setScoreB(s => Math.min(pointsGoal, s + 1))}
                                                disabled={scoreB >= pointsGoal}
                                                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white font-black transition-all active:scale-90 disabled:opacity-30"
                                            >
                                                <ChevronUp className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Team B */}
                            <div className="space-y-2 p-3 rounded-xl border border-padel-primary/20 bg-padel-primary/5">
                                <p className="text-[9px] font-black uppercase tracking-widest text-padel-primary flex items-center gap-1">
                                    <Users className="w-3 h-3" /> Pareja B
                                </p>
                                <PlayerSelect value={selectedB1} onChange={setSelectedB1} label="Jugador B1" color="text-padel-primary" />
                                <PlayerSelect value={selectedB2} onChange={setSelectedB2} label="Jugador B2" color="text-padel-primary" />
                            </div>

                            {/* Error */}
                            {modalError && (
                                <div className="flex items-center gap-2 text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-xl p-2.5">
                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                    {modalError}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                onClick={handleAddResult}
                                disabled={submitting}
                                className="w-full bg-padel-primary hover:bg-white text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm disabled:opacity-60"
                            >
                                {submitting ? (
                                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        GUARDAR RESULTADO
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Modal: Añadir Jugador ── */}
            <AnimatePresence>
                {showAddPlayerModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowAddPlayerModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                            className="bg-[#111] border border-zinc-800 rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-black italic uppercase tracking-tight">
                                    Nuevo <span className="text-padel-primary">Jugador</span>
                                </h3>
                                <button onClick={() => setShowAddPlayerModal(false)} className="text-zinc-600 hover:text-white p-1">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Nombre completo</label>
                                <input
                                    type="text"
                                    value={newPlayerName}
                                    onChange={e => setNewPlayerName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
                                    placeholder="Ej: Carlos Martínez"
                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm font-bold text-white outline-none focus:border-padel-primary transition-colors placeholder:text-zinc-700"
                                    autoFocus
                                />
                            </div>
                            <button
                                onClick={handleAddPlayer}
                                disabled={addingPlayer || !newPlayerName.trim()}
                                className="w-full bg-padel-primary hover:bg-white text-black font-black py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {addingPlayer
                                    ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    : <><Plus className="w-4 h-4" /> AÑADIR JUGADOR</>
                                }
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
