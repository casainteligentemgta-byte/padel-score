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
    pointsGoal?: number;            // Americano/Dupla fija: a cuántos puntos (ej. 16, 24)
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

            const pairings = this.generatePairings(cat);
            const groupCount = pairings.filter(p => p.roundName === 'Fase de Grupos').length;
            const semiCount = pairings.filter(p => p.roundName === 'SEMIFINAL').length;
            const finalCount = pairings.filter(p => p.roundName === 'FINAL').length;
            console.log(`[Engine] Cat ${cat.gender}-${cat.category}: ${cat.teams.length} equipos → ${groupCount} grupos + ${semiCount} semis + ${finalCount} finales`);

            pairings.forEach(pair => {
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
                    category: cat.category,        // ← valor del enum (SEPTIMA, SEXTA…)
                    categoryName: `${cat.gender} - ${cat.category}`,
                    team1: pair.team1,
                    team2: pair.team2,
                    team1Name: resolveTeamName(pair.team1),
                    team2Name: resolveTeamName(pair.team2),
                    roundName: pair.roundName,
                    playerIds: pair.isKnockout ? [] : this.getTeamPlayerIds(pair.team1, pair.team2),
                    isFinal: pair.isFinal,
                    isKnockout: pair.isKnockout,
                });
            });
        });

        // Log detallado de distribución por fase — útil para diagnosticar orden incorrecto
        const byPhase = { group: 0, semi: 0, final: 0 };
        allMatches.forEach(m => {
            if (m.roundName === 'Fase de Grupos') byPhase.group++;
            else if (m.roundName === 'SEMIFINAL') byPhase.semi++;
            else if (m.roundName === 'FINAL') byPhase.final++;
        });
        console.log(`[Engine] Total: ${allMatches.length} partidos → Grupos: ${byPhase.group} | Semis: ${byPhase.semi} | Finales: ${byPhase.final}`);

        if (allMatches.length === 0) {
            return { matches: [], notScheduled: 0, totalMatches: 0 };
        }

        // ── 2. Separar en 3 cubos de fase estricta ───────────────────────────
        // REGLA DE NEGOCIO: primero se terminan TODOS los partidos de grupo de
        // TODAS las categorías (aleatorios), luego TODAS las semis ordenadas por
        // prioridad (Séptima primero, luego Sexta…), luego las finales igual.
        //
        // Prioridad eliminatorias: categorías numéricamente altas van primero.
        // Un partido de Séptima se agenda ANTES que uno de Sexta, etc.
        const KNOCKOUT_PRIORITY: Record<string, number> = {
            // Categorías numéricas — mayor número = mayor prioridad (primero en cancha)
            SEPTIMA: 1,
            SEXTA: 2,
            QUINTA: 3,
            CUARTA: 4,
            TERCERA: 5,
            SEGUNDA: 6,
            PRIMERA: 7,
            // Sumas — después de las categorías por nivel
            SUMA_7: 8,
            SUMA_8: 9,
            SUMA_9: 10,
            SUMA_10: 11,
            SUMA_11: 12,
            // Veteranos
            MAS_45: 13,
            MAS_50: 14,
            // Genéricos al final
            MIXED: 15,
            MALE: 16,
            FEMALE: 17,
        };

        /** Ordena los partidos de eliminación por categoría usando el valor del enum.
         *  `a.category` = 'SEPTIMA' | 'SEXTA'… — coincide con las claves de KNOCKOUT_PRIORITY. */
        const sortByKnockoutPriority = (matches: any[]): any[] =>
            [...matches].sort((a, b) => {
                const pa = KNOCKOUT_PRIORITY[a.category] ?? 99;
                const pb = KNOCKOUT_PRIORITY[b.category] ?? 99;
                return pa - pb;
            });

        const phases: Array<{ name: string; queue: any[] }> = [
            // Grupos: totalmente aleatorios (mezcla categorías en las canchas)
            { name: 'Fase de Grupos', queue: this.shuffle(allMatches.filter(m => m.roundName === 'Fase de Grupos')) },
            // Semis: Séptima primero, luego Sexta, etc.
            { name: 'SEMIFINAL', queue: sortByKnockoutPriority(allMatches.filter(m => m.roundName === 'SEMIFINAL')) },
            // Finales: mismo orden de prioridad
            { name: 'FINAL', queue: sortByKnockoutPriority(allMatches.filter(m => m.roundName === 'FINAL')) },
        ].filter(p => p.queue.length > 0);

        console.log(`[Engine] Fases → ${phases.map(p => `${p.name}: ${p.queue.length}`).join(' | ')}`);

        // ── 3. Agendar fase a fase de forma completamente separada ───────────
        // Cada fase consume slots del calendario de forma independiente.
        // Un slot de semifinal NUNCA aparece antes de que el último partido
        // del grupo se haya agendado.
        const scheduledMatches: any[] = [];
        const playerLastSlot: { [playerId: string]: number } = {};

        let globalSlotIdx = 0;
        let dayOffset = 0;
        const maxDays = 30;

        for (const phase of phases) {
            // Agenda todos los partidos de esta fase antes de pasar a la siguiente
            const pending = [...phase.queue];

            while (pending.length > 0 && dayOffset < maxDays) {
                const dayDate = new Date(startDate + 'T00:00:00');
                dayDate.setDate(dayDate.getDate() + dayOffset);

                const daySlots = this.generateTimeSlots(dayDate, dailyStartTime, dailyEndTime, matchDurationMinutes, bufferMinutes);

                if (daySlots.length === 0) {
                    console.warn(`[Engine] Sin franjas horarias para ${dayDate.toDateString()}. Verifica horario.`);
                    dayOffset++;
                    continue;
                }

                for (const slotStart of daySlots) {
                    if (pending.length === 0) break;

                    for (let c = 0; c < numCourts; c++) {
                        if (pending.length === 0) break;

                        // Buscar partido elegible SIN salirse de la fase actual
                        let foundIdx = -1;
                        for (let i = 0; i < pending.length; i++) {
                            if (this.canPlay(pending[i].playerIds, globalSlotIdx, playerLastSlot)) {
                                foundIdx = i;
                                break;
                            }
                        }
                        // Si nadie cumple descanso, usar el primero de la misma fase
                        // (nunca se salta a la siguiente fase)
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

                dayOffset++;
            }

            if (pending.length > 0) {
                console.warn(`[Engine] ${pending.length} partidos de "${phase.name}" no se pudieron agendar.`);
            }

            console.log(`[Engine] ✅ Fase "${phase.name}" completada → próxima fase empieza día ${dayOffset}`);
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

        console.log(`[Pairings] ${cat.category} | groupSize=${cat.groupSize} → gs=${gs} | equipos=${teams.length} | grupos=${groups.length} | knockout=${groups.length > 1}`);
        // ── Fase de grupos: round-robin DENTRO de cada grupo ─────────────
        for (const group of groups) {
            for (let i = 0; i < group.length; i++) {
                for (let j = i + 1; j < group.length; j++) {
                    result.push({
                        team1: group[i],
                        team2: group[j],
                        roundName: 'Fase de Grupos',
                        isKnockout: false,
                        isFinal: false,
                    });
                }
            }
        }

        // ── Fase eliminatoria (solo si hay más de 1 grupo) ───────────────
        if (groups.length > 1) {
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

            const gNames = groups.map((_, i) => String.fromCharCode(65 + i)); // A, B, C…

            // Semifinales: 1°A vs 2°B  ·  1°B vs 2°A
            for (let g = 0; g < groups.length; g += 2) {
                const gA = gNames[g];
                const gB = gNames[g + 1] ?? gNames[g];
                result.push({ team1: tbdTeam('1°', gA), team2: tbdTeam('2°', gB), roundName: 'SEMIFINAL', isKnockout: true, isFinal: false });
                result.push({ team1: tbdTeam('1°', gB), team2: tbdTeam('2°', gA), roundName: 'SEMIFINAL', isKnockout: true, isFinal: false });
            }

            // Final: ganadores de las semis
            result.push({ team1: tbdSFTeam(1), team2: tbdSFTeam(2), roundName: 'FINAL', isKnockout: true, isFinal: true });
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
