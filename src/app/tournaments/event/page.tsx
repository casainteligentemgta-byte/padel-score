'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { MatchStatus } from '@/types/tournament';
import {
    Calendar, Clock, RefreshCw, Trophy, ArrowLeft,
    Gamepad2, Monitor, Camera,
    Tv, Flag
} from 'lucide-react';
import Link from 'next/link';

// ── Helpers ────────────────────────────────────────────────────────────────
const toMs = (v: any): number => {
    if (!v) return 0;
    if (v?.toDate) return v.toDate().getTime();
    if (typeof v === 'string') return new Date(v).getTime();
    return new Date(v).getTime();
};

const formatHHMM = (v: any) => {
    if (!v) return 'TBD';
    const d = v?.toDate ? v.toDate() : new Date(v);
    if (isNaN(d.getTime())) return 'TBD';
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
};

/**
 * Resuelve los nombres de jugadores de un equipo.
 * Soporta:
 *  - Equipo TBD/knockout  → teamLabel ("1° Grupo A", "Ganador SF1")
 *  - Equipo con p1Name/p2Name en el objeto team
 *  - Equipo con p1.name/p2.name
 *  - Equipo con name = "Jugador1 / Jugador2"
 *  - Ninguno              → '?'
 */
const resolveTeamNames = (team: any, teamName?: string): [string, string] => {
    if (!team) return [teamName || '?', ''];
    // TBD / knockout
    if (team.isTBD || team.teamLabel) {
        return [team.teamLabel || team.p1?.name || teamName || '?', ''];
    }
    const p1 = (team.p1Name || team.p1?.name || '').trim();
    const p2 = (team.p2Name || team.p2?.name || '').trim();
    if (p1 || p2) return [p1 || '?', p2];
    // Fallback: split del name
    if (team.name) {
        const parts = team.name.split('/');
        return [(parts[0] || '?').trim(), (parts[1] || '').trim()];
    }
    if (teamName) {
        const parts = teamName.split('/');
        return [(parts[0] || '?').trim(), (parts[1] || '').trim()];
    }
    return ['?', ''];
};


const STATUS_COLORS: Record<string, string> = {
    [MatchStatus.LIVE]: 'bg-red-500/10 border-red-500/40 text-red-400',
    [MatchStatus.FINISHED]: 'bg-white/5 border-white/10 text-gray-500',
    [MatchStatus.PENDING]: 'bg-white/[0.04] border-white/[0.1] text-white',
};

const CAT_COLORS: Record<string, string> = {
    MALE: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    FEMALE: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
    MIXED: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
};

// ── Status filter tabs ──────────────────────────────────────────────────────
const TABS = [
    { label: 'Todos', value: 'all' },
    { label: 'Por Comenzar', value: MatchStatus.PENDING },
    { label: 'En Vivo', value: MatchStatus.LIVE },
    { label: 'Finalizados', value: MatchStatus.FINISHED },
] as const;

