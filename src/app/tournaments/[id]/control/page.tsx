'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, Clock, Activity, Settings, LayoutDashboard,
    Play, CheckCircle2, Monitor, ChevronRight, AlertCircle,
    MonitorPlay, Tv, Megaphone, Radio, Camera, Zap,
    RefreshCw, Circle, Square, ChevronDown, ChevronUp,
    Wifi, WifiOff, Lock, Unlock, ArrowRight, Target, RotateCcw,
    Cpu, Network, HardDrive, Clock as ClockIcon,
    Pencil, X, Save
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { MatchStatus, TournamentType } from '@/types/tournament';
import { dataService } from '@/lib/dataService';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRouteSegment } from '@/lib/useRouteSegment';
import { validateTournamentIntegrity } from '@/lib/tournamentService';

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
    MAS_40: '+40', FEM_40: '+40', MIX_40: '+40', MAS_45: '+45', MAS_50: '+50',
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

const PadelRallyAnimation = () => (
    <div className="hidden md:flex items-center gap-6 h-10 relative px-4 bg-white/5 rounded-2xl border border-white/10 overflow-hidden group">
        <motion.div
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-6 relative"
        >
            <div className="w-full h-full border-2 border-padel-primary rounded-full rotate-[-45deg] bg-black shadow-[0_0_10px_rgba(204,255,0,0.2)] flex items-center justify-center">
                <div className="w-3 h-3 border border-padel-primary/30 rounded-full" />
                <div className="absolute -bottom-1 -right-0.5 w-1.5 h-3 bg-padel-primary rounded-full origin-top rotate-0" />
            </div>
        </motion.div>

        <div className="w-16 relative h-full flex items-center">
            <motion.div
                animate={{
                    x: [0, 48],
                    y: [0, -10, 0],
                }}
                transition={{
                    x: { duration: 0.75, repeat: Infinity, repeatType: "reverse", ease: "linear" },
                    y: { duration: 0.375, repeat: Infinity, repeatType: "reverse", ease: "easeOut" }
                }}
                className="w-2 h-2 bg-padel-primary rounded-full shadow-[0_0_15px_#ccff00] z-10"
            />
        </div>

        <motion.div
            animate={{ y: [6, -6, 6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-6 relative"
        >
            <div className="w-full h-full border-2 border-white/20 rounded-full rotate-[45deg] bg-black flex items-center justify-center">
                <div className="w-3 h-3 border border-white/5 rounded-full" />
                <div className="absolute -bottom-1 -left-0.5 w-1.5 h-3 bg-white/10 rounded-full origin-top rotate-0" />
            </div>
        </motion.div>
    </div>
);

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
            <Link
                href={`/admin/publicidad`}
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
            </Link>

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

    // ── Edit names state ─────────────────────────────────────────────────
    const extractName = (team: any, player: 'p1' | 'p2') => {
        const raw = team?.[player]?.name || team?.[`${player}Name`] || '';
        const PH = /pareja|jugador|placeholder/i;
        return (!raw || PH.test(raw) || raw === '?') ? '' : raw;
    };
    const [showEdit, setShowEdit] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editNames, setEditNames] = useState({
        t1p1: '', t1p2: '', t2p1: '', t2p2: ''
    });

    const openEdit = () => {
        setEditNames({
            t1p1: extractName(match.team1, 'p1'),
            t1p2: extractName(match.team1, 'p2'),
            t2p1: extractName(match.team2, 'p1'),
            t2p2: extractName(match.team2, 'p2'),
        });
        setShowEdit(true);
    };

    const saveNames = async () => {
        if (saving) return;
        setSaving(true);
        try {
            const buildTeam = (orig: any, p1n: string, p2n: string) => ({
                ...orig,
                p1: { ...(orig?.p1 || {}), name: p1n.trim() || orig?.p1?.name || '?' },
                p2: { ...(orig?.p2 || {}), name: p2n.trim() || orig?.p2?.name || '?' },
                p1Name: p1n.trim() || orig?.p1Name || '?',
                p2Name: p2n.trim() || orig?.p2Name || '?',
            });
            const { team1: _t1, team2: _t2, id: _id, tournament_id: _tid, ...rest } = match as any;
            await dataService.updateMatch(tournamentId, match.id, {
                ...rest,
                team1: buildTeam(match.team1, editNames.t1p1, editNames.t1p2),
                team2: buildTeam(match.team2, editNames.t2p1, editNames.t2p2),
            });
            setShowEdit(false);
        } catch (e) {
            console.error('[EditNames] Error saving:', e);
        } finally {
            setSaving(false);
        }
    };
    // ─────────────────────────────────────────────────────────────────────

    const PLACEHOLDER_RE = /pareja|jugador|placeholder/i;
    const hasPlaceholder = [
        match.team1?.name, match.team2?.name
    ].some(n => !n || n === '?' || PLACEHOLDER_RE.test(n));

    const statusColor = isLive
        ? 'border-red-500/40 bg-red-500/[0.03] shadow-[0_0_40px_rgba(239,68,68,0.05)]'
        : isFinished
            ? 'border-white/5 bg-white/[0.01] opacity-70'
            : hasPlaceholder
                ? 'border-red-500 bg-red-500/[0.04] shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-pulse'
                : 'border-white/[0.06] bg-white/[0.02]';

    const toTennis = (p: any) => {
        const v = parseInt(String(p ?? 0));
        return ['0', '15', '30', '40', 'AD'][Math.min(v, 4)] ?? String(v);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`rounded-3xl border overflow-hidden ${statusColor} transition-all duration-300 group hover:border-white/20`}
        >
            {/* Card Header */}
            <div className={`flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04] ${isLive ? 'bg-red-500/10' : ''}`}>
                <div className="flex items-center gap-3">
                    {isLive && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500 rounded-md">
                            <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                            <span className="text-[7px] font-black uppercase text-white tracking-widest leading-none">VIVO</span>
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isLive ? 'text-red-400' : isFinished ? 'text-gray-500' : 'text-gray-400'}`}>
                            {isLive ? 'En Curso' : isFinished ? 'Finalizado' : formatTime(match.scheduledTime)}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Pista {match.court || '–'}</span>
                            {match.groupName && <span className="text-[7px] bg-white/5 px-1.5 py-0.5 rounded text-gray-500 font-mono">G{match.groupName}</span>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {match.isStreaming && (
                        <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    )}
                    {match.needsReferee && (
                        <AlertCircle className="w-3.5 h-3.5 text-yellow-500 animate-bounce" />
                    )}
                    <span className="text-[7px] text-white/10 font-mono tracking-tighter self-end mb-0.5">#{String(match.id).slice(-4)}</span>
                </div>
            </div>

            {/* Score Center */}
            <div className="flex p-4 gap-4 items-center">
                <div className="flex-1 space-y-2 min-w-0">

                    {/* ── Inline Edit Modal ────────────────────────────────── */}
                    {showEdit && (
                        <div className="bg-[#0d0d0d] border border-padel-primary/30 rounded-2xl p-3 space-y-2 shadow-[0_0_30px_rgba(204,255,0,0.08)]">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[8px] font-black uppercase tracking-widest text-padel-primary/80">Editar jugadores</span>
                                <button onClick={() => setShowEdit(false)} className="text-gray-600 hover:text-white transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Team 1 */}
                            <div className="space-y-1.5">
                                <span className="text-[7px] font-bold text-padel-primary/50 uppercase tracking-widest">Pareja 1</span>
                                <input
                                    value={editNames.t1p1}
                                    onChange={e => setEditNames(prev => ({ ...prev, t1p1: e.target.value }))}
                                    placeholder="J1 nombre..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-padel-primary/50 transition-all"
                                />
                                <input
                                    value={editNames.t1p2}
                                    onChange={e => setEditNames(prev => ({ ...prev, t1p2: e.target.value }))}
                                    placeholder="J2 nombre..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-padel-primary/50 transition-all"
                                />
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-white/[0.04] my-1" />

                            {/* Team 2 */}
                            <div className="space-y-1.5">
                                <span className="text-[7px] font-bold text-white/30 uppercase tracking-widest">Pareja 2</span>
                                <input
                                    value={editNames.t2p1}
                                    onChange={e => setEditNames(prev => ({ ...prev, t2p1: e.target.value }))}
                                    placeholder="J3 nombre..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-padel-primary/50 transition-all"
                                />
                                <input
                                    value={editNames.t2p2}
                                    onChange={e => setEditNames(prev => ({ ...prev, t2p2: e.target.value }))}
                                    placeholder="J4 nombre..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-padel-primary/50 transition-all"
                                />
                            </div>

                            {/* Save */}
                            <button
                                onClick={saveNames}
                                disabled={saving}
                                className="w-full mt-1 flex items-center justify-center gap-1.5 py-2 bg-padel-primary/10 hover:bg-padel-primary/20 border border-padel-primary/30 rounded-xl text-[9px] font-black uppercase tracking-widest text-padel-primary transition-all disabled:opacity-50"
                            >
                                <Save className="w-3 h-3" />
                                {saving ? 'Guardando...' : 'Guardar nombres'}
                            </button>
                        </div>
                    )}

                    {/* ── Team Names (normal view) ─────────────────────────── */}
                    {!showEdit && (
                        <>
                            <div className={`flex items-center gap-2 ${match.server?.team === 1 ? 'opacity-100' : 'opacity-60'}`}>
                                <div className="w-1.5 h-1.5 rounded-full bg-padel-primary shadow-[0_0_8px_#ccff00] flex-shrink-0" style={{ visibility: match.server?.team === 1 ? 'visible' : 'hidden' }} />
                                <span className="text-xs font-black italic uppercase tracking-tighter truncate leading-none flex-1 min-w-0">
                                    {match.team1.name}
                                </span>
                            </div>
                            <div className={`flex items-center gap-2 ${match.server?.team === 2 ? 'opacity-100' : 'opacity-60'}`}>
                                <div className="w-1.5 h-1.5 rounded-full bg-padel-primary shadow-[0_0_8px_#ccff00] flex-shrink-0" style={{ visibility: match.server?.team === 2 ? 'visible' : 'hidden' }} />
                                <span className="text-xs font-black italic uppercase tracking-tighter truncate leading-none flex-1 min-w-0">
                                    {match.team2.name}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Edit Pencil Button */}
                {canOperate && !showEdit && (
                    <button
                        onClick={openEdit}
                        title="Editar nombres de jugadores"
                        className={`flex-shrink-0 flex flex-col items-center justify-center w-8 h-8 rounded-xl transition-all active:scale-90
                            ${hasPlaceholder
                                ? 'bg-red-500/20 border border-red-500/50 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse'
                                : 'bg-white/[0.03] border border-white/10 text-gray-600 hover:bg-padel-primary/10 hover:text-padel-primary hover:border-padel-primary/30'
                            }`}
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                )}


                {/* Score Grid */}
                {(isLive || isFinished) && (
                    <div className="flex gap-2">
                        {/* Points */}
                        <div className="flex flex-col gap-1 w-8 items-center">
                            <span className="text-[6px] font-black text-white/20 uppercase tracking-[0.2em] mb-0.5">PTS</span>
                            <div className="w-full aspect-square bg-white/[0.03] border border-white/10 rounded-lg flex items-center justify-center font-black italic text-xs text-padel-primary">
                                {toTennis(match.points?.t1)}
                            </div>
                            <div className="w-full aspect-square bg-white/[0.03] border border-white/10 rounded-lg flex items-center justify-center font-black italic text-xs text-padel-primary">
                                {toTennis(match.points?.t2)}
                            </div>
                        </div>
                        {/* Games */}
                        <div className="flex flex-col gap-1 w-8 items-center">
                            <span className="text-[6px] font-black text-white/20 uppercase tracking-[0.2em] mb-0.5">JGS</span>
                            <div className="w-full aspect-square bg-white rounded-lg flex items-center justify-center font-black italic text-xs text-black">
                                {match.games?.t1 ?? 0}
                            </div>
                            <div className="w-full aspect-square bg-white rounded-lg flex items-center justify-center font-black italic text-xs text-black">
                                {match.games?.t2 ?? 0}
                            </div>
                        </div>
                        {/* Sets */}
                        <div className="flex flex-col gap-1 w-8 items-center">
                            <span className="text-[6px] font-black text-white/20 uppercase tracking-[0.2em] mb-0.5">SET</span>
                            <div className="w-full aspect-square bg-padel-primary rounded-lg flex items-center justify-center font-black italic text-xs text-black">
                                {match.sets?.t1 ?? 0}
                            </div>
                            <div className="w-full aspect-square bg-padel-primary rounded-lg flex items-center justify-center font-black italic text-xs text-black">
                                {match.sets?.t2 ?? 0}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Admin Controls */}
            {canOperate && (
                <div className="flex flex-col border-t border-white/[0.04]">
                    {/* Primary Actions Row */}
                    <div className="flex divide-x divide-white/[0.04]">
                        {(isLive || isFinished) && (
                            <Link
                                href={`/tournaments/${tournamentId}/score/${match.id}`}
                                className="flex-[1.5] py-3 text-center text-[9px] font-black uppercase tracking-widest text-padel-primary bg-padel-primary/5 hover:bg-padel-primary/10 transition-all flex items-center justify-center gap-2"
                            >
                                <Zap className="w-3 h-3" />
                                {isLive ? 'Marcador' : 'Ver' }
                            </Link>
                        )}
                        {isPending && (
                            <button
                                onClick={() => onStartMatch(match.id)}
                                disabled={isUpdating}
                                className="flex-1 py-3 text-center text-[9px] font-black uppercase tracking-widest text-green-400 bg-green-500/5 hover:bg-green-500/10 transition-all flex items-center justify-center gap-2"
                            >
                                <Play className="w-3 h-3" /> Iniciar
                            </button>
                        )}
                        {(isLive || isFinished) && (
                            <button
                                onClick={() => onRevertMatch(match.id)}
                                disabled={isUpdating}
                                className="flex-1 py-3 text-center text-[9px] font-black uppercase tracking-widest text-yellow-500/70 hover:bg-yellow-500/10 transition-all flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-3 h-3" /> Revertir
                            </button>
                        )}
                        {isLive && (
                            <button
                                onClick={() => onFinishMatch(match.id)}
                                disabled={isUpdating}
                                className="flex-1 py-3 text-center text-[9px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Finalizar
                            </button>
                        )}
                    </div>

                    {/* Secondary Dock (Toggles) */}
                    {!isFinished && (
                        <MiniDock
                            match={match}
                            tournamentId={tournamentId}
                            onStartMatch={onStartMatch}
                            onToggleStream={onToggleStream}
                            onToggleAds={onToggleAds}
                            isUpdating={isUpdating}
                        />
                    )}
                </div>
            )}
        </motion.div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ControlPanel() {
    const id = useRouteSegment('id');
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
                const resolveTeam = (mTeam: any, teamIdx: number) => {
                    const PLACEHOLDER_RE = /pareja|jugador|placeholder/i;
                    // 1) Embedded in the match (real names, priority)
                    if (mTeam && (mTeam.p1 || mTeam.p1Name || mTeam.isTBD || mTeam.teamLabel)) {
                        if (mTeam.isTBD || mTeam.teamLabel) {
                            return { name: mTeam.teamLabel || mTeam.p1?.name || '?', photo1: null, photo2: null };
                        }
                        const p1n = (mTeam.p1Name || mTeam.p1?.name || '').trim();
                        const p2n = (mTeam.p2Name || mTeam.p2?.name || '').trim();
                        const hasReal = (p1n && !PLACEHOLDER_RE.test(p1n)) || (p2n && !PLACEHOLDER_RE.test(p2n));
                        if (hasReal) {
                            return {
                                name: [p1n, p2n].filter(Boolean).join(' · ') || '?',
                                photo1: mTeam.p1?.photo || null,
                                photo2: mTeam.p2?.photo || null,
                            };
                        }
                    }
                    // 2) team1Name / team2Name string
                    // 3) Legacy: teams array by index
                    const teams = t?.teams || [];
                    const foundTeam = teamIdx > 0 ? teams[teamIdx - 1] : null;
                    if (foundTeam) {
                        const p1n = (foundTeam.p1?.name || '').trim();
                        const p2n = (foundTeam.p2?.name || '').trim();
                        if ((p1n && !PLACEHOLDER_RE.test(p1n)) || (p2n && !PLACEHOLDER_RE.test(p2n))) {
                            return {
                                name: [p1n, p2n].filter(Boolean).join(' · '),
                                photo1: foundTeam.p1?.photo || null,
                                photo2: foundTeam.p2?.photo || null,
                            };
                        }
                    }
                    return { name: '?', photo1: null, photo2: null };
                };

                return {
                    ...data,
                    id: matchId,
                    tournament_id: m.tournament_id || id,
                    court: data.court || (data.courtIndex !== undefined ? data.courtIndex + 1 : undefined),
                    team1: resolveTeam(data.team1, data.team1Index),
                    team2: resolveTeam(data.team2, data.team2Index),
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

        // ── Guard anti-placeholder ────────────────────────────────────────
        if (tournament) {
            const { canLive, issues } = validateTournamentIntegrity(tournament);
            if (!canLive) {
                const preview = issues.slice(0, 3).join('\n  • ');
                const more = issues.length > 3 ? `\n  ...y ${issues.length - 3} más.` : '';
                alert(`⚠️ No se puede iniciar: hay equipos con nombres genéricos.\n\n  • ${preview}${more}\n\nCorrígelos en el generador antes de continuar.`);
                return;
            }
        }
        // ─────────────────────────────────────────────────────────────────

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
                <header className="flex-shrink-0 flex flex-col px-4 lg:px-6 py-4 border-b border-white/[0.04] bg-white/[0.01] gap-6">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-padel-primary/10 rounded-2xl border border-padel-primary/20 shadow-[0_0_20px_rgba(204,255,0,0.05)]">
                                <LayoutDashboard className="w-6 h-6 text-padel-primary" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">{tournament?.name || 'Control'}</h1>
                                    <PadelRallyAnimation />
                                </div>
                                <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">
                                    {getControlSubtitle(tournament)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden lg:flex gap-2">
                                <div className="bg-[#111] border border-white/5 rounded-2xl px-4 py-2 flex flex-col items-center min-w-[80px]">
                                    <span className="text-[7px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Live</span>
                                    <span className="text-lg font-black italic text-padel-primary leading-none">{liveMatches.length}</span>
                                </div>
                                <div className="bg-[#111] border border-white/5 rounded-2xl px-4 py-2 flex flex-col items-center min-w-[80px]">
                                    <span className="text-[7px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Pend</span>
                                    <span className="text-lg font-black italic text-gray-200 leading-none">{pendingMatches.length}</span>
                                </div>
                                <div className="bg-[#111] border border-white/5 rounded-2xl px-4 py-2 flex flex-col items-center min-w-[80px]">
                                    <span className="text-[7px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Fin</span>
                                    <span className="text-lg font-black italic text-gray-600 leading-none">{finishedMatches.length}</span>
                                </div>
                                <div className="h-10 w-px bg-white/5 mx-2" />
                                <div className="flex flex-col justify-center gap-1">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-[8px] font-mono text-white/20">
                                            <Cpu className="w-2.5 h-2.5" />
                                            <span>{Math.floor(Math.random() * 5 + 8)}%</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[8px] font-mono text-white/20">
                                            <Network className="w-2.5 h-2.5" />
                                            <span>{(Math.random() * 2 + 5).toFixed(1)}MB</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-padel-primary/5 border border-padel-primary/10 rounded-md">
                                        <div className="w-1 h-1 rounded-full bg-padel-primary animate-pulse" />
                                        <span className="text-[7px] font-black text-padel-primary/60 uppercase tracking-widest text-nowrap">Core Online</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-10 w-px bg-white/5 mx-2 hidden lg:block" />

                            <div className="flex items-center gap-4">
                                <p className="text-base font-black italic tabular-nums text-white/90">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</p>
                                <Link href={`/tournaments/${id}`} className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-padel-primary/30 transition-all text-gray-400 hover:text-padel-primary">
                                    <Monitor className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
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
                <footer className="flex-shrink-0 h-9 flex items-center gap-4 px-4 lg:px-6 border-t border-white/[0.04] bg-black/20">
                    <div className="flex items-center gap-1.5">
                        <Wifi className="w-3 h-3 text-padel-primary/60" />
                        <span className="text-[7px] font-black uppercase text-gray-700 tracking-[0.2em]">Data Sync Active</span>
                    </div>
                    <div className="w-px h-3 bg-white/5" />
                    <span className="text-[7px] font-black uppercase text-gray-800 tracking-widest italic">
                        PADEL SMART CONTROL v4.0.2
                    </span>
                    <span className="ml-auto text-[7px] font-black tracking-[0.25em] uppercase text-white/5 italic">
                        © {new Date().getFullYear()} PADEL SMART SYSTEMS
                    </span>
                </footer>
            </div>
        </div>
    );
}
