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
import { dataService } from '@/lib/dataService';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection } from 'firebase/firestore';
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
    forcedAds?: boolean;
    current_ad_url?: string;
    [key: string]: any;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const formatTime = (dateStr: any) => {
    if (!dateStr) return '--:--';
    try { return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); }
    catch { return '--:--'; }
};

const ROUND_NAMES: Record<number, string> = { 1: '32vos', 2: '16vos', 3: '8vos', 4: '4tos', 5: 'Semis', 6: 'Final' };

function formatGender(gender: string | undefined): string {
    if (!gender) return '';
    const g = String(gender).toUpperCase();
    if (g === 'MALE') return 'Masculino';
    if (g === 'FEMALE') return 'Femenino';
    if (g === 'MIXED') return 'Mixto';
    return gender;
}

const CAT_LEVEL_LABELS: Record<string, string> = {
    PRIMERA: '1ª', SEGUNDA: '2ª', TERCERA: '3ª', CUARTA: '4ª', QUINTA: '5ª', SEXTA: '6ª', SEPTIMA: '7ª',
    MAS_45: '+45', MAS_50: '+50',
    SUMA_7: 'Suma 7', SUMA_8: 'Suma 8', SUMA_9: 'Suma 9', SUMA_10: 'Suma 10', SUMA_11: 'Suma 11',
};
function formatCategoryLevel(cat: string | undefined): string {
    if (!cat) return '';
    return CAT_LEVEL_LABELS[String(cat)] ?? String(cat).replace(/_/g, ' ');
}

function getControlSubtitle(tournament: { gender?: string; category?: string; complexName?: string } | null): string {
    if (!tournament) return '';
    const parts: string[] = [];
    const cat = tournament.category ? String(tournament.category).toUpperCase() : '';
    const isGenderCat = ['MALE', 'FEMALE', 'MIXED'].includes(cat);
    const genderLabel = formatGender(tournament.gender) || (isGenderCat ? formatGender(tournament.category) : '');
    if (genderLabel) parts.push(genderLabel);
    if (cat && !isGenderCat) parts.push(formatCategoryLevel(tournament.category!));
    parts.push(tournament.complexName || 'Pista Central');
    return parts.join(' · ');
}

// Helper to strip view-only fields before saving to Supabase
const stripMatchForDb = (match: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { team1, team2, id: _id, tournament_id: _tid, ...clean } = match;
    return clean;
};

