'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Trophy, Gamepad2, Monitor, Camera, Tv, Crosshair, Zap
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { getFinishedMatchScoreLines } from '@/lib/matchFinishedScoreDisplay';
import { MatchStatus } from '@/types/tournament';
import {
    resolveTeamNames, formatHHMM, formatDateDDMM, formatCategory, formatGender,
    STATUS_COLORS, PENDING_NEXT_COLORS, PENDING_LATER_COLORS, CAT_COLORS
} from '../utils';

// Sedes ordenadas alfabéticamente (igual que en el generador),
// mapeadas a su índice S1, S2, S3… para la URL corta de pizarra.
const SEDE_INDEX: Record<string, number> = {
    'El Bodeguero': 1,
    'Elite': 2,
    'Food Kart': 3,
    'Margarita Padel': 4,
    'Playa el Agua': 5,
    'Sun Sol Costa Azul': 6,
    'Sun Sol Pedro Gonzalez': 7,
    'Tibisay': 8,
};

/** Construye la ruta corta: S{sedeIndex}/C{court}  */
function buildShortPath(complexName: string | undefined, court: number | string | undefined): string {
    const sIdx = (complexName && SEDE_INDEX[complexName]) ? SEDE_INDEX[complexName] : null;
    const cNum = court != null ? Number(court) || court : null;
    if (sIdx && cNum) return `S${sIdx}/C${cNum}`;
    if (sIdx) return `S${sIdx}`;
    if (cNum) return `C${cNum}`;
    return '';
}

/** Sala `/marker/cancha_N` con `t`, `m` y jugadores (misma lógica que el hub de evento). */
export function buildMarkerRoomHref(match: any, rankFallback: number): string {
    const [t1p1, t1p2] = resolveTeamNames(match.team1, match.team1Name);
    const [t2p1, t2p2] = resolveTeamNames(match.team2, match.team2Name);
    const p1Name = t1p1 !== '?' ? t1p1 : '';
    const p2Name = t1p2 || '';
    const p3Name = t2p1 !== '?' ? t2p1 : '';
    const p4Name = t2p2 || '';

    const controlParams = new URLSearchParams();
    if (p1Name) controlParams.set('p1', p1Name);
    if (p2Name) controlParams.set('p2', p2Name);
    if (p3Name) controlParams.set('p3', p3Name);
    if (p4Name) controlParams.set('p4', p4Name);
    if (!p1Name && !p3Name) {
        const t1Display = match.team1?.name ?? match.team1Name ?? '';
        const t2Display = match.team2?.name ?? match.team2Name ?? '';
        if (t1Display) controlParams.set('team1', t1Display);
        if (t2Display) controlParams.set('team2', t2Display);
    }
    if (!p1Name && !p3Name && (match.t1Name || match.t2Name)) {
        const splitPair = (s: string) =>
            String(s || '')
                .split(/\s*\/\s*/)
                .map((x) => x.trim())
                .filter(Boolean);
        const a = splitPair(match.t1Name || '');
        const b = splitPair(match.t2Name || '');
        if (a[0]) controlParams.set('p1', a[0]);
        if (a[1]) controlParams.set('p2', a[1]);
        if (b[0]) controlParams.set('p3', b[0]);
        if (b[1]) controlParams.set('p4', b[1]);
    }
    const tid = match._tournamentId ?? match.tournamentId;
    if (tid) controlParams.set('t', String(tid));
    if (match.id) controlParams.set('m', String(match.id));

    const canchaId = `cancha_${match.court ?? (match.courtIndex != null ? match.courtIndex + 1 : rankFallback + 1)}`;
    return `/marker/${encodeURIComponent(canchaId)}?${controlParams.toString()}`;
}

