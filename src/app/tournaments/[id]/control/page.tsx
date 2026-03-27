'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { getRanking, RankedTeam } from '@/lib/tournamentCore';
import { dataService } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRouteSegment } from '@/lib/useRouteSegment';
import { validateTournamentIntegrity, generatePlayoffs } from '@/lib/tournamentService';

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
    match, tournamentId, canOperate, onStartMatch, onFinishMatch,
    onToggleStream, onToggleAds, onRevertMatch, onUpdateNames, isUpdating, allPlayers
}: {
    match: EnrichedMatch;
    tournamentId: string;
    canOperate: boolean;
    onStartMatch: (id: string) => void;
    onFinishMatch: (id: string) => void;
    onToggleStream: (id: string, val: boolean) => void;
    onToggleAds: (id: string, val: boolean) => void;
    onRevertMatch: (id: string) => void;
    onUpdateNames: (id: string, names: { t1p1: string; t1p2: string; t2p1: string; t2p2: string }) => Promise<void>;
    isUpdating: boolean;
    /** Lista de jugadores del torneo para sugerencias en el editor */
    allPlayers?: { name: string; lastName?: string }[];
}) {
    const s = match.status?.toString().toUpperCase();
    const isLive = s === 'LIVE';
    const isPending = s === 'PENDING';
    const isFinished = s === 'FINISHED';

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
            await onUpdateNames(match.id, editNames);
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
                        <div className="bg-[#0d0d0d] border border-padel-primary/30 rounded-2xl p-4 space-y-3 shadow-[0_0_30px_rgba(204,255,0,0.08)]">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-widest text-padel-primary/80">✏️ Editar jugadores</span>
                                <button
                                    onClick={() => setShowEdit(false)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* datalist de jugadores disponibles */}
                            <datalist id={`players-${match.id}`}>
                                {(allPlayers || []).map((p, i) => {
                                    const full = [p.name, p.lastName].filter(Boolean).join(' ');
                                    return <option key={i} value={full} />;
                                })}
                            </datalist>

                            {/* Team 1 */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-padel-primary shadow-[0_0_6px_#ccff00]" />
                                    <span className="text-[8px] font-black text-padel-primary/70 uppercase tracking-widest">Pareja 1</span>
                                </div>
                                <input
                                    list={`players-${match.id}`}
                                    value={editNames.t1p1}
                                    onChange={e => setEditNames(prev => ({ ...prev, t1p1: e.target.value }))}
                                    placeholder="Jugador 1 — nombre y apellido"
                                    autoComplete="off"
                                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-3 text-sm font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-padel-primary/60 focus:bg-white/[0.08] transition-all"
                                />
                                <input
                                    list={`players-${match.id}`}
                                    value={editNames.t1p2}
                                    onChange={e => setEditNames(prev => ({ ...prev, t1p2: e.target.value }))}
                                    placeholder="Jugador 2 — nombre y apellido"
                                    autoComplete="off"
                                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-3 text-sm font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-padel-primary/60 focus:bg-white/[0.08] transition-all"
                                />
                            </div>

                            <div className="h-px bg-white/[0.05]" />

                            {/* Team 2 */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-white/30" />
                                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Pareja 2</span>
                                </div>
                                <input
                                    list={`players-${match.id}`}
                                    value={editNames.t2p1}
                                    onChange={e => setEditNames(prev => ({ ...prev, t2p1: e.target.value }))}
                                    placeholder="Jugador 3 — nombre y apellido"
                                    autoComplete="off"
                                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-3 text-sm font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all"
                                />
                                <input
                                    list={`players-${match.id}`}
                                    value={editNames.t2p2}
                                    onChange={e => setEditNames(prev => ({ ...prev, t2p2: e.target.value }))}
                                    placeholder="Jugador 4 — nombre y apellido"
                                    autoComplete="off"
                                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-3 text-sm font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all"
                                />
                            </div>

                            {/* Save button — large for touch */}
                            <button
                                onClick={saveNames}
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-padel-primary/15 hover:bg-padel-primary/25 active:scale-[0.98] border border-padel-primary/40 rounded-xl text-sm font-black uppercase tracking-widest text-padel-primary transition-all disabled:opacity-40"
                            >
                                <Save className="w-4 h-4" />
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
    const [activePhaseTab, setActivePhaseTab] = useState<'activa' | 'proximos' | 'finalizados' | 'posiciones'>('activa');

    const canOperate = isAdmin || (!!user && !!tournament && tournament.ownerId === user.uid) || profile?.role === 'marker';

    // Lista de todos los jugadores del torneo para sugerencias en el editor de nombres
    const allPlayers: { name: string; lastName?: string }[] = (() => {
        const PH = /pareja|jugador|placeholder/i;
        const teams: any[] = Array.isArray(tournament?.teams) ? tournament.teams : [];
        const seen = new Set<string>();
        const list: { name: string; lastName?: string }[] = [];
        teams.forEach((t: any) => {
            [t?.p1, t?.p2].forEach((p: any) => {
                if (!p) return;
                const name = (p.name || '').trim();
                if (!name || PH.test(name) || seen.has(name)) return;
                seen.add(name);
                list.push({ name, lastName: p.lastName });
            });
        });
        return list;
    })();

    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
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

        // 2. Firestore Subscriptions (Removed as they cause state conflicts with Supabase)
        // let unsubFT = () => { };
        // let unsubFM = () => { };

        // Safety timeout
        const timeout = setTimeout(() => setLoading(false), 10000);

        return () => {
            if (typeof unsubT === 'function') unsubT();
            if (typeof unsubM === 'function') unsubM();
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
        
        // Optimistic update
        const nowIso = new Date().toISOString();
        const optimisticMatch = {
            ...match,
            status: MatchStatus.LIVE,
            actualStartTime: nowIso,
            startedAt: nowIso,
            sets: { t1: 0, t2: 0 },
            games: { t1: 0, t2: 0 },
            points: { t1: 0, t2: 0 },
            server: { team: 1 as 1, player: 1 as 1 }
        };
        setMatches(prev => prev.map(m => m.id === matchId ? optimisticMatch : m));

        try {
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
        } catch (e) { 
            console.error(e);
            alert('Error al iniciar el partido. Reintentando sincronización...');
            // Error: the realtime subscription will eventually fix the state, 
            // but we could also force a reload if needed.
        }
        finally { setUpdatingId(null); }
    };

    const finishMatch = async (matchId: string) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;
        setUpdatingId(matchId);
        
        // Optimistic update
        const optimisticMatch = {
            ...match,
            status: MatchStatus.FINISHED,
            actualEndTime: new Date().toISOString()
        };
        setMatches(prev => prev.map(m => m.id === matchId ? optimisticMatch : m));

        try {
            const updatedData = {
                ...stripMatchForDb(match),
                status: MatchStatus.FINISHED,
                actualEndTime: new Date().toISOString()
            };
            await dataService.updateMatch(id, matchId, updatedData);
        } catch (e) { 
            console.error(e);
            alert('Error al finalizar el partido. Verifica tu conexión.');
        }
        finally { setUpdatingId(null); }
    };

    const toggleStream = async (matchId: string, val: boolean) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;
        setUpdatingId(matchId);
        
        // Optimistic update
        setMatches(prev => prev.map(m => m.id === matchId ? { ...m, isStreaming: val } : m));

        try {
            await dataService.updateMatch(id, matchId, { ...stripMatchForDb(match), isStreaming: val });
        } catch (e) { 
            console.error(e);
            alert('Error al cambiar el estado del stream.');
        }
        finally { setUpdatingId(null); }
    };

    const toggleAds = async (matchId: string, val: boolean) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;
        setUpdatingId(matchId);
        
        // Optimistic update
        setMatches(prev => prev.map(m => m.id === matchId ? { ...m, forcedAds: val } : m));

        try {
            await dataService.updateMatch(id, matchId, { ...stripMatchForDb(match), forcedAds: val });
        } catch (e) { 
            console.error(e);
            alert('Error al cambiar el estado de la publicidad.');
        }
        finally { setUpdatingId(null); }
    };

    const updateMatchNames = async (matchId: string, names: { t1p1: string; t1p2: string; t2p1: string; t2p2: string }) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;
        
        const buildTeam = (orig: any, p1n: string, p2n: string) => ({
            ...orig,
            p1: { ...(orig?.p1 || {}), name: p1n.trim() || orig?.p1?.name || '?' },
            p2: { ...(orig?.p2 || {}), name: p2n.trim() || orig?.p2?.name || '?' },
            p1Name: p1n.trim() || orig?.p1Name || '?',
            p2Name: p2n.trim() || orig?.p2Name || '?',
        });

        const team1 = buildTeam(match.team1, names.t1p1, names.t1p2);
        const team2 = buildTeam(match.team2, names.t2p1, names.t2p2);

        // Optimistic update - update friendly names for the UI list
        const PLACEHOLDER_RE = /pareja|jugador|placeholder/i;
        const getName = (t: any) => {
            if (t.teamLabel) return t.teamLabel;
            const p1n = (t.p1Name || '').trim();
            const p2n = (t.p2Name || '').trim();
            const hasReal = (p1n && !PLACEHOLDER_RE.test(p1n)) || (p2n && !PLACEHOLDER_RE.test(p2n));
            return hasReal ? [p1n, p2n].filter(Boolean).join(' · ') : '?';
        };

        setMatches(prev => prev.map(m => m.id === matchId ? {
            ...m,
            team1: { ...m.team1, name: getName(team1) },
            team2: { ...m.team2, name: getName(team2) }
        } : m));

        try {
            const clean = stripMatchForDb(match);
            await dataService.updateMatch(id, matchId, {
                ...clean,
                team1,
                team2
            });
        } catch (e) {
            console.error(e);
            alert('Error al actualizar los nombres.');
        }
    };

    const revertToPending = async (matchId: string) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;
        if (!confirm('¿Revertir este partido a Pendiente? Se borrará el marcador actual.')) return;
        setUpdatingId(matchId);
        
        // Optimistic update
        const optimisticMatch = {
            ...match,
            status: MatchStatus.PENDING,
            actualStartTime: null,
            startedAt: null,
            actualEndTime: null,
            isStreaming: false,
            forcedAds: false,
            sets: { t1: 0, t2: 0 },
            games: { t1: 0, t2: 0 },
            points: { t1: 0, t2: 0 },
            server: { team: 1 as 1, player: 1 as 1 }
        };
        setMatches(prev => prev.map(m => m.id === matchId ? optimisticMatch : m));

        try {
            const clean = stripMatchForDb(match);
            const updatedData = {
                ...clean,
                status: MatchStatus.PENDING,
                actualStartTime: null,
                startedAt: null,
                actualEndTime: null,
                isStreaming: false,
                forcedAds: false,
                sets: { t1: 0, t2: 0 },
                games: { t1: 0, t2: 0 },
                points: { t1: 0, t2: 0 },
                server: { team: 1 as 1, player: 1 as 1 }
            };
            await dataService.updateMatch(id, matchId, updatedData);
        } catch (e) { 
            console.error(e);
            alert('Error al revertir el partido.');
        }
        finally { setUpdatingId(null); }
    };

    const liveMatches = matches.filter(m => m.status?.toString().toUpperCase() === 'LIVE');
    const finishedMatches = matches.filter(m => m.status?.toString().toUpperCase() === 'FINISHED')
        .sort((a, b) => {
            const timeA = new Date(a.actualEndTime || a.updatedAt || a.updated_at || 0).getTime();
            const timeB = new Date(b.actualEndTime || b.updatedAt || b.updated_at || 0).getTime();
            return timeB - timeA; // Más recientes arriba
        });
    const pendingMatches = matches.filter(m => m.status?.toString().toUpperCase() === 'PENDING');

    // En 'Activa' mostramos: En Vivo, Pendientes con Pista asignada y Finalizados recientemente
    const activePhaseMatches = matches.filter(m => {
        const s = m.status?.toString().toUpperCase();
        if (s === 'LIVE') return true;
        if (s === 'PENDING') {
            return m.court !== undefined && m.court !== null && m.court !== '';
        }
        return false;
    }).sort((a, b) => {
        // Orden: LIVE primero, luego PENDING, luego FINISHED
        const sA = a.status?.toString().toUpperCase() || '';
        const sB = b.status?.toString().toUpperCase() || '';
        const score: Record<string, number> = { 
            'LIVE': 1, 
            'PENDING': 2, 
            'FINISHED': 3 
        };
        return (score[sA] || 99) - (score[sB] || 99);
    });

    const proximosMatches = matches.filter(m => {
        const s = m.status?.toString().toUpperCase();
        return s === 'PENDING' && (m.court === undefined || m.court === null || m.court === '');
    });

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

                <div className="flex-shrink-0 flex items-center gap-1 px-4 lg:px-6 pt-3 pb-2 border-b border-white/[0.04] bg-white/[0.01]">
                    {(['activa', 'proximos', 'finalizados', 'posiciones'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActivePhaseTab(tab)}
                            className={`px-3.5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all relative group
                                ${activePhaseTab === tab 
                                    ? 'bg-padel-primary/10 text-padel-primary' 
                                    : 'text-gray-600 hover:text-gray-400 hover:bg-white/[0.03]'}`}
                        >
                            <span className="flex items-center gap-2">
                                {tab === 'posiciones' && <Trophy className="w-3 h-3" />}
                                {tab}
                            </span>
                            
                            {activePhaseTab === tab && (
                                <motion.div 
                                    layoutId="activeTabUnderline"
                                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-padel-primary rounded-t-full shadow-[0_0_10px_#ccff00]" 
                                />
                            )}

                            {tab === 'activa' && activePhaseMatches.length > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-padel-primary/20 text-padel-primary text-[7px] border border-padel-primary/30">
                                    {activePhaseMatches.length}
                                </span>
                            )}
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
                                    onUpdateNames={updateMatchNames}
                                    isUpdating={updatingId === m.id}
                                    allPlayers={allPlayers}
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
                                    onUpdateNames={updateMatchNames}
                                    isUpdating={updatingId === m.id}
                                    allPlayers={allPlayers}
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
                                    onUpdateNames={updateMatchNames}
                                    isUpdating={updatingId === m.id}
                                    allPlayers={allPlayers}
                                />
                            ))}
                        </div>
                    )}

                    {activePhaseTab === 'posiciones' && <StandingsView tournament={tournament} matches={matches} />}
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