// ── Mini-Dock Component ────────────────────────────────────────────────────
function MiniDock({
    match, tournamentId, onStartMatch, onToggleStream, onToggleAds, isUpdating
}: {
    match: EnrichedMatch;
    tournamentId: string;
    onStartMatch: (id: string) => void;
    onToggleStream: (id: string, val: boolean) => void;
    onToggleAds: (id: string, val: boolean) => void;
    isUpdating: boolean;
}) {
    const isLive = match.status === MatchStatus.LIVE;
    const isStreaming = !!match.isStreaming;
    const isAds = !!match.forcedAds;

    return (
        <div className="grid grid-cols-5 border-t border-white/[0.06] rounded-b-2xl overflow-hidden">
            <Link
                href={`/tournaments/${tournamentId}/score/${match.id}`}
                onClick={() => !isLive && onStartMatch(match.id)}
                className={`flex flex-col items-center justify-center gap-1.5 py-3.5 transition-all active:scale-95 border-r border-white/[0.05]
                    ${isLive
                        ? 'bg-padel-primary/10 text-padel-primary hover:bg-padel-primary/20'
                        : 'bg-white/[0.02] text-gray-400 hover:bg-white/[0.06] hover:text-white'
                    }`}
            >
                <div className="relative">
                    <Zap className="w-[18px] h-[18px]" />
                    {isLive && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_red] animate-pulse" />
                    )}
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">Control</span>
            </Link>

            {/* PIZARRA */}
            <Link
                href={`/tournaments/${tournamentId}/display/${match.id}`}
                target="_blank"
                className="flex flex-col items-center justify-center gap-1.5 py-3.5 bg-white/[0.02] text-gray-400 hover:bg-white/[0.06] hover:text-white transition-all active:scale-95 border-r border-white/[0.05]"
            >
                <Monitor className="w-[18px] h-[18px]" />
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">Pizarra</span>
            </Link>

            {/* CÁMARA */}
            <Link
                href={`/tournaments/${tournamentId}/control/broadcasting`}
                className="flex flex-col items-center justify-center gap-1.5 py-3.5 bg-white/[0.02] text-gray-400 hover:bg-white/[0.06] hover:text-orange-400 transition-all active:scale-95 border-r border-white/[0.05]"
            >
                <Camera className="w-[18px] h-[18px]" />
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">Cámara</span>
            </Link>

            {/* ADS */}
            <button
                onClick={() => onToggleAds(match.id, !isAds)}
                disabled={isUpdating}
                className={`flex flex-col items-center justify-center gap-1.5 py-3.5 transition-all active:scale-95 border-r border-white/[0.05] w-full
                    ${isAds
                        ? 'bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25'
                        : 'bg-white/[0.02] text-gray-500 hover:bg-white/[0.06] hover:text-yellow-400'
                    }`}
            >
                <div className="relative">
                    <Tv className="w-[18px] h-[18px]" />
                    {isAds && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_6px_#facc15]" />
                    )}
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">
                    {isAds ? 'ADS ON' : 'ADS'}
                </span>
            </button>

            {/* EN VIVO */}
            <button
                onClick={() => onToggleStream(match.id, !isStreaming)}
                disabled={isUpdating}
                className={`flex flex-col items-center justify-center gap-1.5 py-3.5 transition-all active:scale-95 w-full
                    ${isStreaming
                        ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                        : 'bg-white/[0.02] text-gray-500 hover:bg-white/[0.06] hover:text-red-400'
                    }`}
            >
                <div className="relative">
                    <Radio className="w-[18px] h-[18px]" />
                    {isStreaming && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_red]" />
                    )}
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">
                    {isStreaming ? 'En Vivo' : 'Stream'}
                </span>
            </button>
        </div>
    );
}

