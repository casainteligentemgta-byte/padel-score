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
    setFormat: 'TIE_BREAK' | 'SUPER_TIE_BREAK' | 'NO_TIE_BREAK'; // Formato del set
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
        const allMatches: any[] = [];

        categories.forEach(cat => {
            if (!cat.teams || cat.teams.length < 2) {
                console.warn(`[Engine] Categoría ${cat.category} tiene menos de 2 equipos, ignorada.`);
                return;
            }

            const pairings = this.generatePairings(cat);
            console.log(`[Engine] Cat ${cat.gender}-${cat.category}: ${cat.teams.length} equipos → ${pairings.length} partidos`);

            pairings.forEach((pair, idx) => {
                allMatches.push({
                    categoryId: cat.id,
                    categoryName: `${cat.gender} - ${cat.category}`,
                    team1: pair[0],
                    team2: pair[1],
                    roundName: 'Fase de Grupos',
                    playerIds: this.getTeamPlayerIds(pair[0], pair[1]),
                    isFinal: false,
                });
            });
        });

        console.log(`[Engine] Total partidos a agendar: ${allMatches.length}`);

        if (allMatches.length === 0) {
            return { matches: [], notScheduled: 0, totalMatches: 0 };
        }

        // ── 2. Mezclar para distribuir categorías uniformemente ────────────
        const pending = this.shuffle([...allMatches]);

        // ── 3. Agendar expandiendo días hasta colocar todos ───────────────
        const scheduledMatches: any[] = [];
        const playerLastSlot: { [playerId: string]: number } = {};

        let globalSlotIdx = 0;
        let dayOffset = 0;
        const maxDays = 30; // límite de seguridad: nunca pasar 30 días

        while (pending.length > 0 && dayOffset < maxDays) {
            // Generar slots del día actual
            const dayDate = new Date(startDate + 'T00:00:00');
            dayDate.setDate(dayDate.getDate() + dayOffset);

            const daySlots = this.generateTimeSlots(dayDate, dailyStartTime, dailyEndTime, matchDurationMinutes, bufferMinutes);

            if (daySlots.length === 0) {
                console.warn(`[Engine] El horario ${dailyStartTime}-${dailyEndTime} con duración ${matchDurationMinutes}min+${bufferMinutes}min buffer no genera franjas. Verifica la configuración.`);
                break;
            }

            for (const slotStart of daySlots) {
                if (pending.length === 0) break;

                // Intentar llenar cada cancha en este slot
                for (let c = 0; c < numCourts; c++) {
                    if (pending.length === 0) break;

                    // Buscar partido cuyo jugadores hayan descansado al menos 1 slot
                    let foundIdx = -1;
                    for (let i = 0; i < pending.length; i++) {
                        if (this.canPlay(pending[i].playerIds, globalSlotIdx, playerLastSlot)) {
                            foundIdx = i;
                            break;
                        }
                    }

                    // Si nadie pasa el filtro de descanso, asignar de todas formas el primero
                    // (el descanso es preferible pero no puede bloquear eternamente)
                    if (foundIdx === -1) {
                        foundIdx = 0;
                    }

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
            console.warn(`[Engine] ${pending.length} partidos no se pudieron agendar (${dayOffset} días usados, límite: ${maxDays})`);
        }

        console.log(`[Engine] ✅ ${scheduledMatches.length} partidos agendados en ${dayOffset} día(s)`);

        return {
            matches: scheduledMatches,
            notScheduled: pending.length,
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

    /** Round-robin completo: cada equipo juega contra todos los demás */
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
