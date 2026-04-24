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
"[project]/src/components/BackButton.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BackButton",
    ()=>BackButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-ssr] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function BackButton({ href, ariaLabel = 'Volver', className = '' }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const baseClasses = 'w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-95 border border-white/15 text-gray-200';
    if (href) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            href: href,
            "aria-label": ariaLabel,
            className: `${baseClasses} ${className}`.trim(),
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                className: "w-5 h-5"
            }, void 0, false, {
                fileName: "[project]/src/components/BackButton.tsx",
                lineNumber: 26,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/BackButton.tsx",
            lineNumber: 21,
            columnNumber: 13
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: ()=>router.back(),
        "aria-label": ariaLabel,
        className: `${baseClasses} ${className}`.trim(),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
            className: "w-5 h-5"
        }, void 0, false, {
            fileName: "[project]/src/components/BackButton.tsx",
            lineNumber: 38,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/BackButton.tsx",
        lineNumber: 32,
        columnNumber: 9
    }, this);
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
"[project]/src/lib/tournamentPodium.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateStandingsFromMatches",
    ()=>calculateStandingsFromMatches,
    "getBracketStageLabel",
    ()=>getBracketStageLabel,
    "getPodiumDisplayLines",
    ()=>getPodiumDisplayLines,
    "resolveCategoryPodium",
    ()=>resolveCategoryPodium
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/tournament.ts [app-ssr] (ecmascript)");
;
function getBracketStageLabel(match) {
    if (!match) return '';
    if (match.stage === 'GROUP_STAGE') return 'Fase de Grupo';
    if (match.stage !== 'MAIN_DRAW') return 'Eliminatoria';
    if (match.roundName) {
        const name = String(match.roundName).toUpperCase();
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
function isMatchFinished(status) {
    return status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED || status === 'COMPLETED';
}
function calculateStandingsFromMatches(matches, tournament) {
    const standings = {};
    if (!Array.isArray(matches) || !tournament) return [];
    matches.filter((m)=>isMatchFinished(m.status)).forEach((m)=>{
        const isIndividual = tournament?.type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TournamentType"].AMERICANO_INDIVIDUAL;
        const updateStats = (id, name, photo, gamesWon, gamesLost, setsWon = 0, setsLost = 0)=>{
            if (!standings[id]) {
                standings[id] = {
                    id,
                    name,
                    photo,
                    gamesWon: 0,
                    gamesLost: 0,
                    setsWon: 0,
                    setsLost: 0,
                    matchesWon: 0,
                    matchesPlayed: 0
                };
            }
            standings[id].gamesWon += gamesWon;
            standings[id].gamesLost += gamesLost;
            standings[id].setsWon += setsWon;
            standings[id].setsLost += setsLost;
            standings[id].matchesPlayed += 1;
            if (setsWon > setsLost || setsWon === 0 && setsLost === 0 && gamesWon > gamesLost) {
                standings[id].matchesWon += 1;
            }
        };
        if (isIndividual) {
            const team1 = tournament.teams?.[m.team1Index - 1];
            const team2 = tournament.teams?.[m.team2Index - 1];
            if (team1) {
                updateStats(team1.p1?.id || `p-${m.team1Index}-1`, team1.p1?.name || `Jugador ${m.team1Index}-1`, team1.p1?.photo ?? null, m.games?.t1 || 0, m.games?.t2 || 0, m.sets?.t1 || 0, m.sets?.t2 || 0);
                updateStats(team1.p2?.id || `p-${m.team1Index}-2`, team1.p2?.name, team1.p2?.photo ?? null, m.games?.t1 || 0, m.games?.t2 || 0, m.sets?.t1 || 0, m.sets?.t2 || 0);
            }
            if (team2) {
                updateStats(team2.p1?.id || `p-${m.team2Index}-1`, team2.p1?.name || `Jugador ${m.team2Index}-1`, team2.p1?.photo ?? null, m.games?.t2 || 0, m.games?.t1 || 0, m.sets?.t2 || 0, m.sets?.t1 || 0);
                updateStats(team2.p2?.id || `p-${m.team2Index}-2`, team2.p2?.name || `Jugador ${m.team2Index}-2`, team2.p2?.photo ?? null, m.games?.t2 || 0, m.games?.t1 || 0, m.sets?.t2 || 0, m.sets?.t1 || 0);
            }
        } else {
            updateStats(`team-${m.team1Index}`, m.team1?.name || `Pareja ${m.team1Index}`, null, m.games?.t1 || 0, m.games?.t2 || 0, m.sets?.t1 || 0, m.sets?.t2 || 0);
            updateStats(`team-${m.team2Index}`, m.team2?.name || `Pareja ${m.team2Index}`, null, m.games?.t2 || 0, m.games?.t1 || 0, m.sets?.t2 || 0, m.sets?.t1 || 0);
        }
    });
    return Object.values(standings).sort((a, b)=>{
        if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;
        const diffSetsA = a.setsWon - a.setsLost;
        const diffSetsB = b.setsWon - b.setsLost;
        if (diffSetsB !== diffSetsA) return diffSetsB - diffSetsA;
        const diffGamesA = a.gamesWon - a.gamesLost;
        const diffGamesB = b.gamesWon - b.gamesLost;
        if (diffGamesB !== diffGamesA) return diffGamesB - diffGamesA;
        return b.gamesWon - a.gamesWon;
    });
}
/** Nombres de jugadores de la pareja (índice 1-based, alineado con partidos). */ function resolveTeamPlayerNames(tournament, teamIndex) {
    if (teamIndex == null || teamIndex < 1 || !Array.isArray(tournament?.teams)) return undefined;
    const team = tournament.teams[teamIndex - 1];
    if (!team || typeof team !== 'object') return undefined;
    const out = [
        team.p1?.name,
        team.p2?.name
    ].filter((n)=>Boolean(n && String(n).trim()));
    return out.length ? out : undefined;
}
function standingEntryPlayers(entry, tournament) {
    if (!tournament || !entry) return undefined;
    if (tournament.type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TournamentType"].AMERICANO_INDIVIDUAL) {
        return entry.name ? [
            String(entry.name)
        ] : undefined;
    }
    const id = String(entry.id ?? '');
    const m = id.match(/^team-(\d+)$/);
    if (m) return resolveTeamPlayerNames(tournament, Number(m[1]));
    return undefined;
}
function getPodiumDisplayLines(side) {
    if (side.players?.length) return side.players;
    const raw = String(side.name ?? '').trim();
    if (!raw) return [
        '—'
    ];
    const parts = raw.split(/\s*\/\s*|\s*&\s*|\s*\|\s*/).map((s)=>s.trim()).filter(Boolean);
    return parts.length > 1 ? parts : [
        raw
    ];
}
function pickWinnerFromFinal(finalMatch, tournament) {
    const s1 = finalMatch.sets?.t1 ?? 0;
    const s2 = finalMatch.sets?.t2 ?? 0;
    const g1 = finalMatch.games?.t1 ?? 0;
    const g2 = finalMatch.games?.t2 ?? 0;
    let winnerSide = 't1';
    if (s2 > s1) winnerSide = 't2';
    else if (s1 === s2 && g2 > g1) winnerSide = 't2';
    const winIdx = winnerSide === 't1' ? finalMatch.team1Index : finalMatch.team2Index;
    const loseIdx = winnerSide === 't1' ? finalMatch.team2Index : finalMatch.team1Index;
    const winName = (winnerSide === 't1' ? finalMatch.team1?.name : finalMatch.team2?.name) || `Pareja ${winIdx ?? '?'}`;
    const loseName = (winnerSide === 't1' ? finalMatch.team2?.name : finalMatch.team1?.name) || `Pareja ${loseIdx ?? '?'}`;
    return {
        first: {
            name: winName,
            players: resolveTeamPlayerNames(tournament, winIdx)
        },
        second: {
            name: loseName,
            players: resolveTeamPlayerNames(tournament, loseIdx)
        },
        source: 'final'
    };
}
function resolveCategoryPodium(matches, tournament) {
    const list = Array.isArray(matches) ? matches : [];
    const mainFinished = list.filter((m)=>isMatchFinished(m.status) && m.stage === 'MAIN_DRAW');
    let finalMatch = mainFinished.find((m)=>getBracketStageLabel(m) === 'Final');
    if (!finalMatch && mainFinished.length) {
        const bracketed = mainFinished.filter((m)=>m.bracketPosition?.round != null);
        if (bracketed.length) {
            const maxR = Math.max(...bracketed.map((m)=>m.bracketPosition.round));
            const lastRound = bracketed.filter((m)=>m.bracketPosition.round === maxR);
            if (lastRound.length === 1) finalMatch = lastRound[0];
        }
    }
    if (finalMatch) {
        return pickWinnerFromFinal(finalMatch, tournament);
    }
    if (!tournament) return null;
    const standings = calculateStandingsFromMatches(list, tournament);
    if (standings.length === 0) return null;
    return {
        first: {
            name: standings[0].name,
            players: standingEntryPlayers(standings[0], tournament)
        },
        second: standings.length > 1 ? {
            name: standings[1].name,
            players: standingEntryPlayers(standings[1], tournament)
        } : undefined,
        source: 'standings'
    };
}
}),
"[project]/src/lib/playerFichaName.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Formato de ficha (pizarra / listados): primer nombre, inicial del segundo nombre,
 * primer apellido. Ej.: "Juan Carlos García López" → "Juan C. García".
 * Con 2 tokens: nombre + apellido tal cual.
 */ __turbopack_context__.s([
    "formatPlayerFichaName",
    ()=>formatPlayerFichaName
]);
function formatPlayerFichaName(raw) {
    const name = (raw || '').trim();
    if (!name) return '';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return name;
    const first = parts[0];
    const lowerFirst = first.toLowerCase();
    if (lowerFirst === 'jugador' || lowerFirst === 'pareja' || lowerFirst === 'equipo') {
        return name;
    }
    if (/^\d+$/.test(parts[parts.length - 1])) {
        return name;
    }
    if (parts.length === 2) {
        return `${parts[0]} ${parts[1]}`;
    }
    const secondInitial = parts[1].charAt(0).toUpperCase();
    const firstSurname = parts[2];
    return `${first} ${secondInitial}. ${firstSurname}`;
}
}),
"[project]/src/app/tournaments/event/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CAT_COLORS",
    ()=>CAT_COLORS,
    "KNOWN_COMPLEXES",
    ()=>KNOWN_COMPLEXES,
    "PENDING_LATER_COLORS",
    ()=>PENDING_LATER_COLORS,
    "PENDING_NEXT_COLORS",
    ()=>PENDING_NEXT_COLORS,
    "STATUS_COLORS",
    ()=>STATUS_COLORS,
    "TABS",
    ()=>TABS,
    "calcGroupStanding",
    ()=>calcGroupStanding,
    "compareMatchesTodosView",
    ()=>compareMatchesTodosView,
    "formatCategory",
    ()=>formatCategory,
    "formatDateDDMM",
    ()=>formatDateDDMM,
    "formatDisplayName",
    ()=>formatDisplayName,
    "formatGender",
    ()=>formatGender,
    "formatHHMM",
    ()=>formatHHMM,
    "getMatchPhaseSortOrder",
    ()=>getMatchPhaseSortOrder,
    "isRealName",
    ()=>isRealName,
    "resolveTeamNames",
    ()=>resolveTeamNames,
    "toMinute",
    ()=>toMinute,
    "toMs",
    ()=>toMs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/tournament.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$playerFichaName$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/playerFichaName.ts [app-ssr] (ecmascript)");
