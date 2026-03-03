'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid, Users, Award, TrendingUp, Calendar, Trophy
} from 'lucide-react';
import { MatchStatus } from '@/types/tournament';
import {
    formatCategory, formatHHMM, resolveTeamNames, calcGroupStanding
} from '../utils';

interface GroupsViewProps {
    tournaments: Record<string, any>;
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

            <div className="grid px-4 py-2 bg-white/[0.03] border-b border-white/[0.05]" style={{ gridTemplateColumns: isSimple ? '24px 1fr 34px 34px 34px 34px 34px 42px 42px' : '24px 1fr 32px 32px 32px 32px 32px 38px 38px 42px' }}>
                <span className="text-[8px] font-black text-gray-700 uppercase tracking-wider text-center">#</span>
                <span className="text-[8px] font-black text-gray-700 uppercase tracking-wider pl-1">{isSimple ? 'Jugador' : 'Pareja'}</span>
                <span className="text-[8px] font-black text-gray-700 uppercase tracking-wider text-center">PJ</span>
                <span className="text-[8px] font-black text-gray-700 uppercase tracking-wider text-center">PG</span>
                <span className="text-[8px] font-black text-gray-700 uppercase tracking-wider text-center">PP</span>
                {!isSimple && <span className="text-[8px] font-black text-gray-700 uppercase tracking-wider text-center">JF</span>}
                <span className="text-[8px] font-black text-gray-700 uppercase tracking-wider text-center">JC</span>
                <span className="text-[8px] font-black text-gray-700 uppercase tracking-wider text-center">±J</span>
                <span className="text-[8px] font-black text-cyan-400 uppercase tracking-wider text-center">%W</span>
                <span className="text-[8px] font-black text-[#ccff00]/70 uppercase tracking-wider text-center">Pts</span>
            </div>

            <div className="divide-y divide-white/[0.04]">
                {rows.map((row, idx) => {
                    const qualifying = idx < qualifyingSpots;
                    const isLeader = idx === 0;
                    const diff = row.JF - row.JC;
                    return (
                        <div key={row.id} className={`grid px-4 py-3 items-center transition-colors hover:bg-white/[0.03] ${isLeader ? 'bg-[#ccff00]/[0.04]' : ''}`}
                            style={{ gridTemplateColumns: isSimple ? '24px 1fr 34px 34px 34px 34px 34px 42px 42px' : '24px 1fr 32px 32px 32px 32px 32px 38px 38px 42px' }}>
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
                            <div className="flex items-center gap-1.5 min-w-0 pl-1">
                                <div className={`w-1 h-7 rounded-full flex-shrink-0 ${qualifying ? 'bg-[#ccff00]' : 'bg-white/[0.08]'}`} />
                                <div className="min-w-0">
                                    {isSimple ? (
                                        <p className={`text-[10px] font-black uppercase italic tracking-tight truncate leading-none ${isLeader ? 'text-[#ccff00]' : 'text-white'}`}>{row.name}</p>
                                    ) : (() => {
                                        const parts = row.name.split(' / ');
                                        return (
                                            <div className="flex flex-col min-w-0">
                                                <p className={`text-[9px] font-black uppercase italic tracking-tight truncate leading-none ${isLeader ? 'text-[#ccff00]' : 'text-white'}`}>{parts[0]}</p>
                                                {parts[1] && <p className="text-[8px] font-bold text-gray-500 uppercase italic tracking-tighter truncate leading-none mt-1">{parts[1]}</p>}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
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
                        </div>
                    );
                })}
            </div>

            <div className="px-5 py-2.5 border-t border-white/[0.05] bg-white/[0.01]">
                <p className="text-[7px] text-gray-700 font-bold uppercase tracking-widest">
                    Desempate: 1° Pts · 2° ±Juegos (JF-JC) · 3° PG
                </p>
            </div>
        </motion.div>
    );
};

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
                    <div key={m.id || idx} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col">
                        <div className="p-3 flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className={`text-[10px] font-black uppercase truncate ${isDone && (m.score1 > m.score2) ? 'text-[#ccff00]' : 'text-gray-300'}`}>{t1p1}</p>
                                        {t1p2 && <p className="text-[8px] font-bold text-gray-500 uppercase truncate -mt-0.5">{t1p2}</p>}
                                    </div>
                                    {isDone && <span className="text-xs font-black text-white px-1">{m.score1 ?? 0}</span>}
                                </div>
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
                                <span className="text-[9px] font-bold text-gray-700 uppercase">Pista {m.court ?? '-'}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </motion.div>
    );
};

export const GroupsView: React.FC<GroupsViewProps> = ({ tournaments }) => {
    const tourList = Object.values(tournaments) as any[];
    const withGroups = tourList.filter(t => t.groupAssignments && Object.keys(t.groupAssignments).length > 0);

    const [activeCatId, setActiveCatId] = useState<string>(withGroups[0]?.id ?? '');
    const [activeGroup, setActiveGroup] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'standings' | 'matches'>('standings');

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

    return (
        <div className="space-y-4">
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
                                    <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-black ${isActive ? 'bg-black/20' : 'bg-white/10'}`}>{groupLetter}</span>
                                    Grupo {groupLetter}
                                    {gMatches.length > 0 && (
                                        <span className={`text-[8px] font-bold ${isActive ? 'text-black/60' : 'text-gray-600'}`}>{done}/{gMatches.length}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

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

            <AnimatePresence mode="wait">
                {currentGroupName && (
                    activeView === 'standings'
                        ? <StandingsTable activeTournament={activeTournament} gName={currentGroupName} groupAssignments={groupAssignments} allMatches={allMatches} />
                        : <GroupMatches gName={currentGroupName} groupAssignments={groupAssignments} activeTournament={activeTournament} allMatches={allMatches} />
                )}
            </AnimatePresence>

            {groupNames.length > 1 && (
                <div className="flex justify-center gap-2 pt-1">
                    {groupNames.map(name => (
                        <button
                            key={name}
                            onClick={() => setActiveGroup(name)}
                            className={`transition-all rounded-full ${currentGroupName === name ? 'w-6 h-1.5 bg-[#ccff00]' : 'w-1.5 h-1.5 bg-white/20'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
