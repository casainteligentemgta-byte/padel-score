module.exports = [
"[project]/src/lib/useRouteSegment.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useRouteSegment",
    ()=>useRouteSegment
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
'use client';
;
function useRouteSegment(paramName) {
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useParams"])();
    const raw = params?.[paramName];
    return (Array.isArray(raw) ? raw[0] : raw) ?? '';
}
}),
"[project]/src/types/tournament.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MatchStatus",
    ()=>MatchStatus,
    "TieBreakRule",
    ()=>TieBreakRule,
    "TournamentCategory",
    ()=>TournamentCategory,
    "TournamentType",
    ()=>TournamentType
]);
var TieBreakRule = /*#__PURE__*/ function(TieBreakRule) {
    TieBreakRule["GAMES_DIFF"] = "GAMES_DIFF";
    TieBreakRule["HEAD_TO_HEAD"] = "HEAD_TO_HEAD";
    return TieBreakRule;
}({});
var TournamentType = /*#__PURE__*/ function(TournamentType) {
    TournamentType["AMERICANO_INDIVIDUAL"] = "AMERICANO_INDIVIDUAL";
    TournamentType["AMERICANO_DUPLA"] = "AMERICANO_DUPLA";
    TournamentType["KNOCKOUT"] = "KNOCKOUT";
    TournamentType["ROUND_ROBIN"] = "ROUND_ROBIN";
    TournamentType["CRUZADO"] = "CRUZADO";
    TournamentType["CUADRO_CONSOLACION"] = "CUADRO_CONSOLACION";
    return TournamentType;
}({});
var TournamentCategory = /*#__PURE__*/ function(TournamentCategory) {
    // Géneros básicos
    TournamentCategory["MALE"] = "MALE";
    TournamentCategory["FEMALE"] = "FEMALE";
    TournamentCategory["MIXED"] = "MIXED";
    // Niveles específicos
    TournamentCategory["PRIMERA"] = "PRIMERA";
    TournamentCategory["SEGUNDA"] = "SEGUNDA";
    TournamentCategory["TERCERA"] = "TERCERA";
    TournamentCategory["CUARTA"] = "CUARTA";
    TournamentCategory["QUINTA"] = "QUINTA";
    TournamentCategory["SEXTA"] = "SEXTA";
    TournamentCategory["SEPTIMA"] = "SEPTIMA";
    // Veteranos
    TournamentCategory["MAS_40"] = "MAS_40";
    TournamentCategory["FEM_40"] = "FEM_40";
    TournamentCategory["MIX_40"] = "MIX_40";
    TournamentCategory["MAS_45"] = "MAS_45";
    TournamentCategory["MAS_50"] = "MAS_50";
    // Sumas
    TournamentCategory["SUMA_7"] = "SUMA_7";
    TournamentCategory["SUMA_8"] = "SUMA_8";
    TournamentCategory["SUMA_9"] = "SUMA_9";
    TournamentCategory["SUMA_10"] = "SUMA_10";
    TournamentCategory["SUMA_11"] = "SUMA_11";
    return TournamentCategory;
}({});
var MatchStatus = /*#__PURE__*/ function(MatchStatus) {
    MatchStatus["PENDING"] = "PENDING";
    MatchStatus["LIVE"] = "LIVE";
    MatchStatus["PAUSED"] = "PAUSED";
    MatchStatus["FINISHED"] = "FINISHED";
    MatchStatus["CANCELLED"] = "CANCELLED";
    return MatchStatus;
}({});
}),
"[project]/src/services/ScheduleEngine.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ScheduleEngine",
    ()=>ScheduleEngine
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/tournament.ts [app-ssr] (ecmascript)");
;
class ScheduleEngine {
    /**
   * Genera los matches para un torneo basándose en la configuración.
   */ /** Slot fijo entre partidos en la misma cancha (minutos). 90 min evita retrasos en cadena. */ static SLOT_MINUTES = 90;
    static generateSchedule(config) {
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
        const { numTeams, numCourts, clubHoursStart, clubHoursEnd, startDate, matchDurationMinutes, type } = config;
        const slotMinutes = ScheduleEngine.SLOT_MINUTES; // 85 min entre partidos en la misma cancha
        let pairings = [];
        if (type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TournamentType"].AMERICANO_INDIVIDUAL || type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TournamentType"].AMERICANO_DUPLA || type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TournamentType"].ROUND_ROBIN) {
            pairings = this.generateRoundRobinPairings(numTeams);
        } else {
            pairings = this.generateBasicPairings(numTeams);
        }
        // No shuffle to preserve logical order of games
        /*
        for (let i = pairings.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pairings[i], pairings[j]] = [pairings[j], pairings[i]];
        }
        */ console.log(`[ScheduleEngine] ${pairings.length} pairings for ${numTeams} teams, ${numCourts} courts`);
        // Parse club hours
        const [startH, startM] = (clubHoursStart || '08:00').split(':').map(Number);
        const [endH, endM] = (clubHoursEnd || '22:00').split(':').map(Number);
        const clubOpen = new Date(startDate);
        clubOpen.setHours(startH, startM, 0, 0);
        const clubClose = new Date(startDate);
        clubClose.setHours(endH, endM, 0, 0);
        if (clubClose <= clubOpen) clubClose.setDate(clubClose.getDate() + 1);
        // ── Cada cancha tiene su propio timeline, todas empiezan en clubOpen ──
        const courtNextTime = Array.from({
            length: numCourts
        }, ()=>new Date(clubOpen));
        const teamLastSlot = {}; // evitar descanso 0 entre partidos
        const matches = [];
        let pairingIndex = 0;
        const totalPairings = pairings.length;
        let globalSlot = 0;
        while(pairingIndex < totalPairings){
            let assignedThisRound = false;
            for(let c = 0; c < numCourts && pairingIndex < totalPairings; c++){
                const courtTime = courtNextTime[c];
                const matchEnd = new Date(courtTime.getTime() + matchDurationMinutes * 60000);
                if (matchEnd > clubClose) continue; // cancha cerrada
                // Buscar pareja válida (ninguno jugó en el slot anterior)
                let foundIdx = -1;
                for(let pass = 0; pass < 2 && foundIdx === -1; pass++){
                    for(let i = pairingIndex; i < totalPairings; i++){
                        const [t1, t2] = pairings[i];
                        const t1Last = teamLastSlot[t1] ?? -2;
                        const t2Last = teamLastSlot[t2] ?? -2;
                        if (pass === 0) {
                            if (globalSlot - t1Last > 1 && globalSlot - t2Last > 1) {
                                foundIdx = i;
                                break;
                            }
                        } else {
                            if (t1Last < globalSlot && t2Last < globalSlot) {
                                foundIdx = i;
                                break;
                            }
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
                        status: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].PENDING
                    });
                    // Avanzar el timeline de esta cancha 85 min
                    courtNextTime[c] = new Date(courtTime.getTime() + slotMinutes * 60000);
                    teamLastSlot[t1] = globalSlot;
                    teamLastSlot[t2] = globalSlot;
                    // Swap al frente
                    [pairings[pairingIndex], pairings[foundIdx]] = [
                        pairings[foundIdx],
                        pairings[pairingIndex]
                    ];
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
            estimatedHours: matches.length / numCourts * (slotMinutes / 60)
        };
    }
    static generateRoundRobinPairings(numTeams) {
        const pairings = [];
        const teams = [];
        for(let i = 1; i <= numTeams; i++){
            teams.push(i);
        }
        if (numTeams % 2 !== 0) {
            teams.push(-1);
        }
        const n = teams.length;
        const rounds = n - 1;
        const matchesPerRound = n / 2;
        for(let r = 0; r < rounds; r++){
            for(let m = 0; m < matchesPerRound; m++){
                const t1 = teams[m];
                const t2 = teams[n - 1 - m];
                if (t1 !== -1 && t2 !== -1) {
                    pairings.push([
                        t1,
                        t2
                    ]);
                }
            }
            const last = teams.pop();
            if (last !== undefined) {
                teams.splice(1, 0, last);
            }
        }
        return pairings;
    }
    static generateBasicPairings(numTeams) {
        const pairings = [];
        for(let i = 1; i <= numTeams; i++){
            for(let j = i + 1; j <= numTeams; j++){
                pairings.push([
                    i,
                    j
                ]);
            }
        }
        return pairings;
    }
    /**
     * Genera una lista de Date indicando el inicio de cada slot de tiempo disponible
     */ static generateTimeSlots(startDate, startStr, endStr, duration, buffer) {
        if (!startDate || isNaN(startDate.getTime())) {
            console.error('[ScheduleEngine] Invalid startDate provided to generateTimeSlots');
            return [];
        }
        const slots = [];
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
        while(currentTime.getTime() + duration * 60000 <= limitDay.getTime() && safetyCounter < 1000){
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
     */ static recalculateRemainingMatches(allMatches, bufferMinutes, currentTime = new Date()) {
        // Agrupar matches por pista usando courtIndex (o courtId si existe)
        const matchesByCourt = {};
        allMatches.forEach((m)=>{
            const key = m.courtId !== undefined && m.courtId !== null ? String(m.courtId) : m.courtIndex !== undefined && m.courtIndex !== null ? `idx-${m.courtIndex}` : 'idx-0';
            if (!matchesByCourt[key]) matchesByCourt[key] = [];
            matchesByCourt[key].push({
                ...m
            }); // Create shallow copy to work with
        });
        const updates = [];
        Object.values(matchesByCourt).forEach((courtMatches)=>{
            // Ordenar por tiempo programado original
            courtMatches.sort((a, b)=>new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
            let lastEndTime = new Date(0);
            courtMatches.forEach((match)=>{
                if (match.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED && match.actualEndTime) {
                    lastEndTime = new Date(match.actualEndTime);
                } else if (match.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].LIVE && match.actualStartTime) {
                    const estimatedEnd = new Date(match.actualStartTime);
                    estimatedEnd.setMinutes(estimatedEnd.getMinutes() + 90);
                    lastEndTime = estimatedEnd;
                } else if (match.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].PENDING) {
                    const originalTime = new Date(match.scheduledTime);
                    const earliestStart = new Date(lastEndTime);
                    earliestStart.setMinutes(earliestStart.getMinutes() + bufferMinutes);
                    if (earliestStart > originalTime || lastEndTime.getTime() > 0 && earliestStart > originalTime) {
                        const newTime = earliestStart > originalTime ? earliestStart : originalTime;
                        if (Math.abs(newTime.getTime() - originalTime.getTime()) > 60000) {
                            match.scheduledTime = newTime;
                            updates.push({
                                id: match.id,
                                scheduledTime: newTime
                            });
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
     */ static generateBracket(advancingTeamsIndices, numCourts, matchDuration, buffer, startDate, startTime) {
        const numTeams = advancingTeamsIndices.length;
        if (numTeams < 2) return {
            matches: []
        };
        // Determinar el tamaño del cuadro (potencia de 2)
        const rounds = Math.ceil(Math.log2(numTeams));
        const bracketSize = Math.pow(2, rounds);
        const bracketMatches = [];
        let currentTime = new Date(startDate);
        const [h, m] = (startTime || "08:00").split(':').map(Number);
        currentTime.setHours(h, m, 0, 0);
        // Generar Primera Ronda con seeding estándar (distribución de llaves)
        const firstRoundMatchesCount = bracketSize / 2;
        // Función para generar el orden de seeding dinámicamente
        const getSeedingOrder = (size)=>{
            let seeds = [
                1,
                2
            ];
            while(seeds.length < size){
                let nextSeeds = [];
                for (let s of seeds){
                    nextSeeds.push(s);
                    nextSeeds.push(seeds.length * 2 + 1 - s);
                }
                seeds = nextSeeds;
            }
            return seeds;
        };
        const seedingOrder = getSeedingOrder(bracketSize);
        const pairs = [];
        for(let i = 0; i < firstRoundMatchesCount; i++){
            const s1 = seedingOrder[i * 2];
            const s2 = seedingOrder[i * 2 + 1];
            // Mapear semillas a índices de equipos (si existen)
            const team1 = advancingTeamsIndices[s1 - 1] !== undefined ? advancingTeamsIndices[s1 - 1] : -1;
            const team2 = advancingTeamsIndices[s2 - 1] !== undefined ? advancingTeamsIndices[s2 - 1] : -1;
            pairs.push({
                t1: team1,
                t2: team2
            });
        }
        const getRoundName = (matchesInRound)=>{
            if (matchesInRound === 1) return 'FINAL';
            if (matchesInRound === 2) return 'SEMIFINALES';
            if (matchesInRound === 4) return 'CUARTOS DE FINAL';
            if (matchesInRound === 8) return 'OCTAVOS DE FINAL';
            if (matchesInRound === 16) return '16VOS DE FINAL';
            if (matchesInRound === 32) return '32VOS DE FINAL';
            return `RONDA DE ${matchesInRound * 2}`;
        };
        let matchCounter = 0;
        for(let r = 1; r <= rounds; r++){
            const matchesInRound = Math.pow(2, rounds - r);
            const roundName = getRoundName(matchesInRound);
            for(let p = 1; p <= matchesInRound; p++){
                const isFirstRound = r === 1;
                const ord = matchCounter + 1;
                const match = {
                    id: `bracket-r${r}-p${p}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    team1Index: isFirstRound ? pairs[p - 1]?.t1 || -1 : -1,
                    team2Index: isFirstRound ? pairs[p - 1]?.t2 || -1 : -1,
                    status: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].PENDING,
                    stage: 'MAIN_DRAW',
                    roundName: roundName,
                    bracketPosition: {
                        round: r,
                        position: p
                    },
                    scheduledTime: new Date(currentTime),
                    courtIndex: matchCounter % numCourts,
                    match_number: ord,
                    matchNumber: ord,
                    order: ord,
                    orden: ord
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
        return {
            matches: bracketMatches
        };
    }
    /**
     * FORMATO CRUZADO
     * ─────────────────────────────────────────────────────────────────
     * 1. Divide N equipos en Grupo A y Grupo B (mitades iguales).
     * 2. Genera exactamente 2 partidos cruzados (A vs B) por equipo.
     * 3. Agenda los partidos en canchas con el slot de 85 minutos.
     * 4. Devuelve metadata de grupos y cuartos de final (4 partidos placeholders).
     * ─────────────────────────────────────────────────────────────────
     */ static generateCruzado(config) {
        const { numTeams, numCourts, clubHoursStart, clubHoursEnd, startDate, matchDurationMinutes = 85 } = config;
        if (numTeams < 4) {
            console.warn('[ScheduleEngine.Cruzado] Se necesitan al menos 4 equipos');
            return {
                crossMatches: [],
                qfMatches: [],
                groupA: [],
                groupB: [],
                groupAssignments: {}
            };
        }
        // ── 1. Dividir equipos en dos grupos ──────────────────────────
        const half = Math.floor(numTeams / 2);
        // Índices 1-based de equipos
        const groupA = Array.from({
            length: half
        }, (_, i)=>i + 1);
        const groupB = Array.from({
            length: numTeams - half
        }, (_, i)=>half + i + 1);
        // ── 2. Generar emparejamientos cruzados (2 por equipo) ─────────
        //   Algoritmo: round-robin entre A y B para asegurar que
        //   cada equipo juegue exactamente 2 veces contra el otro grupo.
        const crossPairings = this.generateCrossGroupPairings(groupA, groupB);
        // ── 3. Agendar en canchas (mismo algoritmo de SLOT_MINUTES) ────
        const slotMinutes = this.SLOT_MINUTES;
        const [startH, startM] = (clubHoursStart || '08:00').split(':').map(Number);
        const [endH, endM] = (clubHoursEnd || '22:00').split(':').map(Number);
        const clubOpen = new Date(startDate);
        clubOpen.setHours(startH, startM, 0, 0);
        const clubClose = new Date(startDate);
        clubClose.setHours(endH, endM, 0, 0);
        if (clubClose <= clubOpen) clubClose.setDate(clubClose.getDate() + 1);
        const courtNextTime = Array.from({
            length: numCourts
        }, ()=>new Date(clubOpen));
        const crossMatches = [];
        crossPairings.forEach((pair, idx)=>{
            // Elegir la cancha que tiene el próximo slot disponible más pronto
            let bestCourt = 0;
            for(let c = 1; c < numCourts; c++){
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
                status: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].PENDING,
                stage: 'GROUP_STAGE',
                groupName: 'CRUZADO',
                roundName: 'Fase Cruzada'
            });
            courtNextTime[bestCourt] = new Date(courtTime.getTime() + slotMinutes * 60000);
        });
        // ── 4. Cuartos de final placeholders (4 partidos TBD) ──────────
        // Se programan 85 min después del último partido de la fase cruzada
        const lastMatchTime = crossMatches.reduce((max, m)=>{
            const t = new Date(m.scheduledTime).getTime();
            return t > max ? t : max;
        }, clubOpen.getTime());
        const qfStart = new Date(lastMatchTime + slotMinutes * 60000);
        const qfMatches = [];
        for(let i = 0; i < 4; i++){
            qfMatches.push({
                id: `qf-${i}-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
                team1Index: -1,
                team2Index: -1,
                scheduledTime: new Date(qfStart.getTime() + Math.floor(i / numCourts) * slotMinutes * 60000),
                courtIndex: i % numCourts,
                status: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].PENDING,
                stage: 'MAIN_DRAW',
                roundName: 'CUARTOS DE FINAL',
                isQF: true
            });
        }
        const groupAssignments = {
            A: groupA.map(String),
            B: groupB.map(String)
        };
        return {
            crossMatches,
            qfMatches,
            groupA,
            groupB,
            groupAssignments
        };
    }
    /**
     * Para N_A equipos en A y N_B equipos en B, asigna exactamente 2 rivales
     * del otro grupo a cada equipo (usando round-robin bipartito).
     */ static generateCrossGroupPairings(groupA, groupB) {
        const pairings = [];
        const aLen = groupA.length;
        const bLen = groupB.length;
        // Cada equipo de A juega exactamente 2 veces contra B
        // Ronda 1: A[i] vs B[i % bLen]
        // Ronda 2: A[i] vs B[(i + 1) % bLen]
        for(let i = 0; i < aLen; i++){
            pairings.push([
                groupA[i],
                groupB[i % bLen]
            ]);
        }
        for(let i = 0; i < aLen; i++){
            pairings.push([
                groupA[i],
                groupB[(i + 1) % bLen]
            ]);
        }
        // Deduplicar si aLen === 1 ó bLen === 1
        const seen = new Set();
        return pairings.filter(([a, b])=>{
            const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
}
}),
"[project]/src/lib/groupQualifierHydration.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hydrateGroupQualifierSlots",
    ()=>hydrateGroupQualifierSlots,
    "knockoutHydrationDiffers",
    ()=>knockoutHydrationDiffers,
    "parseGroupQualifierLabel",
    ()=>parseGroupQualifierLabel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/tournament.ts [app-ssr] (ecmascript)");
;
function fullName(p) {
    if (!p) return '';
    return [
        p.name,
        p.lastName
    ].filter(Boolean).join(' ').trim() || (typeof p.name === 'string' ? p.name : '') || '';
}
function resolveH2H(teamA, teamB, matchesInGroup) {
    const h2h = matchesInGroup.filter((m)=>m.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED && (m.team1Index === teamA.tNum && m.team2Index === teamB.tNum || m.team1Index === teamB.tNum && m.team2Index === teamA.tNum));
    let wA = 0;
    let wB = 0;
    for (const m of h2h){
        const g1 = m.games?.t1 ?? 0;
        const g2 = m.games?.t2 ?? 0;
        if (m.team1Index === teamA.tNum) {
            if (g1 > g2) wA++;
            else wB++;
        } else {
            if (g2 > g1) wA++;
            else wB++;
        }
    }
    return wB - wA;
}
function sortStandings(teams, matchesInGroup) {
    return [
        ...teams
    ].sort((a, b)=>{
        if (b.Pts !== a.Pts) return b.Pts - a.Pts;
        const diffA = a.JF - a.JC;
        const diffB = b.JF - b.JC;
        if (diffB !== diffA) return diffB - diffA;
        return resolveH2H(a, b, matchesInGroup);
    });
}
function parseGroupQualifierLabel(text) {
    if (!text || typeof text !== 'string') return null;
    const t = text.trim();
    const m1 = t.match(/(\d+)\s*[°ºª]?\s*Grupo\s*([A-Za-z])\b/i);
    if (m1) return {
        rank: parseInt(m1[1], 10),
        letter: m1[2].toUpperCase()
    };
    if (/por\s+definir|definir/i.test(t)) {
        const m2 = t.match(/\(?\s*(\d+)\s*[°ºª]?\s*([A-Za-z])\s*\)?/);
        if (m2) return {
            rank: parseInt(m2[1], 10),
            letter: m2[2].toUpperCase()
        };
    }
    return null;
}
function buildLetterToGroupKey(assignments) {
    const keys = Object.keys(assignments).sort();
    const map = {};
    keys.forEach((k, i)=>{
        map[String.fromCharCode(65 + i)] = k;
    });
    return map;
}
function teamDisplayName(team, fallbackTNum) {
    const p1 = fullName(team?.p1)?.trim() || team?.p1Name || '';
    const p2 = fullName(team?.p2)?.trim() || team?.p2Name || '';
    if (p1 && p2) return `${p1} / ${p2}`;
    if (p1 || p2) return p1 || p2;
    return team?.name || `Pareja ${fallbackTNum}`;
}
/**
 * Si todos los partidos de grupo entre equipos de `groupKey` están finalizados,
 * devuelve la tabla ordenada (índice 0 = 1º del grupo). Si no, null.
 */ function computeSortedGroup(tournament, matches, groupKey) {
    const assignments = tournament?.groupAssignments?.[groupKey];
    if (!assignments?.length) return null;
    const teamsList = tournament?.teams ?? [];
    const teamIds = assignments;
    if (teamIds.some((tid)=>teamsList.findIndex((t)=>String(t?.id) === String(tid)) < 0)) {
        return null;
    }
    const tNums = teamIds.map((tid)=>{
        const idx = teamsList.findIndex((t)=>String(t?.id) === String(tid));
        return idx + 1;
    });
    if (tNums.length === 0) return null;
    const intraMatches = matches.filter((m)=>m.stage === 'GROUP_STAGE' && tNums.includes(m.team1Index) && tNums.includes(m.team2Index));
    if (intraMatches.length === 0) return null;
    if (!intraMatches.every((m)=>m.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED)) return null;
    const rows = teamIds.map((tid)=>{
        const teamIdx = teamsList.findIndex((t)=>String(t?.id) === String(tid));
        const tNum = teamIdx + 1;
        const team = teamsList[teamIdx];
        let PJ = 0;
        let PG = 0;
        let JF = 0;
        let JC = 0;
        intraMatches.filter((m)=>m.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED && (m.team1Index === tNum || m.team2Index === tNum)).forEach((m)=>{
            const side = m.team1Index === tNum ? 't1' : 't2';
            const opp = side === 't1' ? 't2' : 't1';
            PJ++;
            JF += m.games?.[side] ?? 0;
            JC += m.games?.[opp] ?? 0;
            const sWon = m.sets?.[side] ?? 0;
            const sLost = m.sets?.[opp] ?? 0;
            const gWon = m.games?.[side] ?? 0;
            const gLost = m.games?.[opp] ?? 0;
            if (sWon > sLost || sWon === sLost && gWon > gLost) PG++;
        });
        const name = teamDisplayName(team, tNum);
        return {
            id: String(tid),
            name,
            tNum,
            PJ,
            PG,
            JF,
            JC,
            Pts: PG * 3
        };
    });
    return sortStandings(rows, intraMatches);
}
function labelFromSide(match, side) {
    const team = side === 1 ? match.team1 : match.team2;
    const nm = side === 1 ? match.team1Name : match.team2Name;
    if (team?.teamLabel && typeof team.teamLabel === 'string') return team.teamLabel;
    if (typeof nm === 'string') return nm;
    return '';
}
function cloneTeamForMatch(tournament, tNum) {
    const teamsList = tournament?.teams ?? [];
    const raw = teamsList[tNum - 1];
    if (!raw || typeof raw !== 'object') return null;
    const copy = {
        ...raw
    };
    delete copy.isTBD;
    delete copy.teamLabel;
    return copy;
}
function hydrateSide(match, side, rankingsByLetter, tournament) {
    const team = side === 1 ? match.team1 : match.team2;
    const labelText = labelFromSide(match, side);
    const parsed = parseGroupQualifierLabel(labelText);
    if (!parsed) return match;
    const ranked = rankingsByLetter[parsed.letter];
    if (!ranked || ranked.length === 0) return match;
    const placeIdx = parsed.rank - 1;
    if (placeIdx < 0 || placeIdx >= ranked.length) return match;
    const winner = ranked[placeIdx];
    const hydrated = cloneTeamForMatch(tournament, winner.tNum);
    if (!hydrated) return match;
    const idx = Number(side === 1 ? match.team1Index : match.team2Index);
    const already = !team?.isTBD && idx === winner.tNum;
    if (already) return match;
    const display = winner.name || teamDisplayName(hydrated, winner.tNum);
    if (side === 1) {
        return {
            ...match,
            team1: hydrated,
            team1Index: winner.tNum,
            team1Name: display
        };
    }
    return {
        ...match,
        team2: hydrated,
        team2Index: winner.tNum,
        team2Name: display
    };
}
function knockoutHydrationDiffers(before, after) {
    if (!before || !after || String(before.id) !== String(after.id)) return false;
    if (Number(before.team1Index ?? 0) !== Number(after.team1Index ?? 0)) return true;
    if (Number(before.team2Index ?? 0) !== Number(after.team2Index ?? 0)) return true;
    if (String(before.team1Name ?? '') !== String(after.team1Name ?? '')) return true;
    if (String(before.team2Name ?? '') !== String(after.team2Name ?? '')) return true;
    if (!!before.team1?.isTBD !== !!after.team1?.isTBD) return true;
    if (!!before.team2?.isTBD !== !!after.team2?.isTBD) return true;
    if (String(before.team1?.teamLabel ?? '') !== String(after.team1?.teamLabel ?? '')) return true;
    if (String(before.team2?.teamLabel ?? '') !== String(after.team2?.teamLabel ?? '')) return true;
    return false;
}
function hydrateGroupQualifierSlots(matches, tournament) {
    if (!tournament?.groupAssignments || !Array.isArray(matches)) return matches;
    const letterToKey = buildLetterToGroupKey(tournament.groupAssignments);
    const rankingsByLetter = {};
    for (const letter of Object.keys(letterToKey)){
        const gKey = letterToKey[letter];
        rankingsByLetter[letter] = computeSortedGroup(tournament, matches, gKey);
    }
    return matches.map((m)=>{
        if (m.stage === 'GROUP_STAGE') return m;
        let next = m;
        next = hydrateSide(next, 1, rankingsByLetter, tournament);
        next = hydrateSide(next, 2, rankingsByLetter, tournament);
        return next;
    });
}
}),
"[project]/src/lib/knockoutWinnerHydration.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hydrateFinalFromFinishedSemifinals",
    ()=>hydrateFinalFromFinishedSemifinals,
    "isKnockoutSemifinal",
    ()=>isKnockoutSemifinal,
    "isMainDrawFinal",
    ()=>isMainDrawFinal,
    "winnerSlotFromFinishedMatch",
    ()=>winnerSlotFromFinishedMatch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/tournament.ts [app-ssr] (ecmascript)");
;
function roundUpper(x) {
    return String(x?.roundName || '').toUpperCase();
}
function isConsolation(x) {
    return roundUpper(x).includes('CONSOL');
}
function isKnockoutSemifinal(x) {
    return roundUpper(x).includes('SEMIFINAL') || x?.stage === 'SEMIFINAL';
}
function isMainDrawFinal(x) {
    if (!x || isConsolation(x)) return false;
    const u = roundUpper(x);
    if (x.stage === 'FINAL') return true;
    if (u === 'FINAL') return true;
    if (u.includes('FINAL') && !u.includes('SEMIFINAL')) return true;
    if (x.isFinal === true) return true;
    return false;
}
function mainSemifinals(matches) {
    return matches.filter((m)=>isKnockoutSemifinal(m) && !isConsolation(m)).sort((a, b)=>{
        const ta = new Date(a.scheduledTime || a.time || 0).getTime();
        const tb = new Date(b.scheduledTime || b.time || 0).getTime();
        if (ta !== tb) return ta - tb;
        return String(a.id || '').localeCompare(String(b.id || ''));
    });
}
function fullName(p) {
    if (!p) return '';
    return [
        p.name,
        p.lastName
    ].filter(Boolean).join(' ').trim() || (typeof p.name === 'string' ? p.name : '') || '';
}
function displayLine(team, fallbackName, idx) {
    const p1 = fullName(team?.p1)?.trim() || team?.p1Name || '';
    const p2 = fullName(team?.p2)?.trim() || team?.p2Name || '';
    if (p1 && p2) return `${p1} / ${p2}`;
    if (p1 || p2) return p1 || p2;
    if (typeof team?.name === 'string' && team.name.trim()) return team.name.trim();
    const fb = (fallbackName || '').trim();
    if (fb) return fb;
    return `Pareja ${idx}`;
}
function winnerSlotFromFinishedMatch(finishedMatch, tournament) {
    if (!finishedMatch || finishedMatch.status !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED) return null;
    const t1 = Number(finishedMatch.sets?.t1 ?? 0);
    const t2 = Number(finishedMatch.sets?.t2 ?? 0);
    if (t1 === t2) return null;
    const win1 = t1 > t2;
    const idx = Number(win1 ? finishedMatch.team1Index : finishedMatch.team2Index);
    if (!Number.isFinite(idx) || idx < 1) return null;
    const raw = win1 ? finishedMatch.team1 : finishedMatch.team2;
    const nameFallback = win1 ? finishedMatch.team1Name : finishedMatch.team2Name;
    const teamsList = tournament?.teams ?? [];
    const fromT = teamsList[idx - 1];
    let team;
    if (fromT && typeof fromT === 'object') {
        team = {
            ...fromT
        };
        delete team.isTBD;
        delete team.teamLabel;
    } else if (raw && typeof raw === 'object') {
        team = {
            ...raw
        };
        delete team.isTBD;
        delete team.teamLabel;
    } else {
        const parts = (nameFallback || '').split(/\s*\/\s*/);
        team = {
            p1: {
                name: (parts[0] || '').trim() || `J${idx * 2 - 1}`
            },
            p2: {
                name: (parts[1] || '').trim() || ''
            }
        };
    }
    const name = displayLine(team, nameFallback, idx);
    return {
        idx,
        team,
        name
    };
}
function hydrateFinalFromFinishedSemifinals(matches, tournament) {
    if (!Array.isArray(matches) || matches.length === 0) return matches;
    const semis = mainSemifinals(matches);
    if (semis.length === 0) return matches;
    return matches.map((m)=>{
        if (!isMainDrawFinal(m)) return m;
        let next = {
            ...m
        };
        const s0 = semis[0];
        const s1 = semis[1];
        if (s0?.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED) {
            const w = winnerSlotFromFinishedMatch(s0, tournament);
            if (w) {
                next = {
                    ...next,
                    team1Index: w.idx,
                    team1: w.team,
                    team1Name: w.name
                };
            }
        }
        if (s1?.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED) {
            const w = winnerSlotFromFinishedMatch(s1, tournament);
            if (w) {
                next = {
                    ...next,
                    team2Index: w.idx,
                    team2: w.team,
                    team2Name: w.name
                };
            }
        }
        return next;
    });
}
}),
"[project]/src/lib/matchFinishPropagation.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeMatchesAfterMatchFinish",
    ()=>computeMatchesAfterMatchFinish,
    "persistMatchFinishWithPropagation",
    ()=>persistMatchFinishWithPropagation,
    "shouldSuggestAutoMainDraw",
    ()=>shouldSuggestAutoMainDraw,
    "stripMatchForPersistence",
    ()=>stripMatchForPersistence,
    "syncGroupQualifierSlotsToDatabaseIfNeeded",
    ()=>syncGroupQualifierSlotsToDatabaseIfNeeded
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/tournament.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$ScheduleEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/ScheduleEngine.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$groupQualifierHydration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/groupQualifierHydration.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$knockoutWinnerHydration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/knockoutWinnerHydration.ts [app-ssr] (ecmascript)");
;
;
;
;
;
function stripMatchForPersistence(m) {
    if (!m || typeof m !== 'object') return m;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, tournament_id: _tid, ...rest } = m;
    return rest;
}
function computeMatchesAfterMatchFinish(matches, matchId, bufferMinutes, tournament) {
    const finishedMatch = matches.find((m)=>m.id === matchId);
    if (!finishedMatch) return matches;
    const finalScore = finishedMatch.score || (finishedMatch.sets ? `${finishedMatch.sets.t1}-${finishedMatch.sets.t2}` : '0-0');
    const t1 = Number(finishedMatch.sets?.t1 ?? 0);
    const t2 = Number(finishedMatch.sets?.t2 ?? 0);
    const winnerIndex = finishedMatch.sets && t1 > t2 ? finishedMatch.team1Index : finishedMatch.team2Index;
    let updatedMatches = matches.map((m)=>{
        if (m.id === matchId) {
            return {
                ...m,
                status: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED,
                score: finalScore
            };
        }
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
    if (tournament) {
        updatedMatches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$groupQualifierHydration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hydrateGroupQualifierSlots"])(updatedMatches, tournament);
    }
    updatedMatches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$knockoutWinnerHydration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hydrateFinalFromFinishedSemifinals"])(updatedMatches, tournament);
    const autocorrected = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$ScheduleEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ScheduleEngine"].recalculateRemainingMatches(updatedMatches, bufferMinutes);
    return updatedMatches.map((m)=>{
        const update = autocorrected.find((u)=>u.id === m.id);
        return update ? {
            ...m,
            scheduledTime: update.scheduledTime
        } : m;
    });
}
async function syncGroupQualifierSlotsToDatabaseIfNeeded(params) {
    const { tournamentId, tournament, rawMatches, updateMatch } = params;
    if (!Array.isArray(rawMatches) || rawMatches.length === 0) return;
    let hydrated = rawMatches.map((m)=>({
            ...m
        }));
    if (tournament?.groupAssignments && Object.keys(tournament.groupAssignments).length > 0) {
        hydrated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$groupQualifierHydration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hydrateGroupQualifierSlots"])(hydrated, tournament);
    }
    hydrated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$knockoutWinnerHydration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hydrateFinalFromFinishedSemifinals"])(hydrated, tournament);
    for (const after of hydrated){
        const before = rawMatches.find((r)=>String(r?.id) === String(after?.id));
        if (!before || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$groupQualifierHydration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["knockoutHydrationDiffers"])(before, after)) continue;
        try {
            await updateMatch(tournamentId, after.id, {
                ...stripMatchForPersistence(after),
                scheduledTime: after.scheduledTime
            });
        } catch (e) {
            console.warn('[syncGroupQualifierSlots]', after?.id, e);
        }
    }
}
async function persistMatchFinishWithPropagation(params) {
    const { tournamentId, bufferMinutes, matches, matchId, updateMatch, tournament } = params;
    const finalMatches = computeMatchesAfterMatchFinish(matches, matchId, bufferMinutes, tournament);
    const finished = finalMatches.find((m)=>m.id === matchId);
    if (!finished) {
        throw new Error(`[persistMatchFinishWithPropagation] Partido no encontrado: ${matchId}`);
    }
    await updateMatch(tournamentId, matchId, stripMatchForPersistence(finished));
    const stripFinished = stripMatchForPersistence(finished);
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].finalizarPartidoYLiberarCanchaRpc({
            tournamentId,
            matchId,
            canchaId: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].courtToPizarraCanchaId(finished),
            finalData: stripFinished
        });
    } catch (e) {
        console.warn('[persistMatchFinishWithPropagation] RPC finalizar_partido_y_liberar_cancha (¿migración 023 aplicada?):', e);
    }
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].clearPizarraCanchaForMatch(tournamentId, matchId);
    } catch (e) {
        console.warn('[persistMatchFinishWithPropagation] Limpieza pizarra_cancha_state:', e);
    }
    const others = finalMatches.filter((m)=>m.id !== matchId);
    const settled = await Promise.allSettled(others.map((m)=>updateMatch(tournamentId, m.id, {
            ...stripMatchForPersistence(m),
            scheduledTime: m.scheduledTime
        })));
    settled.forEach((r, i)=>{
        if (r.status === 'rejected') {
            console.warn('[persistMatchFinishWithPropagation] Fallo al actualizar partido derivado:', others[i]?.id, r.reason);
        }
    });
    return {
        finalMatches
    };
}
function shouldSuggestAutoMainDraw(isRoundRobin, finalMatches, finishedMatchStage) {
    const hasBracketNow = finalMatches.some((m)=>m.stage === 'MAIN_DRAW');
    const groupMatches = finalMatches.filter((m)=>m.stage === 'GROUP_STAGE');
    const allGroupsFinished = groupMatches.length > 0 && groupMatches.every((m)=>m.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED);
    return isRoundRobin && !hasBracketNow && finishedMatchStage === 'GROUP_STAGE' && allGroupsFinished;
}
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/dns [external] (dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("dns", () => require("dns"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/src/lib/firebase.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "app",
    ()=>app,
    "auth",
    ()=>auth,
    "db",
    ()=>db,
    "firebaseConfig",
    ()=>firebaseConfig,
    "googleProvider",
    ()=>googleProvider,
    "storage",
    ()=>storage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$app$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/app/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/node-esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.node.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$storage$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/storage/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$storage$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/storage/dist/node-esm/index.node.esm.js [app-ssr] (ecmascript)");
;
;
;
;
// Realtime Database logic
const databaseUrl = ("TURBOPACK compile-time value", "https://padel-score-pro-777-default-rtdb.firebaseio.com")?.trim();
let databaseURL = undefined;
if (databaseUrl) {
    // Si es una URL de consola, intentamos extraer la base o usar el default de Firebase
    if (databaseUrl.includes('console.firebase.google.com')) {
        databaseURL = `https://padel-score-pro-777-default-rtdb.firebaseio.com`;
    } else {
        databaseURL = databaseUrl;
    }
}
const firebaseConfig = {
    apiKey: ("TURBOPACK compile-time value", "AIzaSyAExkCMW5KYOMBO-7tW_fuWd6rCZYlC-c0"),
    authDomain: ("TURBOPACK compile-time value", "padel-score-pro-777.firebaseapp.com"),
    projectId: ("TURBOPACK compile-time value", "padel-score-pro-777"),
    storageBucket: ("TURBOPACK compile-time value", "padel-score-pro-777.firebasestorage.app"),
    messagingSenderId: ("TURBOPACK compile-time value", "725028600303"),
    appId: ("TURBOPACK compile-time value", "1:725028600303:web:11052e1fff30c047051e1a"),
    databaseURL
};
// Validate essential config — en cliente avisamos si faltan, en servidor toleramos para no romper build
const hasConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
let app = null;
try {
    if (hasConfig) {
        app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getApps"])().length > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getApp"])() : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initializeApp"])(firebaseConfig);
    }
} catch (e) {
    // No lanzar: así la app carga y el usuario ve login/errores en vez de pantalla en blanco.
    console.error("Firebase init failed (app cargará sin auth):", e);
    app = null;
}
let auth;
let db;
let storage;
const googleProvider = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GoogleAuthProvider"]();
if (app) {
    auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAuth"])(app);
    db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFirestore"])(app);
    storage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$storage$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStorage"])(app);
} else {
    // Stubs mínimos para evitar crashes en build/SSR; en runtime real no deberían usarse.
    auth = undefined;
    db = undefined;
    storage = undefined;
}
;
}),
"[project]/src/lib/rtdb.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "rtdb",
    ()=>rtdb
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$database$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/database/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/database/dist/node-esm/index.node.esm.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-ssr] (ecmascript)");
;
;
let _rtdb = null;
if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["app"] && __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["firebaseConfig"].databaseURL) {
    try {
        _rtdb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDatabase"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["app"]);
    } catch (e) {
        console.warn('[rtdb] Failed to initialize Realtime Database:', e);
        _rtdb = null;
    }
}
const rtdb = _rtdb;
}),
"[project]/src/components/RefereeRemoteControl.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RefereeRemoteControl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bluetooth$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bluetooth$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bluetooth.js [app-ssr] (ecmascript) <export default as Bluetooth>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bluetooth$2d$connected$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BluetoothConnected$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bluetooth-connected.js [app-ssr] (ecmascript) <export default as BluetoothConnected>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-ssr] (ecmascript) <export default as Zap>");
'use client';
;
;
;
;
function RefereeRemoteControl({ onTeamAPoint, onTeamBPoint, onUndo }) {
    const [isListening, setIsListening] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [btConnected, setBtConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [lastAction, setLastAction] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showStatus, setShowStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Keyboard HID Support
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleKeyDown = (e)=>{
            if (!isListening) return;
            const key = e.key.toUpperCase();
            if (key === '1' || key === 'A') {
                onTeamAPoint();
                triggerActionFeedback('Team A +1 Point');
            } else if (key === '2' || key === 'B') {
                onTeamBPoint();
                triggerActionFeedback('Team B +1 Point');
            } else if (key === '3' || key === 'C') {
                if (onUndo) {
                    onUndo();
                    triggerActionFeedback('Undo Action');
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return ()=>window.removeEventListener('keydown', handleKeyDown);
    }, [
        isListening,
        onTeamAPoint,
        onTeamBPoint,
        onUndo
    ]);
    const triggerActionFeedback = (action)=>{
        setLastAction(action);
        setTimeout(()=>setLastAction(null), 1500);
    };
    // Web Bluetooth API (Simulación / Estructura)
    const connectBluetooth = async ()=>{
        try {
            // Nota: navigator.bluetooth solo funciona en HTTPS y Chrome/Edge
            if (!('bluetooth' in navigator)) {
                alert('Web Bluetooth no está soportado en este navegador.');
                return;
            }
            // Aquí se buscaría un dispositivo específico o genérico de padel
            // const device = await (navigator as any).bluetooth.requestDevice({
            //     acceptAllDevices: true,
            //     optionalServices: ['battery_service']
            // });
            // console.log("Dispositivo vinculado:", device.name);
            setBtConnected(true);
            triggerActionFeedback('Remote Linked');
        } catch (error) {
            console.error("Error Bluetooth:", error);
            setBtConnected(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                whileHover: {
                    scale: 1.05
                },
                whileTap: {
                    scale: 0.95
                },
                onClick: ()=>connectBluetooth(),
                className: `h-12 flex items-center gap-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${btConnected ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:border-white/20'}`,
                children: [
                    btConnected ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bluetooth$2d$connected$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BluetoothConnected$3e$__["BluetoothConnected"], {
                        className: "w-4 h-4"
                    }, void 0, false, {
                        fileName: "[project]/src/components/RefereeRemoteControl.tsx",
                        lineNumber: 91,
                        columnNumber: 32
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bluetooth$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bluetooth$3e$__["Bluetooth"], {
                        className: "w-4 h-4"
                    }, void 0, false, {
                        fileName: "[project]/src/components/RefereeRemoteControl.tsx",
                        lineNumber: 91,
                        columnNumber: 77
                    }, this),
                    btConnected ? 'Remote Active' : 'Link Remote'
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/RefereeRemoteControl.tsx",
                lineNumber: 82,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: lastAction && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        x: -20,
                        scale: 0.9
                    },
                    animate: {
                        opacity: 1,
                        x: 0,
                        scale: 1
                    },
                    exit: {
                        opacity: 0,
                        scale: 1.1
                    },
                    className: "bg-padel-primary text-black px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2 shadow-[0_10px_30px_rgba(204,255,0,0.2)] border-b-2 border-black/10",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                            className: "w-3.5 h-3.5 fill-current"
                        }, void 0, false, {
                            fileName: "[project]/src/components/RefereeRemoteControl.tsx",
                            lineNumber: 103,
                            columnNumber: 25
                        }, this),
                        lastAction
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/RefereeRemoteControl.tsx",
                    lineNumber: 97,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/RefereeRemoteControl.tsx",
                lineNumber: 95,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/RefereeRemoteControl.tsx",
        lineNumber: 81,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/components/AutoShrinkName.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
const AutoShrinkName = ({ name, className = '', style: customStyle })=>{
    const [scale, setScale] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const textRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const resizeText = ()=>{
            if (containerRef.current && textRef.current) {
                // Margen de seguridad para evitar corte visual de la última letra
                const horizontalSafePadding = 4;
                const containerWidth = Math.max(0, containerRef.current.offsetWidth - horizontalSafePadding);
                const textWidth = textRef.current.scrollWidth + 2;
                if (textWidth > containerWidth) {
                    const ratio = containerWidth / textWidth;
                    setScale(Math.max(ratio, 0.5));
                } else {
                    setScale(1);
                }
            }
        };
        resizeText();
        window.addEventListener('resize', resizeText);
        const el = containerRef.current;
        const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(()=>resizeText()) : null;
        if (el && ro) ro.observe(el);
        return ()=>{
            window.removeEventListener('resize', resizeText);
            ro?.disconnect();
        };
    }, [
        name
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: `w-full overflow-hidden whitespace-nowrap ${className}`,
        style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingInline: '2px'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            ref: textRef,
            style: {
                display: 'inline-block',
                transformOrigin: 'center center',
                transform: `scale(${scale})`,
                transition: 'transform 0.1s ease-out',
                ...customStyle
            },
            children: name
        }, void 0, false, {
            fileName: "[project]/src/components/AutoShrinkName.tsx",
            lineNumber: 50,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/AutoShrinkName.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = AutoShrinkName;
}),
"[project]/src/lib/matchFinishGuards.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "shouldAutoFinishBySetsReferee",
    ()=>shouldAutoFinishBySetsReferee
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchScoringRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/matchScoringRules.ts [app-ssr] (ecmascript)");
;
function shouldAutoFinishBySetsReferee(match, tournament) {
    if (!match) return false;
    const s = String(match?.status || '').trim().toUpperCase();
    if (s === 'FINISHED' || s === 'FINALIZADO' || s === 'COMPLETE' || s === 'COMPLETED') return false;
    const rules = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchScoringRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getScoringRules"])(match?.matchFormat || match?.match_format || tournament?.rrMatchFormat || tournament?.matchFormat, match?.tieBreakType || tournament?.tieBreakType);
    let need = rules.setsToWinMatch;
    const needRaw = Number(match?.sets_to_win_match ?? match?.setsToWinMatch);
    if (Number.isFinite(needRaw) && needRaw >= 1) need = needRaw;
    const t1 = Number(match?.sets?.t1 ?? 0);
    const t2 = Number(match?.sets?.t2 ?? 0);
    if (t1 < need && t2 < need) return false;
    if (rules.usesSuperTiebreakDecider && t1 === 1 && t2 === 1 && !match.superTiebreak) return false;
    return true;
}
}),
"[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RefereeScoreboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-ssr] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-ssr] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/monitor.js [app-ssr] (ecmascript) <export default as Monitor>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/minus.js [app-ssr] (ecmascript) <export default as Minus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-ssr] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-ssr] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-ssr] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-ssr] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-ssr] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-ssr] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$useRouteSegment$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/useRouteSegment.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchFinishPropagation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/matchFinishPropagation.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/apiAuth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rtdb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rtdb.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$database$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/database/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/database/dist/node-esm/index.node.esm.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/tournament.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RefereeRemoteControl$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/RefereeRemoteControl.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$AutoShrinkName$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/AutoShrinkName.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchScoringRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/matchScoringRules.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchFinishGuards$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/matchFinishGuards.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function RefereeScoreboard() {
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$useRouteSegment$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouteSegment"])('id');
    const matchId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$useRouteSegment$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouteSegment"])('matchId');
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { user, profile, isAdmin, canMarkInCancha, loading: authLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const [tournament, setTournament] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [match, setMatch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [showMatchSelector, setShowMatchSelector] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showAdjustModal, setShowAdjustModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showNameModal, setShowNameModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [nameDraft, setNameDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        t1p1: '',
        t1p2: '',
        t2p1: '',
        t2p2: ''
    });
    const [swappingCourtWith, setSwappingCourtWith] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    /** Número de pista destino mientras aplica traslado atómico (pista libre). */ const [courtMoveBusy, setCourtMoveBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    /** Pista ≥1 para pizarra y hub. `court: 0` en BD hacía matchCourt=0 → `if (!matchCourt)` cortaba la sync a pizarra_cancha_state y el hub no veía en_vivo/partido_id. */ const matchCourt = (()=>{
        const raw = match?.court ?? (match?.courtIndex != null ? match.courtIndex + 1 : undefined);
        const n = Number(raw);
        if (Number.isFinite(n) && n >= 1) return n;
        return 1;
    })();
    const impliedCourtCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!tournament) return Math.max(6, matchCourt);
        const names = tournament.courtNames;
        if (Array.isArray(names) && names.length > 0) return Math.min(48, names.length);
        const nc = Number(tournament.numCourts);
        if (Number.isFinite(nc) && nc > 0) return Math.min(48, nc);
        let max = 0;
        for (const m of tournament.matches || []){
            const c = Number(m?.court ?? (m?.courtIndex != null ? m.courtIndex + 1 : 0));
            if (c > max) max = c;
        }
        return Math.max(max, matchCourt, 4);
    }, [
        tournament,
        matchCourt
    ]);
    /** Pistas sin partido LIVE ajeno (vacantes para traslado). */ const vacantCourts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!tournament?.matches || !match?.id) return [];
        const occupied = new Set();
        for (const m of tournament.matches){
            if (m.id === match.id) continue;
            if (String(m.status || '').toUpperCase() !== 'LIVE') continue;
            const c = Number(m?.court ?? (m?.courtIndex != null ? m.courtIndex + 1 : 0));
            if (c > 0) occupied.add(c);
        }
        const list = [];
        for(let c = 1; c <= impliedCourtCount; c++){
            if (c === matchCourt) continue;
            if (occupied.has(c)) continue;
            list.push(c);
        }
        return list;
    }, [
        tournament?.matches,
        match?.id,
        matchCourt,
        impliedCourtCount
    ]);
    /** Misma puerta que `/marker/[canchaId]`: admin, dueño del torneo, o `canMarkInCancha` (en Auth incluye usuario autenticado). */ const canControl = !!user && (isAdmin || tournament?.ownerId === user?.uid || canMarkInCancha(`cancha_${matchCourt}`));
    const primaryColor = tournament?.broadcastingSettings?.primaryColor || '#ccff00';
    const [history, setHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [duration, setDuration] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isGoldenPoint, setIsGoldenPoint] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isMedicalTimeout, setIsMedicalTimeout] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [medicalTimeRemaining, setMedicalTimeRemaining] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(180); // 3 minutes
    const [showSideChange, setShowSideChange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    /** Objetivo puntos solo para super tie-break (modal / torneo). El tie-break de set siempre es a 7 con margen 2. */ const [superTiebreakTarget, setSuperTiebreakTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(10);
    const [finishClicks, setFinishClicks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [now, setNow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Date());
    const [animacionesMarcador, setAnimacionesMarcador] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [sideChangeAnimations, setSideChangeAnimations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const timer = setInterval(()=>setNow(new Date()), 1000);
        return ()=>clearInterval(timer);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getAnimations().then((rows)=>{
            const map = {};
            (rows || []).forEach((r)=>{
                map[r.id || r.name] = {
                    nombre: r.name || r.nombre || '',
                    url: r.url || ''
                };
            });
            setAnimacionesMarcador(map);
        }).catch(()=>setAnimacionesMarcador({}));
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getAnimations('SIDE_CHANGE').then(setSideChangeAnimations).catch((err)=>console.error('Error fetching SIDE_CHANGE animations:', err));
    }, []);
    /** Primeras 12 animaciones (orden estable) para pads 1–12: 1–6 equipo 1, 7–12 equipo 2. */ const padsAnimaciones = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const entries = Object.entries(animacionesMarcador);
        return entries.sort((a, b)=>a[0].localeCompare(b[0])).slice(0, 12);
    }, [
        animacionesMarcador
    ]);
    const matchFormatForRules = match?.matchFormat || match?.match_format || tournament?.rrMatchFormat || tournament?.matchFormat;
    const scoringRules = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchScoringRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getScoringRules"])(matchFormatForRules, tournament?.tieBreakType), [
        matchFormatForRules,
        tournament?.tieBreakType
    ]);
    const handleFinishMatch = async ()=>{
        if (finishClicks < 2) {
            setFinishClicks((prev)=>prev + 1);
            setTimeout(()=>setFinishClicks(0), 3000); // Reset after 3s of inactivity
            return;
        }
        if (!tournament || !match) return;
        const endIso = new Date().toISOString();
        const finishPatch = {
            status: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED,
            finishedAt: endIso,
            actualEndTime: endIso,
            sets: match.sets,
            games: match.games,
            points: match.points,
            setScores: match.setScores,
            superTiebreakScore: match.superTiebreakScore,
            isTiebreak: match.isTiebreak,
            superTiebreak: match.superTiebreak,
            server: match.server
        };
        try {
            const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getMatches(id);
            const merged = rows.map((r)=>r.id === match.id ? {
                    ...r,
                    ...finishPatch
                } : r);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchFinishPropagation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["persistMatchFinishWithPropagation"])({
                tournamentId: id,
                bufferMinutes: tournament?.bufferMinutes ?? 15,
                matches: merged,
                matchId: match.id,
                updateMatch: (tid, mid, d)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(tid, mid, d),
                tournament
            });
        } catch (e) {
            console.error('[Score] handleFinishMatch:', e);
            alert('Error al finalizar el partido. Revisa la conexión e inténtalo de nuevo.');
            return;
        }
        // Liberar la pizarra: si queda en_vivo + partido_id, el hub sigue excluyendo la cola "Por comenzar"
        try {
            const canchaId = `cancha_${matchCourt}`;
            const cur = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getPizarraCanchaState(canchaId);
            const pdata = cur?.data || {};
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].setPizarraCanchaState(canchaId, {
                ...pdata,
                estado: 'finalizado',
                torneo_id: id,
                partido_id: null,
                active_match_id: null,
                pizarra_refresh_nonce: (Number(pdata.pizarra_refresh_nonce) || 0) + 1
            });
        } catch (e) {
            console.warn('[Score] handleFinishMatch pizarra cleanup:', e);
        }
        router.push(`/tournaments/${id}?tab=finalizados`);
    };
    const updateManualScore = async (side, field, value)=>{
        if (!tournament || !match) return;
        const nextField = {
            ...match[field] && typeof match[field] === 'object' ? match[field] : {},
            [side]: field === 'points' ? value : Math.max(0, value)
        };
        const patch = {
            [field]: nextField
        };
        if (field === 'sets') {
            const prospective = {
                ...match,
                ...patch,
                matchFormat: match.matchFormat || match.match_format || tournament?.rrMatchFormat
            };
            const st = String(match.status || '').toUpperCase();
            const liveLike = st === 'LIVE' || st === 'IN_PROGRESS' || st === 'PAUSED' || st === 'STARTED' || st === 'WARM_UP';
            if (liveLike && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchFinishGuards$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shouldAutoFinishBySetsReferee"])(prospective, tournament)) {
                const endIso = new Date().toISOString();
                patch.status = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED;
                patch.finishedAt = endIso;
                patch.actualEndTime = endIso;
                patch.superTiebreak = false;
                patch.isTiebreak = false;
                setMatch((prev)=>prev ? {
                        ...prev,
                        ...patch
                    } : prev);
                try {
                    const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getMatches(id);
                    const merged = rows.map((r)=>r.id === match.id ? {
                            ...r,
                            ...patch
                        } : r);
                    const { finalMatches } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchFinishPropagation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["persistMatchFinishWithPropagation"])({
                        tournamentId: id,
                        bufferMinutes: tournament?.bufferMinutes ?? 15,
                        matches: merged,
                        matchId: match.id,
                        updateMatch: (tid, mid, d)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(tid, mid, d),
                        tournament
                    });
                    const closed = finalMatches.find((m)=>m.id === match.id);
                    if (closed) {
                        setMatch((prev)=>prev ? {
                                ...closed,
                                team1: prev.team1,
                                team2: prev.team2,
                                matchFormat: prev.matchFormat ?? closed.matchFormat,
                                tieBreakType: prev.tieBreakType ?? closed.tieBreakType
                            } : prev);
                    }
                } catch (err) {
                    console.error('[updateManualScore] cierre por sets:', err);
                    setMatch(match);
                    alert('Error al cerrar el partido. Revisa la conexión.');
                }
                return;
            }
        }
        setMatch((prev)=>prev ? {
                ...prev,
                ...patch
            } : prev);
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(id, match.id, patch);
        } catch (err) {
            console.error('[updateManualScore]', err);
            setMatch(match);
            alert('Error al guardar el ajuste.');
        }
    };
    // ── Persistencia de datos: el reloj NO depende del estado del navegador ─────────────────
    // La hora de inicio (startTime) está en Firestore (startedAt/actualStartTime). Al cerrar
    // o recargar la página, el cronómetro se restaura desde la BD.
    const getMatchStartTimeMs = (m)=>{
        const raw = m?.startedAt ?? m?.actualStartTime;
        if (raw == null) return null;
        const d = typeof raw?.toDate === 'function' ? raw.toDate() : new Date(raw);
        return isNaN(d.getTime()) ? null : d.getTime();
    };
    const getMatchEndTimeMs = (m)=>{
        const raw = m?.finishedAt ?? m?.actualEndTime;
        if (raw == null) return null;
        const d = typeof raw?.toDate === 'function' ? raw.toDate() : new Date(raw);
        return isNaN(d.getTime()) ? null : d.getTime();
    };
    // ── Timer robusto ────────────────────────────────────────────────────────
    // El reloj usa startedAt/actualStartTime guardados en Firestore; al reabrir la página el tiempo se restaura.
    const timerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!match) return;
        const status = match.status;
        // Partido FINALIZADO: detener reloj y fijar duración total desde datos guardados
        if (status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            const startMs = getMatchStartTimeMs(match);
            const endMs = getMatchEndTimeMs(match);
            if (startMs != null && endMs != null) {
                setDuration(Math.floor((endMs - startMs) / 1000));
            }
            return;
        }
        // Partido LIVE o PAUSED: arrancar el reloj y sincronizar con hora guardada (persiste al cerrar/abrir)
        if (status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].LIVE || status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].PAUSED) {
            // Sincronizar duración inicial
            const startMs = getMatchStartTimeMs(match);
            if (startMs != null) {
                const elapsed = Math.floor((Date.now() - startMs) / 1000);
                setDuration(Math.max(0, elapsed));
            } else {
                setDuration(0);
            }
            // Mismo criterio que la pizarra: segundos desde startedAt/actualStartTime (reloj de pared, sin deriva)
            if (!timerRef.current) {
                timerRef.current = setInterval(()=>{
                    const sm = getMatchStartTimeMs(match);
                    if (sm != null) {
                        setDuration(Math.max(0, Math.floor((Date.now() - sm) / 1000)));
                    }
                }, 1000);
            }
            return;
        }
        // PENDING u otro (como CANCELLED): detener reloj
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setDuration(0);
        return ()=>{
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [
        match?.status,
        match?.startedAt,
        match?.actualStartTime,
        match?.finishedAt,
        match?.actualEndTime
    ]);
    const startMatch = async ()=>{
        if (!tournament || !match) return;
        const realId = match.id;
        const courtNum = (m)=>{
            const raw = m?.court ?? (m?.courtIndex != null ? m.courtIndex + 1 : undefined);
            const n = Number(raw);
            return Number.isFinite(n) && n >= 1 ? n : 1;
        };
        const c = courtNum(match);
        try {
            // Fetch current matches to check court availability
            const currentMatches = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getMatches(id);
            const otherLiveOnCourt = currentMatches.some((m)=>m.id !== realId && m.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].LIVE && courtNum(m) === c);
            if (otherLiveOnCourt) {
                alert(`No puede haber dos partidos en vivo en la misma pista. Ya hay un partido en vivo en la pista ${c}.`);
                return;
            }
            const nowIso = new Date().toISOString();
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(id, realId, {
                status: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].LIVE,
                startedAt: nowIso,
                actualStartTime: nowIso
            });
            // Update local state immediately to trigger timer without waiting for subscription
            setMatch((prev)=>prev ? {
                    ...prev,
                    status: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].LIVE,
                    startedAt: nowIso,
                    actualStartTime: nowIso
                } : prev);
        } catch (err) {
            console.error('[startMatch] Error:', err);
            alert('Error al iniciar el partido. Por favor, reintenta.');
        }
    };
    // Medical Timer logic — reinicia en loop hasta que el árbitro pulse Reanudar
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isMedicalTimeout) return;
        const interval = setInterval(()=>{
            setMedicalTimeRemaining((prev)=>{
                if (prev <= 1) {
                    // Llegó a 0 → reiniciar automáticamente
                    return 180;
                }
                return prev - 1;
            });
        }, 1000);
        return ()=>clearInterval(interval);
    }, [
        isMedicalTimeout
    ]);
    // ── Sincronizar marcador a pizarra_cancha_state (para displays por cancha) ──
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!match?.id) return;
        // Solo sincronizamos si está LIVE o si acaba de terminar (para enviar el estado final)
        const isLive = match?.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].LIVE;
        const isFinished = match?.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED;
        if (!isLive && !isFinished) return;
        const canchaId = `cancha_${matchCourt}`;
        const isStb = match.superTiebreak === true || match.matchFormat === 'SUPER_TIEBREAK' || match.matchFormat === 'SET_3_STB';
        const isTb = match.isTiebreak;
        const teamLineForPizarra = (t)=>{
            if (!t) return 'Equipo';
            const full = typeof t.full === 'string' ? t.full.trim() : '';
            if (full) return full;
            const p1 = typeof t.p1 === 'string' ? t.p1.trim() : '';
            const p2 = typeof t.p2 === 'string' ? t.p2.trim() : '';
            if (p1 && p2) return `${p1} / ${p2}`;
            return p1 || p2 || 'Equipo';
        };
        const nombreEquipo1 = teamLineForPizarra(match.team1);
        const nombreEquipo2 = teamLineForPizarra(match.team2);
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getPizarraCanchaState(canchaId).then((cur)=>{
            const data = cur?.data || {};
            const marcador = data.marcador || {};
            const eq1 = marcador.equipo_1 || {};
            const eq2 = marcador.equipo_2 || {};
            const overlay = data.court_transfer_overlay;
            const keepOverlay = overlay && typeof overlay.ts === 'number' && Date.now() - overlay.ts < 12000;
            const baseData = {
                ...data
            };
            if (!keepOverlay) delete baseData.court_transfer_overlay;
            return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].setPizarraCanchaState(canchaId, {
                ...baseData,
                estado: isFinished ? 'finalizado' : 'en_vivo',
                pizarra_refresh_nonce: typeof data.pizarra_refresh_nonce === 'number' && Number.isFinite(data.pizarra_refresh_nonce) ? data.pizarra_refresh_nonce : 0,
                torneo_id: id,
                partido_id: match.id,
                marcador: {
                    ...marcador,
                    status: match.status,
                    puntos: {
                        local: match.points?.t1 || '0',
                        visitante: match.points?.t2 || '0'
                    },
                    games: {
                        local: match.games?.t1 || 0,
                        visitante: match.games?.t2 || 0
                    },
                    sets: {
                        local: match.sets?.t1 || 0,
                        visitante: match.sets?.t2 || 0
                    },
                    historico_sets: (match.setScores || []).map((s)=>({
                            local: s.t1 ?? s.local ?? 0,
                            visitante: s.t2 ?? s.visitante ?? 0
                        })),
                    saque: {
                        equipo: match.server?.team || 1,
                        jugador: match.server?.player || 1
                    },
                    modo_puntos: isStb ? 'super_tiebreak' : isTb ? 'tiebreak' : 'normal',
                    super_tiebreak: !!match.superTiebreak,
                    golden_point: isGoldenPoint,
                    match_format: match.matchFormat || tournament?.matchFormat,
                    tie_break_type: match.tieBreakType || tournament?.tieBreakType,
                    equipo_1: {
                        nombre: nombreEquipo1,
                        color: eq1.color || '#CCFF00'
                    },
                    equipo_2: {
                        nombre: nombreEquipo2,
                        color: eq2.color || '#FF5500'
                    },
                    ultimo_update: Date.now()
                }
            });
        }).catch((err)=>console.warn('[Score] Sync pizarra cancha:', err));
    }, [
        id,
        match?.id,
        match?.status,
        match?.points,
        match?.games,
        match?.sets,
        match?.server,
        match?.isTiebreak,
        match?.superTiebreak,
        match?.matchFormat,
        match?.setScores,
        match?.team1,
        match?.team2,
        matchCourt,
        tournament?.matchFormat,
        tournament?.tieBreakType,
        isGoldenPoint
    ]);
    const formatDuration = (seconds)=>{
        const h = Math.floor(seconds / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };
    const buildTeamFull = (p1, p2, fallback)=>{
        const a = p1.trim();
        const b = p2.trim();
        if (a && b) return `${a} / ${b}`;
        if (a || b) return a || b;
        return fallback;
    };
    const openNameEditor = ()=>{
        if (!match) return;
        setNameDraft({
            t1p1: (match.team1?.p1 || '').toString(),
            t1p2: (match.team1?.p2 || '').toString(),
            t2p1: (match.team2?.p1 || '').toString(),
            t2p2: (match.team2?.p2 || '').toString()
        });
        setShowNameModal(true);
    };
    const saveEditedNames = async ()=>{
        if (!match) return;
        const t1p1 = nameDraft.t1p1.trim();
        const t1p2 = nameDraft.t1p2.trim();
        const t2p1 = nameDraft.t2p1.trim();
        const t2p2 = nameDraft.t2p2.trim();
        const nextTeam1 = {
            ...match.team1 || {},
            p1: t1p1 || 'Jugador 1',
            p2: t1p2 || 'Jugador 2',
            p1Name: t1p1 || 'Jugador 1',
            p2Name: t1p2 || 'Jugador 2',
            full: buildTeamFull(t1p1, t1p2, 'Equipo 1'),
            name: buildTeamFull(t1p1, t1p2, 'Equipo 1')
        };
        const nextTeam2 = {
            ...match.team2 || {},
            p1: t2p1 || 'Jugador 3',
            p2: t2p2 || 'Jugador 4',
            p1Name: t2p1 || 'Jugador 3',
            p2Name: t2p2 || 'Jugador 4',
            full: buildTeamFull(t2p1, t2p2, 'Equipo 2'),
            name: buildTeamFull(t2p1, t2p2, 'Equipo 2')
        };
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(id, match.id, {
                team1: nextTeam1,
                team2: nextTeam2,
                team1Name: nextTeam1.full,
                team2Name: nextTeam2.full
            });
            setMatch((prev)=>prev ? {
                    ...prev,
                    team1: nextTeam1,
                    team2: nextTeam2,
                    team1Name: nextTeam1.full,
                    team2Name: nextTeam2.full
                } : prev);
            setShowNameModal(false);
        } catch (err) {
            console.error('[saveEditedNames] Error:', err);
            alert('No se pudieron guardar los nombres. Intenta de nuevo.');
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!id) return;
        // Si authLoading es true, esperamos a que termine antes de lanzar las peticiones iniciales
        // Pero no reiniciamos todo el efecto si authLoading cambia después (para evitar bucles)
        if (authLoading && !tournament) return;
        // Solo marcar como cargando la primera vez para evitar parpadeos en re-renders del efecto
        if (!tournament) setLoading(true);
        let currentTournament = null;
        let currentMatches = [];
        const updateAll = (t, ms)=>{
            if (!t || !ms) return;
            setTournament(t);
            if (t.scoringSystem) {
                setIsGoldenPoint(t.scoringSystem === 'GOLDEN_POINT');
            }
            if (t.tieBreakType || t.matchFormat) {
                const r = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchScoringRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getScoringRules"])(t.matchFormat, t.tieBreakType);
                setSuperTiebreakTarget(r.superTiebreakPointsToWin);
            }
            // Resolver partido
            let foundMatchRaw = ms.find((m)=>m.id === matchId);
            if (!foundMatchRaw) {
                const courtNum = matchId.startsWith('court_') ? parseInt(matchId.replace('court_', '')) : matchId.startsWith('match_') ? parseInt(matchId.replace('match_', '')) + 1 : parseInt(matchId);
                if (!isNaN(courtNum)) {
                    foundMatchRaw = ms.find((m)=>(m.court || (m.courtIndex !== undefined ? m.courtIndex + 1 : undefined)) === courtNum) ?? ms[courtNum - 1] ?? null;
                } else {
                    foundMatchRaw = ms[0] ?? null;
                }
            }
            if (foundMatchRaw) {
                const foundMatch = {
                    ...foundMatchRaw,
                    court: foundMatchRaw.court || (foundMatchRaw.courtIndex !== undefined ? foundMatchRaw.courtIndex + 1 : undefined)
                };
                // Team resolution logic
                // Detecta placeholders tipo "Jugador 1", "Pareja 2", etc. para no mostrarlos como si fueran nombres reales.
                const PH = /^(pareja\s*\d*|jugador\s*\d*|player\s*\d*|equipo\s*\d*|placeholder|tbd|\?|j\d+|p\d+)$/i;
                const isReal = (s)=>s && s.trim().length > 0 && !PH.test(s.trim());
                const resolveNames = (embeddedTeam, teamIdx, matchTeamName, matchTeamId)=>{
                    // 1. Equipo embebido directamente en el partido (más actualizado)
                    if (embeddedTeam) {
                        if (embeddedTeam.isTBD) {
                            const label = embeddedTeam.teamLabel || 'TBD';
                            return {
                                p1: label,
                                p2: '',
                                full: label,
                                p1Photo: null,
                                p2Photo: null
                            };
                        }
                        const fullStr = typeof embeddedTeam.full === 'string' ? embeddedTeam.full.trim() : '';
                        if (fullStr && !/^pareja\s*\d*$/i.test(fullStr) && fullStr !== 'TBD') {
                            const fparts = fullStr.split(/\s*\/\s*/).map((s)=>s.trim()).filter(isReal);
                            if (fparts.length >= 2) {
                                return {
                                    p1: fparts[0],
                                    p2: fparts[1],
                                    full: fullStr,
                                    p1Photo: embeddedTeam.p1?.photo || null,
                                    p2Photo: embeddedTeam.p2?.photo || null
                                };
                            }
                            if (fparts.length === 1) {
                                return {
                                    p1: fparts[0],
                                    p2: '',
                                    full: fparts[0],
                                    p1Photo: embeddedTeam.p1?.photo || null,
                                    p2Photo: embeddedTeam.p2?.photo || null
                                };
                            }
                        }
                        const altLine = typeof embeddedTeam.name === 'string' ? embeddedTeam.name.trim() : '';
                        if (altLine && !/^pareja\s*\d*$/i.test(altLine) && altLine !== 'TBD') {
                            const parts = altLine.split(/\s*\/\s*/).map((s)=>s.trim()).filter(isReal);
                            if (parts.length >= 2) {
                                return {
                                    p1: parts[0],
                                    p2: parts[1],
                                    full: altLine,
                                    p1Photo: embeddedTeam.p1?.photo || null,
                                    p2Photo: embeddedTeam.p2?.photo || null
                                };
                            }
                            if (parts.length === 1) {
                                return {
                                    p1: parts[0],
                                    p2: '',
                                    full: parts[0],
                                    p1Photo: embeddedTeam.p1?.photo || null,
                                    p2Photo: embeddedTeam.p2?.photo || null
                                };
                            }
                        }
                        const p1n = (embeddedTeam.p1?.name || embeddedTeam.p1Name || '').trim();
                        const p2n = (embeddedTeam.p2?.name || embeddedTeam.p2Name || '').trim();
                        if (isReal(p1n) || isReal(p2n)) {
                            const p1f = isReal(p1n) ? p1n : '?';
                            const p2f = isReal(p2n) ? p2n : '';
                            return {
                                p1: p1f,
                                p2: p2f,
                                full: [
                                    p1f,
                                    p2f
                                ].filter(Boolean).join(' / '),
                                p1Photo: embeddedTeam.p1?.photo || null,
                                p2Photo: embeddedTeam.p2?.photo || null
                            };
                        }
                    }
                    // 2. Nombre de equipo en el partido (string "A / B")
                    if (matchTeamName && isReal(matchTeamName)) {
                        const parts = matchTeamName.split('/').map((s)=>s.trim()).filter(isReal);
                        if (parts.length >= 2) return {
                            p1: parts[0],
                            p2: parts[1],
                            full: matchTeamName,
                            p1Photo: null,
                            p2Photo: null
                        };
                        if (parts.length === 1) return {
                            p1: parts[0],
                            p2: '',
                            full: parts[0],
                            p1Photo: null,
                            p2Photo: null
                        };
                    }
                    // 3. tournament.teams — buscar por id y por índice
                    const teams = t?.teams || [];
                    const byId = matchTeamId ? teams.find((tm)=>tm.id === matchTeamId || tm.teamId === matchTeamId) : null;
                    const byIdx = teamIdx > 0 ? teams[teamIdx - 1] : teams[teamIdx] ?? null;
                    const tData = byId || byIdx || null;
                    if (tData) {
                        const fullLine = (tData.full || tData.teamName || tData.name || '').toString().trim();
                        if (fullLine && !/^pareja\s*\d*$/i.test(fullLine) && fullLine !== 'TBD') {
                            const parts = fullLine.split(/\s*\/\s*/).map((s)=>s.trim()).filter(isReal);
                            if (parts.length >= 2) {
                                return {
                                    p1: parts[0],
                                    p2: parts[1],
                                    full: fullLine,
                                    p1Photo: tData.p1?.photo || null,
                                    p2Photo: tData.p2?.photo || null
                                };
                            }
                            if (parts.length === 1) {
                                return {
                                    p1: parts[0],
                                    p2: '',
                                    full: parts[0],
                                    p1Photo: tData.p1?.photo || null,
                                    p2Photo: tData.p2?.photo || null
                                };
                            }
                        }
                        const p1n = (tData.p1?.name || tData.p1Name || '').trim();
                        const p2n = (tData.p2?.name || tData.p2Name || '').trim();
                        if (isReal(p1n) || isReal(p2n)) {
                            return {
                                p1: isReal(p1n) ? p1n : '?',
                                p2: isReal(p2n) ? p2n : '',
                                full: [
                                    p1n,
                                    p2n
                                ].filter(isReal).join(' / '),
                                p1Photo: tData.p1?.photo || null,
                                p2Photo: tData.p2?.photo || null
                            };
                        }
                    }
                    // 4. Fallback
                    return {
                        p1: '?',
                        p2: '?',
                        full: matchTeamName || '?',
                        p1Photo: null,
                        p2Photo: null
                    };
                };
                const t1 = resolveNames(foundMatch.team1, foundMatch.team1Index ?? 0, foundMatch.team1Name, foundMatch.team1Id || foundMatch.team1?.id);
                const t2 = resolveNames(foundMatch.team2, foundMatch.team2Index ?? 0, foundMatch.team2Name, foundMatch.team2Id || foundMatch.team2?.id);
                setMatch({
                    ...foundMatch,
                    team1: t1,
                    team2: t2,
                    matchFormat: foundMatch.matchFormat || t?.matchFormat,
                    tieBreakType: foundMatch.tieBreakType || t?.tieBreakType
                });
            }
            setLoading(false);
        };
        // 1. Supabase Subscriptions
        const unsubT = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].subscribeToTournament(id, (tourneyData)=>{
            if (!tourneyData) return;
            currentTournament = tourneyData;
            if (currentMatches.length > 0) updateAll(currentTournament, currentMatches);
        });
        const unsubMatches = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].subscribeToMatches(id, (matchesData)=>{
            if (!matchesData || matchesData.length === 0) return;
            currentMatches = matchesData;
            if (currentTournament) updateAll(currentTournament, currentMatches);
        });
        const timeout = setTimeout(()=>setLoading(false), 10000);
        return ()=>{
            if (typeof unsubT === 'function') unsubT();
            if (typeof unsubMatches === 'function') unsubMatches();
            clearTimeout(timeout);
        };
    }, [
        id,
        matchId
    ]);
    /** Si el marcador en BD quedó LIVE con sets ya ganadores (marker u otro cliente), cerrar una vez vía propagación. */ const scoreHealFinishLastAttemptRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!id || !match?.id || !tournament || loading) return;
        const st = String(match.status || '').toUpperCase();
        if (![
            'LIVE',
            'IN_PROGRESS',
            'PAUSED',
            'STARTED',
            'WARM_UP'
        ].includes(st)) return;
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchFinishGuards$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shouldAutoFinishBySetsReferee"])(match, tournament)) return;
        const nowTs = Date.now();
        if (nowTs - scoreHealFinishLastAttemptRef.current < 5000) return;
        scoreHealFinishLastAttemptRef.current = nowTs;
        (async ()=>{
            try {
                const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getMatches(id);
                const fresh = rows.find((r)=>r.id === match.id);
                if (!fresh) return;
                if (String(fresh.status || '').toUpperCase() === 'FINISHED') return;
                if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchFinishGuards$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shouldAutoFinishBySetsReferee"])(fresh, tournament)) return;
                const endIso = new Date().toISOString();
                const finishPatch = {
                    status: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED,
                    finishedAt: endIso,
                    actualEndTime: endIso,
                    superTiebreak: false,
                    isTiebreak: false
                };
                const merged = rows.map((r)=>r.id === match.id ? {
                        ...r,
                        ...finishPatch
                    } : r);
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchFinishPropagation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["persistMatchFinishWithPropagation"])({
                    tournamentId: id,
                    bufferMinutes: tournament?.bufferMinutes ?? 15,
                    matches: merged,
                    matchId: match.id,
                    updateMatch: (tid, mid, d)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(tid, mid, d),
                    tournament
                });
            } catch (e) {
                console.warn('[Score] auto-cierre por sets en BD:', e);
            }
        })();
    }, [
        id,
        loading,
        tournament,
        match?.id,
        match?.status,
        match?.sets?.t1,
        match?.sets?.t2,
        match?.superTiebreak,
        match?.sets_to_win_match,
        match?.setsToWinMatch,
        match?.matchFormat,
        match?.match_format
    ]);
    const saveHistory = ()=>{
        if (match) {
            setHistory((prev)=>[
                    ...prev,
                    JSON.parse(JSON.stringify(match))
                ].slice(-10));
        }
    };
    const undoPoint = async ()=>{
        if (history.length === 0 || !match) return;
        const previousState = history[history.length - 1];
        setHistory((prev)=>prev.slice(0, -1));
        const updatedData = {
            points: previousState.points,
            games: previousState.games,
            sets: previousState.sets,
            server: previousState.server,
            isTiebreak: previousState.isTiebreak ?? false,
            superTiebreak: previousState.superTiebreak ?? false,
            setScores: previousState.setScores,
            superTiebreakScore: previousState.superTiebreakScore
        };
        // Actualización optimista
        setMatch({
            ...match,
            ...updatedData
        });
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(id, match.id, updatedData);
        } catch (err) {
            console.error('[undoPoint] Error:', err);
            setMatch(match);
            alert('Error al deshacer el último punto.');
        }
    };
    const updateScore = async (side, action)=>{
        if (!tournament || !match) return;
        if (action === 'minus') {
            undoPoint();
            return;
        }
        saveHistory();
        const otherSide = side === 't1' ? 't2' : 't1';
        let newPoints = {
            t1: match.points?.t1 || '0',
            t2: match.points?.t2 || '0',
            ...match.points
        };
        let optimisticMatch = {
            ...match
        };
        // ── Tie-break de set (7+2) o super tie-break (10+2 / 7+2) ─────────
        const inNumericTiebreak = match.isTiebreak || match.superTiebreak;
        if (inNumericTiebreak) {
            const currentP = parseInt(newPoints[side] || '0', 10);
            const otherP = parseInt(newPoints[otherSide] || '0', 10);
            const nextP = currentP + 1;
            newPoints[side] = nextP.toString();
            const totalPoints = nextP + otherP;
            let nextServer = {
                ...match.server
            };
            if (totalPoints === 1 || totalPoints > 1 && (totalPoints - 1) % 2 === 0) {
                const nextTeam = match.server.team === 1 ? 2 : 1;
                const nextPlayer = match.server.player === 1 ? 2 : 1;
                nextServer = {
                    team: nextTeam,
                    player: nextPlayer
                };
            }
            const target = match.superTiebreak ? superTiebreakTarget : scoringRules.setTiebreakPointsToWin;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchScoringRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["winsTiebreakPoints"])(nextP, otherP, target)) {
                await winGame(side);
                return;
            }
            const updatedData = {
                points: newPoints,
                server: nextServer
            };
            // Actualización optimista
            setMatch({
                ...match,
                ...updatedData
            });
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(id, match.id, updatedData);
            } catch (err) {
                console.error('[updateScore Tiebreak] Error:', err);
                setMatch(match); // Revertir en caso de error
                alert('No se pudo guardar el punto. Verifica tu conexión.');
            }
            return;
        }
        // ── Lógica Tradicional / Punto de Oro ─────────────────────────────
        const points = [
            '0',
            '15',
            '30',
            '40',
            'AD'
        ];
        const currentPoints = newPoints[side];
        const otherPoints = newPoints[otherSide];
        if (currentPoints === '40') {
            if (otherPoints === '40') {
                if (isGoldenPoint) {
                    await winGame(side);
                    return;
                } else {
                    newPoints[side] = 'AD';
                }
            } else if (otherPoints === 'AD') {
                newPoints[otherSide] = '40';
            } else {
                await winGame(side);
                return;
            }
        } else if (currentPoints === 'AD') {
            await winGame(side);
            return;
        } else {
            const nextIdx = points.indexOf(currentPoints);
            if (nextIdx !== -1 && nextIdx < points.length - 1) {
                newPoints[side] = points[nextIdx + 1];
            } else {
                newPoints[side] = '15'; // Fallback
            }
        }
        // Actualización optimista
        setMatch({
            ...match,
            points: newPoints
        });
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(id, match.id, {
                points: newPoints
            });
        } catch (err) {
            console.error('[updateScore] Error:', err);
            setMatch(match); // Revertir
            alert('Error al sincronizar el punto. Reintentando...');
        }
    };
    const winGame = async (side)=>{
        let newGames = {
            t1: match.games?.t1 || 0,
            t2: match.games?.t2 || 0
        };
        const g1Before = newGames.t1;
        const g2Before = newGames.t2;
        const totalGamesBefore = g1Before + g2Before;
        if (match.isTiebreak || match.superTiebreak) {
            newGames[side]++;
            await winSet(side, newGames);
            return;
        }
        const rules = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchScoringRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getScoringRules"])(match.matchFormat || match.match_format || tournament?.rrMatchFormat || tournament?.matchFormat, match.tieBreakType || tournament?.tieBreakType);
        newGames[side]++;
        const g1 = newGames.t1;
        const g2 = newGames.t2;
        const totalGames = g1 + g2;
        // Avisar cambio de cancha en games impares terminados (1, 3, 5...)
        if (totalGames % 2 === 1) {
            setShowSideChange(true);
            // Disparar animación de cambio de cancha si existen en la biblioteca
            if (sideChangeAnimations.length > 0) {
                const randomAnim = sideChangeAnimations[Math.floor(Math.random() * sideChangeAnimations.length)];
                // Usamos un ID temporal o especial para indicar que viene de la biblioteca de Supabase
                // Para que el display lo entienda, necesitamos que el display también pueda leer de Supabase
                // O mandamos la URL directamente si el receptor lo soporta.
                // Ajustemos dispararAnimacionMarcador para aceptar un objeto completo.
                const pathRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rtdb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rtdb"], `canchas/cancha_${matchCourt}/animacion_actual`);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["update"])(pathRef, {
                    id: randomAnim.id,
                    url: randomAnim.url,
                    ts: Date.now()
                });
            }
        }
        // Rotación de sacador
        const team = totalGames % 2 === 0 ? 1 : 2;
        const teamNumTurns = Math.floor(totalGames / 2);
        const player = teamNumTurns % 2 === 0 ? 1 : 2;
        const nextServer = {
            team: team,
            player: player
        };
        const isEntryTiebreak = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchScoringRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shouldEnterSetTiebreak"])(g1, g2, rules.tiebreakGamesEntry);
        const isSetFinished = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchScoringRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSetCompleteByGames"])(g1, g2, rules.gamesToWinSet);
        if (isSetFinished) {
            await winSet(side, newGames);
        } else if (isEntryTiebreak) {
            const updatedData = {
                games: newGames,
                points: {
                    t1: '0',
                    t2: '0'
                },
                isTiebreak: true,
                server: nextServer
            };
            setMatch({
                ...match,
                ...updatedData
            });
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(id, match.id, updatedData);
            } catch (err) {
                console.error('[winGame Tiebreak] Error:', err);
                setMatch(match);
                alert('Error al entrar en Tiebreak.');
            }
        } else {
            // Juego Normal
            const updatedData = {
                games: newGames,
                points: {
                    t1: '0',
                    t2: '0'
                },
                server: nextServer
            };
            setMatch({
                ...match,
                ...updatedData
            });
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(id, match.id, updatedData);
            } catch (err) {
                console.error('[winGame] Error:', err);
                setMatch(match);
                alert('Error al guardar el juego ganado.');
            }
        }
    };
    const winSet = async (side, finalGames)=>{
        const rules = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchScoringRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getScoringRules"])(match.matchFormat || match.match_format || tournament?.rrMatchFormat || tournament?.matchFormat, match.tieBreakType || tournament?.tieBreakType);
        let newSets = {
            t1: Number(match.sets?.t1) || 0,
            t2: Number(match.sets?.t2) || 0
        };
        newSets[side]++;
        const isCompletingSuperTB = match.superTiebreak === true;
        const newSetScores = isCompletingSuperTB ? match.setScores || [] : [
            ...match.setScores || [],
            {
                t1: finalGames.t1,
                t2: finalGames.t2
            }
        ];
        let need = rules.setsToWinMatch;
        const needRaw = Number(match?.sets_to_win_match ?? match?.setsToWinMatch);
        if (Number.isFinite(needRaw) && needRaw >= 1) need = needRaw;
        const t1n = newSets.t1;
        const t2n = newSets.t2;
        const setsReachWin = t1n >= need || t2n >= need;
        let nextSuperTb = !!(match.superTiebreak ?? false);
        const enterStb = !setsReachWin && rules.usesSuperTiebreakDecider && t1n === 1 && t2n === 1 && !isCompletingSuperTB;
        if (enterStb) nextSuperTb = true;
        const isMatchFinished = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchFinishGuards$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shouldAutoFinishBySetsReferee"])({
            ...match,
            sets: newSets,
            superTiebreak: nextSuperTb,
            matchFormat: match.matchFormat || match.match_format || tournament?.rrMatchFormat
        }, tournament);
        if (isMatchFinished) nextSuperTb = false;
        const finishedAt = isMatchFinished ? new Date().toISOString() : match.finishedAt || null;
        const updatedData = {
            games: isMatchFinished ? finalGames : {
                t1: 0,
                t2: 0
            },
            points: {
                t1: '0',
                t2: '0'
            },
            sets: newSets,
            setScores: newSetScores,
            isTiebreak: false,
            superTiebreak: nextSuperTb,
            status: isMatchFinished ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED : match.status,
            finishedAt: finishedAt,
            actualEndTime: finishedAt // Para consistencia con el panel de control
        };
        if (isCompletingSuperTB) {
            updatedData.superTiebreakScore = {
                t1: finalGames.t1,
                t2: finalGames.t2
            };
        } else if (enterStb) {
            updatedData.superTiebreakScore = null;
        }
        // Actualización optimista
        setMatch({
            ...match,
            ...updatedData
        });
        try {
            if (isMatchFinished) {
                const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getMatches(id);
                const merged = rows.map((r)=>r.id === match.id ? {
                        ...r,
                        ...updatedData
                    } : r);
                const { finalMatches } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchFinishPropagation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["persistMatchFinishWithPropagation"])({
                    tournamentId: id,
                    bufferMinutes: tournament?.bufferMinutes ?? 15,
                    matches: merged,
                    matchId: match.id,
                    updateMatch: (tid, mid, d)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(tid, mid, d),
                    tournament
                });
                const closed = finalMatches.find((m)=>m.id === match.id);
                if (closed) {
                    setMatch((prev)=>prev ? {
                            ...closed,
                            team1: prev.team1,
                            team2: prev.team2,
                            matchFormat: prev.matchFormat ?? closed.matchFormat,
                            tieBreakType: prev.tieBreakType ?? closed.tieBreakType
                        } : prev);
                }
            } else {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(id, match.id, updatedData);
            }
            // ── Broadcast al RTDB para sincronización en tiempo real con la Pizarra ──
            if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rtdb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rtdb"]) {
                try {
                    const canchaId = `cancha_${matchCourt}`;
                    const rtdbRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rtdb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rtdb"], `canchas/${canchaId}/marcador`);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["update"])(rtdbRef, {
                        sets: newSets,
                        games: updatedData.games,
                        setScores: newSetScores,
                        superTiebreak: nextSuperTb,
                        ...updatedData.superTiebreakScore != null ? {
                            superTiebreakScore: updatedData.superTiebreakScore
                        } : {},
                        status: updatedData.status,
                        ts: Date.now()
                    });
                } catch (rtdbErr) {
                    console.warn('[winSet] RTDB broadcast error (non-fatal):', rtdbErr);
                }
            }
            if (isMatchFinished && id) {
                // Al finalizar, forzar un refresco de la pizarra para que salga del modo LIVE
                try {
                    const canchaId = `cancha_${matchCourt}`;
                    const cur = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getPizarraCanchaState(canchaId);
                    const data = cur?.data || {};
                    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].setPizarraCanchaState(canchaId, {
                        ...data,
                        estado: 'finalizado',
                        pizarra_refresh_nonce: (Number(data.pizarra_refresh_nonce) || 0) + 1
                    });
                } catch (pizarraErr) {
                    console.warn('[winSet] Error updating pizarra status on finish (non-fatal):', pizarraErr);
                }
                setTimeout(()=>{
                    window.location.href = `/tournaments/${id}`;
                }, 3000);
            }
        } catch (err) {
            console.error('[winSet] Error:', err);
            setMatch(match);
            alert('Error al finalizar el set. Por favor, revisa tu conexión.');
        }
    };
    const dispararAnimacionMarcador = (canchaId, animId)=>{
        const a = animacionesMarcador[animId];
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rtdb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rtdb"] || !a?.url) return;
        const pathRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ref"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rtdb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rtdb"], `canchas/${canchaId}/animacion_actual`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["update"])(pathRef, {
            id: animId,
            url: a.url,
            ts: Date.now()
        });
    };
    // ── Lógica de selección de sacador ───────────────────────────────────
    // Un estado local para detectar doble-click rápido
    const lastClickRef = {
        team: 0,
        player: 0,
        ts: 0
    };
    const DOUBLE_CLICK_MS = 350;
    const setSpecificServer = async (team, player)=>{
        if (!tournament || !match) return;
        const previous = match;
        setMatch((prev)=>prev ? {
                ...prev,
                server: {
                    team,
                    player
                }
            } : prev);
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(id, match.id, {
                server: {
                    team,
                    player
                }
            });
        } catch (err) {
            console.error('[setSpecificServer]', err);
            setMatch(previous);
            alert('No se pudo actualizar el sacador.');
        }
    };
    /** Intercambia la cancha del partido actual con un partido pendiente (no iniciado). */ const swapCourtWithPendingMatch = async (otherMatch)=>{
        if (!tournament || !match || otherMatch.id === match.id) return;
        setSwappingCourtWith(otherMatch.id);
        try {
            const curCourt = match.court ?? (match.courtIndex != null ? match.courtIndex + 1 : 1);
            const curCourtIndex = typeof match.courtIndex === 'number' ? match.courtIndex : curCourt - 1;
            const otherCourt = otherMatch.court ?? (otherMatch.courtIndex != null ? otherMatch.courtIndex + 1 : 1);
            const otherCourtIndex = typeof otherMatch.courtIndex === 'number' ? otherMatch.courtIndex : otherCourt - 1;
            // Swap courts in parallel
            await Promise.all([
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(id, match.id, {
                    court: otherCourt,
                    courtIndex: otherCourtIndex
                }),
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(id, otherMatch.id, {
                    court: curCourt,
                    courtIndex: curCourtIndex
                })
            ]);
            setShowMatchSelector(false);
            router.push(`/tournaments/${id}/score/${otherMatch.id}`);
        } catch (e) {
            console.error('[swapCourtWithPendingMatch]', e);
        } finally{
            setSwappingCourtWith(null);
        }
    };
    /**
     * Traslado atómico a una pista libre: RPC en servidor (pizarra origen/destino + tournament_matches).
     * Realtime: la TV de la pista destino recibe `court_transfer_overlay` vía postgres_changes en pizarra_cancha_state.
     */ const changeMatchCourt = async (toCourt)=>{
        if (!match || !id) return;
        if (match.status !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].LIVE) {
            alert('Solo se puede trasladar un partido en vivo.');
            return;
        }
        setCourtMoveBusy(toCourt);
        try {
            const res = await fetch(`/api/tournaments/${encodeURIComponent(id)}/matches/${encodeURIComponent(match.id)}/change-court`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAuthHeaders"])()
                },
                body: JSON.stringify({
                    toCourt,
                    isGoldenPoint
                })
            });
            const j = await res.json().catch(()=>({}));
            if (!res.ok) throw new Error(j.error || 'No se pudo trasladar el partido');
            if (j.match) setMatch((prev)=>prev ? {
                    ...prev,
                    ...j.match
                } : prev);
            setShowMatchSelector(false);
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Error al trasladar';
            alert(msg);
        } finally{
            setCourtMoveBusy(null);
        }
    };
    const handlePlayerIconClick = async (team, player)=>{
        const now = Date.now();
        const isSamePlayer = lastClickRef.team === team && lastClickRef.player === player;
        const isDoubleClick = isSamePlayer && now - lastClickRef.ts < DOUBLE_CLICK_MS;
        lastClickRef.team = team;
        lastClickRef.player = player;
        lastClickRef.ts = now;
        if (isDoubleClick) {
            // Doble click: revertir (undo del servidor)
            await undoPoint();
        } else {
            // Single click: asignar este jugador como sacador
            await setSpecificServer(team, player);
        }
    };
    const toggleServingPlayer = async ()=>{
        if (!match) return;
        saveHistory();
        const previous = match;
        const currentServer = match.server || {
            team: 1,
            player: 1
        };
        const next = {
            ...currentServer,
            player: currentServer.player === 1 ? 2 : 1
        };
        setMatch((prev)=>prev ? {
                ...prev,
                server: next
            } : prev);
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(id, match.id, {
                server: next
            });
        } catch (err) {
            console.error('[toggleServingPlayer]', err);
            setMatch(previous);
        }
    };
    const toggleServingTeam = async ()=>{
        if (!match) return;
        saveHistory();
        const previous = match;
        const currentServer = match.server || {
            team: 1,
            player: 1
        };
        const next = {
            ...currentServer,
            team: currentServer.team === 1 ? 2 : 1
        };
        setMatch((prev)=>prev ? {
                ...prev,
                server: next
            } : prev);
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(id, match.id, {
                server: next
            });
        } catch (err) {
            console.error('[toggleServingTeam]', err);
            setMatch(previous);
        }
    };
    const handleMedicalTimeout = async ()=>{
        if (!tournament || !match) return;
        const newStatus = isMedicalTimeout ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].LIVE : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].PAUSED;
        if (!isMedicalTimeout) {
            setMedicalTimeRemaining(180); // Reset to 3 mins
        }
        setIsMedicalTimeout(!isMedicalTimeout);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(id, match.id, {
            status: newStatus
        });
    };
    // Si está cargando auth o el perfil aún no llega (pero hay usuario), seguimos en loading para evitar parpadeos de acceso restringido
    if (loading || authLoading || user && !profile) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-screen bg-[#0a0a0a] flex items-center justify-center",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
            className: "w-8 h-8 text-padel-primary animate-spin"
        }, void 0, false, {
            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
            lineNumber: 1349,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
        lineNumber: 1348,
        columnNumber: 9
    }, this);
    if (!canControl) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-screen bg-[#0a0a0a] flex items-center justify-center p-10",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-md w-full bg-[#111] border border-white/10 rounded-[2.5rem] p-10 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"], {
                            className: "w-10 h-10 text-red-500"
                        }, void 0, false, {
                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                            lineNumber: 1359,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                        lineNumber: 1358,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-black italic uppercase tracking-tighter mb-4 text-white",
                        children: "Acceso Restringido"
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                        lineNumber: 1361,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-400 text-sm font-medium mb-8",
                        children: "Debes iniciar sesión para controlar el marcador. Si crees que es un error, comprueba tu cuenta o los permisos de pista con el club."
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                        lineNumber: 1362,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            const tab = match?.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED ? 'finalizados' : match?.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].LIVE ? 'live' : 'por-comenzar';
                            router.push(`/tournaments/${id}?tab=${tab}`);
                        },
                        className: "w-full py-4 bg-white text-black rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all",
                        children: "Volver al Torneo"
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                        lineNumber: 1365,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                lineNumber: 1357,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
            lineNumber: 1356,
            columnNumber: 13
        }, this);
    }
    if (!match) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-black italic uppercase",
        children: "Partido no encontrado"
    }, void 0, false, {
        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
        lineNumber: 1384,
        columnNumber: 24
    }, this);
    const server = match.server || {
        team: 1,
        player: 1
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-f8a3d821707958e7" + " " + "fixed inset-0 z-0 flex h-[100dvh] max-h-[100dvh] min-h-0 w-full flex-col overflow-hidden overscroll-none bg-[#070707] pl-[max(0.25rem,env(safe-area-inset-left))] pr-[max(0.25rem,env(safe-area-inset-right))] pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)] font-sans text-white touch-none select-none gap-0 premium-gradient",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-f8a3d821707958e7" + " " + "absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-padel-primary/5 blur-[120px] rounded-full pointer-events-none"
            }, void 0, false, {
                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                lineNumber: 1391,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-f8a3d821707958e7" + " " + "absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-padel-primary/5 blur-[120px] rounded-full pointer-events-none"
            }, void 0, false, {
                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                lineNumber: 1392,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                animate: {
                    opacity: [
                        0.3,
                        0.5,
                        0.3
                    ],
                    scale: [
                        1,
                        1.1,
                        1
                    ]
                },
                transition: {
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                },
                className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(204,255,0,0.03)_0%,transparent_70%)] pointer-events-none"
            }, void 0, false, {
                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                lineNumber: 1393,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "jsx-f8a3d821707958e7" + " " + "glass relative z-50 flex shrink-0 flex-col gap-0 rounded-b-[1.5rem] rounded-t-xl pt-0 pb-1 px-2 shadow-2xl sm:rounded-t-2xl sm:px-5 sm:pb-1.5 md:px-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                        children: showSideChange && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                y: -100,
                                opacity: 0
                            },
                            animate: {
                                y: 0,
                                opacity: 1
                            },
                            exit: {
                                y: -100,
                                opacity: 0
                            },
                            className: "absolute inset-x-0 -bottom-16 flex justify-center z-[60] pointer-events-none [&_button]:pointer-events-auto",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-f8a3d821707958e7" + " " + "bg-padel-primary text-black px-8 py-4 rounded-2xl flex items-center gap-4 shadow-2xl border-b-4 border-black/20",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                        className: "w-6 h-6 animate-spin-slow"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1414,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-f8a3d821707958e7" + " " + "flex flex-col",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-f8a3d821707958e7" + " " + "font-black italic uppercase text-lg leading-none",
                                                children: "Cambio de Cancha"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1416,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-f8a3d821707958e7" + " " + "text-[10px] font-bold opacity-70 uppercase tracking-widest",
                                                children: "Juego Impar Finalizado"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1417,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1415,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowSideChange(false),
                                        className: "jsx-f8a3d821707958e7" + " " + "ml-4 w-8 h-8 flex items-center justify-center rounded-lg bg-black/10 hover:bg-black/20 transition-colors",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            className: "w-5 h-5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                            lineNumber: 1423,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1419,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                lineNumber: 1413,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                            lineNumber: 1407,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                        lineNumber: 1405,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-f8a3d821707958e7" + " " + "flex w-full min-w-0 items-start gap-2 pt-0 sm:gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-f8a3d821707958e7" + " " + "flex w-[min(30%,11rem)] min-w-0 shrink-0 flex-col items-start gap-0.5 text-left sm:w-[min(30%,13rem)]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-f8a3d821707958e7" + " " + "w-full truncate text-[10px] font-black italic uppercase leading-[1.15] tracking-tight text-white/85 sm:text-xs",
                                        children: match.roundName || match.groupName || 'Fase de Grupos'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1433,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-f8a3d821707958e7" + " " + "w-full truncate text-[10px] font-black italic uppercase leading-tight tracking-tight text-padel-primary sm:text-xs",
                                        children: tournament?.category?.replace('MAS_', '+').replace('_', ' ') || match.category || 'Categoría Principal'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1436,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-f8a3d821707958e7" + " " + "w-full truncate text-[10px] font-black italic uppercase leading-tight tracking-tight text-white/55 sm:text-xs",
                                        children: tournament?.gender === 'FEMALE' ? 'Femenino' : tournament?.gender === 'MALE' ? 'Masculino' : 'Mixto'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1439,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                lineNumber: 1432,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-f8a3d821707958e7" + " " + "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0 pt-0 sm:px-0.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "jsx-f8a3d821707958e7" + " " + "mb-0 flex min-w-0 w-full max-w-[min(100vw-10rem,22rem)] flex-col items-center gap-0 text-center leading-none",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-f8a3d821707958e7" + " " + "w-full text-center text-[10px] font-black italic uppercase leading-[1.15] tracking-tight text-white/85 sm:text-xs",
                                                children: "Cancha"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1446,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-f8a3d821707958e7" + " " + "label-cancha-hero mt-px min-w-0 w-full truncate px-0.5 text-center",
                                                children: match.courtName || (match.court != null && Number(match.court) >= 1 ? `Pista ${match.court}` : match.courtIndex != null ? `Pista ${match.courtIndex + 1}` : 'Pista 1')
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1449,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1445,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-f8a3d821707958e7" + " " + "mt-0.5 flex w-full min-w-0 items-center justify-center gap-0.5 sm:gap-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-f8a3d821707958e7" + " " + "flex shrink-0 items-center gap-0.5 sm:gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                                        whileHover: {
                                                            scale: 1.05
                                                        },
                                                        whileTap: {
                                                            scale: 0.95
                                                        },
                                                        onClick: ()=>{
                                                            const tab = match?.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED ? 'finalizados' : match?.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].LIVE ? 'live' : 'por-comenzar';
                                                            router.push(`/tournaments/${id}?tab=${tab}`);
                                                        },
                                                        className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all group hover:bg-white/10 sm:h-10 sm:w-10",
                                                        title: "Volver al torneo",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                                            className: "h-4 w-4 text-gray-400 transition-colors group-hover:text-padel-primary sm:h-5 sm:w-5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 1477,
                                                            columnNumber: 37
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1462,
                                                        columnNumber: 33
                                                    }, this),
                                                    [
                                                        {
                                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"],
                                                            onClick: ()=>setShowMatchSelector(true),
                                                            color: 'hover:text-padel-primary',
                                                            label: 'Cambiar Pista'
                                                        },
                                                        {
                                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"],
                                                            onClick: ()=>{
                                                                const pizarraUrl = '/tournaments/' + id + '/display/' + (match?.id || matchId);
                                                                window.open(pizarraUrl, '_blank');
                                                            },
                                                            color: 'hover:text-padel-primary',
                                                            label: 'Abrir / Refrescar Pizarra'
                                                        }
                                                    ].map((btn, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                                            whileHover: {
                                                                scale: 1.05,
                                                                backgroundColor: 'rgba(255,255,255,0.05)'
                                                            },
                                                            whileTap: {
                                                                scale: 0.9
                                                            },
                                                            onClick: btn.onClick,
                                                            className: `flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 text-gray-500 transition-all sm:h-10 sm:w-10 ${btn.color}`,
                                                            title: btn.label,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(btn.icon, {
                                                                className: "h-5 w-5"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                lineNumber: 1491,
                                                                columnNumber: 41
                                                            }, this)
                                                        }, idx, false, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 1483,
                                                            columnNumber: 37
                                                        }, this))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1461,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-f8a3d821707958e7" + " " + "flex min-h-[4.75rem] min-w-0 max-w-[min(52vw,14rem)] flex-1 flex-col items-center justify-center sm:min-h-[5rem] sm:max-w-[14rem]",
                                                children: match.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].PENDING ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                                            type: "button",
                                                            title: "Empezar partido",
                                                            initial: {
                                                                y: -12,
                                                                opacity: 0
                                                            },
                                                            animate: {
                                                                y: 0,
                                                                opacity: 1
                                                            },
                                                            whileHover: {
                                                                scale: 1.03,
                                                                backgroundColor: '#ccff00',
                                                                color: '#000'
                                                            },
                                                            whileTap: {
                                                                scale: 0.97
                                                            },
                                                            onClick: startMatch,
                                                            className: "flex w-full max-w-[10.5rem] items-center justify-center gap-1.5 px-2.5 py-1.5 sm:max-w-[12rem] sm:px-3.5 sm:py-2 bg-padel-primary text-black rounded-b-xl sm:rounded-b-2xl text-[8px] sm:text-[10px] font-black italic uppercase tracking-[0.08em] sm:tracking-[0.1em] shadow-[0_6px_20px_-8px_rgba(204,255,0,0.35)] transition-all border-x border-b border-black/10 whitespace-nowrap",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                                                    className: "h-3 w-3 shrink-0 fill-current sm:h-3.5 sm:w-3.5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                    lineNumber: 1509,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-f8a3d821707958e7" + " " + "leading-none",
                                                                    children: "Empezar"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                    lineNumber: 1510,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 1499,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-f8a3d821707958e7" + " " + "mt-1 flex w-full items-center justify-center gap-1 px-0.5 leading-none select-none",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-f8a3d821707958e7" + " " + "text-[7px] font-black uppercase tracking-tight text-white/35 tabular-nums sm:text-[8px]",
                                                                    children: now.toLocaleDateString('es-ES', {
                                                                        day: '2-digit',
                                                                        month: '2-digit'
                                                                    })
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                    lineNumber: 1513,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-f8a3d821707958e7" + " " + "text-white/25",
                                                                    children: "·"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                    lineNumber: 1516,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-f8a3d821707958e7" + " " + "text-[9px] font-black italic uppercase tracking-tighter text-white/45 tabular-nums sm:text-[10px]",
                                                                    children: now.toLocaleTimeString('es-ES', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                        hour12: true
                                                                    })
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                    lineNumber: 1517,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 1512,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-f8a3d821707958e7" + " " + "flex w-full flex-col items-center justify-center rounded-b-2xl border-x border-b border-white/10 bg-white/[0.03] px-2 py-1.5 shadow-2xl backdrop-blur-xl sm:max-w-[14rem] sm:rounded-b-3xl sm:px-3 sm:py-1.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-f8a3d821707958e7" + " " + "text-lg font-black italic leading-none tracking-tighter text-glow text-white tabular-nums sm:text-2xl md:text-[1.75rem]",
                                                            children: formatDuration(duration)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 1524,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-f8a3d821707958e7" + " " + "mt-0.5 flex items-center gap-1.5 sm:mt-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                    animate: {
                                                                        scale: [
                                                                            1,
                                                                            1.2,
                                                                            1
                                                                        ],
                                                                        opacity: [
                                                                            0.4,
                                                                            0.8,
                                                                            0.4
                                                                        ]
                                                                    },
                                                                    transition: {
                                                                        duration: 2,
                                                                        repeat: Infinity
                                                                    },
                                                                    className: "h-1.5 w-1.5 shrink-0 rounded-full bg-padel-primary shadow-[0_0_10px_#ccff00]"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                    lineNumber: 1528,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-f8a3d821707958e7" + " " + "whitespace-nowrap text-[7px] font-black italic uppercase tracking-[0.18em] text-padel-primary/80 sm:text-[8px]",
                                                                    children: "Tiempo de Juego"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                    lineNumber: 1533,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 1527,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 1523,
                                                    columnNumber: 37
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1496,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-f8a3d821707958e7" + " " + "flex shrink-0 items-center gap-0.5 sm:gap-1",
                                                children: [
                                                    {
                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
                                                        onClick: openNameEditor,
                                                        color: 'hover:text-padel-primary',
                                                        label: 'Editar nombres'
                                                    },
                                                    {
                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"],
                                                        onClick: ()=>setShowAdjustModal(true),
                                                        color: 'hover:text-white',
                                                        label: 'Ajustes'
                                                    }
                                                ].map((btn, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                                        whileHover: {
                                                            scale: 1.05,
                                                            backgroundColor: 'rgba(255,255,255,0.05)'
                                                        },
                                                        whileTap: {
                                                            scale: 0.9
                                                        },
                                                        onClick: btn.onClick,
                                                        className: `flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 text-gray-500 transition-all sm:h-10 sm:w-10 ${btn.color}`,
                                                        title: btn.label,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(btn.icon, {
                                                            className: "h-5 w-5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 1554,
                                                            columnNumber: 41
                                                        }, this)
                                                    }, idx, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1546,
                                                        columnNumber: 37
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1541,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1460,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                lineNumber: 1444,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-f8a3d821707958e7" + " " + "flex w-[min(30%,11rem)] min-w-0 shrink-0 flex-row items-center justify-end gap-2 self-start sm:w-[min(30%,15rem)] sm:gap-2.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                        whileHover: {
                                            scale: 1.05,
                                            backgroundColor: 'rgba(239,68,68,0.15)'
                                        },
                                        whileTap: {
                                            scale: 0.95
                                        },
                                        onClick: handleMedicalTimeout,
                                        className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/35 bg-red-500/10 text-red-500 transition-all sm:h-11 sm:w-11",
                                        title: "Asistencia Médica",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-f8a3d821707958e7" + " " + "relative flex h-5 w-5 items-center justify-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-f8a3d821707958e7" + " " + "absolute h-1.5 w-5 rounded-full bg-current"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 1570,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-f8a3d821707958e7" + " " + "absolute h-5 w-1.5 rounded-full bg-current"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 1571,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                            lineNumber: 1569,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1562,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                        whileHover: {
                                            scale: 1.05
                                        },
                                        whileTap: {
                                            scale: 0.95
                                        },
                                        onClick: handleFinishMatch,
                                        className: `shrink-0 rounded-xl px-3 py-2 text-[9px] font-black italic uppercase tracking-[0.12em] transition-all sm:px-4 sm:py-2.5 sm:text-[10px] ${finishClicks === 0 ? 'border border-padel-primary/60 bg-padel-primary/15 text-padel-primary shadow-[0_0_22px_rgba(204,255,0,0.45),inset_0_0_20px_rgba(204,255,0,0.08)] hover:border-padel-primary hover:bg-padel-primary/25 hover:shadow-[0_0_32px_rgba(204,255,0,0.55)]' : finishClicks === 1 ? 'border border-orange-400 bg-orange-500 text-white shadow-[0_0_24px_rgba(249,115,22,0.45)]' : 'border border-red-400 bg-red-600 text-white shadow-[0_0_24px_rgba(220,38,38,0.45)]'}`,
                                        children: finishClicks === 0 ? 'Finalizar' : finishClicks === 1 ? '¿Seguro?' : 'Confirmar'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1574,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                lineNumber: 1561,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                        lineNumber: 1431,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                lineNumber: 1403,
                columnNumber: 13
            }, this),
            match.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].LIVE && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-f8a3d821707958e7" + " " + "flex shrink-0 flex-wrap items-center justify-center gap-1 px-2 py-0.5 sm:gap-1.5 sm:px-3 sm:py-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "jsx-f8a3d821707958e7" + " " + "text-[9px] font-black uppercase tracking-[0.2em] text-white/35 text-center",
                        children: "Sacador: toca J1–J4 · doble toque = deshacer punto"
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                        lineNumber: 1594,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-f8a3d821707958e7" + " " + "flex items-center gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>toggleServingPlayer(),
                                className: "jsx-f8a3d821707958e7" + " " + "px-2.5 py-1 rounded-lg border border-white/15 bg-white/5 text-[8px] font-black uppercase tracking-widest text-padel-primary hover:bg-padel-primary/10",
                                children: "Otro jugador (misma pareja)"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                lineNumber: 1598,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>toggleServingTeam(),
                                className: "jsx-f8a3d821707958e7" + " " + "px-2.5 py-1 rounded-lg border border-white/15 bg-white/5 text-[8px] font-black uppercase tracking-widest text-white/70 hover:bg-white/10",
                                children: "Cambiar pareja al saque"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                lineNumber: 1605,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                        lineNumber: 1597,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                lineNumber: 1593,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "jsx-f8a3d821707958e7" + " " + "flex min-h-0 flex-1 flex-col gap-1 overflow-hidden px-0.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-f8a3d821707958e7" + " " + "flex min-h-0 flex-1 flex-col gap-1 overflow-hidden md:flex-row md:gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-f8a3d821707958e7" + " " + "glass group relative flex min-h-0 min-w-0 flex-1 flex-col items-center justify-start overflow-hidden rounded-[1.25rem] p-2 pt-1.5 shadow-2xl sm:rounded-[2rem] sm:p-3 sm:pt-2 md:p-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-f8a3d821707958e7" + " " + "absolute inset-0 bg-gradient-to-br from-padel-primary/[0.04] to-transparent opacity-50"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1621,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-f8a3d821707958e7" + " " + "relative z-10 mb-1 flex w-full shrink-0 items-start justify-center gap-2 sm:mb-1.5 sm:gap-3",
                                        children: [
                                            1,
                                            2
                                        ].map((pNum)=>{
                                            const isServer = server.team === 1 && server.player === pNum;
                                            const playerName = pNum === 1 ? match.team1.p1 : match.team1.p2;
                                            const jLabel = pNum === 1 ? 'J1' : 'J2';
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-f8a3d821707958e7" + " " + "flex max-w-[140px] shrink-0 flex-col items-center gap-1 sm:gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        onClick: ()=>handlePlayerIconClick(1, pNum),
                                                        className: "jsx-f8a3d821707958e7" + " " + "relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl opacity-90 transition-all duration-500 hover:opacity-100 sm:h-16 sm:w-16 sm:rounded-2xl",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-f8a3d821707958e7" + " " + `flex h-full w-full items-center justify-center rounded-xl border-4 transition-colors sm:rounded-2xl ${isServer ? 'border-padel-primary' : 'border-white/10'}`,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-f8a3d821707958e7" + " " + "text-base font-black italic text-white/90 sm:text-lg",
                                                                children: jLabel
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                lineNumber: 1637,
                                                                columnNumber: 45
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 1636,
                                                            columnNumber: 41
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1632,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$AutoShrinkName$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                        name: playerName,
                                                        className: `text-sm font-black italic uppercase tracking-tighter text-center transition-colors ${isServer ? 'text-padel-primary' : 'text-white/60'}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1640,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, pNum, true, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1631,
                                                columnNumber: 33
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1624,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-f8a3d821707958e7" + " " + "absolute right-1 top-[30%] z-20 flex min-w-[2.5rem] -translate-y-1/2 flex-col items-center gap-1.5 rounded-xl border border-white/5 bg-black/20 px-1.5 py-1.5 backdrop-blur-md sm:right-4 sm:top-[32%] sm:gap-3 sm:rounded-2xl sm:px-2.5 sm:py-3 sm:min-w-[3rem]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-f8a3d821707958e7" + " " + "flex w-full flex-col items-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-f8a3d821707958e7" + " " + "mb-0.5 text-[7px] font-black uppercase tracking-[0.2em] text-gray-500 sm:mb-1 sm:text-[8px]",
                                                        children: "G"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1652,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-f8a3d821707958e7" + " " + `w-full text-center font-black italic tabular-nums leading-none text-padel-primary ${(match.games?.t1 ?? 0) >= 10 ? 'text-2xl sm:text-3xl' : 'text-[clamp(1.25rem,5vmin,2.25rem)] sm:text-4xl'}`,
                                                        children: match.games?.t1 ?? 0
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1653,
                                                        columnNumber: 29
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1651,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-f8a3d821707958e7" + " " + "h-px w-5 bg-white/10 sm:w-6"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1657,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-f8a3d821707958e7" + " " + "flex w-full flex-col items-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-f8a3d821707958e7" + " " + "mb-0.5 text-[7px] font-black uppercase tracking-[0.2em] text-gray-500 sm:mb-1 sm:text-[8px]",
                                                        children: "S"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1659,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-f8a3d821707958e7" + " " + `w-full text-center font-black italic tabular-nums leading-none text-white ${(match.sets?.t1 ?? 0) >= 10 ? 'text-2xl sm:text-3xl' : 'text-[clamp(1.25rem,5vmin,2.25rem)] sm:text-4xl'}`,
                                                        children: match.sets?.t1 ?? 0
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1660,
                                                        columnNumber: 29
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1658,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1650,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-f8a3d821707958e7" + " " + "relative z-10 mb-0.5 flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-black/40 p-0.5 shadow-inner sm:mb-1 sm:gap-2.5 sm:rounded-2xl sm:p-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                                whileHover: {
                                                    scale: 1.1,
                                                    backgroundColor: 'rgba(255,255,255,0.08)'
                                                },
                                                whileTap: {
                                                    scale: 0.9
                                                },
                                                onClick: ()=>updateScore('t1', 'minus'),
                                                className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 glass text-white/20 transition-colors hover:text-white/60 sm:h-10 sm:w-10",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__["Minus"], {
                                                    className: "h-4 w-4 sm:h-5 sm:w-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 1674,
                                                    columnNumber: 29
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1668,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-f8a3d821707958e7" + " " + `flex min-w-0 flex-col items-center px-2 sm:px-4 ${String(match.points?.t1 || '0').length >= 2 ? 'min-w-[72px] sm:min-w-[96px]' : 'min-w-[64px] sm:min-w-[80px]'}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-f8a3d821707958e7" + " " + "mb-0.5 text-[7px] font-black uppercase tracking-widest text-gray-500 sm:text-[8px]",
                                                        children: "Points"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1678,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                                        mode: "wait",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
                                                            initial: {
                                                                y: 5,
                                                                opacity: 0
                                                            },
                                                            animate: {
                                                                y: 0,
                                                                opacity: 1
                                                            },
                                                            exit: {
                                                                y: -5,
                                                                opacity: 0
                                                            },
                                                            className: `text-center font-black italic tabular-nums leading-none text-glow text-white ${String(match.points?.t1 || '0').length >= 2 ? 'text-[clamp(1.35rem,6vmin,1.85rem)] sm:text-3xl' : 'text-[clamp(1.5rem,7vmin,2.25rem)] sm:text-4xl'}`,
                                                            children: match.points?.t1 || '0'
                                                        }, match.points?.t1, false, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 1680,
                                                            columnNumber: 33
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1679,
                                                        columnNumber: 29
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1677,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                                whileHover: {
                                                    scale: 1.1,
                                                    backgroundColor: 'rgba(204,255,0,0.15)'
                                                },
                                                whileTap: {
                                                    scale: 0.9
                                                },
                                                onClick: ()=>updateScore('t1', 'plus'),
                                                className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-padel-primary/20 bg-padel-primary/10 text-padel-primary shadow-[0_5px_15px_-5px_rgba(204,255,0,0.3)] transition-all hover:border-padel-primary/40 sm:h-10 sm:w-10",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                    className: "h-5 w-5 sm:h-6 sm:w-6"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 1698,
                                                    columnNumber: 29
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1692,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1667,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-f8a3d821707958e7" + " " + "mx-auto mt-0 flex min-h-0 w-full max-w-[min(100%,9.5rem)] flex-col gap-0.5 sm:max-w-[11rem] sm:gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-f8a3d821707958e7" + " " + "grid grid-cols-3 gap-0.5 sm:gap-1.5",
                                                children: [
                                                    1,
                                                    2,
                                                    3
                                                ].map((i)=>{
                                                    const entry = padsAnimaciones[i - 1];
                                                    const animId = entry?.[0];
                                                    const canFire = !!(animId && animacionesMarcador[animId]?.url);
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                                        type: "button",
                                                        title: entry?.[1]?.nombre ? `${i}: ${entry[1].nombre}` : `Pad ${i}`,
                                                        disabled: !canFire,
                                                        whileHover: canFire ? {
                                                            scale: 1.02,
                                                            boxShadow: '0 6px 20px -4px rgba(204,255,0,0.25)'
                                                        } : undefined,
                                                        whileTap: canFire ? {
                                                            scale: 0.92,
                                                            boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.4)'
                                                        } : undefined,
                                                        onClick: ()=>animId && canFire && dispararAnimacionMarcador(`cancha_${matchCourt}`, animId),
                                                        className: `aspect-square min-h-[22px] rounded-md border border-white/20 bg-gradient-to-b from-zinc-700/90 to-zinc-900 font-black tabular-nums text-white/90 shadow-[0_3px_8px_-2px_rgba(0,0,0,0.5)] transition-colors sm:min-h-[28px] sm:rounded-lg ${canFire ? 'hover:border-padel-primary/40 hover:from-zinc-600/90 hover:to-zinc-800 active:from-zinc-800 active:to-zinc-950' : 'cursor-not-allowed opacity-40'} ${i >= 10 ? 'px-0.5 text-[7px] sm:text-[8px]' : 'text-[7px] sm:text-[9px]'}`,
                                                        children: i
                                                    }, i, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1709,
                                                        columnNumber: 37
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1703,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-f8a3d821707958e7" + " " + "grid grid-cols-3 gap-0.5 sm:gap-1.5",
                                                children: [
                                                    4,
                                                    5,
                                                    6
                                                ].map((i)=>{
                                                    const entry = padsAnimaciones[i - 1];
                                                    const animId = entry?.[0];
                                                    const canFire = !!(animId && animacionesMarcador[animId]?.url);
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                                        type: "button",
                                                        title: entry?.[1]?.nombre ? `${i}: ${entry[1].nombre}` : `Pad ${i}`,
                                                        disabled: !canFire,
                                                        whileHover: canFire ? {
                                                            scale: 1.02,
                                                            boxShadow: '0 6px 20px -4px rgba(204,255,0,0.25)'
                                                        } : undefined,
                                                        whileTap: canFire ? {
                                                            scale: 0.92,
                                                            boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.4)'
                                                        } : undefined,
                                                        onClick: ()=>animId && canFire && dispararAnimacionMarcador(`cancha_${matchCourt}`, animId),
                                                        className: `aspect-square min-h-[22px] rounded-md border border-white/20 bg-gradient-to-b from-zinc-700/90 to-zinc-900 font-black tabular-nums text-white/90 shadow-[0_3px_8px_-2px_rgba(0,0,0,0.5)] transition-colors sm:min-h-[28px] sm:rounded-lg ${canFire ? 'hover:border-padel-primary/40 hover:from-zinc-600/90 hover:to-zinc-800 active:from-zinc-800 active:to-zinc-950' : 'cursor-not-allowed opacity-40'} ${i >= 10 ? 'px-0.5 text-[7px] sm:text-[8px]' : 'text-[7px] sm:text-[9px]'}`,
                                                        children: i
                                                    }, i, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1730,
                                                        columnNumber: 37
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1724,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1702,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                lineNumber: 1620,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-f8a3d821707958e7" + " " + "glass group relative flex min-h-0 min-w-0 flex-1 flex-col items-center justify-start overflow-hidden rounded-[1.25rem] p-2 pt-1.5 shadow-2xl sm:rounded-[2rem] sm:p-3 sm:pt-2 md:p-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-f8a3d821707958e7" + " " + "absolute inset-0 bg-gradient-to-br from-padel-primary/[0.04] to-transparent opacity-50"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1751,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-f8a3d821707958e7" + " " + "relative z-10 mb-1 flex w-full shrink-0 items-start justify-center gap-2 sm:mb-1.5 sm:gap-3",
                                        children: [
                                            1,
                                            2
                                        ].map((pNum)=>{
                                            const isServer = server.team === 2 && server.player === pNum;
                                            const playerName = pNum === 1 ? match.team2.p1 : match.team2.p2;
                                            const jLabel = pNum === 1 ? 'J3' : 'J4';
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-f8a3d821707958e7" + " " + "flex max-w-[140px] shrink-0 flex-col items-center gap-1 sm:gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        onClick: ()=>handlePlayerIconClick(2, pNum),
                                                        className: "jsx-f8a3d821707958e7" + " " + "relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl opacity-90 transition-all duration-500 hover:opacity-100 sm:h-16 sm:w-16 sm:rounded-2xl",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-f8a3d821707958e7" + " " + `flex h-full w-full items-center justify-center rounded-xl border-4 transition-colors sm:rounded-2xl ${isServer ? 'border-padel-primary' : 'border-white/10'}`,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-f8a3d821707958e7" + " " + "text-base font-black italic text-white/90 sm:text-lg",
                                                                children: jLabel
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                lineNumber: 1767,
                                                                columnNumber: 45
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 1766,
                                                            columnNumber: 41
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1762,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$AutoShrinkName$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                        name: playerName,
                                                        className: `text-sm font-black italic uppercase tracking-tighter text-center transition-colors ${isServer ? 'text-padel-primary' : 'text-white/60'}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1770,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, pNum, true, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1761,
                                                columnNumber: 33
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1754,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-f8a3d821707958e7" + " " + "absolute left-1 top-[30%] z-20 flex min-w-[2.5rem] -translate-y-1/2 flex-col items-center gap-1.5 rounded-xl border border-white/5 bg-black/20 px-1.5 py-1.5 backdrop-blur-md sm:left-4 sm:top-[32%] sm:gap-3 sm:rounded-2xl sm:px-2.5 sm:py-3 sm:min-w-[3rem]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-f8a3d821707958e7" + " " + "flex w-full flex-col items-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-f8a3d821707958e7" + " " + "mb-0.5 text-[7px] font-black uppercase tracking-[0.2em] text-gray-500 sm:mb-1 sm:text-[8px]",
                                                        children: "G"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1782,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-f8a3d821707958e7" + " " + `w-full text-center font-black italic tabular-nums leading-none text-padel-primary ${(match.games?.t2 ?? 0) >= 10 ? 'text-2xl sm:text-3xl' : 'text-[clamp(1.25rem,5vmin,2.25rem)] sm:text-4xl'}`,
                                                        children: match.games?.t2 ?? 0
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1783,
                                                        columnNumber: 29
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1781,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-f8a3d821707958e7" + " " + "h-px w-5 bg-white/10 sm:w-6"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1787,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-f8a3d821707958e7" + " " + "flex w-full flex-col items-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-f8a3d821707958e7" + " " + "mb-0.5 text-[7px] font-black uppercase tracking-[0.2em] text-gray-500 sm:mb-1 sm:text-[8px]",
                                                        children: "S"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1789,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-f8a3d821707958e7" + " " + `w-full text-center font-black italic tabular-nums leading-none text-white ${(match.sets?.t2 ?? 0) >= 10 ? 'text-2xl sm:text-3xl' : 'text-[clamp(1.25rem,5vmin,2.25rem)] sm:text-4xl'}`,
                                                        children: match.sets?.t2 ?? 0
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1790,
                                                        columnNumber: 29
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1788,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1780,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-f8a3d821707958e7" + " " + "relative z-10 mb-0.5 flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-black/40 p-0.5 shadow-inner sm:mb-1 sm:gap-2.5 sm:rounded-2xl sm:p-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                                whileHover: {
                                                    scale: 1.1,
                                                    backgroundColor: 'rgba(255,255,255,0.08)'
                                                },
                                                whileTap: {
                                                    scale: 0.9
                                                },
                                                onClick: ()=>updateScore('t2', 'minus'),
                                                className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 glass text-white/20 transition-colors hover:text-white/60 sm:h-10 sm:w-10",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__["Minus"], {
                                                    className: "h-4 w-4 sm:h-5 sm:w-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 1804,
                                                    columnNumber: 29
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1798,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-f8a3d821707958e7" + " " + `flex min-w-0 flex-col items-center px-2 sm:px-4 ${String(match.points?.t2 || '0').length >= 2 ? 'min-w-[72px] sm:min-w-[96px]' : 'min-w-[64px] sm:min-w-[80px]'}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-f8a3d821707958e7" + " " + "mb-0.5 text-[7px] font-black uppercase tracking-widest text-gray-500 sm:text-[8px]",
                                                        children: "Points"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1808,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                                        mode: "wait",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
                                                            initial: {
                                                                y: 5,
                                                                opacity: 0
                                                            },
                                                            animate: {
                                                                y: 0,
                                                                opacity: 1
                                                            },
                                                            exit: {
                                                                y: -5,
                                                                opacity: 0
                                                            },
                                                            className: `text-center font-black italic tabular-nums leading-none text-glow text-white ${String(match.points?.t2 || '0').length >= 2 ? 'text-[clamp(1.35rem,6vmin,1.85rem)] sm:text-3xl' : 'text-[clamp(1.5rem,7vmin,2.25rem)] sm:text-4xl'}`,
                                                            children: match.points?.t2 || '0'
                                                        }, match.points?.t2, false, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 1810,
                                                            columnNumber: 33
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1809,
                                                        columnNumber: 29
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1807,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                                whileHover: {
                                                    scale: 1.1,
                                                    backgroundColor: 'rgba(204,255,0,0.15)'
                                                },
                                                whileTap: {
                                                    scale: 0.9
                                                },
                                                onClick: ()=>updateScore('t2', 'plus'),
                                                className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-padel-primary/20 bg-padel-primary/10 text-padel-primary shadow-[0_5px_15px_-5px_rgba(204,255,0,0.3)] transition-all hover:border-padel-primary/40 sm:h-10 sm:w-10",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                    className: "h-5 w-5 sm:h-6 sm:w-6"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 1828,
                                                    columnNumber: 29
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1822,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1797,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-f8a3d821707958e7" + " " + "mx-auto mt-0 flex min-h-0 w-full max-w-[min(100%,9.5rem)] flex-col gap-0.5 sm:max-w-[11rem] sm:gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-f8a3d821707958e7" + " " + "grid grid-cols-3 gap-0.5 sm:gap-1.5",
                                                children: [
                                                    7,
                                                    8,
                                                    9
                                                ].map((i)=>{
                                                    const entry = padsAnimaciones[i - 1];
                                                    const animId = entry?.[0];
                                                    const canFire = !!(animId && animacionesMarcador[animId]?.url);
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                                        type: "button",
                                                        title: entry?.[1]?.nombre ? `${i}: ${entry[1].nombre}` : `Pad ${i}`,
                                                        disabled: !canFire,
                                                        whileHover: canFire ? {
                                                            scale: 1.02,
                                                            boxShadow: '0 6px 20px -4px rgba(204,255,0,0.25)'
                                                        } : undefined,
                                                        whileTap: canFire ? {
                                                            scale: 0.92,
                                                            boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.4)'
                                                        } : undefined,
                                                        onClick: ()=>animId && canFire && dispararAnimacionMarcador(`cancha_${matchCourt}`, animId),
                                                        className: `aspect-square min-h-[22px] rounded-md border border-white/20 bg-gradient-to-b from-zinc-700/90 to-zinc-900 font-black tabular-nums text-white/90 shadow-[0_3px_8px_-2px_rgba(0,0,0,0.5)] transition-colors sm:min-h-[28px] sm:rounded-lg ${canFire ? 'hover:border-padel-primary/40 hover:from-zinc-600/90 hover:to-zinc-800 active:from-zinc-800 active:to-zinc-950' : 'cursor-not-allowed opacity-40'} ${i >= 10 ? 'px-0.5 text-[7px] sm:text-[8px]' : 'text-[7px] sm:text-[9px]'}`,
                                                        children: i
                                                    }, i, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1839,
                                                        columnNumber: 37
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1833,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-f8a3d821707958e7" + " " + "grid grid-cols-3 gap-0.5 sm:gap-1.5",
                                                children: [
                                                    10,
                                                    11,
                                                    12
                                                ].map((i)=>{
                                                    const entry = padsAnimaciones[i - 1];
                                                    const animId = entry?.[0];
                                                    const canFire = !!(animId && animacionesMarcador[animId]?.url);
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                                        type: "button",
                                                        title: entry?.[1]?.nombre ? `${i}: ${entry[1].nombre}` : `Pad ${i}`,
                                                        disabled: !canFire,
                                                        whileHover: canFire ? {
                                                            scale: 1.02,
                                                            boxShadow: '0 6px 20px -4px rgba(204,255,0,0.25)'
                                                        } : undefined,
                                                        whileTap: canFire ? {
                                                            scale: 0.92,
                                                            boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.4)'
                                                        } : undefined,
                                                        onClick: ()=>animId && canFire && dispararAnimacionMarcador(`cancha_${matchCourt}`, animId),
                                                        className: `aspect-square min-h-[22px] rounded-md border border-white/20 bg-gradient-to-b from-zinc-700/90 to-zinc-900 font-black tabular-nums text-white/90 shadow-[0_3px_8px_-2px_rgba(0,0,0,0.5)] transition-colors sm:min-h-[28px] sm:rounded-lg ${canFire ? 'hover:border-padel-primary/40 hover:from-zinc-600/90 hover:to-zinc-800 active:from-zinc-800 active:to-zinc-950' : 'cursor-not-allowed opacity-40'} ${i >= 10 ? 'px-0.5 text-[7px] sm:text-[8px]' : 'text-[7px] sm:text-[9px]'}`,
                                                        children: i
                                                    }, i, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 1860,
                                                        columnNumber: 37
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1854,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1832,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                lineNumber: 1750,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                        lineNumber: 1618,
                        columnNumber: 17
                    }, this),
                    Object.keys(animacionesMarcador).length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-f8a3d821707958e7" + " " + "flex w-full min-w-0 shrink-0 flex-col gap-1 self-start rounded-lg border border-white/10 bg-black/30 p-1.5 sm:rounded-xl sm:p-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-f8a3d821707958e7" + " " + "text-[7px] font-black uppercase tracking-widest text-gray-500 sm:text-[8px]",
                                children: "Animaciones pizarra"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                lineNumber: 1881,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-f8a3d821707958e7" + " " + "grid w-full min-w-0 grid-cols-4 gap-1 md:grid-cols-6",
                                children: Object.entries(animacionesMarcador).sort((a, b)=>a[0].localeCompare(b[0])).map(([animId, a])=>{
                                    const label = a.nombre || animId;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                        type: "button",
                                        title: label,
                                        whileHover: {
                                            scale: 1.03
                                        },
                                        whileTap: {
                                            scale: 0.97
                                        },
                                        onClick: ()=>dispararAnimacionMarcador(`cancha_${matchCourt}`, animId),
                                        className: "flex min-h-[2.1rem] min-w-0 flex-col items-center justify-center gap-0.5 rounded-md border border-white/10 bg-white/5 px-1 py-0.5 text-center transition-colors hover:border-padel-primary/30 hover:bg-padel-primary/10 sm:min-h-[2.35rem] sm:rounded-lg sm:px-1.5 sm:py-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                className: "h-2.5 w-2.5 shrink-0 text-padel-primary sm:h-3 sm:w-3"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1897,
                                                columnNumber: 45
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-f8a3d821707958e7" + " " + "w-full max-w-full break-words text-[6px] font-black uppercase leading-tight tracking-tighter text-padel-primary line-clamp-2 sm:text-[7px]",
                                                children: label
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 1898,
                                                columnNumber: 45
                                            }, this)
                                        ]
                                    }, animId, true, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1888,
                                        columnNumber: 41
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                lineNumber: 1882,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                        lineNumber: 1880,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                lineNumber: 1617,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "jsx-f8a3d821707958e7" + " " + "relative z-10 flex h-11 shrink-0 items-center justify-between gap-3 rounded-[1rem] px-3 shadow-2xl glass sm:h-12 sm:gap-6 sm:rounded-[1.2rem] sm:px-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        whileHover: {
                            scale: 1.02
                        },
                        whileTap: {
                            scale: 0.98
                        },
                        onClick: ()=>setIsGoldenPoint(!isGoldenPoint),
                        className: `flex-[0.6] flex items-center justify-between px-5 py-2.5 rounded-[1.5rem] border transition-all duration-500 cursor-pointer ${isGoldenPoint ? 'bg-padel-primary/10 border-padel-primary/30 shadow-[0_0_20px_rgba(204,255,0,0.1)]' : 'bg-white/[0.03] border-white/10'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-f8a3d821707958e7" + " " + "flex flex-col",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "jsx-f8a3d821707958e7" + " " + `text-[9px] font-black italic uppercase tracking-[0.25em] ${isGoldenPoint ? 'text-padel-primary' : 'text-gray-500'}`,
                                    children: "Golden Point"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                    lineNumber: 1922,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                lineNumber: 1921,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-f8a3d821707958e7" + " " + "relative w-10 h-5 bg-black/60 rounded-full border border-white/10 p-0.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                    animate: {
                                        x: isGoldenPoint ? 20 : 0,
                                        backgroundColor: isGoldenPoint ? '#ccff00' : '#444'
                                    },
                                    className: "w-4 h-4 rounded-full"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                    lineNumber: 1925,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                lineNumber: 1924,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                        lineNumber: 1912,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-f8a3d821707958e7" + " " + "flex-[1.4] flex items-center gap-4 h-full",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-f8a3d821707958e7" + " " + "h-8 w-px bg-white/5 mx-2"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                lineNumber: 1937,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RefereeRemoteControl$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                onTeamAPoint: ()=>updateScore('t1', 'plus'),
                                onTeamBPoint: ()=>updateScore('t2', 'plus'),
                                onUndo: undoPoint
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                lineNumber: 1939,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                        lineNumber: 1936,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-f8a3d821707958e7" + " " + "flex-1 flex items-center justify-end gap-6 h-full",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-f8a3d821707958e7" + " " + "flex flex-col items-end",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "jsx-f8a3d821707958e7" + " " + "text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1",
                                    children: "Status"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                    lineNumber: 1950,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-f8a3d821707958e7" + " " + "flex items-center gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-f8a3d821707958e7" + " " + "w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                            lineNumber: 1952,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "jsx-f8a3d821707958e7" + " " + "text-xs font-bold text-white/60",
                                            children: "Cloud Sync Active"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                            lineNumber: 1953,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                    lineNumber: 1951,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                            lineNumber: 1949,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                        lineNumber: 1948,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                lineNumber: 1910,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: [
                    isMedicalTimeout && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0
                        },
                        animate: {
                            opacity: 1
                        },
                        exit: {
                            opacity: 0,
                            transition: {
                                duration: 0.4
                            }
                        },
                        className: "fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden",
                        style: {
                            background: 'radial-gradient(ellipse at center, #1a0000 0%, #000 70%)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                animate: {
                                    opacity: [
                                        0.08,
                                        0.18,
                                        0.08
                                    ]
                                },
                                transition: {
                                    duration: 2.5,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                },
                                className: "absolute inset-0",
                                style: {
                                    background: 'radial-gradient(ellipse at center, #dc2626 0%, transparent 70%)'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                lineNumber: 1972,
                                columnNumber: 25
                            }, this),
                            [
                                0,
                                1,
                                2,
                                3
                            ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                    className: "absolute rounded-full border border-red-600/40",
                                    initial: {
                                        width: 80,
                                        height: 80,
                                        opacity: 0.9
                                    },
                                    animate: {
                                        width: 700,
                                        height: 700,
                                        opacity: 0
                                    },
                                    transition: {
                                        duration: 3.5,
                                        repeat: Infinity,
                                        delay: i * 0.85,
                                        ease: 'easeOut'
                                    }
                                }, i, false, {
                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                    lineNumber: 1981,
                                    columnNumber: 29
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-f8a3d821707958e7" + " " + "relative flex items-center justify-center z-10 mb-10",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                        animate: {
                                            scale: [
                                                1,
                                                1.3,
                                                1
                                            ],
                                            opacity: [
                                                0.4,
                                                0.8,
                                                0.4
                                            ]
                                        },
                                        transition: {
                                            duration: 1.8,
                                            repeat: Infinity,
                                            ease: 'easeInOut'
                                        },
                                        className: "absolute w-40 h-40 rounded-full blur-3xl",
                                        style: {
                                            backgroundColor: '#dc2626'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 1998,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].svg, {
                                        viewBox: "0 0 80 80",
                                        className: "w-32 h-32 relative z-10",
                                        animate: {
                                            scale: [
                                                1,
                                                1.06,
                                                1
                                            ]
                                        },
                                        transition: {
                                            duration: 1.4,
                                            repeat: Infinity,
                                            ease: 'easeInOut'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                x: "30",
                                                y: "5",
                                                width: "20",
                                                height: "70",
                                                rx: "5",
                                                fill: "#dc2626",
                                                className: "jsx-f8a3d821707958e7"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 2011,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                x: "5",
                                                y: "30",
                                                width: "70",
                                                height: "20",
                                                rx: "5",
                                                fill: "#dc2626",
                                                className: "jsx-f8a3d821707958e7"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 2012,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                x: "30",
                                                y: "5",
                                                width: "8",
                                                height: "70",
                                                rx: "5",
                                                fill: "white",
                                                opacity: "0.15",
                                                className: "jsx-f8a3d821707958e7"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 2014,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                x: "5",
                                                y: "30",
                                                width: "70",
                                                height: "8",
                                                rx: "5",
                                                fill: "white",
                                                opacity: "0.15",
                                                className: "jsx-f8a3d821707958e7"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 2015,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 2005,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                lineNumber: 1996,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-f8a3d821707958e7" + " " + "relative z-10 text-center space-y-3 mb-12 px-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].h2, {
                                        animate: {
                                            opacity: [
                                                1,
                                                0.6,
                                                1
                                            ]
                                        },
                                        transition: {
                                            duration: 2.2,
                                            repeat: Infinity
                                        },
                                        className: "text-5xl font-black uppercase tracking-tighter text-white",
                                        style: {
                                            textShadow: '0 0 40px rgba(220,38,38,0.8)'
                                        },
                                        children: "Asistencia Médica"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 2021,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                        className: "flex items-center justify-center gap-2",
                                        animate: {
                                            opacity: [
                                                1,
                                                0.3,
                                                1
                                            ]
                                        },
                                        transition: {
                                            duration: 1.1,
                                            repeat: Infinity
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-f8a3d821707958e7" + " " + "w-2 h-2 rounded-full bg-red-500"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 2034,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-f8a3d821707958e7" + " " + "text-red-400 font-black uppercase tracking-[0.4em] text-xs",
                                                children: "Partido en pausa"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 2035,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-f8a3d821707958e7" + " " + "w-2 h-2 rounded-full bg-red-500"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 2038,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 2029,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                lineNumber: 2020,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                className: "absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent z-10",
                                animate: {
                                    top: [
                                        '10%',
                                        '90%',
                                        '10%'
                                    ]
                                },
                                transition: {
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: 'linear'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                lineNumber: 2043,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                onClick: handleMedicalTimeout,
                                whileTap: {
                                    scale: 0.95
                                },
                                whileHover: {
                                    scale: 1.04
                                },
                                className: "relative z-20 px-14 py-5 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.25em] shadow-2xl text-sm",
                                style: {
                                    boxShadow: '0 0 40px rgba(255,255,255,0.2)'
                                },
                                children: "▶ Reanudar Partido"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                lineNumber: 2050,
                                columnNumber: 25
                            }, this),
                            [
                                ...Array(12)
                            ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                    className: "absolute w-1 h-1 rounded-full bg-red-500/60",
                                    style: {
                                        left: `${8 + i * 7.5}%`,
                                        bottom: '-10px'
                                    },
                                    animate: {
                                        y: [
                                            0,
                                            -(300 + i % 4 * 80)
                                        ],
                                        opacity: [
                                            0,
                                            0.8,
                                            0
                                        ],
                                        x: [
                                            0,
                                            (i % 2 === 0 ? 1 : -1) * (10 + i * 3)
                                        ]
                                    },
                                    transition: {
                                        duration: 3.5 + i % 4 * 0.6,
                                        repeat: Infinity,
                                        delay: i * 0.28,
                                        ease: 'easeOut'
                                    }
                                }, i, false, {
                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                    lineNumber: 2062,
                                    columnNumber: 29
                                }, this))
                        ]
                    }, "medical-overlay", true, {
                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                        lineNumber: 1963,
                        columnNumber: 21
                    }, this),
                    showMatchSelector && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0
                        },
                        animate: {
                            opacity: 1
                        },
                        exit: {
                            opacity: 0
                        },
                        className: "fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6",
                        onClick: ()=>setShowMatchSelector(false),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                scale: 0.9,
                                y: 20
                            },
                            animate: {
                                scale: 1,
                                y: 0
                            },
                            className: "bg-[#111] border border-white/10 rounded-[3rem] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col",
                            onClick: (e)=>e.stopPropagation(),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-f8a3d821707958e7" + " " + "p-8 border-b border-white/5 flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-f8a3d821707958e7",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "jsx-f8a3d821707958e7" + " " + "text-2xl font-black italic uppercase tracking-tighter",
                                                    children: "Cambiar de cancha"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 2103,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-f8a3d821707958e7" + " " + "text-xs font-black italic text-padel-primary uppercase tracking-[0.2em] mt-1",
                                                    children: "Pista libre (en vivo) o intercambio con un partido por comenzar"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 2104,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                            lineNumber: 2102,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setShowMatchSelector(false),
                                            className: "jsx-f8a3d821707958e7" + " " + "p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all text-gray-500",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                                className: "w-5 h-5"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 2109,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                            lineNumber: 2108,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                    lineNumber: 2101,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-f8a3d821707958e7" + " " + "flex-1 overflow-y-auto p-8 space-y-6",
                                    children: [
                                        match?.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].LIVE && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-f8a3d821707958e7" + " " + "space-y-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-f8a3d821707958e7" + " " + "text-[10px] font-black uppercase tracking-widest text-white/40",
                                                    children: "Trasladar a pista libre"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 2116,
                                                    columnNumber: 41
                                                }, this),
                                                vacantCourts.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-f8a3d821707958e7" + " " + "text-sm text-white/35 italic py-4 text-center",
                                                    children: "No hay pistas libres (todas tienen un partido en vivo u ocupadas en el calendario de pistas)."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 2120,
                                                    columnNumber: 45
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-f8a3d821707958e7" + " " + "grid gap-3 sm:grid-cols-2",
                                                    children: vacantCourts.map((c)=>{
                                                        const label = Array.isArray(tournament?.courtNames) && tournament.courtNames[c - 1] ? tournament.courtNames[c - 1] : `Pista ${c}`;
                                                        const busy = courtMoveBusy === c;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            disabled: courtMoveBusy !== null || !!swappingCourtWith,
                                                            onClick: ()=>changeMatchCourt(c),
                                                            className: "jsx-f8a3d821707958e7" + " " + "p-5 rounded-2xl border border-brand/30 bg-brand/5 text-left hover:bg-brand/10 transition-all disabled:opacity-40 disabled:pointer-events-none",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-f8a3d821707958e7" + " " + "flex items-center justify-between gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-f8a3d821707958e7",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "jsx-f8a3d821707958e7" + " " + "text-[10px] font-black text-white/50 uppercase tracking-widest",
                                                                                children: "Vacante · LIVE"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                                lineNumber: 2141,
                                                                                columnNumber: 69
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "jsx-f8a3d821707958e7" + " " + "text-lg font-black text-brand mt-1",
                                                                                children: label
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                                lineNumber: 2144,
                                                                                columnNumber: 69
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                        lineNumber: 2140,
                                                                        columnNumber: 65
                                                                    }, this),
                                                                    busy ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                                        className: "w-5 h-5 text-brand animate-spin shrink-0"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                        lineNumber: 2147,
                                                                        columnNumber: 69
                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-f8a3d821707958e7" + " " + "text-[10px] font-black text-brand uppercase tracking-widest shrink-0",
                                                                        children: "Trasladar"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                        lineNumber: 2149,
                                                                        columnNumber: 69
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                lineNumber: 2139,
                                                                columnNumber: 61
                                                            }, this)
                                                        }, c, false, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 2132,
                                                            columnNumber: 57
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 2124,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                            lineNumber: 2115,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-f8a3d821707958e7" + " " + "border-t border-white/10 pt-6 space-y-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "jsx-f8a3d821707958e7" + " " + "text-[10px] font-black uppercase tracking-widest text-white/40",
                                                children: "Intercambiar con partido pendiente"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 2163,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                            lineNumber: 2162,
                                            columnNumber: 33
                                        }, this),
                                        tournament?.matches?.filter((m)=>m.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].PENDING && m.id !== match?.id).map((m)=>{
                                            const otherCourt = m.court ?? (m.courtIndex != null ? m.courtIndex + 1 : '-');
                                            const courtLabel = m.courtName ?? (m.court != null ? `Pista ${m.court}` : m.courtIndex != null ? `Pista ${m.courtIndex + 1}` : 'Pista –');
                                            const isSwapping = swappingCourtWith === m.id;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                disabled: !!swappingCourtWith || courtMoveBusy !== null,
                                                onClick: ()=>swapCourtWithPendingMatch(m),
                                                className: "jsx-f8a3d821707958e7" + " " + "w-full p-6 rounded-3xl border text-left transition-all bg-white/5 border-white/5 hover:bg-white/10 disabled:opacity-50 disabled:pointer-events-none",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-f8a3d821707958e7" + " " + "flex items-center justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-f8a3d821707958e7" + " " + "flex items-center gap-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-f8a3d821707958e7" + " " + "w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-f8a3d821707958e7" + " " + "text-lg font-black italic",
                                                                        children: otherCourt
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                        lineNumber: 2181,
                                                                        columnNumber: 57
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                    lineNumber: 2180,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-f8a3d821707958e7",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "jsx-f8a3d821707958e7" + " " + "block text-[10px] font-black italic text-gray-500 uppercase tracking-widest",
                                                                            children: [
                                                                                courtLabel,
                                                                                " · Por comenzar"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                            lineNumber: 2184,
                                                                            columnNumber: 57
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "jsx-f8a3d821707958e7" + " " + "block text-sm font-bold uppercase truncate max-w-[300px]",
                                                                            children: [
                                                                                tournament.teams?.[m.team1Index - 1]?.p1?.name || m.team1?.p1Name || 'Eq 1',
                                                                                " vs ",
                                                                                tournament.teams?.[m.team2Index - 1]?.p1?.name || m.team2?.p1Name || 'Eq 2'
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                            lineNumber: 2185,
                                                                            columnNumber: 57
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                    lineNumber: 2183,
                                                                    columnNumber: 53
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 2179,
                                                            columnNumber: 49
                                                        }, this),
                                                        isSwapping ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                            className: "w-5 h-5 text-padel-primary animate-spin"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 2191,
                                                            columnNumber: 53
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-f8a3d821707958e7" + " " + "text-[10px] font-black text-padel-primary uppercase tracking-widest",
                                                            children: "Intercambiar"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 2193,
                                                            columnNumber: 53
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 2178,
                                                    columnNumber: 45
                                                }, this)
                                            }, m.id, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 2172,
                                                columnNumber: 41
                                            }, this);
                                        }),
                                        tournament?.matches?.filter((m)=>m.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].PENDING && m.id !== match?.id).length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-f8a3d821707958e7" + " " + "text-center py-20 opacity-30 italic font-black uppercase text-sm tracking-widest",
                                            children: "No hay partidos pendientes para intercambiar"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                            lineNumber: 2200,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                    lineNumber: 2113,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                            lineNumber: 2095,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                        lineNumber: 2088,
                        columnNumber: 21
                    }, this),
                    showAdjustModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0
                        },
                        animate: {
                            opacity: 1
                        },
                        exit: {
                            opacity: 0
                        },
                        className: "fixed inset-0 z-[400] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6",
                        onClick: ()=>setShowAdjustModal(false),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                scale: 0.9,
                                y: 30
                            },
                            animate: {
                                scale: 1,
                                y: 0
                            },
                            className: "bg-[#111] border border-white/10 rounded-[3rem] w-full max-w-xl overflow-hidden flex flex-col",
                            onClick: (e)=>e.stopPropagation(),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-f8a3d821707958e7" + " " + "p-6 border-b border-white/5 flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-f8a3d821707958e7",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "jsx-f8a3d821707958e7" + " " + "text-2xl font-black italic uppercase tracking-tighter text-white",
                                                    children: "Score Adjustment"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 2223,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-f8a3d821707958e7" + " " + "text-[10px] font-black italic text-gray-500 uppercase tracking-widest mt-1",
                                                    children: "Manual correction of games and sets"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 2224,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                            lineNumber: 2222,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setShowAdjustModal(false),
                                            className: "jsx-f8a3d821707958e7" + " " + "p-4 bg-white/5 rounded-full hover:bg-white/10 transition-all text-gray-400",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                className: "w-6 h-6"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 2227,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                            lineNumber: 2226,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                    lineNumber: 2221,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-f8a3d821707958e7" + " " + "p-6 space-y-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-f8a3d821707958e7" + " " + "space-y-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-f8a3d821707958e7" + " " + "flex items-center gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-f8a3d821707958e7" + " " + "w-2 h-8 bg-padel-primary rounded-full"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 2235,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-f8a3d821707958e7" + " " + "text-lg font-black italic uppercase tracking-tighter text-white truncate",
                                                            children: match.team1.full
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 2236,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 2234,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-f8a3d821707958e7" + " " + "grid grid-cols-3 gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-f8a3d821707958e7" + " " + "bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-f8a3d821707958e7" + " " + "text-[10px] font-black uppercase text-gray-500 tracking-widest",
                                                                    children: "Puntos"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                    lineNumber: 2240,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-f8a3d821707958e7" + " " + "flex items-center gap-4",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                        value: match.points?.t1 || '0',
                                                                        onChange: (e)=>updateManualScore('t1', 'points', e.target.value),
                                                                        className: "jsx-f8a3d821707958e7" + " " + "bg-black border border-white/10 rounded-lg px-2 py-1 text-xl font-black italic text-padel-primary outline-none",
                                                                        children: [
                                                                            '0',
                                                                            '15',
                                                                            '30',
                                                                            '40',
                                                                            'AD'
                                                                        ].map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: p,
                                                                                className: "jsx-f8a3d821707958e7",
                                                                                children: p
                                                                            }, p, false, {
                                                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                                lineNumber: 2247,
                                                                                columnNumber: 93
                                                                            }, this))
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                        lineNumber: 2242,
                                                                        columnNumber: 49
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                    lineNumber: 2241,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 2239,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-f8a3d821707958e7" + " " + "bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-f8a3d821707958e7" + " " + "text-[10px] font-black uppercase text-gray-500 tracking-widest",
                                                                    children: "Juegos"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                    lineNumber: 2252,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-f8a3d821707958e7" + " " + "flex items-center gap-4",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>updateManualScore('t1', 'games', (match.games?.t1 || 0) - 1),
                                                                            className: "jsx-f8a3d821707958e7" + " " + "w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white active:scale-90",
                                                                            children: "-"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                            lineNumber: 2254,
                                                                            columnNumber: 49
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "jsx-f8a3d821707958e7" + " " + "text-2xl font-black italic text-padel-primary",
                                                                            children: match.games?.t1 || 0
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                            lineNumber: 2255,
                                                                            columnNumber: 49
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>updateManualScore('t1', 'games', (match.games?.t1 || 0) + 1),
                                                                            className: "jsx-f8a3d821707958e7" + " " + "w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white active:scale-90",
                                                                            children: "+"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                            lineNumber: 2256,
                                                                            columnNumber: 49
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                    lineNumber: 2253,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 2251,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-f8a3d821707958e7" + " " + "bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-f8a3d821707958e7" + " " + "text-[10px] font-black uppercase text-gray-500 tracking-widest",
                                                                    children: "Sets"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                    lineNumber: 2260,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-f8a3d821707958e7" + " " + "flex items-center gap-4",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>updateManualScore('t1', 'sets', (match.sets?.t1 || 0) - 1),
                                                                            className: "jsx-f8a3d821707958e7" + " " + "w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white active:scale-90",
                                                                            children: "-"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                            lineNumber: 2262,
                                                                            columnNumber: 49
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "jsx-f8a3d821707958e7" + " " + "text-2xl font-black italic text-white",
                                                                            children: match.sets?.t1 || 0
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                            lineNumber: 2263,
                                                                            columnNumber: 49
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>updateManualScore('t1', 'sets', (match.sets?.t1 || 0) + 1),
                                                                            className: "jsx-f8a3d821707958e7" + " " + "w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white active:scale-90",
                                                                            children: "+"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                            lineNumber: 2264,
                                                                            columnNumber: 49
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                    lineNumber: 2261,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 2259,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 2238,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                            lineNumber: 2233,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-f8a3d821707958e7" + " " + "space-y-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-f8a3d821707958e7" + " " + "flex items-center gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-f8a3d821707958e7" + " " + "w-2 h-8 bg-gray-600 rounded-full"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 2273,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-f8a3d821707958e7" + " " + "text-lg font-black italic uppercase tracking-tighter text-white truncate",
                                                            children: match.team2.full
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 2274,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 2272,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-f8a3d821707958e7" + " " + "grid grid-cols-3 gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-f8a3d821707958e7" + " " + "bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-f8a3d821707958e7" + " " + "text-[10px] font-black uppercase text-gray-500 tracking-widest",
                                                                    children: "Puntos"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                    lineNumber: 2278,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-f8a3d821707958e7" + " " + "flex items-center gap-4",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                        value: match.points?.t2 || '0',
                                                                        onChange: (e)=>updateManualScore('t2', 'points', e.target.value),
                                                                        className: "jsx-f8a3d821707958e7" + " " + "bg-black border border-white/10 rounded-lg px-2 py-1 text-xl font-black italic text-padel-primary outline-none",
                                                                        children: [
                                                                            '0',
                                                                            '15',
                                                                            '30',
                                                                            '40',
                                                                            'AD'
                                                                        ].map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: p,
                                                                                className: "jsx-f8a3d821707958e7",
                                                                                children: p
                                                                            }, p, false, {
                                                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                                lineNumber: 2285,
                                                                                columnNumber: 93
                                                                            }, this))
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                        lineNumber: 2280,
                                                                        columnNumber: 49
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                    lineNumber: 2279,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 2277,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-f8a3d821707958e7" + " " + "bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-f8a3d821707958e7" + " " + "text-[10px] font-black uppercase text-gray-500 tracking-widest",
                                                                    children: "Juegos"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                    lineNumber: 2290,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-f8a3d821707958e7" + " " + "flex items-center gap-4",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>updateManualScore('t2', 'games', (match.games?.t2 || 0) - 1),
                                                                            className: "jsx-f8a3d821707958e7" + " " + "w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white active:scale-90",
                                                                            children: "-"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                            lineNumber: 2292,
                                                                            columnNumber: 49
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "jsx-f8a3d821707958e7" + " " + "text-2xl font-black italic text-padel-primary",
                                                                            children: match.games?.t2 || 0
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                            lineNumber: 2293,
                                                                            columnNumber: 49
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>updateManualScore('t2', 'games', (match.games?.t2 || 0) + 1),
                                                                            className: "jsx-f8a3d821707958e7" + " " + "w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white active:scale-90",
                                                                            children: "+"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                            lineNumber: 2294,
                                                                            columnNumber: 49
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                    lineNumber: 2291,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 2289,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-f8a3d821707958e7" + " " + "bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-f8a3d821707958e7" + " " + "text-[10px] font-black uppercase text-gray-500 tracking-widest",
                                                                    children: "Sets"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                    lineNumber: 2298,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-f8a3d821707958e7" + " " + "flex items-center gap-4",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>updateManualScore('t2', 'sets', (match.sets?.t2 || 0) - 1),
                                                                            className: "jsx-f8a3d821707958e7" + " " + "w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white active:scale-90",
                                                                            children: "-"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                            lineNumber: 2300,
                                                                            columnNumber: 49
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "jsx-f8a3d821707958e7" + " " + "text-2xl font-black italic text-white",
                                                                            children: match.sets?.t2 || 0
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                            lineNumber: 2301,
                                                                            columnNumber: 49
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>updateManualScore('t2', 'sets', (match.sets?.t2 || 0) + 1),
                                                                            className: "jsx-f8a3d821707958e7" + " " + "w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white active:scale-90",
                                                                            children: "+"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                            lineNumber: 2302,
                                                                            columnNumber: 49
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                                    lineNumber: 2299,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 2297,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 2276,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                            lineNumber: 2271,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-f8a3d821707958e7" + " " + "space-y-4 pt-4 border-t border-white/5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-f8a3d821707958e7" + " " + "text-[10px] font-black uppercase text-gray-500 tracking-widest",
                                                    children: "Super tie-break (STB)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 2310,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-f8a3d821707958e7" + " " + "text-[9px] text-gray-600 leading-relaxed",
                                                    children: "Solo aplica al desempate final a 2 sets. El tie-break de set va siempre a 7 con diferencia de 2."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 2311,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-f8a3d821707958e7" + " " + "grid grid-cols-2 gap-4",
                                                    children: [
                                                        7,
                                                        10
                                                    ].map((val)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setSuperTiebreakTarget(val),
                                                            className: "jsx-f8a3d821707958e7" + " " + `py-4 rounded-2xl border font-black italic uppercase text-xs transition-all ${superTiebreakTarget === val ? 'bg-padel-primary text-black border-padel-primary shadow-[0_0_20px_rgba(204,255,0,0.2)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`,
                                                            children: [
                                                                "STB a ",
                                                                val,
                                                                " pts"
                                                            ]
                                                        }, val, true, {
                                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                            lineNumber: 2314,
                                                            columnNumber: 45
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 2312,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                            lineNumber: 2309,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                    lineNumber: 2231,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-f8a3d821707958e7" + " " + "p-6 bg-white/[0.02] border-t border-white/5 flex gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: async ()=>{
                                                if (!confirm('¿Resetear marcador de este partido?')) return;
                                                try {
                                                    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(id, match.id, {
                                                        points: {
                                                            t1: '0',
                                                            t2: '0'
                                                        },
                                                        games: {
                                                            t1: 0,
                                                            t2: 0
                                                        },
                                                        sets: {
                                                            t1: 0,
                                                            t2: 0
                                                        },
                                                        setScores: [],
                                                        isTiebreak: false,
                                                        superTiebreak: false,
                                                        superTiebreakScore: null,
                                                        status: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].PENDING,
                                                        startedAt: null,
                                                        finishedAt: null
                                                    });
                                                    setMatch((prev)=>prev ? {
                                                            ...prev,
                                                            points: {
                                                                t1: '0',
                                                                t2: '0'
                                                            },
                                                            games: {
                                                                t1: 0,
                                                                t2: 0
                                                            },
                                                            sets: {
                                                                t1: 0,
                                                                t2: 0
                                                            },
                                                            setScores: [],
                                                            isTiebreak: false,
                                                            superTiebreak: false,
                                                            superTiebreakScore: null,
                                                            status: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].PENDING,
                                                            startedAt: null,
                                                            finishedAt: null
                                                        } : prev);
                                                    setShowAdjustModal(false);
                                                } catch (e) {
                                                    console.error('Reset match:', e);
                                                }
                                            },
                                            className: "jsx-f8a3d821707958e7" + " " + "flex-1 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:bg-red-500/20 transition-all border border-red-500/10",
                                            children: "Reset Match"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                            lineNumber: 2330,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setShowAdjustModal(false),
                                            className: "jsx-f8a3d821707958e7" + " " + "flex-1 py-4 bg-white text-black rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all",
                                            children: "Close"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                            lineNumber: 2368,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                    lineNumber: 2329,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                            lineNumber: 2215,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                        lineNumber: 2208,
                        columnNumber: 21
                    }, this),
                    showNameModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0
                        },
                        animate: {
                            opacity: 1
                        },
                        exit: {
                            opacity: 0
                        },
                        className: "fixed inset-0 z-[410] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6",
                        onClick: ()=>setShowNameModal(false),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                scale: 0.9,
                                y: 30
                            },
                            animate: {
                                scale: 1,
                                y: 0
                            },
                            className: "bg-[#111] border border-white/10 rounded-[3rem] w-full max-w-2xl overflow-hidden flex flex-col",
                            onClick: (e)=>e.stopPropagation(),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-f8a3d821707958e7" + " " + "p-6 border-b border-white/5 flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-f8a3d821707958e7",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "jsx-f8a3d821707958e7" + " " + "text-2xl font-black italic uppercase tracking-tighter text-white",
                                                    children: "Editar Nombres"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 2394,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-f8a3d821707958e7" + " " + "text-[10px] font-black italic text-gray-500 uppercase tracking-widest mt-1",
                                                    children: "Completa jugadores si la carga automática falla"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                    lineNumber: 2395,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                            lineNumber: 2393,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setShowNameModal(false),
                                            className: "jsx-f8a3d821707958e7" + " " + "p-4 bg-white/5 rounded-full hover:bg-white/10 transition-all text-gray-400",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                className: "w-6 h-6"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 2398,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                            lineNumber: 2397,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                    lineNumber: 2392,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-f8a3d821707958e7" + " " + "p-6 space-y-6",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-f8a3d821707958e7" + " " + "grid grid-cols-2 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-f8a3d821707958e7" + " " + "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "jsx-f8a3d821707958e7" + " " + "text-[10px] font-black uppercase tracking-widest text-gray-400",
                                                        children: "Jugador 1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 2405,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        value: nameDraft.t1p1,
                                                        onChange: (e)=>setNameDraft((p)=>({
                                                                    ...p,
                                                                    t1p1: e.target.value
                                                                })),
                                                        placeholder: "Jugador 1",
                                                        className: "jsx-f8a3d821707958e7" + " " + "w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none focus:border-padel-primary/60"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 2406,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 2404,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-f8a3d821707958e7" + " " + "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "jsx-f8a3d821707958e7" + " " + "text-[10px] font-black uppercase tracking-widest text-gray-400",
                                                        children: "Jugador 2"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 2414,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        value: nameDraft.t1p2,
                                                        onChange: (e)=>setNameDraft((p)=>({
                                                                    ...p,
                                                                    t1p2: e.target.value
                                                                })),
                                                        placeholder: "Jugador 2",
                                                        className: "jsx-f8a3d821707958e7" + " " + "w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none focus:border-padel-primary/60"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 2415,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 2413,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-f8a3d821707958e7" + " " + "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "jsx-f8a3d821707958e7" + " " + "text-[10px] font-black uppercase tracking-widest text-gray-400",
                                                        children: "Jugador 3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 2423,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        value: nameDraft.t2p1,
                                                        onChange: (e)=>setNameDraft((p)=>({
                                                                    ...p,
                                                                    t2p1: e.target.value
                                                                })),
                                                        placeholder: "Jugador 3",
                                                        className: "jsx-f8a3d821707958e7" + " " + "w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none focus:border-padel-primary/60"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 2424,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 2422,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-f8a3d821707958e7" + " " + "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "jsx-f8a3d821707958e7" + " " + "text-[10px] font-black uppercase tracking-widest text-gray-400",
                                                        children: "Jugador 4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 2432,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        value: nameDraft.t2p2,
                                                        onChange: (e)=>setNameDraft((p)=>({
                                                                    ...p,
                                                                    t2p2: e.target.value
                                                                })),
                                                        placeholder: "Jugador 4",
                                                        className: "jsx-f8a3d821707958e7" + " " + "w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none focus:border-padel-primary/60"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                        lineNumber: 2433,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                                lineNumber: 2431,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                        lineNumber: 2403,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                    lineNumber: 2402,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-f8a3d821707958e7" + " " + "p-6 bg-white/[0.02] border-t border-white/5 flex gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setShowNameModal(false),
                                            className: "jsx-f8a3d821707958e7" + " " + "flex-1 py-4 bg-white/10 text-white rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all",
                                            children: "Cancelar"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                            lineNumber: 2444,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: saveEditedNames,
                                            className: "jsx-f8a3d821707958e7" + " " + "flex-1 py-4 bg-padel-primary text-black rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all",
                                            children: "Guardar nombres"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                            lineNumber: 2450,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                                    lineNumber: 2443,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                            lineNumber: 2386,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                        lineNumber: 2379,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
                lineNumber: 1960,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "f8a3d821707958e7",
                children: "body{overscroll-behavior:none;background-color:#0a0a0a;overflow:hidden}@font-face{font-family:Inter;font-style:italic;font-weight:900;font-display:swap}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/tournaments/[id]/score/[matchId]/page.tsx",
        lineNumber: 1389,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__545b8fa7._.js.map