import {
    TournamentType,
    MatchStatus,
    ScheduleConfig
} from '../types/tournament';

export class ScheduleEngine {
    /**
   * Genera los matches para un torneo basándose en la configuración.
   */
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
            bufferMinutes,
            type
        } = config;

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

        // Proper Fisher-Yates Shuffle for pairings
        for (let i = pairings.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pairings[i], pairings[j]] = [pairings[j], pairings[i]];
        }

        console.log(`[ScheduleEngine] Generated ${pairings.length} pairings for ${numTeams} teams`);

        const timeSlots = this.generateTimeSlots(startDate, clubHoursStart, clubHoursEnd, matchDurationMinutes, bufferMinutes);
        console.log(`[ScheduleEngine] Generated ${timeSlots.length} time slots`);

        const matches: any[] = [];
        const teamLastPlayed: { [key: number]: number } = {};

        let pairingIndex = 0;
        const totalPairings = pairings.length;

        for (let slotIdx = 0; slotIdx < timeSlots.length; slotIdx++) {
            const slotStart = timeSlots[slotIdx];

            for (let c = 0; c < numCourts; c++) {
                if (pairingIndex >= totalPairings) break;

                let foundIdx = -1;
                for (let i = pairingIndex; i < totalPairings; i++) {
                    const [t1, t2] = pairings[i];

                    const t1LastIdx = teamLastPlayed[t1] !== undefined ? teamLastPlayed[t1] : -2;
                    const t2LastIdx = teamLastPlayed[t2] !== undefined ? teamLastPlayed[t2] : -2;

                    if (slotIdx - t1LastIdx > 1 && slotIdx - t2LastIdx > 1) {
                        foundIdx = i;
                        break;
                    }
                }

                if (foundIdx === -1) {
                    for (let i = pairingIndex; i < totalPairings; i++) {
                        const [t1, t2] = pairings[i];
                        const t1LastIdx = teamLastPlayed[t1] !== undefined ? teamLastPlayed[t1] : -2;
                        const t2LastIdx = teamLastPlayed[t2] !== undefined ? teamLastPlayed[t2] : -2;

                        if (t1LastIdx < slotIdx && t2LastIdx < slotIdx) {
                            foundIdx = i;
                            break;
                        }
                    }
                }

                if (foundIdx !== -1) {
                    const [t1, t2] = pairings[foundIdx];

                    matches.push({
                        team1Index: t1,
                        team2Index: t2,
                        scheduledTime: new Date(slotStart),
                        courtIndex: c,
                        status: MatchStatus.PENDING
                    });

                    // Swap using a temporary variable to avoid any destructuring issues if necessary
                    const temp = pairings[pairingIndex];
                    pairings[pairingIndex] = pairings[foundIdx];
                    pairings[foundIdx] = temp;

                    teamLastPlayed[t1] = slotIdx;
                    teamLastPlayed[t2] = slotIdx;
                    pairingIndex++;
                }
            }
        }

        console.log(`[ScheduleEngine] Final matches scheduled: ${matches.length}`);

        return {
            matches,
            totalMatches: matches.length,
            pairingsGenerated: totalPairings,
            notScheduled: totalPairings - matches.length,
            estimatedHours: (matches.length / numCourts) * (matchDurationMinutes / 60)
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

        // Crear fechas basadas en el startDate original para evitar desajustes de zona horaria
        const currentDay = new Date(startDate);
        currentDay.setHours(startH, startM, 0, 0);

        const limitDay = new Date(startDate);
        limitDay.setHours(endH, endM, 0, 0);

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
            // FIX: Be explicit with 0 and ensure keys are distinct strings
            const key = (m.courtId !== undefined && m.courtId !== null)
                ? String(m.courtId)
                : (m.courtIndex !== undefined && m.courtIndex !== null)
                    ? `idx-${m.courtIndex}`
                    : 'idx-0';
            if (!matchesByCourt[key]) matchesByCourt[key] = [];
            matchesByCourt[key].push(m);
        });

        const updatedMatches: any[] = [];

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
                            updatedMatches.push({ id: match.id, scheduledTime: newTime });
                        }
                    }

                    const estimatedEnd = new Date(match.scheduledTime);
                    estimatedEnd.setMinutes(estimatedEnd.getMinutes() + 90);
                    lastEndTime = estimatedEnd;
                }
            });
        });

        return updatedMatches;
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
}
