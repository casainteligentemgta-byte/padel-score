'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import lottie from 'lottie-web';
import { dataService } from '@/lib/dataService';
import { createClient } from '@/lib/supabase/client';
import { MatchStatus } from '@/types/tournament';
import { useAdBanner } from '@/lib/useAdBanner';
import { rtdb } from '@/lib/rtdb';
import { ref, onValue, off } from 'firebase/database';
import { Trophy, Star, Megaphone, Thermometer, Clock, Video, ExternalLink, ImageIcon, Play, Eye, Users, EyeOff, X, MessageSquare, ChevronUp, ChevronDown, Plus, Calendar } from 'lucide-react';
import { BouncingBall } from '@/components/BouncingBall';
import { useThreeFingerDragExit } from '@/lib/useThreeFingerDragExit';
import { visibleSetNumbersForScoreboard, scoreboardGridClassForSetCount } from '@/lib/displaySetColumns';
import { formatPlayerFichaName } from '@/lib/playerFichaName';
import { inferStbFromSetScoresOnly } from '@/lib/matchFinishedScoreDisplay';
import { resolveMatchTeamLines } from '@/lib/resolveMatchTeamLines';
import { PizarraWarmupOverlay, parseCalentamientoEndsAt } from '@/components/PizarraWarmupOverlay';
import { useCourtPlaylists } from '@/lib/useCourtPlaylists';

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

const isVideoSlotCandidate = (m: any) => {
    if (!m?.url) return false;
    const tipo = String(m?.tipo || '').toLowerCase();
    if (tipo === 'url_web') return true;
    return isVideoMedia(m);
};

const isImageSlotCandidate = (m: any) => {
    if (!m?.url) return false;
    const tipo = String(m?.tipo || '').toLowerCase();
    if (tipo === 'url_web') return false;
    return !isVideoMedia(m);
};

