'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    ChevronRight,
    Calendar,
    BarChart3,
    CheckCircle2,
    Zap,
    Users,
    ArrowRight,
    Flag,
    Lock,
    Gamepad2,
    Monitor,
    Camera,
    Tv
} from 'lucide-react';
import Link from 'next/link';
import { MatchStatus } from '@/types/tournament';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GroupTeam {
    id: string;
    name: string;
    tNum: number; // 1-based index in tournament.teams
    PJ: number;  // Partidos Jugados
    PG: number;  // Partidos Ganados
    JF: number;  // Juegos a Favor
    JC: number;  // Juegos en Contra
    Pts: number; // Puntos (3 por victoria)
}

interface GroupFixtureMatch {
    id: string;
    team1Index: number;
    team2Index: number;
    team1Name: string;
    team2Name: string;
    status: string;
    sets?: { t1: number; t2: number };
    games?: { t1: number; t2: number };
    scheduledTime?: any;
    time?: any;
    court?: string | number;
    stage: string;
}

interface GroupPhaseViewProps {
    tournament: any;
    matches: any[];
    canManage: boolean;
    onSaveResult: (matchId: string, gamesT1: number, gamesT2: number) => Promise<void>;
    onFinishGroupPhase: () => void;
}

// ─── Tiebreak: Head to Head ───────────────────────────────────────────────────

function resolveH2H(teamA: GroupTeam, teamB: GroupTeam, matchesInGroup: GroupFixtureMatch[]): number {
    const h2h = matchesInGroup.filter(
        m =>
            m.status === MatchStatus.FINISHED &&
            ((m.team1Index === teamA.tNum && m.team2Index === teamB.tNum) ||
                (m.team1Index === teamB.tNum && m.team2Index === teamA.tNum))
    );
    let wA = 0, wB = 0;
    for (const m of h2h) {
        const g1 = m.games?.t1 ?? 0;
        const g2 = m.games?.t2 ?? 0;
        if (m.team1Index === teamA.tNum) {
            if (g1 > g2) wA++; else wB++;
        } else {
            if (g2 > g1) wA++; else wB++;
        }
    }
    return wB - wA; // positive → B better
}

function sortStandings(teams: GroupTeam[], matchesInGroup: GroupFixtureMatch[]): GroupTeam[] {
    return [...teams].sort((a, b) => {
        // 1. Puntos
        if (b.Pts !== a.Pts) return b.Pts - a.Pts;
        // 2. Diferencia de juegos
        const diffA = a.JF - a.JC;
        const diffB = b.JF - b.JC;
        if (diffB !== diffA) return diffB - diffA;
        // 3. Head to Head
        return resolveH2H(a, b, matchesInGroup);
    });
}

// ─── Round Robin fixture generator (berger / round-robin) ─────────────────────

function generateRoundRobinPairings(n: number): [number, number][][] {
    // Returns rounds: each round is an array of [teamA_idx, teamB_idx] (0-based)
    const rounds: [number, number][][] = [];
    const teams = Array.from({ length: n }, (_, i) => i);
    if (n % 2 === 1) teams.push(-1); // bye
    const total = teams.length;
    const numRounds = total - 1;
    for (let r = 0; r < numRounds; r++) {
        const round: [number, number][] = [];
        for (let i = 0; i < total / 2; i++) {
            const a = teams[i];
            const b = teams[total - 1 - i];
            if (a !== -1 && b !== -1) round.push([a, b]);
        }
        rounds.push(round);
        // rotate all except last
        const last = teams.pop()!;
        teams.splice(1, 0, last);
    }
    return rounds;
}

// ─── Score input component ────────────────────────────────────────────────────

