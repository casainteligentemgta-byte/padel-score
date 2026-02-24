'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, Clock, Activity, Settings, LayoutDashboard,
    Play, CheckCircle2, Monitor, ChevronRight, AlertCircle,
    MonitorPlay, Tv, Megaphone, Radio, Camera, Zap,
    RefreshCw, Circle, Square, ChevronDown, ChevronUp,
    Wifi, WifiOff, Lock, Unlock, ArrowRight, Target
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { MatchStatus, TournamentType } from '@/types/tournament';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ── Types ─────────────────────────────────────────────────────────────────
interface EnrichedMatch {
    id: string;
    status: MatchStatus;
    court?: number | string;
    courtIndex?: number;
    stage?: string;
    groupName?: string;
    scheduledTime?: string;
    team1: { name: string; photo1?: string | null; photo2?: string | null };
    team2: { name: string; photo1?: string | null; photo2?: string | null };
    team1Index: number;
    team2Index: number;
    sets?: { t1: number; t2: number };
    games?: { t1: number; t2: number };
    points?: { t1: any; t2: any };
    server?: { team: 1 | 2; player: 1 | 2 };
    bracketPosition?: { round: number; position: number };
    isStreaming?: boolean;
    [key: string]: any;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const formatTime = (dateStr: any) => {
    if (!dateStr) return '--:--';
    try { return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); }
    catch { return '--:--'; }
};

const stripMatches = (matches: any[]) =>
    matches.map(({ team1, team2, ...rest }) => rest);

const STAGE_ORDER = ['GROUP_STAGE', 'MAIN_DRAW'];
const ROUND_NAMES: Record<number, string> = { 1: '32vos', 2: '16vos', 3: '8vos', 4: '4tos', 5: 'Semis', 6: 'Final' };

function getPhaseLabel(match: EnrichedMatch): string {
    if (match.stage === 'GROUP_STAGE') return 'Fase de Grupo';
    if (match.stage === 'MAIN_DRAW') {
        if (match.bracketPosition) return ROUND_NAMES[match.bracketPosition.round] || `Ronda ${match.bracketPosition.round}`;
        return 'Cuadro Principal';
    }
    return 'Partido';
}

// ── Mini-Dock Component ────────────────────────────────────────────────────
function MiniDock({
    match, tournamentId, onStartMatch, onToggleStream, isUpdating
}: {
    match: EnrichedMatch;
    tournamentId: string;
    onStartMatch: (id: string) => void;
    onToggleStream: (id: string, val: boolean) => void;
    isUpdating: boolean;
}) {
    const isLive = match.status === MatchStatus.LIVE;
    const isFinished = match.status === MatchStatus.FINISHED;
    const isStreaming = !!match.isStreaming;

    return (
        <div className="grid grid-cols-4 gap-px bg-white/[0.04] rounded-b-2xl overflow-hidden border-t border-white/[0.06]">
            {/* CONTROL */}
            <Link
                href={`/tournaments/${tournamentId}/score/${match.id}`}
                onClick={() => !isLive && onStartMatch(match.id)}
                className={`flex flex-col items-center justify-center gap-1 py-3 transition-all active:scale-95
                    ${isLive
                        ? 'bg-padel-primary/10 text-padel-primary hover:bg-padel-primary/20'
                        : 'bg-white/[0.02] text-gray-400 hover:bg-white/[0.06] hover:text-white'
                    }`}
            >
                <div className="relative">
                    <Zap className="w-4 h-4" />
                    {isLive && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_red] animate-pulse" />
                    )}
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest">Control</span>
            </Link>

            {/* PIZARRA */}
            <Link
                href={`/tournaments/${tournamentId}/display/${match.id}`}
                target="_blank"
                className="flex flex-col items-center justify-center gap-1 py-3 bg-white/[0.02] text-gray-400 hover:bg-white/[0.06] hover:text-white transition-all active:scale-95"
            >
                <Monitor className="w-4 h-4" />
                <span className="text-[8px] font-black uppercase tracking-widest">Pizarra</span>
            </Link>

            {/* CÁMARA */}
            <Link
                href={`/tournaments/${tournamentId}/control/broadcasting`}
                className="flex flex-col items-center justify-center gap-1 py-3 bg-white/[0.02] text-gray-400 hover:bg-white/[0.06] hover:text-orange-400 transition-all active:scale-95"
            >
                <Camera className="w-4 h-4" />
                <span className="text-[8px] font-black uppercase tracking-widest">Cámara</span>
            </Link>

            {/* EN VIVO — Toggle streaming */}
            <button
                onClick={() => onToggleStream(match.id, !isStreaming)}
                disabled={isUpdating}
                className={`flex flex-col items-center justify-center gap-1 py-3 transition-all active:scale-95
                    ${isStreaming
                        ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                        : 'bg-white/[0.02] text-gray-500 hover:bg-white/[0.06] hover:text-red-400'
                    }`}
            >
                <div className="relative">
                    <Radio className="w-4 h-4" />
                    {isStreaming && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_red]" />
                    )}
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest">
                    {isStreaming ? 'En Vivo' : 'Stream'}
                </span>
            </button>
        </div>
    );
}

