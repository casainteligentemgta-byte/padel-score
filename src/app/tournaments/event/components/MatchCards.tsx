'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Trophy, Gamepad2, Monitor, Camera, Tv
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { MatchStatus } from '@/types/tournament';
import {
    resolveTeamNames, formatHHMM, formatCategory, formatGender,
    STATUS_COLORS, PENDING_NEXT_COLORS, PENDING_LATER_COLORS, CAT_COLORS
} from '../utils';

// ── Placeholder para pistas vacías ──────────────────────────────────────────
export function PlaceholderMatchCard({ rank, mode = 'pending' }: { rank: number; mode?: 'pending' | 'live' }) {
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
                <p className="label-cancha-meta text-center leading-none text-gray-400">Pista Libre</p>
            </div>
        </div>
    );
}

// ── "Por Comenzar" action card (top 3 only) ────────────────────────────────
export function NextMatchCard({ match, rank, compact = false, gameNumber, matchNumber }: { match: any; rank: number; compact?: boolean; gameNumber?: number; matchNumber?: number }) {
    const [t1p1, t1p2] = resolveTeamNames(match.team1, match.team1Name);
    const [t2p1, t2p2] = resolveTeamNames(match.team2, match.team2Name);
    const isLive = match.status === MatchStatus.LIVE;

    const rankColors = isLive
        ? ['text-emerald-400', 'text-emerald-400', 'text-emerald-400', 'text-emerald-400', 'text-emerald-400', 'text-emerald-400']
        : ['text-[#ccff00]', 'text-white/80', 'text-white/50', 'text-white/30', 'text-white/20', 'text-white/15'];

    const rankBg = isLive
        ? [
            'bg-emerald-500/10 border-emerald-500/30 shadow-[0_4px_24px_rgba(16,185,129,0.1)]',
            'bg-emerald-500/5 border-emerald-500/25',
            'bg-emerald-500/5 border-emerald-500/20',
            'bg-emerald-500/5 border-emerald-500/15',
            'bg-emerald-500/5 border-emerald-500/10',
            'bg-emerald-500/5 border-emerald-500/10',
        ]
        : [
            'bg-yellow-400/10 border-yellow-400/30 shadow-[0_4px_24px_rgba(250,204,21,0.08)]',
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

    const matchKey = match.id || (match.court ? `court_${match.court}` : (match.courtIndex != null ? `court_${match.courtIndex + 1}` : `court_${rank + 1}`));
    const canchaId = `cancha_${match.court ?? (match.courtIndex != null ? match.courtIndex + 1 : rank + 1)}`;
    const rawTeam1Name = match.team1?.name ?? match.team1Name ?? '';
    const rawTeam2Name = match.team2?.name ?? match.team2Name ?? '';
    const controlHref = `/marker/${encodeURIComponent(canchaId)}?team1=${encodeURIComponent(String(rawTeam1Name))}&team2=${encodeURIComponent(String(rawTeam2Name))}`;
    const pizarraHref = `/tournaments/${match._tournamentId}/display/${encodeURIComponent(match.id || matchKey)}`;
    const camasHref = `/tournaments/${match._tournamentId}/control/broadcasting`;
    const adsHref = `/admin/publicidad`;

    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: rank * 0.06 }}
                className={`rounded-2xl border overflow-hidden flex flex-col ${rankBg[safeRank]}`}
            >
                {/* Franja superior */}
                <div className="px-2 pt-2 pb-1.5 flex items-center justify-between gap-1 border-b-2 border-[#ccff00]/50 bg-[#ccff00]/10 flex-wrap">
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        {/* 1) Hora estimada / score si está en vivo */}
                        <span className="text-[8px] font-bold text-[#ccff00]/90 italic flex-shrink-0">
                            {isLive ? `${match.score1 ?? 0} - ${match.score2 ?? 0}` : formatHHMM(match.scheduledTime)}
                        </span>

                        {/* 2) Número de partido */}
                        {matchNumber != null && (
                            <>
                                <span className="text-[#ccff00]/50 text-[8px]">·</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-[#ccff00]/80 flex-shrink-0">
                                    Partido {matchNumber}
                                </span>
                            </>
                        )}

                        {/* 3) Juego */}
                        {!isLive && gameNumber != null && (
                            <>
                                <span className="text-[#ccff00]/50 text-[8px]">·</span>
                                <span className="text-[8px] font-black text-[#ccff00]/90 italic">{gameNumber}º Juego</span>
                            </>
                        )}

                        {/* 4) Nivel/Categoría */}
                        {match._category && (
                            <>
                                <span className="text-[#ccff00]/50 text-[8px]">·</span>
                                <span className="text-[8px] font-bold text-[#ccff00]/90 uppercase tracking-tight">
                                    {formatCategory(match._category)}
                                </span>
                            </>
                        )}

                        {/* 5) Género */}
                        <span className="text-[#ccff00]/50 text-[8px]">·</span>
                        <span
                            className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${CAT_COLORS[match._gender] ?? 'bg-white/10 border-white/20 text-[#ccff00]/90'}`}
                        >
                            {formatGender(match._gender) || '—'}
                        </span>
                    </div>
                </div>

                {/* Jugadores compactos */}
                <div className="px-2 py-2 flex-1 bg-[#ccff00]/5 border-y-2 border-[#ccff00]/30 flex items-center justify-center">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 w-full">
                        <div className="text-center min-w-0">
                            <p className="text-[9px] font-black uppercase tracking-tight leading-tight truncate text-[#ccff00]">{t1p1}</p>
                            <p className="text-[9px] font-black uppercase tracking-tight leading-tight truncate text-[#ccff00]">{t1p2 || '—'}</p>
                        </div>
                        <div className="text-[9px] font-black text-[#ccff00]/40 text-center italic leading-none px-1">
                            VS
                        </div>
                        <div className="text-center min-w-0">
                            <p className="text-[9px] font-black uppercase tracking-tight leading-tight truncate text-[#ccff00]">{t2p1}</p>
                            <p className="text-[9px] font-black uppercase tracking-tight leading-tight truncate text-[#ccff00]">{t2p2 || '—'}</p>
                        </div>
                    </div>
                </div>


                {/* Action Dock */}
                <div className={`grid ${(!isLive && match._tournamentId) ? 'grid-cols-3 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'} gap-px bg-white/[0.04] border-t-2 border-[#ccff00]/40 overflow-hidden`}>
                    {!isLive && match._tournamentId && (
                        <button
                            onClick={async () => {
                                if (!confirm('¿Comenzar este partido ahora?')) return;
                                try {
                                    await dataService.updateMatch(match._tournamentId, match.id, { status: MatchStatus.LIVE });
                                } catch (err) { console.error(err); }
                            }}
                            className="flex flex-col items-center justify-center gap-1 py-2 bg-[#ccff00] text-black hover:bg-white transition-all active:scale-95"
                        >
                            <Gamepad2 className="w-3.5 h-3.5" />
                            <span className="text-[6px] font-black uppercase tracking-tight leading-none whitespace-nowrap">Comenzar</span>
                        </button>
                    )}
                    <Link
                        href={controlHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center gap-1 py-2 bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20 transition-all active:scale-95"
                    >
                        <Gamepad2 className="w-3.5 h-3.5" />
                        <span className="text-[6px] font-black uppercase tracking-tight leading-none whitespace-nowrap">Control</span>
                    </Link>
                    <Link
                        href={pizarraHref}
                        target="_blank"
                        className="flex flex-col items-center justify-center gap-1 py-2 bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20 transition-all active:scale-95"
                    >
                        <Monitor className="w-3.5 h-3.5" />
                        <span className="text-[6px] font-black uppercase tracking-tight leading-none whitespace-nowrap">Pizarra</span>
                    </Link>
                    <Link
                        href={camasHref}
                        target="_blank"
                        className="flex flex-col items-center justify-center gap-1 py-2 bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20 transition-all active:scale-95"
                    >
                        <Camera className="w-3.5 h-3.5" />
                        <span className="text-[6px] font-black uppercase tracking-tight leading-none whitespace-nowrap">Cámaras</span>
                    </Link>
                    <Link
                        href={adsHref}
                        target="_blank"
                        className="flex flex-col items-center justify-center gap-1 py-2 bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20 transition-all active:scale-95"
                    >
                        <Tv className="w-3.5 h-3.5" />
                        <span className="text-[6px] font-black uppercase tracking-tight leading-none whitespace-nowrap">Ads</span>
                    </Link>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: rank * 0.07 }}
            className={`rounded-[1.75rem] border overflow-hidden ${rankBg[safeRank]}`}
        >
            <div className="px-4 pt-3 pb-2.5 flex items-center justify-between gap-2 border-b-2 border-[#ccff00]/50 bg-[#ccff00]/10 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                    {matchNumber != null && (
                        <>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#ccff00]/90">Partido {matchNumber}</span>
                            <span className="text-[#ccff00]/50">·</span>
                        </>
                    )}
                    <span className="text-[9px] font-bold text-[#ccff00]/90 italic">{formatHHMM(match.scheduledTime)}</span>
                    <span className="text-[#ccff00]/50">·</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ccff00]">
                        {rankLabelFull[safeRank] ?? (match.courtName ?? (match.court != null ? `Pista ${match.court}` : 'Pista –'))}
                    </span>
                    <span className="text-[#ccff00]/50">·</span>
                    <span className="text-[9px] font-bold text-[#ccff00]/90 uppercase tracking-tight">
                        {formatCategory(match._category)}
                    </span>
                    <span className="text-[#ccff00]/50">·</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${CAT_COLORS[match._gender] ?? 'bg-white/10 border-white/20 text-[#ccff00]/90'}`}>
                        {formatGender(match._gender) || '—'}
                    </span>
                    {gameNumber != null && (
                        <>
                            <span className="text-[#ccff00]/50">·</span>
                            <span className="text-[9px] font-black text-[#ccff00]/90 italic">{gameNumber}º juego</span>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-4 bg-[#ccff00]/5 border-y-2 border-[#ccff00]/30">
                <div className="text-right space-y-0.5">
                    <p className="text-[13px] font-black uppercase tracking-tight leading-tight text-[#ccff00]">{t1p1}</p>
                    {t1p2 && <p className="text-[10px] font-bold text-[#ccff00]/80 uppercase tracking-tight">{t1p2}</p>}
                </div>
                <span className="text-[11px] font-black text-[#ccff00]/70 uppercase italic tracking-widest px-2">vs</span>
                <div className="text-left space-y-0.5">
                    <p className="text-[13px] font-black uppercase tracking-tight leading-tight text-[#ccff00]">{t2p1}</p>
                    {t2p2 && <p className="text-[10px] font-bold text-[#ccff00]/80 uppercase tracking-tight">{t2p2}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.04] border-t-2 border-[#ccff00]/40">
                <Link
                    href={controlHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 py-3.5 bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20 transition-all active:scale-95"
                >
                    <Gamepad2 className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest leading-none whitespace-nowrap">Control</span>
                </Link>
                <Link
                    href={pizarraHref}
                    target="_blank"
                    className="flex flex-col items-center justify-center gap-1.5 py-3.5 bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20 transition-all active:scale-95"
                >
                    <Monitor className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest leading-none whitespace-nowrap">Pizarra</span>
                </Link>
                <Link
                    href={camasHref}
                    target="_blank"
                    className="flex flex-col items-center justify-center gap-1.5 py-3.5 bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20 transition-all active:scale-95"
                >
                    <Camera className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest leading-none whitespace-nowrap">Cámaras</span>
                </Link>
                <Link
                    href={adsHref}
                    target="_blank"
                    className="flex flex-col items-center justify-center gap-1.5 py-3.5 bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20 transition-all active:scale-95"
                >
                    <Tv className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest leading-none whitespace-nowrap">Publicidad</span>
                </Link>
            </div>
        </motion.div>
    );
}

// ── Standard match card ─────────────────────────────────────────────────────
export function MatchCard({ match, idx, isNextUp, isEffectivelyLive, matchNumber }: {
    match: any;
    idx: number;
    isNextUp: boolean;
    isEffectivelyLive: boolean;
    matchNumber?: number;
}) {
    const isLive = match.status === MatchStatus.LIVE;
    const isDone = match.status === MatchStatus.FINISHED;
    const isPending = match.status === MatchStatus.PENDING;
    const [t1p1, t1p2] = resolveTeamNames(match.team1, match.team1Name);
    const [t2p1, t2p2] = resolveTeamNames(match.team2, match.team2Name);
    const [ending, setEnding] = useState(false);

    const endMatch = async () => {
        if (!match._tournamentId) return;
        if (!confirm('¿Terminar este partido ahora?')) return;
        setEnding(true);
        try {
            await dataService.updateMatch(match._tournamentId, match.id, { status: MatchStatus.FINISHED });
        } catch (e) {
            console.error('[endMatch]', e);
            alert('Error al terminar el partido.');
        } finally {
            setEnding(false);
        }
    };

    const startMatch = async () => {
        if (!match._tournamentId) return;
        if (!confirm('¿Comenzar este partido ahora?')) return;
        setEnding(true);
        try {
            await dataService.updateMatch(match._tournamentId, match.id, { status: MatchStatus.LIVE });
        } catch (e) {
            console.error('[startMatch]', e);
            alert('Error al comenzar el partido.');
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
                    : isLive && !isEffectivelyLive ? PENDING_NEXT_COLORS
                        : isNextUp ? PENDING_NEXT_COLORS
                            : PENDING_LATER_COLORS
                }`}
        >
            <div className="px-4 pt-2.5 pb-2 border-b border-white/[0.07] bg-white/[0.04] flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                    {matchNumber != null && (
                        <>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Partido {matchNumber}</span>
                            <span className="text-white/30">·</span>
                        </>
                    )}
                    <span className="text-[10px] font-bold text-gray-400 italic">{formatHHMM(match.scheduledTime)}</span>
                    <span className="text-white/30">·</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest italic truncate ${isEffectivelyLive ? 'text-emerald-400' : isDone ? 'text-gray-600' : (isLive || isNextUp) ? 'text-yellow-300' : 'text-red-400/70'}`}>
                        {match.courtName ?? (match.court != null ? `Pista ${match.court}` : 'Pista –')}
                    </span>
                    <span className="text-white/30">·</span>
                    <span className="text-[9px] font-bold uppercase tracking-tight text-gray-400">
                        {formatCategory(match._category)}
                    </span>
                    <span className="text-white/30">·</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${CAT_COLORS[match._gender] ?? 'bg-white/5 border-white/10 text-gray-500'}`}>
                        {match._gender === 'MALE' ? '♂ Masculino' : match._gender === 'FEMALE' ? '♀ Femenino' : match._gender === 'MIXED' ? '⚥ Mixto' : formatGender(match._gender) || '—'}
                    </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {isEffectivelyLive && <span className="text-[9px] font-black text-emerald-400 uppercase italic tracking-widest animate-pulse">● En Vivo</span>}
                    {isLive && !isEffectivelyLive && <span className="text-[9px] font-black text-yellow-400 uppercase italic tracking-widest">⏱ Próximo</span>}
                    {!isLive && isPending && isNextUp && <span className="text-[9px] font-black text-yellow-400 uppercase italic tracking-widest">⏱ Próximo</span>}
                    {!isLive && isPending && !isNextUp && <span className="text-[9px] font-black text-red-400/60 uppercase italic tracking-widest">En Cola</span>}
                    {isDone && <span className="text-[9px] font-black text-white/25 uppercase italic tracking-widest">✓ Fin</span>}
                </div>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 bg-[#ccff00]/5 border-y-2 border-[#ccff00]/30">
                <div className="text-right space-y-0.5">
                    <p className="text-[12px] font-black uppercase tracking-tight leading-tight text-[#ccff00]">{t1p1}</p>
                    {t1p2 && <p className="text-[10px] font-bold text-[#ccff00]/80 uppercase tracking-tight">{t1p2}</p>}
                </div>
                <div className="flex items-center gap-1.5">
                    {isLive || isDone ? (
                        <>
                            <span className={`text-2xl font-black tabular-nums ${isLive ? 'text-[#ccff00]' : 'text-white'}`}>{match.score1 ?? 0}</span>
                            <span className="text-gray-700 font-black text-lg">-</span>
                            <span className={`text-2xl font-black tabular-nums ${isLive ? 'text-[#ccff00]' : 'text-white'}`}>{match.score2 ?? 0}</span>
                        </>
                    ) : (
                        <span className="text-[10px] font-black text-[#ccff00]/70 uppercase italic tracking-widest">vs</span>
                    )}
                </div>
                <div className="text-left space-y-0.5">
                    <p className="text-[12px] font-black uppercase tracking-tight leading-tight text-[#ccff00]">{t2p1}</p>
                    {t2p2 && <p className="text-[10px] font-bold text-[#ccff00]/80 uppercase tracking-tight">{t2p2}</p>}
                </div>
            </div>

            {(isLive || isPending) && (
                <div className="h-1 bg-white/5" />
            )}

            {isDone && (
                <Link href={`/tournaments/${match._tournamentId}`}
                    className="block px-4 py-1.5 border-t border-white/[0.05] text-[9px] font-bold uppercase tracking-widest text-gray-600 hover:text-[#ccff00] transition-colors text-center">
                    Ver categoría →
                </Link>
            )}
        </motion.div>
    );
}
