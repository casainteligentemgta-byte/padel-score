'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import lottie from 'lottie-web';
import { dataService } from '@/lib/dataService';
import { createClient } from '@/lib/supabase/client';
import { MatchStatus } from '@/types/tournament';
import { useAdBanner } from '@/lib/useAdBanner';
import { rtdb } from '@/lib/rtdb';
import { ref, onValue, off } from 'firebase/database';
import { Trophy, Star, Megaphone, Thermometer, Clock, Video, ExternalLink, Layers, ImageIcon, Play, Eye, Users } from 'lucide-react';
import { BouncingBall } from '@/components/BouncingBall';
import { useThreeFingerDragExit } from '@/lib/useThreeFingerDragExit';
import { visibleSetNumbersForScoreboard, scoreboardGridClassForSetCount } from '@/lib/displaySetColumns';
import { resolveMatchTeamLines } from '@/lib/resolveMatchTeamLines';

// Lottie player para animaciones JSON (biblioteca de animaciones)
function LottieAnimationOverlay({ url }: { url: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!containerRef.current || !url) return;
        const anim = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: url,
        });
        return () => anim.destroy();
    }, [url]);
    return <div ref={containerRef} className="w-full h-full min-h-[200px] max-w-[90vw] max-h-[90vh]" />;
}

// Utility to detect if a media object or URL is a video
const isVideoMedia = (media: any) => {
    if (!media) return false;
    // Handle string URL input
    if (typeof media === 'string') {
        return /\.(mp4|webm|mov|m4v|ogg|flv|3gp)(\?.*)?$/i.test(media.toLowerCase());
    }
    // Handle media object input
    if (!media.url) return false;
    const tipo = (media.tipo || '').toLowerCase();
    if (tipo.includes('video')) return true;
    const url = (media.url || '').toLowerCase();
    return /\.(mp4|webm|mov|m4v|ogg|flv|3gp)(\?.*)?$/i.test(url);
};

// Simulated names for professional look
const PRO_NAMES_MALE = [
    "Alejandro Galán", "Juan Lebrón", "Agustín Tapia", "Arturo Coello",
    "Franco Stupaczuk", "Martín Di Nenno", "Fede Chingotto", "Paquito Navarro",
    "Fernando Belasteguín", "Sanyo Gutiérrez", "Momo González", "Alex Ruiz",
    "Javi Garrido", "Mike Yanguas", "Coki Nieto", "Jon Sanz"
];

const PRO_NAMES_FEMALE = [
    "Ariana Sánchez", "Paula Josemaría", "Gemma Triay", "Marta Ortega",
    "Delfi Brea", "Bea González", "Claudia Jensen", "Jessica Castelló",
    "Aranza Osoro", "Lucía Sainz", "Patty Llaguno", "Victoria Iglesias"
];

