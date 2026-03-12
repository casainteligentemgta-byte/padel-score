'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    MapPin,
    Users,
    Clock,
    ChevronRight,
    ChevronLeft,
    Plus,
    Trash2,
    CheckCircle2,
    Calendar,
    User,
    Camera,
    RefreshCw,
    ChevronDown,
    Search,
    X,
    Info,
    DollarSign
} from 'lucide-react';
import { TournamentType, TournamentCategory, MatchStatus } from '@/types/tournament';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { ScheduleEngine } from '@/services/ScheduleEngine';
import { useEffect } from 'react';

// ── Estado inicial del formulario ─────────────────────────────────────────
const INITIAL_DATA = {
    name: '',
    type: TournamentType.AMERICANO_INDIVIDUAL,
    gender: '' as 'MALE' | 'FEMALE' | 'MIXED' | '',
    category: TournamentCategory.CUARTA,
    pointsGoal: 24,
    groupSize: 3,
    matchFormat: 'ONE_SET_6' as 'ONE_SET_6' | 'ONE_SET_9' | 'TWO_SHORT_SETS' | 'TWO_NORMAL_SETS',
    scoringSystem: 'GOLDEN_POINT' as 'GOLDEN_POINT' | 'TRADITIONAL',
    tieBreakType: 'TB' as 'TB' | 'STB',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '16:00',
    endTime: '23:30',
    complexName: '',
    totalCourts: 3,
    courtNames: [] as string[],
    bufferMinutes: 2,
    advanceCount: 2,
    isReduced: false,
    teams: [] as {
        id: number;
        p1: { id: string; name: string; lastName: string; age: string; photo: string; phone: string };
        p2: { id: string; name: string; lastName: string; age: string; photo: string; phone: string };
    }[],
    /** Categorías para que los jugadores se inscriban desde la app (varias categorías, evita choques de horario). ageMin/ageMax opcionales; maxSlots = cupo por categoría. */
    inscriptionCategories: [] as { key: string; name: string; price: number; gender?: 'MALE' | 'FEMALE' | 'MIXED'; ageMin?: number; ageMax?: number; maxSlots?: number }[],
};

