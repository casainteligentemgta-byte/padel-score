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
import { useRouter } from 'next/navigation';

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

export default function MasterGeneratorPage() {
    const [step, setStep] = useState(1);
    const [eventData, setEventData] = useState<MasterScheduleConfig>({
        tournamentName: 'Torneo Virgen del Valle',
        complexName: 'Margarita Padel',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        dailyStartTime: '08:00',
        dailyEndTime: '22:00',
        numCourts: 6,
        courtNames: Array.from({ length: 6 }, (_, i) => `Pista ${i + 1}`),
        matchDurationMinutes: 90,
        bufferMinutes: 10,
        categories: []
    });

    const [generatedMatches, setGeneratedMatches] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);
    const [activeGender, setActiveGender] = useState<'MALE' | 'FEMALE' | 'MIXED' | null>(null);

    const router = useRouter();
    const { user } = useAuth();

    // Categories names mapping for display
    const catLabels: Record<string, string> = {
        'MALE': 'Masculino',
        'FEMALE': 'Femenino',
        'MIXED': 'Mixto'
    };

    const CATEGORY_PRIORITY: Record<string, number> = {
        [TournamentCategory.PRIMERA]: 1,
        [TournamentCategory.SEGUNDA]: 2,
        [TournamentCategory.TERCERA]: 3,
        [TournamentCategory.CUARTA]: 4,
        [TournamentCategory.QUINTA]: 5,
        [TournamentCategory.SEXTA]: 6,
        [TournamentCategory.SEPTIMA]: 7,
        [TournamentCategory.SUMA_7]: 8,
        [TournamentCategory.SUMA_8]: 9,
        [TournamentCategory.SUMA_9]: 10,
        [TournamentCategory.SUMA_10]: 11,
        [TournamentCategory.SUMA_11]: 12,
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
    const addCategory = (gender: 'MALE' | 'FEMALE' | 'MIXED', cat: TournamentCategory) => {
        const id = Math.random().toString(36).substr(2, 9);
        setEventData(prev => ({
            ...prev,
            categories: [...prev.categories, {
                id,
                gender,
                category: cat,
                numTeams: 8,
                type: TournamentType.ROUND_ROBIN,
                teams: Array.from({ length: 8 }, (_, i) => ({
                    id: `team-${id}-${i}`,
                    p1: { id: `p1-${id}-${i}`, name: `Jugador ${i * 2 + 1}` },
                    p2: { id: `p2-${id}-${i}`, name: `Jugador ${i * 2 + 2}` }
                }))
            }]
        }));
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
        setIsGenerating(true);
        // Simulación de procesamiento IA
        setTimeout(() => {
            const result = MasterScheduleEngine.generateMasterSchedule(eventData);

            // Ordenar cronológicamente antes de mostrar
            const sorted = [...result.matches].sort((a, b) =>
                new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
            );

            setGeneratedMatches(sorted);
            setIsGenerating(false);
            setHasGenerated(true);
            setStep(5);
        }, 1500);
    };

    const handleFinalSave = async () => {
        if (!user) return alert('Debes iniciar sesión para crear torneos');
        if (generatedMatches.length === 0) return alert('No hay partidos generados para guardar');

        setIsSaving(true);
        try {
            // Generar un torneo por cada categoría
            const savePromises = eventData.categories.map(async (cat, idx) => {
                const categoryMatches = generatedMatches.filter(m => m.categoryId === cat.id);

                // Si por alguna razón no hay partidos para esta categoría, no la creamos
                if (categoryMatches.length === 0) return null;

                const tournamentToSave = {
                    name: `${eventData.tournamentName} - ${cat.category} ${catLabels[cat.gender]}`,
                    type: cat.type,
                    category: cat.category,
                    gender: cat.gender,
                    startDate: eventData.startDate,
                    startTime: eventData.dailyStartTime,
                    endTime: eventData.dailyEndTime,
                    complexName: eventData.complexName,
                    totalCourts: eventData.numCourts,
                    courtNames: eventData.courtNames,
                    bufferMinutes: eventData.bufferMinutes,
                    teams: cat.teams,
                    matches: categoryMatches,
                    pointsGoal: 24, // Default for master gen
                    status: 'Programado'
                };

                return dataService.createTournament(tournamentToSave, user.uid);
            });

            await Promise.all(savePromises);
            alert('¡Evento Maestro creado con éxito! Se han generado todos los torneos por categoría.');
            router.push('/tournaments');
        } catch (error: any) {
            console.error('Error saving master event:', error);
            alert('Error al guardar el evento: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 5));
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

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-padel-primary/30">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-padel-primary/5 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            {/* Main Container */}
            <div className="relative max-w-7xl mx-auto px-6 py-12">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-padel-primary/10 border border-padel-primary/20 rounded-2xl flex items-center justify-center shadow-lg shadow-padel-primary/5">
                                <Sparkles className="w-6 h-6 text-padel-primary" />
                            </div>
                            <h1 className="text-3xl font-black italic uppercase tracking-tighter">
                                Generador <span className="text-padel-primary">Maestro</span>
                            </h1>
                        </div>
                        <p className="text-zinc-400 font-medium">Programación Multi-Categoría Inteligente</p>
                    </div>

                    <div className="flex items-center gap-4 bg-zinc-900/50 backdrop-blur-xl p-2 rounded-2xl border border-zinc-800">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <div
                                key={s}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${step === s ? 'bg-padel-primary text-black font-bold scale-110 shadow-lg shadow-padel-primary/25' :
                                    step > s ? 'bg-zinc-800 text-padel-primary' : 'text-zinc-600'
                                    }`}
                            >
                                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                            </div>
                        ))}
                    </div>
                </header>

                {/* content area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-[600px]">

                    {/* Main Form */}
                    <main className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.section
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-3xl p-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold uppercase tracking-widest text-padel-primary">Nombre del Evento</label>
                                                <input
                                                    type="text"
                                                    value={eventData.tournamentName}
                                                    onChange={(e) => setEventData({ ...eventData, tournamentName: e.target.value })}
                                                    className="w-full bg-black/50 border border-zinc-700 rounded-2xl p-4 text-xl font-bold focus:border-padel-primary outline-none transition-all"
                                                    placeholder="Ej: Virgen del Valle Open..."
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Sede / Localidad</label>
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
                                                    className="w-full bg-black/50 border border-zinc-700 rounded-2xl p-4 outline-none focus:border-padel-primary transition-all font-bold"
                                                >
                                                    {COMPLEXES.map(c => (
                                                        <option key={c.name} value={c.name}>{c.name} ({c.courts} Pistas)</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Fecha Inicio</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                                    <input
                                                        type="date"
                                                        value={eventData.startDate}
                                                        onChange={(e) => setEventData({ ...eventData, startDate: e.target.value })}
                                                        className="w-full bg-black/50 border border-zinc-700 rounded-2xl p-4 pl-14 outline-none focus:border-padel-primary"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Duración Estimada</label>
                                                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-4 flex items-center gap-3">
                                                    <Sparkles className="w-5 h-5 text-padel-primary animate-pulse" />
                                                    <div>
                                                        <p className="text-sm font-bold text-white uppercase italic">Calculada por IA</p>
                                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">El sistema determinará el fin según los partidos.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Hora Apertura Diaria</label>
                                                <div className="relative">
                                                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                                    <input
                                                        type="time"
                                                        value={eventData.dailyStartTime}
                                                        onChange={(e) => setEventData({ ...eventData, dailyStartTime: e.target.value })}
                                                        className="w-full bg-black/50 border border-zinc-700 rounded-2xl p-4 pl-14 outline-none focus:border-padel-primary"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Hora Cierre Diario</label>
                                                <div className="relative">
                                                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                                    <input
                                                        type="time"
                                                        value={eventData.dailyEndTime}
                                                        onChange={(e) => setEventData({ ...eventData, dailyEndTime: e.target.value })}
                                                        className="w-full bg-black/50 border border-zinc-700 rounded-2xl p-4 pl-14 outline-none focus:border-padel-primary"
                                                    />
                                                </div>
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
                                    className="space-y-8"
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
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <button
                                                onClick={() => setActiveGender('MALE')}
                                                className="bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 rounded-3xl p-8 transition-all group text-center space-y-4"
                                            >
                                                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                                    <span className="text-4xl">♂️</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black uppercase text-blue-400">Masculino</h3>
                                                    <p className="text-zinc-500 text-xs mt-1 uppercase tracking-tighter">Torneo de Caballeros</p>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => setActiveGender('FEMALE')}
                                                className="bg-pink-500/5 hover:bg-pink-500/10 border border-pink-500/20 hover:border-pink-500/40 rounded-3xl p-8 transition-all group text-center space-y-4"
                                            >
                                                <div className="w-16 h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                                    <span className="text-4xl">♀️</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black uppercase text-pink-400">Femenino</h3>
                                                    <p className="text-zinc-500 text-xs mt-1 uppercase tracking-tighter">Torneo de Damas</p>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => setActiveGender('MIXED')}
                                                className="bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 rounded-3xl p-8 transition-all group text-center space-y-4"
                                            >
                                                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                                    <span className="text-4xl">🚻</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black uppercase text-purple-400">Mixto</h3>
                                                    <p className="text-zinc-500 text-xs mt-1 uppercase tracking-tighter">Parejas Combinadas</p>
                                                </div>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 space-y-6">
                                            <div className="flex items-center gap-4 border-b border-zinc-800 pb-6">
                                                <div className={`p-4 rounded-2xl ${activeGender === 'MALE' ? 'bg-blue-500/20 text-blue-400' :
                                                    activeGender === 'FEMALE' ? 'bg-pink-500/20 text-pink-400' :
                                                        'bg-purple-500/20 text-purple-400'
                                                    }`}>
                                                    <Plus className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black uppercase">Añadir Categorías {catLabels[activeGender]}</h3>
                                                    <p className="text-zinc-500 text-sm">Selecciona los niveles que deseas incluir</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {[
                                                    TournamentCategory.PRIMERA, TournamentCategory.SEGUNDA,
                                                    TournamentCategory.TERCERA, TournamentCategory.CUARTA,
                                                    TournamentCategory.QUINTA, TournamentCategory.SEXTA,
                                                    TournamentCategory.SEPTIMA, TournamentCategory.SUMA_7,
                                                    TournamentCategory.SUMA_8, TournamentCategory.SUMA_9,
                                                    TournamentCategory.SUMA_10
                                                ].map(level => {
                                                    const exists = eventData.categories.some(c => c.gender === activeGender && c.category === level);
                                                    return (
                                                        <button
                                                            key={level}
                                                            onClick={() => exists ? null : addCategory(activeGender, level)}
                                                            disabled={exists}
                                                            className={`p-4 rounded-2xl border transition-all text-center font-bold ${exists
                                                                ? 'bg-zinc-800/50 border-zinc-700 text-zinc-600 grayscale cursor-not-allowed'
                                                                : 'bg-black/50 border-zinc-700 hover:border-padel-primary hover:text-padel-primary'
                                                                }`}
                                                        >
                                                            {level}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* List of active categories */}
                                    <div className="space-y-4 pt-8 border-t border-zinc-800">
                                        <h3 className="text-lg font-bold uppercase tracking-widest text-zinc-500">Categorías Seleccionadas</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {sortedSelectedCategories.map((cat, idx) => (
                                                <div key={cat.id} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between group hover:border-padel-primary/30 transition-all shadow-xl">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center`} style={{ backgroundColor: COLORS[idx % COLORS.length] + '20', color: COLORS[idx % COLORS.length] }}>
                                                            {cat.gender === 'MALE' ? '♂️' : cat.gender === 'FEMALE' ? '♀️' : '🚻'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-lg">{cat.category}</p>
                                                            <p className="text-xs text-zinc-500 uppercase tracking-widest">{catLabels[cat.gender]}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="text-[10px] font-bold text-zinc-500 uppercase">Parejas</span>
                                                            <input
                                                                type="number"
                                                                min="2"
                                                                max="128"
                                                                value={cat.numTeams}
                                                                onChange={(e) => updateCategoryTeams(cat.id, parseInt(e.target.value) || 2)}
                                                                className="w-16 bg-black/50 border border-zinc-800 rounded-lg py-1 px-2 text-center text-sm font-black text-padel-primary focus:border-padel-primary outline-none transition-all"
                                                            />
                                                        </div>
                                                        <button onClick={() => removeCategory(cat.id)} className="text-zinc-600 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg">
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {eventData.categories.length === 0 && (
                                        <div className="border-2 border-dashed border-zinc-800 rounded-3xl p-20 text-center space-y-4">
                                            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto">
                                                <Layers className="w-8 h-8 text-zinc-700" />
                                            </div>
                                            <p className="text-zinc-500">No hay categorías seleccionadas aún.</p>
                                        </div>
                                    )}
                                </motion.section>
                            )}

                            {step === 3 && (
                                <motion.section
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-8"
                                >
                                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-zinc-800 pb-8">
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

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                    </div>
                                </motion.section>
                            )}

                            {step === 4 && (
                                <motion.section
                                    key="step4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-8"
                                >
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-bold italic uppercase">Distribución de Parejas</h2>
                                        <div className="bg-padel-primary/10 text-padel-primary px-4 py-2 rounded-xl border border-padel-primary/20 text-xs font-bold uppercase">
                                            {eventData.categories.reduce((acc, c) => acc + c.numTeams, 0)} Parejas Totales
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {eventData.categories.map((cat, idx) => (
                                            <div key={cat.id} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 group hover:border-padel-primary/20 transition-all">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold" style={{ backgroundColor: COLORS[idx % COLORS.length] + '20', color: COLORS[idx % COLORS.length] }}>
                                                            {cat.gender === 'MALE' ? '♂' : cat.gender === 'FEMALE' ? '♀' : '🚻'}
                                                        </div>
                                                        <h4 className="font-black italic uppercase text-lg">{cat.category} <span className="text-zinc-500 text-xs ml-2">({cat.gender})</span></h4>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button className="p-2 bg-zinc-800 rounded-lg hover:text-padel-primary transition-colors">
                                                            <UserPlus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {cat.teams.map((t, tidx) => (
                                                        <div key={t.id} className="bg-black/30 border border-zinc-800/50 rounded-xl p-3 text-center space-y-1 group/team hover:bg-zinc-800/40 transition-all">
                                                            <div className="text-[10px] text-zinc-600 font-bold uppercase">Pareja {tidx + 1}</div>
                                                            <div className="text-xs font-bold text-zinc-300 truncate">{t.p1.name}</div>
                                                            <div className="text-xs font-bold text-zinc-300 truncate">{t.p2.name}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {eventData.categories.length === 0 && (
                                        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 flex items-center gap-4 text-red-500">
                                            <AlertCircle className="w-6 h-6" />
                                            <p className="font-bold text-sm">Debes añadir categorías en el paso 2 para configurar las parejas.</p>
                                        </div>
                                    )}
                                </motion.section>
                            )}

                            {step === 5 && hasGenerated && (
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
                                            <button className="flex items-center gap-2 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-black/40 group">
                                                <Share2 className="w-4 h-4 text-padel-primary group-hover:scale-110 transition-transform" />
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
                    </main>

                    {/* Sidebar Actions */}
                    <aside className="lg:col-span-4 space-y-6">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl sticky top-6">
                            <h3 className="text-lg font-bold italic uppercase border-b border-zinc-800 pb-4 mb-4">Resumen Global</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500">Categorías Planificadas</span>
                                    <span className="font-bold text-padel-primary">{eventData.categories.length}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500">Pistas Totales</span>
                                    <span className="font-bold text-white">{eventData.numCourts}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500">Partidos Aproximados</span>
                                    <span className="font-bold text-white">{eventData.categories.reduce((acc, c) => acc + (c.numTeams * (c.numTeams - 1)) / 2, 0)}</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-zinc-800 space-y-3">
                                {step < 4 ? (
                                    <button
                                        onClick={nextStep}
                                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
                                    >
                                        Continuar <ChevronRight className="w-5 h-5" />
                                    </button>
                                ) : step === 4 ? (
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        className="w-full bg-padel-primary hover:bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {isGenerating ? (
                                            <>Procesamiento IA...</>
                                        ) : (
                                            <>GENERAR FIXTURE MAESTRO <Sparkles className="w-5 h-5 group-hover:scale-125 transition-transform" /></>
                                        )}
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        <button
                                            onClick={handleFinalSave}
                                            disabled={isSaving}
                                            className="w-full bg-padel-primary hover:bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 group shadow-[0_10px_30px_rgba(204,255,0,0.2)]"
                                        >
                                            {isSaving ? (
                                                <>Creando Base de Datos...</>
                                            ) : (
                                                <>CONFIRMAR Y CREAR EVENTO <Database className="w-5 h-5 group-hover:rotate-12 transition-transform" /></>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setStep(1)}
                                            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold py-4 rounded-2xl transition-all hover:bg-zinc-800"
                                        >
                                            Descartar y Reiniciar
                                        </button>
                                    </div>
                                )}

                                {step > 1 && (
                                    <button
                                        onClick={prevStep}
                                        className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold py-4 rounded-2xl transition-all hover:bg-zinc-800"
                                    >
                                        Atrás
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* AI Assistant Tip */}
                        <div className="bg-padel-primary/5 border border-padel-primary/10 rounded-3xl p-6 space-y-3">
                            <div className="flex items-center gap-2 text-padel-primary">
                                <AlertCircle className="w-5 h-5" />
                                <span className="text-xs font-black uppercase tracking-tighter">Tip del Organizador</span>
                            </div>
                            <p className="text-sm text-zinc-400 leading-relaxed italic">
                                "Para torneos tipo 'Virgen del Valle', el sistema garantiza que ningún jugador juegue dos partidos seguidos en distintas categorías. Las finales se bloquean automáticamente para el último slot disponible."
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
