'use client';

import { useState, useEffect, use, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    RefreshCw,
    CheckCircle2,
    Stethoscope,
    Monitor,
    Timer,
    Thermometer,
    Minus,
    Plus,
    RotateCcw,
    Settings,
    Flag,
    X,
    Trash2,
    Play,
    Zap,
    Activity,
    ZapOff
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ref, onValue, off, update } from 'firebase/database';
import { rtdb } from '@/lib/rtdb';
import { dispararAnimacionMarcador } from '@/lib/rtdbService';
import { dataService } from '@/lib/dataService';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, updateDoc } from 'firebase/firestore';
import { MatchStatus } from '@/types/tournament';
import { useAuth } from '@/lib/AuthContext';
import RefereeRemoteControl from '@/components/RefereeRemoteControl';
import AutoShrinkName from '@/components/AutoShrinkName';
import { Bluetooth, LayoutDashboard, Search, ListFilter } from 'lucide-react';

export default function RefereeScoreboard({ params }: { params: Promise<{ id: string, matchId: string }> }) {
    const { id, matchId } = use(params);
    const router = useRouter();
    const { user, profile, isAdmin, canMarkInCancha, loading: authLoading } = useAuth();
    const [tournament, setTournament] = useState<any>(null);
    const [match, setMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showMatchSelector, setShowMatchSelector] = useState(false);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [swappingCourtWith, setSwappingCourtWith] = useState<string | null>(null);

    const matchCourt = match?.court ?? (match?.courtIndex != null ? match.courtIndex + 1 : 1);
    const canControl = isAdmin || (profile?.role === 'marker' && canMarkInCancha(`cancha_${matchCourt}`)) || tournament?.ownerId === user?.uid;

    const primaryColor = tournament?.broadcastingSettings?.primaryColor || '#ccff00';
    const [history, setHistory] = useState<any[]>([]);
    const [duration, setDuration] = useState(0);
    const [isGoldenPoint, setIsGoldenPoint] = useState(true);
    const [isMedicalTimeout, setIsMedicalTimeout] = useState(false);
    const [medicalTimeRemaining, setMedicalTimeRemaining] = useState(180); // 3 minutes
    const [showSideChange, setShowSideChange] = useState(false);
    const [tiebreakTo, setTiebreakTo] = useState(7);
    const [finishClicks, setFinishClicks] = useState(0);
    const [now, setNow] = useState(new Date());
    const [animacionesMarcador, setAnimacionesMarcador] = useState<Record<string, { nombre: string; url: string }>>({});
    const [sideChangeAnimations, setSideChangeAnimations] = useState<any[]>([]);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!rtdb) return;
        const animRef = ref(rtdb, 'publicidad_master/animaciones_marcador');
        const handler = (snap: any) => setAnimacionesMarcador(snap.val() || {});
        onValue(animRef, handler);
        return () => off(animRef, 'value', handler);
    }, []);

    useEffect(() => {
        dataService.getAnimations('SIDE_CHANGE')
            .then(setSideChangeAnimations)
            .catch(err => console.error('Error fetching SIDE_CHANGE animations:', err));
    }, []);

    /** Primeras 6 animaciones del marcador (orden estable) para los 6 pads de cada lado */
    const padsAnimaciones = useMemo(() => {
        const entries = Object.entries(animacionesMarcador) as [string, { nombre: string; url: string }][];
        return entries.sort((a, b) => a[0].localeCompare(b[0])).slice(0, 6);
    }, [animacionesMarcador]);

    const handlePadAnimacion = (animId: string) => {
        dispararAnimacionMarcador(`cancha_${matchCourt}`, animId);
    };

    const handleFinishMatch = async () => {
        if (finishClicks < 2) {
            setFinishClicks(prev => prev + 1);
            setTimeout(() => setFinishClicks(0), 3000); // Reset after 3s of inactivity
            return;
        }

        if (!tournament || !match) return;
        await dataService.updateMatch(id, match.id, {
            status: MatchStatus.FINISHED,
            finishedAt: new Date().toISOString()
        });
        router.push(`/tournaments/${id}?tab=live`);
    };

    const updateManualScore = async (side: 't1' | 't2', field: 'games' | 'sets' | 'points', value: any) => {
        if (!tournament || !match) return;
        await dataService.updateMatch(id, match.id, {
            [field]: { ...match[field], [side]: field === 'points' ? value : Math.max(0, value) }
        });
    };


    // ── Persistencia de datos: el reloj NO depende del estado del navegador ─────────────────
    // La hora de inicio (startTime) está en Firestore (startedAt/actualStartTime). Al cerrar
    // o recargar la página, el cronómetro se restaura desde la BD.
    const getMatchStartTimeMs = (m: any): number | null => {
        const raw = m?.startedAt ?? m?.actualStartTime;
        if (raw == null) return null;
        const d = typeof raw?.toDate === 'function' ? raw.toDate() : new Date(raw);
        return isNaN(d.getTime()) ? null : d.getTime();
    };
    const getMatchEndTimeMs = (m: any): number | null => {
        const raw = m?.finishedAt ?? m?.actualEndTime;
        if (raw == null) return null;
        const d = typeof raw?.toDate === 'function' ? raw.toDate() : new Date(raw);
        return isNaN(d.getTime()) ? null : d.getTime();
    };

    // ── Timer robusto ────────────────────────────────────────────────────────
    // El reloj usa startedAt/actualStartTime guardados en Firestore; al reabrir la página el tiempo se restaura.
    const timerRef = useRef<any>(null);

    useEffect(() => {
        if (!match) return;

        const status = match.status as string;

        // Partido FINALIZADO: detener reloj y fijar duración total desde datos guardados
        if (status === MatchStatus.FINISHED) {
            if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
            const startMs = getMatchStartTimeMs(match);
            const endMs = getMatchEndTimeMs(match);
            if (startMs != null && endMs != null) {
                setDuration(Math.floor((endMs - startMs) / 1000));
            }
            return;
        }

        // Partido LIVE o PAUSED: arrancar el reloj y sincronizar con hora guardada (persiste al cerrar/abrir)
        if (status === MatchStatus.LIVE || status === MatchStatus.PAUSED) {
            // Sincronizar duración inicial
            const startMs = getMatchStartTimeMs(match);
            if (startMs != null) {
                const elapsed = Math.floor((Date.now() - startMs) / 1000);
                setDuration(Math.max(0, elapsed));
            } else {
                setDuration(0);
            }

            // Iniciar intervalo si no existe
            if (!timerRef.current) {
                timerRef.current = setInterval(() => {
                    setDuration(prev => prev + 1);
                }, 1000);
            }
            return;
        }

        // PENDING u otro (como CANCELLED): detener reloj
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setDuration(0);

        return () => {
            if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        };
    }, [match?.status, match?.startedAt, match?.actualStartTime, match?.finishedAt, match?.actualEndTime]);

    const startMatch = async () => {
        if (!tournament || !match) return;
        const realId = match.id;
        const courtNum = (m: any) => Number(m?.court ?? (m?.courtIndex != null ? (m.courtIndex as number) + 1 : 0));
        const c = courtNum(match);

        try {
            // Fetch current matches to check court availability
            const currentMatches = await dataService.getMatches(id);
            const otherLiveOnCourt = currentMatches.some((m: any) => m.id !== realId && m.status === MatchStatus.LIVE && courtNum(m) === c);

            if (otherLiveOnCourt) {
                alert(`No puede haber dos partidos en vivo en la misma pista. Ya hay un partido en vivo en la pista ${c}.`);
                return;
            }
            const nowIso = new Date().toISOString();
            await dataService.updateMatch(id, realId, {
                status: MatchStatus.LIVE,
                startedAt: nowIso,
                actualStartTime: nowIso
            });
            // Update local state immediately to trigger timer without waiting for subscription
            setMatch((prev: any) => prev ? { ...prev, status: MatchStatus.LIVE, startedAt: nowIso, actualStartTime: nowIso } : prev);
        } catch (err) {
            console.error('[startMatch] Error:', err);
            alert('Error al iniciar el partido. Por favor, reintenta.');
        }
    };

    // Medical Timer logic — reinicia en loop hasta que el árbitro pulse Reanudar
    useEffect(() => {
        if (!isMedicalTimeout) return;

        const interval = setInterval(() => {
            setMedicalTimeRemaining(prev => {
                if (prev <= 1) {
                    // Llegó a 0 → reiniciar automáticamente
                    return 180;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isMedicalTimeout]);

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (!id) return;

        // Si authLoading es true, esperamos a que termine antes de lanzar las peticiones iniciales
        // Pero no reiniciamos todo el efecto si authLoading cambia después (para evitar bucles)
        if (authLoading && !tournament) return;

        // Solo marcar como cargando la primera vez para evitar parpadeos en re-renders del efecto
        if (!tournament) setLoading(true);

        let currentTournament: any = null;
        let currentMatches: any[] = [];

        const updateAll = (t: any, ms: any[]) => {
            if (!t || !ms) return;
            setTournament(t);
            if (t.scoringSystem) {
                setIsGoldenPoint(t.scoringSystem === 'GOLDEN_POINT');
            }

            // Resolver partido
            let foundMatchRaw = ms.find((m: any) => m.id === matchId);

            if (!foundMatchRaw) {
                const courtNum = matchId.startsWith('court_')
                    ? parseInt(matchId.replace('court_', ''))
                    : matchId.startsWith('match_')
                        ? parseInt(matchId.replace('match_', '')) + 1
                        : parseInt(matchId);

                if (!isNaN(courtNum)) {
                    foundMatchRaw = ms.find((m: any) =>
                        (m.court || (m.courtIndex !== undefined ? m.courtIndex + 1 : undefined)) === courtNum
                    ) ?? ms[courtNum - 1] ?? null;
                } else {
                    foundMatchRaw = ms[0] ?? null;
                }
            }

            if (foundMatchRaw) {
                const foundMatch = {
                    ...foundMatchRaw,
                    court: foundMatchRaw.court || (foundMatchRaw.courtIndex !== undefined ? foundMatchRaw.courtIndex + 1 : undefined),
                };

                // Team resolution logic
                const resolveNames = (embeddedTeam: any, teamIdx: number, matchTeamName?: string) => {
                    // Support for embedded teams (new Master Generator)
                    if (embeddedTeam && (embeddedTeam.p1 || embeddedTeam.p1Name || embeddedTeam.isTBD || embeddedTeam.teamLabel)) {
                        const p1n = (embeddedTeam.p1Name || embeddedTeam.p1?.name || '').trim();
                        const p2n = (embeddedTeam.p2Name || embeddedTeam.p2?.name || '').trim();
                        const p1Final = embeddedTeam.isTBD ? (embeddedTeam.teamLabel || 'TBD') : (p1n || `Jugador ${(teamIdx * 2) - 1}`);
                        const p2Final = embeddedTeam.isTBD ? '' : (p2n || `Jugador ${teamIdx * 2}`);
                        const p1Photo = embeddedTeam.p1?.photo || null;
                        const p2Photo = embeddedTeam.p2?.photo || null;
                        return { p1: p1Final, p2: p2Final, full: [p1Final, p2Final].filter(Boolean).join(' / '), p1Photo, p2Photo };
                    }
                    // Legacy support
                    const teams = t?.teams || [];
                    const legacyTeam = teamIdx > 0 ? teams[teamIdx - 1] : null;
                    if (!legacyTeam) return { p1: '?', p2: '?', full: matchTeamName || '?', p1Photo: null, p2Photo: null };
                    const p1n = legacyTeam.p1?.name || 'Jugador 1';
                    const p2n = legacyTeam.p2?.name || 'Jugador 2';
                    return { p1: p1n, p2: p2n, full: `${p1n} / ${p2n}`, p1Photo: legacyTeam.p1?.photo || null, p2Photo: legacyTeam.p2?.photo || null };
                };

                const t1 = resolveNames(foundMatch.team1, foundMatch.team1Index ?? 0, foundMatch.team1Name);
                const t2 = resolveNames(foundMatch.team2, foundMatch.team2Index ?? 0, foundMatch.team2Name);

                setMatch({
                    ...foundMatch,
                    team1: t1,
                    team2: t2,
                });
            }
            setLoading(false);
        };

        // 1. Supabase Subscriptions
        const unsubT = dataService.subscribeToTournament(id, (tourneyData) => {
            if (!tourneyData) return;
            currentTournament = tourneyData;
            if (currentMatches.length > 0) updateAll(currentTournament, currentMatches);
        });

        const unsubMatches = dataService.subscribeToMatches(id, (matchesData) => {
            if (!matchesData || matchesData.length === 0) return;
            currentMatches = matchesData;
            if (currentTournament) updateAll(currentTournament, currentMatches);
        });

        // 2. Firestore Subscriptions
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

        // Safety timeout
        const timeout = setTimeout(() => setLoading(false), 10000);

        return () => {
            if (typeof unsubT === 'function') unsubT();
            if (typeof unsubMatches === 'function') unsubMatches();
            unsubFT();
            unsubFM();
            clearTimeout(timeout);
        };
    }, [id, matchId]);

    const saveHistory = () => {
        if (match) {
            setHistory(prev => [...prev, JSON.parse(JSON.stringify(match))].slice(-10));
        }
    };

    const undoPoint = async () => {
        if (history.length === 0 || !match) return;
        const previousState = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));

        const updatedData = {
            points: previousState.points,
            games: previousState.games,
            sets: previousState.sets,
            server: previousState.server,
            isTiebreak: previousState.isTiebreak ?? false
        };

        // Actualización optimista
        setMatch({ ...match, ...updatedData });

        try {
            await dataService.updateMatch(id, match.id, updatedData);
        } catch (err) {
            console.error('[undoPoint] Error:', err);
            setMatch(match);
            alert('Error al deshacer el último punto.');
        }
    };

    const updateScore = async (side: 't1' | 't2', action: 'plus' | 'minus') => {
        if (!tournament || !match) return;

        if (action === 'minus') {
            undoPoint();
            return;
        }

        saveHistory();

        const otherSide = side === 't1' ? 't2' : 't1';
        let newPoints = {
            t1: match.points?.t1 || '0',
            t2: match.points?.t2 || '0',
            ...match.points
        };

        let optimisticMatch = { ...match };

        // ── Lógica de Tiebreak ───────────────────────────────────────────
        if (match.isTiebreak) {
            const currentP = parseInt(newPoints[side] || '0');
            const otherP = parseInt(newPoints[otherSide] || '0');
            const nextP = currentP + 1;
            newPoints[side] = nextP.toString();

            // Rotación de saque en Tiebreak
            const totalPoints = nextP + otherP;
            let nextServer = { ...match.server };
            if (totalPoints === 1 || (totalPoints > 1 && (totalPoints - 1) % 2 === 0)) {
                const nextTeam = match.server.team === 1 ? 2 : 1;
                const nextPlayer = match.server.player === 1 ? 2 : 1;
                nextServer = { team: nextTeam as 1 | 2, player: nextPlayer as 1 | 2 };
            }

            // Verificar ganador de tiebreak
            const target = match.tiebreakTo || tiebreakTo;
            if (nextP >= target && (nextP - otherP) >= 2) {
                await winGame(side);
                return;
            }

            const updatedData = { points: newPoints, server: nextServer };
            // Actualización optimista
            setMatch({ ...match, ...updatedData });
            try {
                await dataService.updateMatch(id, match.id, updatedData);
            } catch (err) {
                console.error('[updateScore Tiebreak] Error:', err);
                setMatch(match); // Revertir en caso de error
                alert('No se pudo guardar el punto. Verifica tu conexión.');
            }
            return;
        }

        // ── Lógica Tradicional / Punto de Oro ─────────────────────────────
        const points = ['0', '15', '30', '40', 'AD'];
        const currentPoints = newPoints[side];
        const otherPoints = newPoints[otherSide];

        if (currentPoints === '40') {
            if (otherPoints === '40') {
                if (isGoldenPoint) {
                    await winGame(side);
                    return;
                } else {
                    newPoints[side] = 'AD';
                }
            } else if (otherPoints === 'AD') {
                newPoints[otherSide] = '40';
            } else {
                await winGame(side);
                return;
            }
        } else if (currentPoints === 'AD') {
            await winGame(side);
            return;
        } else {
            const nextIdx = points.indexOf(currentPoints);
            if (nextIdx !== -1 && nextIdx < points.length - 1) {
                newPoints[side] = points[nextIdx + 1];
            } else {
                newPoints[side] = '15'; // Fallback
            }
        }

        // Actualización optimista
        setMatch({ ...match, points: newPoints });
        try {
            await dataService.updateMatch(id, match.id, { points: newPoints });
        } catch (err) {
            console.error('[updateScore] Error:', err);
            setMatch(match); // Revertir
            alert('Error al sincronizar el punto. Reintentando...');
        }
    };

    const winGame = async (side: 't1' | 't2') => {
        let newGames = { t1: match.games?.t1 || 0, t2: match.games?.t2 || 0 };
        const g1Before = newGames.t1;
        const g2Before = newGames.t2;
        const totalGamesBefore = g1Before + g2Before;

        if (match.isTiebreak) {
            newGames[side]++;
            await winSet(side, newGames);
            return;
        }

        newGames[side]++;
        const g1 = newGames.t1;
        const g2 = newGames.t2;
        const totalGames = g1 + g2;

        // Avisar cambio de cancha en games impares terminados (1, 3, 5...)
        if (totalGames % 2 === 1) {
            setShowSideChange(true);
            // Disparar animación de cambio de cancha si existen en la biblioteca
            if (sideChangeAnimations.length > 0) {
                const randomAnim = sideChangeAnimations[Math.floor(Math.random() * sideChangeAnimations.length)];
                // Usamos un ID temporal o especial para indicar que viene de la biblioteca de Supabase
                // Para que el display lo entienda, necesitamos que el display también pueda leer de Supabase
                // O mandamos la URL directamente si el receptor lo soporta.
                // Ajustemos dispararAnimacionMarcador para aceptar un objeto completo.
                const pathRef = ref(rtdb!, `canchas/cancha_${matchCourt}/animacion_actual`);
                update(pathRef, {
                    id: randomAnim.id,
                    url: randomAnim.url, // Pasamos la URL directamente para que el display no necesite buscarla
                    ts: Date.now()
                });
            }
        }

        // Rotación de sacador
        const team = (totalGames % 2 === 0) ? 1 : 2;
        const teamNumTurns = Math.floor(totalGames / 2);
        const player = (teamNumTurns % 2 === 0) ? 1 : 2;
        const nextServer = { team: team as 1 | 2, player: player as 1 | 2 };

        // ── Lógica de Set ────────────────────────────────────────────────
        const isEntryTiebreak = g1 === 6 && g2 === 6;
        const isSetFinished = (g1 >= 6 && g1 - g2 >= 2) || (g2 >= 6 && g2 - g1 >= 2) || g1 === 7 || g2 === 7;

        if (isSetFinished) {
            await winSet(side, newGames);
        } else if (isEntryTiebreak) {
            const updatedData = {
                games: newGames,
                points: { t1: '0', t2: '0' },
                isTiebreak: true,
                server: nextServer
            };
            setMatch({ ...match, ...updatedData });
            try {
                await dataService.updateMatch(id, match.id, updatedData);
            } catch (err) {
                console.error('[winGame Tiebreak] Error:', err);
                setMatch(match);
                alert('Error al entrar en Tiebreak.');
            }
        } else {
            // Juego Normal
            const updatedData = {
                games: newGames,
                points: { t1: '0', t2: '0' },
                server: nextServer
            };
            setMatch({ ...match, ...updatedData });
            try {
                await dataService.updateMatch(id, match.id, updatedData);
            } catch (err) {
                console.error('[winGame] Error:', err);
                setMatch(match);
                alert('Error al guardar el juego ganado.');
            }
        }
    };

    const winSet = async (side: 't1' | 't2', finalGames: { t1: number, t2: number }) => {
        let newSets = { t1: match.sets?.t1 || 0, t2: match.sets?.t2 || 0 };
        newSets[side]++;

        const isSuperTiebreakSet = (match.superTiebreak || match.matchFormat === 'SUPER_TIEBREAK') && (match.setScores?.length === 2 || ((match.sets?.t1 ?? 0) + (match.sets?.t2 ?? 0)) === 1);
        const newSetScores = isSuperTiebreakSet
            ? (match.setScores || [])
            : [...(match.setScores || []), { t1: finalGames.t1, t2: finalGames.t2 }];

        const isMatchFinished = newSets[side] >= (match.matchFormat === 'ONE_SET_6' || match.matchFormat === 'ONE_SET_9' ? 1 : 2);
        const stbScore = isMatchFinished && isSuperTiebreakSet && match.points
            ? { t1: parseInt(String(match.points.t1 || 0), 10), t2: parseInt(String(match.points.t2 || 0), 10) }
            : (match.superTiebreakScore ?? undefined);

        const updatedData = {
            games: isMatchFinished ? finalGames : { t1: 0, t2: 0 },
            points: { t1: '0', t2: '0' },
            sets: newSets,
            setScores: newSetScores,
            ...(stbScore != null ? { superTiebreakScore: stbScore } : {}),
            isTiebreak: false,
            status: isMatchFinished ? MatchStatus.FINISHED : match.status,
            finishedAt: isMatchFinished ? new Date().toISOString() : match.finishedAt || null
        };

        // Actualización optimista
        setMatch({ ...match, ...updatedData });

        try {
            await dataService.updateMatch(id, match.id, updatedData);
            if (isMatchFinished && id) {
                setTimeout(() => {
                    window.location.href = `/tournaments/${id}`;
                }, 3000);
            }
        } catch (err) {
            console.error('[winSet] Error:', err);
            setMatch(match);
            alert('Error al finalizar el set. Por favor, revisa tu conexión.');
        }
    };

    // ── Lógica de selección de sacador ───────────────────────────────────
    // Un estado local para detectar doble-click rápido
    const lastClickRef = { team: 0, player: 0, ts: 0 };
    const DOUBLE_CLICK_MS = 350;

    const setSpecificServer = async (team: number, player: number) => {
        if (!tournament || !match) return;
        await dataService.updateMatch(id, match.id, { server: { team, player } });
    };

    /** Intercambia la cancha del partido actual con un partido pendiente (no iniciado). */
    const swapCourtWithPendingMatch = async (otherMatch: any) => {
        if (!tournament || !match || otherMatch.id === match.id) return;
        setSwappingCourtWith(otherMatch.id);
        try {
            const curCourt = match.court ?? (match.courtIndex != null ? match.courtIndex + 1 : 1);
            const curCourtIndex = typeof match.courtIndex === 'number' ? match.courtIndex : curCourt - 1;
            const otherCourt = otherMatch.court ?? (otherMatch.courtIndex != null ? otherMatch.courtIndex + 1 : 1);
            const otherCourtIndex = typeof otherMatch.courtIndex === 'number' ? otherMatch.courtIndex : otherCourt - 1;

            // Swap courts in parallel
            await Promise.all([
                dataService.updateMatch(id, match.id, { court: otherCourt, courtIndex: otherCourtIndex }),
                dataService.updateMatch(id, otherMatch.id, { court: curCourt, courtIndex: curCourtIndex })
            ]);

            setShowMatchSelector(false);
            router.push(`/tournaments/${id}/score/${otherMatch.id}`);
        } catch (e) {
            console.error('[swapCourtWithPendingMatch]', e);
        } finally {
            setSwappingCourtWith(null);
        }
    };

    const handlePlayerIconClick = async (team: number, player: number) => {
        const now = Date.now();
        const isSamePlayer = lastClickRef.team === team && lastClickRef.player === player;
        const isDoubleClick = isSamePlayer && (now - lastClickRef.ts) < DOUBLE_CLICK_MS;

        lastClickRef.team = team;
        lastClickRef.player = player;
        lastClickRef.ts = now;

        if (isDoubleClick) {
            // Doble click: revertir (undo del servidor)
            await undoPoint();
        } else {
            // Single click: asignar este jugador como sacador
            await setSpecificServer(team, player);
        }
    };

    const toggleServingPlayer = async () => {
        if (!match) return;
        saveHistory();
        const currentServer = match.server || { team: 1, player: 1 };
        await dataService.updateMatch(id, match.id, { server: { ...currentServer, player: currentServer.player === 1 ? 2 : 1 } });
    };

    const toggleServingTeam = async () => {
        if (!match) return;
        saveHistory();
        const currentServer = match.server || { team: 1, player: 1 };
        await dataService.updateMatch(id, match.id, { server: { ...currentServer, team: currentServer.team === 1 ? 2 : 1 } });
    };

    const handleMedicalTimeout = async () => {
        if (!tournament || !match) return;
        const newStatus = isMedicalTimeout ? MatchStatus.LIVE : MatchStatus.PAUSED;

        if (!isMedicalTimeout) {
            setMedicalTimeRemaining(180); // Reset to 3 mins
        }

        setIsMedicalTimeout(!isMedicalTimeout);

        await dataService.updateMatch(id, match.id, { status: newStatus });
    };

    // Si está cargando auth o el perfil aún no llega (pero hay usuario), seguimos en loading para evitar parpadeos de acceso restringido
    if (loading || authLoading || (user && !profile)) return (
        <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-padel-primary animate-spin" />
        </div>
    );

    if (!canControl) {

        return (
            <div className="h-screen bg-[#0a0a0a] flex items-center justify-center p-10">
                <div className="max-w-md w-full bg-[#111] border border-white/10 rounded-[2.5rem] p-10 text-center">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Monitor className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-white">Acceso Restringido</h2>
                    <p className="text-gray-400 text-sm font-medium mb-8">Solo el personal autorizado (ADMIN o MARKER) puede controlar el marcador de este partido.</p>
                    <button
                        onClick={() => {
                            const tab = match?.status === MatchStatus.LIVE ? 'live' : 'por-comenzar';
                            router.push(`/tournaments/${id}?tab=${tab}`);
                        }}
                        className="w-full py-4 bg-white text-black rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all"
                    >
                        Volver al Torneo
                    </button>
                </div>
            </div>
        );
    }

    if (!match) return <div className="h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-black italic uppercase">Partido no encontrado</div>;

    const server = match.server || { team: 1, player: 1 };

    return (
        <div className="fixed inset-0 bg-[#070707] text-white flex flex-col font-sans select-none overflow-hidden touch-none p-1.5 gap-1.5 premium-gradient">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-padel-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-padel-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <motion.div
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.1, 1]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(204,255,0,0.03)_0%,transparent_70%)] pointer-events-none"
            />

            {/* Rectangle 1: Header */}
            <header className="h-20 px-6 flex items-center justify-between relative z-50 glass rounded-[1.5rem] shadow-2xl shrink-0">
                {/* Side Change Alert */}
                <AnimatePresence>
                    {showSideChange && (
                        <motion.div
                            initial={{ y: -100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -100, opacity: 0 }}
                            className="absolute inset-x-0 -bottom-16 flex justify-center z-[60]"
                        >
                            <div className="bg-padel-primary text-black px-8 py-4 rounded-2xl flex items-center gap-4 shadow-2xl border-b-4 border-black/20">
                                <RefreshCw className="w-6 h-6 animate-spin-slow" />
                                <div className="flex flex-col">
                                    <span className="font-black italic uppercase text-lg leading-none">Cambio de Cancha</span>
                                    <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Juego Impar Finalizado</span>
                                </div>
                                <button
                                    onClick={() => setShowSideChange(false)}
                                    className="ml-4 w-8 h-8 flex items-center justify-center rounded-lg bg-black/10 hover:bg-black/20 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center gap-6">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            const tab = match?.status === MatchStatus.LIVE ? 'live' : 'por-comenzar';
                            router.push(`/tournaments/${id}?tab=${tab}`);
                        }}
                        className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group shrink-0"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-400 group-hover:text-padel-primary transition-colors" />
                    </motion.button>

                    <div className="flex flex-col items-center select-none">
                        <h1 className="label-cancha-hero mb-2 text-center">
                            {match.courtName || (match.court ? `Pista ${match.court}` : 'Pista 1')}
                        </h1>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-lg font-black italic uppercase text-white/80 leading-none tracking-tight text-center">
                                {match.roundName || match.groupName || 'Fase de Grupos'}
                            </span>
                            <span className="text-sm font-black italic uppercase text-white/60 leading-none tracking-tight text-center">
                                {tournament?.gender === 'FEMALE' ? 'Femenino' : tournament?.gender === 'MALE' ? 'Masculino' : 'Mixto'}
                            </span>
                            <span className="text-lg font-black italic uppercase text-padel-primary leading-none tracking-tight flex items-center gap-2 text-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-padel-primary/40" />
                                {tournament?.category?.replace('MAS_', '+').replace('_', ' ') || match.category || 'Categoría Principal'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Center: Match Control (Timer) */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 flex items-center">
                    {match.status === MatchStatus.PENDING ? (
                        <div className="flex flex-col items-center gap-4">
                            <motion.button
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                whileHover={{ scale: 1.05, backgroundColor: '#ccff00', color: '#000' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={startMatch}
                                className="flex items-center gap-4 px-12 py-5 bg-padel-primary text-black rounded-b-3xl font-black italic uppercase tracking-[0.2em] shadow-[0_10px_40px_-10px_rgba(204,255,0,0.3)] transition-all border-x border-b border-black/10 backdrop-blur-md"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                Empezar Partido
                            </motion.button>

                            <div className="flex flex-col items-center leading-none select-none">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1.5">
                                    {now.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
                                </span>
                                <span className="text-xl font-black italic uppercase tracking-tighter text-white/50 tabular-nums">
                                    {now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center bg-white/[0.03] border-x border-b border-white/10 px-8 py-3 rounded-b-3xl backdrop-blur-xl shadow-2xl">
                            <span className="text-4xl font-black tracking-tighter tabular-nums italic text-white text-glow leading-none">
                                {formatDuration(duration)}
                            </span>
                            <div className="flex items-center gap-2 mt-2">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-1.5 h-1.5 rounded-full bg-padel-primary shadow-[0_0_10px_#ccff00]"
                                />
                                <span className="text-[9px] font-black italic tracking-[0.3em] uppercase text-padel-primary/80">
                                    Tiempo de Juego
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Technical Info & Actions */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        {[
                            { icon: RefreshCw, onClick: () => setShowMatchSelector(true), color: 'hover:text-padel-primary', label: 'Cambiar Pista' },
                            { icon: Settings, onClick: () => setShowAdjustModal(true), color: 'hover:text-white', label: 'Ajustes' },
                            {
                                icon: Plus,
                                onClick: handleMedicalTimeout,
                                isMedical: true,
                                label: 'Asistencia Médica'
                            },
                        ].map((btn, idx) => (
                            <motion.button
                                key={idx}
                                whileHover={{ scale: 1.05, backgroundColor: btn.isMedical ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={btn.onClick}
                                className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all border ${btn.isMedical
                                    ? 'bg-red-500/10 border-red-500/30 text-red-500'
                                    : 'text-gray-500 border-white/5 ' + btn.color
                                    }`}
                                title={btn.label}
                            >
                                {btn.isMedical ? (
                                    <div className="relative w-5 h-5 flex items-center justify-center">
                                        <div className="absolute w-5 h-1.5 bg-current rounded-full" />
                                        <div className="absolute w-1.5 h-5 bg-current rounded-full" />
                                    </div>
                                ) : (
                                    <btn.icon className="w-5 h-5" />
                                )}
                            </motion.button>
                        ))}

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleFinishMatch}
                            className={`px-6 py-3.5 rounded-xl text-[10px] font-black italic uppercase tracking-[0.15em] transition-all ${finishClicks === 0
                                ? 'bg-white/5 border border-white/10 text-white/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
                                : finishClicks === 1
                                    ? 'bg-orange-500 text-white border-orange-600'
                                    : 'bg-red-600 text-white'
                                }`}
                        >
                            {finishClicks === 0 ? 'Finalizar' : finishClicks === 1 ? '¿Seguro?' : 'Confirmar'}
                        </motion.button>
                    </div>
                </div>
            </header>

            {/* Rectangle 2 & 3: Middle Content */}
            <main className="flex-1 flex flex-wrap gap-1.5 min-h-0 overflow-hidden content-start">
                {/* Team 1 Card */}
                <div className="flex-1 glass rounded-[2rem] p-4 flex flex-col items-center relative overflow-hidden group shadow-2xl min-w-[280px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-padel-primary/[0.04] to-transparent opacity-50" />

                    {/* Players Section — centrado: J1, J2 con mismo tamaño; servicio = solo borde amarillo */}
                    <div className="flex justify-center items-start gap-4 mb-3 relative z-10 w-full">
                        {[1, 2].map((pNum) => {
                            const isServer = server.team === 1 && server.player === pNum;
                            const playerName = pNum === 1 ? match.team1.p1 : match.team1.p2;
                            const jLabel = pNum === 1 ? 'J1' : 'J2';

                            return (
                                <div key={pNum} className="flex flex-col items-center gap-4 max-w-[140px] shrink-0">
                                    <div
                                        onClick={() => handlePlayerIconClick(1, pNum)}
                                        className="relative w-16 h-16 rounded-2xl transition-all duration-500 cursor-pointer flex items-center justify-center opacity-90 hover:opacity-100"
                                    >
                                        <div className={`w-full h-full rounded-2xl flex items-center justify-center border-4 transition-colors ${isServer ? 'border-padel-primary' : 'border-white/10'}`}>
                                            <span className="text-lg font-black italic text-white/90">{jLabel}</span>
                                        </div>
                                    </div>
                                    <AutoShrinkName
                                        name={playerName}
                                        className={`text-sm font-black italic uppercase tracking-tighter text-center transition-colors ${isServer ? 'text-padel-primary' : 'text-white/60'}`}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* Vertical Stats (Games/Sets) on the inner edge */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-20 bg-black/20 backdrop-blur-md border border-white/5 py-4 px-2.5 rounded-2xl">
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black uppercase text-gray-500 tracking-[0.2em] mb-1">G</span>
                            <span className="text-4xl font-black italic tabular-nums text-padel-primary leading-none">
                                {match.games?.t1 ?? 0}
                            </span>
                        </div>
                        <div className="w-6 h-px bg-white/10" />
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black uppercase text-gray-500 tracking-[0.2em] mb-1">S</span>
                            <span className="text-4xl font-black italic tabular-nums text-white leading-none">
                                {match.sets?.t1 ?? 0}
                            </span>
                        </div>
                    </div>

                    {/* Central Points Control (marcador del game) — centrado */}
                    <div className="flex items-center justify-center gap-2.5 p-1 bg-black/40 border border-white/10 rounded-2xl mb-3 relative z-10 shadow-inner w-full">
                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.08)' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateScore('t1', 'minus')}
                            className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/20 hover:text-white/60 transition-colors border border-white/10"
                        >
                            <Minus className="w-5 h-5" />
                        </motion.button>

                        <div className="flex flex-col items-center px-4 min-w-[80px]">
                            <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest mb-0.5">Points</span>
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={match.points?.t1}
                                    initial={{ y: 5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -5, opacity: 0 }}
                                    className="text-4xl font-black italic tabular-nums text-white leading-none text-glow"
                                >
                                    {match.points?.t1 || '0'}
                                </motion.span>
                            </AnimatePresence>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(204,255,0,0.15)' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateScore('t1', 'plus')}
                            className="w-10 h-10 rounded-full bg-padel-primary/10 border border-padel-primary/20 flex items-center justify-center text-padel-primary hover:border-padel-primary/40 transition-all shadow-[0_5px_15px_-5px_rgba(204,255,0,0.3)]"
                        >
                            <Plus className="w-6 h-6" />
                        </motion.button>
                    </div>
                    {/* 6 performance pads equipo 1 — numerados 1 a 6 */}
                    <div className="flex flex-col gap-2 w-full max-w-[200px] mx-auto">
                        <div className="grid grid-cols-3 gap-2.5">
                            {[1, 2, 3].map((i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.02, boxShadow: '0 6px 20px -4px rgba(204,255,0,0.25)' }}
                                    whileTap={{ scale: 0.92, boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.4)' }}
                                    className="aspect-square min-h-[38px] rounded-xl bg-gradient-to-b from-zinc-700/90 to-zinc-900 border border-white/20 text-[10px] font-black tabular-nums text-white/90 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.5)] hover:border-padel-primary/40 hover:from-zinc-600/90 hover:to-zinc-800 active:from-zinc-800 active:to-zinc-950 transition-colors"
                                >
                                    {i}
                                </motion.button>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2.5">
                            {[4, 5, 6].map((i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.02, boxShadow: '0 6px 20px -4px rgba(204,255,0,0.25)' }}
                                    whileTap={{ scale: 0.92, boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.4)' }}
                                    className="aspect-square min-h-[38px] rounded-xl bg-gradient-to-b from-zinc-700/90 to-zinc-900 border border-white/20 text-[10px] font-black tabular-nums text-white/90 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.5)] hover:border-padel-primary/40 hover:from-zinc-600/90 hover:to-zinc-800 active:from-zinc-800 active:to-zinc-950 transition-colors"
                                >
                                    {i}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>


                {/* Team 2 Card */}
                <div className="flex-1 glass rounded-[2rem] p-4 flex flex-col items-center relative overflow-hidden group shadow-2xl min-w-[280px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-padel-primary/[0.04] to-transparent opacity-50" />

                    {/* Players Section — centrado: J3, J4 con mismo tamaño; servicio = solo borde amarillo */}
                    <div className="flex justify-center items-start gap-4 mb-4 relative z-10 w-full">
                        {[1, 2].map((pNum) => {
                            const isServer = server.team === 2 && server.player === pNum;
                            const playerName = pNum === 1 ? match.team2.p1 : match.team2.p2;
                            const jLabel = pNum === 1 ? 'J3' : 'J4';

                            return (
                                <div key={pNum} className="flex flex-col items-center gap-4 max-w-[140px] shrink-0">
                                    <div
                                        onClick={() => handlePlayerIconClick(2, pNum)}
                                        className="relative w-16 h-16 rounded-2xl transition-all duration-500 cursor-pointer flex items-center justify-center opacity-90 hover:opacity-100"
                                    >
                                        <div className={`w-full h-full rounded-2xl flex items-center justify-center border-4 transition-colors ${isServer ? 'border-padel-primary' : 'border-white/10'}`}>
                                            <span className="text-lg font-black italic text-white/90">{jLabel}</span>
                                        </div>
                                    </div>
                                    <AutoShrinkName
                                        name={playerName}
                                        className={`text-sm font-black italic uppercase tracking-tighter text-center transition-colors ${isServer ? 'text-padel-primary' : 'text-white/60'}`}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* Vertical Stats (Games/Sets) on the inner edge */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-20 bg-black/20 backdrop-blur-md border border-white/5 py-4 px-2.5 rounded-2xl">
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black uppercase text-gray-500 tracking-[0.2em] mb-1">G</span>
                            <span className="text-4xl font-black italic tabular-nums text-padel-primary leading-none">
                                {match.games?.t2 ?? 0}
                            </span>
                        </div>
                        <div className="w-6 h-px bg-white/10" />
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black uppercase text-gray-500 tracking-[0.2em] mb-1">S</span>
                            <span className="text-4xl font-black italic tabular-nums text-white leading-none">
                                {match.sets?.t2 ?? 0}
                            </span>
                        </div>
                    </div>

                    {/* Central Points Control (marcador del game) — centrado */}
                    <div className="flex items-center justify-center gap-2.5 p-1 bg-black/40 border border-white/10 rounded-2xl mb-3 relative z-10 shadow-inner w-full">
                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.08)' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateScore('t2', 'minus')}
                            className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/20 hover:text-white/60 transition-colors border border-white/10"
                        >
                            <Minus className="w-5 h-5" />
                        </motion.button>

                        <div className="flex flex-col items-center px-4 min-w-[80px]">
                            <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest mb-0.5">Points</span>
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={match.points?.t2}
                                    initial={{ y: 5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -5, opacity: 0 }}
                                    className="text-4xl font-black italic tabular-nums text-white leading-none text-glow"
                                >
                                    {match.points?.t2 || '0'}
                                </motion.span>
                            </AnimatePresence>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(204,255,0,0.15)' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateScore('t2', 'plus')}
                            className="w-10 h-10 rounded-full bg-padel-primary/10 border border-padel-primary/20 flex items-center justify-center text-padel-primary hover:border-padel-primary/40 transition-all shadow-[0_5px_15px_-5px_rgba(204,255,0,0.3)]"
                        >
                            <Plus className="w-6 h-6" />
                        </motion.button>
                    </div>
                    {/* 6 performance pads equipo 2 — numerados 7 a 12 */}
                    <div className="flex flex-col gap-2 w-full max-w-[200px] mx-auto">
                        <div className="grid grid-cols-3 gap-2.5">
                            {[7, 8, 9].map((i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.02, boxShadow: '0 6px 20px -4px rgba(204,255,0,0.25)' }}
                                    whileTap={{ scale: 0.92, boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.4)' }}
                                    className="aspect-square min-h-[38px] rounded-xl bg-gradient-to-b from-zinc-700/90 to-zinc-900 border border-white/20 text-[10px] font-black tabular-nums text-white/90 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.5)] hover:border-padel-primary/40 hover:from-zinc-600/90 hover:to-zinc-800 active:from-zinc-800 active:to-zinc-950 transition-colors"
                                >
                                    {i}
                                </motion.button>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2.5">
                            {[10, 11, 12].map((i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.02, boxShadow: '0 6px 20px -4px rgba(204,255,0,0.25)' }}
                                    whileTap={{ scale: 0.92, boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.4)' }}
                                    className="aspect-square min-h-[38px] rounded-xl bg-gradient-to-b from-zinc-700/90 to-zinc-900 border border-white/20 text-[10px] font-black tabular-nums text-white/90 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.5)] hover:border-padel-primary/40 hover:from-zinc-600/90 hover:to-zinc-800 active:from-zinc-800 active:to-zinc-950 transition-colors"
                                >
                                    {i}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Animaciones pizarra: botones debajo de los puntos del game (disparan en la pantalla de la pizarra) */}
                {Object.keys(animacionesMarcador).length > 0 && (
                    <div className="w-full flex-[1_1_100%] flex flex-col gap-1 p-2 bg-black/30 border border-white/10 rounded-xl self-start">
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Animaciones pizarra</span>
                        <div className="flex flex-wrap gap-1.5">
                            {Object.entries(animacionesMarcador).map(([animId, a]) => (
                                <motion.button
                                    key={animId}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => dispararAnimacionMarcador(`cancha_${matchCourt}`, animId)}
                                    className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-padel-primary hover:bg-padel-primary/10 hover:border-padel-primary/30 transition-all flex items-center gap-1.5"
                                >
                                    <Zap className="w-3.5 h-3.5" />
                                    {a.nombre || animId}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Rectangle 4: Footer */}
            <footer className="h-12 px-6 flex items-center justify-between relative z-10 glass rounded-[1.2rem] shadow-2xl gap-6 shrink-0">
                {/* Switch de Punto de Oro */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsGoldenPoint(!isGoldenPoint)}
                    className={`flex-[0.6] flex items-center justify-between px-5 py-2.5 rounded-[1.5rem] border transition-all duration-500 cursor-pointer ${isGoldenPoint
                        ? 'bg-padel-primary/10 border-padel-primary/30 shadow-[0_0_20px_rgba(204,255,0,0.1)]'
                        : 'bg-white/[0.03] border-white/10'
                        }`}
                >
                    <div className="flex flex-col">
                        <span className={`text-[9px] font-black italic uppercase tracking-[0.25em] ${isGoldenPoint ? 'text-padel-primary' : 'text-gray-500'}`}>Golden Point</span>
                    </div>
                    <div className="relative w-10 h-5 bg-black/60 rounded-full border border-white/10 p-0.5">
                        <motion.div
                            animate={{
                                x: isGoldenPoint ? 20 : 0,
                                backgroundColor: isGoldenPoint ? '#ccff00' : '#444',
                            }}
                            className="w-4 h-4 rounded-full"
                        />
                    </div>
                </motion.div>

                {/* Referee Action Dock */}
                <div className="flex-[1.4] flex items-center gap-4 h-full">
                    <div className="h-8 w-px bg-white/5 mx-2" />

                    <RefereeRemoteControl
                        onTeamAPoint={() => updateScore('t1', 'plus')}
                        onTeamBPoint={() => updateScore('t2', 'plus')}
                        onUndo={undoPoint}
                    />

                </div>

                {/* Status Indicator */}
                <div className="flex-1 flex items-center justify-end gap-6 h-full">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Status</span>
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            <span className="text-xs font-bold text-white/60">Cloud Sync Active</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Overlays */}
            <AnimatePresence>
                {/* Medical Timeout Overlay — Animación cinematográfica */}
                {isMedicalTimeout && (
                    <motion.div
                        key="medical-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.4 } }}
                        className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
                        style={{ background: 'radial-gradient(ellipse at center, #1a0000 0%, #000 70%)' }}
                    >
                        {/* Fondo rojo pulsante */}
                        <motion.div
                            animate={{ opacity: [0.08, 0.18, 0.08] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute inset-0"
                            style={{ background: 'radial-gradient(ellipse at center, #dc2626 0%, transparent 70%)' }}
                        />

                        {/* Radar rings */}
                        {[0, 1, 2, 3].map(i => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full border border-red-600/40"
                                initial={{ width: 80, height: 80, opacity: 0.9 }}
                                animate={{ width: 700, height: 700, opacity: 0 }}
                                transition={{
                                    duration: 3.5,
                                    repeat: Infinity,
                                    delay: i * 0.85,
                                    ease: 'easeOut'
                                }}
                            />
                        ))}

                        {/* Cruz médica central */}
                        <div className="relative flex items-center justify-center z-10 mb-10">
                            {/* Glow */}
                            <motion.div
                                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute w-40 h-40 rounded-full blur-3xl"
                                style={{ backgroundColor: '#dc2626' }}
                            />
                            {/* Cruz SVG */}
                            <motion.svg
                                viewBox="0 0 80 80"
                                className="w-32 h-32 relative z-10"
                                animate={{ scale: [1, 1.06, 1] }}
                                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <rect x="30" y="5" width="20" height="70" rx="5" fill="#dc2626" />
                                <rect x="5" y="30" width="70" height="20" rx="5" fill="#dc2626" />
                                {/* Brillo interior */}
                                <rect x="30" y="5" width="8" height="70" rx="5" fill="white" opacity="0.15" />
                                <rect x="5" y="30" width="70" height="8" rx="5" fill="white" opacity="0.15" />
                            </motion.svg>
                        </div>

                        {/* Texto principal */}
                        <div className="relative z-10 text-center space-y-3 mb-12 px-8">
                            <motion.h2
                                animate={{ opacity: [1, 0.6, 1] }}
                                transition={{ duration: 2.2, repeat: Infinity }}
                                className="text-5xl font-black uppercase tracking-tighter text-white"
                                style={{ textShadow: '0 0 40px rgba(220,38,38,0.8)' }}
                            >
                                Asistencia Médica
                            </motion.h2>
                            <motion.div
                                className="flex items-center justify-center gap-2"
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1.1, repeat: Infinity }}
                            >
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="text-red-400 font-black uppercase tracking-[0.4em] text-xs">
                                    Partido en pausa
                                </span>
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                            </motion.div>
                        </div>

                        {/* Líneas de escaneo */}
                        <motion.div
                            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent z-10"
                            animate={{ top: ['10%', '90%', '10%'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        />

                        {/* Botón Reanudar */}
                        <motion.button
                            onClick={handleMedicalTimeout}
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.04 }}
                            className="relative z-20 px-14 py-5 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.25em] shadow-2xl text-sm"
                            style={{ boxShadow: '0 0 40px rgba(255,255,255,0.2)' }}
                        >
                            ▶ Reanudar Partido
                        </motion.button>

                        {/* Partículas flotantes */}
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 rounded-full bg-red-500/60"
                                style={{
                                    left: `${8 + i * 7.5}%`,
                                    bottom: '-10px',
                                }}
                                animate={{
                                    y: [0, -(300 + (i % 4) * 80)],
                                    opacity: [0, 0.8, 0],
                                    x: [0, (i % 2 === 0 ? 1 : -1) * (10 + i * 3)],
                                }}
                                transition={{
                                    duration: 3.5 + (i % 4) * 0.6,
                                    repeat: Infinity,
                                    delay: i * 0.28,
                                    ease: 'easeOut',
                                }}
                            />
                        ))}
                    </motion.div>
                )}


                {/* Match Selector Overlay */}
                {showMatchSelector && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
                        onClick={() => setShowMatchSelector(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#111] border border-white/10 rounded-[3rem] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Cambiar de cancha</h3>
                                    <p className="text-xs font-black italic text-padel-primary uppercase tracking-[0.2em] mt-1">Intercambiar con un partido que no ha comenzado</p>
                                </div>
                                <button onClick={() => setShowMatchSelector(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all text-gray-500">
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-4">
                                {tournament?.matches?.filter((m: any) => m.status === MatchStatus.PENDING && m.id !== match?.id).map((m: any) => {
                                    const otherCourt = m.court ?? (m.courtIndex != null ? m.courtIndex + 1 : '-');
                                    const courtLabel = m.courtName ?? (m.court != null ? `Pista ${m.court}` : (m.courtIndex != null ? `Pista ${m.courtIndex + 1}` : 'Pista –'));
                                    const isSwapping = swappingCourtWith === m.id;
                                    return (
                                        <button
                                            key={m.id}
                                            disabled={!!swappingCourtWith}
                                            onClick={() => swapCourtWithPendingMatch(m)}
                                            className="w-full p-6 rounded-3xl border text-left transition-all bg-white/5 border-white/5 hover:bg-white/10 disabled:opacity-50 disabled:pointer-events-none"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center">
                                                        <span className="text-lg font-black italic">{otherCourt}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-[10px] font-black italic text-gray-500 uppercase tracking-widest">{courtLabel} · Por comenzar</span>
                                                        <span className="block text-sm font-bold uppercase truncate max-w-[300px]">
                                                            {tournament.teams?.[m.team1Index - 1]?.p1?.name || m.team1?.p1Name || 'Eq 1'} vs {tournament.teams?.[m.team2Index - 1]?.p1?.name || m.team2?.p1Name || 'Eq 2'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {isSwapping ? (
                                                    <RefreshCw className="w-5 h-5 text-padel-primary animate-spin" />
                                                ) : (
                                                    <span className="text-[10px] font-black text-padel-primary uppercase tracking-widest">Intercambiar</span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                                {tournament?.matches?.filter((m: any) => m.status === MatchStatus.PENDING && m.id !== match?.id).length === 0 && (
                                    <div className="text-center py-20 opacity-30 italic font-black uppercase text-sm tracking-widest">No hay partidos pendientes para intercambiar</div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                {/* Scoring Adjustment Modal */}
                {showAdjustModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
                        onClick={() => setShowAdjustModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#111] border border-white/10 rounded-[3rem] w-full max-w-xl overflow-hidden flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Score Adjustment</h3>
                                    <p className="text-[10px] font-black italic text-gray-500 uppercase tracking-widest mt-1">Manual correction of games and sets</p>
                                </div>
                                <button onClick={() => setShowAdjustModal(false)} className="p-4 bg-white/5 rounded-full hover:bg-white/10 transition-all text-gray-400">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Team 1 Adjust */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-8 bg-padel-primary rounded-full" />
                                        <span className="text-lg font-black italic uppercase tracking-tighter text-white truncate">{match.team1.full}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-2">
                                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Puntos</span>
                                            <div className="flex items-center gap-4">
                                                <select
                                                    value={match.points?.t1 || '0'}
                                                    onChange={(e) => updateManualScore('t1', 'points', e.target.value)}
                                                    className="bg-black border border-white/10 rounded-lg px-2 py-1 text-xl font-black italic text-padel-primary outline-none"
                                                >
                                                    {['0', '15', '30', '40', 'AD'].map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-2">
                                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Juegos</span>
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => updateManualScore('t1', 'games', (match.games?.t1 || 0) - 1)} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white active:scale-90">-</button>
                                                <span className="text-2xl font-black italic text-padel-primary">{match.games?.t1 || 0}</span>
                                                <button onClick={() => updateManualScore('t1', 'games', (match.games?.t1 || 0) + 1)} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white active:scale-90">+</button>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-2">
                                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Sets</span>
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => updateManualScore('t1', 'sets', (match.sets?.t1 || 0) - 1)} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white active:scale-90">-</button>
                                                <span className="text-2xl font-black italic text-white">{match.sets?.t1 || 0}</span>
                                                <button onClick={() => updateManualScore('t1', 'sets', (match.sets?.t1 || 0) + 1)} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white active:scale-90">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Team 2 Adjust */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-8 bg-gray-600 rounded-full" />
                                        <span className="text-lg font-black italic uppercase tracking-tighter text-white truncate">{match.team2.full}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-2">
                                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Puntos</span>
                                            <div className="flex items-center gap-4">
                                                <select
                                                    value={match.points?.t2 || '0'}
                                                    onChange={(e) => updateManualScore('t2', 'points', e.target.value)}
                                                    className="bg-black border border-white/10 rounded-lg px-2 py-1 text-xl font-black italic text-padel-primary outline-none"
                                                >
                                                    {['0', '15', '30', '40', 'AD'].map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-2">
                                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Juegos</span>
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => updateManualScore('t2', 'games', (match.games?.t2 || 0) - 1)} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white active:scale-90">-</button>
                                                <span className="text-2xl font-black italic text-padel-primary">{match.games?.t2 || 0}</span>
                                                <button onClick={() => updateManualScore('t2', 'games', (match.games?.t2 || 0) + 1)} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white active:scale-90">+</button>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-2">
                                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Sets</span>
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => updateManualScore('t2', 'sets', (match.sets?.t2 || 0) - 1)} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white active:scale-90">-</button>
                                                <span className="text-2xl font-black italic text-white">{match.sets?.t2 || 0}</span>
                                                <button onClick={() => updateManualScore('t2', 'sets', (match.sets?.t2 || 0) + 1)} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white active:scale-90">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Special Rules */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Tiebreak Target</span>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[7, 10].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => setTiebreakTo(val)}
                                                className={`py-4 rounded-2xl border font-black italic uppercase text-xs transition-all ${tiebreakTo === val
                                                    ? 'bg-padel-primary text-black border-padel-primary shadow-[0_0_20px_rgba(204,255,0,0.2)]'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                To {val} Points
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-4">
                                <button
                                    onClick={() => {
                                        if (confirm('¿Resetear marcador de este partido?')) {
                                            const updatedMatches = tournament.matches.map((m: any) =>
                                                m.id === match.id ? {
                                                    ...m,
                                                    points: { t1: '0', t2: '0' },
                                                    games: { t1: 0, t2: 0 },
                                                    sets: { t1: 0, t2: 0 },
                                                    status: MatchStatus.PENDING,
                                                    startedAt: null,
                                                    finishedAt: null
                                                } : m
                                            );
                                            updateDoc(doc(db, 'tournaments', id), { matches: updatedMatches });
                                            setShowAdjustModal(false);
                                        }
                                    }}
                                    className="flex-1 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:bg-red-500/20 transition-all border border-red-500/10"
                                >
                                    Reset Match
                                </button>
                                <button
                                    onClick={() => setShowAdjustModal(false)}
                                    className="flex-1 py-4 bg-white text-black rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            <style jsx global>{`
                body {
                    background-color: #0a0a0a;
                    overscroll-behavior: none;
                    overflow: hidden;
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: italic;
                    font-weight: 900;
                    font-display: swap;
                }
            `}</style>
        </div>
    );
}