export default function NewTournamentPage() {
    const router = useRouter();
    const { user, profile, loading: authLoading } = useAuth();
    const [step, setStep] = useState(1);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/');
            return;
        }
        // Solo admin puede crear torneos; jugador y marcador van a torneos
        const isAdmin = profile?.role === 'admin';
        if (!isAdmin) router.replace('/tournaments');
    }, [user, profile, authLoading, router]);
    const [tournamentData, setTournamentData] = useState({ ...INITIAL_DATA, startDate: new Date().toISOString().split('T')[0] });
    const [loading, setLoading] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const [availableParticipants, setAvailableParticipants] = useState<any[]>([]);
    const [availableGroups, setAvailableGroups] = useState<any[]>([]);
    const [fetchingData, setFetchingData] = useState(false);

    // ── Reset completo al montar: garantiza plantilla en blanco en cada visita ──
    useEffect(() => {
        setStep(1);
        setTournamentData({ ...INITIAL_DATA, startDate: new Date().toISOString().split('T')[0] });
        setViewDate(new Date());
        setLoading(false);
        setAvailableParticipants([]);
        setAvailableGroups([]);
        setPlayerSearchQuery('');
        setIsPlayerModalOpen(false);
        setSelectorContext(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Estados para búsqueda y selección de jugadores de la base
    const [playerSearchQuery, setPlayerSearchQuery] = useState('');
    const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
    const [selectorContext, setSelectorContext] = useState<{ teamId: number, playerKey: 'p1' | 'p2' } | null>(null);

    useEffect(() => {
        if (user && step === 6) {
            loadDatabaseData();
        }
    }, [user, step]);

    const loadDatabaseData = async () => {
        if (!user) return;
        setFetchingData(true);
        try {
            const [parts, groups] = await Promise.all([
                dataService.getMyParticipants(user.uid),
                dataService.getMyGroups(user.uid)
            ]);
            setAvailableParticipants(parts);
            setAvailableGroups(groups);
        } catch (error) {
            console.error('Error loading selection data:', error);
        } finally {
            setFetchingData(false);
        }
    };

    const getDaysInMonth = (year: number, month: number) => {
        const date = new Date(year, month, 1);
        const days: (Date | null)[] = [];
        const firstDay = (date.getDay() + 6) % 7; // Adjust to start on Monday

        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    };

    const LEVEL_CATEGORIES = [
        { id: TournamentCategory.PRIMERA, label: '1ª Categoría' },
        { id: TournamentCategory.SEGUNDA, label: '2ª Categoría' },
        { id: TournamentCategory.TERCERA, label: '3ª Categoría' },
        { id: TournamentCategory.CUARTA, label: '4ª Categoría' },
        { id: TournamentCategory.QUINTA, label: '5ª Categoría' },
        { id: TournamentCategory.SEXTA, label: '6ª Categoría' },
        { id: TournamentCategory.SEPTIMA, label: '7ª Categoría' },
        { id: TournamentCategory.MAS_40, label: '+40 Masc.' },
        { id: TournamentCategory.FEM_40, label: '+40 Fem.' },
        { id: TournamentCategory.MIX_40, label: '+40 Mixto' },
        { id: TournamentCategory.MAS_45, label: '+45' },
        { id: TournamentCategory.MAS_50, label: '+50' },
        { id: TournamentCategory.SUMA_7, label: 'Suma 7' },
        { id: TournamentCategory.SUMA_8, label: 'Suma 8' },
        { id: TournamentCategory.SUMA_9, label: 'Suma 9' },
        { id: TournamentCategory.SUMA_10, label: 'Suma 10' },
        { id: TournamentCategory.SUMA_11, label: 'Suma 11' },
    ];

    const COMPLEXES = [
        { name: 'Food Kart', courts: 3 },
        { name: 'El Bodeguero', courts: 3 },
    ];

    const generateTournament = async () => {
        if (!user) {
            console.error('[NewTournament] User not authenticated');
            return alert('Debes iniciar sesión');
        }

        if (tournamentData.teams.length < 2) {
            return alert('Se necesitan al menos 2 parejas para generar partidos');
        }

        console.log('[NewTournament] Starting tournament generation...', tournamentData);
        setLoading(true);

        // Security timeout
        const generationTimeout = setTimeout(() => {
            setLoading(false);
            console.warn('[NewTournament] Process timed out after 15s');
            alert('La conexión con Firebase está tardando demasiado. Verifica tu conexión e intenta de nuevo.');
        }, 15000);

        try {
            // Calculate duration based on logic table
            let matchDuration = 20;
            if (tournamentData.type === TournamentType.ROUND_ROBIN) {
                switch (tournamentData.matchFormat) {
                    case 'ONE_SET_6': matchDuration = 30; break;
                    case 'ONE_SET_9': matchDuration = 45; break;
                    case 'TWO_SHORT_SETS': matchDuration = 60; break;
                    case 'TWO_NORMAL_SETS': matchDuration = 90; break;
                    default: matchDuration = 40;
                }
            } else {
                if (tournamentData.pointsGoal === 16) matchDuration = 10;
                else if (tournamentData.pointsGoal === 24) matchDuration = 15;
                else if (tournamentData.pointsGoal === 32) matchDuration = 22;
                else if (tournamentData.pointsGoal === 40) matchDuration = 30;
            }

            let enrichedMatches: any[] = [];
            let groupAssignments: { [key: string]: string[] } = {};

            if (tournamentData.type === TournamentType.CRUZADO) {
                // ── FORMATO CRUZADO ─────────────────────────────────────
                const [y, mo, d] = (tournamentData.startDate || '').split('-').map(Number);
                const startDateLocal = y ? new Date(y, mo - 1, d) : new Date();

                // Construir grupos A y B respetando groupSize
                const cruzTeams = [...tournamentData.teams];
                const cruzGroupSize = tournamentData.groupSize || 3;
                // Grupo A: primeros groupSize equipos; Grupo B: siguientes groupSize equipos
                // Si hay más equipos, se distribuyen extra entre los grupos
                const cruzHalf = Math.ceil(cruzTeams.length / 2);
                const cruzGroupA = cruzTeams.slice(0, cruzHalf);
                const cruzGroupB = cruzTeams.slice(cruzHalf);

                // Guardar asignaciones de grupo con IDs de equipos
                const cruzAssignments: Record<string, string[]> = {
                    A: cruzGroupA.map((t: any) => String(t.id)),
                    B: cruzGroupB.map((t: any) => String(t.id)),
                };

                const { crossMatches, qfMatches, groupAssignments: ga } = ScheduleEngine.generateCruzado({
                    numTeams: tournamentData.teams.length,
                    numCourts: Math.max(1, tournamentData.courtNames.length),
                    clubHoursStart: tournamentData.startTime || '08:00',
                    clubHoursEnd: tournamentData.endTime || '22:00',
                    startDate: startDateLocal,
                    matchDurationMinutes: 85,
                });

                // Combinar asignaciones de grupo (cruzadas) con las generadas por el engine
                groupAssignments = { ...ga, ...cruzAssignments };

                // Enriquecer crossMatches con nombres de cancha
                const enrichedCross = crossMatches.map((cm: any, idx: number) => ({
                    ...cm,
                    id: `cruzado-${idx}-${Date.now()}`,
                    courtName: tournamentData.courtNames?.[cm.courtIndex] || `Pista ${cm.courtIndex + 1}`,
                    court: cm.courtIndex + 1,
                }));

                // QF placeholders
                const enrichedQF = qfMatches.map((qm: any, idx: number) => ({
                    ...qm,
                    id: `qf-${idx}-${Date.now()}`,
                    courtName: tournamentData.courtNames?.[qm.courtIndex] || `Pista ${qm.courtIndex + 1}`,
                    court: qm.courtIndex + 1,
                    team1Name: 'Por Definir (1°A)',
                    team2Name: 'Por Definir (1°B)',
                }));

                enrichedMatches = [...enrichedCross, ...enrichedQF];

            } else if (tournamentData.type === TournamentType.ROUND_ROBIN) {
                // ── FORMATO ROUND ROBIN CON GRUPOS DE 3 o 4 EQUIPOS ─────
                const teams = [...tournamentData.teams];
                const groupSize = tournamentData.groupSize || 3; // 3 or 4 teams per group

                // ── Calcular número de grupos correctamente ──────────────
                // Grupos completos de `groupSize`, el resto se distribuye
                const numCompleteGroups = Math.floor(teams.length / groupSize);
                const remainder = teams.length % groupSize;
                // Si hay sobrante, se añade a grupos ya existentes (no se crea grupo extra incompleto)
                // Mínimo 1 grupo
                const numGroups = Math.max(1, numCompleteGroups + (remainder > 0 && numCompleteGroups === 0 ? 1 : 0));

                // ── Inicializar grupos vacíos ────────────────────────────
                const groups: any[][] = Array.from({ length: numGroups }, () => []);

                // ── Distribuir equipos: llenar grupos de groupSize uno a uno ──
                // Estrategia: asignar `groupSize` equipos a cada grupo secuencialmente.
                // Los equipos sobrantes (remainder) se añaden al último grupo.
                let teamPool = [...teams];
                for (let g = 0; g < numGroups; g++) {
                    // Dar `groupSize` equipos a este grupo si hay suficientes
                    const toAdd = (g < numGroups - 1) ? groupSize : teamPool.length; // el último grupo absorbe el resto
                    for (let k = 0; k < toAdd && teamPool.length > 0; k++) {
                        groups[g].push(teamPool.shift());
                    }
                }

                // ── Generar emparejamientos dentro de cada grupo (todos vs todos) ──
                const groupNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
                let allPairings: any[] = [];

                groups.forEach((groupTeams, gIdx) => {
                    const groupName = groupNames[gIdx];
                    groupAssignments[groupName] = groupTeams.map((t: any) => String(t.id));

                    // Generar emparejamientos dentro de cada grupo
                    if (tournamentData.isReduced && groupTeams.length === 4) {
                        // MODO REDUCIDO (4 equipos, 2 juegos cada uno → 4 juegos total/grupo)
                        // Parejas: (0vs1, 2vs3) -> Jornada 1 | (0vs2, 1vs3) -> Jornada 2
                        const pairs = [
                            { t1: 0, t2: 1 },
                            { t1: 2, t2: 3 },
                            { t1: 0, t2: 2 },
                            { t1: 1, t2: 3 }
                        ];
                        pairs.forEach(p => {
                            allPairings.push({
                                team1: groupTeams[p.t1],
                                team2: groupTeams[p.t2],
                                groupName: groupName
                            });
                        });
                    } else {
                        // MODO NORMAL (Todos vs Todos)
                        for (let i = 0; i < groupTeams.length; i++) {
                            for (let j = i + 1; j < groupTeams.length; j++) {
                                allPairings.push({
                                    team1: groupTeams[i],
                                    team2: groupTeams[j],
                                    groupName: groupName
                                });
                            }
                        }
                    }

                    console.log(`[NewTournament] Grupo ${groupName}: ${groupTeams.length} equipos, ${groupTeams.length * (groupTeams.length - 1) / 2} partidos`);
                });

                const [y, m, d] = (tournamentData.startDate || "").split('-').map(Number);
                const startDateLocal = y ? new Date(y, m - 1, d) : new Date();

                // ── Asignación directa de tiempos/canchas a los pairings ──────────────────
                // No usamos generateSchedule (que trunca por horario) sino que asignamos
                // slots directamente sobre los allPairings para garantizar TODOS los partidos.
                const numCourts = tournamentData.courtNames.length > 0 ? tournamentData.courtNames.length : Math.max(1, tournamentData.totalCourts);
                const [startH, startMin] = (tournamentData.startTime || "08:00").split(':').map(Number);
                const slotMinutes = matchDuration + 2; // duración + buffer

                // Matriz de siguiente slot disponible por cancha
                const courtNextSlot: number[] = Array(numCourts).fill(startH * 60 + startMin);

                enrichedMatches = allPairings.map((pairing, idx) => {
                    // Elegir la cancha con el slot más temprano disponible (round-robin entre canchas)
                    const courtIdx = idx % numCourts;
                    const slotStart = courtNextSlot[courtIdx];
                    courtNextSlot[courtIdx] += slotMinutes;

                    // Construir fecha/hora del partido
                    const matchDate = new Date(startDateLocal);
                    matchDate.setHours(Math.floor(slotStart / 60), slotStart % 60, 0, 0);

                    const t1Idx = tournamentData.teams.findIndex(t => t.id === pairing.team1.id);
                    const t2Idx = tournamentData.teams.findIndex(t => t.id === pairing.team2.id);

                    return {
                        id: `match-${idx}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        team1Index: t1Idx + 1,
                        team2Index: t2Idx + 1,
                        scheduledTime: matchDate.toISOString(),
                        courtIndex: courtIdx,
                        court: courtIdx + 1,
                        courtName: tournamentData.courtNames?.[courtIdx] || `Pista ${courtIdx + 1}`,
                        status: 'PENDING',
                        stage: 'GROUP_STAGE',
                    };
                });

                // ── Generar Eliminatorias Automáticas si hay Avance ──────────
                if (tournamentData.advanceCount > 0) {
                    const numGroupsGenerated = Object.keys(groupAssignments).length;
                    const totalAdvancing = numGroupsGenerated * tournamentData.advanceCount;

                    // Encontrar el último tiempo de la fase de grupos
                    const lastGroupSlot = Math.max(...courtNextSlot);
                    let knockoutSlot = lastGroupSlot + slotMinutes;

                    if (totalAdvancing === 4 && numGroupsGenerated === 2) {
                        // SEMIFINALES (2 grupos, pasan 2 → 4 equipos)
                        const sfMatches = [
                            {
                                id: `sf-1-${Date.now()}`,
                                team1Index: -1, // Placeholder 1°A
                                team2Index: -2, // Placeholder 2°B
                                team1Name: '1° Grupo A',
                                team2Name: '2° Grupo B',
                                scheduledTime: '', // Se asignará abajo
                                courtIndex: 0,
                                court: 1,
                                courtName: tournamentData.courtNames?.[0] || 'Pista 1',
                                status: 'PENDING',
                                stage: 'MAIN_DRAW',
                                roundName: 'SEMIFINALES',
                                placeholder: '1A_VS_2B'
                            },
                            {
                                id: `sf-2-${Date.now()}`,
                                team1Index: -3, // Placeholder 1°B
                                team2Index: -4, // Placeholder 2°A
                                team1Name: '1° Grupo B',
                                team2Name: '2° Grupo A',
                                scheduledTime: '',
                                courtIndex: numCourts > 1 ? 1 : 0,
                                court: numCourts > 1 ? 2 : 1,
                                courtName: tournamentData.courtNames?.[numCourts > 1 ? 1 : 0] || `Pista ${numCourts > 1 ? 2 : 1}`,
                                status: 'PENDING',
                                stage: 'MAIN_DRAW',
                                roundName: 'SEMIFINALES',
                                placeholder: '1B_VS_2A'
                            }
                        ];

                        // Asignar tiempos a SF
                        sfMatches[0].scheduledTime = new Date(startDateLocal.getTime() + (knockoutSlot * 60000)).toISOString();
                        if (numCourts === 1) knockoutSlot += slotMinutes;
                        sfMatches[1].scheduledTime = new Date(startDateLocal.getTime() + (knockoutSlot * 60000)).toISOString();

                        knockoutSlot += slotMinutes;

                        // FINAL
                        const finalMatch = {
                            id: `final-${Date.now()}`,
                            team1Index: -5,
                            team2Index: -6,
                            team1Name: 'Ganador SF1',
                            team2Name: 'Ganador SF2',
                            scheduledTime: new Date(startDateLocal.getTime() + (knockoutSlot * 60000)).toISOString(),
                            courtIndex: 0,
                            court: 1,
                            courtName: tournamentData.courtNames?.[0] || 'Pista 1',
                            status: 'PENDING',
                            stage: 'MAIN_DRAW',
                            roundName: 'FINAL'
                        };

                        enrichedMatches = [...enrichedMatches, ...sfMatches, finalMatch];
                    } else if (totalAdvancing === 2 && numGroupsGenerated === 2) {
                        // FINAL DIRECTA (2 grupos, pasa 1 → 2 equipos)
                        const finalMatch = {
                            id: `final-${Date.now()}`,
                            team1Index: -1,
                            team2Index: -2,
                            team1Name: '1° Grupo A',
                            team2Name: '1° Grupo B',
                            scheduledTime: new Date(startDateLocal.getTime() + (knockoutSlot * 60000)).toISOString(),
                            courtIndex: 0,
                            court: 1,
                            courtName: tournamentData.courtNames?.[0] || 'Pista 1',
                            status: 'PENDING',
                            stage: 'MAIN_DRAW',
                            roundName: 'FINAL'
                        };
                        enrichedMatches = [...enrichedMatches, finalMatch];
                    }
                }

            } else {
                const [y, m, d] = (tournamentData.startDate || "").split('-').map(Number);
                const startDateLocal = y ? new Date(y, m - 1, d) : new Date();

                // Original Generation Logic
                const schedule = ScheduleEngine.generateSchedule({
                    tournamentId: 'temporary',
                    numTeams: tournamentData.teams.length,
                    numCourts: Math.max(1, tournamentData.courtNames.length),
                    clubHoursStart: tournamentData.startTime || "08:00",
                    clubHoursEnd: tournamentData.endTime || "22:00",
                    startDate: startDateLocal,
                    matchDurationMinutes: matchDuration,
                    bufferMinutes: 2,
                    type: tournamentData.type
                });

                enrichedMatches = (schedule.matches || []).map((m: any, idx: number) => {
                    return {
                        id: `match-${idx}-${Date.now()}`,
                        ...m,
                        courtName: tournamentData.courtNames?.[m.courtIndex] || `Pista ${m.courtIndex + 1}`,
                        status: 'PENDING'
                    };
                });
            }

            enrichedMatches.sort((a, b) => {
                const timeDiff = new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
                if (timeDiff !== 0) return timeDiff;
                return a.courtIndex - b.courtIndex;
            });

            if (enrichedMatches.length === 0) {
                alert('No se pudieron generar partidos en el rango horario seleccionado. Por favor amplía el horario o reduce la duración de los sets.');
                setLoading(false);
                return;
            }

            const defaultInscriptionCategories = (tournamentData.inscriptionCategories?.length ?? 0) > 0
                ? tournamentData.inscriptionCategories
                : [{
                    key: tournamentData.category || 'PRIMERA',
                    name: `${tournamentData.category || 'Primera'}${tournamentData.gender ? ' ' + (tournamentData.gender === 'MALE' ? 'Masculino' : tournamentData.gender === 'FEMALE' ? 'Femenino' : 'Mixto') : ''}`,
                    price: 0,
                    gender: tournamentData.gender || undefined,
                }];

            const tournamentToSave = {
                name: tournamentData.name,
                type: tournamentData.type,
                category: tournamentData.category,
                gender: tournamentData.gender,
                startDate: tournamentData.startDate,
                startTime: tournamentData.startTime,
                endTime: tournamentData.endTime,
                complexName: tournamentData.complexName,
                totalCourts: tournamentData.totalCourts,
                courtNames: tournamentData.courtNames,
                bufferMinutes: tournamentData.bufferMinutes,
                teams: tournamentData.teams,
                matches: enrichedMatches,
                pointsGoal: tournamentData.pointsGoal,
                groupSize: tournamentData.groupSize,
                isReduced: tournamentData.isReduced,
                matchFormat: tournamentData.matchFormat,
                scoringSystem: tournamentData.scoringSystem,
                tieBreakType: tournamentData.tieBreakType,
                groupAssignments: groupAssignments,
                advancementRule: tournamentData.type === TournamentType.ROUND_ROBIN
                    ? { teamsPerGroup: tournamentData.groupSize, advanceCount: tournamentData.advanceCount, nextRound: Object.keys(groupAssignments).length === 2 ? 'QF' : 'SF' }
                    : null,
                status: 'En Curso',
                inscriptionCategories: defaultInscriptionCategories,
            };

            console.log('[NewTournament] Saving to Firestore...');
            const docRef = await dataService.createTournament(tournamentToSave, user.uid);
            console.log('[NewTournament] Document created with ID:', docRef.id);

            clearTimeout(generationTimeout);
            alert(`¡Torneo y calendario generados con éxito! (${enrichedMatches.length} partidos)`);
            console.log('[NewTournament] Redirecting to dashboard...');
            router.push(`/tournaments/${docRef.id}`);
        } catch (err: any) {
            clearTimeout(generationTimeout);
            console.error('[NewTournament] Error generating tournament:', err);
            alert(`Error al generar torneo: ${err.message}`);
        } finally {
            console.log('[NewTournament] Generation process finished');
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 3 && ![TournamentType.ROUND_ROBIN, TournamentType.KNOCKOUT, TournamentType.CRUZADO].includes(tournamentData.type as any)) {
            setStep(5);
        } else {
            setStep(s => Math.min(s + 1, 7));
        }
    };

    const prevStep = () => {
        if (step === 5 && ![TournamentType.ROUND_ROBIN, TournamentType.KNOCKOUT, TournamentType.CRUZADO].includes(tournamentData.type as any)) {
            setStep(3);
        } else {
            setStep(s => Math.max(s - 1, 1));
        }
    };

    const addTeam = () => {
        setTournamentData(prev => ({
            ...prev,
            teams: [...prev.teams, {
                id: Date.now(),
                p1: { id: '', name: '', lastName: '', age: '', photo: '', phone: '' },
                p2: { id: '', name: '', lastName: '', age: '', photo: '', phone: '' }
            }]
        }));
    };

    const updateTeamMember = (teamId: number, playerKey: 'p1' | 'p2', field: string, value: string) => {
        setTournamentData(prev => ({
            ...prev,
            teams: prev.teams.map(t =>
                t.id === teamId
                    ? { ...t, [playerKey]: { ...t[playerKey as keyof typeof t] as any, [field]: value } }
                    : t
            )
        }));
    };

    const removeTeam = (id: number) => {
        setTournamentData(prev => ({
            ...prev,
            teams: prev.teams.filter(t => t.id !== id)
        }));
    };

    // Listado de IDs de jugadores ya seleccionados para evitar duplicados
    const selectedPlayerIds = tournamentData.teams.reduce((acc, team) => {
        if (team.p1.id) acc.push(team.p1.id);
        if (team.p2.id) acc.push(team.p2.id);
        return acc;
    }, [] as string[]);

    const filteredParticipants = availableParticipants.filter(p =>
        !selectedPlayerIds.includes(p.id) &&
        (p.name.toLowerCase().includes(playerSearchQuery.toLowerCase()) ||
            p.lastName?.toLowerCase().includes(playerSearchQuery.toLowerCase()))
    );

    const openPlayerSelector = (teamId: number, playerKey: 'p1' | 'p2') => {
        setSelectorContext({ teamId, playerKey });
        setPlayerSearchQuery('');
        setIsPlayerModalOpen(true);
    };

    const selectPlayer = (p: any) => {
        if (selectorContext) {
            updateTeamMember(selectorContext.teamId, selectorContext.playerKey, 'id', p.id);
            updateTeamMember(selectorContext.teamId, selectorContext.playerKey, 'name', p.name);
            updateTeamMember(selectorContext.teamId, selectorContext.playerKey, 'lastName', p.lastName || '');
            if (p.photo) updateTeamMember(selectorContext.teamId, selectorContext.playerKey, 'photo', p.photo);
            setIsPlayerModalOpen(false);
            setSelectorContext(null);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-padel-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="ipad-screen-container h-screen overflow-hidden flex flex-col bg-[#0a0a0a] text-white font-outfit">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2 relative p-4 bg-black/20 rounded-b-3xl flex-shrink-0">
                <button
                    onClick={prevStep}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all ${step === 1 ? 'hidden' : ''}`}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                    onClick={() => {
                        if (confirm('¿Deseas salir de la creación del torneo? Perderás los cambios no guardados.')) {
                            router.push('/');
                        }
                    }}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all group"
                    title="Salir"
                >
                    <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </button>

                <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="flex items-center">
                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                    scaleY: [1, 0.8, 1],
                                    scaleX: [1, 1.1, 1]
                                }}
                                transition={{
                                    duration: 0.8,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="w-5 h-5 bg-padel-primary rounded-full mr-3 shadow-[0_5px_15px_rgba(204,255,0,0.4)] relative overflow-hidden flex-shrink-0"
                            >
                                <div className="absolute inset-0 border-2 border-black/10 rounded-full scale-110 -translate-x-1" />
                                <div className="absolute inset-0 border-2 border-black/10 rounded-full scale-110 translate-x-2 translate-y-2" />
                            </motion.div>
                            <h1 className="text-2xl md:text-3xl font-black italic text-padel-primary tracking-tighter uppercase leading-none">
                                Smart <span className="text-white">Padel</span> <span className="text-white text-[10px] opacity-30 tracking-widest ml-1">Studio</span>
                            </h1>
                        </div>
                        <p className="text-gray-500 mt-1 text-[10px] uppercase font-bold tracking-widest italic">Paso {step}/7 • {step === 2 ? 'Club y Canchas' : step === 4 ? 'Configuración Técnica' : tournamentData.name || 'Nuevo Torneo'}</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex gap-2 flex-1 md:w-64">
                            {[1, 2, 3, 4, 5, 6, 7].map(i => {
                                let isActive = step >= i;
                                // Handle visual skip for non-Round Robin
                                if (![TournamentType.ROUND_ROBIN, TournamentType.KNOCKOUT, TournamentType.CRUZADO].includes(tournamentData.type as any)) {
                                    if (step === 3 && i === 4) isActive = false;
                                    if (step >= 5 && i === 4) isActive = true;
                                } return (
                                    <div
                                        key={i}
                                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${isActive ? 'bg-padel-primary shadow-[0_0_10px_rgba(204,255,0,0.5)]' : 'bg-white/10'}`}
                                    />
                                );
                            })}
                        </div>

                        {step >= 1 && step < 7 && (step === 1 || step === 2 || step === 3 || step === 4 || step === 5 || step === 6) && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                    opacity: (step === 1 && (!tournamentData.name || !tournamentData.gender)) || (step === 2 && tournamentData.courtNames.length === 0) || (step === 3 && !tournamentData.type) ? 0 : 1,
                                    scale: (step === 1 && (!tournamentData.name || !tournamentData.gender)) || (step === 2 && tournamentData.courtNames.length === 0) || (step === 3 && !tournamentData.type) ? 0.8 : 1,
                                    display: (step === 1 && (!tournamentData.name || !tournamentData.gender)) || (step === 2 && tournamentData.courtNames.length === 0) || (step === 3 && !tournamentData.type) ? 'none' : 'flex'
                                }}
                                onClick={nextStep}
                                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(204,255,0,0.6), 0 0 80px rgba(204,255,0,0.3)', filter: 'brightness(1.1)' }}
                                whileTap={{ scale: 0.95 }}
                                disabled={
                                    (step === 1 && (!tournamentData.name || !tournamentData.gender)) ||
                                    (step === 5 && !tournamentData.startDate) ||
                                    (step === 3 && !tournamentData.type)
                                }
                                className="flex items-center gap-2 bg-padel-primary text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase italic tracking-tighter transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)] disabled:opacity-50 disabled:grayscale"
                            >
                                Siguiente <ChevronRight className="w-4 h-4" />
                            </motion.button>
                        )}

                        {step === 7 && (
                            <motion.button
                                onClick={generateTournament}
                                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(204,255,0,0.6), 0 0 80px rgba(204,255,0,0.3)', filter: 'brightness(1.1)' }}
                                whileTap={{ scale: 0.95 }}
                                disabled={loading || !tournamentData.name || tournamentData.courtNames.length === 0}
                                className="flex items-center gap-2 bg-padel-primary text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase italic tracking-tighter transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)] disabled:opacity-50 disabled:grayscale"
                            >
                                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <>Finalizar <Trophy className="w-4 h-4" /></>}
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>

            <div className="ipad-scroll-area flex-1 min-h-0">
                <div className="max-w-4xl mx-auto pt-1 pb-4 px-4 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center space-y-1 mb-4 overflow-hidden relative">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className="relative z-10"
                                    >
                                        <h3 className="text-[60px] md:text-[100px] font-black italic text-white/[0.03] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap tracking-tighter leading-none select-none pointer-events-none uppercase">
                                            GENERO
                                        </h3>
                                        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white relative z-10">
                                            Paso 1: <span className="text-padel-primary">Género</span>
                                        </h2>
                                    </motion.div>
                                </div>

                                <div className="max-w-4xl mx-auto space-y-6">
                                    <div className="bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] p-8 space-y-4">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1 flex items-center gap-2">
                                            <Trophy className="w-3.5 h-3.5 text-padel-primary" /> Nombre del Torneo
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="EJ: AMERICANO NOCTURNO ELITE"
                                            value={tournamentData.name}
                                            onChange={(e) => setTournamentData({ ...tournamentData, name: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-2xl font-black text-white italic tracking-tight uppercase outline-none focus:border-padel-primary transition-all placeholder:text-gray-800"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { id: 'MALE', label: 'Masculino', icon: User },
                                            { id: 'FEMALE', label: 'Femenino', icon: User },
                                            { id: 'MIXED', label: 'Mixto', icon: Users },
                                        ].map((g) => (
                                            <motion.button
                                                key={g.id}
                                                whileHover={{ scale: 1.05, boxShadow: '0 0 80px rgba(204,255,0,0.5), 0 0 150px rgba(204,255,0,0.2)', filter: 'brightness(1.1)' }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    setTournamentData({ ...tournamentData, gender: g.id as any });
                                                }}
                                                className={`relative group transition-all duration-500 rounded-[2.5rem] p-1 ${tournamentData.gender === g.id ? 'bg-padel-primary shadow-[0_0_40px_rgba(204,255,0,0.2)]' : 'bg-white/10 border border-transparent hover:border-padel-primary/50'}`}
                                            >
                                                <div className={`h-full w-full rounded-[2.4rem] p-10 flex flex-col items-center gap-6 transition-all duration-500 ${tournamentData.gender === g.id ? 'bg-[#111]' : 'bg-[#1a1a1a] group-hover:bg-[#111]'}`}>
                                                    <div className={`p-6 rounded-full transition-all duration-500 ${tournamentData.gender === g.id ? 'bg-padel-primary/20 scale-110' : 'bg-white/5 group-hover:bg-padel-primary/10 group-hover:scale-110'}`}>
                                                        <g.icon className={`w-12 h-12 transition-colors ${tournamentData.gender === g.id ? 'text-padel-primary' : 'text-gray-600 group-hover:text-padel-primary'}`} />
                                                    </div>
                                                    <span className={`text-2xl font-black italic uppercase tracking-tighter transition-all ${tournamentData.gender === g.id ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                                                        {g.label}
                                                    </span>
                                                    {tournamentData.gender === g.id && (
                                                        <div className="absolute top-6 right-6">
                                                            <CheckCircle2 className="text-padel-primary w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>

                                    <div className="bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] p-6 space-y-4">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1 flex items-center gap-2">
                                            <User className="w-3.5 h-3.5 text-padel-primary" /> Categorías de inscripción
                                        </label>
                                        <p className="text-xs text-gray-500">
                                            Los jugadores podrán inscribirse desde la app. Indica el <strong>nº de parejas</strong> por categoría y los cupos se crearán solos (parejas × 2 plazas). El horario evitará choques entre categorías.
                                        </p>
                                        {(tournamentData.inscriptionCategories?.length ?? 0) > 0 && (
                                            <ul className="space-y-2">
                                                {tournamentData.inscriptionCategories.map((cat, idx) => (
                                                    <li key={cat.key + idx} className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-black/30 border border-white/5">
                                                        <input
                                                            type="text"
                                                            value={cat.name}
                                                            onChange={(e) => {
                                                                const next = [...(tournamentData.inscriptionCategories || [])];
                                                                next[idx] = { ...next[idx], name: e.target.value };
                                                                setTournamentData({ ...tournamentData, inscriptionCategories: next });
                                                            }}
                                                            placeholder="Nombre (ej. Primera Masculino)"
                                                            className="flex-1 min-w-[120px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-white"
                                                        />
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={cat.price}
                                                            onChange={(e) => {
                                                                const next = [...(tournamentData.inscriptionCategories || [])];
                                                                next[idx] = { ...next[idx], price: parseFloat(e.target.value) || 0 };
                                                                setTournamentData({ ...tournamentData, inscriptionCategories: next });
                                                            }}
                                                            placeholder="0"
                                                            className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm font-bold text-white"
                                                        />
                                                        <span className="text-[10px] text-gray-500">$</span>
                                                        <span className="text-[10px] text-gray-500">Edad:</span>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={99}
                                                            value={cat.ageMin ?? ''}
                                                            onChange={(e) => {
                                                                const next = [...(tournamentData.inscriptionCategories || [])];
                                                                const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                                                                next[idx] = { ...next[idx], ageMin: v === undefined || Number.isNaN(v) ? undefined : v };
                                                                setTournamentData({ ...tournamentData, inscriptionCategories: next });
                                                            }}
                                                            placeholder="mín"
                                                            className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs font-bold text-white"
                                                            title="Edad mínima (opcional)"
                                                        />
                                                        <span className="text-[10px] text-gray-500">–</span>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={99}
                                                            value={cat.ageMax ?? ''}
                                                            onChange={(e) => {
                                                                const next = [...(tournamentData.inscriptionCategories || [])];
                                                                const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                                                                next[idx] = { ...next[idx], ageMax: v === undefined || Number.isNaN(v) ? undefined : v };
                                                                setTournamentData({ ...tournamentData, inscriptionCategories: next });
                                                            }}
                                                            placeholder="máx"
                                                            className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs font-bold text-white"
                                                            title="Edad máxima (opcional)"
                                                        />
                                                        <span className="text-[10px] text-gray-500">Parejas:</span>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={cat.maxSlots != null ? Math.floor(cat.maxSlots / 2) : ''}
                                                            onChange={(e) => {
                                                                const next = [...(tournamentData.inscriptionCategories || [])];
                                                                const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                                                                const numParejas = v === undefined || Number.isNaN(v) || v < 1 ? undefined : v;
                                                                next[idx] = { ...next[idx], maxSlots: numParejas != null ? numParejas * 2 : undefined };
                                                                setTournamentData({ ...tournamentData, inscriptionCategories: next });
                                                            }}
                                                            placeholder="sin límite"
                                                            className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs font-bold text-white"
                                                            title="Nº de parejas: los cupos se crean automáticamente (parejas × 2 plazas)"
                                                        />
                                                        {cat.maxSlots != null && (
                                                            <span className="text-[10px] text-gray-500">= {cat.maxSlots} plazas</span>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const next = (tournamentData.inscriptionCategories || []).filter((_, i) => i !== idx);
                                                                setTournamentData({ ...tournamentData, inscriptionCategories: next });
                                                            }}
                                                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-bold"
                                                        >
                                                            Quitar
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const key = `CAT_${(tournamentData.inscriptionCategories?.length ?? 0) + 1}`;
                                                const name = tournamentData.gender === 'MALE' ? 'Masculino' : tournamentData.gender === 'FEMALE' ? 'Femenino' : 'Mixto';
                                                setTournamentData({
                                                    ...tournamentData,
                                                    inscriptionCategories: [...(tournamentData.inscriptionCategories || []), { key, name: `Categoría ${name}`, price: 0, gender: tournamentData.gender || undefined, ageMin: undefined, ageMax: undefined, maxSlots: undefined }],
                                                });
                                            }}
                                            className="text-sm font-bold uppercase tracking-widest text-padel-primary hover:underline"
                                        >
                                            + Añadir categoría de inscripción
                                        </button>
                                        {(!tournamentData.inscriptionCategories || tournamentData.inscriptionCategories.length === 0) && (
                                            <p className="text-[10px] text-gray-600">Si no añades ninguna, se creará una por defecto con el género del torneo.</p>
                                        )}
                                    </div>
                                </div>

                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="text-center space-y-1 mb-4 overflow-hidden relative">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className="relative z-10"
                                    >
                                        <h3 className="text-[60px] md:text-[100px] font-black italic text-white/[0.03] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap tracking-tighter leading-none select-none pointer-events-none uppercase">
                                            MARGARITA
                                        </h3>
                                        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white relative z-10">
                                            Paso 2: <span className="text-padel-primary">Lugar</span>
                                        </h2>

                                    </motion.div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {COMPLEXES.map((c) => (
                                        <motion.button
                                            key={c.name}
                                            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(204,255,0,0.3)', filter: 'brightness(1.1)' }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setTournamentData({
                                                    ...tournamentData,
                                                    complexName: c.name,
                                                    totalCourts: c.courts,
                                                    courtNames: Array.from({ length: c.courts }, (_, i) => `Pista ${i + 1}`)
                                                });
                                            }}
                                            className={`p-4 rounded-xl border text-left transition-all ${tournamentData.complexName === c.name ? 'border-padel-primary bg-padel-primary/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                                        >
                                            <span className={`block text-lg font-black italic uppercase transition-colors leading-tight mb-1 ${tournamentData.complexName === c.name ? 'text-padel-primary' : 'text-gray-400'}`}>
                                                {c.name.includes('Sun Sol') ? (
                                                    <>
                                                        <span className="block">Sun Sol</span>
                                                        <span className="block text-xs opacity-60 font-bold tracking-tight -mt-1 uppercase">{c.name.replace('Sun Sol ', '')}</span>
                                                    </>
                                                ) : c.name}
                                            </span>
                                            <span className="text-[8px] text-gray-500 font-bold flex items-center gap-1">
                                                <MapPin className="w-2 h-2 text-gray-700" /> {c.courts} canchas
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>

                                {tournamentData.complexName && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white/5 p-2 rounded-xl border border-white/10 space-y-1.5"
                                    >
                                        <div className="flex justify-between items-center px-1">
                                            <h3 className="text-[8px] font-black italic uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                                Canchas ({tournamentData.complexName})
                                            </h3>
                                            <span className="text-[8px] text-padel-primary font-bold italic uppercase">{tournamentData.courtNames.length} seleccionadas</span>
                                        </div>
                                        <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-1.5">
                                            {Array.from({ length: COMPLEXES.find(c => c.name === tournamentData.complexName)?.courts || 0 }).map((_, i) => {
                                                const courtLabel = `Pista ${i + 1}`;
                                                const isSelected = tournamentData.courtNames.includes(courtLabel);
                                                return (
                                                    <motion.button
                                                        key={i}
                                                        whileTap={{ scale: 0.9 }}
                                                        whileHover={{ scale: 1.1, filter: 'brightness(1.2)' }}
                                                        onClick={() => {
                                                            const newNames = isSelected
                                                                ? tournamentData.courtNames.filter(n => n !== courtLabel)
                                                                : [...tournamentData.courtNames, courtLabel].sort((a, b) => {
                                                                    const numA = parseInt(a.split(' ')[1]);
                                                                    const numB = parseInt(b.split(' ')[1]);
                                                                    return numA - numB;
                                                                });
                                                            setTournamentData({ ...tournamentData, courtNames: newNames });
                                                        }}
                                                        className={`py-1.5 rounded-lg text-[9px] font-black italic transition-all border ${isSelected
                                                            ? 'bg-padel-primary border-padel-primary text-black shadow-[0_0_15px_rgba(204,255,0,0.4)]'
                                                            : 'bg-black/40 border-white/10 text-gray-500 hover:border-white/20'
                                                            }`}
                                                    >
                                                        {i + 1}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-1 mb-2 overflow-hidden relative">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className="relative z-10"
                                    >
                                        <h3 className="text-[60px] md:text-[100px] font-black italic text-white/[0.03] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap tracking-tighter leading-none select-none pointer-events-none uppercase">
                                            FORMATO
                                        </h3>
                                        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white relative z-10">
                                            Paso 3: <span className="text-padel-primary">Formato</span>
                                        </h2>


                                    </motion.div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
                                    {[
                                        {
                                            id: TournamentType.AMERICANO_INDIVIDUAL,
                                            title: 'Americano',
                                            description: 'Parejas rotativas, todos juegan con todos. Sistema dinámico.',
                                            icon: (
                                                <svg viewBox="0 0 100 100" className="w-16 h-16 text-padel-primary">
                                                    <path d="M50 20 A30 30 0 1 1 50 80 A30 30 0 1 1 50 20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" />
                                                    <circle cx="50" cy="20" r="5" fill="currentColor" />
                                                    <circle cx="80" cy="50" r="5" fill="currentColor" />
                                                    <circle cx="50" cy="80" r="5" fill="currentColor" />
                                                    <circle cx="20" cy="50" r="5" fill="currentColor" />
                                                </svg>
                                            ),
                                            options: ['12 Pt', '16 Pt', '24 Pt']
                                        },
                                        {
                                            id: TournamentType.AMERICANO_DUPLA,
                                            title: 'Dupla Fija',
                                            description: 'Parejas estables, sistema de puntuación acumulada.',
                                            icon: (
                                                <svg viewBox="0 0 100 100" className="w-16 h-16 text-padel-primary">
                                                    <rect x="30" y="30" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" />
                                                    <rect x="55" y="30" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" />
                                                    <path d="M40 55 L40 75 M62 55 L62 75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                            ),
                                            options: ['12 Pt', '16 Pt', '24 Pt']
                                        },
                                        {
                                            id: TournamentType.KNOCKOUT,
                                            title: 'Eliminatorio',
                                            description: 'Llaves de eliminación directa. El perdedor queda fuera.',
                                            icon: (
                                                <svg viewBox="0 0 100 100" className="w-16 h-16 text-padel-primary">
                                                    <path d="M20 30 H40 V50 H20 M20 70 H40 V50 M40 50 H60 V50 M60 40 V60 M60 50 H80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )
                                        },
                                        {
                                            id: TournamentType.ROUND_ROBIN,
                                            title: 'Round Robin',
                                            description: 'Fase de grupos, todos contra todos. Clasifica el mejor.',
                                            icon: (
                                                <svg viewBox="0 0 100 100" className="w-16 h-16 text-padel-primary">
                                                    <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                                                    <path d="M25 25 L75 75 M25 75 L75 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                            )
                                        },
                                        {
                                            id: TournamentType.CRUZADO,
                                            title: 'Cruzado',
                                            description: 'Grupo A vs Grupo B. 2 juegos por equipo → los mejores avanzan a cuartos.',
                                            badge: '⚡ NUEVO',
                                            icon: (
                                                <svg viewBox="0 0 100 100" className="w-16 h-16 text-padel-primary">
                                                    {/* Group A left */}
                                                    <circle cx="20" cy="30" r="6" fill="currentColor" opacity="0.9" />
                                                    <circle cx="20" cy="50" r="6" fill="currentColor" opacity="0.9" />
                                                    <circle cx="20" cy="70" r="6" fill="currentColor" opacity="0.9" />
                                                    {/* Group B right */}
                                                    <circle cx="80" cy="30" r="6" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.9" />
                                                    <circle cx="80" cy="50" r="6" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.9" />
                                                    <circle cx="80" cy="70" r="6" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.9" />
                                                    {/* Cross arrows */}
                                                    <path d="M26 30 L74 70 M26 50 L74 50 M26 70 L74 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                                                    {/* QF node center */}
                                                    <rect x="43" y="43" width="14" height="14" rx="3" fill="currentColor" opacity="0.3" />
                                                </svg>
                                            )
                                        },
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => {
                                                setTournamentData({ ...tournamentData, type: type.id as any });
                                                if ([TournamentType.ROUND_ROBIN, TournamentType.KNOCKOUT, TournamentType.CRUZADO].includes(type.id as any)) setStep(4);
                                                else setStep(5);
                                            }}
                                            className={`group relative overflow-hidden rounded-3xl border-2 transition-all p-6 flex items-center justify-between gap-4 ${tournamentData.type === type.id
                                                ? 'border-padel-primary bg-padel-primary/5 shadow-[0_0_30px_rgba(204,255,0,0.1)]'
                                                : 'border-white/5 bg-white/5 hover:border-white/10 hover:scale-[1.02]'
                                                }`}
                                        >
                                            <div className="flex-1 text-left space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <h3 className={`text-2xl font-black italic uppercase tracking-tighter ${tournamentData.type === type.id ? 'text-white' : 'text-gray-400'}`}>
                                                        {type.title}
                                                    </h3>
                                                    {'badge' in type && type.badge && (
                                                        <span className="text-[8px] font-black uppercase bg-[#ccff00] text-black px-2 py-0.5 rounded-full tracking-widest animate-pulse">
                                                            {type.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-[11px] font-medium leading-tight max-w-[200px] ${tournamentData.type === type.id ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {type.description}
                                                </p>

                                                {'options' in type && type.options && tournamentData.type === type.id && (
                                                    <div className="flex gap-1.5 mt-3">
                                                        {type.options.map((opt: string) => (
                                                            <span key={opt} className="bg-padel-primary text-black text-[9px] font-black uppercase px-3 py-1 rounded-full italic tracking-tighter shadow-lg">
                                                                {opt}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`transition-all duration-500 ${tournamentData.type === type.id ? 'scale-125 opacity-100' : 'opacity-40 group-hover:opacity-70 group-hover:scale-110'}`}>
                                                {type.icon}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* ── Selector de tamaño de grupo (ROUND_ROBIN / CRUZADO) ── */}
                                {(tournamentData.type === TournamentType.ROUND_ROBIN || tournamentData.type === TournamentType.CRUZADO) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 12, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className="mt-4 p-5 bg-[#ccff00]/5 border border-[#ccff00]/20 rounded-[2rem] space-y-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse shadow-[0_0_8px_#ccff00]" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#ccff00]">
                                                Equipos por Grupo
                                            </h4>
                                            <div className="flex-1 h-px bg-[#ccff00]/10" />
                                            <span className="text-[9px] font-bold text-gray-500 uppercase italic">
                                                {tournamentData.type === TournamentType.CRUZADO ? 'Grupo A y Grupo B' : 'Por cada grupo'}
                                            </span>
                                        </div>

                                        {/* Buttons 3 / 4 */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {[3, 4].map(size => {
                                                const isSelected = tournamentData.groupSize === size;
                                                // Preview calculation
                                                const total = tournamentData.teams.length;
                                                let preview = '';
                                                if (tournamentData.type === TournamentType.ROUND_ROBIN) {
                                                    const gamesPerTeam = (size === 4 && tournamentData.isReduced && isSelected) ? 2 : (size - 1);
                                                    const complete = Math.floor(total / size);
                                                    const rem = total % size;
                                                    if (complete === 0) {
                                                        preview = total >= 2 ? `1 grupo de ${total} (${gamesPerTeam} jueg./eq)` : 'Añade equipos';
                                                    } else if (rem === 0) {
                                                        preview = `${complete} grupo${complete > 1 ? 's' : ''} de ${size} (${gamesPerTeam} jueg./eq)`;
                                                    } else {
                                                        preview = `${complete} grupo${complete > 1 ? 's' : ''} de ${size} + ${rem} extra`;
                                                    }
                                                } else {
                                                    // CRUZADO: 2 grupos
                                                    const half = Math.ceil(total / 2);
                                                    preview = `Grupo A: ${half} · Grupo B: ${total - half}`;
                                                }
                                                return (
                                                    <button
                                                        key={size}
                                                        onClick={() => setTournamentData({ ...tournamentData, groupSize: size, isReduced: size === 4 ? tournamentData.isReduced : false })}
                                                        className={`group relative overflow-hidden rounded-[1.5rem] border-2 py-4 px-5 text-left transition-all ${isSelected
                                                            ? 'border-[#ccff00] bg-[#ccff00]/10 shadow-[0_0_20px_rgba(204,255,0,0.15)]'
                                                            : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                                                            }`}
                                                    >
                                                        <div className={`text-3xl font-black italic tracking-tighter leading-none ${isSelected ? 'text-[#ccff00]' : 'text-gray-500'}`}>
                                                            {size}
                                                        </div>
                                                        <div className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                                                            parejas / grupo
                                                        </div>
                                                        <div className={`text-[8px] font-bold mt-2 italic leading-tight ${isSelected ? 'text-[#ccff00]/70' : 'text-gray-700'}`}>
                                                            {preview}
                                                        </div>
                                                        {isSelected && (
                                                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#ccff00] flex items-center justify-center">
                                                                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Advancement Shortcut for Round Robin */}
                                        {
                                            tournamentData.type === TournamentType.ROUND_ROBIN && (
                                                <div className="flex flex-col gap-2 pt-2">
                                                    <div className="flex items-center gap-2">
                                                        <Trophy className="w-3 h-3 text-[#ccff00]" />
                                                        <span className="text-[9px] font-black uppercase text-gray-500">Configuración de Avance</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {[
                                                            { count: 1, label: 'Solo 1º' },
                                                            { count: 2, label: '1º y 2º' }
                                                        ].map((cfg) => (
                                                            <div key={cfg.count} className="relative">
                                                                <button
                                                                    onClick={() => setTournamentData({ ...tournamentData, advanceCount: cfg.count })}
                                                                    className={`w-full py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-tighter transition-all ${tournamentData.advanceCount === cfg.count
                                                                        ? 'bg-[#ccff00] border-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)] scale-[1.02]'
                                                                        : 'bg-white/5 border-white/10 text-gray-600 hover:border-white/20'
                                                                        }`}
                                                                >
                                                                    {cfg.label} Avanza{cfg.count > 1 ? 'n' : ''}
                                                                </button>
                                                                {tournamentData.advanceCount === cfg.count && (
                                                                    <motion.div layoutId="adv-check" className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#ccff00] border border-black flex items-center justify-center">
                                                                        <svg className="w-2 h-2 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    </motion.div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="text-[7px] text-gray-600 font-bold uppercase italic leading-none px-1">
                                                        {tournamentData.advanceCount === 2
                                                            ? '✓ Los dos mejores de cada grupo pasan a Semifinales (1ºA vs 2ºB / 1ºB vs 2ºA)'
                                                            : '✓ Solo el mejor de cada grupo pasa a la Final'}
                                                    </p>

                                                    {/* Rapid Classification Toggle for Groups of 4 */}
                                                    {tournamentData.groupSize === 4 && (
                                                        <div className="pt-2 border-t border-white/5 mt-1">
                                                            <button
                                                                onClick={() => setTournamentData(prev => ({ ...prev, isReduced: !prev.isReduced }))}
                                                                className={`w-full py-2.5 rounded-xl border flex items-center justify-between px-4 transition-all ${tournamentData.isReduced
                                                                    ? 'bg-orange-500/20 border-orange-500 text-orange-200'
                                                                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <RefreshCw className={`w-3 h-3 ${tournamentData.isReduced ? 'animate-spin-slow' : ''}`} />
                                                                    <div className="text-left">
                                                                        <span className="block text-[9px] font-black uppercase tracking-tighter">Clasificación Rápida</span>
                                                                        <span className="block text-[7px] font-bold uppercase opacity-60">2 juegos por equipo (Suman 11 total)</span>
                                                                    </div>
                                                                </div>
                                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tournamentData.isReduced ? 'border-orange-500 bg-orange-500' : 'border-white/20'}`}>
                                                                    {tournamentData.isReduced && <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                                                </div>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        }

                                        {/* Visual group preview */}
                                        {
                                            tournamentData.teams.length >= 2 && (
                                                <div className="pt-1 space-y-2">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-600">
                                                        Vista previa de grupos
                                                    </p>
                                                    {(() => {
                                                        const total = tournamentData.teams.length;
                                                        const size = tournamentData.groupSize || 3;

                                                        if (tournamentData.type === TournamentType.CRUZADO) {
                                                            const half = Math.ceil(total / 2);
                                                            const gA = tournamentData.teams.slice(0, half);
                                                            const gB = tournamentData.teams.slice(half);
                                                            return ['A', 'B'].map((gName, gi) => {
                                                                const gTeams = gi === 0 ? gA : gB;
                                                                return (
                                                                    <div key={gName} className="flex items-center gap-2 flex-wrap">
                                                                        <span className="text-[9px] font-black text-[#ccff00] w-14 shrink-0">Grupo {gName}</span>
                                                                        {gTeams.map((t: any, ti: number) => (
                                                                            <span key={ti} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-bold text-gray-400">
                                                                                {t.p1?.name || `E${ti + 1}`}{t.p2?.name ? ` / ${t.p2.name}` : ''}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                );
                                                            });
                                                        } else {
                                                            const numComplete = Math.floor(total / size);
                                                            const numGroups = Math.max(1, numComplete + (total % size > 0 && numComplete === 0 ? 1 : 0));
                                                            const groupNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
                                                            const groups: any[][] = Array.from({ length: numGroups }, () => []);
                                                            let pool = [...tournamentData.teams];
                                                            for (let g = 0; g < numGroups; g++) {
                                                                const toAdd = g < numGroups - 1 ? size : pool.length;
                                                                for (let k = 0; k < toAdd && pool.length > 0; k++) groups[g].push(pool.shift());
                                                            }
                                                            return groups.map((gTeams, gIdx) => (
                                                                <div key={gIdx} className="flex items-center gap-2 flex-wrap">
                                                                    <span className="text-[9px] font-black text-[#ccff00] w-14 shrink-0">Grupo {groupNames[gIdx]}</span>
                                                                    {gTeams.map((t: any, ti: number) => (
                                                                        <span key={ti} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-bold text-gray-400">
                                                                            {t.p1?.name || `E${ti + 1}`}{t.p2?.name ? ` / ${t.p2.name}` : ''}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ));
                                                        }
                                                    })()}
                                                </div>
                                            )
                                        }
                                    </motion.div>
                                )}

                                <div className="h-4 pb-4" />
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-1 mb-4 overflow-hidden relative">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className="relative z-10"
                                    >
                                        <h3 className="text-[60px] md:text-[100px] font-black italic text-white/[0.03] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap tracking-tighter leading-none select-none pointer-events-none uppercase">
                                            REGLAMENTO
                                        </h3>
                                        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white relative z-10">
                                            Paso 4: <span className="text-padel-primary">Configuración Técnica</span>
                                        </h2>
                                    </motion.div>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Trophy className="w-32 h-32 text-padel-primary" />
                                    </div>

                                    <div className="relative z-10 flex items-center gap-4 border-b border-white/5 pb-6">
                                        <div className="p-3 bg-padel-primary/20 rounded-xl">
                                            <Info className="text-padel-primary w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black italic uppercase text-white tracking-tighter">Panel de Dirección de Competición</h4>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Configura los reglamentos técnicos del Round Robin</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                        {/* Group Size */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Tamaño de Grupos</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[3, 4].map(size => (
                                                    <button
                                                        key={size}
                                                        onClick={() => setTournamentData({ ...tournamentData, groupSize: size })}
                                                        className={`py-4 rounded-xl font-black italic text-sm transition-all border ${tournamentData.groupSize === size
                                                            ? 'bg-padel-primary border-padel-primary text-black'
                                                            : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}
                                                    >
                                                        {size} PAREJAS
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[8px] text-gray-600 font-bold uppercase leading-tight italic px-1">
                                                * El sistema conformará grupos de 3 o 4 parejas.
                                            </p>
                                        </div>

                                        {/* Advancement Rule */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Clasificación</label>
                                            <div className="grid grid-cols-1 gap-2">
                                                {[
                                                    { count: 1, label: 'Solo 1º de Grupo', desc: 'Solo el ganador avanza' },
                                                    { count: 2, label: '1º y 2º de Grupo', desc: 'Los dos mejores avanzan' },
                                                ].map(rule => (
                                                    <button
                                                        key={rule.count}
                                                        onClick={() => setTournamentData({ ...tournamentData, advanceCount: rule.count })}
                                                        className={`p-4 rounded-xl text-left transition-all border ${tournamentData.advanceCount === rule.count
                                                            ? 'bg-padel-primary border-padel-primary text-black shadow-lg scale-[1.02]'
                                                            : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}
                                                    >
                                                        <span className="block font-black italic text-xs uppercase mb-1">{rule.label}</span>
                                                        <span className={`block text-[8px] font-bold uppercase opacity-60 ${tournamentData.advanceCount === rule.count ? 'text-black' : 'text-gray-600'}`}>
                                                            {rule.desc}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[8px] text-gray-600 font-bold uppercase leading-tight italic px-1">
                                                * Determina cuántos equipos avanzan por grupo a eliminatorias.
                                            </p>

                                            {/* Rapid mode toggle duplicated in Step 4 for accessibility */}
                                            {tournamentData.groupSize === 4 && (
                                                <div className="pt-2">
                                                    <button
                                                        onClick={() => setTournamentData(prev => ({ ...prev, isReduced: !prev.isReduced }))}
                                                        className={`w-full p-4 rounded-xl border flex flex-col gap-1 transition-all ${tournamentData.isReduced
                                                            ? 'bg-orange-500 border-orange-500 text-black shadow-lg scale-[1.02]'
                                                            : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between w-full">
                                                            <span className="font-black italic text-xs uppercase">Clasificación Rápida</span>
                                                            <RefreshCw className={`w-3 h-3 ${tournamentData.isReduced ? 'animate-spin-slow' : ''}`} />
                                                        </div>
                                                        <span className={`text-[8px] font-bold uppercase ${tournamentData.isReduced ? 'text-black opacity-80' : 'text-gray-600'}`}>
                                                            Reduce a 2 juegos por equipo (Total 11)
                                                        </span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Match Format */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Formato de Partido</label>
                                            <div className="grid grid-cols-1 gap-2">
                                                {[
                                                    { id: 'ONE_SET_6', label: '1 Set (a 6 juegos)' },
                                                    { id: 'ONE_SET_9', label: '1 Set (a 9 juegos)' },
                                                    { id: 'TWO_SHORT_SETS', label: '2 Sets Cortos (a 4) + MTB' },
                                                    { id: 'TWO_NORMAL_SETS', label: '2 Sets Normales (a 6) + MTB' },
                                                ].map(format => (
                                                    <button
                                                        key={format.id}
                                                        onClick={() => setTournamentData({ ...tournamentData, matchFormat: format.id as any })}
                                                        className={`py-3 px-4 rounded-xl font-bold italic text-[10px] text-left transition-all border uppercase tracking-wider ${tournamentData.matchFormat === format.id
                                                            ? 'bg-padel-primary border-padel-primary text-black'
                                                            : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}
                                                    >
                                                        {format.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Tie-break Type */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Desempate (Tie-break)</label>
                                            <div className="grid grid-cols-1 gap-2">
                                                {[
                                                    { id: 'TB', label: 'Tie-break (7)', desc: 'Desempate a 7 puntos' },
                                                    { id: 'STB', label: 'Super Tie-break (10)', desc: 'Desempate a 10 puntos' },
                                                ].map(tb => (
                                                    <button
                                                        key={tb.id}
                                                        onClick={() => setTournamentData({ ...tournamentData, tieBreakType: tb.id as any })}
                                                        className={`p-4 rounded-xl text-left transition-all border ${tournamentData.tieBreakType === tb.id
                                                            ? 'bg-padel-primary border-padel-primary text-black shadow-lg scale-[1.02]'
                                                            : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}
                                                    >
                                                        <span className="block font-black italic text-xs uppercase mb-1">{tb.label}</span>
                                                        <span className={`block text-[8px] font-bold uppercase opacity-60 ${tournamentData.tieBreakType === tb.id ? 'text-black' : 'text-gray-600'}`}>
                                                            {tb.desc}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Scoring System */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Sistema de Puntuación</label>
                                            <div className="grid grid-cols-1 gap-2">
                                                {[
                                                    { id: 'GOLDEN_POINT', label: 'Punto de Oro', desc: 'Sin ventaja (al primero en ganar)' },
                                                    { id: 'TRADITIONAL', label: 'Con Ventaja (Deuce)', desc: 'Sistema clásico (V-40, etc.)' },
                                                ].map(sys => (
                                                    <button
                                                        key={sys.id}
                                                        onClick={() => setTournamentData({ ...tournamentData, scoringSystem: sys.id as any })}
                                                        className={`p-4 rounded-xl text-left transition-all border ${tournamentData.scoringSystem === sys.id
                                                            ? 'bg-padel-primary border-padel-primary text-black shadow-lg scale-[1.02]'
                                                            : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}
                                                    >
                                                        <span className="block font-black italic text-xs uppercase mb-1">{sys.label}</span>
                                                        <span className={`block text-[8px] font-bold uppercase opacity-60 ${tournamentData.scoringSystem === sys.id ? 'text-black' : 'text-gray-600'}`}>
                                                            {sys.desc}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {step === 5 && (
                            <motion.div
                                key="step5"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-2"
                            >
                                <div className="text-center space-y-0.5 mb-2 overflow-hidden relative">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className="relative z-10"
                                    >
                                        <h3 className="text-[50px] md:text-[80px] font-black italic text-white/[0.03] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap tracking-tighter leading-none select-none pointer-events-none uppercase">
                                            HORARIOS
                                        </h3>
                                        <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-white relative z-10">
                                            Paso 5: <span className="text-padel-primary">Fecha y Horarios</span>
                                        </h2>
                                    </motion.div>
                                </div>

                                <div className="glass p-2 md:p-4">
                                    <div className="flex flex-col md:flex-row gap-3 items-start">
                                        {/* Calendar Column */}
                                        <div className="w-full md:w-1/2 space-y-2">
                                            <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest pl-1 flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-padel-primary" /> Fecha
                                            </label>
                                            <div className="bg-black/40 border border-white/10 rounded-[1.25rem] p-2.5 space-y-1.5">
                                                <div className="flex justify-between items-center px-1">
                                                    <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))} className="p-0.5 hover:bg-white/5 rounded-full transition-colors"><ChevronLeft className="w-3.5 h-3.5 text-padel-primary" /></button>
                                                    <h3 className="text-[9px] font-black italic uppercase text-white tracking-widest">{new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(viewDate)}</h3>
                                                    <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))} className="p-0.5 hover:bg-white/5 rounded-full transition-colors"><ChevronRight className="w-3.5 h-3.5 text-padel-primary" /></button>
                                                </div>
                                                <div className="grid grid-cols-7 gap-0.5">
                                                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (<div key={i} className="text-center text-[6px] font-black text-gray-700 py-0.5">{d}</div>))}
                                                    {getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth()).map((date, i) => {
                                                        if (!date) return <div key={i} />;
                                                        const dateString = date.toISOString().split('T')[0];
                                                        const isSelected = tournamentData.startDate === dateString;
                                                        return (
                                                            <button
                                                                key={dateString}
                                                                onClick={() => setTournamentData({ ...tournamentData, startDate: dateString })}
                                                                className={`aspect-square rounded-md text-[8px] font-black transition-all ${isSelected ? 'bg-padel-primary text-black scale-105 shadow-[0_0_8px_rgba(204,255,0,0.3)]' : 'text-gray-400 hover:bg-white/5'}`}
                                                            >
                                                                {date.getDate()}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Name & Times Column */}
                                        <div className="w-full md:w-1/2 space-y-3">
                                            <div className="space-y-1.5 opacity-50 pointer-events-none">
                                                <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest pl-1 flex items-center gap-2">
                                                    <Trophy className="w-3.5 h-3.5 text-padel-primary" /> Nombre (Definido en Paso 1)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={tournamentData.name}
                                                    readOnly
                                                    className="w-full bg-black/20 border border-white/5 rounded-xl p-2.5 text-sm font-black text-white/50 italic tracking-tight uppercase outline-none"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest pl-1 flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5 text-padel-primary" /> Inicio
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={tournamentData.startTime}
                                                        onChange={(e) => setTournamentData({ ...tournamentData, startTime: e.target.value })}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-base font-black text-padel-primary outline-none focus:border-padel-primary transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest pl-1 flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5 text-padel-primary" /> Fin
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={tournamentData.endTime}
                                                        onChange={(e) => setTournamentData({ ...tournamentData, endTime: e.target.value })}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-base font-black text-padel-primary outline-none focus:border-padel-primary transition-colors"
                                                    />
                                                </div>
                                            </div>

                                            <div className="p-2.5 bg-padel-primary/5 border border-padel-primary/20 rounded-xl flex items-center gap-3">
                                                <Info className="w-3.5 h-3.5 text-padel-primary shrink-0" />
                                                <p className="text-[7px] text-gray-500 font-bold uppercase leading-tight italic">
                                                    Partidos automáticos en este rango.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 6 && (
                            <motion.div
                                key="step6"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass p-8 space-y-8"
                            >
                                <div className="text-center space-y-1 mb-4 overflow-hidden relative">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className="relative z-10"
                                    >
                                        <h3 className="text-[60px] md:text-[100px] font-black italic text-white/[0.03] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap tracking-tighter leading-none select-none pointer-events-none uppercase">
                                            CATEGORIA
                                        </h3>
                                        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white relative z-10">
                                            Paso 6: <span className="text-padel-primary">Categoría</span>
                                        </h2>
                                    </motion.div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {LEVEL_CATEGORIES.map((cat) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => {
                                                    setTournamentData({ ...tournamentData, category: cat.id });
                                                }}
                                                className={`p-5 rounded-[1.5rem] border-2 text-center transition-all group flex flex-col items-center gap-2 ${tournamentData.category === cat.id
                                                    ? 'border-padel-primary bg-padel-primary/10 shadow-[0_0_20px_rgba(204,255,0,0.15)]'
                                                    : 'border-white/5 bg-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                <Trophy className={`w-5 h-5 transition-colors ${tournamentData.category === cat.id ? 'text-padel-primary' : 'text-gray-700'}`} />
                                                <span className={`block text-[10px] font-black italic uppercase transition-colors ${tournamentData.category === cat.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                                    {cat.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    {tournamentData.category && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-6 p-6 rounded-[2rem] bg-white/5 border border-white/10 space-y-4"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-full bg-padel-primary/10 flex items-center justify-center">
                                                    <DollarSign className="w-5 h-5 text-padel-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black uppercase italic text-white leading-none">Precio de Inscripción</h4>
                                                    <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">Establece el costo para esta categoría</p>
                                                </div>
                                            </div>

                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={tournamentData.inscriptionCategories?.[0]?.price ?? 0}
                                                    onChange={(e) => {
                                                        const price = parseFloat(e.target.value) || 0;
                                                        const cat = LEVEL_CATEGORIES.find(c => c.id === tournamentData.category);
                                                        setTournamentData({
                                                            ...tournamentData,
                                                            inscriptionCategories: [{
                                                                key: tournamentData.category,
                                                                name: cat?.label || tournamentData.category,
                                                                price: price
                                                            }]
                                                        });
                                                    }}
                                                    placeholder="0.00"
                                                    className="w-full bg-black/40 border-2 border-white/10 rounded-2xl p-4 pl-12 text-white font-bold focus:border-padel-primary transition-all outline-none"
                                                />
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setStep(7)}
                                                className="w-full py-4 mt-2 bg-padel-primary text-black font-black uppercase italic rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(204,255,0,0.2)]"
                                            >
                                                Continuar
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {step === 7 && (
                            <motion.div
                                key="step7"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass p-5 md:p-8 space-y-6 md:space-y-8"
                            >
                                <div className="text-center space-y-1 mb-4 overflow-hidden relative">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className="relative z-10"
                                    >
                                        <h3 className="text-[60px] md:text-[100px] font-black italic text-white/[0.03] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap tracking-tighter leading-none select-none pointer-events-none uppercase">
                                            PAREJAS
                                        </h3>
                                        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white relative z-10">
                                            Paso 7: <span className="text-padel-primary">Parejas</span>
                                        </h2>
                                    </motion.div>
                                </div>

                                {/* ── Selector de Grupos para Round Robin / Cruzado ─────────── */}
                                {(tournamentData.type === TournamentType.ROUND_ROBIN || tournamentData.type === TournamentType.CRUZADO) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 bg-[#ccff00]/5 border border-[#ccff00]/20 rounded-[1.75rem] space-y-4"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse shadow-[0_0_8px_#ccff00]" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#ccff00]">
                                                Equipos por Grupo
                                            </h4>
                                            <div className="flex-1 h-px bg-[#ccff00]/10" />
                                            <span className="text-[9px] font-bold text-gray-500 uppercase italic">
                                                {(() => {
                                                    const total = tournamentData.teams.length;
                                                    const size = tournamentData.groupSize || 3;
                                                    if (total < size) return `Añade ${size - total} pareja${size - total > 1 ? 's' : ''} más`;
                                                    const numGroups = Math.max(1, Math.floor(total / size));
                                                    return `${numGroups} grupo${numGroups > 1 ? 's' : ''} · ${total} parejas`;
                                                })()}
                                            </span>
                                        </div>

                                        {/* Botones 3 / 4 */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {[3, 4].map(size => {
                                                const isSelected = tournamentData.groupSize === size;
                                                const total = tournamentData.teams.length;
                                                const numGroups = total >= size ? Math.max(1, Math.floor(total / size)) : (total >= 2 ? 1 : 0);
                                                const matchesPerGroup = size * (size - 1) / 2;
                                                const advancingTeams = numGroups > 0 ? numGroups * 2 : 0;
                                                const nextRound = numGroups === 2 ? 'Cuartos de Final' : numGroups > 2 ? 'Semifinales' : '—';

                                                return (
                                                    <button
                                                        key={size}
                                                        onClick={() => setTournamentData({ ...tournamentData, groupSize: size })}
                                                        className={`group relative overflow-hidden rounded-[1.25rem] border-2 py-4 px-5 text-left transition-all ${isSelected
                                                            ? 'border-[#ccff00] bg-[#ccff00]/10 shadow-[0_0_20px_rgba(204,255,0,0.15)]'
                                                            : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                                                            }`}
                                                    >
                                                        <div className={`text-3xl font-black italic tracking-tighter leading-none ${isSelected ? 'text-[#ccff00]' : 'text-gray-500'}`}>
                                                            {size}
                                                        </div>
                                                        <div className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                                                            parejas / grupo
                                                        </div>
                                                        <div className={`text-[8px] font-bold mt-2 italic leading-tight ${isSelected ? 'text-[#ccff00]/70' : 'text-gray-700'}`}>
                                                            {matchesPerGroup} partidos / grupo
                                                        </div>
                                                        {numGroups > 0 && (
                                                            <div className={`text-[7px] font-bold mt-1 uppercase ${isSelected ? 'text-white/50' : 'text-gray-700'}`}>
                                                                Top 2 → {nextRound}
                                                            </div>
                                                        )}
                                                        {isSelected && (
                                                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#ccff00] flex items-center justify-center">
                                                                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Vista previa de distribución de grupos */}
                                        {tournamentData.teams.length >= 2 && (() => {
                                            const total = tournamentData.teams.length;
                                            const size = tournamentData.groupSize || 3;
                                            const numGroups = Math.max(1, Math.floor(total / size));
                                            const groupNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
                                            const groups: any[][] = Array.from({ length: numGroups }, () => []);
                                            let pool = [...tournamentData.teams];
                                            for (let g = 0; g < numGroups; g++) {
                                                const toAdd = g < numGroups - 1 ? size : pool.length;
                                                for (let k = 0; k < toAdd && pool.length > 0; k++) groups[g].push(pool.shift());
                                            }
                                            const nextRound = numGroups === 2 ? 'Cuartos de Final' : 'Semifinales';
                                            return (
                                                <div className="pt-1 space-y-2 border-t border-[#ccff00]/10">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-gray-600">
                                                            Vista previa de grupos
                                                        </p>
                                                        <p className="text-[7px] font-bold italic text-[#ccff00]/50 uppercase">
                                                            Los 2 mejores de cada grupo → {nextRound}
                                                        </p>
                                                    </div>
                                                    {groups.map((gTeams, gIdx) => (
                                                        <div key={gIdx} className="flex items-start gap-2 flex-wrap">
                                                            <span className="text-[9px] font-black text-[#ccff00] w-14 shrink-0 pt-0.5">
                                                                Grupo {groupNames[gIdx]}
                                                            </span>
                                                            <div className="flex flex-wrap gap-1">
                                                                {gTeams.map((t: any, ti: number) => (
                                                                    <span key={ti} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-bold text-gray-400">
                                                                        {t.p1?.name || `Pareja ${groups.slice(0, gIdx).reduce((acc, g) => acc + g.length, 0) + ti + 1}`}{t.p2?.name ? ` / ${t.p2.name}` : ''}
                                                                    </span>
                                                                ))}
                                                                {/* Advance badge */}
                                                                <span className="px-2 py-0.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 text-[7px] font-black text-[#ccff00] uppercase italic">
                                                                    Top 2 avanzan
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </motion.div>
                                )}

                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-padel-primary/20 rounded-xl">
                                            <Users className="text-padel-primary w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <h3 className="text-xl md:text-2xl font-black italic tracking-tight uppercase text-white leading-tight">
                                                {tournamentData.name || 'Sin nombre'}
                                            </h3>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 pl-1">Parejas Registradas: {tournamentData.teams.length}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 gap-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500">Cantidad:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="64"
                                                value={tournamentData.teams.length}
                                                onChange={(e) => {
                                                    const count = parseInt(e.target.value) || 0;
                                                    const currentCount = tournamentData.teams.length;
                                                    if (count > currentCount) {
                                                        const extra = Array.from({ length: count - currentCount }).map(() => ({
                                                            id: Date.now() + Math.random(),
                                                            p1: { id: '', name: '', lastName: '', age: '', photo: '', phone: '' },
                                                            p2: { id: '', name: '', lastName: '', age: '', photo: '', phone: '' }
                                                        }));
                                                        setTournamentData({ ...tournamentData, teams: [...tournamentData.teams, ...extra] });
                                                    } else if (count < currentCount && count > 0) {
                                                        setTournamentData({ ...tournamentData, teams: tournamentData.teams.slice(0, count) });
                                                    }
                                                }}
                                                className="bg-transparent text-padel-primary font-black w-12 text-center outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={addTeam}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-padel-primary text-black px-4 py-3 rounded-xl hover:scale-105 transition-all font-black text-xs uppercase"
                                        >
                                            <Plus className="w-4 h-4" /> Añadir 1
                                        </button>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    {tournamentData.teams.length === 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex flex-col items-center justify-center py-16 gap-4 rounded-[2rem] border-2 border-dashed border-white/10"
                                        >
                                            <Users className="w-14 h-14 text-white/10" />
                                            <div className="text-center space-y-1">
                                                <p className="text-sm font-black uppercase italic text-gray-500 tracking-tighter">Sin parejas registradas</p>
                                                <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">Usa el botón «Añadir 1» o ingresa la cantidad arriba</p>
                                            </div>
                                            <button
                                                onClick={addTeam}
                                                className="flex items-center gap-2 bg-padel-primary text-black px-6 py-3 rounded-xl font-black text-xs uppercase italic tracking-tighter hover:scale-105 transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)]"
                                            >
                                                <Plus className="w-4 h-4" /> Añadir primera pareja
                                            </button>
                                        </motion.div>
                                    ) : (
                                        tournamentData.teams.map((team, idx) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                key={team.id}
                                                className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <span className="bg-padel-primary text-black font-black px-4 py-1 rounded-full text-[10px] uppercase italic tracking-tighter">
                                                            Pareja {idx + 1}
                                                        </span>

                                                    </div>
                                                    <button
                                                        onClick={() => removeTeam(team.id)}
                                                        className="text-red-500/50 hover:text-red-500 transition-colors p-2"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-8">
                                                    {[1, 2].map((pNum) => {
                                                        const pKey = `p${pNum}` as 'p1' | 'p2';
                                                        const player = team[pKey];
                                                        const playerIndex = idx * 2 + pNum;

                                                        return (
                                                            <div key={pKey} className="space-y-4">
                                                                <div className="flex items-center justify-between gap-4 mb-2">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="relative group">
                                                                            <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-padel-primary/50 text-gray-500 group-hover:text-padel-primary">
                                                                                {player.photo ? (
                                                                                    <img src={player.photo} alt="Profile" className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <Camera className="w-6 h-6" />
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">
                                                                                Jugador <span className="text-padel-primary">{playerIndex}</span>
                                                                            </p>
                                                                            <p className="text-padel-primary/60 font-black italic tracking-tighter leading-none text-[8px] uppercase">ID #{String(playerIndex).padStart(4, '0')}</p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Selector de jugadores desde la base */}
                                                                    <button
                                                                        onClick={() => openPlayerSelector(team.id, pKey)}
                                                                        className="bg-padel-primary/10 hover:bg-padel-primary/20 border border-padel-primary/20 rounded-lg px-3 py-1.5 text-[10px] uppercase font-black text-padel-primary transition-all flex items-center gap-2 tracking-tighter italic group/btn"
                                                                    >
                                                                        BUSCAR JUGADOR <ChevronDown className="w-3 h-3 group-hover/btn:translate-y-0.5 transition-transform" />
                                                                    </button>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[8px] uppercase text-gray-500 font-black">Nombre</label>
                                                                        <input
                                                                            type="text"
                                                                            placeholder={`Ej. Jugador ${playerIndex}`}
                                                                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-padel-primary w-full placeholder:text-gray-700 font-bold"
                                                                            value={player.name}
                                                                            onChange={(e) => {
                                                                                updateTeamMember(team.id, pKey, 'id', '');
                                                                                updateTeamMember(team.id, pKey, 'name', e.target.value);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[8px] uppercase text-gray-500 font-black">Apellido</label>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Ej. Pérez"
                                                                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-padel-primary w-full placeholder:text-gray-700 font-bold"
                                                                            value={player.lastName}
                                                                            onChange={(e) => updateTeamMember(team.id, pKey, 'lastName', e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )))
                                    }
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>



            {/* Selector de jugadores desde la base */}
            <AnimatePresence>
                {isPlayerModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#111] w-full max-w-xl rounded-[2.5rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-xl font-black italic uppercase text-white tracking-widest leading-none">Mi Base de Jugadores</h3>
                                <button onClick={() => setIsPlayerModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="p-8 space-y-8">
                                <div className="relative">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre o apellido..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-padel-primary transition-all"
                                        value={playerSearchQuery}
                                        onChange={(e) => setPlayerSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {availableParticipants
                                        .filter(p => (p.name + ' ' + (p.lastName || '')).toLowerCase().includes(playerSearchQuery.toLowerCase()))
                                        .map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    if (selectorContext) {
                                                        const { teamId, playerKey } = selectorContext;
                                                        updateTeamMember(teamId, playerKey, 'id', p.id);
                                                        updateTeamMember(teamId, playerKey, 'name', p.name);
                                                        updateTeamMember(teamId, playerKey, 'lastName', p.lastName || '');
                                                        if (p.photo) updateTeamMember(teamId, playerKey, 'photo', p.photo);
                                                        if (p.phone) updateTeamMember(teamId, playerKey, 'phone', p.phone);
                                                        setIsPlayerModalOpen(false);
                                                    }
                                                }}
                                                className="w-full flex items-center justify-between bg-white/5 hover:bg-padel-primary/10 border border-white/5 hover:border-padel-primary/50 p-4 rounded-2xl transition-all group"
                                            >
                                                <div className="flex items-center gap-3 text-left">
                                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-600 uppercase italic">P</div>
                                                    <div>
                                                        <p className="text-sm font-black italic text-white uppercase">{p.name} {p.lastName}</p>
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase">{p.category || 'Sin nivel'}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-padel-primary transition-colors" />
                                            </button>
                                        ))
                                    }
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
