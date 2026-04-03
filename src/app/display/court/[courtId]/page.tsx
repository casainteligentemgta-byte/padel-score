'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { dataService } from '@/lib/dataService';
import { useCourtPlaylists } from '@/lib/useCourtPlaylists';
import { MonitorOff, Megaphone, Wifi, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouteSegment } from '@/lib/useRouteSegment';
import { useThreeFingerDragExit } from '@/lib/useThreeFingerDragExit';
import { visibleSetNumbersForScoreboard } from '@/lib/displaySetColumns';
import { formatPlayerFichaName } from '@/lib/playerFichaName';
import { inferStbFromSetScoresOnly } from '@/lib/matchFinishedScoreDisplay';
import { useCourtDisplayHeartbeat } from '@/lib/courtDisplayHeartbeat';
import { logDisplayVideoError } from '@/lib/logDisplayVideoError';
import { CourtAdVideoOrIframe } from '@/components/CourtAdVideoOrIframe';
import { PizarraWarmupOverlay, parseCalentamientoEndsAt } from '@/components/PizarraWarmupOverlay';

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

function TickerMarquee({ messages }: { messages: { id: string; mensaje: string }[] }) {
    if (!messages.length) return null;
    return (
        <div className="pizarra-ticker-bleed pizarra-ticker-bleed--flush relative z-0 box-border flex min-w-0 flex-row items-center border-b border-white/10 bg-black/60 py-3 backdrop-blur-md min-h-[3rem]">
            <div className="marquee-ticker-viewport">
            <div className="marquee-track animate-marquee">
                <div className="marquee-half">
                    <span className="marquee-enter-gap" aria-hidden />
                    {messages.map((msg) => (
                        <span key={msg.id} className="mx-10 shrink-0 whitespace-nowrap text-xs font-black uppercase tracking-widest text-padel-primary/90">
                            {msg.mensaje}
                        </span>
                    ))}
                </div>
                <div className="marquee-half">
                    <span className="marquee-enter-gap" aria-hidden />
                    {messages.map((msg) => (
                        <span key={`${msg.id}-d`} className="mx-10 shrink-0 whitespace-nowrap text-xs font-black uppercase tracking-widest text-padel-primary/90">
                            {msg.mensaje}
                        </span>
                    ))}
                </div>
            </div>
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
        <div className="grid w-full grid-cols-1 grid-rows-2 gap-px bg-white/10 min-h-[min(22vh,10rem)] sm:grid-cols-2 sm:grid-rows-1 sm:min-h-[min(26vh,12rem)] sm:[grid-template-columns:50%_50%]">
            <div className="relative min-h-0 h-full w-full min-w-0 bg-black/80 overflow-hidden">
                {hasVideo ? (
                    <CourtAdVideoOrIframe
                        url={currentVideoUrl!}
                        videoKey={videoKey}
                        className="absolute inset-0 h-full w-full object-cover opacity-95"
                        loop={singleVideoLoop}
                        onEnded={onVideoEnded}
                        onNativeVideoError={() => logDisplayVideoError(canchaId, currentVideoUrl!)}
                    />
                ) : (
                    <span className="text-[10px] font-black uppercase text-white/25 tracking-widest">Sin vídeos</span>
                )}
            </div>
            <div className="relative flex min-h-0 h-full w-full min-w-0 items-center justify-center bg-black/80 overflow-hidden p-1 sm:p-2">
                {hasImage ? (
                    <img
                        key={imageKey}
                        src={currentImageUrl!}
                        alt=""
                        className="max-h-full max-w-full object-contain object-center opacity-95"
                    />
                ) : (
                    <span className="text-[10px] font-black uppercase text-white/25 tracking-widest">Sin imágenes</span>
                )}
            </div>
        </div>
    );
}

/** Barra superior común: visible en espera y en vivo (misma línea visual que TVs del club). */
function PistaTopBar({
    courtId,
    mode,
    goldenPoint,
}: {
    courtId: string;
    mode: 'live' | 'wait';
    goldenPoint?: boolean;
}) {
    return (
        <div className="relative z-20 flex w-full flex-shrink-0 items-center justify-between border-b border-white/10 bg-black/60 px-8 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-3">
                {mode === 'live' ? (
                    <>
                        <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">EN VIVO</span>
                        <Wifi className="h-3 w-3 text-green-400" />
                    </>
                ) : (
                    <>
                        <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500/90" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">EN ESPERA</span>
                    </>
                )}
            </div>
            <div className="rounded-full bg-padel-primary px-5 py-1 text-xs font-black uppercase italic text-black">
                PISTA {courtId}
            </div>
            {mode === 'live' && goldenPoint ? (
                <div className="flex items-center gap-2 text-yellow-400">
                    <Zap className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Punto de Oro</span>
                </div>
            ) : null}
        </div>
    );
}

