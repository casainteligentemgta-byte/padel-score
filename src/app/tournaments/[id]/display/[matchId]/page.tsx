'use client';

import { useState, useEffect, use, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { rtdb } from '@/lib/rtdb';
import { dataService } from '@/lib/dataService';
import { ref, onValue, off } from 'firebase/database';
import { MatchStatus } from '@/types/tournament';
import { useAdBanner } from '@/lib/useAdBanner';
import { Trophy, Star, Megaphone, Thermometer, Clock } from 'lucide-react';

export default function FullScreenDisplay({ params }: { params: Promise<{ id: string, matchId: string }> }) {
    const { id, matchId } = use(params);
    const [tournament, setTournament] = useState<any>(null);
    const [match, setMatch] = useState<any>(null);
    const [nextMatch, setNextMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<'score' | 'ad'>('score');
    const [currentAdIdx, setCurrentAdIdx] = useState(0);
    const [recentResults, setRecentResults] = useState<any[]>([]);
    const [clock, setClock] = useState<{ date: string; time: string }>({ date: '', time: '' });
    const [temp, setTemp] = useState<number | null>(null);
    const prevScore = useRef<string>('');
    const adBanner = useAdBanner();
    const [carouselImages, setCarouselImages] = useState<{ url: string; orden: number }[]>([]);
    const [carouselIdx, setCarouselIdx] = useState(0);
    const [carouselInterval, setCarouselInterval] = useState(8);

    // ── Marcador en vivo del RTDB (escrito por el marker en tiempo real) ─────
    const [liveMarcador, setLiveMarcador] = useState<any>(null);
    const [sponsorIdx, setSponsorIdx] = useState(0);
    const [matchDuration, setMatchDuration] = useState<string>('');

    // Ticker desde RTDB (tiempo real, configurable desde panel publicidad)
    const [tickerTexto, setTickerTexto] = useState('');
    const [tickerActivo, setTickerActivo] = useState(false);
    const [tickerVelocidad, setTickerVelocidad] = useState(30);

    // Estilo del reloj y del cronómetro — desde módulo Publicidad
    const [relojOcasion, setRelojOcasion] = useState<string>('default');
    const [cronometroTipo, setCronometroTipo] = useState<string>('default');
    const [animacionActual, setAnimacionActual] = useState<{ id: string; ts: number } | null>(null);
    const [animacionesMarcador, setAnimacionesMarcador] = useState<Record<string, { nombre: string; url: string }>>({});

    useEffect(() => {
        if (!rtdb) return;
        const relojRef = ref(rtdb, 'publicidad_master/reloj_ocasion');
        const handler = (snap: any) => setRelojOcasion(snap.val() || 'default');
        onValue(relojRef, handler);
        return () => off(relojRef, 'value', handler);
    }, []);
    useEffect(() => {
        if (!rtdb) return;
        const refCron = ref(rtdb, 'publicidad_master/cronometro_tipo');
        const h = (snap: any) => setCronometroTipo(snap.val() || 'default');
        onValue(refCron, h);
        return () => off(refCron, 'value', h);
    }, []);
    useEffect(() => {
        if (!rtdb) return;
        const refAnim = ref(rtdb, 'publicidad_master/animaciones_marcador');
        const h = (snap: any) => setAnimacionesMarcador(snap.val() || {});
        onValue(refAnim, h);
        return () => off(refAnim, 'value', h);
    }, []);

    useEffect(() => {
        if (!rtdb) return;
        const tickerRef = ref(rtdb, 'publicidad_master/ticker');
        const handler = (snap: any) => {
            const val = snap.val();
            if (val) {
                setTickerActivo(val.activo ?? false);
                setTickerTexto(val.texto ?? '');
                setTickerVelocidad(val.velocidad_seg ?? 30);
            }
        };
        onValue(tickerRef, handler);
        return () => off(tickerRef, 'value', handler);
    }, []);

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

    // Clock — updates every second
    useEffect(() => {
        const update = () => {
            const now = new Date();
            const date = now.toLocaleDateString('es-VE', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase();
            const time = now.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
            setClock({ date, time });
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, []);

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

    // Match Duration Counter — duración transcurrida desde startedAt (actualización cada segundo)
    useEffect(() => {
        const isLive = match?.status === MatchStatus.LIVE || match?.status === 'live' || match?.status === MatchStatus.PAUSED || match?.status === 'PAUSED';
        if (!isLive) {
            setMatchDuration('');
            return;
        }
        const startMs = getMatchStartTimeMs(match);
        if (startMs == null) {
            setMatchDuration('');
            return;
        }
        const update = () => {
            const elapsedSec = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
            const h = Math.floor(elapsedSec / 3600);
            const m = Math.floor((elapsedSec % 3600) / 60);
            const s = elapsedSec % 60;
            setMatchDuration(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [match?.status, match?.startedAt, match?.actualStartTime, match?.startTime, liveMarcador?.match_start_time]);

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

    // Data Sync (Supabase)
    useEffect(() => {
        if (!id) return;
        setLoading(true);

        let currentTournament: any = null;
        let currentMatches: any[] = [];

        const updateAll = (t: any, ms: any[]) => {
            if (!t || !ms) return;
            setTournament(t);

            // Resolver partido
            let found = ms.find((m: any) => m.id === matchId);
            if (!found && /^match_(\d+)$/.test(matchId)) {
                const idx = parseInt(matchId.replace('match_', ''), 10);
                if (idx >= 0 && idx < ms.length) found = ms[idx];
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
                }
            }
            setLoading(false);
        };

        const unsubT = dataService.subscribeToTournament(id, (t) => {
            currentTournament = t;
            if (currentMatches.length > 0) updateAll(currentTournament, currentMatches);
        });

        const unsubM = dataService.subscribeToMatches(id, (ms) => {
            currentMatches = ms;
            if (currentTournament) updateAll(currentTournament, currentMatches);
        });

        return () => {
            unsubT();
            unsubM();
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

    if (loading || !match) return (
        <div className="h-screen bg-black flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-padel-primary border-t-transparent rounded-full animate-spin" />
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
                        className="flex flex-col h-full relative z-10"
                        style={{ gap: 'clamp(4px,0.8vh,12px)' }}
                    >
                        {/* ══════════════ HEADER BAR ══════════════ */}
                        <div
                            className="flex items-center justify-between flex-shrink-0 border border-white/8 bg-white/[0.03] backdrop-blur-sm"
                            style={{
                                borderRadius: 'clamp(10px,1.4vw,22px)',
                                padding: 'clamp(6px,1vh,14px) clamp(10px,1.8vw,28px)',
                            }}
                        >
                            {/* Left: Tournament & Match Info */}
                            <div className="flex items-center gap-6">
                                {tournament?.logo && (
                                    <div className="w-[clamp(40px,5vw,100px)] aspect-square bg-white/5 rounded-2xl p-2 border border-white/10 flex items-center justify-center">
                                        <img src={tournament.logo} className="w-full h-full object-contain" />
                                    </div>
                                )}
                                <div className="flex flex-col items-start justify-center" style={{ gap: 'clamp(1px,0.25vh,5px)' }}>
                                    {/* Pista — grande (clamp para display TV); siempre la del partido resuelto por matchId */}
                                    <span className="label-cancha leading-none"
                                        style={{ fontSize: 'clamp(16px,2.2vw,38px)' }}>
                                        {match.courtName ?? (match.court != null ? `Pista ${match.court}` : 'Pista –')}
                                    </span>
                                    {/* Fase / Ronda — mediana */}
                                    {(match.roundName || match.groupName) && (
                                        <span className="font-black italic uppercase tracking-tight leading-none"
                                            style={{ fontSize: 'clamp(10px,1.2vw,20px)', color: 'rgba(255,255,255,0.60)' }}>
                                            {match.roundName || match.groupName}
                                        </span>
                                    )}
                                    {/* Categoría — solo categoría (sin género ni formato debajo) */}
                                    {tournament?.category && (
                                        <span className="font-black italic uppercase tracking-wide leading-none"
                                            style={{ fontSize: 'clamp(10px,1.3vw,22px)', color: 'rgba(255,255,255,0.55)' }}>
                                            {formatCategory(tournament.category)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Center: Tiempo del partido — duración en vivo (cronómetro) o hora programada */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                                {matchDuration ? (
                                    <>
                                        <span className="font-bold uppercase text-white/50 tracking-[0.35em] leading-none" style={{ fontSize: 'clamp(6px,0.7vw,11px)' }}>Tiempo de juego</span>
                                        <span className="font-black italic tracking-tighter leading-none mt-0.5 tabular-nums" style={{ fontSize: 'clamp(24px,3.2vw,56px)', color: primaryColor }}>{matchDuration}</span>
                                    </>
                                ) : matchTimeDisplay ? (
                                    <>
                                        <span className="font-bold uppercase text-white/50 tracking-[0.35em] leading-none" style={{ fontSize: 'clamp(6px,0.7vw,11px)' }}>Partido</span>
                                        <span className="font-black italic tracking-tighter leading-none mt-0.5" style={{ fontSize: 'clamp(20px,2.8vw,48px)', color: primaryColor }}>{matchTimeDisplay}</span>
                                    </>
                                ) : null}
                                {tournament?.broadcastingSettings?.sponsors?.filter((s: any) => s.active).length > 0 && (
                                    <div className="flex items-center gap-2 mt-2 opacity-60">
                                        <span className="text-[7px] font-black italic text-gray-600 uppercase tracking-[0.3em]" style={{ writingMode: 'vertical-rl' }}>PATROCINA</span>
                                        <div className="w-[clamp(40px,5vw,100px)] h-[clamp(18px,2.2vh,36px)] relative">
                                            <AnimatePresence mode="wait">
                                                <motion.img
                                                    key={sponsorIdx}
                                                    src={tournament.broadcastingSettings.sponsors.filter((s: any) => s.active)[sponsorIdx]?.logoUrl}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="w-full h-full object-contain"
                                                />
                                            </AnimatePresence>
                                        </div>
                                        <span className="text-[7px] font-black italic text-gray-600 uppercase tracking-[0.3em]" style={{ writingMode: 'vertical-rl' }}>SPONSOR</span>
                                    </div>
                                )}
                            </div>

                            {/* Right: Date / Time / Temp — horizontal pill (estilo según ocasión) */}

                            {/* Right: Date / Time / Temp — horizontal pill */}
                            <div className={`flex items-center border transition-all relative overflow-hidden ${tournament?.broadcastingSettings?.clockStyle === 'broadcast'
                                ? 'bg-black/60 border-white/20 shadow-[0_0_30px_rgba(204,255,0,0.1)]'
                                : 'border-white/8 bg-white/[0.04] backdrop-blur-sm'
                                }`}
                                style={{ borderRadius: 'clamp(10px,1.2vw,20px)' }}>

                                {tournament?.broadcastingSettings?.clockStyle === 'broadcast' && tournament?.broadcastingSettings?.clockImageUrl && (
                                    <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                                        <img src={tournament.broadcastingSettings.clockImageUrl} className="w-full h-full object-cover" />
                                    </div>
                                )}

                                {showLive && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600/20 border-r border-white/5 animate-pulse">
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-red-500">LIVE</span>
                                    </div>
                                )}

                                {/* Temperatura primero en el bloque derecho */}
                                {temp !== null && (
                                    <>
                                        <div className="self-stretch w-px bg-white/[0.08]" />
                                        <div className="flex items-center gap-[0.4vw] relative z-10"
                                            style={{ padding: 'clamp(5px,0.9vh,12px) clamp(12px,1.6vw,24px)' }}>
                                            <Thermometer style={{ width: 'clamp(9px,1vw,16px)', height: 'clamp(9px,1vw,16px)', color: primaryColor, flexShrink: 0 }} />
                                            <span className="font-black italic tracking-tighter"
                                                style={{ fontSize: 'clamp(14px,1.8vw,30px)', color: primaryColor }}>{temp}°C</span>
                                        </div>
                                    </>
                                )}

                                {/* Luego hora y fecha */}
                                <div className="flex flex-col items-center justify-center relative z-10"
                                    style={{ padding: 'clamp(5px,0.9vh,12px) clamp(14px,1.8vw,28px)', gap: 'clamp(1px,0.2vh,3px)' }}>
                                    <span className={`font-black italic tracking-tighter leading-none ${tournament?.broadcastingSettings?.clockStyle === 'broadcast' ? 'text-padel-primary' : 'text-white'}`}
                                        style={{ fontSize: 'clamp(16px,2.2vw,36px)' }}>{clock.time}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold uppercase text-gray-500 tracking-widest leading-none"
                                            style={{ fontSize: 'clamp(5px,0.55vw,9px)' }}>{clock.date}</span>
                                        {matchDuration && (
                                            <>
                                                <div className="w-1 h-1 bg-gray-700 rounded-full" />
                                                <span
                                                    className={`font-black italic uppercase tracking-widest leading-none ${cronometroTipo === 'minimal' ? 'text-white/90 text-[0.6em]' :
                                                        cronometroTipo === 'broadcast' ? 'text-padel-primary drop-shadow-[0_0_8px_rgba(204,255,0,0.4)]' :
                                                            cronometroTipo === 'digital' ? 'text-cyan-400 font-mono tabular-nums' : 'text-padel-primary'
                                                        }`}
                                                    style={{ fontSize: 'clamp(6px,0.65vw,10px)' }}
                                                >{matchDuration}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ══════════════ MAIN GRID ══════════════ */}
                        <div
                            className="flex-1 grid min-h-0"
                            style={{
                                gridTemplateColumns: '1fr 1fr',
                                gridTemplateRows: 'auto 1fr',
                                gap: 'clamp(4px,0.8vh,12px)',
                            }}
                        >
                            {/* ── TENNIS SCOREBOARD — spans both columns ── */}
                            <div
                                className="border border-white/8 bg-white/[0.025] overflow-hidden flex flex-col"
                                style={{ gridColumn: '1 / -1', borderRadius: 'clamp(12px,1.6vw,26px)' }}
                            >
                                {/* Column headers — orden: PTS | G | S1 | S2 */}
                                <div className="flex items-center border-b border-white/[0.05]">
                                    <div className="flex-1" />
                                    {/* Puntos del game */}
                                    <div className="flex items-center justify-center border-l border-white/[0.05]"
                                        style={{ width: 'clamp(68px,9vw,145px)', padding: 'clamp(4px,0.6vh,8px) 0', backgroundColor: 'rgba(255,255,255,0.06)', marginRight: 'clamp(4px,0.5vw,10px)' }}>
                                        <span className="font-black uppercase tracking-widest text-white/50" style={{ fontSize: 'clamp(7px,0.8vw,12px)' }}>PTS</span>
                                    </div>
                                    {/* Games */}
                                    <div className="flex items-center justify-center border-l border-white/[0.05]"
                                        style={{ width: 'clamp(45px,6vw,95px)', padding: 'clamp(4px,0.6vh,8px) 0', backgroundColor: `${primaryColor}10`, marginRight: 'clamp(4px,0.5vw,10px)' }}>
                                        <span className="font-black uppercase tracking-widest" style={{ fontSize: 'clamp(7px,0.8vw,12px)', color: primaryColor }}>G</span>
                                    </div>
                                    {/* Sets S1 S2 */}
                                    {[1, 2].map(s => (
                                        <div key={s} className="flex items-center justify-center border-l border-white/[0.05]"
                                            style={{ width: 'clamp(45px,6vw,95px)', padding: 'clamp(4px,0.6vh,8px) 0', marginRight: s < 2 ? 'clamp(4px,0.5vw,10px)' : '0' }}>
                                            <span className="font-black uppercase tracking-widest text-gray-600" style={{ fontSize: 'clamp(7px,0.8vw,12px)' }}>S{s}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* ── Team 1 row ── */}
                                <div className="flex-1 flex items-center relative border-b border-white/[0.05] overflow-hidden min-h-0">
                                    <div className="flex-1 flex items-center min-w-0"
                                        style={{ padding: 'clamp(8px,1.2vh,20px) clamp(14px,2vw,32px)', gap: 'clamp(6px,1vw,18px)' }}>
                                        {/* Jugadores: avatares + nombres */}
                                        <div className="flex flex-col min-w-0 flex-1" style={{ gap: 'clamp(4px,0.6vh,10px)' }}>
                                            {/* Jugador 1 del equipo 1 */}
                                            <div className="flex items-center min-w-0" style={{ gap: 'clamp(6px,0.8vw,14px)' }}>
                                                {/* 🎾 Pelota saque — inline al lado del nombre */}
                                                <AnimatePresence>
                                                    {(lm?.saque?.equipo === 1 || match.server?.team === 1) && (
                                                        <motion.span
                                                            initial={{ opacity: 0, x: -6, scale: 0.5 }}
                                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                                            exit={{ opacity: 0, x: -6, scale: 0.5 }}
                                                            transition={{ duration: 0.25 }}
                                                            style={{ fontSize: 'clamp(12px,1.6vw,28px)', lineHeight: 1, flexShrink: 0 }}
                                                        >🎾</motion.span>
                                                    )}
                                                </AnimatePresence>
                                                <img
                                                    src={match.t1p1Photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.t1p1)}&background=222&color=fff&bold=true`}
                                                    className="rounded-full flex-shrink-0 object-cover"
                                                    style={{ width: 'clamp(22px,2.8vw,48px)', height: 'clamp(22px,2.8vw,48px)', border: `2px solid ${primaryColor}55` }}
                                                />
                                                <p className="font-black italic uppercase tracking-tighter text-white leading-none"
                                                    style={{ fontSize: 'clamp(13px,2vw,36px)' }}>
                                                    {lm?.equipo_1?.nombre || match.t1p1}
                                                </p>
                                            </div>
                                            {/* Jugador 2 del equipo 1 */}
                                            <div className="flex items-center min-w-0" style={{ gap: 'clamp(6px,0.8vw,14px)' }}>
                                                <img
                                                    src={match.t1p2Photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.t1p2)}&background=333&color=fff&bold=true`}
                                                    className="rounded-full flex-shrink-0 object-cover"
                                                    style={{ width: 'clamp(22px,2.8vw,48px)', height: 'clamp(22px,2.8vw,48px)', border: '2px solid rgba(255,255,255,0.15)' }}
                                                />
                                                <p className="font-black italic uppercase tracking-tighter text-white/70 leading-none"
                                                    style={{ fontSize: 'clamp(13px,2vw,36px)' }}>
                                                    {match.t1p2}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Puntos del game actual — Team 1 */}
                                    <div className="flex items-center justify-center border-l border-white/[0.05] self-stretch"
                                        style={{ width: 'clamp(68px,9vw,145px)', backgroundColor: 'rgba(255,255,255,0.04)', marginRight: 'clamp(4px,0.5vw,10px)' }}>
                                        <AnimatePresence mode="popLayout">
                                            <motion.span key={ptsT1} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}
                                                className="font-black italic text-white"
                                                style={{ fontSize: 'clamp(36px,6vw,105px)' }}>
                                                {ptsT1}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                    {/* Games */}
                                    <div className="flex items-center justify-center border-l border-white/[0.05] self-stretch"
                                        style={{ width: 'clamp(45px,6vw,95px)', backgroundColor: `${primaryColor}12`, marginRight: 'clamp(4px,0.5vw,10px)' }}>
                                        <AnimatePresence mode="popLayout">
                                            <motion.span key={gamesT1} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                                                className="font-black italic" style={{ fontSize: 'clamp(20px,3.5vw,64px)', color: primaryColor }}>
                                                {gamesT1}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                    {/* Set 1 y Set 2 */}
                                    {[1, 2].map(s => {
                                        const isPast = s < currentSet; const isCur = s === currentSet;
                                        const val = isPast ? (match.games_sets?.[s - 1]?.t1 ?? match.setScores?.[s - 1]?.t1 ?? 0) : isCur ? (match.games?.t1 ?? '') : '';
                                        return (
                                            <div key={s} className="flex items-center justify-center border-l border-white/[0.05] self-stretch"
                                                style={{ width: 'clamp(45px,6vw,95px)', background: isCur ? 'rgba(255,255,255,0.04)' : 'transparent', marginRight: s < 3 ? 'clamp(4px,0.5vw,10px)' : '0' }}>
                                                <motion.span key={String(val)} initial={isCur ? { scale: 1.4, opacity: 0 } : {}} animate={{ scale: 1, opacity: 1 }}
                                                    className={`font-black italic ${isPast || isCur ? 'text-white/80' : 'text-white/10'}`}
                                                    style={{ fontSize: 'clamp(20px,3.5vw,64px)' }}>{val}</motion.span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* ── Team 2 row ── */}
                                <div className="flex-1 flex items-center relative overflow-hidden min-h-0">
                                    <div className="flex-1 flex items-center min-w-0"
                                        style={{ padding: 'clamp(8px,1.2vh,20px) clamp(14px,2vw,32px)', gap: 'clamp(6px,1vw,18px)' }}>
                                        {/* Jugadores: avatares + nombres */}
                                        <div className="flex flex-col min-w-0 flex-1" style={{ gap: 'clamp(4px,0.6vh,10px)' }}>
                                            {/* Jugador 1 del equipo 2 */}
                                            <div className="flex items-center min-w-0" style={{ gap: 'clamp(6px,0.8vw,14px)' }}>
                                                {/* 🎾 Pelota saque — inline al lado del nombre */}
                                                <AnimatePresence>
                                                    {(lm?.saque?.equipo === 2 || match.server?.team === 2) && (
                                                        <motion.span
                                                            initial={{ opacity: 0, x: -6, scale: 0.5 }}
                                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                                            exit={{ opacity: 0, x: -6, scale: 0.5 }}
                                                            transition={{ duration: 0.25 }}
                                                            style={{ fontSize: 'clamp(12px,1.6vw,28px)', lineHeight: 1, flexShrink: 0 }}
                                                        >🎾</motion.span>
                                                    )}
                                                </AnimatePresence>
                                                <img
                                                    src={match.t2p1Photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.t2p1)}&background=222&color=fff&bold=true`}
                                                    className="rounded-full flex-shrink-0 object-cover"
                                                    style={{ width: 'clamp(22px,2.8vw,48px)', height: 'clamp(22px,2.8vw,48px)', border: `2px solid ${primaryColor}55` }}
                                                />
                                                <p className="font-black italic uppercase tracking-tighter text-white leading-none"
                                                    style={{ fontSize: 'clamp(13px,2vw,36px)' }}>
                                                    {lm?.equipo_2?.nombre || match.t2p1}
                                                </p>
                                            </div>
                                            {/* Jugador 2 del equipo 2 */}
                                            <div className="flex items-center min-w-0" style={{ gap: 'clamp(6px,0.8vw,14px)' }}>
                                                <img
                                                    src={match.t2p2Photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.t2p2)}&background=333&color=fff&bold=true`}
                                                    className="rounded-full flex-shrink-0 object-cover"
                                                    style={{ width: 'clamp(22px,2.8vw,48px)', height: 'clamp(22px,2.8vw,48px)', border: '2px solid rgba(255,255,255,0.15)' }}
                                                />
                                                <p className="font-black italic uppercase tracking-tighter text-white/70 leading-none"
                                                    style={{ fontSize: 'clamp(13px,2vw,36px)' }}>
                                                    {match.t2p2}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Puntos del game actual — Team 2 */}
                                    <div className="flex items-center justify-center border-l border-white/[0.05] self-stretch"
                                        style={{ width: 'clamp(68px,9vw,145px)', backgroundColor: 'rgba(255,255,255,0.04)', marginRight: 'clamp(4px,0.5vw,10px)' }}>
                                        <AnimatePresence mode="popLayout">
                                            <motion.span key={ptsT2} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}
                                                className="font-black italic text-white"
                                                style={{ fontSize: 'clamp(36px,6vw,105px)' }}>
                                                {ptsT2}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                    {/* Games */}
                                    <div className="flex items-center justify-center border-l border-white/[0.05] self-stretch"
                                        style={{ width: 'clamp(45px,6vw,95px)', backgroundColor: `${primaryColor}12`, marginRight: 'clamp(4px,0.5vw,10px)' }}>
                                        <AnimatePresence mode="popLayout">
                                            <motion.span key={gamesT2} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                                                className="font-black italic" style={{ fontSize: 'clamp(20px,3.5vw,64px)', color: primaryColor }}>
                                                {gamesT2}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                    {/* Set 1 y Set 2 */}
                                    {[1, 2].map(s => {
                                        const isPast = s < currentSet; const isCur = s === currentSet;
                                        const val = isPast ? (match.games_sets?.[s - 1]?.t2 ?? match.setScores?.[s - 1]?.t2 ?? 0) : isCur ? (match.games?.t2 ?? '') : '';
                                        return (
                                            <div key={s} className="flex items-center justify-center border-l border-white/[0.05] self-stretch"
                                                style={{ width: 'clamp(45px,6vw,95px)', background: isCur ? 'rgba(255,255,255,0.04)' : 'transparent', marginRight: s < 3 ? 'clamp(4px,0.5vw,10px)' : '0' }}>
                                                <motion.span key={String(val)} initial={isCur ? { scale: 1.4, opacity: 0 } : {}} animate={{ scale: 1, opacity: 1 }}
                                                    className={`font-black italic ${isPast || isCur ? 'text-white/80' : 'text-white/10'}`}
                                                    style={{ fontSize: 'clamp(20px,3.5vw,64px)' }}>{val}</motion.span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ── Cell 3: Banner Publicitario (bottom-left) ── */}
                            <div
                                className="border border-white/8 bg-white/[0.02] relative overflow-hidden flex items-center justify-center"
                                style={{ borderRadius: 'clamp(12px,1.6vw,26px)' }}
                            >
                                <AnimatePresence mode="wait">
                                    {adBanner.isVisible && adBanner.currentImageUrl ? (
                                        adBanner.currentImageUrl.endsWith('.mp4') ? (
                                            <motion.video key={adBanner.currentImageUrl} src={adBanner.currentImageUrl}
                                                autoPlay muted loop initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                transition={{ duration: 0.6 }} className="w-full h-full object-cover" />
                                        ) : (
                                            <motion.img key={adBanner.currentImageUrl} src={adBanner.currentImageUrl}
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                transition={{ duration: 0.6 }} className="w-full h-full object-contain"
                                                style={{ padding: 'clamp(10px,1.5vh,24px) clamp(14px,2vw,32px)' }} />
                                        )
                                    ) : (
                                        <motion.div key="ad-placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="flex flex-col items-center justify-center gap-3 w-full h-full">
                                            <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                                                <Megaphone style={{ width: 'clamp(20px,3vw,50px)', height: 'clamp(20px,3vw,50px)', color: primaryColor, opacity: 0.25 }} />
                                            </motion.div>
                                            <span className="font-black italic uppercase tracking-[0.3em] text-gray-700" style={{ fontSize: 'clamp(6px,0.7vw,12px)' }}>
                                                ESPACIO PUBLICITARIO
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* ── Cell 4: Carrusel de Imágenes (bottom-right) ── */}
                            <div
                                className="border border-white/8 bg-white/[0.02] relative overflow-hidden flex items-center justify-center"
                                style={{ borderRadius: 'clamp(12px,1.6vw,26px)' }}
                            >
                                <AnimatePresence mode="wait">
                                    {carouselImages.length > 0 ? (
                                        <motion.img
                                            key={carouselImages[carouselIdx % carouselImages.length]?.url}
                                            src={carouselImages[carouselIdx % carouselImages.length]?.url}
                                            initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.7 }}
                                            className="w-full h-full object-contain"
                                            style={{ padding: 'clamp(10px,1.5vh,24px) clamp(14px,2vw,32px)' }}
                                        />
                                    ) : (
                                        <motion.div key="carousel-placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="flex flex-col items-center justify-center gap-3 w-full h-full">
                                            <div className="flex items-end gap-[clamp(3px,0.5vw,8px)]">
                                                {[0.5, 0.75, 1].map((h, i) => (
                                                    <motion.div key={i} animate={{ scaleY: [h, 1, h] }}
                                                        transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                                                        className="rounded-full"
                                                        style={{ width: 'clamp(4px,0.5vw,8px)', height: `clamp(${Math.round(h * 14)}px,${h * 1.6}vw,${Math.round(h * 26)}px)`, backgroundColor: primaryColor, opacity: 0.2 + i * 0.1 }} />
                                                ))}
                                            </div>
                                            <span className="font-black italic uppercase tracking-[0.3em] text-gray-700" style={{ fontSize: 'clamp(6px,0.7vw,12px)' }}>
                                                CARRUSEL IMÁGENES
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* ══════════════ FOOTER BAR ══════════════ */}
                        {tickerActivo && tickerTexto ? (
                            <div
                                className="flex-shrink-0 overflow-hidden border border-white/10 bg-[#0d0d0d] relative"
                                style={{
                                    borderRadius: 'clamp(10px,1.2vw,18px)',
                                    height: 'clamp(38px,6.5vh,72px)',
                                }}>
                                {/* Etiqueta izquierda fija */}
                                <div
                                    className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-[clamp(8px,1.2vw,18px)] gap-[clamp(4px,0.5vw,8px)] border-r border-white/10"
                                    style={{ background: `linear-gradient(90deg, #0d0d0d 70%, transparent)` }}>
                                    <div
                                        className="rounded-full animate-pulse"
                                        style={{ width: 'clamp(6px,0.7vw,10px)', height: 'clamp(6px,0.7vw,10px)', backgroundColor: primaryColor, boxShadow: `0 0 8px ${primaryColor}` }}
                                    />
                                    <span
                                        className="font-black italic uppercase tracking-widest whitespace-nowrap"
                                        style={{ fontSize: 'clamp(7px,0.8vw,13px)', color: primaryColor }}>
                                        EN VIVO
                                    </span>
                                </div>

                                {/* Scroll continuo */}
                                <div
                                    className="flex items-center h-full"
                                    style={{
                                        paddingLeft: 'clamp(80px,12vw,160px)',
                                        animation: `ticker-scroll ${tickerVelocidad}s linear infinite`,
                                        whiteSpace: 'nowrap',
                                    }}>
                                    {/* Dos copias del texto = loop continuo sin salto */}
                                    {[0, 1].map(i => (
                                        <span
                                            key={i}
                                            className="font-black italic uppercase tracking-tighter inline-block"
                                            style={{
                                                fontSize: 'clamp(10px,1.4vw,22px)',
                                                color: i === 0 ? 'white' : 'rgba(255,255,255,0.5)',
                                                paddingRight: 'clamp(40px,8vw,120px)',
                                            }}>
                                            {tickerTexto}
                                            {recentResults.length > 0 && recentResults.map((res: any, idx: number) => (
                                                <span key={`res-${idx}`} className="font-bold opacity-60" style={{ marginLeft: 'clamp(20px,3.5vw,100px)' }}>
                                                    &nbsp;&bull;&nbsp;RESULTADO: {res.t1Name} {res.games_sets?.[0]?.t1 ?? 0}-{res.games_sets?.[0]?.t2 ?? 0} {res.t2Name}
                                                </span>
                                            ))}
                                            {nextMatch && (
                                                <span
                                                    className="font-bold"
                                                    style={{ color: primaryColor, marginLeft: 'clamp(20px,3.5vw,100px)' }}>
                                                    &nbsp;&bull;&nbsp;A CONTINUACIÓN: {nextMatch.t1Name} vs {nextMatch.t2Name}
                                                </span>
                                            )}
                                        </span>
                                    ))}
                                </div>

                                {/* Gradiente que se desvanece a la derecha */}
                                <div
                                    className="absolute right-0 top-0 bottom-0 pointer-events-none"
                                    style={{ width: 'clamp(40px,6vw,80px)', background: 'linear-gradient(to left, #0d0d0d, transparent)' }}
                                />
                            </div>
                        ) : (
                            /* Footer placeholder (mismo alto para no saltar) */
                            <div
                                className="flex-shrink-0 border border-white/[0.04] bg-white/[0.01]"
                                style={{ borderRadius: 'clamp(10px,1.2vw,18px)', height: 'clamp(38px,6.5vh,72px)' }}
                            />
                        )}

                        {/* Overlay animación disparada por el marker (debajo de los puntos) */}
                        <AnimatePresence>
                            {animacionActual?.id && animacionesMarcador[animacionActual.id]?.url && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 pointer-events-none"
                                >
                                    {/\.(gif|webp|mp4|webm|mov)(\?|$)/i.test(animacionesMarcador[animacionActual.id].url) ? (
                                        animacionesMarcador[animacionActual.id].url.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
                                            <video src={animacionesMarcador[animacionActual.id].url} autoPlay muted playsInline className="max-w-full max-h-full object-contain" />
                                        ) : (
                                            <img src={animacionesMarcador[animacionActual.id].url} alt="" className="max-w-full max-h-full object-contain" />
                                        )
                                    ) : (
                                        <img src={animacionesMarcador[animacionActual.id].url} alt="" className="max-w-full max-h-full object-contain" />
                                    )}
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