// ── Match Card for Control Panel ───────────────────────────────────────────
function ControlMatchCard({
    match, tournamentId, canOperate, onStartMatch, onFinishMatch, onToggleStream, isUpdating
}: {
    match: EnrichedMatch;
    tournamentId: string;
    canOperate: boolean;
    onStartMatch: (id: string) => void;
    onFinishMatch: (id: string) => void;
    onToggleStream: (id: string, val: boolean) => void;
    isUpdating: boolean;
}) {
    const isLive = match.status === MatchStatus.LIVE;
    const isPending = match.status === MatchStatus.PENDING;
    const isFinished = match.status === MatchStatus.FINISHED;

    const statusColor = isLive
        ? 'border-red-500/40 bg-red-500/[0.03]'
        : isFinished
            ? 'border-white/5 bg-white/[0.01] opacity-60'
            : 'border-white/[0.06] bg-white/[0.02]';

    const toTennis = (p: any) => {
        const v = parseInt(String(p ?? 0));
        return ['0', '15', '30', '40', 'AD'][Math.min(v, 4)] ?? String(v);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className={`rounded-2xl border overflow-hidden ${statusColor} transition-colors`}
        >
            {/* ── Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                    {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_red]" />}
                    {isFinished && <span className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                    {isPending && <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />}
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isLive ? 'text-red-400' : isFinished ? 'text-gray-600' : 'text-gray-500'}`}>
                        {isLive ? '● En Vivo' : isFinished ? 'Finalizado' : formatTime(match.scheduledTime)}
                    </span>
                    <span className="text-[9px] font-bold text-gray-700 uppercase">· Pista {match.court || '–'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    {match.isStreaming && (
                        <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[7px] font-black rounded uppercase tracking-widest border border-red-500/20 animate-pulse">
                            LIVE
                        </span>
                    )}
                    {match.groupName && (
                        <span className="px-1.5 py-0.5 bg-padel-primary/10 text-padel-primary text-[7px] font-black rounded uppercase">
                            G{match.groupName}
                        </span>
                    )}
                    <span className="text-[7px] text-white/20 font-mono">#{match.id.slice(-4)}</span>
                </div>
            </div>

            {/* ── Scoreboard rows */}
            <div className="flex">
                {/* Names column */}
                <div className="flex-1 flex flex-col divide-y divide-white/[0.04]">
                    {/* Team 1 */}
                    <div className={`flex items-center gap-2 px-3 h-10 ${match.server?.team === 1 ? 'bg-white/[0.04]' : ''}`}>
                        {match.server?.team === 1 && (
                            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.9, repeat: Infinity }}
                                className="w-2 h-2 rounded-full bg-padel-primary shadow-[0_0_5px_#ccff00] flex-shrink-0" />
                        )}
                        {match.server?.team !== 1 && <div className="w-2 flex-shrink-0" />}
                        <span className={`text-[10px] font-black italic uppercase tracking-tight truncate ${match.server?.team === 1 ? 'text-white' : 'text-white/55'}`}>
                            {match.team1.name}
                        </span>
                    </div>
                    {/* Team 2 */}
                    <div className={`flex items-center gap-2 px-3 h-10 ${match.server?.team === 2 ? 'bg-white/[0.04]' : ''}`}>
                        {match.server?.team === 2 && (
                            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.9, repeat: Infinity }}
                                className="w-2 h-2 rounded-full bg-padel-primary shadow-[0_0_5px_#ccff00] flex-shrink-0" />
                        )}
                        {match.server?.team !== 2 && <div className="w-2 flex-shrink-0" />}
                        <span className={`text-[10px] font-black italic uppercase tracking-tight truncate ${match.server?.team === 2 ? 'text-white' : 'text-white/55'}`}>
                            {match.team2.name}
                        </span>
                    </div>
                </div>

                {/* Score columns */}
                {isLive || isFinished ? (
                    <div className="flex flex-shrink-0 border-l border-white/[0.04]">
                        {/* G */}
                        <div className="flex flex-col divide-y divide-white/[0.05] bg-black w-10">
                            <div className="h-5 flex items-center justify-center border-b border-white/[0.05]">
                                <span className="text-[7px] font-black text-white/25 uppercase">G</span>
                            </div>
                            <div className="h-10 flex items-center justify-center">
                                <span className="text-sm font-black italic text-white">{toTennis(match.points?.t1)}</span>
                            </div>
                            <div className="h-10 flex items-center justify-center">
                                <span className="text-sm font-black italic text-white">{toTennis(match.points?.t2)}</span>
                            </div>
                        </div>
                        {/* JG */}
                        <div className="flex flex-col divide-y divide-black/10 bg-white w-9 border-l border-white/5">
                            <div className="h-5 flex items-center justify-center border-b border-black/10">
                                <span className="text-[7px] font-black text-black/35 uppercase">JG</span>
                            </div>
                            <div className="h-10 flex items-center justify-center">
                                <span className="text-sm font-black italic text-black">{match.games?.t1 ?? 0}</span>
                            </div>
                            <div className="h-10 flex items-center justify-center">
                                <span className="text-sm font-black italic text-black">{match.games?.t2 ?? 0}</span>
                            </div>
                        </div>
                        {/* ST */}
                        <div className="flex flex-col divide-y divide-black/10 bg-white w-9 border-l border-white/5">
                            <div className="h-5 flex items-center justify-center border-b border-black/10">
                                <span className="text-[7px] font-black text-black/35 uppercase">ST</span>
                            </div>
                            <div className="h-10 flex items-center justify-center">
                                <span className="text-sm font-black italic text-black">{match.sets?.t1 ?? 0}</span>
                            </div>
                            <div className="h-10 flex items-center justify-center">
                                <span className="text-sm font-black italic text-black">{match.sets?.t2 ?? 0}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Pending: show court assignment hint
                    <div className="flex items-center justify-center w-20 flex-shrink-0 border-l border-white/[0.04]">
                        <div className="text-center">
                            <Target className="w-4 h-4 text-gray-700 mx-auto mb-0.5" />
                            <span className="text-[7px] font-bold text-gray-700 uppercase tracking-widest">C{match.court || '–'}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Action row for LIVE */}
            {canOperate && isLive && (
                <div className="flex border-t border-white/[0.04]">
                    <Link
                        href={`/tournaments/${tournamentId}/score/${match.id}`}
                        className="flex-1 py-2 text-center text-[8px] font-black uppercase tracking-widest text-padel-primary hover:bg-padel-primary/10 transition-all"
                    >
                        → Marcador
                    </Link>
                    <button
                        onClick={() => onFinishMatch(match.id)}
                        className="flex-1 py-2 text-center text-[8px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all border-l border-white/[0.04]"
                    >
                        Finalizar
                    </button>
                </div>
            )}

            {/* ── Mini-Dock */}
            {canOperate && !isFinished && (
                <MiniDock
                    match={match}
                    tournamentId={tournamentId}
                    onStartMatch={onStartMatch}
                    onToggleStream={onToggleStream}
                    isUpdating={isUpdating}
                />
            )}
        </motion.div>
    );
}

