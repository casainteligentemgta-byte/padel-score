import {
    TournamentType,
    MatchStatus,
    TournamentCategory
} from '../types/tournament';

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
    /** Cuadro con Consolación: formato de partido → 50 min (Set 9) o 60 min (2 sets + STB) */
    consolacionMatchFormat?: 'ONE_SET_9' | 'TWO_SHORT_SETS';
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

        // ── 2. Separar en cubos de fase (orden: Grupos → Principal → Consolación → SEMIFINAL/FINAL RR) ─────
        const KNOCKOUT_PRIORITY: Record<string, number> = {
            SEPTIMA: 1, SEXTA: 2, QUINTA: 3, CUARTA: 4, TERCERA: 5, SEGUNDA: 6, PRIMERA: 7,
            SUMA_7: 8, SUMA_8: 9, SUMA_9: 10, SUMA_10: 11, SUMA_11: 12,
            MAS_45: 13, MAS_50: 14, MIXED: 15, MALE: 16, FEMALE: 17,
        };
        const sortByKnockoutPriority = (matches: any[]): any[] =>
            [...matches].sort((a, b) => (KNOCKOUT_PRIORITY[a.category] ?? 99) - (KNOCKOUT_PRIORITY[b.category] ?? 99));

        const phaseOrder = [
            'Fase de Grupos',
            'Principal R1', 'Principal SF', 'Principal FINAL',
            'Consolación R1', 'Consolación FINAL',
            'SEMIFINAL', 'FINAL',
        ];
        const phases: Array<{ name: string; queue: any[] }> = phaseOrder
            .map(name => ({
                name,
                queue: name === 'Fase de Grupos'
                    ? this.shuffle(allMatches.filter(m => m.roundName === name))
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

    private static generateTimeSlots(day: Date, startStr: string, endStr: string, duration: number, buffer: number): Date[] {
        const slots: Date[] = [];
        const [startH, startM] = startStr.split(':').map(Number);
        const [endH, endM] = endStr.split(':').map(Number);

        const current = new Date(day);
        current.setHours(startH, startM, 0, 0);

        const limit = new Date(day);
        limit.setHours(endH, endM, 0, 0);

        // Si el cierre es menor que la apertura → el club cierra al DÍA SIGUIENTE (cruza medianoche)
        // Ej: abre 07:00, cierra 01:00 → limit es 01:00 del día siguiente
        if (limit.getTime() <= current.getTime()) {
            limit.setDate(limit.getDate() + 1);
        }

        const slotDuration = duration + buffer; // minutos totales por franja
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
        roundName: 'Fase de Grupos' | 'SEMIFINAL' | 'FINAL';
        isKnockout: boolean;
        isFinal: boolean;
    }> {
        const result: Array<{
            team1: any; team2: any;
            roundName: 'Fase de Grupos' | 'SEMIFINAL' | 'FINAL';
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
            !!name && name.trim() !== '' && !name.startsWith('TBD') && !name.startsWith('Jugador ');

        for (const team of teams) {
            if (!hasRealName(team?.p1?.name)) {
                if (!team.p1) team.p1 = { id: `auto_${cat.category}_${playerCounter}` };
                team.p1.name = `Jugador ${playerCounter++}`;
            }
            if (!hasRealName(team?.p2?.name)) {
                if (!team.p2) team.p2 = { id: `auto_${cat.category}_${playerCounter}` };
                team.p2.name = `Jugador ${playerCounter++}`;
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
        if (groups.length > 1) {
            const advanceCount = cat.advanceCount ?? 2;
            const gNames = groups.map((_, i) => String.fromCharCode(65 + i)); // A, B, C…

            // Genera un equipo TBD con etiqueta legible para la UI
            // teamLabel: "1° Grupo A", "2° Grupo B", "Ganador SF1"...
            const tbdTeam = (pos: string, groupLetter: string) => ({
                p1: { id: `tbd_${pos}_${groupLetter}_p1`, name: `${pos} Grupo ${groupLetter}` },
                p2: { id: `tbd_${pos}_${groupLetter}_p2`, name: '' },
                isTBD: true,
                teamLabel: `${pos} Grupo ${groupLetter}`,
            });
            const tbdSFTeam = (sfNum: number) => ({
                p1: { id: `tbd_sf${sfNum}_p1`, name: `Gan. SF${sfNum}` },
                p2: { id: `tbd_sf${sfNum}_p2`, name: '' },
                isTBD: true,
                teamLabel: `Ganador SF${sfNum}`,
            });

            if (advanceCount === 1) {
                // Solo 1 por grupo pasan
                if (groups.length === 2) {
                    // Final directa: 1°A vs 1°B
                    result.push({ team1: tbdTeam('1°', gNames[0]), team2: tbdTeam('1°', gNames[1]), roundName: 'FINAL', isKnockout: true, isFinal: true });
                } else {
                    // Semifinales: 1°A vs 1°B  ·  1°C vs 1°D...
                    for (let g = 0; g < groups.length; g += 2) {
                        const gA = gNames[g];
                        const gB = gNames[g + 1] ?? gNames[g];
                        result.push({ team1: tbdTeam('1°', gA), team2: tbdTeam('1°', gB), roundName: 'SEMIFINAL', isKnockout: true, isFinal: false });
                    }
                    result.push({ team1: tbdSFTeam(1), team2: tbdSFTeam(2), roundName: 'FINAL', isKnockout: true, isFinal: true });
                }
            } else {
                // 2 por grupo pasan (Cruces tradicionales: 1°A vs 2°B, 1°B vs 2°A)
                for (let g = 0; g < groups.length; g += 2) {
                    const gA = gNames[g];
                    const gB = gNames[g + 1] ?? gNames[g];
                    result.push({ team1: tbdTeam('1°', gA), team2: tbdTeam('2°', gB), roundName: 'SEMIFINAL', isKnockout: true, isFinal: false });
                    result.push({ team1: tbdTeam('1°', gB), team2: tbdTeam('2°', gA), roundName: 'SEMIFINAL', isKnockout: true, isFinal: false });
                }
                result.push({ team1: tbdSFTeam(1), team2: tbdSFTeam(2), roundName: 'FINAL', isKnockout: true, isFinal: true });
            }
        }

        return result;
    }

    private static getTeamPlayerIds(t1: any, t2: any): string[] {
        const ids: string[] = [];
        if (t1?.p1?.id) ids.push(t1.p1.id);
        if (t1?.p2?.id) ids.push(t1.p2.id);
        if (t2?.p1?.id) ids.push(t2.p1.id);
        if (t2?.p2?.id) ids.push(t2.p2.id);
        return ids;
    }

    /** Retorna true si todos los jugadores han descansado al menos 1 slot */
    /**
     * Evita que un jugador tenga dos partidos en el mismo slot (o consecutivos sin margen).
     * Así, si un jugador está inscrito en varias categorías, no se le solapan horarios.
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
