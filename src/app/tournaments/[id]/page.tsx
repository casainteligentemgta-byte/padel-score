'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Clock,
    Calendar,
    MapPin,
    Play,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    RefreshCw,
    DollarSign,
    Plus,
    User,
    Link as LinkIcon,
    Share2,
    Copy,
    MessageCircle,
    Send,
    Mail,
    X,
    LayoutDashboard,
    Zap,
    Monitor,
    Tv
} from 'lucide-react';
import Link from 'next/link';
import { MatchStatus, TournamentType, ScheduleConfig } from '@/types/tournament';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { ScheduleEngine } from '@/services/ScheduleEngine';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';



export default function TournamentDashboard({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, profile, isAdmin, isMarker, loading: authLoading } = useAuth();
    const [tournament, setTournament] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('Por Comenzar');
    const [selectedMatch, setSelectedMatch] = useState<any>(null);
    const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeGroup, setActiveGroup] = useState<string | null>(null);
    const [subFilter, setSubFilter] = useState('Todos');

    const [error, setError] = useState<string | null>(null);

    const isOwner = tournament?.ownerId === user?.uid;
    const canManageMatches = isOwner || isAdmin || isMarker;
    const canManageTournament = isOwner || isAdmin;

    // We allow guests to view the dashboard
    useEffect(() => {
        // Only redirect if specifically needed, but dashboard is public
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!id || authLoading) return;

        console.log(`[Dashboard] Setting up real-time listener for tournament ID: ${String(id)}`);
        setError(null);

        const docRef = doc(db, 'tournaments', String(id));

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            try {
                if (docSnap.exists()) {
                    const tourneyData = { id: docSnap.id, ...docSnap.data() } as any;
                    setTournament(tourneyData);

                    // Initialize active group if none selected
                    if (tourneyData.type === TournamentType.ROUND_ROBIN && tourneyData.groupAssignments) {
                        const groups = Object.keys(tourneyData.groupAssignments).sort();
                        if (groups.length > 0 && !activeGroup) {
                            setActiveGroup(groups[0]);
                        }
                    }

                    if (tourneyData.matches) {
                        const enriched = tourneyData.matches.map((m: any) => {
                            const team1 = (m.team1Index > 0 && tourneyData.teams) ? tourneyData.teams[m.team1Index - 1] : null;
                            const team2 = (m.team2Index > 0 && tourneyData.teams) ? tourneyData.teams[m.team2Index - 1] : null;

                            const getPlayerName = (p: any, teamIdx: number, slot: 1 | 2) => {
                                if (teamIdx <= 0) return 'Por definir';
                                const name = p?.name?.trim();
                                if (name && name !== '') return name;
                                const index = (teamIdx * 2) - (slot === 1 ? 1 : 0);
                                return `Jugador ${index}`;
                            };

                            return {
                                ...m,
                                court: m.court || (m.courtIndex !== undefined ? m.courtIndex + 1 : undefined),
                                team1: {
                                    name: team1 ? `${getPlayerName(team1.p1, m.team1Index, 1)} / ${getPlayerName(team1.p2, m.team1Index, 2)}` : (m.team1Index <= 0 ? 'Por definir' : `Equipo ${m.team1Index}`),
                                    p1Name: team1 ? getPlayerName(team1.p1, m.team1Index, 1) : null,
                                    p2Name: team1 ? getPlayerName(team1.p2, m.team1Index, 2) : null,
                                    photo1: team1?.p1?.photo || null,
                                    photo2: team1?.p2?.photo || null,
                                    phone1: team1?.p1?.phone || null,
                                    phone2: team1?.p2?.phone || null
                                },
                                team2: {
                                    name: team2 ? `${getPlayerName(team2.p1, m.team2Index, 1)} / ${getPlayerName(team2.p2, m.team2Index, 2)}` : (m.team2Index <= 0 ? 'Por definir' : `Equipo ${m.team2Index}`),
                                    p1Name: team2 ? getPlayerName(team2.p1, m.team2Index, 1) : null,
                                    p2Name: team2 ? getPlayerName(team2.p2, m.team2Index, 2) : null,
                                    photo1: team2?.p1?.photo || null,
                                    photo2: team2?.p2?.photo || null,
                                    phone1: team2?.p1?.phone || null,
                                    phone2: team2?.p2?.phone || null
                                }
                            };
                        });
                        setMatches(enriched);
                    }
                } else {
                    setError('El torneo no existe o ha sido eliminado.');
                    setTournament(null);
                }
            } catch (err) {
                console.error("[Dashboard] Processing error:", err);
                setError('Error al procesar los datos del torneo.');
            } finally {
                setLoading(false);
            }
        }, (err) => {
            console.error("[Dashboard] Snapshot error:", err);
            if (err.code === 'permission-denied') {
                setError('No tienes permiso para ver este torneo. Por favor, inicia sesión.');
            } else {
                setError('Error de conexión con la base de datos.');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id, authLoading, activeGroup]);

    const stripMatches = (matches: any[]) => matches.map(m => {
        const { team1, team2, ...rest } = m;
        return rest;
    });

    const generateMatches = async () => {
        if (!tournament) return;
        setLoading(true);
        try {
            console.log('[Dashboard] Generating schedule...');
            if (!tournament.teams || tournament.teams.length < 2) {
                alert('Se necesitan al menos 2 parejas para generar partidos');
                return;
            }

            const [y, m, d] = (tournament.startDate || "").split('-').map(Number);
            const startDateLocal = y ? new Date(y, m - 1, d) : new Date();

            const schedule = ScheduleEngine.generateSchedule({
                tournamentId: id,
                numTeams: tournament.teams.length,
                numCourts: tournament.totalCourts || 4,
                clubHoursStart: tournament.startTime || "08:00",
                clubHoursEnd: tournament.endTime || "22:00",
                startDate: startDateLocal,
                matchDurationMinutes: tournament.type === TournamentType.ROUND_ROBIN ? 45 : 90,
                bufferMinutes: tournament.bufferMinutes || 15,
                type: tournament.type || TournamentType.AMERICANO_INDIVIDUAL
            });

            const lightMatches = (schedule.matches || []).map((m: any, idx: number) => {
                return {
                    id: `match-${idx}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    ...m,
                    stage: tournament.type === TournamentType.ROUND_ROBIN ? 'GROUP_STAGE' : undefined,
                    court: m.courtIndex + 1,
                    courtName: tournament.courtNames?.[m.courtIndex] || `Pista ${m.courtIndex + 1}`,
                    status: MatchStatus.PENDING
                };
            }).sort((a, b) => {
                const timeDiff = new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
                if (timeDiff !== 0) return timeDiff;
                return a.courtIndex - b.courtIndex;
            });

            console.log(`[Dashboard] Generated ${lightMatches.length} matches, saving to DB...`);
            await updateDoc(doc(db, 'tournaments', id), {
                matches: lightMatches,
                updatedAt: new Date()
            });

            alert(`¡Se han generado ${lightMatches.length} partidos correctamente!`);
        } catch (error) {
            console.error('[Dashboard] Error generating matches:', error);
            alert('Error al generar los partidos.');
        } finally {
            setLoading(false);
        }
    };

    const generateMainDraw = async (currentMatches?: any[]) => {
        if (!tournament || !isRoundRobin) return;
        setLoading(true);
        try {
            const matchesToUse = currentMatches || matches;
            const groupStandings = getGroupStandings(matchesToUse);
            const advancingTeams: number[] = [];

            // Tomar los 2 mejores de cada grupo
            Object.values(groupStandings).forEach((teams: any[]) => {
                const top2 = teams.slice(0, 2);
                top2.forEach(t => {
                    const teamIdx = parseInt(t.id.split('-')[1]);
                    advancingTeams.push(teamIdx);
                });
            });

            if (advancingTeams.length < 2) {
                alert('No hay suficientes equipos para generar un cuadro');
                return;
            }

            const bracketData = ScheduleEngine.generateBracket(
                advancingTeams,
                tournament.totalCourts || 4,
                60, // 60 min para partidos de llave
                10, // 10 min de margen
                new Date(), // Hoy
                "09:00"
            );

            const newMatches = [...matchesToUse.filter(m => !m.stage || m.stage !== 'MAIN_DRAW'), ...bracketData.matches];

            await updateDoc(doc(db, 'tournaments', id), {
                matches: stripMatches(newMatches),
                updatedAt: new Date()
            });

            setActiveTab('Cuadro');
            alert('¡Cuadro Principal generado con éxito!');
        } catch (error) {
            console.error('[Dashboard] Error generating main draw:', error);
        } finally {
            setLoading(false);
        }
    };

    const finishMatch = async (matchId: string) => {
        setUpdatingId(matchId);
        try {
            const finishedMatch = matches.find(m => m.id === matchId);
            if (!finishedMatch) return;

            const finalScore = finishedMatch.score || (finishedMatch.sets ? `${finishedMatch.sets.t1}-${finishedMatch.sets.t2}` : '0-0');
            const winnerIndex = finishedMatch.sets && finishedMatch.sets.t1 > finishedMatch.sets.t2
                ? finishedMatch.team1Index
                : finishedMatch.team2Index;

            let updatedMatches = matches.map(m => {
                if (m.id === matchId) {
                    return { ...m, status: MatchStatus.FINISHED, actualEndTime: new Date(), score: finalScore };
                }

                // Si es un partido de cuadro y es el siguiente del ganador
                if (finishedMatch.stage === 'MAIN_DRAW' && m.stage === 'MAIN_DRAW' && finishedMatch.bracketPosition) {
                    const nextRound = finishedMatch.bracketPosition.round + 1;
                    const nextPos = Math.ceil(finishedMatch.bracketPosition.position / 2);
                    const isTeam1 = finishedMatch.bracketPosition.position % 2 !== 0;

                    if (m.bracketPosition?.round === nextRound && m.bracketPosition?.position === nextPos) {
                        return {
                            ...m,
                            [isTeam1 ? 'team1Index' : 'team2Index']: winnerIndex
                        };
                    }
                }

                return m;
            });

            const autocorrected = ScheduleEngine.recalculateRemainingMatches(updatedMatches, tournament.bufferMinutes || 15);
            let finalMatches = updatedMatches.map(m => {
                const update = autocorrected.find(u => u.id === m.id);
                return update ? { ...m, scheduledTime: update.scheduledTime } : m;
            });

            await updateDoc(doc(db, 'tournaments', id), {
                matches: stripMatches(finalMatches),
                updatedAt: new Date()
            });
            setMatches(finalMatches);

            // AUTO-GENERACIÓN DE CUADRO
            // Si el partido terminado era de fase de grupos, el torneo es Round Robin,
            // no existe cuadro generado aún, y TODOS los partidos de grupos han terminado...
            const hasBracketNow = finalMatches.some(m => m.stage === 'MAIN_DRAW');
            const groupMatches = finalMatches.filter(m => m.stage === 'GROUP_STAGE');
            const allGroupsFinished = groupMatches.length > 0 && groupMatches.every(m => m.status === MatchStatus.FINISHED);

            if (isRoundRobin && !hasBracketNow && finishedMatch.stage === 'GROUP_STAGE' && allGroupsFinished && canManageTournament) {
                console.log("[Dashboard] All group matches finished. Auto-generating Main Draw...");
                // Pequeño delay para que el usuario procese el fin del partido antes del cambio de pestaña
                setTimeout(() => {
                    generateMainDraw(finalMatches);
                }, 1500);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setUpdatingId(null);
        }
    };

    const startMatch = async (matchId: string) => {
        setUpdatingId(matchId);
        try {
            const updatedMatches = matches.map(m =>
                m.id === matchId ? {
                    ...m,
                    status: MatchStatus.LIVE,
                    actualStartTime: new Date(),
                    score: '0-0',
                    sets: { t1: 0, t2: 0 },
                    games: { t1: 0, t2: 0 },
                    points: { t1: '0', t2: '0' },
                    server: { team: 1, player: 1 }
                } : m
            );
            await updateDoc(doc(db, 'tournaments', id), {
                matches: stripMatches(updatedMatches),
                updatedAt: new Date()
            });
            setMatches(updatedMatches);
        } catch (error) {
            console.error(error);
        } finally {
            setUpdatingId(null);
        }
    };

    const updateMatchScore = async (
        matchId: string,
        sets: { t1: number, t2: number },
        games: { t1: number, t2: number },
        points?: { t1: string, t2: string },
        server?: { team: 1 | 2, player: 1 | 2 }
    ) => {
        const scoreStr = `${sets.t1}-${sets.t2} (${games.t1}-${games.t2}) ${points ? `[${points.t1}-${points.t2}]` : ''}`;

        // Optimistic update
        const updatedMatches = matches.map(m =>
            m.id === matchId ? { ...m, sets, games, points: points || m.points, server: server || m.server, score: scoreStr } : m
        );

        setMatches(updatedMatches);

        if (selectedMatch && selectedMatch.id === matchId) {
            setSelectedMatch({
                ...selectedMatch,
                sets,
                games,
                points: points || selectedMatch.points,
                server: server || selectedMatch.server,
                score: scoreStr
            });
        }

        try {
            await updateDoc(doc(db, 'tournaments', id), {
                matches: stripMatches(updatedMatches),
                updatedAt: new Date()
            });
        } catch (error) {
            console.error("[Dashboard] Error updating score in Firebase:", error);
        }
    };

    const reactivateMatch = async (matchId: string) => {
        setUpdatingId(matchId);
        try {
            const updatedMatches = matches.map(m =>
                m.id === matchId ? { ...m, status: MatchStatus.LIVE, actualEndTime: null } : m
            );
            await updateDoc(doc(db, 'tournaments', id), {
                matches: stripMatches(updatedMatches),
                updatedAt: new Date()
            });
            setMatches(updatedMatches);
            setIsScoreModalOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setUpdatingId(null);
        }
    };

    const notifyMatch = (match: any, type: 'start' | 'result') => {
        const tournamentName = tournament?.name || 'Torneo de Padel';
        const court = match.court || 'Pista asignada';
        const time = formatTime(match.scheduledStartTime);

        let message = '';
        if (type === 'start') {
            message = `🎾 *TODO LISTO* 🎾\n\nHola! Tu partido en el torneo *${tournamentName}* está por comenzar.\n\n📍 *${court}*\n⏰ *${time}*\n\n¡Por favor, acude a tu pista!`;
        } else {
            const score = `${match.sets?.t1 || 0}-${match.sets?.t2 || 0} (${match.games?.t1 || 0}-${match.games?.t2 || 0})`;
            message = `🎾 *RESULTADO* 🎾\n\nEl partido ha finalizado.\n\n🏆 *${match.team1.name}* vs *${match.team2.name}*\n📊 Marcador: *${score}*\n\n¡Gracias por participar!`;
        }

        const encodedMsg = encodeURIComponent(message);

        // Intentar notificar a ambos equipos (abrimos la primera opción por ahora)
        const phones = [
            match.team1.phone1, match.team1.phone2,
            match.team2.phone1, match.team2.phone2
        ].filter(p => p && p.trim() !== '');

        if (phones.length === 0) {
            alert('No hay teléfonos registrados para estos jugadores.');
            return;
        }

        // Si hay varios, podríamos mostrar un pequeño menú, pero por simplicidad
        // abrimos el chat con el primer teléfono encontrado o el "capitán"
        window.open(`https://wa.me/${phones[0].replace(/\D/g, '')}?text=${encodedMsg}`, '_blank');
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
            <RefreshCw className="w-8 h-8 text-padel-primary animate-spin" />
            <p className="text-gray-500 animate-pulse font-medium text-sm">Cargando torneo...</p>
            <button
                onClick={() => router.push('/')}
                className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400 transition-all uppercase font-bold tracking-widest"
            >
                VOLVER AL INICIO
            </button>
        </div>
    );

    if (!tournament || error) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-center p-6">
            <Trophy className={`w-12 h-12 ${error ? 'text-red-500/50' : 'text-gray-800'}`} />
            <h1 className="text-xl font-bold">{error ? 'Acceso Restringido' : 'Torneo no encontrado'}</h1>
            <p className="text-gray-400 text-sm max-w-xs">{error || 'No pudimos encontrar el torneo solicitado.'}</p>
            <button
                onClick={() => router.push('/')}
                className="mt-6 px-8 py-3 bg-padel-primary text-black rounded-xl font-bold text-sm uppercase"
            >
                REGRESAR AL INICIO
            </button>
        </div>
    );

    const isRoundRobin = tournament?.type === TournamentType.ROUND_ROBIN;
    const hasBracket = matches.some(m => m.stage === 'MAIN_DRAW');

    // ── Calcular fases de cuadro dinámicamente según # parejas ────────────
    const numTeams = tournament?.teams?.length || 0;
    const dynamicBracketStages = (() => {
        const stages: string[] = [];
        // Construir rondas de eliminatoria basadas en # parejas en llave
        // Los clasificados suelen ser 2 por grupo → redondeamos al siguiente potencia de 2
        const bracketTeams = hasBracket
            ? (tournament?.groupAssignments ? Object.keys(tournament.groupAssignments).length * 2 : numTeams)
            : numTeams;
        const roundNames: Record<number, string> = {
            64: '64vo', 32: '32vo', 16: '16vo', 8: '8vo', 4: '4to', 2: 'Semifinales'
        };
        let size = 64;
        while (size >= 2) {
            if (bracketTeams > size / 2 && matches.some(m => m.stage === 'MAIN_DRAW' && m.bracketPosition?.round === Math.log2(64 / size) + 1)) {
                stages.push(roundNames[size] || `${size}vo`);
            } else if (bracketTeams <= size && bracketTeams > size / 2) {
                if (matches.some(m => m.stage === 'MAIN_DRAW')) stages.push(roundNames[size] || `${size}vo`);
            }
            size = size / 2;
        }
        if (matches.some(m => m.stage === 'MAIN_DRAW')) stages.push('Final');
        return stages;
    })();

    const ALL_BRACKET_STAGES = ['Fase de Grupo', ...dynamicBracketStages];

    // ── Tabs en el orden correcto ─────────────────────────────────────────
    const tabs: string[] = [];
    tabs.push('Grupos');
    tabs.push('Todos');
    // Fases del cuadro (solo las que tienen partidos)
    ALL_BRACKET_STAGES.forEach(s => {
        if (matches.some(m => {
            if (s === 'Fase de Grupo') return m.stage === 'GROUP_STAGE';
            if (s === 'Final') return m.stage === 'MAIN_DRAW' && m.bracketPosition?.round === Math.ceil(Math.log2(Math.max(numTeams, 2)));
            return m.stage === 'MAIN_DRAW' && getStageLabel(m) === s;
        })) tabs.push(s);
    });
    tabs.push('Por Comenzar');
    tabs.push('En Vivo');
    tabs.push('Finalizados');
    if (!isRoundRobin) tabs.push('Ranking');
    tabs.push('Reglas');
    // Deduplicar por si acaso algún valor se repitió
    const uniqueTabs = [...new Set(tabs)];

    const filteredMatches = matches.filter(m => {
        if (activeTab === 'Todos') return true;
        if (activeTab === 'En Vivo') return m.status === MatchStatus.LIVE;
        if (activeTab === 'Por Comenzar') return m.status === MatchStatus.PENDING;
        if (activeTab === 'Finalizados') return m.status === MatchStatus.FINISHED;
        if (activeTab === 'Reglas' || activeTab === 'Grupos' || activeTab === 'Ranking') return false;
        // Fase del cuadro
        if (activeTab === 'Fase de Grupo') return m.stage === 'GROUP_STAGE';
        return m.stage === 'MAIN_DRAW' && getStageLabel(m) === activeTab;
    });

    const isLiveDashboard = activeTab === 'En Vivo' && filteredMatches.length > 0 && filteredMatches.length <= 6;

    const getLiveConfig = (count: number) => {
        // Uniform config for rows of three as requested
        return {
            grid: 'grid-cols-1 md:grid-cols-3',
            name: 'text-[14px]',
            score: 'w-16 h-16 text-3xl',
            sets: 'w-10 h-10 text-lg',
            photo: 'w-11 h-11',
            gap: 'gap-4',
            padding: 'p-6',
            spacing: 'space-y-6',
            badge: 'text-[10px] px-3 py-1.5'
        };
    };

    const liveConfig = isLiveDashboard ? getLiveConfig(filteredMatches.length) : null;

    const calculateStandings = (matchesArray?: any[]) => {
        const standings: { [key: string]: any } = {};
        const matchesToUse = matchesArray || matches;

        matchesToUse.filter(m => m.status === MatchStatus.FINISHED).forEach(m => {
            const isIndividual = tournament?.type === TournamentType.AMERICANO_INDIVIDUAL;

            // Helper to update standing for a player or team
            const updateStats = (id: string, name: string, photo: string | null, gamesWon: number, gamesLost: number, setsWon: number = 0, setsLost: number = 0) => {
                if (!standings[id]) {
                    standings[id] = { id, name, photo, gamesWon: 0, gamesLost: 0, setsWon: 0, setsLost: 0, matchesWon: 0, matchesPlayed: 0 };
                }
                standings[id].gamesWon += gamesWon;
                standings[id].gamesLost += gamesLost;
                standings[id].setsWon += setsWon;
                standings[id].setsLost += setsLost;
                standings[id].matchesPlayed += 1;
                if (setsWon > setsLost || (setsWon === 0 && setsLost === 0 && gamesWon > gamesLost)) {
                    standings[id].matchesWon += 1;
                }
            };

            if (isIndividual) {
                const team1 = tournament.teams[m.team1Index - 1];
                const team2 = tournament.teams[m.team2Index - 1];

                if (team1) {
                    updateStats(team1.p1.id || `p-${m.team1Index}-1`, team1.p1.name, team1.p1.photo, m.games?.t1 || 0, m.games?.t2 || 0, m.sets?.t1 || 0, m.sets?.t2 || 0);
                    updateStats(team1.p2.id || `p-${m.team1Index}-2`, team1.p2.name, team1.p2.photo, m.games?.t1 || 0, m.games?.t2 || 0, m.sets?.t1 || 0, m.sets?.t2 || 0);
                }
                if (team2) {
                    updateStats(team2.p1.id || `p-${m.team2Index}-1`, team2.p1.name, team2.p1.photo, m.games?.t2 || 0, m.games?.t1 || 0, m.sets?.t2 || 0, m.sets?.t1 || 0);
                    updateStats(team2.p2.id || `p-${m.team2Index}-2`, team2.p2.name, team2.p2.photo, m.games?.t2 || 0, m.games?.t1 || 0, m.sets?.t2 || 0, m.sets?.t1 || 0);
                }
            } else {
                updateStats(`team-${m.team1Index}`, m.team1.name || `Pareja ${m.team1Index}`, null, m.games?.t1 || 0, m.games?.t2 || 0, m.sets?.t1 || 0, m.sets?.t2 || 0);
                updateStats(`team-${m.team2Index}`, m.team2.name || `Pareja ${m.team2Index}`, null, m.games?.t2 || 0, m.games?.t1 || 0, m.sets?.t2 || 0, m.sets?.t1 || 0);
            }
        });

        const sorted = Object.values(standings).sort((a: any, b: any) => {
            if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;
            const diffSetsA = a.setsWon - a.setsLost;
            const diffSetsB = b.setsWon - b.setsLost;
            if (diffSetsB !== diffSetsA) return diffSetsB - diffSetsA;
            const diffGamesA = a.gamesWon - a.gamesLost;
            const diffGamesB = b.gamesWon - b.gamesLost;
            if (diffGamesB !== diffGamesA) return diffGamesB - diffGamesA;
            return b.gamesWon - a.gamesWon;
        });

        return sorted;
    };

    const getGroupStandings = (matchesArray?: any[]) => {
        if (!isRoundRobin || !tournament?.groupAssignments) return {};

        const groupStandings: { [key: string]: any[] } = {};
        const allStandings = calculateStandings(matchesArray);

        (Object.entries(tournament.groupAssignments || {}) as [string, any][]).forEach(([groupName, teamIds]) => {
            if (!Array.isArray(teamIds)) return;

            const groupTeams = teamIds.map((teamId: string) => {
                const teamIdx = tournament.teams?.findIndex((t: any) => String(t.id) === teamId);
                const standing = allStandings.find(s => s.id === `team-${(teamIdx ?? -1) + 1}`);

                if (standing) return standing;

                const team = teamIdx !== undefined && teamIdx >= 0 ? tournament.teams?.[teamIdx] : null;
                return {
                    id: `team-${(teamIdx ?? -1) + 1}`,
                    name: team ? `${team.p1?.name || 'J1'} / ${team.p2?.name || 'J2'}` : 'Equipo no encontrado',
                    matchesPlayed: 0,
                    matchesWon: 0,
                    setsWon: 0,
                    setsLost: 0,
                    gamesWon: 0,
                    gamesLost: 0
                };
            });

            groupStandings[groupName] = groupTeams.sort((a: any, b: any) => {
                if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;
                const diffSetsA = a.setsWon - a.setsLost;
                const diffSetsB = b.setsWon - b.setsLost;
                if (diffSetsB !== diffSetsA) return diffSetsB - diffSetsA;
                const diffGamesA = a.gamesWon - a.gamesLost;
                const diffGamesB = b.gamesWon - b.gamesLost;
                if (diffGamesB !== diffGamesA) return diffGamesB - diffGamesA;
                return b.gamesWon - a.gamesWon;
            });
        });

        return groupStandings;
    };

    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white font-outfit">
            <header className="bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 flex-shrink-0">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <Link href="/tournaments" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                            </Link>
                            <div>
                                <h1 className="text-lg font-bold leading-tight">{tournament?.name}</h1>
                                <p className="text-xs text-padel-primary font-medium tracking-tight uppercase italic">{tournament?.complexName || 'Margarita Padel'} • {tournament?.category}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {canManageMatches && (
                            <Link
                                href={`/tournaments/${id}/control`}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-gray-400"
                                title="Panel de Gestión"
                            >
                                <LayoutDashboard className="w-5 h-5" />
                            </Link>
                        )}
                        {isAdmin && (
                            <Link
                                href={`/tournaments/${id}/master`}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-padel-primary/10 border border-padel-primary/20 hover:bg-padel-primary/20 transition-all text-padel-primary"
                                title="Master Central Dashboard"
                            >
                                <Zap className="w-5 h-5" />
                            </Link>
                        )}
                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                        >
                            <Share2 className="w-5 h-5 text-padel-primary" />
                        </button>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-2 overflow-x-auto hide-scrollbar">
                    <nav className="flex space-x-1 p-1">
                        {uniqueTabs.map((tab, tabIdx) => {
                            const isLive = tab === 'En Vivo';
                            const isPending = tab === 'Por Comenzar';
                            return (
                                <button
                                    key={`tab-${tabIdx}-${tab}`}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 min-w-[80px] py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap
                                        ${activeTab === tab
                                            ? isLive
                                                ? 'border-red-500 text-red-400'
                                                : 'border-padel-primary text-padel-primary'
                                            : isLive
                                                ? 'border-transparent text-red-600 hover:text-red-400'
                                                : 'border-transparent text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    {isLive ? (
                                        <span className="flex items-center justify-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                                            {tab}
                                        </span>
                                    ) : tab}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* Content Area */}
            <div className={`ipad-scroll-area ${isLiveDashboard ? 'overflow-hidden !pr-0' : ''}`}>
                <main className={`${isLiveDashboard ? 'max-w-none w-full h-full p-2' : 'max-w-4xl mx-auto w-full px-4 py-10'} transition-all duration-500`}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'Reglas' ? (
                            <motion.div
                                key="reglas"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-6"
                            >
                                <div className="bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-10 opacity-5">
                                        <Trophy className="w-40 h-40 text-padel-primary" />
                                    </div>
                                    <div className="relative z-10 space-y-8">
                                        <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                                            <div className="w-14 h-14 bg-padel-primary/20 rounded-2xl flex items-center justify-center">
                                                <Trophy className="w-7 h-7 text-padel-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter">Reglamento del Torneo</h3>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-1">Especificaciones Técnicas de Competición</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="mt-1 w-2 h-2 rounded-full bg-padel-primary shadow-[0_0_10px_#ccff00]" />
                                                    <div>
                                                        <h5 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Formato de Partido</h5>
                                                        <p className="text-sm font-bold italic uppercase tracking-wider text-white">
                                                            {tournament?.matchFormat === 'ONE_SET_6' && '1 Set Profesional (a 6 juegos)'}
                                                            {tournament?.matchFormat === 'ONE_SET_9' && '1 Set Largo (a 9 juegos)'}
                                                            {tournament?.matchFormat === 'TWO_SHORT_SETS' && '2 Sets Cortos (a 4) + MTB'}
                                                            {tournament?.matchFormat === 'TWO_NORMAL_SETS' && '2 Sets Normales (a 6) + MTB'}
                                                            {!tournament?.matchFormat && 'Formato Estándar'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4">
                                                    <div className="mt-1 w-2 h-2 rounded-full bg-padel-primary shadow-[0_0_10px_#ccff00]" />
                                                    <div>
                                                        <h5 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Sistema de Puntuación</h5>
                                                        <p className="text-sm font-bold italic uppercase tracking-wider text-white">
                                                            {tournament?.scoringSystem === 'GOLDEN_POINT' ? 'SUDDEN DEATH (Punto de Oro)' : 'VENTAJA TRADICIONAL'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {tournament?.type === TournamentType.ROUND_ROBIN && (
                                                    <div className="flex items-start gap-4">
                                                        <div className="mt-1 w-2 h-2 rounded-full bg-padel-primary shadow-[0_0_10px_#ccff00]" />
                                                        <div>
                                                            <h5 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Tamaño de Grupos</h5>
                                                            <p className="text-sm font-bold italic uppercase tracking-wider text-white">
                                                                {tournament?.groupSize ? `Grupos de ${tournament.groupSize} parejas` : 'Variable'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="mt-1 w-2 h-2 rounded-full bg-padel-primary shadow-[0_0_10px_#ccff00]" />
                                                    <div>
                                                        <h5 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Criterios de Desempate</h5>
                                                        <div className="space-y-2 mt-2">
                                                            {[
                                                                '1. Partidos Ganados',
                                                                '2. Diferencia de Sets',
                                                                '3. Diferencia de Juegos',
                                                                '4. Enfrentamiento Directo'
                                                            ].map(item => (
                                                                <p key={item} className="text-[10px] font-bold uppercase text-gray-400 italic">{item}</p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : activeTab === 'Grupos' ? (
                            <motion.div
                                key="grupos"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-8"
                            >
                                {isRoundRobin ? (() => {
                                    // ── ROUND ROBIN: tablas por grupo ─────────────────────
                                    const standings = getGroupStandings();
                                    const groupEntries = Object.entries(standings).sort((a, b) => a[0].localeCompare(b[0]));
                                    const availableGroups = groupEntries.map(([name]) => name);

                                    if (groupEntries.length === 0) {
                                        return (
                                            <div className="py-20 text-center space-y-4 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                                                    <Trophy className="w-8 h-8 text-white" />
                                                </div>
                                                <p className="text-xs font-black italic uppercase text-gray-600 tracking-widest">No se han generado grupos</p>
                                            </div>
                                        );
                                    }

                                    const selectedGroupData = groupEntries.find(([name]) => name === activeGroup) || groupEntries[0];
                                    const [groupName, groupTeams] = selectedGroupData;

                                    return (
                                        <div className="space-y-6">
                                            <div className="flex flex-wrap gap-2 pb-2">
                                                {availableGroups.map((name) => (
                                                    <button
                                                        key={name}
                                                        onClick={() => setActiveGroup(name)}
                                                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all ${activeGroup === name
                                                            ? 'bg-padel-primary text-black shadow-[0_10px_20px_rgba(204,255,0,0.2)] scale-105'
                                                            : 'bg-white/5 text-gray-500 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        Grupo {name}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="bg-[#1a1a1a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                                                <div className="bg-padel-primary px-6 py-2.5 flex justify-between items-center text-black">
                                                    <h3 className="font-black italic uppercase tracking-tighter text-xs">Grupo {groupName}</h3>
                                                    <span className="text-[10px] opacity-60 font-black uppercase tracking-widest italic">Clasificación</span>
                                                </div>
                                                <div className="p-3">
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full">
                                                            <thead>
                                                                <tr className="text-[9px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5">
                                                                    <th className="text-left py-2 px-2">#</th>
                                                                    <th className="text-left py-2 px-2">Pareja</th>
                                                                    <th className="text-center py-2 px-1">PJ</th>
                                                                    <th className="text-center py-2 px-1">PG</th>
                                                                    <th className="text-center py-2 px-1">Sets</th>
                                                                    <th className="text-center py-2 px-1">Pts</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-white/5">
                                                                {groupTeams.sort((a: any, b: any) => b.points - a.points || b.setsWon - a.setsWon).map((team: any, idx: number) => (
                                                                    <tr key={team.id} className="text-white group hover:bg-white/[0.02] transition-colors">
                                                                        <td className="py-2.5 px-2">
                                                                            <span className={`w-4 h-4 flex items-center justify-center rounded-md text-[8px] font-black italic ${idx < 2 ? 'bg-padel-primary text-black' : 'bg-white/10 text-white/40'}`}>{idx + 1}</span>
                                                                        </td>
                                                                        <td className="py-2.5 px-2">
                                                                            <span className="text-[10px] font-black italic uppercase tracking-tighter group-hover:text-padel-primary transition-colors leading-tight block">
                                                                                {team.name.replace(/\s+y\s+/i, ' / ')}
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-2.5 px-1 text-center text-[10px] font-bold text-gray-400">{team.played}</td>
                                                                        <td className="py-2.5 px-1 text-center text-[10px] font-bold text-gray-400">{team.won}</td>
                                                                        <td className="py-2.5 px-1 text-center text-[9px] font-bold text-gray-400">{team.setsWon}-{team.setsLost}</td>
                                                                        <td className="py-2.5 px-1 text-center text-[10px] font-black italic text-padel-primary">{team.points}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })() : (() => {
                                    // ── AMERICANO / KNOCKOUT: clasificación general ────────
                                    const isIndividual = tournament?.type === TournamentType.AMERICANO_INDIVIDUAL;
                                    const typeLabel = isIndividual ? 'Clasificación Individual' : 'Clasificación por Parejas';
                                    const entityLabel = isIndividual ? 'Jugador' : 'Pareja';

                                    // Standings from finished matches
                                    const computed = calculateStandings();
                                    const computedMap: Record<string, any> = {};
                                    computed.forEach((s: any) => { computedMap[s.id] = s; });

                                    // Add participants who haven't played yet (zero stats)
                                    const zeroStats = { matchesPlayed: 0, matchesWon: 0, setsWon: 0, setsLost: 0, gamesWon: 0, gamesLost: 0 };
                                    const extra: any[] = [];
                                    const seenIds = new Set(Object.keys(computedMap));

                                    if (isIndividual) {
                                        tournament?.teams?.forEach((team: any, idx: number) => {
                                            const pid1 = team.p1?.id || `p-${idx + 1}-1`;
                                            const pid2 = team.p2?.id || `p-${idx + 1}-2`;
                                            if (!seenIds.has(pid1) && team.p1?.name) {
                                                extra.push({ id: pid1, name: team.p1.name, photo: team.p1.photo || null, ...zeroStats });
                                                seenIds.add(pid1);
                                            }
                                            if (!seenIds.has(pid2) && team.p2?.name && team.p2.name !== team.p1?.name) {
                                                extra.push({ id: pid2, name: team.p2.name, photo: team.p2.photo || null, ...zeroStats });
                                                seenIds.add(pid2);
                                            }
                                        });
                                    } else {
                                        tournament?.teams?.forEach((team: any, idx: number) => {
                                            const tid = `team-${idx + 1}`;
                                            if (!seenIds.has(tid)) {
                                                extra.push({
                                                    id: tid,
                                                    name: `${team.p1?.name || 'J1'} / ${team.p2?.name || 'J2'}`,
                                                    photo: null,
                                                    ...zeroStats
                                                });
                                            }
                                        });
                                    }

                                    const allEntries = [...computed, ...extra].sort((a: any, b: any) => {
                                        if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;
                                        const dSA = a.setsWon - a.setsLost, dSB = b.setsWon - b.setsLost;
                                        if (dSB !== dSA) return dSB - dSA;
                                        const dGA = a.gamesWon - a.gamesLost, dGB = b.gamesWon - b.gamesLost;
                                        if (dGB !== dGA) return dGB - dGA;
                                        return b.gamesWon - a.gamesWon;
                                    });

                                    const getPoints = (s: any) => s.matchesWon * 3 + s.setsWon;

                                    if (allEntries.length === 0) {
                                        return (
                                            <div className="py-20 text-center space-y-4 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                                                    <Trophy className="w-8 h-8 text-white" />
                                                </div>
                                                <p className="text-xs font-black italic uppercase text-gray-600 tracking-widest">Sin participantes registrados</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="space-y-4">
                                            {/* Header card */}
                                            <div className="bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                                                <div className="bg-padel-primary px-8 py-5 flex justify-between items-center">
                                                    <div>
                                                        <h3 className="text-black font-black italic uppercase text-base tracking-tighter">{typeLabel}</h3>
                                                        <p className="text-[9px] text-black/60 font-black uppercase tracking-widest mt-0.5">
                                                            {allEntries.length} {isIndividual ? 'jugadores' : 'parejas'} · Puntos: PG×3 + Sets×1
                                                        </p>
                                                    </div>
                                                    <Trophy className="w-7 h-7 text-black opacity-20" />
                                                </div>

                                                <div className="p-3">
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full">
                                                            <thead>
                                                                <tr className="text-[9px] font-black uppercase tracking-widest text-gray-500 border-b border-white/[0.06]">
                                                                    <th className="text-left py-3 px-2 w-8">#</th>
                                                                    <th className="text-left py-3 px-2">{entityLabel}</th>
                                                                    <th className="text-center py-3 px-1.5 whitespace-nowrap">PJ</th>
                                                                    <th className="text-center py-3 px-1.5 whitespace-nowrap text-green-500">PG</th>
                                                                    <th className="text-center py-3 px-1.5 whitespace-nowrap text-red-500">PP</th>
                                                                    <th className="text-center py-3 px-1.5 whitespace-nowrap">Sets</th>
                                                                    <th className="text-center py-3 px-1.5 whitespace-nowrap">Games</th>
                                                                    <th className="text-right py-3 px-3 whitespace-nowrap">Pts</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-white/[0.04]">
                                                                {allEntries.map((entry: any, idx: number) => {
                                                                    const pts = getPoints(entry);
                                                                    const pp = entry.matchesPlayed - entry.matchesWon;
                                                                    const isPodium = idx < 3;
                                                                    const posColor = idx === 0
                                                                        ? 'bg-padel-primary text-black'
                                                                        : idx === 1
                                                                            ? 'bg-white/30 text-white'
                                                                            : idx === 2
                                                                                ? 'bg-white/15 text-white/80'
                                                                                : 'bg-white/5 text-gray-600';
                                                                    return (
                                                                        <tr key={entry.id} className={`group hover:bg-white/[0.03] transition-colors ${isPodium ? 'border-l-2 border-padel-primary/40' : ''}`}>
                                                                            <td className="py-3 px-2">
                                                                                <span className={`w-5 h-5 flex items-center justify-center rounded-md text-[8px] font-black italic ${posColor}`}>
                                                                                    {idx + 1}
                                                                                </span>
                                                                            </td>
                                                                            <td className="py-3 px-2 min-w-[120px]">
                                                                                <div className="flex items-center gap-2">
                                                                                    {entry.photo ? (
                                                                                        <img src={entry.photo} className="w-6 h-6 rounded-full object-cover border border-white/10 flex-shrink-0" />
                                                                                    ) : (
                                                                                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/[0.06] flex items-center justify-center text-[8px] font-bold text-gray-500 uppercase flex-shrink-0">
                                                                                            {(entry.name || '?')[0]}
                                                                                        </div>
                                                                                    )}
                                                                                    <span className="text-[10px] font-black italic uppercase tracking-tighter group-hover:text-padel-primary transition-colors leading-tight">
                                                                                        {entry.name}
                                                                                    </span>
                                                                                </div>
                                                                            </td>
                                                                            <td className="py-3 px-1.5 text-center text-[10px] font-bold text-gray-400">{entry.matchesPlayed}</td>
                                                                            <td className="py-3 px-1.5 text-center text-[10px] font-bold text-green-400">{entry.matchesWon}</td>
                                                                            <td className="py-3 px-1.5 text-center text-[10px] font-bold text-red-400">{pp}</td>
                                                                            <td className="py-3 px-1.5 text-center">
                                                                                <span className="text-[9px] font-bold text-gray-400 tabular-nums">{entry.setsWon}<span className="text-gray-600">-</span>{entry.setsLost}</span>
                                                                            </td>
                                                                            <td className="py-3 px-1.5 text-center">
                                                                                <span className="text-[9px] font-bold text-gray-400 tabular-nums">{entry.gamesWon}<span className="text-gray-600">-</span>{entry.gamesLost}</span>
                                                                            </td>
                                                                            <td className="py-3 px-3 text-right">
                                                                                <span className={`text-sm font-black italic tabular-nums ${pts > 0 ? 'text-padel-primary' : 'text-gray-600'}`}>{pts}</span>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Legend */}
                                            <div className="flex flex-wrap gap-3 px-2">
                                                {[['PJ', 'Partidos Jugados'], ['PG', 'Partidos Ganados'], ['PP', 'Partidos Perdidos'], ['Sets', 'Sets G–P'], ['Games', 'Juegos G–P'], ['Pts', 'Puntos (PG×3 + Sets×1)']].map(([k, v]) => (
                                                    <span key={k} className="text-[8px] font-bold uppercase tracking-widest text-gray-700">
                                                        <span className="text-gray-500">{k}</span> {v}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        ) : activeTab === 'Ranking' ? (
                            <motion.div
                                key="ranking"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-8"
                            >
                                <div className="bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                                    <div className="bg-padel-primary px-10 py-6 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-black font-black italic uppercase text-xl tracking-tighter">Ranking General</h3>
                                            <p className="text-[10px] text-black/60 font-black uppercase tracking-widest">Estadísticas Acumuladas</p>
                                        </div>
                                        <Trophy className="w-8 h-8 text-black opacity-20" />
                                    </div>
                                    <div className="p-8">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5">
                                                        <th className="text-left py-5 px-4 font-black">Pos</th>
                                                        <th className="text-left py-5 px-4 font-black">Jugador / Equipo</th>
                                                        <th className="text-center py-5 px-2 font-black">PJ</th>
                                                        <th className="text-center py-5 px-2 font-black">PG</th>
                                                        <th className="text-center py-5 px-2 font-black">Sets</th>
                                                        <th className="text-center py-5 px-2 font-black">Games</th>
                                                        <th className="text-right py-5 px-4 font-black">Puntos</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {calculateStandings().map((entry: any, idx: number) => (
                                                        <tr key={entry.id} className="group hover:bg-white/[0.02] transition-all">
                                                            <td className="py-6 px-4">
                                                                <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black italic ${idx === 0 ? 'bg-padel-primary text-black' : idx < 3 ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500'}`}>{idx + 1}</span>
                                                            </td>
                                                            <td className="py-6 px-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5">
                                                                        {entry.photo ? <img src={entry.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-600 uppercase">{(entry.name || '?')[0]}</div>}
                                                                    </div>
                                                                    <span className="text-xs font-black italic uppercase tracking-tighter text-white group-hover:text-padel-primary transition-colors">{entry.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-6 px-2 text-center text-xs font-bold text-gray-400">{entry.matchesPlayed}</td>
                                                            <td className="py-6 px-2 text-center text-xs font-bold text-gray-400">{entry.matchesWon}</td>
                                                            <td className="py-6 px-2 text-center text-xs font-bold text-gray-400">{entry.setsWon}-{entry.setsLost}</td>
                                                            <td className="py-6 px-2 text-center text-xs font-bold text-gray-400">{entry.gamesWon}-{entry.gamesLost}</td>
                                                            <td className="py-6 px-4 text-right">
                                                                <span className="text-lg font-black italic text-padel-primary">{(entry.matchesWon * 3) + (entry.setsWon * 1)}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="matchlist"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={isLiveDashboard ? 'h-full flex flex-col p-6 bg-[radial-gradient(circle_at_top,_#1a1a1a_0%,_#000_100%)]' : 'space-y-8'}
                            >
                                {filteredMatches.length === 0 ? (
                                    <div className="py-32 text-center space-y-6">
                                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                                            <Calendar className="w-12 h-12 text-padel-primary" />
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-3xl font-black uppercase italic tracking-tighter">Sin encuentros</h3>
                                            <p className="text-gray-500 text-xs max-w-xs mx-auto font-bold uppercase tracking-widest leading-relaxed">No hay partidos programados para esta sección.</p>
                                        </div>
                                        {canManageTournament && (
                                            <button
                                                onClick={generateMatches}
                                                disabled={loading}
                                                className="bg-padel-primary text-black px-16 py-5 rounded-2xl font-black text-xs uppercase italic tracking-widest hover:scale-105 transition-all shadow-[0_20px_60px_rgba(204,255,0,0.2)] disabled:opacity-50"
                                            >
                                                {loading ? 'CALCULANDO...' : 'GENERAR FIXTURE'}
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className={isLiveDashboard
                                        ? `grid grid-cols-1 md:grid-cols-3 gap-6 h-full`
                                        : `grid grid-cols-1 md:grid-cols-3 gap-6`
                                    }>
                                        {filteredMatches.map((match: any) => {
                                            if (!match || !match.team1 || !match.team2) return null;

                                            const t1p1 = match.team1?.p1Name || (match.team1?.name || '').split('/')[0]?.trim() || 'Jugador 1';
                                            const t1p2 = match.team1?.p2Name || (match.team1?.name || '').split('/')[1]?.trim();
                                            const t2p1 = match.team2?.p1Name || (match.team2?.name || '').split('/')[0]?.trim() || 'Jugador 3';
                                            const t2p2 = match.team2?.p2Name || (match.team2?.name || '').split('/')[1]?.trim();

                                            return (
                                                <motion.section
                                                    key={match.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className={`w-full ${isLiveDashboard ? 'h-full flex flex-col' : ''}`}
                                                >
                                                    <div className={`bg-[#0a0a0a] rounded-[2rem] overflow-hidden border border-white/5 flex flex-col shadow-xl hover:border-white/10 transition-all ${isLiveDashboard ? 'h-full' : ''}`}>

                                                        {/* ── Header: Pista + Hora ─────────────────────────── */}
                                                        <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${match.status === MatchStatus.LIVE ? 'bg-padel-primary animate-pulse shadow-[0_0_8px_#ccff00]' : match.status === MatchStatus.FINISHED ? 'bg-white/20' : 'bg-gray-600'}`} />
                                                                <span className={`text-[10px] font-black uppercase tracking-widest italic ${match.status === MatchStatus.LIVE ? 'text-padel-primary' : 'text-gray-500'}`}>
                                                                    Pista {match.court || '-'}
                                                                </span>
                                                                {match.time && (
                                                                    <span className="text-[10px] font-bold text-gray-600 tracking-wider">
                                                                        • {formatTime(match.time)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {match.groupName ? (
                                                                <span className="text-[9px] font-black bg-padel-primary text-black px-2 py-0.5 rounded italic uppercase">G{match.groupName}</span>
                                                            ) : match.status === MatchStatus.LIVE ? (
                                                                <span className="text-[9px] font-black text-red-400 uppercase italic tracking-widest animate-pulse">● En Vivo</span>
                                                            ) : match.status === MatchStatus.FINISHED ? (
                                                                <span className="text-[9px] font-black text-white/20 uppercase italic tracking-widest">Finalizado</span>
                                                            ) : null}
                                                        </div>

                                                        {/* ── Body: Pizarra tipo marcador ─────────────────── */}
                                                        {(() => {
                                                            const isActive = match.status === MatchStatus.LIVE || match.status === MatchStatus.FINISHED;
                                                            const isSTB = match.matchFormat === 'SUPER_TIEBREAK' || match.superTiebreak;
                                                            const isTB = !isSTB && (match.matchFormat === 'TIEBREAK' || match.tiebreak);
                                                            const showExtra = isSTB || isTB;
                                                            const extraLabel = isSTB ? 'STB' : 'TB';

                                                            const toTennisScore = (p: number) => {
                                                                const labels = ['0', '15', '30', '40', 'AD'];
                                                                return labels[Math.min(p ?? 0, 4)] ?? String(p);
                                                            };
                                                            const gp1 = match.points?.t1 ?? 0;
                                                            const gp2 = match.points?.t2 ?? 0;

                                                            const isT1Serving = match.status === MatchStatus.LIVE && match.server?.team === 1;
                                                            const isT2Serving = match.status === MatchStatus.LIVE && match.server?.team === 2;

                                                            // Nombre + inicial apellido
                                                            const fmt = (name: string) => {
                                                                if (!name) return '';
                                                                const parts = name.trim().split(' ');
                                                                if (parts.length === 1) return parts[0];
                                                                return `${parts[0]} ${parts[parts.length - 1][0]}.`;
                                                            };

                                                            const ROW_H = 'h-11';
                                                            const COL_W_SCORE = 'w-9';
                                                            const COL_W_POINTS = 'w-10';

                                                            const ServingBall = () => (
                                                                <motion.div
                                                                    animate={{ scale: [1, 1.3, 1] }}
                                                                    transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                                                                    className="w-2.5 h-2.5 rounded-full bg-padel-primary shadow-[0_0_6px_#ccff00] flex-shrink-0"
                                                                />
                                                            );

                                                            return (
                                                                <div className="flex flex-col">
                                                                    {/* Header columnas */}
                                                                    <div className="flex h-6 border-b border-white/[0.06] bg-white/[0.01]">
                                                                        <div className="flex-1" />
                                                                        <div className={`${COL_W_POINTS} border-l border-white/[0.06] flex items-center justify-center`}>
                                                                            <span className="text-[8px] font-black uppercase tracking-widest text-white/25">G</span>
                                                                        </div>
                                                                        <div className={`${COL_W_SCORE} border-l border-white/[0.06] flex items-center justify-center bg-white`}>
                                                                            <span className="text-[8px] font-black uppercase tracking-widest text-black/40">JG</span>
                                                                        </div>
                                                                        <div className={`${COL_W_SCORE} border-l border-white/[0.06] flex items-center justify-center bg-white`}>
                                                                            <span className="text-[8px] font-black uppercase tracking-widest text-black/40">ST</span>
                                                                        </div>
                                                                        {showExtra && (
                                                                            <div className={`${COL_W_SCORE} border-l border-white/[0.06] flex items-center justify-center bg-white`}>
                                                                                <span className="text-[8px] font-black uppercase tracking-widest text-black/40">{extraLabel}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Team 1 */}
                                                                    <div className={`flex ${ROW_H} items-stretch border-b border-white/[0.06]`}>
                                                                        {/* Nombres */}
                                                                        <div className="flex-1 flex items-center gap-2 px-3 min-w-0">
                                                                            <div className="w-3 flex-shrink-0 flex items-center justify-center">
                                                                                {isT1Serving && <ServingBall />}
                                                                            </div>
                                                                            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                                                                                <span className={`text-[11px] font-black italic uppercase tracking-tight leading-none truncate ${isT1Serving ? 'text-white' : 'text-white/65'}`}>
                                                                                    {fmt(t1p1)}
                                                                                </span>
                                                                                {t1p2 && (
                                                                                    <>
                                                                                        <span className="text-white/20 text-xs flex-shrink-0">·</span>
                                                                                        <span className={`text-[11px] font-black italic uppercase tracking-tight leading-none truncate ${isT1Serving ? 'text-white/70' : 'text-white/40'}`}>
                                                                                            {fmt(t1p2)}
                                                                                        </span>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        {/* G — puntos */}
                                                                        <div className={`${COL_W_POINTS} border-l border-white/[0.06] flex items-center justify-center bg-black`}>
                                                                            <span className={`font-black italic text-[15px] text-white ${!isActive ? 'opacity-20' : ''}`}>
                                                                                {isActive ? toTennisScore(gp1) : '–'}
                                                                            </span>
                                                                        </div>
                                                                        {/* JG — games */}
                                                                        <div className={`${COL_W_SCORE} border-l border-white/[0.06] flex items-center justify-center bg-white`}>
                                                                            <span className={`font-black italic text-lg text-black ${!isActive ? 'opacity-20' : ''}`}>
                                                                                {isActive ? (match.games?.t1 ?? 0) : '–'}
                                                                            </span>
                                                                        </div>
                                                                        {/* ST — sets */}
                                                                        <div className={`${COL_W_SCORE} border-l border-white/[0.06] flex items-center justify-center bg-white`}>
                                                                            <span className={`font-black italic text-lg text-black ${!isActive ? 'opacity-20' : ''}`}>
                                                                                {isActive ? (match.sets?.t1 ?? 0) : '–'}
                                                                            </span>
                                                                        </div>
                                                                        {showExtra && (
                                                                            <div className={`${COL_W_SCORE} border-l border-white/[0.06] flex items-center justify-center bg-white`}>
                                                                                <span className={`font-black italic text-lg text-black ${!isActive ? 'opacity-20' : ''}`}>
                                                                                    {isActive ? (isSTB ? (match.superTiebreakScore?.t1 ?? 0) : (match.tiebreakScore?.t1 ?? 0)) : '–'}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Team 2 */}
                                                                    <div className={`flex ${ROW_H} items-stretch`}>
                                                                        {/* Nombres */}
                                                                        <div className="flex-1 flex items-center gap-2 px-3 min-w-0">
                                                                            <div className="w-3 flex-shrink-0 flex items-center justify-center">
                                                                                {isT2Serving && <ServingBall />}
                                                                            </div>
                                                                            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                                                                                <span className={`text-[11px] font-black italic uppercase tracking-tight leading-none truncate ${isT2Serving ? 'text-white' : 'text-white/65'}`}>
                                                                                    {fmt(t2p1)}
                                                                                </span>
                                                                                {t2p2 && (
                                                                                    <>
                                                                                        <span className="text-white/20 text-xs flex-shrink-0">·</span>
                                                                                        <span className={`text-[11px] font-black italic uppercase tracking-tight leading-none truncate ${isT2Serving ? 'text-white/70' : 'text-white/40'}`}>
                                                                                            {fmt(t2p2)}
                                                                                        </span>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        {/* G */}
                                                                        <div className={`${COL_W_POINTS} border-l border-white/[0.06] flex items-center justify-center bg-black`}>
                                                                            <span className={`font-black italic text-[15px] text-white ${!isActive ? 'opacity-20' : ''}`}>
                                                                                {isActive ? toTennisScore(gp2) : '–'}
                                                                            </span>
                                                                        </div>
                                                                        {/* JG */}
                                                                        <div className={`${COL_W_SCORE} border-l border-white/[0.06] flex items-center justify-center bg-white`}>
                                                                            <span className={`font-black italic text-lg text-black ${!isActive ? 'opacity-20' : ''}`}>
                                                                                {isActive ? (match.games?.t2 ?? 0) : '–'}
                                                                            </span>
                                                                        </div>
                                                                        {/* ST */}
                                                                        <div className={`${COL_W_SCORE} border-l border-white/[0.06] flex items-center justify-center bg-white`}>
                                                                            <span className={`font-black italic text-lg text-black ${!isActive ? 'opacity-20' : ''}`}>
                                                                                {isActive ? (match.sets?.t2 ?? 0) : '–'}
                                                                            </span>
                                                                        </div>
                                                                        {showExtra && (
                                                                            <div className={`${COL_W_SCORE} border-l border-white/[0.06] flex items-center justify-center bg-white`}>
                                                                                <span className={`font-black italic text-lg text-black ${!isActive ? 'opacity-20' : ''}`}>
                                                                                    {isActive ? (isSTB ? (match.superTiebreakScore?.t2 ?? 0) : (match.tiebreakScore?.t2 ?? 0)) : '–'}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}

                                                        {/* ── Footer Actions ────────────────────────────────── */}
                                                        <div className="px-3 py-3 bg-white/[0.01] border-t border-white/5 flex gap-2">
                                                            {match.status === MatchStatus.PENDING && (
                                                                <>
                                                                    <button onClick={() => startMatch(match.id)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase rounded-xl italic transition-all">En Vivo</button>
                                                                    {canManageMatches && (
                                                                        <Link href={`/tournaments/${id}/score/${match.id}`} className="flex-1 py-3 bg-padel-primary/10 hover:bg-padel-primary/20 text-[9px] font-black uppercase rounded-xl text-center italic leading-relaxed transition-all text-padel-primary border border-padel-primary/30">Controlar Marcador</Link>
                                                                    )}
                                                                </>
                                                            )}
                                                            {match.status === MatchStatus.LIVE && (
                                                                <>
                                                                    {canManageMatches && (
                                                                        <Link href={`/tournaments/${id}/score/${match.id}`} className="flex-1 py-3 bg-padel-primary/10 hover:bg-padel-primary/20 text-[9px] font-black uppercase rounded-xl text-center italic leading-relaxed transition-all text-padel-primary border border-padel-primary/30">Controlar Marcador</Link>
                                                                    )}
                                                                    <button
                                                                        onClick={() => {
                                                                            const url = `${window.location.origin}/tournaments/${id}/stream/${match.id}`;
                                                                            navigator.clipboard.writeText(url);
                                                                            alert('Link de Streamer (OBS) copiado al portapapeles');
                                                                        }}
                                                                        className="w-12 py-3 bg-white/5 hover:bg-white/10 text-[#ccff00] rounded-xl flex items-center justify-center transition-all"
                                                                        title="Copiar URL para OBS/Stream"
                                                                    >
                                                                        <Tv className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={() => finishMatch(match.id)} className="flex-[1.5] py-3 bg-padel-primary text-black text-[9px] font-black uppercase rounded-xl italic hover:scale-[1.02] shadow-[0_5px_15px_rgba(204,255,0,0.2)] transition-all">Confirmar</button>
                                                                </>
                                                            )}
                                                            {match.status === MatchStatus.FINISHED && (
                                                                <>
                                                                    <button onClick={() => { setSelectedMatch(match); setIsScoreModalOpen(true); }} className="flex-1 py-3 bg-white/5 text-[9px] font-black uppercase rounded-xl italic opacity-50 hover:opacity-100 transition-all">Corregir</button>
                                                                    <div className="flex-[1.5] py-3 bg-white/[0.05] text-[9px] font-black uppercase rounded-xl text-center italic text-padel-primary">{(match.sets?.t1 || 0)}-{(match.sets?.t2 || 0)} Final</div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.section>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div >

            {/* Score Management Modal */}
            <AnimatePresence>
                {
                    isScoreModalOpen && selectedMatch && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-[#0f0f0f] w-full max-w-lg rounded-[32px] border border-white/10 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
                            >
                                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none">Marcador</h3>
                                            <p className="text-[8px] text-padel-primary font-bold uppercase tracking-widest leading-none mt-1">Sincronización en Directo</p>
                                        </div>
                                        <button
                                            onClick={() => setIsScoreModalOpen(false)}
                                            className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                                        >
                                            <X className="w-5 h-5 text-gray-400" />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {[1, 2].map((tIdx) => {
                                            const teamKey = `t${tIdx}` as 't1' | 't2';
                                            const otherTeamKey = tIdx === 1 ? 't2' : 't1';
                                            const teamData = tIdx === 1 ? selectedMatch.team1 : selectedMatch.team2;
                                            const isServingTeam = selectedMatch.server?.team === tIdx;

                                            return (
                                                <div key={tIdx} className={`bg-white/[0.02] p-4 rounded-3xl border transition-all ${isServingTeam ? 'border-padel-primary/30 ring-1 ring-padel-primary/10' : 'border-white/5'}`}>
                                                    <div className="flex justify-between items-center mb-4">
                                                        <div className="space-y-3">
                                                            <span className="font-black italic uppercase text-xs tracking-tighter block text-white/40 mb-1">Pareja {tIdx}</span>
                                                            <div className="flex gap-4">
                                                                {[1, 2].map(pIdx => (
                                                                    <button
                                                                        key={pIdx}
                                                                        onClick={() => updateMatchScore(selectedMatch.id, selectedMatch.sets, selectedMatch.games, selectedMatch.points, { team: tIdx as 1 | 2, player: pIdx as 1 | 2 })}
                                                                        className="relative group"
                                                                    >
                                                                        <div className={`relative w-12 h-12 rounded-full border-2 transition-all duration-500 ${selectedMatch.server?.team === tIdx && selectedMatch.server?.player === pIdx ? 'border-padel-primary scale-110 shadow-[0_0_15px_rgba(204,255,0,0.3)] z-10' : 'border-white/10 opacity-40 hover:opacity-100 italic'}`}>
                                                                            <div className="w-full h-full rounded-full overflow-hidden bg-white/5">
                                                                                <img src={`https://ui-avatars.com/api/?name=P${pIdx}&background=333&color=fff`} className="w-full h-full object-cover" />
                                                                            </div>
                                                                            {selectedMatch.server?.team === tIdx && selectedMatch.server?.player === pIdx && (
                                                                                <motion.div
                                                                                    animate={{ y: [0, -4, 0], scale: [1, 0.9, 1] }}
                                                                                    transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                                                                                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-padel-primary rounded-full shadow-[0_0_8px_#ccff00] z-20 border-2 border-black flex items-center justify-center overflow-hidden"
                                                                                >
                                                                                    <div className="absolute inset-0 border-[0.5px] border-black/10 rounded-full scale-75 rotate-45" />
                                                                                    <div className="absolute inset-0 border-[0.5px] border-black/10 rounded-full scale-75 -rotate-45" />
                                                                                </motion.div>
                                                                            )}
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            <p className="text-[9px] font-black uppercase text-white tracking-widest mt-2 truncate w-32">{teamData.name}</p>
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <div className="flex flex-col items-center gap-1 bg-padel-primary/5 px-3 py-2 rounded-2xl border border-padel-primary/10">
                                                                <span className="text-[8px] font-black text-padel-primary uppercase">Juegos</span>
                                                                <div className="flex items-center gap-3">
                                                                    <button onClick={() => updateMatchScore(selectedMatch.id, selectedMatch.sets, { ...selectedMatch.games, [teamKey]: Math.max(0, (selectedMatch.games?.[teamKey] || 0) - 1) }, selectedMatch.points)} className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:bg-white/10 hover:text-white transition-all">-</button>
                                                                    <span className="font-black text-lg italic w-4 text-center text-padel-primary">{selectedMatch.games?.[teamKey] || 0}</span>
                                                                    <button onClick={() => updateMatchScore(selectedMatch.id, selectedMatch.sets, { ...selectedMatch.games, [teamKey]: (selectedMatch.games?.[teamKey] || 0) + 1 }, selectedMatch.points)} className="w-6 h-6 rounded-full bg-padel-primary flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all text-sm font-bold">+</button>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1 bg-white/5 px-3 py-2 rounded-2xl border border-white/5">
                                                                <span className="text-[8px] font-black text-gray-500 uppercase">Sets</span>
                                                                <div className="flex items-center gap-3">
                                                                    <button onClick={() => updateMatchScore(selectedMatch.id, { ...selectedMatch.sets, [teamKey]: Math.max(0, (selectedMatch.sets?.[teamKey] || 0) - 1) }, selectedMatch.games, selectedMatch.points)} className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:bg-white/10 hover:text-white transition-all">-</button>
                                                                    <span className="font-black text-lg italic w-4 text-center">{selectedMatch.sets?.[teamKey] || 0}</span>
                                                                    <button onClick={() => updateMatchScore(selectedMatch.id, { ...selectedMatch.sets, [teamKey]: (selectedMatch.sets?.[teamKey] || 0) + 1 }, selectedMatch.games, selectedMatch.points)} className="w-6 h-6 rounded-full bg-padel-primary flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all text-sm font-bold">+</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-5 gap-3">
                                                        {['0', '15', '30', '40', 'AD'].map((pt) => (
                                                            <button
                                                                key={pt}
                                                                onClick={() => {
                                                                    const newPoints = {
                                                                        t1: selectedMatch.points?.t1 || '0',
                                                                        t2: selectedMatch.points?.t2 || '0',
                                                                        [teamKey]: pt
                                                                    };
                                                                    updateMatchScore(selectedMatch.id, selectedMatch.sets, selectedMatch.games, newPoints as any);
                                                                }}
                                                                className={`py-3.5 rounded-2xl text-[11px] font-black transition-all ${selectedMatch.points?.[teamKey] === pt ? 'bg-padel-primary text-black scale-110 shadow-[0_10px_20px_rgba(204,255,0,0.2)]' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/5'}`}
                                                            >
                                                                {pt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="space-y-3 pt-4">
                                        {selectedMatch.status === MatchStatus.LIVE ? (
                                            <button
                                                onClick={() => {
                                                    finishMatch(selectedMatch.id);
                                                    setIsScoreModalOpen(false);
                                                }}
                                                className="w-full py-5 bg-white text-black font-black uppercase italic tracking-widest rounded-3xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_40px_rgba(255,255,255,0.1)]"
                                            >
                                                Finalizar Partido
                                            </button>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => reactivateMatch(selectedMatch.id)}
                                                    className="py-5 bg-white/5 text-white font-black uppercase italic tracking-widest rounded-3xl text-[10px]"
                                                >
                                                    Reactivar
                                                </button>
                                                <button
                                                    onClick={() => setIsScoreModalOpen(false)}
                                                    className="py-5 bg-padel-primary text-black font-black uppercase italic tracking-widest rounded-3xl text-[10px]"
                                                >
                                                    Confirmar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* Navigation Bar */}
            < nav className="bg-[#0a0a0a] border-t border-white/5 px-8 py-3 pb-8 flex justify-between items-center z-50 flex-shrink-0" >
                <Link href="/tournaments" className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
                    <Trophy className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Torneos</span>
                </Link>
                <button
                    onClick={() => setActiveTab('Todas')}
                    className={`flex flex-col items-center gap-1 ${activeTab !== 'Ranking' ? 'text-padel-primary' : 'text-gray-500 hover:text-white'} transition-colors`}
                >
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: activeTab !== 'Ranking' ? "'FILL' 1" : "" }}>account_tree</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Cuadros</span>
                </button>
                <button
                    onClick={() => setActiveTab('Ranking')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'Ranking' ? 'text-padel-primary' : 'text-gray-500 hover:text-white'} transition-colors`}
                >
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: activeTab === 'Ranking' ? "'FILL' 1" : "" }}>analytics</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Ranking</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
                    <User className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Perfil</span>
                </button>
            </nav >

            {/* Share Modal */}
            <AnimatePresence>
                {
                    isShareModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-[#0f0f0f] w-full max-w-sm rounded-[32px] border border-white/10 overflow-hidden shadow-2xl"
                            >
                                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Compartir Torneo</h3>
                                    <button onClick={() => setIsShareModalOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => {
                                                const text = encodeURIComponent(`🎾 ¡Sigue los resultados de ${tournament?.name} en vivo por Smart Padel!`);
                                                const url = encodeURIComponent(window.location.href);
                                                window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
                                            }}
                                            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                                                <MessageCircle className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#25D366]">WhatsApp</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                const url = encodeURIComponent(window.location.href);
                                                const text = encodeURIComponent(`🎾 ¡Sigue los resultados de ${tournament?.name} en vivo por Smart Padel!`);
                                                window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
                                            }}
                                            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-[#0088cc]/10 border border-[#0088cc]/20 hover:bg-[#0088cc]/20 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center text-white">
                                                <Send className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#0088cc]">Telegram</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                const subject = encodeURIComponent(`Torneo de Padel: ${tournament?.name}`);
                                                const body = encodeURIComponent(`¡Hola! Te invito a seguir los resultados del torneo ${tournament?.name} en vivo aquí:\n\n${window.location.href}`);
                                                window.location.href = `mailto:?subject=${subject}&body=${body}`;
                                            }}
                                            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Correo</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(window.location.href);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            }}
                                            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-padel-primary/10 border border-padel-primary/20 hover:bg-padel-primary/20 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-padel-primary flex items-center justify-center text-black">
                                                {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-padel-primary">{copied ? 'Copiado' : 'Link'}</span>
                                        </button>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between gap-3">
                                        <span className="text-[10px] text-gray-500 font-medium truncate">{window.location.href}</span>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(window.location.href);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            }}
                                            className="text-padel-primary hover:scale-110 transition-transform"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <p className="text-[9px] text-center text-gray-600 uppercase font-bold tracking-widest italic py-2">
                                        Para compartir en Instagram, copia el link y pégalo en tu biografía o historias.
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

                @keyframes padel-shine {
                    0%, 100% { 
                        opacity: 0.8; 
                        box-shadow: 0 0 5px #ccff00, 0 0 0px #ccff00 inset;
                        transform: scale(1);
                    }
                    50% { 
                        opacity: 1; 
                        box-shadow: 0 0 20px #ccff00, 0 0 10px #ccff00 inset;
                        transform: scale(1.05);
                    }
                }
                .animate-padel-pulse {
                    animation: padel-shine 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                    border-color: #ccff00 !important;
                    z-index: 20;
                    position: relative;
                }
            `}</style>
        </div >
    );
}

function formatTime(dateVal: any) {
    if (!dateVal) return 'TBD';
    try {
        let date: Date;
        // Manejar Timestamps de Firestore
        if (dateVal && typeof dateVal.toDate === 'function') {
            date = dateVal.toDate();
        } else {
            date = new Date(dateVal);
        }

        if (isNaN(date.getTime())) return 'TBD';

        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).toUpperCase();
    } catch {
        return 'TBD';
    }
}

function getStageLabel(match: any) {
    if (!match) return '';
    if (match.stage === 'GROUP_STAGE') return 'Fase de Grupo';
    if (match.stage !== 'MAIN_DRAW') return 'Eliminatoria';

    if (match.roundName) {
        const name = match.roundName.toUpperCase();
        if (name.includes('SEMIFINAL')) return 'Semifinales';
        if (name.includes('CUARTOS')) return '4to';
        if (name.includes('OCTAVOS') || name.includes('8VO')) return '8vo';
        if (name.includes('16VOS') || name.includes('16VO')) return '16vo';
        if (name.includes('32VOS') || name.includes('32VO')) return '32vo';
        if (name.includes('64VOS') || name.includes('64VO')) return '64vo';
        if (name.includes('128VOS') || name.includes('128VO')) return '128vo';
        if (name.includes('FINAL') && !name.includes('OCTAVOS') && !name.includes('CUARTOS') && !name.includes('SEMI')) return 'Final';
        return match.roundName;
    }

    return 'Eliminatoria';
}

