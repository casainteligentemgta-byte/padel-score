'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { dataService } from '@/lib/dataService';
import { useCourtPlaylists } from '@/lib/useCourtPlaylists';
import { MonitorOff, Megaphone, Wifi, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouteSegment } from '@/lib/useRouteSegment';
import { useThreeFingerDragExit } from '@/lib/useThreeFingerDragExit';
import { visibleSetNumbersForScoreboard } from '@/lib/displaySetColumns';
import { useCourtDisplayHeartbeat } from '@/lib/courtDisplayHeartbeat';
import { logDisplayVideoError } from '@/lib/logDisplayVideoError';

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
        <div className="w-full overflow-hidden border-b border-white/10 bg-black/60 backdrop-blur-md py-2">
            <div className="flex items-center whitespace-nowrap animate-marquee">
                {messages.map((msg) => (
                    <span key={msg.id} className="mx-10 text-xs font-black uppercase tracking-widest text-padel-primary/90">
                        {msg.mensaje}
                    </span>
                ))}
                {messages.map((msg) => (
                    <span key={`${msg.id}-d`} className="mx-10 text-xs font-black uppercase tracking-widest text-padel-primary/90">
                        {msg.mensaje}
                    </span>
                ))}
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
    if (!hasVideo && !hasImage) return null;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 min-h-[7rem]">
            <div className="relative bg-black/80 overflow-hidden flex items-center justify-center">
                {hasVideo ? (
                    <video
                        key={videoKey}
                        src={currentVideoUrl!}
                        className="w-full h-full object-cover opacity-90 max-h-32"
                        autoPlay
                        muted
                        playsInline
                        loop={singleVideoLoop}
                        onEnded={onVideoEnded}
                        onError={() => logDisplayVideoError(canchaId, currentVideoUrl!)}
                    />
                ) : (
                    <span className="text-[10px] font-black uppercase text-white/25 tracking-widest">Sin vídeos</span>
                )}
                <span className="absolute bottom-1 left-2 text-[8px] font-black uppercase text-white/40">Vídeo</span>
            </div>
            <div className="relative bg-black/80 overflow-hidden flex items-center justify-center">
                {hasImage ? (
                    <img
                        key={imageKey}
                        src={currentImageUrl!}
                        alt=""
                        className="w-full h-full object-cover opacity-90 max-h-32"
                    />
                ) : (
                    <span className="text-[10px] font-black uppercase text-white/25 tracking-widest">Sin imágenes</span>
                )}
                <span className="absolute bottom-1 left-2 text-[8px] font-black uppercase text-white/40">Imagen</span>
            </div>
        </div>
    );
}