function VideoSlot({ ads }: { ads: any[] }) {
    const videoAd = React.useMemo(() => 
        ads.find(ad => ad.posicion_pantalla === 'izquierda_video'), 
    [ads]);

    if (!videoAd || !videoAd.media_content?.url) {
        return (
            <div className="w-full h-full bg-black/40 rounded-3xl border border-white/5 flex items-center justify-center p-8 overflow-hidden group">
                <Video className="w-12 h-12 text-white/10 group-hover:text-padel-primary/40 transition-colors duration-500" />
            </div>
        );
    }

    const { url } = videoAd.media_content;
    const isExternalStream = url.includes('youtube.com') || url.includes('youtu.be') || url.includes('twitch.tv') || url.includes('vimeo.com') || url.includes('stream') || url.includes('embed');

    return (
        <div className="w-full h-full bg-black/60 rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl group flex items-center justify-center">
            {isExternalStream ? (
                <iframe
                    src={(() => {
                        if (url.includes('youtube.com/watch?v=')) {
                            const videoId = url.split('v=')[1]?.split('&')[0];
                            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
                        }
                        if (url.includes('youtu.be/')) {
                            const videoId = url.split('youtu.be/')[1]?.split('?')[0];
                            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
                        }
                        return url;
                    })()}
                    className="w-full h-full border-0 absolute inset-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Live Stream"
                />
            ) : (
                <video
                    src={url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain absolute inset-0"
                />
            )}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live Content</span>
            </div>
        </div>
    );
}

function ImageCarousel({ ads }: { ads: any[] }) {
    const images = React.useMemo(() => 
        ads.filter(ad => ad.posicion_pantalla === 'derecha_imagen')
           .map(ad => ad.media_content?.url)
           .filter(Boolean),
    [ads]);

    const [index, setIndex] = React.useState(0);

    React.useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 7000);
        return () => clearInterval(interval);
    }, [images.length]);

    if (!images.length) {
        return (
            <div className="w-full h-full bg-black/40 rounded-3xl border border-white/5 flex items-center justify-center p-8 overflow-hidden group">
                <ImageIcon className="w-12 h-12 text-white/10 group-hover:text-padel-primary/40 transition-colors duration-500" />
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-black/60 rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl group">
            <AnimatePresence mode="wait">
                <motion.img
                    key={images[index]}
                    src={images[index]}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="w-full h-full object-contain absolute inset-0"
                />
            </AnimatePresence>
            
            {/* Carousel indicators */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {images.map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'w-6 bg-padel-primary shadow-[0_0_8px_rgba(var(--padel-primary-rgb),0.5)]' : 'w-1.5 bg-white/20'}`}
                        />
                    ))}
                </div>
            )}
            
            <div className="absolute top-4 right-4 z-20 bg-padel-primary/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-padel-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] font-bold text-padel-primary uppercase tracking-wider">Premium Sponsor</span>
            </div>
        </div>
    );
}

interface DisplayTemplate {
    id: string;
    name: string;
    header_vh: number;
    score_vh: number;
    media_vh: number;
    ticker_vh: number;
    split_ratio: number;
    clock_style: 'modern' | 'classic' | 'minimal';
    clock_color: string;
}

export default function FullScreenDisplay() {
    const routeParams = useParams<{ id: string; matchId: string }>();
    const id = String(routeParams?.id ?? '');
    const matchId = String(routeParams?.matchId ?? '');
    const searchParams = useSearchParams();
    const minimalParam = searchParams.get('minimal');
    const [minimalScreensMode, setMinimalScreensMode] = useState(minimalParam === '1' || minimalParam === 'true');
    const [tournament, setTournament] = useState<any>(null);
    const [match, setMatch] = useState<any>(null);
    const [matchNumberInTournament, setMatchNumberInTournament] = useState<number | null>(null);
    const [nextMatch, setNextMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<'score' | 'ad'>('score');
    const [currentAdIdx, setCurrentAdIdx] = useState(0);
    const [recentResults, setRecentResults] = useState<any[]>([]);
    const [temp, setTemp] = useState<number | null>(null);
    const [carouselImages, setCarouselImages] = useState<{ url: string; orden: number }[]>([]);
    const [carouselIdx, setCarouselIdx] = useState(0);
    const [carouselInterval, setCarouselInterval] = useState(8);
    const prevScore = useRef<string>('');
    const adBanner = useAdBanner();
    const [activeTemplate, setActiveTemplate] = useState<DisplayTemplate | null>(null);
    useEffect(() => {
        // Si el monitor cambia el modo vía query param, lo sincronizamos.
        setMinimalScreensMode(minimalParam === '1' || minimalParam === 'true');
    }, [minimalParam]);

    // ── Configuración de Layout Dinámico de la Plantilla ──
    useEffect(() => {
        const supabase = createClient();
        const courtNum = Number(match?.court ?? (match?.courtIndex != null ? (match.courtIndex as number) + 1 : 0));
        if (!courtNum) return;

        const fetchTemplate = async (templateId: string) => {
            const { data, error } = await supabase
                .from('display_templates')
                .select('*')
                .eq('id', templateId)
                .single();
            
            if (data && !error) {
                setActiveTemplate(data as DisplayTemplate);
            }
        };

        const initCanchaTemplate = async () => {
            // Buscamos la cancha por nombre o número para obtener el template actual
            const { data, error } = await supabase
                .from('canchas')
                .select('id, current_template_id')
                .or(`nombre.ilike.%Pista ${courtNum}%,nombre.ilike.%Cancha ${courtNum}%,nombre.ilike.%${courtNum}%`)
                .maybeSingle();
            
            if (data?.current_template_id) {
                fetchTemplate(data.current_template_id);
            }

            // Suscribirse a la cancha encontrada
            if (data?.id) {
                const canchaSub = supabase
                    .channel(`cancha-template-${data.id}`)
                    .on('postgres_changes', {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'canchas',
                        filter: `id=eq.${data.id}`
                    }, (payload) => {
                        if (payload.new.current_template_id) {
                            fetchTemplate(payload.new.current_template_id);
                        }
                    })
                    .subscribe();
                return () => canchaSub.unsubscribe();
            }
        };

        initCanchaTemplate();
    }, [match?.court, match?.courtIndex]);

    // Suscripción al template activo por si cambia sus valores internos
    useEffect(() => {
        if (!activeTemplate?.id) return;
        const supabase = createClient();
        const templateSub = supabase
            .channel(`template-data-${activeTemplate.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'display_templates',
                filter: `id=eq.${activeTemplate.id}`
            }, (payload) => {
                setActiveTemplate(payload.new as DisplayTemplate);
            })
            .subscribe();
        
        return () => { templateSub.unsubscribe(); };
    }, [activeTemplate?.id]);

    const layout = {
        header: activeTemplate?.header_vh ?? 10,
        score: activeTemplate?.score_vh ?? 23,
        media: activeTemplate?.media_vh ?? 59,
        ticker: activeTemplate?.ticker_vh ?? 8,
        split: activeTemplate?.split_ratio ?? 50
    };

    const SmartClock = () => {
        const style = activeTemplate?.clock_style ?? 'modern';
        const color = activeTemplate?.clock_color ?? '#ffffff';

        if (style === 'minimal') {
            return (
                <div className="flex flex-col items-end">
                    <span className="text-sm font-bold opacity-40 tracking-[0.5em] uppercase">Local Time</span>
                    <span style={{ color }} className="text-5xl font-light tracking-tighter tabular-nums drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                        <DisplayClockTime />
                    </span>
                </div>
            );
        }

        if (style === 'classic') {
            return (
                <div className="flex items-center gap-6 bg-black/60 px-8 py-4 rounded-[2rem] border border-white/10 shadow-2xl backdrop-blur-3xl">
                    <Clock className="w-8 h-8 text-white/30" />
                    <span style={{ color }} className="text-6xl font-mono tracking-widest font-black italic">
                        <DisplayClockTime />
                    </span>
                </div>
            );
        }

        // Default Modern
        return (
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-3 text-gray-500 font-black text-[15px] tracking-[0.3em] uppercase mb-2 italic">
                    <Calendar className="w-4 h-4" />
                    <DisplayClockDate />
                </div>
                <div style={{ color }} className="text-5xl lg:text-7xl font-black italic tabular-nums tracking-tighter leading-none drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]">
                    <DisplayClockTime />
                </div>
            </div>
        );
    };
    /** Tres dedos + arrastre vertical: salir al torneo (móvil / iPad, sin botón visible). */
    useThreeFingerDragExit(id ? `/tournaments/${id}` : null);

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

        return formatPlayerFichaName(trimmed);
    };

    // ── Marcador en vivo del RTDB (escrito por el marker en tiempo real) ─────
    const [liveMarcador, setLiveMarcador] = useState<any>(null);
    const [liveCalentamientoEndsAt, setLiveCalentamientoEndsAt] = useState<number | null>(null);
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

    // ── Controles de selección (vídeos / imágenes / tiras) ─────────────────
    const [mediaConfigOpen, setMediaConfigOpen] = useState(false);
    const [mediaConfigActiveTab, setMediaConfigActiveTab] = useState<'video' | 'image' | 'text'>('video');
    const [mediaSelectionMode, setMediaSelectionMode] = useState<'auto' | 'manual'>('auto');

    // Activo (lo que realmente se visualiza en modo manual)
    const [activeVideoSelectedUrls, setActiveVideoSelectedUrls] = useState<string[]>([]);
    const [activeImageSelectedUrls, setActiveImageSelectedUrls] = useState<string[]>([]);
    const [activeTickerKeys, setActiveTickerKeys] = useState<string[]>([]);

    // Draft (lo que el usuario marca en el modal antes de aplicar)
    const [draftVideoSelectedUrls, setDraftVideoSelectedUrls] = useState<string[]>([]);
    const [draftImageSelectedUrls, setDraftImageSelectedUrls] = useState<string[]>([]);
    const [draftTickerKeys, setDraftTickerKeys] = useState<string[]>([]);
    const [draftTouched, setDraftTouched] = useState(false);

    // Búsquedas mini para el modal
    const [videoSearch, setVideoSearch] = useState('');
    const [imageSearch, setImageSearch] = useState('');
    const [tickerSearch, setTickerSearch] = useState('');

    // Ticker desde RTDB
    const [tickerTexto, setTickerTexto] = useState('');
    const [tickerActivo, setTickerActivo] = useState(false);
    const [tickerVelocidad, setTickerVelocidad] = useState(30);

    // Ticker desde Supabase (Tira Informativa TV)
    const [supabaseTickerMessages, setSupabaseTickerMessages] = useState<any[]>([]);
    const courtNumForPlaylist = Number(match?.court ?? (match?.courtIndex != null ? (match.courtIndex as number) + 1 : 0));
    const canchaIdForPlaylist = courtNumForPlaylist > 0 ? `cancha_${courtNumForPlaylist}` : '';
    const venueForPlaylist = String(tournament?.complexName || match?.complexName || '').trim() || null;
    const courtPlaylists = useCourtPlaylists(canchaIdForPlaylist, venueForPlaylist);


    const videoOptionItems = useMemo(() => {
        const items: any[] = [];
        const seen = new Set<string>();
        const push = (m: any) => {
            const u = String(m?.url || '').trim();
            if (!u || seen.has(u)) return;
            if (!isVideoSlotCandidate(m)) return;
            seen.add(u);
            items.push(m);
        };
        if (hubMedia) push(hubMedia);
        for (const v of hubLibraryVids || []) push(v);
        return items;
    }, [hubMedia, hubLibraryVids]);

    const imageOptionItems = useMemo(() => {
        const items: any[] = [];
        const seen = new Set<string>();
        const push = (m: any) => {
            const u = String(m?.url || '').trim();
            if (!u || seen.has(u)) return;
            if (!isImageSlotCandidate(m)) return;
            seen.add(u);
            items.push(m);
        };
        if (hubCarousel) push(hubCarousel);
        for (const img of hubLibraryImgs || []) push(img);
        return items;
    }, [hubCarousel, hubLibraryImgs]);

    const tickerOptionItems = useMemo(() => {
        return (supabaseTickerMessages || []).map((m: any, idx: number) => {
            const id = String(m?.id ?? `idx_${idx}`);
            const text = String(m?.mensaje ?? m?.texto ?? '').trim();
            return { id, text, raw: m };
        }).filter((x) => x.text);
    }, [supabaseTickerMessages]);

    const videoUrlToItem = useMemo(() => {
        const map = new Map<string, any>();
        for (const it of videoOptionItems) {
            const u = String(it?.url || '').trim();
            if (u) map.set(u, it);
        }
        return map;
    }, [videoOptionItems]);

    const imageUrlToItem = useMemo(() => {
        const map = new Map<string, any>();
        for (const it of imageOptionItems) {
            const u = String(it?.url || '').trim();
            if (u) map.set(u, it);
        }
        return map;
    }, [imageOptionItems]);

    const manualVideoItems = useMemo(() => {
        return activeVideoSelectedUrls.map((u) => videoUrlToItem.get(u)).filter(Boolean) as any[];
    }, [activeVideoSelectedUrls, videoUrlToItem]);

    const manualImageItems = useMemo(() => {
        return activeImageSelectedUrls.map((u) => imageUrlToItem.get(u)).filter(Boolean) as any[];
    }, [activeImageSelectedUrls, imageUrlToItem]);

    const rotationVideoItems = mediaSelectionMode === 'manual' ? manualVideoItems : hubLibraryVids;
    const rotationImageItems = mediaSelectionMode === 'manual' ? manualImageItems : hubLibraryImgs;

    const tickerMessagesToRender = useMemo(() => {
        if (courtPlaylists.tickerMessages.length > 0) return courtPlaylists.tickerMessages;
        if (mediaSelectionMode !== 'manual') return supabaseTickerMessages || [];
        if (!activeTickerKeys.length) return [];
        const set = new Set(activeTickerKeys);
        return (supabaseTickerMessages || []).filter((m: any, idx: number) => {
            const id = String(m?.id ?? `idx_${idx}`);
            return set.has(id);
        });
    }, [mediaSelectionMode, activeTickerKeys, supabaseTickerMessages, courtPlaylists.tickerMessages]);

    useEffect(() => {
        if (draftTouched) return;
        const vids = videoOptionItems.map((m: any) => String(m?.url || '').trim()).filter(Boolean);
        const imgs = imageOptionItems.map((m: any) => String(m?.url || '').trim()).filter(Boolean);
        const tks = tickerOptionItems.map((t) => t.id);

        setDraftVideoSelectedUrls(vids);
        setDraftImageSelectedUrls(imgs);
        setDraftTickerKeys(tks);

        setActiveVideoSelectedUrls(vids);
        setActiveImageSelectedUrls(imgs);
        setActiveTickerKeys(tks);
    }, [draftTouched, videoOptionItems, imageOptionItems, tickerOptionItems]);

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
            setLiveCalentamientoEndsAt(parseCalentamientoEndsAt(data?.calentamiento));
        });

        // Polling de respaldo en caso de que Supabase Realtime no esté habilitado en el Dashboard
        const pollingInterval = setInterval(() => {
            dataService.getPizarraCanchaState(canchaId).then((state) => {
                const data = state?.data;
                applyPizarraRefreshNonce(data);
                const marcador = data?.marcador ?? null;
                setLiveCalentamientoEndsAt(parseCalentamientoEndsAt(data?.calentamiento));
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

    // Rotación del carrusel (VIDEOS - Izquierda)
    useEffect(() => {
        setHubLibraryVidIdx(0);
    }, [mediaSelectionMode, rotationVideoItems.map((x: any) => String(x?.url || '')).join('|')]);

    /** En modo manual no se configuran segundos en pantalla: avance por tiempo fijo solo como respaldo. */
    const MANUAL_VIDEO_ROTATION_FALLBACK_SEC = 45;

    useEffect(() => {
        if (rotationVideoItems.length <= 1) return;
        const durationMs =
            mediaSelectionMode === 'manual'
                ? MANUAL_VIDEO_ROTATION_FALLBACK_SEC * 1000
                : (rotationVideoItems[hubLibraryVidIdx % rotationVideoItems.length]?.duracion_segundos || 8) * 1000;

        const timeout = setTimeout(() => {
            setHubLibraryVidIdx((prev) => (prev + 1) % rotationVideoItems.length);
        }, durationMs);

        return () => clearTimeout(timeout);
    }, [rotationVideoItems, hubLibraryVidIdx, mediaSelectionMode]);

    // Rotación del carrusel (IMÁGENES - Derecha)
    useEffect(() => {
        setHubLibraryImgIdx(0);
    }, [mediaSelectionMode, rotationImageItems.map((x: any) => String(x?.url || '')).join('|')]);

    useEffect(() => {
        if (rotationImageItems.length <= 1) return;
        const currentItem = rotationImageItems[hubLibraryImgIdx % rotationImageItems.length];
        const duration = (currentItem?.duracion_segundos || 10) * 1000;

        const timeout = setTimeout(() => {
            setHubLibraryImgIdx(prev => (prev + 1) % rotationImageItems.length);
        }, duration);

        return () => clearTimeout(timeout);
    }, [rotationImageItems, hubLibraryImgIdx]);

    // Settings
    const isFinal = match?.roundName?.toLowerCase().includes('final') || match?.roundName?.toLowerCase().includes('definición');
    const primaryColor = isFinal ? '#FFD700' : (tournament?.broadcastingSettings?.primaryColor || '#ccff00');
    const adMedia = tournament?.broadcastingSettings?.adMediaUrls || [];
    const adFreq = tournament?.broadcastingSettings?.adFrequencySeconds || 60;
    const adDur = tournament?.broadcastingSettings?.adDurationSeconds || 10;
    const funEnabled = tournament?.broadcastingSettings?.funAnimationsEnabled !== false;
    const showLive = tournament?.broadcastingSettings?.showLiveIndicator !== false;
    const venueName = tournament?.broadcastingSettings?.venueName || '';

    const renderHubMediaMotion = (m: any) => {
        if (!m?.url) return null;
        if (m.tipo === 'url_web') {
            return (
                <motion.iframe
                    key={m.url}
                    src={m.url}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full border-none pointer-events-none"
                    loading="lazy"
                />
            );
        }
        if (isVideoMedia(m)) {
            return (
                <motion.video
                    key={m.url}
                    src={m.url}
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
        }
        return (
            <motion.img
                key={m.url}
                src={m.url}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full object-contain p-4"
            />
        );
    };

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

    const openMediaConfigTab = (tab: 'video' | 'image' | 'text') => {
        setDraftVideoSelectedUrls(activeVideoSelectedUrls);
        setDraftImageSelectedUrls(activeImageSelectedUrls);
        setDraftTickerKeys(activeTickerKeys);
        setDraftTouched(true);
        setMediaConfigActiveTab(tab);
        setMediaConfigOpen(true);
    };

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

    /** Tercera columna: TB tiene prioridad; si no, STB (incl. inferencia por setScores 1-1 + desempate). */
    const scoreboardCol3Tb =
        match?.matchFormat === 'TIEBREAK' ||
        match?.tiebreak === true ||
        lm?.modo_puntos === 'tiebreak';
    const scoreboardCol3Stb =
        !scoreboardCol3Tb &&
        (match?.matchFormat === 'SUPER_TIEBREAK' ||
            match?.superTiebreak === true ||
            match?.matchFormat === 'SET_3_STB' ||
            twoSetsPlusStbFmt ||
            lm?.super_tiebreak === true ||
            inferStbFromSetScoresOnly(match));

    const setColumnLabel = (setNum: number) => {
        if (setNum === 3 && scoreboardCol3Tb) return 'TB';
        if (setNum === 3 && scoreboardCol3Stb) return 'STB';
        return `SET ${setNum}`;
    };

    // Set boxes helper (alineado con columnas visibles de la pizarra principal)
    const SetBoxes = ({ team }: { team: 1 | 2 }) => (
        <div className="flex items-center gap-[1vw]">
            {visibleSetColsFinal.map(setNum => {
                const isPast = setNum < currentSet;
                const isCurrent = setNum === currentSet;
                const pastVal = match.games_sets?.[setNum - 1]?.[`t${team}`] ?? match.setScores?.[setNum - 1]?.[`t${team}`];
                const stbFallback =
                    setNum === 3 && scoreboardCol3Stb && pastVal == null && match.superTiebreakScore
                        ? match.superTiebreakScore[`t${team}` as 't1' | 't2']
                        : undefined;
                const pastValResolved = stbFallback != null ? stbFallback : pastVal;
                const currentVal = match.games?.[`t${team}`] ?? '';
                const val = isPast ? (pastValResolved ?? 0) : isCurrent ? currentVal : '-';
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
                        <span className="font-black uppercase text-gray-500 tracking-widest leading-tight text-center px-0.5" style={{ fontSize: 'clamp(8px,0.85vw,14px)', marginBottom: '2px' }}>
                            {setColumnLabel(setNum)}
                        </span>
                        {setNum === 3 && scoreboardCol3Stb && (
                            <span className="font-black uppercase text-gray-600 tracking-tighter" style={{ fontSize: 'clamp(6px,0.65vw,10px)', marginBottom: '1px' }}>
                                (a 10)
                            </span>
                        )}
                        <motion.span
                            key={isCurrent ? match.games?.[`t${team}`] : (pastValResolved ?? setNum)}
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
                        className="relative z-10 flex h-full w-full flex-col"
                    >
                        <PizarraWarmupOverlay endsAt={liveCalentamientoEndsAt} layout="fullscreen" />
                        {/* ══════════════ HEADER BAR (10%) ══════════════ */}
                        <div
                            className="flex items-center justify-between flex-shrink-0 border border-white/10 bg-black/50 backdrop-blur-2xl px-12"
                            style={{
                                height: `${layout.header}vh`,
                                borderRadius: '0 0 clamp(10px,1.4vw,22px) clamp(10px,1.4vw,22px)',
                            }}
                        >
                            {/* Left: Tournament & Match Info */}
                            <div className="flex items-center gap-10 h-full py-2">
                                <div className="flex flex-col items-stretch gap-2 pr-8 border-r border-white/15">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 px-1 italic leading-none">Control</span>
                                    <button
                                        type="button"
                                        onClick={() => setMinimalScreensMode((v) => !v)}
                                        className={`px-5 py-3 rounded-2xl border transition-all duration-300 ${minimalScreensMode ? 'bg-padel-primary/20 border-padel-primary/50 shadow-[0_0_20px_rgba(204,255,0,0.15)]' : 'bg-black/60 border-white/10 hover:bg-white/10 hover:border-white/20'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <EyeOff className={`w-6 h-6 ${minimalScreensMode ? 'text-padel-primary' : 'text-white/40'}`} />
                                            <span className="text-[12px] font-black uppercase tracking-[0.2em] text-white/80">{minimalScreensMode ? 'Mostrar' : 'Ocultar'}</span>
                                        </div>
                                    </button>
                                </div>
                                {tournament?.logo && (
                                    <div className="h-[7.5vh] aspect-square bg-white/10 rounded-2xl p-2.5 border border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-3xl">
                                        <img src={tournament.logo} className="w-full h-full object-contain" />
                                    </div>
                                )}
                                <div className="flex flex-col items-start justify-center gap-2 ml-2">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 bg-padel-primary/15 px-4 py-1.5 rounded-full border border-padel-primary/40">
                                            <div className="w-2.5 h-2.5 rounded-full bg-padel-primary animate-pulse shadow-[0_0_8px_#ccff00]" />
                                            <span className="text-[14px] font-black tracking-[0.4em] uppercase text-padel-primary italic">LIVE</span>
                                        </div>
                                        <span className="text-white/50 font-black italic uppercase tracking-[0.3em] text-sm">
                                            {match.roundName || 'Partido en Directo'}
                                        </span>
                                    </div>
                                    <h1 className="leading-none font-black italic uppercase text-white tracking-tighter"
                                        style={{ fontSize: 'clamp(32px,5.5vh,110px)' }}>
                                        {match.courtName ?? (match.court != null ? `Pista ${match.court}` : 'Pista Central')}
                                    </h1>
                                </div>
                            </div>

                            {/* Center: Match Control (Timer/Clock) - ENHANCED VISIBILITY */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-black/40 backdrop-blur-2xl px-12 py-3 rounded-full border border-white/10 shadow-3xl">
                                <MatchDurationCounter
                                    matchStatus={match?.status}
                                    startTimeMs={markerDurationStartMs}
                                    endTimeMs={markerDurationEndMs}
                                    cronData={lm?.cronometro}
                                    primaryColor={primaryColor}
                                    cronometroTipo={cronometroTipo}
                                />
                            </div>

                            {/* Right: Premium Clock & Tournament Info */}
                            <div className="flex items-center gap-10 h-full">
                                <div className="hidden lg:flex flex-col items-end border-r border-white/15 pr-10">
                                    <div className="flex items-center gap-3 font-black italic uppercase tracking-widest text-[#ccff00]" 
                                        style={{ fontSize: 'clamp(18px,2.4vh,42px)' }}>
                                        {formatCategory(tournament?.category || 'General')}
                                    </div>
                                    <div className="text-white/40 font-bold uppercase tracking-[0.3em] italic mt-1.5" 
                                        style={{ fontSize: 'clamp(12px,1.2vh,20px)' }}>
                                        {tournament?.nombre || 'Torneo Oficial'}
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 bg-white/5 backdrop-blur-3xl px-10 py-5 rounded-[2.5rem] border border-white/15 shadow-3xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-padel-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10">
                                        <SmartClock />
                                    </div>
                                    {temp !== null && (
                                        <div className="flex flex-col items-center pl-8 border-l border-white/15 gap-1.5 relative z-10">
                                            <Thermometer className="w-5 h-5 text-padel-primary animate-pulse" />
                                            <span className="text-2xl font-black italic tracking-tighter text-padel-primary">{temp}°C</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ══════════════ MARCADOR / PIZARRA (GRANDE) ══════════════ */}
                        <div
                            className="flex-shrink-0 border border-white/10 bg-black/60 overflow-hidden flex flex-col relative shadow-2xl"
                            style={{ height: `${layout.score}vh`, borderRadius: 'clamp(12px,1.6vw,26px)' }}
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
                                const setCols = visibleSetColsFinal;
                                const grid = scoreboardGridClass;
                                return (
                                    <>
                                        <div className={`grid ${grid} items-center border-b border-white/[0.1] bg-black/40 px-6`} style={{ height: '14%' }}>
                                            <div />
                                            {setCols.map(s => {
                                                const isStbCol = s === 3 && scoreboardCol3Stb;
                                                const isTbCol = s === 3 && scoreboardCol3Tb;
                                                const setLabel = setColumnLabel(s);

                                                let sc: any = match.setScores?.[s - 1] ?? match.games_sets?.[s - 1] ?? null;
                                                if (isStbCol && !sc && match.superTiebreakScore) {
                                                    sc = match.superTiebreakScore;
                                                }
                                                if (isStbCol && !sc && match.setScores?.[2]) {
                                                    const third = match.setScores[2];
                                                    const t1 = Number(third?.t1 ?? third?.local);
                                                    const t2 = Number(third?.t2 ?? third?.visitante);
                                                    if (Number.isFinite(t1) && Number.isFinite(t2) && (t1 > 0 || t2 > 0)) {
                                                        sc = third;
                                                    }
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
                                                                color: (isStbCol || isTbCol) ? 'rgba(204,255,0,0.55)' : 'rgba(255,255,255,0.4)'
                                                            }}
                                                        >
                                                            {setLabel}
                                                        </span>
                                                        {isStbCol && (
                                                            <span
                                                                className="font-black uppercase tracking-widest text-center w-full opacity-70"
                                                                style={{ fontSize: 'clamp(7px,0.75vw,12px)', color: 'rgba(204,255,0,0.45)' }}
                                                            >
                                                                (a 10)
                                                            </span>
                                                        )}
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
                                                    <div className="font-black italic uppercase tracking-tighter text-white truncate drop-shadow-xl z-0 pl-4 pr-12 flex items-center" style={{ fontSize: 'clamp(20px,3.2vh,48px)', lineHeight: 1.0 }}>
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
                                                    const hist = lm?.historico_sets?.[s - 1];
                                                    const gs = match.games_sets?.[s - 1];
                                                    const ss = match.setScores?.[s - 1];
                                                    const stbSc = match.superTiebreakScore;
                                                    if (s === 3 && scoreboardCol3Stb) {
                                                        val =
                                                            hist?.local ??
                                                            gs?.t1 ??
                                                            ss?.t1 ??
                                                            (stbSc?.t1 != null ? stbSc.t1 : undefined) ??
                                                            0;
                                                    } else {
                                                        val = hist?.local ?? gs?.t1 ?? ss?.t1 ?? 0;
                                                    }
                                                } else if (s === currentSet) {
                                                    val = gamesT1;
                                                }
                                                return (
                                                    <div key={s} className="flex items-center justify-center border-l border-white/[0.1] h-full">
                                                        <span className="font-black italic text-white tabular-nums text-center block w-full" style={{ fontSize: 'clamp(32px,5.5vh,75px)', fontVariantNumeric: 'tabular-nums' }}>{val !== '' ? val : '-'}</span>
                                                    </div>
                                                );
                                            })}
                                            <div className="flex items-center justify-center border-l border-white/[0.2] h-full" style={{ backgroundColor: `${primaryColor}40` }}>
                                                <motion.span key={ptsT1} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                                    className="font-black italic text-[#ccff00] drop-shadow-[0_0_15px_#ccff0060] tabular-nums text-center block w-full"
                                                    style={{ fontSize: 'clamp(38px,6.5vh,100px)', fontVariantNumeric: 'tabular-nums' }}>{ptsT1}</motion.span>
                                            </div>
                                        </div>

                                        {/* Team 2 row */}
                                        <div className={`flex-1 grid ${grid} items-center relative overflow-hidden px-6`}>
                                            <div className="flex flex-col justify-center h-full pr-6 relative">
                                                <div className="relative flex items-center w-full h-[75%] bg-gradient-to-r from-white/[0.08] to-transparent rounded-xl border border-white/[0.1] backdrop-blur-md px-4 overflow-hidden">
                                                    <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
                                                    <div className="font-black italic uppercase tracking-tighter text-white truncate drop-shadow-xl z-0 pl-4 pr-12 flex items-center" style={{ fontSize: 'clamp(20px,3.2vh,48px)', lineHeight: 1.0 }}>
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
                                                    const hist = lm?.historico_sets?.[s - 1];
                                                    const gs = match.games_sets?.[s - 1];
                                                    const ss = match.setScores?.[s - 1];
                                                    const stbSc = match.superTiebreakScore;
                                                    if (s === 3 && scoreboardCol3Stb) {
                                                        val =
                                                            hist?.visitante ??
                                                            gs?.t2 ??
                                                            ss?.t2 ??
                                                            (stbSc?.t2 != null ? stbSc.t2 : undefined) ??
                                                            0;
                                                    } else {
                                                        val = hist?.visitante ?? gs?.t2 ?? ss?.t2 ?? 0;
                                                    }
                                                } else if (s === currentSet) {
                                                    val = gamesT2;
                                                }
                                                return (
                                                    <div key={s} className="flex items-center justify-center border-l border-white/[0.1] h-full">
                                                        <span className="font-black italic text-white tabular-nums text-center block w-full" style={{ fontSize: 'clamp(32px,5.5vh,75px)', fontVariantNumeric: 'tabular-nums' }}>{val !== '' ? val : '-'}</span>
                                                    </div>
                                                );
                                            })}
                                            <div className="flex items-center justify-center border-l border-white/[0.2] h-full" style={{ backgroundColor: `${primaryColor}40` }}>
                                                <motion.span key={ptsT2} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                                    className="font-black italic text-[#ccff00] drop-shadow-[0_0_15px_#ccff0060] tabular-nums text-center block w-full"
                                                    style={{ fontSize: 'clamp(38px,6.5vh,100px)', fontVariantNumeric: 'tabular-nums' }}>{ptsT2}</motion.span>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        {/* ══════════════ PUBLICIDAD MINI (SPLIT-SCREEN VIDEO + IMAGEN) ══════════════ */}
                        {!minimalScreensMode && (
                            <div
                                className="flex-shrink-0 grid gap-6 p-6"
                                style={{ 
                                    height: `${layout.media}vh`,
                                    gridTemplateColumns: `${layout.split}% 1fr`
                                }}
                            >
                                <VideoSlot ads={courtPlaylists.rows.filter((ad: any) => ad.posicion === 'izquierda_video' || !ad.posicion)} />
                                <ImageCarousel ads={courtPlaylists.rows.filter((ad: any) => ad.posicion === 'derecha_imagen')} />
                            </div>
                        )}

                        {/* ══════════════ FOOTER BAR (10%) ══════════════ */}
                        {tickerMessagesToRender.length > 0 && (
                            <div
                                className="flex-shrink-0 overflow-hidden border-t border-white/10 bg-black/40 backdrop-blur-md relative flex items-center mb-[0.3vh]"
                                style={{
                                    height: `${layout.ticker}vh`,
                                    borderRadius: 'clamp(10px,1.2vw,18px) clamp(10px,1.2vw,18px) 0 0',
                                }}
                            >
                                <div className="w-full overflow-hidden relative py-2">
                                    <div className="flex whitespace-nowrap animate-marquee">
                                        {tickerMessagesToRender.map((msg: any, idx: number) => (
                                            <div key={idx} className="flex items-center px-12">
                                                <Star className="w-5 h-5 text-padel-primary mr-4 fill-padel-primary/20" />
                                                <span className="text-3xl font-black italic uppercase tracking-widest text-white">
                                                    {msg.mensaje || msg.texto}
                                                </span>
                                                <Star className="w-5 h-5 text-padel-primary ml-16 fill-padel-primary/20" />
                                            </div>
                                        ))}
                                        {/* Duplicate for infinite scroll */}
                                        {tickerMessagesToRender.map((msg: any, idx: number) => (
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
                        )}

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

            {mediaConfigOpen && (
                <div className="fixed inset-0 z-[6000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40">Publicidad en pizarra</p>
                                <p className="text-sm font-black uppercase italic tracking-tight text-white">Configurar playlist</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMediaConfigOpen(false)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
                                title="Cerrar"
                            >
                                <X className="w-4 h-4 text-white/70" />
                            </button>
                        </div>

                        <div className="px-5 py-3 border-b border-white/10 flex flex-wrap items-center gap-3">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/70">
                                <input
                                    type="checkbox"
                                    checked={mediaSelectionMode === 'manual'}
                                    onChange={(e) => setMediaSelectionMode(e.target.checked ? 'manual' : 'auto')}
                                />
                                Modo selección manual
                            </label>
                            <span className="text-[10px] text-white/35">
                                (En automático se usa la configuración del hub / pantallas).
                            </span>
                        </div>

                        <div className="px-5 pt-4 pb-2 grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setMediaConfigActiveTab('video')}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-colors ${mediaConfigActiveTab === 'video' ? 'bg-padel-primary/15 border-padel-primary/50 text-padel-primary' : 'bg-black/30 border-white/10 text-white/60 hover:bg-white/5'}`}
                            >
                                <Video className="w-4 h-4" />
                                Video
                            </button>
                            <button
                                type="button"
                                onClick={() => setMediaConfigActiveTab('image')}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-colors ${mediaConfigActiveTab === 'image' ? 'bg-padel-primary/15 border-padel-primary/50 text-padel-primary' : 'bg-black/30 border-white/10 text-white/60 hover:bg-white/5'}`}
                            >
                                <ImageIcon className="w-4 h-4" />
                                Imagen
                            </button>
                            <button
                                type="button"
                                onClick={() => setMediaConfigActiveTab('text')}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-colors ${mediaConfigActiveTab === 'text' ? 'bg-padel-primary/15 border-padel-primary/50 text-padel-primary' : 'bg-black/30 border-white/10 text-white/60 hover:bg-white/5'}`}
                            >
                                <MessageSquare className="w-4 h-4" />
                                Texto
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 py-4">
                            {mediaConfigActiveTab === 'video' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0">
                                {/* Izquierda: biblioteca */}
                                <div className="rounded-2xl border border-white/10 bg-black/30 p-3 flex flex-col min-h-0">
                                    <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Biblioteca</p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                className="text-[9px] font-black uppercase text-white/40 hover:text-white"
                                                onClick={() => {
                                                    setDraftTouched(true);
                                                    setDraftVideoSelectedUrls(videoOptionItems.map((m: any) => String(m.url)));
                                                }}
                                            >
                                                Todos
                                            </button>
                                            <button
                                                type="button"
                                                className="text-[9px] font-black uppercase text-white/40 hover:text-white"
                                                onClick={() => {
                                                    setDraftTouched(true);
                                                    setDraftVideoSelectedUrls([]);
                                                }}
                                            >
                                                Ninguno
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        value={videoSearch}
                                        onChange={(e) => setVideoSearch(e.target.value)}
                                        placeholder="Buscar en biblioteca…"
                                        className="w-full mb-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/90 outline-none focus:border-white/25 shrink-0"
                                    />
                                    <div className="max-h-[42vh] overflow-y-auto space-y-2 pr-1 flex-1">
                                        {videoOptionItems
                                            .filter((m: any) => {
                                                const q = videoSearch.trim().toLowerCase();
                                                if (!q) return true;
                                                const label = String(m?.nombre_sponsor || m?.nombre || m?.url || '').toLowerCase();
                                                return label.includes(q);
                                            })
                                            .map((m: any) => {
                                                const u = String(m.url);
                                                const inList = draftVideoSelectedUrls.includes(u);
                                                return (
                                                    <div
                                                        key={u}
                                                        className="flex items-start justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2"
                                                    >
                                                        <span className="text-[11px] font-bold text-white/85 leading-snug min-w-0">
                                                            {m.nombre_sponsor || m.nombre || 'Video'}
                                                            <span className="block text-[9px] font-mono text-white/35 break-all">{u}</span>
                                                        </span>
                                                        {inList ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setDraftTouched(true);
                                                                    setDraftVideoSelectedUrls((prev) => prev.filter((x) => x !== u));
                                                                }}
                                                                className="shrink-0 text-[9px] font-black uppercase text-red-300/90 hover:text-red-200 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20"
                                                            >
                                                                Quitar
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setDraftTouched(true);
                                                                    setDraftVideoSelectedUrls((prev) =>
                                                                        prev.includes(u) ? prev : [...prev, u],
                                                                    );
                                                                }}
                                                                className="shrink-0 flex items-center gap-1 text-[9px] font-black uppercase text-padel-primary px-2 py-1 rounded-lg bg-padel-primary/10 border border-padel-primary/30 hover:bg-padel-primary/20"
                                                            >
                                                                <Plus className="w-3 h-3" /> Añadir
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        {videoOptionItems.length === 0 && (
                                            <p className="text-[10px] text-white/35">No hay videos en la biblioteca.</p>
                                        )}
                                    </div>
                                </div>
                                {/* Derecha: orden en pizarra */}
                                <div className="rounded-2xl border border-padel-primary/20 bg-black/35 p-3 flex flex-col min-h-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-padel-primary/90 mb-1 shrink-0">
                                        Orden en la pizarra
                                    </p>
                                    <p className="text-[9px] text-white/40 mb-2 leading-snug shrink-0">
                                        Usa las flechas para el orden de reproducción. El avance entre clips es automático; si uno no termina solo, la pizarra pasa al siguiente tras un tiempo interno de seguridad.
                                    </p>
                                    <div className="max-h-[42vh] overflow-y-auto space-y-2 pr-1 flex-1">
                                        {draftVideoSelectedUrls.length === 0 ? (
                                            <p className="text-[10px] text-white/35 py-4 text-center">
                                                Añade videos desde la biblioteca.
                                            </p>
                                        ) : (
                                            draftVideoSelectedUrls.map((u, idx) => {
                                                const m = videoUrlToItem.get(u);
                                                const label = m?.nombre_sponsor || m?.nombre || 'Video';
                                                return (
                                                    <div
                                                        key={u}
                                                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-2 py-2"
                                                    >
                                                        <span className="text-[10px] font-black text-white/50 w-5 shrink-0 tabular-nums">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-white/90 leading-snug flex-1 min-w-0 truncate">
                                                            {label}
                                                        </span>
                                                        <div className="flex flex-col gap-0.5 shrink-0">
                                                            <button
                                                                type="button"
                                                                disabled={idx === 0}
                                                                onClick={() => {
                                                                    if (idx === 0) return;
                                                                    setDraftTouched(true);
                                                                    setDraftVideoSelectedUrls((prev) => {
                                                                        const next = [...prev];
                                                                        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                                                                        return next;
                                                                    });
                                                                }}
                                                                className="p-1 rounded-md border border-white/10 bg-black/40 text-white/70 hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none"
                                                                title="Subir"
                                                            >
                                                                <ChevronUp className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={idx >= draftVideoSelectedUrls.length - 1}
                                                                onClick={() => {
                                                                    if (idx >= draftVideoSelectedUrls.length - 1) return;
                                                                    setDraftTouched(true);
                                                                    setDraftVideoSelectedUrls((prev) => {
                                                                        const next = [...prev];
                                                                        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                                                                        return next;
                                                                    });
                                                                }}
                                                                className="p-1 rounded-md border border-white/10 bg-black/40 text-white/70 hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none"
                                                                title="Bajar"
                                                            >
                                                                <ChevronDown className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setDraftTouched(true);
                                                                setDraftVideoSelectedUrls((prev) => prev.filter((x) => x !== u));
                                                            }}
                                                            className="shrink-0 p-1.5 rounded-lg text-white/50 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                                                            title="Quitar de la lista"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                            )}

                            {mediaConfigActiveTab === 'image' && (
                            <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Imágenes</p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            className="text-[9px] font-black uppercase text-white/40 hover:text-white"
                                            onClick={() => setDraftImageSelectedUrls(imageOptionItems.map((m: any) => String(m.url)))}
                                        >
                                            Todas
                                        </button>
                                        <button
                                            type="button"
                                            className="text-[9px] font-black uppercase text-white/40 hover:text-white"
                                            onClick={() => setDraftImageSelectedUrls([])}
                                        >
                                            Ninguna
                                        </button>
                                    </div>
                                </div>
                                <input
                                    value={imageSearch}
                                    onChange={(e) => setImageSearch(e.target.value)}
                                    placeholder="Buscar…"
                                    className="w-full mb-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/90 outline-none focus:border-white/25"
                                />
                                <div className="max-h-[42vh] overflow-y-auto space-y-2 pr-1">
                                    {imageOptionItems
                                        .filter((m: any) => {
                                            const q = imageSearch.trim().toLowerCase();
                                            if (!q) return true;
                                            const label = String(m?.nombre_sponsor || m?.nombre || m?.url || '').toLowerCase();
                                            return label.includes(q);
                                        })
                                        .map((m: any) => {
                                            const u = String(m.url);
                                            const checked = draftImageSelectedUrls.includes(u);
                                            return (
                                                <label key={u} className="flex items-start gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 hover:bg-white/5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={(e) => {
                                                            setDraftTouched(true);
                                                            setDraftImageSelectedUrls((prev) => {
                                                                const next = new Set(prev);
                                                                if (e.target.checked) next.add(u);
                                                                else next.delete(u);
                                                                return Array.from(next);
                                                            });
                                                        }}
                                                        className="mt-1"
                                                    />
                                                    <span className="text-[11px] font-bold text-white/85 leading-snug">
                                                        {m.nombre_sponsor || m.nombre || 'Imagen'}
                                                        <span className="block text-[9px] font-mono text-white/35 break-all">{u}</span>
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    {imageOptionItems.length === 0 && (
                                        <p className="text-[10px] text-white/35">No hay imágenes disponibles en la biblioteca.</p>
                                    )}
                                </div>
                            </div>
                            )}

                            {mediaConfigActiveTab === 'text' && (
                            <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Tira informativa</p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            className="text-[9px] font-black uppercase text-white/40 hover:text-white"
                                            onClick={() => setDraftTickerKeys(tickerOptionItems.map((t) => t.id))}
                                        >
                                            Todas
                                        </button>
                                        <button
                                            type="button"
                                            className="text-[9px] font-black uppercase text-white/40 hover:text-white"
                                            onClick={() => setDraftTickerKeys([])}
                                        >
                                            Ninguna
                                        </button>
                                    </div>
                                </div>
                                <input
                                    value={tickerSearch}
                                    onChange={(e) => setTickerSearch(e.target.value)}
                                    placeholder="Buscar…"
                                    className="w-full mb-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/90 outline-none focus:border-white/25"
                                />
                                <div className="max-h-[42vh] overflow-y-auto space-y-2 pr-1">
                                    {tickerOptionItems
                                        .filter((t) => {
                                            const q = tickerSearch.trim().toLowerCase();
                                            if (!q) return true;
                                            return t.text.toLowerCase().includes(q);
                                        })
                                        .map((t) => {
                                            const checked = draftTickerKeys.includes(t.id);
                                            return (
                                                <label key={t.id} className="flex items-start gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 hover:bg-white/5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={(e) => {
                                                            setDraftTouched(true);
                                                            setDraftTickerKeys((prev) => {
                                                                const next = new Set(prev);
                                                                if (e.target.checked) next.add(t.id);
                                                                else next.delete(t.id);
                                                                return Array.from(next);
                                                            });
                                                        }}
                                                        className="mt-1"
                                                    />
                                                    <span className="text-[11px] font-bold text-white/85 leading-snug">
                                                        {t.text}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    {tickerOptionItems.length === 0 && (
                                        <p className="text-[10px] text-white/35">No hay mensajes de tira disponibles.</p>
                                    )}
                                </div>
                            </div>
                            )}
                        </div>

                        <div className="px-5 py-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setMinimalScreensMode(true);
                                    setMediaConfigOpen(false);
                                }}
                                className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/15"
                            >
                                Apagar todo (solo marcador)
                            </button>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDraftVideoSelectedUrls(activeVideoSelectedUrls);
                                        setDraftImageSelectedUrls(activeImageSelectedUrls);
                                        setDraftTickerKeys(activeTickerKeys);
                                        setMediaConfigOpen(false);
                                    }}
                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-[10px] font-black uppercase tracking-widest hover:bg-white/10"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveVideoSelectedUrls(draftVideoSelectedUrls);
                                        setActiveImageSelectedUrls(draftImageSelectedUrls);
                                        setActiveTickerKeys(draftTickerKeys);
                                        setMediaSelectionMode('manual');
                                        setDraftTouched(true);
                                        setMediaConfigOpen(false);
                                    }}
                                    className="px-4 py-2 rounded-xl bg-padel-primary text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110"
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
