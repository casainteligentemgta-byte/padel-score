'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, Flag, Lock, CheckCircle2, AlertTriangle,
    ChevronRight, Swords, Users, RotateCcw, Zap, ShieldAlert,
    Gamepad2, Monitor, Camera, Tv
} from 'lucide-react';
import Link from 'next/link';
import { MatchStatus } from '@/types/tournament';
import GroupPhaseView from './GroupPhaseView';

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'GROUP_STAGE' | 'ELIMINATION' | 'COMPLETED';

interface TournamentPhaseManagerProps {
    tournament: any;
    matches: any[];
    canManage: boolean;
    onSaveResult: (matchId: string, gamesT1: number, gamesT2: number) => Promise<void>;
    onFinishGroupPhase: () => void;
    onResetElimination?: () => void; // permite volver a grupos desde eliminatorias
}

// ─── Timeline Step ─────────────────────────────────────────────────────────────

function TimelineStep({
    label, index, active, done, locked,
}: { label: string; index: number; active: boolean; done: boolean; locked: boolean }) {
    return (
        <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black transition-all
                ${done ? 'bg-green-500 text-white' : active ? 'bg-padel-primary text-black shadow-[0_0_12px_rgba(204,255,0,0.4)]' : 'bg-white/10 text-gray-600'}`}>
                {done ? <CheckCircle2 className="w-3 h-3" /> : locked ? <Lock className="w-3 h-3" /> : index + 1}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest whitespace-nowrap
                ${done ? 'text-green-400' : active ? 'text-padel-primary' : 'text-gray-600'}`}>
                {label}
            </span>
        </div>
    );
}

// ─── Bracket Match Card ────────────────────────────────────────────────────────

