'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Crosshair, Wifi, WifiOff, ChevronUp, ChevronDown,
    Play, Square, RefreshCw, Shield, Trophy, Zap, Star, AlertCircle
} from 'lucide-react';
import { getCanchaLabel } from '@/lib/markerCanchas';
import { isGenericEquipoNombre, resolveMatchTeamLines } from '@/lib/resolveMatchTeamLines';
import {
    getScoringRules,
    isSetCompleteByGames,
    shouldEnterSetTiebreak,
    winsTiebreakPoints,
} from '@/lib/matchScoringRules';
import Link from 'next/link';

const PUNTOS_NORMAL = ['0', '15', '30', '40', 'AD'];
const PUNTOS_TB = Array.from({ length: 21 }, (_, i) => String(i)); // 0..20 (más que suficiente)
const NUM_CANCHAS = 6;

export default function MarkerControlPage() {
    const routeParams = useParams<{ canchaId: string }>();
    const canchaId = String(routeParams?.canchaId ?? '');
    const { user, profile, loading: authLoading, canMarkInCancha, markerCanchas } = useAuth();
    const router = useRouter();
    const [accessDenied, setAccessDenied] = useState(false);

    const [canchaData, setCanchaData] = useState<any>(null);
    const [loadingCancha, setLoadingCancha] = useState(true);
    const [activando, setActivando] = useState(false);
    const [equipo1, setEquipo1] = useState({ nombre: 'Equipo 1', color: '#CCFF00' });
    const [equipo2, setEquipo2] = useState({ nombre: 'Equipo 2', color: '#FF5500' });
    const [showSetup, setShowSetup] = useState(false);
    const [cronSeconds, setCronSeconds] = useState(0);
    const [refrescandoPizarra, setRefrescandoPizarra] = useState(false);
    const [showJugadoresEdit, setShowJugadoresEdit] = useState(false);
    const [jugadoresDraft, setJugadoresDraft] = useState({
        j1: '',
        j2: '',
        j3: '',
        j4: '',
    });

    const searchParams = useSearchParams();
    // Soporte para jugadores individuales (p1/p2 = equipo 1, p3/p4 = equipo 2)
    const p1Raw = searchParams.get('p1') || '';
    const p2Raw = searchParams.get('p2') || '';
    const p3Raw = searchParams.get('p3') || '';
    const p4Raw = searchParams.get('p4') || '';
    // Fallback legacy: team1 / team2 como nombre de equipo completo
    const team1Raw = searchParams.get('team1') || '';
    const team2Raw = searchParams.get('team2') || '';
    /** IDs torneo / partido (grilla u enlaces manuales) → nombres y vínculo con cuadro. */
    const tParam = searchParams.get('t')?.trim() || '';
    const mParam = searchParams.get('m')?.trim() || '';
    const urlHasTeamText = !!(p1Raw || p2Raw || p3Raw || p4Raw || team1Raw || team2Raw);

    // Formatea nombres como: "Nombre1 Nombre2 Apellido1 Apellido2..." -> "Nombre1 N. Apellido1 Apellido2..."
    // Si solo hay 2 partes, deja el nombre tal cual.
    const formatPlayerForMarker = (full: string): string => {
        const trimmed = (full || '').trim();
        if (!trimmed) return '';
        const parts = trimmed.split(/\s+/).filter(Boolean);
        if (parts.length === 2) return `${parts[0]} ${parts[1]}`;
        if (parts.length < 2) return trimmed;
        const firstName = parts[0];
        const secondInitial = parts[1]?.[0] ? `${parts[1][0].toUpperCase()}.` : '';
        const lastNameFull = parts.slice(2).join(' ');
        return [firstName, secondInitial, lastNameFull].filter(Boolean).join(' ');
    };

    // Si el equipo viene como "Jugador A / Jugador B", formateamos cada jugador.
    const formatTeamNameForMarker = (teamName: string): string => {
        const trimmed = (teamName || '').trim();
        if (!trimmed) return '';
        const parts = trimmed.split('/').map(p => p.trim()).filter(Boolean);
        if (parts.length <= 1) return formatPlayerForMarker(trimmed);
        return parts.map(formatPlayerForMarker).join(' / ');
    };

    const canchaLabel = canchaId; // ej: "cancha_1"
    const canchaNum = canchaId.split('_')[1];
    const isEnVivo = canchaData?.estado === 'en_vivo';
    const marcador = canchaData?.marcador;

    // Migrar nombres desde el torneo (vienen por querystring al abrir el marker)
    useEffect(() => {
        const hasIndividual = p1Raw || p2Raw || p3Raw || p4Raw;
        if (hasIndividual) {
            // Construir nombre del equipo a partir de jugadores individuales
            const e1 = [p1Raw, p2Raw].filter(Boolean).map(formatPlayerForMarker).join(' / ');
            const e2 = [p3Raw, p4Raw].filter(Boolean).map(formatPlayerForMarker).join(' / ');
            if (e1) setEquipo1(prev => (prev.nombre === e1 ? prev : { ...prev, nombre: e1 }));
            if (e2) setEquipo2(prev => (prev.nombre === e2 ? prev : { ...prev, nombre: e2 }));
        } else {
            // Fallback legacy: usar team1/team2 como nombre de equipo
            if (team1Raw) {
                const formatted = formatTeamNameForMarker(team1Raw);
                if (formatted) setEquipo1(prev => (prev.nombre === formatted ? prev : { ...prev, nombre: formatted }));
            }
            if (team2Raw) {
                const formatted = formatTeamNameForMarker(team2Raw);
                if (formatted) setEquipo2(prev => (prev.nombre === formatted ? prev : { ...prev, nombre: formatted }));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [p1Raw, p2Raw, p3Raw, p4Raw, team1Raw, team2Raw]);

    // Sin nombres en query: rellenar equipos desde el partido del torneo (solo ?t=&m=).
    useEffect(() => {
        if (!tParam || !mParam || urlHasTeamText) return;
        let cancelled = false;
        (async () => {
            try {
                const tourney = await dataService.getTournament(tParam);
                const matches = await dataService.getMatches(tParam);
                if (cancelled) return;
                const found = matches.find((x: any) => x.id === mParam);
                if (!found) return;
                const { team1, team2 } = resolveMatchTeamLines(found, tourney);
                setEquipo1(prev => (prev.nombre === team1 ? prev : { ...prev, nombre: team1 }));
                setEquipo2(prev => (prev.nombre === team2 ? prev : { ...prev, nombre: team2 }));
            } catch (e) {
                console.warn('[Marker] Prefill equipos (t/m):', e);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [tParam, mParam, urlHasTeamText]);

    // Jugadores para saque: prioridad URL (p1–p4); si no, partir "A / B" de Supabase (árbitro / hidratación).
    const jugadores = useMemo(() => {
        const fromUrl = [
            { equipo: 1, jugador: 1, nombre: p1Raw ? formatPlayerForMarker(p1Raw) : '', side: 'local' as const },
            { equipo: 1, jugador: 2, nombre: p2Raw ? formatPlayerForMarker(p2Raw) : '', side: 'local' as const },
            { equipo: 2, jugador: 1, nombre: p3Raw ? formatPlayerForMarker(p3Raw) : '', side: 'visitante' as const },
            { equipo: 2, jugador: 2, nombre: p4Raw ? formatPlayerForMarker(p4Raw) : '', side: 'visitante' as const },
        ].filter(j => j.nombre);
        if (fromUrl.length > 0) return fromUrl;
        if (!marcador) return [];
        const splitTeam = (line: string | undefined) => {
            const t = (line || '').trim();
            if (!t) return [] as string[];
            return t.split(/\s*\/\s*/).map(p => p.trim()).filter(Boolean).map(formatPlayerForMarker);
        };
        const p1 = splitTeam(marcador.equipo_1?.nombre);
        const p2 = splitTeam(marcador.equipo_2?.nombre);
        const out: { equipo: number; jugador: number; nombre: string; side: 'local' | 'visitante' }[] = [];
        if (p1[0]) out.push({ equipo: 1, jugador: 1, nombre: p1[0], side: 'local' });
        if (p1[1]) out.push({ equipo: 1, jugador: 2, nombre: p1[1], side: 'local' });
        if (p2[0]) out.push({ equipo: 2, jugador: 1, nombre: p2[0], side: 'visitante' });
        if (p2[1]) out.push({ equipo: 2, jugador: 2, nombre: p2[1], side: 'visitante' });
        return out;
    }, [p1Raw, p2Raw, p3Raw, p4Raw, marcador?.equipo_1?.nombre, marcador?.equipo_2?.nombre]);

    // ── Guard: solo admin o marcador autorizado para esta cancha ───────────
    useEffect(() => {
        if (!canchaId) return;
        if (!user) {
            router.replace('/');
            return;
        }
        if (!canMarkInCancha(canchaId)) {
            setAccessDenied(true);
        }
    }, [user, canchaId, canMarkInCancha]);

    // ── Escuchar estado de la cancha (Supabase Realtime) ─────────────────────
    useEffect(() => {
        setLoadingCancha(true);
        let prevStableJson = '';
        const unsub = dataService.subscribePizarraCanchaState(canchaId, (state) => {
            const val = state?.data ?? null;
            setLoadingCancha(false);
            const stable = val == null ? null : (() => {
                const m = val.marcador;
                return { estado: val.estado, marcador: m ? { ...m, ultimo_update: undefined } : m };
            })();
            const nextJson = stable == null ? '' : JSON.stringify(stable);
            if (nextJson !== prevStableJson) {
                prevStableJson = nextJson;
                setCanchaData(val);
            }
        });
        return unsub;
    }, [canchaId]);

    // Nombres en formulario / estado local = los mismos que en Supabase mientras EN VIVO.
    useEffect(() => {
        if (!isEnVivo || !marcador) return;
        const e1 = marcador.equipo_1;
        const e2 = marcador.equipo_2;
        if (e1?.nombre && typeof e1.nombre === 'string') {
            const nombre = e1.nombre.trim();
            const color = typeof e1.color === 'string' ? e1.color : '#CCFF00';
            if (nombre) {
                setEquipo1(prev => (prev.nombre === nombre && prev.color === color ? prev : { nombre, color }));
            }
        }
        if (e2?.nombre && typeof e2.nombre === 'string') {
            const nombre = e2.nombre.trim();
            const color = typeof e2.color === 'string' ? e2.color : '#FF5500';
            if (nombre) {
                setEquipo2(prev => (prev.nombre === nombre && prev.color === color ? prev : { nombre, color }));
            }
        }
    }, [isEnVivo, marcador?.equipo_1?.nombre, marcador?.equipo_1?.color, marcador?.equipo_2?.nombre, marcador?.equipo_2?.color]);

    // Partido de torneo en vivo pero nombres genéricos en pizarra → rellenar desde cuadro (p. ej. marker sin querystring).
    useEffect(() => {
        if (!isEnVivo || !canchaId) return;
        const tid = canchaData?.torneo_id;
        const pid = canchaData?.partido_id;
        if (!tid || !pid || String(pid).startsWith('live_')) return;
        const m = canchaData?.marcador;
        if (!m) return;
        const n1 = m.equipo_1?.nombre;
        const n2 = m.equipo_2?.nombre;
        if (!isGenericEquipoNombre(n1, 'Equipo 1') && !isGenericEquipoNombre(n2, 'Equipo 2')) return;

        let cancelled = false;
        (async () => {
            try {
                const [tourney, matches] = await Promise.all([
                    dataService.getTournament(String(tid)),
                    dataService.getMatches(String(tid)),
                ]);
                if (cancelled) return;
                const found = matches.find((x: any) => x.id === pid);
                if (!found) return;
                const { team1, team2 } = resolveMatchTeamLines(found, tourney);
                const cur = await dataService.getPizarraCanchaState(canchaId);
                const data = cur?.data || {};
                const mar = data.marcador || {};
                const cur1 = (mar.equipo_1?.nombre || '').trim();
                const cur2 = (mar.equipo_2?.nombre || '').trim();
                const next1 = isGenericEquipoNombre(cur1, 'Equipo 1') ? team1 : cur1;
                const next2 = isGenericEquipoNombre(cur2, 'Equipo 2') ? team2 : cur2;
                if (next1 === cur1 && next2 === cur2) return;
                await dataService.setPizarraCanchaState(canchaId, {
                    ...data,
                    marcador: {
                        ...mar,
                        equipo_1: { ...(mar.equipo_1 || {}), nombre: next1, color: mar.equipo_1?.color || '#CCFF00' },
                        equipo_2: { ...(mar.equipo_2 || {}), nombre: next2, color: mar.equipo_2?.color || '#FF5500' },
                        ultimo_update: Date.now(),
                    },
                });
            } catch (e) {
                console.warn('[Marker] Hidratar nombres desde torneo:', e);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [
        isEnVivo,
        canchaId,
        canchaData?.torneo_id,
        canchaData?.partido_id,
        canchaData?.marcador?.equipo_1?.nombre,
        canchaData?.marcador?.equipo_2?.nombre,
    ]);

    // ── Activar partido (Supabase pizarra_cancha_state) ─────────────────────
    const handleActivar = async () => {
        if (!user) return;
        setActivando(true);
        try {
            const torneoIdActivar = tParam || '';
            const partidoIdActivar =
                mParam && !String(mParam).startsWith('court_') ? mParam : `live_${Date.now()}`;

            let match_format: string | undefined;
            let tie_break_type: 'TB' | 'STB' | undefined;
            let golden_point = false;
            // Siempre tomamos match_format / tie_break_type del torneo si está disponible.
            // Esto evita que, si el partido viene como `live_...` (por perdida de querystring al salir/volver),
            // el scoring caiga al default `ONE_SET_6` y termine el partido al primer set.
            if (torneoIdActivar) {
                try {
                    const tourney = await dataService.getTournament(torneoIdActivar);
                    // El scoring espera uno de: ONE_SET_6 | ONE_SET_9 | TWO_SHORT_SETS | TWO_NORMAL_SETS
                    // En tu generador el "a cuántos games es el partido" se guarda en `rrMatchFormat`.
                    // `matchFormat` en cambio se usa para "2SETS_STB" / "3SETS", así que no debe usarse aquí.
                    match_format = (tourney as any)?.rrMatchFormat ?? tourney?.matchFormat;
                    tie_break_type = tourney?.tieBreakType;
                    golden_point = tourney?.scoringSystem === 'GOLDEN_POINT';
                } catch (e) {
                    console.warn('[Marker] Formato torneo:', e);
                }
            }

            // Si tenemos un partido real (no `live_...`), lo usamos para sobreescribir si hace falta.
            if (torneoIdActivar && partidoIdActivar && !String(partidoIdActivar).startsWith('live_')) {
                try {
                    const matches = await dataService.getMatches(torneoIdActivar);
                    const found = matches.find((x: any) => x.id === partidoIdActivar);
                    match_format = found?.rrMatchFormat ?? found?.matchFormat ?? match_format;
                    tie_break_type = found?.tieBreakType || tie_break_type;
                } catch (e) {
                    console.warn('[Marker] Formato torneo/partido:', e);
                }
            }

            await dataService.setPizarraCanchaState(canchaId, {
                estado: 'en_vivo',
                marker_uid: user.uid,
                marker_nombre: profile?.name || user.email || 'Marker',
                torneo_id: torneoIdActivar,
                partido_id: partidoIdActivar,
                marcador: {
                    sets: { local: 0, visitante: 0 },
                    games: { local: 0, visitante: 0 },
                    puntos: { local: '0', visitante: '0' },
                    historico_sets: [],
                    modo_puntos: 'normal',
                    golden_point: false,
                    super_tiebreak: false,
                    match_format,
                    tie_break_type,
                    equipo_1: equipo1,
                    equipo_2: equipo2,
                    cronometro: { running: false, startedAt: null, elapsedSec: 0 },
                    saque: { equipo: 1, jugador: 1 },
                    ultimo_update: Date.now(),
                },
                publicidad: { override_local: false, imagen_url_local: null },
                pizarra_refresh_nonce: 0,
            });
            setShowSetup(false);
        } catch (err) {
            console.error('[Marker] Error activando cancha:', err);
            alert('Error al activar la cancha. Intenta de nuevo.');
        } finally {
            setActivando(false);
        }
    };

    /** Pide a las pizarras enlazadas a esta cancha que recarguen (incrementa nonce en Supabase). */
    const handleRefrescarPizarra = async () => {
        if (refrescandoPizarra) return;
        setRefrescandoPizarra(true);
        try {
            const cur = await dataService.getPizarraCanchaState(canchaId);
            const data = cur?.data || {};
            const prev = typeof data.pizarra_refresh_nonce === 'number' && Number.isFinite(data.pizarra_refresh_nonce)
                ? data.pizarra_refresh_nonce
                : 0;
            await dataService.setPizarraCanchaState(canchaId, {
                ...data,
                pizarra_refresh_nonce: prev + 1,
            });
        } catch (err) {
            console.error('[Marker] Refrescar pizarra:', err);
            alert('No se pudo enviar el refresco a la pizarra. Revisa la conexión.');
        } finally {
            setTimeout(() => setRefrescandoPizarra(false), 600);
        }
    };

    // ── Desactivar partido ──────────────────────────────────────────────────
    const handleDesactivar = async () => {
        if (!confirm('¿Terminar el partido y poner la cancha en espera?')) return;
        try {
            await dataService.setPizarraCanchaState(canchaId, {
                estado: 'espera',
                marker_uid: null,
                marker_nombre: null,
                torneo_id: null,
                partido_id: null,
                marcador: null,
                publicidad: { override_local: false, imagen_url_local: null },
            });
        } catch (err) {
            console.error('[Marker] Error desactivando cancha:', err);
        }
    };

    // ── Operaciones de puntos (Supabase pizarra_cancha_state) ────────────────
    // Actualiza primero el estado local para que el marcador responda al instante,
    // y luego sincroniza con Supabase (best-effort).
    const actualizarMarcadorLocal = async (patch: Record<string, unknown>) => {
        // Optimistic UI: actualizar inmediatamente el estado local
        setCanchaData((prev: any) => {
            const data = prev || {};
            const marcadorPrev = data.marcador || {};
            return {
                ...data,
                marcador: { ...marcadorPrev, ...patch, ultimo_update: Date.now() },
            };
        });

        try {
            const cur = await dataService.getPizarraCanchaState(canchaId);
            const data = cur?.data || {};
            const marcadorPrev = data.marcador || {};
            await dataService.setPizarraCanchaState(canchaId, {
                ...data,
                marcador: { ...marcadorPrev, ...patch, ultimo_update: Date.now() },
            });
        } catch (err) {
            console.error('[Marker] Error actualizando marcador en Supabase:', err);
        }
    };

    const splitTeamTokens = (line?: string | null) => {
        const t = (line || '').trim();
        if (!t) return [];
        return t.split(/\s*\/\s*/).map((p) => p.trim()).filter(Boolean);
    };

    const buildTeamName = (p1: string, p2: string, fallback: string) => {
        const a = (p1 || '').trim();
        const b = (p2 || '').trim();
        if (a && b) return `${a} / ${b}`;
        if (a || b) return a || b;
        return fallback;
    };

    const openJugadoresEditor = () => {
        if (!marcador) return;
        const e1 = marcador?.equipo_1?.nombre;
        const e2 = marcador?.equipo_2?.nombre;
        const p1 = splitTeamTokens(e1)[0] || '';
        const p2 = splitTeamTokens(e1)[1] || '';
        const p3 = splitTeamTokens(e2)[0] || '';
        const p4 = splitTeamTokens(e2)[1] || '';

        setJugadoresDraft({ j1: p1, j2: p2, j3: p3, j4: p4 });
        setShowJugadoresEdit(true);
    };

    const saveJugadoresEditor = async () => {
        if (!marcador || !canchaId || !canchaData) return;

        const t1p1 = jugadoresDraft.j1.trim() || 'Jugador 1';
        const t1p2 = jugadoresDraft.j2.trim() || 'Jugador 2';
        const t2p1 = jugadoresDraft.j3.trim() || 'Jugador 3';
        const t2p2 = jugadoresDraft.j4.trim() || 'Jugador 4';

        const team1Name = buildTeamName(t1p1, t1p2, 'Equipo 1');
        const team2Name = buildTeamName(t2p1, t2p2, 'Equipo 2');

        const equipo1Patch = {
            ...(marcador.equipo_1 || {}),
            nombre: team1Name,
            color: marcador?.equipo_1?.color || '#CCFF00',
        };
        const equipo2Patch = {
            ...(marcador.equipo_2 || {}),
            nombre: team2Name,
            color: marcador?.equipo_2?.color || '#FF5500',
        };

        // 1) Actualiza pizarra en tiempo real (lo que ve el público)
        await actualizarMarcadorLocal({
            equipo_1: equipo1Patch,
            equipo_2: equipo2Patch,
        });

        // 2) Best-effort: persiste también el match si existe (si no, al menos se ve en pizarra)
        const tid = canchaData?.torneo_id;
        const pid = canchaData?.partido_id;
        if (tid && pid && !String(pid).startsWith('live_')) {
            try {
                const matches = await dataService.getMatches(String(tid));
                const found = matches.find((x: any) => x.id === pid);
                if (found) {
                    const nextTeam1 = {
                        ...(found.team1 || {}),
                        p1: t1p1,
                        p2: t1p2,
                        p1Name: t1p1,
                        p2Name: t1p2,
                        full: team1Name,
                        name: team1Name,
                    };
                    const nextTeam2 = {
                        ...(found.team2 || {}),
                        p1: t2p1,
                        p2: t2p2,
                        p1Name: t2p1,
                        p2Name: t2p2,
                        full: team2Name,
                        name: team2Name,
                    };
                    await dataService.updateMatch(String(tid), String(pid), {
                        team1: nextTeam1,
                        team2: nextTeam2,
                        team1Name: team1Name,
                        team2Name: team2Name,
                    });
                }
            } catch (e) {
                console.warn('[Marker] Guardar jugadores en match:', e);
            }
        }

        setShowJugadoresEdit(false);
    };

    // Rellenar match_format / tie_break_type si hay torneo+partido pero el estado aún no trae formato (p. ej. sesión previa).
    useEffect(() => {
        if (!isEnVivo || !canchaId) return;
        const tid = canchaData?.torneo_id;
        const pid = canchaData?.partido_id;
        if (!tid || !pid || String(pid).startsWith('live_')) return;
        if (marcador?.match_format) return;

        let cancelled = false;
        (async () => {
            try {
                const tourney = await dataService.getTournament(String(tid));
                const matches = await dataService.getMatches(String(tid));
                if (cancelled) return;
                const found = matches.find((x: any) => x.id === pid);
                const mf = found?.rrMatchFormat ?? found?.matchFormat ?? (tourney as any)?.rrMatchFormat ?? tourney?.matchFormat;
                const tb = tourney?.tieBreakType || found?.tieBreakType;
                const gp =
                    tourney?.scoringSystem === 'GOLDEN_POINT'
                        ? true
                        : tourney?.scoringSystem === 'TRADITIONAL'
                            ? false
                            : undefined;
                if (!mf && !tb && gp === undefined) return;
                const cur = await dataService.getPizarraCanchaState(canchaId);
                const data = cur?.data || {};
                const mar = data.marcador || {};
                await dataService.setPizarraCanchaState(canchaId, {
                    ...data,
                    marcador: {
                        ...mar,
                        ...(mf ? { match_format: mf } : {}),
                        ...(tb ? { tie_break_type: tb } : {}),
                        ...(gp !== undefined ? { golden_point: gp } : {}),
                        ultimo_update: Date.now(),
                    },
                });
                setCanchaData((prev: any) => {
                    const d = prev || {};
                    const m = d.marcador || {};
                    return {
                        ...d,
                        marcador: {
                            ...m,
                            ...(mf ? { match_format: mf } : {}),
                            ...(tb ? { tie_break_type: tb } : {}),
                            ...(gp !== undefined ? { golden_point: gp } : {}),
                            ultimo_update: Date.now(),
                        },
                    };
                });
            } catch (e) {
                console.warn('[Marker] Enriquecer formato:', e);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [isEnVivo, canchaId, canchaData?.torneo_id, canchaData?.partido_id, marcador?.match_format]);

    const freezeCronometro = (cron: any) => {
        if (!cron?.running || cron.startedAt == null) return cron;
        return {
            running: false,
            startedAt: null,
            elapsedSec: (Number(cron.elapsedSec) || 0) + Math.floor((dataService.getSyncedNow() - Number(cron.startedAt)) / 1000),
        };
    };

    /** Cierra un set por juegos (no TB): actualiza sets, historial, STB si 1-1, o fin de partido. */
    const applySetWonByGames = async (
        m: any,
        equipo: 'local' | 'visitante',
        newGames: { local: number; visitante: number },
    ) => {
        const rules = getScoringRules(m?.match_format, m?.tie_break_type);
        const sets = m.sets || { local: 0, visitante: 0 };
        const base = { local: sets.local || 0, visitante: sets.visitante || 0 };
        const newSets = { ...base, [equipo]: base[equipo] + 1 };
        const newHistorico = [...(m.historico_sets || []), { local: newGames.local, visitante: newGames.visitante }];
        const matchOver = newSets.local >= rules.setsToWinMatch || newSets.visitante >= rules.setsToWinMatch;
        const enterStb =
            !matchOver &&
            rules.usesSuperTiebreakDecider &&
            newSets.local === 1 &&
            newSets.visitante === 1 &&
            m.super_tiebreak !== true;

        if (matchOver) {
            await actualizarMarcadorLocal({
                sets: newSets,
                games: { local: 0, visitante: 0 },
                puntos: { local: '0', visitante: '0' },
                modo_puntos: 'normal',
                super_tiebreak: false,
                historico_sets: newHistorico,
                cronometro: freezeCronometro(m.cronometro),
            });
            alert(`¡Partido terminado! Ganador: Equipo ${equipo === 'local' ? '1' : '2'}`);
            return;
        }
        if (enterStb) {
            await actualizarMarcadorLocal({
                sets: newSets,
                games: { local: 0, visitante: 0 },
                puntos: { local: '0', visitante: '0' },
                modo_puntos: 'super_tiebreak',
                super_tiebreak: true,
                historico_sets: newHistorico,
            });
            return;
        }
        await actualizarMarcadorLocal({
            sets: newSets,
            games: { local: 0, visitante: 0 },
            puntos: { local: '0', visitante: '0' },
            modo_puntos: 'normal',
            super_tiebreak: false,
            historico_sets: newHistorico,
        });
    };

    const winGame = async (equipo: 'local' | 'visitante') => {
        if (!marcador) return;
        if (marcador.modo_puntos && marcador.modo_puntos !== 'normal') return;

        const rules = getScoringRules(marcador.match_format, marcador.tie_break_type);
        const otroEquipo = equipo === 'local' ? 'visitante' : 'local';
        const games = marcador.games || { local: 0, visitante: 0 };
        const newGames = { ...games, [equipo]: games[equipo] + 1 };
        const g1 = newGames.local;
        const g2 = newGames.visitante;

        if (isSetCompleteByGames(g1, g2, rules.gamesToWinSet)) {
            await applySetWonByGames(marcador, equipo, newGames);
        } else if (shouldEnterSetTiebreak(g1, g2, rules.tiebreakGamesEntry)) {
            await actualizarMarcadorLocal({
                games: newGames,
                puntos: { local: '0', visitante: '0' },
                modo_puntos: 'tiebreak',
                super_tiebreak: false,
            });
        } else {
            await actualizarMarcadorLocal({
                games: newGames,
                puntos: { local: '0', visitante: '0' },
            });
        }
    };

    const cambiarPunto = async (equipo: 'local' | 'visitante', delta: 1 | -1) => {
        if (!marcador) return;
        const otroEquipo = equipo === 'local' ? 'visitante' : 'local';
        const puntosActual = marcador.puntos || {};
        const modo = marcador.modo_puntos || 'normal';

        if (modo === 'normal') {
            const actual = puntosActual[equipo];
            const actualOtro = puntosActual[otroEquipo];

            if (delta === 1) {
                if (actual === 'AD') {
                    await winGame(equipo);
                    return;
                }
                if (actual === '40') {
                    if (actualOtro === 'AD') {
                        // Vuelve a 40 iguales
                        await actualizarMarcadorLocal({
                            puntos: { [equipo]: '40', [otroEquipo]: '40' }
                        });
                        return;
                    } else if (actualOtro === '40') {
                        if (marcador.golden_point) {
                            await winGame(equipo);
                        } else {
                            await actualizarMarcadorLocal({
                                puntos: { ...puntosActual, [equipo]: 'AD' }
                            });
                        }
                        return;
                    } else {
                        // El otro no tiene 40 o AD, ganamos el game
                        await winGame(equipo);
                        return;
                    }
                }
                
                const idx = PUNTOS_NORMAL.indexOf(actual);
                const nextPoint = PUNTOS_NORMAL[idx + 1];
                if (nextPoint && nextPoint !== 'AD') {
                    await actualizarMarcadorLocal({
                        puntos: { ...puntosActual, [equipo]: nextPoint }
                    });
                }
            } else {
                // delta -1 (restar punto manualmente)
                if (actual === 'AD') {
                    await actualizarMarcadorLocal({
                        puntos: { ...puntosActual, [equipo]: '40' }
                    });
                    return;
                }
                const idx = PUNTOS_NORMAL.indexOf(actual);
                if (idx > 0) {
                    await actualizarMarcadorLocal({
                        puntos: { ...puntosActual, [equipo]: PUNTOS_NORMAL[idx - 1] }
                    });
                }
            }
        } else {
            const rules = getScoringRules(marcador.match_format, marcador.tie_break_type);
            const isStb = marcador.super_tiebreak === true || modo === 'super_tiebreak';
            const target = isStb ? rules.superTiebreakPointsToWin : rules.setTiebreakPointsToWin;
            const actual = parseInt(String(puntosActual[equipo] || '0'), 10) || 0;
            const actualOtro = parseInt(String(puntosActual[otroEquipo] || '0'), 10) || 0;

            if (delta === 1) {
                const nuevo = actual + 1;
                if (winsTiebreakPoints(nuevo, actualOtro, target)) {
                    if (isStb) {
                        const s0 = marcador.sets || { local: 0, visitante: 0 };
                        const newSets = {
                            local: s0.local || 0,
                            visitante: s0.visitante || 0,
                            [equipo]: (s0[equipo] || 0) + 1,
                        };
                        const finalLocal = equipo === 'local' ? nuevo : actualOtro;
                        const finalVisit = equipo === 'visitante' ? nuevo : actualOtro;
                        await actualizarMarcadorLocal({
                            sets: newSets,
                            games: { local: 0, visitante: 0 },
                            puntos: { local: '0', visitante: '0' },
                            modo_puntos: 'normal',
                            super_tiebreak: false,
                            historico_sets: [...(marcador.historico_sets || []), { local: finalLocal, visitante: finalVisit }],
                            cronometro: freezeCronometro(marcador.cronometro),
                        });
                        alert(`¡Partido terminado! Ganador: Equipo ${equipo === 'local' ? '1' : '2'}`);
                    } else {
                        const g = marcador.games || { local: 0, visitante: 0 };
                        const hist =
                            equipo === 'local'
                                ? { local: g.local + 1, visitante: g.visitante }
                                : { local: g.local, visitante: g.visitante + 1 };
                        const s0 = marcador.sets || { local: 0, visitante: 0 };
                        const newSets = {
                            local: s0.local || 0,
                            visitante: s0.visitante || 0,
                            [equipo]: (s0[equipo] || 0) + 1,
                        };
                        const newHistorico = [...(marcador.historico_sets || []), hist];
                        const matchOver = newSets.local >= rules.setsToWinMatch || newSets.visitante >= rules.setsToWinMatch;
                        const enterStb =
                            !matchOver &&
                            rules.usesSuperTiebreakDecider &&
                            newSets.local === 1 &&
                            newSets.visitante === 1 &&
                            marcador.super_tiebreak !== true;

                        if (matchOver) {
                            await actualizarMarcadorLocal({
                                sets: newSets,
                                games: { local: 0, visitante: 0 },
                                puntos: { local: '0', visitante: '0' },
                                modo_puntos: 'normal',
                                super_tiebreak: false,
                                historico_sets: newHistorico,
                                cronometro: freezeCronometro(marcador.cronometro),
                            });
                            alert(`¡Partido terminado! Ganador: Equipo ${equipo === 'local' ? '1' : '2'}`);
                        } else if (enterStb) {
                            await actualizarMarcadorLocal({
                                sets: newSets,
                                games: { local: 0, visitante: 0 },
                                puntos: { local: '0', visitante: '0' },
                                modo_puntos: 'super_tiebreak',
                                super_tiebreak: true,
                                historico_sets: newHistorico,
                            });
                        } else {
                            await actualizarMarcadorLocal({
                                sets: newSets,
                                games: { local: 0, visitante: 0 },
                                puntos: { local: '0', visitante: '0' },
                                modo_puntos: 'normal',
                                super_tiebreak: false,
                                historico_sets: newHistorico,
                            });
                        }
                    }
                } else {
                    await actualizarMarcadorLocal({
                        puntos: { ...puntosActual, [equipo]: String(nuevo) },
                    });
                }
            } else {
                const nuevo = Math.max(0, actual - 1);
                await actualizarMarcadorLocal({
                    puntos: { ...puntosActual, [equipo]: String(nuevo) },
                });
            }
        }
    };

    const cambiarGame = async (equipo: 'local' | 'visitante', delta: 1 | -1) => {
        if (!marcador) return;
        if (marcador.modo_puntos && marcador.modo_puntos !== 'normal') return;

        const rules = getScoringRules(marcador.match_format, marcador.tie_break_type);
        const actual = marcador.games?.[equipo] || 0;
        const nuevo = Math.max(0, actual + delta);

        if (delta !== 1) {
            await actualizarMarcadorLocal({
                games: { ...marcador.games, [equipo]: nuevo },
                puntos: { local: '0', visitante: '0' },
            });
            return;
        }

        const newGames = { ...(marcador.games || { local: 0, visitante: 0 }), [equipo]: nuevo };
        const g1 = newGames.local;
        const g2 = newGames.visitante;

        if (isSetCompleteByGames(g1, g2, rules.gamesToWinSet)) {
            await applySetWonByGames(marcador, equipo, newGames);
        } else if (shouldEnterSetTiebreak(g1, g2, rules.tiebreakGamesEntry)) {
            await actualizarMarcadorLocal({
                games: newGames,
                puntos: { local: '0', visitante: '0' },
                modo_puntos: 'tiebreak',
                super_tiebreak: false,
            });
        } else {
            await actualizarMarcadorLocal({
                games: newGames,
                puntos: { local: '0', visitante: '0' },
            });
        }
    };

    const cambiarSet = async (equipo: 'local' | 'visitante', delta: 1 | -1) => {
        if (!marcador) return;
        const rules = getScoringRules(marcador.match_format, marcador.tie_break_type);
        const need = rules.setsToWinMatch;
        const nuevo = Math.max(0, (marcador.sets?.[equipo] || 0) + delta);
        let finalCron = marcador.cronometro;
        if (nuevo >= need && finalCron && finalCron.running && finalCron.startedAt) {
            finalCron = {
                running: false,
                startedAt: null,
                elapsedSec: (finalCron.elapsedSec || 0) + Math.floor((dataService.getSyncedNow() - finalCron.startedAt) / 1000),
            };
        }
        await actualizarMarcadorLocal({
            sets: { ...marcador.sets, [equipo]: nuevo },
            games: { local: 0, visitante: 0 },
            puntos: { local: '0', visitante: '0' },
            modo_puntos: 'normal',
            super_tiebreak: false,
            cronometro: finalCron,
        });
        if (nuevo >= need) {
            alert(`¡Partido terminado! Ganador: Equipo ${equipo === 'local' ? '1' : '2'}`);
        }
    };

    const toggleGoldenPoint = async () => {
        if (!marcador) return;
        await actualizarMarcadorLocal({ golden_point: !marcador.golden_point });
    };

    const formatCron = (seconds: number): string => {
        const s = Math.max(0, Math.floor(seconds));
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const ss = s % 60;
        if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
        return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    };

    // Cronómetro: se calcula desde `marcador.cronometro` (persiste en la BD)
    useEffect(() => {
        const cron = marcador?.cronometro;
        if (!cron) {
            setCronSeconds(0);
            return;
        }

        const compute = () => {
            const elapsedSec = Number(cron.elapsedSec ?? 0) || 0;
            if (cron.running && cron.startedAt != null) {
                const startMs = Number(cron.startedAt);
                if (!isNaN(startMs)) {
                    return elapsedSec + Math.floor((dataService.getSyncedNow() - startMs) / 1000);
                }
            }
            return elapsedSec;
        };

        setCronSeconds(compute());
        if (cron.running) {
            const t = setInterval(() => setCronSeconds(compute()), 250);
            return () => clearInterval(t);
        }
        return;
    }, [marcador?.cronometro, canchaId]);

    const toggleCronometro = async () => {
        if (!marcador) return;
        const curCron = marcador.cronometro ?? { running: false, startedAt: null, elapsedSec: 0 };
        const elapsedSec = Number(curCron.elapsedSec ?? 0) || 0;

        if (curCron.running && curCron.startedAt != null) {
            alert('El tiempo de partido oficial no se puede pausar una vez iniciado. Solo se detiene al finalizar el partido.');
            return;
        } else {
            await actualizarMarcadorLocal({
                cronometro: { running: true, startedAt: dataService.getSyncedNow(), elapsedSec },
            });
        }
    };

    useEffect(() => {
        dataService.syncSystemClock();
    }, []);

    // Si la cancha está en vivo pero no existe cronometro (por datos antiguos),
    // inicializamos para evitar que el UI quede en 00:00.
    useEffect(() => {
        if (!isEnVivo || !marcador) return;
        if (marcador.cronometro) return;
        actualizarMarcadorLocal({ cronometro: { running: false, startedAt: null, elapsedSec: 0 } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEnVivo, canchaId, marcador]);

    const toggleAsistenciaMedica = async () => {
        if (!marcador) return;
        await actualizarMarcadorLocal({
            asistencia_medica_active: !marcador.asistencia_medica_active,
        });
    };

    const toggleMesaTecnica = async () => {
        if (!marcador) return;
        await actualizarMarcadorLocal({
            mesa_tecnica_active: !marcador.mesa_tecnica_active,
        });
    };

    const requestCambioCancha = async () => {
        if (!marcador) return;
        const cur = Number(marcador.cambio_cancha_count ?? 0) || 0;
        await actualizarMarcadorLocal({
            cambio_cancha_count: cur + 1,
            cambio_cancha_requestedAt: Date.now(),
        });
    };

    const setModoPuntosLocal = async (modo: 'normal' | 'tiebreak' | 'super_tiebreak') => {
        await actualizarMarcadorLocal({
            modo_puntos: modo,
            puntos: { local: '0', visitante: '0' },
            super_tiebreak: modo === 'super_tiebreak',
        });
    };

    const formatoMarcadorLabel = useMemo(() => {
        const r = getScoringRules(marcador?.match_format, marcador?.tie_break_type);
        const mf = String(marcador?.match_format || 'ONE_SET_6');
        const tbt = marcador?.tie_break_type;
        const decisiveIf11 =
            r.usesSuperTiebreakDecider
                ? tbt === 'STB'
                    ? `si 1-1: super TB a ${r.superTiebreakPointsToWin}`
                    : `si 1-1: TB a ${r.superTiebreakPointsToWin}`
                : '';
        const lines: Record<string, string> = {
            ONE_SET_6: '1 set a 6 juegos · empate 6-6: TB a 7',
            ONE_SET_9: '1 set a 9 juegos · empate 8-8: TB a 7',
            TWO_SHORT_SETS: `2 sets cortos a 4 · ${decisiveIf11}`,
            TWO_NORMAL_SETS: `2 sets largos a 6 · ${decisiveIf11}`,
        };
        return lines[mf] || `Formato ${mf} · TB set a ${r.setTiebreakPointsToWin}`;
    }, [marcador?.match_format, marcador?.tie_break_type]);

    const scoringUi = getScoringRules(marcador?.match_format, marcador?.tie_break_type);

    // ── Acceso denegado a esta cancha ───────────────────────────────────────
    if (accessDenied) {
        const canchaLabel = getCanchaLabel(canchaId);
        return (
            <div className="min-h-screen bg-[#050505] text-white font-outfit flex flex-col items-center justify-center px-6">
                <div className="max-w-sm w-full text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8 text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-wide text-white mb-2">
                            Sin acceso a {canchaLabel}
                        </h1>
                        <p className="text-sm text-gray-400">
                            No tienes permiso para marcar en esta pista. Solo puedes usar las canchas que te asignó el administrador.
                            {markerCanchas.length > 0 && (
                                <span className="block mt-2 text-gray-500 text-xs">
                                    Tus pistas: {markerCanchas.map(id => getCanchaLabel(id)).join(', ')}
                                </span>
                            )}
                        </p>
                    </div>
                    <Link
                        href="/tournaments"
                        className="inline-flex items-center justify-center gap-2 w-full bg-padel-primary text-black py-4 rounded-2xl font-black uppercase italic tracking-tight hover:opacity-90 transition-opacity"
                    >
                        Ir a torneos
                    </Link>
                </div>
            </div>
        );
    }

    // ── Loading ────────────────────────────────────────────────────────────
    if (authLoading || loadingCancha) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <RefreshCw className="w-10 h-10 text-padel-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-outfit pb-24 [contain:layout] [transform:translateZ(0)]">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#0a0a0a] border-b border-white/10 px-6 py-4">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-padel-primary/10 rounded-2xl flex items-center justify-center border border-padel-primary/20">
                            <Crosshair className="w-5 h-5 text-padel-primary" />
                        </div>
                        <div>
                            <h1 className="label-cancha">
                                Pista <span className="text-padel-primary">{canchaNum}</span>
                            </h1>
                            <p className="subtitle-page text-gray-600">
                                Control de Puntos
                            </p>
                            {isEnVivo && marcador && (
                                <p className="text-[8px] font-bold uppercase tracking-wider text-gray-500 mt-0.5 max-w-[200px] leading-tight">
                                    {formatoMarcadorLabel}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEnVivo && (
                            <button
                                type="button"
                                onClick={handleRefrescarPizarra}
                                disabled={refrescandoPizarra}
                                title="Recarga la ventana de la pizarra enlazada a esta cancha (útil si la TV se quedó pillada)"
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 bg-white/5 text-[9px] font-black uppercase tracking-widest text-gray-300 hover:bg-white/10 hover:border-padel-primary/40 hover:text-padel-primary transition-colors disabled:opacity-40"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${refrescandoPizarra ? 'animate-spin' : ''}`} />
                                Refrescar pizarra
                            </button>
                        )}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${isEnVivo ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-gray-800/50 border-white/10 text-gray-600'}`}>
                            {isEnVivo ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                            {isEnVivo ? 'EN VIVO' : 'EN ESPERA'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-6 pt-8 space-y-6">
                {/* ── ESTADO: ESPERA → Botón activar ── */}
                {!isEnVivo && (
                    <div className="space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                                <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> Configurar Partido
                                </h2>
                                {tParam && mParam && (
                                    <p className="text-[9px] text-gray-600 leading-relaxed">
                                        Vinculado al partido del torneo: nombres desde el cuadro; al iniciar, la pizarra y el árbitro comparten el mismo enlace.
                                    </p>
                                )}
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest block mb-1">Equipo 1</label>
                                        <input
                                            type="text"
                                            value={equipo1.nombre}
                                            onChange={e => setEquipo1({ ...equipo1, nombre: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-2xl px-5 py-3 text-white font-bold text-sm outline-none focus:border-padel-primary/50 transition-colors"
                                            placeholder="Nombre Equipo 1"
                                        />
                                    </div>
                                    <div className="text-center text-gray-700 font-black text-xs uppercase tracking-widest">VS</div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest block mb-1">Equipo 2</label>
                                        <input
                                            type="text"
                                            value={equipo2.nombre}
                                            onChange={e => setEquipo2({ ...equipo2, nombre: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-2xl px-5 py-3 text-white font-bold text-sm outline-none focus:border-padel-primary/50 transition-colors"
                                            placeholder="Nombre Equipo 2"
                                        />
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={handleActivar}
                                disabled={activando}
                                className="w-full bg-padel-primary text-black py-5 rounded-3xl font-black uppercase italic tracking-tight text-base flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(204,255,0,0.25)] hover:shadow-[0_20px_60px_rgba(204,255,0,0.4)] transition-all disabled:opacity-50"
                            >
                                {activando ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                                INICIAR PARTIDO
                            </motion.button>
                    </div>
                )}

                {/* ── ESTADO: EN VIVO → Controles de marcador ── */}
                {isEnVivo && marcador && (
                    <div className="space-y-5">
                        {canMarkInCancha(canchaId) && (
                            <div className="flex items-center justify-end">
                                <button
                                    type="button"
                                    onClick={openJugadoresEditor}
                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                >
                                    Editar jugadores (J1-J4)
                                </button>
                            </div>
                        )}
                        {/* Tarjetas de equipo con jugadores clicables para saque */}
                        <div className="grid grid-cols-2 gap-3">
                            {(['local', 'visitante'] as const).map((lado, i) => {
                                const equipo = i === 0 ? marcador.equipo_1 : marcador.equipo_2;
                                const equipoNum = i + 1;
                                // Jugadores de este equipo
                                const jList = jugadores.filter(j => j.equipo === equipoNum);
                                const hasIndividual = jList.length > 0;

                                return (
                                    <div
                                        key={lado}
                                        className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-2 relative"
                                        style={{ borderColor: (equipo?.color ?? '#fff') + '40' }}
                                    >
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                                            {lado === 'local' ? 'Equipo 1' : 'Equipo 2'}
                                        </p>

                                        {hasIndividual ? (
                                            /* Jugadores individuales — cada uno es el botón de saque */
                                            <div className="flex flex-col gap-1.5">
                                                {jList.map(j => {
                                                    const isServing = marcador.saque?.equipo === j.equipo && marcador.saque?.jugador === j.jugador;
                                                    return (
                                                        <button
                                                            key={`${j.equipo}-${j.jugador}`}
                                                            onClick={() => actualizarMarcadorLocal({ saque: { equipo: j.equipo, jugador: j.jugador } })}
                                                            className={`flex items-center gap-2 w-full text-left px-2.5 py-2 rounded-xl transition-all border ${
                                                                isServing
                                                                    ? 'bg-[#ccff00]/15 border-[#ccff00]/50 shadow-[0_0_12px_rgba(204,255,0,0.3)]'
                                                                    : 'bg-black/30 border-white/10 hover:border-white/30 hover:bg-white/10'
                                                            }`}
                                                            title={isServing ? 'Sacando' : 'Toca para asignar saque'}
                                                        >
                                                            <span className={`text-base leading-none transition-all ${
                                                                isServing ? 'opacity-100 grayscale-0' : 'opacity-30 grayscale'
                                                            }`}>🎾</span>
                                                            <span className={`font-bold italic uppercase tracking-tight text-[11px] truncate leading-tight ${
                                                                isServing
                                                                    ? 'text-[#ccff00]'
                                                                    : 'text-white/70'
                                                            }`}>
                                                                {j.nombre}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            /* Fallback: sin jugadores individuales → mostrar equipo + botones de saque clásicos */
                                            <>
                                                <p className="font-black italic uppercase tracking-tight text-sm truncate"
                                                    style={{ color: equipo?.color || '#fff' }}>
                                                    {equipo?.nombre || `Equipo ${equipoNum}`}
                                                </p>
                                                <div className="flex gap-1.5 mt-1">
                                                    {[1, 2].map(jNum => {
                                                        const isServing = marcador.saque?.equipo === equipoNum && marcador.saque?.jugador === jNum;
                                                        return (
                                                            <button
                                                                key={jNum}
                                                                onClick={() => actualizarMarcadorLocal({ saque: { equipo: equipoNum, jugador: jNum } })}
                                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-base transition-all border ${
                                                                    isServing
                                                                        ? 'border-[#ccff00] shadow-[0_0_10px_rgba(204,255,0,0.5)] opacity-100 grayscale-0 bg-[#ccff00]/10'
                                                                        : 'border-white/10 opacity-40 grayscale hover:opacity-80 hover:grayscale-0 bg-black'
                                                                }`}
                                                                title={`J${jNum} saca`}
                                                            >🎾</button>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {showJugadoresEdit && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
                                onClick={() => setShowJugadoresEdit(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                    className="bg-[#111] border border-white/10 rounded-[2rem] w-full max-w-2xl overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Editar jugadores</h3>
                                            <p className="text-[10px] font-black italic text-gray-500 uppercase tracking-widest mt-1">
                                                Se reflejará en marker y pizarra
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowJugadoresEdit(false)}
                                            className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all text-gray-400 font-black"
                                        >
                                            Cerrar
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Jugador 1</label>
                                                <input
                                                    value={jugadoresDraft.j1}
                                                    onChange={(e) => setJugadoresDraft((p) => ({ ...p, j1: e.target.value }))}
                                                    placeholder="Jugador 1"
                                                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none focus:border-padel-primary/60"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Jugador 2</label>
                                                <input
                                                    value={jugadoresDraft.j2}
                                                    onChange={(e) => setJugadoresDraft((p) => ({ ...p, j2: e.target.value }))}
                                                    placeholder="Jugador 2"
                                                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none focus:border-padel-primary/60"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Jugador 3</label>
                                                <input
                                                    value={jugadoresDraft.j3}
                                                    onChange={(e) => setJugadoresDraft((p) => ({ ...p, j3: e.target.value }))}
                                                    placeholder="Jugador 3"
                                                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none focus:border-padel-primary/60"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Jugador 4</label>
                                                <input
                                                    value={jugadoresDraft.j4}
                                                    onChange={(e) => setJugadoresDraft((p) => ({ ...p, j4: e.target.value }))}
                                                    placeholder="Jugador 4"
                                                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none focus:border-padel-primary/60"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowJugadoresEdit(false)}
                                            className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={saveJugadoresEditor}
                                            className="flex-1 py-4 bg-padel-primary text-black rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all"
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Marcador compacto: puntos a los lados, games/sets al centro */}
                        <CompactScoreRow
                            modoPuntos={marcador.modo_puntos}
                            puntosLocal={marcador.puntos.local}
                            puntosVisitante={marcador.puntos.visitante}
                            gamesLocal={marcador.games.local}
                            gamesVisitante={marcador.games.visitante}
                            setsLocal={marcador.sets.local}
                            setsVisitante={marcador.sets.visitante}
                            onPuntoUpLocal={() => cambiarPunto('local', 1)}
                            onPuntoDownLocal={() => cambiarPunto('local', -1)}
                            onPuntoUpVisitante={() => cambiarPunto('visitante', 1)}
                            onPuntoDownVisitante={() => cambiarPunto('visitante', -1)}
                            onGameUpLocal={() => cambiarGame('local', 1)}
                            onGameDownLocal={() => cambiarGame('local', -1)}
                            onGameUpVisitante={() => cambiarGame('visitante', 1)}
                            onGameDownVisitante={() => cambiarGame('visitante', -1)}
                            onSetUpLocal={() => cambiarSet('local', 1)}
                            onSetDownLocal={() => cambiarSet('local', -1)}
                            onSetUpVisitante={() => cambiarSet('visitante', 1)}
                            onSetDownVisitante={() => cambiarSet('visitante', -1)}
                        />

                        {/* Modo de puntos: Tiebreak / Super Tie Break (STB) */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setModoPuntosLocal(
                                    marcador.modo_puntos === 'tiebreak' ? 'normal' : 'tiebreak'
                                )}
                                className={`py-3 rounded-2xl font-black uppercase italic tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all border-2 ${marcador.modo_puntos === 'tiebreak'
                                    ? 'bg-orange-500/15 border-orange-500/50 text-orange-400'
                                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-orange-500/30 hover:text-orange-400'
                                    }`}
                            >
                                <Trophy className="w-3.5 h-3.5" />
                                {marcador.modo_puntos === 'tiebreak' ? 'TB ACTIVO' : 'Tiebreak'}
                            </button>
                            <button
                                onClick={() => setModoPuntosLocal(
                                    marcador.modo_puntos === 'super_tiebreak' ? 'normal' : 'super_tiebreak'
                                )}
                                className={`py-3 rounded-2xl font-black uppercase italic tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all border-2 ${marcador.modo_puntos === 'super_tiebreak'
                                    ? 'bg-purple-500/15 border-purple-500/50 text-purple-400'
                                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-purple-500/30 hover:text-purple-400'
                                    }`}
                            >
                                <Star className="w-3.5 h-3.5" />
                                {marcador.modo_puntos === 'super_tiebreak'
                                    ? `STB ACTIVO (${scoringUi.superTiebreakPointsToWin})`
                                    : `Super TB (${scoringUi.superTiebreakPointsToWin})`}
                            </button>
                        </div>

                        {/* Golden Point */}
                        <button
                            onClick={toggleGoldenPoint}
                            className={`w-full py-4 rounded-2xl font-black uppercase italic tracking-widest text-xs flex items-center justify-center gap-3 transition-all border-2 ${marcador.golden_point
                                ? 'bg-yellow-400/10 border-yellow-400/50 text-yellow-400'
                                : 'bg-white/5 border-white/10 text-gray-500'
                                }`}
                        >
                            <Zap className="w-4 h-4" />
                            {marcador.golden_point ? 'PUNTO DE ORO ACTIVADO' : 'Activar Punto de Oro'}
                        </button>

                        {/* Terminar partido */}
                        <button
                            onClick={handleDesactivar}
                            className="w-full py-4 rounded-2xl font-black uppercase italic tracking-widest text-xs flex items-center justify-center gap-3 bg-red-500/10 border-2 border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
                        >
                            <Square className="w-4 h-4" />
                            TERMINAR PARTIDO
                        </button>
                    </div>
                )}
            </div>

            {/* ── Acciones fijas del marker (siempre visibles) ───────────────── */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 pb-4 z-50">
                <div className="bg-[#0a0a0a]/90 border border-white/10 rounded-3xl px-3 py-3 space-y-2 backdrop-blur-md">
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={toggleAsistenciaMedica}
                            disabled={!isEnVivo || !marcador}
                            className={`w-full py-2 rounded-2xl font-black uppercase tracking-widest text-[9px] border transition-all ${
                                !isEnVivo || !marcador
                                    ? 'bg-white/5 border-white/10 text-gray-600'
                                    : marcador?.asistencia_medica_active
                                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                            }`}
                        >
                            ASISTENCIA
                        </button>
                        <button
                            onClick={toggleMesaTecnica}
                            disabled={!isEnVivo || !marcador}
                            className={`w-full py-2 rounded-2xl font-black uppercase tracking-widest text-[9px] border transition-all ${
                                !isEnVivo || !marcador
                                    ? 'bg-white/5 border-white/10 text-gray-600'
                                    : marcador?.mesa_tecnica_active
                                        ? 'bg-padel-primary/15 border-padel-primary/40 text-padel-primary'
                                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                            }`}
                        >
                            MESA
                        </button>
                        <button
                            onClick={requestCambioCancha}
                            disabled={!isEnVivo || !marcador}
                            className={`w-full py-2 rounded-2xl font-black uppercase tracking-widest text-[9px] border transition-all ${
                                !isEnVivo || !marcador
                                    ? 'bg-white/5 border-white/10 text-gray-600'
                                    : 'bg-yellow-400/10 border-yellow-400/30 text-yellow-200 hover:bg-yellow-400/15'
                            }`}
                        >
                            CAMBIO
                        </button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/50 leading-none">CRONÓMETRO</span>
                            <span className="text-[18px] font-black italic tracking-tighter text-padel-primary leading-none">{formatCron(cronSeconds)}</span>
                        </div>
                        <button
                            onClick={toggleCronometro}
                            disabled={!isEnVivo || !marcador || marcador?.cronometro?.running}
                            className={`px-3 py-2 rounded-2xl font-black uppercase italic tracking-widest text-[10px] border transition-all ${
                                !isEnVivo || !marcador || marcador?.cronometro?.running
                                    ? 'bg-white/5 border-white/10 text-gray-500'
                                    : 'bg-padel-primary/15 border-padel-primary/40 text-padel-primary hover:bg-padel-primary/25'
                            }`}
                        >
                            {marcador?.cronometro?.running ? 'EN MARCHA' : 'INICIAR'}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                .font-outfit { font-family: 'Outfit', sans-serif; }
            `}</style>
        </div>
    );
}

// ── Componente reutilizable de fila de puntaje ─────────────────────────────
function CompactScoreRow({
    modoPuntos,
    puntosLocal,
    puntosVisitante,
    gamesLocal,
    gamesVisitante,
    setsLocal,
    setsVisitante,
    onPuntoUpLocal,
    onPuntoDownLocal,
    onPuntoUpVisitante,
    onPuntoDownVisitante,
    onGameUpLocal,
    onGameDownLocal,
    onGameUpVisitante,
    onGameDownVisitante,
    onSetUpLocal,
    onSetDownLocal,
    onSetUpVisitante,
    onSetDownVisitante,
}: {
    modoPuntos: string;
    puntosLocal: string | number;
    puntosVisitante: string | number;
    gamesLocal: string | number;
    gamesVisitante: string | number;
    setsLocal: string | number;
    setsVisitante: string | number;
    onPuntoUpLocal: () => void;
    onPuntoDownLocal: () => void;
    onPuntoUpVisitante: () => void;
    onPuntoDownVisitante: () => void;
    onGameUpLocal: () => void;
    onGameDownLocal: () => void;
    onGameUpVisitante: () => void;
    onGameDownVisitante: () => void;
    onSetUpLocal: () => void;
    onSetDownLocal: () => void;
    onSetUpVisitante: () => void;
    onSetDownVisitante: () => void;
}) {
    const puntosLabel =
        `PUNTOS${modoPuntos === 'tiebreak' ? ' — TIEBREAK' : modoPuntos === 'super_tiebreak' ? ' — SUPER TIE BREAK' : ''}`;

    return (
        <div className="rounded-3xl border bg-white/5 border-white/10 p-4 space-y-3">
            <p className="text-center text-[9px] font-black uppercase tracking-[0.35em] text-gray-500">
                {puntosLabel}
            </p>
            <div className="grid grid-cols-[1fr_auto_auto_1fr] items-center gap-3">
                {/* Puntos equipo 1 (izquierda) */}
                <TeamScoreControl
                    value={puntosLocal}
                    onUp={onPuntoUpLocal}
                    onDown={onPuntoDownLocal}
                    highlight
                />

                {/* Games al centro */}
                <MiniScoreControl
                    label="GAMES"
                    localVal={gamesLocal}
                    visitanteVal={gamesVisitante}
                    onUpLocal={onGameUpLocal}
                    onDownLocal={onGameDownLocal}
                    onUpVisitante={onGameUpVisitante}
                    onDownVisitante={onGameDownVisitante}
                />

                {/* Sets al centro, al lado de games */}
                <MiniScoreControl
                    label="SETS"
                    localVal={setsLocal}
                    visitanteVal={setsVisitante}
                    onUpLocal={onSetUpLocal}
                    onDownLocal={onSetDownLocal}
                    onUpVisitante={onSetUpVisitante}
                    onDownVisitante={onSetDownVisitante}
                />

                {/* Puntos equipo 2 (derecha) */}
                <TeamScoreControl
                    value={puntosVisitante}
                    onUp={onPuntoUpVisitante}
                    onDown={onPuntoDownVisitante}
                    highlight
                />
            </div>
        </div>
    );
}

function MiniScoreControl({
    label,
    localVal,
    visitanteVal,
    onUpLocal,
    onDownLocal,
    onUpVisitante,
    onDownVisitante,
}: {
    label: string;
    localVal: string | number;
    visitanteVal: string | number;
    onUpLocal: () => void;
    onDownLocal: () => void;
    onUpVisitante: () => void;
    onDownVisitante: () => void;
}) {
    return (
        <div className="flex flex-col items-center gap-1 px-1">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-500 mb-0.5">
                {label}
            </span>
            <div className="flex items-center gap-2">
                <button
                    onClick={onDownLocal}
                    className="w-6 h-6 rounded-xl flex items-center justify-center border border-white/20 bg-black/40 text-xs"
                >
                    −
                </button>
                <span className="text-sm font-black min-w-[1.5rem] text-center">
                    {localVal}
                </span>
                <button
                    onClick={onUpLocal}
                    className="w-6 h-6 rounded-xl flex items-center justify-center border border-white/20 bg-black/40 text-xs"
                >
                    +
                </button>
            </div>
            <div className="flex items-center gap-2 mt-1">
                <button
                    onClick={onDownVisitante}
                    className="w-6 h-6 rounded-xl flex items-center justify-center border border-white/20 bg-black/40 text-xs"
                >
                    −
                </button>
                <span className="text-sm font-black min-w-[1.5rem] text-center">
                    {visitanteVal}
                </span>
                <button
                    onClick={onUpVisitante}
                    className="w-6 h-6 rounded-xl flex items-center justify-center border border-white/20 bg-black/40 text-xs"
                >
                    +
                </button>
            </div>
        </div>
    );
}

function TeamScoreControl({
    value, onUp, onDown, highlight,
}: {
    value: string | number;
    onUp: () => void;
    onDown: () => void;
    highlight?: boolean;
}) {
    return (
        <div className="flex flex-col items-center gap-2">
            <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={onUp}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all active:scale-90 ${highlight ? 'bg-padel-primary/20 border-padel-primary/50 text-padel-primary hover:bg-padel-primary/30' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
            >
                <ChevronUp className="w-6 h-6" />
            </motion.button>
            <span className={`font-black text-3xl tracking-tighter min-w-[3rem] text-center ${highlight ? 'text-padel-primary' : 'text-white'}`}>
                {value}
            </span>
            <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={onDown}
                className="w-12 h-12 rounded-2xl flex items-center justify-center border-2 bg-white/5 border-white/10 text-gray-500 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all active:scale-90"
            >
                <ChevronDown className="w-6 h-6" />
            </motion.button>
        </div>
    );
}