export default function CourtDisplayPage() {
    const courtId = useRouteSegment('courtId');
    const canchaId = `cancha_${courtId}`;
    const router = useRouter();
    const searchParams = useSearchParams();
    const venueFilter = searchParams.get('complex') || searchParams.get('venue') || null;
    const minimalMode = searchParams.get('minimal') === '1' || searchParams.get('minimal') === 'true';
    const nativeMode = searchParams.get('native') === '1';
    const premiumMode = searchParams.get('premium') === '1';
    useThreeFingerDragExit('/');

    const [pizarraData, setPizarraData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const playlists = useCourtPlaylists(canchaId, venueFilter);
    useCourtDisplayHeartbeat(canchaId);
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
    const warmupEndsAt = parseCalentamientoEndsAt(effectiveCancha?.calentamiento);
    const SHOW_LEGACY_SET_PANEL = false;

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

                <PistaTopBar courtId={courtId} mode="wait" />

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
            <PistaTopBar courtId={courtId} mode="live" goldenPoint={Boolean(marcador?.golden_point)} />

            {/* Marcador principal */}
            <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
                {/* Equipos y puntos */}
                <div className="w-full max-w-4xl">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-6">
                        {/* Equipo 1 */}
                        <TeamPanel
                            nombre={teamDisplayFromRaw(marcador?.equipo_1?.nombre || '', 'EQUIPO 1')}
                            color={marcador?.equipo_1?.color || '#CCFF00'}
                            sets={marcador?.sets?.local ?? 0}
                            games={marcador?.games?.local ?? 0}
                            puntos={marcador?.puntos?.local ?? '0'}
                            side="left"
                        />

                        {/* Divisor central */}
                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className="w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                            <span className="text-gray-700 font-black text-xl">VS</span>
                            <div className="w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                        </div>

                        {/* Equipo 2 */}
                        <TeamPanel
                            nombre={teamDisplayFromRaw(marcador?.equipo_2?.nombre || '', 'EQUIPO 2')}
                            color={marcador?.equipo_2?.color || '#FF5500'}
                            sets={marcador?.sets?.visitante ?? 0}
                            games={marcador?.games?.visitante ?? 0}
                            puntos={marcador?.puntos?.visitante ?? '0'}
                            side="right"
                        />
                    </div>
                </div>

                {/* Sets por columnas: solo el 1.º en juego; al cerrarlo aparece el 2.º (y STB/TB si aplica) */}
                {SHOW_LEGACY_SET_PANEL && marcador && (() => {
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
                    const visible = shouldForceSecondSetCol ? [1, 2] : visibleBase;
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
                    const ptsL = marcador.puntos?.local ?? '0';
                    const ptsV = marcador.puntos?.visitante ?? '0';
                    return (
                        <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-black/50 px-4 py-3">
                            <div
                                className="grid gap-2 text-center"
                                style={{
                                    gridTemplateColumns: `repeat(${visible.length}, minmax(0, 1fr)) minmax(4rem, 6rem)`,
                                }}
                            >
                                {visible.map((s) => {
                                    const isStbCol = s === 3 && scoreboardCol3Stb;
                                    const label = setColumnLabel(s);
                                    const v1 = courtSetCell(s, 'local', marcador, currentSet);
                                    const v2 = courtSetCell(s, 'visitante', marcador, currentSet);
                                    const cellCls = (v: string | number) => {
                                        const str = String(v);
                                        const wide = str !== '—' && str.length >= 2;
                                        return `font-black tabular-nums leading-tight ${wide ? 'text-lg' : 'text-xl'}`;
                                    };
                                    return (
                                        <div key={s} className="flex flex-col gap-1 border-l border-white/10 first:border-l-0 pl-2 min-w-0">
                                            <span
                                                className={`text-[8px] font-black uppercase tracking-widest ${isStbCol ? 'text-padel-primary/70' : 'text-gray-500'}`}
                                            >
                                                {label}
                                            </span>
                                            {isStbCol && (
                                                <span className="text-[6px] font-black uppercase tracking-tighter text-gray-600 -mt-0.5">
                                                    (a 10)
                                                </span>
                                            )}
                                            <span className={cellCls(v1)} style={{ color: marcador?.equipo_1?.color || '#CCFF00' }}>{v1}</span>
                                            <span className={cellCls(v2)} style={{ color: marcador?.equipo_2?.color || '#FF5500' }}>{v2}</span>
                                        </div>
                                    );
                                })}
                                <div className="flex flex-col gap-1 border-l border-padel-primary/40 pl-2 justify-center min-w-[3.25rem]">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-padel-primary">PTS</span>
                                    <span className={`font-black tabular-nums text-padel-primary ${String(ptsL).length >= 2 ? 'text-xl' : 'text-2xl'}`}>{ptsL}</span>
                                    <span className={`font-black tabular-nums text-orange-400 ${String(ptsV).length >= 2 ? 'text-xl' : 'text-2xl'}`}>{ptsV}</span>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>

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

// ── Panel de equipo en el marcador ─────────────────────────────────────────
function TeamPanel({ nombre, color, sets, games, puntos, side }: {
    nombre: string;
    color: string;
    sets: number;
    games: number;
    puntos: string;
    side: 'left' | 'right';
}) {
    return (
        <div className={`flex flex-col items-center gap-4 ${side === 'right' ? 'text-right items-end' : 'text-left items-start'}`}>
            {/* Nombre */}
            <div
                className="font-black italic uppercase tracking-tighter text-2xl md:text-3xl max-w-full break-words whitespace-normal leading-tight"
                style={{ color }}
            >
                {nombre}
            </div>

            {/* Puntos grandes */}
            <motion.div
                key={puntos}
                initial={{ scale: 1.3, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-black italic text-[8rem] leading-none tracking-tighter"
                style={{ color }}
            >
                {puntos}
            </motion.div>

            {/* Games y Sets */}
            <div className="flex items-center gap-6">
                <div className="text-center min-w-[2.5rem]">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-600">Sets</p>
                    <p className={`font-black tabular-nums ${sets >= 10 ? 'text-2xl' : 'text-3xl'}`} style={{ color }}>{sets}</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center min-w-[2.5rem]">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-600">Games</p>
                    <p className={`font-black tabular-nums text-white ${games >= 10 ? 'text-2xl' : 'text-3xl'}`}>{games}</p>
                </div>
            </div>
        </div>
    );
}
