'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
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
    ZapOff,
    Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRouteSegment } from '@/lib/useRouteSegment';
import { dataService } from '@/lib/dataService';
import { persistMatchFinishWithPropagation } from '@/lib/matchFinishPropagation';
import { getAuthHeaders } from '@/lib/apiAuth';
import { rtdb } from '@/lib/rtdb';
import { ref, update } from 'firebase/database';
import { MatchStatus } from '@/types/tournament';
import { useAuth } from '@/lib/AuthContext';
import RefereeRemoteControl from '@/components/RefereeRemoteControl';
import AutoShrinkName from '@/components/AutoShrinkName';
import { Bluetooth, LayoutDashboard, Search, ListFilter } from 'lucide-react';
import {
    getScoringRules,
    isSetCompleteByGames,
    shouldEnterSetTiebreak,
    winsTiebreakPoints,
} from '@/lib/matchScoringRules';
import { shouldAutoFinishBySetsReferee } from '@/lib/matchFinishGuards';

export default function RefereeScoreboard() {
    const id = useRouteSegment('id');
    const matchId = useRouteSegment('matchId');
    const router = useRouter();
    const { user, profile, isAdmin, canMarkInCancha, loading: authLoading } = useAuth();
    const [tournament, setTournament] = useState<any>(null);
    const [match, setMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showMatchSelector, setShowMatchSelector] = useState(false);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [showNameModal, setShowNameModal] = useState(false);
    const [nameDraft, setNameDraft] = useState({
        t1p1: '',
        t1p2: '',
        t2p1: '',
        t2p2: '',
    });
    const [swappingCourtWith, setSwappingCourtWith] = useState<string | null>(null);
    /** Número de pista destino mientras aplica traslado atómico (pista libre). */
    const [courtMoveBusy, setCourtMoveBusy] = useState<number | null>(null);

    /** Pista ≥1 para pizarra y hub. `court: 0` en BD hacía matchCourt=0 → `if (!matchCourt)` cortaba la sync a pizarra_cancha_state y el hub no veía en_vivo/partido_id. */
    const matchCourt = (() => {
        const raw = match?.court ?? (match?.courtIndex != null ? match.courtIndex + 1 : undefined);
        const n = Number(raw);
        if (Number.isFinite(n) && n >= 1) return n;
        return 1;
    })();

    const impliedCourtCount = useMemo(() => {
        if (!tournament) return Math.max(6, matchCourt);
        const names = tournament.courtNames;
        if (Array.isArray(names) && names.length > 0) return Math.min(48, names.length);
        const nc = Number(tournament.numCourts);
        if (Number.isFinite(nc) && nc > 0) return Math.min(48, nc);
        let max = 0;
        for (const m of tournament.matches || []) {
            const c = Number(m?.court ?? (m?.courtIndex != null ? m.courtIndex + 1 : 0));
            if (c > max) max = c;
        }
        return Math.max(max, matchCourt, 4);
    }, [tournament, matchCourt]);

    /** Pistas sin partido LIVE ajeno (vacantes para traslado). */
    const vacantCourts = useMemo(() => {
        if (!tournament?.matches || !match?.id) return [];
        const occupied = new Set<number>();
        for (const m of tournament.matches) {
            if (m.id === match.id) continue;
            if (String(m.status || '').toUpperCase() !== 'LIVE') continue;
            const c = Number(m?.court ?? (m?.courtIndex != null ? m.courtIndex + 1 : 0));
            if (c > 0) occupied.add(c);
        }
        const list: number[] = [];
        for (let c = 1; c <= impliedCourtCount; c++) {
            if (c === matchCourt) continue;
            if (occupied.has(c)) continue;
            list.push(c);
        }
        return list;
    }, [tournament?.matches, match?.id, matchCourt, impliedCourtCount]);

    /** Misma puerta que `/marker/[canchaId]`: admin, dueño del torneo, o `canMarkInCancha` (en Auth incluye usuario autenticado). */
    const canControl =
        !!user &&
        (isAdmin || tournament?.ownerId === user?.uid || canMarkInCancha(`cancha_${matchCourt}`));

    const primaryColor = tournament?.broadcastingSettings?.primaryColor || '#ccff00';
    const [history, setHistory] = useState<any[]>([]);
    const [duration, setDuration] = useState(0);
    const [isGoldenPoint, setIsGoldenPoint] = useState(true);
    const [isMedicalTimeout, setIsMedicalTimeout] = useState(false);
    const [medicalTimeRemaining, setMedicalTimeRemaining] = useState(180); // 3 minutes
    const [showSideChange, setShowSideChange] = useState(false);
    /** Objetivo puntos solo para super tie-break (modal / torneo). El tie-break de set siempre es a 7 con margen 2. */
    const [superTiebreakTarget, setSuperTiebreakTarget] = useState(10);
    const [finishClicks, setFinishClicks] = useState(0);
    const [now, setNow] = useState(new Date());
    const [animacionesMarcador, setAnimacionesMarcador] = useState<Record<string, { nombre: string; url: string }>>({});
    const [sideChangeAnimations, setSideChangeAnimations] = useState<any[]>([]);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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

    useEffect(() => {
        dataService.getAnimations('SIDE_CHANGE')
            .then(setSideChangeAnimations)
            .catch(err => console.error('Error fetching SIDE_CHANGE animations:', err));
    }, []);

    /** Primeras 12 animaciones (orden estable) para pads 1–12: 1–6 equipo 1, 7–12 equipo 2. */
    const padsAnimaciones = useMemo(() => {
        const entries = Object.entries(animacionesMarcador) as [string, { nombre: string; url: string }][];
        return entries.sort((a, b) => a[0].localeCompare(b[0])).slice(0, 12);
    }, [animacionesMarcador]);

    const matchFormatForRules =
        match?.matchFormat ||
        match?.match_format ||
        (tournament as any)?.rrMatchFormat ||
        tournament?.matchFormat;
    const scoringRules = useMemo(
        () => getScoringRules(matchFormatForRules, tournament?.tieBreakType),
        [matchFormatForRules, tournament?.tieBreakType]
    );

    const handleFinishMatch = async () => {
        if (finishClicks < 2) {
            setFinishClicks(prev => prev + 1);
            setTimeout(() => setFinishClicks(0), 3000); // Reset after 3s of inactivity
            return;
        }

        if (!tournament || !match) return;
        const endIso = new Date().toISOString();
        const finishPatch = {
            status: MatchStatus.FINISHED,
            finishedAt: endIso,
            actualEndTime: endIso,
            sets: match.sets,
            games: match.games,
            points: match.points,
            setScores: match.setScores,
            superTiebreakScore: match.superTiebreakScore,
            isTiebreak: match.isTiebreak,
            superTiebreak: match.superTiebreak,
            server: match.server,
        };
        try {
            const rows = await dataService.getMatches(id);
            const merged = rows.map((r: any) =>
                r.id === match.id ? { ...r, ...finishPatch } : r
            );
            await persistMatchFinishWithPropagation({
                tournamentId: id,
                bufferMinutes: tournament?.bufferMinutes ?? 15,
                matches: merged,
                matchId: match.id,
                updateMatch: (tid, mid, d) => dataService.updateMatch(tid, mid, d),
                tournament,
            });
        } catch (e) {
            console.error('[Score] handleFinishMatch:', e);
            alert('Error al finalizar el partido. Revisa la conexión e inténtalo de nuevo.');
            return;
        }
        // Liberar la pizarra: si queda en_vivo + partido_id, el hub sigue excluyendo la cola "Por comenzar"
        try {
            const canchaId = `cancha_${matchCourt}`;
            const cur = await dataService.getPizarraCanchaState(canchaId);
            const pdata = cur?.data || {};
            await dataService.setPizarraCanchaState(canchaId, {
                ...pdata,
                estado: 'finalizado',
                torneo_id: id,
                partido_id: null,
                active_match_id: null,
                pizarra_refresh_nonce: (Number(pdata.pizarra_refresh_nonce) || 0) + 1
            });
        } catch (e) {
            console.warn('[Score] handleFinishMatch pizarra cleanup:', e);
        }
        router.push(`/tournaments/${id}?tab=finalizados`);
    };

    const updateManualScore = async (side: 't1' | 't2', field: 'games' | 'sets' | 'points', value: any) => {
        if (!tournament || !match) return;
        const nextField = {
            ...(match[field] && typeof match[field] === 'object' ? match[field] : {}),
            [side]: field === 'points' ? value : Math.max(0, value),
        };
        const patch: Record<string, unknown> = { [field]: nextField };

        if (field === 'sets') {
            const prospective = {
                ...match,
                ...patch,
                matchFormat: match.matchFormat || match.match_format || tournament?.rrMatchFormat,
            };
            const st = String(match.status || '').toUpperCase();
            const liveLike =
                st === 'LIVE' ||
                st === 'IN_PROGRESS' ||
                st === 'PAUSED' ||
                st === 'STARTED' ||
                st === 'WARM_UP';
            if (liveLike && shouldAutoFinishBySetsReferee(prospective, tournament)) {
                const endIso = new Date().toISOString();
                patch.status = MatchStatus.FINISHED;
                patch.finishedAt = endIso;
                patch.actualEndTime = endIso;
                patch.superTiebreak = false;
                patch.isTiebreak = false;
                setMatch((prev: any) => (prev ? { ...prev, ...patch } : prev));
                try {
                    const rows = await dataService.getMatches(id);
                    const merged = rows.map((r: any) => (r.id === match.id ? { ...r, ...patch } : r));
                    const { finalMatches } = await persistMatchFinishWithPropagation({
                        tournamentId: id,
                        bufferMinutes: tournament?.bufferMinutes ?? 15,
                        matches: merged,
                        matchId: match.id,
                        updateMatch: (tid, mid, d) => dataService.updateMatch(tid, mid, d),
                        tournament,
                    });
                    const closed = finalMatches.find((m: any) => m.id === match.id);
                    if (closed) {
                        setMatch((prev: any) =>
                            prev
                                ? {
                                      ...closed,
                                      team1: prev.team1,
                                      team2: prev.team2,
                                      matchFormat: prev.matchFormat ?? closed.matchFormat,
                                      tieBreakType: prev.tieBreakType ?? closed.tieBreakType,
                                  }
                                : prev
                        );
                    }
                } catch (err) {
                    console.error('[updateManualScore] cierre por sets:', err);
                    setMatch(match);
                    alert('Error al cerrar el partido. Revisa la conexión.');
                }
                return;
            }
        }

        setMatch((prev: any) => (prev ? { ...prev, ...patch } : prev));
        try {
            await dataService.updateMatch(id, match.id, patch);
        } catch (err) {
            console.error('[updateManualScore]', err);
            setMatch(match);
            alert('Error al guardar el ajuste.');
        }
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

            // Mismo criterio que la pizarra: segundos desde startedAt/actualStartTime (reloj de pared, sin deriva)
            if (!timerRef.current) {
                timerRef.current = setInterval(() => {
                    const sm = getMatchStartTimeMs(match);
                    if (sm != null) {
                        setDuration(Math.max(0, Math.floor((Date.now() - sm) / 1000)));
                    }
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
        const courtNum = (m: any) => {
            const raw = m?.court ?? (m?.courtIndex != null ? (m.courtIndex as number) + 1 : undefined);
            const n = Number(raw);
            return Number.isFinite(n) && n >= 1 ? n : 1;
        };
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

    // ── Sincronizar marcador a pizarra_cancha_state (para displays por cancha) ──
    useEffect(() => {
        if (!match?.id) return;

        // Solo sincronizamos si está LIVE o si acaba de terminar (para enviar el estado final)
        const isLive = match?.status === MatchStatus.LIVE;
        const isFinished = match?.status === MatchStatus.FINISHED;

        if (!isLive && !isFinished) return;

        const canchaId = `cancha_${matchCourt}`;
        const isStb = match.superTiebreak === true
            || match.matchFormat === 'SUPER_TIEBREAK'
            || match.matchFormat === 'SET_3_STB';
        const isTb = match.isTiebreak;

        const teamLineForPizarra = (t: { full?: string; p1?: string; p2?: string } | null | undefined) => {
            if (!t) return 'Equipo';
            const full = typeof t.full === 'string' ? t.full.trim() : '';
            if (full) return full;
            const p1 = typeof t.p1 === 'string' ? t.p1.trim() : '';
            const p2 = typeof t.p2 === 'string' ? t.p2.trim() : '';
            if (p1 && p2) return `${p1} / ${p2}`;
            return p1 || p2 || 'Equipo';
        };
        const nombreEquipo1 = teamLineForPizarra(match.team1);
        const nombreEquipo2 = teamLineForPizarra(match.team2);

        dataService.getPizarraCanchaState(canchaId).then((cur) => {
            const data = cur?.data || {};
            const marcador = data.marcador || {};
            const eq1 = marcador.equipo_1 || {};
            const eq2 = marcador.equipo_2 || {};
            const overlay = data.court_transfer_overlay as { ts?: number } | undefined;
            const keepOverlay =
                overlay &&
                typeof overlay.ts === 'number' &&
                Date.now() - overlay.ts < 12000;
            const baseData = { ...data } as Record<string, unknown>;
            if (!keepOverlay) delete baseData.court_transfer_overlay;

            return dataService.setPizarraCanchaState(canchaId, {
                ...baseData,
                estado: isFinished ? 'finalizado' : 'en_vivo',
                pizarra_refresh_nonce:
                    typeof data.pizarra_refresh_nonce === 'number' && Number.isFinite(data.pizarra_refresh_nonce)
                        ? data.pizarra_refresh_nonce
                        : 0,
                torneo_id: id,
                partido_id: match.id,
                marcador: {
                    ...marcador,
                    status: match.status,
                    puntos: { local: match.points?.t1 || '0', visitante: match.points?.t2 || '0' },
                    games: { local: match.games?.t1 || 0, visitante: match.games?.t2 || 0 },
                    sets: { local: match.sets?.t1 || 0, visitante: match.sets?.t2 || 0 },
                    historico_sets: (match.setScores || []).map((s: any) => ({ local: s.t1 ?? s.local ?? 0, visitante: s.t2 ?? s.visitante ?? 0 })),
                    saque: { equipo: match.server?.team || 1, jugador: match.server?.player || 1 },
                    modo_puntos: isStb ? 'super_tiebreak' : (isTb ? 'tiebreak' : 'normal'),
                    super_tiebreak: !!match.superTiebreak,
                    golden_point: isGoldenPoint,
                    match_format: match.matchFormat || tournament?.matchFormat,
                    tie_break_type: match.tieBreakType || tournament?.tieBreakType,
                    equipo_1: { nombre: nombreEquipo1, color: eq1.color || '#CCFF00' },
                    equipo_2: { nombre: nombreEquipo2, color: eq2.color || '#FF5500' },
                    ultimo_update: Date.now(),
                },
            });
        }).catch((err) => console.warn('[Score] Sync pizarra cancha:', err));
    }, [
        id,
        match?.id,
        match?.status,
        match?.points,
        match?.games,
        match?.sets,
        match?.server,
        match?.isTiebreak,
        match?.superTiebreak,
        match?.matchFormat,
        match?.setScores,
        match?.team1,
        match?.team2,
        matchCourt,
        tournament?.matchFormat,
        tournament?.tieBreakType,
        isGoldenPoint,
    ]);

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const buildTeamFull = (p1: string, p2: string, fallback: string) => {
        const a = p1.trim();
        const b = p2.trim();
        if (a && b) return `${a} / ${b}`;
        if (a || b) return a || b;
        return fallback;
    };

    const openNameEditor = () => {
        if (!match) return;
        setNameDraft({
            t1p1: (match.team1?.p1 || '').toString(),
            t1p2: (match.team1?.p2 || '').toString(),
            t2p1: (match.team2?.p1 || '').toString(),
            t2p2: (match.team2?.p2 || '').toString(),
        });
        setShowNameModal(true);
    };

    const saveEditedNames = async () => {
        if (!match) return;
        const t1p1 = nameDraft.t1p1.trim();
        const t1p2 = nameDraft.t1p2.trim();
        const t2p1 = nameDraft.t2p1.trim();
        const t2p2 = nameDraft.t2p2.trim();

        const nextTeam1 = {
            ...(match.team1 || {}),
            p1: t1p1 || 'Jugador 1',
            p2: t1p2 || 'Jugador 2',
            p1Name: t1p1 || 'Jugador 1',
            p2Name: t1p2 || 'Jugador 2',
            full: buildTeamFull(t1p1, t1p2, 'Equipo 1'),
            name: buildTeamFull(t1p1, t1p2, 'Equipo 1'),
        };
        const nextTeam2 = {
            ...(match.team2 || {}),
            p1: t2p1 || 'Jugador 3',
            p2: t2p2 || 'Jugador 4',
            p1Name: t2p1 || 'Jugador 3',
            p2Name: t2p2 || 'Jugador 4',
            full: buildTeamFull(t2p1, t2p2, 'Equipo 2'),
            name: buildTeamFull(t2p1, t2p2, 'Equipo 2'),
        };

        try {
            await dataService.updateMatch(id, match.id, {
                team1: nextTeam1,
                team2: nextTeam2,
                team1Name: nextTeam1.full,
                team2Name: nextTeam2.full,
            });
            setMatch((prev: any) => prev ? {
                ...prev,
                team1: nextTeam1,
                team2: nextTeam2,
                team1Name: nextTeam1.full,
                team2Name: nextTeam2.full,
            } : prev);
            setShowNameModal(false);
        } catch (err) {
            console.error('[saveEditedNames] Error:', err);
            alert('No se pudieron guardar los nombres. Intenta de nuevo.');
        }
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
            if (t.tieBreakType || t.matchFormat) {
                const r = getScoringRules(t.matchFormat, t.tieBreakType);
                setSuperTiebreakTarget(r.superTiebreakPointsToWin);
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
                // Detecta placeholders tipo "Jugador 1", "Pareja 2", etc. para no mostrarlos como si fueran nombres reales.
                const PH = /^(pareja\s*\d*|jugador\s*\d*|player\s*\d*|equipo\s*\d*|placeholder|tbd|\?|j\d+|p\d+)$/i;
                const isReal = (s: string) => s && s.trim().length > 0 && !PH.test(s.trim());

                const resolveNames = (embeddedTeam: any, teamIdx: number, matchTeamName?: string, matchTeamId?: string) => {
                    // 1. Equipo embebido directamente en el partido (más actualizado)
                    if (embeddedTeam) {
                        if (embeddedTeam.isTBD) {
                            const label = embeddedTeam.teamLabel || 'TBD';
                            return { p1: label, p2: '', full: label, p1Photo: null, p2Photo: null };
                        }
                        const fullStr =
                            typeof embeddedTeam.full === 'string' ? embeddedTeam.full.trim() : '';
                        if (fullStr && !/^pareja\s*\d*$/i.test(fullStr) && fullStr !== 'TBD') {
                            const fparts = fullStr.split(/\s*\/\s*/).map((s: string) => s.trim()).filter(isReal);
                            if (fparts.length >= 2) {
                                return {
                                    p1: fparts[0],
                                    p2: fparts[1],
                                    full: fullStr,
                                    p1Photo: embeddedTeam.p1?.photo || null,
                                    p2Photo: embeddedTeam.p2?.photo || null,
                                };
                            }
                            if (fparts.length === 1) {
                                return {
                                    p1: fparts[0],
                                    p2: '',
                                    full: fparts[0],
                                    p1Photo: embeddedTeam.p1?.photo || null,
                                    p2Photo: embeddedTeam.p2?.photo || null,
                                };
                            }
                        }
                        const altLine = typeof embeddedTeam.name === 'string' ? embeddedTeam.name.trim() : '';
                        if (altLine && !/^pareja\s*\d*$/i.test(altLine) && altLine !== 'TBD') {
                            const parts = altLine.split(/\s*\/\s*/).map((s: string) => s.trim()).filter(isReal);
                            if (parts.length >= 2) {
                                return {
                                    p1: parts[0],
                                    p2: parts[1],
                                    full: altLine,
                                    p1Photo: embeddedTeam.p1?.photo || null,
                                    p2Photo: embeddedTeam.p2?.photo || null,
                                };
                            }
                            if (parts.length === 1) {
                                return {
                                    p1: parts[0],
                                    p2: '',
                                    full: parts[0],
                                    p1Photo: embeddedTeam.p1?.photo || null,
                                    p2Photo: embeddedTeam.p2?.photo || null,
                                };
                            }
                        }
                        const p1n = (embeddedTeam.p1?.name || embeddedTeam.p1Name || '').trim();
                        const p2n = (embeddedTeam.p2?.name || embeddedTeam.p2Name || '').trim();
                        if (isReal(p1n) || isReal(p2n)) {
                            const p1f = isReal(p1n) ? p1n : '?';
                            const p2f = isReal(p2n) ? p2n : '';
                            return {
                                p1: p1f, p2: p2f,
                                full: [p1f, p2f].filter(Boolean).join(' / '),
                                p1Photo: embeddedTeam.p1?.photo || null,
                                p2Photo: embeddedTeam.p2?.photo || null
                            };
                        }
                    }
                    // 2. Nombre de equipo en el partido (string "A / B")
                    if (matchTeamName && isReal(matchTeamName)) {
                        const parts = matchTeamName.split('/').map((s: string) => s.trim()).filter(isReal);
                        if (parts.length >= 2) return { p1: parts[0], p2: parts[1], full: matchTeamName, p1Photo: null, p2Photo: null };
                        if (parts.length === 1) return { p1: parts[0], p2: '', full: parts[0], p1Photo: null, p2Photo: null };
                    }
                    // 3. tournament.teams — buscar por id y por índice
                    const teams: any[] = t?.teams || [];
                    const byId = matchTeamId ? teams.find((tm: any) => tm.id === matchTeamId || tm.teamId === matchTeamId) : null;
                    const byIdx = teamIdx > 0 ? teams[teamIdx - 1] : (teams[teamIdx] ?? null);
                    const tData = byId || byIdx || null;
                    if (tData) {
                        const fullLine = (tData.full || tData.teamName || tData.name || '').toString().trim();
                        if (fullLine && !/^pareja\s*\d*$/i.test(fullLine) && fullLine !== 'TBD') {
                            const parts = fullLine.split(/\s*\/\s*/).map((s: string) => s.trim()).filter(isReal);
                            if (parts.length >= 2) {
                                return {
                                    p1: parts[0],
                                    p2: parts[1],
                                    full: fullLine,
                                    p1Photo: tData.p1?.photo || null,
                                    p2Photo: tData.p2?.photo || null
                                };
                            }
                            if (parts.length === 1) {
                                return {
                                    p1: parts[0],
                                    p2: '',
                                    full: parts[0],
                                    p1Photo: tData.p1?.photo || null,
                                    p2Photo: tData.p2?.photo || null
                                };
                            }
                        }
                        const p1n = (tData.p1?.name || tData.p1Name || '').trim();
                        const p2n = (tData.p2?.name || tData.p2Name || '').trim();
                        if (isReal(p1n) || isReal(p2n)) {
                            return {
                                p1: isReal(p1n) ? p1n : '?',
                                p2: isReal(p2n) ? p2n : '',
                                full: [p1n, p2n].filter(isReal).join(' / '),
                                p1Photo: tData.p1?.photo || null,
                                p2Photo: tData.p2?.photo || null
                            };
                        }
                    }
                    // 4. Fallback
                    return { p1: '?', p2: '?', full: matchTeamName || '?', p1Photo: null, p2Photo: null };
                };

                const t1 = resolveNames(foundMatch.team1, foundMatch.team1Index ?? 0, foundMatch.team1Name, foundMatch.team1Id || foundMatch.team1?.id);
                const t2 = resolveNames(foundMatch.team2, foundMatch.team2Index ?? 0, foundMatch.team2Name, foundMatch.team2Id || foundMatch.team2?.id);

                setMatch({
                    ...foundMatch,
                    team1: t1,
                    team2: t2,
                    matchFormat: foundMatch.matchFormat || t?.matchFormat,
                    tieBreakType: foundMatch.tieBreakType || t?.tieBreakType,
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

        const timeout = setTimeout(() => setLoading(false), 10000);

        return () => {
            if (typeof unsubT === 'function') unsubT();
            if (typeof unsubMatches === 'function') unsubMatches();
            clearTimeout(timeout);
        };
    }, [id, matchId]);

    /** Si el marcador en BD quedó LIVE con sets ya ganadores (marker u otro cliente), cerrar una vez vía propagación. */
    const scoreHealFinishLastAttemptRef = useRef(0);
    useEffect(() => {
        if (!id || !match?.id || !tournament || loading) return;
        const st = String(match.status || '').toUpperCase();
        if (!['LIVE', 'IN_PROGRESS', 'PAUSED', 'STARTED', 'WARM_UP'].includes(st)) return;
        if (!shouldAutoFinishBySetsReferee(match, tournament)) return;
        const nowTs = Date.now();
        if (nowTs - scoreHealFinishLastAttemptRef.current < 5000) return;
        scoreHealFinishLastAttemptRef.current = nowTs;

        (async () => {
            try {
                const rows = await dataService.getMatches(id);
                const fresh = rows.find((r: any) => r.id === match.id);
                if (!fresh) return;
                if (String(fresh.status || '').toUpperCase() === 'FINISHED') return;
                if (!shouldAutoFinishBySetsReferee(fresh, tournament)) return;

                const endIso = new Date().toISOString();
                const finishPatch = {
                    status: MatchStatus.FINISHED,
                    finishedAt: endIso,
                    actualEndTime: endIso,
                    superTiebreak: false,
                    isTiebreak: false,
                };
                const merged = rows.map((r: any) =>
                    r.id === match.id ? { ...r, ...finishPatch } : r
                );
                await persistMatchFinishWithPropagation({
                    tournamentId: id,
                    bufferMinutes: tournament?.bufferMinutes ?? 15,
                    matches: merged,
                    matchId: match.id,
                    updateMatch: (tid, mid, d) => dataService.updateMatch(tid, mid, d),
                    tournament,
                });
            } catch (e) {
                console.warn('[Score] auto-cierre por sets en BD:', e);
            }
        })();
    }, [
        id,
        loading,
        tournament,
        match?.id,
        match?.status,
        match?.sets?.t1,
        match?.sets?.t2,
        match?.superTiebreak,
        match?.sets_to_win_match,
        match?.setsToWinMatch,
        match?.matchFormat,
        match?.match_format,
    ]);

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
            isTiebreak: previousState.isTiebreak ?? false,
            superTiebreak: previousState.superTiebreak ?? false,
            setScores: previousState.setScores,
            superTiebreakScore: previousState.superTiebreakScore,
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

        // ── Tie-break de set (7+2) o super tie-break (10+2 / 7+2) ─────────
        const inNumericTiebreak = match.isTiebreak || match.superTiebreak;
        if (inNumericTiebreak) {
            const currentP = parseInt(newPoints[side] || '0', 10);
            const otherP = parseInt(newPoints[otherSide] || '0', 10);
            const nextP = currentP + 1;
            newPoints[side] = nextP.toString();

            const totalPoints = nextP + otherP;
            let nextServer = { ...match.server };
            if (totalPoints === 1 || (totalPoints > 1 && (totalPoints - 1) % 2 === 0)) {
                const nextTeam = match.server.team === 1 ? 2 : 1;
                const nextPlayer = match.server.player === 1 ? 2 : 1;
                nextServer = { team: nextTeam as 1 | 2, player: nextPlayer as 1 | 2 };
            }

            const target = match.superTiebreak
                ? superTiebreakTarget
                : scoringRules.setTiebreakPointsToWin;
            if (winsTiebreakPoints(nextP, otherP, target)) {
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

        if (match.isTiebreak || match.superTiebreak) {
            newGames[side]++;
            await winSet(side, newGames);
            return;
        }

        const rules = getScoringRules(
            match.matchFormat || match.match_format || (tournament as any)?.rrMatchFormat || tournament?.matchFormat,
            match.tieBreakType || tournament?.tieBreakType,
        );

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

        const isEntryTiebreak = shouldEnterSetTiebreak(g1, g2, rules.tiebreakGamesEntry);
        const isSetFinished = isSetCompleteByGames(g1, g2, rules.gamesToWinSet);

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
        const rules = getScoringRules(
            match.matchFormat || match.match_format || (tournament as any)?.rrMatchFormat || tournament?.matchFormat,
            match.tieBreakType || tournament?.tieBreakType,
        );
        let newSets = { t1: Number(match.sets?.t1) || 0, t2: Number(match.sets?.t2) || 0 };
        newSets[side]++;

        const isCompletingSuperTB = match.superTiebreak === true;

        const newSetScores = isCompletingSuperTB
            ? (match.setScores || [])
            : [...(match.setScores || []), { t1: finalGames.t1, t2: finalGames.t2 }];

        let need = rules.setsToWinMatch;
        const needRaw = Number(match?.sets_to_win_match ?? match?.setsToWinMatch);
        if (Number.isFinite(needRaw) && needRaw >= 1) need = needRaw;

        const t1n = newSets.t1;
        const t2n = newSets.t2;
        const setsReachWin = t1n >= need || t2n >= need;

        let nextSuperTb = !!(match.superTiebreak ?? false);
        const enterStb =
            !setsReachWin &&
            rules.usesSuperTiebreakDecider &&
            t1n === 1 &&
            t2n === 1 &&
            !isCompletingSuperTB;
        if (enterStb) nextSuperTb = true;

        const isMatchFinished = shouldAutoFinishBySetsReferee(
            {
                ...match,
                sets: newSets,
                superTiebreak: nextSuperTb,
                matchFormat: match.matchFormat || match.match_format || (tournament as any)?.rrMatchFormat,
            },
            tournament
        );
        if (isMatchFinished) nextSuperTb = false;

        const finishedAt = isMatchFinished ? new Date().toISOString() : match.finishedAt || null;
        const updatedData: any = {
            games: isMatchFinished ? finalGames : { t1: 0, t2: 0 },
            points: { t1: '0', t2: '0' },
            sets: newSets,
            setScores: newSetScores,
            isTiebreak: false,
            superTiebreak: nextSuperTb,
            status: isMatchFinished ? MatchStatus.FINISHED : match.status,
            finishedAt: finishedAt,
            actualEndTime: finishedAt // Para consistencia con el panel de control
        };
        if (isCompletingSuperTB) {
            updatedData.superTiebreakScore = { t1: finalGames.t1, t2: finalGames.t2 };
        } else if (enterStb) {
            updatedData.superTiebreakScore = null;
        }

        // Actualización optimista
        setMatch({ ...match, ...updatedData });

        try {
            if (isMatchFinished) {
                const rows = await dataService.getMatches(id);
                const merged = rows.map((r: any) =>
                    r.id === match.id ? { ...r, ...updatedData } : r
                );
                const { finalMatches } = await persistMatchFinishWithPropagation({
                    tournamentId: id,
                    bufferMinutes: tournament?.bufferMinutes ?? 15,
                    matches: merged,
                    matchId: match.id,
                    updateMatch: (tid, mid, d) => dataService.updateMatch(tid, mid, d),
                    tournament,
                });
                const closed = finalMatches.find((m: any) => m.id === match.id);
                if (closed) {
                    setMatch((prev: any) =>
                        prev
                            ? {
                                  ...closed,
                                  team1: prev.team1,
                                  team2: prev.team2,
                                  matchFormat: prev.matchFormat ?? closed.matchFormat,
                                  tieBreakType: prev.tieBreakType ?? closed.tieBreakType,
                              }
                            : prev
                    );
                }
            } else {
                await dataService.updateMatch(id, match.id, updatedData);
            }

            // ── Broadcast al RTDB para sincronización en tiempo real con la Pizarra ──
            if (rtdb) {
                try {
                    const canchaId = `cancha_${matchCourt}`;
                    const rtdbRef = ref(rtdb, `canchas/${canchaId}/marcador`);
                    update(rtdbRef, {
                        sets: newSets,
                        games: updatedData.games,
                        setScores: newSetScores,
                        superTiebreak: nextSuperTb,
                        ...(updatedData.superTiebreakScore != null
                            ? { superTiebreakScore: updatedData.superTiebreakScore }
                            : {}),
                        status: updatedData.status,
                        ts: Date.now()
                    });
                } catch (rtdbErr) {
                    console.warn('[winSet] RTDB broadcast error (non-fatal):', rtdbErr);
                }
            }

            if (isMatchFinished && id) {
                // Al finalizar, forzar un refresco de la pizarra para que salga del modo LIVE
                try {
                    const canchaId = `cancha_${matchCourt}`;
                    const cur = await dataService.getPizarraCanchaState(canchaId);
                    const data = cur?.data || {};
                    await dataService.setPizarraCanchaState(canchaId, {
                        ...data,
                        estado: 'finalizado',
                        pizarra_refresh_nonce: (Number(data.pizarra_refresh_nonce) || 0) + 1
                    });
                } catch (pizarraErr) {
                    console.warn('[winSet] Error updating pizarra status on finish (non-fatal):', pizarraErr);
                }

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

    const dispararAnimacionMarcador = (canchaId: string, animId: string) => {
        const a = animacionesMarcador[animId];
        if (!rtdb || !a?.url) return;
        const pathRef = ref(rtdb, `canchas/${canchaId}/animacion_actual`);
        update(pathRef, { id: animId, url: a.url, ts: Date.now() });
    };

    // ── Lógica de selección de sacador ───────────────────────────────────
    // Un estado local para detectar doble-click rápido
    const lastClickRef = { team: 0, player: 0, ts: 0 };
    const DOUBLE_CLICK_MS = 350;

    const setSpecificServer = async (team: number, player: number) => {
        if (!tournament || !match) return;
        const previous = match;
        setMatch((prev: any) => (prev ? { ...prev, server: { team, player } } : prev));
        try {
            await dataService.updateMatch(id, match.id, { server: { team, player } });
        } catch (err) {
            console.error('[setSpecificServer]', err);
            setMatch(previous);
            alert('No se pudo actualizar el sacador.');
        }
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

    /**
     * Traslado atómico a una pista libre: RPC en servidor (pizarra origen/destino + tournament_matches).
     * Realtime: la TV de la pista destino recibe `court_transfer_overlay` vía postgres_changes en pizarra_cancha_state.
     */
    const changeMatchCourt = async (toCourt: number) => {
        if (!match || !id) return;
        if (match.status !== MatchStatus.LIVE) {
            alert('Solo se puede trasladar un partido en vivo.');
            return;
        }
        setCourtMoveBusy(toCourt);
        try {
            const res = await fetch(
                `/api/tournaments/${encodeURIComponent(id)}/matches/${encodeURIComponent(match.id)}/change-court`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
                    body: JSON.stringify({ toCourt, isGoldenPoint }),
                }
            );
            const j = (await res.json().catch(() => ({}))) as { error?: string; match?: Record<string, unknown> };
            if (!res.ok) throw new Error(j.error || 'No se pudo trasladar el partido');
            if (j.match) setMatch((prev: any) => (prev ? { ...prev, ...j.match } : prev));
            setShowMatchSelector(false);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Error al trasladar';
            alert(msg);
        } finally {
            setCourtMoveBusy(null);
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
        const previous = match;
        const currentServer = match.server || { team: 1, player: 1 };
        const next = { ...currentServer, player: currentServer.player === 1 ? 2 : 1 };
        setMatch((prev: any) => (prev ? { ...prev, server: next } : prev));
        try {
            await dataService.updateMatch(id, match.id, { server: next });
        } catch (err) {
            console.error('[toggleServingPlayer]', err);
            setMatch(previous);
        }
    };

    const toggleServingTeam = async () => {
        if (!match) return;
        saveHistory();
        const previous = match;
        const currentServer = match.server || { team: 1, player: 1 };
        const next = { ...currentServer, team: currentServer.team === 1 ? 2 : 1 };
        setMatch((prev: any) => (prev ? { ...prev, server: next } : prev));
        try {
            await dataService.updateMatch(id, match.id, { server: next });
        } catch (err) {
            console.error('[toggleServingTeam]', err);
            setMatch(previous);
        }
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
                    <p className="text-gray-400 text-sm font-medium mb-8">
                        Debes iniciar sesión para controlar el marcador. Si crees que es un error, comprueba tu cuenta o los permisos de pista con el club.
                    </p>
                    <button
                        onClick={() => {
                            const tab =
                                match?.status === MatchStatus.FINISHED
                                    ? 'finalizados'
                                    : match?.status === MatchStatus.LIVE
                                      ? 'live'
                                      : 'por-comenzar';
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
        <div className="fixed inset-0 z-0 flex h-[100dvh] max-h-[100dvh] min-h-0 w-full flex-col overflow-hidden overscroll-none bg-[#070707] pl-[max(0.25rem,env(safe-area-inset-left))] pr-[max(0.25rem,env(safe-area-inset-right))] pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)] font-sans text-white touch-none select-none gap-0 premium-gradient">
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

            {/* Header: meta | Cancha + fila única: atrás+acciones | reloj/empezar | acciones | médico+finalizar */}
            <header className="glass relative z-50 flex shrink-0 flex-col gap-0 rounded-b-[1.5rem] rounded-t-xl pt-0 pb-1 px-2 shadow-2xl sm:rounded-t-2xl sm:px-5 sm:pb-1.5 md:px-6">
                {/* Side Change Alert */}
                <AnimatePresence>
                    {showSideChange && (
                        <motion.div
                            initial={{ y: -100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -100, opacity: 0 }}
                            className="absolute inset-x-0 -bottom-16 flex justify-center z-[60] pointer-events-none [&_button]:pointer-events-auto"
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

                {/* Fila 1: meta izq. | Cancha + nombre + empezar/crono | Finalizar */}
                <div className="flex w-full min-w-0 items-start gap-2 pt-0 sm:gap-3">
                    <div className="flex w-[min(30%,11rem)] min-w-0 shrink-0 flex-col items-start gap-0.5 text-left sm:w-[min(30%,13rem)]">
                        <span className="w-full truncate text-[10px] font-black italic uppercase leading-[1.15] tracking-tight text-white/85 sm:text-xs">
                            {match.roundName || match.groupName || 'Fase de Grupos'}
                        </span>
                        <span className="w-full truncate text-[10px] font-black italic uppercase leading-tight tracking-tight text-padel-primary sm:text-xs">
                            {tournament?.category?.replace('MAS_', '+').replace('_', ' ') || match.category || 'Categoría Principal'}
                        </span>
                        <span className="w-full truncate text-[10px] font-black italic uppercase leading-tight tracking-tight text-white/55 sm:text-xs">
                            {tournament?.gender === 'FEMALE' ? 'Femenino' : tournament?.gender === 'MALE' ? 'Masculino' : 'Mixto'}
                        </span>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0 pt-0 sm:px-0.5">
                        <h1 className="mb-0 flex min-w-0 w-full max-w-[min(100vw-10rem,22rem)] flex-col items-center gap-0 text-center leading-none">
                            <span className="w-full text-center text-[10px] font-black italic uppercase leading-[1.15] tracking-tight text-white/85 sm:text-xs">
                                Cancha
                            </span>
                            <span className="label-cancha-hero mt-px min-w-0 w-full truncate px-0.5 text-center">
                                {match.courtName ||
                                    (match.court != null && Number(match.court) >= 1
                                        ? `Pista ${match.court}`
                                        : match.courtIndex != null
                                          ? `Pista ${match.courtIndex + 1}`
                                          : 'Pista 1')}
                            </span>
                        </h1>

                        {/* Misma fila: atrás + 2 acciones | reloj/empezar | 2 acciones — alineados al centro vertical */}
                        <div className="mt-0.5 flex w-full min-w-0 items-center justify-center gap-0.5 sm:gap-1.5">
                            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        const tab =
                                            match?.status === MatchStatus.FINISHED
                                                ? 'finalizados'
                                                : match?.status === MatchStatus.LIVE
                                                  ? 'live'
                                                  : 'por-comenzar';
                                        router.push(`/tournaments/${id}?tab=${tab}`);
                                    }}
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all group hover:bg-white/10 sm:h-10 sm:w-10"
                                    title="Volver al torneo"
                                >
                                    <ChevronLeft className="h-4 w-4 text-gray-400 transition-colors group-hover:text-padel-primary sm:h-5 sm:w-5" />
                                </motion.button>
                                {[
                                    { icon: RefreshCw, onClick: () => setShowMatchSelector(true), color: 'hover:text-padel-primary', label: 'Cambiar Pista' },
                                    { icon: Monitor, onClick: () => { const pizarraUrl = '/tournaments/' + id + '/display/' + (match?.id || matchId); window.open(pizarraUrl, '_blank'); }, color: 'hover:text-padel-primary', label: 'Abrir / Refrescar Pizarra' },
                                ].map((btn, idx) => (
                                    <motion.button
                                        key={idx}
                                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={btn.onClick}
                                        className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 text-gray-500 transition-all sm:h-10 sm:w-10 ${btn.color}`}
                                        title={btn.label}
                                    >
                                        <btn.icon className="h-5 w-5" />
                                    </motion.button>
                                ))}
                            </div>

                            <div className="flex min-h-[4.75rem] min-w-0 max-w-[min(52vw,14rem)] flex-1 flex-col items-center justify-center sm:min-h-[5rem] sm:max-w-[14rem]">
                                {match.status === MatchStatus.PENDING ? (
                                    <>
                                        <motion.button
                                            type="button"
                                            title="Empezar partido"
                                            initial={{ y: -12, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            whileHover={{ scale: 1.03, backgroundColor: '#ccff00', color: '#000' }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={startMatch}
                                            className="flex w-full max-w-[10.5rem] items-center justify-center gap-1.5 px-2.5 py-1.5 sm:max-w-[12rem] sm:px-3.5 sm:py-2 bg-padel-primary text-black rounded-b-xl sm:rounded-b-2xl text-[8px] sm:text-[10px] font-black italic uppercase tracking-[0.08em] sm:tracking-[0.1em] shadow-[0_6px_20px_-8px_rgba(204,255,0,0.35)] transition-all border-x border-b border-black/10 whitespace-nowrap"
                                        >
                                            <Play className="h-3 w-3 shrink-0 fill-current sm:h-3.5 sm:w-3.5" />
                                            <span className="leading-none">Empezar</span>
                                        </motion.button>
                                        <div className="mt-1 flex w-full items-center justify-center gap-1 px-0.5 leading-none select-none">
                                            <span className="text-[7px] font-black uppercase tracking-tight text-white/35 tabular-nums sm:text-[8px]">
                                                {now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                            </span>
                                            <span className="text-white/25">·</span>
                                            <span className="text-[9px] font-black italic uppercase tracking-tighter text-white/45 tabular-nums sm:text-[10px]">
                                                {now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex w-full flex-col items-center justify-center rounded-b-2xl border-x border-b border-white/10 bg-white/[0.03] px-2 py-1.5 shadow-2xl backdrop-blur-xl sm:max-w-[14rem] sm:rounded-b-3xl sm:px-3 sm:py-1.5">
                                        <span className="text-lg font-black italic leading-none tracking-tighter text-glow text-white tabular-nums sm:text-2xl md:text-[1.75rem]">
                                            {formatDuration(duration)}
                                        </span>
                                        <div className="mt-0.5 flex items-center gap-1.5 sm:mt-1">
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="h-1.5 w-1.5 shrink-0 rounded-full bg-padel-primary shadow-[0_0_10px_#ccff00]"
                                            />
                                            <span className="whitespace-nowrap text-[7px] font-black italic uppercase tracking-[0.18em] text-padel-primary/80 sm:text-[8px]">
                                                Tiempo de Juego
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                                {[
                                    { icon: Users, onClick: openNameEditor, color: 'hover:text-padel-primary', label: 'Editar nombres' },
                                    { icon: Settings, onClick: () => setShowAdjustModal(true), color: 'hover:text-white', label: 'Ajustes' },
                                ].map((btn, idx) => (
                                    <motion.button
                                        key={idx}
                                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={btn.onClick}
                                        className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 text-gray-500 transition-all sm:h-10 sm:w-10 ${btn.color}`}
                                        title={btn.label}
                                    >
                                        <btn.icon className="h-5 w-5" />
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex w-[min(30%,11rem)] min-w-0 shrink-0 flex-row items-center justify-end gap-2 self-start sm:w-[min(30%,15rem)] sm:gap-2.5">
                        <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(239,68,68,0.15)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleMedicalTimeout}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/35 bg-red-500/10 text-red-500 transition-all sm:h-11 sm:w-11"
                            title="Asistencia Médica"
                        >
                            <div className="relative flex h-5 w-5 items-center justify-center">
                                <div className="absolute h-1.5 w-5 rounded-full bg-current" />
                                <div className="absolute h-5 w-1.5 rounded-full bg-current" />
                            </div>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleFinishMatch}
                            className={`shrink-0 rounded-xl px-3 py-2 text-[9px] font-black italic uppercase tracking-[0.12em] transition-all sm:px-4 sm:py-2.5 sm:text-[10px] ${finishClicks === 0
                                ? 'border border-padel-primary/60 bg-padel-primary/15 text-padel-primary shadow-[0_0_22px_rgba(204,255,0,0.45),inset_0_0_20px_rgba(204,255,0,0.08)] hover:border-padel-primary hover:bg-padel-primary/25 hover:shadow-[0_0_32px_rgba(204,255,0,0.55)]'
                                : finishClicks === 1
                                    ? 'border border-orange-400 bg-orange-500 text-white shadow-[0_0_24px_rgba(249,115,22,0.45)]'
                                    : 'border border-red-400 bg-red-600 text-white shadow-[0_0_24px_rgba(220,38,38,0.45)]'
                                }`}
                        >
                            {finishClicks === 0 ? 'Finalizar' : finishClicks === 1 ? '¿Seguro?' : 'Confirmar'}
                        </motion.button>
                    </div>
                </div>
            </header>

            {/* Ayuda sacador: solo el marker controla quién saca (un toque en el jugador) */}
            {match.status === MatchStatus.LIVE && (
                <div className="flex shrink-0 flex-wrap items-center justify-center gap-1 px-2 py-0.5 sm:gap-1.5 sm:px-3 sm:py-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35 text-center">
                        Sacador: toca J1–J4 · doble toque = deshacer punto
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => toggleServingPlayer()}
                            className="px-2.5 py-1 rounded-lg border border-white/15 bg-white/5 text-[8px] font-black uppercase tracking-widest text-padel-primary hover:bg-padel-primary/10"
                        >
                            Otro jugador (misma pareja)
                        </button>
                        <button
                            type="button"
                            onClick={() => toggleServingTeam()}
                            className="px-2.5 py-1 rounded-lg border border-white/15 bg-white/5 text-[8px] font-black uppercase tracking-widest text-white/70 hover:bg-white/10"
                        >
                            Cambiar pareja al saque
                        </button>
                    </div>
                </div>
            )}

            {/* Equipos + animaciones pizarra (diseño original, pads más compactos) */}
            <main className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden px-0.5">
                <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden md:flex-row md:gap-1.5">
                {/* Team 1 Card */}
                <div className="glass group relative flex min-h-0 min-w-0 flex-1 flex-col items-center justify-start overflow-hidden rounded-[1.25rem] p-2 pt-1.5 shadow-2xl sm:rounded-[2rem] sm:p-3 sm:pt-2 md:p-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-padel-primary/[0.04] to-transparent opacity-50" />

                    {/* Players Section — centrado: J1, J2 con mismo tamaño; servicio = solo borde amarillo */}
                    <div className="relative z-10 mb-1 flex w-full shrink-0 items-start justify-center gap-2 sm:mb-1.5 sm:gap-3">
                        {[1, 2].map((pNum) => {
                            const isServer = server.team === 1 && server.player === pNum;
                            const playerName = pNum === 1 ? match.team1.p1 : match.team1.p2;
                            const jLabel = pNum === 1 ? 'J1' : 'J2';

                            return (
                                <div key={pNum} className="flex max-w-[140px] shrink-0 flex-col items-center gap-1 sm:gap-2">
                                    <div
                                        onClick={() => handlePlayerIconClick(1, pNum)}
                                        className="relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl opacity-90 transition-all duration-500 hover:opacity-100 sm:h-16 sm:w-16 sm:rounded-2xl"
                                    >
                                        <div className={`flex h-full w-full items-center justify-center rounded-xl border-4 transition-colors sm:rounded-2xl ${isServer ? 'border-padel-primary' : 'border-white/10'}`}>
                                            <span className="text-base font-black italic text-white/90 sm:text-lg">{jLabel}</span>
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

                    {/* Vertical Stats (Games/Sets) — alineado al bloque superior */}
                    <div className="absolute right-1 top-[30%] z-20 flex min-w-[2.5rem] -translate-y-1/2 flex-col items-center gap-1.5 rounded-xl border border-white/5 bg-black/20 px-1.5 py-1.5 backdrop-blur-md sm:right-4 sm:top-[32%] sm:gap-3 sm:rounded-2xl sm:px-2.5 sm:py-3 sm:min-w-[3rem]">
                        <div className="flex w-full flex-col items-center">
                            <span className="mb-0.5 text-[7px] font-black uppercase tracking-[0.2em] text-gray-500 sm:mb-1 sm:text-[8px]">G</span>
                            <span className={`w-full text-center font-black italic tabular-nums leading-none text-padel-primary ${(match.games?.t1 ?? 0) >= 10 ? 'text-2xl sm:text-3xl' : 'text-[clamp(1.25rem,5vmin,2.25rem)] sm:text-4xl'}`}>
                                {match.games?.t1 ?? 0}
                            </span>
                        </div>
                        <div className="h-px w-5 bg-white/10 sm:w-6" />
                        <div className="flex w-full flex-col items-center">
                            <span className="mb-0.5 text-[7px] font-black uppercase tracking-[0.2em] text-gray-500 sm:mb-1 sm:text-[8px]">S</span>
                            <span className={`w-full text-center font-black italic tabular-nums leading-none text-white ${(match.sets?.t1 ?? 0) >= 10 ? 'text-2xl sm:text-3xl' : 'text-[clamp(1.25rem,5vmin,2.25rem)] sm:text-4xl'}`}>
                                {match.sets?.t1 ?? 0}
                            </span>
                        </div>
                    </div>

                    {/* Central Points Control (marcador del game) — centrado */}
                    <div className="relative z-10 mb-0.5 flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-black/40 p-0.5 shadow-inner sm:mb-1 sm:gap-2.5 sm:rounded-2xl sm:p-1">
                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.08)' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateScore('t1', 'minus')}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 glass text-white/20 transition-colors hover:text-white/60 sm:h-10 sm:w-10"
                        >
                            <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
                        </motion.button>

                        <div className={`flex min-w-0 flex-col items-center px-2 sm:px-4 ${String(match.points?.t1 || '0').length >= 2 ? 'min-w-[72px] sm:min-w-[96px]' : 'min-w-[64px] sm:min-w-[80px]'}`}>
                            <span className="mb-0.5 text-[7px] font-black uppercase tracking-widest text-gray-500 sm:text-[8px]">Points</span>
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={match.points?.t1}
                                    initial={{ y: 5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -5, opacity: 0 }}
                                    className={`text-center font-black italic tabular-nums leading-none text-glow text-white ${String(match.points?.t1 || '0').length >= 2 ? 'text-[clamp(1.35rem,6vmin,1.85rem)] sm:text-3xl' : 'text-[clamp(1.5rem,7vmin,2.25rem)] sm:text-4xl'}`}
                                >
                                    {match.points?.t1 || '0'}
                                </motion.span>
                            </AnimatePresence>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(204,255,0,0.15)' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateScore('t1', 'plus')}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-padel-primary/20 bg-padel-primary/10 text-padel-primary shadow-[0_5px_15px_-5px_rgba(204,255,0,0.3)] transition-all hover:border-padel-primary/40 sm:h-10 sm:w-10"
                        >
                            <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                        </motion.button>
                    </div>
                    {/* 6 performance pads equipo 1 — numerados 1 a 6 (compactos) */}
                    <div className="mx-auto mt-0 flex min-h-0 w-full max-w-[min(100%,9.5rem)] flex-col gap-0.5 sm:max-w-[11rem] sm:gap-1">
                        <div className="grid grid-cols-3 gap-0.5 sm:gap-1.5">
                            {[1, 2, 3].map((i) => {
                                const entry = padsAnimaciones[i - 1];
                                const animId = entry?.[0];
                                const canFire = !!(animId && animacionesMarcador[animId]?.url);
                                return (
                                    <motion.button
                                        key={i}
                                        type="button"
                                        title={entry?.[1]?.nombre ? `${i}: ${entry[1].nombre}` : `Pad ${i}`}
                                        disabled={!canFire}
                                        whileHover={canFire ? { scale: 1.02, boxShadow: '0 6px 20px -4px rgba(204,255,0,0.25)' } : undefined}
                                        whileTap={canFire ? { scale: 0.92, boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.4)' } : undefined}
                                        onClick={() => animId && canFire && dispararAnimacionMarcador(`cancha_${matchCourt}`, animId)}
                                        className={`aspect-square min-h-[22px] rounded-md border border-white/20 bg-gradient-to-b from-zinc-700/90 to-zinc-900 font-black tabular-nums text-white/90 shadow-[0_3px_8px_-2px_rgba(0,0,0,0.5)] transition-colors sm:min-h-[28px] sm:rounded-lg ${canFire ? 'hover:border-padel-primary/40 hover:from-zinc-600/90 hover:to-zinc-800 active:from-zinc-800 active:to-zinc-950' : 'cursor-not-allowed opacity-40'} ${i >= 10 ? 'px-0.5 text-[7px] sm:text-[8px]' : 'text-[7px] sm:text-[9px]'}`}
                                    >
                                        {i}
                                    </motion.button>
                                );
                            })}
                        </div>
                        <div className="grid grid-cols-3 gap-0.5 sm:gap-1.5">
                            {[4, 5, 6].map((i) => {
                                const entry = padsAnimaciones[i - 1];
                                const animId = entry?.[0];
                                const canFire = !!(animId && animacionesMarcador[animId]?.url);
                                return (
                                    <motion.button
                                        key={i}
                                        type="button"
                                        title={entry?.[1]?.nombre ? `${i}: ${entry[1].nombre}` : `Pad ${i}`}
                                        disabled={!canFire}
                                        whileHover={canFire ? { scale: 1.02, boxShadow: '0 6px 20px -4px rgba(204,255,0,0.25)' } : undefined}
                                        whileTap={canFire ? { scale: 0.92, boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.4)' } : undefined}
                                        onClick={() => animId && canFire && dispararAnimacionMarcador(`cancha_${matchCourt}`, animId)}
                                        className={`aspect-square min-h-[22px] rounded-md border border-white/20 bg-gradient-to-b from-zinc-700/90 to-zinc-900 font-black tabular-nums text-white/90 shadow-[0_3px_8px_-2px_rgba(0,0,0,0.5)] transition-colors sm:min-h-[28px] sm:rounded-lg ${canFire ? 'hover:border-padel-primary/40 hover:from-zinc-600/90 hover:to-zinc-800 active:from-zinc-800 active:to-zinc-950' : 'cursor-not-allowed opacity-40'} ${i >= 10 ? 'px-0.5 text-[7px] sm:text-[8px]' : 'text-[7px] sm:text-[9px]'}`}
                                    >
                                        {i}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </div>


                {/* Team 2 Card */}
                <div className="glass group relative flex min-h-0 min-w-0 flex-1 flex-col items-center justify-start overflow-hidden rounded-[1.25rem] p-2 pt-1.5 shadow-2xl sm:rounded-[2rem] sm:p-3 sm:pt-2 md:p-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-padel-primary/[0.04] to-transparent opacity-50" />

                    {/* Players Section — centrado: J3, J4 con mismo tamaño; servicio = solo borde amarillo */}
                    <div className="relative z-10 mb-1 flex w-full shrink-0 items-start justify-center gap-2 sm:mb-1.5 sm:gap-3">
                        {[1, 2].map((pNum) => {
                            const isServer = server.team === 2 && server.player === pNum;
                            const playerName = pNum === 1 ? match.team2.p1 : match.team2.p2;
                            const jLabel = pNum === 1 ? 'J3' : 'J4';

                            return (
                                <div key={pNum} className="flex max-w-[140px] shrink-0 flex-col items-center gap-1 sm:gap-2">
                                    <div
                                        onClick={() => handlePlayerIconClick(2, pNum)}
                                        className="relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl opacity-90 transition-all duration-500 hover:opacity-100 sm:h-16 sm:w-16 sm:rounded-2xl"
                                    >
                                        <div className={`flex h-full w-full items-center justify-center rounded-xl border-4 transition-colors sm:rounded-2xl ${isServer ? 'border-padel-primary' : 'border-white/10'}`}>
                                            <span className="text-base font-black italic text-white/90 sm:text-lg">{jLabel}</span>
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

                    {/* Vertical Stats (Games/Sets) — alineado al bloque superior */}
                    <div className="absolute left-1 top-[30%] z-20 flex min-w-[2.5rem] -translate-y-1/2 flex-col items-center gap-1.5 rounded-xl border border-white/5 bg-black/20 px-1.5 py-1.5 backdrop-blur-md sm:left-4 sm:top-[32%] sm:gap-3 sm:rounded-2xl sm:px-2.5 sm:py-3 sm:min-w-[3rem]">
                        <div className="flex w-full flex-col items-center">
                            <span className="mb-0.5 text-[7px] font-black uppercase tracking-[0.2em] text-gray-500 sm:mb-1 sm:text-[8px]">G</span>
                            <span className={`w-full text-center font-black italic tabular-nums leading-none text-padel-primary ${(match.games?.t2 ?? 0) >= 10 ? 'text-2xl sm:text-3xl' : 'text-[clamp(1.25rem,5vmin,2.25rem)] sm:text-4xl'}`}>
                                {match.games?.t2 ?? 0}
                            </span>
                        </div>
                        <div className="h-px w-5 bg-white/10 sm:w-6" />
                        <div className="flex w-full flex-col items-center">
                            <span className="mb-0.5 text-[7px] font-black uppercase tracking-[0.2em] text-gray-500 sm:mb-1 sm:text-[8px]">S</span>
                            <span className={`w-full text-center font-black italic tabular-nums leading-none text-white ${(match.sets?.t2 ?? 0) >= 10 ? 'text-2xl sm:text-3xl' : 'text-[clamp(1.25rem,5vmin,2.25rem)] sm:text-4xl'}`}>
                                {match.sets?.t2 ?? 0}
                            </span>
                        </div>
                    </div>

                    {/* Central Points Control (marcador del game) — centrado */}
                    <div className="relative z-10 mb-0.5 flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-black/40 p-0.5 shadow-inner sm:mb-1 sm:gap-2.5 sm:rounded-2xl sm:p-1">
                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.08)' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateScore('t2', 'minus')}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 glass text-white/20 transition-colors hover:text-white/60 sm:h-10 sm:w-10"
                        >
                            <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
                        </motion.button>

                        <div className={`flex min-w-0 flex-col items-center px-2 sm:px-4 ${String(match.points?.t2 || '0').length >= 2 ? 'min-w-[72px] sm:min-w-[96px]' : 'min-w-[64px] sm:min-w-[80px]'}`}>
                            <span className="mb-0.5 text-[7px] font-black uppercase tracking-widest text-gray-500 sm:text-[8px]">Points</span>
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={match.points?.t2}
                                    initial={{ y: 5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -5, opacity: 0 }}
                                    className={`text-center font-black italic tabular-nums leading-none text-glow text-white ${String(match.points?.t2 || '0').length >= 2 ? 'text-[clamp(1.35rem,6vmin,1.85rem)] sm:text-3xl' : 'text-[clamp(1.5rem,7vmin,2.25rem)] sm:text-4xl'}`}
                                >
                                    {match.points?.t2 || '0'}
                                </motion.span>
                            </AnimatePresence>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(204,255,0,0.15)' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateScore('t2', 'plus')}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-padel-primary/20 bg-padel-primary/10 text-padel-primary shadow-[0_5px_15px_-5px_rgba(204,255,0,0.3)] transition-all hover:border-padel-primary/40 sm:h-10 sm:w-10"
                        >
                            <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                        </motion.button>
                    </div>
                    {/* 6 performance pads equipo 2 — numerados 7 a 12 (compactos) */}
                    <div className="mx-auto mt-0 flex min-h-0 w-full max-w-[min(100%,9.5rem)] flex-col gap-0.5 sm:max-w-[11rem] sm:gap-1">
                        <div className="grid grid-cols-3 gap-0.5 sm:gap-1.5">
                            {[7, 8, 9].map((i) => {
                                const entry = padsAnimaciones[i - 1];
                                const animId = entry?.[0];
                                const canFire = !!(animId && animacionesMarcador[animId]?.url);
                                return (
                                    <motion.button
                                        key={i}
                                        type="button"
                                        title={entry?.[1]?.nombre ? `${i}: ${entry[1].nombre}` : `Pad ${i}`}
                                        disabled={!canFire}
                                        whileHover={canFire ? { scale: 1.02, boxShadow: '0 6px 20px -4px rgba(204,255,0,0.25)' } : undefined}
                                        whileTap={canFire ? { scale: 0.92, boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.4)' } : undefined}
                                        onClick={() => animId && canFire && dispararAnimacionMarcador(`cancha_${matchCourt}`, animId)}
                                        className={`aspect-square min-h-[22px] rounded-md border border-white/20 bg-gradient-to-b from-zinc-700/90 to-zinc-900 font-black tabular-nums text-white/90 shadow-[0_3px_8px_-2px_rgba(0,0,0,0.5)] transition-colors sm:min-h-[28px] sm:rounded-lg ${canFire ? 'hover:border-padel-primary/40 hover:from-zinc-600/90 hover:to-zinc-800 active:from-zinc-800 active:to-zinc-950' : 'cursor-not-allowed opacity-40'} ${i >= 10 ? 'px-0.5 text-[7px] sm:text-[8px]' : 'text-[7px] sm:text-[9px]'}`}
                                    >
                                        {i}
                                    </motion.button>
                                );
                            })}
                        </div>
                        <div className="grid grid-cols-3 gap-0.5 sm:gap-1.5">
                            {[10, 11, 12].map((i) => {
                                const entry = padsAnimaciones[i - 1];
                                const animId = entry?.[0];
                                const canFire = !!(animId && animacionesMarcador[animId]?.url);
                                return (
                                    <motion.button
                                        key={i}
                                        type="button"
                                        title={entry?.[1]?.nombre ? `${i}: ${entry[1].nombre}` : `Pad ${i}`}
                                        disabled={!canFire}
                                        whileHover={canFire ? { scale: 1.02, boxShadow: '0 6px 20px -4px rgba(204,255,0,0.25)' } : undefined}
                                        whileTap={canFire ? { scale: 0.92, boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.4)' } : undefined}
                                        onClick={() => animId && canFire && dispararAnimacionMarcador(`cancha_${matchCourt}`, animId)}
                                        className={`aspect-square min-h-[22px] rounded-md border border-white/20 bg-gradient-to-b from-zinc-700/90 to-zinc-900 font-black tabular-nums text-white/90 shadow-[0_3px_8px_-2px_rgba(0,0,0,0.5)] transition-colors sm:min-h-[28px] sm:rounded-lg ${canFire ? 'hover:border-padel-primary/40 hover:from-zinc-600/90 hover:to-zinc-800 active:from-zinc-800 active:to-zinc-950' : 'cursor-not-allowed opacity-40'} ${i >= 10 ? 'px-0.5 text-[7px] sm:text-[8px]' : 'text-[7px] sm:text-[9px]'}`}
                                    >
                                        {i}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </div>
                </div>

                {Object.keys(animacionesMarcador).length > 0 && (
                    <div className="flex w-full min-w-0 shrink-0 flex-col gap-1 self-start rounded-lg border border-white/10 bg-black/30 p-1.5 sm:rounded-xl sm:p-2">
                        <span className="text-[7px] font-black uppercase tracking-widest text-gray-500 sm:text-[8px]">Animaciones pizarra</span>
                        <div className="grid w-full min-w-0 grid-cols-4 gap-1 md:grid-cols-6">
                            {Object.entries(animacionesMarcador)
                                .sort((a, b) => a[0].localeCompare(b[0]))
                                .map(([animId, a]) => {
                                    const label = a.nombre || animId;
                                    return (
                                        <motion.button
                                            key={animId}
                                            type="button"
                                            title={label}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => dispararAnimacionMarcador(`cancha_${matchCourt}`, animId)}
                                            className="flex min-h-[2.1rem] min-w-0 flex-col items-center justify-center gap-0.5 rounded-md border border-white/10 bg-white/5 px-1 py-0.5 text-center transition-colors hover:border-padel-primary/30 hover:bg-padel-primary/10 sm:min-h-[2.35rem] sm:rounded-lg sm:px-1.5 sm:py-1"
                                        >
                                            <Zap className="h-2.5 w-2.5 shrink-0 text-padel-primary sm:h-3 sm:w-3" />
                                            <span className="w-full max-w-full break-words text-[6px] font-black uppercase leading-tight tracking-tighter text-padel-primary line-clamp-2 sm:text-[7px]">
                                                {label}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                        </div>
                    </div>
                )}
            </main>

            {/* Rectangle 4: Footer */}
            <footer className="relative z-10 flex h-11 shrink-0 items-center justify-between gap-3 rounded-[1rem] px-3 shadow-2xl glass sm:h-12 sm:gap-6 sm:rounded-[1.2rem] sm:px-6">
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
                                    <p className="text-xs font-black italic text-padel-primary uppercase tracking-[0.2em] mt-1">
                                        Pista libre (en vivo) o intercambio con un partido por comenzar
                                    </p>
                                </div>
                                <button onClick={() => setShowMatchSelector(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all text-gray-500">
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                {match?.status === MatchStatus.LIVE && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                                            Trasladar a pista libre
                                        </p>
                                        {vacantCourts.length === 0 ? (
                                            <p className="text-sm text-white/35 italic py-4 text-center">
                                                No hay pistas libres (todas tienen un partido en vivo u ocupadas en el calendario de pistas).
                                            </p>
                                        ) : (
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {vacantCourts.map((c) => {
                                                    const label =
                                                        Array.isArray(tournament?.courtNames) && tournament.courtNames[c - 1]
                                                            ? tournament.courtNames[c - 1]
                                                            : `Pista ${c}`;
                                                    const busy = courtMoveBusy === c;
                                                    return (
                                                        <button
                                                            key={c}
                                                            type="button"
                                                            disabled={courtMoveBusy !== null || !!swappingCourtWith}
                                                            onClick={() => changeMatchCourt(c)}
                                                            className="p-5 rounded-2xl border border-brand/30 bg-brand/5 text-left hover:bg-brand/10 transition-all disabled:opacity-40 disabled:pointer-events-none"
                                                        >
                                                            <div className="flex items-center justify-between gap-2">
                                                                <div>
                                                                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                                                                        Vacante · LIVE
                                                                    </span>
                                                                    <p className="text-lg font-black text-brand mt-1">{label}</p>
                                                                </div>
                                                                {busy ? (
                                                                    <RefreshCw className="w-5 h-5 text-brand animate-spin shrink-0" />
                                                                ) : (
                                                                    <span className="text-[10px] font-black text-brand uppercase tracking-widest shrink-0">
                                                                        Trasladar
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="border-t border-white/10 pt-6 space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                                        Intercambiar con partido pendiente
                                    </p>
                                </div>
                                {tournament?.matches?.filter((m: any) => m.status === MatchStatus.PENDING && m.id !== match?.id).map((m: any) => {
                                    const otherCourt = m.court ?? (m.courtIndex != null ? m.courtIndex + 1 : '-');
                                    const courtLabel = m.courtName ?? (m.court != null ? `Pista ${m.court}` : (m.courtIndex != null ? `Pista ${m.courtIndex + 1}` : 'Pista –'));
                                    const isSwapping = swappingCourtWith === m.id;
                                    return (
                                        <button
                                            key={m.id}
                                            disabled={!!swappingCourtWith || courtMoveBusy !== null}
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
                                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Super tie-break (STB)</span>
                                    <p className="text-[9px] text-gray-600 leading-relaxed">Solo aplica al desempate final a 2 sets. El tie-break de set va siempre a 7 con diferencia de 2.</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[7, 10].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => setSuperTiebreakTarget(val)}
                                                className={`py-4 rounded-2xl border font-black italic uppercase text-xs transition-all ${superTiebreakTarget === val
                                                    ? 'bg-padel-primary text-black border-padel-primary shadow-[0_0_20px_rgba(204,255,0,0.2)]'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                STB a {val} pts
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-4">
                                <button
                                    onClick={async () => {
                                        if (!confirm('¿Resetear marcador de este partido?')) return;
                                        try {
                                            await dataService.updateMatch(id, match.id, {
                                                points: { t1: '0', t2: '0' },
                                                games: { t1: 0, t2: 0 },
                                                sets: { t1: 0, t2: 0 },
                                                setScores: [],
                                                isTiebreak: false,
                                                superTiebreak: false,
                                                superTiebreakScore: null,
                                                status: MatchStatus.PENDING,
                                                startedAt: null,
                                                finishedAt: null,
                                            });
                                            setMatch((prev: any) => prev ? {
                                                ...prev,
                                                points: { t1: '0', t2: '0' },
                                                games: { t1: 0, t2: 0 },
                                                sets: { t1: 0, t2: 0 },
                                                setScores: [],
                                                isTiebreak: false,
                                                superTiebreak: false,
                                                superTiebreakScore: null,
                                                status: MatchStatus.PENDING,
                                                startedAt: null,
                                                finishedAt: null,
                                            } : prev);
                                            setShowAdjustModal(false);
                                        } catch (e) {
                                            console.error('Reset match:', e);
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
                {showNameModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[410] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
                        onClick={() => setShowNameModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#111] border border-white/10 rounded-[3rem] w-full max-w-2xl overflow-hidden flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Editar Nombres</h3>
                                    <p className="text-[10px] font-black italic text-gray-500 uppercase tracking-widest mt-1">Completa jugadores si la carga automática falla</p>
                                </div>
                                <button onClick={() => setShowNameModal(false)} className="p-4 bg-white/5 rounded-full hover:bg-white/10 transition-all text-gray-400">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Jugador 1</label>
                                        <input
                                            value={nameDraft.t1p1}
                                            onChange={(e) => setNameDraft((p) => ({ ...p, t1p1: e.target.value }))}
                                            placeholder="Jugador 1"
                                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none focus:border-padel-primary/60"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Jugador 2</label>
                                        <input
                                            value={nameDraft.t1p2}
                                            onChange={(e) => setNameDraft((p) => ({ ...p, t1p2: e.target.value }))}
                                            placeholder="Jugador 2"
                                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none focus:border-padel-primary/60"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Jugador 3</label>
                                        <input
                                            value={nameDraft.t2p1}
                                            onChange={(e) => setNameDraft((p) => ({ ...p, t2p1: e.target.value }))}
                                            placeholder="Jugador 3"
                                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none focus:border-padel-primary/60"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Jugador 4</label>
                                        <input
                                            value={nameDraft.t2p2}
                                            onChange={(e) => setNameDraft((p) => ({ ...p, t2p2: e.target.value }))}
                                            placeholder="Jugador 4"
                                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none focus:border-padel-primary/60"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-4">
                                <button
                                    onClick={() => setShowNameModal(false)}
                                    className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={saveEditedNames}
                                    className="flex-1 py-4 bg-padel-primary text-black rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all"
                                >
                                    Guardar nombres
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
