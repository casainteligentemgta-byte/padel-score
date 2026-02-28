'use client';

import { useState, useEffect, use } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Clock,
    Calendar,
    MapPin,
    Play,
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    ChevronRight,
    RefreshCw,
    Plus,
    User,
    Link as LinkIcon,
    Share2,
    Copy,
    MessageCircle,
    Send,
    Mail,
    X,
    Gamepad2,
    Monitor,
    Tv,
    Camera,
    Trash2,
    Edit3,
    Save,
    Download,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { MatchStatus, TournamentType, ScheduleConfig } from '@/types/tournament';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { ScheduleEngine } from '@/services/ScheduleEngine';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import GroupPhaseView from '@/components/GroupPhaseView';
import TournamentPhaseManager from '@/components/TournamentPhaseManager';
import Sidebar from '@/components/Sidebar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';



export default function TournamentDashboard({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, profile, isAdmin, markerCanchas, loading: authLoading } = useAuth();
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
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isRulesEditOpen, setIsRulesEditOpen] = useState(false);
    const [rulesDraft, setRulesDraft] = useState('');
    const [isSavingRules, setIsSavingRules] = useState(false);

    const isOwner = tournament?.ownerId === user?.uid;
    const canManageMatches = isOwner || isAdmin || (profile?.role === 'marker' && (markerCanchas?.length ?? 0) > 0);
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
                    let tourneyData = { id: docSnap.id, ...docSnap.data() } as any;
                    const rawMatches = tourneyData.matches;
                    const teamsArray = Array.isArray(tourneyData.teams) ? tourneyData.teams : [];

                    // Si no hay groupAssignments pero hay partidos de "Fase de Grupos", inferir grupos (torneos del Generador Maestro antiguos)
                    if ((!tourneyData.groupAssignments || Object.keys(tourneyData.groupAssignments).length === 0) && Array.isArray(rawMatches) && teamsArray.length > 0) {
                        const groupMatches = rawMatches.filter((m: any) => m.roundName === 'Fase de Grupos');
                        if (groupMatches.length > 0) {
                            const idToIdx: Record<string, number> = {};
                            teamsArray.forEach((t: any, i: number) => { if (t?.id) idToIdx[String(t.id)] = i; });
                            const parent: Record<string, string> = {};
                            const getTeamId = (m: any, side: 'team1' | 'team2'): string | null => {
                                const t = m[side];
                                if (!t || t.isTBD) return null;
                                const id = t.id ?? t.p1?.id;
                                return id ? String(id) : null;
                            };
                            teamsArray.forEach((t: any) => { if (t?.id) parent[String(t.id)] = String(t.id); });
                            const find = (x: string) => { if (parent[x] !== x) parent[x] = find(parent[x]); return parent[x]; };
                            const union = (a: string, b: string) => { parent[find(a)] = find(b); };
                            groupMatches.forEach((m: any) => {
                                const id1 = getTeamId(m, 'team1');
                                const id2 = getTeamId(m, 'team2');
                                if (id1 && id2 && id1 !== id2) union(id1, id2);
                            });
                            const groupsById: Record<string, string[]> = {};
                            Object.keys(parent).forEach(id => {
                                const root = find(id);
                                if (!groupsById[root]) groupsById[root] = [];
                                groupsById[root].push(id);
                            });
                            const inferred: Record<string, string[]> = {};
                            Object.values(groupsById).filter(g => g.length > 0).sort((a, b) => b.length - a.length).forEach((g, i) => {
                                inferred[String.fromCharCode(65 + i)] = g;
                            });
                            if (Object.keys(inferred).length > 0) {
                                tourneyData = { ...tourneyData, groupAssignments: inferred };
                            }
                        }
                    }

                    setTournament(tourneyData);

                    // Initialize active group if none selected
                    if (tourneyData.type === TournamentType.ROUND_ROBIN && tourneyData.groupAssignments) {
                        const groups = Object.keys(tourneyData.groupAssignments).sort();
                        if (groups.length > 0 && !activeGroup) {
                            setActiveGroup(groups[0]);
                        }
                    }

                    if (Array.isArray(rawMatches) && rawMatches.length >= 0) {
                        const getPlayerName = (p: any, teamIdx: number, slot: 1 | 2) => {
                            if (teamIdx <= 0) return 'Por definir';
                            const name = p?.name?.trim();
                            if (name && name !== '') return name;
                            const index = (teamIdx * 2) - (slot === 1 ? 1 : 0);
                            return `Jugador ${index}`;
                        };

                        const buildTeamDisplay = (m: any, side: 'team1' | 'team2') => {
                            const idx = side === 'team1' ? m.team1Index : m.team2Index;
                            const teamFromIdx = (typeof idx === 'number' && idx > 0 && teamsArray[idx - 1]) ? teamsArray[idx - 1] : null;
                            // Formato Generador Maestro: partido ya trae team1/team2 y team1Name/team2Name
                            const rawTeam = m[side];
                            const rawName = side === 'team1' ? m.team1Name : m.team2Name;
                            if (rawTeam && (rawTeam.teamLabel || rawTeam.p1 || rawTeam.p2)) {
                                const name = rawName || rawTeam.teamLabel || (rawTeam.p1?.name && rawTeam.p2?.name ? `${rawTeam.p1.name} / ${rawTeam.p2.name}` : '?');
                                return {
                                    name: typeof name === 'string' ? name : '?',
                                    p1Name: rawTeam.p1?.name?.trim() || null,
                                    p2Name: rawTeam.p2?.name?.trim() || null,
                                    photo1: rawTeam.p1?.photo ?? null,
                                    photo2: rawTeam.p2?.photo ?? null,
                                    phone1: rawTeam.p1?.phone ?? null,
                                    phone2: rawTeam.p2?.phone ?? null
                                };
                            }
                            if (teamFromIdx) {
                                return {
                                    name: `${getPlayerName(teamFromIdx.p1, idx, 1)} / ${getPlayerName(teamFromIdx.p2, idx, 2)}`,
                                    p1Name: getPlayerName(teamFromIdx.p1, idx, 1),
                                    p2Name: getPlayerName(teamFromIdx.p2, idx, 2),
                                    photo1: teamFromIdx.p1?.photo ?? null,
                                    photo2: teamFromIdx.p2?.photo ?? null,
                                    phone1: teamFromIdx.p1?.phone ?? null,
                                    phone2: teamFromIdx.p2?.phone ?? null
                                };
                            }
                            return {
                                name: (typeof idx === 'number' && idx <= 0) ? 'Por definir' : (rawName || 'Por definir'),
                                p1Name: null,
                                p2Name: null,
                                photo1: null,
                                photo2: null,
                                phone1: null,
                                phone2: null
                            };
                        };

                        const enriched = rawMatches.map((m: any) => ({
                            ...m,
                            court: m.court ?? (m.courtIndex !== undefined ? m.courtIndex + 1 : undefined),
                            courtName: m.courtName ?? (m.court ? `Pista ${m.court}` : undefined),
                            team1: buildTeamDisplay(m, 'team1'),
                            team2: buildTeamDisplay(m, 'team2')
                        }));
                        setMatches(enriched);
                    } else {
                        setMatches([]);
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
            const nowIso = new Date().toISOString();
            const updatedMatches = matches.map(m =>
                m.id === matchId ? {
                    ...m,
                    status: MatchStatus.LIVE,
                    actualStartTime: nowIso,
                    startedAt: nowIso,
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

    const handleDeleteTournament = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        setIsDeleting(true);
        try {
            await dataService.deleteTournament(id);
            router.push('/tournaments');
        } catch (err) {
            console.error('[Dashboard] Error deleting tournament:', err);
            alert('Error al eliminar el torneo. Inténtalo de nuevo.');
            setIsDeleting(false);
            setConfirmDelete(false);
        }
    };

    const generatePDF = () => {
        if (!tournament || !matches.length) return;

        const doc = new jsPDF();
        const tournamentName = tournament.name || 'Torneo de Padel';
        const complexName = tournament.complexName || 'Margarita Padel';
        const category = formatCat(tournament.category);

        // Header
        doc.setFontSize(20);
        doc.text(tournamentName, 14, 22);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`${complexName} | Categoría: ${category}`, 14, 30);
        doc.text(`Fecha de exportación: ${new Date().toLocaleDateString('es-ES')}`, 14, 35);

        // Matches Table
        const tableData = matches.sort((a, b) => {
            const timeA = _toMsT(a.time || a.scheduledTime);
            const timeB = _toMsT(b.time || b.scheduledTime);
            return timeA - timeB;
        }).map((m, idx) => {
            const timeRaw = m.time || m.scheduledTime;
            const d = timeRaw?.toDate ? timeRaw.toDate() : new Date(timeRaw);
            const time = isNaN(d.getTime()) ? String(timeRaw) : d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

            return [
                idx + 1,
                time,
                m.court || m.courtIndex + 1 || '-',
                m.team1.name || 'Por definir',
                m.status === MatchStatus.FINISHED ? (m.score || '-') : 'VS',
                m.team2.name || 'Por definir',
                getStageLabel(m)
            ];
        });

        autoTable(doc, {
            startY: 45,
            head: [['#', 'Hora', 'Pista', 'Equipo 1', 'Resultado', 'Equipo 2', 'Etapa']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [204, 255, 0], textColor: [0, 0, 0], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { top: 45 },
        });

        doc.save(`Planilla_${tournamentName.replace(/\s+/g, '_')}.pdf`);
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
    const isCruzado = tournament?.type === TournamentType.CRUZADO;
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

    // ── Etiquetas legibles para categorías ────────────────────────────────
    const CAT_LABEL: Record<string, string> = {
        MAS_45: '+45', MAS_50: '+50',
        SUMA_7: 'Suma 7', SUMA_8: 'Suma 8', SUMA_9: 'Suma 9',
        SUMA_10: 'Suma 10', SUMA_11: 'Suma 11',
        PRIMERA: '1ª Cat.', SEGUNDA: '2ª Cat.', TERCERA: '3ª Cat.',
        CUARTA: '4ª Cat.', QUINTA: '5ª Cat.', SEXTA: '6ª Cat.', SEPTIMA: '7ª Cat.',
    };
    const formatCat = (cat?: string) => cat ? (CAT_LABEL[cat] ?? cat.replace(/_/g, ' ')) : '';

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
    tabs.push('En Vivo');
    tabs.push('Por Comenzar');
    tabs.push('Finalizados');
    if (!isRoundRobin && !isCruzado) tabs.push('Ranking');
    tabs.push('Reglas');
    // Deduplicar por si acaso algún valor se repitió
    const uniqueTabs = [...new Set(tabs)];

    // ── Pre-compute "Por Comenzar" data ONCE (fuera del .filter) ─────────────
    const _toMsT = (v: any): number => {
        if (!v) return 0;
        if (typeof v?.toDate === 'function') return v.toDate().getTime();          // Firestore Timestamp
        if (typeof v?.seconds === 'number') return v.seconds * 1000 + Math.floor((v.nanoseconds ?? 0) / 1e6); // Serialized TS
        if (typeof v === 'string') return new Date(v).getTime();
        if (v instanceof Date) return v.getTime();
        return 0;
    };
    const _toMin = (v: any) => Math.floor(_toMsT(v) / 60000);

    // ── Tabla de verdad: canchas reales por complejo ──────────────────────────
    // Esta es la fuente MÁS fiable (supera a courtNames que puede estar desactualizado)
    const _KNOWN: Record<string, number> = {
        'Margarita Padel': 6, 'Tibisay': 3, 'Sun Sol Costa Azul': 4,
        'Food Kart': 3, 'Elite': 4, 'Bodeguero': 3,
        'Sun Sol Pedro Gonzalez': 2, 'Playa el Agua': 3,
    };

    // ── Orden de prioridad para numCanchas ────────────────────────────────────
    // 1. KNOWN_COMPLEXES[complexName]: fuente de verdad del complejo (máxima prioridad)
    //    courtNames puede tener datos de otro complejo si el usuario cambió de complejo.
    // 2. Canchas únicas en el primer slot de matches (datos reales del fixture generado)
    // 3. totalCourts (campo Firestore)
    // 4. courtNames.length (menos fiable — puede estar desactualizado)
    // 5. 1 (fallback de seguridad)
    let _numCanchas = 0;

    // 1ª: KNOWN_COMPLEXES por complexName
    const _cxName: string = (tournament as any)?.complexName ?? '';
    if (_cxName && _KNOWN[_cxName] !== undefined) {
        _numCanchas = _KNOWN[_cxName];
    }

    // 2ª: canchas únicas en el primer slot del fixture
    if (_numCanchas === 0) {
        const _sorted = [...matches].sort((a, b) => _toMsT(a.scheduledTime) - _toMsT(b.scheduledTime));
        if (_sorted.length > 0) {
            const _firstMin = _toMin(_sorted[0].scheduledTime);
            if (_firstMin > 0) {
                const _firstSlot = _sorted.filter(mx => _toMin(mx.scheduledTime) === _firstMin);
                const _courts = new Set(_firstSlot.map(mx => Number(mx.court ?? mx.courtIndex ?? -1)).filter(n => n >= 0));
                _numCanchas = _courts.size;
            }
        }
    }

    // 3ª: totalCourts
    if (_numCanchas === 0) _numCanchas = Number((tournament as any)?.totalCourts ?? 0);

    // 4ª: courtNames.length (puede estar desactualizado, usar como último recurso)
    if (_numCanchas === 0 && Array.isArray((tournament as any)?.courtNames))
        _numCanchas = (tournament as any).courtNames.length;

    // Fallback
    if (_numCanchas <= 0) _numCanchas = 1;

    // Pending del slot más próximo, limitados a _numCanchas
    const _pending = matches
        .filter(mx => mx.status === MatchStatus.PENDING)
        .sort((a, b) => _toMsT(a.scheduledTime) - _toMsT(b.scheduledTime));
    const _earliestMin = _pending.length > 0 ? _toMin(_pending[0].scheduledTime) : null;
    const _nextSlot = _earliestMin !== null && _earliestMin > 0
        ? _pending.filter(p => _toMin(p.scheduledTime) === _earliestMin)
        : _pending;
    // Clave compuesta estable aunque el ID sea undefined (matches se regeneran en cada render)
    const _mkKey = (p: any) => `${_toMin(p.scheduledTime)}_${p.court ?? p.courtIndex ?? ''}`;
    const _nextUpKeys = new Set(_nextSlot.slice(0, _numCanchas).map(_mkKey));

    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && !(window as any).__diagLogged2) {
        (window as any).__diagLogged2 = true;
        console.log('[PorComenzar] complexName:', _cxName, '→ numCanchas:', _numCanchas);
        console.log('[PorComenzar] _earliestMin:', _earliestMin, '| _nextSlot:', _nextSlot.length, '| _nextUpKeys:', _nextUpKeys.size, '| keys:', [..._nextUpKeys]);
    }


    const filteredMatches = matches.filter(m => {
        if (activeTab === 'Todos') return true;
        if (activeTab === 'En Vivo') return m.status === MatchStatus.LIVE;
        if (activeTab === 'Por Comenzar') return _nextUpKeys.has(_mkKey(m));

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
            grid: 'grid-cols-3',
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

    /**
     * Para un partido PENDING, detecta si hay un partido LIVE en la misma cancha
     * que lleva más de lo esperado (85 min desde su inicio), y estima el retraso.
     * Retorna null si el partido está en tiempo, o { delayMins, estimatedStartMs } si está demorado.
     */
    const getDelayInfo = (match: any): { delayMins: number; estimatedStartMs: number } | null => {
        if (match.status !== MatchStatus.PENDING) return null;

        const courtKey = match.courtId ?? match.courtIndex ?? null;
        if (courtKey === null) return null;

        // Buscar partido LIVE en la misma cancha
        const liveOnCourt = matches.find((m: any) =>
            m.status === MatchStatus.LIVE &&
            (m.courtId ?? m.courtIndex ?? null) === courtKey &&
            m.actualStartTime
        );

        if (!liveOnCourt) return null;

        const now = Date.now();
        const startMs = liveOnCourt.actualStartTime?.toDate
            ? liveOnCourt.actualStartTime.toDate().getTime()
            : new Date(liveOnCourt.actualStartTime).getTime();

        const elapsedMins = (now - startMs) / 60000;
        const SLOT = 85; // minutos esperados por slot

        if (elapsedMins <= SLOT) return null; // aún en tiempo

        // Retraso estimado en esta cancha
        const delayMins = Math.ceil(elapsedMins - SLOT);
        const scheduledMs = match.scheduledTime?.toDate
            ? match.scheduledTime.toDate().getTime()
            : new Date(match.scheduledTime).getTime();
        const estimatedStartMs = scheduledMs + delayMins * 60000 + 5 * 60000; // +5 min buffer

        return { delayMins, estimatedStartMs };
    };

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
            <Sidebar />

            {/* Sticky Header */}
            <header className="sticky top-0 z-[60] bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 pb-2">
                <div className="max-w-4xl mx-auto px-6 pt-6 flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 ml-12 md:ml-0">
                            <Link href="/tournaments" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                            </Link>
                            <div>
                                <h1 className="text-lg font-bold leading-tight">
                                    {tournament?.name
                                        ? Object.entries(CAT_LABEL).reduce(
                                            (acc, [key, val]) => acc.replace(new RegExp(key, 'g'), val),
                                            tournament.name
                                        )
                                        : ''}
                                </h1>
                                <p className="text-xs text-padel-primary font-medium tracking-tight uppercase italic">{tournament?.complexName || 'Margarita Padel'} • {formatCat(tournament?.category)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsShareModalOpen(true); }}
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                            title="Compartir"
                        >
                            <Share2 className="w-4 h-4 text-padel-primary" />
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
            <div className={`ipad-scroll-area ${isLiveDashboard ? 'overflow-hidden !pr-0' : (activeTab === 'Por Comenzar' ? 'overflow-hidden' : '')}`}>
                <main className={`${isLiveDashboard ? 'max-w-none w-full h-full p-2' : activeTab === 'Por Comenzar' ? 'max-w-4xl mx-auto w-full px-4 py-6 h-full flex flex-col' : 'max-w-4xl mx-auto w-full px-4 py-10'} transition-all duration-500`}>
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
                                        <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-padel-primary/20 rounded-2xl flex items-center justify-center">
                                                    <Trophy className="w-7 h-7 text-padel-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter">Reglamento del Torneo</h3>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-1">Especificaciones Técnicas de Competición</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRulesDraft(tournament?.rules?.content ?? '');
                                                    setIsRulesEditOpen(true);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-padel-primary/20 border border-padel-primary/40 text-padel-primary hover:bg-padel-primary/30 font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98]"
                                            >
                                                <Edit3 className="w-4 h-4" /> Modificar reglas
                                            </button>
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

                                            <div className="flex items-start gap-4">
                                                <div className="mt-1 w-2 h-2 rounded-full bg-padel-primary shadow-[0_0_10px_#ccff00]" />
                                                <div>
                                                    <h5 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Jugadores menores de edad</h5>
                                                    <p className="text-[10px] font-bold text-gray-300 leading-relaxed mt-1">
                                                        Los partidos en los que participe un jugador menor de edad se programarán en horarios posteriores al mediodía los días de semana, preferiblemente.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reglamento adicional: fuera del grid, ancho completo, botón siempre visible */}
                                        <div className="mt-10 pt-8 border-t border-white/10">
                                            <h5 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3">Reglamento adicional</h5>
                                            {tournament?.rules?.content ? (
                                                <div className="rounded-xl bg-black/30 border border-white/5 p-4">
                                                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans">{tournament.rules.content}</pre>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-500 italic mb-3">Aún no hay texto de reglamento adicional.</p>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRulesDraft(tournament?.rules?.content ?? '');
                                                    setIsRulesEditOpen(true);
                                                }}
                                                className="mt-4 flex items-center gap-2 px-5 py-3 rounded-xl bg-padel-primary/25 border-2 border-padel-primary/60 text-padel-primary hover:bg-padel-primary/35 font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-[0_0_12px_rgba(204,255,0,0.15)]"
                                            >
                                                <Edit3 className="w-5 h-5" />
                                                {tournament?.rules?.content ? 'Modificar o quitar reglas' : 'Añadir reglas'}
                                            </button>
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
                                className="space-y-4"
                            >
                                {isCruzado ? (() => {
                                    // ── CRUZADO: Grupo A / Grupo B + Cuartos de final ────
                                    const ga = (tournament?.groupAssignments ?? {}) as Record<string, string[]>;
                                    const groupAIds: string[] = ga['A'] ?? [];
                                    const groupBIds: string[] = ga['B'] ?? [];

                                    // Calcular standings por grupo usando solo partidos cruzados finalizados
                                    const crossFinished = matches.filter((m: any) => m.status === MatchStatus.FINISHED && m.stage === 'GROUP_STAGE');

                                    const buildGroupStanding = (teamIds: string[]) => {
                                        return teamIds.map((tid) => {
                                            const teamIdx = tournament?.teams?.findIndex((t: any) => String(t.id) === tid);
                                            const team = teamIdx !== undefined && teamIdx >= 0 ? tournament?.teams?.[teamIdx] : null;
                                            const tNum = (teamIdx ?? -1) + 1; // 1-based index used in matches

                                            let mWon = 0, mPlayed = 0, sWon = 0, sLost = 0, gWon = 0, gLost = 0;
                                            crossFinished.forEach((m: any) => {
                                                const side = m.team1Index === tNum ? 't1' : m.team2Index === tNum ? 't2' : null;
                                                if (!side) return;
                                                const opp = side === 't1' ? 't2' : 't1';
                                                mPlayed++;
                                                gWon += m.games?.[side] ?? 0;
                                                gLost += m.games?.[opp] ?? 0;
                                                sWon += m.sets?.[side] ?? 0;
                                                sLost += m.sets?.[opp] ?? 0;
                                                if ((m.sets?.[side] ?? 0) > (m.sets?.[opp] ?? 0)) mWon++;
                                                else if (m.sets?.[side] === m.sets?.[opp] && (m.games?.[side] ?? 0) > (m.games?.[opp] ?? 0)) mWon++;
                                            });

                                            return {
                                                id: tid,
                                                tNum,
                                                name: team ? `${team.p1?.name ?? 'J1'} / ${team.p2?.name ?? 'J2'}` : `Pareja ${tNum}`,
                                                mWon, mPlayed, sWon, sLost, gWon, gLost,
                                            };
                                        }).sort((a, b) =>
                                            b.mWon - a.mWon ||
                                            (b.sWon - b.sLost) - (a.sWon - a.sLost) ||
                                            (b.gWon - b.gLost) - (a.gWon - a.gLost)
                                        );
                                    };

                                    const standA = buildGroupStanding(groupAIds);
                                    const standB = buildGroupStanding(groupBIds);

                                    // QF pairing: 1°A vs 2°B | 1°B vs 2°A | 3°A vs 4°B | 3°B vs 4°A
                                    const qfPairings = [
                                        { label: 'QF 1', t1: standA[0]?.name ?? 'TBD', t2: standB[1]?.name ?? 'TBD', desc: '1° A vs 2° B' },
                                        { label: 'QF 2', t1: standB[0]?.name ?? 'TBD', t2: standA[1]?.name ?? 'TBD', desc: '1° B vs 2° A' },
                                        { label: 'QF 3', t1: standA[2]?.name ?? 'TBD', t2: standB[3]?.name ?? 'TBD', desc: '3° A vs 4° B' },
                                        { label: 'QF 4', t1: standB[2]?.name ?? 'TBD', t2: standA[3]?.name ?? 'TBD', desc: '3° B vs 4° A' },
                                    ];

                                    const GroupPanel = ({ title, color, rows }: { title: string; color: string; rows: typeof standA }) => (
                                        <div className={`flex-1 bg-white/5 rounded-2xl border ${color} overflow-hidden`}>
                                            <div className={`px-4 py-3 border-b ${color} flex items-center gap-2`}>
                                                <span className={`text-xs font-black uppercase tracking-widest ${title === 'Grupo A' ? 'text-[#ccff00]' : 'text-blue-400'}`}>{title}</span>
                                            </div>
                                            <div className="divide-y divide-white/5">
                                                {rows.map((row, idx) => (
                                                    <div key={row.id} className="flex items-center gap-3 px-4 py-3">
                                                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black ${idx === 0 ? 'bg-[#ccff00] text-black' :
                                                            idx === 1 ? 'bg-white/20 text-white' :
                                                                'bg-white/5 text-gray-500'
                                                            }`}>{idx + 1}</span>
                                                        <span className="flex-1 text-xs font-bold text-white truncate">{row.name}</span>
                                                        <div className="flex gap-3 text-[10px] font-mono text-gray-400">
                                                            <span title="Pts">{row.mWon}P</span>
                                                            <span title="Sets">{row.sWon}-{row.sLost}</span>
                                                            <span title="Games">{row.gWon}-{row.gLost}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {rows.length === 0 && (
                                                    <p className="text-[10px] text-gray-600 text-center py-6 italic">Sin resultados aún</p>
                                                )}
                                            </div>
                                        </div>
                                    );

                                    return (
                                        <div className="space-y-5">
                                            {/* Header */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-[#ccff00]/10 rounded-full flex items-center justify-center">
                                                    <span className="text-[#ccff00] text-base">⚡</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black uppercase tracking-tighter text-white">Formato Cruzado</h3>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Grupo A vs Grupo B · 2 juegos por pareja · Top 4 avanzan</p>
                                                </div>
                                            </div>

                                            {/* Grupos lado a lado */}
                                            <div className="flex gap-3">
                                                <GroupPanel title="Grupo A" color="border-[#ccff00]/20" rows={standA} />
                                                <GroupPanel title="Grupo B" color="border-blue-500/20" rows={standB} />
                                            </div>

                                            {/* Cuartos de final */}
                                            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                                                <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                                                    <Trophy className="w-3 h-3 text-[#ccff00]" />
                                                    <span className="text-xs font-black uppercase tracking-widest text-[#ccff00]">Cuartos de Final</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-white/5">
                                                    {qfPairings.map((qf) => (
                                                        <div key={qf.label} className="p-4 space-y-2">
                                                            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{qf.desc}</p>
                                                            <div className="space-y-1">
                                                                <div className="text-[11px] font-bold text-white truncate">{qf.t1}</div>
                                                                <div className="text-[9px] text-gray-600 font-black uppercase">vs</div>
                                                                <div className="text-[11px] font-bold text-white truncate">{qf.t2}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })() : isRoundRobin ? (() => {
                                    // ── ROUND ROBIN: orquestador de fases con timeline y bracket ─
                                    const handleSaveGroupResult = async (matchId: string, gamesT1: number, gamesT2: number) => {
                                        const match = matches.find(m => m.id === matchId);
                                        if (!match) return;
                                        const teamAWon = gamesT1 > gamesT2;
                                        const updatedMatches = matches.map(m =>
                                            m.id === matchId
                                                ? {
                                                    ...m,
                                                    status: MatchStatus.FINISHED,
                                                    games: { t1: gamesT1, t2: gamesT2 },
                                                    sets: { t1: teamAWon ? 1 : 0, t2: teamAWon ? 0 : 1 },
                                                    score: `${gamesT1}-${gamesT2}`,
                                                    actualEndTime: new Date(),
                                                }
                                                : m
                                        );
                                        await updateDoc(doc(db, 'tournaments', id), {
                                            matches: stripMatches(updatedMatches),
                                            updatedAt: new Date(),
                                        });
                                        setMatches(updatedMatches);
                                    };
                                    return (
                                        <div className="space-y-4">
                                            {/* Verificación del sorteo: muestra qué equipos están en cada grupo y comprueba coherencia */}
                                            {tournament?.groupAssignments && Object.keys(tournament.groupAssignments).length > 0 && (() => {
                                                const ga = (tournament.groupAssignments ?? {}) as Record<string, string[]>;
                                                const groupNames = Object.keys(ga).sort();
                                                const allIds: string[] = [];
                                                groupNames.forEach(g => { (ga[g] || []).forEach((id: string) => allIds.push(id)); });
                                                const uniqueIds = new Set(allIds);
                                                const okNoDuplicates = allIds.length === uniqueIds.size;
                                                const totalTeams = tournament.teams?.length ?? 0;
                                                const okTotal = allIds.length === totalTeams;
                                                return (
                                                    <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                                                        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                                                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Verificación del sorteo</span>
                                                            {(okNoDuplicates && okTotal) ? <CheckCircle2 className="w-4 h-4 text-green-500" aria-label="Sorteo correcto" /> : <AlertTriangle className="w-4 h-4 text-amber-500" aria-label="Revisar asignación" />}
                                                        </div>
                                                        <div className="p-4 space-y-3">
                                                            {groupNames.map(g => {
                                                                const teamIds = ga[g] ?? [];
                                                                const names = teamIds.map((tid: string) => {
                                                                    const t = tournament.teams?.find((te: any) => String(te?.id) === tid);
                                                                    return t ? `${t.p1?.name ?? '?'} / ${t.p2?.name ?? '?'}` : tid;
                                                                });
                                                                return (
                                                                    <div key={g}>
                                                                        <span className="text-[10px] font-black uppercase text-padel-primary">Grupo {g}</span>
                                                                        <ul className="text-xs text-white mt-1 space-y-0.5">{names.map((n, i) => <li key={i}>{n}</li>)}</ul>
                                                                    </div>
                                                                );
                                                            })}
                                                            <p className="text-[10px] text-gray-500">
                                                                {okNoDuplicates && okTotal ? '✓ Cada equipo en un solo grupo. Total correcto.' : !okNoDuplicates ? '⚠ Un equipo aparece en más de un grupo.' : `⚠ Total equipos en grupos (${allIds.length}) no coincide con inscritos (${totalTeams}).`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                            <TournamentPhaseManager
                                                tournament={tournament}
                                                matches={matches}
                                                canManage={!!canManageTournament}
                                                onSaveResult={handleSaveGroupResult}
                                                onFinishGroupPhase={() => generateMainDraw()}
                                                onResetElimination={async () => {
                                                    // Eliminar partidos de llave y restaurar edición de grupos
                                                    const groupOnly = matches.filter(m =>
                                                        m.stage === 'GROUP_STAGE' || m.groupName != null
                                                    );
                                                    await updateDoc(doc(db, 'tournaments', id), {
                                                        matches: stripMatches(groupOnly),
                                                        mainDrawGenerated: false,
                                                        updatedAt: new Date(),
                                                    });
                                                    setMatches(groupOnly);
                                                }}
                                            />
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
                                className={isLiveDashboard
                                    ? 'h-full flex flex-col p-6 bg-[radial-gradient(circle_at_top,_#1a1a1a_0%,_#000_100%)]'
                                    : activeTab === 'Por Comenzar'
                                        ? 'flex-1 flex flex-col min-h-0'
                                        : 'space-y-8'}
                            >
                                {filteredMatches.length === 0 ? (
                                    <div className="py-32 text-center space-y-6">
                                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                                            <Calendar className="w-12 h-12 text-padel-primary" />
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-3xl font-black uppercase italic tracking-tighter">Sin encuentros</h3>
                                            <p className="text-gray-500 text-xs max-w-xs mx-auto font-bold uppercase tracking-widest leading-relaxed">
                                                Los partidos pasan a estar en vivo cuando un marcador o un administrador den Iniciar partido en la pantalla del marcador.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={(() => {
                                        const count = filteredMatches.filter((m: any) => m && m.team1 && m.team2).length;
                                        if (isLiveDashboard) return 'grid grid-cols-3 gap-4 h-full items-start';
                                        if (activeTab === 'Por Comenzar') {
                                            const rows = count <= 3 ? 1 : 2;
                                            return `grid grid-cols-3 gap-3 flex-1 min-h-0 items-start`;
                                        }
                                        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start';
                                    })()}>
                                        {filteredMatches.filter((match: any) => match && match.team1 && match.team2).map((match: any, idx: number) => {

                                            // ── Resolver nombres de jugadores ──────────────────────────────────
                                            // Prioridad: teamLabel (TBD/knockout) > p1Name > p1.name > team1Name > '?'
                                            const resolveNames = (team: any, teamName?: string): [string, string] => {
                                                // Equipo TBD (semis/final): mostrar el label completo en p1
                                                if (team?.isTBD || team?.teamLabel) {
                                                    return [team?.teamLabel || team?.p1?.name || teamName || '?', ''];
                                                }
                                                const p1 = (team?.p1Name || team?.p1?.name || '').trim();
                                                const p2 = (team?.p2Name || team?.p2?.name || '').trim();
                                                // Si no hay nada, intentar split del teamName
                                                if (!p1 && teamName) {
                                                    const parts = teamName.split('/');
                                                    return [(parts[0] || '?').trim(), (parts[1] || '').trim()];
                                                }
                                                return [p1 || '?', p2];
                                            };
                                            const [t1p1, t1p2] = resolveNames(match.team1, match.team1Name);
                                            const [t2p1, t2p2] = resolveNames(match.team2, match.team2Name);
                                            const delayInfo = getDelayInfo(match);

                                            return (
                                                <motion.section
                                                    key={match.id ?? `match-${idx}`}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className={`w-full ${(isLiveDashboard || activeTab === 'Por Comenzar') ? 'h-full flex flex-col' : ''}`}
                                                >
                                                    <div className={`bg-[#111111] rounded-[2rem] overflow-hidden border border-white/[0.12] flex flex-col shadow-2xl hover:border-white/25 transition-all ${(isLiveDashboard || activeTab === 'Por Comenzar') ? 'h-full' : ''}`}>

                                                        {/* ── Header: 2 líneas (compacto) ─────────────────── */}
                                                        <div className="px-3 pt-1.5 pb-1 border-b border-white/[0.10] flex flex-col gap-0.5 bg-white/[0.07]">
                                                            {/* Línea 1: Pista · Hora + estado/grupo */}
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${match.status === MatchStatus.LIVE ? 'bg-padel-primary animate-pulse shadow-[0_0_8px_#ccff00]' : match.status === MatchStatus.FINISHED ? 'bg-white/20' : 'bg-gray-600'}`} />
                                                                    <span className={`text-[9px] font-black uppercase tracking-widest italic ${match.status === MatchStatus.LIVE ? 'text-padel-primary' : 'text-gray-500'}`}>
                                                                        Pista {match.court || '-'}
                                                                    </span>
                                                                    {(() => {
                                                                        const raw = match.time || match.scheduledTime;
                                                                        if (!raw) return null;
                                                                        // Si hay demora, mostramos hora estimada en naranja; si no, hora programada normal
                                                                        if (delayInfo) {
                                                                            const estTime = new Date(delayInfo.estimatedStartMs);
                                                                            const hhmm = estTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
                                                                            return (
                                                                                <span className="text-[10px] font-bold text-orange-400 tracking-wider">· ~{hhmm}</span>
                                                                            );
                                                                        }
                                                                        const d = raw?.toDate ? raw.toDate() : new Date(raw);
                                                                        const hhmm = isNaN(d.getTime()) ? String(raw) : d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
                                                                        return (
                                                                            <span className="text-[9px] font-bold text-gray-500 tracking-wider">· {hhmm}</span>
                                                                        );
                                                                    })()}
                                                                </div>
                                                                {/* Badge derecho: prioridad EN VIVO > Finalizado > DEMORADO > campo */}
                                                                {match.status === MatchStatus.LIVE ? (
                                                                    <span className="text-[8px] font-black text-red-500 uppercase italic tracking-widest animate-pulse border border-red-500/30 px-1.5 py-0.5 rounded-full bg-red-500/5">● En Vivo</span>
                                                                ) : match.status === MatchStatus.FINISHED ? (
                                                                    <span className="text-[8px] font-black text-white/30 uppercase italic tracking-widest border border-white/10 px-1.5 py-0.5 rounded-full bg-white/5">Finalizado</span>
                                                                ) : delayInfo ? (
                                                                    <span className="text-[8px] font-black text-orange-400 bg-orange-500/10 border border-orange-500/30 px-1.5 py-0.5 rounded-full italic uppercase tracking-widest animate-pulse">
                                                                        ⚠ ~{delayInfo.delayMins}m
                                                                    </span>
                                                                ) : match.groupName && match.roundName === 'Fase de Grupos' ? (
                                                                    <span className="text-[8px] font-black text-padel-primary/40 uppercase tracking-widest italic border border-padel-primary/10 px-1.5 py-0.5 rounded-full bg-padel-primary/5">
                                                                        Grupo {match.groupName}
                                                                    </span>
                                                                ) : match.roundName ? (
                                                                    <span className="text-[8px] font-black text-padel-primary/40 uppercase tracking-widest italic border border-padel-primary/10 px-1.5 py-0.5 rounded-full bg-padel-primary/5">
                                                                        {match.roundName}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                            {/* Línea 2: Chips categoría + género + badge de grupo si está activo */}
                                                            {(tournament?.category || tournament?.gender || match.groupName) && (
                                                                <div className="flex items-center gap-1.5">
                                                                    {match.groupName && (
                                                                        <span className="text-[8px] font-black bg-padel-primary text-black px-2 py-0.5 rounded italic uppercase tracking-wider">
                                                                            Grupo {match.groupName}
                                                                        </span>
                                                                    )}
                                                                    {tournament?.category && (
                                                                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 bg-white/[0.10] border border-white/[0.15] px-1.5 py-0.5 rounded">
                                                                            {formatCat(tournament.category)}
                                                                        </span>
                                                                    )}
                                                                    {tournament?.gender && (
                                                                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${tournament.gender === 'MALE' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                                                                            tournament.gender === 'FEMALE' ? 'text-pink-400 bg-pink-500/10 border-pink-500/20' :
                                                                                'text-purple-400 bg-purple-500/10 border-purple-500/20'
                                                                            }`}>
                                                                            {tournament.gender === 'MALE' ? '♂ Masc' : tournament.gender === 'FEMALE' ? '♀ Fem' : '⚥ Mix'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
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

                                                            const ROW_H = 'h-8';
                                                            const COL_W_SCORE = 'w-8';
                                                            const COL_W_POINTS = 'w-9';

                                                            const ServingBall = () => (
                                                                <motion.div
                                                                    animate={{ scale: [1, 1.3, 1] }}
                                                                    transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                                                                    className="w-2 h-2 rounded-full bg-padel-primary shadow-[0_0_6px_#ccff00] flex-shrink-0"
                                                                />
                                                            );

                                                            return (
                                                                <div className="flex flex-col flex-1 min-h-0">
                                                                    {/* Header columnas pizarra */}
                                                                    <div className="flex h-4 border-b border-white/[0.12] bg-white/[0.05] shrink-0">
                                                                        <div className="flex-1" />
                                                                        <div className={`${COL_W_POINTS} border-l border-white/[0.06] flex items-center justify-center`}>
                                                                            <span className="text-[8px] font-black uppercase tracking-widest text-white/25">P</span>
                                                                        </div>
                                                                        <div className={`${COL_W_SCORE} border-l border-white/[0.06] flex items-center justify-center bg-black`}>
                                                                            <span className="text-[8px] font-black uppercase tracking-widest text-white/60">G</span>
                                                                        </div>
                                                                        <div className={`${COL_W_SCORE} border-l border-white/[0.06] flex items-center justify-center bg-black`}>
                                                                            <span className="text-[8px] font-black uppercase tracking-widest text-white/60">S</span>
                                                                        </div>
                                                                        {showExtra && (
                                                                            <div className={`${COL_W_SCORE} border-l border-white/[0.06] flex items-center justify-center bg-black`}>
                                                                                <span className="text-[8px] font-black uppercase tracking-widest text-white/60">{extraLabel}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Team 1 */}
                                                                    <div className={`flex ${ROW_H} items-stretch border-b border-white/[0.12]`}>
                                                                        {/* Nombres */}
                                                                        {(() => {
                                                                            const t1total = (fmt(t1p1) + (t1p2 ? fmt(t1p2) : '')).length;
                                                                            const fs1 = t1total <= 8 ? '14px' : t1total <= 13 ? '12px' : t1total <= 18 ? '10px' : t1total <= 24 ? '9px' : '8px';
                                                                            return (
                                                                                <div className="flex-1 flex items-center gap-2 px-3 min-w-0">
                                                                                    <div className="w-3 flex-shrink-0 flex items-center justify-center">
                                                                                        {isT1Serving && <ServingBall />}
                                                                                    </div>
                                                                                    <div className="flex items-center gap-1 min-w-0 overflow-hidden flex-wrap">
                                                                                        <span style={{ fontSize: fs1 }} className={`font-black italic uppercase tracking-tight leading-none ${isT1Serving ? 'text-white' : 'text-white/65'}`}>
                                                                                            {fmt(t1p1)}
                                                                                        </span>
                                                                                        {t1p2 && (
                                                                                            <>
                                                                                                <span className="text-white/20 text-xs flex-shrink-0">·</span>
                                                                                                <span style={{ fontSize: fs1 }} className={`font-black italic uppercase tracking-tight leading-none ${isT1Serving ? 'text-white/70' : 'text-white/40'}`}>
                                                                                                    {fmt(t1p2)}
                                                                                                </span>
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })()}
                                                                        {/* G — puntos */}
                                                                        <div className={`${COL_W_POINTS} border-l border-white/[0.06] flex items-center justify-center bg-black`}>
                                                                            <span className={`font-black italic text-[13px] text-white ${!isActive ? 'opacity-20' : ''}`}>
                                                                                {isActive ? toTennisScore(gp1) : '–'}
                                                                            </span>
                                                                        </div>
                                                                        {/* JG — games */}
                                                                        <div className={`${COL_W_SCORE} border-l border-white/[0.06] flex items-center justify-center bg-white`}>
                                                                            <span className={`font-black italic text-base text-black ${!isActive ? 'opacity-20' : ''}`}>
                                                                                {isActive ? (match.games?.t1 ?? 0) : '–'}
                                                                            </span>
                                                                        </div>
                                                                        {/* ST — sets */}
                                                                        <div className={`${COL_W_SCORE} border-l border-white/[0.06] flex items-center justify-center bg-white`}>
                                                                            <span className={`font-black italic text-base text-black ${!isActive ? 'opacity-20' : ''}`}>
                                                                                {isActive ? (match.sets?.t1 ?? 0) : '–'}
                                                                            </span>
                                                                        </div>
                                                                        {showExtra && (
                                                                            <div className={`${COL_W_SCORE} border-l border-white/[0.06] flex items-center justify-center bg-white`}>
                                                                                <span className={`font-black italic text-base text-black ${!isActive ? 'opacity-20' : ''}`}>
                                                                                    {isActive ? (isSTB ? (match.superTiebreakScore?.t1 ?? 0) : (match.tiebreakScore?.t1 ?? 0)) : '–'}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Team 2 */}
                                                                    <div className={`flex ${ROW_H} items-stretch`}>
                                                                        {/* Nombres */}
                                                                        {(() => {
                                                                            const t2total = (fmt(t2p1) + (t2p2 ? fmt(t2p2) : '')).length;
                                                                            const fs2 = t2total <= 8 ? '14px' : t2total <= 13 ? '12px' : t2total <= 18 ? '10px' : t2total <= 24 ? '9px' : '8px';
                                                                            return (
                                                                                <div className="flex-1 flex items-center gap-2 px-3 min-w-0">
                                                                                    <div className="w-3 flex-shrink-0 flex items-center justify-center">
                                                                                        {isT2Serving && <ServingBall />}
                                                                                    </div>
                                                                                    <div className="flex items-center gap-1 min-w-0 overflow-hidden flex-wrap">
                                                                                        <span style={{ fontSize: fs2 }} className={`font-black italic uppercase tracking-tight leading-none ${isT2Serving ? 'text-white' : 'text-white/65'}`}>
                                                                                            {fmt(t2p1)}
                                                                                        </span>
                                                                                        {t2p2 && (
                                                                                            <>
                                                                                                <span className="text-white/20 text-xs flex-shrink-0">·</span>
                                                                                                <span style={{ fontSize: fs2 }} className={`font-black italic uppercase tracking-tight leading-none ${isT2Serving ? 'text-white/70' : 'text-white/40'}`}>
                                                                                                    {fmt(t2p2)}
                                                                                                </span>
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })()}
                                                                        {/* G */}
                                                                        <div className={`${COL_W_POINTS} border-l border-white/[0.06] flex items-center justify-center bg-black`}>
                                                                            <span className={`font-black italic text-[13px] text-white ${!isActive ? 'opacity-20' : ''}`}>
                                                                                {isActive ? toTennisScore(gp2) : '–'}
                                                                            </span>
                                                                        </div>
                                                                        {/* JG */}
                                                                        <div className={`${COL_W_SCORE} border-l border-white/[0.06] flex items-center justify-center bg-white`}>
                                                                            <span className={`font-black italic text-base text-black ${!isActive ? 'opacity-20' : ''}`}>
                                                                                {isActive ? (match.games?.t2 ?? 0) : '–'}
                                                                            </span>
                                                                        </div>
                                                                        {/* ST */}
                                                                        <div className={`${COL_W_SCORE} border-l border-white/[0.06] flex items-center justify-center bg-white`}>
                                                                            <span className={`font-black italic text-base text-black ${!isActive ? 'opacity-20' : ''}`}>
                                                                                {isActive ? (match.sets?.t2 ?? 0) : '–'}
                                                                            </span>
                                                                        </div>
                                                                        {showExtra && (
                                                                            <div className={`${COL_W_SCORE} border-l border-white/[0.06] flex items-center justify-center bg-white`}>
                                                                                <span className={`font-black italic text-base text-black ${!isActive ? 'opacity-20' : ''}`}>
                                                                                    {isActive ? (isSTB ? (match.superTiebreakScore?.t2 ?? 0) : (match.tiebreakScore?.t2 ?? 0)) : '–'}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}

                                                        {/* Menú justo debajo de la pizarra — solo en Por Comenzar y En Vivo */}
                                                        {(activeTab === 'Por Comenzar' || activeTab === 'En Vivo') && (
                                                            <nav className="shrink-0 grid grid-cols-4 border-t border-white/[0.08] bg-black/60 py-1 transition-all">
                                                                <Link
                                                                    href={`/tournaments/${id}/control`}
                                                                    className="flex flex-col items-center justify-center gap-0.5 py-1 text-gray-500 hover:text-padel-primary hover:bg-white/[0.06] transition-all active:scale-95 border-r border-white/5"
                                                                >
                                                                    <Zap className="w-3 h-3" />
                                                                    <span className="text-[5px] font-black uppercase tracking-widest">Control</span>
                                                                </Link>
                                                                <Link
                                                                    href={id ? `/tournaments/${id}/monitor` : '#'}
                                                                    target={id ? '_blank' : undefined}
                                                                    className="flex flex-col items-center justify-center gap-0.5 py-1 text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all active:scale-95 border-r border-white/5"
                                                                >
                                                                    <Monitor className="w-3 h-3" />
                                                                    <span className="text-[5px] font-black uppercase tracking-widest">Pizarra</span>
                                                                </Link>
                                                                <Link
                                                                    href={id ? `/tournaments/${id}/control/broadcasting` : '#'}
                                                                    className="flex flex-col items-center justify-center gap-0.5 py-1 text-gray-500 hover:text-orange-400 hover:bg-white/[0.06] transition-all active:scale-95 border-r border-white/5"
                                                                >
                                                                    <Camera className="w-3 h-3" />
                                                                    <span className="text-[5px] font-black uppercase tracking-widest">Canales</span>
                                                                </Link>
                                                                <Link
                                                                    href={id ? `/tournaments/${id}/control/ads` : '#'}
                                                                    className="flex flex-col items-center justify-center gap-0.5 py-1 text-gray-500 hover:text-yellow-400 hover:bg-white/[0.06] transition-all active:scale-95"
                                                                >
                                                                    <Tv className="w-3 h-3" />
                                                                    <span className="text-[5px] font-black uppercase tracking-widest">Publicidad</span>
                                                                </Link>
                                                            </nav>
                                                        )}
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



            {/* Share Modal — renderizado en body para no ser recortado por overflow del contenedor */}
            {
                typeof document !== 'undefined' && createPortal(
                    <AnimatePresence>
                        {isShareModalOpen && (
                            <motion.div
                                key="share-modal"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                                onClick={() => setIsShareModalOpen(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                    className="bg-[#0f0f0f] w-full max-w-sm rounded-[32px] border border-white/10 overflow-hidden shadow-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                        <h3 className="text-xl font-black italic uppercase tracking-tighter">Compartir Torneo</h3>
                                        <button onClick={() => { setIsShareModalOpen(false); setConfirmDelete(false); }} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
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

                                            <button
                                                onClick={generatePDF}
                                                className="col-span-2 flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all group"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-[#ccff00] flex items-center justify-center text-black">
                                                    <Download className="w-5 h-5" />
                                                </div>
                                                <div className="text-left">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white block">Descargar Planilla</span>
                                                    <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Documento PDF (A4)</span>
                                                </div>
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

                                        {/* Zona peligrosa — solo admin/propietario */}
                                        {canManageTournament && (
                                            <div className="pt-2 border-t border-white/5">
                                                <button
                                                    id="btn-delete-tournament"
                                                    onClick={handleDeleteTournament}
                                                    disabled={isDeleting}
                                                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${confirmDelete
                                                        ? 'bg-red-600 hover:bg-red-500 text-white border border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                                                        : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    {isDeleting ? 'Eliminando...' : confirmDelete ? '⚠️ Confirmar — Borrar todo' : 'Eliminar Torneo'}
                                                </button>
                                                {confirmDelete && !isDeleting && (
                                                    <p className="text-[9px] text-center text-red-400/70 mt-2 italic">
                                                        Esta acción es irreversible. Se eliminarán todos los datos del torneo.
                                                    </p>
                                                )}
                                                {confirmDelete && (
                                                    <button
                                                        onClick={() => setConfirmDelete(false)}
                                                        className="w-full mt-1 text-[9px] text-gray-500 hover:text-gray-300 transition-colors py-1 uppercase tracking-widest font-bold"
                                                    >
                                                        Cancelar
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )
            }

            {/* Modal Editar Reglas */}
            <AnimatePresence>
                {isRulesEditOpen && id && (
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
                            className="bg-[#0f0f0f] w-full max-w-2xl rounded-[32px] border border-white/10 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
                        >
                            <div className="p-6 flex flex-col flex-1 min-h-0">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Modificar reglas</h3>
                                    <button
                                        onClick={() => !isSavingRules && setIsRulesEditOpen(false)}
                                        className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
                                        disabled={isSavingRules}
                                    >
                                        <X className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>
                                <div className="flex-1 min-h-0 flex flex-col">
                                    {!canManageTournament && (
                                        <p className="text-xs text-amber-400/90 mb-3 font-bold uppercase tracking-wider">Solo el organizador o un administrador pueden editar las reglas.</p>
                                    )}
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Reglamento adicional (texto libre)</label>
                                    <textarea
                                        value={rulesDraft}
                                        onChange={(e) => setRulesDraft(e.target.value)}
                                        placeholder="Añade aquí normas específicas del torneo, horarios, vestimenta, etc."
                                        className="flex-1 min-h-[200px] w-full rounded-2xl bg-black/30 border border-white/10 p-4 text-sm text-white placeholder:text-gray-500 resize-y font-sans disabled:opacity-70"
                                        disabled={isSavingRules || !canManageTournament}
                                        readOnly={!canManageTournament}
                                    />
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => !isSavingRules && setIsRulesEditOpen(false)}
                                        className={canManageTournament ? 'flex-1 py-3 px-4 rounded-2xl border border-white/10 text-gray-400 hover:bg-white/5 font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50' : 'w-full py-3 px-4 rounded-2xl bg-padel-primary/20 border border-padel-primary/40 text-padel-primary font-bold text-xs uppercase tracking-widest hover:bg-padel-primary/30 transition-all disabled:opacity-50'}
                                        disabled={isSavingRules}
                                    >
                                        {canManageTournament ? 'Cancelar' : 'Cerrar'}
                                    </button>
                                    {canManageTournament && (
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (!id || isSavingRules) return;
                                                setIsSavingRules(true);
                                                try {
                                                    await updateDoc(doc(db, 'tournaments', id), {
                                                        rules: { ...tournament?.rules, content: rulesDraft.trim() },
                                                        updatedAt: new Date()
                                                    });
                                                    setIsRulesEditOpen(false);
                                                } catch (e) {
                                                    setError('No se pudieron guardar las reglas. Comprueba la conexión.');
                                                } finally {
                                                    setIsSavingRules(false);
                                                }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-padel-primary text-black font-black text-xs uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                                            disabled={isSavingRules}
                                        >
                                            <Save className="w-4 h-4" /> {isSavingRules ? 'Guardando...' : 'Guardar'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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

