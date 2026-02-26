'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { MatchStatus } from '@/types/tournament';
import {
    Calendar, Clock, RefreshCw, Trophy, ArrowLeft,
    Gamepad2, Monitor, Camera,
    Tv, Flag, LayoutGrid, Users, Award, TrendingUp,
    Plus, Trash2, FileText, Download, Edit3, Save, X, Share2
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

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


// 🟢 En Vivo  🟡 Próximos en turno  🔴 En cola  ⚪ Finalizados
const STATUS_COLORS: Record<string, string> = {
    [MatchStatus.LIVE]: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300',
    [MatchStatus.FINISHED]: 'bg-white/[0.03] border-white/[0.07] text-gray-600',
};
const PENDING_NEXT_COLORS = 'bg-yellow-500/10 border-yellow-500/35 text-yellow-200';
const PENDING_LATER_COLORS = 'bg-red-900/10 border-red-800/30 text-red-300/70';

const CAT_COLORS: Record<string, string> = {
    MALE: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    FEMALE: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
    MIXED: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
};

// Mapeo legible de categorías  (MAS_50 → +50, SUMA_7 → Suma 7, etc.)
const CAT_LABEL_MAP: Record<string, string> = {
    MAS_45: '+45',
    MAS_50: '+50',
    SUMA_7: 'Suma 7',
    SUMA_8: 'Suma 8',
    SUMA_9: 'Suma 9',
    SUMA_10: 'Suma 10',
    SUMA_11: 'Suma 11',
    PRIMERA: '1ª Cat.',
    SEGUNDA: '2ª Cat.',
    TERCERA: '3ª Cat.',
    CUARTA: '4ª Cat.',
    QUINTA: '5ª Cat.',
    SEXTA: '6ª Cat.',
    SEPTIMA: '7ª Cat.',
};
const formatCategory = (cat?: string): string => {
    if (!cat) return '';
    return CAT_LABEL_MAP[cat] ?? cat.replace(/_/g, ' ');
};

// ── Status filter tabs ──────────────────────────────────────────────────────
const TABS = [
    { label: 'Todos', value: 'all' },
    { label: 'Por Comenzar', value: MatchStatus.PENDING },
    { label: 'En Vivo', value: MatchStatus.LIVE },
    { label: 'Finalizados', value: MatchStatus.FINISHED },
    { label: 'Grupos', value: 'groups' },
    { label: 'Reglas', value: 'rules' },
] as const;

// ── Standings helpers ────────────────────────────────────────────────────────
function calcGroupStanding(teamId: string, teamNum: number, matches: any[]) {
    let PJ = 0, PG = 0, PP = 0, JF = 0, JC = 0;
    matches.filter(m =>
        m.status === MatchStatus.FINISHED &&
        m.stage === 'GROUP_STAGE' &&
        (m.team1Index === teamNum || m.team2Index === teamNum)
    ).forEach(m => {
        const side = m.team1Index === teamNum ? 't1' : 't2';
        const opp = side === 't1' ? 't2' : 't1';
        PJ++;
        const gWon = m.games?.[side] ?? 0;
        const gLost = m.games?.[opp] ?? 0;
        JF += gWon;
        JC += gLost;
        const sWon = m.sets?.[side] ?? 0;
        const sLost = m.sets?.[opp] ?? 0;
        if (sWon > sLost || (sWon === sLost && gWon > gLost)) PG++;
        else PP++;
    });

    const winRate = PJ > 0 ? (PG / PJ) * 100 : 0;
    const gameRate = (JF + JC) > 0 ? (JF / (JF + JC)) * 100 : 0;

    return { PJ, PG, PP, JF, JC, Pts: PG * 3, winRate, gameRate };
}

// ── GroupsView: shows all categories → groups → standings ────────────────────
function GroupsView({ tournaments }: { tournaments: Record<string, any> }) {
    const tourList = Object.values(tournaments) as any[];
    // Only show tournaments with groupAssignments
    const withGroups = tourList.filter(t => t.groupAssignments && Object.keys(t.groupAssignments).length > 0);

    const [activeCatId, setActiveCatId] = useState<string>(withGroups[0]?.id ?? '');
    const [activeGroup, setActiveGroup] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'standings' | 'matches'>('standings');

    // When category changes reset group selection
    const handleCatChange = (tid: string) => {
        setActiveCatId(tid);
        setActiveGroup(null);
    };

    if (withGroups.length === 0) {
        return (
            <div className="py-24 text-center space-y-4">
                <LayoutGrid className="w-16 h-16 text-white/5 mx-auto" />
                <p className="text-gray-600 text-xs uppercase font-bold tracking-widest">No hay grupos configurados</p>
            </div>
        );
    }

    const activeTournament = withGroups.find(t => t.id === activeCatId) ?? withGroups[0];
    const groupAssignments: Record<string, string[]> = activeTournament?.groupAssignments ?? {};
    const groupNames = Object.keys(groupAssignments).sort();
    const currentGroupName = activeGroup ?? groupNames[0] ?? null;
    const allMatches: any[] = activeTournament?.matches ?? [];

    // Build standings for current group
    const renderStandings = (gName: string) => {
        const teamIds: string[] = groupAssignments[gName] ?? [];
        const teams = activeTournament?.teams ?? [];

        const rows = teamIds.map((tid, tIdx) => {
            const teamIdx = teams.findIndex((t: any) => String(t.id) === String(tid));
            const team = teamIdx >= 0 ? teams[teamIdx] : null;
            const tNum = teamIdx + 1;

            // Detect tournament type for name display
            const isSimple = activeTournament?.type === 'AMERICANO_INDIVIDUAL';
            let name: string;
            if (team) {
                const p1 = (team.p1Name || team.p1?.name || '').trim();
                const p2 = (team.p2Name || team.p2?.name || '').trim();
                if (isSimple) {
                    name = p1 || `Jugador ${tNum}`;
                } else {
                    name = (p1 && p2) ? `${p1} / ${p2}` : (p1 || `Pareja ${tNum}`);
                }
            } else {
                name = isSimple ? `Jugador ${tNum}` : `Pareja ${tNum}`;
            }

            const stats = calcGroupStanding(tid, tNum, allMatches);
            return { id: tid, name, tNum, ...stats };
        }).sort((a, b) => {
            if (b.Pts !== a.Pts) return b.Pts - a.Pts;
            const da = a.JF - a.JC, db = b.JF - b.JC;
            if (db !== da) return db - da;
            return b.PG - a.PG;
        });

        // Group stats for progress
        const groupMatchesTotal = allMatches.filter(m =>
            m.stage === 'GROUP_STAGE' &&
            rows.map(r => r.tNum).includes(m.team1Index) &&
            rows.map(r => r.tNum).includes(m.team2Index)
        );
        const groupMatchesDone = groupMatchesTotal.filter(m => m.status === MatchStatus.FINISHED).length;
        const pct = groupMatchesTotal.length > 0 ? Math.round((groupMatchesDone / groupMatchesTotal.length) * 100) : 0;

        const isSimple = activeTournament?.type === 'AMERICANO_INDIVIDUAL';
        const qualifyingSpots = Math.min(2, rows.length);

        // Group letter display
        const groupLetter = gName.length === 1 ? gName : gName.replace('Grupo', '').trim();

        return (
            <motion.div
                key={`group-${gName}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="rounded-[2rem] border border-white/[0.08] overflow-hidden bg-[#111] shadow-2xl"
            >
                {/* Group header */}
                <div className="px-5 py-3.5 bg-gradient-to-r from-[#ccff00]/90 to-[#aaee00] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black/20 rounded-xl flex items-center justify-center">
                            <span className="text-sm font-black text-black">{groupLetter}</span>
                        </div>
                        <div>
                            <h3 className="font-black italic uppercase tracking-tighter text-sm text-black leading-none">
                                Grupo {groupLetter}
                            </h3>
                            <p className="text-[8px] font-black text-black/60 uppercase tracking-widest mt-0.5">
                                {groupMatchesDone}/{groupMatchesTotal.length} partidos · {pct}% completado
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/10 rounded-full px-2.5 py-1">
                        <Award className="w-3 h-3 text-black/70" />
                        <span className="text-[8px] font-black text-black/70 uppercase">Top {qualifyingSpots} clasifican</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-black/20">
                    <div
                        className="h-full bg-[#ccff00] transition-all duration-700"
                        style={{ width: `${pct}%` }}
                    />
                </div>

                {/* Column headers */}
                <div className="grid px-4 py-2 bg-white/[0.03] border-b border-white/[0.05]" style={{ gridTemplateColumns: isSimple ? '24px 1fr 34px 34px 34px 34px 34px 42px 42px' : '24px 1fr 32px 32px 32px 32px 32px 38px 38px 42px' }}>
                    <span className="text-[8px] font-black text-gray-700 uppercase tracking-wider text-center">#</span>
                    <span className="text-[8px] font-black text-gray-700 uppercase tracking-wider pl-1">
                        {isSimple ? 'Jugador' : 'Pareja'}
                    </span>
                    <span className="text-[8px] font-black text-gray-700 uppercase tracking-wider text-center" title="Partidos Jugados">PJ</span>
                    <span className="text-[8px] font-black text-gray-700 uppercase tracking-wider text-center" title="Partidos Ganados">PG</span>
                    <span className="text-[8px] font-black text-gray-700 uppercase tracking-wider text-center" title="Partidos Perdidos">PP</span>
                    {!isSimple && <span className="text-[8px] font-black text-gray-700 uppercase tracking-wider text-center" title="Juegos a Favor">JF</span>}
                    <span className="text-[8px] font-black text-gray-700 uppercase tracking-wider text-center" title="Juegos en Contra">JC</span>
                    <span className="text-[8px] font-black text-gray-700 uppercase tracking-wider text-center" title="Diferencia">±J</span>
                    <span className="text-[8px] font-black text-cyan-400 uppercase tracking-wider text-center" title="Efectividad Ganadores">%W</span>
                    <span className="text-[8px] font-black text-[#ccff00]/70 uppercase tracking-wider text-center" title="Puntos">Pts</span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-white/[0.04]">
                    {rows.map((row, idx) => {
                        const qualifying = idx < qualifyingSpots;
                        const isLeader = idx === 0;
                        const diff = row.JF - row.JC;
                        return (
                            <motion.div
                                key={row.id}
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className={`grid px-4 py-3 items-center transition-colors hover:bg-white/[0.03] ${isLeader ? 'bg-[#ccff00]/[0.04]' : ''
                                    }`}
                                style={{ gridTemplateColumns: isSimple ? '24px 1fr 34px 34px 34px 34px 34px 42px 42px' : '24px 1fr 32px 32px 32px 32px 32px 38px 38px 42px' }}
                            >
                                {/* Rank */}
                                <div className="flex justify-center">
                                    {idx === 0 ? (
                                        <div className="w-5 h-5 rounded-md bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center">
                                            <Trophy className="w-2.5 h-2.5 text-yellow-400" />
                                        </div>
                                    ) : qualifying ? (
                                        <div className="w-5 h-5 rounded-md bg-[#ccff00]/20 border border-[#ccff00]/40 flex items-center justify-center text-[7px] font-black text-[#ccff00]">{idx + 1}</div>
                                    ) : (
                                        <div className="w-5 h-5 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[7px] font-black text-gray-600">{idx + 1}</div>
                                    )}
                                </div>

                                {/* Name */}
                                <div className="flex items-center gap-1.5 min-w-0 pl-1">
                                    <div className={`w-1 h-7 rounded-full flex-shrink-0 ${qualifying ? 'bg-[#ccff00]' : 'bg-white/[0.08]'}`} />
                                    <div className="min-w-0">
                                        {isSimple ? (
                                            <p className={`text-[10px] font-black uppercase italic tracking-tight truncate leading-none ${isLeader ? 'text-[#ccff00]' : 'text-white'
                                                }`}>{row.name}</p>
                                        ) : (() => {
                                            const parts = row.name.split(' / ');
                                            return (
                                                <div className="flex flex-col min-w-0">
                                                    <p className={`text-[9px] font-black uppercase italic tracking-tight truncate leading-none ${isLeader ? 'text-[#ccff00]' : 'text-white'
                                                        }`}>{parts[0]}</p>
                                                    {parts[1] && <p className="text-[8px] font-bold text-gray-500 uppercase italic tracking-tighter truncate leading-none mt-1">{parts[1]}</p>}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Stats */}
                                <span className="text-[10px] font-bold text-white text-center">{row.PJ}</span>
                                <span className="text-[10px] font-bold text-white text-center">{row.PG}</span>
                                <span className="text-[10px] font-bold text-white text-center">{row.PP}</span>
                                {!isSimple && <span className="text-[10px] font-bold text-gray-500 text-center">{row.JF}</span>}
                                <span className="text-[10px] font-bold text-gray-500 text-center">{row.JC}</span>
                                <span className={`text-[10px] font-black text-center ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                    {diff > 0 ? `+${diff}` : diff}
                                </span>
                                <span className="text-[9px] font-black text-cyan-400/80 text-center">{Math.round(row.winRate)}%</span>
                                <span className="text-[11px] font-black text-[#ccff00] text-center">{row.Pts}</span>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Tiebreak legend */}
                <div className="px-5 py-2.5 border-t border-white/[0.05] bg-white/[0.01]">
                    <p className="text-[7px] text-gray-700 font-bold uppercase tracking-widest">
                        Desempate: 1° Pts · 2° ±Juegos (JF-JC) · 3° PG
                    </p>
                </div>
            </motion.div>
        );
    };

    // Render match list for current group
    const renderMatches = (gName: string) => {
        const teamIds: string[] = groupAssignments[gName] ?? [];
        const teams = activeTournament?.teams ?? [];
        const groupTeamNums = teamIds.map(tid => teams.findIndex((t: any) => String(t.id) === String(tid)) + 1);

        const groupMatches = allMatches.filter(m =>
            m.stage === 'GROUP_STAGE' &&
            groupTeamNums.includes(m.team1Index) &&
            groupTeamNums.includes(m.team2Index)
        );

        if (groupMatches.length === 0) {
            return (
                <div className="py-12 text-center space-y-3 bg-white/[0.02] rounded-[2rem] border border-dashed border-white/10">
                    <Calendar className="w-10 h-10 text-white/5 mx-auto" />
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">No hay partidos programados</p>
                </div>
            );
        }

        return (
            <motion.div
                key={`matches-${gName}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-2"
            >
                {groupMatches.map((m, idx) => {
                    const isDone = m.status === MatchStatus.FINISHED;
                    const isLive = m.status === MatchStatus.LIVE;
                    const [t1p1, t1p2] = resolveTeamNames(m.team1, m.team1Name);
                    const [t2p1, t2p2] = resolveTeamNames(m.team2, m.team2Name);

                    return (
                        <div key={m.id || idx} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col">
                            <div className="p-3 flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0 space-y-2">
                                    {/* Team 1 */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className={`text-[10px] font-black uppercase truncate ${isDone && (m.score1 > m.score2) ? 'text-[#ccff00]' : 'text-gray-300'}`}>{t1p1}</p>
                                            {t1p2 && <p className="text-[8px] font-bold text-gray-500 uppercase truncate -mt-0.5">{t1p2}</p>}
                                        </div>
                                        {isDone && <span className="text-xs font-black text-white px-1">{m.score1 ?? 0}</span>}
                                    </div>
                                    {/* Team 2 */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className={`text-[10px] font-black uppercase truncate ${isDone && (m.score2 > m.score1) ? 'text-[#ccff00]' : 'text-gray-300'}`}>{t2p1}</p>
                                            {t2p2 && <p className="text-[8px] font-bold text-gray-500 uppercase truncate -mt-0.5">{t2p2}</p>}
                                        </div>
                                        {isDone && <span className="text-xs font-black text-white px-1">{m.score2 ?? 0}</span>}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1 flex-shrink-0 border-l border-white/10 pl-4 py-1">
                                    {isDone ? (
                                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Finalizado</span>
                                    ) : isLive ? (
                                        <span className="text-[8px] font-black text-[#ccff00] uppercase tracking-widest animate-pulse">En Vivo</span>
                                    ) : (
                                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{formatHHMM(m.scheduledTime)}</span>
                                    )}
                                    <span className="text-[7px] font-bold text-gray-700 uppercase">Pista {m.court ?? '-'}</span>
                                </div>
                            </div>

                            {/* Menu de acciones removido por solicitud de usuario en vista clasificación */}
                        </div>
                    );
                })}
            </motion.div>
        );
    };

    return (
        <div className="space-y-4">
            {/* ── Category selector (if multiple tournaments) ── */}
            {withGroups.length > 1 && (
                <div className="space-y-2">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 px-1">Categoría</p>
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar flex-nowrap pb-1">
                        {withGroups.map(t => (
                            <button
                                key={t.id}
                                onClick={() => handleCatChange(t.id)}
                                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all ${activeCatId === t.id
                                    ? 'bg-[#ccff00] text-black shadow-[0_8px_24px_rgba(204,255,0,0.25)] scale-105'
                                    : 'bg-white/[0.06] text-gray-400 hover:bg-white/10 border border-white/10'
                                    }`}
                            >
                                <Users className="w-3 h-3" />
                                {formatCategory(t.category)}
                                {t.gender === 'MALE' ? ' ♂' : t.gender === 'FEMALE' ? ' ♀' : ' ⚥'}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Group tabs ── */}
            {groupNames.length > 0 && (
                <div className="space-y-2">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 px-1">Grupo</p>
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar flex-nowrap pb-1">
                        {groupNames.map(gName => {
                            const groupLetter = gName.length === 1 ? gName : gName.replace('Grupo', '').trim();
                            const isActive = (currentGroupName === gName);
                            const gTeamIds = groupAssignments[gName] ?? [];
                            const gMatches = allMatches.filter(m =>
                                m.stage === 'GROUP_STAGE' &&
                                gTeamIds.some((tid: string) => {
                                    const idx = activeTournament?.teams?.findIndex((t: any) => String(t.id) === String(tid)) ?? -1;
                                    const tNum = idx + 1;
                                    return m.team1Index === tNum || m.team2Index === tNum;
                                })
                            );
                            const done = gMatches.filter(m => m.status === MatchStatus.FINISHED).length;
                            return (
                                <button
                                    key={gName}
                                    onClick={() => setActiveGroup(gName)}
                                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all ${isActive
                                        ? 'bg-[#ccff00] text-black shadow-[0_8px_24px_rgba(204,255,0,0.2)] scale-105'
                                        : 'bg-white/[0.06] text-gray-400 hover:bg-white/10 border border-white/10'
                                        }`}
                                >
                                    <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-black ${isActive ? 'bg-black/20' : 'bg-white/10'
                                        }`}>{groupLetter}</span>
                                    Grupo {groupLetter}
                                    {gMatches.length > 0 && (
                                        <span className={`text-[8px] font-bold ${isActive ? 'text-black/60' : 'text-gray-600'
                                            }`}>{done}/{gMatches.length}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── View toggle (Standings vs Matches) ── */}
            <div className="flex justify-center pt-2">
                <div className="inline-flex items-center p-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl">
                    <button
                        onClick={() => setActiveView('standings')}
                        className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 ${activeView === 'standings' ? 'bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/10' : 'text-gray-500 hover:text-white'}`}
                    >
                        <TrendingUp className="w-3 h-3" />
                        Tabla
                    </button>
                    <button
                        onClick={() => setActiveView('matches')}
                        className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 ${activeView === 'matches' ? 'bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/10' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Calendar className="w-3 h-3" />
                        Partidos
                    </button>
                </div>
            </div>

            {/* ── Content ── */}
            <AnimatePresence mode="wait">
                {currentGroupName && (
                    activeView === 'standings'
                        ? renderStandings(currentGroupName)
                        : renderMatches(currentGroupName)
                )}
            </AnimatePresence>

            {/* ── Dot navigation ── */}
            {groupNames.length > 1 && (
                <div className="flex justify-center gap-2 pt-1">
                    {groupNames.map(name => (
                        <button
                            key={name}
                            onClick={() => setActiveGroup(name)}
                            className={`transition-all rounded-full ${currentGroupName === name
                                ? 'w-6 h-1.5 bg-[#ccff00]'
                                : 'w-1.5 h-1.5 bg-white/20'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Placeholder para pistas vacías ──────────────────────────────────────────
function PlaceholderMatchCard({ rank, mode = 'pending' }: { rank: number; mode?: 'pending' | 'live' }) {
    const rankLabel = ['1°', '2°', '3°', '4°', '5°', '6°'];
    return (
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] flex flex-col h-full opacity-30 min-h-[140px]">
            <div className="px-2 pt-2 pb-1.5 flex items-center justify-between border-b border-white/[0.04]">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">
                    {mode === 'live' ? `PISTA ${rank + 1}` : rankLabel[rank] ?? `${rank + 1}°`}
                </span>
                <span className="text-[7px] font-bold text-gray-600 uppercase tracking-tighter">Disponible</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-3 opacity-20">
                <div className="w-8 h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-1">
                    <Trophy className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <p className="text-[8px] font-black text-gray-400 uppercase italic tracking-widest text-center leading-none">Pista Libre</p>
            </div>
        </div>
    );
}

// ── "Por Comenzar" action card (top 3 only) ────────────────────────────────
function NextMatchCard({ match, rank, compact = false }: { match: any; rank: number; compact?: boolean }) {
    const [t1p1, t1p2] = resolveTeamNames(match.team1, match.team1Name);
    const [t2p1, t2p2] = resolveTeamNames(match.team2, match.team2Name);
    const isLive = match.status === MatchStatus.LIVE;

    const rankColors = isLive
        ? ['text-emerald-400', 'text-emerald-400', 'text-emerald-400', 'text-emerald-400', 'text-emerald-400', 'text-emerald-400']
        : ['text-[#ccff00]', 'text-white/80', 'text-white/50', 'text-white/30', 'text-white/20', 'text-white/15'];

    const rankBg = isLive
        ? [
            'bg-emerald-500/10 border-emerald-500/30',
            'bg-emerald-500/10 border-emerald-500/25',
            'bg-emerald-500/5 border-emerald-500/20',
            'bg-emerald-500/5 border-emerald-500/15',
            'bg-emerald-500/5 border-emerald-500/10',
            'bg-emerald-500/5 border-emerald-500/10',
        ]
        : [
            'bg-[#ccff00]/10 border-[#ccff00]/30',
            'bg-white/5 border-white/15',
            'bg-white/[0.03] border-white/10',
            'bg-white/[0.02] border-white/[0.07]',
            'bg-white/[0.02] border-white/[0.06]',
            'bg-white/[0.01] border-white/[0.05]',
        ];

    const rankLabel = isLive ? ['LIVE', 'LIVE', 'LIVE', 'LIVE', 'LIVE', 'LIVE'] : ['1°', '2°', '3°', '4°', '5°', '6°'];
    const rankLabelFull = isLive
        ? ['Partido en Curso', 'Partido en Curso', 'Partido en Curso', 'Partido en Curso', 'Partido en Curso', 'Partido en Curso']
        : ['1° Siguiente', '2° Salida', '3° Espera', '4° Cola', '5° Cola', '6° Cola'];

    const safeRank = Math.min(rank, rankColors.length - 1);

    const matchKey = match.id || (match.court ? `court_${match.court}` : (match.courtIndex != null ? `court_${match.courtIndex + 1}` : 'court_1'));
    const controlHref = `/tournaments/${match._tournamentId}/score/${matchKey}`;
    const pizarraHref = match.id
        ? `/tournaments/${match._tournamentId}/display/${match.id}`
        : `/tournaments/${match._tournamentId}/control`;
    const camasHref = `/tournaments/${match._tournamentId}/control/broadcasting`;
    const adsHref = `/tournaments/${match._tournamentId}/control/broadcasting`;

    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: rank * 0.06 }}
                className={`rounded-2xl border overflow-hidden flex flex-col ${rankBg[safeRank]}`}
            >
                {/* Cabecera compacta */}
                <div className="px-2 pt-2 pb-1.5 flex items-center justify-between gap-1 border-b border-white/[0.06]">
                    <div className="flex items-center gap-1.5 min-w-0">
                        {isLive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                        <span className={`text-[8px] font-black uppercase tracking-widest truncate ${rankColors[safeRank]}`}>
                            {isLive ? `PISTA ${match.court ?? '-'}` : rankLabel[safeRank]}
                        </span>
                    </div>
                    <span className="text-[8px] font-bold text-gray-500 italic">
                        {isLive ? `${match.score1 ?? 0} - ${match.score2 ?? 0}` : formatHHMM(match.scheduledTime)}
                    </span>
                </div>

                {/* Jugadores compactos */}
                <div className="px-2 py-2 flex-1 flex flex-col gap-1">
                    <div className="text-center">
                        <p className="text-[9px] font-black uppercase tracking-tight leading-tight truncate">{t1p1}</p>
                    </div>
                    <div className="text-[8px] font-black text-gray-600 text-center italic leading-none">vs</div>
                    <div className="text-center">
                        <p className="text-[9px] font-black uppercase tracking-tight leading-tight truncate">{t2p1}</p>
                    </div>
                </div>

                {/* Action Dock: 4 botones en fila */}
                <div className="grid grid-cols-4 gap-px bg-white/[0.04] border-t border-white/[0.06]">
                    <Link
                        href={controlHref}
                        className={`flex flex-col items-center justify-center gap-1 py-2 transition-all active:scale-95
                            ${isLive ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : rank === 0 ? 'bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20' : 'bg-white/[0.02] text-gray-500 hover:bg-white/[0.06] hover:text-[#ccff00]'}`}
                    >
                        <div className="relative">
                            <Gamepad2 className="w-3.5 h-3.5" />
                            {(isLive || rank === 0) && <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-[#ccff00]'} shadow-[0_0_4px_currentColor] animate-pulse`} />}
                        </div>
                        <span className="text-[6px] font-black uppercase tracking-tight">Control</span>
                    </Link>
                    <Link
                        href={pizarraHref}
                        target="_blank"
                        className="flex flex-col items-center justify-center gap-1 py-2 bg-white/[0.02] text-gray-500 hover:bg-white/[0.06] hover:text-blue-400 transition-all active:scale-95"
                    >
                        <Monitor className="w-3.5 h-3.5" />
                        <span className="text-[6px] font-black uppercase tracking-tight">Pizarra</span>
                    </Link>
                    <Link
                        href={camasHref}
                        target="_blank"
                        className="flex flex-col items-center justify-center gap-1 py-2 bg-white/[0.02] text-gray-500 hover:bg-white/[0.06] hover:text-orange-400 transition-all active:scale-95"
                    >
                        <Camera className="w-3.5 h-3.5" />
                        <span className="text-[6px] font-black uppercase tracking-tight">Cámaras</span>
                    </Link>
                    <Link
                        href={adsHref}
                        target="_blank"
                        className="flex flex-col items-center justify-center gap-1 py-2 bg-white/[0.02] text-gray-500 hover:bg-white/[0.06] hover:text-yellow-400 transition-all active:scale-95"
                    >
                        <Tv className="w-3.5 h-3.5" />
                        <span className="text-[6px] font-black uppercase tracking-tight">Ads</span>
                    </Link>
                </div>
            </motion.div>
        );
    }

    // ── Modo normal: tarjeta completa (ancho completo) ───────────────────────
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: rank * 0.07 }}
            className={`rounded-[1.75rem] border overflow-hidden ${rankBg[safeRank]}`}
        >
            {/* ── Header row */}
            <div className="px-4 pt-3 pb-2.5 flex items-center justify-between gap-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${rankColors[safeRank]}`}>
                        {rankLabelFull[safeRank] ?? `${rank + 1}° Pista`}
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
                <Link
                    href={pizarraHref}
                    target="_blank"
                    className="flex flex-col items-center justify-center gap-1.5 py-3.5 bg-white/[0.02] text-gray-400 hover:bg-white/[0.06] hover:text-white transition-all active:scale-95"
                >
                    <Monitor className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Pizarra</span>
                </Link>
                <Link
                    href={`/tournaments/${match._tournamentId}/control/broadcasting`}
                    target="_blank"
                    className="flex flex-col items-center justify-center gap-1.5 py-3.5 bg-white/[0.02] text-gray-400 hover:bg-white/[0.06] hover:text-orange-400 transition-all active:scale-95"
                >
                    <Camera className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Cámaras</span>
                </Link>
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
function MatchCard({ match, idx, isNextUp, isEffectivelyLive }: {
    match: any;
    idx: number;
    isNextUp: boolean;
    isEffectivelyLive: boolean;
}) {
    const isLive = match.status === MatchStatus.LIVE;
    // isEffectivelyLive = isLive BUT capped by numCanchas (passed from parent)
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
        if (!match._tournamentId) return;
        if (!confirm('¿Terminar este partido ahora?')) return;
        setEnding(true);
        try {
            // Los partidos se almacenan como ARRAY dentro del doc del torneo,
            // no como sub-colección → hay que leer, mapear y re-escribir.
            const tournRef = doc(db, 'tournaments', match._tournamentId);
            const snap = await getDoc(tournRef);
            if (!snap.exists()) throw new Error('Torneo no encontrado');
            const data = snap.data();
            const matches: any[] = data.matches ?? [];
            const updated = matches.map((m: any) =>
                m.id === match.id ? { ...m, status: MatchStatus.FINISHED } : m
            );
            await updateDoc(tournRef, { matches: updated });
        } catch (e) {
            console.error('[endMatch]', e);
            alert('Error al terminar el partido. Revisa la consola.');
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
            className={`rounded-[1.5rem] border overflow-hidden transition-all ${isEffectivelyLive ? STATUS_COLORS[MatchStatus.LIVE]
                : match.status === MatchStatus.FINISHED ? STATUS_COLORS[MatchStatus.FINISHED]
                    : isLive && !isEffectivelyLive ? PENDING_NEXT_COLORS  /* LIVE pero canchas full → trato como próximo */
                        : isNextUp ? PENDING_NEXT_COLORS
                            : PENDING_LATER_COLORS
                }`}
        >
            {/* Card header */}
            <div className="px-4 pt-2.5 pb-2 border-b border-white/[0.07] bg-white/[0.04] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isEffectivelyLive ? 'bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]'
                        : isDone ? 'bg-white/15'
                            : (isLive || isNextUp) ? 'bg-yellow-400 animate-pulse shadow-[0_0_6px_#facc15]'
                                : 'bg-red-700/60'
                        }`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest italic truncate ${isEffectivelyLive ? 'text-emerald-400'
                        : isDone ? 'text-gray-600'
                            : (isLive || isNextUp) ? 'text-yellow-300'
                                : 'text-red-400/70'
                        }`}>
                        Pista {match.court ?? '-'}
                        <span className="text-gray-600 font-bold"> · {formatHHMM(match.scheduledTime)}</span>
                    </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${CAT_COLORS[match._gender] ?? 'bg-white/5 border-white/10 text-gray-500'}`}>
                        {formatCategory(match._category)}
                    </span>
                    {isEffectivelyLive && <span className="text-[9px] font-black text-emerald-400 uppercase italic tracking-widest animate-pulse">● En Vivo</span>}
                    {isLive && !isEffectivelyLive && <span className="text-[9px] font-black text-yellow-400 uppercase italic tracking-widest">⏱ Próximo</span>}
                    {!isLive && isPending && isNextUp && <span className="text-[9px] font-black text-yellow-400 uppercase italic tracking-widest">⏱ Próximo</span>}
                    {!isLive && isPending && !isNextUp && <span className="text-[9px] font-black text-red-400/60 uppercase italic tracking-widest">En Cola</span>}
                    {isDone && <span className="text-[9px] font-black text-white/25 uppercase italic tracking-widest">✓ Fin</span>}
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

            {/* Dock de acciones removido por solicitud de usuario */}
            {(isLive || isPending) && (
                <div className="h-1 bg-white/5" />
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

function RulesView({ tournaments, canManage }: { tournaments: Record<string, any>, canManage: boolean }) {
    // 1. Agrupar categorías por reglas exactas para evitar redundancia
    const groupedRules: {
        tids: string[];
        categories: string[];
        content: string;
        manuals: any[];
    }[] = [];

    Object.values(tournaments).forEach((t: any) => {
        const r = t.rules || { content: '', manuals: [] };
        const key = `${r.content}_${JSON.stringify(r.manuals)}`;

        let existing = groupedRules.find(g => `${g.content}_${JSON.stringify(g.manuals)}` === key);
        const catName = `${formatCategory(t.category)} ${t.gender === 'MALE' ? '♂' : t.gender === 'FEMALE' ? '♀' : '⚥'}`;

        if (existing) {
            existing.tids.push(t.id);
            existing.categories.push(catName);
        } else {
            groupedRules.push({
                tids: [t.id],
                categories: [catName],
                content: r.content,
                manuals: r.manuals || []
            });
        }
    });

    // Formatear el título del grupo (ej: "Cat 5, 6 y 7 ♂")
    const getGroupTitle = (cats: string[]) => {
        if (cats.length === 0) return 'Reglamento';
        if (cats.length === 1) return `Reglas de ${cats[0]}`;
        const last = cats[cats.length - 1];
        const others = cats.slice(0, -1).join(', ');
        return `Reglas de ${others} y ${last}`;
    };

    // Estado para edición
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editManuals, setEditManuals] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    const startEditing = (idx: number, group: any) => {
        setEditingIdx(idx);
        setEditContent(group.content);
        setEditManuals(group.manuals);
    };

    const handleSaveGroup = async (tids: string[]) => {
        setSaving(true);
        try {
            const batch = tids.map(tid => updateDoc(doc(db, 'tournaments', tid), {
                'rules.content': editContent,
                'rules.manuals': editManuals
            }));
            await Promise.all(batch);
            setEditingIdx(null);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const shareGroupRules = (group: any) => {
        const title = getGroupTitle(group.categories);
        let text = `📋 *${title.toUpperCase()}*\n\n`;
        text += group.content || 'Sin descripción detallada.';
        if (group.manuals?.length > 0) {
            text += '\n\n📥 *Manuales oficiales:*';
            group.manuals.forEach((m: any) => {
                if (m.title && m.url) text += `\n- ${m.title}: ${m.url}`;
            });
        }

        if (navigator.share) {
            navigator.share({ title, text }).catch(() => {
                navigator.clipboard.writeText(text);
            });
        } else {
            navigator.clipboard.writeText(text);
            alert('¡Copiado al portapapeles!');
        }
    };

    const addManual = () => setEditManuals([...editManuals, { title: '', url: '' }]);
    const updateManual = (idx: number, field: string, val: string) => {
        const next = [...editManuals];
        next[idx] = { ...next[idx], [field]: val };
        setEditManuals(next);
    };
    const removeManual = (idx: number) => setEditManuals(editManuals.filter((_, i) => i !== idx));

    if (groupedRules.length === 0) return (
        <div className="py-24 text-center space-y-4 opacity-20">
            <FileText className="w-16 h-16 mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest">No hay categorías configuradas</p>
        </div>
    );

    return (
        <div className="space-y-10 pb-10">
            {groupedRules.map((group, idx) => {
                const isEditing = editingIdx === idx;
                const title = getGroupTitle(group.categories);

                return (
                    <div key={idx} className="space-y-4">
                        {/* Header del Grupo */}
                        <div className="flex items-center justify-between px-1">
                            <div className="flex-1">
                                <h3 className="text-sm font-black uppercase tracking-widest text-[#ccff00] leading-tight">
                                    {title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                        {group.tids.length} {group.tids.length === 1 ? 'categoría' : 'categorías'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => shareGroupRules(group)}
                                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-[#ccff00] hover:bg-[#ccff00]/10 transition-all flex items-center gap-2"
                                    title="Compartir reglas"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Enviar</span>
                                </button>
                                {canManage && !isEditing && (
                                    <button
                                        onClick={() => startEditing(idx, group)}
                                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-[#ccff00] transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="space-y-4 bg-white/[0.03] border border-white/10 rounded-3xl p-5">
                                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-2xl mb-2">
                                    <p className="text-[9px] text-yellow-500 font-bold uppercase tracking-widest leading-normal">
                                        ⚠️ Estás editando las reglas para: {group.categories.join(', ')}.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Texto de las Reglas</label>
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        placeholder="Introduce aquí las reglas (puntos de oro, duración, etc...)"
                                        className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-gray-300 focus:border-[#ccff00] outline-none transition-colors resize-none"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Manuales PDF (Links)</label>
                                        <button onClick={addManual} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-[9px] font-black uppercase tracking-widest hover:bg-[#ccff00]/20 transition-all">
                                            <Plus className="w-3 h-3" /> Añadir
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {editManuals.map((m, i) => (
                                            <div key={i} className="flex gap-2 items-center">
                                                <input
                                                    placeholder="Título"
                                                    value={m.title}
                                                    onChange={(e) => updateManual(i, 'title', e.target.value)}
                                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-gray-300 outline-none"
                                                />
                                                <input
                                                    placeholder="URL"
                                                    value={m.url}
                                                    onChange={(e) => updateManual(i, 'url', e.target.value)}
                                                    className="flex-[2] bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-gray-300 outline-none"
                                                />
                                                <button onClick={() => removeManual(i)} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => handleSaveGroup(group.tids)}
                                        disabled={saving}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#ccff00] text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        <Save className="w-3.5 h-3.5" /> {saving ? 'Guardando...' : 'Guardar en Grupo'}
                                    </button>
                                    <button
                                        onClick={() => setEditingIdx(null)}
                                        className="px-6 py-3 bg-white/5 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 min-h-[80px]">
                                    {group.content ? (
                                        <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">{group.content}</p>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center py-4 opacity-20">
                                            <FileText className="w-6 h-6 mb-2" />
                                            <p className="text-[9px] font-black uppercase tracking-widest">Sin detalles definidos</p>
                                        </div>
                                    )}
                                </div>

                                {group.manuals.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {group.manuals.map((m, i) => m.url && (
                                            <a
                                                key={i}
                                                href={m.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-2xl p-3 hover:bg-white/[0.06] hover:border-[#ccff00]/30 transition-all group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-[#ccff00] transition-colors">
                                                    <Download className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 truncate">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-300 truncate">{m.title || 'Manual'}</h4>
                                                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest truncate">Descargar PDF</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Main component (wrapped in Suspense below) ──────────────────────────────
function EventView() {
    const searchParams = useSearchParams();
    const idsParam = searchParams.get('ids') ?? '';
    const tournamentIds = idsParam ? idsParam.split(',').filter(Boolean) : [];

    const { user } = useAuth();
    const canManageTournament = user && (Object.values(tournaments).some((t: any) => t.owners?.includes(user.email)) || user.email === 'admin@padelscore.pro');

    const [tournaments, setTournaments] = useState<Record<string, any>>({});
    const [allMatches, setAllMatches] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<string>('all');
    const isGroupsTab = activeTab === 'groups';
    const isRulesTab = activeTab === 'rules';
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

    // ── Tabla de complejos conocidos (fuente de verdad de canchas por complejo) ──
    const KNOWN_COMPLEXES: Record<string, number> = {
        'Margarita Padel': 6,
        'Tibisay': 3,
        'Sun Sol Costa Azul': 4,
        'Food Kart': 3,
        'Elite': 4,
        'Bodeguero': 3,
        'Sun Sol Pedro Gonzalez': 2,
        'Playa el Agua': 3,
    };

    // ── numCanchas: fuente de verdad = complejo conocido, luego datos reales ──
    const numCanchas = (() => {
        const t = Object.values(tournaments)[0];

        // 1ª PRIORIDAD: tabla de complejos conocidos por nombre
        // (supera a courtNames que puede tener datos de un complejo anterior)
        const fromComplex = t?.complexName ? (KNOWN_COMPLEXES[t.complexName] ?? 0) : 0;
        if (fromComplex > 0) {
            if (process.env.NODE_ENV === 'development')
                console.log('[EventPage] numCanchas from KNOWN_COMPLEXES:', fromComplex, '| complex:', t?.complexName);
            return fromComplex;
        }

        // 2ª PRIORIDAD: canchas únicas en el primer slot de partidos reales
        const toMinuteInner = (v: any) => Math.floor(toMs(v) / 60000);
        const sortedAll = [...allMatches].sort((a, b) => toMs(a.scheduledTime) - toMs(b.scheduledTime));
        if (sortedAll.length > 0) {
            const firstMinute = toMinuteInner(sortedAll[0].scheduledTime);
            const firstSlot = sortedAll.filter(m => toMinuteInner(m.scheduledTime) === firstMinute);
            const uniqueCourts = new Set(firstSlot.map(m => Number(m.court ?? m.courtIndex ?? -1)).filter(n => n >= 0));
            if (uniqueCourts.size > 0) {
                if (process.env.NODE_ENV === 'development')
                    console.log('[EventPage] numCanchas from match data:', uniqueCourts.size);
                return uniqueCourts.size;
            }
        }

        // 3ª PRIORIDAD: totalCourts de Firestore
        const fromTotal = Number(t?.totalCourts ?? 0);
        if (fromTotal > 0) return fromTotal;

        // 4ª PRIORIDAD: courtNames.length (puede estar desactualizado)
        const fromArray = Array.isArray(t?.courtNames) && t.courtNames.length > 0 ? t.courtNames.length : 0;
        if (fromArray > 0) return fromArray;

        return 1;
    })();


    // ── Partidos pendientes ordenados por hora ────────────────────────────────
    const allPending = allMatches.filter(m => m.status === MatchStatus.PENDING);

    // Slot más temprano: redondeado al minuto para tolerar diferencias de milisegundos
    const toMinute = (v: any) => Math.floor(toMs(v) / 60000);
    const earliestMinute = allPending.length > 0 ? toMinute(allPending[0].scheduledTime) : null;

    // "Next up" = Todos los pendientes en una cuadrícula de 3 columnas (antes limitado a 3)
    const nextUpMatches = allPending;

    // ── Todos los partidos LIVE ──
    const effectiveLiveMatches = allMatches
        .filter(m => m.status === MatchStatus.LIVE)
        .sort((a, b) => Number(a.court ?? 99) - Number(b.court ?? 99));

    const effectiveLiveIds = new Set(effectiveLiveMatches.map(m => m.id));

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
                        className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>

                    {/* ── Patrocinador fijo ── */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-0.5" title="Patrocinador del evento">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                            <img
                                src="/sponsor-example.png"
                                alt="Patrocinador"
                                className="w-10 h-10 object-contain"
                            />
                        </div>
                        <span className="text-[7px] font-black uppercase tracking-widest text-gray-600">Sponsor</span>
                    </div>

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

                {/* Stat pills + Categories — una sola línea con scroll */}
                <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar mb-1 flex-nowrap">
                    {/* Pills de estado */}
                    {liveCnt > 0 && (
                        <span className="flex-shrink-0 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-widest animate-pulse">
                            ● {liveCnt} En Vivo
                        </span>
                    )}
                    <span className="flex-shrink-0 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-[9px] font-black uppercase tracking-widest">
                        {pendCnt} Por comenzar
                    </span>
                    <span className="flex-shrink-0 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-500 text-[9px] font-black uppercase tracking-widest">
                        {finCnt} Finalizados
                    </span>

                    {/* Divisor vertical */}
                    <div className="flex-shrink-0 w-px h-4 bg-white/10 mx-1" />

                    {/* Links de categorías */}
                    {Object.values(tournaments).map((t: any) => (
                        <Link key={t.id} href={`/tournaments/${t.id}`}
                            className={`flex-shrink-0 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 ${CAT_COLORS[t.gender] ?? 'bg-white/5 border-white/10 text-gray-400'}`}>
                            {formatCategory(t.category)}
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

                {/* ── Groups tab ── */}
                {isGroupsTab && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="groups-view"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <GroupsView tournaments={tournaments} />
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* ── Rules tab ── */}
                {isRulesTab && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="rules-view"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <RulesView tournaments={tournaments} canManage={canManageTournament} />
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* ── "Por Comenzar" special section ── */}
                {!isGroupsTab && !isRulesTab && activeTab === MatchStatus.PENDING && (
                    <AnimatePresence mode="popLayout">
                        <div key="pending-view" className="space-y-4">
                            {/* Next wave label */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-3 px-1 pb-1"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse shadow-[0_0_8px_#ccff00]" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ccff00]">
                                        {nextUpMatches.length > 0
                                            ? `Próximos a las ${formatHHMM(nextUpMatches[0]?.scheduledTime)}`
                                            : 'Siguientes Salidas'}
                                    </span>
                                </div>
                                <div className="flex-1 h-px bg-[#ccff00]/10" />
                                <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                                    {numCanchas} pista{numCanchas !== 1 ? 's' : ''} disponibles
                                </span>
                            </motion.div>

                            {/* Grid de 3 columnas */}
                            <div className="grid grid-cols-3 gap-2">
                                {nextUpMatches.map((match, rank) => (
                                    <NextMatchCard key={match.id ?? rank} match={match} rank={rank} compact />
                                ))}
                                {/* Relleno para completar al menos la primera fila de 3 */}
                                {nextUpMatches.length < 3 && (
                                    Array.from({ length: 3 - nextUpMatches.length }).map((_, i) => (
                                        <PlaceholderMatchCard key={`pend-pad-${i}`} rank={nextUpMatches.length + i} mode="pending" />
                                    ))
                                )}
                            </div>
                        </div>
                    </AnimatePresence>
                )}

                {/* ── "En Vivo" special section ── */}
                {!isGroupsTab && !isRulesTab && activeTab === MatchStatus.LIVE && (
                    <AnimatePresence mode="popLayout">
                        <div key="live-view" className="space-y-4">
                            {/* Live label */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-3 px-1 pb-1"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">
                                        Partidos en acción
                                    </span>
                                </div>
                                <div className="flex-1 h-px bg-emerald-500/10" />
                                <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                                    {numCanchas} pista{numCanchas !== 1 ? 's' : ''} en complejo
                                </span>
                            </motion.div>

                            {/* Grid de 3 columnas */}
                            <div className="grid grid-cols-3 gap-2">
                                {effectiveLiveMatches.map((match, rank) => (
                                    <NextMatchCard key={match.id ?? rank} match={match} rank={rank} compact />
                                ))}
                                {/* Relleno para completar al menos la primera fila de 3 */}
                                {effectiveLiveMatches.length < 3 && (
                                    Array.from({ length: 3 - effectiveLiveMatches.length }).map((_, i) => (
                                        <PlaceholderMatchCard key={`live-pad-${i}`} rank={effectiveLiveMatches.length + i} mode="live" />
                                    ))
                                )}
                            </div>
                        </div>
                    </AnimatePresence>
                )}

                {/* ── All other tabs: show full filtered list (Finished, etc) ── */}
                {!isGroupsTab && !isRulesTab && activeTab !== MatchStatus.PENDING && activeTab !== MatchStatus.LIVE && (
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
                                <MatchCard
                                    key={match.id ?? idx}
                                    match={match}
                                    idx={idx}
                                    isEffectivelyLive={effectiveLiveIds.has(match.id)}
                                    isNextUp={
                                        match.status === MatchStatus.PENDING &&
                                        earliestMinute !== null &&
                                        toMinute(match.scheduledTime) === earliestMinute
                                    }
                                />
                            ))
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div >
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
