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
    Check,
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
    Edit3,
    Database,
    ImageIcon,
    Loader2,
    Upload,
    Link as LinkIcon,
    DollarSign
} from 'lucide-react';
import { TournamentType, TournamentCategory, MatchStatus } from '@/types/tournament';
import { MasterScheduleEngine, MasterScheduleConfig, CategoryConfig } from '@/services/MasterScheduleEngine';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { useRouter } from 'next/navigation';

// Colores fijos por formato (icono siempre a color)
const FORMAT_COLORS = {
    AMERICANO: '#ccff00',   // padel primary
    DUPLA_FIJA: '#22d3ee',  // cyan
    ROUND_ROBIN: '#818cf8', // indigo
    ELIMINACION_DIRECTA: '#fb923c', // orange
    COMBINADO: '#a78bfa',  // violet
    CUADRO_CONSOLACION: '#10b981',  // emerald
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
    CUADRO_CONSOLACION: ({ className = 'w-5 h-5', color = FORMAT_COLORS.CUADRO_CONSOLACION }: { className?: string; color?: string }) => (
        <svg className={className} style={{ color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 4v4M16 4v4M8 16v4M16 16v4" strokeLinecap="round" />
            <path d="M12 8v3M12 13v3" strokeLinecap="round" />
            <path d="M8 12h3M13 12h3" strokeLinecap="round" />
            <circle cx="12" cy="12" r="2.5" strokeDasharray="1 1" />
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

// Sedes ordenadas alfabéticamente — etiqueta A1, A2, A3… según posición en la lista
const COMPLEXES_RAW = [
    { name: 'El Bodeguero', courts: 3 },
    { name: 'Elite', courts: 4 },
    { name: 'Food Kart', courts: 3 },
    { name: 'Margarita Padel', courts: 6 },
    { name: 'Playa el Agua', courts: 3 },
    { name: 'Sun Sol Costa Azul', courts: 4 },
    { name: 'Sun Sol Pedro Gonzalez', courts: 2 },
    { name: 'Tibisay', courts: 3 },
];
const COMPLEXES = COMPLEXES_RAW.map((c, i) => ({ ...c, label: `A${i + 1}` }));

// ── Estado inicial limpio del Generador Maestro ─────────────────────────
const INITIAL_EVENT_DATA: MasterScheduleConfig = {
    tournamentName: '',
    complexName: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    dailyStartTime: '16:00',
    dailyEndTime: '23:30',
    numCourts: 3,
    courtNames: Array.from({ length: 3 }, (_, i) => `Pista ${i + 1}`),
    matchDurationMinutes: 60,
    bufferMinutes: 10,
    categories: [],
    sponsorLogoUrl: '',
    sponsorName: ''
};

// ── Calcula el total de partidos de una categoría ────────────────────────────
// Cuadro Consolación: 4 equipos → 6 partidos; 5-8 → 10 partidos
// Resto: fase grupos (round-robin o 2 juegos garantizados) + eliminatoria
function calcTotalMatchesForCategory(numTeams: number, groupSize?: number, quickQualification?: boolean, isCuadroConsolacion?: boolean, advanceCount?: number): number {
    if (isCuadroConsolacion) return numTeams <= 4 ? 6 : 10;
    const gs = (groupSize && groupSize >= 2) ? groupSize : 4;
    const numGroups = Math.max(1, Math.floor(numTeams / gs));
    // 2 grupos de 4 con clasificación rápida (1º y 2º) → 7 partidos: 4 en grupos + 2 semis + 1 final
    const twoGroupsOfFour = numGroups === 2 && gs === 4;
    const groupMatches = quickQualification
        ? (twoGroupsOfFour ? 4 : numGroups * gs)
        : numGroups * (gs * (gs - 1)) / 2;
    let knockoutTeams = numGroups * (advanceCount || 2);
    let knockoutMatches = 0;
    while (knockoutTeams > 1) {
        knockoutMatches += Math.floor(knockoutTeams / 2);
        knockoutTeams = Math.floor(knockoutTeams / 2);
    }
    return groupMatches + (numGroups > 1 ? knockoutMatches : 0);
}


export default function MasterGeneratorPage() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        }
    }, [isAdmin, authLoading, router]);

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
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

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
    const [pendingTournamentType, setPendingTournamentType] = useState<'AMERICANO' | 'DUPLA_FIJA' | 'ROUND_ROBIN' | 'ELIMINACION_DIRECTA' | 'COMBINADO' | 'CUADRO_CONSOLACION'>('AMERICANO');
    const [pendingPointsGoal, setPendingPointsGoal] = useState<number>(16);
    // Formato de partido para Round Robin
    const [pendingRRFormat, setPendingRRFormat] = useState<'ONE_SET_6' | 'ONE_SET_9' | 'TWO_SHORT_SETS' | 'TWO_NORMAL_SETS'>('ONE_SET_6');
    const [pendingAdvanceCount, setPendingAdvanceCount] = useState<1 | 2>(2);
    const [pendingQuickQualification, setPendingQuickQualification] = useState(false);
    const [pendingConsolacionMatchFormat, setPendingConsolacionMatchFormat] = useState<'ONE_SET_9' | 'TWO_SHORT_SETS'>('TWO_SHORT_SETS');
    const [pendingPrice, setPendingPrice] = useState<number>(0);

    // Sorteo aleatorio: barajar equipos antes de repartir en grupos (por defecto activado)
    const [sorteoAleatorio, setSorteoAleatorio] = useState(true);
    // Config usado en la última generación (con equipos ya ordenados/sorteados) para guardar grupos coherentes
    const [lastGeneratedConfig, setLastGeneratedConfig] = useState<MasterScheduleConfig | null>(null);

    // Edición de tiempo de partidos (Semis/Finales)
    const [editingMatchIdx, setEditingMatchIdx] = useState<number | null>(null);
    const [newMatchTime, setNewMatchTime] = useState<string>('');

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
        setPendingPrice(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxSize = 5 * 1024 * 1024; // 5 MB
        if (file.size > maxSize) {
            alert('El archivo es demasiado grande. Usa una imagen de menos de 5 MB.');
            return;
        }
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowed.includes(file.type)) {
            alert('Formato no válido. Usa JPG, PNG, GIF o WebP.');
            return;
        }

        setIsUploadingLogo(true);
        try {
            const path = `sponsors/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
            const publicUrl = await dataService.uploadFile(file, path, 'patrocinantes');
            setEventData(prev => ({ ...prev, sponsorLogoUrl: publicUrl }));
        } catch (error: any) {
            console.error('Error uploading logo:', error);
            const msg = (error?.message || String(error)).toLowerCase();
            
            if (msg.includes('row-level security') || msg.includes('rls') || msg.includes('policy') || msg.includes('new row violates row-level security policy')) {
                alert('Storage bloqueado por políticas RLS. En Supabase: Storage → bucket "patrocinantes" → Policies → New policy: permite INSERT y SELECT para el bucket "patrocinantes". Mientras tanto puedes pegar la URL del logo en el campo de texto.');
            } else if (msg.includes('bucket') || msg.includes('not found') || msg.includes('storage')) {
                const bucket = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim() ? process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET : 'public';
                alert(`Bucket "${bucket}" no encontrado. Comprueba en Supabase → Storage que exista un bucket con ese nombre exacto (minúsculas) y "Public bucket" activado.`);
            } else if (msg.includes('configurado') || msg.includes('falta url') || msg.includes('falta anon key')) {
                alert('Supabase no está configurado localmente. Revisa el archivo .env.local.');
            } else {
                alert(`Error al subir el logo: ${error?.message || 'Error desconocido'}. Revisa la consola para más detalles o pega directamente una URL.`);
            }
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handleSubirDesdeUrl = async () => {
        const url = eventData.sponsorLogoUrl;
        if (!url || !url.startsWith('http')) return;

        // Evitar re-subir lo que ya está en nuestro storage
        if (url.includes('supabase.co/storage')) return;

        setIsUploadingLogo(true);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al descargar la imagen');
            const blob = await response.blob();

            // Determinar extensión e imagen
            const extension = blob.type.split('/')[1] || 'png';
            const fileName = `logo-url-${Date.now()}.${extension}`;
            const file = new File([blob], fileName, { type: blob.type });

            const path = `sponsors/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
            const publicUrl = await dataService.uploadFile(file, path, 'patrocinantes');
            setEventData(prev => ({ ...prev, sponsorLogoUrl: publicUrl }));
            alert('¡Imagen importada con éxito a tu galería!');
        } catch (error: any) {
            console.error('Error al subir desde URL:', error);
            alert('No se pudo "subir" automáticamente desde esta URL debido a protecciones de seguridad del sitio externo (CORS). El logo se usará directamente desde su enlace original.');
        } finally {
            setIsUploadingLogo(false);
        }
    };


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
        MAS_40: '+40',
        FEM_40: '+40',
        MIX_40: '+40',
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
        [TournamentCategory.MAS_40]: 7.1,
        [TournamentCategory.FEM_40]: 7.2,
        [TournamentCategory.MIX_40]: 7.3,
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
        setPendingAdvanceCount(2);
        setPendingQuickQualification(false);
        setPendingConsolacionMatchFormat('TWO_SHORT_SETS');
        setPendingPrice(0);
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
                        goldenPoint: pendingTournamentType === 'CUADRO_CONSOLACION' ? true : pendingGolden,
                        setFormat: pendingSetFormat,
                        matchFormat: pendingMatchFormat,
                        groupSize: pendingGroupSize,
                        tournamentType: pendingTournamentType,
                        pointsGoal: pendingPointsGoal,
                        rrMatchFormat: pendingRRFormat,
                        advanceCount: pendingAdvanceCount,
                        quickQualification: pendingTournamentType === 'ROUND_ROBIN' && pendingAdvanceCount === 2 ? pendingQuickQualification : undefined,
                        type: pendingTournamentType === 'CUADRO_CONSOLACION' ? TournamentType.CUADRO_CONSOLACION : TournamentType.ROUND_ROBIN,
                        consolacionMatchFormat: pendingTournamentType === 'CUADRO_CONSOLACION' ? pendingConsolacionMatchFormat : undefined,
                        inscriptionPrice: pendingPrice,
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
                    type: pendingTournamentType === 'CUADRO_CONSOLACION' ? TournamentType.CUADRO_CONSOLACION : TournamentType.ROUND_ROBIN,
                    goldenPoint: pendingTournamentType === 'CUADRO_CONSOLACION' ? true : pendingGolden,
                    setFormat: pendingSetFormat,
                    matchFormat: pendingMatchFormat,
                    groupSize: pendingGroupSize,
                    tournamentType: pendingTournamentType,
                    pointsGoal: pendingPointsGoal,
                    rrMatchFormat: pendingRRFormat,
                    advanceCount: pendingAdvanceCount,
                    quickQualification: pendingTournamentType === 'ROUND_ROBIN' && pendingAdvanceCount === 2 ? pendingQuickQualification : undefined,
                    consolacionMatchFormat: pendingTournamentType === 'CUADRO_CONSOLACION' ? pendingConsolacionMatchFormat : undefined,
                    inscriptionPrice: pendingPrice,
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
                // Si sorteo aleatorio: barajar equipos de cada categoría antes de generar (mismo criterio que el motor)
                const configToUse = sorteoAleatorio
                    ? {
                        ...eventData,
                        categories: eventData.categories.map((cat: any) => ({
                            ...cat,
                            teams: (() => {
                                const list = [...(cat.teams ?? [])];
                                for (let i = list.length - 1; i > 0; i--) {
                                    const j = Math.floor(Math.random() * (i + 1));
                                    [list[i], list[j]] = [list[j], list[i]];
                                }
                                return list;
                            })(),
                        })),
                    }
                    : eventData;
                const result = MasterScheduleEngine.generateMasterSchedule(configToUse);
                setLastGeneratedConfig(configToUse);

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

                // Calcular fecha real de fin según días usados (nunca antes del inicio)
                if ((result as any).daysUsed > 0) {
                    const startD = new Date(eventData.startDate + 'T00:00:00');
                    const calculatedEnd = new Date(startD);
                    calculatedEnd.setDate(calculatedEnd.getDate() + (result as any).daysUsed - 1);
                    const endStr = calculatedEnd.toISOString().split('T')[0];
                    const startStr = eventData.startDate;
                    setEventData(prev => ({
                        ...prev,
                        endDate: endStr >= startStr ? endStr : startStr
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

    const updateMatchTime = (idx: number, newTime: string) => {
        const updated = [...generatedMatches];
        updated[idx] = { ...updated[idx], scheduledTime: new Date(newTime).toISOString() };
        setGeneratedMatches(updated);
    };

    /** Quita undefined y convierte Date a string para que la base de datos acepte el documento. */
    const sanitizeForDatabase = (obj: any): any => {
        if (obj === null || obj === undefined) return null;
        if (Array.isArray(obj)) return obj.map(sanitizeForDatabase);
        if (obj instanceof Date) return obj.toISOString();
        if (typeof obj === 'object') {
            const out: Record<string, any> = {};
            for (const [k, v] of Object.entries(obj)) {
                if (v === undefined) continue;
                out[k] = sanitizeForDatabase(v);
            }
            return out;
        }
        return obj;
    };

    const handleFinalSave = async () => {
        if (!user) return alert('Debes iniciar sesión para crear torneos');
        if (!user?.uid) {
            alert('Sesión no detectada. Por favor, inicia sesión de nuevo.');
            return;
        }
        if (generatedMatches.length === 0) return alert('No hay partidos generados para guardar');

        setIsSaving(true);
        try {
            const results: { id: string; name: string }[] = [];
            // Usar el mismo orden de equipos con el que se generó el fixture (sorteo aleatorio o no)
            const categoriesToSave = lastGeneratedConfig?.categories ?? eventData.categories;

            for (const cat of categoriesToSave) {
                const categoryMatches = generatedMatches.filter(m => m.categoryId === cat.id);
                if (categoryMatches.length === 0) continue;

                const teamsFromCat = cat.teams ?? [];
                // Replicate MasterScheduleEngine's logic for gs exactly
                const gs: number = (cat.groupSize === 3 || cat.groupSize === 4) && cat.groupSize < teamsFromCat.length
                    ? cat.groupSize
                    : teamsFromCat.length;

                const groupAssignments: Record<string, string[]> = {};
                for (let i = 0; i < teamsFromCat.length; i += gs) {
                    const chunk = teamsFromCat.slice(i, i + gs);
                    const groupName = String.fromCharCode(65 + Object.keys(groupAssignments).length);
                    groupAssignments[groupName] = chunk.map((t: any) => String(t?.id ?? ''));
                }

                const teamIdToIndex = new Map<string, number>();
                teamsFromCat.forEach((t: any, idx: number) => { if (t?.id) teamIdToIndex.set(String(t.id), idx + 1); });

                try {
                    // Cada partido: id, stage para grupos, team1Index/team2Index para la vista de grupos
                    const matchesWithIds = categoryMatches.map((m: any, i: number) => {
                        const t1Id = m.team1?.id || m.team1?.p1?.id;
                        const t2Id = m.team2?.id || m.team2?.p1?.id;
                        const team1Index = m.team1Index ?? (t1Id ? teamIdToIndex.get(String(t1Id)) : undefined);
                        const team2Index = m.team2Index ?? (t2Id ? teamIdToIndex.get(String(t2Id)) : undefined);

                        const isGroupStage = m.roundName === 'Fase de Grupos';
                        return {
                            ...m,
                            id: m.id || `m-${cat.id}-${i}-${Date.now().toString(36)}`,
                            scheduledTime: typeof m.scheduledTime === 'string' ? m.scheduledTime : (m.scheduledTime instanceof Date ? m.scheduledTime.toISOString() : new Date().toISOString()),
                            status: m.status ?? MatchStatus.PENDING,
                            stage: isGroupStage ? 'GROUP_STAGE' : (m.roundName?.includes('Consolación') ? 'CONSOLATION' : 'MAIN_DRAW'),
                            ...(team1Index != null && { team1Index }),
                            ...(team2Index != null && { team2Index }),
                        };
                    });

                    const tournamentToSave = {
                        name: `${eventData.tournamentName} - ${catLevelLabels[cat.category] || cat.category} ${catLabels[cat.gender]}`,
                        type: cat.type ?? TournamentType.ROUND_ROBIN,
                        category: cat.category,
                        gender: cat.gender,
                        startDate: eventData.startDate,
                        endDate: eventData.endDate,
                        startTime: eventData.dailyStartTime,
                        endTime: eventData.dailyEndTime,
                        complexName: eventData.complexName ?? '',
                        eventName: eventData.tournamentName ?? '',
                        totalCourts: eventData.numCourts ?? 3,
                        courtNames: eventData.courtNames ?? [],
                        bufferMinutes: eventData.bufferMinutes ?? 10,
                        teams: teamsFromCat,
                        groupAssignments: Object.keys(groupAssignments).length > 0 ? groupAssignments : undefined,
                        groupSize: cat.groupSize,
                        advanceCount: (cat as any).advanceCount ?? 2,
                        pointsGoal: (cat as any).pointsGoal ?? 24,
                        scoringSystem: cat.goldenPoint ? 'GOLDEN_POINT' : 'TRADITIONAL',
                        tieBreakType: cat.setFormat === 'SUPER_TIE_BREAK' ? 'STB' : 'TB',
                        inscriptionPrice: cat.inscriptionPrice ?? 0,
                        maxTeams: cat.numTeams, // Añadimos el cupo máximo
                        registrationStatus: 'open',
                        status: 'Programado',
                        ...(eventData.sponsorLogoUrl?.trim() && {
                            broadcastingSettings: {
                                sponsors: [{ name: 'Patrocinador del evento', logoUrl: eventData.sponsorLogoUrl.trim() }]
                            }
                        }),
                    };

                    // 1. Crear el torneo (metadatos)
                    const docRef = await dataService.createTournament(sanitizeForDatabase(tournamentToSave), user.uid);

                    // 2. Crear los partidos en el nuevo sistema (Supabase)
                    const matchesPromises = matchesWithIds.map(m =>
                        dataService.createMatch(docRef.id, sanitizeForDatabase(m))
                    );
                    await Promise.all(matchesPromises);

                    results.push({ id: docRef.id, name: tournamentToSave.name });
                } catch (catErr: any) {
                    console.error(`Error saving category ${cat.category}:`, catErr);
                    const rawMsg =
                        catErr?.message ||
                        catErr?.error?.message ||
                        (typeof catErr === 'object' ? JSON.stringify(catErr) : String(catErr));
                    throw new Error(`Cat ${cat.category}: ${rawMsg}`);
                }
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
                    '• Si sigue fallando, contacta al soporte técnico para verificar tus permisos de administrador.'
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

    /**
     * Calcula el día y hora de fin del torneo solo con la configuración.
     * Debe coincidir con MasterScheduleEngine: un slot es válido si inicio + duración partido <= cierre.
     */
    const getEstimatedEndFromConfig = (): Date | null => {
        const totalMatches = eventData.categories.reduce(
            (acc, c) => acc + calcTotalMatchesForCategory(
                c.numTeams,
                c.groupSize,
                (c as any).quickQualification,
                (c as any).type === TournamentType.CUADRO_CONSOLACION,
                (c as any).advanceCount
            ),
            0
        );
        if (totalMatches === 0) return null;

        const [startH = 7, startM = 0] = (eventData.dailyStartTime || '07:00').split(':').map(Number);
        let [endH = 22, endM = 0] = (eventData.dailyEndTime || '22:00').split(':').map(Number);
        if (endH < startH || (endH === startH && endM < startM)) endH += 24;
        const dailyStartMins = startH * 60 + startM;
        const dailyEndMins = endH * 60 + endM;
        const dailyMinutes = Math.max(0, dailyEndMins - dailyStartMins);
        const matchDuration = eventData.matchDurationMinutes || 60;
        const buffer = eventData.bufferMinutes || 10;
        const slotLength = matchDuration + buffer;

        // Mismo criterio que MasterScheduleEngine: slot válido si slotStart + matchDuration <= limit
        const slotsPerCourtPerDay = dailyMinutes < matchDuration
            ? 0
            : Math.floor((dailyMinutes - matchDuration) / slotLength) + 1;
        const numCourts = Math.max(1, eventData.numCourts || 1);
        const totalSlotsPerDay = numCourts * slotsPerCourtPerDay;
        if (totalSlotsPerDay === 0) return null;

        const lastMatchIndex = totalMatches - 1;
        const lastDayIndex = Math.floor(lastMatchIndex / totalSlotsPerDay);
        const slotOnDay = lastMatchIndex % totalSlotsPerDay;
        // Orden del engine: por cada franja horaria (slot), recorre todas las canchas
        const slotRow = Math.floor(slotOnDay / numCourts);
        const lastMatchStartMins = dailyStartMins + slotRow * slotLength;
        const lastMatchEndMins = lastMatchStartMins + matchDuration;

        const startD = new Date(eventData.startDate + 'T00:00:00');
        if (isNaN(startD.getTime())) return null;
        const lastDay = new Date(startD);
        lastDay.setDate(lastDay.getDate() + lastDayIndex);
        lastDay.setHours(Math.floor(lastMatchEndMins / 60), lastMatchEndMins % 60, 0, 0);
        return lastDay;
    };

    /** Fecha y hora estimadas de fin del torneo (cuando termina el último partido). Devuelve fecha en una línea y hora debajo. */
    const getEstimatedEndDate = () => {
        const startD = new Date(eventData.startDate + 'T00:00:00');
        let d: Date;

        if (generatedMatches.length > 0) {
            const byTime = [...generatedMatches].sort((a, b) =>
                new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
            );
            const lastMatch = byTime[byTime.length - 1];
            d = new Date(lastMatch.scheduledTime);
            d.setMinutes(d.getMinutes() + (eventData.matchDurationMinutes || 60));
        } else {
            const fromConfig = getEstimatedEndFromConfig();
            if (fromConfig) {
                d = fromConfig;
            } else {
                d = new Date(eventData.endDate + 'T' + (eventData.dailyEndTime || '22:00') + ':00');
                if (isNaN(d.getTime())) d = new Date(eventData.startDate + 'T' + (eventData.dailyEndTime || '22:00') + ':00');
            }
        }
        if (!isNaN(startD.getTime()) && d.getTime() < startD.getTime()) d = startD;
        const day = d.getDate();
        const month = d.toLocaleDateString('es-ES', { month: 'long' });
        const year = d.getFullYear();
        const h = d.getHours();
        const m = d.getMinutes();
        const weekday = d.toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase();

        // Formato pedido: "DIA, MES, AÑO" (ej: 08, MARZO, 2026)
        const fullDateStr = `${day.toString().padStart(2, '0')}, ${month.toUpperCase()}, ${year}`;
        const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} HS`;
        return { dateStr: fullDateStr, timeStr, weekday };
    };


    // Sincronizar eventData.endDate con el fin calculado para que el mismo dato aparezca en evento, categorías y fixture
    useEffect(() => {
        if (generatedMatches.length > 0) return;
        const d = getEstimatedEndFromConfig();
        if (!d) return;
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        setEventData(prev => (prev.endDate === dateStr ? prev : { ...prev, endDate: dateStr }));
    }, [
        eventData.startDate,
        eventData.dailyStartTime,
        eventData.dailyEndTime,
        eventData.numCourts,
        eventData.matchDurationMinutes,
        eventData.bufferMinutes,
        eventData.categories.length,
        eventData.categories.map(c => calcTotalMatchesForCategory(c.numTeams, c.groupSize, (c as any).quickQualification, (c as any).type === TournamentType.CUADRO_CONSOLACION, (c as any).advanceCount)).join(','),
        generatedMatches.length,
    ]);

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

    if (authLoading || !isAdmin) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#ccff00] animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-dvh flex flex-col bg-[#0a0a0b] text-white selection:bg-padel-primary/30 overflow-hidden">

            {/* ─── Modal Editar Horario de Partido ─── */}
            <AnimatePresence>
                {editingMatchIdx !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                        onClick={() => setEditingMatchIdx(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            className="bg-[#111] border border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-padel-primary/10 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-padel-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black italic uppercase text-white leading-none">Editar Horario</h3>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                                            {generatedMatches[editingMatchIdx]?.roundName}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setEditingMatchIdx(null)} className="text-zinc-500 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nueva Fecha y Hora</label>
                                    <div className="relative">
                                        <input
                                            type="datetime-local"
                                            value={newMatchTime}
                                            onChange={(e) => setNewMatchTime(e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:border-padel-primary focus:ring-1 focus:ring-padel-primary outline-none transition-all appearance-none"
                                        />
                                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button
                                        onClick={() => setEditingMatchIdx(null)}
                                        className="h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm transition-all active:scale-[0.98]"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateMatchTime(editingMatchIdx!, newMatchTime);
                                            setEditingMatchIdx(null);
                                        }}
                                        className="h-12 rounded-2xl bg-padel-primary hover:bg-padel-primary/90 text-black font-black text-sm uppercase italic transition-all active:scale-[0.98] shadow-lg shadow-padel-primary/20"
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Modal Configuración de Categoría ─── */}
            <AnimatePresence>
                {pendingCat && (
                    <motion.div
                        key="modal-bg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
                        onClick={() => setPendingCat(null)}
                    >
                        <div className="bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800 w-[95%] sm:w-[90%] md:max-w-xl rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden relative border-t-padel-primary/40 border-t-2 max-h-[90dvh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header sticky */}
                            <div className="p-6 md:p-8 shrink-0">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-padel-primary rounded-2xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]">
                                            <Settings className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">Configurar <span className="text-padel-primary">Categoría</span></h3>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{catLabels[pendingCat.gender]} · {catLevelLabels[pendingCat.category] || pendingCat.category}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setPendingCat(null)}
                                        className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-zinc-600 hover:text-white transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable content area */}
                            <motion.div
                                className="px-6 md:px-8 pb-6 md:pb-8 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent space-y-4"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                {/* ── Category Configuration Content ── */}
                                <div className="space-y-4">
                                    {/* ── Row 1: Número de Parejas ── */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                                            <Users className="w-3 h-3 text-padel-primary" /> Número de Parejas
                                        </label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {[4, 6, 8, 10, 12, 14, 16, 20, 24, 32].map(n => (
                                                <button
                                                    key={n}
                                                    type="button"
                                                    onClick={() => setPendingNumTeams(n)}
                                                    className={`min-h-[40px] px-3 rounded-lg text-xs font-black transition-all select-none touch-manipulation active:scale-[0.98] ${pendingNumTeams === n ? 'bg-padel-primary text-black shadow-md' : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3 bg-black/40 border border-zinc-800 rounded-xl px-4 py-2">
                                            <button
                                                type="button"
                                                onClick={() => setPendingNumTeams(t => Math.max(2, t - 1))}
                                                className="min-w-[40px] min-h-[40px] rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center font-black text-lg text-white transition-all active:scale-95 select-none touch-manipulation"
                                            >−</button>
                                            <div className="flex-1 text-center">
                                                <span className="text-xl font-black text-padel-primary">{pendingNumTeams}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setPendingNumTeams(t => Math.min(64, t + 1))}
                                                className="min-w-[40px] min-h-[40px] rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center font-black text-lg text-white transition-all active:scale-95 select-none touch-manipulation"
                                            >+</button>
                                        </div>
                                    </div>

                                    {/* ── Row 2: Formato del Torneo ── */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                                            <Trophy className="w-3 h-3 text-padel-primary" /> Formato del Torneo
                                        </label>
                                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                                            {([
                                                { val: 'AMERICANO' as const, label: 'Americano', desc: 'Parejas rotativas' },
                                                { val: 'DUPLA_FIJA' as const, label: 'Dupla Fija', desc: 'Parejas fijas' },
                                                { val: 'ROUND_ROBIN' as const, label: 'Round Robin', desc: 'Grupos' },
                                                { val: 'ELIMINACION_DIRECTA' as const, label: 'Directa', desc: 'Llave directa' },
                                                { val: 'COMBINADO' as const, label: 'Combinado', desc: 'Grupos + Llave' },
                                                { val: 'CUADRO_CONSOLACION' as const, label: 'Cuadro Consol.', desc: 'Mín. 2 partidos' },
                                            ]).map(opt => {
                                                const isSelected = pendingTournamentType === opt.val;
                                                return (
                                                    <button
                                                        key={opt.val}
                                                        type="button"
                                                        onClick={() => setPendingTournamentType(opt.val)}
                                                        className={`relative flex flex-col items-center text-center gap-1 rounded-lg p-1.5 border transition-all select-none touch-manipulation active:scale-[0.98] ${isSelected
                                                            ? 'bg-padel-primary/10 border-padel-primary text-white shadow-[0_0_15px_rgba(204,255,0,0.15)]'
                                                            : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-padel-primary/40 hover:bg-zinc-900'
                                                            }`}
                                                    >
                                                        <div
                                                            className="w-7 h-7 rounded-md border flex items-center justify-center shrink-0 bg-black/50 border-zinc-700"
                                                            style={isSelected ? { borderColor: FORMAT_COLORS[opt.val], boxShadow: `0 0 8px ${FORMAT_COLORS[opt.val]}30` } : undefined}
                                                        >
                                                            {opt.val === 'AMERICANO' && <FormatIcons.AMERICANO className="w-4 h-4" />}
                                                            {opt.val === 'DUPLA_FIJA' && <FormatIcons.DUPLA_FIJA className="w-4 h-4" />}
                                                            {opt.val === 'ROUND_ROBIN' && <FormatIcons.ROUND_ROBIN className="w-4 h-4" />}
                                                            {opt.val === 'ELIMINACION_DIRECTA' && <FormatIcons.ELIMINATORIO className="w-4 h-4" />}
                                                            {opt.val === 'COMBINADO' && <FormatIcons.COMBINADO className="w-4 h-4" />}
                                                            {opt.val === 'CUADRO_CONSOLACION' && <FormatIcons.CUADRO_CONSOLACION className="w-4 h-4" />}
                                                        </div>
                                                        <div className="w-full">
                                                            <div className="text-[7px] md:text-[8px] font-black italic uppercase tracking-tighter leading-none truncate">
                                                                {opt.label}
                                                            </div>
                                                            <p className={`text-[6px] font-bold mt-0.5 leading-none truncate ${isSelected ? 'text-padel-primary/80' : 'text-zinc-600'}`}>
                                                                {opt.desc}
                                                            </p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* ── SECCIÓN DE OPCIONES DINÁMICAS ── */}
                                    <AnimatePresence mode="wait">
                                        {/* 1. AMERICANO / DUPLA FIJA: Objetivo de Puntos y Precio */}
                                        {(pendingTournamentType === 'AMERICANO' || pendingTournamentType === 'DUPLA_FIJA') && (
                                            <motion.div
                                                key="americano-options"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="space-y-4"
                                            >
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                                                        <Trophy className="w-3 h-3 text-yellow-400" /> Objetivo de Puntos
                                                    </label>
                                                    <div className="grid grid-cols-6 gap-2">
                                                        {[4, 8, 12, 16, 20, 24].map(pts => (
                                                            <button
                                                                key={pts}
                                                                type="button"
                                                                onClick={() => setPendingPointsGoal(pts)}
                                                                className={`min-h-[44px] py-2 rounded-xl border-2 font-black italic text-xs transition-all active:scale-[0.98] ${pendingPointsGoal === pts ? 'bg-padel-primary border-padel-primary text-black' : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}
                                                            >
                                                                {pts}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Precio de Inscripción */}
                                                <div className="space-y-2 pt-2 border-t border-zinc-900/50">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                                                        <DollarSign className="w-3 h-3 text-emerald-400" /> Precio de Inscripción
                                                    </label>
                                                    <div className="relative group">
                                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-padel-primary transition-colors" />
                                                        <input
                                                            type="number"
                                                            value={pendingPrice}
                                                            onChange={(e) => setPendingPrice(Number(e.target.value) || 0)}
                                                            placeholder="0.00"
                                                            className="w-full bg-black/40 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm font-black italic text-white focus:border-padel-primary outline-none transition-all placeholder:text-zinc-700"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* 2. FORMATOS ESTÁNDAR (RR, Directa, Combinado, Cuadro) */}
                                        {['ROUND_ROBIN', 'ELIMINACION_DIRECTA', 'COMBINADO', 'CUADRO_CONSOLACION'].includes(pendingTournamentType) && (
                                            <motion.div
                                                key="standard-options"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="space-y-5"
                                            >
                                                {/* A. Configuración de Grupos (solo RR / Combinado) */}
                                                {(pendingTournamentType === 'ROUND_ROBIN' || pendingTournamentType === 'COMBINADO') && (
                                                    <div className="grid grid-cols-2 gap-4 pb-2 border-b border-zinc-900/50">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                                                                <Layers className="w-3 h-3 text-padel-primary" /> Tamaño de Grupos
                                                            </label>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {[3, 4].map(size => (
                                                                    <button
                                                                        key={size}
                                                                        type="button"
                                                                        onClick={() => setPendingGroupSize(size as 3 | 4)}
                                                                        className={`min-h-[36px] rounded-lg border font-black text-[10px] transition-all ${pendingGroupSize === size ? 'bg-padel-primary border-padel-primary text-black' : 'bg-black/30 border-zinc-800 text-zinc-500'}`}
                                                                    >
                                                                        {size} Parejas
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                                                                <Trophy className="w-3 h-3 text-padel-primary" /> Pasan por grupo
                                                            </label>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {[1, 2].map(n => (
                                                                    <button
                                                                        key={n}
                                                                        type="button"
                                                                        onClick={() => setPendingAdvanceCount(n as 1 | 2)}
                                                                        className={`min-h-[36px] rounded-lg border font-black text-[10px] transition-all ${pendingAdvanceCount === n ? 'bg-padel-primary border-padel-primary text-black' : 'bg-black/30 border-zinc-800 text-zinc-500'}`}
                                                                    >
                                                                        {n === 1 ? 'Solo 1º' : '1º y 2º'}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* B. Formato de Partido (A cuántos games) */}
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                                                        <Layout className="w-3 h-3 text-blue-400" /> A cuántos games es el partido
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {[
                                                            { val: 'ONE_SET_6', label: 'Set Normal (6 juegos)' },
                                                            { val: 'ONE_SET_9', label: 'Set Largo (9 juegos)' },
                                                            { val: 'TWO_SHORT_SETS', label: '2 Sets Cortos (4) + STB' },
                                                            { val: 'TWO_NORMAL_SETS', label: '2 Sets Largos (6) + STB' },
                                                        ].map(opt => {
                                                            const isSelected = pendingTournamentType === 'CUADRO_CONSOLACION'
                                                                ? pendingConsolacionMatchFormat === opt.val
                                                                : pendingRRFormat === opt.val;
                                                            return (
                                                                <button
                                                                    key={opt.val}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (pendingTournamentType === 'CUADRO_CONSOLACION') setPendingConsolacionMatchFormat(opt.val as any);
                                                                        else setPendingRRFormat(opt.val as any);
                                                                    }}
                                                                    className={`min-h-[44px] px-3 rounded-xl border-2 font-black italic text-[9px] uppercase transition-all active:scale-[0.98] ${isSelected ? 'bg-padel-primary border-padel-primary text-black' : 'bg-black/30 border-zinc-800 text-zinc-500'}`}
                                                                >
                                                                    {opt.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* C. Clasificación rápida */}
                                                {(pendingTournamentType === 'ROUND_ROBIN' || pendingTournamentType === 'COMBINADO') && pendingAdvanceCount === 2 && (
                                                    <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/50">
                                                        <label className="flex items-center gap-2.5 cursor-pointer group">
                                                            <input
                                                                type="checkbox"
                                                                checked={pendingQuickQualification}
                                                                onChange={(e) => setPendingQuickQualification(e.target.checked)}
                                                                className="w-4 h-4 rounded border-2 border-zinc-600 bg-zinc-900 text-padel-primary focus:ring-padel-primary/50"
                                                            />
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300 group-hover:text-white transition-colors">Clasificación rápida (mín. 2 partidos)</span>
                                                        </label>
                                                    </div>
                                                )}

                                                {/* D. Sistema de Puntuación y Desempate */}
                                                <div className="grid grid-cols-2 gap-4 pt-2">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Sistema de Puntuación</label>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setPendingGolden(true)}
                                                                className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${pendingGolden ? 'bg-padel-primary border-padel-primary text-black' : 'bg-zinc-900/60 border-zinc-800 text-zinc-500'}`}
                                                            >
                                                                Punto de Oro
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setPendingGolden(false)}
                                                                className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${!pendingGolden ? 'bg-padel-primary border-padel-primary text-black' : 'bg-zinc-900/60 border-zinc-800 text-zinc-500'}`}
                                                            >
                                                                Tradicional
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Método de Desempate</label>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setPendingSetFormat('TIE_BREAK')}
                                                                className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${pendingSetFormat === 'TIE_BREAK' ? 'bg-padel-primary border-padel-primary text-black' : 'bg-zinc-900/60 border-zinc-800 text-zinc-500'}`}
                                                            >
                                                                TB (7 pts)
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setPendingSetFormat('SUPER_TIE_BREAK')}
                                                                className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${pendingSetFormat === 'SUPER_TIE_BREAK' ? 'bg-padel-primary border-padel-primary text-black' : 'bg-zinc-900/60 border-zinc-800 text-zinc-500'}`}
                                                            >
                                                                STB (10 pts)
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* E. Precio de Inscripción */}
                                                <div className="space-y-2 pt-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                                                        <DollarSign className="w-3 h-3 text-emerald-400" /> Precio de Inscripción
                                                    </label>
                                                    <div className="relative group">
                                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-padel-primary transition-colors" />
                                                        <input
                                                            type="number"
                                                            value={pendingPrice}
                                                            onChange={(e) => setPendingPrice(Number(e.target.value) || 0)}
                                                            placeholder="0.00"
                                                            className="w-full bg-black/40 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm font-black italic text-white focus:border-padel-primary outline-none transition-all placeholder:text-zinc-700"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>

                            {/* Confirm — full width, touch-friendly */}
                            <div className="p-6 md:p-8 pt-0 shrink-0">
                                <button
                                    type="button"
                                    onClick={confirmAddCategory}
                                    className="w-full min-h-[52px] md:min-h-[56px] bg-padel-primary hover:bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm md:text-base select-none touch-manipulation"
                                >
                                    <Plus className="w-5 h-5 md:w-6 md:h-6" /> AÑADIR CATEGORÍA
                                </button>
                            </div>
                        </div>
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

                {/* Header — compact: etapas centradas */}
                <header className="flex items-center gap-4 mb-3 shrink-0">
                    <button
                        type="button"
                        onClick={() => {
                            if (step > 1) setStep(step - 1);
                            else router.back();
                        }}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors shrink-0 p-2 -ml-2 rounded-xl hover:bg-white/5"
                        aria-label="Atrás"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Atrás</span>
                    </button>
                    <div className="flex items-center gap-2.5 flex-1">
                        <div className="w-8 h-8 bg-padel-primary/10 border border-padel-primary/20 rounded-xl flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-padel-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black italic uppercase tracking-tighter leading-none">
                                Generador <span className="text-padel-primary">Maestro</span>
                            </h1>
                            <p className="text-[10px] text-zinc-500 font-medium hidden sm:block">Programación Multi-Categoría</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-1 bg-zinc-900/70 backdrop-blur-xl p-1.5 rounded-xl border border-zinc-800 shrink-0">
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

                    <div className="flex-1" />
                </header>


                {/* content area — fills remaining height, scrolls inside */}
                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">

                    {/* Main Form — scrollable */}
                    <main className="lg:col-span-12 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent pb-8">
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
                                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl p-3 text-base font-bold text-white focus:border-padel-primary outline-none transition-all"
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
                                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl p-3 outline-none focus:border-padel-primary transition-all font-bold text-white"
                                                >
                                                    <option value="" disabled>— Selecciona una sede —</option>
                                                    {COMPLEXES.map(c => (
                                                        <option key={c.name} value={c.name}>{c.label} — {c.name} ({c.courts} pistas)</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                            <div className="space-y-1.5 min-w-0">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2 h-5">
                                                    <UserPlus className="w-3.5 h-3.5 text-padel-primary shrink-0" />
                                                    Nombre del Patrocinante
                                                </label>
                                                <input
                                                    type="text"
                                                    value={eventData.sponsorName ?? ''}
                                                    onChange={(e) => setEventData({ ...eventData, sponsorName: e.target.value })}
                                                    placeholder="Ej: Banco Mercantil"
                                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl p-3 text-sm font-medium text-white focus:border-padel-primary outline-none transition-all"
                                                />
                                            </div>

                                            <div className="space-y-1.5 min-w-0">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2 h-5">
                                                    <ImageIcon className="w-3.5 h-3.5 text-padel-primary shrink-0" />
                                                    Logo del patrocinante
                                                </label>
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => document.getElementById('logo-upload')?.click()}
                                                        disabled={isUploadingLogo}
                                                        className="shrink-0 flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl transition-all disabled:opacity-50 text-sm font-bold border border-zinc-700/50"
                                                    >
                                                        <Upload className="w-4 h-4" />
                                                        {isUploadingLogo ? 'Subiendo...' : 'SUBIR LOGO'}
                                                    </button>

                                                    <div className="flex-1 relative group">
                                                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500">
                                                            <LinkIcon className="w-4 h-4" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={eventData.sponsorLogoUrl || ''}
                                                            onChange={e => setEventData(prev => ({ ...prev, sponsorLogoUrl: e.target.value }))}
                                                            placeholder="O pega una URL..."
                                                            className="w-full bg-black/40 border border-zinc-800 rounded-xl py-2.5 pl-9 pr-16 text-xs text-white focus:border-padel-primary outline-none transition-all placeholder:text-zinc-700"
                                                        />
                                                        {eventData.sponsorLogoUrl && eventData.sponsorLogoUrl.startsWith('http') && !eventData.sponsorLogoUrl.includes('supabase.co/storage') && (
                                                            <button
                                                                type="button"
                                                                onClick={handleSubirDesdeUrl}
                                                                disabled={isUploadingLogo}
                                                                className="absolute right-1 top-1 bottom-1 px-3 bg-padel-primary/20 hover:bg-padel-primary text-padel-primary hover:text-white rounded-lg transition-all text-[10px] font-bold disabled:opacity-50"
                                                            >
                                                                {isUploadingLogo ? '...' : 'SUBIR'}
                                                            </button>
                                                        )}
                                                    </div>

                                                    {eventData.sponsorLogoUrl && (
                                                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center p-1 group relative">
                                                            <img src={eventData.sponsorLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                                                            <button
                                                                type="button"
                                                                onClick={() => setEventData(prev => ({ ...prev, sponsorLogoUrl: '' }))}
                                                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                                            >
                                                                <X className="w-4 h-4 text-white" />
                                                            </button>
                                                        </div>
                                                    )}

                                                    <input
                                                        id="logo-upload"
                                                        type="file"
                                                        onChange={handleLogoUpload}
                                                        className="hidden"
                                                        accept="image/*"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch col-span-2">
                                                <div className="space-y-1.5 min-w-0">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2 h-5">
                                                        <Calendar className="w-3.5 h-3.5 text-padel-primary shrink-0" />
                                                        Fecha Inicio
                                                    </label>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                                        <input
                                                            type="date"
                                                            value={eventData.startDate}
                                                            onChange={(e) => {
                                                                const newStart = e.target.value;
                                                                const next = { ...eventData, startDate: newStart };
                                                                if (newStart && eventData.endDate && eventData.endDate < newStart) next.endDate = newStart;
                                                                setEventData(next);
                                                            }}
                                                            className="w-full bg-black/50 border border-zinc-700 rounded-xl p-3 pl-9 outline-none focus:border-padel-primary text-white"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5 min-w-0">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2 h-5">
                                                        <Trophy className="w-3.5 h-3.5 text-padel-primary shrink-0" />
                                                        Duración
                                                    </label>
                                                    <div className="w-full bg-black/50 border border-zinc-700 rounded-xl p-3 flex items-center gap-2">
                                                        <Trophy className="w-4 h-4 text-padel-primary shrink-0" />
                                                        <p className="text-sm font-bold text-white uppercase italic leading-tight">Calculada por IA</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 col-span-2 pt-2">
                                                <div className="space-y-1.5 min-w-0">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2 h-5">
                                                        <Clock className="w-3.5 h-3.5 text-padel-primary shrink-0" />
                                                        Apertura
                                                    </label>
                                                    <div className="relative">
                                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                                                        <input
                                                            type="time"
                                                            value={eventData.dailyStartTime}
                                                            onChange={(e) => setEventData({ ...eventData, dailyStartTime: e.target.value })}
                                                            className="w-full bg-black/50 border border-zinc-700 rounded-xl p-3 pl-8 outline-none focus:border-padel-primary text-sm text-white"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5 min-w-0">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2 h-5">
                                                        <Clock className="w-3.5 h-3.5 text-padel-primary shrink-0" />
                                                        Cierre{eventData.dailyEndTime < eventData.dailyStartTime && <span className="ml-1 text-padel-primary">(+1d)</span>}
                                                    </label>
                                                    <div className="relative">
                                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                                                        <input
                                                            type="time"
                                                            value={eventData.dailyEndTime}
                                                            onChange={(e) => setEventData({ ...eventData, dailyEndTime: e.target.value })}
                                                            className="w-full bg-black/50 border border-zinc-700 rounded-xl p-3 pl-8 outline-none focus:border-padel-primary text-sm text-white"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Duración (min)</label>
                                                    <input
                                                        type="number"
                                                        min={30} max={180} step={5}
                                                        value={eventData.matchDurationMinutes}
                                                        onChange={(e) => setEventData({ ...eventData, matchDurationMinutes: parseInt(e.target.value) || 60 })}
                                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl p-3 outline-none focus:border-padel-primary font-bold text-center text-base text-white"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Buffer (min)</label>
                                                    <input
                                                        type="number"
                                                        min={0} max={60} step={5}
                                                        value={eventData.bufferMinutes}
                                                        onChange={(e) => setEventData({ ...eventData, bufferMinutes: parseInt(e.target.value) || 10 })}
                                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl p-3 outline-none focus:border-padel-primary font-bold text-center text-base text-white"
                                                    />
                                                </div>
                                            </div>
                                            {/* Resumen horario */}
                                            <div className="bg-black/30 rounded-xl p-3 flex flex-wrap gap-3 text-[10px] font-bold col-span-2">
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
                                        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
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
                                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 space-y-4 max-w-2xl mx-auto">
                                            <div className="flex items-center justify-center gap-3 border-b border-zinc-800 pb-3">
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
                                                    TournamentCategory.SEPTIMA, 
                                                    activeGender === 'MALE' ? TournamentCategory.MAS_40 : 
                                                    activeGender === 'FEMALE' ? TournamentCategory.FEM_40 : 
                                                    TournamentCategory.MIX_40,
                                                    TournamentCategory.MAS_45,
                                                    TournamentCategory.MAS_50, TournamentCategory.SUMA_7,
                                                    TournamentCategory.SUMA_8, TournamentCategory.SUMA_9,
                                                    TournamentCategory.SUMA_10, TournamentCategory.SUMA_11
                                                ].map(level => {
                                                    const exists = eventData.categories.some(c => c.gender === activeGender && c.category === level);

                                                    // Colores dinámicos por género
                                                    const isMale = activeGender === 'MALE';
                                                    const isFemale = activeGender === 'FEMALE';
                                                    const isMixed = activeGender === 'MIXED';

                                                    let buttonClasses = "";
                                                    if (exists) {
                                                        if (isMale) buttonClasses = "bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]";
                                                        else if (isFemale) buttonClasses = "bg-pink-500/10 border-pink-500 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.2)]";
                                                        else buttonClasses = "bg-purple-500/10 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]";
                                                    } else {
                                                        const hoverClasses = isMale ? "hover:border-blue-500 hover:text-blue-400 hover:bg-blue-500/5" :
                                                            isFemale ? "hover:border-pink-500 hover:text-pink-400 hover:bg-pink-500/5" :
                                                                "hover:border-purple-500 hover:text-purple-400 hover:bg-purple-500/5";
                                                        buttonClasses = `bg-black/40 border-zinc-800 text-zinc-500 ${hoverClasses}`;
                                                    }

                                                    return (
                                                        <button
                                                            key={level}
                                                            onClick={() => {
                                                                if (exists) {
                                                                    const catObj = eventData.categories.find(c => c.gender === activeGender && c.category === level);
                                                                    if (catObj) removeCategory(catObj.id);
                                                                } else {
                                                                    addCategory(activeGender, level);
                                                                }
                                                            }}
                                                            className={`relative p-2.5 rounded-xl border-2 transition-all text-center text-[10px] font-black uppercase italic tracking-tighter active:scale-95 ${buttonClasses}`}
                                                        >
                                                            {catLevelLabels[level] || level}
                                                            {exists && (
                                                                <div className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#0a0a0a] ${isMale ? 'bg-blue-500' : isFemale ? 'bg-pink-500' : 'bg-purple-500'
                                                                    }`}>
                                                                    <Check className="w-2.5 h-2.5 text-black" strokeWidth={4} />
                                                                </div>
                                                            )}
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
                                                                    setPendingTournamentType((cat as any).tournamentType ?? 'ROUND_ROBIN');
                                                                    setPendingRRFormat((cat as any).rrMatchFormat ?? 'ONE_SET_6');
                                                                    setPendingAdvanceCount((cat as any).advanceCount ?? 2);
                                                                    setPendingQuickQualification(!!(cat as any).quickQualification);
                                                                    setPendingConsolacionMatchFormat((cat as any).consolacionMatchFormat ?? 'TWO_SHORT_SETS');
                                                                    setPendingPrice(cat.inscriptionPrice ?? 0);
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
                                                            {calcTotalMatchesForCategory(cat.numTeams, cat.groupSize, (cat as any).quickQualification, (cat as any).type === TournamentType.CUADRO_CONSOLACION, (cat as any).advanceCount)} partidos
                                                        </span>
                                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${cat.goldenPoint ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                                                            {cat.goldenPoint ? '⭐ Punto de Oro' : '⚖️ Deuce'}
                                                        </span>
                                                        <span className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md">
                                                            {cat.setFormat === 'TIE_BREAK' ? '🎾 Tie-Break' : cat.setFormat === 'SUPER_TIE_BREAK' ? '⚡ Super TB' : '🔁 Sin TB'}
                                                        </span>
                                                        {cat.inscriptionPrice !== undefined && (
                                                            <span className="ml-auto text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                                <DollarSign className="w-3 h-3" /> {cat.inscriptionPrice}
                                                            </span>
                                                        )}
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
                                                    onChange={(e) => setEventData({ ...eventData, matchDurationMinutes: Number(e.target.value) || 60 })}
                                                    className="w-full bg-black/50 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-padel-primary transition-all font-bold text-white"
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
                                                    className="w-full bg-black/50 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-blue-400 transition-all font-bold text-white"
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
                                                                className="bg-transparent border-none outline-none text-sm font-bold w-full focus:text-padel-primary transition-colors text-white"
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
                                                    <Trophy className="w-5 h-5 text-padel-primary" />
                                                    <h3 className="font-black uppercase tracking-tighter text-sm text-padel-primary">Resumen Pre-Generación</h3>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-black/30 rounded-2xl p-4 text-center">
                                                        <div className="text-2xl font-black text-white">
                                                            {eventData.categories.reduce((acc, c) => acc + calcTotalMatchesForCategory(c.numTeams, c.groupSize, (c as any).quickQualification, (c as any).type === TournamentType.CUADRO_CONSOLACION, (c as any).advanceCount), 0)}
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
                                                        <div className="text-[10px] font-bold uppercase font-bold mt-1">Categorías</div>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    {eventData.categories.map((c, i) => (
                                                        <div key={c.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-black/20">
                                                            <span className="font-bold text-zinc-300">{c.gender === 'MALE' ? '♂' : c.gender === 'FEMALE' ? '♀' : '🚻'} {catLevelLabels[c.category] || c.category}</span>
                                                            <span className="text-padel-primary font-black">{c.teams?.length || c.numTeams} parejas por inscribirse · {calcTotalMatchesForCategory(c.numTeams, c.groupSize, (c as any).quickQualification, (c as any).type === TournamentType.CUADRO_CONSOLACION, (c as any).advanceCount)} partidos</span>
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
                                                    <Trophy className={`w-3 h-3 ${getIntensityLabel().color}`} />
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${getIntensityLabel().color}`}>
                                                        {getIntensityLabel().label}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase italic">
                                                    Fin Estimado: <span className="text-white block font-black">{getEstimatedEndDate().dateStr}</span>
                                                    <span className="text-padel-primary block text-[9px] mt-0.5">{getEstimatedEndDate().weekday} · {getEstimatedEndDate().timeStr}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <span className="bg-padel-primary/10 text-padel-primary px-4 py-2 rounded-xl text-sm font-bold border border-padel-primary/20 leading-none flex items-center">
                                                {generatedMatches.length} Partidos
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden border-t-4 border-t-padel-primary shadow-2xl">
                                        <div className="overflow-hidden">
                                            <table className="w-full text-left table-fixed">
                                                <thead className="bg-black/50 border-b border-zinc-800 uppercase text-xs tracking-widest font-black text-zinc-400">
                                                    <tr>
                                                        <th className="px-4 py-3">Detalle del Partido (Hora, Pista, Categoría y Encuentro)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-800">
                                                    {generatedMatches.map((m, idx) => (
                                                        <tr key={idx} className="hover:bg-zinc-800/30 transition-colors group">
                                                            <td className="px-4 py-3 min-w-0">
                                                                <div className="grid grid-cols-[auto_auto_minmax(0,1fr)_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 md:gap-x-4">
                                                                    {/* Time column inside row */}
                                                                    <div
                                                                        className={`flex flex-col shrink-0 w-min min-w-[56px] ${((m.roundName?.toUpperCase() || '').includes('FINAL') || (m.roundName?.toUpperCase() || '').includes('SF')) ? 'cursor-pointer hover:bg-white/5 p-1 -m-1 rounded-lg transition-colors' : ''}`}
                                                                        onDoubleClick={() => {
                                                                            const isEditable = (m.roundName?.toUpperCase() || '').includes('FINAL') || (m.roundName?.toUpperCase() || '').includes('SF');
                                                                            if (isEditable) {
                                                                                setEditingMatchIdx(idx);
                                                                                // Convertir UTC a locale para el input datetime-local
                                                                                const dateObj = new Date(m.scheduledTime);
                                                                                const yyyy = dateObj.getFullYear();
                                                                                const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
                                                                                const dd = String(dateObj.getDate()).padStart(2, '0');
                                                                                const hh = String(dateObj.getHours()).padStart(2, '0');
                                                                                const min = String(dateObj.getMinutes()).padStart(2, '0');
                                                                                setNewMatchTime(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
                                                                            }
                                                                        }}
                                                                        title={(m.roundName?.toUpperCase() || '').includes('FINAL') || (m.roundName?.toUpperCase() || '').includes('SF') ? 'Doble clic para editar horario del partido' : ''}
                                                                    >
                                                                        <span className="text-padel-primary font-black italic text-base leading-none tracking-tighter">
                                                                            {new Date(m.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                        <span className="text-[9px] text-zinc-500 font-bold uppercase mt-1 tracking-widest truncate">
                                                                            {new Date(m.scheduledTime).toLocaleDateString([], { weekday: 'short', day: 'numeric' })}
                                                                        </span>
                                                                        {((m.roundName?.toUpperCase() || '').includes('FINAL') || (m.roundName?.toUpperCase() || '').includes('SF')) && (
                                                                            <span className="text-[8px] text-padel-primary/60 font-black italic uppercase tracking-tighter leading-none mt-1">
                                                                                EDICIÓN ⚡
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* Court column inside row */}
                                                                    <div className="shrink-0">
                                                                        <span className="text-xs font-black text-black px-2 py-0.5 bg-padel-primary rounded uppercase tracking-tighter">
                                                                            {m.courtName}
                                                                        </span>
                                                                    </div>

                                                                    {/* Category & Round column inside row */}
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <div className="flex flex-col gap-0.5 min-w-0">
                                                                            <div className="flex items-center gap-1.5 min-w-0">
                                                                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter truncate ${(m.roundName || '').includes('FINAL') ? 'bg-padel-primary text-black' : 'bg-zinc-800 text-padel-primary border border-padel-primary/20'}`} title={m.roundName}>
                                                                                    {m.roundName}
                                                                                </span>
                                                                            </div>
                                                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter truncate" title={m.categoryName}>
                                                                                {m.categoryName.replace('MALE', 'MASCULINO').replace('FEMALE', 'FEMENINO').replace('MIXED', 'MIXTO')}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Team 1 — alineado a la derecha */}
                                                                    <div className="min-w-0 text-right text-[11px] font-bold text-white truncate flex items-center justify-end">
                                                                        <div className="flex flex-col gap-0.5 mr-2">
                                                                            <span className="text-zinc-500 text-[8px] uppercase font-black leading-none">EQUIPO</span>
                                                                            {m.team1Index && (
                                                                                <span className="inline-flex items-center justify-center h-5 px-1.5 bg-padel-primary text-black text-[10px] font-black rounded italic -skew-x-12">
                                                                                    #{m.team1Index}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <span>{m.team1Name}</span>
                                                                    </div>
                                                                    {/* VS — columna fija para alinear todos en vertical */}
                                                                    <div className="px-2 py-0.5 bg-zinc-800 rounded font-black text-[10px] text-zinc-500 italic shrink-0 justify-self-center">VS</div>
                                                                    {/* Team 2 — alineado a la izquierda */}
                                                                    <div className="min-w-0 text-left text-[11px] font-bold text-white truncate flex items-center">
                                                                        <div className="flex flex-col gap-0.5 ml-0.5 mr-2">
                                                                            <span className="text-zinc-500 text-[8px] uppercase font-black leading-none">EQUIPO</span>
                                                                            {m.team2Index && (
                                                                                <span className="inline-flex items-center justify-center h-5 px-1.5 bg-padel-primary text-black text-[10px] font-black rounded italic -skew-x-12">
                                                                                    #{m.team2Index}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <span>{m.team2Name}</span>
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

                        {/* Navigation Buttons */}
                        <div className="max-w-md mx-auto mt-12 mb-16 space-y-6">
                            <div className="space-y-4">
                                {step < 3 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="w-full min-h-[64px] bg-padel-primary hover:bg-white text-black font-black py-4 rounded-[1.5rem] flex items-center justify-center gap-2 transition-all shadow-[0_10px_30px_rgba(204,255,0,0.25)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.2)] text-lg uppercase tracking-tighter italic active:scale-[0.98]"
                                    >
                                        Continuar <ChevronRight className="w-6 h-6" />
                                    </button>
                                ) : step === 3 ? (
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-3 cursor-pointer text-sm text-zinc-300">
                                            <input
                                                type="checkbox"
                                                checked={sorteoAleatorio}
                                                onChange={(e) => setSorteoAleatorio(e.target.checked)}
                                                className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-padel-primary focus:ring-padel-primary"
                                            />
                                            <span>Sorteo aleatorio (repartir equipos al azar en grupos)</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleGenerate}
                                            disabled={isGenerating || eventData.numCourts === 0 || eventData.categories.length === 0}
                                            className="w-full min-h-[64px] bg-padel-primary hover:bg-white text-black font-black py-4 rounded-[1.5rem] flex items-center justify-center gap-2 transition-all shadow-[0_10px_30px_rgba(204,255,0,0.25)] text-lg uppercase tracking-tighter italic active:scale-[0.98] disabled:opacity-50 group"
                                        >
                                            {isGenerating ? (
                                                <>GENERANDO...</>
                                            ) : (
                                                <>GENERAR FIXTURE <Trophy className="w-6 h-6 group-hover:scale-125 transition-transform" /></>
                                            )}
                                        </button>
                                    </div>
                                ) : step === 4 ? (
                                    <div className="space-y-3">
                                        <button
                                            type="button"
                                            onClick={handleFinalSave}
                                            disabled={isSaving}
                                            className="w-full min-h-[64px] bg-padel-primary hover:bg-white text-black font-black py-4 rounded-[1.5rem] flex items-center justify-center gap-2 transition-all shadow-[0_10px_30px_rgba(204,255,0,0.25)] text-lg uppercase tracking-tighter italic active:scale-[0.98] group"
                                        >
                                            {isSaving ? (
                                                <>CREANDO...</>
                                            ) : (
                                                <>CREAR EVENTO <Database className="w-6 h-6 group-hover:rotate-12 transition-transform" /></>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => router.back()}
                                            className="w-full py-4 text-zinc-500 font-bold hover:text-white transition-colors uppercase tracking-widest text-[10px]"
                                        >
                                            Cancelar y Salir
                                        </button>
                                    </div>
                                ) : null}

                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};
