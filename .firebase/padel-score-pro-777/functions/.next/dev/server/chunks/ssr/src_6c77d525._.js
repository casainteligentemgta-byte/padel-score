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
"[project]/src/app/tournaments/[id]/monitor/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MonitorCanchas
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/monitor.js [app-ssr] (ecmascript) <export default as Monitor>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__WifiOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wifi-off.js [app-ssr] (ecmascript) <export default as WifiOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/maximize-2.js [app-ssr] (ecmascript) <export default as Maximize2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brush$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Brush$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/brush.js [app-ssr] (ecmascript) <export default as Brush>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye-off.js [app-ssr] (ecmascript) <export default as EyeOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$useRouteSegment$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/useRouteSegment.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/AuthContext.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
// ── Grid layouts según número de canchas activas ─────────────────────────────
// Máximo 6 canchas (La Margarita)
const GRID_CONFIG = {
    1: {
        cols: 1,
        rows: 1,
        className: 'grid-cols-1 grid-rows-1'
    },
    2: {
        cols: 2,
        rows: 1,
        className: 'grid-cols-2 grid-rows-1'
    },
    3: {
        cols: 3,
        rows: 1,
        className: 'grid-cols-3 grid-rows-1'
    },
    4: {
        cols: 2,
        rows: 2,
        className: 'grid-cols-2 grid-rows-2'
    },
    5: {
        cols: 3,
        rows: 2,
        className: 'grid-cols-3 grid-rows-2'
    },
    6: {
        cols: 3,
        rows: 2,
        className: 'grid-cols-3 grid-rows-2'
    }
};
function matchStatusRaw(m) {
    return m?.status ?? (m && typeof m === 'object' ? m.data?.status : undefined);
}
function buildActiveMatches(t, ms, markerLiveMatchIds) {
    const tSafe = t && typeof t === 'object' ? t : {};
    if (!Array.isArray(ms) || ms.length === 0) return [];
    const numCanchas = Math.max(1, Number(tSafe.totalCourts) || (tSafe.courtNames?.length ?? 6));
    const resolveTeamName = (mTeam, teamIdx)=>{
        const PLACEHOLDER_RE = /pareja|jugador|placeholder/i;
        if (mTeam && (mTeam.p1 || mTeam.p1Name || mTeam.teamLabel)) {
            const p1 = (mTeam.p1Name || mTeam.p1?.name || '').trim();
            const p2 = (mTeam.p2Name || mTeam.p2?.name || '').trim();
            const hasReal = p1 && !PLACEHOLDER_RE.test(p1) || p2 && !PLACEHOLDER_RE.test(p2);
            if (hasReal) {
                return [
                    p1,
                    p2
                ].filter(Boolean).join(' · ') || '?';
            }
            if (mTeam.teamLabel) return mTeam.teamLabel;
        }
        const foundTeam = teamIdx > 0 ? Array.isArray(tSafe.teams) ? tSafe.teams[teamIdx - 1] : null : null;
        if (!foundTeam) return `Pareja ${teamIdx || '?'}`;
        return [
            (foundTeam.p1?.name || '').trim(),
            (foundTeam.p2?.name || '').trim()
        ].filter(Boolean).join(' · ') || `Pareja ${teamIdx}`;
    };
    return ms.filter((m)=>{
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].isMatchFinishedLike(m)) return false;
        const mid = String(m?.id ?? '');
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].isMatchEnVivoStatus(matchStatusRaw(m)) || !!mid && markerLiveMatchIds?.has(mid);
    }).map((m, idx)=>({
            id: m.id || `match_${idx}`,
            court: m.court ?? (m.courtIndex !== undefined ? m.courtIndex + 1 : idx + 1),
            team1Name: resolveTeamName(m.team1, m.team1Index),
            team2Name: resolveTeamName(m.team2, m.team2Index),
            status: m.status
        })).sort((a, b)=>Number(a.court) - Number(b.court)).slice(0, numCanchas);
}
function MonitorCanchas() {
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$useRouteSegment$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouteSegment"])('id');
    const { isAdmin } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const [tournament, setTournament] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [matchesSnapshot, setMatchesSnapshot] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [markerLiveMatchIds, setMarkerLiveMatchIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [activeMatches, setActiveMatches] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [noCourtsAssigned, setNoCourtsAssigned] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [highlightedCourts, setHighlightedCourts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [focusedIdx, setFocusedIdx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isFullscreen, setIsFullscreen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [minimalScreensMode, setMinimalScreensMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [toastMsg, setToastMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const refreshMonitorData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (!id) return;
        try {
            const t = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getTournament(id);
            const ms = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getMatches(id);
            if (t) setTournament(t);
            setMatchesSnapshot(ms || []);
        } catch (e) {
            console.warn('[Monitor] refreshMonitorData:', e);
        }
    }, [
        id
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!toastMsg) return;
        const t = window.setTimeout(()=>setToastMsg(null), 3500);
        return ()=>window.clearTimeout(t);
    }, [
        toastMsg
    ]);
    // ── Fullscreen helper ──────────────────────────────────────────────────
    const toggleFullscreen = ()=>{
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handler = ()=>setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return ()=>document.removeEventListener('fullscreenchange', handler);
    }, []);
    // ── Supabase realtime: escuchar partidos LIVE ───────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!id) return;
        console.log('ID del Torneo:', id);
        setLoading(true);
        setNoCourtsAssigned(false);
        let currentTournament = null;
        let currentMatches = [];
        const validateAssignedCourts = async ()=>{
            try {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
                if (!supabase) return;
                // Verificación explícita por tournament_id.
                const { data, error } = await supabase.from('pizarra_cancha').select('court_number').eq('tournament_id', id);
                if (error) {
                    console.warn('[Monitor] Error cargando canchas asignadas:', error);
                    return;
                }
                console.log('[Monitor] Canchas asignadas (raw):', data);
                console.log('[Monitor] Total canchas asignadas:', data?.length ?? 0);
                console.log('[Monitor] Números de cancha asignados:', (data || []).map((r)=>r.court_number));
                if (!data || data.length === 0) {
                    setNoCourtsAssigned(true);
                }
            } catch (err) {
                console.error('[Monitor] Excepción cargando canchas asignadas:', err);
            }
        };
        void validateAssignedCourts();
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
        const pizarraChannel = supabase?.channel(`monitor-pizarra-${id}`).on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'pizarra_cancha',
            filter: `tournament_id=eq.${id}`
        }, (payload)=>{
            const row = payload.new;
            const courtNumber = Number(row?.court_number);
            if (!Number.isFinite(courtNumber)) return;
            setHighlightedCourts((prev)=>({
                    ...prev,
                    [String(courtNumber)]: Date.now() + 8000
                }));
        }).subscribe();
        const updateData = (t, ms)=>{
            if (t) setTournament(t);
            setMatchesSnapshot(ms || []);
            setLoading(false);
        };
        const unsubT = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].subscribeToTournament(id, (t)=>{
            if (!t) {
                setLoading(false);
                if (currentMatches.length > 0) updateData(null, currentMatches);
                return;
            }
            currentTournament = t;
            if (currentMatches.length > 0) updateData(currentTournament, currentMatches);
            else {
                setTournament(t);
                setLoading(false);
            }
        });
        const unsubM = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].subscribeToMatches(id, (ms)=>{
            currentMatches = ms || [];
            if (currentTournament) updateData(currentTournament, currentMatches);
            else updateData(null, currentMatches);
        });
        return ()=>{
            if (pizarraChannel) pizarraChannel.unsubscribe();
            if (typeof unsubT === 'function') unsubT();
            if (typeof unsubM === 'function') unsubM();
        };
    }, [
        id
    ]);
    // En vivo real desde pizarra_cancha_state (mismo criterio que el hub).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!id) return;
        let cancelled = false;
        const loadMarkerLiveIds = async ()=>{
            try {
                const totalCourts = Number(tournament?.totalCourts ?? 0);
                let maxFromMatches = 0;
                matchesSnapshot.forEach((m)=>{
                    const c = Number(m?.court ?? (m?.courtIndex != null ? Number(m.courtIndex) + 1 : 0));
                    if (Number.isFinite(c) && c > 0) maxFromMatches = Math.max(maxFromMatches, c);
                });
                const maxPoll = Math.min(16, Math.max(totalCourts, maxFromMatches, 4));
                const courtNums = [];
                for(let c = 1; c <= maxPoll; c++)courtNums.push(c);
                const normTid = (s)=>String(s || '').replace(/-/g, '').toLowerCase();
                const sameTournament = (a, tid)=>normTid(String(a ?? '')) === normTid(tid);
                const liveIds = new Set();
                const checks = courtNums.map(async (courtNum)=>{
                    const state = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getPizarraCanchaState(`cancha_${courtNum}`);
                    const data = state?.data || {};
                    const est = String(data?.estado || '');
                    if (est !== 'en_vivo' && est !== 'ready') return;
                    if (!sameTournament(data?.torneo_id, String(id))) return;
                    const pid = String(data?.partido_id || '').trim();
                    if (!pid || pid.startsWith('live_')) return;
                    liveIds.add(pid);
                });
                await Promise.all(checks);
                if (!cancelled) {
                    setMarkerLiveMatchIds((prev)=>{
                        if (prev.size === liveIds.size) {
                            let same = true;
                            for (const v of liveIds){
                                if (!prev.has(v)) {
                                    same = false;
                                    break;
                                }
                            }
                            if (same) return prev;
                        }
                        return liveIds;
                    });
                }
            } catch  {
                if (!cancelled) setMarkerLiveMatchIds(new Set());
            }
        };
        void loadMarkerLiveIds();
        const t = window.setInterval(loadMarkerLiveIds, 1500);
        return ()=>{
            cancelled = true;
            window.clearInterval(t);
        };
    }, [
        id,
        matchesSnapshot,
        tournament?.totalCourts
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const tSafe = tournament && typeof tournament === 'object' ? tournament : {};
        setActiveMatches(buildActiveMatches(tSafe, matchesSnapshot, markerLiveMatchIds));
    }, [
        tournament,
        matchesSnapshot,
        markerLiveMatchIds
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!id) return;
        const iv = window.setInterval(()=>void refreshMonitorData(), 12000);
        return ()=>window.clearInterval(iv);
    }, [
        id,
        refreshMonitorData
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const onFocus = ()=>void refreshMonitorData();
        window.addEventListener('focus', onFocus);
        return ()=>window.removeEventListener('focus', onFocus);
    }, [
        refreshMonitorData
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const hasActiveHighlights = Object.keys(highlightedCourts).length > 0;
        if (!hasActiveHighlights) return;
        const timer = window.setInterval(()=>{
            const now = Date.now();
            setHighlightedCourts((prev)=>{
                const next = {};
                for (const [k, expiresAt] of Object.entries(prev)){
                    if (expiresAt > now) next[k] = expiresAt;
                }
                return next;
            });
        }, 1000);
        return ()=>window.clearInterval(timer);
    }, [
        highlightedCourts
    ]);
    const count = activeMatches.length;
    const parsePositiveInt = (v)=>{
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    };
    const maxAssignableCourts = Math.max(1, parsePositiveInt(tournament?.totalCourts) || parsePositiveInt(tournament?.courtNames?.length) || parsePositiveInt(tournament?.numCourts) || 3);
    const gridCfg = GRID_CONFIG[Math.max(1, Math.min(count, 6))];
    // ── Loading ────────────────────────────────────────────────────────────
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-screen bg-black flex flex-col items-center justify-center gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"], {
                className: "w-12 h-12 text-[#ccff00] animate-pulse"
            }, void 0, false, {
                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                lineNumber: 325,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[#ccff00] font-black italic uppercase tracking-widest text-[11px]",
                children: "Conectando Monitor..."
            }, void 0, false, {
                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                lineNumber: 326,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
        lineNumber: 324,
        columnNumber: 9
    }, this);
    // ── Sin partidos activos ───────────────────────────────────────────────
    if (count === 0) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-screen bg-[#050505] flex flex-col items-center justify-center gap-6 text-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-3 border-b border-white/[0.04]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"], {
                                className: "w-4 h-4 text-[#ccff00]"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                lineNumber: 338,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] font-black uppercase tracking-widest text-[#ccff00]",
                                children: "Monitor Canchas"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                lineNumber: 339,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[9px] text-gray-700 font-bold",
                                children: [
                                    "— ",
                                    tournament?.name || id
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                lineNumber: 340,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                        lineNumber: 337,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: toggleFullscreen,
                        className: "p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__["Maximize2"], {
                            className: "w-3.5 h-3.5 text-gray-500"
                        }, void 0, false, {
                            fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                            lineNumber: 343,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                        lineNumber: 342,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                lineNumber: 336,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__WifiOff$3e$__["WifiOff"], {
                className: "w-16 h-16 text-gray-800"
            }, void 0, false, {
                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                lineNumber: 347,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-2xl font-black italic uppercase tracking-tighter text-white/10",
                        children: "Sin partidos en vivo"
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                        lineNumber: 349,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[11px] text-gray-700 font-bold mt-2 uppercase tracking-widest",
                        children: "Las pizarras aparecerán automáticamente cuando se inicie un partido"
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                        lineNumber: 350,
                        columnNumber: 17
                    }, this),
                    noCourtsAssigned && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[9px] text-white/25 mt-3 max-w-sm leading-relaxed",
                        children: "Asignación de canchas en hub sin filas para este torneo; no impide mostrar partidos en calentamiento o en curso."
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                        lineNumber: 354,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                lineNumber: 348,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 mt-4 px-4 py-2 bg-white/[0.02] border border-white/[0.05] rounded-xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "w-2 h-2 rounded-full bg-gray-700 animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                        lineNumber: 361,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[9px] text-gray-600 font-black uppercase tracking-widest",
                        children: "Esperando partidos..."
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                        lineNumber: 362,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                lineNumber: 360,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
        lineNumber: 334,
        columnNumber: 9
    }, this);
    const handleEmergencyResetSuccess = ()=>{
        setToastMsg('Cancha liberada correctamente');
        void refreshMonitorData();
    };
    // ── Monitor Grid ───────────────────────────────────────────────────────
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-screen w-screen bg-black overflow-hidden flex flex-col",
        children: [
            toastMsg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 px-4 py-2.5 rounded-xl bg-padel-primary text-black text-[10px] font-black uppercase tracking-widest shadow-lg border border-black/10",
                role: "status",
                children: toastMsg
            }, void 0, false, {
                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                lineNumber: 376,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: focusedIdx === null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].header, {
                    initial: {
                        y: -40,
                        opacity: 0
                    },
                    animate: {
                        y: 0,
                        opacity: 1
                    },
                    exit: {
                        y: -40,
                        opacity: 0
                    },
                    className: "flex-shrink-0 flex items-center justify-between px-5 py-2 bg-[#080808] border-b border-white/[0.05] z-50",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"], {
                                    className: "w-4 h-4 text-[#ccff00]"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                    lineNumber: 394,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[10px] font-black uppercase tracking-widest text-[#ccff00]",
                                    children: "Monitor Canchas"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                    lineNumber: 395,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[9px] text-gray-700 font-bold",
                                    children: [
                                        "— ",
                                        tournament?.name
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                    lineNumber: 398,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                            lineNumber: 393,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_red]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                            lineNumber: 406,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[9px] font-black text-red-400 uppercase tracking-widest",
                                            children: [
                                                count,
                                                " ",
                                                count === 1 ? 'cancha' : 'canchas',
                                                " en vivo"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                            lineNumber: 407,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                    lineNumber: 405,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1",
                                    children: activeMatches.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "px-2 py-1 bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20 rounded-lg text-[8px] font-black uppercase tracking-widest",
                                            children: [
                                                "P",
                                                m.court
                                            ]
                                        }, m.id, true, {
                                            fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                            lineNumber: 415,
                                            columnNumber: 37
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                    lineNumber: 413,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: toggleFullscreen,
                                    className: "p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5",
                                    title: isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa',
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__["Maximize2"], {
                                        className: "w-3.5 h-3.5 text-gray-400"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                        lineNumber: 427,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                    lineNumber: 422,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setMinimalScreensMode((v)=>!v),
                                    className: "p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5",
                                    title: minimalScreensMode ? 'Mostrar publicidad/tiras' : 'Solo pantallas (sin vídeo/tiras)',
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                                        className: `w-3.5 h-3.5 ${minimalScreensMode ? 'text-padel-primary' : 'text-gray-400'}`
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                        lineNumber: 436,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                    lineNumber: 431,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                            lineNumber: 403,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                    lineNumber: 387,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                lineNumber: 385,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                mode: "wait",
                children: focusedIdx !== null ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        scale: 0.97
                    },
                    animate: {
                        opacity: 1,
                        scale: 1
                    },
                    exit: {
                        opacity: 0,
                        scale: 0.97
                    },
                    className: "flex-1 relative",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setFocusedIdx(null),
                            className: "absolute top-4 right-4 z-50 px-3 py-2 bg-black/80 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-300 hover:bg-white/10 transition-all backdrop-blur-md",
                            children: "✕ Volver al monitor"
                        }, void 0, false, {
                            fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                            lineNumber: 454,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CourtCell, {
                            match: activeMatches[focusedIdx],
                            tournamentId: id,
                            isAdmin: isAdmin,
                            maxAssignableCourts: maxAssignableCourts,
                            isFocused: true,
                            minimalScreensMode: minimalScreensMode,
                            onClick: ()=>setFocusedIdx(null),
                            isHighlighted: false
                        }, void 0, false, {
                            fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                            lineNumber: 460,
                            columnNumber: 25
                        }, this)
                    ]
                }, "focused", true, {
                    fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                    lineNumber: 446,
                    columnNumber: 21
                }, this) : /* ── Grid multi-cancha ───────────────────────────────── */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    className: `flex-1 grid ${gridCfg.className} gap-px bg-[#111]`,
                    children: [
                        activeMatches.map((match, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CourtCell, {
                                match: match,
                                tournamentId: id,
                                isAdmin: isAdmin,
                                maxAssignableCourts: maxAssignableCourts,
                                isFocused: false,
                                minimalScreensMode: minimalScreensMode,
                                onClick: ()=>setFocusedIdx(idx),
                                isHighlighted: Boolean(highlightedCourts[String(match.court)]),
                                onEmergencyResetSuccess: handleEmergencyResetSuccess
                            }, match.id, false, {
                                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                lineNumber: 481,
                                columnNumber: 29
                            }, this)),
                        count === 5 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-[#080808] flex items-center justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col items-center gap-2 opacity-20",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"], {
                                        className: "w-8 h-8 text-gray-600"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                        lineNumber: 499,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[8px] font-black uppercase tracking-widest text-gray-600",
                                        children: "Sin partido"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                        lineNumber: 500,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                lineNumber: 498,
                                columnNumber: 33
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                            lineNumber: 497,
                            columnNumber: 29
                        }, this)
                    ]
                }, "grid", true, {
                    fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                    lineNumber: 473,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                lineNumber: 444,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
        lineNumber: 374,
        columnNumber: 9
    }, this);
}
// ── CourtCell: iframe de la pizarra + overlay con info de cancha ──────────────
function CourtCell({ match, tournamentId, isAdmin, maxAssignableCourts, isFocused, minimalScreensMode, onClick, isHighlighted, onEmergencyResetSuccess }) {
    /** URL directa a la pizarra unificada (evita redirect `/display/...` → iframe sandbox a veces no carga bien). */ const courtNum = Number(match.court);
    const courtQ = Number.isFinite(courtNum) && courtNum >= 1 ? `&courtId=${encodeURIComponent(String(Math.floor(courtNum)))}` : '';
    const minQ = minimalScreensMode ? '&minimal=1' : '';
    /**
     * Resolver por cancha evita desajustes cuando `matchId` se queda desincronizado
     * tras reasignaciones o cambios de estado en tiempo real.
     */ const displayUrl = `/dev/pizarra-concept?tournamentId=${encodeURIComponent(tournamentId)}${courtQ}${minQ}`;
    const [assigning, setAssigning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const assignableCourts = Array.from({
        length: Math.max(1, Math.floor(maxAssignableCourts))
    }, (_, i)=>i + 1);
    const [resetting, setResetting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const courtStr = String(match.court ?? '').trim();
    const canchaIdForRpc = /^cancha_/i.test(courtStr) ? courtStr : `cancha_${courtStr}`;
    const handleEmergencyReset = async (e)=>{
        e.stopPropagation();
        if (!window.confirm('¿Estás seguro de liberar esta cancha manualmente? El partido actual dejará de mostrarse en la TV.')) {
            return;
        }
        setResetting(true);
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].rpcResetearCanchaEmergencia(canchaIdForRpc);
            onEmergencyResetSuccess?.();
        } catch (err) {
            console.error('[Monitor] resetear_cancha_emergencia:', err);
            alert('No se pudo liberar la cancha. Verifica el RPC en Supabase o tu conexión.');
        } finally{
            setResetting(false);
        }
    };
    const assignToCourt = async (courtNum, e)=>{
        e.stopPropagation();
        setAssigning(courtNum);
        try {
            await fetch('/api/pizarra-cancha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    courtNumber: courtNum,
                    tournamentId,
                    matchId: match.id
                })
            });
        } finally{
            setAssigning(null);
        }
    };
    const handleNameAreaClick = (e)=>{
        if (!isAdmin) return;
        if (e.detail < 3) return;
        e.stopPropagation();
        const controlUrl = `/tournaments/${encodeURIComponent(tournamentId)}/score/${encodeURIComponent(String(match.id))}`;
        window.open(controlUrl, '_blank', 'noopener,noreferrer');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `relative w-full h-full bg-black overflow-hidden group cursor-pointer ${isHighlighted ? 'ring-2 ring-emerald-400/80 ring-inset' : ''}`,
        onClick: onClick,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                src: displayUrl,
                className: "w-full h-full border-0 pointer-events-none",
                title: `Pista ${match.court}`,
                loading: "lazy",
                sandbox: "allow-scripts allow-same-origin allow-forms"
            }, `${tournamentId}-${match.id}-${match.court}`, false, {
                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                lineNumber: 609,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-0 left-0 right-0 flex items-start justify-between gap-2 p-3 pointer-events-none",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_red]"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                lineNumber: 621,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] font-black uppercase tracking-widest text-white",
                                children: [
                                    "PISTA ",
                                    match.court
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                lineNumber: 622,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                        lineNumber: 620,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pointer-events-auto flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: handleEmergencyReset,
                                disabled: resetting,
                                title: "Reset de emergencia: liberar cancha",
                                className: "p-1.5 rounded-lg bg-black/60 border border-white/5 text-red-500/50 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/10 transition-colors disabled:opacity-40",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brush$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Brush$3e$__["Brush"], {
                                    className: `w-3.5 h-3.5 ${resetting ? 'animate-pulse' : ''}`
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                    lineNumber: 635,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                lineNumber: 628,
                                columnNumber: 21
                            }, this),
                            !isFocused && assignableCourts.map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: (e)=>assignToCourt(n, e),
                                    disabled: assigning !== null,
                                    className: "px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-[8px] font-bold uppercase text-white/70 hover:bg-[#ccff00]/20 hover:border-[#ccff00]/40 hover:text-[#ccff00] disabled:opacity-50 transition-colors",
                                    title: `Usar en cancha ${n} → www.smartpadel58.com/p/${n}`,
                                    children: assigning === n ? '…' : n
                                }, n, false, {
                                    fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                    lineNumber: 638,
                                    columnNumber: 25
                                }, this)),
                            !isFocused && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2 py-1.5 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[8px] font-black uppercase tracking-widest text-gray-400",
                                    children: "↗ Ampliar"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                    lineNumber: 651,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                                lineNumber: 650,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                        lineNumber: 627,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                lineNumber: 619,
                columnNumber: 13
            }, this),
            !isFocused && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2 bg-gradient-to-t from-black/70 to-transparent pointer-events-auto",
                onClick: handleNameAreaClick,
                title: isAdmin ? 'Triple click para abrir control del partido' : undefined,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[8px] font-black italic uppercase tracking-tight text-white/70 truncate max-w-[45%]",
                        children: match.team1Name
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                        lineNumber: 666,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[7px] font-bold text-white/30 mx-2",
                        children: "vs"
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                        lineNumber: 669,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[8px] font-black italic uppercase tracking-tight text-white/70 truncate max-w-[45%] text-right",
                        children: match.team2Name
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                        lineNumber: 670,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                lineNumber: 661,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 border-2 border-transparent group-hover:border-[#ccff00]/30 transition-all duration-300 pointer-events-none rounded-sm"
            }, void 0, false, {
                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                lineNumber: 677,
                columnNumber: 13
            }, this),
            isHighlighted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/60 backdrop-blur-md pointer-events-none",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-[8px] font-black uppercase tracking-widest text-emerald-300",
                    children: "Lista para entrar"
                }, void 0, false, {
                    fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                    lineNumber: 680,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
                lineNumber: 679,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/tournaments/[id]/monitor/page.tsx",
        lineNumber: 604,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=src_6c77d525._.js.map