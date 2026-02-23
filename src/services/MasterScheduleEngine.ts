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
            endDate,
            dailyStartTime,
            dailyEndTime,
            numCourts,
            matchDurationMinutes,
            bufferMinutes,
            categories
        } = config;

        // 1. Generate all time slots for all days
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');
        const allDays: Date[] = [];
        let curr = new Date(start);
        while (curr <= end) {
            allDays.push(new Date(curr));
            curr.setDate(curr.getDate() + 1);
        }

        const timeSlots: Date[] = [];
        allDays.forEach(day => {
            const slots = this.generateTimeSlots(day, dailyStartTime, dailyEndTime, matchDurationMinutes, bufferMinutes);
            timeSlots.push(...slots);
        });

        console.log(`[MasterScheduleEngine] Total time slots available: ${timeSlots.length} across ${allDays.length} days`);

        // 2. Generate pairings per category and organize by progression stages
        // Stage 1: Round Robin / First Rounds
        // Stage 2: Semis (Implicit if bracket)
        // Stage 3: Finals (RESERVED AT THE END)

        let allGroupMatches: any[] = [];
        let allFinalMatches: any[] = [];

        categories.forEach(cat => {
            const pairings = this.generatePairings(cat);

            // Distinguish between normal matches and "The Final"
            // For simplicity in this logic, we'll treat all pairings as "Group Stage" 
            // and manually identify the "Finals" if it's a Knockout, 
            // or just take the last pairing if it's small.
            // Requirement 2: Progression Sincronica.
            // Requirement 3: Reservar finales.

            const total = pairings.length;
            pairings.forEach((pair, idx) => {
                let roundName = 'Fase de Grupos';
                const isKnockout = cat.type === TournamentType.KNOCKOUT;
                const matchesToGo = total - idx;

                if (isKnockout) {
                    if (matchesToGo === 1) roundName = 'FINAL';
                    else if (matchesToGo <= 2) roundName = 'SEMIFINAL';
                    else if (matchesToGo <= 4) roundName = '4TOS DE FINAL';
                    else if (matchesToGo <= 8) roundName = '8VOS DE FINAL';
                    else if (matchesToGo <= 16) roundName = 'R-16';
                    else roundName = 'ELIMINATORIA';
                } else if (idx === total - 1) {
                    roundName = 'FINAL (GD)';
                }

                const matchObj = {
                    categoryId: cat.id,
                    categoryName: `${cat.gender} - ${cat.category}`,
                    team1: pair[0],
                    team2: pair[1],
                    isFinal: matchesToGo === 1,
                    roundName: roundName,
                    playerIds: this.getTeamPlayerIds(pair[0], pair[1], cat)
                };

                if (matchesToGo === 1) {
                    allFinalMatches.push(matchObj);
                } else {
                    allGroupMatches.push(matchObj);
                }
            });
        });

        // 3. Scheduling logic with conflict prevention
        const scheduledMatches: any[] = [];
        const playerLastSlot: { [playerId: string]: number } = {};

        // Reverse reserve slots for finals
        const numFinals = allFinalMatches.length;
        const slotsNeededForFinals = Math.ceil(numFinals / numCourts);
        const finalsSlotStartIndex = timeSlots.length - slotsNeededForFinals;

        let currentSlotIdx = 0;
        let pendingMatches = [...allGroupMatches];

        // Shuffle to mix categories
        pendingMatches = this.shuffle(pendingMatches);

        while (pendingMatches.length > 0 && currentSlotIdx < finalsSlotStartIndex) {
            const slotStart = timeSlots[currentSlotIdx];
            let courtUsedInSlot = 0;

            for (let c = 0; c < numCourts; c++) {
                if (pendingMatches.length === 0) break;

                let foundIdx = -1;
                for (let i = 0; i < pendingMatches.length; i++) {
                    const m = pendingMatches[i];
                    if (this.canPlayerPlay(m.playerIds, currentSlotIdx, playerLastSlot)) {
                        foundIdx = i;
                        break;
                    }
                }

                if (foundIdx !== -1) {
                    const m = pendingMatches.splice(foundIdx, 1)[0];
                    scheduledMatches.push({
                        ...m,
                        scheduledTime: slotStart.toISOString(),
                        courtIndex: c,
                        courtName: (config.courtNames[c] && config.courtNames[c].trim()) ? config.courtNames[c] : `Pista ${c + 1}`,
                        status: MatchStatus.PENDING
                    });

                    m.playerIds.forEach((pid: string) => {
                        playerLastSlot[pid] = currentSlotIdx;
                    });
                    courtUsedInSlot++;
                }
            }
            currentSlotIdx++;
        }

        // 4. Schedule Finals
        let finalSlotIdx = Math.max(currentSlotIdx, finalsSlotStartIndex);
        let pendingFinals = [...allFinalMatches];

        while (pendingFinals.length > 0 && finalSlotIdx < timeSlots.length) {
            const slotStart = timeSlots[finalSlotIdx];
            for (let c = 0; c < numCourts; c++) {
                if (pendingFinals.length === 0) break;

                let foundIdx = -1;
                for (let i = 0; i < pendingFinals.length; i++) {
                    const m = pendingFinals[i];
                    if (this.canPlayerPlay(m.playerIds, finalSlotIdx, playerLastSlot)) {
                        foundIdx = i;
                        break;
                    }
                }

                if (foundIdx !== -1) {
                    const m = pendingFinals.splice(foundIdx, 1)[0];
                    scheduledMatches.push({
                        ...m,
                        scheduledTime: slotStart.toISOString(),
                        courtIndex: c,
                        courtName: (config.courtNames[c] && config.courtNames[c].trim()) ? config.courtNames[c] : `Pista ${c + 1}`,
                        status: MatchStatus.PENDING,
                        roundName: 'FINAL'
                    });
                    m.playerIds.forEach((pid: string) => {
                        playerLastSlot[pid] = finalSlotIdx;
                    });
                }
            }
            finalSlotIdx++;
        }

        return {
            matches: scheduledMatches,
            notScheduled: pendingMatches.length + pendingFinals.length,
            totalMatches: scheduledMatches.length
        };
    }

    private static generateTimeSlots(day: Date, startStr: string, endStr: string, duration: number, buffer: number): Date[] {
        const slots: Date[] = [];
        const [startH, startM] = startStr.split(':').map(Number);
        const [endH, endM] = endStr.split(':').map(Number);

        const current = new Date(day);
        current.setHours(startH, startM, 0, 0);

        const limit = new Date(day);
        limit.setHours(endH, endM, 0, 0);

        while (current.getTime() + duration * 60000 <= limit.getTime()) {
            slots.push(new Date(current));
            current.setMinutes(current.getMinutes() + duration + buffer);
        }
        return slots;
    }

    private static generatePairings(cat: CategoryConfig): any[][] {
        const pairings: any[][] = [];
        const teams = cat.teams;
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                pairings.push([teams[i], teams[j]]);
            }
        }
        return pairings;
    }

    private static getTeamPlayerIds(t1: any, t2: any, cat: CategoryConfig): string[] {
        const ids = [];
        if (t1.p1?.id) ids.push(t1.p1.id);
        if (t1.p2?.id) ids.push(t1.p2.id);
        if (t2.p1?.id) ids.push(t2.p1.id);
        if (t2.p2?.id) ids.push(t2.p2.id);
        return ids;
    }

    private static canPlayerPlay(playerIds: string[], currentSlotIdx: number, playerLastSlot: { [pid: string]: number }): boolean {
        for (const pid of playerIds) {
            if (playerLastSlot[pid] === undefined) continue;
            // Requirement 2: Rest 1 slot between matches
            if (currentSlotIdx - playerLastSlot[pid] <= 1) return false;
        }
        return true;
    }

    private static shuffle(array: any[]) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }
}
