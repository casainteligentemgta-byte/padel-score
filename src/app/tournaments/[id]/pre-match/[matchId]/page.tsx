'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { MatchStatus } from '@/types/tournament';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Play, Monitor, Camera, Tv,
    ChevronRight, Radio, Zap,
    CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────
const formatHHMM = (v: any) => {
    if (!v) return '--:--';
    const d = v?.toDate ? v.toDate() : new Date(v);
    if (isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatCountdown = (seconds: number): string => {
    const absS = Math.abs(seconds);
    const m = Math.floor(absS / 60);
    const s = absS % 60;
    const sign = seconds < 0 ? '-' : '+';
    return `${sign}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function PreMatchControl({ params }: { params: Promise<{ id: string; matchId: string }> }) {
    const { id, matchId } = use(params);
    const router = useRouter();
    const { user, isAdmin, isMarker, loading: authLoading } = useAuth();
    const canControl = isAdmin || isMarker;

    const [tournament, setTournament] = useState<any>(null);
    const [match, setMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [started, setStarted] = useState(false);
    const [countdown, setCountdown] = useState<number>(0);
    const [activeTab, setActiveTab] = useState<'control' | 'pizarra' | 'camaras' | 'publicidad'>('control');
    const [currentTime, setCurrentTime] = useState(new Date());

    // ── Clock ──────────────────────────────────────────────────────────────
    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    // ── Countdown ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!match?.scheduledTime) return;
        const update = () => {
            const scheduled = new Date(
                match.scheduledTime?.toDate ? match.scheduledTime.toDate() : match.scheduledTime
            ).getTime();
            const diff = Math.round((scheduled - Date.now()) / 1000);
            setCountdown(diff);
        };
        update();
        const t = setInterval(update, 1000);
        return () => clearInterval(t);
    }, [match?.scheduledTime]);

    // ── Firebase sync ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!id || authLoading) return;
        const unsub = onSnapshot(doc(db, 'tournaments', id), snap => {
            if (snap.exists()) {
                const data = { id: snap.id, ...snap.data() } as any;
                setTournament(data);

                const matches: any[] = data.matches || [];
                // Buscar por id exacto primero
                let found = matches.find((m: any) => m.id === matchId);
                // Fallback court_N
                if (!found) {
                    const courtNum = matchId.startsWith('court_')
                        ? parseInt(matchId.replace('court_', ''))
                        : parseInt(matchId);
                    if (!isNaN(courtNum)) {
                        found = matches.find((m: any) =>
                            m.court === courtNum ||
                            m.courtIndex === courtNum - 1
                        ) ?? matches[courtNum - 1] ?? null;
                    }
                }
                if (!found && matches.length === 1) found = matches[0];

                if (found) {
                    // Resolver equipos
                    const resolveTeam = (mTeam: any, teamIdx: number) => {
                        if (mTeam && (mTeam.p1 || mTeam.p1Name || mTeam.isTBD || mTeam.teamLabel)) {
                            if (mTeam.isTBD || mTeam.teamLabel) return { p1: mTeam.teamLabel || '?', p2: '' };
                            return {
                                p1: (mTeam.p1Name || mTeam.p1?.name || '').trim() || '?',
                                p2: (mTeam.p2Name || mTeam.p2?.name || '').trim() || '',
                            };
                        }
                        const t = teamIdx > 0 ? data.teams?.[teamIdx - 1] : null;
                        if (!t) return { p1: teamIdx > 0 ? `Pareja ${teamIdx}` : '?', p2: '' };
                        return {
                            p1: (t.p1?.name || '').trim() || 'Jugador 1',
                            p2: (t.p2?.name || '').trim() || 'Jugador 2',
                        };
                    };

                    const team1 = resolveTeam(found.team1, found.team1Index);
                    const team2 = resolveTeam(found.team2, found.team2Index);

                    setMatch({
                        ...found,
                        court: found.court ?? (found.courtIndex !== undefined ? found.courtIndex + 1 : '-'),
                        _team1: team1,
                        _team2: team2,
                    });

                    // Si el partido ya está en vivo, redirigir al marcador
                    if (found.status === MatchStatus.LIVE) {
                        setStarted(true);
                    }
                }
            }
            setLoading(false);
        });
        return () => unsub();
    }, [id, matchId, authLoading]);

    const courtNum = (m: any) => Number(m?.court ?? (m?.courtIndex != null ? (m.courtIndex as number) + 1 : 0));

    // ── Iniciar partido ────────────────────────────────────────────────────
    const startMatch = async () => {
        if (!tournament || !match) return;
        const realId = match.id;
        const c = courtNum(match);
        const allMatches = tournament.matches || [];
        const otherLiveOnCourt = allMatches.some((m: any) => m.id !== realId && m.status === MatchStatus.LIVE && courtNum(m) === c);
        if (otherLiveOnCourt) {
            alert(`No puede haber dos partidos en vivo en la misma pista. Ya hay un partido en vivo en la pista ${c}.`);
            return;
        }
        if (!confirm('¿Iniciar este partido ahora? Pasará a estado EN VIVO.')) return;
        setStarting(true);
        try {
            const updated = allMatches.map((m: any) =>
                m.id === realId
                    ? {
                        ...m,
                        status: MatchStatus.LIVE,
                        startedAt: new Date().toISOString(),
                        actualStartTime: new Date().toISOString(),
                        sets: { t1: 0, t2: 0 },
                        games: { t1: 0, t2: 0 },
                        points: { t1: '0', t2: '0' },
                        server: { team: 1, player: 1 },
                    }
                    : m
            );
            await updateDoc(doc(db, 'tournaments', id), {
                matches: updated.map(({ team1, team2, ...rest }: any) => rest),
                updatedAt: new Date(),
            });
            setStarted(true);
            setTimeout(() => {
                router.push(`/tournaments/${id}/score/${realId || matchId}`);
            }, 1200);
        } catch (e) {
            console.error('[startMatch]', e);
            alert('Error al iniciar el partido. Revisa la consola.');
        } finally {
            setStarting(false);
        }
    };

    const primaryColor = tournament?.broadcastingSettings?.primaryColor || '#ccff00';
    const pizarraHref = match?.id
        ? `/tournaments/${id}/display/${match.id}`
        : `/tournaments/${id}/control`;
    const scoreHref = `/tournaments/${id}/score/${match?.id || matchId}`;
    const broadcastingHref = `/tournaments/${id}/control/broadcasting`;
    const adsHref = `/tournaments/${id}/control/ads`;

    // ── Loading / error ────────────────────────────────────────────────────
    if (loading) return (
        <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-[#ccff00] animate-spin" />
        </div>
    );

    if (!match) return (
        <div className="h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 text-white">
            <AlertCircle className="w-12 h-12 text-red-500/40" />
            <p className="text-gray-400 uppercase tracking-widest text-sm font-bold">Partido no encontrado</p>
            <button onClick={() => router.back()} className="mt-2 px-5 py-2.5 bg-white/5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                Volver
            </button>
        </div>
    );

    const isAlreadyLive = match.status === MatchStatus.LIVE || started;
    const countdownColor = countdown > 300 ? 'text-gray-400' : countdown > 60 ? 'text-yellow-400' : countdown > 0 ? 'text-orange-400' : 'text-red-400';
    const countdownLabel = countdown > 0 ? 'Faltan' : 'Lleva';

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-outfit flex flex-col">
            {/* ── Header ──────────────────────────────────────────────── */}
            <header className="flex-shrink-0 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/[0.07] px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="flex-1 min-w-0">
                    <h1 className="text-[13px] font-black uppercase italic tracking-tighter leading-none truncate">
                        <span style={{ color: primaryColor }}>P{match.court}</span>
                        <span className="text-gray-500 mx-1.5">·</span>
                        <span className="text-white">{match._team1?.p1} / {match._team1?.p2}</span>
                    </h1>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-600 mt-0.5">
                        Pre-Partido · {formatHHMM(match.scheduledTime)}
                    </p>
                </div>

                {/* Clock */}
                <div className="flex-shrink-0 text-right">
                    <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Hora</p>
                    <p className="text-sm font-black italic leading-none text-white/60">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </p>
                </div>
            </header>

            {/* ── Main scrollable area ──────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-3">

                {/* ── Status banner ──────────────────────────────────── */}
                <AnimatePresence>
                    {isAlreadyLive && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 flex items-center gap-3"
                        >
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">¡Partido en Vivo!</p>
                                <p className="text-[9px] text-emerald-400/70 font-bold">Redirigiendo al marcador...</p>
                            </div>
                            <Link
                                href={scoreHref}
                                className="ml-auto px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5"
                            >
                                Marcador <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Countdown card ──────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[2rem] border border-white/[0.07] bg-white/[0.03] overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-5 pt-4 pb-3 border-b border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isAlreadyLive ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]' : 'bg-yellow-400 animate-pulse shadow-[0_0_8px_#facc15]'}`} />
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isAlreadyLive ? 'text-emerald-400' : 'text-yellow-300'}`}>
                                {isAlreadyLive ? '● En Vivo' : '⏱ Por Comenzar'}
                            </span>
                        </div>
                        <span className="label-cancha-meta italic">Pista {match.court}</span>
                    </div>

                    {/* Players */}
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-5">
                        <div className="text-right space-y-0.5">
                            <p className="text-[14px] font-black uppercase tracking-tight leading-tight">{match._team1?.p1}</p>
                            {match._team1?.p2 && <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{match._team1.p2}</p>}
                        </div>
                        <div className="flex flex-col items-center gap-1 px-2">
                            <span className="text-[10px] font-black text-gray-600 uppercase italic tracking-widest">vs</span>
                            <span className="text-[8px] font-bold text-gray-700">{formatHHMM(match.scheduledTime)}</span>
                        </div>
                        <div className="text-left space-y-0.5">
                            <p className="text-[14px] font-black uppercase tracking-tight leading-tight">{match._team2?.p1}</p>
                            {match._team2?.p2 && <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{match._team2.p2}</p>}
                        </div>
                    </div>

                    {/* Countdown display */}
                    {!isAlreadyLive && (
                        <div className="px-5 pb-5 flex flex-col items-center gap-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">{countdownLabel}</p>
                            <motion.span
                                key={Math.sign(countdown)}
                                initial={{ scale: 0.9, opacity: 0.6 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`text-4xl font-black italic tabular-nums tracking-tighter ${countdownColor}`}
                            >
                                {formatCountdown(countdown)}
                            </motion.span>
                            <p className="text-[8px] text-gray-700 font-bold">
                                {countdown > 0 ? 'para el horario programado' : 'del horario programado'}
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* ── Tab content ──────────────────────────────────────── */}
                <AnimatePresence mode="wait">
                    {activeTab === 'control' && (
                        <motion.div
                            key="control"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3"
                        >
                            {/* Iniciar Partido */}
                            {!isAlreadyLive ? (
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={startMatch}
                                    disabled={starting}
                                    className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] italic flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-60"
                                    style={{
                                        backgroundColor: primaryColor,
                                        color: '#000',
                                        boxShadow: `0 6px 24px ${primaryColor}55`,
                                    }}
                                >
                                    {starting ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Play className="w-5 h-5" />
                                    )}
                                    {starting ? 'Iniciando...' : 'Iniciar Partido'}
                                </motion.button>
                            ) : (
                                <Link
                                    href={scoreHref}
                                    className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] italic flex items-center justify-center gap-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                                >
                                    <Zap className="w-5 h-5" />
                                    Ir al Marcador
                                </Link>
                            )}

                            {/* Info cards */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-1.5">Horario</p>
                                    <p className="text-xl font-black italic" style={{ color: primaryColor }}>{formatHHMM(match.scheduledTime)}</p>
                                    <p className="text-[8px] text-gray-600 font-bold mt-0.5">{match._tournamentName || tournament?.name}</p>
                                </div>
                                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-1.5">Categoría</p>
                                    <p className="text-sm font-black italic text-white/80 uppercase tracking-tight">
                                        {(tournament?.category || '—').replace(/_/g, ' ')}
                                    </p>
                                    <p className="text-[8px] text-gray-600 font-bold mt-0.5">{tournament?.complexName || '—'}</p>
                                </div>
                            </div>

                            {/* Quick links */}
                            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.05]">
                                <Link href={scoreHref} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors">
                                    <div className="w-8 h-8 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                                        <Zap className="w-4 h-4 text-yellow-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Marcador completo</p>
                                        <p className="text-[8px] text-gray-600 font-bold">Control de puntos y estadísticas</p>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                                </Link>
                                <Link href={pizarraHref} target="_blank" className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors">
                                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                        <Monitor className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Abrir Pizarra</p>
                                        <p className="text-[8px] text-gray-600 font-bold">Pantalla de visualización en TV</p>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'pizarra' && (
                        <motion.div
                            key="pizarra"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3"
                        >
                            <div className="rounded-[2rem] bg-white/[0.03] border border-white/[0.07] overflow-hidden">
                                <div className="px-5 py-4 border-b border-white/[0.06]">
                                    <h2 className="text-[10px] font-black uppercase tracking-widest text-white/60">Vista previa de Pizarra</h2>
                                    <p className="text-[8px] text-gray-600 font-bold mt-0.5">Esta es la configuración actual de la pizarra para esta cancha</p>
                                </div>

                                {/* Pizarra preview mockup */}
                                <div className="m-4 rounded-2xl bg-black border border-white/[0.05] p-4 aspect-video flex flex-col">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-auto">
                                        <div>
                                            <p className="label-cancha-meta">Pista {match.court}</p>
                                            <p className="text-[10px] font-black italic uppercase tracking-tight text-white/70">{(tournament?.category || '').replace(/_/g, ' ')}</p>
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                                            <span className="text-[7px] font-black text-yellow-400 uppercase tracking-widest">Pre-Partido</span>
                                        </div>
                                    </div>

                                    {/* Teams display */}
                                    <div className="flex-1 flex flex-col justify-center gap-2">
                                        <div className="flex items-center gap-3 py-1.5 border-b border-white/[0.05]">
                                            <div className="flex-1">
                                                <p className="text-[9px] font-black italic uppercase tracking-tight text-white leading-tight">{match._team1?.p1}</p>
                                                {match._team1?.p2 && <p className="text-[7px] text-gray-500 italic uppercase">{match._team1.p2}</p>}
                                            </div>
                                            <p className="text-lg font-black italic tabular-nums" style={{ color: primaryColor }}>0</p>
                                        </div>
                                        <div className="flex items-center gap-3 py-1.5">
                                            <div className="flex-1">
                                                <p className="text-[9px] font-black italic uppercase tracking-tight text-white leading-tight">{match._team2?.p1}</p>
                                                {match._team2?.p2 && <p className="text-[7px] text-gray-500 italic uppercase">{match._team2.p2}</p>}
                                            </div>
                                            <p className="text-lg font-black italic tabular-nums" style={{ color: primaryColor }}>0</p>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/[0.05]">
                                        <span className="text-[6px] font-bold text-gray-700 uppercase tracking-widest">{tournament?.name}</span>
                                        <span className="text-[6px] font-bold text-gray-700">{formatHHMM(match.scheduledTime)}</span>
                                    </div>
                                </div>

                                <div className="px-4 pb-4">
                                    <Link
                                        href={pizarraHref}
                                        target="_blank"
                                        className="w-full py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-all"
                                    >
                                        <Monitor className="w-4 h-4" />
                                        Abrir Pizarra Completa
                                    </Link>
                                </div>
                            </div>

                            {/* Ads status */}
                            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] px-4 py-3 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                                    <Tv className="w-4 h-4 text-yellow-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/70">Publicidad en Pizarra</p>
                                    <p className="text-[8px] text-gray-600 font-bold">
                                        {match.forcedAds ? 'Publicidad activa' : 'Mostrando marcador'}
                                    </p>
                                </div>
                                <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border ${match.forcedAds ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                                    {match.forcedAds ? 'ADS' : 'Normal'}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'camaras' && (
                        <motion.div
                            key="camaras"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3"
                        >
                            <div className="rounded-[2rem] bg-white/[0.03] border border-white/[0.07] overflow-hidden">
                                <div className="px-5 py-4 border-b border-white/[0.06]">
                                    <h2 className="label-cancha-meta text-white/60">Cámaras — Pista {match.court}</h2>
                                    <p className="text-[8px] text-gray-600 font-bold mt-0.5">Cámaras configuradas en el módulo de broadcasting</p>
                                </div>

                                <div className="p-4 grid grid-cols-2 gap-2">
                                    {[1, 2].map(cam => (
                                        <div key={cam} className="aspect-video rounded-xl bg-black border border-white/[0.07] flex flex-col items-center justify-center gap-2">
                                            <Camera className="w-6 h-6 text-gray-700" />
                                            <p className="text-[7px] font-black uppercase tracking-widest text-gray-700">Cámara {cam}</p>
                                            <p className="text-[6px] text-gray-800 font-bold">Sin señal</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="px-4 pb-4">
                                    <Link
                                        href={broadcastingHref}
                                        className="w-full py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:bg-orange-500/20 transition-all"
                                    >
                                        <Camera className="w-4 h-4" />
                                        Configurar Cámaras
                                    </Link>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] px-4 py-3 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                    <Radio className="w-4 h-4 text-orange-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/70">Estado de Streaming</p>
                                    <p className="text-[8px] text-gray-600 font-bold">
                                        {match.isStreaming ? 'Streaming activo' : 'Sin transmisión'}
                                    </p>
                                </div>
                                <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border ${match.isStreaming ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                                    {match.isStreaming ? '● Live' : 'Off'}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'publicidad' && (
                        <motion.div
                            key="publicidad"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3"
                        >
                            <div className="rounded-[2rem] bg-white/[0.03] border border-white/[0.07] overflow-hidden">
                                <div className="px-5 py-4 border-b border-white/[0.06]">
                                    <h2 className="text-[10px] font-black uppercase tracking-widest text-white/60">Configurar Publicidad</h2>
                                    <p className="text-[8px] text-gray-600 font-bold mt-0.5">Administra los anuncios que se mostrarán en la pizarra</p>
                                </div>

                                {/* Ads info */}
                                <div className="p-4 space-y-2">
                                    <div className="rounded-2xl bg-yellow-500/5 border border-yellow-500/15 px-4 py-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Tv className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                            <p className="text-[9px] font-black uppercase tracking-widest text-yellow-400">Pantalla General</p>
                                        </div>
                                        <p className="text-[8px] text-gray-500 font-bold">Los anuncios se visualizan automáticamente según la configuración del panel de publicidad</p>
                                    </div>

                                    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.05]">
                                        <div className="px-4 py-3 flex items-center justify-between">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Estado publicidad</span>
                                            <span className={`text-[9px] font-black uppercase ${match.forcedAds ? 'text-yellow-400' : 'text-gray-600'}`}>
                                                {match.forcedAds ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </div>
                                        <div className="px-4 py-3 flex items-center justify-between">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Frecuencia</span>
                                            <span className="text-[9px] font-black text-gray-500">
                                                {tournament?.broadcastingSettings?.adFrequencySeconds || 60}s
                                            </span>
                                        </div>
                                        <div className="px-4 py-3 flex items-center justify-between">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Duración</span>
                                            <span className="text-[9px] font-black text-gray-500">
                                                {tournament?.broadcastingSettings?.adDurationSeconds || 10}s
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-4 pb-4 space-y-2">
                                    <Link
                                        href={adsHref}
                                        className="w-full py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:bg-yellow-500/20 transition-all"
                                    >
                                        <Tv className="w-4 h-4" />
                                        Panel de Publicidad
                                    </Link>
                                    <Link
                                        href={broadcastingHref}
                                        className="w-full py-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-gray-400 font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:bg-white/[0.06] transition-all"
                                    >
                                        <Radio className="w-4 h-4" />
                                        Broadcasting General
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Bottom Navigation ─────────────────────────────────── */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-t border-white/[0.07]">
                <div className="grid grid-cols-4 gap-px bg-white/[0.04]">
                    {/* CONTROL */}
                    <button
                        onClick={() => setActiveTab('control')}
                        className={`flex flex-col items-center justify-center gap-1.5 py-3.5 transition-all active:scale-95 ${activeTab === 'control'
                            ? 'bg-[#ccff00]/10 text-[#ccff00]'
                            : 'bg-[#0a0a0a] text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <div className="relative">
                            <Play className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                            {activeTab === 'control' && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ccff00] shadow-[0_0_6px_#ccff00] animate-pulse" />
                            )}
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest">Control</span>
                    </button>

                    {/* PIZARRA */}
                    <button
                        onClick={() => setActiveTab('pizarra')}
                        className={`flex flex-col items-center justify-center gap-1.5 py-3.5 transition-all active:scale-95 ${activeTab === 'pizarra'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-[#0a0a0a] text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <Monitor className="w-[18px] h-[18px]" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Pizarra</span>
                    </button>

                    {/* CÁMARAS */}
                    <button
                        onClick={() => setActiveTab('camaras')}
                        className={`flex flex-col items-center justify-center gap-1.5 py-3.5 transition-all active:scale-95 ${activeTab === 'camaras'
                            ? 'bg-orange-500/10 text-orange-400'
                            : 'bg-[#0a0a0a] text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <Camera className="w-[18px] h-[18px]" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Cámaras</span>
                    </button>

                    {/* PUBLICIDAD */}
                    <button
                        onClick={() => setActiveTab('publicidad')}
                        className={`flex flex-col items-center justify-center gap-1.5 py-3.5 transition-all active:scale-95 ${activeTab === 'publicidad'
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'bg-[#0a0a0a] text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <Tv className="w-[18px] h-[18px]" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Publicidad</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
