'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid, Users, Award, TrendingUp, Calendar, Trophy, Zap
} from 'lucide-react';
import { MatchStatus } from '@/types/tournament';
import {
    formatCategory, formatHHMM, formatDateDDMM, resolveTeamNames, calcGroupStanding, formatDisplayName
} from '../utils';
import { TeamPairDisplay } from '@/components/TeamPairDisplay';

interface GroupsViewProps {
    tournaments: Record<string, any>;
    /** Solo tablas de clasificación (sin conmutar a lista de partidos del grupo). */
    rankingOnly?: boolean;
}

// ── Sub-component: Standings Table ──────────────────────────────────────────
const StandingsTable = ({ activeTournament, gName, groupAssignments, allMatches }: {
    activeTournament: any;
    gName: string;
    groupAssignments: Record<string, string[]>;
    allMatches: any[];
}) => {
    const teamIds: string[] = groupAssignments[gName] ?? [];
    const teams = activeTournament?.teams ?? [];

    const rows = teamIds.map((tid, tIdx) => {
        const teamIdx = teams.findIndex((t: any) => String(t.id) === String(tid));
        const team = teamIdx >= 0 ? teams[teamIdx] : null;
        const tNum = teamIdx + 1;

        const isSimple = activeTournament?.type === 'AMERICANO_INDIVIDUAL';
        let name: string;
        let p1Name = '';
        let p2Name = '';
        let player2Accepted = true;
        if (team) {
            const p1 = formatDisplayName((team.p1Name || team.p1?.name || '').trim());
            const p2 = formatDisplayName((team.p2Name || team.p2?.name || '').trim());
            p1Name = p1 || `Jugador ${tNum}`;
            p2Name = p2 || (isSimple ? '' : `Jugador ${tNum + 1}`);
            const isPlaceholder = (s: string) => !s || s.startsWith('Jugador ');
            if (isSimple) {
                name = p1Name;
            } else {
                name = (p1 && p2) ? `${p1} / ${p2}` : (p1 || `Pareja ${tNum}`);
                player2Accepted = !isPlaceholder(p2);
            }
        } else {
            name = isSimple ? `Jugador ${tNum}` : `Pareja ${tNum}`;
        }

        const stats = calcGroupStanding(tid, tNum, allMatches);
        return { id: tid, name, tNum, p1Name, p2Name, player2Accepted, ...stats };
    }).sort((a, b) => {
        // 1. Puntos (Pts)
        if (b.Pts !== a.Pts) return b.Pts - a.Pts;

        // Si hay empate en Puntos, revisamos la regla de la Categoría
        const rule = activeTournament?.tieBreakRule || 'GAMES_DIFF';

        if (rule === 'HEAD_TO_HEAD') {
            // Intentar desempate directo (Enfrentamiento)
            // Se busca el partido jugado entre ambos equipos
            const h2hMatch = allMatches.find(m => 
                m.status === MatchStatus.FINISHED &&
                ((m.team1Index === a.tNum && m.team2Index === b.tNum) ||
                 (m.team1Index === b.tNum && m.team2Index === a.tNum))
            );

            if (h2hMatch) {
                const aWins = (h2hMatch.team1Index === a.tNum && h2hMatch.score1 > h2hMatch.score2) ||
                              (h2hMatch.team2Index === a.tNum && h2hMatch.score2 > h2hMatch.score1);
                const bWins = (h2hMatch.team1Index === b.tNum && h2hMatch.score1 > h2hMatch.score2) ||
                              (h2hMatch.team2Index === b.tNum && h2hMatch.score2 > h2hMatch.score1);
                
                if (aWins) return -1;
                if (bWins) return 1;
            }
            // Si no hay partido entre ellos o fue empate, se pasa al siguiente criterio (JF-JC)
        }

        // 2. Diferencia de Juegos (JF - JC)
        const da = a.JF - a.JC, db = b.JF - b.JC;
        if (db !== da) return db - da;

        // 3. Partidos Ganados (PG)
        return b.PG - a.PG;
    });

    const groupMatchesTotal = allMatches.filter(m =>
        m.stage === 'GROUP_STAGE' &&
        rows.map(r => r.tNum).includes(m.team1Index) &&
        rows.map(r => r.tNum).includes(m.team2Index)
    );
    const groupMatchesDone = groupMatchesTotal.filter(m => m.status === MatchStatus.FINISHED).length;
    const pct = groupMatchesTotal.length > 0 ? Math.round((groupMatchesDone / groupMatchesTotal.length) * 100) : 0;

    const isSimple = activeTournament?.type === 'AMERICANO_INDIVIDUAL';
    const qualifyingSpots = Math.min(2, rows.length);
    const groupLetter = gName.length === 1 ? gName : gName.replace('Grupo', '').trim();
    const rankCol = rows.length >= 10 ? 'minmax(30px,auto)' : '26px';
    const colStat = (isSimple ? 36 : 34) + 'px';

    return (
        <motion.div
            key={`group-${gName}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="rounded-[2rem] border border-white/[0.08] overflow-hidden bg-[#111] shadow-2xl"
        >
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

            <div className="h-1 bg-black/20">
                <div className="h-full bg-[#ccff00] transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>

            <div className="grid px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.05] gap-x-0.5 items-end" style={{ gridTemplateColumns: isSimple ? `${rankCol} 1fr ${colStat} ${colStat} ${colStat} ${colStat} ${colStat} 44px 44px` : `${rankCol} 1fr ${colStat} ${colStat} ${colStat} ${colStat} ${colStat} 40px 40px 44px` }}>
                <span className="text-[10px] font-black text-white/80 uppercase tracking-tighter text-center pb-1">#</span>
                <span className="text-[10px] font-black text-white/80 uppercase tracking-tighter pl-1 pb-1">{isSimple ? 'Jugador' : 'Pareja'}</span>
                <span className="text-[11px] font-black uppercase tracking-wider text-center rounded-lg border border-amber-400/45 bg-amber-500/35 text-amber-50 py-1.5 px-0.5 shadow-sm">PJ</span>
                <span className="text-[11px] font-black uppercase tracking-wider text-center rounded-lg border border-emerald-400/45 bg-emerald-500/35 text-emerald-50 py-1.5 px-0.5 shadow-sm">PG</span>
                <span className="text-[11px] font-black uppercase tracking-wider text-center rounded-lg border border-rose-400/45 bg-rose-500/35 text-rose-50 py-1.5 px-0.5 shadow-sm">PP</span>
                {!isSimple && <span className="text-[11px] font-black uppercase tracking-wider text-center rounded-lg border border-sky-400/45 bg-sky-500/35 text-sky-50 py-1.5 px-0.5 shadow-sm">JF</span>}
                <span className="text-[11px] font-black uppercase tracking-wider text-center rounded-lg border border-violet-400/45 bg-violet-500/35 text-violet-50 py-1.5 px-0.5 shadow-sm">JC</span>
                <span className="text-[11px] font-black uppercase tracking-wider text-center rounded-lg border border-white/25 bg-white/15 text-white py-1.5 px-0.5 shadow-sm">±J</span>
                <span className="text-[11px] font-black uppercase tracking-wider text-center rounded-lg border border-cyan-400/45 bg-cyan-500/35 text-cyan-50 py-1.5 px-0.5 shadow-sm">%W</span>
                <span className="text-[11px] font-black uppercase tracking-wider text-center rounded-lg border border-[#ccff00]/50 bg-[#ccff00]/30 text-black py-1.5 px-0.5 shadow-sm">Pts</span>
            </div>

            <div className="divide-y divide-white/[0.04]">
                {rows.map((row, idx) => {
                    const qualifying = idx < qualifyingSpots;
                    const isLeader = idx === 0;
                    const diff = row.JF - row.JC;
                    return (
                        <div key={row.id} className={`grid px-4 py-3 items-center transition-colors hover:bg-white/[0.03] gap-x-0.5 ${isLeader ? 'bg-[#ccff00]/[0.04]' : ''}`}
                            style={{ gridTemplateColumns: isSimple ? `${rankCol} 1fr ${colStat} ${colStat} ${colStat} ${colStat} ${colStat} 44px 44px` : `${rankCol} 1fr ${colStat} ${colStat} ${colStat} ${colStat} ${colStat} 40px 40px 44px` }}>
                            <div className="flex justify-center">
                                {idx === 0 ? (
                                    <div className="w-5 h-5 rounded-md bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center shrink-0">
                                        <Trophy className="w-2.5 h-2.5 text-yellow-400" />
                                    </div>
                                ) : qualifying ? (
                                    <div className={`${idx + 1 >= 10 ? 'min-w-5 px-1' : 'w-5'} h-5 rounded-md bg-[#ccff00]/20 border border-[#ccff00]/40 flex items-center justify-center font-black text-[#ccff00] shrink-0 tabular-nums ${idx + 1 >= 10 ? 'text-[6px]' : 'text-[7px]'}`}>{idx + 1}</div>
                                ) : (
                                    <div className={`${idx + 1 >= 10 ? 'min-w-5 px-1' : 'w-5'} h-5 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center font-black text-gray-600 shrink-0 tabular-nums ${idx + 1 >= 10 ? 'text-[6px]' : 'text-[7px]'}`}>{idx + 1}</div>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 min-w-0 pl-1">
                                <div className={`w-1 h-7 rounded-full flex-shrink-0 ${qualifying ? 'bg-[#ccff00]' : 'bg-white/[0.08]'}`} />
                                <div className="min-w-0">
                                    {isSimple ? (
                                        <p className={`text-[10px] font-black uppercase italic tracking-tight truncate leading-none ${isLeader ? 'text-[#ccff00]' : 'text-white'}`}>{row.name}</p>
                                    ) : (
                                        <TeamPairDisplay
                                            player1Name={row.p1Name || row.name.split(' / ')[0] || '—'}
                                            player2Name={row.p2Name || row.name.split(' / ')[1] || '—'}
                                            player2Accepted={row.player2Accepted !== false}
                                            compact
                                            className={isLeader ? '[&_span]:text-[#ccff00]' : '[&_span]:text-white'}
                                        />
                                    )}
                                </div>
                            </div>
                            <span className="text-[11px] font-black text-amber-100 text-center tabular-nums">{row.PJ}</span>
                            <span className="text-[11px] font-black text-emerald-200 text-center tabular-nums">{row.PG}</span>
                            <span className="text-[11px] font-black text-rose-200 text-center tabular-nums">{row.PP}</span>
                            {!isSimple && <span className="text-[11px] font-black text-sky-100 text-center tabular-nums">{row.JF}</span>}
                            <span className="text-[11px] font-black text-violet-100 text-center tabular-nums">{row.JC}</span>
                            <span className={`text-[10px] font-black text-center ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                {diff > 0 ? `+${diff}` : diff}
                            </span>
                            <span className="text-[9px] font-black text-cyan-400/80 text-center">{Math.round(row.winRate)}%</span>
                            <span className="text-[11px] font-black text-[#ccff00] text-center">{row.Pts}</span>
                        </div>
                    );
                })}
            </div>

            <div className="px-5 py-2.5 border-t border-white/[0.05] bg-white/[0.01]">
                <p className="text-[7px] text-gray-700 font-bold uppercase tracking-widest">
                    Desempate: 1° Pts · {activeTournament?.tieBreakRule === 'HEAD_TO_HEAD' ? '2° Enfrentamiento Directo · 3° ±Juegos' : '2° ±Juegos (JF-JC) · 3° PG'}
                </p>
            </div>
        </motion.div>
    );
};

const RANKING_STATS_LEGEND = (
    <div className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3.5 space-y-2.5">
        <p className="text-[11px] font-black uppercase tracking-widest text-gray-200">Leyenda de columnas</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2.5 text-[11px] leading-snug text-gray-200">
            <span><span className="font-black text-amber-200">PJ</span> — Partidos jugados</span>
            <span><span className="font-black text-emerald-300">PG</span> — Partidos ganados</span>
            <span><span className="font-black text-rose-300">PP</span> — Partidos perdidos</span>
            <span><span className="font-black text-sky-200">JF</span> — Juegos a favor (totales en el grupo)</span>
            <span><span className="font-black text-violet-200">JC</span> — Juegos en contra (totales en el grupo)</span>
            <span><span className="font-black text-white">±J</span> — Diferencia de juegos (JF − JC)</span>
            <span><span className="font-black text-cyan-300">%W</span> — Porcentaje de partidos ganados</span>
            <span><span className="font-black text-[#ccff00]">Pts</span> — Puntos de la fase de grupos</span>
        </div>
    </div>
);

// ── Sub-component: Group Matches ──────────────────────────────────────────
const GroupMatches = ({ gName, groupAssignments, activeTournament, allMatches }: {
    gName: string;
    groupAssignments: Record<string, string[]>;
    activeTournament: any;
    allMatches: any[];
}) => {
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
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-2">
            {groupMatches.map((m, idx) => {
                const isDone = m.status === MatchStatus.FINISHED;
                const isLive = m.status === MatchStatus.LIVE;
                const [t1p1, t1p2] = resolveTeamNames(m.team1, m.team1Name);
                const [t2p1, t2p2] = resolveTeamNames(m.team2, m.team2Name);

                return (
                    <div key={m.id || idx} className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]">
                        <div className="space-y-1.5 border-b border-white/[0.06] px-3 pt-2.5 pb-2 text-center">
                            <p className="text-left text-[10px] font-black uppercase tracking-tight text-gray-400">
                                <span>Partido {idx + 1}</span>
                                <span className="text-white/25"> · </span>
                                <span className="font-bold text-gray-300">{formatDateDDMM(m.scheduledTime ?? m.time)} · {formatHHMM(m.scheduledTime ?? m.time)}</span>
                            </p>
                            <p className="truncate text-[9px] font-black uppercase tracking-tight text-gray-400 sm:text-[10px]">
                                Pista {m.court ?? '–'}
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[8px] font-bold uppercase tracking-wide text-gray-500 sm:text-[9px]">
                                {activeTournament?.category && (
                                    <span className="max-w-[min(100%,11rem)] truncate rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5">
                                        {formatCategory(activeTournament.category)}
                                    </span>
                                )}
                                {activeTournament?.gender && (
                                    <span className="whitespace-nowrap rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-black text-gray-400">
                                        {activeTournament.gender === 'MALE' ? 'Masc' : activeTournament.gender === 'FEMALE' ? 'Fem' : 'Mix'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-4 p-3">
                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className={`text-[10px] font-black uppercase truncate ${isDone && (m.score1 > m.score2) ? 'text-[#ccff00]' : 'text-gray-300'}`}>{t1p1}</p>
                                        {t1p2 && <p className="-mt-0.5 text-[8px] font-bold uppercase text-gray-500 truncate">{t1p2}</p>}
                                    </div>
                                    {isDone && <span className="px-1 text-xs font-black text-white">{m.score1 ?? 0}</span>}
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className={`text-[10px] font-black uppercase truncate ${isDone && (m.score2 > m.score1) ? 'text-[#ccff00]' : 'text-gray-300'}`}>{t2p1}</p>
                                        {t2p2 && <p className="-mt-0.5 text-[8px] font-bold uppercase text-gray-500 truncate">{t2p2}</p>}
                                    </div>
                                    {isDone && <span className="px-1 text-xs font-black text-white">{m.score2 ?? 0}</span>}
                                </div>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1.5 border-l border-white/10 py-1 pl-4">
                                {isDone ? (
                                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">Finalizado</span>
                                ) : isLive ? (
                                    <>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-[#ccff00] animate-pulse">En Vivo</span>
                                        {activeTournament?.id && m.id && (
                                            <Link
                                                href={`/tournaments/${activeTournament.id}/score/${m.id}`}
                                                className="inline-flex items-center justify-center gap-0.5 rounded-md border border-[#ccff00]/40 bg-[#ccff00]/10 px-2 py-1 text-[7px] font-black uppercase tracking-widest text-[#ccff00] transition-colors hover:bg-[#ccff00]/20"
                                            >
                                                <Zap className="h-2.5 w-2.5 shrink-0" />
                                                Marcador
                                            </Link>
                                        )}
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>
                );
            })}
        </motion.div>
    );
};

export const GroupsView: React.FC<GroupsViewProps> = ({ tournaments, rankingOnly = false }) => {
    const tourList = Object.values(tournaments) as any[];
    const withGroups = tourList.filter(t => t.groupAssignments && Object.keys(t.groupAssignments).length > 0);

    // Estado para saber qué grupo está activo en cada categoría (usando un mapa id-torneo -> nombre-grupo)
    const [activeGroupsMap, setActiveGroupsMap] = useState<Record<string, string>>({});
    const [activeViewMap, setActiveViewMap] = useState<Record<string, 'standings' | 'matches'>>({});

    if (withGroups.length === 0) {
        return (
            <div className="py-24 text-center space-y-4">
                <LayoutGrid className="w-16 h-16 text-white/5 mx-auto" />
                <p className="text-gray-600 text-xs uppercase font-bold tracking-widest">No hay grupos configurados</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {withGroups.map((t, tIdx) => {
                const groupAssignments: Record<string, string[]> = t.groupAssignments ?? {};
                const groupNames = Object.keys(groupAssignments).sort();
                const currentGroupName = activeGroupsMap[t.id] ?? groupNames[0] ?? null;
                const currentView = activeViewMap[t.id] ?? 'standings';
                const allMatches: any[] = t.matches ?? [];

                return (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: tIdx * 0.1 }}
                        className="space-y-4"
                    >
                        {/* Header de Categoría */}
                        <div className="flex items-center gap-4 px-1">
                            <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-[#ccff00] flex items-center justify-center shadow-[0_8px_16px_rgba(204,255,0,0.2)]">
                                <Trophy className="w-5 h-5 text-black" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-black italic uppercase tracking-tighter text-[#ccff00] leading-none mb-1">
                                    {formatCategory(t.category)}
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    {rankingOnly
                                        ? `Ranking · ${t.gender === 'MALE' ? 'Masculino' : t.gender === 'FEMALE' ? 'Femenino' : 'Mixto'} · ${groupNames.length} grupos`
                                        : `${t.gender === 'MALE' ? 'Masculino' : t.gender === 'FEMALE' ? 'Femenino' : 'Mixto'} · ${groupNames.length} Grupos`}
                                </p>
                            </div>
                        </div>

                        {/* Selector de Grupo para esta categoría */}
                        {groupNames.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto hide-scrollbar flex-nowrap pb-1">
                                {groupNames.map(gName => {
                                    const groupLetter = gName.length === 1 ? gName : gName.replace('Grupo', '').trim();
                                    const isActive = (currentGroupName === gName);
                                    return (
                                        <button
                                            key={gName}
                                            onClick={() => setActiveGroupsMap(prev => ({ ...prev, [t.id]: gName }))}
                                            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all ${isActive
                                                ? 'bg-[#ccff00] text-black shadow-lg scale-105'
                                                : 'bg-white/[0.06] text-gray-400 hover:bg-white/10 border border-white/10'
                                                }`}
                                        >
                                            <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-black ${isActive ? 'bg-black/20' : 'bg-white/10'}`}>{groupLetter}</span>
                                            Grupo {groupLetter}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Toggle de Vista (oculto en pestaña Ranking del evento) */}
                        {!rankingOnly && (
                            <div className="flex justify-center pt-2">
                                <div className="inline-flex items-center p-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl">
                                    <button
                                        onClick={() => setActiveViewMap(prev => ({ ...prev, [t.id]: 'standings' }))}
                                        className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 ${currentView === 'standings' ? 'bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/10' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        <TrendingUp className="w-3 h-3" />
                                        Tabla
                                    </button>
                                    <button
                                        onClick={() => setActiveViewMap(prev => ({ ...prev, [t.id]: 'matches' }))}
                                        className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 ${currentView === 'matches' ? 'bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/10' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        <Calendar className="w-3 h-3" />
                                        Partidos
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Contenido Dinámico */}
                        <AnimatePresence mode="wait">
                            {currentGroupName && (
                                currentView === 'standings'
                                    ? <StandingsTable key={`standings-${t.id}-${currentGroupName}`} activeTournament={t} gName={currentGroupName} groupAssignments={groupAssignments} allMatches={allMatches} />
                                    : <GroupMatches key={`matches-${t.id}-${currentGroupName}`} gName={currentGroupName} groupAssignments={groupAssignments} activeTournament={t} allMatches={allMatches} />
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
            {RANKING_STATS_LEGEND}
        </div>
    );
};
