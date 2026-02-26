import {
    TournamentType,
    MatchStatus,
    ScheduleConfig
} from '../types/tournament';

export class ScheduleEngine {
    /**
   * Genera los matches para un torneo basándose en la configuración.
   */
    /** Slot fijo entre partidos en la misma cancha (minutos) */
    static readonly SLOT_MINUTES = 85;

    static generateSchedule(config: ScheduleConfig) {
        if (config.numTeams < 2) {
            console.warn('[ScheduleEngine] Not enough teams to generate a schedule');
            return {
                matches: [],
                totalMatches: 0,
                pairingsGenerated: 0,
                notScheduled: 0,
                estimatedHours: 0
            };
        }
        const {
            numTeams,
            numCourts,
            clubHoursStart,
            clubHoursEnd,
            startDate,
            matchDurationMinutes,
            type
        } = config;

        const slotMinutes = ScheduleEngine.SLOT_MINUTES; // 85 min entre partidos en la misma cancha

        let pairings: [number, number][] = [];
        if (
            type === TournamentType.AMERICANO_INDIVIDUAL ||
            type === TournamentType.AMERICANO_DUPLA ||
            type === TournamentType.ROUND_ROBIN
        ) {
            pairings = this.generateRoundRobinPairings(numTeams);
        } else {
            pairings = this.generateBasicPairings(numTeams);
        }

        // Shuffle Fisher-Yates
        for (let i = pairings.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pairings[i], pairings[j]] = [pairings[j], pairings[i]];
        }

        console.log(`[ScheduleEngine] ${pairings.length} pairings for ${numTeams} teams, ${numCourts} courts`);

        // Parse club hours
        const [startH, startM] = (clubHoursStart || '08:00').split(':').map(Number);
        const [endH, endM] = (clubHoursEnd || '22:00').split(':').map(Number);

        const clubOpen = new Date(startDate);
        clubOpen.setHours(startH, startM, 0, 0);

        const clubClose = new Date(startDate);
        clubClose.setHours(endH, endM, 0, 0);
        if (clubClose <= clubOpen) clubClose.setDate(clubClose.getDate() + 1);

        // ── Cada cancha tiene su propio timeline, todas empiezan en clubOpen ──
        const courtNextTime: Date[] = Array.from({ length: numCourts }, () => new Date(clubOpen));
        const teamLastSlot: { [k: number]: number } = {}; // evitar descanso 0 entre partidos

        const matches: any[] = [];
        let pairingIndex = 0;
        const totalPairings = pairings.length;
        let globalSlot = 0;

        while (pairingIndex < totalPairings) {
            let assignedThisRound = false;

            for (let c = 0; c < numCourts && pairingIndex < totalPairings; c++) {
                const courtTime = courtNextTime[c];
                const matchEnd = new Date(courtTime.getTime() + matchDurationMinutes * 60000);
                if (matchEnd > clubClose) continue; // cancha cerrada

                // Buscar pareja válida (ninguno jugó en el slot anterior)
                let foundIdx = -1;
                for (let pass = 0; pass < 2 && foundIdx === -1; pass++) {
                    for (let i = pairingIndex; i < totalPairings; i++) {
                        const [t1, t2] = pairings[i];
                        const t1Last = teamLastSlot[t1] ?? -2;
                        const t2Last = teamLastSlot[t2] ?? -2;
                        if (pass === 0) {
                            if (globalSlot - t1Last > 1 && globalSlot - t2Last > 1) { foundIdx = i; break; }
                        } else {
                            if (t1Last < globalSlot && t2Last < globalSlot) { foundIdx = i; break; }
                        }
                    }
                }

                if (foundIdx !== -1) {
                    const [t1, t2] = pairings[foundIdx];
                    matches.push({
                        team1Index: t1,
                        team2Index: t2,
                        scheduledTime: new Date(courtTime),
                        courtIndex: c,
                        status: MatchStatus.PENDING
                    });
                    // Avanzar el timeline de esta cancha 85 min
                    courtNextTime[c] = new Date(courtTime.getTime() + slotMinutes * 60000);
                    teamLastSlot[t1] = globalSlot;
                    teamLastSlot[t2] = globalSlot;
                    // Swap al frente
                    [pairings[pairingIndex], pairings[foundIdx]] = [pairings[foundIdx], pairings[pairingIndex]];
                    pairingIndex++;
                    assignedThisRound = true;
                }
            }

            globalSlot++;
            if (!assignedThisRound) break; // no se pudo asignar nada, todas las canchas cerradas
        }

