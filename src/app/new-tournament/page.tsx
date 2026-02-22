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
    X
} from 'lucide-react';
import { TournamentType, TournamentCategory, MatchStatus } from '@/types/tournament';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { ScheduleEngine } from '@/services/ScheduleEngine';
import { useEffect } from 'react';

export default function NewTournamentPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [step, setStep] = useState(1);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading, router]);
    const [tournamentData, setTournamentData] = useState({
        name: '',
        type: TournamentType.AMERICANO_INDIVIDUAL,
        gender: '' as 'MALE' | 'FEMALE' | 'MIXED' | '',
        category: TournamentCategory.CUARTA,
        pointsGoal: 24,
        startDate: new Date().toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '22:00',
        complexName: '',
        totalCourts: 4,
        courtNames: [] as string[],
        bufferMinutes: 2,
        teams: [
            {
                id: 1,
                p1: { id: '', name: '', lastName: '', age: '', photo: '' },
                p2: { id: '', name: '', lastName: '', age: '', photo: '' }
            }
        ]
    });
    const [loading, setLoading] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const [availableParticipants, setAvailableParticipants] = useState<any[]>([]);
    const [availableGroups, setAvailableGroups] = useState<any[]>([]);
    const [fetchingData, setFetchingData] = useState(false);

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
        const days = [];
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
        { id: TournamentCategory.MAS_45, label: 'Más 45' },
        { id: TournamentCategory.SUMA_7, label: 'Suma 7' },
        { id: TournamentCategory.SUMA_8, label: 'Suma 8' },
        { id: TournamentCategory.SUMA_9, label: 'Suma 9' },
        { id: TournamentCategory.SUMA_10, label: 'Suma 10' },
        { id: TournamentCategory.SUMA_11, label: 'Suma 11' },
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
            if (tournamentData.pointsGoal === 16) matchDuration = 10;
            else if (tournamentData.pointsGoal === 24) matchDuration = 15;
            else if (tournamentData.pointsGoal === 32) matchDuration = 22;
            else if (tournamentData.pointsGoal === 40) matchDuration = 30;

            // Generate matches automatically
            console.log('[NewTournament] Generating schedule...');
            const schedule = ScheduleEngine.generateSchedule({
                tournamentId: 'temporary', // Will be inside the doc
                numTeams: tournamentData.teams.length,
                numCourts: tournamentData.courtNames.length || 4,
                clubHoursStart: tournamentData.startTime || "08:00",
                clubHoursEnd: tournamentData.endTime || "22:00",
                startDate: tournamentData.startDate ? new Date(tournamentData.startDate) : new Date(),
                matchDurationMinutes: matchDuration,
                bufferMinutes: 2, // Margen de cambio fijo de 2 min
                type: tournamentData.type
            });

            const enrichedMatches = (schedule.matches || []).map((m: any, idx: number) => {
                return {
                    id: `match-${idx}-${Date.now()}`,
                    ...m,
                    // No guardamos nombres ni fotos aquí para evitar exceder el límite de 1MB de Firestore
                    courtName: tournamentData.courtNames?.[m.courtIndex] || `Pista ${m.courtIndex + 1}`,
                    status: 'PENDING'
                };
            }).sort((a, b) => {
                const timeDiff = new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
                if (timeDiff !== 0) return timeDiff;
                return a.courtIndex - b.courtIndex;
            });

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
                status: 'En Curso'
            };

            console.log('[NewTournament] Saving to Firestore...');
            const docRef = await dataService.createTournament(tournamentToSave, user.uid);
            console.log('[NewTournament] Document created with ID:', docRef.id);

            clearTimeout(generationTimeout);
            alert('¡Torneo y calendario generados con éxito!');
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

    const nextStep = () => setStep(s => Math.min(s + 1, 6));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const addTeam = () => {
        setTournamentData(prev => ({
            ...prev,
            teams: [...prev.teams, {
                id: Date.now(),
                p1: { id: '', name: '', lastName: '', age: '', photo: '' },
                p2: { id: '', name: '', lastName: '', age: '', photo: '' }
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

    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white font-outfit">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 relative pl-24 md:pl-28 pr-6 pt-6">
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
                            Padel Score <span className="text-white text-sm opacity-50">Studio</span>
                        </h1>
                    </div>
                    <p className="text-gray-500 mt-1 text-[10px] uppercase font-bold tracking-widest italic">Paso {step}/6 • {step === 2 ? 'Club y Canchas' : tournamentData.name || 'Nuevo Torneo'}</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex gap-2 flex-1 md:w-64">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-padel-primary shadow-[0_0_10px_rgba(204,255,0,0.5)]' : 'bg-white/10'}`}
                            />
                        ))}
                    </div>

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
                </div>
            </div>

            <div className="ipad-scroll-area flex-1 min-h-0">
                <div className="max-w-4xl mx-auto pt-2 pb-32">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center space-y-2 mb-10">
                                    <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">
                                        Paso 1: <span className="text-padel-primary">Género</span>
                                    </h2>
                                    <p className="text-gray-500 font-medium">¿Para quién es este torneo?</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                                    {[
                                        { id: 'MALE', label: 'Masculino', icon: User },
                                        { id: 'FEMALE', label: 'Femenino', icon: User },
                                        { id: 'MIXED', label: 'Mixto', icon: Users },
                                    ].map((g) => (
                                        <button
                                            key={g.id}
                                            onClick={() => setTournamentData({ ...tournamentData, gender: g.id as any })}
                                            className={`relative group transition-all duration-500 rounded-[2.5rem] p-1 ${tournamentData.gender === g.id ? 'bg-padel-primary shadow-[0_0_40px_rgba(204,255,0,0.2)]' : 'bg-white/10 hover:bg-white/20'}`}
                                        >
                                            <div className={`h-full w-full rounded-[2.4rem] p-10 flex flex-col items-center gap-6 transition-all duration-500 ${tournamentData.gender === g.id ? 'bg-[#111]' : 'bg-[#1a1a1a]'}`}>
                                                <div className={`p-6 rounded-full transition-all duration-500 ${tournamentData.gender === g.id ? 'bg-padel-primary/20 scale-110' : 'bg-white/5 group-hover:bg-white/10'}`}>
                                                    <g.icon className={`w-12 h-12 transition-colors ${tournamentData.gender === g.id ? 'text-padel-primary' : 'text-gray-600'}`} />
                                                </div>
                                                <span className={`text-2xl font-black italic uppercase tracking-tighter transition-all ${tournamentData.gender === g.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                                    {g.label}
                                                </span>
                                                {tournamentData.gender === g.id && (
                                                    <div className="absolute top-6 right-6">
                                                        <CheckCircle2 className="text-padel-primary w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
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
                                <div className="text-center space-y-0.5">
                                    <div className="flex justify-center -mb-2">
                                        <svg viewBox="0 0 400 300" className="w-24 h-16 text-padel-primary fill-padel-primary transition-all duration-700 hover:scale-105 filter drop-shadow-[0_0_20px_rgba(204,255,0,0.5)] opacity-40">
                                            {/* Isla de Margarita - Trazo Realista */}
                                            <path
                                                d="M174,115 C170,110 160,105 150,110 C130,120 100,125 85,135 C75,140 75,150 80,165 C85,185 95,200 115,205 C135,210 155,200 170,190 L195,175 C205,170 215,185 230,205 C245,225 270,240 300,230 C320,225 340,235 320,195 C310,175 305,170 340,175 C360,178 375,155 350,120 C335,100 315,60 300,45 C285,30 275,50 270,80 C265,110 260,135 230,145 L200,140 L174,115 Z"
                                                className="fill-padel-primary"
                                            />
                                            {/* Cubagua */}
                                            <path
                                                d="M170,235 C160,235 155,245 165,255 C175,265 195,260 195,245 C195,235 185,235 170,235 Z"
                                                className="fill-padel-primary/80"
                                            />
                                            {/* Coche */}
                                            <path
                                                d="M260,240 C250,240 245,255 260,265 C275,275 295,265 290,245 C285,235 275,240 260,240 Z"
                                                className="fill-padel-primary/80"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">
                                        Paso 2: <span className="text-padel-primary">Club</span>
                                    </h2>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                    {COMPLEXES.map((c) => (
                                        <button
                                            key={c.name}
                                            onClick={() => {
                                                setTournamentData({
                                                    ...tournamentData,
                                                    complexName: c.name,
                                                    totalCourts: c.courts,
                                                    courtNames: []
                                                });
                                            }}
                                            className={`p-2 rounded-xl border text-left transition-all ${tournamentData.complexName === c.name ? 'border-padel-primary bg-padel-primary/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                                        >
                                            <span className={`block text-[9px] font-black italic uppercase transition-colors leading-tight ${tournamentData.complexName === c.name ? 'text-padel-primary' : 'text-gray-400'}`}>
                                                {c.name}
                                            </span>
                                            <span className="text-[7px] text-gray-500 font-bold flex items-center gap-1 mt-0.5">
                                                <MapPin className="w-1.5 h-1.5 text-gray-700" /> {c.courts} canchas
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {tournamentData.complexName && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-2"
                                    >
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-[9px] font-black italic uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                                Canchas ({tournamentData.complexName})
                                            </h3>
                                            <span className="text-[9px] text-padel-primary font-bold italic uppercase">{tournamentData.courtNames.length} seleccionadas</span>
                                        </div>
                                        <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-1.5">
                                            {Array.from({ length: COMPLEXES.find(c => c.name === tournamentData.complexName)?.courts || 0 }).map((_, i) => {
                                                const courtLabel = `Pista ${i + 1}`;
                                                const isSelected = tournamentData.courtNames.includes(courtLabel);
                                                return (
                                                    <button
                                                        key={i}
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
                                                            ? 'bg-padel-primary border-padel-primary text-black shadow-[0_0_10px_rgba(204,255,0,0.3)]'
                                                            : 'bg-black/40 border-white/10 text-gray-500 hover:border-white/20'
                                                            }`}
                                                    >
                                                        {i + 1}
                                                    </button>
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
                                <div className="text-center space-y-1">
                                    <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">
                                        Paso 3: <span className="text-padel-primary">Formato</span>
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                                    {[
                                        {
                                            id: TournamentType.AMERICANO_INDIVIDUAL,
                                            title: 'Americano',
                                            description: 'Parejas rotativas, todos juegan con todos. Sistema dinámico por niveles.',
                                            icon: (
                                                <svg viewBox="0 0 100 100" className="w-12 h-12 text-padel-primary">
                                                    <path d="M50 20 A30 30 0 1 1 50 80 A30 30 0 1 1 50 20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" />
                                                    <circle cx="50" cy="20" r="5" fill="currentColor" />
                                                    <circle cx="80" cy="50" r="5" fill="currentColor" />
                                                    <circle cx="50" cy="80" r="5" fill="currentColor" />
                                                    <circle cx="20" cy="50" r="5" fill="currentColor" />
                                                    <path d="M55 20 L45 20 M80 45 L80 55 M45 80 L55 80 M20 55 L20 45" stroke="currentColor" strokeWidth="2" />
                                                </svg>
                                            ),
                                            options: ['12 Puntos', '14 Puntos', '16 Puntos', '24 Puntos']
                                        },
                                        {
                                            id: TournamentType.AMERICANO_DUPLA,
                                            title: 'Americano Dupla Fija',
                                            description: 'Parejas estables, sistema de puntuación acumulada por victoria.',
                                            icon: (
                                                <svg viewBox="0 0 100 100" className="w-12 h-12 text-padel-primary">
                                                    <rect x="30" y="30" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" />
                                                    <rect x="55" y="30" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" />
                                                    <path d="M40 55 L40 75 M62 55 L62 75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    <path d="M40 75 L35 70 M40 75 L45 70 M62 75 L57 70 M62 75 L67 70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                            ),
                                            options: ['12 Puntos', '16 Puntos', '24 Puntos']
                                        },
                                        {
                                            id: TournamentType.KNOCKOUT,
                                            title: 'Cuadro Eliminatorio',
                                            description: 'Llaves de eliminación directa. Quien pierde sale del torneo.',
                                            icon: (
                                                <svg viewBox="0 0 100 100" className="w-12 h-12 text-padel-primary">
                                                    <path d="M20 30 H40 V50 H20 M20 70 H40 V50 M40 50 H60 V50 M60 40 V60 M60 50 H80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )
                                        },
                                        {
                                            id: TournamentType.ROUND_ROBIN,
                                            title: 'Round Robin',
                                            description: 'Fase de grupos, todos contra todos en el grupo. Clasifica el mejor.',
                                            icon: (
                                                <svg viewBox="0 0 100 100" className="w-12 h-12 text-padel-primary">
                                                    <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                                                    <path d="M25 25 L75 75 M25 75 L75 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    <circle cx="25" cy="25" r="3" fill="currentColor" />
                                                    <circle cx="75" cy="25" r="3" fill="currentColor" />
                                                    <circle cx="25" cy="75" r="3" fill="currentColor" />
                                                    <circle cx="75" cy="75" r="3" fill="currentColor" />
                                                </svg>
                                            )
                                        }
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setTournamentData({ ...tournamentData, type: type.id as any })}
                                            className={`group relative overflow-hidden rounded-3xl border-2 transition-all p-5 flex items-center justify-between gap-4 ${tournamentData.type === type.id
                                                ? 'border-padel-primary bg-padel-primary/5 shadow-[0_0_30px_rgba(204,255,0,0.1)]'
                                                : 'border-white/5 bg-white/5 hover:border-white/10 hover:translate-x-1'
                                                }`}
                                        >
                                            <div className="flex-1 text-left space-y-1">
                                                <h3 className={`text-lg font-black italic uppercase tracking-tighter ${tournamentData.type === type.id ? 'text-white' : 'text-gray-400'}`}>
                                                    {type.title}
                                                </h3>
                                                <p className={`text-[10px] font-medium leading-tight ${tournamentData.type === type.id ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {type.description}
                                                </p>

                                                {type.options && tournamentData.type === type.id && (
                                                    <div className="flex gap-1 mt-2">
                                                        {type.options.map(opt => (
                                                            <span key={opt} className="bg-padel-primary text-black text-[8px] font-black uppercase px-2 py-1 rounded-full italic tracking-tighter">
                                                                {opt}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`transition-all duration-500 ${tournamentData.type === type.id ? 'scale-110 opacity-100' : 'opacity-40 group-hover:opacity-70'}`}>
                                                {type.icon}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="max-w-3xl mx-auto mt-6 bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3"
                                >
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1 flex items-center gap-2">
                                        <Trophy className="w-3 h-3 text-padel-primary" /> Nombre del Torneo
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Torneo Relámpago Margarita 2024"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:border-padel-primary transition-all outline-none text-white italic"
                                        value={tournamentData.name}
                                        onChange={e => setTournamentData({ ...tournamentData, name: e.target.value })}
                                    />
                                </motion.div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center space-y-1 mb-4">
                                    <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">
                                        Paso 4: <span className="text-padel-primary">Fecha y Horarios</span>
                                    </h2>
                                </div>

                                <div className="glass p-8 space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-padel-primary" /> Seleccionar Fecha
                                        </label>

                                        <div className="max-w-sm mx-auto bg-black/40 border border-white/10 rounded-[2rem] p-4 space-y-3">
                                            <div className="flex justify-between items-center px-1">
                                                <button
                                                    onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}
                                                    className="p-1.5 hover:bg-white/5 rounded-full transition-colors"
                                                >
                                                    <ChevronLeft className="w-4 h-4 text-padel-primary" />
                                                </button>
                                                <h3 className="text-sm font-black italic uppercase text-white tracking-widest">
                                                    {new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(viewDate)}
                                                </h3>
                                                <button
                                                    onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
                                                    className="p-1.5 hover:bg-white/5 rounded-full transition-colors"
                                                >
                                                    <ChevronRight className="w-4 h-4 text-padel-primary" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-7 gap-1">
                                                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                                                    <div key={`${d}-${i}`} className="text-center text-[9px] font-black text-gray-700 py-1">{d}</div>
                                                ))}
                                                {getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth()).map((date, i) => {
                                                    if (!date) return <div key={`empty-${i}`} />;

                                                    const dateString = date.toISOString().split('T')[0];
                                                    const isSelected = tournamentData.startDate === dateString;
                                                    const isToday = new Date().toISOString().split('T')[0] === dateString;

                                                    return (
                                                        <button
                                                            key={dateString}
                                                            onClick={() => setTournamentData({ ...tournamentData, startDate: dateString })}
                                                            className={`
                                                            h-8 w-full rounded-lg flex items-center justify-center text-[11px] font-bold transition-all
                                                            ${isSelected
                                                                    ? 'bg-padel-primary text-black scale-105 shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                                                                    : 'hover:bg-white/10 text-gray-500 hover:text-white'}
                                                            ${isToday && !isSelected ? 'text-padel-primary bg-padel-primary/5' : ''}
                                                        `}
                                                        >
                                                            {date.getDate()}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-padel-primary" /> Hora de Inicio
                                            </label>
                                            <input
                                                type="time"
                                                className="input-field w-full text-xl font-black bg-black/40"
                                                value={tournamentData.startTime}
                                                onChange={e => setTournamentData({ ...tournamentData, startTime: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-padel-primary" /> Hora de Fin
                                            </label>
                                            <input
                                                type="time"
                                                className="input-field w-full text-xl font-black bg-black/40"
                                                value={tournamentData.endTime}
                                                onChange={e => setTournamentData({ ...tournamentData, endTime: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 5 && (
                            <motion.div
                                key="step5"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass p-8 space-y-8"
                            >
                                <div className="text-center mb-4">
                                    <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">
                                        Paso 5: <span className="text-padel-primary">Categoría</span>
                                    </h2>
                                </div>

                                <div className="space-y-6">

                                    <div className="space-y-4 pt-6">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Nivel de Juego</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {LEVEL_CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setTournamentData({ ...tournamentData, category: cat.id })}
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
                                className="glass p-5 md:p-8 space-y-6 md:space-y-8"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-padel-primary/20 rounded-xl">
                                            <Users className="text-padel-primary w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold italic tracking-tight uppercase leading-none">Parejas Registradas</h2>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Total: {tournamentData.teams.length}</p>
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
                                                            p1: { id: '', name: '', lastName: '', age: '', photo: '' },
                                                            p2: { id: '', name: '', lastName: '', age: '', photo: '' }
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
                                    {tournamentData.teams.map((team, idx) => (
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
                                                    {/* Selector de Grupos existentes */}
                                                    <select
                                                        className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] uppercase font-bold text-padel-primary outline-none focus:border-padel-primary"
                                                        onChange={(e) => {
                                                            const group = availableGroups.find(g => g.id === e.target.value);
                                                            if (group && group.participantIds) {
                                                                const p1Data = availableParticipants.find(p => p.id === group.participantIds[0]);
                                                                const p2Data = availableParticipants.find(p => p.id === group.participantIds[1]);

                                                                if (p1Data) {
                                                                    updateTeamMember(team.id, 'p1', 'id', p1Data.id);
                                                                    updateTeamMember(team.id, 'p1', 'name', p1Data.name);
                                                                    updateTeamMember(team.id, 'p1', 'lastName', p1Data.lastName || '');
                                                                    if (p1Data.photo) updateTeamMember(team.id, 'p1', 'photo', p1Data.photo);
                                                                }
                                                                if (p2Data) {
                                                                    updateTeamMember(team.id, 'p2', 'id', p2Data.id);
                                                                    updateTeamMember(team.id, 'p2', 'name', p2Data.name);
                                                                    updateTeamMember(team.id, 'p2', 'lastName', p2Data.lastName || '');
                                                                    if (p2Data.photo) updateTeamMember(team.id, 'p2', 'photo', p2Data.photo);
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <option value="">Cargar Grupo/Equipo</option>
                                                        {availableGroups.map(g => (
                                                            <option key={g.id} value={g.id}>{g.name}</option>
                                                        ))}
                                                    </select>
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
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/10 p-6 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
                    <button
                        onClick={prevStep}
                        disabled={step === 1}
                        className={`flex items-center gap-3 px-8 py-5 rounded-2xl font-black text-xs uppercase italic transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <ChevronLeft className="w-5 h-5" /> Anterior
                    </button>

                    <div className="flex gap-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${step === i ? 'w-12 bg-padel-primary shadow-[0_0_15px_rgba(204,255,0,0.5)]' : 'w-2 bg-white/5'}`} />
                        ))}
                    </div>

                    {step === 6 ? (
                        <button
                            onClick={generateTournament}
                            disabled={loading || !tournamentData.name || tournamentData.courtNames.length === 0}
                            className="flex items-center gap-4 bg-padel-primary text-black px-12 py-5 rounded-[2.5rem] font-black text-sm uppercase italic tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(204,255,0,0.3)] disabled:opacity-50 disabled:grayscale"
                        >
                            {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <>Crear Torneo <Trophy className="w-6 h-6" /></>}
                        </button>
                    ) : (
                        <button
                            onClick={nextStep}
                            disabled={
                                (step === 1 && !tournamentData.gender) ||
                                (step === 2 && (tournamentData.courtNames.length === 0))
                            }
                            className="flex items-center gap-4 bg-padel-primary text-black px-12 py-5 rounded-[2.5rem] font-black text-sm uppercase italic tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(204,255,0,0.3)] disabled:opacity-50"
                        >
                            Continuar <ChevronRight className="w-6 h-6" />
                        </button>
                    )}
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