/** Pizarra concept con torneo + partido (misma vista que debe usar el hub en lugar del display/monitor). */
export function buildPizarraConceptHref(tournamentId: string, matchId: string): string {
    return `/dev/pizarra-concept?tournamentId=${encodeURIComponent(String(tournamentId))}&matchId=${encodeURIComponent(String(matchId))}`;
}

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
export function NextMatchCard({
    match,
    rank,
    compact = false,
    gameNumber,
    matchNumber,
    showControlDock = false,
}: {
    match: any;
    rank: number;
    compact?: boolean;
    gameNumber?: number;
    matchNumber?: number;
    /** Admin / dueño de evento / marcador: dock con enlace a control del partido (`/tournaments/.../score/...` o `/marker/...` si falta id). */
    showControlDock?: boolean;
}) {
    const [t1p1, t1p2] = resolveTeamNames(match.team1, match.team1Name);
    const [t2p1, t2p2] = resolveTeamNames(match.team2, match.team2Name);
    const isLive = match.status === MatchStatus.LIVE;
    /** Mismo criterio amplio que el hub (`event/page`): LIVE / IN_PROGRESS / STARTED. */
    const canOpenMarkerOnDblClick =
        match.status === MatchStatus.LIVE ||
        match.status === 'IN_PROGRESS' ||
        match.status === 'STARTED';

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
    const markerHref = buildMarkerRoomHref(match, rank);

    /** Con torneo + partido → sala de árbitro del torneo; si no, marker con query `t`/`m`/jugadores. */
    const controlHref =
        match._tournamentId && match.id
            ? `/tournaments/${match._tournamentId}/score/${encodeURIComponent(String(match.id))}`
            : markerHref;
    const pizarraHref = buildPizarraConceptHref(String(match._tournamentId ?? ''), String(match.id || matchKey));
    const camasHref = `/tournaments/${match._tournamentId}/control/broadcasting`;
    const adsHref = `/admin/publicidad`;

    // URL corta para la pizarra: www.smartpadel58.com/S1/C1
    const courtNum = match.court ?? (match.courtIndex != null ? match.courtIndex + 1 : rank + 1);
    const shortPath = buildShortPath(match._complexName, courtNum);
    const courtLabel = match.courtName ?? (courtNum != null ? `Pista ${courtNum}` : 'Pista –');
    const shortUrl = shortPath ? `smartpadel58.com/pizarra/${shortPath}` : '';


    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: rank * 0.06 }}
                className={`rounded-2xl border overflow-hidden flex flex-col ${rankBg[safeRank]}${canOpenMarkerOnDblClick ? ' cursor-pointer' : ''}`}
                title={canOpenMarkerOnDblClick ? 'Doble clic: abrir sala marker' : undefined}
                onDoubleClick={
                    canOpenMarkerOnDblClick
                        ? (e) => {
                              e.preventDefault();
                              window.open(markerHref, '_blank', 'noopener,noreferrer');
                          }
                        : undefined
                }
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


                {/* Dock para PLAYERS: solo botón Pizarra + dirección corta */}
                {!showControlDock && match._tournamentId && (
                    <div className="border-t-2 border-[#ccff00]/30">
                        <Link
                            href={pizarraHref}
                            target="_blank"
                            className="flex items-center justify-center gap-2 py-2.5 bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20 transition-all active:scale-95 w-full"
                        >
                            <Monitor className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-[7px] font-black uppercase tracking-tight leading-none">Pizarra</span>
                            {shortUrl && (
                                <span className="text-[6px] font-mono text-[#ccff00]/60 ml-1 truncate">{shortUrl}</span>
                            )}
                        </Link>
                    </div>
                )}

                {/* Action Dock — solo visible para admin/marker */}
                {showControlDock && (
                    <div
                        className={`grid gap-px bg-white/[0.04] border-t-2 border-[#ccff00]/40 overflow-hidden ${
                            canOpenMarkerOnDblClick
                                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
                                : 'grid-cols-2 sm:grid-cols-4'
                        }`}
                    >
                        <Link
                            href={controlHref}
                            className="flex flex-col items-center justify-center gap-1 py-2 bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20 transition-all active:scale-95"
                        >
                            <Gamepad2 className="w-3.5 h-3.5" />
                            <span className="text-[6px] font-black uppercase tracking-tight leading-none whitespace-nowrap">Control</span>
                        </Link>
                        {canOpenMarkerOnDblClick && (
                            <Link
                                href={markerHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center gap-1 py-2 bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20 transition-all active:scale-95"
                                title="Sala de marcador (misma ventana que doble clic en la tarjeta)"
                            >
                                <Crosshair className="w-3.5 h-3.5" />
                                <span className="text-[6px] font-black uppercase tracking-tight leading-none whitespace-nowrap">Marcador</span>
                            </Link>
                        )}
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
                )}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: rank * 0.07 }}
            className={`rounded-[1.75rem] border overflow-hidden ${rankBg[safeRank]}${canOpenMarkerOnDblClick ? ' cursor-pointer' : ''}`}
            title={canOpenMarkerOnDblClick ? 'Doble clic: abrir sala marker' : undefined}
            onDoubleClick={
                canOpenMarkerOnDblClick
                    ? (e) => {
                          e.preventDefault();
                          window.open(markerHref, '_blank', 'noopener,noreferrer');
                      }
                    : undefined
            }
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
                        {rankLabelFull[safeRank] ?? 'Cancha'}
                    </span>
                    <span className="text-[#ccff00]/50">·</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#ccff00]">
                        {courtLabel}
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

            {/* Dock para PLAYERS: solo botón Pizarra + dirección corta */}
            {!showControlDock && match._tournamentId && (
                <div className="border-t-2 border-[#ccff00]/30">
                    <Link
                        href={pizarraHref}
                        target="_blank"
                        className="flex items-center justify-center gap-2 py-3 bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20 transition-all active:scale-95 w-full"
                    >
                        <Monitor className="w-4 h-4 shrink-0" />
                        <span className="text-[8px] font-black uppercase tracking-widest leading-none">Pizarra</span>
                        {shortUrl && (
                            <span className="text-[7px] font-mono text-[#ccff00]/60 ml-1">{shortUrl}</span>
                        )}
                    </Link>
                </div>
            )}

            {/* Action Dock full — solo visible para admin/marker */}
            {showControlDock && (
                <div
                    className={`grid gap-px bg-white/[0.04] border-t-2 border-[#ccff00]/40 ${
                        canOpenMarkerOnDblClick
                            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
                            : 'grid-cols-2 sm:grid-cols-4'
                    }`}
                >
                    <Link
                        href={controlHref}
                        className="flex flex-col items-center justify-center gap-1.5 py-3.5 bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20 transition-all active:scale-95"
                    >
                        <Gamepad2 className="w-4 h-4" />
                        <span className="text-[8px] font-black uppercase tracking-widest leading-none whitespace-nowrap">Control</span>
                    </Link>
                    {canOpenMarkerOnDblClick && (
                        <Link
                            href={markerHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center gap-1.5 py-3.5 bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20 transition-all active:scale-95"
                            title="Sala de marcador (misma ventana que doble clic en la tarjeta)"
                        >
                            <Crosshair className="w-4 h-4" />
                            <span className="text-[8px] font-black uppercase tracking-widest leading-none whitespace-nowrap">Marcador</span>
                        </Link>
                    )}
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
            )}
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
    const isDone = match.status === MatchStatus.FINISHED || match.status === 'COMPLETED';
    const isPending = match.status === MatchStatus.PENDING;
    const finishedDetailLines = isDone ? getFinishedMatchScoreLines(match) : [];
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
            const nowIso = new Date().toISOString();
            await dataService.updateMatch(match._tournamentId, match.id, {
                status: MatchStatus.LIVE,
                startedAt: nowIso,
                actualStartTime: nowIso,
                sets: { t1: 0, t2: 0 },
                games: { t1: 0, t2: 0 },
                points: { t1: '0', t2: '0' },
                server: { team: 1, player: 1 },
            });
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
                : isDone ? STATUS_COLORS[MatchStatus.FINISHED]
                    : isLive && !isEffectivelyLive ? PENDING_NEXT_COLORS
                        : isNextUp ? PENDING_NEXT_COLORS
                            : PENDING_LATER_COLORS
                }`}
        >
            <div className="px-4 pt-2.5 pb-2 border-b border-white/[0.07] bg-white/[0.04] flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        {matchNumber != null && (
                            <>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Partido {matchNumber}</span>
                                <span className="text-white/30">·</span>
                            </>
                        )}
                        <span className={`text-[10px] font-bold ${isEffectivelyLive ? 'text-emerald-300/95' : 'italic text-gray-400'}`}>
                            {formatDateDDMM(match.scheduledTime ?? match.time)} · {formatHHMM(match.scheduledTime ?? match.time)}
                        </span>
                    </div>
                    <div className="flex w-full min-w-0 flex-col items-center gap-1.5 text-[8px] sm:text-[9px]">
                        <p className={`w-full truncate text-center font-black uppercase italic tracking-tight ${isEffectivelyLive ? 'text-emerald-400' : isDone ? 'text-gray-600' : (isLive || isNextUp) ? 'text-yellow-300' : 'text-red-400/70'}`}>
                            {match.courtName ?? (match.court != null ? `Pista ${match.court}` : 'Pista –')}
                        </p>
                        <div className="flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-1">
                            <span className="max-w-[min(100%,12rem)] truncate rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-center font-bold uppercase tracking-tight text-gray-400">
                                {formatCategory(match._category)}
                            </span>
                            <span className={`whitespace-nowrap rounded border px-1.5 py-0.5 font-black uppercase tracking-tight ${CAT_COLORS[match._gender] ?? 'border-white/10 bg-white/5 text-gray-500'}`}>
                                {match._gender === 'MALE' ? '♂ Masc' : match._gender === 'FEMALE' ? '♀ Fem' : match._gender === 'MIXED' ? '⚥ Mix' : formatGender(match._gender) || '—'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                    {isEffectivelyLive && (
                        <>
                            <span className="text-[9px] font-black uppercase italic tracking-widest text-emerald-400 animate-pulse">● En Vivo</span>
                            {match._tournamentId && match.id && (
                                <Link
                                    href={`/tournaments/${match._tournamentId}/score/${match.id}`}
                                    className="inline-flex items-center justify-center gap-0.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[7px] font-black uppercase tracking-widest text-emerald-300 transition-colors hover:bg-emerald-500/20"
                                >
                                    <Zap className="h-2.5 w-2.5 shrink-0" />
                                    Marcador
                                </Link>
                            )}
                        </>
                    )}
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

            {isDone && finishedDetailLines.length > 0 && (
                <div className="px-4 pb-2 flex flex-col gap-0.5 border-t border-white/[0.06] pt-2">
                    {finishedDetailLines.map((ln: string, i: number) => (
                        <p
                            key={i}
                            className={`text-[8px] font-black uppercase tracking-tight text-center leading-tight ${
                                ln.includes('STB') ? 'text-[#ccff00]' : 'text-gray-500'
                            }`}
                        >
                            {ln}
                        </p>
                    ))}
                </div>
            )}

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
