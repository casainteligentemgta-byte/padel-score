'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { dataService } from '@/lib/dataService';
import { useCourtPlaylists } from '@/lib/useCourtPlaylists';
import { MonitorOff, Megaphone } from 'lucide-react';
import { useRouteSegment } from '@/lib/useRouteSegment';
import { useThreeFingerDragExit } from '@/lib/useThreeFingerDragExit';
import { useCourtDisplayHeartbeat } from '@/lib/courtDisplayHeartbeat';
import { PizarraWarmupOverlay, parseCalentamientoEndsAt } from '@/components/PizarraWarmupOverlay';
import {
    buildCourtHeadline,
    splitPizarraCategoryMeta,
} from '@/lib/pizarraHeaderLabels';
import {
    DualPlaylistStrip,
    PistaTopBar,
    PizarraCenterChrono,
    PizarraDisplayGlobalStyles,
    PizarraScoreboardFit,
    PizarraTableScoreboard,
    TickerMarquee,
} from '@/components/pizarra/PizarraDisplayParts';

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
    const asistenciaMedicaActiva = Boolean(marcador?.asistencia_medica_active);
    const mesaTecnicaActiva = Boolean(marcador?.mesa_tecnica_active);
    const overlayCriticoActivo = asistenciaMedicaActiva || mesaTecnicaActiva;
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
                                asistenciaMedicaActiva={asistenciaMedicaActiva}
                                mesaTecnicaActiva={mesaTecnicaActiva}
                            />
                            <TickerMarquee messages={playlists.tickerMessages} />
                        </>
                    )}
                    <div className="h-8 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                </div>

                <div className="absolute bottom-12 text-center opacity-20">
                    <p className="font-black italic uppercase tracking-[0.5em] text-xs">Smart Padel Pro System</p>
                </div>

                <PizarraDisplayGlobalStyles />
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

            {overlayCriticoActivo && (
                <div className="pointer-events-none absolute inset-0 z-[120] flex items-center justify-center bg-black/82 px-6">
                    <div
                        className={`w-full max-w-5xl rounded-[2.2rem] border-2 px-6 py-10 text-center shadow-[0_0_60px_rgba(0,0,0,0.55)] ${
                            asistenciaMedicaActiva
                                ? 'border-red-400/70 bg-red-500/20'
                                : 'border-padel-primary/60 bg-padel-primary/15'
                        }`}
                    >
                        <p className="text-[12px] font-black uppercase tracking-[0.45em] text-white/75">Alerta de cancha</p>
                        <h2
                            className={`mt-4 text-[clamp(1.8rem,6.5vw,5rem)] font-black italic uppercase leading-[0.95] tracking-tight ${
                                asistenciaMedicaActiva ? 'text-red-200' : 'text-padel-primary'
                            }`}
                        >
                            {asistenciaMedicaActiva ? 'Asistencia Medica' : 'Mesa Tecnica'}
                        </h2>
                        <p className="mt-4 text-[clamp(0.85rem,2.1vw,1.4rem)] font-black uppercase tracking-[0.16em] text-white">
                            {asistenciaMedicaActiva
                                ? 'Personal medico requerido en esta pista'
                                : 'Revision tecnica solicitada por el arbitro'}
                        </p>
                    </div>
                </div>
            )}

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
                            asistenciaMedicaActiva={asistenciaMedicaActiva}
                            mesaTecnicaActiva={mesaTecnicaActiva}
                        />
                    </div>
                    <TickerMarquee messages={playlists.tickerMessages} />
                </>
            )}

            <PizarraDisplayGlobalStyles />
        </div>
    );
}