// ── Match Card Component ──────────────────────────────────────────────────
function ControlMatchCard({
    match, tournamentId, canOperate, onStartMatch, onFinishMatch, onToggleStream, onToggleAds, onRevertMatch, isUpdating
}: {
    match: EnrichedMatch;
    tournamentId: string;
    canOperate: boolean;
    onStartMatch: (id: string) => void;
    onFinishMatch: (id: string) => void;
    onToggleStream: (id: string, val: boolean) => void;
    onToggleAds: (id: string, val: boolean) => void;
    onRevertMatch: (id: string) => void;
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
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                    {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_red]" />}
                    {isFinished && <span className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                    {isPending && <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />}
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isLive ? 'text-red-400' : isFinished ? 'text-gray-600' : 'text-gray-500'}`}>
                        {isLive ? '● En Vivo' : isFinished ? 'Finalizado' : formatTime(match.scheduledTime)}
                    </span>
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest ml-1">· Pista {match.court || '–'}</span>
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
                    <span className="text-[7px] text-white/20 font-mono">#{String(match.id).slice(-4)}</span>
                </div>
            </div>

            <div className="flex">
                <div className="flex-1 flex flex-col divide-y divide-white/[0.04]">
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

                {isLive || isFinished ? (
                    <div className="flex flex-shrink-0 border-l border-white/[0.04]">
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
                    <div className="flex items-center justify-center w-20 flex-shrink-0 border-l border-white/[0.04]">
                        <div className="text-center">
                            <Target className="w-4 h-4 text-gray-700 mx-auto mb-0.5" />
                            <span className="text-[7px] font-bold text-gray-700 uppercase tracking-widest">C{match.court || '–'}</span>
                        </div>
                    </div>
                )}
            </div>

            {canOperate && isLive && (
                <div className="flex border-t border-white/[0.04]">
                    <Link
                        href={`/tournaments/${tournamentId}/score/${match.id}`}
                        className="flex-1 py-2 text-center text-[8px] font-black uppercase tracking-widest text-padel-primary hover:bg-padel-primary/10 transition-all"
                    >
                        → Marcador
                    </Link>
                    <button
                        onClick={() => onRevertMatch(match.id)}
                        className="flex-1 py-2 text-center text-[8px] font-black uppercase tracking-widest text-yellow-500/80 hover:bg-yellow-500/10 transition-all border-l border-white/[0.04]"
                    >
                        ↩ Revertir
                    </button>
                    <button
                        onClick={() => onFinishMatch(match.id)}
                        className="flex-1 py-2 text-center text-[8px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all border-l border-white/[0.04]"
                    >
                        Finalizar
                    </button>
                </div>
            )}

            {canOperate && !isFinished && (
                <MiniDock
                    match={match}
                    tournamentId={tournamentId}
                    onStartMatch={onStartMatch}
                    onToggleStream={onToggleStream}
                    onToggleAds={onToggleAds}
                    isUpdating={isUpdating}
                />
            )}
        </motion.div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ControlPanel({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, profile, isAdmin, loading: authLoading } = useAuth();

    const [tournament, setTournament] = useState<any>(null);
    const [matches, setMatches] = useState<EnrichedMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activePhaseTab, setActivePhaseTab] = useState<'activa' | 'proximos' | 'finalizados'>('activa');

    const canOperate = isAdmin || (!!user && !!tournament && tournament.ownerId === user.uid) || profile?.role === 'marker';

    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        if (!id || authLoading) return;
        if (!id || authLoading) return;
        setLoading(true);

        let currentTournament: any = null;
        let currentMatches: any[] = [];

        const updateData = (t: any, ms: any[]) => {
            if (!t || !ms) return;
            setTournament(t);
            const enriched = ms.map(m => {
                const matchId = m.id;
                const data = m.data || m; // Support both format (data wrapper or flat)
                const resolveTeam = (mTeam: any, teamIdx: number, side: string) => {
                    // Support for embedded teams (new Master Generator)
                    if (mTeam && (mTeam.p1 || mTeam.p1Name || mTeam.isTBD || mTeam.teamLabel)) {
                        if (mTeam.isTBD || mTeam.teamLabel) {
                            return { name: mTeam.teamLabel || mTeam.p1?.name || (mTeam.p1Name ? mTeam.p1Name : '?'), photo1: null, photo2: null };
                        }
                        const p1n = (mTeam.p1Name || mTeam.p1?.name || '').trim();
                        const p2n = (mTeam.p2Name || mTeam.p2?.name || '').trim();
                        return {
                            name: [p1n, p2n].filter(Boolean).join(' · ') || '?',
                            photo1: mTeam.p1?.photo || null,
                            photo2: mTeam.p2?.photo || null,
                        };
                    }
                    // Legacy support (using indices from external teams array)
                    const teams = t?.teams || [];
                    const foundTeam = teamIdx > 0 ? teams[teamIdx - 1] : null;
                    if (!foundTeam) return { name: teamIdx > 0 ? `Pareja ${teamIdx}` : '?', photo1: null, photo2: null };
                    const p1n = foundTeam.p1?.name || 'Jugador 1';
                    const p2n = foundTeam.p2?.name || 'Jugador 2';
                    return {
                        name: `${p1n} · ${p2n}`,
                        photo1: foundTeam.p1?.photo || null,
                        photo2: foundTeam.p2?.photo || null,
                    };
                };

                return {
                    ...data,
                    id: matchId,
                    tournament_id: m.tournament_id || id,
                    court: data.court || (data.courtIndex !== undefined ? data.courtIndex + 1 : undefined),
                    team1: resolveTeam(data.team1, data.team1Index, 'team1'),
                    team2: resolveTeam(data.team2, data.team2Index, 'team2'),
                    stage: data.stage || 'OPEN',
                } as EnrichedMatch;
            });
            setMatches(enriched);
            setLoading(false);
        };

        // 1. Supabase Subscriptions
        const unsubT = dataService.subscribeToTournament(id, (t) => {
            if (!t) return;
            currentTournament = t;
            if (currentMatches.length > 0) updateData(currentTournament, currentMatches);
        });

        const unsubM = dataService.subscribeToMatches(id, (newMatches) => {
            if (!newMatches || newMatches.length === 0) return;
            currentMatches = newMatches;
            if (currentTournament) updateData(currentTournament, currentMatches);
        });

        // 2. Firestore Subscriptions (Fallback / Event view support)
        let unsubFT = () => { };
        let unsubFM = () => { };

        if (db) {
            unsubFT = onSnapshot(doc(db, 'tournaments', id), (snap) => {
                if (!snap.exists()) return;
                currentTournament = { id: snap.id, ...snap.data() };
                if (currentMatches.length > 0) updateData(currentTournament, currentMatches);
            });

            unsubFM = onSnapshot(collection(db, 'tournaments', id, 'matches'), (snap) => {
                if (snap.empty) return;
                currentMatches = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                if (currentTournament) updateData(currentTournament, currentMatches);
            });
        }

        // Safety timeout
        const timeout = setTimeout(() => setLoading(false), 10000);

        return () => {
            if (typeof unsubT === 'function') unsubT();
            if (typeof unsubM === 'function') unsubM();
            unsubFT();
            unsubFM();
            clearTimeout(timeout);
        };
    }, [id, authLoading, tournament?.teams]);

    const courtNum = (m: EnrichedMatch) => Number(m?.court ?? (m?.courtIndex != null ? (m.courtIndex as number) + 1 : 0));

    const startMatch = async (matchId: string) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;
        const c = courtNum(match);
        const otherLiveOnCourt = matches.some(m => m.id !== matchId && m.status === MatchStatus.LIVE && courtNum(m) === c);
        if (otherLiveOnCourt) {
            alert(`No puede haber dos partidos en vivo en la misma pista. Ya hay un partido en vivo en la pista ${c}.`);
            return;
        }
        setUpdatingId(matchId);
        try {
            const nowIso = new Date().toISOString();
            const updatedData = {
                ...stripMatchForDb(match),
                status: MatchStatus.LIVE,
                actualStartTime: nowIso,
                startedAt: nowIso,
                sets: { t1: 0, t2: 0 },
                games: { t1: 0, t2: 0 },
                points: { t1: 0, t2: 0 },
                server: { team: 1 as 1, player: 1 as 1 }
            };
            await dataService.updateMatch(id, matchId, updatedData);
        } catch (e) { console.error(e); }
        finally { setUpdatingId(null); }
    };

    const finishMatch = async (matchId: string) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;
        setUpdatingId(matchId);
        try {
            const updatedData = {
                ...stripMatchForDb(match),
                status: MatchStatus.FINISHED,
                actualEndTime: new Date().toISOString()
            };
            await dataService.updateMatch(id, matchId, updatedData);
        } catch (e) { console.error(e); }
        finally { setUpdatingId(null); }
    };

    const toggleStream = async (matchId: string, val: boolean) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;
        setUpdatingId(matchId);
        try {
            await dataService.updateMatch(id, matchId, { ...stripMatchForDb(match), isStreaming: val });
        } catch (e) { console.error(e); }
        finally { setUpdatingId(null); }
    };

    const toggleAds = async (matchId: string, val: boolean) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;
        setUpdatingId(matchId);
        try {
            await dataService.updateMatch(id, matchId, { ...stripMatchForDb(match), forcedAds: val });
        } catch (e) { console.error(e); }
        finally { setUpdatingId(null); }
    };

    const revertToPending = async (matchId: string) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;
        if (!confirm('¿Revertir este partido a Pendiente? Se borrará el marcador actual.')) return;
        setUpdatingId(matchId);
        try {
            const clean = stripMatchForDb(match);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { actualStartTime, startedAt, actualEndTime, isStreaming, ...rest } = clean;
            const updatedData = {
                ...rest,
                status: MatchStatus.PENDING,
                sets: { t1: 0, t2: 0 },
                games: { t1: 0, t2: 0 },
                points: { t1: '0', t2: '0' },
            };
            await dataService.updateMatch(id, matchId, updatedData);
        } catch (e) { console.error(e); }
        finally { setUpdatingId(null); }
    };

    const liveMatches = matches.filter(m => m.status === MatchStatus.LIVE);
    const finishedMatches = matches.filter(m => m.status === MatchStatus.FINISHED);
    const pendingMatches = matches.filter(m => m.status === MatchStatus.PENDING);

    const activePhaseMatches = matches.filter(m => {
        if (m.status === MatchStatus.LIVE) return true;
        if (m.status === MatchStatus.PENDING) {
            return m.court !== undefined && m.court !== null && m.court !== '';
        }
        return false;
    });

    const proximosMatches = matches.filter(m =>
        m.status === MatchStatus.PENDING && (m.court === undefined || m.court === null || m.court === '')
    );

    const progress = matches.length > 0 ? (finishedMatches.length / matches.length) * 100 : 0;

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
            <p className="text-gray-500 text-sm max-w-xs">Este panel es exclusivo para Administradores, Markers o el creador del torneo.</p>
            <button onClick={() => router.back()} className="mt-4 px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                Volver
            </button>
        </div>
    );

    return (
        <div className="h-screen bg-[#050505] text-white flex overflow-hidden font-outfit">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden pl-20 md:pl-24">
                <header className="flex-shrink-0 flex items-center justify-between px-4 lg:px-6 py-3 border-b border-white/[0.04] bg-white/[0.01]">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-padel-primary/10 rounded-xl border border-padel-primary/20">
                            <LayoutDashboard className="w-5 h-5 text-padel-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-black italic uppercase tracking-tighter leading-none">{tournament?.name || 'Control'}</h1>
                            </div>
                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.15em] mt-0.5">
                                {getControlSubtitle(tournament)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block">
                            <p className="text-sm font-black italic leading-none">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                        </div>
                        <Link href={`/tournaments/${id}`} className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all text-gray-400">
                            <Monitor className="w-4 h-4" />
                        </Link>
                    </div>
                </header>

                <div className="flex-shrink-0 flex items-center gap-1 px-4 lg:px-6 pt-3 pb-2 border-b border-white/[0.04]">
                    {(['activa', 'proximos', 'finalizados'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActivePhaseTab(tab)}
                            className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all 
                                ${activePhaseTab === tab ? 'bg-white/[0.08] text-white' : 'text-gray-600 hover:text-gray-400'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 lg:px-6 py-4 space-y-4">
                    {activePhaseTab === 'activa' && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                            {activePhaseMatches.map(m => (
                                <ControlMatchCard
                                    key={m.id}
                                    match={m}
                                    tournamentId={id}
                                    canOperate={canOperate}
                                    onStartMatch={startMatch}
                                    onFinishMatch={finishMatch}
                                    onToggleStream={toggleStream}
                                    onToggleAds={toggleAds}
                                    onRevertMatch={revertToPending}
                                    isUpdating={updatingId === m.id}
                                />
                            ))}
                        </div>
                    )}
                    {activePhaseTab === 'proximos' && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                            {proximosMatches.map(m => (
                                <ControlMatchCard
                                    key={m.id}
                                    match={m}
                                    tournamentId={id}
                                    canOperate={canOperate}
                                    onStartMatch={startMatch}
                                    onFinishMatch={finishMatch}
                                    onToggleStream={toggleStream}
                                    onToggleAds={toggleAds}
                                    onRevertMatch={revertToPending}
                                    isUpdating={updatingId === m.id}
                                />
                            ))}
                        </div>
                    )}
                    {activePhaseTab === 'finalizados' && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                            {finishedMatches.map(m => (
                                <ControlMatchCard
                                    key={m.id}
                                    match={m}
                                    tournamentId={id}
                                    canOperate={canOperate}
                                    onStartMatch={startMatch}
                                    onFinishMatch={finishMatch}
                                    onToggleStream={toggleStream}
                                    onToggleAds={toggleAds}
                                    onRevertMatch={revertToPending}
                                    isUpdating={updatingId === m.id}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