function BracketMatchCard({
    match, roundLabel, canEdit, onSave, tournamentId
}: {
    match: any;
    roundLabel: string;
    canEdit: boolean;
    onSave?: (g1: number, g2: number) => void;
    tournamentId: string;
}) {
    const [g1, setG1] = useState(match?.games?.t1 ?? 0);
    const [g2, setG2] = useState(match?.games?.t2 ?? 0);
    const [saving, setSaving] = useState(false);

    const isFinished = match?.status === MatchStatus.FINISHED;
    const isTBD = match?.team1?.isTBD || match?.team2?.isTBD || (!match?.team1Name && !match?.team2Name);

    const t1Name = match?.team1Name ?? match?.team1?.p1?.name ?? '?';
    const t2Name = match?.team2Name ?? match?.team2?.p1?.name ?? '?';
    const score1 = match?.games?.t1 ?? 0;
    const score2 = match?.games?.t2 ?? 0;

    const handleSave = async () => {
        if (!onSave || g1 === g2) return;
        setSaving(true);
        await onSave(g1, g2);
        setSaving(false);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border overflow-hidden
                ${isFinished ? 'border-green-500/20 bg-green-500/5' :
                    isTBD ? 'border-white/5 bg-white/[0.02] opacity-50' :
                        'border-white/10 bg-white/[0.03] hover:border-white/20'} transition-all`}
        >
            {/* Round label */}
            <div className="px-3 py-1 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">{roundLabel}</span>
                {isFinished && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                {isTBD && <Lock className="w-3 h-3 text-gray-700" />}
            </div>

            {/* Teams */}
            <div className="p-3 space-y-1.5">
                {/* Team 1 */}
                <div className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg
                    ${isFinished && score1 > score2 ? 'bg-padel-primary/10 border border-padel-primary/20' : 'bg-white/5'}`}>
                    <p className={`text-[10px] font-black italic uppercase truncate flex-1 leading-none
                        ${isTBD ? 'text-gray-600 italic' : isFinished && score1 > score2 ? 'text-padel-primary' : 'text-white'}`}>
                        {isTBD ? t1Name : t1Name}
                    </p>
                    <span className={`text-sm font-black w-5 text-right
                        ${isFinished && score1 > score2 ? 'text-padel-primary' : 'text-gray-400'}`}>
                        {isFinished ? score1 : '—'}
                    </span>
                </div>

                {/* Team 2 */}
                <div className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg
                    ${isFinished && score2 > score1 ? 'bg-padel-primary/10 border border-padel-primary/20' : 'bg-white/5'}`}>
                    <p className={`text-[10px] font-black italic uppercase truncate flex-1 leading-none
                        ${isTBD ? 'text-gray-600 italic' : isFinished && score2 > score1 ? 'text-padel-primary' : 'text-white'}`}>
                        {isTBD ? t2Name : t2Name}
                    </p>
                    <span className={`text-sm font-black w-5 text-right
                        ${isFinished && score2 > score1 ? 'text-padel-primary' : 'text-gray-400'}`}>
                        {isFinished ? score2 : '—'}
                    </span>
                </div>

                {/* Score input for unfinished matches */}
                {!isFinished && !isTBD && canEdit && onSave && (
                    <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
                        <input type="number" min={0} max={10} value={g1}
                            onChange={e => setG1(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
                            className="w-9 h-8 bg-white/5 border border-white/10 rounded-lg text-center text-sm font-black text-white outline-none focus:border-padel-primary" />
                        <span className="text-gray-600 font-black text-xs">—</span>
                        <input type="number" min={0} max={10} value={g2}
                            onChange={e => setG2(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
                            className="w-9 h-8 bg-white/5 border border-white/10 rounded-lg text-center text-sm font-black text-white outline-none focus:border-padel-primary" />
                        <button onClick={handleSave} disabled={saving || g1 === g2}
                            className="flex-1 h-8 rounded-lg bg-padel-primary hover:bg-white text-black text-[9px] font-black uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center">
                            {saving
                                ? <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                : <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                )}
            </div>

            {/* Dock de acciones: 4 botones (Control, Pizarra, Cámaras, Publicidad) */}
            {canEdit && !isFinished && !isTBD && match.id && (
                <div className="grid grid-cols-4 gap-px bg-white/[0.04] border-t border-white/[0.08]">
                    {/* CONTROL */}
                    <Link
                        href={`/tournaments/${tournamentId}/score/${match.id}`}
                        className={`flex flex-col items-center justify-center gap-1 py-1.5 transition-all active:scale-95
                            ${match.status === MatchStatus.LIVE
                                ? 'bg-padel-primary/10 text-padel-primary hover:bg-padel-primary/20'
                                : 'bg-white/[0.02] text-gray-500 hover:bg-white/[0.06] hover:text-padel-primary'
                            }`}
                    >
                        <div className="relative">
                            <Gamepad2 className="w-3 h-3" />
                            {match.status === MatchStatus.LIVE && (
                                <span className="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full bg-padel-primary shadow-[0_0_4px_rgba(204,255,0,0.8)] animate-pulse" />
                            )}
                        </div>
                        <span className="text-[6px] font-black uppercase tracking-widest text-center">Control</span>
                    </Link>

                    {/* PIZARRA */}
                    <Link
                        href={match.status === MatchStatus.LIVE ? `/tournaments/${tournamentId}/display/${match.id}` : `/tournaments/${tournamentId}/monitor`}
                        target="_blank"
                        className="flex flex-col items-center justify-center gap-1 py-1.5 bg-white/[0.02] text-gray-500 hover:bg-white/[0.06] hover:text-white transition-all active:scale-95"
                    >
                        <Monitor className="w-3 h-3" />
                        <span className="text-[6px] font-black uppercase tracking-widest text-center">Pizarra</span>
                    </Link>

                    {/* CÁMARAS */}
                    <Link
                        href={`/tournaments/${tournamentId}/control/broadcasting`}
                        target="_blank"
                        className="flex flex-col items-center justify-center gap-1 py-1.5 bg-white/[0.02] text-gray-500 hover:bg-white/[0.06] hover:text-orange-400 transition-all active:scale-95"
                    >
                        <Camera className="w-3 h-3" />
                        <span className="text-[6px] font-black uppercase tracking-widest text-center">Cámaras</span>
                    </Link>

                    {/* PUBLICIDAD */}
                    <Link
                        href={`/tournaments/${tournamentId}/control/broadcasting`}
                        target="_blank"
                        className="flex flex-col items-center justify-center gap-1 py-1.5 bg-white/[0.02] text-gray-500 hover:bg-white/[0.06] hover:text-yellow-400 transition-all active:scale-95"
                    >
                        <Tv className="w-3 h-3" />
                        <span className="text-[6px] font-black uppercase tracking-widest text-center">Publicidad</span>
                    </Link>
                </div>
            )}
        </motion.div>
    );
}

// ─── Bracket View ─────────────────────────────────────────────────────────────

function BracketView({
    matches, canManage, locked, onSaveResult, tournamentId
}: {
    matches: any[];
    canManage: boolean;
    locked: boolean;
    onSaveResult: (matchId: string, g1: number, g2: number) => Promise<void>;
    tournamentId: string;
}) {
    const roundUpper = (m: any) => (m.roundName || '').toUpperCase();
    const isSemifinal = (m: any) =>
        m.stage === 'SEMIFINAL' || roundUpper(m).includes('SEMIFINAL') || (m.isKnockout && !m.isFinal);
    const isFinal = (m: any) =>
        m.stage === 'FINAL' || m.isFinal || (roundUpper(m) === 'FINAL' || (roundUpper(m).includes('FINAL') && !roundUpper(m).includes('SEMIFINAL')));

    const knockoutMatches = matches.filter(m =>
        m.stage === 'SEMIFINAL' || m.stage === 'FINAL' ||
        m.roundName === 'SEMIFINAL' || m.roundName === 'SEMIFINALES' || m.roundName === 'FINAL' ||
        (m.stage === 'MAIN_DRAW' && (roundUpper(m).includes('SEMIFINAL') || roundUpper(m) === 'FINAL')) ||
        m.isFinal || m.isKnockout
    );

    const semis = knockoutMatches.filter(m => isSemifinal(m));
    const finals = knockoutMatches.filter(m => isFinal(m));

    // ── Orden lógico: Octavos → Cuartos → Semis → Final (Final al final del scroll)
    // Hooks (useMemo) deben ejecutarse siempre: NO poner return condicionales antes.
    const getRoundOrder = (name: string): number => {
        const upper = (name || '').toUpperCase();
        if (upper.includes('DIECISEISAVOS') || upper.includes('16')) return 1;
        if (upper.includes('OCTAVOS') || upper.includes('8VO')) return 2;
        if (upper.includes('CUARTOS') || upper.includes('PRINCIPAL R1') || upper.includes('CONSOLACIÓN R1')) return 3;
        if (upper.includes('SEMIFINAL') && !upper.includes('FINAL')) return 4;
        if (upper.includes('CONSOLACIÓN FINAL')) return 4;
        if (upper.includes('FINAL') && !upper.includes('SEMI') || upper.includes('PRINCIPAL FINAL')) return 5;
        if (name === 'Principal R1' || name === 'Consolación R1') return 3;
        if (name === 'Principal SF') return 4;
        if (name === 'Principal FINAL' || name === 'FINAL') return 5;
        return 10;
    };

    const rounds = useMemo(() => {
        const byRound: Record<string, any[]> = {};
        knockoutMatches.forEach((m) => {
            const key = m.roundName || 'Eliminatoria';
            if (!byRound[key]) byRound[key] = [];
            byRound[key].push(m);
        });
        return Object.entries(byRound).map(([name, matches]) => ({ id: name, name, matches }));
    }, [knockoutMatches]);

    const sortedRounds = useMemo(
        () => [...rounds].sort((a, b) => getRoundOrder(a.name) - getRoundOrder(b.name)),
        [rounds]
    );

    // ── Locked state ────────────────────────────────────────────────────────
    if (locked) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 gap-4 bg-white/[0.02] border border-dashed border-white/10 rounded-[2rem]"
            >
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-gray-600" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-sm font-black italic uppercase tracking-tighter text-gray-500">
                        Esperando resultados de grupos
                    </p>
                    <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">
                        Completa todos los partidos de la fase de grupos para desbloquear las eliminatorias
                    </p>
                </div>
            </motion.div>
        );
    }

    // ── Empty state (groups done but no knockout matches yet) ─────────────
    if (knockoutMatches.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 gap-4 bg-padel-primary/5 border border-dashed border-padel-primary/20 rounded-[2rem]"
            >
                <div className="w-14 h-14 rounded-full bg-padel-primary/10 border border-padel-primary/20 flex items-center justify-center animate-pulse">
                    <Swords className="w-6 h-6 text-padel-primary" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-sm font-black italic uppercase tracking-tighter text-padel-primary">
                        ¡Fase de grupos completada!
                    </p>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                        Usa el botón "Cerrar Fase y Generar Llaves" para crear el cuadro
                    </p>
                </div>
            </motion.div>
        );
    }

    // ── Bracket tree: flex-row para flujo izquierda→derecha (Octavos … Final)
    return (
        <div className="flex flex-row justify-start gap-8 overflow-x-auto p-4 min-h-[200px] bg-[#0a0a0a]">
            {sortedRounds.map((round) => (
                <div key={round.id} className="flex flex-col justify-around gap-4 flex-shrink-0">
                    <h3 className="text-center text-[#ccff00] font-bold uppercase text-[10px] tracking-widest">
                        {round.name}
                    </h3>
                    <div className="flex flex-col gap-3">
                        {round.matches.map((match, i) => (
                            <BracketMatchCard
                                key={match.id ?? i}
                                match={match}
                                roundLabel={round.name}
                                canEdit={canManage}
                                onSave={(g1, g2) => onSaveResult(match.id, g1, g2)}
                                tournamentId={tournamentId}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────

export default function TournamentPhaseManager({
    tournament,
    matches,
    canManage,
    onSaveResult,
    onFinishGroupPhase,
    onResetElimination,
}: TournamentPhaseManagerProps) {
    const [activeTab, setActiveTab] = useState<'groups' | 'bracket'>('groups');
    const [showResetWarning, setShowResetWarning] = useState(false);

    // ── Phase detection: regla = primero fase de grupos, después semifinales y final ───────────────────
    const groupMatches = useMemo(() => matches.filter(m =>
        m.stage === 'GROUP_STAGE' ||
        m.roundName === 'Fase de Grupos' ||
        m.groupName != null
    ), [matches]);

    const eliminationMatches = useMemo(() => matches.filter(m => {
        const r = (m.roundName || '').toUpperCase();
        return m.stage === 'SEMIFINAL' || m.stage === 'FINAL' || m.stage === 'MAIN_DRAW' ||
            m.isKnockout || m.isFinal ||
            m.roundName === 'SEMIFINAL' || m.roundName === 'SEMIFINALES' || m.roundName === 'FINAL' ||
            r.includes('SEMIFINAL') || r === 'FINAL' || (r.includes('FINAL') && !r.includes('SEMIFINAL')) ||
            m.roundName === 'Principal SF' || m.roundName === 'Principal FINAL' ||
            m.roundName === 'CUARTOS';
    }), [matches]);

    const finishedGroupMatches = groupMatches.filter(m => m.status === MatchStatus.FINISHED);
    const allGroupsDone = groupMatches.length > 0 && finishedGroupMatches.length === groupMatches.length;
    const groupProgressPct = groupMatches.length > 0
        ? Math.round((finishedGroupMatches.length / groupMatches.length) * 100)
        : 0;
    const pendingGroupCount = groupMatches.length - finishedGroupMatches.length;

    const eliminationStarted = eliminationMatches.length > 0;
    const eliminationDone = eliminationStarted && eliminationMatches.every(m => m.status === MatchStatus.FINISHED);

    const currentPhase: Phase = eliminationDone
        ? 'COMPLETED'
        : eliminationStarted
            ? 'ELIMINATION'
            : 'GROUP_STAGE';

    // ── Phase timeline config ─────────────────────────────────────────────
    const timelineSteps = [
        { label: 'Fase Grupos', done: allGroupsDone || eliminationStarted, active: currentPhase === 'GROUP_STAGE' },
        { label: 'Eliminatorias', done: eliminationDone, active: currentPhase === 'ELIMINATION', locked: !allGroupsDone && !eliminationStarted },
        { label: 'Completado', done: eliminationDone, active: false, locked: !eliminationStarted },
    ];

    // ── Bracket locked if groups not done ─────────────────────────────────
    const bracketLocked = !allGroupsDone && !eliminationStarted;

    return (
        <div className="space-y-5">

            {/* ── Phase Timeline ─────────────────────────────────────────────── */}
            <div className="bg-[#0d0d0d] border border-white/8 rounded-[2rem] p-4 space-y-3">

                {/* Steps */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {timelineSteps.map((step, i) => (
                        <div key={i} className="flex items-center gap-2 flex-shrink-0">
                            <TimelineStep
                                label={step.label}
                                index={i}
                                active={step.active}
                                done={step.done}
                                locked={step.locked ?? false}
                            />
                            {i < timelineSteps.length - 1 && (
                                <ChevronRight className={`w-3 h-3 flex-shrink-0 ${step.done ? 'text-green-500' : 'text-white/10'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Progress bar (groups) */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest">
                        <span className="text-gray-700">
                            {currentPhase === 'GROUP_STAGE'
                                ? `Faltan ${pendingGroupCount} partido${pendingGroupCount !== 1 ? 's' : ''} para definir clasificados`
                                : currentPhase === 'ELIMINATION'
                                    ? 'Fase eliminatoria en curso'
                                    : '🏆 Torneo finalizado'}
                        </span>
                        <span className={allGroupsDone ? 'text-green-400' : 'text-padel-primary'}>
                            {groupProgressPct}% grupos
                        </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full rounded-full ${allGroupsDone ? 'bg-green-500' : 'bg-padel-primary'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${groupProgressPct}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* Warning: groups not done but bracket requested */}
                <AnimatePresence>
                    {!allGroupsDone && activeTab === 'bracket' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-4 py-2.5"
                        >
                            <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                            <p className="text-[9px] font-bold text-yellow-300 uppercase tracking-wide">
                                Faltan {pendingGroupCount} partido{pendingGroupCount !== 1 ? 's' : ''} de grupo.
                                Las eliminatorias estarán disponibles al completar todos los grupos.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Elimination lock warning when trying to access groups after elimination started */}
                <AnimatePresence>
                    {eliminationStarted && activeTab === 'groups' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-2.5"
                        >
                            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-red-300 uppercase tracking-wide">
                                    Fase de eliminación iniciada — resultados de grupos bloqueados
                                </p>
                                {canManage && onResetElimination && (
                                    <button
                                        onClick={() => setShowResetWarning(true)}
                                        className="mt-1.5 flex items-center gap-1 text-[8px] font-black text-red-400/70 hover:text-red-400 uppercase tracking-widest transition-colors"
                                    >
                                        <RotateCcw className="w-2.5 h-2.5" /> Reset de fase (se perderán llaves)
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Tab toggle: Grupos / Bracket ─────────────────────────────────── */}
            <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl self-start">
                {([
                    { key: 'groups', icon: Users, label: 'Grupos' },
                    { key: 'bracket', icon: Swords, label: 'Eliminatorias' },
                ] as const).map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative
                            ${activeTab === tab.key
                                ? 'bg-padel-primary text-black shadow-lg shadow-padel-primary/20'
                                : 'text-gray-500 hover:text-white'}`}
                    >
                        <tab.icon className="w-3 h-3" />
                        {tab.label}
                        {/* Lock badge */}
                        {tab.key === 'bracket' && bracketLocked && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gray-700 rounded-full flex items-center justify-center">
                                <Lock className="w-2 h-2 text-gray-400" />
                            </span>
                        )}
                        {/* Active badge for elimination */}
                        {tab.key === 'bracket' && eliminationStarted && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-padel-primary rounded-full animate-pulse" />
                        )}
                    </button>
                ))}
            </div>

            {/* ── Tab content ──────────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {activeTab === 'groups' ? (
                    <motion.div
                        key="groups"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <GroupPhaseView
                            tournament={tournament}
                            matches={matches}
                            // Block editing if elimination has started
                            canManage={canManage && !eliminationStarted}
                            onSaveResult={onSaveResult}
                            onFinishGroupPhase={onFinishGroupPhase}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="bracket"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <BracketView
                            matches={matches}
                            canManage={canManage}
                            locked={bracketLocked}
                            onSaveResult={onSaveResult}
                            tournamentId={tournament.id}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── "Cerrar Fase y Generar Llaves" button ────────────────────────── */}
            <AnimatePresence>
                {canManage && allGroupsDone && !eliminationStarted && (
                    <motion.div
                        key="generate-bracket-btn"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        className="fixed bottom-6 right-4 z-40 flex flex-col items-end gap-2"
                    >
                        <div className="bg-[#111] border border-padel-primary/30 rounded-2xl px-4 py-2.5 max-w-[220px] shadow-xl shadow-padel-primary/10">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                <p className="text-[8px] font-black text-green-400 uppercase tracking-widest">
                                    ¡Todos los grupos completos!
                                </p>
                            </div>
                            <p className="text-[9px] text-gray-500 font-bold mt-0.5">
                                Los 2 mejores de cada grupo avanzan a las llaves.
                            </p>
                        </div>
                        <button
                            onClick={onFinishGroupPhase}
                            className="flex items-center gap-2 px-5 py-3.5 bg-padel-primary hover:bg-white text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-padel-primary/30 transition-all active:scale-95"
                        >
                            <Flag className="w-4 h-4" />
                            Cerrar Fase y Generar Llaves
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── In-progress FAB (groups not done) ─────────────────────────────── */}
            <AnimatePresence>
                {canManage && !allGroupsDone && !eliminationStarted && (
                    <motion.div
                        key="progress-fab"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed bottom-6 right-4 z-40 flex items-center gap-2 px-4 py-2.5 bg-[#111] border border-white/15 rounded-2xl shadow-xl text-xs font-black uppercase text-gray-500 tracking-wider"
                    >
                        <Zap className="w-3.5 h-3.5 text-padel-primary animate-pulse" />
                        {groupProgressPct}% grupos · {pendingGroupCount} pendientes
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Reset phase warning modal ─────────────────────────────────────── */}
            <AnimatePresence>
                {showResetWarning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowResetWarning(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#111] border border-red-500/30 rounded-[2rem] p-6 max-w-sm w-full shadow-2xl space-y-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black italic uppercase tracking-tighter text-white">Reset de Fase</h3>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Acción irreversible</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 font-bold leading-relaxed">
                                ¿Seguro que quieres <span className="text-red-400">eliminar todas las llaves generadas</span>?
                                Los resultados de la fase de grupos se conservarán pero el cuadro de eliminatorias se borrará por completo.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowResetWarning(false)}
                                    className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => { setShowResetWarning(false); onResetElimination?.(); }}
                                    className="flex-1 py-2.5 bg-red-500/20 border border-red-500/30 rounded-xl text-[10px] font-black uppercase text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                >
                                    Sí, resetear llaves
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
