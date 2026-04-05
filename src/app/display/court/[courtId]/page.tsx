'use client';

import { useEffect, useLayoutEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { dataService } from '@/lib/dataService';
import { useCourtPlaylists } from '@/lib/useCourtPlaylists';
import { MonitorOff, Megaphone, Thermometer, Zap } from 'lucide-react';
import { useRouteSegment } from '@/lib/useRouteSegment';
import { useThreeFingerDragExit } from '@/lib/useThreeFingerDragExit';
import { useTripleTap } from '@/lib/useTripleTap';
import { visibleSetNumbersForScoreboard } from '@/lib/displaySetColumns';
import { formatPlayerFichaName } from '@/lib/playerFichaName';
import { inferStbFromSetScoresOnly } from '@/lib/matchFinishedScoreDisplay';
import { useCourtDisplayHeartbeat } from '@/lib/courtDisplayHeartbeat';
import { logDisplayVideoError } from '@/lib/logDisplayVideoError';
import { CourtAdVideoOrIframe } from '@/components/CourtAdVideoOrIframe';
import { SmartPadelBallIcon } from '@/components/SmartPadelBallIcon';
import { PizarraWarmupOverlay, parseCalentamientoEndsAt } from '@/components/PizarraWarmupOverlay';
import {
    buildCourtHeadline,
    splitPizarraCategoryMeta,
} from '@/lib/pizarraHeaderLabels';

/** Historial RTDB → forma mínima para inferir STB por setScores (1-1 + desempate). */
function matchStubFromMarcadorHistorico(marcador: any) {
    const hist = Array.isArray(marcador?.historico_sets) ? marcador.historico_sets : [];
    const setScores = hist.map((row: any) => ({
        t1: Number(row?.local ?? row?.t1 ?? 0),
        t2: Number(row?.visitante ?? row?.t2 ?? 0),
    }));
    return { setScores };
}

function formatMarcadorTeamNombre(nombre: string): string {
    const raw = (nombre || '').trim();
    if (!raw) return nombre;
    if (raw.includes('/')) {
        const parts = raw
            .split(/\s*\/\s*/)
            .map((p) => formatPlayerFichaName(p.trim()))
            .filter(Boolean);
        return parts.length ? parts.join(' / ') : raw;
    }
    return formatPlayerFichaName(raw);
}

/** Una sola línea "A / B" para la pizarra tipo tabla. */
function teamLineCompact(marcador: any, side: 'local' | 'visitante'): string {
    const raw = side === 'local' ? marcador?.equipo_1?.nombre : marcador?.equipo_2?.nombre;
    const fb = side === 'local' ? 'EQUIPO 1' : 'EQUIPO 2';
    const rawStr = (raw || '').trim();
    if (!rawStr) return fb;
    if (rawStr.includes('/')) {
        const parts = rawStr
            .split(/\s*\/\s*/)
            .map((p: string) => formatMarcadorTeamNombre(p.trim()))
            .filter(Boolean);
        return parts.length ? parts.join(' / ') : teamDisplayFromRaw(rawStr, fb);
    }
    return formatMarcadorTeamNombre(rawStr) || fb;
}

/** Pareja [jugador1, jugador2] formateada; si no hay "/" devuelve un solo nombre duplicado. */
function pairPlayerNames(marcador: any, side: 'local' | 'visitante'): [string, string] | null {
    const raw = side === 'local' ? marcador?.equipo_1?.nombre : marcador?.equipo_2?.nombre;
    const rawStr = (raw || '').trim();
    if (!rawStr) return null;
    if (rawStr.includes('/')) {
        const parts = rawStr
            .split(/\s*\/\s*/)
            .map((p: string) => formatMarcadorTeamNombre(p.trim()))
            .filter(Boolean);
        if (parts.length >= 2) return [parts[0], parts[1]];
        if (parts.length === 1) return [parts[0], parts[0]];
    }
    const single = formatMarcadorTeamNombre(rawStr) || rawStr;
    return [single, single];
}

const PIZARRA_SAQUE_BALL_PX = 12;

function TeamNamesWithServe({
    marcador,
    side,
    color,
}: {
    marcador: any;
    side: 'local' | 'visitante';
    color: string;
}) {
    const eqNum = side === 'local' ? 1 : 2;
    const saqueEq = Number(marcador?.saque?.equipo);
    const saqueJug = Number(marcador?.saque?.jugador);
    const servingHere = Number.isFinite(saqueEq) && saqueEq === eqNum;
    const j1 = servingHere && saqueJug === 1;
    const j2 = servingHere && saqueJug === 2;

    const pair = pairPlayerNames(marcador, side);
    if (!pair) {
        return (
            <span
                className="text-[11px] font-black italic uppercase leading-snug tracking-tight break-words [overflow-wrap:anywhere] sm:text-xs md:text-sm"
                style={{ color }}
            >
                {teamLineCompact(marcador, side)}
            </span>
        );
    }
    const [p1, p2] = pair;
    const same = p1 === p2;

    const cls =
        'inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-1 gap-y-0.5 text-[11px] font-black italic uppercase leading-snug tracking-tight break-words [overflow-wrap:anywhere] sm:text-xs md:text-sm';

    const ball = <SmartPadelBallIcon size={PIZARRA_SAQUE_BALL_PX} title="Saque" />;

    if (same) {
        return (
            <span className={cls} style={{ color }}>
                {(j1 || j2) && ball}
                <span>{p1}</span>
            </span>
        );
    }

    return (
        <span className={cls} style={{ color }}>
            {j1 ? (
                <>
                    {ball}
                    <span>{p1}</span>
                    <span className="shrink-0 px-0.5 text-white/45">{' / '}</span>
                    <span>{p2}</span>
                </>
            ) : j2 ? (
                <>
                    <span>{p1}</span>
                    <span className="shrink-0 px-0.5 text-white/45">{' / '}</span>
                    {ball}
                    <span>{p2}</span>
                </>
            ) : (
                <>
                    <span>{p1}</span>
                    <span className="shrink-0 px-0.5 text-white/45">{' / '}</span>
                    <span>{p2}</span>
                </>
            )}
        </span>
    );
}

function teamDisplayFromRaw(rawName: string, fallbackId: string): string {
    const raw = (rawName || '').trim();
    const isGeneric =
        !raw ||
        /^equipo\s*\d*$/i.test(raw) ||
        /^team\s*\d*$/i.test(raw) ||
        raw === '---';
    if (isGeneric) {
        return fallbackId;
    }

    const normalized = formatMarcadorTeamNombre(raw);
    return normalized || fallbackId;
}

function courtSetCell(
    setIdx: number,
    team: 'local' | 'visitante',
    marcador: any,
    currentSet: number,
): string | number {
    const hist = marcador?.historico_sets || [];
    const games = marcador?.games || { local: 0, visitante: 0 };
    const modo = marcador?.modo_puntos || 'normal';
    if (setIdx < currentSet) {
        const h = hist[setIdx - 1];
        return h?.[team] ?? 0;
    }
    if (setIdx === currentSet) {
        if (modo === 'super_tiebreak' || modo === 'tiebreak') {
            return Number(marcador?.puntos?.[team] ?? 0);
        }
        return games[team] ?? 0;
    }
    return '—';
}

/** Segundos totales del cronómetro del marker (misma lógica que `marker/[canchaId]`). */
function pizarraCronometroTotalSec(
    cron: { elapsedSec?: number; running?: boolean; startedAt?: number | null } | null | undefined,
): number {
    if (!cron) return 0;
    const base = Number(cron.elapsedSec ?? 0) || 0;
    if (cron.running && cron.startedAt != null) {
        const startMs = Number(cron.startedAt);
        if (!Number.isNaN(startMs)) {
            return base + Math.floor((dataService.getSyncedNow() - startMs) / 1000);
        }
    }
    return base;
}

/** Cronómetro del partido (`marcador.cronometro`). `compact` = barra superior. */
function PizarraCenterChrono({
    cron,
    compact,
}: {
    cron: { elapsedSec?: number; running?: boolean; startedAt?: number | null } | null | undefined;
    compact?: boolean;
}) {
    const [display, setDisplay] = useState('00:00');

    useEffect(() => {
        void dataService.syncSystemClock();
    }, []);

    useEffect(() => {
        const tick = () => {
            const totalSec = Math.max(0, pizarraCronometroTotalSec(cron));
            const h = Math.floor(totalSec / 3600);
            const m = Math.floor((totalSec % 3600) / 60);
            const s = totalSec % 60;
            if (h > 0) {
                setDisplay(
                    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
                );
            } else {
                setDisplay(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
            }
        };
        tick();
        const ms = cron?.running ? 250 : 1000;
        const id = setInterval(tick, ms);
        return () => clearInterval(id);
    }, [cron?.elapsedSec, cron?.running, cron?.startedAt]);

    return (
        <div
            className={
                compact
                    ? 'flex flex-col items-center justify-center gap-0 py-0'
                    : 'flex flex-col items-center justify-center gap-1 py-1'
            }
        >
            <span
                className={
                    compact
                        ? 'text-[7px] font-black uppercase tracking-[0.28em] text-gray-500 sm:text-[8px] sm:tracking-[0.32em]'
                        : 'text-[8px] font-black uppercase tracking-[0.35em] text-gray-500 sm:text-[9px]'
                }
            >
                Tiempo partido
            </span>
            <span
                className={
                    compact
                        ? 'font-mono text-[clamp(0.85rem,min(3.2vw,4.5vmin),1.35rem)] font-black tabular-nums leading-none tracking-tight text-padel-primary drop-shadow-[0_0_14px_rgba(204,255,0,0.22)] sm:text-[clamp(1rem,min(2.8vw,4vmin),1.5rem)]'
                        : 'font-mono text-[clamp(1.35rem,min(5vw,6vmin),3rem)] font-black tabular-nums leading-none tracking-tight text-padel-primary drop-shadow-[0_0_20px_rgba(204,255,0,0.25)]'
                }
            >
                {display}
            </span>
        </div>
    );
}

function ScoreCell({ children, color }: { children: React.ReactNode; color: string }) {
    return (
        <span
            className="inline-flex w-full min-w-0 max-w-full items-center justify-center rounded border border-white/20 bg-black/50 px-1 py-0.5 font-mono text-[11px] font-black tabular-nums sm:px-1.5 sm:text-xs md:text-sm"
            style={{ color }}
        >
            {children}
        </span>
    );
}

/** Pizarra en filas: SET 1 / SET 2 / POINTS + pelota Smart Padel de saque entre nombres y números. */
function PizarraTableScoreboard({ marcador }: { marcador: any }) {
    const setsL = Number(marcador.sets?.local ?? 0) || 0;
    const setsV = Number(marcador.sets?.visitante ?? 0) || 0;
    const currentSet = setsL + setsV + 1;
    const fmt = String(marcador.match_format || '');
    const twoPlusStb =
        fmt === 'TWO_SHORT_SETS' || fmt === 'TWO_NORMAL_SETS' || fmt === '2SETS_STB';
    const visibleBase = visibleSetNumbersForScoreboard({
        matchFormat: fmt,
        superTiebreak: marcador.super_tiebreak === true || marcador.modo_puntos === 'super_tiebreak',
        tiebreak: marcador.modo_puntos === 'tiebreak',
        setsT1: setsL,
        setsT2: setsV,
    });
    const shouldForceSecondSetCol =
        twoPlusStb &&
        setsL + setsV === 0 &&
        (Number(marcador.games?.local ?? 0) >= 6 || Number(marcador.games?.visitante ?? 0) >= 6);
    const oneSetOnly = fmt === 'ONE_SET_6' || fmt === 'ONE_SET_9';
    let visible = shouldForceSecondSetCol ? [1, 2] : visibleBase;
    // Mostrar siempre SET 1 y SET 2 en partidos que no son a un solo set (la 2.ª muestra — hasta que aplique).
    if (!oneSetOnly) {
        visible = Array.from(new Set([...visible, 1, 2])).sort((a, b) => a - b);
    }
    const scoreboardCol3Tb =
        fmt === 'TIEBREAK' || marcador.modo_puntos === 'tiebreak' || marcador.tiebreak === true;
    const scoreboardCol3Stb =
        !scoreboardCol3Tb &&
        (fmt === 'SUPER_TIEBREAK' ||
            marcador.super_tiebreak === true ||
            marcador.modo_puntos === 'super_tiebreak' ||
            fmt === 'SET_3_STB' ||
            twoPlusStb ||
            inferStbFromSetScoresOnly(matchStubFromMarcadorHistorico(marcador)));
    const setColumnLabel = (col: number) => {
        if (col === 3 && scoreboardCol3Tb) return 'TB';
        if (col === 3 && scoreboardCol3Stb) return 'STB';
        return `SET ${col}`;
    };

    const c1 = marcador?.equipo_1?.color || '#CCFF00';
    const c2 = marcador?.equipo_2?.color || '#FF5500';
    const ptsL = String(marcador.puntos?.local ?? '0');
    const ptsV = String(marcador.puntos?.visitante ?? '0');

    /** Ancho fijo compacto para alinear cabeceras y celdas; el nombre usa todo el resto. */
    const colSet = 'w-[2.1rem] min-w-[2.1rem] max-w-[2.1rem] shrink-0 sm:w-[2.35rem] sm:min-w-[2.35rem] sm:max-w-[2.35rem]';
    const colPts = 'w-[3rem] min-w-[3rem] max-w-[3.25rem] shrink-0 sm:w-[3.1rem]';

    const scoreBlock = (side: 'local' | 'visitante', color: string, pts: string) => (
        <div className="flex shrink-0 items-stretch gap-0.5 sm:gap-1">
            {visible.map((s) => {
                const v = courtSetCell(s, side, marcador, currentSet);
                return (
                    <div key={`${side}-${s}`} className={`flex justify-center ${colSet}`}>
                        <ScoreCell color={color}>{v}</ScoreCell>
                    </div>
                );
            })}
            <div className={`flex justify-center ${colPts}`}>
                <ScoreCell color={color}>{pts}</ScoreCell>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-black/45 px-3 py-3 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:px-5 sm:py-4">
            {/* Cabecera: espacio nombres | bloque SET + POINTS */}
            <div className="flex w-full min-w-0 items-end gap-2 pb-2 sm:gap-3">
                <div className="min-w-0 flex-1" />
                <div className="flex shrink-0 items-end gap-0.5 sm:gap-1">
                    {visible.map((s) => (
                        <div
                            key={`h-${s}`}
                            className={`${colSet} text-center text-[8px] font-black uppercase leading-tight tracking-wider text-gray-500 sm:text-[9px] sm:tracking-[0.2em]`}
                        >
                            {setColumnLabel(s)}
                        </div>
                    ))}
                    <div
                        className={`${colPts} text-center text-[7px] font-black uppercase leading-tight tracking-[0.12em] text-padel-primary sm:text-[8px] sm:tracking-[0.18em]`}
                    >
                        POINTS
                    </div>
                </div>
            </div>

            <div className="flex w-full min-w-0 items-start gap-2 border-b border-white/20 pb-3 sm:gap-3 sm:pb-3.5">
                <div className="min-w-0 flex-1 text-left">
                    <TeamNamesWithServe marcador={marcador} side="local" color={c1} />
                </div>
                {scoreBlock('local', c1, ptsL)}
            </div>

            <div className="mt-3 flex w-full min-w-0 items-start gap-2 sm:mt-3.5 sm:gap-3">
                <div className="min-w-0 flex-1 text-left">
                    <TeamNamesWithServe marcador={marcador} side="visitante" color={c2} />
                </div>
                {scoreBlock('visitante', c2, ptsV)}
            </div>
        </div>
    );
}

function TickerMarquee({ messages }: { messages: { id: string; mensaje: string }[] }) {
    if (!messages.length) return null;
    return (
        <div className="pizarra-ticker-bleed pizarra-ticker-bleed--flush relative z-0 box-border flex min-w-0 flex-row items-center border-b border-white/10 bg-black/60 py-4 backdrop-blur-md min-h-[4rem] sm:min-h-[4.5rem]">
            <div className="marquee-ticker-viewport">
            <div className="marquee-track animate-marquee">
                <div className="marquee-half">
                    <span className="marquee-enter-gap" aria-hidden />
                    {messages.map((msg) => (
                        <span key={msg.id} className="mx-10 shrink-0 whitespace-nowrap text-lg font-black uppercase tracking-[0.2em] text-padel-primary/90 sm:text-xl md:text-2xl">
                            {msg.mensaje}
                        </span>
                    ))}
                </div>
                <div className="marquee-half">
                    <span className="marquee-enter-gap" aria-hidden />
                    {messages.map((msg) => (
                        <span key={`${msg.id}-d`} className="mx-10 shrink-0 whitespace-nowrap text-lg font-black uppercase tracking-[0.2em] text-padel-primary/90 sm:text-xl md:text-2xl">
                            {msg.mensaje}
                        </span>
                    ))}
                </div>
            </div>
            </div>
        </div>
    );
}

/**
 * Encaja el marcador en el alto disponible (flex-1) sin scroll: escala si el contenido
 * intrínseco supera la celda (nombres largos + puntos grandes).
 */
function PizarraScoreboardFit({ children }: { children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    const updateScale = useCallback(() => {
        const wrap = containerRef.current;
        const inner = contentRef.current;
        if (!wrap || !inner) return;
        const cw = wrap.clientWidth;
        const ch = wrap.clientHeight;
        if (cw < 8 || ch < 8) return;
        const mw = inner.scrollWidth;
        const mh = inner.scrollHeight;
        if (mw < 1 || mh < 1) return;
        const s = Math.min(1, (cw - 4) / mw, (ch - 4) / mh);
        setScale((prev) => (Math.abs(prev - s) < 0.002 ? prev : s));
    }, []);

    useLayoutEffect(() => {
        updateScale();
    }, [updateScale]);

    useEffect(() => {
        const wrap = containerRef.current;
        if (!wrap || typeof ResizeObserver === 'undefined') return;
        const ro = new ResizeObserver(() => updateScale());
        ro.observe(wrap);
        const inner = contentRef.current;
        if (inner) ro.observe(inner);
        return () => ro.disconnect();
    }, [updateScale]);

    return (
        <div
            ref={containerRef}
            className="flex min-h-0 w-full flex-1 flex-col items-stretch justify-start overflow-hidden px-3 pt-1 pb-2 sm:px-6 sm:pt-2"
        >
            <div
                ref={contentRef}
                className="mx-auto w-full max-w-4xl origin-center [contain:layout]"
                style={{
                    zoom: scale,
                }}
            >
                {children}
            </div>
        </div>
    );
}

function DualPlaylistStrip({
    canchaId,
    currentVideoUrl,
    currentImageUrl,
    videoKey,
    imageKey,
    onVideoEnded,
    singleVideoLoop,
}: {
    canchaId: string;
    currentVideoUrl: string | null;
    currentImageUrl: string | null;
    videoKey: string;
    imageKey: string;
    onVideoEnded: () => void;
    singleVideoLoop: boolean;
}) {
    const hasVideo = Boolean(currentVideoUrl);
    const hasImage = Boolean(currentImageUrl);
    return (
        <div className="grid h-[min(22vh,10rem)] w-full grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-px overflow-hidden bg-white/10 sm:h-[min(26vh,12rem)] sm:grid-cols-2 sm:grid-rows-1 sm:[grid-template-columns:50%_50%]">
            <div className="relative flex min-h-0 min-w-0 h-full w-full items-center justify-center overflow-hidden bg-black">
                {hasVideo ? (
                    <CourtAdVideoOrIframe
                        url={currentVideoUrl!}
                        videoKey={videoKey}
                        className="h-full w-full max-h-full max-w-full object-contain object-center opacity-95"
                        loop={singleVideoLoop}
                        onEnded={onVideoEnded}
                        onNativeVideoError={() => logDisplayVideoError(canchaId, currentVideoUrl!)}
                    />
                ) : (
                    <span className="text-[10px] font-black uppercase text-white/25 tracking-widest">Sin vídeos</span>
                )}
            </div>
            <div className="relative flex min-h-0 min-w-0 h-full w-full items-center justify-center overflow-hidden bg-black">
                {hasImage ? (
                    <img
                        key={imageKey}
                        src={currentImageUrl!}
                        alt=""
                        className="h-full w-full max-h-full max-w-full object-contain object-center opacity-95"
                    />
                ) : (
                    <span className="text-[10px] font-black uppercase text-white/25 tracking-widest">Sin imágenes</span>
                )}
            </div>
        </div>
    );
}

/** Barra superior: izq. pista + categoría; centro estado; der. fecha / hora / temperatura (Open-Meteo Margarita). */
function PistaTopBar({
    courtHeadline,
    levelLine,
    genderLine,
    mode,
    goldenPoint,
    onOpenPremiumScoreboard,
    matchChronoCron,
}: {
    courtHeadline: string;
    levelLine: string;
    genderLine: string;
    mode: 'live' | 'wait';
    goldenPoint?: boolean;
    onOpenPremiumScoreboard?: () => void;
    /** En vivo: cronómetro del partido en el centro (sustituye “EN VIVO”). */
    matchChronoCron?: { elapsedSec?: number; running?: boolean; startedAt?: number | null } | null;
}) {
    const [now, setNow] = useState(() => new Date());
    const [tempC, setTempC] = useState<number | null>(null);

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=11.0&longitude=-63.9&current_weather=true')
            .then((r) => r.json())
            .then((data) => {
                const t = data?.current_weather?.temperature;
                if (typeof t === 'number' && Number.isFinite(t)) setTempC(Math.round(t));
            })
            .catch(() => {});
    }, []);

    const tripleTapLive = useTripleTap(
        () => onOpenPremiumScoreboard?.(),
        mode === 'live' && typeof onOpenPremiumScoreboard === 'function',
    );

    const dateStr = now
        .toLocaleDateString('es-VE', { weekday: 'short', day: '2-digit', month: 'short' })
        .toUpperCase();
    const timeStr = now.toLocaleTimeString('es-VE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
    const tempStr =
        tempC != null && Number.isFinite(tempC) ? `${tempC}°C` : '—';

    const metaMuted = 'text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500';

    return (
        <div className="relative z-20 grid w-full flex-shrink-0 grid-cols-[1fr_auto_1fr] items-start gap-3 border-b border-white/10 bg-black/60 px-4 py-2.5 backdrop-blur-xl sm:gap-4 sm:px-8 sm:py-3">
            <div className="min-w-0 flex flex-col gap-0.5 pr-1 text-left">
                <span className="truncate text-[11px] font-black uppercase tracking-[0.12em] text-white sm:text-xs">
                    {courtHeadline}
                </span>
                {levelLine ? <span className={metaMuted}>{levelLine}</span> : null}
                {genderLine ? <span className={metaMuted}>{genderLine}</span> : null}
            </div>

            <div className="flex shrink-0 flex-col items-center justify-start gap-1 pt-0.5">
                {mode === 'live' ? (
                    <div
                        onClick={onOpenPremiumScoreboard ? tripleTapLive : undefined}
                        className={
                            onOpenPremiumScoreboard
                                ? 'flex cursor-pointer touch-manipulation select-none flex-col items-center rounded-xl px-1 py-0.5 sm:px-2'
                                : 'flex flex-col items-center'
                        }
                    >
                        <PizarraCenterChrono cron={matchChronoCron} compact />
                    </div>
                ) : (
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-500/90" />
                        <span className="text-[9px] font-black uppercase tracking-[0.35em] text-gray-400 sm:text-[10px] sm:tracking-[0.4em]">
                            EN ESPERA
                        </span>
                    </div>
                )}
                {mode === 'live' && goldenPoint ? (
                    <div className="flex items-center gap-1 text-yellow-400">
                        <Zap className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                        <span className="text-[8px] font-black uppercase tracking-widest sm:text-[10px]">
                            Punto de Oro
                        </span>
                    </div>
                ) : null}
            </div>

            <div className="min-w-0 flex flex-col items-end gap-0.5 text-right">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-300 sm:text-[10px]">
                    {dateStr}
                </span>
                <span className="font-mono text-sm font-black tabular-nums text-padel-primary sm:text-base">
                    {timeStr}
                </span>
                <span className="flex items-center justify-end gap-1 text-[9px] font-bold uppercase tracking-widest text-gray-400 sm:text-[10px]">
                    <Thermometer className="h-3 w-3 shrink-0 text-padel-primary/80" aria-hidden />
                    {tempStr}
                </span>
            </div>
        </div>
    );
}

export default function CourtDisplayPage() {
    const courtId = useRouteSegment('courtId');
    const canchaId = `cancha_${courtId}`;
    const router = useRouter();
    const searchParams = useSearchParams();
    const venueFilter = (searchParams.get('complex') || searchParams.get('venue') || '').trim() || null;
    const minimalMode = searchParams.get('minimal') === '1' || searchParams.get('minimal') === 'true';
    const nativeMode = searchParams.get('native') === '1';
    const premiumMode = searchParams.get('premium') === '1';
    useThreeFingerDragExit('/');

    const [pizarraData, setPizarraData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const playlists = useCourtPlaylists(canchaId, venueFilter);
    useCourtDisplayHeartbeat(canchaId, venueFilter);
    const redirectedRef = useRef(false);

    // ── Fuente única: Supabase pizarra (misma fuente que marker / árbitro) ─
    useEffect(() => {
        if (!canchaId) return;
        const unsub = dataService.subscribePizarraCanchaState(canchaId, (state) => {
            setPizarraData(state?.data ?? null);
            setLoading(false);
        });
        return unsub;
    }, [canchaId]);

    // ── Refresco remoto via Nonce ──────────────────────────────────────────
    const lastNonceRef = useRef<number | null>(null);
    const currentNonce = pizarraData?.pizarra_refresh_nonce;
    
    useEffect(() => {
        if (currentNonce !== undefined && currentNonce !== null) {
            if (lastNonceRef.current !== null && currentNonce !== lastNonceRef.current) {
                console.log('[CourtDisplay] Refresh nonce changed, reloading...');
                window.location.reload();
            }
            lastNonceRef.current = currentNonce;
        }
    }, [currentNonce]);

    // Si hay partido real activo en esta cancha, usar la vista premium del partido.
    useEffect(() => {
        // Modo normal de cancha: SIEMPRE respeta video/imagen/tira por pizarrón.
        // Solo redirigir a la vista premium cuando se pida explícitamente (?premium=1).
        if (nativeMode || !premiumMode) return;
        if (redirectedRef.current) return;
        const torneoId = String(pizarraData?.torneo_id || '').trim();
        const partidoId = String(pizarraData?.partido_id || '').trim();
        const estado = String(pizarraData?.estado || '').trim().toLowerCase();
        if (!torneoId || !partidoId || partidoId.startsWith('live_')) return;
        if (estado !== 'en_vivo') return;
        redirectedRef.current = true;
        router.replace(`/tournaments/${encodeURIComponent(torneoId)}/display/${encodeURIComponent(partidoId)}`);
    }, [nativeMode, premiumMode, pizarraData?.estado, pizarraData?.torneo_id, pizarraData?.partido_id, router]);

    const effectiveCancha = pizarraData;
    const isEnVivo = effectiveCancha?.estado === 'en_vivo';
    const marcador = effectiveCancha?.marcador;
    /** Marker escribe en `marcador.cronometro`; compat. si existiera clave suelta en `data`. */
    const cronometroPartido =
        marcador?.cronometro ?? (effectiveCancha && typeof effectiveCancha === 'object' ? (effectiveCancha as { cronometro?: unknown }).cronometro : undefined);
    const warmupEndsAt = parseCalentamientoEndsAt(effectiveCancha?.calentamiento);
    const openPremiumScoreboard = useCallback(() => {
        const torneoId = String(effectiveCancha?.torneo_id || '').trim();
        const rawPid = String(effectiveCancha?.partido_id || '').trim();
        const partidoId = rawPid.startsWith('live_') ? rawPid.slice(5) : rawPid;
        if (!torneoId || !partidoId) return;
        router.push(
            `/tournaments/${encodeURIComponent(torneoId)}/display/${encodeURIComponent(partidoId)}`,
        );
    }, [effectiveCancha?.torneo_id, effectiveCancha?.partido_id, router]);

    const canTripleTapPremiumScoreboard = useMemo(() => {
        const torneoId = String(effectiveCancha?.torneo_id || '').trim();
        const rawPid = String(effectiveCancha?.partido_id || '').trim();
        const partidoId = rawPid.startsWith('live_') ? rawPid.slice(5) : rawPid;
        return Boolean(torneoId && partidoId);
    }, [effectiveCancha?.torneo_id, effectiveCancha?.partido_id]);

    const [tournamentMeta, setTournamentMeta] = useState<{ category?: string; gender?: string } | null>(null);
    useEffect(() => {
        const tid = String(pizarraData?.torneo_id ?? '').trim();
        if (!tid) {
            setTournamentMeta(null);
            return;
        }
        let cancelled = false;
        dataService
            .getTournament(tid)
            .then((t) => {
                if (cancelled || !t) return;
                setTournamentMeta({
                    category: (t as { category?: string }).category,
                    gender: (t as { gender?: string }).gender,
                });
            })
            .catch(() => {
                if (!cancelled) setTournamentMeta(null);
            });
        return () => {
            cancelled = true;
        };
    }, [pizarraData?.torneo_id]);

    const courtHeadline = useMemo(() => buildCourtHeadline(venueFilter, courtId), [venueFilter, courtId]);
    const { levelLine, genderLine } = useMemo(
        () => splitPizarraCategoryMeta(tournamentMeta),
        [tournamentMeta],
    );

    // ── Loading ────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="h-screen bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-padel-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-padel-primary font-black uppercase tracking-[0.3em] text-[10px] italic">
                    Buscando Señal...
                </p>
            </div>
        </div>
    );

    // ── Estado ESPERA ──────────────────────────────────────────────────────
    if (!isEnVivo) {
        return (
            <div className="relative flex h-screen w-full max-w-none min-w-0 flex-col overflow-x-hidden overflow-y-hidden bg-[#050505] font-outfit text-white">
                <div className="pointer-events-none absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_#ccff00_0%,_transparent_70%)]" />

                <PistaTopBar
                    courtHeadline={courtHeadline}
                    levelLine={levelLine}
                    genderLine={genderLine}
                    mode="wait"
                />

                <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-8 px-4">
                    <div className="relative rounded-[4rem] border border-white/10 bg-white/5 p-12 shadow-2xl backdrop-blur-xl">
                        <MonitorOff className="h-24 w-24 animate-pulse text-gray-700" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-2">
                            SEÑAL EN <span className="text-padel-primary">ESPERA</span>
                        </h1>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-sm">
                            No hay partidos en curso actualmente
                        </p>
                    </div>
                    <div className="mt-4 flex items-center gap-4 px-8 py-4 bg-white/5 rounded-2xl border border-white/10">
                        <Megaphone className="w-5 h-5 text-padel-primary" />
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                            Pronto volveremos con la mejor acción
                        </p>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 z-10 flex w-full min-w-0 max-w-none flex-col items-stretch">
                    {!minimalMode && (
                        <>
                            <DualPlaylistStrip
                                canchaId={canchaId}
                                currentVideoUrl={playlists.currentVideoUrl}
                                currentImageUrl={playlists.currentImageUrl}
                                videoKey={playlists.videoKey}
                                imageKey={playlists.imageKey}
                                onVideoEnded={playlists.videoAdvanceByTimer ? () => {} : playlists.onVideoEnded}
                                singleVideoLoop={playlists.videoUrls.length <= 1 || playlists.videoAdvanceByTimer}
                            />
                            <TickerMarquee messages={playlists.tickerMessages} />
                        </>
                    )}
                    <div className="h-8 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                </div>

                <div className="absolute bottom-12 text-center opacity-20">
                    <p className="font-black italic uppercase tracking-[0.5em] text-xs">Smart Padel Pro System</p>
                </div>

                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                    .font-outfit { font-family: 'Outfit', sans-serif; }
                    body { background: #050505; margin: 0; overflow: hidden; }
                `}</style>
            </div>
        );
    }

    // ── Estado EN VIVO — Marcador completo ─────────────────────────────────
    return (
        <div className="flex h-screen min-h-0 w-full max-w-none min-w-0 flex-col items-stretch overflow-x-hidden overflow-y-hidden bg-[#050505] font-outfit text-white select-none">
            <PizarraWarmupOverlay endsAt={warmupEndsAt} layout="fullscreen" />
            <PistaTopBar
                courtHeadline={courtHeadline}
                levelLine={levelLine}
                genderLine={genderLine}
                mode="live"
                goldenPoint={Boolean(marcador?.golden_point)}
                onOpenPremiumScoreboard={canTripleTapPremiumScoreboard ? openPremiumScoreboard : undefined}
                matchChronoCron={cronometroPartido as Parameters<typeof PizarraCenterChrono>[0]['cron']}
            />

            <PizarraScoreboardFit>
                <div className="flex w-full min-h-0 flex-col items-center gap-2 overflow-x-hidden px-1 pt-0">
                    {marcador ? <PizarraTableScoreboard marcador={marcador} /> : null}
                </div>
            </PizarraScoreboardFit>

            {!minimalMode && (
                <>
                    <div className="relative z-10 w-full min-w-0 max-w-none border-t border-white/10 flex-shrink-0 overflow-hidden">
                        <DualPlaylistStrip
                            canchaId={canchaId}
                            currentVideoUrl={playlists.currentVideoUrl}
                            currentImageUrl={playlists.currentImageUrl}
                            videoKey={playlists.videoKey}
                            imageKey={playlists.imageKey}
                            onVideoEnded={playlists.videoAdvanceByTimer ? () => {} : playlists.onVideoEnded}
                            singleVideoLoop={playlists.videoUrls.length <= 1 || playlists.videoAdvanceByTimer}
                        />
                    </div>
                    <TickerMarquee messages={playlists.tickerMessages} />
                </>
            )}

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                .font-outfit { font-family: 'Outfit', sans-serif; }
                body { background: #050505; margin: 0; overflow: hidden; }
            `}</style>
        </div>
    );
}