// ── Standings View Component ──────────────────────────────────────────────
function StandingsView({ tournament, matches }: { tournament: any; matches: EnrichedMatch[] }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const groupMatches = useMemo(() => 
        matches.filter(m => m.stage === 'GROUP_STAGE' || (m.stage === 'OPEN' && !!m.groupName)),
        [matches]
    );
    
    const allFinished = useMemo(() => 
        groupMatches.length > 0 && groupMatches.every(m => m.status === MatchStatus.FINISHED),
        [groupMatches]
    );
    
    const hasPlayoffs = useMemo(() => 
        matches.some(m => m.stage === 'PLAYOFFS'),
        [matches]
    );

    const groupRankings = useMemo(() => {
        if (!tournament || !matches.length) return {};
        
        const groups: Record<string, { teams: Set<string>; matches: any[] }> = {};
        
        // Extraer los equipos y partidos de grupo
        groupMatches.forEach(m => {
            const gName = m.groupName || 'A';
            if (!groups[gName]) groups[gName] = { teams: new Set(), matches: [] };
            
            // Usamos sets ganados como indicador de puntuación para el Delta (Regla Padel)
            groups[gName].matches.push({
                id: m.id,
                team1Id: m.team1Index !== undefined ? String(m.team1Index) : m.team1.name,
                team2Id: m.team2Index !== undefined ? String(m.team2Index) : m.team2.name,
                score1: m.sets?.t1 || 0,
                score2: m.sets?.t2 || 0,
                status: m.status,
                group: gName
            });
            
            if (m.team1Index !== undefined) groups[gName].teams.add(String(m.team1Index));
            if (m.team2Index !== undefined) groups[gName].teams.add(String(m.team2Index));
        });

        const results: Record<string, RankedTeam[]> = {};
        Object.entries(groups).forEach(([gName, data]) => {
            const groupTeams: any[] = Array.from(data.teams).map(tid => {
                const teamIndex = parseInt(tid);
                const teamsArr = Array.isArray(tournament?.teams) ? tournament.teams : [];
                const team = teamIndex > 0 ? teamsArr[teamIndex - 1] : null;
                return {
                    id: tid,
                    name: team ? [team.p1?.name, team.p2?.name].filter(Boolean).join(' · ') : `Pareja ${tid}`
                };
            });
            results[gName] = getRanking(groupTeams, data.matches);
        });
        
        return results;
    }, [tournament, matches]);

    if (Object.keys(groupRankings).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                <Trophy className="w-12 h-12" />
                <p className="text-[10px] font-black uppercase tracking-widest italic">No hay datos de fase de grupos disponibles.</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10 pb-20"
        >
            {Object.entries(groupRankings).map(([gName, ranking]) => (
                <div key={gName} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-padel-primary rounded-full shadow-[0_0_15px_#ccff00]" />
                            <h3 className="text-sm font-black italic uppercase tracking-widest text-white/90">GRUPO {gName}</h3>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/[0.06] rounded-full">
                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">3 PTS Victoria</span>
                            <div className="w-1 h-3 bg-white/10" />
                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">1 PTS Empate</span>
                        </div>
                    </div>
                    
                    <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.04] border-b border-white/[0.08]">
                                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">#</th>
                                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-padel-primary">Equipo / Pareja</th>
                                    <th className="px-4 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">PJ</th>
                                    <th className="px-4 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">PG</th>
                                    <th className="px-4 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">PTS</th>
                                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 text-center italic">Sets +/-</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {ranking.map((tr, idx) => {
                                    const isTopTwo = idx < 2;
                                    return (
                                        <tr key={tr.id} className="hover:bg-white/[0.01] transition-colors group">
                                            <td className="px-5 py-5">
                                                <span className={`w-7 h-7 flex items-center justify-center rounded-xl text-[11px] font-black italic border transition-all duration-300
                                                    ${idx === 0 ? 'bg-padel-primary/20 border-padel-primary/50 text-padel-primary shadow-[0_0_20px_rgba(204,255,0,0.15)] scale-110' : 
                                                      idx === 1 ? 'bg-white/10 border-white/20 text-white shadow-lg' : 'bg-transparent border-white/5 text-gray-600'}`}>
                                                    {idx + 1}
                                                </span>
                                            </td>
                                            <td className="px-5 py-5 relative">
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-black italic uppercase tracking-tight transition-all duration-300
                                                        ${isTopTwo ? 'text-white translate-x-1' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                                        {tr.name}
                                                    </span>
                                                    {isTopTwo && (
                                                        <span className="text-[7px] font-black uppercase tracking-widest text-padel-primary/40 leading-none mt-1">
                                                            ZONA CLASIFICACIÓN
                                                        </span>
                                                    )}
                                                </div>
                                                {isTopTwo && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-8 bg-padel-primary/40 shadow-[0_0_10px_#ccff00]" />
                                                )}
                                            </td>
                                            <td className="px-4 py-5 text-center text-xs font-mono font-bold text-gray-500">{tr.matchesPlayed}</td>
                                            <td className="px-4 py-5 text-center text-xs font-mono font-bold text-gray-500">{tr.victories}</td>
                                            <td className={`px-4 py-5 text-center text-sm font-black italic tabular-nums transition-all group-hover:scale-110
                                                ${idx === 0 ? 'text-padel-primary' : 'text-gray-100'}`}>
                                                {tr.totalPoints}
                                            </td>
                                            <td className={`px-5 py-5 text-center text-xs font-mono font-bold tabular-nums
                                                ${tr.pointDiff > 0 ? 'text-green-500/80' : tr.pointDiff < 0 ? 'text-red-500/80' : 'text-gray-700'}`}>
                                                {tr.pointDiff > 0 ? `+${tr.pointDiff}` : tr.pointDiff}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

            {/* Acciones de Fase de Grupos */}
            <div className="mt-12 p-8 bg-padel-primary/[0.03] border border-padel-primary/20 rounded-[2.5rem] flex flex-col items-center gap-6 text-center">
                <div className="w-16 h-16 bg-padel-primary/10 rounded-3xl flex items-center justify-center text-padel-primary">
                    <Trophy className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                    <h4 className="text-sm font-black italic uppercase tracking-widest text-white">Generar Fase Final (Playoffs)</h4>
                    <p className="text-[10px] font-bold text-gray-500 max-w-xs leading-relaxed">
                        Una vez finalizados todos los partidos de grupo, podrás generar automáticamente los cruces de semifinales (1A vs 2B y 1B vs 2A).
                    </p>
                </div>

                {!allFinished && !hasPlayoffs && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
                        <AlertCircle className="w-3 h-3 text-amber-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Pendiente: {groupMatches.filter(m => m.status !== MatchStatus.FINISHED).length} partidos</span>
                    </div>
                )}

                {msg && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl border
                            ${msg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}
                    >
                        {msg.text}
                    </motion.div>
                )}

                <button
                    disabled={!allFinished || hasPlayoffs || isGenerating}
                    onClick={async () => {
                        setIsGenerating(true);
                        setMsg(null);
                        try {
                            const catId = matches[0]?.categoryId || 'DEFAULT';
                            const res = await generatePlayoffs(tournament.id, catId);
                            if (res.success) {
                                setMsg({ type: 'success', text: `¡Éxito! Se han generado los partidos de Playoff.` });
                            } else {
                                setMsg({ type: 'error', text: `Error: ${res.error}` });
                            }
                        } catch (e: any) {
                            setMsg({ type: 'error', text: `Excepción: ${e.message}` });
                        } finally {
                            setIsGenerating(false);
                        }
                    }}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black italic uppercase tracking-tighter text-xs transition-all duration-500
                        ${allFinished && !hasPlayoffs 
                            ? 'bg-padel-primary text-black hover:scale-105 active:scale-95 shadow-[0_4px_20px_rgba(204,255,0,0.3)]' 
                            : 'bg-white/5 text-gray-700 cursor-not-allowed border border-white/5'}`}
                >
                    {isGenerating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : hasPlayoffs ? (
                        <>
                            <CheckCircle2 className="w-4 h-4" />
                            Cruces Generados
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4 fill-current" />
                            Generar Semifinales
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
}
