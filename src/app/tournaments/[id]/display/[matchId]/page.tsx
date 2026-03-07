'use client';

import { useState, useEffect, use, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { rtdb } from '@/lib/rtdb';
import { dataService } from '@/lib/dataService';
import { db } from '@/lib/firebase';
import { createClient } from '@/lib/supabase/client';
import { ref, onValue, off } from 'firebase/database';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { MatchStatus } from '@/types/tournament';
import { useAdBanner } from '@/lib/useAdBanner';
import { Trophy, Star, Megaphone, Thermometer, Clock, Video, ExternalLink, Layers, ImageIcon, Play, Eye } from 'lucide-react';

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

// ── Cronómetro de partido: actualización cada segundo solo aquí (evita parpadeo de la pizarra) ──
function MatchDurationCounter({
    isLive,
    startTimeMs,
    primaryColor,
    cronometroTipo,
    showInPill,
}: {
    isLive: boolean;
    startTimeMs: number | null;
    primaryColor: string;
    cronometroTipo: string;
    showInPill?: boolean;
}) {
    const [duration, setDuration] = useState('');
    useEffect(() => {
        if (!isLive || startTimeMs == null) {
            setDuration('');
            return;
        }
        const update = () => {
            const elapsedSec = Math.max(0, Math.floor((Date.now() - startTimeMs) / 1000));
            const h = Math.floor(elapsedSec / 3600);
            const m = Math.floor((elapsedSec % 3600) / 60);
            const s = elapsedSec % 60;
            setDuration(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [isLive, startTimeMs]);
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
    return (
        <>
            <span className="font-bold uppercase text-white/50 tracking-[0.35em] leading-none" style={{ fontSize: 'clamp(6px,0.7vw,11px)' }}>Tiempo de juego</span>
            <span className="font-black italic tracking-tighter leading-none mt-0.5 tabular-nums" style={{ fontSize: 'clamp(24px,3.2vw,56px)', color: primaryColor }}>{duration}</span>
        </>
    );
}

export default function FullScreenDisplay({ params }: { params: Promise<{ id: string, matchId: string }> }) {
    const { id, matchId } = use(params);
    const [tournament, setTournament] = useState<any>(null);
    const [match, setMatch] = useState<any>(null);
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

    // ── Marcador en vivo del RTDB (escrito por el marker en tiempo real) ─────
    const [liveMarcador, setLiveMarcador] = useState<any>(null);
    const [sponsorIdx, setSponsorIdx] = useState(0);
    const [sponsorCarousel, setSponsorCarousel] = useState<any[]>([]);
    const [sponsorCarouselIdx, setSponsorCarouselIdx] = useState(0);
    const [hubMedia, setHubMedia] = useState<any>(null);
    const [hubCarousel, setHubCarousel] = useState<any>(null);
    const [hubLibraryImages, setHubLibraryImages] = useState<any[]>([]);
    const [hubLibraryIdx, setHubLibraryIdx] = useState(0);

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

    // Estilo del reloj y del cronómetro
    const [relojOcasion, setRelojOcasion] = useState<string>('default');
    const [cronometroTipo, setCronometroTipo] = useState<string>('default');
    const [animacionActual, setAnimacionActual] = useState<{ id: string; ts: number; url?: string } | null>(null);
    const [animacionesMarcador, setAnimacionesMarcador] = useState<Record<string, { nombre: string; url: string }>>({});

    useEffect(() => {
        if (!rtdb) return;
        const refs = [
            { path: 'publicidad_master/reloj_ocasion', setter: setRelojOcasion },
            { path: 'publicidad_master/cronometro_tipo', setter: setCronometroTipo },
        ];
        const unsubscribers = refs.map(r => {
            const node = ref(rtdb!, r.path);
            const h = (s: any) => r.setter(s.val() || 'default');
            onValue(node, h);
            return () => off(node, 'value', h);
        });
        const animNode = ref(rtdb, 'publicidad_master/animaciones_marcador');
        const animH = (s: any) => setAnimacionesMarcador(s.val() || {});
        onValue(animNode, animH);

        const tickerNode = ref(rtdb, 'publicidad_master/ticker');
        const tickerH = (s: any) => {
            const v = s.val();
            if (v) { setTickerActivo(v.activo ?? false); setTickerTexto(v.texto ?? ''); setTickerVelocidad(v.velocidad_seg ?? 30); }
        };
        onValue(tickerNode, tickerH);

        return () => {
            unsubscribers.forEach(u => u());
            off(animNode, 'value', animH);
            off(tickerNode, 'value', tickerH);
        };
    }, []);

    // 5. Obtener TODA la biblioteca de imágenes activa para el carrusel automático
    const fetchAllImages = async (sb: any) => {
        const { data } = await sb
            .from('media_content')
            .select('*')
            .eq('tipo', 'imagen')
            .eq('activa', true)
            .order('created_at', { ascending: false });
        if (data) setHubLibraryImages(data);
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
                        videoKey = `${screenId}_video`;
                        carouselKey = `${screenId}_carousel`;
                        screenFound = true;
                    }
                }

                if (!screenFound) {
                    // If no specific screen is found, reset hub selections but keep hubLibraryImages
                    setHubMedia(null);
                    setHubCarousel(null);
                    return;
                }

                // 2. Obtener lo que debe proyectar esta pantalla para ambos slots
                const { data: statusData } = await supabase
                    .from('display_estado')
                    .select('pantalla_id, media_content_id')
                    .in('pantalla_id', [videoKey, carouselKey]);

                if (!statusData || statusData.length === 0) {
                    setHubMedia(null);
                    setHubCarousel(null);
                    return;
                }

                const vidId = statusData.find((s: any) => s.pantalla_id === videoKey)?.media_content_id;
                const carId = statusData.find((s: any) => s.pantalla_id === carouselKey)?.media_content_id;

                // 3. Obtener el contenido multimedia para video
                if (vidId) {
                    const { data: vid } = await supabase.from('media_content').select('*').eq('id', vidId).maybeSingle();
                    setHubMedia(vid);
                } else {
                    setHubMedia(null);
                }

                // 4. Obtener el contenido multimedia para carrusel
                if (carId) {
                    const { data: car } = await supabase.from('media_content').select('*').eq('id', carId).maybeSingle();
                    setHubCarousel(car);
                } else {
                    setHubCarousel(null);
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
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [match?.court]); // Depend on match.court to re-run when court changes

    // Rotación del carrusel automático de la biblioteca
    useEffect(() => {
        if (hubLibraryImages.length <= 1) return;
        const currentItem = hubLibraryImages[hubLibraryIdx % hubLibraryImages.length];
        const duration = (currentItem?.duracion_segundos || 8) * 1000;

        const timeout = setTimeout(() => {
            setHubLibraryIdx(prev => (prev + 1) % hubLibraryImages.length);
        }, duration);

        return () => clearTimeout(timeout);
    }, [hubLibraryImages, hubLibraryIdx]);

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

    // Hora de inicio del partido (misma fuente que el marcador: startedAt/actualStartTime en BD)
    const getMatchStartTimeMs = (m: any): number | null => {
        const raw = m?.startedAt ?? m?.actualStartTime ?? m?.startTime ?? liveMarcador?.match_start_time;
        if (raw == null) return null;
        if (typeof raw?.toDate === 'function') return raw.toDate().getTime();
        if (typeof raw?.seconds === 'number') return raw.seconds * 1000 + (raw.nanoseconds || 0) / 1e6;
        if (typeof raw === 'string' || typeof raw === 'number') return new Date(raw).getTime();
        const d = new Date(raw);
        return isNaN(d.getTime()) ? null : d.getTime();
    };

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

    // ── Sincronizar marcador RTDB ───────────────────────────────────────
    useEffect(() => {
        if (!rtdb || !match?.court) return;
        const canchaId = `cancha_${match.court}`;
        const marcRef = ref(rtdb, `canchas/${canchaId}/marcador`);
        const handler = (snap: any) => setLiveMarcador(snap.val());
        onValue(marcRef, handler);
        return () => off(marcRef, 'value', handler);
    }, [match?.court]);

    // Animación actual disparada por el marker (botones debajo de los puntos)
    useEffect(() => {
        if (!rtdb || !match?.court) return;
        const canchaId = `cancha_${match.court}`;
        const animRef = ref(rtdb, `canchas/${canchaId}/animacion_actual`);
        const handler = (snap: any) => setAnimacionActual(snap.val());
        onValue(animRef, handler);
        return () => off(animRef, 'value', handler);
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

        const updateAll = (t: any, ms: any[]) => {
            if (!t || !ms) return;
            setTournament(t);

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
                    // Margen de 2 segundos para evitar desajustes de precisión
                    return mTs && Math.abs(mTs - ts) < 2000;
                });
            }
            if (!found && matchId.startsWith('court_')) {
                const courtNum = parseInt(matchId.replace('court_', ''), 10);
                if (!isNaN(courtNum))
                    found = ms.find((m: any) => (m.court ?? (m.courtIndex != null ? m.courtIndex + 1 : null)) === courtNum) ?? ms.find((m: any) => m.courtIndex === courtNum - 1);
            }

            if (found) {
                const resolveTeam = (mTeam: any, teamIdx: number) => {
                    // Support for embedded teams (new Master Generator)
                    if (mTeam && (mTeam.p1 || mTeam.p1Name || mTeam.isTBD || mTeam.teamLabel)) {
                        return {
                            p1Name: mTeam.isTBD ? (mTeam.teamLabel || '?') : (mTeam.p1Name || mTeam.p1?.name || '?'),
                            p2Name: mTeam.isTBD ? '' : (mTeam.p2Name || mTeam.p2?.name || '?'),
                            p1Photo: mTeam.p1?.photo || null,
                            p2Photo: mTeam.p2?.photo || null,
                            name: mTeam.isTBD ? (mTeam.teamLabel || '?') : [mTeam.p1Name || mTeam.p1?.name, mTeam.p2Name || mTeam.p2?.name].filter(Boolean).join(' / ') || '?'
                        };
                    }
                    // Legacy support (using indices from t.teams)
                    const teams = t?.teams || [];
                    const team = teamIdx > 0 ? teams[teamIdx - 1] : null;
                    if (!team) return { p1Name: '?', p2Name: '?', p1Photo: null, p2Photo: null, name: teamIdx > 0 ? `Pareja ${teamIdx}` : '?' };
                    return {
                        p1Name: team.p1?.name || '?',
                        p2Name: team.p2?.name || '?',
                        p1Photo: team.p1?.photo || null,
                        p2Photo: team.p2?.photo || null,
                        name: `${team.p1?.name || '?'} / ${team.p2?.name || '?'}`
                    };
                };

                const t1 = resolveTeam(found.team1, found.team1Index);
                const t2 = resolveTeam(found.team2, found.team2Index);

                const matchData = {
                    ...found,
                    court: found.court || (found.courtIndex !== undefined ? found.courtIndex + 1 : undefined),
                    t1p1: t1.p1Name,
                    t1p2: t1.p2Name,
                    t2p1: t2.p1Name,
                    t2p2: t2.p2Name,
                    t1p1Photo: t1.p1Photo,
                    t1p2Photo: t1.p2Photo,
                    t2p1Photo: t2.p1Photo,
                    t2p2Photo: t2.p2Photo,
                    t1Name: t1.name,
                    t2Name: t2.name,
                };
                setMatch(matchData);

                // Extract latest finished matches for ticker
                const finished = ms
                    .filter((mx: any) => mx.status === MatchStatus.FINISHED)
                    .sort((a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
                    .slice(0, 3)
                    .map((mx: any) => {
                        const rt1 = resolveTeam(mx.team1, mx.team1Index);
                        const rt2 = resolveTeam(mx.team2, mx.team2Index);
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
                    const rnt1 = resolveTeam(next.team1, next.team1Index);
                    const rnt2 = resolveTeam(next.team2, next.team2Index);
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

        // 1. Supabase Subscriptions
        const unsubT = dataService.subscribeToTournament(id, (t) => {
            if (!t) return;
            currentTournament = t;
            if (currentMatches.length > 0) updateAll(currentTournament, currentMatches);
        });

        const unsubM = dataService.subscribeToMatches(id, (ms) => {
            if (!ms || ms.length === 0) return;
            currentMatches = ms;
            if (currentTournament) updateAll(currentTournament, currentMatches);
        });

        // 2. Firestore Subscriptions (Fallback / Event view support)
        let unsubFT = () => { };
        let unsubFM = () => { };

        if (db) {
            unsubFT = onSnapshot(doc(db, 'tournaments', id), (snap) => {
                if (!snap.exists()) return;
                currentTournament = { id: snap.id, ...snap.data() };
                if (currentMatches.length > 0) updateAll(currentTournament, currentMatches);
            });

            unsubFM = onSnapshot(collection(db, 'tournaments', id, 'matches'), (snap) => {
                if (snap.empty) return;
                currentMatches = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                if (currentTournament) updateAll(currentTournament, currentMatches);
            });
        }

        // Safety timeout to stop spinner if no data found
        const timeout = setTimeout(() => setLoading(false), 10000);

        return () => {
            unsubT();
            unsubM();
            unsubFT();
            unsubFM();
            clearTimeout(timeout);
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
    const modoPuntos: 'normal' | 'tiebreak' | 'super_tiebreak' = lm?.modo_puntos || (match?.matchFormat === 'SUPER_TIEBREAK' || match?.superTiebreak ? 'super_tiebreak' : (match?.matchFormat === 'TIEBREAK' || match?.tiebreak ? 'tiebreak' : 'normal'));
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
    const ptsT1 = isSTB ? String(stbT1) : isTiebreak ? String(tbT1) : toTennis(ptsT1Raw);
    const ptsT2 = isSTB ? String(stbT2) : isTiebreak ? String(tbT2) : toTennis(ptsT2Raw);

    // Sets ganados
    const setsT1 = lm ? (lm.sets?.local ?? 0) : (match.sets?.t1 ?? 0);
    const setsT2 = lm ? (lm.sets?.visitante ?? 0) : (match.sets?.t2 ?? 0);

    // Games en el set actual
    const gamesT1 = lm ? (lm.games?.local ?? 0) : (match.games?.t1 ?? 0);
    const gamesT2 = lm ? (lm.games?.visitante ?? 0) : (match.games?.t2 ?? 0);

    // Set actual (para columnas S1/S2/S3 — solo visible de Firestore)
    const currentSet = setsT1 + setsT2 + 1;

    // Set boxes helper (solo Set 1 y Set 2; STB se ve en el game actual)
    const SetBoxes = ({ team }: { team: 1 | 2 }) => (
        <div className="flex items-center gap-[1vw]">
            {[1, 2].map(setNum => {
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
                        <span className="font-black uppercase text-gray-500 tracking-widest" style={{ fontSize: 'clamp(5px,0.5vw,9px)', marginBottom: '2px' }}>{`SET ${setNum}`}</span>
                        <motion.span
                            key={isCurrent ? match.games?.[`t${team}`] : (pastVal ?? setNum)}
                            initial={isCurrent ? { scale: 1.5, opacity: 0 } : {}}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`font-black italic ${isCurrent ? 'text-white' : 'text-white/40'}`}
                            style={{ fontSize: 'clamp(16px,3vw,52px)', lineHeight: 1 }}
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

    const isLiveForDuration = match?.status === MatchStatus.LIVE || match?.status === 'live' || match?.status === MatchStatus.PAUSED || match?.status === 'PAUSED';
    const matchStartTimeMs = getMatchStartTimeMs(match);

    const relojTheme = relojOcasion || 'default';

    return (
        <div
            className={`h-screen w-screen text-white overflow-hidden font-outfit relative flex flex-col transition-colors duration-1000 ${isFinal ? 'bg-[#000] border-8 border-[#FFD700]/20' : 'bg-[#050505]'}`}
            style={{ padding: 'clamp(6px,1vh,16px) clamp(8px,1.2vw,20px)', gap: 'clamp(4px,0.8vh,12px)' }}
        >
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
                                {isLiveForDuration && matchStartTimeMs != null ? (
                                    <MatchDurationCounter isLive={isLiveForDuration} startTimeMs={matchStartTimeMs} primaryColor={primaryColor} cronometroTipo={cronometroTipo} />
                                ) : matchTimeDisplay ? (
                                    <div className="flex flex-col items-center leading-none">
                                        <span className="font-bold uppercase text-white/50 tracking-[0.35em]" style={{ fontSize: 'clamp(6px,0.6vw,10px)' }}>Partido</span>
                                        <span className="font-black italic tracking-tighter" style={{ fontSize: 'clamp(18px,2.5vw,40px)', color: primaryColor }}>{matchTimeDisplay}</span>
                                    </div>
                                ) : null}
                            </div>

                            {/* Right: Clock Box (Time / Date + Temp) */}
                            <div className="flex items-center gap-3">
                                {showLive && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/10 border border-red-500/20 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-red-500">LIVE</span>
                                    </div>
                                )}

                                <div className={`flex flex-col items-center justify-center border transition-all duration-700 relative overflow-hidden ${tournament?.broadcastingSettings?.clockStyle === 'broadcast'
                                    ? 'bg-black/60 border-white/15'
                                    : 'border-white/8 bg-white/[0.04] backdrop-blur-md'
                                    }`}
                                    style={{
                                        borderRadius: 'clamp(10px,1.4vw,22px)',
                                        padding: '0.5vw 1.2vw',
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
                                            <DisplayClockDate className="font-bold uppercase text-white/40 tracking-widest whitespace-nowrap"
                                                style={{ fontSize: 'clamp(6px,0.6vw,10px)' }}
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
                            className="flex-shrink-0 border border-white/8 bg-white/[0.025] overflow-hidden flex flex-col mb-[0.5vh]"
                            style={{ height: '30vh', borderRadius: 'clamp(12px,1.6vw,26px)' }}
                        >
                            {/* Column headers */}
                            <div className="flex items-center border-b border-white/[0.05] bg-white/[0.02] h-[15%]">
                                <div className="flex-1" />
                                <div className="flex items-center justify-center border-l border-white/[0.05] h-full" style={{ width: '12%', backgroundColor: 'rgba(255,255,255,0.06)' }}>
                                    <span className="font-black uppercase tracking-widest text-white/50" style={{ fontSize: 'clamp(7px,0.8vw,12px)' }}>PTS</span>
                                </div>
                                <div className="flex items-center justify-center border-l border-white/[0.05] h-full" style={{ width: '10%', backgroundColor: `${primaryColor}10` }}>
                                    <span className="font-black uppercase tracking-widest" style={{ fontSize: 'clamp(7px,0.8vw,12px)', color: primaryColor }}>GAME</span>
                                </div>
                                {[1, 2].map(s => (
                                    <div key={s} className="flex items-center justify-center border-l border-white/[0.05] h-full" style={{ width: '10%' }}>
                                        <span className="font-black uppercase tracking-widest text-gray-600" style={{ fontSize: 'clamp(7px,0.8vw,12px)' }}>SET {s}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Team 1 row */}
                            <div className="flex-1 flex items-center relative border-b border-white/[0.05] overflow-hidden">
                                <div className="flex-1 flex items-center h-full px-6 gap-4">
                                    <div className="flex flex-col flex-1 min-w-0" style={{ gap: '0.2vh' }}>
                                        <div className="flex items-center gap-3">
                                            <AnimatePresence>
                                                {(lm?.saque?.equipo === 1 || match.server?.team === 1) && (
                                                    <motion.span initial={{ opacity: 0, scale: 0.5, x: -10 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                                        style={{ fontSize: '1.5vh', marginRight: '-0.5vw' }}>🎾</motion.span>
                                                )}
                                            </AnimatePresence>
                                            <img src={match.t1p1Photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.t1p1)}&background=222&color=fff`}
                                                className="rounded-full flex-shrink-0 object-cover border border-white/10"
                                                style={{ width: '4.5vh', height: '4.5vh' }} />
                                            <p className="font-black italic uppercase tracking-tighter text-white truncate" style={{ fontSize: 'clamp(12px,2.2vh,32px)' }}>{lm?.equipo_1?.nombre || match.t1p1}</p>
                                        </div>
                                        <div className="flex items-center gap-3 text-white/60">
                                            <img src={match.t2p1Photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.t1p2)}&background=222&color=fff`}
                                                className="rounded-full flex-shrink-0 object-cover border border-white/10 opacity-60"
                                                style={{ width: '4.5vh', height: '4.5vh' }} />
                                            <p className="font-black italic uppercase tracking-tighter truncate" style={{ fontSize: 'clamp(12px,2.2vh,32px)' }}>{match.t1p2}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center border-l border-white/[0.05] h-full bg-white/[0.04]" style={{ width: '12%' }}>
                                    <motion.span key={ptsT1} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                        className="font-black italic text-white" style={{ fontSize: 'clamp(28px,8vh,80px)' }}>{ptsT1}</motion.span>
                                </div>
                                <div className="flex items-center justify-center border-l border-white/[0.05] h-full" style={{ width: '10%', backgroundColor: `${primaryColor}12` }}>
                                    <motion.span key={gamesT1} animate={{ scale: [1.2, 1] }} className="font-black italic" style={{ fontSize: 'clamp(20px,6vh,60px)', color: primaryColor }}>{gamesT1}</motion.span>
                                </div>
                                {[1, 2].map((s: number) => {
                                    const val = (s < currentSet) ? (match.games_sets?.[s - 1]?.t1 ?? match.setScores?.[s - 1]?.t1 ?? 0) : (s === currentSet ? (match.games?.t1 ?? '') : '');
                                    return (
                                        <div key={s} className="flex items-center justify-center border-l border-white/[0.05] h-full" style={{ width: '10%', background: s === currentSet ? 'rgba(255,255,255,0.04)' : 'transparent' }}>
                                            <span className={`font-black italic ${s === currentSet ? 'text-white' : 'text-white/30'}`} style={{ fontSize: 'clamp(18px,5vh,55px)' }}>{val}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Team 2 row */}
                            <div className="flex-1 flex items-center relative overflow-hidden">
                                <div className="flex-1 flex items-center h-full px-6 gap-4">
                                    <div className="flex flex-col flex-1 min-w-0" style={{ gap: '0.2vh' }}>
                                        <div className="flex items-center gap-3">
                                            <AnimatePresence>
                                                {(lm?.saque?.equipo === 2 || match.server?.team === 2) && (
                                                    <motion.span initial={{ opacity: 0, scale: 0.5, x: -10 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                                        style={{ fontSize: '1.5vh', marginRight: '-0.5vw' }}>🎾</motion.span>
                                                )}
                                            </AnimatePresence>
                                            <img src={match.t2p1Photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.t2p1)}&background=222&color=fff`}
                                                className="rounded-full flex-shrink-0 object-cover border border-white/10"
                                                style={{ width: '4.5vh', height: '4.5vh' }} />
                                            <p className="font-black italic uppercase tracking-tighter text-white truncate" style={{ fontSize: 'clamp(12px,2.2vh,32px)' }}>{lm?.equipo_2?.nombre || match.t2p1}</p>
                                        </div>
                                        <div className="flex items-center gap-3 text-white/60">
                                            <img src={match.t2p2Photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.t2p2)}&background=222&color=fff`}
                                                className="rounded-full flex-shrink-0 object-cover border border-white/10 opacity-60"
                                                style={{ width: '4.5vh', height: '4.5vh' }} />
                                            <p className="font-black italic uppercase tracking-tighter truncate" style={{ fontSize: 'clamp(12px,2.2vh,32px)' }}>{match.t2p2}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center border-l border-white/[0.05] h-full bg-white/[0.04]" style={{ width: '12%' }}>
                                    <motion.span key={ptsT2} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                        className="font-black italic text-white" style={{ fontSize: 'clamp(28px,8vh,80px)' }}>{ptsT2}</motion.span>
                                </div>
                                <div className="flex items-center justify-center border-l border-white/[0.05] h-full" style={{ width: '10%', backgroundColor: `${primaryColor}12` }}>
                                    <motion.span key={gamesT2} animate={{ scale: [1.2, 1] }} className="font-black italic" style={{ fontSize: 'clamp(20px,6vh,60px)', color: primaryColor }}>{gamesT2}</motion.span>
                                </div>
                                {[1, 2].map((s: number) => {
                                    const val = (s < currentSet) ? (match.games_sets?.[s - 1]?.t2 ?? match.setScores?.[s - 1]?.t2 ?? 0) : (s === currentSet ? (match.games?.t2 ?? '') : '');
                                    return (
                                        <div key={s} className="flex items-center justify-center border-l border-white/[0.05] h-full" style={{ width: '10%', background: s === currentSet ? 'rgba(255,255,255,0.04)' : 'transparent' }}>
                                            <span className={`font-black italic ${s === currentSet ? 'text-white' : 'text-white/30'}`} style={{ fontSize: 'clamp(18px,5vh,55px)' }}>{val}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ══════════════ PUBLICIDAD (50%) ══════════════ */}
                        <div
                            className="flex-shrink-0 grid grid-cols-2 gap-2 mb-[0.5vh]"
                            style={{ height: '49vh' }}
                        >
                            {/* Video Ad / Hub Media */}
                            <div className="border border-white/8 bg-white/[0.02] relative overflow-hidden rounded-3xl">
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
                                        ) : hubMedia.tipo.includes('video') ? (
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
                                    ) : adBanner.isVisible && adBanner.currentImageUrl ? (
                                        adBanner.currentImageUrl.match(/\.(mp4|webm|mov|m4v)(\?|$)/i) ? (
                                            <motion.video key={adBanner.currentImageUrl} src={adBanner.currentImageUrl} autoPlay muted loop initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full object-cover" />
                                        ) : (
                                            <motion.img key={adBanner.currentImageUrl} src={adBanner.currentImageUrl} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full object-contain p-4" />
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full opacity-20">
                                            <Megaphone className="w-12 h-12 mb-2" style={{ color: primaryColor }} />
                                            <span className="font-black italic uppercase tracking-widest text-[10px]">Espacio Publicitario Hub</span>
                                        </div>
                                    )}

                                    {/* Professional Overlay */}
                                    {hubMedia && (
                                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                            className="absolute bottom-4 left-4 z-20 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center border border-white/5 overflow-hidden">
                                                {hubMedia.tipo.includes('video') ? (
                                                    <Video size={14} className="text-padel-primary" />
                                                ) : hubMedia.tipo === 'imagen' ? (
                                                    <img src={hubMedia.url} className="w-full h-full object-cover" alt="" />
                                                ) : hubMedia.tipo === 'url_web' ? (
                                                    <ExternalLink size={14} className="text-orange-400" />
                                                ) : (
                                                    <Layers size={14} className="text-purple-400" />
                                                )}
                                            </div>
                                            <span className="text-[9px] font-black uppercase text-white tracking-widest italic">{hubMedia.nombre_sponsor || 'Publicidad'}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Carousel Ad (Supabase / Hub) */}
                            <div className="border border-white/8 bg-white/[0.02] relative overflow-hidden rounded-3xl">
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
                                        ) : hubCarousel.tipo.includes('video') ? (
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
                                            />
                                        )
                                    ) : hubLibraryImages.length > 0 ? (
                                        <motion.img
                                            key={hubLibraryImages[hubLibraryIdx % hubLibraryImages.length]?.url}
                                            src={hubLibraryImages[hubLibraryIdx % hubLibraryImages.length]?.url}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.5 }}
                                            className="w-full h-full object-contain p-4"
                                        />
                                    ) : sponsorCarousel.length > 0 ? (
                                        <motion.img
                                            key={sponsorCarousel[sponsorCarouselIdx % sponsorCarousel.length]?.url}
                                            src={sponsorCarousel[sponsorCarouselIdx % sponsorCarousel.length]?.url}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.5, ease: 'easeOut' }}
                                            className="w-full h-full object-contain p-4"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full opacity-20">
                                            <Star className="w-12 h-12 mb-2" style={{ color: primaryColor }} />
                                            <span className="font-black italic uppercase tracking-widest text-[10px]">Patrocinadores Hub</span>
                                        </div>
                                    )}

                                    {/* Professional Overlay */}
                                    {(hubCarousel || hubLibraryImages.length > 0) && (
                                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                            className="absolute bottom-4 right-4 z-20 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-2">
                                            <ImageIcon size={10} className="text-blue-400" />
                                            <span className="text-[9px] font-black uppercase text-white tracking-widest italic">
                                                {hubCarousel ? (hubCarousel.nombre_sponsor || 'Sponsor') : (hubLibraryImages[hubLibraryIdx % hubLibraryImages.length]?.nombre_sponsor || 'Padel Hub')}
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* ══════════════ FOOTER BAR (10%) ══════════════ */}
                        <div
                            className="flex-shrink-0 overflow-hidden border-t border-white/10 bg-black/40 backdrop-blur-md relative"
                            style={{
                                height: '9.5vh',
                                borderRadius: 'clamp(10px,1.2vw,18px) clamp(10px,1.2vw,18px) 0 0',
                            }}>
                            {tickerActivo && tickerTexto ? (
                                <div className="flex items-center h-full">
                                    <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-6 bg-black/80 border-r border-white/10">
                                        <div className="w-2 h-2 rounded-full bg-red-500 mr-3 animate-pulse shadow-[0_0_10px_#ef4444]" />
                                        <span className="font-black italic uppercase tracking-widest text-xs" style={{ color: primaryColor }}>TICKER EN VIVO</span>
                                    </div>
                                    <div className="flex items-center whitespace-nowrap pl-40 animate-ticker" style={{ animationDuration: `${tickerVelocidad}s` }}>
                                        {[0, 1].map(i => (
                                            <span key={i} className="font-black italic uppercase tracking-tighter text-2xl px-20">
                                                {tickerTexto}
                                                {recentResults.map((res: any, idx) => (
                                                    <span key={idx} className="opacity-40 ml-10"> • RESULTADO: {res.t1Name} {res.games_sets?.[0]?.t1 ?? 0}-{res.games_sets?.[0]?.t2 ?? 0} {res.t2Name}</span>
                                                ))}
                                                {nextMatch && <span style={{ color: primaryColor }} className="ml-10"> • SIGUIENTE: {nextMatch.t1Name} vs {nextMatch.t2Name}</span>}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full opacity-30">
                                    <span className="font-black italic uppercase tracking-[0.5em] text-[10px]">Padel Smart TV • Pro Scoreboard</span>
                                </div>
                            )}
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
                                        const isImage = /\.(gif|webp|png|jpg|jpeg)(\?|$)/i.test(url);

                                        if (isVideo) {
                                            return <video src={url} autoPlay muted playsInline className="max-w-full max-h-full object-contain" />;
                                        } else {
                                            return <img src={url} alt="" className="max-w-full max-h-full object-contain" />;
                                        }
                                    })()}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    /* ══════════════ AD MODE ══════════════ */
                    <motion.div key="ad" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className="h-full w-full bg-black flex items-center justify-center relative">
                        {adMedia[currentAdIdx]?.endsWith('.mp4') ? (
                            <video src={adMedia[currentAdIdx]} autoPlay muted loop className="w-full h-full object-cover" />
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
                                    <h1 className="text-8xl font-black italic uppercase tracking-tighter text-white leading-none">
                                        Espacio <span className="text-padel-primary">Publicitario</span><br />
                                        <span className="text-5xl opacity-40">Disponible</span>
                                    </h1>
                                    <p className="text-2xl font-bold uppercase tracking-[0.5em] text-[#fb923c] animate-pulse">
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

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                .font-outfit { font-family: 'Outfit', sans-serif; }
                body { background: black; margin: 0; padding: 0; }
                @keyframes ticker-scroll {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}