;
;
const toMs = (v)=>{
    if (!v) return 0;
    if (v?.toDate) return v.toDate().getTime();
    if (typeof v === 'string') return new Date(v).getTime();
    return new Date(v).getTime();
};
const formatHHMM = (v)=>{
    if (!v) return 'TBD';
    const d = v?.toDate ? v.toDate() : new Date(v);
    if (isNaN(d.getTime())) return 'TBD';
    return d.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};
const formatDateDDMM = (v)=>{
    if (!v) return '—';
    const d = v?.toDate ? v.toDate() : new Date(v);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit'
    });
};
const toMinute = (v)=>Math.floor(toMs(v) / 60000);
const isRealName = (name)=>{
    if (!name || typeof name !== 'string') return false;
    const n = name.trim();
    if (!n || n === '?' || n === '-' || n.toUpperCase() === 'TBD' || n.toUpperCase() === 'TBA') return false;
    // Regex para detectar "Jugador X", "Pareja X", "Equipo X", "P. X"
    if (/^(JUGADOR|PAREJA|EQUIPO|P\.)\s*\d+$/i.test(n)) return false;
    return true;
};
const formatDisplayName = (name)=>{
    if (!name) return '';
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$playerFichaName$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatPlayerFichaName"])(name.trim());
};
const resolveTeamNames = (team, teamName)=>{
    if (!team) return [
        isRealName(teamName) ? teamName : '?',
        ''
    ];
    // 1) Si es TBD o tiene label explicito
    if (team.isTBD || team.teamLabel) {
        const label = team.teamLabel || team.p1Name || team.p1?.name;
        return [
            isRealName(label) ? label : isRealName(teamName) ? teamName : '?',
            ''
        ];
    }
    // 2) Si tiene linea 'full' (ej. "LUIS V / CARLOS V")
    if (typeof team.full === 'string' && isRealName(team.full)) {
        const parts = team.full.split(/\s*\/\s*/).map((s)=>s.trim()).filter(Boolean);
        if (parts.length >= 2) {
            return [
                formatDisplayName(parts[0]),
                formatDisplayName(parts[1])
            ];
        }
        if (parts.length === 1) {
            return [
                formatDisplayName(parts[0]),
                ''
            ];
        }
    }
    // 3) Nombres individuales
    const p1 = (team.p1Name || team.p1?.name || '').trim();
    const p2 = (team.p2Name || team.p2?.name || '').trim();
    if (isRealName(p1) || isRealName(p2)) {
        return [
            isRealName(p1) ? formatDisplayName(p1) : '?',
            isRealName(p2) ? formatDisplayName(p2) : ''
        ];
    }
    // 4) team.name (ej. "Jugador 1 / Jugador 2")
    if (isRealName(team.name)) {
        const parts = team.name.split('/');
        return [
            formatDisplayName((parts[0] || '?').trim()),
            formatDisplayName((parts[1] || '').trim())
        ];
    }
    // 5) teamName placeholder (fallback)
    if (isRealName(teamName)) {
        const parts = teamName.split('/');
        return [
            formatDisplayName((parts[0] || '?').trim()),
            formatDisplayName((parts[1] || '').trim())
        ];
    }
    return [
        '?',
        ''
    ];
};
// Mapeo legible de categorías
const CAT_LABEL_MAP = {
    MAS_40: '+40',
    FEM_40: '+40',
    MIX_40: '+40',
    MAS_45: '+45',
    MAS_50: '+50',
    SUMA_7: 'Suma 7',
    SUMA_8: 'Suma 8',
    SUMA_9: 'Suma 9',
    SUMA_10: 'Suma 10',
    SUMA_11: 'Suma 11',
    PRIMERA: '1ª Cat.',
    SEGUNDA: '2ª Cat.',
    TERCERA: '3ª Cat.',
    CUARTA: '4ª Cat.',
    QUINTA: '5ª Cat.',
    SEXTA: '6ª Cat.',
    SEPTIMA: '7ª Cat.'
};
const formatCategory = (cat)=>{
    if (!cat) return '';
    return CAT_LABEL_MAP[cat] ?? cat.replace(/_/g, ' ');
};
const formatGender = (g)=>{
    if (!g) return '';
    if (g === 'MALE') return 'Masculino';
    if (g === 'FEMALE') return 'Femenino';
    if (g === 'MIXED') return 'Mixto';
    return g;
};
function getMatchPhaseSortOrder(match) {
    if (!match) return 99;
    if (match.stage === 'GROUP_STAGE' || match.groupName != null) return 0;
    const name = String(match.roundName || '').toUpperCase();
    const isFinal = match.stage === 'FINAL' || match.isFinal || name.includes('FINAL') && !name.includes('SEMI') && !name.includes('SEMIFINAL') && !name.includes('CUARTOS') && !name.includes('OCTAVOS') && !name.includes('8VO');
    if (isFinal) return 3;
    const isSemi = match.stage === 'SEMIFINAL' || name.includes('SEMIFINAL') || name.includes('SEMIFINALES');
    if (isSemi) return 2;
    if (match.stage === 'MAIN_DRAW' || match.isKnockout || name.includes('CUARTOS') || name.includes('OCTAVOS') || name.includes('8VO')) {
        return 1;
    }
    return 4;
}
function courtNumForSort(m) {
    const c = m?.court;
    if (c !== undefined && c !== null && c !== '' && c !== '-') {
        const n = typeof c === 'number' ? c : Number(String(c).replace(/\D/g, '')) || 0;
        if (n > 0) return n;
    }
    if (m?.courtIndex !== undefined && m?.courtIndex !== null) {
        const n = Number(m.courtIndex) + 1;
        return n > 0 ? n : 999;
    }
    return 999;
}
function compareMatchesTodosView(a, b) {
    const td = toMs(a?.scheduledTime ?? a?.time) - toMs(b?.scheduledTime ?? b?.time);
    if (td !== 0) return td;
    const pa = getMatchPhaseSortOrder(a);
    const pb = getMatchPhaseSortOrder(b);
    if (pa !== pb) return pa - pb;
    if (pa === 0) {
        const ca = courtNumForSort(a);
        const cb = courtNumForSort(b);
        const aEven = ca < 999 && ca % 2 === 0 ? 0 : 1;
        const bEven = cb < 999 && cb % 2 === 0 ? 0 : 1;
        if (aEven !== bEven) return aEven - bEven;
        if (ca !== cb) return ca - cb;
    }
    return courtNumForSort(a) - courtNumForSort(b);
}
const STATUS_COLORS = {
    [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].LIVE]: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20',
    [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED]: 'bg-white/[0.02] border-white/10 text-gray-500 grayscale-[0.5] opacity-80',
    [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].PENDING]: 'bg-yellow-400/5 border-yellow-400/30 text-yellow-200/80'
};
const PENDING_NEXT_COLORS = 'bg-yellow-400/10 border-yellow-400/40 text-yellow-200 shadow-[0_4px_20px_rgba(250,204,21,0.05)]';
const PENDING_LATER_COLORS = 'bg-white/[0.03] border-white/10 text-gray-400';
const CAT_COLORS = {
    MALE: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    FEMALE: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
    MIXED: 'bg-purple-500/10 border-purple-500/20 text-purple-400'
};
const TABS = [
    {
        label: 'TODOS',
        value: 'all'
    },
    {
        label: 'EN VIVO',
        value: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].LIVE
    },
    {
        label: 'POR COMENZAR',
        value: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].PENDING
    },
    {
        label: 'FINALIZADOS',
        value: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED
    },
    {
        label: 'RANKING',
        value: 'ranking'
    },
    {
        label: 'GRUPOS',
        value: 'groups'
    },
    {
        label: 'REGLAS',
        value: 'rules'
    }
];
const KNOWN_COMPLEXES = {
    'El Bodeguero': 3,
    'Food Kart': 3,
    'Hotel Tibisay': 2,
    'Tibisay Padel': 2,
    'Padel 360': 6
};
function calcGroupStanding(teamId, teamNum, matches) {
    let PJ = 0, PG = 0, PP = 0, JF = 0, JC = 0;
    matches.filter((m)=>m.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED && m.stage === 'GROUP_STAGE' && (m.team1Index === teamNum || m.team2Index === teamNum)).forEach((m)=>{
        const side = m.team1Index === teamNum ? 't1' : 't2';
        const opp = side === 't1' ? 't2' : 't1';
        PJ++;
        const gWon = m.games?.[side] ?? 0;
        const gLost = m.games?.[opp] ?? 0;
        JF += gWon;
        JC += gLost;
        const sWon = m.sets?.[side] ?? 0;
        const sLost = m.sets?.[opp] ?? 0;
        if (sWon > sLost || sWon === sLost && gWon > gLost) PG++;
        else PP++;
    });
    const winRate = PJ > 0 ? PG / PJ * 100 : 0;
    const gameRate = JF + JC > 0 ? JF / (JF + JC) * 100 : 0;
    return {
        PJ,
        PG,
        PP,
        JF,
        JC,
        Pts: PG * 3,
        winRate,
        gameRate
    };
}
}),
"[project]/src/lib/buildEventPodiumRows.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildEventPodiumRows",
    ()=>buildEventPodiumRows
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tournamentPodium$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/tournamentPodium.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/tournaments/event/utils.ts [app-ssr] (ecmascript)");
;
;
function buildEventPodiumRows(tournaments) {
    return Object.values(tournaments).filter((t)=>t?.id).map((t)=>{
        const matches = Array.isArray(t.matches) ? t.matches : [];
        const podium = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tournamentPodium$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveCategoryPodium"])(matches, t);
        const cat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCategory"])(t.category);
        const gen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatGender"])(t.gender);
        const title = [
            cat,
            gen
        ].filter(Boolean).join(' · ') || 'Categoría';
        return {
            id: String(t.id),
            title,
            podium,
            tournament: t
        };
    }).sort((a, b)=>a.title.localeCompare(b.title, 'es', {
            sensitivity: 'base'
        }));
}
}),
"[project]/src/app/tournaments/event/components/EventPodiumView.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EventPodiumView",
    ()=>EventPodiumView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trophy.js [app-ssr] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$medal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Medal$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/medal.js [app-ssr] (ecmascript) <export default as Medal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tournamentPodium$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/tournamentPodium.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$buildEventPodiumRows$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/buildEventPodiumRows.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