        console.log(`[ScheduleEngine] Scheduled: ${matches.length} / ${totalPairings}`);

        return {
            matches,
            totalMatches: matches.length,
            pairingsGenerated: totalPairings,
            notScheduled: totalPairings - matches.length,
            estimatedHours: (matches.length / numCourts) * (slotMinutes / 60)
        };
    }

    private static generateRoundRobinPairings(numTeams: number): [number, number][] {
        const pairings: [number, number][] = [];
        const teams: number[] = [];
        for (let i = 1; i <= numTeams; i++) {
            teams.push(i);
        }

        if (numTeams % 2 !== 0) {
            teams.push(-1);
        }

        const n = teams.length;
        const rounds = n - 1;
        const matchesPerRound = n / 2;

        for (let r = 0; r < rounds; r++) {
            for (let m = 0; m < matchesPerRound; m++) {
                const t1 = teams[m];
                const t2 = teams[n - 1 - m];

                if (t1 !== -1 && t2 !== -1) {
                    pairings.push([t1, t2]);
                }
            }

            const last = teams.pop();
            if (last !== undefined) {
                teams.splice(1, 0, last);
            }
        }

        return pairings;
    }

    private static generateBasicPairings(numTeams: number): [number, number][] {
        const pairings: [number, number][] = [];
        for (let i = 1; i <= numTeams; i++) {
            for (let j = i + 1; j <= numTeams; j++) {
                pairings.push([i, j]);
            }
        }
        return pairings;
    }

    /**
     * Genera una lista de Date indicando el inicio de cada slot de tiempo disponible
     */
    private static generateTimeSlots(startDate: Date, startStr: string, endStr: string, duration: number, buffer: number): Date[] {
        if (!startDate || isNaN(startDate.getTime())) {
            console.error('[ScheduleEngine] Invalid startDate provided to generateTimeSlots');
            return [];
        }

        const slots: Date[] = [];
        const [startH, startM] = (startStr || "08:00").split(':').map(Number);
        const [endH, endM] = (endStr || "22:00").split(':').map(Number);

        // Create dates carefully to avoid timezone-related day shifts
        // We want the slots to be on the same "local day" as the startDate
        const currentDay = new Date(startDate);
        currentDay.setHours(startH, startM, 0, 0);

        // If the date shift moved us to another day due to UTC vs Local, 
        // we should ideally have the date-only part correctly.
        // But since we are setting hours locally, it's safer to ensure we use the same day.
        const limitDay = new Date(currentDay);
        limitDay.setHours(endH, endM, 0, 0);

        // If endTime is e.g. 02:00 and startTime is 08:00, it might mean the next day
        if (limitDay <= currentDay) {
            limitDay.setDate(limitDay.getDate() + 1);
        }

        console.log(`[ScheduleEngine] Generating slots from ${currentDay.toISOString()} to ${limitDay.toISOString()}`);

        let currentTime = new Date(currentDay);
        let safetyCounter = 0;

        while (currentTime.getTime() + duration * 60000 <= limitDay.getTime() && safetyCounter < 1000) {
            slots.push(new Date(currentTime));
            currentTime.setMinutes(currentTime.getMinutes() + duration + buffer);
            safetyCounter++;
        }

        if (safetyCounter >= 1000) {
            console.error('[ScheduleEngine] Infinite loop detected in generateTimeSlots');
        }

        return slots;
    }
    /**
     * Recalcula los horarios de los partidos pendientes basándose en los partidos ya terminados.
     */
    static recalculateRemainingMatches(
        allMatches: any[],
        bufferMinutes: number,
        currentTime: Date = new Date()
    ) {
        // Agrupar matches por pista usando courtIndex (o courtId si existe)
        const matchesByCourt: { [key: string]: any[] } = {};
        allMatches.forEach(m => {
            const key = (m.courtId !== undefined && m.courtId !== null)
                ? String(m.courtId)
                : (m.courtIndex !== undefined && m.courtIndex !== null)
                    ? `idx-${m.courtIndex}`
                    : 'idx-0';
            if (!matchesByCourt[key]) matchesByCourt[key] = [];
            matchesByCourt[key].push({ ...m }); // Create shallow copy to work with
        });

        const updates: any[] = [];

        Object.values(matchesByCourt).forEach(courtMatches => {
            // Ordenar por tiempo programado original
            courtMatches.sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());

            let lastEndTime = new Date(0);

            courtMatches.forEach((match) => {
                if (match.status === MatchStatus.FINISHED && match.actualEndTime) {
                    lastEndTime = new Date(match.actualEndTime);
                } else if (match.status === MatchStatus.LIVE && match.actualStartTime) {
                    const estimatedEnd = new Date(match.actualStartTime);
                    estimatedEnd.setMinutes(estimatedEnd.getMinutes() + 90);
                    lastEndTime = estimatedEnd;
                } else if (match.status === MatchStatus.PENDING) {
                    const originalTime = new Date(match.scheduledTime);
                    const earliestStart = new Date(lastEndTime);
                    earliestStart.setMinutes(earliestStart.getMinutes() + bufferMinutes);

                    if (earliestStart > originalTime || (lastEndTime.getTime() > 0 && earliestStart > originalTime)) {
                        const newTime = earliestStart > originalTime ? earliestStart : originalTime;

                        if (Math.abs(newTime.getTime() - originalTime.getTime()) > 60000) {
                            match.scheduledTime = newTime;
                            updates.push({ id: match.id, scheduledTime: newTime });
                        }
                    }

                    const estimatedEnd = new Date(match.scheduledTime);
                    estimatedEnd.setMinutes(estimatedEnd.getMinutes() + 90);
                    lastEndTime = estimatedEnd;
                }
            });
        });

        return updates;
    }

    /**
     * Genera la estructura de un cuadro de eliminación directa con nombres de ronda automáticos.
     */
    static generateBracket(advancingTeamsIndices: number[], numCourts: number, matchDuration: number, buffer: number, startDate: Date, startTime: string) {
        const numTeams = advancingTeamsIndices.length;
        if (numTeams < 2) return { matches: [] };

        // Determinar el tamaño del cuadro (potencia de 2)
        const rounds = Math.ceil(Math.log2(numTeams));
        const bracketSize = Math.pow(2, rounds);

        const bracketMatches: any[] = [];
        let currentTime = new Date(startDate);
        const [h, m] = (startTime || "08:00").split(':').map(Number);
        currentTime.setHours(h, m, 0, 0);

        // Generar Primera Ronda con seeding estándar (distribución de llaves)
        const firstRoundMatchesCount = bracketSize / 2;

        // Función para generar el orden de seeding dinámicamente
        const getSeedingOrder = (size: number): number[] => {
            let seeds = [1, 2];
            while (seeds.length < size) {
                let nextSeeds = [];
                for (let s of seeds) {
                    nextSeeds.push(s);
                    nextSeeds.push(seeds.length * 2 + 1 - s);
                }
                seeds = nextSeeds;
            }
            return seeds;
        };

        const seedingOrder = getSeedingOrder(bracketSize);
        const pairs: any[] = [];
        for (let i = 0; i < firstRoundMatchesCount; i++) {
            const s1 = seedingOrder[i * 2];
            const s2 = seedingOrder[i * 2 + 1];

            // Mapear semillas a índices de equipos (si existen)
            const team1 = advancingTeamsIndices[s1 - 1] !== undefined ? advancingTeamsIndices[s1 - 1] : -1;
            const team2 = advancingTeamsIndices[s2 - 1] !== undefined ? advancingTeamsIndices[s2 - 1] : -1;

            pairs.push({ t1: team1, t2: team2 });
        }

        const getRoundName = (matchesInRound: number) => {
            if (matchesInRound === 1) return 'FINAL';
            if (matchesInRound === 2) return 'SEMIFINALES';
            if (matchesInRound === 4) return 'CUARTOS DE FINAL';
            if (matchesInRound === 8) return 'OCTAVOS DE FINAL';
            if (matchesInRound === 16) return '16VOS DE FINAL';
            if (matchesInRound === 32) return '32VOS DE FINAL';
            return `RONDA DE ${matchesInRound * 2}`;
        };

        let matchCounter = 0;
        for (let r = 1; r <= rounds; r++) {
            const matchesInRound = Math.pow(2, rounds - r);
            const roundName = getRoundName(matchesInRound);

            for (let p = 1; p <= matchesInRound; p++) {
                const isFirstRound = r === 1;
                const match: any = {
                    id: `bracket-r${r}-p${p}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    team1Index: isFirstRound ? pairs[p - 1]?.t1 || -1 : -1,
                    team2Index: isFirstRound ? pairs[p - 1]?.t2 || -1 : -1,
                    status: MatchStatus.PENDING,
                    stage: 'MAIN_DRAW',
                    roundName: roundName,
                    bracketPosition: { round: r, position: p },
                    scheduledTime: new Date(currentTime),
                    courtIndex: matchCounter % numCourts
                };

                bracketMatches.push(match);
                matchCounter++;

                if (matchCounter % numCourts === 0) {
                    currentTime.setMinutes(currentTime.getMinutes() + matchDuration + buffer);
                }
            }
            if (matchCounter % numCourts !== 0) {
                currentTime.setMinutes(currentTime.getMinutes() + matchDuration + buffer);
            }
        }

        return { matches: bracketMatches };
    }

    /**
     * FORMATO CRUZADO
     * ─────────────────────────────────────────────────────────────────
     * 1. Divide N equipos en Grupo A y Grupo B (mitades iguales).
     * 2. Genera exactamente 2 partidos cruzados (A vs B) por equipo.
     * 3. Agenda los partidos en canchas con el slot de 85 minutos.
     * 4. Devuelve metadata de grupos y cuartos de final (4 partidos placeholders).
     * ─────────────────────────────────────────────────────────────────
     */
    static generateCruzado(config: {
        numTeams: number;
        numCourts: number;
        clubHoursStart: string;
        clubHoursEnd: string;
        startDate: Date;
        matchDurationMinutes?: number;
        teams?: any[];
    }) {
        const {
            numTeams,
            numCourts,
            clubHoursStart,
            clubHoursEnd,
            startDate,
            matchDurationMinutes = 85,
        } = config;

        if (numTeams < 4) {
            console.warn('[ScheduleEngine.Cruzado] Se necesitan al menos 4 equipos');
            return { crossMatches: [], qfMatches: [], groupA: [], groupB: [], groupAssignments: {} };
        }

        // ── 1. Dividir equipos en dos grupos ──────────────────────────
        const half = Math.floor(numTeams / 2);
        // Índices 1-based de equipos
        const groupA: number[] = Array.from({ length: half }, (_, i) => i + 1);
        const groupB: number[] = Array.from({ length: numTeams - half }, (_, i) => half + i + 1);

        // ── 2. Generar emparejamientos cruzados (2 por equipo) ─────────
        //   Algoritmo: round-robin entre A y B para asegurar que
        //   cada equipo juegue exactamente 2 veces contra el otro grupo.
        const crossPairings: [number, number][] = this.generateCrossGroupPairings(groupA, groupB);

        // ── 3. Agendar en canchas (mismo algoritmo de SLOT_MINUTES) ────
        const slotMinutes = this.SLOT_MINUTES;
        const [startH, startM] = (clubHoursStart || '08:00').split(':').map(Number);
        const [endH, endM] = (clubHoursEnd || '22:00').split(':').map(Number);

        const clubOpen = new Date(startDate);
        clubOpen.setHours(startH, startM, 0, 0);
        const clubClose = new Date(startDate);
        clubClose.setHours(endH, endM, 0, 0);
        if (clubClose <= clubOpen) clubClose.setDate(clubClose.getDate() + 1);

        const courtNextTime: Date[] = Array.from({ length: numCourts }, () => new Date(clubOpen));
        const crossMatches: any[] = [];

        crossPairings.forEach((pair, idx) => {
            // Elegir la cancha que tiene el próximo slot disponible más pronto
            let bestCourt = 0;
            for (let c = 1; c < numCourts; c++) {
                if (courtNextTime[c] < courtNextTime[bestCourt]) bestCourt = c;
            }
            const courtTime = courtNextTime[bestCourt];
            const matchEnd = new Date(courtTime.getTime() + matchDurationMinutes * 60000);
            if (matchEnd > clubClose) return; // Sin espacio

            crossMatches.push({
                id: `cruzado-${idx}-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
                team1Index: pair[0],
                team2Index: pair[1],
                scheduledTime: new Date(courtTime),
                courtIndex: bestCourt,
                status: MatchStatus.PENDING,
                stage: 'GROUP_STAGE',
                groupName: 'CRUZADO',
                roundName: 'Fase Cruzada',
            });

            courtNextTime[bestCourt] = new Date(courtTime.getTime() + slotMinutes * 60000);
        });

        // ── 4. Cuartos de final placeholders (4 partidos TBD) ──────────
        // Se programan 85 min después del último partido de la fase cruzada
        const lastMatchTime = crossMatches.reduce((max, m) => {
            const t = new Date(m.scheduledTime).getTime();
            return t > max ? t : max;
        }, clubOpen.getTime());

        const qfStart = new Date(lastMatchTime + slotMinutes * 60000);
        const qfMatches: any[] = [];
        for (let i = 0; i < 4; i++) {
            qfMatches.push({
                id: `qf-${i}-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
                team1Index: -1, // TBD — se asigna tras la fase cruzada
                team2Index: -1,
                scheduledTime: new Date(qfStart.getTime() + Math.floor(i / numCourts) * slotMinutes * 60000),
                courtIndex: i % numCourts,
                status: MatchStatus.PENDING,
                stage: 'MAIN_DRAW',
                roundName: 'CUARTOS DE FINAL',
                isQF: true,
            });
        }

        const groupAssignments: Record<string, string[]> = {
            A: groupA.map(String),
            B: groupB.map(String),
        };

        return { crossMatches, qfMatches, groupA, groupB, groupAssignments };
    }

    /**
     * Para N_A equipos en A y N_B equipos en B, asigna exactamente 2 rivales
     * del otro grupo a cada equipo (usando round-robin bipartito).
     */
    private static generateCrossGroupPairings(groupA: number[], groupB: number[]): [number, number][] {
        const pairings: [number, number][] = [];
        const aLen = groupA.length;
        const bLen = groupB.length;

        // Cada equipo de A juega exactamente 2 veces contra B
        // Ronda 1: A[i] vs B[i % bLen]
        // Ronda 2: A[i] vs B[(i + 1) % bLen]
        for (let i = 0; i < aLen; i++) {
            pairings.push([groupA[i], groupB[i % bLen]]);
        }
        for (let i = 0; i < aLen; i++) {
            pairings.push([groupA[i], groupB[(i + 1) % bLen]]);
        }

        // Deduplicar si aLen === 1 ó bLen === 1
        const seen = new Set<string>();
        return pairings.filter(([a, b]) => {
            const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
}