// ── Reloj: actualización cada segundo solo en estos componentes (evita re-render de toda la pizarra) ──
function DisplayClockTime({ className, style }: { className?: string, style?: any }) {
    const [time, setTime] = useState('');
    useEffect(() => {
        const update = () => setTime(new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }));
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, []);
    return <span className={className} style={style}>{time}</span>;
}
// ── Reloj: actualización cada segundo solo en estos componentes (evita re-render de toda la pizarra) ──
function DisplayClockDate({ className, style }: { className?: string, style?: any }) {
    const [date, setDate] = useState('');
    useEffect(() => {
        const update = () => setDate(new Date().toLocaleDateString('es-VE', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase());
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, []);
    return <span className={className} style={style}>{date}</span>;
}

// ── Cronómetro de partido: misma lógica que el marcador del marker (score/[matchId]) ──
function MatchDurationCounter({
    matchStatus,
    startTimeMs,
    endTimeMs,
    cronData,
    primaryColor,
    cronometroTipo,
    showInPill,
}: {
    /** Estado del partido en BD (mismo que usa el marker) */
    matchStatus?: string;
    startTimeMs?: number | null;
    endTimeMs?: number | null;
    /** Estado del cronómetro en RTDB (pizarra_cancha_state.cronometro) escrito por el marker */
    cronData?: { elapsedSec?: number; running?: boolean; startedAt?: number | null };
    primaryColor: string;
    cronometroTipo: string;
    showInPill?: boolean;
}) {
    const [duration, setDuration] = useState('00:00');
    
    useEffect(() => {
        const update = () => {
            let totalSec = 0;
            const now = Date.now();
            const st = startTimeMs;
            const en = endTimeMs;
            const status = (matchStatus || '').toString();

            const isFinished = status === MatchStatus.FINISHED || status === 'FINISHED';
            const isLiveLike =
                status === MatchStatus.LIVE ||
                status === MatchStatus.PAUSED ||
                status === 'live' ||
                status === 'PAUSED' ||
                status === 'EN_CURSO';

            // 1) Si el marker está enviando cronData (RTDB), usamos exactamente ese reloj
            if (cronData && (typeof cronData.elapsedSec === 'number' || typeof cronData.running === 'boolean')) {
                const base = Number(cronData.elapsedSec ?? 0) || 0;
                if (cronData.running && cronData.startedAt != null) {
                    const stCron = Number(cronData.startedAt);
                    const diff = !Number.isNaN(stCron) ? Math.floor((now - stCron) / 1000) : 0;
                    totalSec = base + Math.max(0, diff);
                } else {
                    totalSec = base;
                }
            } else {
                // 2) Respaldo: misma lógica que el marcador basada en startedAt / finishedAt
                if (isFinished && st != null && en != null) {
                    totalSec = Math.max(0, Math.floor((en - st) / 1000));
                } else if (isLiveLike && st != null) {
                    totalSec = Math.max(0, Math.floor((now - st) / 1000));
                } else {
                    totalSec = 0;
                }
            }

            const h = Math.floor(totalSec / 3600);
            const m = Math.floor((totalSec % 3600) / 60);
            const s = totalSec % 60;
            
            if (h > 0) {
                setDuration(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
            } else {
                setDuration(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
            }
        };

        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [matchStatus, startTimeMs, endTimeMs, cronData?.elapsedSec, cronData?.running, cronData?.startedAt]);
    if (!duration) return null;
    if (showInPill)
        return (
            <span
                className={cronometroTipo === 'minimal' ? 'text-white/90 text-[0.6em]' : cronometroTipo === 'broadcast' ? 'text-padel-primary drop-shadow-[0_0_8px_rgba(204,255,0,0.4)]' : cronometroTipo === 'digital' ? 'text-cyan-400 font-mono tabular-nums' : 'text-padel-primary'}
                style={{ fontSize: 'clamp(6px,0.65vw,10px)' }}
            >
                {duration}
            </span>
        );
    // En pizarras (modo fullscreen), el "Tiempo de juego" no se muestra.
    return null;
}

export default function FullScreenDisplay() {
    const routeParams = useParams<{ id: string; matchId: string }>();
    const id = String(routeParams?.id ?? '');
    const matchId = String(routeParams?.matchId ?? '');
    /** Tres dedos + arrastre vertical: salir al torneo (móvil / iPad, sin botón visible). */
    useThreeFingerDragExit(id ? `/tournaments/${id}` : null);
    const [tournament, setTournament] = useState<any>(null);
    const [match, setMatch] = useState<any>(null);
    const [matchNumberInTournament, setMatchNumberInTournament] = useState<number | null>(null);
    const [nextMatch, setNextMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<'score' | 'ad'>('score');
    const [currentAdIdx, setCurrentAdIdx] = useState(0);
    const [recentResults, setRecentResults] = useState<any[]>([]);
    const [temp, setTemp] = useState<number | null>(null);
    const prevScore = useRef<string>('');
    const adBanner = useAdBanner();
    const [carouselImages, setCarouselImages] = useState<{ url: string; orden: number }[]>([]);
    const [carouselIdx, setCarouselIdx] = useState(0);
    const [carouselInterval, setCarouselInterval] = useState(8);

    const processDisplayName = (name: any) => {
        if (!name || typeof name !== 'string') return null;
        const trimmed = name.trim();
        const lower = trimmed.toLowerCase();
        const isGenericEquipo = /^equipo\s*[12]?\s*$/i.test(trimmed) || /^equipo\s*\d+\s*$/i.test(trimmed);
        if (
            trimmed === '' ||
            trimmed === '?' ||
            trimmed === 'TBD' ||
            trimmed === 'UNDEFINED' ||
            trimmed === 'undefined' ||
            /^pareja\s*\d*$/i.test(trimmed) ||
            isGenericEquipo ||
            lower === 'player' ||
            lower === 'placeholder' ||
            (lower.startsWith('jugador') && /^jugador\s*\d+\s*$/i.test(trimmed))
        ) return null;

        const parts = trimmed.split(/\s+/).filter(Boolean);
        if (parts.length <= 1) return trimmed;

        const firstName = parts[0];
        // Si viene "NOMBRE APELLIDO" (2 partes), mostramos solo primer nombre + primer apellido
        if (parts.length === 2) {
            return `${firstName} ${parts[1]}`;
        }

        // Caso típico: "NOMBRE SEGUNDONOMBRE APELLIDO ..."
        const secondNameInitial = parts[1]?.[0] ? `${parts[1][0]}.` : '';
        const firstLastName = parts[2] ?? '';
        const formatted = [firstName, secondNameInitial, firstLastName].filter(Boolean).join(' ');
        return formatted || trimmed;
    };

    // ── Marcador en vivo del RTDB (escrito por el marker en tiempo real) ─────
    const [liveMarcador, setLiveMarcador] = useState<any>(null);
    const [courtTransferBanner, setCourtTransferBanner] = useState<{ title: string; subtitle: string } | null>(null);
    const courtTransferShownTsRef = useRef(0);
    const pizarraRefreshNonceBaselineRef = useRef<number | null>(null);
    const pizarraRefreshCanchaKeyRef = useRef<string>('');
    const [sponsorIdx, setSponsorIdx] = useState(0);
    const [sponsorCarousel, setSponsorCarousel] = useState<any[]>([]);
    const [sponsorCarouselIdx, setSponsorCarouselIdx] = useState(0);
    const [hubMedia, setHubMedia] = useState<any>(null);
    const [hubCarousel, setHubCarousel] = useState<any>(null);
    const [hubLibraryVids, setHubLibraryVids] = useState<any[]>([]);
    const [hubLibraryImgs, setHubLibraryImgs] = useState<any[]>([]);
    const [hubLibraryVidIdx, setHubLibraryVidIdx] = useState(0);
    const [hubLibraryImgIdx, setHubLibraryImgIdx] = useState(0);

    // Sync system clock offsets with Supabase server time
    useEffect(() => {
        dataService.syncSystemClock();
    }, []);

    // ── Carrusel de Patrocinadores desde Supabase ───────────────────────
    useEffect(() => {
        if (!tournament?.id) return;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (!isUUID) return;

        const loadSponsors = async () => {
            try {
                const data = await dataService.getSponsorsByTournament(id);
                setSponsorCarousel(data || []);
            } catch (err) {
                // Silently fail if table or sponsors not found
            }
        };
        loadSponsors();
        const interval = setInterval(loadSponsors, 30000);
        return () => clearInterval(interval);
    }, [tournament?.id, id]);

    useEffect(() => {
        if (sponsorCarousel.length <= 1) return;
        const currentDuration = (sponsorCarousel[sponsorCarouselIdx]?.duration_seconds || 8) * 1000;
        const timeout = setTimeout(() => {
            setSponsorCarouselIdx(prev => (prev + 1) % sponsorCarousel.length);
        }, currentDuration);
        return () => clearTimeout(timeout);
    }, [sponsorCarousel, sponsorCarouselIdx]);

    // Ticker desde RTDB
    const [tickerTexto, setTickerTexto] = useState('');
    const [tickerActivo, setTickerActivo] = useState(false);
    const [tickerVelocidad, setTickerVelocidad] = useState(30);

    // Ticker desde Supabase (Tira Informativa TV)
    const [supabaseTickerMessages, setSupabaseTickerMessages] = useState<any[]>([]);

    // Estilo del reloj y del cronómetro
    const [relojOcasion, setRelojOcasion] = useState<string>('default');
    const [cronometroTipo, setCronometroTipo] = useState<string>('default');
    const [animacionActual, setAnimacionActual] = useState<{ id: string; ts: number; url?: string } | null>(null);
    const [animacionesMarcador, setAnimacionesMarcador] = useState<Record<string, { nombre: string; url: string }>>({});

    useEffect(() => {
        dataService.getAnimations()
            .then((rows: any[]) => {
                const map: Record<string, { nombre: string; url: string }> = {};
                (rows || []).forEach((r: any) => {
                    map[r.id || r.name] = { nombre: r.name || r.nombre || '', url: r.url || '' };
                });
                setAnimacionesMarcador(map);
            })
            .catch(() => setAnimacionesMarcador({}));
    }, []);

    // ── Marcador en vivo desde Supabase (pizarra_cancha_state) ───────────────
    useEffect(() => {
        if (!match) return;
        const courtNum = Number(match.court ?? (match.courtIndex != null ? (match.courtIndex as number) + 1 : 0));
        if (!courtNum) return;

        const canchaId = `cancha_${courtNum}`;
        if (pizarraRefreshCanchaKeyRef.current !== canchaId) {
            pizarraRefreshCanchaKeyRef.current = canchaId;
            pizarraRefreshNonceBaselineRef.current = null;
        }

        /** El marker incrementa `pizarra_refresh_nonce`; al subir el número recargamos la ventana. */
        const applyPizarraRefreshNonce = (data: Record<string, unknown> | null | undefined) => {
            const raw = data?.pizarra_refresh_nonce;
            const n =
                typeof raw === 'number' && Number.isFinite(raw) ? raw : 0;
            if (pizarraRefreshNonceBaselineRef.current === null) {
                pizarraRefreshNonceBaselineRef.current = n;
                return;
            }
            if (n > pizarraRefreshNonceBaselineRef.current) {
                pizarraRefreshNonceBaselineRef.current = n;
                window.location.reload();
            }
        };

        const unsub = dataService.subscribePizarraCanchaState(canchaId, (state) => {
            const data = state?.data;
            applyPizarraRefreshNonce(data);
            const marcador = data?.marcador ?? null;
            setLiveMarcador(marcador);
        });

        // Polling de respaldo en caso de que Supabase Realtime no esté habilitado en el Dashboard
        const pollingInterval = setInterval(() => {
            dataService.getPizarraCanchaState(canchaId).then((state) => {
                const data = state?.data;
                applyPizarraRefreshNonce(data);
                const marcador = data?.marcador ?? null;
                setLiveMarcador((prev: any) => {
                    if (marcador?.ultimo_update !== prev?.ultimo_update || JSON.stringify(marcador) !== JSON.stringify(prev)) {
                        return marcador;
                    }
                    return prev;
                });
            }).catch(() => {});
        }, 2000);

        return () => { 
            unsub(); 
            clearInterval(pollingInterval);
        };
    }, [match?.court, match?.courtIndex]);

    useEffect(() => {
        if (!courtTransferBanner) return;
        const t = setTimeout(() => setCourtTransferBanner(null), 7500);
        return () => clearTimeout(t);
    }, [courtTransferBanner]);

    // 5. Obtener TODA la biblioteca de imágenes activa para el carrusel automático
    const fetchAllImages = async (sb: any) => {
        const { data } = await sb.from('media_content').select('*').order('created_at', { ascending: false });
        
        if (data) {
            const filtered = data.filter((item: any) => item.activa !== false);
            // Split into vids and imgs
            const vids = filtered.filter((i: any) => isVideoMedia(i));
            const imgs = filtered.filter((i: any) => !isVideoMedia(i));
            setHubLibraryVids(vids);
            setHubLibraryImgs(imgs);
        }
    };

    // ── Publicidad Hub: Sincronización con Supabase (Monitor Hub) ───────
    useEffect(() => {
        let supabase: any;
        try {
            supabase = createClient();
        } catch (e) {
            console.error("Supabase client creation failed:", e);
            return;
        }

        const fetchHubMedia = async () => {
            try {
                // Fetch library images always
                if (supabase) fetchAllImages(supabase);

                // 1. Verificar modo master
                const { data: modeData } = await supabase
                    .from('display_estado')
                    .select('media_content_id')
                    .eq('pantalla_id', 'SYSTEM_MASTER_MODE')
                    .maybeSingle();

                const isMaster = modeData?.media_content_id === 'true';

                let videoKey = '';
                let carouselKey = '';
                let screenFound = false;
                let activeScreenId = null;

                if (isMaster) {
                    videoKey = 'SYSTEM_MASTER_MEDIA_video';
                    carouselKey = 'SYSTEM_MASTER_CAROUSEL_carousel';
                    screenFound = true;
                } else if (match?.court) {
                    // Buscar pantalla que coincida con la pista (buscamos cualquier nombre que contenga el número de pista)
                    const { data: screens } = await supabase
                        .from('pantallas')
                        .select('id, nombre')
                        .or(`nombre.ilike.%Pista ${match.court}%,nombre.ilike.%Cancha ${match.court}%,nombre.ilike.%${match.court}%`);

                    if (screens && screens.length > 0) {
                        const screenId = screens[0].id;
                        activeScreenId = screenId;
                        videoKey = `${screenId}_video`;
                        carouselKey = `${screenId}_carousel`;
                        screenFound = true;
                    }
                }

                if (!screenFound) {
                    // If no specific screen is found, reset hub selections but keep hubLibraryImages
                    setHubMedia(null);
                    setHubCarousel(null);
                    // Fetch global ticker even if no screen is bound to the court
                    try {
                        const tickerData = await dataService.getTiraInformativa();
                        setSupabaseTickerMessages(Array.isArray(tickerData) ? tickerData : []);
                    } catch (_) {
                        setSupabaseTickerMessages([]);
                    }
                    return;
                }

                // 2. Obtener lo que debe proyectar esta pantalla para ambos slots
                // Buscamos: UUID_video, UUID_carousel AND the bare UUID as a fallback
                const { data: statusData } = await supabase
                    .from('display_estado')
                    .select('pantalla_id, media_content_id')
                    .in('pantalla_id', [videoKey, carouselKey, activeScreenId].filter(Boolean));

                if (!statusData || statusData.length === 0) {
                    setHubMedia(null);
                    setHubCarousel(null);
                    // Try to fetch ticker anyway
                    try {
                        const tickerData = await dataService.getTiraInformativa(activeScreenId);
                        setSupabaseTickerMessages(Array.isArray(tickerData) ? tickerData : []);
                    } catch (_) {
                        setSupabaseTickerMessages([]);
                    }
                    return;
                }

                // 3. Resolver el contenido según los keys
                let vidId = statusData.find((s: any) => s.pantalla_id === videoKey)?.media_content_id;
                let carId = statusData.find((s: any) => s.pantalla_id === carouselKey)?.media_content_id;

                // Fallback: If no suffix-specific record exists but a bare UUID record does, use it for video slot
                if (!vidId && !carId) {
                    const legacyRecord = statusData.find((s: any) => s.pantalla_id === activeScreenId);
                    if (legacyRecord) {
                        vidId = legacyRecord.media_content_id;
                    }
                }

                // 4. Obtener contenidos
                let fetchedVid: any | null = null;
                let fetchedCar: any | null = null;

                if (vidId) {
                    const { data: v } = await supabase.from('media_content').select('*').eq('id', vidId).maybeSingle();
                    fetchedVid = v;
                }
                if (carId) {
                    const { data: c } = await supabase.from('media_content').select('*').eq('id', carId).maybeSingle();
                    fetchedCar = c;
                }

                // Logic: Videos Left, Images Right
                // If we have an image in vid slot and a video in car slot, swap them.
                if (fetchedVid && !isVideoMedia(fetchedVid) && fetchedCar && isVideoMedia(fetchedCar)) {
                    setHubMedia(fetchedCar);
                    setHubCarousel(fetchedVid);
                } else if (fetchedVid && !isVideoMedia(fetchedVid) && !fetchedCar) {
                    // If only an image is assigned to the video slot, move it to carousel
                    setHubMedia(null);
                    setHubCarousel(fetchedVid);
                } else if (fetchedCar && isVideoMedia(fetchedCar) && !fetchedVid) {
                    // If only a video is assigned to the carousel slot, move it to video slot
                    setHubMedia(fetchedCar);
                    setHubCarousel(null);
                } else {
                    // Regular assignment
                    setHubMedia(fetchedVid);
                    setHubCarousel(fetchedCar);
                }

                // 5. Obtener Tira Informativa de Supabase - Pasar pantallaId
                try {
                    const tickerData = await dataService.getTiraInformativa(activeScreenId);
                    setSupabaseTickerMessages(Array.isArray(tickerData) ? tickerData : []);
                } catch (_) {
                    setSupabaseTickerMessages([]);
                }

            } catch (err) {
                console.error('Error fetching hub media:', err);
            }
        };

        fetchHubMedia();

        const channel = supabase
            .channel('publicidad_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'display_estado' }, fetchHubMedia)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'media_content' }, fetchHubMedia)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tira_informativa' }, fetchHubMedia)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [match?.court]); // Depend on match.court to re-run when court changes

    // Rotación del carrusel automático de la biblioteca (VIDEOS - Izquierda)
    useEffect(() => {
        if (hubLibraryVids.length <= 1) return;
        const currentItem = hubLibraryVids[hubLibraryVidIdx % hubLibraryVids.length];
        const duration = (currentItem?.duracion_segundos || 8) * 1000;

        const timeout = setTimeout(() => {
            setHubLibraryVidIdx(prev => (prev + 1) % hubLibraryVids.length);
        }, duration);

        return () => clearTimeout(timeout);
    }, [hubLibraryVids, hubLibraryVidIdx]);

    // Rotación del carrusel automático de la biblioteca (IMÁGENES - Derecha)
    useEffect(() => {
        if (hubLibraryImgs.length <= 1) return;
        const currentItem = hubLibraryImgs[hubLibraryImgIdx % hubLibraryImgs.length];
        const duration = (currentItem?.duracion_segundos || 10) * 1000;

        const timeout = setTimeout(() => {
            setHubLibraryImgIdx(prev => (prev + 1) % hubLibraryImgs.length);
        }, duration);

        return () => clearTimeout(timeout);
    }, [hubLibraryImgs, hubLibraryImgIdx]);

    // Settings
    const isFinal = match?.roundName?.toLowerCase().includes('final') || match?.roundName?.toLowerCase().includes('definición');
    const primaryColor = isFinal ? '#FFD700' : (tournament?.broadcastingSettings?.primaryColor || '#ccff00');
    const adMedia = tournament?.broadcastingSettings?.adMediaUrls || [];
    const adFreq = tournament?.broadcastingSettings?.adFrequencySeconds || 60;
    const adDur = tournament?.broadcastingSettings?.adDurationSeconds || 10;
    const funEnabled = tournament?.broadcastingSettings?.funAnimationsEnabled !== false;
    const showLive = tournament?.broadcastingSettings?.showLiveIndicator !== false;
    const venueName = tournament?.broadcastingSettings?.venueName || '';

    // ── Carrusel de imágenes (panel publicidad → imagenes) ─────────────────
    useEffect(() => {
        if (!rtdb) return;
        const adRef = ref(rtdb, 'publicidad_master');
        const handler = (snap: any) => {
            const val = snap.val();
            if (!val?.imagenes) { setCarouselImages([]); return; }
            const imgs = Object.values(val.imagenes as Record<string, any>)
                .filter((img: any) => img.activa && img.url)
                .sort((a: any, b: any) => a.orden - b.orden) as { url: string; orden: number }[];
            setCarouselImages(imgs);
            setCarouselIdx(0);
            setCarouselInterval(val.carrusel_intervalo_seg || 8);
        };
        onValue(adRef, handler);
        return () => off(adRef, 'value', handler);
    }, []);

    useEffect(() => {
        if (carouselImages.length <= 1) return;
        const id = setInterval(() => setCarouselIdx(prev => (prev + 1) % carouselImages.length), carouselInterval * 1000);
        return () => clearInterval(id);
    }, [carouselImages.length, carouselInterval]);

    // Sponsors Cycle
    useEffect(() => {
        const sponsors = tournament?.broadcastingSettings?.sponsors?.filter((s: any) => s.active) || [];
        if (sponsors.length <= 1) return;
        const id = setInterval(() => {
            setSponsorIdx(prev => (prev + 1) % sponsors.length);
        }, 8000);
        return () => clearInterval(id);
    }, [tournament?.broadcastingSettings?.sponsors]);

    const parseTimeFieldToMs = (raw: any): number | null => {
        if (raw == null) return null;
        if (typeof raw?.toDate === 'function') return raw.toDate().getTime();
        if (typeof raw?.seconds === 'number') return raw.seconds * 1000 + (raw.nanoseconds || 0) / 1e6;
        if (typeof raw === 'string' || typeof raw === 'number') return new Date(raw).getTime();
        const d = new Date(raw);
        return isNaN(d.getTime()) ? null : d.getTime();
    };

    /** Resolución de partidos por horario (puede usar fallbacks) */
    const getMatchStartTimeMs = (m: any): number | null => {
        const raw = m?.startedAt ?? m?.actualStartTime ?? m?.startTime ?? liveMarcador?.match_start_time;
        return parseTimeFieldToMs(raw);
    };

    /**
     * Cronómetro de la pizarra = mismo criterio que el marcador del marker (score/[matchId]):
     * solo startedAt / actualStartTime y finishedAt / actualEndTime.
     */
    const getMarkerDurationStartMs = (m: any): number | null =>
        parseTimeFieldToMs(m?.startedAt ?? m?.actualStartTime);

    const getMarkerDurationEndMs = (m: any): number | null =>
        parseTimeFieldToMs(m?.finishedAt ?? m?.actualEndTime);

    // Temperature (Open-Meteo) — Isla de Margarita

    // Temperature (Open-Meteo) — Isla de Margarita
    useEffect(() => {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=11.0&longitude=-63.9&current_weather=true')
            .then(r => r.json())
            .then(data => setTemp(Math.round(data.current_weather?.temperature ?? 0)))
            .catch(() => { });
    }, []);

    // Audio
    useEffect(() => {
        if (!match || !match.points) return;
        const currentScore = `${match.points.t1}-${match.points.t2}`;
        if (prevScore.current !== currentScore && prevScore.current !== '') {
            const utterance = new SpeechSynthesisUtterance(`${match.points.t1}, ${match.points.t2}`);
            utterance.lang = 'es-ES';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
        prevScore.current = currentScore;
    }, [match?.points?.t1, match?.points?.t2]);

    // Marcador en vivo y animación vienen de Supabase (pizarra_cancha_state) en el efecto anterior

    // Animación actual disparada por el marker (Supabase pizarra_cancha_state)
    useEffect(() => {
        if (!match?.court) return;
        const canchaId = `cancha_${match.court}`;
        const unsub = dataService.subscribePizarraCanchaState(canchaId, (state) => {
            const anim = state?.data?.animacion_actual ?? null;
            setAnimacionActual(anim);
        });
        return () => unsub();
    }, [match?.court]);

    // Auto-ocultar overlay de animación tras 5s
    useEffect(() => {
        if (!animacionActual?.id) return;
        const t = setTimeout(() => setAnimacionActual(null), 5000);
        return () => clearTimeout(t);
    }, [animacionActual?.id, animacionActual?.ts]);

    // Data Sync (Supabase & Firestore)
    useEffect(() => {
        if (!id) return;
        setLoading(true);

        let currentTournament: any = null;
        let currentMatches: any[] = [];

        const updateAll = (t: any, matchesList: any[]) => {
            if (!t) return;
            setTournament(t);
            const ms = matchesList || [];

            // Resolver partido
            let found = ms.find((m: any) => String(m.id) === String(matchId));

            if (!found && /^match_(\d+)$/.test(matchId)) {
                const idx = parseInt(matchId.replace('match_', ''), 10);
                if (idx >= 0 && idx < ms.length) found = ms[idx];
            }
            if (!found && /^m_(\d+)$/.test(matchId)) {
                const ts = parseInt(matchId.replace('m_', ''), 10);
                found = ms.find((m: any) => {
                    const mTs = getMatchStartTimeMs(m);
                    return mTs && Math.abs(mTs - ts) < 2000;
                });
            }
            if (!found && matchId.startsWith('court_')) {
                const courtNum = parseInt(matchId.replace('court_', ''), 10);
                if (!isNaN(courtNum))
                    found = ms.find((m: any) => (m.court ?? (m.courtIndex != null ? m.courtIndex + 1 : null)) === courtNum) ?? ms.find((m: any) => m.courtIndex === courtNum - 1);
            }

            // Fallback final: Si el partido no existe en la base de datos, creamos uno simulado para demostración
            if (!found) {
                const isCourt = matchId.startsWith('court_');
                const parsedCourt = isCourt ? parseInt(matchId.replace('court_', ''), 10) : 1;
                const courtNum = isNaN(parsedCourt) ? 1 : parsedCourt;

                found = {
                    id: matchId,
                    team1Index: 1,
                    team2Index: 2,
                    status: 'live',
                    court: courtNum,
                    courtName: isCourt ? `Pista ${courtNum}` : 'Cancha Central',
                    scheduledTime: new Date().toISOString(),
                    setScores: [{ t1: 6, t2: 3 }]
                };
            }

            if (found) {
                const idxInTournament = ms.findIndex((m: any) => String(m?.id) === String(found?.id));
                setMatchNumberInTournament(idxInTournament >= 0 ? idxInTournament + 1 : null);
                const getSimulatedName = (gender: string | undefined, index: number) => {
                    const list = gender === 'female' ? PRO_NAMES_FEMALE : PRO_NAMES_MALE;
                    return list[index % list.length];
                };

                const fullName = (p: any) => {
                    if (!p) return '';
                    const n = [p.name, p.lastName].filter(Boolean).join(' ').trim();
                    return n || (typeof p.name === 'string' ? p.name : '') || '';
                };

                const isRealName = (s?: string) => {
                    const v = (s || '').trim().toLowerCase();
                    if (!v) return false;
                    if (v === '?' || v === 'tbd' || v === 'undefined') return false;
                    if (/^pareja\s*\d*$/.test(v)) return false;
                    if (/^equipo\s*\d*$/.test(v)) return false;
                    return true;
                };

                const resolveTeam = (mTeam: any, teamIdx: number, matchRecord?: any) => {
                    const gender = t?.gender; // FIX: Use local 't' object instead of stale state
                    const teams = t?.teams || []; // FIX: Use local 't' object
                    const teamByIndex = teamIdx > 0 ? teams[teamIdx - 1] : null;
                    const seed = teamIdx || 1;

                    // 1) Prioridad Máxima: tournament.teams (la fuente de verdad de las inscripciones)
                    const p1FromTeam = fullName(teamByIndex?.p1);
                    const p2FromTeam = fullName(teamByIndex?.p2);
                    const hasRealTournamentName = teamByIndex
                        && (isRealName(p1FromTeam) || isRealName(p2FromTeam));

                    if (hasRealTournamentName) {
                        const p1Final = isRealName(p1FromTeam) ? p1FromTeam : getSimulatedName(gender, seed * 2);
                        const p2Final = isRealName(p2FromTeam) ? p2FromTeam : getSimulatedName(gender, seed * 2 + 1);
                        return {
                            p1Name: p1Final,
                            p2Name: p2Final,
                            p1Photo: teamByIndex.p1?.photo || null,
                            p2Photo: teamByIndex.p2?.photo || null,
                            name: [p1Final, p2Final].filter(Boolean).join(' / ')
                        };
                    }

                    // 2) Segunda Prioridad: equipo embebido en el partido (linea full)
                    if (
                        mTeam &&
                        !mTeam.isTBD &&
                        typeof mTeam.full === 'string' &&
                        isRealName(mTeam.full)
                    ) {
                        const fullLine = mTeam.full.trim();
                        const parts = fullLine.split(/\s*\/\s*/).map((s: string) => s.trim()).filter(Boolean);
                        if (parts.length >= 2) {
                            return {
                                p1Name: parts[0],
                                p2Name: parts[1],
                                p1Photo: mTeam.p1?.photo || null,
                                p2Photo: mTeam.p2?.photo || null,
                                name: fullLine,
                            };
                        }
                        if (parts.length === 1) {
                            return {
                                p1Name: parts[0],
                                p2Name: '',
                                p1Photo: mTeam.p1?.photo || null,
                                p2Photo: mTeam.p2?.photo || null,
                                name: parts[0],
                            };
                        }
                    }

                    // 3) datos p1/p2 embebidos en el partido
                    if (mTeam && (mTeam.p1 || mTeam.p1Name || mTeam.isTBD || mTeam.teamLabel)) {
                        const p1Base = mTeam.isTBD ? (mTeam.teamLabel || 'TBD') : (mTeam.p1Name || fullName(mTeam.p1));
                        const p2Base = mTeam.isTBD ? '' : (mTeam.p2Name || fullName(mTeam.p2));
                        
                        if (isRealName(p1Base) || isRealName(p2Base)) {
                            const p1Final = isRealName(p1Base) ? p1Base : getSimulatedName(gender, seed * 2);
                            const p2Final = mTeam.isTBD ? '' : (isRealName(p2Base) ? p2Base : getSimulatedName(gender, seed * 2 + 1));
                            return {
                                p1Name: p1Final,
                                p2Name: p2Final,
                                p1Photo: mTeam.p1?.photo || null,
                                p2Photo: mTeam.p2?.photo || null,
                                name: mTeam.isTBD ? p1Final : [p1Final, p2Final].filter(Boolean).join(' / ')
                            };
                        }
                    }

                    // 4) team1Name / team2Name guardados en el partido (string "A / B")
                    const storedName = mTeam?.teamLabel || mTeam?.name
                        || (matchRecord && teamIdx === 1 ? (matchRecord as any).team1Name : matchRecord && teamIdx === 2 ? (matchRecord as any).team2Name : null);
                    if (isRealName(storedName)) {
                        const parts = (storedName as string).split(/\s*\/\s*/).map((s: string) => s.trim()).filter(Boolean);
                        if (parts.length >= 2) {
                            return { p1Name: parts[0], p2Name: parts[1], p1Photo: null, p2Photo: null, name: (storedName as string).trim() };
                        }
                        if (parts.length === 1) {
                            return { p1Name: parts[0], p2Name: '', p1Photo: null, p2Photo: null, name: parts[0] };
                        }
                    }

                    // 5) Fallback final — nombres simulados
                    const p1Sim = getSimulatedName(gender, seed * 2);
                    const p2Sim = getSimulatedName(gender, seed * 2 + 1);
                    return { p1Name: p1Sim, p2Name: p2Sim, p1Photo: null, p2Photo: null, name: `${p1Sim} / ${p2Sim}` };
                };

                const t1 = resolveTeam(found.team1, found.team1Index ?? 1, found);
                const t2 = resolveTeam(found.team2, found.team2Index ?? 2, found);
                const lines = resolveMatchTeamLines(found, currentTournament);
                const splitLine = (line: string) => {
                    const parts = (line || '').split(/\s*\/\s*/).map((s) => s.trim()).filter(Boolean);
                    return { p1: parts[0] || '', p2: parts[1] || '' };
                };
                const l1 = splitLine(lines.team1);
                const l2 = splitLine(lines.team2);

                const matchData = {
                    ...found,
                    court: found.court || (found.courtIndex !== undefined ? found.courtIndex + 1 : undefined),
                    t1p1: isRealName(t1.p1Name) ? t1.p1Name : (l1.p1 || 'Equipo 1'),
                    t1p2: isRealName(t1.p2Name) ? t1.p2Name : l1.p2,
                    t2p1: isRealName(t2.p1Name) ? t2.p1Name : (l2.p1 || 'Equipo 2'),
                    t2p2: isRealName(t2.p2Name) ? t2.p2Name : l2.p2,
                    t1p1Photo: t1.p1Photo,
                    t1p2Photo: t1.p2Photo,
                    t2p1Photo: t2.p1Photo,
                    t2p2Photo: t2.p2Photo,
                    t1Name: isRealName(t1.name) ? t1.name : lines.team1,
                    t2Name: isRealName(t2.name) ? t2.name : lines.team2,
                };
                setMatch(matchData);

                // Extract latest finished matches for ticker
                const finished = ms
                    .filter((mx: any) => mx.status === MatchStatus.FINISHED)
                    .sort((a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
                    .slice(0, 3)
                    .map((mx: any) => {
                        const rt1 = resolveTeam(mx.team1, mx.team1Index, mx);
                        const rt2 = resolveTeam(mx.team2, mx.team2Index, mx);
                        return {
                            ...mx,
                            t1Name: rt1.name,
                            t2Name: rt2.name,
                        };
                    });
                setRecentResults(finished);

                const next = ms
                    .filter((m: any) => m.court === found.court && m.status === MatchStatus.PENDING)
                    .sort((a: any, b: any) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())[0];

                if (next) {
                    const rnt1 = resolveTeam(next.team1, next.team1Index, next);
                    const rnt2 = resolveTeam(next.team2, next.team2Index, next);
                    setNextMatch({
                        ...next,
                        t1Name: rnt1.name,
                        t2Name: rnt2.name,
                    });
                } else {
                    setNextMatch(null); // Clear next match if none found
                }
                setLoading(false);
            } else {
                setMatch(null); // No match found for the given matchId
                setLoading(false);
            }
        };

        // Initial Fetch
        const initialFetch = async () => {
            try {
                const [t, ms] = await Promise.all([
                    dataService.getTournament(id),
                    dataService.getMatches(id)
                ]);
                if (t) currentTournament = t;
                if (ms) currentMatches = ms;
                if (currentTournament) updateAll(currentTournament, currentMatches);
            } catch (error) {
                console.error("Error in initial fetch:", error);
            } finally {
                setLoading(false);
            }
        };
        initialFetch();

        // 1. Supabase Subscriptions
        const unsubT = dataService.subscribeToTournament(id, (t) => {
            if (!t) return;
            currentTournament = t;
            updateAll(currentTournament, currentMatches);
        });

        const unsubM = dataService.subscribeToMatches(id, (ms) => {
            if (!ms || ms.length === 0) return;
            currentMatches = ms;
            if (currentTournament) updateAll(currentTournament, currentMatches);
        });

        // Polling de respaldo: refrescar cada 3s por si Realtime no dispara
        const pollInterval = setInterval(async () => {
            const ms = await dataService.getMatches(id);
            if (ms?.length && currentTournament) {
                currentMatches = ms;
                updateAll(currentTournament, currentMatches);
            }
        }, 3000);

        return () => {
            unsubT();
            unsubM();
            clearInterval(pollInterval);
        };
    }, [id, matchId]);

    // Ad switching
    useEffect(() => {
        if (adMedia.length === 0) return;
        const interval = setInterval(() => {
            setMode('ad');
            setTimeout(() => {
                setMode('score');
                setCurrentAdIdx(prev => (prev + 1) % adMedia.length);
            }, adDur * 1000);
        }, adFreq * 1000);
        return () => clearInterval(interval);
    }, [adFreq, adDur, adMedia.length]);

    if (loading) return (
        <div className="h-screen bg-black flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-padel-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!match) return (
        <div className="h-screen bg-[#050505] flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Trophy className="w-10 h-10 text-gray-600" />
            </div>
            <h1 className="text-2xl font-black italic uppercase text-white mb-2">Partido no encontrado</h1>
            <p className="text-gray-400 max-w-md">No hemos podido encontrar la información de este partido. Por favor, verifica el enlace o vuelve al panel del torneo.</p>
            <button
                onClick={() => window.location.href = `/tournaments/${id}`}
                className="mt-8 px-8 py-3 bg-white text-black rounded-xl font-black italic uppercase tracking-widest text-xs hover:scale-105 transition-all"
            >
                Volver al Torneo
            </button>
        </div>
    );

    // ── Valores del marcador: preferir RTDB si hay marcador en vivo ──────────
    const lm = liveMarcador;

    /** Nombres que envía el marcador del partido (mismo criterio que la grilla / score) */
    const splitLiveTeamNombre = (nombre: string | undefined, fp1: string, fp2: string) => {
        const isPlaceholder = (v: string | undefined | null) => {
            const s = (v || '').trim();
            if (!s) return true;
            const lower = s.toLowerCase();
            return (
                s === '?' ||
                s.toUpperCase() === 'TBD' ||
                lower === 'undefined' ||
                lower === 'player' ||
                lower === 'placeholder' ||
                /^pareja\s*\d*$/i.test(s) ||
                /^equipo\s*\d*$/i.test(s) ||
                /^jugador\s*\d*$/i.test(s) ||
                /^player\s*\d*$/i.test(s)
            );
        };

        if (!nombre || typeof nombre !== 'string' || !nombre.trim()) return { p1: fp1, p2: fp2 };
        const parts = nombre.split(/\s*\/\s*/).map((s) => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
            const p1 = isPlaceholder(parts[0]) ? fp1 : parts[0];
            const p2 = isPlaceholder(parts[1]) ? fp2 : parts[1];
            return { p1, p2 };
        }
        if (parts.length === 1) {
            const p1 = isPlaceholder(parts[0]) ? fp1 : parts[0];
            return { p1, p2: fp2 };
        }
        return { p1: fp1, p2: fp2 };
    };
    const t1Live = splitLiveTeamNombre(lm?.equipo_1?.nombre, match.t1p1, match.t1p2);
    const t2Live = splitLiveTeamNombre(lm?.equipo_2?.nombre, match.t2p1, match.t2p2);

    // Games en el set actual
    const gamesT1 = lm ? (Number(lm.games?.local ?? 0) || 0) : (Number(match.games?.t1 ?? 0) || 0);
    const gamesT2 = lm ? (Number(lm.games?.visitante ?? 0) || 0) : (Number(match.games?.t2 ?? 0) || 0);

    // Sets ganados
    const setsT1 = lm ? (Number(lm.sets?.local ?? 0) || 0) : (Number(match.sets?.t1 ?? 0) || 0);
    const setsT2 = lm ? (Number(lm.sets?.visitante ?? 0) || 0) : (Number(match.sets?.t2 ?? 0) || 0);

    // Set actual
    const currentSet = setsT1 + setsT2 + 1;

    const modoPuntos: 'normal' | 'tiebreak' | 'super_tiebreak' = lm?.modo_puntos ||
        (match?.matchFormat === 'SUPER_TIEBREAK' || match?.superTiebreak || (currentSet === 3 && match?.matchFormat === 'SET_3_STB')
            ? 'super_tiebreak'
            : (match?.matchFormat === 'TIEBREAK' || match?.tiebreak || match?.isTiebreak === true || (gamesT1 === 6 && gamesT2 === 6)
                ? 'tiebreak'
                : 'normal'));

    const isTiebreak = modoPuntos === 'tiebreak';
    const isSTB = modoPuntos === 'super_tiebreak';

    // Convierte valor numérico a notación tenis: 0→0, 1→15, 2→30, 3→40, 4→AD
    const toTennis = (v: any): string => {
        if (v === null || v === undefined) return '0';
        const s = String(v).trim().toUpperCase();
        if (['15', '30', '40', 'AD'].includes(s)) return s;
        const n = parseInt(s);
        return ['0', '15', '30', '40', 'AD'][Math.min(n, 4)] ?? s;
    };

    // Puntos actuales: en TB mostrar 1-7, en STB 1-11; en game normal 0/15/30/40/AD
    const ptsT1Raw = lm ? (lm.puntos?.local ?? '0') : (match.points?.t1 ?? '0');
    const ptsT2Raw = lm ? (lm.puntos?.visitante ?? '0') : (match.points?.t2 ?? '0');
    const tbT1 = lm ? Number(lm.puntos?.local ?? 0) : (match.tiebreakScore?.t1 ?? (Number(ptsT1Raw) || 0));
    const tbT2 = lm ? Number(lm.puntos?.visitante ?? 0) : (match.tiebreakScore?.t2 ?? (Number(ptsT2Raw) || 0));
    const stbT1 = lm ? Number(lm.puntos?.local ?? 0) : (match.superTiebreakScore?.t1 ?? (Number(ptsT1Raw) || 0));
    const stbT2 = lm ? Number(lm.puntos?.visitante ?? 0) : (match.superTiebreakScore?.t2 ?? (Number(ptsT2Raw) || 0));

    // Lógica Híbrida: si es tiebreak o supertiebreak, mostrar puntos numéricos. Si no, notación tenis.
    const ptsT1 = isSTB ? String(stbT1) : isTiebreak ? String(tbT1) : toTennis(ptsT1Raw);
    const ptsT2 = isSTB ? String(stbT2) : isTiebreak ? String(tbT2) : toTennis(ptsT2Raw);

    // Para decidir cuántas columnas de sets mostrar, priorizamos el formato "vivo"
    // que escribe el marker en RTDB: `marcador.match_format`.
    const fmtForSets = (lm?.match_format || match?.matchFormat || tournament?.matchFormat || '') as string;
    const twoSetsPlusStbFmt = fmtForSets === 'TWO_SHORT_SETS' || fmtForSets === 'TWO_NORMAL_SETS';
    const visibleSetCols = visibleSetNumbersForScoreboard({
        matchFormat: fmtForSets,
        superTiebreak: lm?.super_tiebreak === true || match?.superTiebreak === true,
        tiebreak: lm?.modo_puntos === 'tiebreak' || match?.tiebreak === true,
        setsT1,
        setsT2,
    });
    // En vivo puede existir un pequeño desfase: games llega a 6 antes de que sets se incremente.
    // En formatos a 2 sets, mostramos SET 2 apenas se ve cierre del primer set por games.
    const shouldForceSecondSetCol =
        twoSetsPlusStbFmt &&
        setsT1 + setsT2 === 0 &&
        (gamesT1 >= 6 || gamesT2 >= 6);
    const visibleSetColsFinal = shouldForceSecondSetCol ? [1, 2] : visibleSetCols;
    const scoreboardGridClass = scoreboardGridClassForSetCount(visibleSetColsFinal.length);

    // Set boxes helper (alineado con columnas visibles de la pizarra principal)
    const SetBoxes = ({ team }: { team: 1 | 2 }) => (
        <div className="flex items-center gap-[1vw]">
            {visibleSetColsFinal.map(setNum => {
                const isPast = setNum < currentSet;
                const isCurrent = setNum === currentSet;
                const pastVal = match.games_sets?.[setNum - 1]?.[`t${team}`] ?? match.setScores?.[setNum - 1]?.[`t${team}`];
                const currentVal = match.games?.[`t${team}`] ?? '';
                const val = isPast ? (pastVal ?? 0) : isCurrent ? currentVal : '-';
                return (
                    <div
                        key={setNum}
                        className={`flex flex-col items-center justify-center border-2 transition-all duration-500 relative overflow-hidden ${isCurrent
                            ? 'border-white/20 shadow-2xl'
                            : 'border-white/5 opacity-50'
                            }`}
                        style={{
                            width: 'clamp(36px,5vw,80px)',
                            height: 'clamp(44px,6.5vw,100px)',
                            borderRadius: 'clamp(8px,1.2vw,18px)',
                            background: isCurrent ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.3)',
                            transform: isCurrent ? 'scale(1.06)' : undefined,
                        }}
                    >
                        {isCurrent && <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />}
                        <span className="font-black uppercase text-gray-500 tracking-widest" style={{ fontSize: 'clamp(10px,0.9vw,16px)', marginBottom: '2px' }}>{`SET ${setNum}`}</span>
                        <motion.span
                            key={isCurrent ? match.games?.[`t${team}`] : (pastVal ?? setNum)}
                            initial={isCurrent ? { scale: 1.5, opacity: 0 } : {}}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`font-black italic ${isCurrent ? 'text-white' : 'text-white/40'}`}
                            style={{ fontSize: 'clamp(24px,3.5vw,60px)', lineHeight: 1 }}
                        >
                            {val}
                        </motion.span>
                    </div>
                );
            })}
        </div>
    );

    // ── Formateador de categorías (solo categoría, sin género)
    const CATEGORY_BASE_LABELS: Record<string, string> = {
        // Categorias por nivel
        primera: '1ª',
        segunda: '2ª',
        tercera: '3ª',
        cuarta: '4ª',
        quinta: '5ª',
        sexta: '6ª',
        septima: '7ª',
        // Sumas
        suma_7: 'Suma 7',
        suma_8: 'Suma 8',
        suma_9: 'Suma 9',
        suma_10: 'Suma 10',
        suma_11: 'Suma 11',
        // Veteranos
        mas_45: '+45',
        mas_50: '+50',
        // Genéricos
        mixto: 'Mixto',
        menores: 'Menores',
        open: 'Open',
    };
    const formatCategory = (slug: string) => {
        const key = slug.toLowerCase();
        return CATEGORY_BASE_LABELS[key] ?? slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    const matchTimeDisplay = (() => {
        const raw = match?.scheduledTime || match?.time;
        if (!raw) return null;
        const d = typeof raw?.toDate === 'function' ? raw.toDate() : new Date(raw);
        if (isNaN(d.getTime())) return null;
        return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    })();

    // Activa el cronómetro cuando el marker inicia el partido (status LIVE en match),
    // y también cuando existe estado de cronómetro en pizarra_cancha_state.
    const markerDurationStartMs = getMarkerDurationStartMs(match);
    const markerDurationEndMs = getMarkerDurationEndMs(match);

    /**
     * Un solo indicador de saque: no mezclar lm.saque OR match.server (provoca dos destellos).
     * Prioridad: match.server (BD, lo controla el marker) → refuerzo lm.saque si aún no hay server válido.
     */
    const mServer = match?.server;
    const mTeam = Number(mServer?.team);
    const mPlayer = Number(mServer?.player);
    const lSaque = lm?.saque;
    const lTeam = Number(lSaque?.equipo);
    const lPlayer = Number(lSaque?.jugador);
    // null = sin saque definido → ninguna pelota se muestra hasta que el marker lo seleccione
    const displayServer: { team: 1 | 2; player: 1 | 2 } | null =
        ((mTeam === 1 || mTeam === 2) && (mPlayer === 1 || mPlayer === 2))
            ? { team: mTeam as 1 | 2, player: mPlayer as 1 | 2 }
            : ((lTeam === 1 || lTeam === 2) && (lPlayer === 1 || lPlayer === 2))
                ? { team: lTeam as 1 | 2, player: lPlayer as 1 | 2 }
                : null;

    const relojTheme = relojOcasion || 'default';

    return (
        <div
            className={`min-h-screen h-screen w-screen text-white overflow-hidden font-outfit relative flex flex-col transition-colors duration-1000 ${isFinal ? 'bg-[#000] border-8 border-[#FFD700]/20' : 'bg-[#050505]'}`}
            style={{ padding: 'clamp(6px,1vh,16px) clamp(8px,1.2vw,20px)', gap: 'clamp(4px,0.8vh,12px)' }}
        >
            <AnimatePresence>
                {courtTransferBanner && (
                    <motion.div
                        key="court-transfer-banner"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="fixed inset-0 z-[450] flex items-center justify-center pointer-events-none"
                    >
                        <div className="absolute inset-0 bg-black/88 backdrop-blur-md" />
                        <motion.div
                            initial={{ scale: 0.9, y: 24 }}
                            animate={{ scale: 1, y: 0 }}
                            className="relative z-10 text-center px-6 max-w-[min(96vw,56rem)]"
                        >
                            <motion.h2
                                className="font-black italic uppercase tracking-tighter mb-5"
                                style={{
                                    fontSize: 'clamp(1.75rem, 7vw, 4.5rem)',
                                    color: primaryColor,
                                    textShadow: `0 0 50px ${primaryColor}99`,
                                }}
                                animate={{ scale: [1, 1.04, 1] }}
                                transition={{ duration: 1.15, repeat: Infinity }}
                            >
                                {courtTransferBanner.title}
                            </motion.h2>
                            <p
                                className="text-white font-black uppercase tracking-[0.28em] leading-relaxed"
                                style={{ fontSize: 'clamp(0.7rem, 2.2vw, 1.35rem)' }}
                            >
                                {courtTransferBanner.subtitle}
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Grand Final ambient glow */}
            {isFinal && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    <motion.div
                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#FFD70011_0%,_transparent_70%)]"
                    />
                </div>
            )}

            {/* Background blobs */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-10">
                <div className="absolute top-[-10%] left-[-5%] w-[35%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: primaryColor }} />
                <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
            </div>

            <AnimatePresence mode="wait">
                {mode === 'score' ? (
                    <motion.div
                        key="score"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col h-full w-full relative z-10"
                    >
                        {/* ══════════════ HEADER BAR (10%) ══════════════ */}
                        <div
                            className="flex items-center justify-between flex-shrink-0 border border-white/8 bg-white/[0.03] backdrop-blur-sm px-6"
                            style={{
                                height: '10vh',
                                borderRadius: '0 0 clamp(10px,1.4vw,22px) clamp(10px,1.4vw,22px)',
                                marginBottom: '0.5vh'
                            }}
                        >
                            {/* Left: Tournament & Match Info */}
                            <div className="flex items-center gap-4 h-full py-2">
                                {tournament?.logo && (
                                    <div className="h-full aspect-square bg-white/5 rounded-xl p-1.5 border border-white/10 flex items-center justify-center">
                                        <img src={tournament.logo} className="w-full h-full object-contain" />
                                    </div>
                                )}
                                <div className="flex flex-col items-start justify-center">
                                    <span className="label-cancha leading-none font-black italic uppercase"
                                        style={{ fontSize: 'clamp(14px,1.8vw,32px)' }}>
                                        {match.courtName ?? (match.court != null ? `Pista ${match.court}` : 'Pista –')}
                                    </span>
                                    <div className="flex flex-col items-start leading-tight mt-1">
                                        {(match.roundName || match.groupName) && (
                                            <span className="font-bold italic uppercase tracking-tight"
                                                style={{ fontSize: 'clamp(8px,0.8vh,14px)', color: 'rgba(255,255,255,0.60)' }}>
                                                {match.roundName || match.groupName}
                                            </span>
                                        )}
                                        <div className="flex flex-col items-start mt-0.5">
                                            <span className="font-bold italic uppercase leading-none mb-1"
                                                style={{ fontSize: 'clamp(8px,0.8vh,14px)', color: 'rgba(255,255,255,0.5)' }}>
                                                {tournament?.gender === 'female' ? 'Femenino' : tournament?.gender === 'mixed' ? 'Mixto' : 'Masculino'}
                                            </span>
                                            {tournament?.category && (
                                                <span className="font-bold italic uppercase tracking-wide leading-none"
                                                    style={{ fontSize: 'clamp(10px,1vh,16px)', color: 'rgba(255,255,255,0.9)' }}>
                                                    {formatCategory(tournament.category)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Center: Match Control (Timer/Clock) */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                                <MatchDurationCounter
                                    matchStatus={match?.status}
                                    startTimeMs={markerDurationStartMs}
                                    endTimeMs={markerDurationEndMs}
                                    cronData={lm?.cronometro}
                                    primaryColor={primaryColor}
                                    cronometroTipo={cronometroTipo}
                                />
                            </div>

                            {/* Right: Clock Box (Time / Date + Temp) */}
                            <div className="flex items-center gap-3">


                                <div className={`flex flex-col items-center justify-center border transition-all duration-700 relative overflow-hidden ${tournament?.broadcastingSettings?.clockStyle === 'broadcast'
                                    ? 'bg-black/60 border-white/15'
                                    : 'border-white/8 bg-white/[0.04] backdrop-blur-md'
                                    }`}
                                    style={{
                                        borderRadius: 'clamp(10px,1.4vw,22px)',
                                        paddingTop: '0.5vw',
                                        paddingLeft: '1.2vw',
                                        paddingRight: '1.2vw',
                                        paddingBottom: '1.0vw',
                                        minWidth: 'fit-content'
                                    }}>
                                    <div className="flex flex-col items-center w-full">
                                        <DisplayClockTime className="font-black italic tracking-tighter leading-none"
                                            style={{
                                                fontSize: 'clamp(20px,2.6vw,44px)',
                                                color: tournament?.broadcastingSettings?.clockStyle === 'broadcast' ? primaryColor : 'white',
                                                textShadow: tournament?.broadcastingSettings?.clockStyle === 'broadcast' ? `0 0 20px ${primaryColor}40` : 'none'
                                            }}
                                        />

                                        <div className="flex items-center justify-between w-full mt-1.5 pt-1.5 border-t border-white/10 gap-3">
                                            <DisplayClockDate className="font-bold uppercase text-white/40 tracking-tight whitespace-nowrap"
                                                style={{ fontSize: 'clamp(10px,1.1vw,18px)' }}
                                            />

                                            {temp !== null && (
                                                <div className="flex items-center gap-1 pl-3 border-l border-white/10">
                                                    <Thermometer style={{ width: 'clamp(8px,0.8vw,14px)', height: 'clamp(8px,0.8vw,14px)', color: primaryColor }} />
                                                    <span className="font-black italic tracking-tighter" style={{ fontSize: 'clamp(10px,1vw,16px)', color: primaryColor }}>{temp}°C</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ══════════════ MARCADOR / PIZARRA (30%) ══════════════ */}
                        <div
                            className="flex-shrink-0 border border-white/10 bg-black/60 overflow-hidden flex flex-col mb-[0.8vh] relative shadow-2xl"
                            style={{ height: '30.5vh', borderRadius: 'clamp(12px,1.6vw,26px)' }}
                        >
                            {/* Match Title Bar (FINAL - TOURNAMENT NAME) */}
                            <div className="h-[20%] flex items-center justify-center bg-black relative border-b border-white/[0.05]">
                                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ccff00] to-transparent opacity-50" />
                                <h2 className="font-black italic uppercase tracking-[0.2em] text-white flex items-center gap-4" style={{ fontSize: 'clamp(12px,2.2vh,32px)' }}>
                                    <span style={{ color: primaryColor }}>{match.roundName || 'Partido'}</span>
                                    {tournament?.nombre && (
                                        <span>{tournament.nombre}</span>
                                    )}
                                </h2>
                            </div>

                            {/* Columnas de set: solo la del set en curso hasta que el anterior cierre */}
                            {(() => {
                                const fmt = fmtForSets;
                                const twoSetsPlusStb = twoSetsPlusStbFmt;
                                const setCols = visibleSetColsFinal;
                                const grid = scoreboardGridClass;
                                return (
                                    <>
                                        <div className={`grid ${grid} items-center border-b border-white/[0.1] bg-black/40 px-6`} style={{ height: '14%' }}>
                                            <div />
                                            {setCols.map(s => {
                                                // Para el tercer set: detectar si es STB o TB
                                                const is3rdSTB = s === 3 && (
                                                    match?.matchFormat === 'SUPER_TIEBREAK' ||
                                                    match?.superTiebreak === true ||
                                                    match?.matchFormat === 'SET_3_STB' ||
                                                    twoSetsPlusStb
                                                );
                                                const is3rdTB = s === 3 && !is3rdSTB && (
                                                    match?.matchFormat === 'TIEBREAK' ||
                                                    match?.tiebreak === true
                                                );
                                                const setLabel = is3rdSTB ? 'STB' : is3rdTB ? 'TB' : `SET ${s}`;

                                                // Resultado del set — para STB usar superTiebreakScore
                                                let sc: any = match.setScores?.[s - 1] ?? match.games_sets?.[s - 1] ?? null;
                                                if (is3rdSTB && !sc && match.superTiebreakScore) {
                                                    sc = match.superTiebreakScore;
                                                }
                                                const setDone = sc != null && s < currentSet;
                                                const scT1 = sc?.t1 ?? sc?.local ?? null;
                                                const scT2 = sc?.t2 ?? sc?.visitante ?? null;

                                                return (
                                                    <div key={s} className="flex flex-col items-center justify-center border-l border-white/[0.1] h-full gap-0.5">
                                                        <span
                                                            className="font-black uppercase tracking-widest leading-none text-center w-full"
                                                            style={{
                                                                fontSize: 'clamp(9px,0.9vw,17px)',
                                                                color: (is3rdSTB || is3rdTB) ? 'rgba(204,255,0,0.55)' : 'rgba(255,255,255,0.4)'
                                                            }}
                                                        >
                                                            {setLabel}
                                                        </span>
                                                        {setDone && scT1 != null && scT2 != null && (
                                                            <span
                                                                className="font-black italic tabular-nums leading-none text-center w-full"
                                                                style={{ fontSize: 'clamp(10px,1.1vw,18px)', color: primaryColor, opacity: 0.9 }}
                                                            >
                                                                {scT1}·{scT2}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            <div className="flex items-center justify-center border-l border-white/[0.15] h-full" style={{ backgroundColor: `${primaryColor}20` }}>
                                                <span className="font-black uppercase tracking-widest leading-none text-center w-full" style={{ fontSize: 'clamp(12px,1.2vw,20px)', color: primaryColor }}>
                                                    PTS
                                                </span>
                                            </div>
                                        </div>

                                        {/* Team 1 row */}
                                        <div className={`flex-1 grid ${grid} items-center relative border-b border-white/[0.1] overflow-hidden px-6`}>
                                            <div className="flex flex-col justify-center h-full pr-6 relative">
                                                <div className="relative flex items-center w-full h-[75%] bg-gradient-to-r from-white/[0.08] to-transparent rounded-xl border border-white/[0.1] backdrop-blur-md px-4 overflow-hidden shadow-2xl">
                                                    <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
                                                    <div className="font-black italic uppercase tracking-tighter text-white truncate drop-shadow-xl z-0 pl-4 pr-12 flex items-center" style={{ fontSize: 'clamp(22px,3.8vh,52px)', lineHeight: 1.0 }}>
                                                        <span className="flex items-center">
                                                            <AnimatePresence>
                                                                {(displayServer?.team === 1 && displayServer?.player === 1) && (
                                                                    <motion.div initial={{ opacity: 0, scale: 0, x: -10 }} animate={{ opacity: [1, 0.4, 1], scale: [1, 1.1, 1] }} transition={{ opacity: { duration: 1.5, repeat: Infinity }, scale: { duration: 1.5, repeat: Infinity } }} exit={{ opacity: 0, scale: 0 }}
                                                                        className="mr-3 w-[1.2em] h-[1.2em] rounded-full bg-[#ccff00] shadow-[0_0_20px_#ccff00,inset_0_0_8px_#000] flex items-center justify-center flex-shrink-0">
                                                                        <span style={{ fontSize: '0.6em' }}>🎾</span>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                            {processDisplayName(t1Live.p1) || t1Live.p1}
                                                        </span>
                                                        <span className="text-white/30 mx-3">/</span>
                                                        <span className="flex items-center">
                                                            <AnimatePresence>
                                                                {(displayServer?.team === 1 && displayServer?.player === 2) && (
                                                                    <motion.div initial={{ opacity: 0, scale: 0, x: -10 }} animate={{ opacity: [1, 0.4, 1], scale: [1, 1.1, 1] }} transition={{ opacity: { duration: 1.5, repeat: Infinity }, scale: { duration: 1.5, repeat: Infinity } }} exit={{ opacity: 0, scale: 0 }}
                                                                        className="mr-3 w-[1.2em] h-[1.2em] rounded-full bg-[#ccff00] shadow-[0_0_20px_#ccff00,inset_0_0_8px_#000] flex items-center justify-center flex-shrink-0">
                                                                        <span style={{ fontSize: '0.6em' }}>🎾</span>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                            {processDisplayName(t1Live.p2) || t1Live.p2}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {setCols.map((s: number) => {
                                                let val: string | number = '';
                                                if (s < currentSet) {
                                                    const stbFallback = (s === 3 && !match.setScores?.[2]) ? match.superTiebreakScore?.t1 : undefined;
                                                    val = lm?.historico_sets?.[s - 1]?.local ?? match.games_sets?.[s - 1]?.t1 ?? match.setScores?.[s - 1]?.t1 ?? stbFallback ?? 0;
                                                } else if (s === currentSet) {
                                                    val = gamesT1;
                                                }
                                                return (
                                                    <div key={s} className="flex items-center justify-center border-l border-white/[0.1] h-full">
                                                        <span className="font-black italic text-white tabular-nums text-center block w-full" style={{ fontSize: 'clamp(36px,6.5vh,80px)', fontVariantNumeric: 'tabular-nums' }}>{val !== '' ? val : '-'}</span>
                                                    </div>
                                                );
                                            })}
                                            <div className="flex items-center justify-center border-l border-white/[0.2] h-full" style={{ backgroundColor: `${primaryColor}40` }}>
                                                <motion.span key={ptsT1} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                                    className="font-black italic text-[#ccff00] drop-shadow-[0_0_15px_#ccff0060] tabular-nums text-center block w-full"
                                                    style={{ fontSize: 'clamp(42px,9vh,110px)', fontVariantNumeric: 'tabular-nums' }}>{ptsT1}</motion.span>
                                            </div>
                                        </div>

                                        {/* Team 2 row */}
                                        <div className={`flex-1 grid ${grid} items-center relative overflow-hidden px-6`}>
                                            <div className="flex flex-col justify-center h-full pr-6 relative">
                                                <div className="relative flex items-center w-full h-[75%] bg-gradient-to-r from-white/[0.08] to-transparent rounded-xl border border-white/[0.1] backdrop-blur-md px-4 overflow-hidden">
                                                    <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
                                                    <div className="font-black italic uppercase tracking-tighter text-white truncate drop-shadow-xl z-0 pl-4 pr-12 flex items-center" style={{ fontSize: 'clamp(22px,3.8vh,52px)', lineHeight: 1.0 }}>
                                                        <span className="flex items-center">
                                                            <AnimatePresence>
                                                                {(displayServer?.team === 2 && displayServer?.player === 1) && (
                                                                    <motion.div initial={{ opacity: 0, scale: 0, x: -10 }} animate={{ opacity: [1, 0.4, 1], scale: [1, 1.1, 1] }} transition={{ opacity: { duration: 1.5, repeat: Infinity }, scale: { duration: 1.5, repeat: Infinity } }} exit={{ opacity: 0, scale: 0 }}
                                                                        className="mr-3 w-[1.2em] h-[1.2em] rounded-full bg-[#ccff00] shadow-[0_0_20px_#ccff00,inset_0_0_8px_#000] flex items-center justify-center flex-shrink-0">
                                                                        <span style={{ fontSize: '0.6em' }}>🎾</span>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                            {processDisplayName(t2Live.p1) || t2Live.p1}
                                                        </span>
                                                        <span className="text-white/30 mx-3">/</span>
                                                        <span className="flex items-center">
                                                            <AnimatePresence>
                                                                {(displayServer?.team === 2 && displayServer?.player === 2) && (
                                                                    <motion.div initial={{ opacity: 0, scale: 0, x: -10 }} animate={{ opacity: [1, 0.4, 1], scale: [1, 1.1, 1] }} transition={{ opacity: { duration: 1.5, repeat: Infinity }, scale: { duration: 1.5, repeat: Infinity } }} exit={{ opacity: 0, scale: 0 }}
                                                                        className="mr-3 w-[1.2em] h-[1.2em] rounded-full bg-[#ccff00] shadow-[0_0_20px_#ccff00,inset_0_0_8px_#000] flex items-center justify-center flex-shrink-0">
                                                                        <span style={{ fontSize: '0.6em' }}>🎾</span>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                            {processDisplayName(t2Live.p2) || t2Live.p2}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {setCols.map((s: number) => {
                                                let val: string | number = '';
                                                if (s < currentSet) {
                                                    const stbFallback = (s === 3 && !match.setScores?.[2]) ? match.superTiebreakScore?.t2 : undefined;
                                                    val = lm?.historico_sets?.[s - 1]?.visitante ?? match.games_sets?.[s - 1]?.t2 ?? match.setScores?.[s - 1]?.t2 ?? stbFallback ?? 0;
                                                } else if (s === currentSet) {
                                                    val = gamesT2;
                                                }
                                                return (
                                                    <div key={s} className="flex items-center justify-center border-l border-white/[0.1] h-full">
                                                        <span className="font-black italic text-white tabular-nums text-center block w-full" style={{ fontSize: 'clamp(36px,6.5vh,80px)', fontVariantNumeric: 'tabular-nums' }}>{val !== '' ? val : '-'}</span>
                                                    </div>
                                                );
                                            })}
                                            <div className="flex items-center justify-center border-l border-white/[0.2] h-full" style={{ backgroundColor: `${primaryColor}40` }}>
                                                <motion.span key={ptsT2} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                                    className="font-black italic text-[#ccff00] drop-shadow-[0_0_15px_#ccff0060] tabular-nums text-center block w-full"
                                                    style={{ fontSize: 'clamp(42px,9vh,110px)', fontVariantNumeric: 'tabular-nums' }}>{ptsT2}</motion.span>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        {/* ══════════════ PUBLICIDAD (50%) ══════════════ */}
                        <div
                            className="flex-shrink-0 flex flex-row gap-2 mb-[1vh] px-6"
                            style={{ height: '49vh' }}
                        >
                            {/* Video Ad / Hub Media (takes the left half) */}
                            <div className="w-1/2 border border-white/8 bg-white/[0.02] relative overflow-hidden rounded-3xl">
                                <AnimatePresence mode="wait">
                                    {hubMedia ? (
                                        hubMedia.tipo === 'url_web' ? (
                                            <motion.iframe
                                                key={hubMedia.url}
                                                src={hubMedia.url}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="w-full h-full border-none pointer-events-none"
                                                loading="lazy"
                                            />
                                        ) : isVideoMedia(hubMedia) ? (
                                            <motion.video
                                                key={hubMedia.url}
                                                src={hubMedia.url}
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <motion.img
                                                key={hubMedia.url}
                                                src={hubMedia.url}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="w-full h-full object-contain p-4"
                                            />
                                        )
                                    ) : hubLibraryVids.length > 0 ? (
                                        (() => {
                                            const currentVid = hubLibraryVids[hubLibraryVidIdx % hubLibraryVids.length];
                                            return (
                                                <motion.video
                                                    key={currentVid.url}
                                                    src={currentVid.url}
                                                    autoPlay
                                                    muted
                                                    loop
                                                    playsInline
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="w-full h-full object-cover"
                                                />
                                            );
                                        })()
                                    ) : adBanner.isVisible && adBanner.currentImageUrl ? (
                                        isVideoMedia(adBanner.currentImageUrl) ? (
                                            <motion.video key={adBanner.currentImageUrl} src={adBanner.currentImageUrl} autoPlay muted loop playsInline initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full object-cover" />
                                        ) : (
                                            <motion.img key={adBanner.currentImageUrl} src={adBanner.currentImageUrl} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full object-contain p-4" />
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full opacity-20">
                                            <Megaphone className="w-12 h-12 mb-2" style={{ color: primaryColor }} />
                                            <span className="font-black italic uppercase tracking-widest text-[10px]">Espacio Publicitario Hub</span>
                                        </div>
                                    )}

                                </AnimatePresence>
                            </div>
                            {/* Carousel Ad / Sponsors (takes the right half) */}
                            <div className="w-1/2 border border-white/10 bg-white/[0.03] relative overflow-hidden rounded-2xl">
                                <AnimatePresence mode="wait">
                                    {hubCarousel ? (
                                        hubCarousel.tipo === 'url_web' ? (
                                            <motion.iframe
                                                key={hubCarousel.url}
                                                src={hubCarousel.url}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="w-full h-full border-none pointer-events-none"
                                                loading="lazy"
                                            />
                                        ) : isVideoMedia(hubCarousel) ? (
                                            <motion.video
                                                key={hubCarousel.url}
                                                src={hubCarousel.url}
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <motion.img
                                                key={hubCarousel.url}
                                                src={hubCarousel.url}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="w-full h-full object-contain p-4"
                                            />
                                        )
                                    ) : hubLibraryImgs.length > 0 ? (
                                        (() => {
                                            const currentImg = hubLibraryImgs[hubLibraryImgIdx % hubLibraryImgs.length];
                                            return (
                                                <motion.img
                                                    key={currentImg.url}
                                                    src={currentImg.url}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="w-full h-full object-contain p-4"
                                                />
                                            );
                                        })()
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full opacity-20">
                                            <Megaphone className="w-12 h-12 mb-2" style={{ color: primaryColor }} />
                                            <span className="font-black italic uppercase tracking-widest text-[10px]">Carrusel de Imágenes Hub</span>
                                        </div>
                                    )}

                                </AnimatePresence>
                            </div>
                        </div>

                        {/* ══════════════ FOOTER BAR (10%) ══════════════ */}
                        <div
                            className="flex-shrink-0 overflow-hidden border-t border-white/10 bg-black/40 backdrop-blur-md relative flex items-center mb-[0.8vh]"
                            style={{
                                height: '9.5vh',
                                borderRadius: 'clamp(10px,1.2vw,18px) clamp(10px,1.2vw,18px) 0 0',
                            }}>
                            <div className="w-full overflow-hidden relative py-2">
                                <div className="flex whitespace-nowrap animate-marquee">
                                    {(supabaseTickerMessages.length > 0 ? supabaseTickerMessages : [{ mensaje: 'tira informativa TV a la espera de contenido.' }]).map((msg: any, idx: number) => (
                                        <div key={idx} className="flex items-center px-12">
                                            <Star className="w-5 h-5 text-padel-primary mr-4 fill-padel-primary/20" />
                                            <span className="text-3xl font-black italic uppercase tracking-widest text-white">
                                                {msg.mensaje || msg.texto}
                                            </span>
                                            <Star className="w-5 h-5 text-padel-primary ml-16 fill-padel-primary/20" />
                                        </div>
                                    ))}
                                    {/* Duplicate for infinite scroll */}
                                    {(supabaseTickerMessages.length > 0 ? supabaseTickerMessages : [{ mensaje: 'tira informativa TV a la espera de contenido.' }]).map((msg: any, idx: number) => (
                                        <div key={`dup-${idx}`} className="flex items-center px-12">
                                            <Star className="w-5 h-5 text-padel-primary mr-4 fill-padel-primary/20" />
                                            <span className="text-3xl font-black italic uppercase tracking-widest text-white">
                                                {msg.mensaje || msg.texto}
                                            </span>
                                            <Star className="w-5 h-5 text-padel-primary ml-16 fill-padel-primary/20" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Overlay animación disparada por el marker (debajo de los puntos) */}
                        <AnimatePresence>
                            {animacionActual?.id && (animacionActual.url || animacionesMarcador[animacionActual.id]?.url) && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 pointer-events-none"
                                >
                                    {(() => {
                                        const url = animacionActual.url || animacionesMarcador[animacionActual.id]?.url;
                                        if (!url) return null;
                                        const isVideo = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
                                        const isLottie = /\.(json)(\?|$)/i.test(url) || url.toLowerCase().includes('lottie');
                                        const isImage = /\.(gif|webp|png|jpg|jpeg)(\?|$)/i.test(url);

                                        if (isVideo) {
                                            return <video src={url} autoPlay muted playsInline className="max-w-full max-h-full object-contain" />;
                                        }
                                        if (isLottie) {
                                            return <LottieAnimationOverlay url={url} />;
                                        }
                                        return <img src={url} alt="" className="max-w-full max-h-full object-contain" />;
                                    })()}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    /* ══════════════ AD MODE ══════════════ */
                    <motion.div key="ad" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className="h-full w-full bg-black flex items-center justify-center relative">
                        {adMedia[currentAdIdx] && /\.(mp4|webm|mov|m4v)(\?|$)/i.test(adMedia[currentAdIdx]) ? (
                            <video src={adMedia[currentAdIdx]} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                        ) : adMedia[currentAdIdx] ? (
                            <img src={adMedia[currentAdIdx]} className="w-full h-full object-contain p-12 lg:p-32" />
                        ) : (
                            <div className="text-center space-y-12 relative z-10">
                                <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-48 h-48 bg-padel-primary/10 rounded-full flex items-center justify-center mx-auto border-4 border-padel-primary/20 backdrop-blur-xl shadow-[0_0_100px_rgba(204,255,0,0.1)]">
                                    <Megaphone className="w-24 h-24 text-padel-primary filter drop-shadow-[0_0_20px_rgba(204,255,0,0.5)]" />
                                </motion.div>
                                <div className="space-y-4">
                                    <div className="relative mb-12 flex justify-center scale-75 lg:scale-100">
                                        <div className="absolute -inset-20 bg-padel-primary/10 blur-[100px] rounded-full animate-pulse" />
                                        <h1 className="text-8xl font-black italic uppercase tracking-tighter flex items-center gap-6 relative z-10 leading-none">
                                            <span className="text-padel-primary drop-shadow-[0_0_50px_rgba(204,255,0,0.3)]">SMART</span>
                                            <div className="mb-4">
                                                <BouncingBall size={80} />
                                            </div>
                                            <span className="text-white">PADEL</span>
                                        </h1>
                                    </div>
                                    <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none opacity-40">
                                        Espacio <span className="text-padel-primary opacity-100">Publicitario</span> Disponible
                                    </h2>
                                    <p className="text-xl font-bold uppercase tracking-[0.5em] text-[#fb923c] animate-pulse">
                                        Tu marca aquí • Padel Smart TV
                                    </p>
                                </div>
                                <div className="flex items-center justify-center gap-8 pt-8">
                                    <div className="h-px w-24 bg-gradient-to-r from-transparent to-white/20" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Contactar a Dirección</span>
                                    <div className="h-px w-24 bg-gradient-to-l from-transparent to-white/20" />
                                </div>
                            </div>
                        )}
                        {funEnabled && match.points?.t1 === '0' && match.points?.t2 === '0' && (
                            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1.5 }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="p-12 bg-padel-primary text-black rounded-full font-black italic text-8xl shadow-[0_0_100px_#ccff00]">GAME!</div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Botón Fullscreen forzado para Firestick (y trigger para autoplay de video) */}
            <button 
                onClick={() => {
                    if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen().catch(err => {
                            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                        });
                    } else {
                        document.exitFullscreen();
                    }
                }}
                className="absolute bottom-2 right-2 z-[9999] opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity p-3 backdrop-blur-md bg-black/50 rounded-xl border border-white/20"
                title="Pantalla Completa"
            >
                <div className="w-5 h-5 text-white/50 hover:text-white flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
                </div>
            </button>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                .font-outfit { font-family: 'Outfit', sans-serif; }
                body { background: black; margin: 0; padding: 0; }
            `}</style>
        </div>
    );
}
