'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, FileText, Plus } from 'lucide-react';
import { MatchStatus } from '@/types/tournament';
import { NextMatchCard, PlaceholderMatchCard, MatchCard } from './MatchCards';
import { formatHHMM, toMinute, compareMatchesTodosView } from '../utils';

function getDatePart(m: any): string {
    const raw = m.scheduledTime || m.time || '';
    if (typeof raw === 'string') return raw.split('T')[0];
    if (raw && typeof raw === 'object') return new Date(raw).toISOString().split('T')[0];
    return '';
}

function formatDayLabel(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

interface MatchListProps {
    activeTab: string;
    nextUpMatches: any[];
    effectiveLiveMatches: any[];
    filteredMatches: any[];
    allMatches: any[];
    effectiveLiveIds: Set<string>;
    nextUpIds: Set<string>;
    numCanchas: number;
    numSlotsPorComenzar: number;
    tournaments: Record<string, any>;
    canManageTournament: boolean;
    availableDates?: string[];
    selectedDate?: string;
    onSelectDate?: (date: string) => void;
    onEditRules: () => void;
}

export const MatchList: React.FC<MatchListProps> = ({
    activeTab,
    nextUpMatches,
    effectiveLiveMatches,
    filteredMatches,
    allMatches,
    effectiveLiveIds,
    nextUpIds,
    numCanchas,
    numSlotsPorComenzar,
    tournaments,
    canManageTournament,
    availableDates = [],
    selectedDate = '',
    onSelectDate,
    onEditRules
}) => {
    const dateFilteredMatches = (activeTab === 'all' && selectedDate && availableDates.length > 0)
        ? allMatches.filter((m) => getDatePart(m) === selectedDate)
        : allMatches;
    const dateFilteredNextUp = (activeTab === 'all' && selectedDate && availableDates.length > 0)
        ? nextUpMatches.filter((m) => getDatePart(m) === selectedDate)
        : nextUpMatches;
    const dateFilteredLive = (activeTab === 'all' && selectedDate && availableDates.length > 0)
        ? effectiveLiveMatches.filter((m) => getDatePart(m) === selectedDate)
        : effectiveLiveMatches;
    const dateFilteredFinished = (activeTab === 'all' && selectedDate && availableDates.length > 0)
        ? allMatches.filter((m) => (m.status === 'FINISHED' || m.status === 'COMPLETED') && getDatePart(m) === selectedDate)
        : allMatches.filter((m) => m.status === 'FINISHED' || m.status === 'COMPLETED');

    const isTodosTabLayout =
        activeTab !== MatchStatus.PENDING &&
        activeTab !== MatchStatus.LIVE &&
        activeTab !== MatchStatus.FINISHED;
    const todosLive = isTodosTabLayout ? [...dateFilteredLive].sort(compareMatchesTodosView) : dateFilteredLive;
    const todosNextUp = isTodosTabLayout ? [...dateFilteredNextUp].sort(compareMatchesTodosView) : dateFilteredNextUp;
    const todosQueuePending = isTodosTabLayout
        ? dateFilteredMatches
              .filter((m) => m.status === MatchStatus.PENDING && !nextUpIds.has(m.id))
              .sort(compareMatchesTodosView)
        : [];

    return (
        <AnimatePresence mode="wait">
            {activeTab === MatchStatus.PENDING ? (
                <motion.div
                    key="pending-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-3 px-1 pb-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse shadow-[0_0_8px_#ccff00]" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ccff00]">
                                {nextUpMatches.length > 0
                                    ? `POR COMENZAR A LAS ${formatHHMM(nextUpMatches[0]?.scheduledTime)}`
                                    : 'POR COMENZAR'}
                            </span>
                        </div>
                        <div className="flex-1 h-px bg-[#ccff00]/10" />
                        <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                            {numSlotsPorComenzar > 0 ? `${numSlotsPorComenzar} próximo${numSlotsPorComenzar !== 1 ? 's' : ''}` : 'Sin partidos pendientes'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pb-4">
                        {nextUpMatches.map((match, rank) => (
                            <NextMatchCard key={match.id ?? rank} match={match} rank={rank} compact gameNumber={rank + 1} matchNumber={allMatches.indexOf(match) + 1} />
                        ))}
                        {nextUpMatches.length === 0 && (
                            <div className="col-span-full py-10 text-center border border-dashed border-white/5 rounded-[2rem] opacity-20">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">No hay partidos por comenzar</p>
                            </div>
                        )}
                    </div>

                    {/* Mostrar también los que están en cola en esta pestaña específica */}
                    {allMatches.filter(m => m.status === MatchStatus.PENDING && !nextUpIds.has(m.id)).length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-3 px-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-300">SIGUIENTES EN ESPERA (EN COLA)</span>
                                <div className="flex-1 h-px bg-red-400/10" />
                            </div>
                            <div className="space-y-3">
                                {allMatches
                                    .filter(m => m.status === MatchStatus.PENDING && !nextUpIds.has(m.id))
                                    .map((m, idx) => (
                                        <MatchCard
                                            key={m.id}
                                            match={m}
                                            idx={idx}
                                            matchNumber={allMatches.indexOf(m) + 1}
                                            isEffectivelyLive={false}
                                            isNextUp={false}
                                        />
                                    ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            ) : activeTab === MatchStatus.LIVE ? (
                <motion.div
                    key="live-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-3 px-1 pb-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">
                                EN VIVO
                            </span>
                        </div>
                        <div className="flex-1 h-px bg-emerald-500/10" />
                        <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                            {numCanchas} pista{numCanchas !== 1 ? 's' : ''} en complejo
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {effectiveLiveMatches.map((match, rank) => (
                            <NextMatchCard key={match.id ?? rank} match={match} rank={rank} compact matchNumber={allMatches.indexOf(match) + 1} />
                        ))}
                        {effectiveLiveMatches.length < numCanchas && (
                            Array.from({ length: Math.min(6, numCanchas - effectiveLiveMatches.length) }).map((_, i) => (
                                <PlaceholderMatchCard key={`live-pad-${i}`} rank={effectiveLiveMatches.length + i} mode="live" />
                            ))
                        )}
                    </div>
                </motion.div>
            ) : activeTab === MatchStatus.FINISHED ? (
                <motion.div
                    key="finished-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-3 px-1 pb-1">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                                FINALIZADOS
                            </span>
                        </div>
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                            {filteredMatches.length} partido{filteredMatches.length !== 1 ? 's' : ''} concluido{filteredMatches.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {filteredMatches.length === 0 ? (
                            <div className="py-24 text-center space-y-4">
                                <Trophy className="w-16 h-16 text-white/5 mx-auto" />
                                <p className="text-gray-600 text-xs uppercase font-bold tracking-widest">No hay partidos finalizados aún</p>
                            </div>
                        ) : (
                            [...filteredMatches].reverse().map((match, idx) => (
                                <MatchCard
                                    key={match.id ?? idx}
                                    match={match}
                                    idx={idx}
                                    matchNumber={allMatches.indexOf(match) + 1}
                                    isEffectivelyLive={effectiveLiveIds.has(match.id)}
                                    isNextUp={nextUpIds.has(match.id)}
                                />
                            ))
                        )}
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="all-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-10"
                >
                    {/* Selector de fechas horizontal (chips): días únicos con partidos programados */}
                    {activeTab === 'all' && availableDates.length > 0 && onSelectDate && (
                        <div className="flex flex-row gap-2 overflow-x-auto pb-2 mb-4 hide-scrollbar">
                            <span className="flex-shrink-0 text-[9px] font-black uppercase tracking-widest text-white/60 self-center mr-1">Día:</span>
                            {availableDates.map((date) => (
                                <button
                                    key={date}
                                    type="button"
                                    onClick={() => onSelectDate(date)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${selectedDate === date ? 'bg-[#ccff00] text-[#0a0a0a] border-[#ccff00]' : 'bg-[#0a0a0a] border-white/20 text-gray-400 hover:border-[#ccff00]/50 hover:text-white/80'}`}
                                >
                                    {formatDayLabel(date)}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* 1. SECCIÓN EN VIVO */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">EN VIVO</span>
                            </div>
                            <div className="flex-1 h-px bg-emerald-500/10" />
                            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                                {todosLive.length} en acción
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {dateFilteredLive.map((m, idx) => (
                                <NextMatchCard key={m.id} match={m} rank={idx} compact matchNumber={allMatches.indexOf(m) + 1} />
                            ))}
                            {dateFilteredLive.length === 0 && (
                                <div className="py-10 text-center border border-dashed border-white/5 rounded-[2rem] opacity-20">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Sin partidos en curso</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. SECCIÓN POR COMENZAR (Los próximos N) */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_8px_#facc15]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">POR COMENZAR</span>
                            </div>
                            <div className="flex-1 h-px bg-yellow-400/10" />
                            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                                {dateFilteredNextUp.length} próximos
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {todosNextUp.map((m, idx) => (
                                <NextMatchCard key={m.id} match={m} rank={idx} compact gameNumber={idx + 1} matchNumber={allMatches.indexOf(m) + 1} />
                            ))}
                            {todosNextUp.length === 0 && (
                                <div className="py-10 text-center border border-dashed border-white/5 rounded-[2rem] opacity-20">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">No hay partidos por comenzar</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. SECCIÓN EN COLA (El resto de pendientes) */}
                    {todosQueuePending.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 px-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-400/50 shadow-[0_0_8px_rgba(248,113,113,0.3)]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-300">EN COLA</span>
                                </div>
                                <div className="flex-1 h-px bg-red-400/10" />
                                <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                                    {todosQueuePending.length} en espera
                                </span>
                            </div>

                            <div className="space-y-3">
                                {todosQueuePending.map((m, idx) => (
                                    <MatchCard
                                        key={m.id}
                                        match={m}
                                        idx={idx}
                                        matchNumber={allMatches.indexOf(m) + 1}
                                        isEffectivelyLive={false}
                                        isNextUp={false}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. SECCIÓN FINALIZADOS */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-3.5 h-3.5 text-gray-500" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">FINALIZADOS</span>
                            </div>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>
                        <div className="space-y-3">
                            {dateFilteredFinished.length === 0 ? (
                                <div className="py-10 text-center border border-dashed border-white/5 rounded-[2rem] opacity-20">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Aún no hay resultados</p>
                                </div>
                            ) : (
                                [...dateFilteredFinished]
                                    .reverse()
                                    .map((m, idx) => (
                                        <MatchCard
                                            key={m.id}
                                            match={m}
                                            idx={idx}
                                            matchNumber={allMatches.indexOf(m) + 1}
                                            isEffectivelyLive={false}
                                            isNextUp={false}
                                        />
                                    ))
                            )}
                        </div>
                    </div>
                    {(activeTab === 'all' || activeTab === MatchStatus.FINISHED) && (() => {
                        const firstT = Object.values(tournaments)[0];
                        const generalContent = firstT?.rules?.content ?? '';
                        return (
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-[#ccff00]">Reglas del evento</h3>
                                    {canManageTournament && (
                                        <button
                                            type="button"
                                            onClick={onEditRules}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-[10px] font-black uppercase tracking-widest hover:bg-[#ccff00]/20 transition-all"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            {generalContent ? 'Editar texto' : 'Agregar texto'}
                                        </button>
                                    )}
                                </div>
                                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 min-h-[60px]">
                                    {generalContent ? (
                                        <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">{generalContent}</p>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 opacity-40">
                                            <FileText className="w-8 h-8 mb-2 text-gray-500" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sin reglas definidas</p>
                                            {canManageTournament && (
                                                <button
                                                    type="button"
                                                    onClick={onEditRules}
                                                    className="mt-2 text-[#ccff00] text-[10px] font-black uppercase tracking-widest hover:underline"
                                                >
                                                    Agregar texto
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
