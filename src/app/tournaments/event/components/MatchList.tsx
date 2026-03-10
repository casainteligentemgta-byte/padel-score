'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, FileText, Plus } from 'lucide-react';
import { MatchStatus } from '@/types/tournament';
import { NextMatchCard, PlaceholderMatchCard, MatchCard } from './MatchCards';
import { formatHHMM, toMinute } from '../utils';

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
    onEditRules
}) => {
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
                                    ? `Próximos a las ${formatHHMM(nextUpMatches[0]?.scheduledTime)}`
                                    : 'Siguientes Salidas'}
                            </span>
                        </div>
                        <div className="flex-1 h-px bg-[#ccff00]/10" />
                        <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                            {numSlotsPorComenzar > 0 ? `${numSlotsPorComenzar} próximo${numSlotsPorComenzar !== 1 ? 's' : ''}` : 'Sin partidos pendientes'}
                        </span>
                    </div>

                    <div
                        className="grid gap-2"
                        style={{ gridTemplateColumns: numSlotsPorComenzar > 0 ? `repeat(${numSlotsPorComenzar}, minmax(0, 1fr))` : '1fr' }}
                    >
                        {nextUpMatches.map((match, rank) => (
                            <NextMatchCard key={match.id ?? rank} match={match} rank={rank} compact gameNumber={rank + 1} matchNumber={allMatches.indexOf(match) + 1} />
                        ))}
                    </div>
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
                                Partidos en acción
                            </span>
                        </div>
                        <div className="flex-1 h-px bg-emerald-500/10" />
                        <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                            {numCanchas} pista{numCanchas !== 1 ? 's' : ''} en complejo
                        </span>
                    </div>

                    <div
                        className="grid gap-2"
                        style={{ gridTemplateColumns: `repeat(${numCanchas}, minmax(0, 1fr))` }}
                    >
                        {effectiveLiveMatches.map((match, rank) => (
                            <NextMatchCard key={match.id ?? rank} match={match} rank={rank} compact matchNumber={allMatches.indexOf(match) + 1} />
                        ))}
                        {effectiveLiveMatches.length < numCanchas && (
                            Array.from({ length: numCanchas - effectiveLiveMatches.length }).map((_, i) => (
                                <PlaceholderMatchCard key={`live-pad-${i}`} rank={effectiveLiveMatches.length + i} mode="live" />
                            ))
                        )}
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="list-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                >
                    {filteredMatches.length === 0 ? (
                        <div className="py-24 text-center space-y-4">
                            <Trophy className="w-16 h-16 text-white/5 mx-auto" />
                            <p className="text-gray-600 text-xs uppercase font-bold tracking-widest">No hay partidos en esta sección</p>
                        </div>
                    ) : (
                        filteredMatches.map((match, idx) => (
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