// ── Phase Section ──────────────────────────────────────────────────────────
function PhaseSection({
    title, matches, tournamentId, canOperate,
    onStartMatch, onFinishMatch, onToggleStream, updatingId, isCollapsible, defaultOpen
}: {
    title: string; matches: EnrichedMatch[]; tournamentId: string;
    canOperate: boolean; onStartMatch: (id: string) => void;
    onFinishMatch: (id: string) => void; onToggleStream: (id: string, val: boolean) => void;
    updatingId: string | null; isCollapsible?: boolean; defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen ?? true);
    if (matches.length === 0) return null;

    return (
        <section className="bg-white/[0.015] border border-white/[0.05] rounded-2xl overflow-hidden">
            <button
                onClick={() => isCollapsible && setOpen(v => !v)}
                className={`w-full flex items-center justify-between px-4 py-3 border-b border-white/[0.05] ${isCollapsible ? 'cursor-pointer hover:bg-white/[0.02]' : 'cursor-default'}`}
            >
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{title}</span>
                    <span className="px-1.5 py-0.5 bg-white/5 text-white/40 text-[8px] font-black rounded">{matches.length}</span>
                </div>
                {isCollapsible && (open ? <ChevronUp className="w-3 h-3 text-white/30" /> : <ChevronDown className="w-3 h-3 text-white/30" />)}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-3 grid grid-cols-1 xl:grid-cols-2 gap-3">
                            <AnimatePresence mode="popLayout">
                                {matches.map(m => (
                                    <ControlMatchCard
                                        key={m.id}
                                        match={m}
                                        tournamentId={tournamentId}
                                        canOperate={canOperate}
                                        onStartMatch={onStartMatch}
                                        onFinishMatch={onFinishMatch}
                                        onToggleStream={onToggleStream}
                                        isUpdating={updatingId === m.id}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ControlPanel({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, isAdmin, isMarker, loading: authLoading } = useAuth();

    const [tournament, setTournament] = useState<any>(null);
    const [matches, setMatches] = useState<EnrichedMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activePhaseTab, setActivePhaseTab] = useState<'activa' | 'proximos' | 'finalizados'>('activa');

    const canOperate = isAdmin || isMarker;

    // Clock
    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    // Firebase realtime
    useEffect(() => {
        if (!id || authLoading) return;
        const unsub = onSnapshot(doc(db, 'tournaments', id), snap => {
            if (snap.exists()) {
                const data = { id: snap.id, ...snap.data() } as any;
                setTournament(data);

                const enriched: EnrichedMatch[] = (data.matches || []).map((m: any) => {
                    const t1 = m.team1Index > 0 ? data.teams?.[m.team1Index - 1] : null;
                    const t2 = m.team2Index > 0 ? data.teams?.[m.team2Index - 1] : null;
                    const pname = (p: any, idx: number, slot: 1 | 2) => {
                        if (idx <= 0) return 'Por definir';
                        return p?.name?.trim() || `Jugador ${slot}`;
                    };
                    return {
                        ...m,
                        court: m.court || (m.courtIndex !== undefined ? m.courtIndex + 1 : undefined),
                        team1: {
                            name: t1 ? `${pname(t1.p1, m.team1Index, 1)} · ${pname(t1.p2, m.team1Index, 2)}` : `Equipo ${m.team1Index}`,
                            photo1: t1?.p1?.photo || null, photo2: t1?.p2?.photo || null
                        },
                        team2: {
                            name: t2 ? `${pname(t2.p1, m.team2Index, 1)} · ${pname(t2.p2, m.team2Index, 2)}` : `Equipo ${m.team2Index}`,
                            photo1: t2?.p1?.photo || null, photo2: t2?.p2?.photo || null
                        },
                    };
                });
                setMatches(enriched);
            }
            setLoading(false);
        });
        return () => unsub();
    }, [id, authLoading]);

    // ── Actions ──────────────────────────────────────────────────────────
    const startMatch = async (matchId: string) => {
        setUpdatingId(matchId);
        try {
            const updated = matches.map(m => m.id === matchId
                ? { ...m, status: MatchStatus.LIVE, actualStartTime: new Date().toISOString(), sets: { t1: 0, t2: 0 }, games: { t1: 0, t2: 0 }, points: { t1: 0, t2: 0 }, server: { team: 1 as 1, player: 1 as 1 } }
                : m
            );
            await updateDoc(doc(db, 'tournaments', id), { matches: stripMatches(updated), updatedAt: new Date() });
        } catch (e) { console.error(e); }
        finally { setUpdatingId(null); }
    };

    const finishMatch = async (matchId: string) => {
        setUpdatingId(matchId);
        try {
            const updated = matches.map(m => m.id === matchId
                ? { ...m, status: MatchStatus.FINISHED, actualEndTime: new Date().toISOString() }
                : m
            );
            await updateDoc(doc(db, 'tournaments', id), { matches: stripMatches(updated), updatedAt: new Date() });
        } catch (e) { console.error(e); }
        finally { setUpdatingId(null); }
    };

    const toggleStream = async (matchId: string, val: boolean) => {
        setUpdatingId(matchId);
        try {
            const updated = matches.map(m => m.id === matchId ? { ...m, isStreaming: val } : m);
            await updateDoc(doc(db, 'tournaments', id), { matches: stripMatches(updated), updatedAt: new Date() });
        } catch (e) { console.error(e); }
        finally { setUpdatingId(null); }
    };

    // ── Phase Detection ──────────────────────────────────────────────────
    // 1. Find which is the "active" phase: the one that has LIVE or PENDING matches
    //    with the earliest stage order.
    const liveMatches = matches.filter(m => m.status === MatchStatus.LIVE);
    const finishedMatches = matches.filter(m => m.status === MatchStatus.FINISHED);
    const pendingMatches = matches.filter(m => m.status === MatchStatus.PENDING);

    // Determine current active phase key
    const activePhaseKey: string = (() => {
        // Priority: there are live matches → their stage is active
        if (liveMatches.length > 0) return liveMatches[0].stage || 'OPEN';
        // Otherwise: the first pending stage
        if (pendingMatches.length > 0) {
            const grouped = pendingMatches.reduce<Record<string, EnrichedMatch[]>>((acc, m) => {
                const key = m.stage || 'OPEN';
                acc[key] = [...(acc[key] || []), m];
                return acc;
            }, {});
            // Prefer GROUP_STAGE first, then MAIN_DRAW, else first found
            if (grouped['GROUP_STAGE']) return 'GROUP_STAGE';
            if (grouped['MAIN_DRAW']) return 'MAIN_DRAW';
            return Object.keys(grouped)[0];
        }
        return 'FINISHED';
    })();

    // Active phase matches (live + pending of that stage)
    const activePhaseMatches = matches.filter(m =>
        (m.stage || 'OPEN') === activePhaseKey &&
        (m.status === MatchStatus.LIVE || m.status === MatchStatus.PENDING)
    );

    // "Próximos" = pending matches from all OTHER future stages
    const proximosMatches = matches.filter(m =>
        m.status === MatchStatus.PENDING &&
        (m.stage || 'OPEN') !== activePhaseKey
    );

    // Stats
    const totalCount = matches.length;
    const completedCount = finishedMatches.length;
    const liveCount = liveMatches.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    // ── Loading / Auth guard
    if (loading) return (
        <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
            <MonitorPlay className="w-10 h-10 text-padel-primary animate-pulse" />
            <p className="text-padel-primary font-black italic uppercase tracking-widest text-[10px]">Iniciando Sistema de Control...</p>
        </div>
    );

    if (!canOperate) return (
        <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 text-center p-6">
            <Lock className="w-12 h-12 text-red-500/40" />
            <h1 className="text-xl font-black italic uppercase">Acceso Restringido</h1>
            <p className="text-gray-500 text-sm max-w-xs">Este panel es exclusivo para Administradores y Markers del torneo.</p>
            <button onClick={() => router.back()} className="mt-4 px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                Volver
            </button>
        </div>
    );

    const phaseTabs = [
        { key: 'activa', label: 'Fase Activa', count: activePhaseMatches.length, dot: 'bg-padel-primary' },
        { key: 'proximos', label: 'Próximos', count: proximosMatches.length, dot: 'bg-gray-600' },
        { key: 'finalizados', label: 'Finalizados', count: completedCount, dot: 'bg-white/20' },
    ] as const;

    return (
        <div className="h-screen bg-[#050505] text-white flex overflow-hidden font-outfit">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden pl-20 md:pl-24">

                {/* ── TOP HEADER ────────────────────────────────────────── */}
                <header className="flex-shrink-0 flex items-center justify-between px-4 lg:px-6 py-3 border-b border-white/[0.04] bg-white/[0.01]">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-padel-primary/10 rounded-xl border border-padel-primary/20">
                            <LayoutDashboard className="w-5 h-5 text-padel-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-black italic uppercase tracking-tighter leading-none">{tournament?.name || 'Control'}</h1>
                                <span className="px-1.5 py-0.5 bg-padel-primary/10 text-padel-primary text-[7px] font-black rounded uppercase tracking-widest border border-padel-primary/20">
                                    {isAdmin ? 'Admin' : 'Marker'}
                                </span>
                            </div>
                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.15em] mt-0.5">
                                {tournament?.category} · {tournament?.complexName || 'Pista Central'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Live counter */}
                        {liveCount > 0 && (
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_red]" />
                                <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">{liveCount} en vivo</span>
                            </div>
                        )}
                        {/* Progress */}
                        <div className="hidden lg:block text-right">
                            <p className="text-[7px] font-black text-gray-700 uppercase tracking-widest mb-1">Progreso</p>
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div animate={{ width: `${progress}%` }} className="h-full bg-padel-primary" />
                                </div>
                                <span className="text-[9px] font-black italic text-padel-primary">{completedCount}/{totalCount}</span>
                            </div>
                        </div>
                        {/* Clock */}
                        <div className="hidden md:block">
                            <p className="text-[7px] font-black text-gray-700 uppercase tracking-widest mb-0.5">Hora</p>
                            <p className="text-sm font-black italic leading-none">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</p>
                        </div>
                        {/* Quick links */}
                        <Link href={`/tournaments/${id}/control/ads`}
                            className="w-10 h-10 flex items-center justify-center bg-padel-primary/10 border border-padel-primary/20 rounded-xl hover:bg-padel-primary/20 transition-all text-padel-primary"
                            title="Publicidad">
                            <Megaphone className="w-4 h-4" />
                        </Link>
                        <Link href={`/tournaments/${id}/control/broadcasting`}
                            className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all text-gray-400"
                            title="Broadcasting">
                            <Tv className="w-4 h-4" />
                        </Link>
                        <Link href={`/tournaments/${id}`}
                            className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all text-gray-400"
                            title="Dashboard público">
                            <Monitor className="w-4 h-4" />
                        </Link>
                    </div>
                </header>

                {/* ── PHASE TABS ────────────────────────────────────────── */}
                <div className="flex-shrink-0 flex items-center gap-1 px-4 lg:px-6 pt-3 pb-2 border-b border-white/[0.04]">
                    {phaseTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActivePhaseTab(tab.key)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all
                                ${activePhaseTab === tab.key
                                    ? 'bg-white/[0.08] text-white border border-white/10'
                                    : 'text-gray-600 hover:text-gray-400 hover:bg-white/[0.03]'
                                }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`} />
                            {tab.label}
                            <span className={`px-1 rounded text-[7px] ${activePhaseTab === tab.key ? 'bg-white/10 text-white/60' : 'bg-white/5 text-white/20'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}

                    {/* Phase label */}
                    <div className="ml-auto">
                        <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">
                            {activePhaseKey === 'GROUP_STAGE' ? '⬡ Fase de Grupo' :
                                activePhaseKey === 'MAIN_DRAW' ? '⌬ Cuadro Principal' :
                                    activePhaseKey === 'FINISHED' ? '✓ Torneo Finalizado' : '● Fase Activa'}
                        </span>
                    </div>
                </div>

                {/* ── MAIN CONTENT ──────────────────────────────────────── */}
                <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 lg:px-6 py-4 space-y-4">

                    <AnimatePresence mode="wait">
                        {/* FASE ACTIVA */}
                        {activePhaseTab === 'activa' && (
                            <motion.div key="activa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">

                                {/* EN VIVO */}
                                {liveMatches.length > 0 && (
                                    <PhaseSection
                                        title="🔴 En Vivo"
                                        matches={liveMatches}
                                        tournamentId={id}
                                        canOperate={canOperate}
                                        onStartMatch={startMatch}
                                        onFinishMatch={finishMatch}
                                        onToggleStream={toggleStream}
                                        updatingId={updatingId}
                                        defaultOpen={true}
                                    />
                                )}

                                {/* PENDIENTES DE LA FASE ACTIVA */}
                                <PhaseSection
                                    title={`▷ Por Jugar — ${activePhaseKey === 'GROUP_STAGE' ? 'Fase de Grupo' : activePhaseKey === 'MAIN_DRAW' ? 'Cuadro' : 'Próximos'}`}
                                    matches={activePhaseMatches.filter(m => m.status === MatchStatus.PENDING)}
                                    tournamentId={id}
                                    canOperate={canOperate}
                                    onStartMatch={startMatch}
                                    onFinishMatch={finishMatch}
                                    onToggleStream={toggleStream}
                                    updatingId={updatingId}
                                    defaultOpen={true}
                                />

                                {activePhaseMatches.length === 0 && liveMatches.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-30">
                                        <Activity className="w-10 h-10" />
                                        <p className="text-xs font-black italic uppercase tracking-widest">No hay partidos en la fase activa</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* PRÓXIMOS */}
                        {activePhaseTab === 'proximos' && (
                            <motion.div key="proximos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                                {proximosMatches.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-30">
                                        <Clock className="w-10 h-10" />
                                        <p className="text-xs font-black italic uppercase tracking-widest">No hay fases futuras pendientes</p>
                                    </div>
                                ) : (
                                    <PhaseSection
                                        title="Fases Futuras / Próximos Juegos"
                                        matches={proximosMatches}
                                        tournamentId={id}
                                        canOperate={canOperate}
                                        onStartMatch={startMatch}
                                        onFinishMatch={finishMatch}
                                        onToggleStream={toggleStream}
                                        updatingId={updatingId}
                                        isCollapsible={true}
                                        defaultOpen={true}
                                    />
                                )}
                            </motion.div>
                        )}

                        {/* FINALIZADOS */}
                        {activePhaseTab === 'finalizados' && (
                            <motion.div key="finalizados" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                                {finishedMatches.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-30">
                                        <CheckCircle2 className="w-10 h-10" />
                                        <p className="text-xs font-black italic uppercase tracking-widest">Aún no hay partidos finalizados</p>
                                    </div>
                                ) : (
                                    <PhaseSection
                                        title="✓ Finalizados"
                                        matches={finishedMatches}
                                        tournamentId={id}
                                        canOperate={false} // read-only for finished
                                        onStartMatch={startMatch}
                                        onFinishMatch={finishMatch}
                                        onToggleStream={toggleStream}
                                        updatingId={updatingId}
                                        isCollapsible={true}
                                        defaultOpen={true}
                                    />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                {/* ── STATUS BAR ───────────────────────────────────────── */}
                <footer className="flex-shrink-0 h-9 flex items-center justify-between px-4 lg:px-6 border-t border-white/[0.04] bg-black/20">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <Wifi className="w-3 h-3 text-green-500" />
                            <span className="text-[7px] font-black uppercase text-gray-700 tracking-widest">Firebase Sync</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Activity className="w-3 h-3 text-gray-700" />
                            <span className="text-[7px] font-black uppercase text-gray-700 tracking-widest">{liveCount} activos · {completedCount} finalizados · {pendingMatches.length} pendientes</span>
                        </div>
                    </div>
                    <span className="text-[7px] font-black tracking-[0.25em] uppercase text-gray-800 italic">
                        PADEL SMART Pro · 2025
                    </span>
                </footer>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
