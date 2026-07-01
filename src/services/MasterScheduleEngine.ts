import {
    TournamentType,
    MatchStatus,
    TournamentCategory
} from '../types/tournament';
import { ScheduleEngine } from './ScheduleEngine';

export interface CategoryConfig {
    id: string;
    gender: 'MALE' | 'FEMALE' | 'MIXED';
    category: TournamentCategory;
    numTeams: number;
    type: TournamentType;
    teams: any[]; // List of teams with player IDs for conflict detection
    goldenPoint: boolean;           // Si se juega punto de oro
    setFormat: 'TIE_BREAK' | 'SUPER_TIE_BREAK' | 'NO_TIE_BREAK'; // Formato del 6-6
    matchFormat: '2SETS_STB' | '3SETS';  // Formato del partido: 2 sets + Super TB  ó  3 sets al mejor de 3
    groupSize?: 3 | 4;              // Equipos por grupo (Round Robin)
    advanceCount?: 1 | 2;           // Clasificados por grupo (1 o 2)
    quickQualification?: boolean;   // Si true: solo 2 partidos por grupo (clasificación rápida)
    pointsGoal?: number;            // Americano/Dupla fija: a cuántos puntos (ej. 16, 24)
    consolacionMatchFormat?: 'ONE_SET_9' | 'TWO_SHORT_SETS';
    inscriptionPrice?: number;      // Precio de la inscripción por pareja/jugador en esta categoría
    tieBreakRule?: 'GAMES_DIFF' | 'HEAD_TO_HEAD';
}

export interface MasterScheduleConfig {
    tournamentName: string;
    complexName?: string;
    startDate: string;
    endDate: string;
    dailyStartTime: string;
    dailyEndTime: string;
    numCourts: number;
    courtNames: string[];
    matchDurationMinutes: number;
    bufferMinutes: number;
    categories: CategoryConfig[];
    /** URL del logo del patrocinante del evento (opcional) */
    sponsorLogoUrl?: string;
    /** Nombre del patrocinante del evento (opcional) */
    sponsorName?: string;
}


export class MasterScheduleEngine {