export default function CourtDisplayPage() {
    const courtId = useRouteSegment('courtId');
    const canchaId = `cancha_${courtId}`;
    const searchParams = useSearchParams();
    const venueFilter = searchParams.get('complex') || searchParams.get('venue') || null;
    useThreeFingerDragExit('/');

    const [pizarraData, setPizarraData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const playlists = useCourtPlaylists(canchaId, venueFilter);
    useCourtDisplayHeartbeat(canchaId);

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

    const effectiveCancha = pizarraData;
    const isEnVivo = effectiveCancha?.estado === 'en_vivo';
    const marcador = effectiveCancha?.marcador;

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
            <div className="h-screen w-screen bg-[#050505] flex flex-col items-center justify-center text-white font-outfit relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_#ccff00_0%,_transparent_70%)]" />

                <div className="relative z-10 flex flex-col items-center gap-8">
                    <div className="p-12 bg-white/5 rounded-[4rem] border border-white/10 shadow-2xl backdrop-blur-xl relative">
                        <MonitorOff className="w-24 h-24 text-gray-700 animate-pulse" />
                        <div className="absolute -top-4 -right-4 bg-padel-primary text-black px-6 py-2 rounded-2xl font-black italic uppercase text-sm shadow-[0_10px_20px_rgba(204,255,0,0.3)]">
                            PISTA {courtId}
                        </div>
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

                <div className="absolute top-0 left-0 right-0 z-20">
                    <TickerMarquee messages={playlists.tickerMessages} />
                </div>

                <div className="absolute bottom-0 left-0 right-0 z-10">
                    <DualPlaylistStrip
                        canchaId={canchaId}
                        currentVideoUrl={playlists.currentVideoUrl}
                        currentImageUrl={playlists.currentImageUrl}
                        videoKey={playlists.videoKey}
                        imageKey={playlists.imageKey}
                        onVideoEnded={playlists.onVideoEnded}
                        singleVideoLoop={playlists.videoUrls.length <= 1}
                    />
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
        <div className="h-screen w-screen bg-[#050505] text-white font-outfit flex flex-col overflow-hidden select-none">
            {/* Banda superior */}
            <div className="bg-black/60 backdrop-blur-xl border-b border-white/10 px-8 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">EN VIVO</span>
                    <Wifi className="w-3 h-3 text-green-400" />
                </div>
                <div className="bg-padel-primary text-black px-5 py-1 rounded-full font-black italic uppercase text-xs">
                    PISTA {courtId}
                </div>
                {marcador?.golden_point && (
                    <div className="flex items-center gap-2 text-yellow-400">
                        <Zap className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Punto de Oro</span>
                    </div>
                )}
            </div>

            {/* Marcador principal */}
            <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
                {/* Equipos y puntos */}
                <div className="w-full max-w-4xl">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-6">
                        {/* Equipo 1 */}
                        <TeamPanel
                            nombre={marcador?.equipo_1?.nombre || 'Equipo 1'}
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
                            nombre={marcador?.equipo_2?.nombre || 'Equipo 2'}
                            color={marcador?.equipo_2?.color || '#FF5500'}
                            sets={marcador?.sets?.visitante ?? 0}
                            games={marcador?.games?.visitante ?? 0}
                            puntos={marcador?.puntos?.visitante ?? '0'}
                            side="right"
                        />
                    </div>
                </div>

                {/* Sets por columnas: solo el 1.º en juego; al cerrarlo aparece el 2.º (y STB/TB si aplica) */}
                {marcador && (() => {
                    const setsL = Number(marcador.sets?.local ?? 0) || 0;
                    const setsV = Number(marcador.sets?.visitante ?? 0) || 0;
                    const currentSet = setsL + setsV + 1;
                    const fmt = String(marcador.match_format || '');
                    const twoPlusStb = fmt === 'TWO_SHORT_SETS' || fmt === 'TWO_NORMAL_SETS';
                    const visible = visibleSetNumbersForScoreboard({
                        matchFormat: fmt,
                        superTiebreak: marcador.super_tiebreak === true || marcador.modo_puntos === 'super_tiebreak',
                        tiebreak: marcador.modo_puntos === 'tiebreak',
                        setsT1: setsL,
                        setsT2: setsV,
                    });
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
                                    const is3rdSTB =
                                        s === 3 &&
                                        (marcador.super_tiebreak === true ||
                                            twoPlusStb ||
                                            fmt === 'SUPER_TIEBREAK' ||
                                            fmt === 'SET_3_STB');
                                    const label = is3rdSTB ? 'STB' : s === 3 && fmt === 'TIEBREAK' ? 'TB' : `SET ${s}`;
                                    const v1 = courtSetCell(s, 'local', marcador, currentSet);
                                    const v2 = courtSetCell(s, 'visitante', marcador, currentSet);
                                    return (
                                        <div key={s} className="flex flex-col gap-1 border-l border-white/10 first:border-l-0 pl-2">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">{label}</span>
                                            <span className="text-xl font-black tabular-nums" style={{ color: marcador?.equipo_1?.color || '#CCFF00' }}>{v1}</span>
                                            <span className="text-xl font-black tabular-nums" style={{ color: marcador?.equipo_2?.color || '#FF5500' }}>{v2}</span>
                                        </div>
                                    );
                                })}
                                <div className="flex flex-col gap-1 border-l border-padel-primary/40 pl-2 justify-center">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-padel-primary">PTS</span>
                                    <span className="text-2xl font-black tabular-nums text-padel-primary">{ptsL}</span>
                                    <span className="text-2xl font-black tabular-nums text-orange-400">{ptsV}</span>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>

            <TickerMarquee messages={playlists.tickerMessages} />

            <div className="relative border-t border-white/10 flex-shrink-0 overflow-hidden">
                <DualPlaylistStrip
                    canchaId={canchaId}
                    currentVideoUrl={playlists.currentVideoUrl}
                    currentImageUrl={playlists.currentImageUrl}
                    videoKey={playlists.videoKey}
                    imageKey={playlists.imageKey}
                    onVideoEnded={playlists.onVideoEnded}
                    singleVideoLoop={playlists.videoUrls.length <= 1}
                />
            </div>

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
                className="font-black italic uppercase tracking-tighter text-2xl md:text-3xl truncate max-w-full"
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
                <div className="text-center">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-600">Sets</p>
                    <p className="font-black text-3xl" style={{ color }}>{sets}</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-600">Games</p>
                    <p className="font-black text-3xl text-white">{games}</p>
                </div>
            </div>
        </div>
    );
}