const EventPodiumView = ({ tournaments })=>{
    const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$buildEventPodiumRows$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildEventPodiumRows"])(tournaments), [
        tournaments
    ]);
    if (rows.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "py-24 text-center space-y-4 px-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
                    className: "w-16 h-16 text-white/10 mx-auto"
                }, void 0, false, {
                    fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                    lineNumber: 19,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-500 text-xs font-black uppercase tracking-widest",
                    children: "No hay categorías cargadas"
                }, void 0, false, {
                    fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                    lineNumber: 20,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
            lineNumber: 18,
            columnNumber: 13
        }, ("TURBOPACK compile-time value", void 0));
    }
    const mainHeading = rows.length > 1 ? 'Podio del evento' : 'Podio de la categoría';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-8 max-w-2xl mx-auto w-full px-2 sm:px-3 pb-16",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center space-y-2 pt-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-black uppercase italic tracking-tighter text-[#ccff00]",
                        children: mainHeading
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                        lineNumber: 30,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[10px] font-bold uppercase tracking-widest text-gray-500",
                        children: rows.length > 1 ? 'Campeones y subcampeones por categoría' : 'Campeón y subcampeón'
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                        lineNumber: 31,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                lineNumber: 29,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-5",
                children: rows.map(({ id, title, podium })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-[2rem] border border-white/[0.08] bg-[#111] overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-5 py-3.5 bg-gradient-to-r from-[#ccff00]/90 to-[#b8e600] flex items-center justify-between gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "font-black italic uppercase tracking-tighter text-sm text-black leading-tight truncate",
                                        children: title
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                        lineNumber: 43,
                                        columnNumber: 29
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: `/tournaments/${id}?tab=ranking`,
                                        className: "flex-shrink-0 text-[9px] font-black uppercase tracking-widest text-black/70 hover:text-black underline-offset-2 hover:underline",
                                        children: "Ver categoría"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                        lineNumber: 46,
                                        columnNumber: 29
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                lineNumber: 42,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-5 space-y-4",
                                children: !podium ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-center text-[11px] font-bold uppercase tracking-widest text-gray-600 py-6",
                                    children: "Pendiente · aún no hay resultados para cerrar el podio"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                    lineNumber: 56,
                                    columnNumber: 33
                                }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "rounded-2xl border border-[#ccff00]/35 bg-[#ccff00]/[0.07] p-4 flex gap-3 items-start",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-10 h-10 rounded-xl bg-[#ccff00]/20 flex items-center justify-center flex-shrink-0",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
                                                                className: "w-5 h-5 text-[#ccff00]"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                                                lineNumber: 64,
                                                                columnNumber: 49
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                                            lineNumber: 63,
                                                            columnNumber: 45
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "min-w-0 flex-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[9px] font-black uppercase tracking-widest text-[#ccff00]",
                                                                    children: "Campeón"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                                                    lineNumber: 67,
                                                                    columnNumber: 49
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "mt-1 space-y-0.5",
                                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tournamentPodium$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPodiumDisplayLines"])(podium.first).map((line, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-sm font-black text-white leading-snug break-words",
                                                                            children: line
                                                                        }, i, false, {
                                                                            fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                                                            lineNumber: 72,
                                                                            columnNumber: 57
                                                                        }, ("TURBOPACK compile-time value", void 0)))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                                                    lineNumber: 70,
                                                                    columnNumber: 49
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                                            lineNumber: 66,
                                                            columnNumber: 45
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                                    lineNumber: 62,
                                                    columnNumber: 41
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex gap-3 items-start",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$medal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Medal$3e$__["Medal"], {
                                                                className: "w-5 h-5 text-gray-400"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                                                lineNumber: 84,
                                                                columnNumber: 49
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                                            lineNumber: 83,
                                                            columnNumber: 45
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "min-w-0 flex-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[9px] font-black uppercase tracking-widest text-gray-500",
                                                                    children: "Subcampeón"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                                                    lineNumber: 87,
                                                                    columnNumber: 49
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "mt-1 space-y-0.5",
                                                                    children: podium.second ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tournamentPodium$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPodiumDisplayLines"])(podium.second).map((line, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-sm font-black text-white leading-snug break-words",
                                                                            children: line
                                                                        }, i, false, {
                                                                            fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                                                            lineNumber: 93,
                                                                            columnNumber: 61
                                                                        }, ("TURBOPACK compile-time value", void 0))) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-sm font-black text-white",
                                                                        children: "—"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                                                        lineNumber: 101,
                                                                        columnNumber: 57
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                                                    lineNumber: 90,
                                                                    columnNumber: 49
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                                            lineNumber: 86,
                                                            columnNumber: 45
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                                    lineNumber: 82,
                                                    columnNumber: 41
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                            lineNumber: 61,
                                            columnNumber: 37
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        podium.source === 'standings' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[9px] text-center text-gray-600 font-bold uppercase tracking-wider",
                                            children: "Por clasificación general (sin final de cuadro registrada)"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                            lineNumber: 108,
                                            columnNumber: 41
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                                lineNumber: 54,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, id, true, {
                        fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                        lineNumber: 38,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0)))
            }, void 0, false, {
                fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
                lineNumber: 36,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/tournaments/event/components/EventPodiumView.tsx",
        lineNumber: 28,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/worker_threads [external] (worker_threads, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("worker_threads", () => require("worker_threads"));

module.exports = mod;
}),
"[project]/src/lib/eventPodiumPdf.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "exportEventPodiumPdf",
    ()=>exportEventPodiumPdf
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf/dist/jspdf.node.min.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tournamentPodium$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/tournamentPodium.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$buildEventPodiumRows$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/buildEventPodiumRows.ts [app-ssr] (ecmascript)");
;
;
;
;
function safeFilenamePart(s, maxLen) {
    return s.replace(/[^\w\s\-áéíóúñüÁÉÍÓÚÑÜ]/gi, '').replace(/\s+/g, '_').slice(0, maxLen) || 'Podio';
}
async function exportEventPodiumPdf(tournaments, eventTitle) {
    const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$buildEventPodiumRows$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildEventPodiumRows"])(tournaments);
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 24, 'F');
    doc.setTextColor(204, 255, 0);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    const titleLine = `PODIO — ${String(eventTitle || 'Evento').toUpperCase()}`;
    doc.text(titleLine, 14, 12);
    doc.setTextColor(140, 140, 140);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 14, 20);
    const tableBody = [];
    for (const r of rows){
        if (!r.podium) {
            tableBody.push([
                r.title,
                'Pendiente',
                '—',
                ''
            ]);
            continue;
        }
        const champ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tournamentPodium$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPodiumDisplayLines"])(r.podium.first).join('\n');
        const sub = r.podium.second ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tournamentPodium$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPodiumDisplayLines"])(r.podium.second).join('\n') : '—';
        const note = r.podium.source === 'standings' ? 'Clasificación general' : '';
        tableBody.push([
            r.title,
            champ,
            sub,
            note
        ]);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(doc, {
        startY: 28,
        head: [
            [
                'Categoría',
                'Campeón',
                'Subcampeón',
                'Notas'
            ]
        ],
        body: tableBody,
        styles: {
            fontSize: 9,
            font: 'helvetica',
            cellPadding: 5,
            valign: 'top',
            textColor: [
                40,
                40,
                40
            ]
        },
        headStyles: {
            fillColor: [
                0,
                0,
                0
            ],
            textColor: [
                204,
                255,
                0
            ],
            fontStyle: 'bold',
            minCellHeight: 10
        },
        alternateRowStyles: {
            fillColor: [
                248,
                250,
                252
            ]
        },
        margin: {
            left: 14,
            right: 14
        },
        theme: 'striped'
    });
    const base = safeFilenamePart(eventTitle, 50);
    const fileName = `Podio_${base}.pdf`;
    const blob = doc.output('blob');
    const file = new File([
        blob
    ], fileName, {
        type: 'application/pdf'
    });
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({
        files: [
            file
        ]
    })) {
        try {
            await navigator.share({
                files: [
                    file
                ],
                title: 'Podio',
                text: String(eventTitle || 'Evento')
            });
            return;
        } catch (e) {
            if (e?.name === 'AbortError') return;
        }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}
}),
"[project]/src/app/tournaments/[id]/podium/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CategoryPodiumPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-ssr] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trophy.js [app-ssr] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/share-2.js [app-ssr] (ecmascript) <export default as Share2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$useRouteSegment$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/useRouteSegment.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$BackButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/BackButton.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$components$2f$EventPodiumView$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/tournaments/event/components/EventPodiumView.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$eventPodiumPdf$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/eventPodiumPdf.ts [app-ssr] (ecmascript)");
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
function CategoryPodiumPage() {
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$useRouteSegment$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouteSegment"])('id');
    const [tournament, setTournament] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [pdfBusy, setPdfBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!id) return;
        const unsubT = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].subscribeToTournament(String(id), (tourneyData)=>{
            if (!tourneyData) {
                setTournament(null);
                setLoading(false);
                return;
            }
            setTournament((prev)=>({
                    ...typeof prev === 'object' ? prev : {},
                    ...tourneyData,
                    id: String(id)
                }));
            setLoading(false);
        });
        const unsubM = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].subscribeToMatches(String(id), (tournamentMatches)=>{
            setTournament((prev)=>({
                    ...prev && typeof prev === 'object' ? prev : {},
                    id: String(id),
                    matches: tournamentMatches
                }));
        });
        return ()=>{
            unsubT();
            unsubM();
        };
    }, [
        id
    ]);
    if (!id) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-gray-500 text-sm",
                children: "Torneo no válido"
            }, void 0, false, {
                fileName: "[project]/src/app/tournaments/[id]/podium/page.tsx",
                lineNumber: 52,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/tournaments/[id]/podium/page.tsx",
            lineNumber: 51,
            columnNumber: 13
        }, this);
    }
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-[#0a0a0a] flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                className: "w-8 h-8 text-[#ccff00] animate-spin"
            }, void 0, false, {
                fileName: "[project]/src/app/tournaments/[id]/podium/page.tsx",
                lineNumber: 60,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/tournaments/[id]/podium/page.tsx",
            lineNumber: 59,
            columnNumber: 13
        }, this);
    }
    if (!tournament) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center gap-4 px-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
                    className: "w-16 h-16 text-[#ccff00]/20"
                }, void 0, false, {
                    fileName: "[project]/src/app/tournaments/[id]/podium/page.tsx",
                    lineNumber: 68,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-500 text-sm font-bold uppercase tracking-widest",
                    children: "No se encontró el torneo"
                }, void 0, false, {
                    fileName: "[project]/src/app/tournaments/[id]/podium/page.tsx",
                    lineNumber: 69,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/tournaments",
                    className: "text-[#ccff00] text-sm font-bold uppercase tracking-widest",
                    children: "← Volver"
                }, void 0, false, {
                    fileName: "[project]/src/app/tournaments/[id]/podium/page.tsx",
                    lineNumber: 70,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/tournaments/[id]/podium/page.tsx",
            lineNumber: 67,
            columnNumber: 13
        }, this);
    }
    const title = tournament.name ?? 'Categoría';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-[#0a0a0a] text-white font-outfit flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex-shrink-0 border-b border-white/[0.08] px-3 sm:px-4 py-4 flex items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$BackButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BackButton"], {
                        href: `/tournaments/${id}`
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/[id]/podium/page.tsx",
                        lineNumber: 82,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0 flex-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] font-black uppercase tracking-widest text-gray-500",
                                children: "Podio"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/[id]/podium/page.tsx",
                                lineNumber: 84,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-lg font-black uppercase italic tracking-tighter text-[#ccff00] truncate",
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/[id]/podium/page.tsx",
                                lineNumber: 85,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/[id]/podium/page.tsx",
                        lineNumber: 83,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        disabled: pdfBusy,
                        "aria-label": "Compartir podio en PDF",
                        onClick: async ()=>{
                            setPdfBusy(true);
                            try {
                                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$eventPodiumPdf$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exportEventPodiumPdf"])({
                                    [String(id)]: tournament
                                }, title);
                            } catch (e) {
                                console.error('[exportEventPodiumPdf]', e);
                            } finally{
                                setPdfBusy(false);
                            }
                        },
                        className: "flex-shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-[#ccff00] text-black text-[9px] font-black uppercase tracking-widest hover:bg-[#b8e600] transition-colors disabled:opacity-50 active:scale-[0.98]",
                        children: [
                            pdfBusy ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                className: "w-4 h-4 animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/[id]/podium/page.tsx",
                                lineNumber: 104,
                                columnNumber: 25
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__["Share2"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/[id]/podium/page.tsx",
                                lineNumber: 106,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "max-[340px]:sr-only",
                                children: "Compartir PDF"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/[id]/podium/page.tsx",
                                lineNumber: 108,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/[id]/podium/page.tsx",
                        lineNumber: 87,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/tournaments/[id]/podium/page.tsx",
                lineNumber: 81,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto py-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$components$2f$EventPodiumView$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EventPodiumView"], {
                    tournaments: {
                        [String(id)]: tournament
                    }
                }, void 0, false, {
                    fileName: "[project]/src/app/tournaments/[id]/podium/page.tsx",
                    lineNumber: 112,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/tournaments/[id]/podium/page.tsx",
                lineNumber: 111,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/tournaments/[id]/podium/page.tsx",
        lineNumber: 80,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ff47ded0._.js.map