    /**
     * Genera el calendario de partidos del torneo.
     * Regla de orden: primero se juegan todos los partidos de FASE DE GRUPOS;
     * solo después se programan y juegan SEMIFINALES y FINAL.
     */
    static generateMasterSchedule(config: MasterScheduleConfig) {
        const {
            startDate,
            dailyStartTime,
            dailyEndTime,
            numCourts,
            matchDurationMinutes,
            bufferMinutes,
            categories
        } = config;

        if (!categories || categories.length === 0) {
            console.warn('[Engine] No hay categorías configuradas');
            return { matches: [], notScheduled: 0, totalMatches: 0 };
        }

        // ── 1. Generar TODOS los enfrentamientos ──────────────────────────
        // generatePairings ya devuelve { team1, team2, roundName, isKnockout, isFinal }
        // No se necesita recalcular el roundName aqui — viene embebido.
        const allMatches: any[] = [];

        categories.forEach(cat => {
            if (!cat.teams || cat.teams.length < 2) {
                console.warn(`[Engine] Categoría ${cat.category} tiene menos de 2 equipos, ignorada.`);
                return;
            }

            if (cat.type === TournamentType.AMERICANO_INDIVIDUAL) {
                const schedule = ScheduleEngine.generateAmericanoIndividualSchedule({
                    tournamentId: 'master',
                    numTeams: cat.teams.length,
                    numCourts,
                    clubHoursStart: dailyStartTime,
                    clubHoursEnd: dailyEndTime,
                    startDate: new Date(startDate + 'T00:00:00'),
                    matchDurationMinutes,
                    bufferMinutes,
                    type: TournamentType.AMERICANO_INDIVIDUAL,
                    teams: cat.teams,
                    pointsGoal: cat.pointsGoal ?? 24,
                });

                schedule.matches.forEach((match: any) => {
                    allMatches.push({
                        categoryId: cat.id,
                        category: cat.category,
                        categoryName: `${cat.gender} - ${cat.category}`,
                        team1Name: `${match.playerA1Name} / ${match.playerA2Name}`,
                        team2Name: `${match.playerB1Name} / ${match.playerB2Name}`,
                        ...match,
                    });
                });
                return;
            }

            const pairings = cat.type === TournamentType.CUADRO_CONSOLACION
                ? this.generateConsolacionPairings(cat)
                : this.generatePairings(cat);
            const groupCount = pairings.filter((p: any) => p.roundName === 'Fase de Grupos').length;
            const semiCount = pairings.filter((p: any) => p.roundName === 'SEMIFINAL' || p.roundName === 'Principal SF').length;
            const finalCount = pairings.filter((p: any) => p.roundName === 'FINAL' || p.roundName === 'Principal FINAL').length;
            console.log(`[Engine] Cat ${cat.gender}-${cat.category}: ${cat.teams.length} equipos → ${groupCount} grupos + ${semiCount} semis + ${finalCount} finales`);

            pairings.forEach((pair: any) => {
                // Resolver el nombre del equipo para la UI:
                // - Equipo real: "Jugador 1 / Jugador 2"
                // - Equipo TBD (knockout): usar teamLabel ("1° Grupo A", "Ganador SF1"…)
                const resolveTeamName = (t: any): string => {
                    if (t?.teamLabel) return t.teamLabel;
                    const p1 = t?.p1?.name || '';
                    const p2 = t?.p2?.name || '';
                    if (p1 && p2) return `${p1} / ${p2}`;
                    if (p1) return p1;
                    return '?';
                };

                allMatches.push({
                    categoryId: cat.id,
                    category: cat.category,
                    categoryName: `${cat.gender} - ${cat.category}`,
                    team1: pair.team1,
                    team2: pair.team2,
                    team1Name: resolveTeamName(pair.team1),
                    team2Name: resolveTeamName(pair.team2),
                    team1Index: pair.team1Index,
                    team2Index: pair.team2Index,
                    roundName: pair.roundName,
                    playerIds: pair.isKnockout ? [] : this.getTeamPlayerIds(pair.team1, pair.team2),
                    isFinal: pair.isFinal,
                    isKnockout: pair.isKnockout,
                    ...(pair.advancementLogic && { advancementLogic: pair.advancementLogic }),
                });
            });
        });

        // Log detallado de distribución por fase
        const byPhase: Record<string, number> = {};
        allMatches.forEach(m => { byPhase[m.roundName] = (byPhase[m.roundName] || 0) + 1; });
        console.log(`[Engine] Total: ${allMatches.length} partidos →`, byPhase);

        if (allMatches.length === 0) {
            return { matches: [], notScheduled: 0, totalMatches: 0 };
        }

        // ── 2. REGLA OFICIAL: Primero fase de grupos, después semifinales y final ─────────────────────
        // Los partidos se agendan en este orden estricto: ningún partido de semifinal/final se programa
        // hasta que todos los de "Fase de Grupos" estén agendados.
        const KNOCKOUT_PRIORITY: Record<string, number> = {
            SEPTIMA: 1, SEXTA: 2, QUINTA: 3, CUARTA: 4, TERCERA: 5, SEGUNDA: 6, PRIMERA: 7,
            SUMA_7: 8, SUMA_8: 9, SUMA_9: 10, SUMA_10: 11, SUMA_11: 12,
            OPEN: 12.35,
            MAS_40: 12.5, FEM_40: 12.6, MIX_40: 12.7, MAS_45: 13, MAS_50: 14, MIXED: 15, MALE: 16, FEMALE: 17,
        };
        const sortByKnockoutPriority = (matches: any[]): any[] =>
            [...matches].sort((a, b) => (KNOCKOUT_PRIORITY[a.category] ?? 99) - (KNOCKOUT_PRIORITY[b.category] ?? 99));

        // Orden cronológico estricto: Fase de Grupos → Cuartos → Semifinales → Finales.
        // Prohibido programar una Final en el mismo bloque o antes que las Semifinales de la misma categoría.
        const phaseOrder = [
            'Fase de Grupos',
            'Principal R1', 'Principal SF', 'Principal FINAL',
            'Consolación R1', 'Consolación FINAL',
            'CUARTOS',      // antes que SEMIFINAL
            'SEMIFINAL',    // antes que FINAL
            'FINAL',
        ];
        const phases: Array<{ name: string; queue: any[] }> = phaseOrder
            .map(name => ({
                name,
                queue: name === 'Fase de Grupos'
                    ? allMatches.filter(m => m.roundName === name)
                    : sortByKnockoutPriority(allMatches.filter(m => m.roundName === name)),
            }))
            .filter(p => p.queue.length > 0);

        console.log(`[Engine] Fases → ${phases.map(p => `${p.name}: ${p.queue.length}`).join(' | ')}`);

        // ── 3. Agendar fase a fase de forma completamente separada ───────────
        // Cada fase consume slots del calendario de forma independiente.
        // Un slot de semifinal NUNCA aparece antes de que el último partido
        // del grupo se haya agendado.
        const scheduledMatches: any[] = [];
        const playerLastSlot: { [playerId: string]: number } = {};

        let globalSlotIdx = 0;
        let dayOffset = 0;
        let slotIdxInDay = 0; // Puntero al slot actual dentro del día siendo procesado
        const maxDays = 30;

        for (const phase of phases) {
            const pending = [...phase.queue];

            while (pending.length > 0 && dayOffset < maxDays) {
                const dayDate = new Date(startDate + 'T00:00:00');
                dayDate.setDate(dayDate.getDate() + dayOffset);
                const daySlots = this.generateTimeSlots(dayDate, dailyStartTime, dailyEndTime, matchDurationMinutes, bufferMinutes);

                if (daySlots.length === 0) {
                    dayOffset++;
                    slotIdxInDay = 0;
                    continue;
                }

                // Empezamos a llenar desde el slotIdxInDay para permitir continuidad de fases en el mismo día
                let phaseFinishedInThisWhileIteration = false;
                for (let sIdx = slotIdxInDay; sIdx < daySlots.length; sIdx++) {
                    const slotStart = daySlots[sIdx];
                    if (pending.length === 0) {
                        // Fase completada: movemos el puntero al SIGUIENTE slot para la siguiente fase
                        slotIdxInDay = sIdx + 1;
                        if (slotIdxInDay >= daySlots.length) {
                            dayOffset++;
                            slotIdxInDay = 0;
                        }
                        phaseFinishedInThisWhileIteration = true;
                        break;
                    }

                    for (let c = 0; c < numCourts; c++) {
                        if (pending.length === 0) break;

                        // Buscar partido elegible
                        let foundIdx = -1;
                        for (let i = 0; i < pending.length; i++) {
                            if (this.canPlay(pending[i].playerIds, globalSlotIdx, playerLastSlot)) {
                                foundIdx = i;
                                break;
                            }
                        }
                        if (foundIdx === -1) foundIdx = 0;

                        const m = pending.splice(foundIdx, 1)[0];
                        const courtName = (config.courtNames[c] && config.courtNames[c].trim())
                            ? config.courtNames[c]
                            : `Pista ${c + 1}`;

                        scheduledMatches.push({
                            ...m,
                            scheduledTime: slotStart.toISOString(),
                            courtIndex: c,
                            courtName,
                            status: MatchStatus.PENDING,
                        });

                        m.playerIds.forEach((pid: string) => {
                            playerLastSlot[pid] = globalSlotIdx;
                        });
                    }
                    globalSlotIdx++;
                }

                if (phaseFinishedInThisWhileIteration) {
                    break; // Salimos del while (pending.length > 0) para ir a la siguiente fase
                }

                // Si al terminar los slots del día aún hay partidos, pasamos al siguiente día
                if (pending.length > 0) {
                    dayOffset++;
                    slotIdxInDay = 0;
                }
            }

            if (pending.length > 0) {
                console.warn(`[Engine] ${pending.length} partidos de "${phase.name}" no se pudieron agendar.`);
            }
            console.log(`[Engine] ✅ Fase "${phase.name}" procesada. Próximo slot: Día ${dayOffset}, Slot ${slotIdxInDay}`);
        }

        console.log(`[Engine] ✅ ${scheduledMatches.length} partidos agendados en ${dayOffset} día(s)`);

        return {
            matches: scheduledMatches,
            notScheduled: 0,
            totalMatches: scheduledMatches.length,
            daysUsed: dayOffset,
        };
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    /** Bloque horario mínimo por partido (minutos). Evita retrasos en cadena. */
    static readonly SLOT_MINUTES = 90;

    private static generateTimeSlots(day: Date, startStr: string, endStr: string, duration: number, buffer: number): Date[] {
        const slots: Date[] = [];
        const [startH, startM] = startStr.split(':').map(Number);
        const [endH, endM] = endStr.split(':').map(Number);

        const current = new Date(day);
        current.setHours(startH, startM, 0, 0);

        const limit = new Date(day);
        limit.setHours(endH, endM, 0, 0);

        if (limit.getTime() <= current.getTime()) {
            limit.setDate(limit.getDate() + 1);
        }

        const slotDuration = Math.max(MasterScheduleEngine.SLOT_MINUTES, duration + buffer);
        while (current.getTime() + duration * 60000 <= limit.getTime()) {
            slots.push(new Date(current));
            current.setMinutes(current.getMinutes() + slotDuration);
        }

        console.log(`[Engine] Franjas generadas para ${day.toDateString()} (${startStr}→${endStr}): ${slots.length} franjas × ${slotDuration}min c/u`);
        return slots;
    }

    /**
     * Cuadro con Consolación: cuadro principal + llave de consolación.
     * Quien pierde en R1 del principal pasa a consolación → mínimo 2 partidos por pareja.
     * roundName: Principal R1 | Principal SF | Principal FINAL | Consolación R1 | Consolación FINAL
     */
    private static generateConsolacionPairings(cat: CategoryConfig): Array<{
        team1: any; team2: any;
        roundName: string;
        isKnockout: boolean;
        isFinal: boolean;
        advancementLogic?: string;
    }> {
        const result: Array<{ team1: any; team2: any; roundName: string; isKnockout: boolean; isFinal: boolean; advancementLogic?: string; team1Index?: number; team2Index?: number }> = [];
        const teams = [...cat.teams];
        const teamToIndex = new Map(cat.teams.map((t, idx) => [t.id, idx + 1]));
        const n = teams.length;
        if (n < 2) return result;

        const tbd = (label: string, id: string) => ({
            p1: { id: `tbd_${id}`, name: label },
            p2: { id: `tbd_${id}_p2`, name: '' },
            isTBD: true,
            teamLabel: label,
        });

        if (n <= 4) {
            // Bracket de 4: P1, P2 (R1), Principal SF, Principal FINAL; Consolación: 1 partido (2 perdedores R1)
            const [t0, t1, t2, t3] = teams;
            result.push({ team1: t0, team2: t3, roundName: 'Principal R1', isKnockout: false, isFinal: false, advancementLogic: 'Ganador → Principal SF; Perdedor → Consolación R1', team1Index: teamToIndex.get(t0.id), team2Index: teamToIndex.get(t3.id) } as any);
            result.push({ team1: t1, team2: t2, roundName: 'Principal R1', isKnockout: false, isFinal: false, advancementLogic: 'Ganador → Principal SF; Perdedor → Consolación R1', team1Index: teamToIndex.get(t1.id), team2Index: teamToIndex.get(t2.id) } as any);
            result.push({ team1: tbd('Gan. P1', 'p1'), team2: tbd('Gan. P2', 'p2'), roundName: 'Principal SF', isKnockout: true, isFinal: false, advancementLogic: 'Ganador → Principal FINAL' } as any);
            result.push({ team1: tbd('Gan. SF', 'sf'), team2: tbd('Finalista', 'sf2'), roundName: 'Principal FINAL', isKnockout: true, isFinal: true } as any);
            result.push({ team1: tbd('Perd. P1', 'c1'), team2: tbd('Perd. P2', 'c2'), roundName: 'Consolación R1', isKnockout: true, isFinal: false, advancementLogic: 'Ganador → Consolación FINAL' } as any);
            result.push({ team1: tbd('Gan. C1', 'c1w'), team2: tbd('Gan. C2', 'c2w'), roundName: 'Consolación FINAL', isKnockout: true, isFinal: true } as any);
        } else {
            // Bracket de 8: 4 R1, 2 SF, 1 FINAL principal; 2 Consolación R1, 1 Consolación FINAL
            const [t0, t1, t2, t3, t4, t5, t6, t7] = teams.slice(0, 8);
            result.push({ team1: t0, team2: t7, roundName: 'Principal R1', isKnockout: false, isFinal: false, advancementLogic: 'Ganador → Principal SF; Perdedor → Consolación R1', team1Index: teamToIndex.get(t0.id), team2Index: teamToIndex.get(t7.id) } as any);
            result.push({ team1: t1, team2: t6, roundName: 'Principal R1', isKnockout: false, isFinal: false, advancementLogic: 'Ganador → Principal SF; Perdedor → Consolación R1', team1Index: teamToIndex.get(t1.id), team2Index: teamToIndex.get(t6.id) } as any);
            result.push({ team1: t2, team2: t5, roundName: 'Principal R1', isKnockout: false, isFinal: false, advancementLogic: 'Ganador → Principal SF; Perdedor → Consolación R1', team1Index: teamToIndex.get(t2.id), team2Index: teamToIndex.get(t5.id) } as any);
            result.push({ team1: t3, team2: t4, roundName: 'Principal R1', isKnockout: false, isFinal: false, advancementLogic: 'Ganador → Principal SF; Perdedor → Consolación R1', team1Index: teamToIndex.get(t3.id), team2Index: teamToIndex.get(t4.id) } as any);
            result.push({ team1: tbd('Gan. P1', 'p1'), team2: tbd('Gan. P4', 'p4'), roundName: 'Principal SF', isKnockout: true, isFinal: false, advancementLogic: 'Ganador → Principal FINAL' } as any);
            result.push({ team1: tbd('Gan. P2', 'p2'), team2: tbd('Gan. P3', 'p3'), roundName: 'Principal SF', isKnockout: true, isFinal: false, advancementLogic: 'Ganador → Principal FINAL' } as any);
            result.push({ team1: tbd('Gan. SF1', 'sf1'), team2: tbd('Gan. SF2', 'sf2'), roundName: 'Principal FINAL', isKnockout: true, isFinal: true } as any);
            result.push({ team1: tbd('Perd. P1', 'c1'), team2: tbd('Perd. P2', 'c2'), roundName: 'Consolación R1', isKnockout: true, isFinal: false, advancementLogic: 'Ganador → Consolación FINAL' } as any);
            result.push({ team1: tbd('Perd. P3', 'c3'), team2: tbd('Perd. P4', 'c4'), roundName: 'Consolación R1', isKnockout: true, isFinal: false, advancementLogic: 'Ganador → Consolación FINAL' } as any);
            result.push({ team1: tbd('Gan. C1', 'c1w'), team2: tbd('Gan. C2', 'c2w'), roundName: 'Consolación FINAL', isKnockout: true, isFinal: true } as any);
        }
        return result;
    }

    /** Genera los emparejamientos respetando la estructura de grupos.
     *  Devuelve objetos { team1, team2, roundName, isKnockout, isFinal }
     *  con roundName incrustado. Solo genera semifinales/finales cuando
     *  hay MÁS de 1 grupo real (groups.length > 1).
     */
    private static generatePairings(cat: CategoryConfig): Array<{
        team1: any; team2: any;
        roundName: 'Fase de Grupos' | 'SEMIFINAL' | 'FINAL' | 'CUARTOS' | 'OCTAVOS' | 'DIECISEISAVOS';
        isKnockout: boolean;
        isFinal: boolean;
        team1Index?: number;
        team2Index?: number;
    }> {
        const result: Array<{
            team1: any; team2: any;
            roundName: 'Fase de Grupos' | 'SEMIFINAL' | 'FINAL' | 'CUARTOS' | 'OCTAVOS' | 'DIECISEISAVOS';
            isKnockout: boolean; isFinal: boolean;
            team1Index?: number; team2Index?: number;
        }> = [];

        const teams = [...cat.teams];

        // ── Jugadores correlativos ────────────────────────────────────────────
        // Si los equipos no tienen nombre real de jugador, se generan nombres
        // "Jugador N" con numeración única dentro de esta categoría.
        // REGLA: el contador arranca en 1 y nunca se repite dentro de la misma cat.
        let playerCounter = 1;
        const hasRealName = (name?: string) =>
            !!name && name.trim() !== '' && !name.startsWith('TBD') && !name.startsWith('Jugador');

        for (const team of teams) {
            if (!team.p1) {
                team.p1 = { id: `auto_${cat.category}_${playerCounter}`, name: `Jugador ${playerCounter}` };
                playerCounter++;
            } else if (!hasRealName(team.p1.name)) {
                team.p1.name = `Jugador ${playerCounter}`;
                playerCounter++;
            }

            if (!team.p2) {
                team.p2 = { id: `auto_${cat.category}_${playerCounter}`, name: `Jugador ${playerCounter}` };
                playerCounter++;
            } else if (!hasRealName(team.p2.name)) {
                team.p2.name = `Jugador ${playerCounter}`;
                playerCounter++;
            }
        }

        // groupSize válido: debe ser 3 o 4 Y menor que el total de equipos
        // Si no cumple → un solo grupo (sin eliminatorias)
        const gs: number = (cat.groupSize === 3 || cat.groupSize === 4) && cat.groupSize < teams.length
            ? cat.groupSize
            : teams.length;

        // ── Dividir equipos en grupos ────────────────────────────────────
        const groups: any[][] = [];
        for (let i = 0; i < teams.length; i += gs) {
            groups.push(teams.slice(i, i + gs));
        }

        const twoGamesGuaranteed = !!(cat.quickQualification && (cat.advanceCount ?? 2) === 2);
        // 2 grupos de 4 → 7 partidos totales (4 en grupos + 2 semis + 1 final)
        const twoGroupsOfFour = groups.length === 2 && groups.every(g => g.length === 4);
        const useSevenGames = twoGamesGuaranteed && twoGroupsOfFour;
        console.log(`[Pairings] ${cat.category} | groupSize=${cat.groupSize} → gs=${gs} | equipos=${teams.length} | grupos=${groups.length} | knockout=${groups.length > 1} | 2juegosGarantizados=${twoGamesGuaranteed} | 7juegos=${useSevenGames}`);
        // ── Fase de grupos: round-robin completo O 2 juegos garantizados (o 7 partidos si 2 grupos de 4) ─────────────
        const teamToIndex = new Map(cat.teams.map((t, idx) => [t.id, idx + 1]));

        for (const group of groups) {
            if (twoGamesGuaranteed) {
                if (useSevenGames) {
                    // 2 grupos de 4, 1º y 2º pasan: solo 4 partidos de fase de grupos (2 por grupo) → 7 total con semis+final
                    result.push({ team1: group[0], team2: group[1], roundName: 'Fase de Grupos', isKnockout: false, isFinal: false, team1Index: teamToIndex.get(group[0].id), team2Index: teamToIndex.get(group[1].id) } as any);
                    result.push({ team1: group[2], team2: group[3], roundName: 'Fase de Grupos', isKnockout: false, isFinal: false, team1Index: teamToIndex.get(group[2].id), team2Index: teamToIndex.get(group[3].id) } as any);
                } else if (group.length === 4) {
                    // 2 juegos garantizados: cada equipo juega exactamente 2 partidos en la fase de grupos
                    result.push({ team1: group[0], team2: group[1], roundName: 'Fase de Grupos', isKnockout: false, isFinal: false, team1Index: teamToIndex.get(group[0].id), team2Index: teamToIndex.get(group[1].id) } as any);
                    result.push({ team1: group[0], team2: group[2], roundName: 'Fase de Grupos', isKnockout: false, isFinal: false, team1Index: teamToIndex.get(group[0].id), team2Index: teamToIndex.get(group[2].id) } as any);
                    result.push({ team1: group[1], team2: group[3], roundName: 'Fase de Grupos', isKnockout: false, isFinal: false, team1Index: teamToIndex.get(group[1].id), team2Index: teamToIndex.get(group[3].id) } as any);
                    result.push({ team1: group[2], team2: group[3], roundName: 'Fase de Grupos', isKnockout: false, isFinal: false, team1Index: teamToIndex.get(group[2].id), team2Index: teamToIndex.get(group[3].id) } as any);
                } else if (group.length >= 3) {
                    result.push({ team1: group[0], team2: group[1], roundName: 'Fase de Grupos', isKnockout: false, isFinal: false, team1Index: teamToIndex.get(group[0].id), team2Index: teamToIndex.get(group[1].id) } as any);
                    result.push({ team1: group[0], team2: group[2], roundName: 'Fase de Grupos', isKnockout: false, isFinal: false, team1Index: teamToIndex.get(group[0].id), team2Index: teamToIndex.get(group[2].id) } as any);
                    result.push({ team1: group[1], team2: group[2], roundName: 'Fase de Grupos', isKnockout: false, isFinal: false, team1Index: teamToIndex.get(group[1].id), team2Index: teamToIndex.get(group[2].id) } as any);
                } else {
                    result.push({ team1: group[0], team2: group[1], roundName: 'Fase de Grupos', isKnockout: false, isFinal: false, team1Index: teamToIndex.get(group[0].id), team2Index: teamToIndex.get(group[1].id) } as any);
                }
            } else {
                for (let i = 0; i < group.length; i++) {
                    for (let j = i + 1; j < group.length; j++) {
                        result.push({
                            team1: group[i],
                            team2: group[j],
                            team1Index: teamToIndex.get(group[i].id),
                            team2Index: teamToIndex.get(group[j].id),
                            roundName: 'Fase de Grupos',
                            isKnockout: false,
                            isFinal: false,
                        });
                    }
                }
            }
        }

        // ── Fase eliminatoria (solo si hay más de 1 grupo) ───────────────
        // ── Fase eliminatoria (solo si hay más de 1 grupo) ───────────────
        if (groups.length > 1) {
            const advanceCount = cat.advanceCount ?? 2;
            const knockoutTeams: any[] = [];
            const gNames = groups.map((_, i) => String.fromCharCode(65 + i));

            // 1. Recolectar clasificados reales según disponibilidad en el grupo
            for (let i = 0; i < groups.length; i++) {
                const teamsInGroup = groups[i].length;
                // Solo clasificar hasta el máximo disponible en el grupo o el advanceCount
                const actualAdvance = Math.min(teamsInGroup, advanceCount);

                for (let rank = 1; rank <= actualAdvance; rank++) {
                    knockoutTeams.push({
                        p1: { id: `tbd_${rank}_${gNames[i]}_p1`, name: `${rank}° Grupo ${gNames[i]}` },
                        p2: { id: `tbd_${rank}_${gNames[i]}_p2`, name: `(TBD)` },
                        isTBD: true,
                        teamLabel: `${rank}° Grupo ${gNames[i]}`,
                    });
                }
            }

            // 2. Generar llaves según la cantidad de clasificados
            const nK = knockoutTeams.length;

            if (nK === 2) {
                // Final directa (Ej: 2 grupos y clasifican solo los primeros)
                result.push({ team1: knockoutTeams[0], team2: knockoutTeams[1], roundName: 'FINAL', isKnockout: true, isFinal: true });
            } else if (nK <= 4) {
                // Semifinales y Final
                // Cruce tradicional si son 2 grupos de 2 clasificados: 1A vs 2B, 1B vs 2A
                if (groups.length === 2 && advanceCount === 2 && knockoutTeams.length === 4) {
                    result.push({ team1: knockoutTeams[0], team2: knockoutTeams[3], roundName: 'SEMIFINAL', isKnockout: true, isFinal: false }); // 1A vs 2B
                    result.push({ team1: knockoutTeams[2], team2: knockoutTeams[1], roundName: 'SEMIFINAL', isKnockout: true, isFinal: false }); // 1B vs 2A
                } else {
                    // Si no están los 4 (ej: 3 equipos), emparejar los que hay
                    for (let i = 0; i < nK; i += 2) {
                        if (knockoutTeams[i + 1]) {
                            result.push({ team1: knockoutTeams[i], team2: knockoutTeams[i + 1], roundName: 'SEMIFINAL', isKnockout: true, isFinal: false });
                        } else {
                            // Si sobra 1, darle BYE (pasa directo a la final o se agenda solo)
                            // Por ahora, solo lo logueamos o lo agendamos contra un TBD
                            console.log('[Pairings] Team with BYE:', knockoutTeams[i].teamLabel);
                        }
                    }
                }
                result.push({
                    team1: {
                        p1: { id: 'tbd_sf1_p1', name: 'Gan. SF1' },
                        p2: { id: 'tbd_sf1_p2', name: '(TBD)' },
                        isTBD: true,
                        teamLabel: 'Ganador SF1'
                    },
                    team2: {
                        p1: { id: 'tbd_sf2_p1', name: 'Gan. SF2' },
                        p2: { id: 'tbd_sf2_p2', name: '(TBD)' },
                        isTBD: true,
                        teamLabel: 'Ganador SF2'
                    },
                    roundName: 'FINAL', isKnockout: true, isFinal: true
                });
            } else if (nK <= 8) {
                // Cuartos con cruces cruzados: nunca enfrentar parejas del mismo grupo (1ºA vs 2ºA).
                // knockoutTeams orden: [1°A, 2°A, 1°B, 2°B, 1°C, 2°C, 1°D, 2°D] para 4 grupos.
                // Cruces: 1°A vs 2°B, 1°B vs 2°A, 1°C vs 2°D, 1°D vs 2°C (índices 0-3, 2-1, 4-7, 6-5).
                const quarterPairings = this.buildQuarterFinalCrossovers(knockoutTeams, groups.length, advanceCount);
                quarterPairings.forEach(([i, j]) => {
                    if (knockoutTeams[i] && knockoutTeams[j]) {
                        result.push({ team1: knockoutTeams[i], team2: knockoutTeams[j], roundName: 'CUARTOS', isKnockout: true, isFinal: false });
                    }
                });
                // SFs genéricas
                result.push({
                    team1: { p1: { id: 'tbd_c1', name: 'Gan. C1' }, p2: { id: 'tbd_c1_p2', name: '(TBD)' }, isTBD: true, teamLabel: 'Ganador C1' },
                    team2: { p1: { id: 'tbd_c2', name: 'Gan. C2' }, p2: { id: 'tbd_c2_p2', name: '(TBD)' }, isTBD: true, teamLabel: 'Ganador C2' },
                    roundName: 'SEMIFINAL', isKnockout: true, isFinal: false
                });
                result.push({
                    team1: { p1: { id: 'tbd_c3', name: 'Gan. C3' }, p2: { id: 'tbd_c3_p2', name: '(TBD)' }, isTBD: true, teamLabel: 'Ganador C3' },
                    team2: { p1: { id: 'tbd_c4', name: 'Gan. C4' }, p2: { id: 'tbd_c4_p2', name: '(TBD)' }, isTBD: true, teamLabel: 'Ganador C4' },
                    roundName: 'SEMIFINAL', isKnockout: true, isFinal: false
                });
                // Final
                result.push({
                    team1: {
                        p1: { id: 'tbd_sf1_p1', name: 'Gan. SF1' },
                        p2: { id: 'tbd_sf1_p2', name: '(TBD)' },
                        isTBD: true,
                        teamLabel: 'Ganador SF1'
                    },
                    team2: {
                        p1: { id: 'tbd_sf2_p1', name: 'Gan. SF2' },
                        p2: { id: 'tbd_sf2_p2', name: '(TBD)' },
                        isTBD: true,
                        teamLabel: 'Ganador SF2'
                    },
                    roundName: 'FINAL', isKnockout: true, isFinal: true
                });
            }
        }

        return result;
    }

    /**
     * Cruces para Cuartos de Final: nunca enfrentar equipos del mismo grupo.
     * 4 grupos (8 clasificados): 1°A vs 2°B, 1°B vs 2°A, 1°C vs 2°D, 1°D vs 2°C.
     * 3 grupos (6 clasificados): 1°A vs 2°B, 1°B vs 2°C, 1°C vs 2°A.
     */
    private static buildQuarterFinalCrossovers(knockoutTeams: any[], numGroups: number, advanceCount: number): [number, number][] {
        const pairs: [number, number][] = [];
        const nK = knockoutTeams.length;
        if (nK <= 4) return pairs;

        // Índices por grupo: grupo g tiene clasificados en [g*advanceCount, (g+1)*advanceCount)
        if (numGroups === 4 && nK === 8 && advanceCount === 2) {
            // 1°A=0, 2°A=1, 1°B=2, 2°B=3, 1°C=4, 2°C=5, 1°D=6, 2°D=7
            pairs.push([0, 3], [2, 1], [4, 7], [6, 5]);
        } else if (numGroups === 3 && nK === 6 && advanceCount === 2) {
            // 1°A=0, 2°A=1, 1°B=2, 2°B=3, 1°C=4, 2°C=5 → 1A vs 2B, 1B vs 2C, 1C vs 2A
            pairs.push([0, 3], [2, 5], [4, 1]);
        } else {
            // Genérico: emparejar 1° del grupo i con 2° del grupo (i+1) % numGroups, etc.
            for (let g = 0; g < numGroups; g++) {
                const next = (g + 1) % numGroups;
                const i1 = g * advanceCount;           // 1° del grupo g
                const j2 = next * advanceCount + 1;   // 2° del grupo next (si advanceCount >= 2)
                if (advanceCount >= 2 && i1 < nK && j2 < nK) {
                    pairs.push([i1, j2]);
                }
            }
            // Segundos partidos: 1° del grupo next vs 2° del grupo g
            for (let g = 0; g < numGroups; g++) {
                const next = (g + 1) % numGroups;
                const i1Next = next * advanceCount;   // 1° del grupo next
                const j2G = g * advanceCount + 1;    // 2° del grupo g
                if (advanceCount >= 2 && i1Next < nK && j2G < nK && !pairs.some(([a, b]) => (a === i1Next && b === j2G) || (a === j2G && b === i1Next))) {
                    pairs.push([i1Next, j2G]);
                }
            }
        }
        return pairs;
    }

    private static getTeamPlayerIds(t1: any, t2: any): string[] {
        const ids: string[] = [];
        if (t1?.p1?.id) ids.push(t1.p1.id);
        if (t1?.p2?.id) ids.push(t1.p2.id);
        if (t2?.p1?.id) ids.push(t2.p1.id);
        if (t2?.p2?.id) ids.push(t2.p2.id);
        return ids;
    }

    /**
     * Descanso mínimo: un bloque horario entre partidos (60–90 min según SLOT_MINUTES).
     * canPlay retorna false si algún jugador jugó en el slot actual o en el inmediatamente anterior.
     */
    private static canPlay(playerIds: string[], currentSlotIdx: number, playerLastSlot: { [pid: string]: number }): boolean {
        for (const pid of playerIds) {
            if (playerLastSlot[pid] === undefined) continue;
            if (currentSlotIdx - playerLastSlot[pid] <= 1) return false;
        }
        return true;
    }

    private static shuffle<T>(array: T[]): T[] {
        let currentIndex = array.length;
        while (currentIndex !== 0) {
            const randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }
}
