'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Calendar,
    Clock,
    Users,
    Layout,
    ChevronRight,
    ChevronLeft,
    Plus,
    Trash2,
    Sparkles,
    Search,
    CheckCircle2,
    AlertCircle,
    GanttChart,
    Layers,
    Settings,
    X,
    UserPlus,
    Share2,
    Database
} from 'lucide-react';
import { TournamentType, TournamentCategory, MatchStatus } from '@/types/tournament';
import { MasterScheduleEngine, MasterScheduleConfig, CategoryConfig } from '@/services/MasterScheduleEngine';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

// Colores fijos por formato (icono siempre a color)
const FORMAT_COLORS = {
    AMERICANO: '#ccff00',   // padel primary
    DUPLA_FIJA: '#22d3ee',  // cyan
    ROUND_ROBIN: '#818cf8', // indigo
    ELIMINACION_DIRECTA: '#fb923c', // orange
    COMBINADO: '#a78bfa',  // violet
} as const;

// Iconos alusivos por formato — siempre a color
const FormatIcons = {
    AMERICANO: ({ className = 'w-5 h-5', color = FORMAT_COLORS.AMERICANO }: { className?: string; color?: string }) => (
        <svg className={className} style={{ color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 1.5">
            <circle cx="12" cy="12" r="7" strokeDasharray="3 2" />
            <circle cx="12" cy="5" r="1.8" fill="currentColor" stroke="none" />
            <circle cx="19" cy="12" r="1.8" fill="currentColor" stroke="none" />
            <circle cx="12" cy="19" r="1.8" fill="currentColor" stroke="none" />
            <circle cx="5" cy="12" r="1.8" fill="currentColor" stroke="none" />
            <line x1="12" y1="12" x2="12" y2="6.8" strokeDasharray="1 1" />
            <line x1="12" y1="12" x2="17.2" y2="12" strokeDasharray="1 1" />
            <line x1="12" y1="12" x2="12" y2="17.2" strokeDasharray="1 1" />
            <line x1="12" y1="12" x2="6.8" y2="12" strokeDasharray="1 1" />
        </svg>
    ),
    DUPLA_FIJA: ({ className = 'w-5 h-5', color = FORMAT_COLORS.DUPLA_FIJA }: { className?: string; color?: string }) => (
        <svg className={className} style={{ color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="6" y="3" width="12" height="7" rx="1" />
            <rect x="6" y="12" width="12" height="7" rx="1" />
            <line x1="11" y1="19" x2="11" y2="22" />
            <line x1="13" y1="19" x2="13" y2="22" />
        </svg>
    ),
    ELIMINATORIO: ({ className = 'w-5 h-5', color = FORMAT_COLORS.ELIMINACION_DIRECTA }: { className?: string; color?: string }) => (
        <svg className={className} style={{ color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
            <path d="M5 6h5v2H5z M14 6h5v2h-5z" />
            <path d="M7.5 8v3 M16.5 8v3" />
            <path d="M7.5 11H12v2H7.5M12 11h4.5v2H12" />
            <path d="M12 13v4" />
            <path d="M9 17h6v2H9z" />
        </svg>
    ),
    ROUND_ROBIN: ({ className = 'w-5 h-5', color = FORMAT_COLORS.ROUND_ROBIN }: { className?: string; color?: string }) => (
        <svg className={className} style={{ color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 1.5">
            <rect x="4" y="4" width="16" height="16" rx="2" strokeDasharray="3 2" />
            <path d="M4 4l16 16M20 4L4 20" strokeDasharray="2 1" />
        </svg>
    ),
    COMBINADO: ({ className = 'w-5 h-5', color = FORMAT_COLORS.COMBINADO }: { className?: string; color?: string }) => (
        <svg className={className} style={{ color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="9" r="4" opacity="0.8" />
            <circle cx="15" cy="15" r="4" opacity="0.8" />
            <path d="M9 13v2m0-2a4 4 0 0 1 4-4m-4 4a4 4 0 0 0 4 4" strokeLinecap="round" />
        </svg>
    ),
};

// Luxury Theme Colors
const COLORS = [
    '#ccff00', // Padel Primary
    '#22d3ee', // Cyan
    '#818cf8', // Indigo
    '#f472b6', // Pink
    '#fb923c', // Orange
    '#4ade80', // Green
    '#a78bfa', // Purple
];

const COMPLEXES = [
    { name: 'Margarita Padel', courts: 6 },
    { name: 'Tibisay', courts: 3 },
    { name: 'Sun Sol Costa Azul', courts: 4 },
    { name: 'Food Kart', courts: 3 },
    { name: 'Elite', courts: 4 },
    { name: 'Bodeguero', courts: 3 },
    { name: 'Sun Sol Pedro Gonzalez', courts: 2 },
    { name: 'Playa el Agua', courts: 3 },
];

// ── Estado inicial limpio del Generador Maestro ─────────────────────────
const INITIAL_EVENT_DATA: MasterScheduleConfig = {
    tournamentName: '',
    complexName: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    dailyStartTime: '07:00',
    dailyEndTime: '22:00',
    numCourts: 3,
    courtNames: Array.from({ length: 3 }, (_, i) => `Pista ${i + 1}`),
    matchDurationMinutes: 70,
    bufferMinutes: 10,
    categories: []
};

// ── Calcula el total de partidos de una categoría considerando grupos ────────
// Fase de grupos: numGroups × gs*(gs-1)/2  (round-robin dentro de cada grupo)
// Fase eliminatoria: los top-2 de cada grupo avanzan, se juegan SF+F
function calcTotalMatchesForCategory(numTeams: number, groupSize?: number): number {
    // Default groupSize = 4 si no está especificado (valor estándar del torneo)
    const gs = (groupSize && groupSize >= 2) ? groupSize : 4;
    const numGroups = Math.max(1, Math.floor(numTeams / gs));
    const groupMatches = numGroups * (gs * (gs - 1)) / 2;

    // Playoff: top-2 por grupo avanzan
    let knockoutTeams = numGroups * 2;
    let knockoutMatches = 0;
    while (knockoutTeams > 1) {
        knockoutMatches += Math.floor(knockoutTeams / 2);
        knockoutTeams = Math.floor(knockoutTeams / 2);
    }

    return groupMatches + (numGroups > 1 ? knockoutMatches : 0);
}


export default function MasterGeneratorPage() {
    const [step, setStep] = useState(1);
    const [eventData, setEventData] = useState<MasterScheduleConfig>({
        ...INITIAL_EVENT_DATA,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    });

    const [generatedMatches, setGeneratedMatches] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);
    const [activeGender, setActiveGender] = useState<'MALE' | 'FEMALE' | 'MIXED' | null>(null);

    // Modal de configuración de categoría
    const [pendingCat, setPendingCat] = useState<{
        gender: 'MALE' | 'FEMALE' | 'MIXED';
        category: TournamentCategory;
    } | null>(null);
    const [pendingNumTeams, setPendingNumTeams] = useState(8);
    const [pendingGolden, setPendingGolden] = useState(false);
    const [pendingSetFormat, setPendingSetFormat] = useState<'TIE_BREAK' | 'SUPER_TIE_BREAK' | 'NO_TIE_BREAK'>('TIE_BREAK');
    const [pendingMatchFormat, setPendingMatchFormat] = useState<'2SETS_STB' | '3SETS'>('2SETS_STB');
    const [pendingGroupSize, setPendingGroupSize] = useState<3 | 4>(4);
    // Tipo de torneo y puntos para Americano
    const [pendingTournamentType, setPendingTournamentType] = useState<'AMERICANO' | 'DUPLA_FIJA' | 'ROUND_ROBIN' | 'ELIMINACION_DIRECTA' | 'COMBINADO'>('AMERICANO');
    const [pendingPointsGoal, setPendingPointsGoal] = useState<number>(16);
    // Formato de partido para Round Robin
    const [pendingRRFormat, setPendingRRFormat] = useState<'ONE_SET_6' | 'ONE_SET_9' | 'TWO_SHORT_SETS' | 'TWO_NORMAL_SETS'>('ONE_SET_6');

    const router = useRouter();
    const { user } = useAuth();

    // ── Reset al montar: siempre empieza en blanco ────────────────────────
    useEffect(() => {
        setStep(1);
        setEventData({
            ...INITIAL_EVENT_DATA,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        });
        setGeneratedMatches([]);
        setIsGenerating(false);
        setIsSaving(false);
        setHasGenerated(false);
        setActiveGender(null);
        setPendingCat(null);
        setPendingNumTeams(8);
        setPendingGolden(false);
        setPendingSetFormat('TIE_BREAK');
        setPendingMatchFormat('2SETS_STB');
        setPendingTournamentType('AMERICANO');
        setPendingPointsGoal(16);
        setPendingRRFormat('ONE_SET_6');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Categories names mapping for display
    const catLabels: Record<string, string> = {
        'MALE': 'Masculino',
        'FEMALE': 'Femenino',
        'MIXED': 'Mixto'
    };

    const catLevelLabels: Record<string, string> = {
        PRIMERA: '1ª Cat.',
        SEGUNDA: '2ª Cat.',
        TERCERA: '3ª Cat.',
        CUARTA: '4ª Cat.',
        QUINTA: '5ª Cat.',
        SEXTA: '6ª Cat.',
        SEPTIMA: '7ª Cat.',
        MAS_45: '+45',
        MAS_50: '+50',
        SUMA_7: 'Suma 7',
        SUMA_8: 'Suma 8',
        SUMA_9: 'Suma 9',
        SUMA_10: 'Suma 10',
        SUMA_11: 'Suma 11',
    };

    const CATEGORY_PRIORITY: Record<string, number> = {
        [TournamentCategory.PRIMERA]: 1,
        [TournamentCategory.SEGUNDA]: 2,
        [TournamentCategory.TERCERA]: 3,
        [TournamentCategory.CUARTA]: 4,
        [TournamentCategory.QUINTA]: 5,
        [TournamentCategory.SEXTA]: 6,
        [TournamentCategory.SEPTIMA]: 7,
        [TournamentCategory.MAS_45]: 8,
        [TournamentCategory.MAS_50]: 9,
        [TournamentCategory.SUMA_7]: 10,
        [TournamentCategory.SUMA_8]: 11,
        [TournamentCategory.SUMA_9]: 12,
        [TournamentCategory.SUMA_10]: 13,
        [TournamentCategory.SUMA_11]: 14,
    };

    const GENDER_PRIORITY: Record<string, number> = {
        'MALE': 1,
        'FEMALE': 2,
        'MIXED': 3
    };

    const sortedSelectedCategories = [...eventData.categories].sort((a, b) => {
        if (a.gender !== b.gender) {
            return (GENDER_PRIORITY[a.gender] || 99) - (GENDER_PRIORITY[b.gender] || 99);
        }
        return (CATEGORY_PRIORITY[a.category] || 99) - (CATEGORY_PRIORITY[b.category] || 99);
    });

    // Quick category templates
    const openCategoryModal = (gender: 'MALE' | 'FEMALE' | 'MIXED', cat: TournamentCategory) => {
        // Si ya existe, no re-abrir
        if (eventData.categories.some(c => c.gender === gender && c.category === cat)) return;
        setPendingCat({ gender, category: cat });
        setPendingNumTeams(8);
        setPendingGolden(false);
        setPendingSetFormat('TIE_BREAK');
        setPendingMatchFormat('2SETS_STB');
        setPendingGroupSize(4);
        setPendingTournamentType('AMERICANO');
        setPendingPointsGoal(16);
        setPendingRRFormat('ONE_SET_6');
    };

    const confirmAddCategory = () => {
        if (!pendingCat) return;
        const { gender, category } = pendingCat;
        const existingIdx = eventData.categories.findIndex(c => c.gender === gender && c.category === category);

        if (existingIdx >= 0) {
            // MODO EDICIÓN: actualizar la categoría existente
            setEventData(prev => ({
                ...prev,
                categories: prev.categories.map((c, i) => {
                    if (i !== existingIdx) return c;
                    return {
                        ...c,
                        numTeams: pendingNumTeams,
                        goldenPoint: pendingGolden,
                        setFormat: pendingSetFormat,
                        matchFormat: pendingMatchFormat,
                        groupSize: pendingGroupSize,
                        tournamentType: pendingTournamentType,
                        pointsGoal: pendingPointsGoal,
                        rrMatchFormat: pendingRRFormat,
                        teams: Array.from({ length: pendingNumTeams }, (_, j) => ({
                            id: `team-${c.id}-${j}`,
                            p1: { id: `p1-${c.id}-${j}`, name: `Jugador ${j * 2 + 1}` },
                            p2: { id: `p2-${c.id}-${j}`, name: `Jugador ${j * 2 + 2}` }
                        }))
                    };
                })
            }));
        } else {
            // MODO NUEVO: agregar categoría
            const id = Math.random().toString(36).substr(2, 9);
            setEventData(prev => ({
                ...prev,
                categories: [...prev.categories, {
                    id,
                    gender,
                    category,
                    numTeams: pendingNumTeams,
                    type: TournamentType.ROUND_ROBIN,
                    goldenPoint: pendingGolden,
                    setFormat: pendingSetFormat,
                    matchFormat: pendingMatchFormat,
                    groupSize: pendingGroupSize,
                    tournamentType: pendingTournamentType,
                    pointsGoal: pendingPointsGoal,
                    rrMatchFormat: pendingRRFormat,
                    teams: Array.from({ length: pendingNumTeams }, (_, i) => ({
                        id: `team-${id}-${i}`,
                        p1: { id: `p1-${id}-${i}`, name: `Jugador ${i * 2 + 1}` },
                        p2: { id: `p2-${id}-${i}`, name: `Jugador ${i * 2 + 2}` }
                    }))
                }]
            }));
        }
        setPendingCat(null);
    };

    const addCategory = (gender: 'MALE' | 'FEMALE' | 'MIXED', cat: TournamentCategory) => {
        openCategoryModal(gender, cat);
    };

    const removeCategory = (id: string) => {
        setEventData(prev => ({
            ...prev,
            categories: prev.categories.filter(c => c.id !== id)
        }));
    };

    const updateCategoryTeams = (id: string, count: number) => {
        setEventData(prev => ({
            ...prev,
            categories: prev.categories.map(c => {
                if (c.id !== id) return c;
                const newCount = Math.max(2, count);
                return {
                    ...c,
                    numTeams: newCount,
                    teams: Array.from({ length: newCount }, (_, i) => ({
                        id: `team-${id}-${i}`,
                        p1: { id: `p1-${id}-${i}`, name: `Jugador ${i * 2 + 1}` },
                        p2: { id: `p2-${id}-${i}`, name: `Jugador ${i * 2 + 2}` }
                    }))
                };
            })
        }));
    };

    const handleGenerate = () => {
        if (eventData.categories.length === 0) {
            alert('⚠️ Debes añadir al menos una categoría antes de generar el fixture.');
            return;
        }
        const totalTeams = eventData.categories.reduce((acc, c) => acc + (c.teams?.length || 0), 0);
        if (totalTeams < 2) {
            alert('⚠️ Cada categoría necesita al menos 2 parejas para generar partidos.');
            return;
        }

        setIsGenerating(true);
        setTimeout(() => {
            try {
                const result = MasterScheduleEngine.generateMasterSchedule(eventData);

                if (result.totalMatches === 0) {
                    setIsGenerating(false);
                    alert(
                        `⚠️ No se generaron partidos.\n\n` +
                        `Verifica:\n` +
                        `• Horario: ${eventData.dailyStartTime} - ${eventData.dailyEndTime}\n` +
                        `• Duración de partido: ${eventData.matchDurationMinutes} min\n` +
                        `• Debe haber al menos una franja que quepa.\n\n` +
                        `Revisa la consola (F12) para más detalles.`
                    );
                    return;
                }

                // Calcular fecha real de fin según días usados
                if ((result as any).daysUsed > 0) {
                    const calculatedEnd = new Date(eventData.startDate + 'T00:00:00');
                    calculatedEnd.setDate(calculatedEnd.getDate() + (result as any).daysUsed - 1);
                    setEventData(prev => ({
                        ...prev,
                        endDate: calculatedEnd.toISOString().split('T')[0]
                    }));
                }

                const sorted = [...result.matches].sort((a, b) =>
                    new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
                );

                setGeneratedMatches(sorted);
                setHasGenerated(true);
                setStep(4);
            } catch (e: any) {
                console.error('[handleGenerate] Error:', e);
                alert('Error inesperado al generar: ' + e.message);
            } finally {
                setIsGenerating(false);
            }
        }, 1200);
    };

    /** Quita undefined y convierte Date a string para que Firestore acepte el documento. */
    const sanitizeForFirestore = (obj: any): any => {
        if (obj === null || obj === undefined) return null;
        if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
        if (obj instanceof Date) return obj.toISOString();
        if (typeof obj === 'object') {
            const out: Record<string, any> = {};
            for (const [k, v] of Object.entries(obj)) {
                if (v === undefined) continue;
                out[k] = sanitizeForFirestore(v);
            }
            return out;
        }
        return obj;
    };

    const handleFinalSave = async () => {
        if (!user) return alert('Debes iniciar sesión para crear torneos');
        const currentUser = auth.currentUser;
        if (!currentUser?.uid) {
            alert('Sesión no detectada por Firebase. Cierra sesión, vuelve a entrar e inténtalo de nuevo.');
            return;
        }
        if (generatedMatches.length === 0) return alert('No hay partidos generados para guardar');

        setIsSaving(true);
        try {
            const results: { id: string; name: string }[] = [];
            for (const cat of eventData.categories) {
                const categoryMatches = generatedMatches.filter(m => m.categoryId === cat.id);
                if (categoryMatches.length === 0) continue;

                const teams = cat.teams ?? [];
                const groupSize = (cat.groupSize === 3 || cat.groupSize === 4) ? cat.groupSize : 4;
                // Misma lógica que MasterScheduleEngine: dividir equipos en grupos A, B, C...
                const groupAssignments: Record<string, string[]> = {};
                for (let i = 0; i < teams.length; i += groupSize) {
                    const chunk = teams.slice(i, i + groupSize);
                    const groupName = String.fromCharCode(65 + Object.keys(groupAssignments).length);
                    groupAssignments[groupName] = chunk.map((t: any) => String(t?.id ?? ''));
                }

                const teamIdToIndex = new Map<string, number>();
                teams.forEach((t: any, idx: number) => { if (t?.id) teamIdToIndex.set(String(t.id), idx + 1); });

                // Cada partido: id, stage para grupos, team1Index/team2Index para la vista de grupos
                const matchesWithIds = categoryMatches.map((m: any, i: number) => {
                    const t1Id = m.team1?.id ?? m.team1?.p1?.id;
                    const t2Id = m.team2?.id ?? m.team2?.p1?.id;
                    const team1Index = t1Id ? teamIdToIndex.get(String(t1Id)) : undefined;
                    const team2Index = t2Id ? teamIdToIndex.get(String(t2Id)) : undefined;
                    const isGroupStage = m.roundName === 'Fase de Grupos';
                    return {
                        ...m,
                        id: m.id || `m-${cat.id}-${i}-${Date.now().toString(36)}`,
                        scheduledTime: typeof m.scheduledTime === 'string' ? m.scheduledTime : (m.scheduledTime instanceof Date ? m.scheduledTime.toISOString() : new Date().toISOString()),
                        status: m.status ?? MatchStatus.PENDING,
                        stage: isGroupStage ? 'GROUP_STAGE' : (m.roundName === 'SEMIFINAL' ? 'SEMIFINAL' : m.roundName === 'FINAL' ? 'FINAL' : undefined),
                        ...(team1Index != null && { team1Index }),
                        ...(team2Index != null && { team2Index }),
                    };
                });

                const tournamentToSave = {
                    name: `${eventData.tournamentName} - ${cat.category} ${catLabels[cat.gender]}`,
                    type: cat.type ?? TournamentType.ROUND_ROBIN,
                    category: cat.category,
                    gender: cat.gender,
                    startDate: eventData.startDate,
                    endDate: eventData.endDate,
                    startTime: eventData.dailyStartTime,
                    endTime: eventData.dailyEndTime,
                    complexName: eventData.complexName ?? '',
                    totalCourts: eventData.numCourts ?? 3,
                    courtNames: eventData.courtNames ?? [],
                    bufferMinutes: eventData.bufferMinutes ?? 10,
                    teams: cat.teams ?? [],
                    matches: matchesWithIds,
                    groupAssignments: Object.keys(groupAssignments).length > 0 ? groupAssignments : undefined,
                    groupSize: groupSize,
                    pointsGoal: (cat as any).pointsGoal ?? 24,
                    status: 'Programado',
                };

                const docRef = await dataService.createTournament(sanitizeForFirestore(tournamentToSave), currentUser.uid);
                results.push({ id: docRef.id, name: tournamentToSave.name });
            }

            if (results.length === 0) {
                alert('No se pudo crear ningún torneo. Asegúrate de que cada categoría tenga partidos generados.');
                return;
            }
            alert(`¡Evento creado! Se guardaron ${results.length} torneo(s): ${results.map(r => r.name).join(', ')}`);
            router.push('/tournaments');
        } catch (error: any) {
            console.error('Error saving master event:', error);
            const code = error?.code || '';
            const msg = error?.message || String(error);
            const isPermission = code === 'permission-denied' || msg.toLowerCase().includes('permission');
            if (isPermission) {
                alert(
                    `Error de permisos (${code || 'permission-denied'}).\n\n` +
                    '• Cierra sesión, vuelve a entrar y prueba de nuevo.\n' +
                    '• Si sigue fallando, en Firebase Console → Firestore → Reglas, verifica que esté desplegado "allow read, write: if request.auth != null" para tournaments.'
                );
            } else {
                alert(`Error al guardar: ${msg}`);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const getEstimatedEndDate = () => {
        if (generatedMatches.length === 0) return eventData.startDate;
        const lastMatch = generatedMatches[generatedMatches.length - 1];
        return new Date(lastMatch.scheduledTime).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    const getIntensityLabel = () => {
        const totalMatches = generatedMatches.length;
        const totalHours = totalMatches * (eventData.matchDurationMinutes / 60) / eventData.numCourts;
        if (totalHours > 24) return { label: 'ALTA INTENSIDAD', color: 'text-red-500', bg: 'bg-red-500/10' };
        if (totalHours > 12) return { label: 'EQUILIBRADO', color: 'text-padel-primary', bg: 'bg-padel-primary/10' };
        return { label: 'RELAJADO', color: 'text-blue-400', bg: 'bg-blue-400/10' };
    };

    const SET_FORMAT_LABELS = {
        TIE_BREAK: { label: 'Tie-Break', desc: '6-6 → Tie-break a 7', icon: '🎾' },
        SUPER_TIE_BREAK: { label: 'Super Tie-Break', desc: '6-6 → Super TB a 10', icon: '⚡' },
        NO_TIE_BREAK: { label: 'Sin Tie-Break', desc: 'Hasta ganar por 2 games', icon: '🔁' },
    };

    return (
        <div className="h-dvh flex flex-col bg-[#0a0a0b] text-white selection:bg-padel-primary/30 overflow-hidden">

            {/* ─── Modal Configuración de Categoría ─── */}
            <AnimatePresence>
                {pendingCat && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setPendingCat(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 16, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 16, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="bg-[#111] border border-zinc-800 rounded-2xl p-5 max-w-2xl w-full shadow-2xl shadow-black/60 space-y-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header modal */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                        Configurar Categoría
                                    </p>
                                    <h3 className="text-base font-black italic uppercase tracking-tight text-white leading-tight">
                                        {catLevelLabels[pendingCat.category] || pendingCat.category} <span className="text-padel-primary">{catLabels[pendingCat.gender]}</span>
                                    </h3>
                                </div>
                                <button onClick={() => setPendingCat(null)} className="text-zinc-600 hover:text-white transition-colors p-1">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* ── 2-column grid ── */}
                            <div className="grid grid-cols-2 gap-4">

                                {/* ── Columna Izquierda: Parejas + Grupos ── */}
                                <div className="space-y-3">

                                    {/* Número de Parejas */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                                            <Users className="w-3 h-3 text-padel-primary" /> Número de Parejas
                                        </label>
                                        <div className="grid grid-cols-7 gap-2">
                                            {[4, 6, 8, 10, 12, 14, 16].map(n => (
                                                <button
                                                    key={n}
                                                    type="button"
                                                    onClick={() => setPendingNumTeams(n)}
                                                    className={`min-h-[44px] py-2 rounded-lg text-xs md:text-sm font-black transition-all select-none touch-manipulation active:scale-[0.98] ${pendingNumTeams === n ? 'bg-padel-primary text-black shadow-md' : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3 bg-black/40 border border-zinc-800 rounded-xl px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() => setPendingNumTeams(t => Math.max(2, t - 1))}
                                                className="min-w-[44px] min-h-[44px] rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center font-black text-lg text-white transition-all active:scale-95 select-none touch-manipulation"
                                            >−</button>
                                            <div className="flex-1 text-center">
                                                <span className="text-2xl font-black text-padel-primary">{pendingNumTeams}</span>
                                                <span className="text-[9px] text-zinc-600 font-bold uppercase ml-2">
                                                    parejas · {calcTotalMatchesForCategory(pendingNumTeams, pendingGroupSize)} partidos
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setPendingNumTeams(t => Math.min(64, t + 1))}
                                                className="min-w-[44px] min-h-[44px] rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center font-black text-lg text-white transition-all active:scale-95 select-none touch-manipulation"
                                            >+</button>
                                        </div>
                                    </div>

                                    {/* Equipos por Grupo */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                                            <Layers className="w-3 h-3 text-padel-primary" /> Equipos por Grupo
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {([3, 4] as const).map(size => {
                                                const isSelected = pendingGroupSize === size;
                                                const matchesPerGroup = size - 1;
                                                const numGroups = Math.max(1, Math.floor(pendingNumTeams / size));
                                                const nextRound = numGroups === 2 ? 'Cuartos' : numGroups > 2 ? 'Semis' : '—';
                                                return (
                                                    <button
                                                        key={size}
                                                        type="button"
                                                        onClick={() => setPendingGroupSize(size)}
                                                        className={`relative min-h-[72px] md:min-h-[80px] p-4 rounded-xl border text-left transition-all select-none touch-manipulation active:scale-[0.98] ${isSelected
                                                            ? 'border-padel-primary bg-padel-primary/10 shadow-[0_0_16px_rgba(204,255,0,0.12)]'
                                                            : 'border-zinc-800 bg-black/30 hover:border-zinc-700'
                                                            }`}
                                                    >
                                                        <div className={`text-2xl font-black italic leading-none tracking-tighter ${isSelected ? 'text-padel-primary' : 'text-zinc-500'}`}>{size}</div>
                                                        <p className={`text-[9px] font-black uppercase tracking-wider mt-0.5 ${isSelected ? 'text-white' : 'text-zinc-600'}`}>parejas / grupo</p>
                                                        <p className={`text-[8px] font-bold italic mt-1 leading-tight ${isSelected ? 'text-padel-primary/70' : 'text-zinc-700'}`}>{matchesPerGroup} juegos · Top 2 → {nextRound}</p>
                                                        {isSelected && (
                                                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-padel-primary flex items-center justify-center">
                                                                <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* ── Columna Derecha: Tipo de Torneo + config condicional ── */}
                                <div className="space-y-3">

                                    {/* Tipo de Torneo – botones estilo tarjeta como en el mock */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                                            <Trophy className="w-3 h-3 text-padel-primary" /> Formato del Torneo
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                            {([
                                                { val: 'AMERICANO' as const, label: 'Americano', desc: 'Parejas rotativas, todos con todos.' },
                                                { val: 'DUPLA_FIJA' as const, label: 'Dupla Fija', desc: 'Parejas estables, puntuación acumulada.' },
                                                { val: 'ROUND_ROBIN' as const, label: 'Round Robin', desc: 'Grupos todos contra todos.' },
                                                { val: 'ELIMINACION_DIRECTA' as const, label: 'Eliminación directa', desc: 'Llaves, el perdedor queda fuera.' },
                                                { val: 'COMBINADO' as const, label: 'Combinado', desc: 'Fase de grupos + eliminatoria.' },
                                            ]).map(opt => {
                                                const isSelected = pendingTournamentType === opt.val;
                                                return (
                                                    <button
                                                        key={opt.val}
                                                        type="button"
                                                        onClick={() => setPendingTournamentType(opt.val)}
                                                        className={`relative flex flex-col items-start justify-between rounded-2xl px-4 py-4 min-h-[80px] md:min-h-[88px] text-left transition-all border min-w-0 select-none touch-manipulation active:scale-[0.98] ${
                                                            isSelected
                                                                ? 'bg-padel-primary/10 border-padel-primary text-white shadow-[0_0_20px_rgba(204,255,0,0.3)]'
                                                                : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-padel-primary/40 hover:bg-zinc-900'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between w-full gap-2 mb-1.5 min-w-0">
                                                            <span className="text-[11px] md:text-xs font-black italic uppercase tracking-wider break-words leading-tight flex-1 min-w-0">
                                                                {opt.label}
                                                            </span>
                                                            <div
                                                                className="w-9 h-9 md:w-10 md:h-10 rounded-xl border flex items-center justify-center shrink-0 bg-black/50 border-zinc-700"
                                                                style={isSelected ? { borderColor: FORMAT_COLORS[opt.val], boxShadow: `0 0 12px ${FORMAT_COLORS[opt.val]}40` } : undefined}
                                                            >
                                                                {opt.val === 'AMERICANO' && <FormatIcons.AMERICANO className="w-5 h-5 md:w-6 md:h-6" />}
                                                                {opt.val === 'DUPLA_FIJA' && <FormatIcons.DUPLA_FIJA className="w-5 h-5 md:w-6 md:h-6" />}
                                                                {opt.val === 'ROUND_ROBIN' && <FormatIcons.ROUND_ROBIN className="w-5 h-5 md:w-6 md:h-6" />}
                                                                {opt.val === 'ELIMINACION_DIRECTA' && <FormatIcons.ELIMINATORIO className="w-5 h-5 md:w-6 md:h-6" />}
                                                                {opt.val === 'COMBINADO' && <FormatIcons.COMBINADO className="w-5 h-5 md:w-6 md:h-6" />}
                                                            </div>
                                                        </div>
                                                        <p className={`text-[10px] md:text-[11px] font-medium leading-tight line-clamp-2 ${isSelected ? 'text-zinc-100' : 'text-zinc-400'}`}>
                                                            {opt.desc}
                                                        </p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Zona de opciones por formato — min-height para equilibrar sin huecos */}
                                    <div className="min-h-[280px] md:min-h-[300px] flex flex-col">
                                        {/* Puntos — solo Americano / Dupla Fija */}
                                        {(pendingTournamentType === 'AMERICANO' || pendingTournamentType === 'DUPLA_FIJA') && (
                                            <div className="space-y-1.5 flex-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                                                    <Sparkles className="w-3 h-3 text-yellow-400" /> A cuántos puntos
                                                </label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {[4, 8, 12, 16, 20, 24].map(pts => {
                                                        const isSelected = pendingPointsGoal === pts;
                                                        return (
                                                            <button
                                                                key={pts}
                                                                type="button"
                                                                onClick={() => setPendingPointsGoal(pts)}
                                                                className={`min-h-[48px] py-3 px-3 rounded-2xl border-2 font-black italic text-xs md:text-sm uppercase tracking-wider transition-all select-none touch-manipulation active:scale-[0.98] ${isSelected
                                                                    ? 'bg-padel-primary border-padel-primary text-black shadow-[0_0_16px_rgba(204,255,0,0.2)]'
                                                                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                                                                    }`}
                                                            >
                                                                {pts} pt
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Formato de Partido — solo Round Robin */}
                                        {pendingTournamentType === 'ROUND_ROBIN' && (
                                            <div className="space-y-1.5 flex-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                                                    <Layout className="w-3 h-3 text-blue-400" /> Formato de Partido
                                                </label>
                                                <div className="flex flex-col gap-2 md:gap-2.5">
                                                    {([
                                                        { val: 'ONE_SET_6' as const, label: '1 Set (a 6 juegos)' },
                                                        { val: 'ONE_SET_9' as const, label: '1 Set (a 9 juegos)' },
                                                        { val: 'TWO_SHORT_SETS' as const, label: '2 Sets Cortos (a 4) + MTB' },
                                                        { val: 'TWO_NORMAL_SETS' as const, label: '2 Sets Normales (a 6) + MTB' },
                                                    ]).map(opt => {
                                                        const isSelected = pendingRRFormat === opt.val;
                                                        return (
                                                            <button
                                                                key={opt.val}
                                                                type="button"
                                                                onClick={() => setPendingRRFormat(opt.val)}
                                                                className={`w-full min-h-[48px] py-3 px-5 rounded-2xl border-2 text-left font-black italic text-xs md:text-sm uppercase tracking-wider transition-all select-none touch-manipulation active:scale-[0.98] ${isSelected
                                                                    ? 'bg-padel-primary border-padel-primary text-black shadow-[0_0_20px_rgba(204,255,0,0.25)]'
                                                                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                                                                    }`}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Eliminación directa — sin opciones extra, bloque ocupado */}
                                        {pendingTournamentType === 'ELIMINACION_DIRECTA' && (
                                            <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40 py-8 px-4 text-center">
                                                <div className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center mb-3" style={{ borderColor: FORMAT_COLORS.ELIMINACION_DIRECTA }}>
                                                    <FormatIcons.ELIMINATORIO className="w-8 h-8" />
                                                </div>
                                                <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Sin opciones adicionales</p>
                                                <p className="text-[10px] text-zinc-500 mt-1">Llaves automáticas según parejas</p>
                                            </div>
                                        )}

                                        {/* Combinado — fase grupos + eliminatoria, bloque ocupado */}
                                        {pendingTournamentType === 'COMBINADO' && (
                                            <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40 py-8 px-4 text-center">
                                                <div className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center mb-3" style={{ borderColor: FORMAT_COLORS.COMBINADO }}>
                                                    <FormatIcons.COMBINADO className="w-8 h-8" />
                                                </div>
                                                <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Fase de grupos + eliminatoria</p>
                                                <p className="text-[10px] text-zinc-500 mt-1">Configuración próxima</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Confirm — full width, touch-friendly */}
                            <button
                                type="button"
                                onClick={confirmAddCategory}
                                className="w-full min-h-[52px] md:min-h-[56px] bg-padel-primary hover:bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm md:text-base select-none touch-manipulation -mt-2"
                            >
                                <Plus className="w-5 h-5 md:w-6 md:h-6" /> AÑADIR CATEGORÍA
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-padel-primary/5 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            {/* Main Container — fills remaining vertical space */}
            <div className="relative flex flex-col flex-1 min-h-0 max-w-7xl w-full mx-auto px-4 md:px-6 pb-4 pt-3">

                {/* Header — compact */}
                <header className="flex items-center justify-between gap-4 mb-3 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-padel-primary/10 border border-padel-primary/20 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-padel-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black italic uppercase tracking-tighter leading-none">
                                Generador <span className="text-padel-primary">Maestro</span>
                            </h1>
                            <p className="text-[10px] text-zinc-500 font-medium hidden sm:block">Programación Multi-Categoría</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 bg-zinc-900/70 backdrop-blur-xl p-1.5 rounded-xl border border-zinc-800">
                        {[
                            { n: 1, label: 'Evento' },
                            { n: 2, label: 'Cats.' },
                            { n: 3, label: 'Pistas' },
                            { n: 4, label: 'Fixture' },
                        ].map(({ n, label }) => (
                            <div key={n} className="flex flex-col items-center gap-0.5 px-2">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all ${step === n ? 'bg-padel-primary text-black font-bold shadow-md shadow-padel-primary/25' :
                                    step > n ? 'bg-zinc-800 text-padel-primary' : 'text-zinc-600'
                                    }`}>
                                    {step > n ? <CheckCircle2 className="w-3.5 h-3.5" /> : n}
                                </div>
                                <span className={`text-[8px] font-bold uppercase tracking-wide hidden sm:block ${step === n ? 'text-padel-primary' : step > n ? 'text-zinc-500' : 'text-zinc-700'
                                    }`}>{label}</span>
                            </div>
                        ))}
                    </div>
                </header>


                {/* content area — fills remaining height, scrolls inside */}
                < div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4" >

                    {/* Main Form — scrollable */}
                    < main className="lg:col-span-8 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent" >
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.section
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-3"
                                >
                                    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-padel-primary">Nombre del Evento</label>
                                                <input
                                                    type="text"
                                                    value={eventData.tournamentName}
                                                    onChange={(e) => setEventData({ ...eventData, tournamentName: e.target.value })}
                                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl p-3 text-base font-bold focus:border-padel-primary outline-none transition-all"
                                                    placeholder="Ej: Virgen del Valle Open..."
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Sede / Localidad</label>
                                                <select
                                                    value={eventData.complexName}
                                                    onChange={(e) => {
                                                        const complex = COMPLEXES.find(c => c.name === e.target.value);
                                                        setEventData({
                                                            ...eventData,
                                                            complexName: e.target.value,
                                                            numCourts: complex?.courts || eventData.numCourts,
                                                            courtNames: Array.from({ length: complex?.courts || eventData.numCourts }, (_, i) => `Pista ${i + 1}`)
                                                        });
                                                    }}
                                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl p-3 outline-none focus:border-padel-primary transition-all font-bold"
                                                >
                                                    <option value="" disabled>— Selecciona una sede —</option>
                                                    {COMPLEXES.map(c => (
                                                        <option key={c.name} value={c.name}>{c.name} ({c.courts} Pistas)</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Fecha Inicio</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                                    <input
                                                        type="date"
                                                        value={eventData.startDate}
                                                        onChange={(e) => setEventData({ ...eventData, startDate: e.target.value })}
                                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl p-3 pl-9 outline-none focus:border-padel-primary"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Duración</label>
                                                <div className="w-full bg-black/50 border border-zinc-700 rounded-xl p-3 flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4 text-padel-primary animate-pulse shrink-0" />
                                                    <p className="text-sm font-bold text-white uppercase italic leading-tight">Calculada por IA</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Apertura</label>
                                                <div className="relative">
                                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                                                    <input
                                                        type="time"
                                                        value={eventData.dailyStartTime}
                                                        onChange={(e) => setEventData({ ...eventData, dailyStartTime: e.target.value })}
                                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl p-3 pl-8 outline-none focus:border-padel-primary text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                                    Cierre{eventData.dailyEndTime < eventData.dailyStartTime && <span className="ml-1 text-padel-primary">(+1d)</span>}
                                                </label>
                                                <div className="relative">
                                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                                                    <input
                                                        type="time"
                                                        value={eventData.dailyEndTime}
                                                        onChange={(e) => setEventData({ ...eventData, dailyEndTime: e.target.value })}
                                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl p-3 pl-8 outline-none focus:border-padel-primary text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Duración (min)</label>
                                                <input
                                                    type="number"
                                                    min={30} max={180} step={5}
                                                    value={eventData.matchDurationMinutes}
                                                    onChange={(e) => setEventData({ ...eventData, matchDurationMinutes: parseInt(e.target.value) || 70 })}
                                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl p-3 outline-none focus:border-padel-primary font-bold text-center text-base"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Buffer (min)</label>
                                                <input
                                                    type="number"
                                                    min={0} max={60} step={5}
                                                    value={eventData.bufferMinutes}
                                                    onChange={(e) => setEventData({ ...eventData, bufferMinutes: parseInt(e.target.value) || 10 })}
                                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl p-3 outline-none focus:border-padel-primary font-bold text-center text-base"
                                                />
                                            </div>
                                        </div>
                                        {/* Resumen horario */}
                                        <div className="bg-black/30 rounded-xl p-3 flex flex-wrap gap-3 text-[10px] font-bold">
                                            <span className="text-zinc-500 uppercase">Franja por partido:</span>
                                            <span className="text-padel-primary">{eventData.matchDurationMinutes + eventData.bufferMinutes} min totales</span>
                                            <span className="text-zinc-600">·</span>
                                            <span className="text-zinc-500 uppercase">Franjas/día/pista:</span>
                                            <span className="text-padel-primary">
                                                {(() => {
                                                    const [sh, sm] = eventData.dailyStartTime.split(':').map(Number);
                                                    const [eh, em] = eventData.dailyEndTime.split(':').map(Number);
                                                    let totalMins = (eh * 60 + em) - (sh * 60 + sm);
                                                    if (totalMins <= 0) totalMins += 24 * 60;
                                                    return Math.floor(totalMins / (eventData.matchDurationMinutes + eventData.bufferMinutes));
                                                })()}
                                            </span>
                                            <span className="text-zinc-600">·</span>
                                            <span className="text-zinc-500 uppercase">Partidos/día total:</span>
                                            <span className="text-white">
                                                {(() => {
                                                    const [sh, sm] = eventData.dailyStartTime.split(':').map(Number);
                                                    const [eh, em] = eventData.dailyEndTime.split(':').map(Number);
                                                    let totalMins = (eh * 60 + em) - (sh * 60 + sm);
                                                    if (totalMins <= 0) totalMins += 24 * 60;
                                                    return Math.floor(totalMins / (eventData.matchDurationMinutes + eventData.bufferMinutes)) * eventData.numCourts;
                                                })()} partidos/día
                                            </span>
                                        </div>
                                    </div>
                                </motion.section>
                            )}

                            {step === 2 && (
                                <motion.section
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-bold italic uppercase">Categorías del Evento</h2>
                                        {activeGender && (
                                            <button
                                                onClick={() => setActiveGender(null)}
                                                className="text-zinc-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase"
                                            >
                                                <ChevronLeft className="w-4 h-4" /> Volver a Géneros
                                            </button>
                                        )}
                                    </div>

                                    {!activeGender ? (
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                onClick={() => setActiveGender('MALE')}
                                                className="bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 rounded-2xl p-5 transition-all group text-center space-y-2"
                                            >
                                                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                                    <span className="text-2xl">♂️</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black uppercase text-blue-400">Masculino</h3>
                                                    <p className="text-zinc-500 text-[9px] mt-0.5 uppercase tracking-tighter hidden sm:block">Masculino</p>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => setActiveGender('FEMALE')}
                                                className="bg-pink-500/5 hover:bg-pink-500/10 border border-pink-500/20 hover:border-pink-500/40 rounded-2xl p-5 transition-all group text-center space-y-2"
                                            >
                                                <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                                    <span className="text-2xl">♀️</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black uppercase text-pink-400">Femenino</h3>
                                                    <p className="text-zinc-500 text-[9px] mt-0.5 uppercase tracking-tighter hidden sm:block">Femenino</p>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => setActiveGender('MIXED')}
                                                className="bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 rounded-2xl p-5 transition-all group text-center space-y-2"
                                            >
                                                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                                    <span className="text-2xl">🚻</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black uppercase text-purple-400">Mixto</h3>
                                                    <p className="text-zinc-500 text-[9px] mt-0.5 uppercase tracking-tighter hidden sm:block">Combinados</p>
                                                </div>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 space-y-4">
                                            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
                                                <div className={`p-2.5 rounded-xl ${activeGender === 'MALE' ? 'bg-blue-500/20 text-blue-400' :
                                                    activeGender === 'FEMALE' ? 'bg-pink-500/20 text-pink-400' :
                                                        'bg-purple-500/20 text-purple-400'
                                                    }`}>
                                                    <Plus className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-black uppercase">Categorías {catLabels[activeGender]}</h3>
                                                    <p className="text-zinc-500 text-xs">Selecciona los niveles</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                                                {[
                                                    TournamentCategory.PRIMERA, TournamentCategory.SEGUNDA,
                                                    TournamentCategory.TERCERA, TournamentCategory.CUARTA,
                                                    TournamentCategory.QUINTA, TournamentCategory.SEXTA,
                                                    TournamentCategory.SEPTIMA, TournamentCategory.MAS_45,
                                                    TournamentCategory.MAS_50, TournamentCategory.SUMA_7,
                                                    TournamentCategory.SUMA_8, TournamentCategory.SUMA_9,
                                                    TournamentCategory.SUMA_10
                                                ].map(level => {
                                                    const exists = eventData.categories.some(c => c.gender === activeGender && c.category === level);
                                                    return (
                                                        <button
                                                            key={level}
                                                            onClick={() => exists ? null : addCategory(activeGender, level)}
                                                            disabled={exists}
                                                            className={`p-2.5 rounded-xl border transition-all text-center text-xs font-bold ${exists
                                                                ? 'bg-zinc-800/50 border-zinc-700 text-zinc-600 cursor-not-allowed'
                                                                : 'bg-black/50 border-zinc-700 hover:border-padel-primary hover:text-padel-primary'
                                                                }`}
                                                        >
                                                            {catLevelLabels[level] || level}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* List of active categories */}
                                    <div className="space-y-2 pt-3 border-t border-zinc-800">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Categorías Seleccionadas</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {sortedSelectedCategories.map((cat, idx) => (
                                                <div key={cat.id} className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 group hover:border-padel-primary/30 transition-all space-y-2">
                                                    {/* Row 1: icon + name + actions */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm`} style={{ backgroundColor: COLORS[idx % COLORS.length] + '20', color: COLORS[idx % COLORS.length] }}>
                                                                {cat.gender === 'MALE' ? '♂️' : cat.gender === 'FEMALE' ? '♀️' : '🚻'}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-base leading-none">{catLevelLabels[cat.category] || cat.category}</p>
                                                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{catLabels[cat.gender]}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => {
                                                                    setPendingCat({ gender: cat.gender as 'MALE' | 'FEMALE' | 'MIXED', category: cat.category });
                                                                    setPendingNumTeams(cat.numTeams);
                                                                    setPendingGolden(cat.goldenPoint ?? false);
                                                                    setPendingSetFormat((cat.setFormat as any) ?? 'TIE_BREAK');
                                                                    setPendingGroupSize((cat.groupSize as 3 | 4) ?? 4);
                                                                }}
                                                                className="text-zinc-600 hover:text-padel-primary transition-colors p-1.5 hover:bg-padel-primary/10 rounded-lg"
                                                            >
                                                                <Settings className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => removeCategory(cat.id)} className="text-zinc-600 hover:text-red-500 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {/* Row 2: config badges */}
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-[10px] font-black uppercase bg-padel-primary/10 text-padel-primary border border-padel-primary/20 px-2 py-0.5 rounded-md">
                                                            {cat.numTeams} parejas
                                                        </span>
                                                        <span className="text-[10px] font-black uppercase bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-md">
                                                            {calcTotalMatchesForCategory(cat.numTeams, cat.groupSize)} partidos
                                                        </span>
                                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${cat.goldenPoint ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                                                            {cat.goldenPoint ? '⭐ Punto de Oro' : '⚖️ Deuce'}
                                                        </span>
                                                        <span className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md">
                                                            {cat.setFormat === 'TIE_BREAK' ? '🎾 Tie-Break' : cat.setFormat === 'SUPER_TIE_BREAK' ? '⚡ Super TB' : '🔁 Sin TB'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {eventData.categories.length === 0 && (
                                        <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-8 text-center space-y-2">
                                            <Layers className="w-6 h-6 text-zinc-700 mx-auto" />
                                            <p className="text-zinc-500 text-sm">No hay categorías seleccionadas aún.</p>
                                        </div>
                                    )}
                                </motion.section>
                            )}

                            {step === 3 && (
                                <motion.section
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-3"
                                >
                                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-b border-zinc-800 pb-4">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 text-padel-primary mb-2">
                                                    <Clock className="w-5 h-5" />
                                                    <label className="text-xs font-bold uppercase tracking-widest">Ritmo de Juego</label>
                                                </div>
                                                <select
                                                    value={eventData.matchDurationMinutes}
                                                    onChange={(e) => setEventData({ ...eventData, matchDurationMinutes: Number(e.target.value) })}
                                                    className="w-full bg-black/50 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-padel-primary transition-all font-bold"
                                                >
                                                    <option value={60}>60 Minutos / Partido</option>
                                                    <option value={75}>75 Minutos / Partido</option>
                                                    <option value={90}>90 Minutos / Partido</option>
                                                    <option value={120}>120 Minutos / Partido</option>
                                                </select>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 text-blue-400 mb-2">
                                                    <Settings className="w-5 h-5" />
                                                    <label className="text-xs font-bold uppercase tracking-widest">Margen de Descanso</label>
                                                </div>
                                                <select
                                                    value={eventData.bufferMinutes}
                                                    onChange={(e) => setEventData({ ...eventData, bufferMinutes: Number(e.target.value) })}
                                                    className="w-full bg-black/50 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-blue-400 transition-all font-bold"
                                                >
                                                    <option value={5}>5 Minutos entre juegos</option>
                                                    <option value={10}>10 Minutos entre juegos</option>
                                                    <option value={15}>15 Minutos entre juegos</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Configuración de Pistas</label>
                                                <div className="text-[10px] text-padel-primary bg-padel-primary/10 px-2 py-1 rounded-md uppercase font-bold border border-padel-primary/20">
                                                    Pistas Activas: {eventData.numCourts}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                                {/* Mostrar pistas existentes y opción de añadir */}
                                                {eventData.courtNames.map((name, i) => (
                                                    <div key={i} className="relative group">
                                                        <div className="flex bg-black/40 border border-zinc-800 rounded-2xl p-2 items-center gap-3 pr-4 group-hover:border-zinc-700 transition-all shadow-lg shadow-black/20">
                                                            <div className="w-10 h-10 bg-zinc-800/80 rounded-xl flex items-center justify-center font-black italic text-zinc-500 text-xs shrink-0">
                                                                {i + 1}
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={name}
                                                                onChange={(e) => {
                                                                    const newNames = [...eventData.courtNames];
                                                                    newNames[i] = e.target.value;
                                                                    setEventData({ ...eventData, courtNames: newNames });
                                                                }}
                                                                className="bg-transparent border-none outline-none text-sm font-bold w-full focus:text-padel-primary transition-colors"
                                                                placeholder={`Pista ${i + 1}`}
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newNames = eventData.courtNames.filter((_, idx) => idx !== i);
                                                                    setEventData({
                                                                        ...eventData,
                                                                        courtNames: newNames,
                                                                        numCourts: newNames.length
                                                                    });
                                                                }}
                                                                className="p-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Botón para añadir pista rápida */}
                                                <button
                                                    onClick={() => {
                                                        const newNames = [...eventData.courtNames, `Pista ${eventData.courtNames.length + 1}`];
                                                        setEventData({
                                                            ...eventData,
                                                            courtNames: newNames,
                                                            numCourts: newNames.length
                                                        });
                                                    }}
                                                    className="border-2 border-dashed border-zinc-800 rounded-2xl p-4 flex items-center justify-center gap-3 text-zinc-500 hover:border-padel-primary/40 hover:text-padel-primary transition-all group"
                                                >
                                                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                    <span className="text-sm font-bold uppercase tracking-tighter">Añadir Pista</span>
                                                </button>
                                            </div>

                                            <p className="text-[10px] text-zinc-600 uppercase italic">
                                                * Nota: Solo se generarán partidos en las pistas listadas arriba.
                                            </p>
                                        </div>

                                        {/* ── Panel de Pre-Generación ────────────────────── */}
                                        {eventData.categories.length > 0 && (
                                            <div className="bg-padel-primary/5 border border-padel-primary/20 rounded-3xl p-6 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <Sparkles className="w-5 h-5 text-padel-primary" />
                                                    <h3 className="font-black uppercase tracking-tighter text-sm text-padel-primary">Resumen Pre-Generación</h3>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-black/30 rounded-2xl p-4 text-center">
                                                        <div className="text-2xl font-black text-white">
                                                            {eventData.categories.reduce((acc, c) => acc + calcTotalMatchesForCategory(c.numTeams, c.groupSize), 0)}
                                                        </div>
                                                        <div className="text-[10px] text-zinc-500 uppercase font-bold mt-1">Partidos totales</div>
                                                    </div>
                                                    <div className="bg-black/30 rounded-2xl p-4 text-center">
                                                        <div className="text-2xl font-black text-white">{eventData.numCourts}</div>
                                                        <div className="text-[10px] text-zinc-500 uppercase font-bold mt-1">Canchas disponibles</div>
                                                    </div>
                                                    <div className="bg-black/30 rounded-2xl p-4 text-center">
                                                        <div className="text-2xl font-black text-white">{eventData.matchDurationMinutes}min</div>
                                                        <div className="text-[10px] text-zinc-500 uppercase font-bold mt-1">Por partido</div>
                                                    </div>
                                                    <div className="bg-black/30 rounded-2xl p-4 text-center">
                                                        <div className="text-2xl font-black text-white">{eventData.categories.length}</div>
                                                        <div className="text-[10px] text-zinc-500 uppercase font-bold mt-1">Categorías</div>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    {eventData.categories.map((c, i) => (
                                                        <div key={c.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-black/20">
                                                            <span className="font-bold text-zinc-300">{c.gender === 'MALE' ? '♂' : c.gender === 'FEMALE' ? '♀' : '🚻'} {c.category}</span>
                                                            <span className="text-padel-primary font-black">{c.teams?.length || c.numTeams} parejas · {calcTotalMatchesForCategory(c.numTeams, c.groupSize)} partidos</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {eventData.categories.length === 0 && (
                                            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 flex items-center gap-3 text-yellow-500">
                                                <AlertCircle className="w-5 h-5 shrink-0" />
                                                <p className="text-xs font-bold">Vuelve al Paso 2 y añade al menos una categoría para poder generar el fixture.</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.section>
                            )}




                            {step === 4 && hasGenerated && (
                                <motion.section
                                    key="results"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6"
                                >
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-black italic uppercase italic tracking-tighter text-white/90 leading-none">
                                                Panel de <span className="text-padel-primary">Programación Maestra</span>
                                            </h2>
                                            <div className="flex items-center gap-3">
                                                <div className={`px-2 py-1 rounded-lg border border-white/5 flex items-center gap-2 ${getIntensityLabel().bg}`}>
                                                    <Sparkles className={`w-3 h-3 ${getIntensityLabel().color}`} />
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${getIntensityLabel().color}`}>
                                                        {getIntensityLabel().label}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase italic">
                                                    Finaliza el: <span className="text-white">{getEstimatedEndDate()}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button type="button" className="min-h-[48px] flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-sm font-bold transition-all active:scale-[0.98] shadow-lg shadow-black/40 group select-none touch-manipulation">
                                                <Share2 className="w-5 h-5 text-padel-primary group-hover:scale-110 transition-transform" />
                                                Compartir
                                            </button>
                                            <span className="bg-padel-primary/10 text-padel-primary px-4 py-2 rounded-xl text-sm font-bold border border-padel-primary/20 leading-none flex items-center">
                                                {generatedMatches.length} Partidos
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden border-t-4 border-t-padel-primary shadow-2xl">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-black/50 border-b border-zinc-800 uppercase text-[10px] tracking-widest font-black text-zinc-400">
                                                    <tr>
                                                        <th className="px-6 py-4">Detalle del Partido (Hora, Pista, Categoría y Encuentro)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-800">
                                                    {generatedMatches.map((m, idx) => (
                                                        <tr key={idx} className="hover:bg-zinc-800/30 transition-colors group">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center h-full gap-6">
                                                                    {/* Time column inside row */}
                                                                    <div className="flex flex-col min-w-[80px]">
                                                                        <span className="text-padel-primary font-black italic text-base leading-none">
                                                                            {new Date(m.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                        <span className="text-[10px] text-zinc-500 font-bold uppercase mt-1">
                                                                            {new Date(m.scheduledTime).toLocaleDateString([], { weekday: 'short', day: 'numeric' })}
                                                                        </span>
                                                                    </div>

                                                                    {/* Court column inside row */}
                                                                    <div className="min-w-[120px]">
                                                                        <span className="text-[10px] font-black text-black px-2 py-0.5 bg-padel-primary rounded-md uppercase tracking-tighter">
                                                                            {m.courtName}
                                                                        </span>
                                                                    </div>

                                                                    {/* Category & Round column inside row */}
                                                                    <div className="flex items-center gap-3 min-w-[220px]">
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter w-fit ${m.roundName.includes('FINAL') ? 'bg-padel-primary text-black' : 'bg-zinc-800 text-padel-primary border border-padel-primary/20'}`}>
                                                                                {m.roundName}
                                                                            </span>
                                                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                                                                                {m.categoryName.replace('MALE', 'MASCULINO').replace('FEMALE', 'FEMENINO').replace('MIXED', 'MIXTO')}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Matchup column simplified */}
                                                                    <div className="flex-1 flex items-center gap-3">
                                                                        <div className="flex-1 text-right text-xs font-bold text-white truncate max-w-[180px]">
                                                                            {m.team1.p1.name.split(' ')[0]} + {m.team1.p2.name.split(' ')[0]}
                                                                        </div>
                                                                        <div className="px-2 py-0.5 bg-zinc-800 rounded font-black text-[9px] text-zinc-500 italic">VS</div>
                                                                        <div className="flex-1 text-left text-xs font-bold text-white truncate max-w-[180px]">
                                                                            {m.team2.p1.name.split(' ')[0]} + {m.team2.p2.name.split(' ')[0]}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </motion.section>
                            )}
                        </AnimatePresence>
                    </main >

                    {/* Sidebar Actions */}
                    < aside className="lg:col-span-4 overflow-y-auto space-y-3" >
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl">
                            <h3 className="text-sm font-bold italic uppercase border-b border-zinc-800 pb-2 mb-3">Resumen Global</h3>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-500">Categorías</span>
                                    <span className="font-bold text-padel-primary">{eventData.categories.length}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-500">Pistas</span>
                                    <span className="font-bold text-white">{eventData.numCourts}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-500">Parejas</span>
                                    <span className="font-bold text-white">{eventData.categories.reduce((acc, c) => acc + c.numTeams, 0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-500">Jugadores</span>
                                    <span className="font-bold text-white">{eventData.categories.reduce((acc, c) => acc + c.numTeams, 0) * 2}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-500">Partidos</span>
                                    <span className="font-bold text-white">{eventData.categories.reduce((acc, c) => acc + calcTotalMatchesForCategory(c.numTeams, c.groupSize), 0)}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
                                {step < 3 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="w-full min-h-[52px] md:min-h-[56px] bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all text-sm md:text-base select-none touch-manipulation active:scale-[0.98]"
                                    >
                                        Continuar <ChevronRight className="w-5 h-5" />
                                    </button>
                                ) : step === 3 ? (
                                    <button
                                        type="button"
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        className="w-full min-h-[52px] md:min-h-[56px] bg-padel-primary hover:bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group text-sm md:text-base select-none touch-manipulation active:scale-[0.98]"
                                    >
                                        {isGenerating ? (
                                            <>Calculando...</>
                                        ) : (
                                            <>GENERAR FIXTURE <Sparkles className="w-5 h-5 group-hover:scale-125 transition-transform" /></>
                                        )}
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={handleFinalSave}
                                            disabled={isSaving}
                                            className="w-full min-h-[52px] md:min-h-[56px] bg-padel-primary hover:bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 group shadow-[0_6px_20px_rgba(204,255,0,0.2)] text-sm md:text-base select-none touch-manipulation active:scale-[0.98]"
                                        >
                                            {isSaving ? (
                                                <>Creando...</>
                                            ) : (
                                                <>CREAR EVENTO <Database className="w-5 h-5 group-hover:rotate-12 transition-transform" /></>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="w-full min-h-[48px] bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold py-3 rounded-xl transition-all hover:bg-zinc-800 text-sm select-none touch-manipulation active:scale-[0.98]"
                                        >
                                            Descartar
                                        </button>
                                    </div>
                                )}

                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="w-full min-h-[48px] bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold py-3 rounded-xl transition-all hover:bg-zinc-800 text-sm select-none touch-manipulation active:scale-[0.98]"
                                    >
                                        Atrás
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* AI Assistant Tip */}
                        <div className="bg-padel-primary/5 border border-padel-primary/10 rounded-2xl p-3 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-padel-primary">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Tip del Organizador</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                                "El sistema garantiza que ningún jugador juegue dos partidos seguidos. Las finales se agenden automáticamente al último slot disponible."
                            </p>
                        </div>
                    </aside >
                </div >
            </div >
        </div >
    );
}