function ScoreInput({
    matchId,
    defaultG1,
    defaultG2,
    disabled,
    onSave,
}: {
    matchId: string;
    defaultG1: number;
    defaultG2: number;
    disabled: boolean;
    onSave: (g1: number, g2: number) => void;
}) {
    const [g1, setG1] = useState(defaultG1);
    const [g2, setG2] = useState(defaultG2);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await onSave(g1, g2);
        setSaving(false);
    };

    return (
        <div className="flex items-center gap-1.5">
            <input
                type="number"
                min={0}
                max={10}
                value={g1}
                disabled={disabled}
                onChange={e => setG1(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
                className="w-10 h-9 bg-white/5 border border-white/10 rounded-lg text-center text-sm font-black text-white outline-none focus:border-padel-primary disabled:opacity-40 transition-colors"
            />
            <span className="text-xs font-black text-gray-600">—</span>
            <input
                type="number"
                min={0}
                max={10}
                value={g2}
                disabled={disabled}
                onChange={e => setG2(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
                className="w-10 h-9 bg-white/5 border border-white/10 rounded-lg text-center text-sm font-black text-white outline-none focus:border-padel-primary disabled:opacity-40 transition-colors"
            />
            {!disabled && (
                <button
                    onClick={handleSave}
                    disabled={saving || g1 === g2}
                    title={g1 === g2 ? 'No puede ser empate' : 'Guardar resultado'}
                    className="h-9 w-9 rounded-lg bg-padel-primary hover:opacity-90 text-black flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {saving
                        ? <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        : <CheckCircle2 className="w-4 h-4" />
                    }
                </button>
            )}
        </div>
    );
}

// ─── Rank badge ───────────────────────────────────────────────────────────────

function RankBadge({ rank, qualifying }: { rank: number; qualifying: boolean }) {
    if (rank === 1) return (
        <div className="w-6 h-6 rounded-md bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center">
            <Trophy className="w-3 h-3 text-yellow-400" />
        </div>
    );
    if (rank === 2 && qualifying) return (
        <div className="w-6 h-6 rounded-md bg-padel-primary/20 border border-padel-primary/40 flex items-center justify-center text-[9px] font-black text-padel-primary">2</div>
    );
    return (
        <div className="w-6 h-6 rounded-md bg-white/5 border border-white/5 flex items-center justify-center text-[9px] font-black text-gray-500">{rank}</div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GroupPhaseView({
    tournament,
    matches,
    canManage,
    onSaveResult,
    onFinishGroupPhase,
}: GroupPhaseViewProps) {
    const [activeView, setActiveView] = useState<'standings' | 'calendar'>('standings');
    const [activeGroup, setActiveGroup] = useState<string | null>(null);
    const [finishConfirm, setFinishConfirm] = useState(false);

    // Derive group assignments
    const groupAssignments: Record<string, string[]> = tournament?.groupAssignments ?? {};
    const groupNames = Object.keys(groupAssignments).sort();

    const currentGroup = activeGroup ?? groupNames[0] ?? null;

    const fullName = (p: any) => {
        if (!p) return '';
        return [p.name, p.lastName].filter(Boolean).join(' ').trim() || (typeof p.name === 'string' ? p.name : '') || '';
    };

    // Nombres de pareja extraídos de partidos (fallback cuando tournament.teams no tiene p2).
    // Solo usamos id explícito (m.team1?.id / m.team2?.id) para no mezclar equipos de distintas categorías.
    const namesFromMatches = useMemo(() => {
        const map: Record<string, { p1: string; p2: string }> = {};
        const groupStageMatches = (matches ?? []).filter((m: any) => m.stage === 'GROUP_STAGE');
        groupStageMatches.forEach((m: any) => {
            const add = (teamId: string | undefined, mTeam: any, fullNameStr: string | undefined) => {
                if (!teamId) return;
                const id = String(teamId);
                const p1 = fullName(mTeam?.p1) || mTeam?.p1Name || (fullNameStr ? fullNameStr.split(/\s*\/\s*/)[0]?.trim() : null);
                const p2 = fullName(mTeam?.p2) || mTeam?.p2Name || (fullNameStr ? fullNameStr.split(/\s*\/\s*/)[1]?.trim() : null);
                if (p1 || p2) {
                    if (!map[id]) map[id] = { p1: '', p2: '' };
                    if (p1) map[id].p1 = p1;
                    if (p2) map[id].p2 = p2;
                }
            };
            const id1 = m.team1?.id;
            const id2 = m.team2?.id;
            if (id1) add(id1, m.team1, m.team1Name);
            if (id2) add(id2, m.team2, m.team2Name);
        });
        return map;
    }, [tournament?.teams, matches]);

    // ── Build standings per group ─────────────────────────────────────────────
    const groupStandings = useMemo(() => {
        const result: Record<string, GroupTeam[]> = {};

        for (const [gName, teamIds] of Object.entries(groupAssignments)) {
            const teams: GroupTeam[] = (teamIds as string[]).map(tid => {
                const teamIdx = (tournament?.teams ?? []).findIndex((t: any) => String(t.id) === tid);
                const team = teamIdx >= 0 ? tournament.teams[teamIdx] : null;
                const tNum = teamIdx + 1;
                const fromMatch = namesFromMatches[tid];
                const p1 = fullName(team?.p1)?.trim() || fromMatch?.p1 || 'J1';
                const p2 = fullName(team?.p2)?.trim() || fromMatch?.p2 || 'J2';
                const name = (team || fromMatch) ? `${p1} / ${p2}` : `Pareja ${tNum}`;

                let PJ = 0, PG = 0, JF = 0, JC = 0;

                matches.filter(m => m.status === MatchStatus.FINISHED &&
                    m.stage === 'GROUP_STAGE' &&
                    (m.team1Index === tNum || m.team2Index === tNum)
                ).forEach(m => {
                    const side = m.team1Index === tNum ? 't1' : 't2';
                    const opp = side === 't1' ? 't2' : 't1';
                    PJ++;
                    JF += m.games?.[side] ?? 0;
                    JC += m.games?.[opp] ?? 0;
                    const sWon = m.sets?.[side] ?? 0;
                    const sLost = m.sets?.[opp] ?? 0;
                    const gWon = m.games?.[side] ?? 0;
                    const gLost = m.games?.[opp] ?? 0;
                    if (sWon > sLost || (sWon === sLost && gWon > gLost)) PG++;
                });

                return { id: tid, name, tNum, PJ, PG, JF, JC, Pts: PG * 3 };
            });

            // Matches within this group for H2H resolution
            const tNums = teams.map(t => t.tNum);
            const intraMatches = matches.filter(
                m => tNums.includes(m.team1Index) && tNums.includes(m.team2Index)
            ) as GroupFixtureMatch[];

            result[gName] = sortStandings(teams, intraMatches);
        }

        return result;
    }, [tournament, matches, groupAssignments, namesFromMatches]);

    // ── Build fixture per group ──────────────────────────────────────────────
    const groupFixtures = useMemo(() => {
        const result: Record<string, GroupFixtureMatch[][]> = {};

        for (const [gName, teamIds] of Object.entries(groupAssignments)) {
            const tNums: number[] = (teamIds as string[]).map(tid => {
                const idx = (tournament?.teams ?? []).findIndex((t: any) => String(t.id) === tid);
                return idx + 1;
            });

            const pairings = generateRoundRobinPairings(tNums.length);
            const rounds: GroupFixtureMatch[][] = pairings.map(round =>
                round.map(([ai, bi]) => {
                    const t1Num = tNums[ai];
                    const t2Num = tNums[bi];
                    const existingMatch = matches.find(
                        m => m.stage === 'GROUP_STAGE' &&
                            ((m.team1Index === t1Num && m.team2Index === t2Num) ||
                                (m.team1Index === t2Num && m.team2Index === t1Num))
                    );
                    const team1 = (tournament?.teams ?? [])[t1Num - 1];
                    const team2 = (tournament?.teams ?? [])[t2Num - 1];
                    const tid1 = team1?.id != null ? String(team1.id) : null;
                    const tid2 = team2?.id != null ? String(team2.id) : null;
                    const from1 = tid1 ? namesFromMatches[tid1] : null;
                    const from2 = tid2 ? namesFromMatches[tid2] : null;
                    const t1Name = team1 || from1 ? `${fullName(team1?.p1)?.trim() || from1?.p1 || 'J1'} / ${fullName(team1?.p2)?.trim() || from1?.p2 || 'J2'}` : `Pareja ${t1Num}`;
                    const t2Name = team2 || from2 ? `${fullName(team2?.p1)?.trim() || from2?.p1 || 'J1'} / ${fullName(team2?.p2)?.trim() || from2?.p2 || 'J2'}` : `Pareja ${t2Num}`;

                    return existingMatch
                        ? { ...existingMatch, team1Name: t1Name, team2Name: t2Name }
                        : {
                            id: `pending-${t1Num}-${t2Num}`,
                            team1Index: t1Num,
                            team2Index: t2Num,
                            team1Name: t1Name,
                            team2Name: t2Name,
                            status: MatchStatus.PENDING,
                            stage: 'GROUP_STAGE',
                        };
                })
            );

            result[gName] = rounds;
        }
        return result;
    }, [tournament, matches, groupAssignments, namesFromMatches]);

    // ── Progress ──────────────────────────────────────────────────────────────
    const groupMatches = matches.filter(m => m.stage === 'GROUP_STAGE');
    const finishedGroupMatches = groupMatches.filter(m => m.status === MatchStatus.FINISHED);
    const allGroupsDone = groupMatches.length > 0 && finishedGroupMatches.length === groupMatches.length;
    const progressPct = groupMatches.length > 0
        ? Math.round((finishedGroupMatches.length / groupMatches.length) * 100)
        : 0;

    if (groupNames.length === 0) {
        return (
            <div className="py-20 text-center space-y-4 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                    <Trophy className="w-8 h-8 text-white" />
                </div>
                <p className="text-xs font-black italic uppercase text-gray-600 tracking-widest">No se han generado grupos</p>
            </div>
        );
    }

    const currentStandings = groupStandings[currentGroup ?? ''] ?? [];
    const currentFixture = groupFixtures[currentGroup ?? ''] ?? [];
    const groupSize = tournament?.groupSize ?? 4;
    const qualifyingSpots = Math.min(2, currentStandings.length);

    return (
        <div className="space-y-4 relative">

            {/* ── Header + View toggle ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-padel-primary/10 border border-padel-primary/20 rounded-2xl flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-padel-primary" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase italic tracking-tighter text-white">Fase de Grupos</h2>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                            Round Robin · Grupos de {groupSize} · 3 pts/victoria
                        </p>
                    </div>
                </div>

                {/* View toggle */}
                <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl self-start sm:self-auto">
                    {([
                        { key: 'standings', icon: BarChart3, label: 'Tabla' },
                        { key: 'calendar', icon: Calendar, label: 'Calendario' },
                    ] as const).map(v => (
                        <button
                            key={v.key}
                            onClick={() => setActiveView(v.key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === v.key
                                ? 'bg-padel-primary text-black shadow-lg shadow-padel-primary/20'
                                : 'text-gray-500 hover:text-padel-primary'
                                }`}
                        >
                            <v.icon className="w-3 h-3" />
                            {v.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Progress bar ────────────────────────────────────────────────── */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                    <span className="text-gray-600">Progreso fase de grupos</span>
                    <span className={allGroupsDone ? 'text-green-400' : 'text-padel-primary'}>
                        {finishedGroupMatches.length}/{groupMatches.length} partidos
                    </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full ${allGroupsDone ? 'bg-green-500' : 'bg-padel-primary'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* ── Group tabs ──────────────────────────────────────────────────── */}
            <div className="overflow-x-auto no-scrollbar">
                <div className="flex gap-2 pb-1 w-max">
                    {groupNames.map(name => (
                        <button
                            key={name}
                            onClick={() => setActiveGroup(name)}
                            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all whitespace-nowrap flex items-center gap-1.5 ${currentGroup === name
                                ? 'bg-padel-primary text-black shadow-[0_8px_20px_rgba(204,255,0,0.2)] scale-105'
                                : 'bg-[#111] text-gray-500 hover:bg-[#1a1a1a] border border-white/5'
                                }`}
                        >
                            <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-black ${currentGroup === name ? 'bg-black/20' : 'bg-white/10'}`}>{name}</span>
                            Grupo {name}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Content ─────────────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {activeView === 'standings' ? (
                    <motion.div
                        key={`standings-${currentGroup}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-[#111] border border-white/8 rounded-[2rem] overflow-hidden shadow-xl"
                    >
                        {/* Group header */}
                        <div className="px-5 py-3.5 bg-padel-primary flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-black/20 rounded-lg flex items-center justify-center text-[10px] font-black text-black">{currentGroup}</div>
                                <h3 className="font-black italic uppercase tracking-tighter text-sm text-black">Grupo {currentGroup}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-black/10 rounded-full px-2 py-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-800" />
                                    <span className="text-[8px] font-black text-black/70 uppercase">Top {qualifyingSpots} clasifican</span>
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex gap-3 px-5 py-2 bg-white/[0.02] border-b border-white/5 text-[8px] font-black uppercase tracking-widest text-gray-600">
                            <span className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-padel-primary/50" />
                                Clasificado
                            </span>
                            <span className="ml-auto">PJ · PG · JF · JC · Pts</span>
                        </div>

                        {/* Desktop table */}
                        <div className="hidden sm:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-[9px] font-black uppercase tracking-widest text-gray-600 border-b border-white/5">
                                        <th className="text-left py-3 px-5 w-8">#</th>
                                        <th className="text-left py-3 px-3">Pareja</th>
                                        <th className="text-center py-3 px-3 w-10" title="Partidos Jugados">PJ</th>
                                        <th className="text-center py-3 px-3 w-10" title="Partidos Ganados">PG</th>
                                        <th className="text-center py-3 px-3 w-10" title="Juegos a Favor">JF</th>
                                        <th className="text-center py-3 px-3 w-10" title="Juegos en Contra">JC</th>
                                        <th className="text-center py-3 px-3 w-12" title="Diferencia de Juegos">±J</th>
                                        <th className="text-center py-3 px-3 w-12" title="Puntos Totales">Pts</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                    {currentStandings.map((team, idx) => {
                                        const qualifying = idx < qualifyingSpots;
                                        const isLeader = idx === 0;
                                        return (
                                            <motion.tr
                                                key={team.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className={`group hover:bg-white/[0.03] transition-colors ${isLeader ? 'bg-yellow-500/[0.04]' : ''}`}
                                            >
                                                <td className="py-3.5 px-5">
                                                    <RankBadge rank={idx + 1} qualifying={qualifying} />
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${qualifying ? 'bg-padel-primary' : 'bg-white/10'}`} />
                                                        <div>
                                                            <p className={`text-[11px] font-black italic uppercase tracking-tight leading-none ${isLeader ? 'text-padel-primary' : 'text-white'} group-hover:text-padel-primary transition-colors`}>
                                                                {team.name}
                                                            </p>
                                                            {qualifying && (
                                                                <span className="text-[7px] font-black uppercase tracking-widest text-padel-primary/60 mt-0.5 block">
                                                                    ✓ Clasificado
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-3 text-center text-[11px] font-bold text-gray-400">{team.PJ}</td>
                                                <td className="py-3.5 px-3 text-center text-[11px] font-bold text-green-400">{team.PG}</td>
                                                <td className="py-3.5 px-3 text-center text-[11px] font-bold text-gray-400">{team.JF}</td>
                                                <td className="py-3.5 px-3 text-center text-[11px] font-bold text-gray-400">{team.JC}</td>
                                                <td className="py-3.5 px-3 text-center text-[11px] font-black">
                                                    <span className={team.JF - team.JC >= 0 ? 'text-green-400' : 'text-red-400'}>
                                                        {team.JF - team.JC >= 0 ? '+' : ''}{team.JF - team.JC}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-3 text-center">
                                                    <span className={`text-base font-black italic ${isLeader ? 'text-padel-primary' : 'text-white'}`}>
                                                        {team.Pts}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="sm:hidden divide-y divide-white/5">
                            {currentStandings.map((team, idx) => {
                                const qualifying = idx < qualifyingSpots;
                                return (
                                    <div key={team.id} className={`p-4 flex items-start gap-3 ${idx === 0 ? 'bg-yellow-500/[0.04]' : ''}`}>
                                        <RankBadge rank={idx + 1} qualifying={qualifying} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                {qualifying && <div className="w-1.5 h-4 rounded-full bg-padel-primary flex-shrink-0" />}
                                                <p className={`text-[11px] font-black italic uppercase leading-tight truncate ${idx === 0 ? 'text-padel-primary' : 'text-white'}`}>
                                                    {team.name}
                                                </p>
                                            </div>
                                            <div className="flex gap-3 mt-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                                <span>PJ {team.PJ}</span>
                                                <span className="text-green-400">PG {team.PG}</span>
                                                <span>JF {team.JF}</span>
                                                <span>JC {team.JC}</span>
                                                <span className={team.JF - team.JC >= 0 ? 'text-green-400' : 'text-red-400'}>
                                                    ±{team.JF - team.JC >= 0 ? '+' : ''}{team.JF - team.JC}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <span className={`text-2xl font-black italic ${idx === 0 ? 'text-padel-primary' : 'text-white'}`}>{team.Pts}</span>
                                            <p className="text-[8px] text-gray-600 font-black uppercase">pts</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Tiebreak legend */}
                        <div className="px-5 py-3 border-t border-white/5 bg-white/[0.015]">
                            <p className="text-[8px] text-gray-700 font-bold uppercase tracking-widest flex items-center gap-3 flex-wrap">
                                <span>Desempate:</span>
                                <span>1° Puntos</span>
                                <span className="text-gray-800">·</span>
                                <span>2° Dif. Juegos (JF-JC)</span>
                                <span className="text-gray-800">·</span>
                                <span>3° Enfrentamiento Directo</span>
                            </p>
                        </div>
                    </motion.div>

                ) : (
                    <motion.div
                        key={`calendar-${currentGroup}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-[#111] border border-white/8 rounded-[2rem] overflow-hidden shadow-xl"
                    >
                        {/* Calendar header */}
                        <div className="px-5 py-3.5 bg-padel-primary flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-black" />
                                <h3 className="font-black italic uppercase tracking-tighter text-sm text-black">
                                    Calendario · Grupo {currentGroup}
                                </h3>
                            </div>
                            <span className="text-[8px] font-black text-black/60 uppercase tracking-widest">
                                {currentFixture.reduce((acc, r) => acc + r.length, 0)} partidos
                            </span>
                        </div>

                        <div className="divide-y divide-white/5">
                            {currentFixture.map((round, roundIdx) => (
                                <div key={roundIdx}>
                                    {/* Round header */}
                                    <div className="px-5 py-2 bg-white/[0.02] flex items-center gap-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">
                                            Jornada {roundIdx + 1}
                                        </span>
                                        <div className="flex-1 h-px bg-white/5" />
                                        <span className="text-[8px] text-gray-700 font-bold">
                                            {round.filter(m => m.status === MatchStatus.FINISHED).length}/{round.length} completados
                                        </span>
                                    </div>

                                    {/* Matches in round */}
                                    <div className="divide-y divide-white/[0.03]">
                                        {round.map(match => {
                                            const isFinished = match.status === MatchStatus.FINISHED;
                                            const isLive = match.status === MatchStatus.LIVE;
                                            const g1 = match.games?.t1 ?? 0;
                                            const g2 = match.games?.t2 ?? 0;

                                            return (
                                                <div
                                                    key={match.id}
                                                    className={`group transition-colors ${isFinished ? 'bg-white/[0.01]' : 'hover:bg-white/[0.02]'}`}
                                                >
                                                    <div className="flex items-center gap-3 px-5 py-3.5">
                                                        {/* Status & Time */}
                                                        <div className="flex flex-col items-center gap-2 flex-shrink-0 min-w-[45px]">
                                                            <div className={`w-2 h-2 rounded-full ${isFinished ? 'bg-green-500/40' : isLive ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-white/10'}`} />
                                                            {(() => {
                                                                const raw = match.scheduledTime || match.time;
                                                                if (!raw) return null;
                                                                const d = raw?.toDate ? raw.toDate() : new Date(raw);
                                                                if (isNaN(d.getTime())) return null;
                                                                const dateStr = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                                                                const timeStr = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
                                                                return (
                                                                    <div className="flex flex-col items-center gap-0.5">
                                                                        <span className="text-[7px] font-black text-padel-primary/40 uppercase tracking-tighter">{dateStr}</span>
                                                                        <span className="text-[9px] font-bold text-gray-500 tabular-nums">{timeStr}</span>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>

                                                        {/* Team 1 & 2 */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-[10px] font-black italic uppercase truncate leading-none ${isFinished && g1 > g2 ? 'text-padel-primary' : 'text-white'}`}>
                                                                {match.team1Name}
                                                            </p>
                                                            <p className={`text-[10px] font-black italic uppercase truncate mt-1.5 ${isFinished && g2 > g1 ? 'text-padel-primary' : 'text-gray-500'}`}>
                                                                {match.team2Name}
                                                            </p>
                                                        </div>

                                                        {/* Score / Input */}
                                                        {isFinished ? (
                                                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                                                                    <span className={`text-base font-black leading-none ${g1 > g2 ? 'text-padel-primary' : 'text-gray-400'}`}>{g1}</span>
                                                                    <span className="text-gray-700 font-black text-xs">·</span>
                                                                    <span className={`text-base font-black leading-none ${g2 > g1 ? 'text-padel-primary' : 'text-gray-400'}`}>{g2}</span>
                                                                </div>
                                                            </div>
                                                        ) : canManage && !match.id.startsWith('pending-') ? (
                                                            <ScoreInput
                                                                matchId={match.id}
                                                                defaultG1={g1}
                                                                defaultG2={g2}
                                                                disabled={!canManage}
                                                                onSave={(g1, g2) => onSaveResult(match.id, g1, g2)}
                                                            />
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-[8px] font-black text-gray-700 uppercase tracking-widest">
                                                                <Lock className="w-2.5 h-2.5" />
                                                                <span>Pendiente</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Dock de acciones (Grupos) */}
                                                    {canManage && !isFinished && !match.id.startsWith('pending-') && (
                                                        <div className="grid grid-cols-4 gap-px bg-white/[0.04] border-t border-white/[0.04]">
                                                            <Link
                                                                href={`/tournaments/${tournament.id}/score/${match.id}`}
                                                                className={`flex flex-col items-center justify-center gap-1 py-2 transition-all active:scale-95
                                                                    ${isLive ? 'bg-padel-primary/10 text-padel-primary hover:bg-padel-primary/20' : 'text-gray-500 hover:text-padel-primary'}`}
                                                            >
                                                                <Gamepad2 className="w-3 h-3" />
                                                                <span className="text-[6px] font-black uppercase tracking-widest">Control</span>
                                                            </Link>
                                                            <Link
                                                                href={isLive ? `/tournaments/${tournament.id}/display/${match.id}` : `/tournaments/${tournament.id}/monitor`}
                                                                target="_blank"
                                                                className="flex flex-col items-center justify-center gap-1 py-2 text-gray-500 hover:text-white transition-all active:scale-95"
                                                            >
                                                                <Monitor className="w-3 h-3" />
                                                                <span className="text-[6px] font-black uppercase tracking-widest">Pizarra</span>
                                                            </Link>
                                                            <Link
                                                                href={`/tournaments/${tournament.id}/control/broadcasting`}
                                                                target="_blank"
                                                                className="flex flex-col items-center justify-center gap-1 py-2 text-gray-500 hover:text-orange-400 transition-all active:scale-95"
                                                            >
                                                                <Camera className="w-3 h-3" />
                                                                <span className="text-[6px] font-black uppercase tracking-widest">Cámaras</span>
                                                            </Link>
                                                            <Link
                                                                href={`/tournaments/${tournament.id}/control/broadcasting`}
                                                                target="_blank"
                                                                className="flex flex-col items-center justify-center gap-1 py-2 text-gray-500 hover:text-yellow-400 transition-all active:scale-95"
                                                            >
                                                                <Tv className="w-3 h-3" />
                                                                <span className="text-[6px] font-black uppercase tracking-widest">Publicidad</span>
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Dot navigation (multiple groups) ──────────────────────────── */}
            {groupNames.length > 1 && (
                <div className="flex justify-center gap-1.5 pt-1">
                    {groupNames.map(name => (
                        <button
                            key={name}
                            onClick={() => setActiveGroup(name)}
                            className={`transition-all rounded-full ${currentGroup === name ? 'w-6 h-1.5 bg-padel-primary' : 'w-1.5 h-1.5 bg-white/20'}`}
                        />
                    ))}
                </div>
            )}

            {/* ── Floating Finish Button ─────────────────────────────────────── */}
            {canManage && (
                <div className="fixed bottom-6 right-4 z-40">
                    <AnimatePresence>
                        {allGroupsDone ? (
                            <motion.div
                                key="finish"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                className="flex flex-col items-end gap-2"
                            >
                                {finishConfirm && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-[#111] border border-white/20 rounded-2xl p-3 shadow-2xl max-w-[180px] text-right"
                                    >
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">¿Generar cuadro?</p>
                                        <p className="text-[10px] text-white font-bold mb-3">Se crearán las eliminatorias con los mejores de cada grupo.</p>
                                        <button
                                            onClick={() => { setFinishConfirm(false); onFinishGroupPhase(); }}
                                            className="w-full py-2 bg-padel-primary hover:opacity-90 text-black text-[10px] font-black uppercase rounded-xl transition-all"
                                        >
                                            ✓ Confirmar
                                        </button>
                                    </motion.div>
                                )}
                                <button
                                    onClick={() => setFinishConfirm(c => !c)}
                                    className="flex items-center gap-2 px-5 py-3.5 bg-padel-primary hover:opacity-90 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-padel-primary/30 transition-all active:scale-95"
                                >
                                    <Flag className="w-4 h-4" />
                                    Finalizar Fase de Grupos
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="progress-fab"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-[#111] border border-white/15 rounded-2xl shadow-xl text-xs font-black uppercase text-gray-500 tracking-wider"
                            >
                                <Zap className="w-3.5 h-3.5 text-padel-primary animate-pulse" />
                                {progressPct}% completado
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