// ── "Por Comenzar" action card (top 3 only) ────────────────────────────────
function NextMatchCard({ match, rank }: { match: any; rank: number }) {
    const [t1p1, t1p2] = resolveTeamNames(match.team1, match.team1Name);
    const [t2p1, t2p2] = resolveTeamNames(match.team2, match.team2Name);

    const rankColors = ['text-[#ccff00]', 'text-white/80', 'text-white/50'];
    const rankBg = ['bg-[#ccff00]/10 border-[#ccff00]/30', 'bg-white/5 border-white/15', 'bg-white/[0.03] border-white/10'];
    const rankLabel = ['1° Siguiente', '2° Salida', '3° Espera'];

    // URL de control: navega al marcador directamente
    // Si no hay id, usa court_N como fallback (el score page lo resuelve)
    const matchKey = match.id || (match.court ? `court_${match.court}` : (match.courtIndex != null ? `court_${match.courtIndex + 1}` : 'court_1'));
    const controlHref = `/tournaments/${match._tournamentId}/score/${matchKey}`;
    const pizarraHref = match.id
        ? `/tournaments/${match._tournamentId}/display/${match.id}`
        : `/tournaments/${match._tournamentId}/control`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: rank * 0.07 }}
            className={`rounded-[1.75rem] border overflow-hidden ${rankBg[rank]}`}
        >
            {/* ── Header row */}
            <div className="px-4 pt-3 pb-2.5 flex items-center justify-between gap-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${rankColors[rank]}`}>
                        {rankLabel[rank]}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#ccff00]/40`} />
                    <span className="text-[10px] font-black text-gray-500 italic">
                        Pista {match.court ?? '-'} · {formatHHMM(match.scheduledTime)}
                    </span>
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${CAT_COLORS[match._gender] ?? 'bg-white/5 border-white/10 text-gray-500'}`}>
                    {(match._category ?? '').replace(/_/g, ' ')}
                </span>
            </div>

            {/* ── Players */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-4">
                <div className="text-right space-y-0.5">
                    <p className="text-[13px] font-black uppercase tracking-tight leading-tight">{t1p1}</p>
                    {t1p2 && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{t1p2}</p>}
                </div>
                <span className="text-[11px] font-black text-gray-600 uppercase italic tracking-widest px-2">vs</span>
                <div className="text-left space-y-0.5">
                    <p className="text-[13px] font-black uppercase tracking-tight leading-tight">{t2p1}</p>
                    {t2p2 && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{t2p2}</p>}
                </div>
            </div>

            {/* ── Action dock: 4 botones */}
            <div className="grid grid-cols-4 gap-px bg-white/[0.04] border-t border-white/[0.06]">
                {/* CONTROL */}
                <Link
                    href={controlHref}
                    className={`flex flex-col items-center justify-center gap-1.5 py-3.5 transition-all active:scale-95
                        ${rank === 0
                            ? 'bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20'
                            : 'bg-white/[0.02] text-gray-400 hover:bg-white/[0.06] hover:text-[#ccff00]'
                        }`}
                >
                    <div className="relative">
                        <Gamepad2 className="w-4 h-4" />
                        {rank === 0 && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ccff00] shadow-[0_0_6px_#ccff00] animate-pulse" />
                        )}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest">Control</span>
                </Link>

                {/* PIZARRA */}
                <Link
                    href={pizarraHref}
                    target="_blank"
                    className="flex flex-col items-center justify-center gap-1.5 py-3.5 bg-white/[0.02] text-gray-400 hover:bg-white/[0.06] hover:text-white transition-all active:scale-95"
                >
                    <Monitor className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Pizarra</span>
                </Link>

                {/* CÁMARAS */}
                <Link
                    href={`/tournaments/${match._tournamentId}/control/broadcasting`}
                    target="_blank"
                    className="flex flex-col items-center justify-center gap-1.5 py-3.5 bg-white/[0.02] text-gray-400 hover:bg-white/[0.06] hover:text-orange-400 transition-all active:scale-95"
                >
                    <Camera className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Cámaras</span>
                </Link>

                {/* PUBLICIDAD */}
                <Link
                    href={`/tournaments/${match._tournamentId}/control/broadcasting`}
                    target="_blank"
                    className="flex flex-col items-center justify-center gap-1.5 py-3.5 bg-white/[0.02] text-gray-400 hover:bg-white/[0.06] hover:text-yellow-400 transition-all active:scale-95"
                >
                    <Tv className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Publicidad</span>
                </Link>
            </div>
        </motion.div>
    );
}

// ── Standard match card (for all other tabs/views) ─────────────────────
function MatchCard({ match, idx }: { match: any; idx: number }) {
    const isLive = match.status === MatchStatus.LIVE;
    const isDone = match.status === MatchStatus.FINISHED;
    const isPending = match.status === MatchStatus.PENDING;
    const [t1p1, t1p2] = resolveTeamNames(match.team1, match.team1Name);
    const [t2p1, t2p2] = resolveTeamNames(match.team2, match.team2Name);
    const [ending, setEnding] = useState(false);

    // URL segura: va al marcador del partido
    // Fallback: court_N si no tiene id propio (el score page lo resuelve)
    const matchKey = match.id || (match.court ? `court_${match.court}` : (match.courtIndex != null ? `court_${match.courtIndex + 1}` : 'court_1'));
    const controlHref = `/tournaments/${match._tournamentId}/score/${matchKey}`;
    const pizarraHref = match.id
        ? `/tournaments/${match._tournamentId}/display/${match.id}`
        : `/tournaments/${match._tournamentId}/control`;

    const endMatch = async () => {
        if (!match.id || !match._tournamentId) return;
        if (!confirm('¿Terminar este partido ahora?')) return;
        setEnding(true);
        try {
            await updateDoc(
                doc(db, 'tournaments', match._tournamentId, 'matches', match.id),
                { status: MatchStatus.FINISHED }
            );
        } catch (e) {
            console.error('[endMatch]', e);
        } finally {
            setEnding(false);
        }
    };

    return (
        <motion.div
            key={match.id ?? idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
            className={`rounded-[1.5rem] border overflow-hidden transition-all ${STATUS_COLORS[match.status] ?? STATUS_COLORS[MatchStatus.PENDING]}`}
        >
            {/* Card header */}
            <div className="px-4 pt-2.5 pb-2 border-b border-white/[0.07] bg-white/[0.04] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isLive ? 'bg-red-500 animate-pulse' : isDone ? 'bg-white/20' : 'bg-[#ccff00]/40'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest italic truncate ${isLive ? 'text-red-400' : 'text-gray-500'}`}>
                        Pista {match.court ?? '-'}
                        <span className="text-gray-600 font-bold"> · {formatHHMM(match.scheduledTime)}</span>
                    </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${CAT_COLORS[match._gender] ?? 'bg-white/5 border-white/10 text-gray-500'}`}>
                        {(match._category ?? '').replace(/_/g, ' ')}
                    </span>
                    {isLive && <span className="text-[9px] font-black text-red-400 uppercase italic tracking-widest animate-pulse">● En Vivo</span>}
                    {isDone && <span className="text-[9px] font-black text-white/30 uppercase italic tracking-widest">Fin</span>}
                </div>
            </div>

            {/* Score area */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3">
                <div className="text-right space-y-0.5">
                    <p className="text-[12px] font-black uppercase tracking-tight leading-tight">{t1p1}</p>
                    {t1p2 && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{t1p2}</p>}
                </div>
                <div className="flex items-center gap-1.5">
                    {isLive || isDone ? (
                        <>
                            <span className={`text-2xl font-black tabular-nums ${isLive ? 'text-[#ccff00]' : 'text-white'}`}>{match.score1 ?? 0}</span>
                            <span className="text-gray-700 font-black text-lg">-</span>
                            <span className={`text-2xl font-black tabular-nums ${isLive ? 'text-[#ccff00]' : 'text-white'}`}>{match.score2 ?? 0}</span>
                        </>
                    ) : (
                        <span className="text-[10px] font-black text-gray-600 uppercase italic tracking-widest">vs</span>
                    )}
                </div>
                <div className="text-left space-y-0.5">
                    <p className="text-[12px] font-black uppercase tracking-tight leading-tight">{t2p1}</p>
                    {t2p2 && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{t2p2}</p>}
                </div>
            </div>

            {/* Dock de acciones para partidos EN VIVO o PENDIENTES */}
            {(isLive || isPending) && (
                <div className={`grid gap-px bg-white/[0.04] border-t border-white/[0.06] ${isLive ? 'grid-cols-5' : 'grid-cols-4'}`}>
                    {/* CONTROL */}
                    <Link
                        href={controlHref}
                        className={`flex flex-col items-center justify-center gap-1.5 py-3 transition-all active:scale-95
                            ${isLive
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                : 'bg-white/[0.02] text-gray-400 hover:bg-white/[0.06] hover:text-[#ccff00]'
                            }`}
                    >
                        <div className="relative">
                            <Gamepad2 className="w-4 h-4" />
                            {isLive && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_red] animate-pulse" />
                            )}
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest">Control</span>
                    </Link>

                    {/* PIZARRA */}
                    <Link
                        href={pizarraHref}
                        target="_blank"
                        className="flex flex-col items-center justify-center gap-1.5 py-3 bg-white/[0.02] text-gray-400 hover:bg-white/[0.06] hover:text-white transition-all active:scale-95"
                    >
                        <Monitor className="w-4 h-4" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Pizarra</span>
                    </Link>

                    {/* CÁMARAS */}
                    <Link
                        href={`/tournaments/${match._tournamentId}/control/broadcasting`}
                        target="_blank"
                        className="flex flex-col items-center justify-center gap-1.5 py-3 bg-white/[0.02] text-gray-400 hover:bg-white/[0.06] hover:text-orange-400 transition-all active:scale-95"
                    >
                        <Camera className="w-4 h-4" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Cámaras</span>
                    </Link>

                    {/* PUBLICIDAD */}
                    <Link
                        href={`/tournaments/${match._tournamentId}/control/broadcasting`}
                        target="_blank"
                        className="flex flex-col items-center justify-center gap-1.5 py-3 bg-white/[0.02] text-gray-400 hover:bg-white/[0.06] hover:text-yellow-400 transition-all active:scale-95"
                    >
                        <Tv className="w-4 h-4" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Publicidad</span>
                    </Link>

                    {/* TERMINAR — solo en vivo */}
                    {isLive && (
                        <button
                            onClick={endMatch}
                            disabled={ending}
                            className="flex flex-col items-center justify-center gap-1.5 py-3 bg-red-900/20 text-red-500 hover:bg-red-600/30 hover:text-red-300 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <Flag className="w-4 h-4" />
                            <span className="text-[8px] font-black uppercase tracking-widest">
                                {ending ? '...' : 'Terminar'}
                            </span>
                        </button>
                    )}
                </div>
            )}

            {/* Footer link — solo en finalizados */}
            {isDone && (
                <Link href={`/tournaments/${match._tournamentId}`}
                    className="block px-4 py-1.5 border-t border-white/[0.05] text-[9px] font-bold uppercase tracking-widest text-gray-600 hover:text-[#ccff00] transition-colors text-center">
                    Ver categoría →
                </Link>
            )}
        </motion.div>
    );
}

// ── Main component (wrapped in Suspense below) ──────────────────────────────
function EventView() {
    const searchParams = useSearchParams();
    const idsParam = searchParams.get('ids') ?? '';
    const tournamentIds = idsParam ? idsParam.split(',').filter(Boolean) : [];

    const [tournaments, setTournaments] = useState<Record<string, any>>({});
    const [allMatches, setAllMatches] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    // Subscribe to all tournaments in parallel via onSnapshot
    useEffect(() => {
        if (tournamentIds.length === 0) { setLoading(false); return; }

        const loaded: Record<string, boolean> = {};
        const unsubs: (() => void)[] = [];

        tournamentIds.forEach(tid => {
            loaded[tid] = false;
            const ref = doc(db, 'tournaments', tid);
            const unsub = onSnapshot(ref, snap => {
                loaded[tid] = true;
                setTournaments(prev => {
                    const next = { ...prev };
                    if (snap.exists()) {
                        next[tid] = { id: tid, ...snap.data() };
                    } else {
                        delete next[tid];
                    }
                    return next;
                });
                if (Object.values(loaded).every(Boolean)) setLoading(false);
            });
            unsubs.push(unsub);
        });

        return () => unsubs.forEach(u => u());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idsParam]);

    // Flatten + enrich all matches
    useEffect(() => {
        const flat: any[] = [];
        Object.values(tournaments).forEach((t: any) => {
            if (!t.matches) return;
            t.matches.forEach((m: any) => {
                // ── Resolver equipo 1 ─────────────────────────────────────────────
                // Prioridad: objeto team1 ya embebido en el match (formato nuevo)
                //            > índice en t.teams (formato legacy)
                //            > TBD/knockout                        > fallback numérico
                let team1Obj: any = null;
                let team2Obj: any = null;

                if (m.team1 && (m.team1.p1 || m.team1.p1Name || m.team1.isTBD || m.team1.teamLabel)) {
                    // Formato nuevo: team1 ya viene como objeto
                    team1Obj = m.team1;
                } else if (m.team1Index != null && t.teams) {
                    // Formato legacy: índice 1-based → array 0-based
                    team1Obj = t.teams[m.team1Index - 1] ?? null;
                }

                if (m.team2 && (m.team2.p1 || m.team2.p1Name || m.team2.isTBD || m.team2.teamLabel)) {
                    team2Obj = m.team2;
                } else if (m.team2Index != null && t.teams) {
                    team2Obj = t.teams[m.team2Index - 1] ?? null;
                }

                // Construir objeto enriquecido de equipo con todas las fuentes
                const buildTeam = (obj: any, idx: number | undefined, matchTeamName?: string) => {
                    if (!obj && !matchTeamName) return { name: idx != null ? `Pareja ${idx}` : '?', p1Name: idx != null ? `Pareja ${idx}` : '?', p2Name: '' };
                    if (obj?.isTBD || obj?.teamLabel) return { ...obj, name: obj.teamLabel || obj.p1?.name || '?' };
                    const p1n = (obj?.p1Name || obj?.p1?.name || '').trim();
                    const p2n = (obj?.p2Name || obj?.p2?.name || '').trim();
                    const nameStr = (p1n && p2n) ? `${p1n} / ${p2n}` : (p1n || matchTeamName || (idx != null ? `Pareja ${idx}` : '?'));
                    return { ...obj, name: nameStr, p1Name: p1n || (idx != null ? `J${(idx - 1) * 2 + 1}` : '?'), p2Name: p2n };
                };

                flat.push({
                    ...m,
                    _tournamentId: t.id,
                    _tournamentName: t.name,
                    _category: t.category,
                    _gender: t.gender,
                    court: m.court ?? (m.courtIndex !== undefined ? m.courtIndex + 1 : '-'),
                    team1: buildTeam(team1Obj, m.team1Index, m.team1Name),
                    team2: buildTeam(team2Obj, m.team2Index, m.team2Name),
                    team1Name: m.team1Name,
                    team2Name: m.team2Name,
                });
            });
        });

        // Sort by scheduledTime asc, then by court
        flat.sort((a, b) => {
            const td = toMs(a.scheduledTime) - toMs(b.scheduledTime);
            if (td !== 0) return td;
            return (a.courtIndex ?? 0) - (b.courtIndex ?? 0);
        });

        setAllMatches(flat);
    }, [tournaments]);

    const filtered = allMatches.filter(m => {
        if (activeTab === 'all') return true;
        return m.status === activeTab;
    });

    // All pending matches sorted by time
    const allPending = allMatches.filter(m => m.status === MatchStatus.PENDING);

    // Find the earliest scheduled time slot among pending matches
    const earliestMs = allPending.length > 0 ? toMs(allPending[0].scheduledTime) : null;

    // "Next up" = matches at the earliest time slot (up to 3), i.e. the first wave
    const nextUpMatches = earliestMs !== null
        ? allPending.filter(m => toMs(m.scheduledTime) === earliestMs).slice(0, 3)
        : allPending.slice(0, 3);

    // Summary counts
    const liveCnt = allMatches.filter(m => m.status === MatchStatus.LIVE).length;
    const pendCnt = allMatches.filter(m => m.status === MatchStatus.PENDING).length;
    const finCnt = allMatches.filter(m => m.status === MatchStatus.FINISHED).length;

    const eventName = Object.values(tournaments)[0]?.complexName ?? 'Evento';
    const eventDate = Object.values(tournaments)[0]?.startDate;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-[#ccff00] animate-spin" />
            </div>
        );
    }

    if (tournamentIds.length === 0) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center gap-4">
                <Trophy className="w-16 h-16 text-[#ccff00]/20" />
                <p className="text-gray-500 uppercase tracking-widest text-sm">No se especificaron torneos</p>
                <Link href="/tournaments" className="text-[#ccff00] text-sm font-bold uppercase tracking-widest">← Volver</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-outfit flex flex-col">

            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="flex-shrink-0 bg-[#0a0a0a] border-b border-white/[0.08] px-5 pt-5 pb-4">
                <div className="flex items-center gap-3 mb-4">
                    <Link href="/tournaments"
                        className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none truncate">
                            <span className="text-[#ccff00]">{eventName}</span>
                        </h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-0.5">
                            Vista completa del evento
                        </p>
                    </div>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4">
                    {eventDate && (
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(eventDate).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                    )}
                    <span className="flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5" />
                        {Object.keys(tournaments).length} categorías
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {allMatches.length} partidos
                    </span>
                </div>

                {/* Stat pills */}
                <div className="flex gap-2 mb-4">
                    {liveCnt > 0 && (
                        <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest animate-pulse">
                            ● {liveCnt} En Vivo
                        </span>
                    )}
                    <span className="px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-[9px] font-black uppercase tracking-widest">
                        {pendCnt} Por comenzar
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-500 text-[9px] font-black uppercase tracking-widest">
                        {finCnt} Finalizados
                    </span>
                </div>

                {/* Categories ← link buttons */}
                <div className="flex gap-2 flex-wrap">
                    {Object.values(tournaments).map((t: any) => (
                        <Link key={t.id} href={`/tournaments/${t.id}`}
                            className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 ${CAT_COLORS[t.gender] ?? 'bg-white/5 border-white/10 text-gray-400'}`}>
                            {t.category?.replace(/_/g, ' ')}
                            {t.gender === 'MALE' ? ' ♂' : t.gender === 'FEMALE' ? ' ♀' : ' ⚥'}
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── Filter tabs ─────────────────────────────────────────── */}
            <div className="flex-shrink-0 px-5 py-3 flex gap-2 overflow-x-auto hide-scrollbar border-b border-white/[0.05]">
                {TABS.map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`flex-shrink-0 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.value
                            ? 'bg-[#ccff00] text-black'
                            : 'bg-white/[0.06] text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Match list ──────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">

                {/* ── "Por Comenzar" special section: show only next 3 ── */}
                {activeTab === MatchStatus.PENDING && (
                    <AnimatePresence mode="popLayout">
                        {nextUpMatches.length === 0 ? (
                            <motion.div
                                key="empty-pending"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-24 text-center space-y-4"
                            >
                                <Trophy className="w-16 h-16 text-white/5 mx-auto" />
                                <p className="text-gray-600 text-xs uppercase font-bold tracking-widest">No hay partidos por comenzar</p>
                            </motion.div>
                        ) : (
                            <>
                                {/* Next wave label */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-3 px-1 pb-1"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse shadow-[0_0_8px_#ccff00]" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ccff00]">
                                            Próximos a las {formatHHMM(nextUpMatches[0]?.scheduledTime)}
                                        </span>
                                    </div>
                                    <div className="flex-1 h-px bg-[#ccff00]/10" />
                                    <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                                        {nextUpMatches.length} pista{nextUpMatches.length !== 1 ? 's' : ''}
                                    </span>
                                </motion.div>

                                {nextUpMatches.map((match, rank) => (
                                    <NextMatchCard key={match.id ?? rank} match={match} rank={rank} />
                                ))}

                                {/* Info about remaining */}
                                {allPending.length > nextUpMatches.length && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-4"
                                    >
                                        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                                            + {allPending.length - nextUpMatches.length} partidos en cola · cambia a <span className="text-white/30">"Todos"</span> para ver el resto
                                        </p>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </AnimatePresence>
                )}

                {/* ── All other tabs: show full filtered list ── */}
                {activeTab !== MatchStatus.PENDING && (
                    <AnimatePresence mode="popLayout">
                        {filtered.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-24 text-center space-y-4"
                            >
                                <Trophy className="w-16 h-16 text-white/5 mx-auto" />
                                <p className="text-gray-600 text-xs uppercase font-bold tracking-widest">No hay partidos en esta sección</p>
                            </motion.div>
                        ) : (
                            filtered.map((match, idx) => (
                                <MatchCard key={match.id ?? idx} match={match} idx={idx} />
                            ))
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}

// Wrap in Suspense for useSearchParams
export default function EventPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-[#ccff00] animate-spin" />
            </div>
        }>
            <EventView />
        </Suspense>
    );
}
