module.exports = [
"[project]/src/lib/courtHealth.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "healthBadgeLabel",
    ()=>healthBadgeLabel,
    "healthStatusFromLastSeen",
    ()=>healthStatusFromLastSeen
]);
function healthStatusFromLastSeen(iso) {
    if (!iso) return 'offline';
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return 'unknown';
    const ageSec = (Date.now() - t) / 1000;
    if (ageSec < 60) return 'online';
    if (ageSec < 300) return 'warning';
    return 'offline';
}
function healthBadgeLabel(status) {
    switch(status){
        case 'online':
            return 'En línea';
        case 'warning':
            return 'Alerta';
        case 'offline':
            return 'Desconectada';
        default:
            return '—';
    }
}
}),
"[project]/src/lib/pizarraShortUrl.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * URLs cortas tipo smartpadel58.com/s1/c2 (sede 1–8, cancha 1–n).
 * Debe coincidir con `src/app/[sede]/[cancha]/page.tsx` (SEDE_MAP) y CourtCard.
 */ __turbopack_context__.s([
    "SEDE_CODE_TO_VENUE",
    ()=>SEDE_CODE_TO_VENUE,
    "SHORT_URL_SEDE_LABELS",
    ()=>SHORT_URL_SEDE_LABELS,
    "buildPizarraShortPath",
    ()=>buildPizarraShortPath,
    "sedeIndexFromVenueName",
    ()=>sedeIndexFromVenueName,
    "venueNameFromSedeIndex",
    ()=>venueNameFromSedeIndex
]);
const SHORT_URL_SEDE_LABELS = [
    'El Bodeguero',
    'Elite',
    'Food Kart',
    'Margarita Padel',
    'Playa el Agua',
    'Sun Sol Costa Azul',
    'Sun Sol Pedro Gonzalez',
    'Tibisay'
];
function venueNameFromSedeIndex(index) {
    if (!Number.isFinite(index) || index < 1 || index > SHORT_URL_SEDE_LABELS.length) return null;
    return SHORT_URL_SEDE_LABELS[index - 1];
}
const VENUE_TO_INDEX = new Map(SHORT_URL_SEDE_LABELS.map((name, i)=>[
        name.trim().toLowerCase(),
        i + 1
    ]));
function sedeIndexFromVenueName(venueName) {
    const v = venueName.trim().toLowerCase();
    const idx = VENUE_TO_INDEX.get(v);
    return idx ?? null;
}
function buildPizarraShortPath(sedeIndex, courtNum) {
    return `s${sedeIndex}/c${courtNum}`;
}
const SEDE_CODE_TO_VENUE = Object.fromEntries(SHORT_URL_SEDE_LABELS.map((name, i)=>[
        `S${i + 1}`,
        name
    ]));
}),
"[project]/src/components/publicidad/CourtCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CourtCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtHealth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/courtHealth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pizarraShortUrl$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/pizarraShortUrl.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-ssr] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-ssr] (ecmascript) <export default as ChevronUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-ssr] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye-off.js [app-ssr] (ecmascript) <export default as EyeOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ImageIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/image.js [app-ssr] (ecmascript) <export default as ImageIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-ssr] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-ssr] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$video$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Video$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/video.js [app-ssr] (ecmascript) <export default as Video>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wifi$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wifi.js [app-ssr] (ecmascript) <export default as Wifi>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function statusStyle(status) {
    switch(status){
        case 'online':
            return {
                wifi: 'text-emerald-400'
            };
        case 'warning':
            return {
                wifi: 'text-orange-400'
            };
        case 'offline':
            return {
                wifi: 'text-red-500'
            };
        default:
            return {
                wifi: 'text-white/30'
            };
    }
}
function orderedMediaIdsFromRows(rows) {
    return [
        ...rows
    ].sort((a, b)=>(a.orden ?? 0) - (b.orden ?? 0)).map((r)=>r.media_content?.id).filter((id)=>Boolean(id));
}
function CourtCard({ venueName, courtKey, displayCourtNum, title, libraryVideos, libraryImages, videoRows, imageRows, tiraList, linkedTiraIds, videoCambioMinutos, imagenCambioMinutos, tiraCambioMinutos, imagenLoop, imagenPausaSeg, onSaveVideoPlaylist, onSaveImagePlaylist, onSaveTiraPlaylist, lastSeenIso, isSaving, linkTournamentId, linkMatchId }) {
    const status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtHealth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["healthStatusFromLastSeen"])(lastSeenIso ?? null);
    const { wifi } = statusStyle(status);
    const [openPanel, setOpenPanel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [minimalMode, setMinimalMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [videoSearch, setVideoSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [imageSearch, setImageSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [tiraSearch, setTiraSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [draftVideoIds, setDraftVideoIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [draftVideoMin, setDraftVideoMin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [draftImageIds, setDraftImageIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [draftImageMin, setDraftImageMin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [draftImagenLoop, setDraftImagenLoop] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [draftImagenPausa, setDraftImagenPausa] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [draftTiraIds, setDraftTiraIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [draftTiraMin, setDraftTiraMin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const prevPanel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(undefined);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const panelChanged = prevPanel.current !== openPanel;
        prevPanel.current = openPanel;
        if (openPanel === 'video') {
            const serverIds = orderedMediaIdsFromRows(videoRows);
            // Only force sync if the panel just opened OR the data actually changed from server
            setDraftVideoIds(serverIds);
            setDraftVideoMin(videoCambioMinutos);
            if (panelChanged) setVideoSearch('');
        } else if (openPanel === 'imagen') {
            const serverIds = orderedMediaIdsFromRows(imageRows);
            setDraftImageIds(serverIds);
            setDraftImageMin(imagenCambioMinutos);
            setDraftImagenLoop(imagenLoop);
            setDraftImagenPausa(imagenPausaSeg);
            if (panelChanged) setImageSearch('');
        } else if (openPanel === 'texto') {
            setDraftTiraIds([
                ...linkedTiraIds
            ]);
            setDraftTiraMin(tiraCambioMinutos);
            if (panelChanged) setTiraSearch('');
        }
    }, [
        openPanel,
        videoRows,
        videoCambioMinutos,
        imageRows,
        imagenCambioMinutos,
        imagenLoop,
        imagenPausaSeg,
        linkedTiraIds,
        tiraCambioMinutos
    ]);
    const toggleVideo = ()=>setOpenPanel((p)=>p === 'video' ? null : 'video');
    const toggleImagen = ()=>setOpenPanel((p)=>p === 'imagen' ? null : 'imagen');
    const toggleTexto = ()=>setOpenPanel((p)=>p === 'texto' ? null : 'texto');
    const sedeIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pizarraShortUrl$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sedeIndexFromVenueName"])(venueName);
    const pizarraShortPath = sedeIndex ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pizarraShortUrl$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildPizarraShortPath"])(sedeIndex, displayCourtNum) : null;
    /**
   * Misma URL que la pizarra en TV: con torneo+partido desde `pizarra_cancha_state` en admin;
   * si no hay partido en la cancha, solo complex+courtId (sin pasar por /display → redirect incompleto).
   */ const previewIframeSrc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const venue = venueName.trim();
        const tid = String(linkTournamentId ?? '').trim();
        const mid = String(linkMatchId ?? '').trim();
        const q = new URLSearchParams();
        if (tid) q.set('tournamentId', tid);
        if (mid) q.set('matchId', mid);
        if (venue) q.set('complex', venue);
        q.set('courtId', String(displayCourtNum));
        if (minimalMode) q.set('minimal', '1');
        return `/dev/pizarra-concept?${q.toString()}`;
    }, [
        venueName,
        displayCourtNum,
        minimalMode,
        linkTournamentId,
        linkMatchId
    ]);
    const shortHref = pizarraShortPath ? (()=>{
        const q = new URLSearchParams();
        if (minimalMode) q.set('minimal', '1');
        const tid = String(linkTournamentId ?? '').trim();
        const mid = String(linkMatchId ?? '').trim();
        if (tid) q.set('tournamentId', tid);
        if (mid) q.set('matchId', mid);
        const qs = q.toString();
        return `/${pizarraShortPath}${qs ? `?${qs}` : ''}`;
    })() : null;
    const videoById = (id)=>libraryVideos.find((m)=>m.id === id);
    const imageById = (id)=>libraryImages.find((m)=>m.id === id);
    const filteredVideos = libraryVideos.filter((m)=>{
        const q = videoSearch.trim().toLowerCase();
        if (!q) return true;
        const n = (m.nombre_sponsor || m.nombre || '').toLowerCase();
        return n.includes(q);
    });
    const filteredImages = libraryImages.filter((m)=>{
        const q = imageSearch.trim().toLowerCase();
        if (!q) return true;
        const n = (m.nombre_sponsor || m.nombre || '').toLowerCase();
        return n.includes(q);
    });
    const filteredTiras = tiraList.filter((t)=>{
        const q = tiraSearch.trim().toLowerCase();
        if (!q) return true;
        return t.mensaje.toLowerCase().includes(q);
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-2xl border border-white/20 bg-gradient-to-b from-white/[0.06] to-black/35 p-3 flex flex-col min-h-0 shadow-[0_10px_30px_rgba(0,0,0,0.35)] ring-1 ring-white/5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between gap-2 mb-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 min-w-0 flex-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wifi$3e$__["Wifi"], {
                                className: `w-4 h-4 shrink-0 ${wifi}`,
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                lineNumber: 224,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-sm font-black uppercase leading-tight text-white/95 truncate",
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                lineNumber: 225,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                        lineNumber: 223,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-end gap-1 shrink-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[10px] text-white/40 font-mono",
                            children: courtKey
                        }, void 0, false, {
                            fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                            lineNumber: 228,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                        lineNumber: 227,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                lineNumber: 222,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative h-40 w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shrink-0",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                    src: previewIframeSrc,
                    title: `Vista previa pizarra ${courtKey}`,
                    loading: "eager",
                    className: "pointer-events-none border-0",
                    style: {
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: 1920,
                        height: 1080,
                        transform: 'translate(-50%, -50%) scale(0.148148)',
                        transformOrigin: 'center center'
                    }
                }, previewIframeSrc, false, {
                    fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                    lineNumber: 233,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                lineNumber: 232,
                columnNumber: 7
            }, this),
            shortHref && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                href: shortHref,
                target: "_blank",
                rel: "noreferrer",
                className: "mt-2 block text-center text-[9px] font-black uppercase tracking-widest text-white/45 hover:text-white/70 underline-offset-2 hover:underline truncate px-1",
                title: "Abrir URL corta de pizarra",
                children: [
                    "smartpadel58.com/",
                    pizarraShortPath
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                lineNumber: 251,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 flex-1 min-h-0 flex flex-col",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[9px] font-black uppercase text-white/45 tracking-wider mb-2",
                        children: "Playlist en pantalla"
                    }, void 0, false, {
                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                        lineNumber: 263,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-3 gap-1.5 shrink-0 mb-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: toggleVideo,
                                className: `flex flex-col items-center justify-center gap-1 rounded-xl border py-2.5 px-1 text-[9px] font-black uppercase tracking-tight transition-colors ${openPanel === 'video' ? 'border-padel-primary/55 bg-padel-primary/15 text-padel-primary' : 'border-white/10 bg-black/40 text-white/70 hover:bg-white/5 hover:text-white'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$video$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Video$3e$__["Video"], {
                                        className: "w-4 h-4 shrink-0"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                        lineNumber: 274,
                                        columnNumber: 13
                                    }, this),
                                    "Video"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                lineNumber: 265,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: toggleImagen,
                                className: `flex flex-col items-center justify-center gap-1 rounded-xl border py-2.5 px-1 text-[9px] font-black uppercase tracking-tight transition-colors ${openPanel === 'imagen' ? 'border-padel-primary/55 bg-padel-primary/15 text-padel-primary' : 'border-white/10 bg-black/40 text-white/70 hover:bg-white/5 hover:text-white'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ImageIcon$3e$__["ImageIcon"], {
                                        className: "w-4 h-4 shrink-0"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                        lineNumber: 286,
                                        columnNumber: 13
                                    }, this),
                                    "Imagen"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                lineNumber: 277,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: toggleTexto,
                                className: `flex flex-col items-center justify-center gap-1 rounded-xl border py-2.5 px-1 text-[9px] font-black uppercase tracking-tight transition-colors ${openPanel === 'texto' ? 'border-padel-primary/55 bg-padel-primary/15 text-padel-primary' : 'border-white/10 bg-black/40 text-white/70 hover:bg-white/5 hover:text-white'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
                                        className: "w-4 h-4 shrink-0"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                        lineNumber: 298,
                                        columnNumber: 13
                                    }, this),
                                    "Texto"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                lineNumber: 289,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                        lineNumber: 264,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setMinimalMode((v)=>!v),
                        className: `w-full mb-2 rounded-lg border px-2 py-2 text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${minimalMode ? 'bg-padel-primary/15 border-padel-primary/40 text-padel-primary' : 'bg-black/40 border-white/10 text-white/70 hover:bg-white/5'}`,
                        title: minimalMode ? 'Mostrar publicidad/tiras' : 'Solo pizarra (sin video/imagen/tira)',
                        children: [
                            minimalMode ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                                className: "w-3.5 h-3.5"
                            }, void 0, false, {
                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                lineNumber: 312,
                                columnNumber: 26
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                className: "w-3.5 h-3.5"
                            }, void 0, false, {
                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                lineNumber: 312,
                                columnNumber: 63
                            }, this),
                            minimalMode ? 'Solo pizarra' : 'Con publicidad'
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                        lineNumber: 302,
                        columnNumber: 9
                    }, this),
                    !openPanel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-1 space-y-2",
                        children: [
                            videoRows.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-xl border border-white/5 bg-white/[0.02] p-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[8px] font-black uppercase text-white/40 mb-1 flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$video$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Video$3e$__["Video"], {
                                                size: 10,
                                                className: "text-padel-primary"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 322,
                                                columnNumber: 19
                                            }, this),
                                            " Playlist Videos"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                        lineNumber: 321,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-1.5",
                                        children: videoRows.map((r, i)=>{
                                            const url = r.media_content?.url;
                                            const isVid = url && String(r.media_content?.tipo || '').toLowerCase().includes('video');
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "inline-flex items-center gap-1.5 text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/80",
                                                children: [
                                                    isVid ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                                                        src: url,
                                                        className: "h-7 w-12 shrink-0 rounded object-cover border border-white/10 bg-black",
                                                        muted: true,
                                                        playsInline: true,
                                                        preload: "metadata",
                                                        "aria-hidden": true
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 334,
                                                        columnNumber: 27
                                                    }, this) : null,
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "truncate max-w-[10rem]",
                                                        children: [
                                                            i + 1,
                                                            ". ",
                                                            r.media_content?.nombre_sponsor || r.media_content?.nombre || 'Clip'
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 343,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, r.id, true, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 329,
                                                columnNumber: 23
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                        lineNumber: 324,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                lineNumber: 320,
                                columnNumber: 15
                            }, this),
                            imageRows.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-xl border border-white/5 bg-white/[0.02] p-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[8px] font-black uppercase text-white/40 mb-1 flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ImageIcon$3e$__["ImageIcon"], {
                                                size: 10,
                                                className: "text-padel-primary"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 356,
                                                columnNumber: 19
                                            }, this),
                                            " Carrusel Imágenes"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                        lineNumber: 355,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-1.5",
                                        children: imageRows.map((r, i)=>{
                                            const url = r.media_content?.url;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "inline-flex items-center gap-1.5 text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/80",
                                                children: [
                                                    url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: url,
                                                        alt: "",
                                                        className: "h-7 w-7 shrink-0 rounded object-cover border border-white/10 bg-black"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 367,
                                                        columnNumber: 27
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "h-7 w-7 shrink-0 rounded bg-white/5 border border-white/10"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 373,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "truncate max-w-[10rem]",
                                                        children: [
                                                            i + 1,
                                                            ". ",
                                                            r.media_content?.nombre_sponsor || r.media_content?.nombre || 'Imagen'
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 375,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, r.id, true, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 362,
                                                columnNumber: 23
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                        lineNumber: 358,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                lineNumber: 354,
                                columnNumber: 15
                            }, this),
                            videoRows.length === 0 && imageRows.length === 0 && !minimalMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-center py-2 text-[9px] text-white/30 italic",
                                children: "Sin contenido asignado"
                            }, void 0, false, {
                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                lineNumber: 386,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                        lineNumber: 318,
                        columnNumber: 11
                    }, this),
                    openPanel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "overflow-y-auto max-h-[520px] rounded-xl border border-white/10 bg-black/25 p-2 space-y-2",
                        children: [
                            openPanel === 'video' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-xl border border-white/10 bg-black/30 p-2 space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[9px] font-black uppercase text-white/50",
                                                children: "Biblioteca de videos"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 396,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                        className: "absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/35"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 398,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        value: videoSearch,
                                                        onChange: (e)=>setVideoSearch(e.target.value),
                                                        placeholder: "Buscar…",
                                                        className: "w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-2 py-1.5 text-[11px] text-white placeholder:text-white/35 outline-none focus:border-white/25"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 399,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 397,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "max-h-[140px] overflow-y-auto space-y-1",
                                                children: [
                                                    filteredVideos.map((m)=>{
                                                        const inList = draftVideoIds.includes(m.id);
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center justify-between gap-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[10px] text-white/85 truncate",
                                                                    children: m.nombre_sponsor || m.nombre || m.id
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                    lineNumber: 414,
                                                                    columnNumber: 27
                                                                }, this),
                                                                inList ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>setDraftVideoIds((prev)=>prev.filter((x)=>x !== m.id)),
                                                                    className: "shrink-0 text-[8px] font-black uppercase text-red-300 px-2 py-0.5 rounded bg-red-500/15 border border-red-500/25",
                                                                    children: "Quitar"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                    lineNumber: 418,
                                                                    columnNumber: 29
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>setDraftVideoIds((prev)=>[
                                                                                ...prev,
                                                                                m.id
                                                                            ]),
                                                                    className: "shrink-0 flex items-center gap-0.5 text-[8px] font-black uppercase text-padel-primary px-2 py-0.5 rounded bg-padel-primary/10 border border-padel-primary/30",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                                            className: "w-3 h-3"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                            lineNumber: 431,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        " Añadir"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                    lineNumber: 426,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, m.id, true, {
                                                            fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                            lineNumber: 410,
                                                            columnNumber: 25
                                                        }, this);
                                                    }),
                                                    filteredVideos.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[9px] text-white/40 py-2 text-center",
                                                        children: "Sin resultados"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 438,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 406,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                        lineNumber: 395,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-xl border border-padel-primary/25 bg-black/35 p-2 space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[9px] font-black uppercase text-padel-primary/90",
                                                children: "Orden de reproducción"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 444,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[8px] text-white/45 leading-snug",
                                                children: "El orden es el de la lista (arriba → abajo). Usa flechas para mover."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 445,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "max-h-[120px] overflow-y-auto space-y-1",
                                                children: draftVideoIds.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[9px] text-white/40 text-center py-3",
                                                    children: "Añade clips desde la biblioteca"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                    lineNumber: 450,
                                                    columnNumber: 23
                                                }, this) : draftVideoIds.map((id, idx)=>{
                                                    const m = videoById(id);
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-1 rounded-lg border border-white/10 bg-black/30 px-1.5 py-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[9px] font-black text-white/45 w-4",
                                                                children: idx + 1
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                lineNumber: 459,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[10px] text-white/90 flex-1 truncate",
                                                                children: m?.nombre_sponsor || m?.nombre || id.slice(0, 8)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                lineNumber: 460,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex flex-col",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        disabled: idx === 0,
                                                                        onClick: ()=>setDraftVideoIds((prev)=>{
                                                                                const n = [
                                                                                    ...prev
                                                                                ];
                                                                                [n[idx - 1], n[idx]] = [
                                                                                    n[idx],
                                                                                    n[idx - 1]
                                                                                ];
                                                                                return n;
                                                                            }),
                                                                        className: "p-0.5 rounded border border-white/10 disabled:opacity-20",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                                                                            className: "w-3 h-3"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                            lineNumber: 476,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                        lineNumber: 464,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        disabled: idx >= draftVideoIds.length - 1,
                                                                        onClick: ()=>setDraftVideoIds((prev)=>{
                                                                                const n = [
                                                                                    ...prev
                                                                                ];
                                                                                [n[idx], n[idx + 1]] = [
                                                                                    n[idx + 1],
                                                                                    n[idx]
                                                                                ];
                                                                                return n;
                                                                            }),
                                                                        className: "p-0.5 rounded border border-white/10 disabled:opacity-20",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                                            className: "w-3 h-3"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                            lineNumber: 490,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                        lineNumber: 478,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                lineNumber: 463,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>setDraftVideoIds((prev)=>prev.filter((x)=>x !== id)),
                                                                className: "p-1 text-white/50 hover:text-red-300",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                    className: "w-3.5 h-3.5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                    lineNumber: 498,
                                                                    columnNumber: 31
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                lineNumber: 493,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, id, true, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 455,
                                                        columnNumber: 27
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 448,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                        lineNumber: 443,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-xl border border-white/10 bg-black/30 p-2 space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex items-center gap-2 text-[10px] text-white/80 cursor-pointer",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "radio",
                                                        name: `vm-${courtKey}`,
                                                        checked: draftVideoMin === 0,
                                                        onChange: ()=>setDraftVideoMin(0)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 509,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Loop continuo (pasa al siguiente al terminar el clip)"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 508,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex items-center gap-2 text-[10px] text-white/80 cursor-pointer flex-wrap",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "radio",
                                                        name: `vm-${courtKey}`,
                                                        checked: draftVideoMin > 0,
                                                        onChange: ()=>setDraftVideoMin(1)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 518,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Cada"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 524,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: 1,
                                                        max: 120,
                                                        step: 1,
                                                        disabled: draftVideoMin === 0,
                                                        value: draftVideoMin > 0 ? draftVideoMin : 1,
                                                        onChange: (e)=>setDraftVideoMin(Math.max(1, Math.floor(Number(e.target.value) || 1))),
                                                        className: "w-12 bg-black/50 border border-white/10 rounded px-1 py-0.5 text-[10px] text-white [color-scheme:dark] disabled:opacity-40"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 525,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "min pasar al siguiente (aunque el clip siga)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 537,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 517,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                        lineNumber: 507,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        disabled: isSaving,
                                        onClick: ()=>void onSaveVideoPlaylist(draftVideoIds, draftVideoMin),
                                        className: "w-full rounded-lg bg-padel-primary text-black text-[9px] font-black uppercase py-2 flex items-center justify-center gap-2 disabled:opacity-50",
                                        children: [
                                            isSaving ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                className: "w-3.5 h-3.5 animate-spin"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 547,
                                                columnNumber: 31
                                            }, this) : null,
                                            "Guardar videos"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                        lineNumber: 541,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                lineNumber: 394,
                                columnNumber: 15
                            }, this),
                            openPanel === 'imagen' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-xl border border-white/10 bg-black/30 p-2 space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[9px] font-black uppercase text-white/50",
                                                children: "Biblioteca de imágenes"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 556,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                        className: "absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/35"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 558,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        value: imageSearch,
                                                        onChange: (e)=>setImageSearch(e.target.value),
                                                        placeholder: "Buscar…",
                                                        className: "w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-2 py-1.5 text-[11px] text-white placeholder:text-white/35 outline-none focus:border-white/25"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 559,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 557,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "max-h-[140px] overflow-y-auto space-y-1",
                                                children: [
                                                    filteredImages.map((m)=>{
                                                        const inList = draftImageIds.includes(m.id);
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center justify-between gap-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[10px] text-white/85 truncate",
                                                                    children: m.nombre_sponsor || m.nombre || m.id
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                    lineNumber: 574,
                                                                    columnNumber: 27
                                                                }, this),
                                                                inList ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>setDraftImageIds((prev)=>prev.filter((x)=>x !== m.id)),
                                                                    className: "shrink-0 text-[8px] font-black uppercase text-red-300 px-2 py-0.5 rounded bg-red-500/15",
                                                                    children: "Quitar"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                    lineNumber: 578,
                                                                    columnNumber: 29
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>setDraftImageIds((prev)=>[
                                                                                ...prev,
                                                                                m.id
                                                                            ]),
                                                                    className: "shrink-0 flex items-center gap-0.5 text-[8px] font-black uppercase text-padel-primary px-2 py-0.5 rounded bg-padel-primary/10 border border-padel-primary/30",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                                            className: "w-3 h-3"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                            lineNumber: 591,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        " Añadir"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                    lineNumber: 586,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, m.id, true, {
                                                            fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                            lineNumber: 570,
                                                            columnNumber: 25
                                                        }, this);
                                                    }),
                                                    filteredImages.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[9px] text-white/40 py-2 text-center",
                                                        children: "Sin resultados"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 598,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 566,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                        lineNumber: 555,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-xl border border-padel-primary/25 bg-black/35 p-2 space-y-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[9px] font-black uppercase text-padel-primary/90",
                                                children: "Orden en carrusel"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 604,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "max-h-[100px] overflow-y-auto space-y-1",
                                                children: draftImageIds.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[9px] text-white/40 text-center py-2",
                                                    children: "Añade imágenes"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                    lineNumber: 607,
                                                    columnNumber: 23
                                                }, this) : draftImageIds.map((id, idx)=>{
                                                    const m = imageById(id);
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-1 rounded-lg border border-white/10 bg-black/30 px-1.5 py-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[9px] font-black text-white/45 w-4",
                                                                children: idx + 1
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                lineNumber: 616,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[10px] flex-1 truncate",
                                                                children: m?.nombre_sponsor || m?.nombre || id.slice(0, 8)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                lineNumber: 617,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                disabled: idx === 0,
                                                                onClick: ()=>setDraftImageIds((prev)=>{
                                                                        const n = [
                                                                            ...prev
                                                                        ];
                                                                        [n[idx - 1], n[idx]] = [
                                                                            n[idx],
                                                                            n[idx - 1]
                                                                        ];
                                                                        return n;
                                                                    }),
                                                                className: "p-0.5 disabled:opacity-20",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                                                                    className: "w-3 h-3"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                    lineNumber: 632,
                                                                    columnNumber: 31
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                lineNumber: 620,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                disabled: idx >= draftImageIds.length - 1,
                                                                onClick: ()=>setDraftImageIds((prev)=>{
                                                                        const n = [
                                                                            ...prev
                                                                        ];
                                                                        [n[idx], n[idx + 1]] = [
                                                                            n[idx + 1],
                                                                            n[idx]
                                                                        ];
                                                                        return n;
                                                                    }),
                                                                className: "p-0.5 disabled:opacity-20",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                                    className: "w-3 h-3"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                    lineNumber: 646,
                                                                    columnNumber: 31
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                lineNumber: 634,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>setDraftImageIds((prev)=>prev.filter((x)=>x !== id)),
                                                                className: "p-1 text-white/50",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                    className: "w-3 h-3"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                    lineNumber: 653,
                                                                    columnNumber: 31
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                lineNumber: 648,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, id, true, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 612,
                                                        columnNumber: 27
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 605,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                        lineNumber: 603,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-xl border border-white/10 bg-black/30 p-2 space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex items-center gap-2 text-[10px] text-white/80 cursor-pointer",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "radio",
                                                        name: `im-${courtKey}`,
                                                        checked: draftImageMin === 0,
                                                        onChange: ()=>setDraftImageMin(0)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 664,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Loop continuo (duración por ítem en BD; ver abajo)"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 663,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex items-center gap-2 text-[10px] text-white/80 cursor-pointer flex-wrap",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "radio",
                                                        name: `im-${courtKey}`,
                                                        checked: draftImageMin > 0,
                                                        onChange: ()=>setDraftImageMin(1)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 673,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Cada"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 679,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: 1,
                                                        max: 120,
                                                        step: 1,
                                                        disabled: draftImageMin === 0,
                                                        value: draftImageMin > 0 ? draftImageMin : 1,
                                                        onChange: (e)=>setDraftImageMin(Math.max(1, Math.floor(Number(e.target.value) || 1))),
                                                        className: "w-12 bg-black/50 border border-white/10 rounded px-1 py-0.5 text-[10px] [color-scheme:dark] disabled:opacity-40"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 680,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "min por imagen"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 692,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 672,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex items-center gap-2 text-[9px] text-white/70 cursor-pointer",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "checkbox",
                                                        checked: draftImagenLoop,
                                                        onChange: (e)=>setDraftImagenLoop(e.target.checked)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 695,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Repetir carrusel al llegar al final"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 694,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 text-[9px] text-white/60",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Pausa extra (s)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 703,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: 0,
                                                        max: 120,
                                                        step: 1,
                                                        value: draftImagenPausa,
                                                        onChange: (e)=>setDraftImagenPausa(Math.max(0, Math.floor(Number(e.target.value) || 0))),
                                                        className: "w-14 bg-black/50 border border-white/10 rounded px-1 py-0.5 [color-scheme:dark]"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 704,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 702,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                        lineNumber: 662,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        disabled: isSaving,
                                        onClick: ()=>void onSaveImagePlaylist(draftImageIds, draftImageMin, draftImagenLoop, draftImagenPausa),
                                        className: "w-full rounded-lg bg-padel-primary text-black text-[9px] font-black uppercase py-2 flex items-center justify-center gap-2 disabled:opacity-50",
                                        children: [
                                            isSaving ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                className: "w-3.5 h-3.5 animate-spin"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 731,
                                                columnNumber: 31
                                            }, this) : null,
                                            "Guardar imágenes"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                        lineNumber: 718,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                lineNumber: 554,
                                columnNumber: 15
                            }, this),
                            openPanel === 'texto' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-xl border border-white/10 bg-black/30 p-2 space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[9px] font-black uppercase text-white/50",
                                                children: "Mensajes disponibles"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 740,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                        className: "absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/35"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 742,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        value: tiraSearch,
                                                        onChange: (e)=>setTiraSearch(e.target.value),
                                                        placeholder: "Buscar…",
                                                        className: "w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-2 py-1.5 text-[11px] text-white placeholder:text-white/35 outline-none focus:border-white/25"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 743,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 741,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "max-h-[120px] overflow-y-auto space-y-1",
                                                children: filteredTiras.map((t)=>{
                                                    const inList = draftTiraIds.includes(t.id);
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-start justify-between gap-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[10px] text-white/85 leading-snug",
                                                                children: t.mensaje
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                lineNumber: 758,
                                                                columnNumber: 27
                                                            }, this),
                                                            inList ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>setDraftTiraIds((prev)=>prev.filter((x)=>x !== t.id)),
                                                                className: "shrink-0 text-[8px] font-black uppercase text-red-300",
                                                                children: "Quitar"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                lineNumber: 760,
                                                                columnNumber: 29
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>setDraftTiraIds((prev)=>[
                                                                            ...prev,
                                                                            t.id
                                                                        ]),
                                                                className: "shrink-0 text-[8px] font-black uppercase text-padel-primary",
                                                                children: "+ Añadir"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                lineNumber: 768,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, t.id, true, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 754,
                                                        columnNumber: 25
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 750,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                        lineNumber: 739,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-xl border border-padel-primary/25 bg-black/35 p-2 space-y-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[9px] font-black uppercase text-padel-primary/90",
                                                children: "Orden en tira"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 783,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "max-h-[100px] overflow-y-auto space-y-1",
                                                children: [
                                                    draftTiraIds.map((id, idx)=>{
                                                        const t = tiraList.find((x)=>x.id === id);
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-1 rounded-lg border border-white/10 px-1.5 py-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[9px] text-white/45 w-4",
                                                                    children: idx + 1
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                    lineNumber: 792,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[10px] flex-1 truncate",
                                                                    children: t?.mensaje || id
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                    lineNumber: 793,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    disabled: idx === 0,
                                                                    onClick: ()=>setDraftTiraIds((prev)=>{
                                                                            const n = [
                                                                                ...prev
                                                                            ];
                                                                            [n[idx - 1], n[idx]] = [
                                                                                n[idx],
                                                                                n[idx - 1]
                                                                            ];
                                                                            return n;
                                                                        }),
                                                                    className: "p-0.5 disabled:opacity-20",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                                                                        className: "w-3 h-3"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                        lineNumber: 806,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                    lineNumber: 794,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    disabled: idx >= draftTiraIds.length - 1,
                                                                    onClick: ()=>setDraftTiraIds((prev)=>{
                                                                            const n = [
                                                                                ...prev
                                                                            ];
                                                                            [n[idx], n[idx + 1]] = [
                                                                                n[idx + 1],
                                                                                n[idx]
                                                                            ];
                                                                            return n;
                                                                        }),
                                                                    className: "p-0.5 disabled:opacity-20",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                                        className: "w-3 h-3"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                        lineNumber: 820,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                    lineNumber: 808,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>setDraftTiraIds((prev)=>prev.filter((x)=>x !== id)),
                                                                    className: "p-1",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                        className: "w-3 h-3"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                        lineNumber: 827,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                                    lineNumber: 822,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, id, true, {
                                                            fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                            lineNumber: 788,
                                                            columnNumber: 25
                                                        }, this);
                                                    }),
                                                    draftTiraIds.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[9px] text-white/40 text-center py-2",
                                                        children: "Añade mensajes"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 833,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 784,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                        lineNumber: 782,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-xl border border-white/10 bg-black/30 p-2 space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex items-center gap-2 text-[10px] text-white/80 cursor-pointer",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "radio",
                                                        name: `tr-${courtKey}`,
                                                        checked: draftTiraMin === 0,
                                                        onChange: ()=>setDraftTiraMin(0)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 840,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Tira continua (marquee; la rotación por minutos la usará la pantalla cuando esté soportada)"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 839,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex items-center gap-2 text-[10px] text-white/80 cursor-pointer flex-wrap",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "radio",
                                                        name: `tr-${courtKey}`,
                                                        checked: draftTiraMin > 0,
                                                        onChange: ()=>setDraftTiraMin(2)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 849,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Destacar cada mensaje"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 855,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: 1,
                                                        max: 60,
                                                        step: 1,
                                                        disabled: draftTiraMin === 0,
                                                        value: draftTiraMin > 0 ? draftTiraMin : 2,
                                                        onChange: (e)=>setDraftTiraMin(Math.max(1, Math.floor(Number(e.target.value) || 1))),
                                                        className: "w-12 bg-black/50 border border-white/10 rounded px-1 py-0.5 text-[10px] [color-scheme:dark] disabled:opacity-40"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 856,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "min (config guardada; pantallas pueden leerla)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                        lineNumber: 868,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 848,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                        lineNumber: 838,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        disabled: isSaving,
                                        onClick: ()=>void onSaveTiraPlaylist(draftTiraIds, draftTiraMin),
                                        className: "w-full rounded-lg bg-padel-primary text-black text-[9px] font-black uppercase py-2 flex items-center justify-center gap-2 disabled:opacity-50",
                                        children: [
                                            isSaving ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                className: "w-3.5 h-3.5 animate-spin"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                                lineNumber: 878,
                                                columnNumber: 31
                                            }, this) : null,
                                            "Guardar tira"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                        lineNumber: 872,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                                lineNumber: 738,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                        lineNumber: 392,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/publicidad/CourtCard.tsx",
                lineNumber: 262,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/publicidad/CourtCard.tsx",
        lineNumber: 221,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/lib/courtPlaylists.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canchaIdCandidates",
    ()=>canchaIdCandidates,
    "canchaIdStoredForPublicidadTables",
    ()=>canchaIdStoredForPublicidadTables,
    "fetchCanchaPlaylistConfig",
    ()=>fetchCanchaPlaylistConfig,
    "fetchCanchaPlaylistRows",
    ()=>fetchCanchaPlaylistRows,
    "fetchCanchaTiraMessages",
    ()=>fetchCanchaTiraMessages,
    "normalizeCanchaIdKey",
    ()=>normalizeCanchaIdKey,
    "normalizeCourtPlaylistRows",
    ()=>normalizeCourtPlaylistRows,
    "partitionPlaylistRows",
    ()=>partitionPlaylistRows,
    "playlistRowKind",
    ()=>playlistRowKind,
    "upsertCanchaPlaylistConfig",
    ()=>upsertCanchaPlaylistConfig
]);
function normalizeCanchaIdKey(raw) {
    const s = String(raw ?? '').trim();
    const m = s.match(/^cancha_(.+)$/i);
    return m ? m[1].trim() : s;
}
function canchaIdStoredForPublicidadTables(courtKeyOrCanchaId) {
    const n = normalizeCanchaIdKey(courtKeyOrCanchaId);
    if (/^\d+$/.test(n)) return `cancha_${n}`;
    const s = String(courtKeyOrCanchaId ?? '').trim();
    if (/^cancha_/i.test(s)) return s;
    return n;
}
function canchaIdCandidates(canchaId) {
    const id = String(canchaId || '').trim();
    if (!id) return [];
    const m = id.match(/^cancha_(\d+)$/i);
    if (m) return [
        id,
        m[1]
    ];
    if (/^\d+$/.test(id)) return [
        id,
        `cancha_${id}`
    ];
    return [
        id
    ];
}
async function enrichRowsWithMediaById(supabase, rows) {
    const missing = rows.filter((r)=>!r.media_content?.url && r.media_id).map((r)=>r.media_id);
    if (!missing.length) return rows;
    const ids = Array.from(new Set(missing));
    const { data } = await supabase.from('media_content').select('id, tipo, url, nombre_sponsor, nombre').in('id', ids);
    const byId = new Map((data || []).map((m)=>[
            String(m.id),
            m
        ]));
    return rows.map((r)=>{
        if (r.media_content?.url) return r;
        const m = byId.get(String(r.media_id));
        if (!m) return r;
        return {
            ...r,
            media_content: {
                id: String(m.id || ''),
                tipo: String(m.tipo || ''),
                url: String(m.url || ''),
                nombre_sponsor: m.nombre_sponsor ?? null,
                nombre: m.nombre ?? null
            }
        };
    });
}
function normalizeMediaContent(raw) {
    if (!raw) return null;
    if (Array.isArray(raw)) {
        const first = raw[0];
        if (!first) return null;
        return {
            id: String(first.id || ''),
            tipo: String(first.tipo || ''),
            url: String(first.url || ''),
            nombre_sponsor: first.nombre_sponsor ?? null,
            nombre: first.nombre ?? null
        };
    }
    const m = raw;
    return {
        id: String(m.id || ''),
        tipo: String(m.tipo || ''),
        url: String(m.url || ''),
        nombre_sponsor: m.nombre_sponsor ?? null,
        nombre: m.nombre ?? null
    };
}
function normalizeCourtPlaylistRows(rows) {
    return (rows || []).map((r)=>{
        const row = r || {};
        return {
            id: String(row.id || ''),
            cancha_id: String(row.cancha_id || ''),
            venue_name: row.venue_name ? String(row.venue_name) : undefined,
            media_id: String(row.media_id || ''),
            orden: Number(row.orden || 0),
            duracion_segundos: Number(row.duracion_segundos || 0),
            playlist_slot: row.playlist_slot ?? undefined,
            posicion_pantalla: row.posicion_pantalla ? String(row.posicion_pantalla) : null,
            media_content: normalizeMediaContent(row.media_content ?? row.publicidad)
        };
    });
}
function filterPlaylistRowsByVenueLoose(rows, vn) {
    if (!vn) return rows;
    const want = vn.trim().toLowerCase();
    return rows.filter((r)=>String(r.venue_name ?? '').trim().toLowerCase() === want);
}
function playlistRowKind(a) {
    const ps = a.playlist_slot || 'legacy';
    if (ps === 'imagen') return 'imagen';
    if (ps === 'video') return 'video';
    const mc = normalizeMediaContent(a.media_content);
    const tipo = String(mc?.tipo || '');
    return tipo === 'imagen' ? 'imagen' : 'video';
}
async function fetchCanchaPlaylistRows(supabase, canchaId, venueName) {
    const canchaIds = canchaIdCandidates(canchaId);
    const hasPlayableRows = (rows)=>rows.some((x)=>Boolean(x.media_content?.url));
    const vn = venueName?.trim() || null;
    let q = supabase.from('cancha_publicidad').select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla, media_content(*)').in('cancha_id', canchaIds).order('orden', {
        ascending: true
    });
    if (vn) q = q.ilike('venue_name', vn);
    const r = await q;
    if (!r.error && (r.data || []).length > 0) {
        const norm = await enrichRowsWithMediaById(supabase, normalizeCourtPlaylistRows(r.data || []));
        if (hasPlayableRows(norm) || norm.length > 0) return {
            ...r,
            data: norm
        };
    }
    // Algunas BD exponen la relación como `publicidad` en lugar de `media_content`.
    let qRelFallback = supabase.from('cancha_publicidad').select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla, publicidad(*)').in('cancha_id', canchaIds).order('orden', {
        ascending: true
    });
    if (vn) qRelFallback = qRelFallback.ilike('venue_name', vn);
    const rRelFallback = await qRelFallback;
    if (!rRelFallback.error && (rRelFallback.data || []).length > 0) {
        const norm = await enrichRowsWithMediaById(supabase, normalizeCourtPlaylistRows(rRelFallback.data || []));
        if (hasPlayableRows(norm) || norm.length > 0) return {
            ...rRelFallback,
            data: norm
        };
    }
    // Fallback: sin filtro sede en SQL; acotamos por sede en cliente si hace falta.
    let q2 = supabase.from('cancha_publicidad').select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla, media_content(*)').in('cancha_id', canchaIds).order('orden', {
        ascending: true
    });
    const r2 = await q2;
    if (!r2.error) {
        let norm = await enrichRowsWithMediaById(supabase, normalizeCourtPlaylistRows(r2.data || []));
        norm = filterPlaylistRowsByVenueLoose(norm, vn);
        if (hasPlayableRows(norm) || norm.length > 0) return {
            ...r2,
            data: norm
        };
    }
    let q3 = supabase.from('cancha_publicidad').select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla, publicidad(*)').in('cancha_id', canchaIds).order('orden', {
        ascending: true
    });
    const r3 = await q3;
    if (!r3.error) {
        let norm = await enrichRowsWithMediaById(supabase, normalizeCourtPlaylistRows(r3.data || []));
        norm = filterPlaylistRowsByVenueLoose(norm, vn);
        if (norm.length > 0 || !vn) return {
            ...r3,
            data: norm
        };
    }
    // Fallback final: sin relaciones embebidas (evita fallos de schema cache/FK en PostgREST).
    // Luego resolvemos media por `media_id` con query independiente.
    let q4 = supabase.from('cancha_publicidad').select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla').in('cancha_id', canchaIds).order('orden', {
        ascending: true
    });
    if (vn) {
        q4 = q4.ilike('venue_name', vn);
    }
    const r4 = await q4;
    if (!r4.error) {
        let norm = await enrichRowsWithMediaById(supabase, normalizeCourtPlaylistRows(r4.data || []));
        norm = filterPlaylistRowsByVenueLoose(norm, vn);
        if (hasPlayableRows(norm) || norm.length > 0) return {
            ...r4,
            data: norm
        };
    }
    const r5 = await supabase.from('cancha_publicidad').select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla').in('cancha_id', canchaIds).order('orden', {
        ascending: true
    });
    if (!r5.error) {
        let norm = await enrichRowsWithMediaById(supabase, normalizeCourtPlaylistRows(r5.data || []));
        norm = filterPlaylistRowsByVenueLoose(norm, vn);
        return {
            ...r5,
            data: norm
        };
    }
    return r3;
}
async function fetchCanchaPlaylistConfig(supabase, canchaId, venueName) {
    if (!venueName.trim()) return null;
    const canchaIds = canchaIdCandidates(canchaId);
    const vn = venueName.trim();
    const { data: rowsIlike, error: errIlike } = await supabase.from('cancha_playlist_config').select('*').in('cancha_id', canchaIds).ilike('venue_name', vn).limit(1);
    if (!errIlike && rowsIlike?.[0]) return rowsIlike[0];
    const { data: dataEq, error: errEq } = await supabase.from('cancha_playlist_config').select('*').in('cancha_id', canchaIds).eq('venue_name', vn).maybeSingle();
    if (!errEq && dataEq) return dataEq;
    // Fallback: algunas instalaciones no guardan/filtran por venue_name.
    const { data: data2, error: error2 } = await supabase.from('cancha_playlist_config').select('*').in('cancha_id', canchaIds).limit(1).maybeSingle();
    if (error2 || !data2) return null;
    return data2;
}
async function upsertCanchaPlaylistConfig(supabase, venueName, canchaId, patch) {
    const vn = venueName.trim();
    const { data: existing } = await supabase.from('cancha_playlist_config').select('*').eq('cancha_id', canchaId).eq('venue_name', vn).maybeSingle();
    const ex = existing || {};
    const row = {
        venue_name: vn,
        cancha_id: canchaId,
        imagen_loop: patch.imagen_loop ?? ex.imagen_loop ?? true,
        imagen_pausa_entre_segundos: patch.imagen_pausa_entre_segundos !== undefined ? Math.max(0, Math.floor(Number(patch.imagen_pausa_entre_segundos) || 0)) : Math.max(0, Math.floor(Number(ex.imagen_pausa_entre_segundos) || 0)),
        video_cambio_cada_minutos: patch.video_cambio_cada_minutos !== undefined ? Math.max(0, Math.floor(Number(patch.video_cambio_cada_minutos) || 0)) : Math.max(0, Math.floor(Number(ex.video_cambio_cada_minutos) || 0)),
        imagen_cambio_cada_minutos: patch.imagen_cambio_cada_minutos !== undefined ? Math.max(0, Math.floor(Number(patch.imagen_cambio_cada_minutos) || 0)) : Math.max(0, Math.floor(Number(ex.imagen_cambio_cada_minutos) || 0)),
        tira_cambio_cada_minutos: patch.tira_cambio_cada_minutos !== undefined ? Math.max(0, Math.floor(Number(patch.tira_cambio_cada_minutos) || 0)) : Math.max(0, Math.floor(Number(ex.tira_cambio_cada_minutos) || 0)),
        updated_at: new Date().toISOString()
    };
    return supabase.from('cancha_playlist_config').upsert(row, {
        onConflict: 'venue_name,cancha_id'
    });
}
async function fetchCanchaTiraMessages(supabase, canchaId, venueName) {
    const canchaIds = canchaIdCandidates(canchaId);
    const vn = venueName?.trim();
    if (vn) {
        const { data: links, error: e1 } = await supabase.from('cancha_tira').select('tira_informativa_id, orden').in('cancha_id', canchaIds).ilike('venue_name', vn).order('orden', {
            ascending: true
        });
        if (!e1 && links?.length) {
            const ids = links.map((l)=>l.tira_informativa_id);
            const { data: msgs, error: e2 } = await supabase.from('tira_informativa').select('id, mensaje, activo').in('id', ids).eq('activo', true);
            if (e2 || !msgs?.length) return [];
            const order = new Map(ids.map((id, i)=>[
                    id,
                    i
                ]));
            return msgs.filter((m)=>order.has(m.id)).sort((a, b)=>(order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
        }
        // Fallback 1: mismas canchas, filtrar sede en cliente.
        const { data: links2, error: e1b } = await supabase.from('cancha_tira').select('tira_informativa_id, orden, venue_name').in('cancha_id', canchaIds).order('orden', {
            ascending: true
        });
        if (!e1b && links2?.length) {
            const want = vn.toLowerCase();
            const scoped = links2.filter((l)=>String(l.venue_name ?? '').trim().toLowerCase() === want);
            if (scoped.length > 0) {
                const ids = scoped.map((l)=>l.tira_informativa_id);
                const { data: msgs, error: e2 } = await supabase.from('tira_informativa').select('id, mensaje, activo').in('id', ids).eq('activo', true);
                if (!e2 && msgs?.length) {
                    const order = new Map(ids.map((id, i)=>[
                            id,
                            i
                        ]));
                    return msgs.filter((m)=>order.has(m.id)).sort((a, b)=>(order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
                }
            }
        }
    }
    // Fallback 2: mensajes globales.
    const { data: all, error } = await supabase.from('tira_informativa').select('id, mensaje').eq('activo', true).order('orden', {
        ascending: true
    });
    if (error || !all) return [];
    return all;
}
function partitionPlaylistRows(rows) {
    const video = [];
    const imagen = [];
    for (const r of rows){
        const mc = normalizeMediaContent(r.media_content);
        const row = {
            ...r,
            media_content: mc
        };
        const tipo = String(row.media_content?.tipo || '');
        const isImg = tipo === 'imagen';
        const isVid = tipo.includes('video') || tipo === 'video_url' || tipo === 'video_file';
        const slot = row.playlist_slot || 'legacy';
        if (slot === 'legacy') {
            if (isImg) imagen.push(row);
            else if (isVid) video.push(row);
            else video.push(row);
            continue;
        }
        if (slot === 'imagen') imagen.push(row);
        else video.push(row);
    }
    video.sort((a, b)=>(a.orden ?? 0) - (b.orden ?? 0));
    imagen.sort((a, b)=>(a.orden ?? 0) - (b.orden ?? 0));
    return {
        video,
        imagen
    };
}
}),
"[project]/src/lib/venuesFromTournaments.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Sedes y pistas derivadas de torneos (Admin Publicidad, Dynamic Studio).
 */ __turbopack_context__.s([
    "buildVenuesAndCourtsFromTournaments",
    ()=>buildVenuesAndCourtsFromTournaments
]);
function buildVenuesAndCourtsFromTournaments(tournaments) {
    const map = new Map();
    for (const t of tournaments || []){
        const name = String(t?.complexName || t?.complex || t?._complexName || '').trim();
        if (!name) continue;
        const tid = String(t?.id ?? '').trim();
        const courtNames = Array.isArray(t.courtNames) ? t.courtNames.map((x)=>String(x).trim()) : [];
        const totalFromNum = Number(t.totalCourts) || 0;
        const n = Math.max(courtNames.length, totalFromNum, 1);
        const prev = map.get(name);
        const useNames = courtNames.length >= (prev?.bestNames.length ?? 0) ? courtNames : prev?.bestNames ?? courtNames;
        map.set(name, {
            maxN: Math.max(prev?.maxN ?? 0, n),
            bestNames: useNames,
            tournamentId: prev?.tournamentId || tid || undefined
        });
    }
    return Array.from(map.entries()).map(([name, v])=>{
        const courts = [];
        for(let i = 0; i < v.maxN; i++){
            const displayNum = i + 1;
            const raw = v.bestNames[i]?.trim();
            let label;
            if (raw) {
                label = /^pista\s*\d/i.test(raw) ? raw : `Pista ${displayNum} — ${raw}`;
            } else {
                label = `Pista ${displayNum}`;
            }
            courts.push({
                key: String(displayNum),
                label,
                displayNum
            });
        }
        return {
            name,
            courts,
            tournamentId: v.tournamentId
        };
    }).sort((a, b)=>a.name.localeCompare(b.name));
}
}),
"[project]/src/app/admin/publicidad/data:364588 [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addMediaContentAction",
    ()=>$$RSC_SERVER_ACTION_0
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"400615e2431436f26bde6044913af92cf5e113a789":"addMediaContentAction"},"src/app/admin/publicidad/actions.ts",""] */ "use turbopack no side effects";
;
const $$RSC_SERVER_ACTION_0 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("400615e2431436f26bde6044913af92cf5e113a789", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "addMediaContentAction");
;
 //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcic7XG5cbmltcG9ydCB0eXBlIHsgU3VwYWJhc2VDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnO1xuaW1wb3J0IHsgZ2V0U3VwYWJhc2VTZXJ2aWNlQ2xpZW50IH0gZnJvbSAnQC9saWIvc3VwYWJhc2Uvc2VydmVyJztcbmltcG9ydCB7IHJldmFsaWRhdGVQYXRoIH0gZnJvbSAnbmV4dC9jYWNoZSc7XG5pbXBvcnQge1xuICBjYW5jaGFJZENhbmRpZGF0ZXMsXG4gIGNhbmNoYUlkU3RvcmVkRm9yUHVibGljaWRhZFRhYmxlcyxcbiAgbm9ybWFsaXplQ2FuY2hhSWRLZXksXG59IGZyb20gJ0AvbGliL2NvdXJ0UGxheWxpc3RzJztcblxudHlwZSBFcnIgPSB7IG9rOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9O1xuXG5mdW5jdGlvbiBzZXJ2aWNlTWlzc2luZygpOiBFcnIge1xuICByZXR1cm4ge1xuICAgIG9rOiBmYWxzZSxcbiAgICBlcnJvcjpcbiAgICAgICdTZXJ2aWRvciBzaW4gY3JlZGVuY2lhbGVzIFN1cGFiYXNlLiBBw7FhZGUgU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSBlbiBWZXJjZWwgKEVudmlyb25tZW50IFZhcmlhYmxlcykgeSB2dWVsdmUgYSBkZXNwbGVnYXIuJyxcbiAgfTtcbn1cblxuLyoqIFNvbG8gZXN0YXMgY29sdW1uYXMgZXhpc3RlbiBlbiBjYW5jaGFfcGxheWxpc3RfY29uZmlnOyBlbCByZXN0byBzZSBpZ25vcmEgKGV2aXRhIHAuIGVqLiBzcGxpdF9yYXRpbyDihpIgSU5URUdFUikuICovXG5jb25zdCBQTEFZTElTVF9DT05GSUdfSU5UX0tFWVMgPSBbXG4gICd2aWRlb19jYW1iaW9fY2FkYV9taW51dG9zJyxcbiAgJ2ltYWdlbl9jYW1iaW9fY2FkYV9taW51dG9zJyxcbiAgJ3RpcmFfY2FtYmlvX2NhZGFfbWludXRvcycsXG4gICdpbWFnZW5fcGF1c2FfZW50cmVfc2VndW5kb3MnLFxuXSBhcyBjb25zdDtcblxuZnVuY3Rpb24gc2FuaXRpemVQbGF5bGlzdENvbmZpZ1BhdGNoKHBhdGNoOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICBmb3IgKGNvbnN0IGtleSBvZiBQTEFZTElTVF9DT05GSUdfSU5UX0tFWVMpIHtcbiAgICBpZiAoa2V5IGluIHBhdGNoICYmIHBhdGNoW2tleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgb3V0W2tleV0gPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKE51bWJlcihwYXRjaFtrZXldKSB8fCAwKSk7XG4gICAgfVxuICB9XG4gIGlmICgnaW1hZ2VuX2xvb3AnIGluIHBhdGNoICYmIHBhdGNoLmltYWdlbl9sb29wICE9PSB1bmRlZmluZWQpIHtcbiAgICBvdXQuaW1hZ2VuX2xvb3AgPSBCb29sZWFuKHBhdGNoLmltYWdlbl9sb29wKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIGBjYW5jaGFfcHVibGljaWRhZGAgKHkgc2ltaWxhcmVzKSB0aWVuZW4gRksgYSBgcHVibGljLmNhbmNoYXMoY2FuY2hhX2lkKWAuXG4gKiBFbiBwcm9kdWNjacOzbiBwdWVkZSBleGlzdGlyIGAxYCBvIGBjYW5jaGFfMWA7IGRlYmVtb3MgZXNjcmliaXIgZXhhY3RhbWVudGUgZWwgaWQgcXVlIHlhIGVzdMOhIChvIGNyZWFyIGBjYW5jaGFfTmAgcG9yIGRlZmVjdG8pLlxuICovXG5hc3luYyBmdW5jdGlvbiByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoXG4gIHN1cGFiYXNlOiBTdXBhYmFzZUNsaWVudCxcbiAgY291cnRLZXk6IHN0cmluZyxcbik6IFByb21pc2U8eyBvazogdHJ1ZTsgc3RvcmFnZUlkOiBzdHJpbmc7IHZhcmlhbnRzOiBzdHJpbmdbXSB9IHwgRXJyPiB7XG4gIGNvbnN0IGNhbm9uaWNhbCA9IG5vcm1hbGl6ZUNhbmNoYUlkS2V5KGNvdXJ0S2V5LnRyaW0oKSk7XG4gIGNvbnN0IHZhcmlhbnRzID0gY2FuY2hhSWRDYW5kaWRhdGVzKGNhbm9uaWNhbCk7XG4gIGlmICghdmFyaWFudHMubGVuZ3RoKSByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiAnQ2FuY2hhIGludsOhbGlkYS4nIH07XG4gIGNvbnN0IHByZWZlcnJlZCA9IGNhbmNoYUlkU3RvcmVkRm9yUHVibGljaWRhZFRhYmxlcyhjb3VydEtleS50cmltKCkpO1xuXG4gIC8vIEFsZ3VuYXMgaW5zdGFuY2lhcyBubyBleHBvbmVuIGBwdWJsaWMuY2FuY2hhc2AgbyBsYSBjb2x1bW5hIGBjYW5jaGFfaWRgIGVuIGxhIEFQSSAoY2FjaMOpIFBvc3RnUkVTVCAvIGVzcXVlbWEgZGlzdGludG8pLlxuICAvLyBFbiBlc2UgY2FzbyBzZWd1aW1vcyBzaW4gZmFsbGFyOiBlc2NyaWJpbW9zIGBjYW5jaGFfTmAgeSBsYXMgY29uc3VsdGFzIHVzYW4gYGNhbmNoYUlkQ2FuZGlkYXRlc2AuXG4gIGxldCBoaXRzOiB7IGNhbmNoYV9pZD86IHN0cmluZyB9W10gfCBudWxsID0gbnVsbDtcbiAgY29uc3QgeyBkYXRhOiBzZWxEYXRhLCBlcnJvcjogc2VsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKCdjYW5jaGFzJylcbiAgICAuc2VsZWN0KCdjYW5jaGFfaWQnKVxuICAgIC5pbignY2FuY2hhX2lkJywgdmFyaWFudHMpO1xuXG4gIGlmIChzZWxFcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1twdWJsaWNpZGFkXSBjYW5jaGFzIGxvb2t1cCBvbWl0aWRvOicsIHNlbEVyci5tZXNzYWdlKTtcbiAgfSBlbHNlIHtcbiAgICBoaXRzID0gc2VsRGF0YTtcbiAgfVxuXG4gIGNvbnN0IGV4aXN0aW5nID0gbmV3IFNldChcbiAgICAoaGl0cyB8fCBbXSkubWFwKChyKSA9PiBTdHJpbmcocj8uY2FuY2hhX2lkID8/ICcnKS50cmltKCkpLmZpbHRlcihCb29sZWFuKSxcbiAgKTtcbiAgaWYgKGV4aXN0aW5nLnNpemUgPiAwKSB7XG4gICAgY29uc3QgcGlja09yZGVyID0gW3ByZWZlcnJlZCwgLi4udmFyaWFudHMuZmlsdGVyKCh2KSA9PiB2ICE9PSBwcmVmZXJyZWQpXTtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIHBpY2tPcmRlcikge1xuICAgICAgaWYgKGV4aXN0aW5nLmhhcyhpZCkpIHJldHVybiB7IG9rOiB0cnVlLCBzdG9yYWdlSWQ6IGlkLCB2YXJpYW50cyB9O1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGlzbyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgY29uc3QgeyBlcnJvcjogdXBFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYXMnKS51cHNlcnQoXG4gICAgeyBjYW5jaGFfaWQ6IHByZWZlcnJlZCwgbGFzdF9zZWVuOiBudWxsLCB1cGRhdGVkX2F0OiBpc28gfSxcbiAgICB7IG9uQ29uZmxpY3Q6ICdjYW5jaGFfaWQnIH0sXG4gICk7XG4gIGlmICh1cEVycikge1xuICAgIGNvbnNvbGUud2FybignW3B1YmxpY2lkYWRdIGNhbmNoYXMgdXBzZXJ0IG9taXRpZG86JywgdXBFcnIubWVzc2FnZSk7XG4gIH1cbiAgcmV0dXJuIHsgb2s6IHRydWUsIHN0b3JhZ2VJZDogcHJlZmVycmVkLCB2YXJpYW50cyB9O1xufVxuXG4vKipcbiAqIExhcyBTZXJ2ZXIgQWN0aW9ucyBubyBkZWJlbiB1c2FyIHRocm93IGhhY2lhIGVsIGNsaWVudGUgZW4gcHJvZHVjY2nDs246XG4gKiBOZXh0LmpzIG9jdWx0YSBlbCBtZW5zYWplIHJlYWwuIERldm9sdmVtb3MgeyBvaywgZXJyb3IgfSBzaWVtcHJlLlxuICovXG5cbmZ1bmN0aW9uIHNhbml0aXplTWVkaWFDb250ZW50SW5zZXJ0KHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICBjb25zdCByb3cgPSB7IC4uLnBheWxvYWQgfTtcbiAgaWYgKHJvdy5kdXJhY2lvbl9zZWd1bmRvcyAhPSBudWxsICYmIHJvdy5kdXJhY2lvbl9zZWd1bmRvcyAhPT0gJycpIHtcbiAgICByb3cuZHVyYWNpb25fc2VndW5kb3MgPSBNYXRoLm1heCgwLCBNYXRoLnJvdW5kKE51bWJlcihyb3cuZHVyYWNpb25fc2VndW5kb3MpIHx8IDApKTtcbiAgfVxuICBpZiAocm93LmZpbGVfc2l6ZV9ieXRlcyAhPSBudWxsICYmIHJvdy5maWxlX3NpemVfYnl0ZXMgIT09ICcnKSB7XG4gICAgcm93LmZpbGVfc2l6ZV9ieXRlcyA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IoTnVtYmVyKHJvdy5maWxlX3NpemVfYnl0ZXMpIHx8IDApKTtcbiAgfVxuICByZXR1cm4gcm93O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkTWVkaWFDb250ZW50QWN0aW9uKFxuICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbik6IFByb21pc2U8eyBvazogdHJ1ZTsgZGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCByb3cgPSBzYW5pdGl6ZU1lZGlhQ29udGVudEluc2VydChwYXlsb2FkKTtcbiAgICBjb25zdCB7IGVycm9yLCBkYXRhIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdtZWRpYV9jb250ZW50JykuaW5zZXJ0KFtyb3ddKS5zZWxlY3QoKS5zaW5nbGUoKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gY3JlYXIgZWwgY29udGVuaWRvLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSwgZGF0YTogZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGNyZWFyIGNvbnRlbmlkby4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZU1lZGlhQWN0aW9uKGlkOiBzdHJpbmcpOiBQcm9taXNlPHsgb2s6IHRydWUgfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdtZWRpYV9jb250ZW50JykuZGVsZXRlKCkuZXEoJ2lkJywgaWQpO1xuICAgIGlmIChlcnJvcikgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAnTm8gc2UgcHVkbyBlbGltaW5hci4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBlbGltaW5hci4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbmFtZU1lZGlhQWN0aW9uKGlkOiBzdHJpbmcsIG5vbWJyZTogc3RyaW5nKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdtZWRpYV9jb250ZW50JylcbiAgICAgIC51cGRhdGUoeyBub21icmUsIG5vbWJyZV9zcG9uc29yOiBub21icmUucmVwbGFjZSgvXFwuW14vLl0rJC8sICcnKSB9KVxuICAgICAgLmVxKCdpZCcsIGlkKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gcmVub21icmFyLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIHJlbm9tYnJhci4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZFRpY2tlckFjdGlvbihtZW5zYWplOiBzdHJpbmcsIG9yZGVuOiBudW1iZXIpOiBQcm9taXNlPHsgb2s6IHRydWUgfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgY29uc3Qgb3JkZW5JbnQgPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKE51bWJlcihvcmRlbikgfHwgMCkpO1xuICB0cnkge1xuICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ3RpcmFfaW5mb3JtYXRpdmEnKS5pbnNlcnQoeyBtZW5zYWplLCBvcmRlbjogb3JkZW5JbnQsIGFjdGl2bzogdHJ1ZSB9KTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gYcOxYWRpciBlbCBtZW5zYWplLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGHDsWFkaXIgdGlyYS4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVRpY2tlckFjdGlvbihpZDogc3RyaW5nKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbSgndGlyYV9pbmZvcm1hdGl2YScpLmRlbGV0ZSgpLmVxKCdpZCcsIGlkKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZWxpbWluYXIgZWwgbWVuc2FqZS4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBlbGltaW5hciB0aXJhLicgfTtcbiAgfVxufVxuXG4vKiogRmlsYXMgYHBsYXlsaXN0X3Nsb3QgPSBsZWdhY3lgOiBkZWNpZGlyIHNpIHBlcnRlbmVjZW4gYWwgc2xvdCB2w61kZW8gbyBpbWFnZW4gKG1pc21hIHJlZ2xhIHF1ZSBgcGFydGl0aW9uUGxheWxpc3RSb3dzYCkuICovXG5mdW5jdGlvbiBsZWdhY3lSb3dNYXRjaGVzUGxheWxpc3RTbG90KFxuICByb3c6IHtcbiAgICBtZWRpYV9jb250ZW50PzogeyB0aXBvPzogc3RyaW5nIHwgbnVsbCB9IHwgeyB0aXBvPzogc3RyaW5nIHwgbnVsbCB9W10gfCBudWxsO1xuICB9LFxuICBzbG90OiAndmlkZW8nIHwgJ2ltYWdlbicsXG4pOiBib29sZWFuIHtcbiAgY29uc3QgcmF3ID0gcm93Lm1lZGlhX2NvbnRlbnQ7XG4gIGNvbnN0IG1jID0gQXJyYXkuaXNBcnJheShyYXcpID8gcmF3WzBdIDogcmF3O1xuICBjb25zdCB0aXBvID0gU3RyaW5nKG1jPy50aXBvID8/ICcnKS50b0xvd2VyQ2FzZSgpO1xuICBpZiAodGlwbyA9PT0gJ2ltYWdlbicpIHJldHVybiBzbG90ID09PSAnaW1hZ2VuJztcbiAgcmV0dXJuIHNsb3QgPT09ICd2aWRlbyc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlUGxheWxpc3RBY3Rpb24oXG4gIGNvdXJ0S2V5OiBzdHJpbmcsXG4gIHZlbnVlTmFtZTogc3RyaW5nLFxuICBtZWRpYUlkczogc3RyaW5nW10sXG4gIHNsb3Q6ICd2aWRlbycgfCAnaW1hZ2VuJyxcbiAgZHVyU2Vjb25kczogbnVtYmVyLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgY2xlYW5WZW51ZU5hbWUgPSB2ZW51ZU5hbWUudHJpbSgpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoc3VwYWJhc2UsIGNvdXJ0S2V5LnRyaW0oKSk7XG4gICAgaWYgKCFyZXNvbHZlZC5vaykgcmV0dXJuIHJlc29sdmVkO1xuICAgIGNvbnN0IHsgc3RvcmFnZUlkOiBzdG9yYWdlQ2FuY2hhSWQsIHZhcmlhbnRzOiBjb3VydElkVmFyaWFudHMgfSA9IHJlc29sdmVkO1xuXG4gICAgLy8gMSkgUXVpdGFyIGZpbGFzIHlhIGV0aXF1ZXRhZGFzIGNvbiBlc3RlIHNsb3QgKG1pc21vIHZlbnVlIGV4YWN0byBxdWUgZWwgaW5zZXJ0KS5cbiAgICBjb25zdCB7IGVycm9yOiBkZWxTbG90RXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJylcbiAgICAgIC5kZWxldGUoKVxuICAgICAgLmluKCdjYW5jaGFfaWQnLCBjb3VydElkVmFyaWFudHMpXG4gICAgICAuZXEoJ3ZlbnVlX25hbWUnLCBjbGVhblZlbnVlTmFtZSlcbiAgICAgIC5lcSgncGxheWxpc3Rfc2xvdCcsIHNsb3QpO1xuXG4gICAgaWYgKGRlbFNsb3RFcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGFsIGJvcnJhciBwbGF5bGlzdCBwb3Igc2xvdDonLCBkZWxTbG90RXJyKTtcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGBBbCBsaW1waWFyIHBsYXlsaXN0OiAke2RlbFNsb3RFcnIubWVzc2FnZX1gIH07XG4gICAgfVxuXG4gICAgLy8gMikgUXVpdGFyIGZpbGFzIGxlZ2FjeSBxdWUgY29ycmVzcG9uZGFuIGEgZXN0ZSB0aXBvIGRlIG1lZGlvIChwbGF5bGlzdF9zbG90IGVzIE5PVCBOVUxMOyBudW5jYSBmdWUgTlVMTCkuXG4gICAgY29uc3QgeyBkYXRhOiBsZWdhY3lSb3dzLCBlcnJvcjogbGVnU2VsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJylcbiAgICAgIC5zZWxlY3QoJ2lkLCBtZWRpYV9jb250ZW50KHRpcG8pJylcbiAgICAgIC5pbignY2FuY2hhX2lkJywgY291cnRJZFZhcmlhbnRzKVxuICAgICAgLmVxKCd2ZW51ZV9uYW1lJywgY2xlYW5WZW51ZU5hbWUpXG4gICAgICAuZXEoJ3BsYXlsaXN0X3Nsb3QnLCAnbGVnYWN5Jyk7XG5cbiAgICBpZiAobGVnU2VsRXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBsaXN0YXIgbGVnYWN5IGNhbmNoYV9wdWJsaWNpZGFkOicsIGxlZ1NlbEVycik7XG4gICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBgQWwgbGltcGlhciBwbGF5bGlzdCBsZWdhY3k6ICR7bGVnU2VsRXJyLm1lc3NhZ2V9YCB9O1xuICAgIH1cblxuICAgIGNvbnN0IGxlZ2FjeUlkcyA9IChsZWdhY3lSb3dzIHx8IFtdKVxuICAgICAgLmZpbHRlcigocikgPT4gbGVnYWN5Um93TWF0Y2hlc1BsYXlsaXN0U2xvdChyLCBzbG90KSlcbiAgICAgIC5tYXAoKHIpID0+IHIuaWQpO1xuXG4gICAgaWYgKGxlZ2FjeUlkcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCB7IGVycm9yOiBkZWxMZWdFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJykuZGVsZXRlKCkuaW4oJ2lkJywgbGVnYWN5SWRzKTtcbiAgICAgIGlmIChkZWxMZWdFcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgYWwgYm9ycmFyIGZpbGFzIGxlZ2FjeTonLCBkZWxMZWdFcnIpO1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBgQWwgbGltcGlhciBwbGF5bGlzdCBhbnRpZ3VhOiAke2RlbExlZ0Vyci5tZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBvcmRlcmVkVW5pcXVlSWRzID0gKCgpID0+IHtcbiAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgIGNvbnN0IG91dDogc3RyaW5nW10gPSBbXTtcbiAgICAgIGZvciAoY29uc3QgaWQgb2YgbWVkaWFJZHMpIHtcbiAgICAgICAgY29uc3QgdCA9IFN0cmluZyhpZCB8fCAnJykudHJpbSgpO1xuICAgICAgICBpZiAoIXQgfHwgc2Vlbi5oYXModCkpIGNvbnRpbnVlO1xuICAgICAgICBzZWVuLmFkZCh0KTtcbiAgICAgICAgb3V0LnB1c2godCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH0pKCk7XG5cbiAgICBpZiAob3JkZXJlZFVuaXF1ZUlkcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBkdXJJbnQgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKE51bWJlcihkdXJTZWNvbmRzKSB8fCAxMCkpO1xuICAgICAgY29uc3Qgcm93cyA9IG9yZGVyZWRVbmlxdWVJZHMubWFwKChtaWQsIGkpID0+ICh7XG4gICAgICAgIGNhbmNoYV9pZDogc3RvcmFnZUNhbmNoYUlkLFxuICAgICAgICB2ZW51ZV9uYW1lOiBjbGVhblZlbnVlTmFtZSxcbiAgICAgICAgbWVkaWFfaWQ6IG1pZCxcbiAgICAgICAgb3JkZW46IGkgKyAxLFxuICAgICAgICBkdXJhY2lvbl9zZWd1bmRvczogZHVySW50LFxuICAgICAgICBwbGF5bGlzdF9zbG90OiBzbG90LFxuICAgICAgfSkpO1xuXG4gICAgICBjb25zdCB7IGVycm9yOiBpbnNFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJykuaW5zZXJ0KHJvd3MpO1xuICAgICAgaWYgKGluc0Vycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBpbnNlcnRhciBudWV2YSBwbGF5bGlzdDonLCBpbnNFcnIpO1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBpbnNFcnIubWVzc2FnZSB8fCAnRXJyb3IgYWwgZ3VhcmRhciBsYSBwbGF5bGlzdC4nIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBndWFyZGFyIHBsYXlsaXN0LicgfTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVRpcmFQbGF5bGlzdEFjdGlvbihcbiAgY291cnRLZXk6IHN0cmluZyxcbiAgdmVudWVOYW1lOiBzdHJpbmcsXG4gIHRpcmFJZHM6IHN0cmluZ1tdLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgY2xlYW5WZW51ZU5hbWUgPSB2ZW51ZU5hbWUudHJpbSgpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoc3VwYWJhc2UsIGNvdXJ0S2V5LnRyaW0oKSk7XG4gICAgaWYgKCFyZXNvbHZlZC5vaykgcmV0dXJuIHJlc29sdmVkO1xuICAgIGNvbnN0IHsgc3RvcmFnZUlkOiBzdG9yYWdlQ2FuY2hhSWQsIHZhcmlhbnRzOiBjb3VydElkVmFyaWFudHMgfSA9IHJlc29sdmVkO1xuXG4gICAgY29uc3QgeyBlcnJvcjogZGVsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV90aXJhJylcbiAgICAgIC5kZWxldGUoKVxuICAgICAgLmluKCdjYW5jaGFfaWQnLCBjb3VydElkVmFyaWFudHMpXG4gICAgICAuZXEoJ3ZlbnVlX25hbWUnLCBjbGVhblZlbnVlTmFtZSk7XG5cbiAgICBpZiAoZGVsRXJyKSByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBkZWxFcnIubWVzc2FnZSB8fCAnTm8gc2UgcHVkbyBsaW1waWFyIGxhIHRpcmEuJyB9O1xuXG4gICAgaWYgKHRpcmFJZHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3Qgcm93cyA9IHRpcmFJZHMubWFwKCh0aWQsIGkpID0+ICh7XG4gICAgICAgIGNhbmNoYV9pZDogc3RvcmFnZUNhbmNoYUlkLFxuICAgICAgICB2ZW51ZV9uYW1lOiBjbGVhblZlbnVlTmFtZSxcbiAgICAgICAgdGlyYV9pbmZvcm1hdGl2YV9pZDogdGlkLFxuICAgICAgICBvcmRlbjogaSArIDEsXG4gICAgICB9KSk7XG4gICAgICBjb25zdCB7IGVycm9yOiBpbnNFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV90aXJhJykuaW5zZXJ0KHJvd3MpO1xuICAgICAgaWYgKGluc0VycikgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogaW5zRXJyLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZ3VhcmRhciBsYSB0aXJhLicgfTtcbiAgICB9XG5cbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGd1YXJkYXIgdGlyYS4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwc2VydFBsYXlsaXN0Q29uZmlnQWN0aW9uKFxuICB2ZW51ZU5hbWU6IHN0cmluZyxcbiAgY2FuY2hhSWQ6IHN0cmluZyxcbiAgcGF0Y2g6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBzYWZlUGF0Y2ggPSBzYW5pdGl6ZVBsYXlsaXN0Q29uZmlnUGF0Y2gocGF0Y2gpO1xuICAgIGNvbnN0IHJlc29sdmVkID0gYXdhaXQgcmVzb2x2ZUNhbmNoYUlkRm9yUHVibGljaWRhZEZrKHN1cGFiYXNlLCBjYW5jaGFJZC50cmltKCkpO1xuICAgIGlmICghcmVzb2x2ZWQub2spIHJldHVybiByZXNvbHZlZDtcbiAgICBjb25zdCBzdG9yYWdlQ2FuY2hhSWQgPSByZXNvbHZlZC5zdG9yYWdlSWQ7XG4gICAgY29uc3QgaXNvID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbSgnY2FuY2hhX3BsYXlsaXN0X2NvbmZpZycpLnVwc2VydChcbiAgICAgIHtcbiAgICAgICAgdmVudWVfbmFtZTogdmVudWVOYW1lLnRyaW0oKSxcbiAgICAgICAgY2FuY2hhX2lkOiBzdG9yYWdlQ2FuY2hhSWQsXG4gICAgICAgIC4uLnNhZmVQYXRjaCxcbiAgICAgICAgdXBkYXRlZF9hdDogaXNvLFxuICAgICAgfSxcbiAgICAgIHsgb25Db25mbGljdDogJ3ZlbnVlX25hbWUsY2FuY2hhX2lkJyB9LFxuICAgICk7XG5cbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZ3VhcmRhciBsYSBjb25maWd1cmFjacOzbi4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBndWFyZGFyIGNvbmZpZ3VyYWNpw7NuLicgfTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBGZXRjaEFzc2lnbm1lbnRzT2sgPSB7XG4gIGFzc2lnbm1lbnRzOiB1bmtub3duW107XG4gIGNvbmZpZzogdW5rbm93bltdO1xuICB0aXJhczogdW5rbm93bltdO1xufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoQXNzaWdubWVudHNBY3Rpb24oXG4gIHZlbnVlTmFtZT86IHN0cmluZyxcbiAga2V5cz86IHN0cmluZ1tdLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gJiBGZXRjaEFzc2lnbm1lbnRzT2sgfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgdiA9IHZlbnVlTmFtZT8udHJpbSgpO1xuICB0cnkge1xuICAgIGxldCBxID0gc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdjYW5jaGFfcHVibGljaWRhZCcpXG4gICAgICAuc2VsZWN0KCdpZCwgY2FuY2hhX2lkLCB2ZW51ZV9uYW1lLCBtZWRpYV9pZCwgb3JkZW4sIGR1cmFjaW9uX3NlZ3VuZG9zLCBwbGF5bGlzdF9zbG90LCBtZWRpYV9jb250ZW50KCopJyk7XG5cbiAgICBpZiAodikgcSA9IHEuaWxpa2UoJ3ZlbnVlX25hbWUnLCB2KTtcbiAgICBpZiAoa2V5cyAmJiBrZXlzLmxlbmd0aCA+IDApIHEgPSBxLmluKCdjYW5jaGFfaWQnLCBrZXlzKTtcblxuICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHEub3JkZXIoJ29yZGVuJywgeyBhc2NlbmRpbmc6IHRydWUgfSk7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBmZXRjaEFzc2lnbm1lbnRzQWN0aW9uOicsIGVycm9yKTtcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZGllcm9uIGNhcmdhciBsYXMgYXNpZ25hY2lvbmVzLicgfTtcbiAgICB9XG5cbiAgICBjb25zdCBhc3NpZ25tZW50cyA9IChkYXRhIHx8IFtdKS5tYXAoKHI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgICAgLi4ucixcbiAgICAgIHZlbnVlX25hbWU6IFN0cmluZyhyLnZlbnVlX25hbWUgfHwgJycpLnRyaW0oKSxcbiAgICAgIGNhbmNoYV9pZDogbm9ybWFsaXplQ2FuY2hhSWRLZXkoU3RyaW5nKHIuY2FuY2hhX2lkIHx8ICcnKSksXG4gICAgfSkpO1xuXG4gICAgbGV0IHFDb25maWcgPSBzdXBhYmFzZS5mcm9tKCdjYW5jaGFfcGxheWxpc3RfY29uZmlnJykuc2VsZWN0KCcqJyk7XG4gICAgaWYgKHYpIHFDb25maWcgPSBxQ29uZmlnLmlsaWtlKCd2ZW51ZV9uYW1lJywgdik7XG4gICAgY29uc3QgeyBkYXRhOiBjb25maWcgfSA9IGF3YWl0IHFDb25maWc7XG5cbiAgICBsZXQgcVRpcmFzID0gc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdjYW5jaGFfdGlyYScpXG4gICAgICAuc2VsZWN0KCdjYW5jaGFfaWQsIHRpcmFfaW5mb3JtYXRpdmFfaWQsIG9yZGVuLCB2ZW51ZV9uYW1lJyk7XG4gICAgaWYgKHYpIHFUaXJhcyA9IHFUaXJhcy5pbGlrZSgndmVudWVfbmFtZScsIHYpO1xuICAgIGNvbnN0IHsgZGF0YTogdGlyYXMgfSA9IGF3YWl0IHFUaXJhcztcblxuICAgIGNvbnN0IGNvbmZpZ05vcm0gPSAoY29uZmlnIHx8IFtdKS5tYXAoKHI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgICAgLi4ucixcbiAgICAgIGNhbmNoYV9pZDogbm9ybWFsaXplQ2FuY2hhSWRLZXkoU3RyaW5nKHIuY2FuY2hhX2lkIHx8ICcnKSksXG4gICAgfSkpO1xuICAgIGNvbnN0IHRpcmFzTm9ybSA9ICh0aXJhcyB8fCBbXSkubWFwKChyOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gKHtcbiAgICAgIC4uLnIsXG4gICAgICBjYW5jaGFfaWQ6IG5vcm1hbGl6ZUNhbmNoYUlkS2V5KFN0cmluZyhyLmNhbmNoYV9pZCB8fCAnJykpLFxuICAgIH0pKTtcblxuICAgIHJldHVybiB7IG9rOiB0cnVlLCBhc3NpZ25tZW50cywgY29uZmlnOiBjb25maWdOb3JtLCB0aXJhczogdGlyYXNOb3JtIH07XG4gIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnRXJyb3IgYWwgY2FyZ2FyIGFzaWduYWNpb25lcy4nIH07XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiNlNBMEdzQixrTUFBQSJ9
}),
"[project]/src/app/admin/publicidad/data:822aa1 [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteMediaAction",
    ()=>$$RSC_SERVER_ACTION_1
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"40bff0ff2a3bd0e5a0aeac776675ec12b8624dc258":"deleteMediaAction"},"src/app/admin/publicidad/actions.ts",""] */ "use turbopack no side effects";
;
const $$RSC_SERVER_ACTION_1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("40bff0ff2a3bd0e5a0aeac776675ec12b8624dc258", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "deleteMediaAction");
;
 //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcic7XG5cbmltcG9ydCB0eXBlIHsgU3VwYWJhc2VDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnO1xuaW1wb3J0IHsgZ2V0U3VwYWJhc2VTZXJ2aWNlQ2xpZW50IH0gZnJvbSAnQC9saWIvc3VwYWJhc2Uvc2VydmVyJztcbmltcG9ydCB7IHJldmFsaWRhdGVQYXRoIH0gZnJvbSAnbmV4dC9jYWNoZSc7XG5pbXBvcnQge1xuICBjYW5jaGFJZENhbmRpZGF0ZXMsXG4gIGNhbmNoYUlkU3RvcmVkRm9yUHVibGljaWRhZFRhYmxlcyxcbiAgbm9ybWFsaXplQ2FuY2hhSWRLZXksXG59IGZyb20gJ0AvbGliL2NvdXJ0UGxheWxpc3RzJztcblxudHlwZSBFcnIgPSB7IG9rOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9O1xuXG5mdW5jdGlvbiBzZXJ2aWNlTWlzc2luZygpOiBFcnIge1xuICByZXR1cm4ge1xuICAgIG9rOiBmYWxzZSxcbiAgICBlcnJvcjpcbiAgICAgICdTZXJ2aWRvciBzaW4gY3JlZGVuY2lhbGVzIFN1cGFiYXNlLiBBw7FhZGUgU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSBlbiBWZXJjZWwgKEVudmlyb25tZW50IFZhcmlhYmxlcykgeSB2dWVsdmUgYSBkZXNwbGVnYXIuJyxcbiAgfTtcbn1cblxuLyoqIFNvbG8gZXN0YXMgY29sdW1uYXMgZXhpc3RlbiBlbiBjYW5jaGFfcGxheWxpc3RfY29uZmlnOyBlbCByZXN0byBzZSBpZ25vcmEgKGV2aXRhIHAuIGVqLiBzcGxpdF9yYXRpbyDihpIgSU5URUdFUikuICovXG5jb25zdCBQTEFZTElTVF9DT05GSUdfSU5UX0tFWVMgPSBbXG4gICd2aWRlb19jYW1iaW9fY2FkYV9taW51dG9zJyxcbiAgJ2ltYWdlbl9jYW1iaW9fY2FkYV9taW51dG9zJyxcbiAgJ3RpcmFfY2FtYmlvX2NhZGFfbWludXRvcycsXG4gICdpbWFnZW5fcGF1c2FfZW50cmVfc2VndW5kb3MnLFxuXSBhcyBjb25zdDtcblxuZnVuY3Rpb24gc2FuaXRpemVQbGF5bGlzdENvbmZpZ1BhdGNoKHBhdGNoOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICBmb3IgKGNvbnN0IGtleSBvZiBQTEFZTElTVF9DT05GSUdfSU5UX0tFWVMpIHtcbiAgICBpZiAoa2V5IGluIHBhdGNoICYmIHBhdGNoW2tleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgb3V0W2tleV0gPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKE51bWJlcihwYXRjaFtrZXldKSB8fCAwKSk7XG4gICAgfVxuICB9XG4gIGlmICgnaW1hZ2VuX2xvb3AnIGluIHBhdGNoICYmIHBhdGNoLmltYWdlbl9sb29wICE9PSB1bmRlZmluZWQpIHtcbiAgICBvdXQuaW1hZ2VuX2xvb3AgPSBCb29sZWFuKHBhdGNoLmltYWdlbl9sb29wKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIGBjYW5jaGFfcHVibGljaWRhZGAgKHkgc2ltaWxhcmVzKSB0aWVuZW4gRksgYSBgcHVibGljLmNhbmNoYXMoY2FuY2hhX2lkKWAuXG4gKiBFbiBwcm9kdWNjacOzbiBwdWVkZSBleGlzdGlyIGAxYCBvIGBjYW5jaGFfMWA7IGRlYmVtb3MgZXNjcmliaXIgZXhhY3RhbWVudGUgZWwgaWQgcXVlIHlhIGVzdMOhIChvIGNyZWFyIGBjYW5jaGFfTmAgcG9yIGRlZmVjdG8pLlxuICovXG5hc3luYyBmdW5jdGlvbiByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoXG4gIHN1cGFiYXNlOiBTdXBhYmFzZUNsaWVudCxcbiAgY291cnRLZXk6IHN0cmluZyxcbik6IFByb21pc2U8eyBvazogdHJ1ZTsgc3RvcmFnZUlkOiBzdHJpbmc7IHZhcmlhbnRzOiBzdHJpbmdbXSB9IHwgRXJyPiB7XG4gIGNvbnN0IGNhbm9uaWNhbCA9IG5vcm1hbGl6ZUNhbmNoYUlkS2V5KGNvdXJ0S2V5LnRyaW0oKSk7XG4gIGNvbnN0IHZhcmlhbnRzID0gY2FuY2hhSWRDYW5kaWRhdGVzKGNhbm9uaWNhbCk7XG4gIGlmICghdmFyaWFudHMubGVuZ3RoKSByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiAnQ2FuY2hhIGludsOhbGlkYS4nIH07XG4gIGNvbnN0IHByZWZlcnJlZCA9IGNhbmNoYUlkU3RvcmVkRm9yUHVibGljaWRhZFRhYmxlcyhjb3VydEtleS50cmltKCkpO1xuXG4gIC8vIEFsZ3VuYXMgaW5zdGFuY2lhcyBubyBleHBvbmVuIGBwdWJsaWMuY2FuY2hhc2AgbyBsYSBjb2x1bW5hIGBjYW5jaGFfaWRgIGVuIGxhIEFQSSAoY2FjaMOpIFBvc3RnUkVTVCAvIGVzcXVlbWEgZGlzdGludG8pLlxuICAvLyBFbiBlc2UgY2FzbyBzZWd1aW1vcyBzaW4gZmFsbGFyOiBlc2NyaWJpbW9zIGBjYW5jaGFfTmAgeSBsYXMgY29uc3VsdGFzIHVzYW4gYGNhbmNoYUlkQ2FuZGlkYXRlc2AuXG4gIGxldCBoaXRzOiB7IGNhbmNoYV9pZD86IHN0cmluZyB9W10gfCBudWxsID0gbnVsbDtcbiAgY29uc3QgeyBkYXRhOiBzZWxEYXRhLCBlcnJvcjogc2VsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKCdjYW5jaGFzJylcbiAgICAuc2VsZWN0KCdjYW5jaGFfaWQnKVxuICAgIC5pbignY2FuY2hhX2lkJywgdmFyaWFudHMpO1xuXG4gIGlmIChzZWxFcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1twdWJsaWNpZGFkXSBjYW5jaGFzIGxvb2t1cCBvbWl0aWRvOicsIHNlbEVyci5tZXNzYWdlKTtcbiAgfSBlbHNlIHtcbiAgICBoaXRzID0gc2VsRGF0YTtcbiAgfVxuXG4gIGNvbnN0IGV4aXN0aW5nID0gbmV3IFNldChcbiAgICAoaGl0cyB8fCBbXSkubWFwKChyKSA9PiBTdHJpbmcocj8uY2FuY2hhX2lkID8/ICcnKS50cmltKCkpLmZpbHRlcihCb29sZWFuKSxcbiAgKTtcbiAgaWYgKGV4aXN0aW5nLnNpemUgPiAwKSB7XG4gICAgY29uc3QgcGlja09yZGVyID0gW3ByZWZlcnJlZCwgLi4udmFyaWFudHMuZmlsdGVyKCh2KSA9PiB2ICE9PSBwcmVmZXJyZWQpXTtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIHBpY2tPcmRlcikge1xuICAgICAgaWYgKGV4aXN0aW5nLmhhcyhpZCkpIHJldHVybiB7IG9rOiB0cnVlLCBzdG9yYWdlSWQ6IGlkLCB2YXJpYW50cyB9O1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGlzbyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgY29uc3QgeyBlcnJvcjogdXBFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYXMnKS51cHNlcnQoXG4gICAgeyBjYW5jaGFfaWQ6IHByZWZlcnJlZCwgbGFzdF9zZWVuOiBudWxsLCB1cGRhdGVkX2F0OiBpc28gfSxcbiAgICB7IG9uQ29uZmxpY3Q6ICdjYW5jaGFfaWQnIH0sXG4gICk7XG4gIGlmICh1cEVycikge1xuICAgIGNvbnNvbGUud2FybignW3B1YmxpY2lkYWRdIGNhbmNoYXMgdXBzZXJ0IG9taXRpZG86JywgdXBFcnIubWVzc2FnZSk7XG4gIH1cbiAgcmV0dXJuIHsgb2s6IHRydWUsIHN0b3JhZ2VJZDogcHJlZmVycmVkLCB2YXJpYW50cyB9O1xufVxuXG4vKipcbiAqIExhcyBTZXJ2ZXIgQWN0aW9ucyBubyBkZWJlbiB1c2FyIHRocm93IGhhY2lhIGVsIGNsaWVudGUgZW4gcHJvZHVjY2nDs246XG4gKiBOZXh0LmpzIG9jdWx0YSBlbCBtZW5zYWplIHJlYWwuIERldm9sdmVtb3MgeyBvaywgZXJyb3IgfSBzaWVtcHJlLlxuICovXG5cbmZ1bmN0aW9uIHNhbml0aXplTWVkaWFDb250ZW50SW5zZXJ0KHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICBjb25zdCByb3cgPSB7IC4uLnBheWxvYWQgfTtcbiAgaWYgKHJvdy5kdXJhY2lvbl9zZWd1bmRvcyAhPSBudWxsICYmIHJvdy5kdXJhY2lvbl9zZWd1bmRvcyAhPT0gJycpIHtcbiAgICByb3cuZHVyYWNpb25fc2VndW5kb3MgPSBNYXRoLm1heCgwLCBNYXRoLnJvdW5kKE51bWJlcihyb3cuZHVyYWNpb25fc2VndW5kb3MpIHx8IDApKTtcbiAgfVxuICBpZiAocm93LmZpbGVfc2l6ZV9ieXRlcyAhPSBudWxsICYmIHJvdy5maWxlX3NpemVfYnl0ZXMgIT09ICcnKSB7XG4gICAgcm93LmZpbGVfc2l6ZV9ieXRlcyA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IoTnVtYmVyKHJvdy5maWxlX3NpemVfYnl0ZXMpIHx8IDApKTtcbiAgfVxuICByZXR1cm4gcm93O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkTWVkaWFDb250ZW50QWN0aW9uKFxuICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbik6IFByb21pc2U8eyBvazogdHJ1ZTsgZGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCByb3cgPSBzYW5pdGl6ZU1lZGlhQ29udGVudEluc2VydChwYXlsb2FkKTtcbiAgICBjb25zdCB7IGVycm9yLCBkYXRhIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdtZWRpYV9jb250ZW50JykuaW5zZXJ0KFtyb3ddKS5zZWxlY3QoKS5zaW5nbGUoKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gY3JlYXIgZWwgY29udGVuaWRvLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSwgZGF0YTogZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGNyZWFyIGNvbnRlbmlkby4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZU1lZGlhQWN0aW9uKGlkOiBzdHJpbmcpOiBQcm9taXNlPHsgb2s6IHRydWUgfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdtZWRpYV9jb250ZW50JykuZGVsZXRlKCkuZXEoJ2lkJywgaWQpO1xuICAgIGlmIChlcnJvcikgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAnTm8gc2UgcHVkbyBlbGltaW5hci4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBlbGltaW5hci4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbmFtZU1lZGlhQWN0aW9uKGlkOiBzdHJpbmcsIG5vbWJyZTogc3RyaW5nKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdtZWRpYV9jb250ZW50JylcbiAgICAgIC51cGRhdGUoeyBub21icmUsIG5vbWJyZV9zcG9uc29yOiBub21icmUucmVwbGFjZSgvXFwuW14vLl0rJC8sICcnKSB9KVxuICAgICAgLmVxKCdpZCcsIGlkKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gcmVub21icmFyLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIHJlbm9tYnJhci4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZFRpY2tlckFjdGlvbihtZW5zYWplOiBzdHJpbmcsIG9yZGVuOiBudW1iZXIpOiBQcm9taXNlPHsgb2s6IHRydWUgfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgY29uc3Qgb3JkZW5JbnQgPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKE51bWJlcihvcmRlbikgfHwgMCkpO1xuICB0cnkge1xuICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ3RpcmFfaW5mb3JtYXRpdmEnKS5pbnNlcnQoeyBtZW5zYWplLCBvcmRlbjogb3JkZW5JbnQsIGFjdGl2bzogdHJ1ZSB9KTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gYcOxYWRpciBlbCBtZW5zYWplLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGHDsWFkaXIgdGlyYS4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVRpY2tlckFjdGlvbihpZDogc3RyaW5nKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbSgndGlyYV9pbmZvcm1hdGl2YScpLmRlbGV0ZSgpLmVxKCdpZCcsIGlkKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZWxpbWluYXIgZWwgbWVuc2FqZS4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBlbGltaW5hciB0aXJhLicgfTtcbiAgfVxufVxuXG4vKiogRmlsYXMgYHBsYXlsaXN0X3Nsb3QgPSBsZWdhY3lgOiBkZWNpZGlyIHNpIHBlcnRlbmVjZW4gYWwgc2xvdCB2w61kZW8gbyBpbWFnZW4gKG1pc21hIHJlZ2xhIHF1ZSBgcGFydGl0aW9uUGxheWxpc3RSb3dzYCkuICovXG5mdW5jdGlvbiBsZWdhY3lSb3dNYXRjaGVzUGxheWxpc3RTbG90KFxuICByb3c6IHtcbiAgICBtZWRpYV9jb250ZW50PzogeyB0aXBvPzogc3RyaW5nIHwgbnVsbCB9IHwgeyB0aXBvPzogc3RyaW5nIHwgbnVsbCB9W10gfCBudWxsO1xuICB9LFxuICBzbG90OiAndmlkZW8nIHwgJ2ltYWdlbicsXG4pOiBib29sZWFuIHtcbiAgY29uc3QgcmF3ID0gcm93Lm1lZGlhX2NvbnRlbnQ7XG4gIGNvbnN0IG1jID0gQXJyYXkuaXNBcnJheShyYXcpID8gcmF3WzBdIDogcmF3O1xuICBjb25zdCB0aXBvID0gU3RyaW5nKG1jPy50aXBvID8/ICcnKS50b0xvd2VyQ2FzZSgpO1xuICBpZiAodGlwbyA9PT0gJ2ltYWdlbicpIHJldHVybiBzbG90ID09PSAnaW1hZ2VuJztcbiAgcmV0dXJuIHNsb3QgPT09ICd2aWRlbyc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlUGxheWxpc3RBY3Rpb24oXG4gIGNvdXJ0S2V5OiBzdHJpbmcsXG4gIHZlbnVlTmFtZTogc3RyaW5nLFxuICBtZWRpYUlkczogc3RyaW5nW10sXG4gIHNsb3Q6ICd2aWRlbycgfCAnaW1hZ2VuJyxcbiAgZHVyU2Vjb25kczogbnVtYmVyLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgY2xlYW5WZW51ZU5hbWUgPSB2ZW51ZU5hbWUudHJpbSgpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoc3VwYWJhc2UsIGNvdXJ0S2V5LnRyaW0oKSk7XG4gICAgaWYgKCFyZXNvbHZlZC5vaykgcmV0dXJuIHJlc29sdmVkO1xuICAgIGNvbnN0IHsgc3RvcmFnZUlkOiBzdG9yYWdlQ2FuY2hhSWQsIHZhcmlhbnRzOiBjb3VydElkVmFyaWFudHMgfSA9IHJlc29sdmVkO1xuXG4gICAgLy8gMSkgUXVpdGFyIGZpbGFzIHlhIGV0aXF1ZXRhZGFzIGNvbiBlc3RlIHNsb3QgKG1pc21vIHZlbnVlIGV4YWN0byBxdWUgZWwgaW5zZXJ0KS5cbiAgICBjb25zdCB7IGVycm9yOiBkZWxTbG90RXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJylcbiAgICAgIC5kZWxldGUoKVxuICAgICAgLmluKCdjYW5jaGFfaWQnLCBjb3VydElkVmFyaWFudHMpXG4gICAgICAuZXEoJ3ZlbnVlX25hbWUnLCBjbGVhblZlbnVlTmFtZSlcbiAgICAgIC5lcSgncGxheWxpc3Rfc2xvdCcsIHNsb3QpO1xuXG4gICAgaWYgKGRlbFNsb3RFcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGFsIGJvcnJhciBwbGF5bGlzdCBwb3Igc2xvdDonLCBkZWxTbG90RXJyKTtcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGBBbCBsaW1waWFyIHBsYXlsaXN0OiAke2RlbFNsb3RFcnIubWVzc2FnZX1gIH07XG4gICAgfVxuXG4gICAgLy8gMikgUXVpdGFyIGZpbGFzIGxlZ2FjeSBxdWUgY29ycmVzcG9uZGFuIGEgZXN0ZSB0aXBvIGRlIG1lZGlvIChwbGF5bGlzdF9zbG90IGVzIE5PVCBOVUxMOyBudW5jYSBmdWUgTlVMTCkuXG4gICAgY29uc3QgeyBkYXRhOiBsZWdhY3lSb3dzLCBlcnJvcjogbGVnU2VsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJylcbiAgICAgIC5zZWxlY3QoJ2lkLCBtZWRpYV9jb250ZW50KHRpcG8pJylcbiAgICAgIC5pbignY2FuY2hhX2lkJywgY291cnRJZFZhcmlhbnRzKVxuICAgICAgLmVxKCd2ZW51ZV9uYW1lJywgY2xlYW5WZW51ZU5hbWUpXG4gICAgICAuZXEoJ3BsYXlsaXN0X3Nsb3QnLCAnbGVnYWN5Jyk7XG5cbiAgICBpZiAobGVnU2VsRXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBsaXN0YXIgbGVnYWN5IGNhbmNoYV9wdWJsaWNpZGFkOicsIGxlZ1NlbEVycik7XG4gICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBgQWwgbGltcGlhciBwbGF5bGlzdCBsZWdhY3k6ICR7bGVnU2VsRXJyLm1lc3NhZ2V9YCB9O1xuICAgIH1cblxuICAgIGNvbnN0IGxlZ2FjeUlkcyA9IChsZWdhY3lSb3dzIHx8IFtdKVxuICAgICAgLmZpbHRlcigocikgPT4gbGVnYWN5Um93TWF0Y2hlc1BsYXlsaXN0U2xvdChyLCBzbG90KSlcbiAgICAgIC5tYXAoKHIpID0+IHIuaWQpO1xuXG4gICAgaWYgKGxlZ2FjeUlkcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCB7IGVycm9yOiBkZWxMZWdFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJykuZGVsZXRlKCkuaW4oJ2lkJywgbGVnYWN5SWRzKTtcbiAgICAgIGlmIChkZWxMZWdFcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgYWwgYm9ycmFyIGZpbGFzIGxlZ2FjeTonLCBkZWxMZWdFcnIpO1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBgQWwgbGltcGlhciBwbGF5bGlzdCBhbnRpZ3VhOiAke2RlbExlZ0Vyci5tZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBvcmRlcmVkVW5pcXVlSWRzID0gKCgpID0+IHtcbiAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgIGNvbnN0IG91dDogc3RyaW5nW10gPSBbXTtcbiAgICAgIGZvciAoY29uc3QgaWQgb2YgbWVkaWFJZHMpIHtcbiAgICAgICAgY29uc3QgdCA9IFN0cmluZyhpZCB8fCAnJykudHJpbSgpO1xuICAgICAgICBpZiAoIXQgfHwgc2Vlbi5oYXModCkpIGNvbnRpbnVlO1xuICAgICAgICBzZWVuLmFkZCh0KTtcbiAgICAgICAgb3V0LnB1c2godCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH0pKCk7XG5cbiAgICBpZiAob3JkZXJlZFVuaXF1ZUlkcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBkdXJJbnQgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKE51bWJlcihkdXJTZWNvbmRzKSB8fCAxMCkpO1xuICAgICAgY29uc3Qgcm93cyA9IG9yZGVyZWRVbmlxdWVJZHMubWFwKChtaWQsIGkpID0+ICh7XG4gICAgICAgIGNhbmNoYV9pZDogc3RvcmFnZUNhbmNoYUlkLFxuICAgICAgICB2ZW51ZV9uYW1lOiBjbGVhblZlbnVlTmFtZSxcbiAgICAgICAgbWVkaWFfaWQ6IG1pZCxcbiAgICAgICAgb3JkZW46IGkgKyAxLFxuICAgICAgICBkdXJhY2lvbl9zZWd1bmRvczogZHVySW50LFxuICAgICAgICBwbGF5bGlzdF9zbG90OiBzbG90LFxuICAgICAgfSkpO1xuXG4gICAgICBjb25zdCB7IGVycm9yOiBpbnNFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJykuaW5zZXJ0KHJvd3MpO1xuICAgICAgaWYgKGluc0Vycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBpbnNlcnRhciBudWV2YSBwbGF5bGlzdDonLCBpbnNFcnIpO1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBpbnNFcnIubWVzc2FnZSB8fCAnRXJyb3IgYWwgZ3VhcmRhciBsYSBwbGF5bGlzdC4nIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBndWFyZGFyIHBsYXlsaXN0LicgfTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVRpcmFQbGF5bGlzdEFjdGlvbihcbiAgY291cnRLZXk6IHN0cmluZyxcbiAgdmVudWVOYW1lOiBzdHJpbmcsXG4gIHRpcmFJZHM6IHN0cmluZ1tdLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgY2xlYW5WZW51ZU5hbWUgPSB2ZW51ZU5hbWUudHJpbSgpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoc3VwYWJhc2UsIGNvdXJ0S2V5LnRyaW0oKSk7XG4gICAgaWYgKCFyZXNvbHZlZC5vaykgcmV0dXJuIHJlc29sdmVkO1xuICAgIGNvbnN0IHsgc3RvcmFnZUlkOiBzdG9yYWdlQ2FuY2hhSWQsIHZhcmlhbnRzOiBjb3VydElkVmFyaWFudHMgfSA9IHJlc29sdmVkO1xuXG4gICAgY29uc3QgeyBlcnJvcjogZGVsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV90aXJhJylcbiAgICAgIC5kZWxldGUoKVxuICAgICAgLmluKCdjYW5jaGFfaWQnLCBjb3VydElkVmFyaWFudHMpXG4gICAgICAuZXEoJ3ZlbnVlX25hbWUnLCBjbGVhblZlbnVlTmFtZSk7XG5cbiAgICBpZiAoZGVsRXJyKSByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBkZWxFcnIubWVzc2FnZSB8fCAnTm8gc2UgcHVkbyBsaW1waWFyIGxhIHRpcmEuJyB9O1xuXG4gICAgaWYgKHRpcmFJZHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3Qgcm93cyA9IHRpcmFJZHMubWFwKCh0aWQsIGkpID0+ICh7XG4gICAgICAgIGNhbmNoYV9pZDogc3RvcmFnZUNhbmNoYUlkLFxuICAgICAgICB2ZW51ZV9uYW1lOiBjbGVhblZlbnVlTmFtZSxcbiAgICAgICAgdGlyYV9pbmZvcm1hdGl2YV9pZDogdGlkLFxuICAgICAgICBvcmRlbjogaSArIDEsXG4gICAgICB9KSk7XG4gICAgICBjb25zdCB7IGVycm9yOiBpbnNFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV90aXJhJykuaW5zZXJ0KHJvd3MpO1xuICAgICAgaWYgKGluc0VycikgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogaW5zRXJyLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZ3VhcmRhciBsYSB0aXJhLicgfTtcbiAgICB9XG5cbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGd1YXJkYXIgdGlyYS4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwc2VydFBsYXlsaXN0Q29uZmlnQWN0aW9uKFxuICB2ZW51ZU5hbWU6IHN0cmluZyxcbiAgY2FuY2hhSWQ6IHN0cmluZyxcbiAgcGF0Y2g6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBzYWZlUGF0Y2ggPSBzYW5pdGl6ZVBsYXlsaXN0Q29uZmlnUGF0Y2gocGF0Y2gpO1xuICAgIGNvbnN0IHJlc29sdmVkID0gYXdhaXQgcmVzb2x2ZUNhbmNoYUlkRm9yUHVibGljaWRhZEZrKHN1cGFiYXNlLCBjYW5jaGFJZC50cmltKCkpO1xuICAgIGlmICghcmVzb2x2ZWQub2spIHJldHVybiByZXNvbHZlZDtcbiAgICBjb25zdCBzdG9yYWdlQ2FuY2hhSWQgPSByZXNvbHZlZC5zdG9yYWdlSWQ7XG4gICAgY29uc3QgaXNvID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbSgnY2FuY2hhX3BsYXlsaXN0X2NvbmZpZycpLnVwc2VydChcbiAgICAgIHtcbiAgICAgICAgdmVudWVfbmFtZTogdmVudWVOYW1lLnRyaW0oKSxcbiAgICAgICAgY2FuY2hhX2lkOiBzdG9yYWdlQ2FuY2hhSWQsXG4gICAgICAgIC4uLnNhZmVQYXRjaCxcbiAgICAgICAgdXBkYXRlZF9hdDogaXNvLFxuICAgICAgfSxcbiAgICAgIHsgb25Db25mbGljdDogJ3ZlbnVlX25hbWUsY2FuY2hhX2lkJyB9LFxuICAgICk7XG5cbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZ3VhcmRhciBsYSBjb25maWd1cmFjacOzbi4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBndWFyZGFyIGNvbmZpZ3VyYWNpw7NuLicgfTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBGZXRjaEFzc2lnbm1lbnRzT2sgPSB7XG4gIGFzc2lnbm1lbnRzOiB1bmtub3duW107XG4gIGNvbmZpZzogdW5rbm93bltdO1xuICB0aXJhczogdW5rbm93bltdO1xufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoQXNzaWdubWVudHNBY3Rpb24oXG4gIHZlbnVlTmFtZT86IHN0cmluZyxcbiAga2V5cz86IHN0cmluZ1tdLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gJiBGZXRjaEFzc2lnbm1lbnRzT2sgfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgdiA9IHZlbnVlTmFtZT8udHJpbSgpO1xuICB0cnkge1xuICAgIGxldCBxID0gc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdjYW5jaGFfcHVibGljaWRhZCcpXG4gICAgICAuc2VsZWN0KCdpZCwgY2FuY2hhX2lkLCB2ZW51ZV9uYW1lLCBtZWRpYV9pZCwgb3JkZW4sIGR1cmFjaW9uX3NlZ3VuZG9zLCBwbGF5bGlzdF9zbG90LCBtZWRpYV9jb250ZW50KCopJyk7XG5cbiAgICBpZiAodikgcSA9IHEuaWxpa2UoJ3ZlbnVlX25hbWUnLCB2KTtcbiAgICBpZiAoa2V5cyAmJiBrZXlzLmxlbmd0aCA+IDApIHEgPSBxLmluKCdjYW5jaGFfaWQnLCBrZXlzKTtcblxuICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHEub3JkZXIoJ29yZGVuJywgeyBhc2NlbmRpbmc6IHRydWUgfSk7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBmZXRjaEFzc2lnbm1lbnRzQWN0aW9uOicsIGVycm9yKTtcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZGllcm9uIGNhcmdhciBsYXMgYXNpZ25hY2lvbmVzLicgfTtcbiAgICB9XG5cbiAgICBjb25zdCBhc3NpZ25tZW50cyA9IChkYXRhIHx8IFtdKS5tYXAoKHI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgICAgLi4ucixcbiAgICAgIHZlbnVlX25hbWU6IFN0cmluZyhyLnZlbnVlX25hbWUgfHwgJycpLnRyaW0oKSxcbiAgICAgIGNhbmNoYV9pZDogbm9ybWFsaXplQ2FuY2hhSWRLZXkoU3RyaW5nKHIuY2FuY2hhX2lkIHx8ICcnKSksXG4gICAgfSkpO1xuXG4gICAgbGV0IHFDb25maWcgPSBzdXBhYmFzZS5mcm9tKCdjYW5jaGFfcGxheWxpc3RfY29uZmlnJykuc2VsZWN0KCcqJyk7XG4gICAgaWYgKHYpIHFDb25maWcgPSBxQ29uZmlnLmlsaWtlKCd2ZW51ZV9uYW1lJywgdik7XG4gICAgY29uc3QgeyBkYXRhOiBjb25maWcgfSA9IGF3YWl0IHFDb25maWc7XG5cbiAgICBsZXQgcVRpcmFzID0gc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdjYW5jaGFfdGlyYScpXG4gICAgICAuc2VsZWN0KCdjYW5jaGFfaWQsIHRpcmFfaW5mb3JtYXRpdmFfaWQsIG9yZGVuLCB2ZW51ZV9uYW1lJyk7XG4gICAgaWYgKHYpIHFUaXJhcyA9IHFUaXJhcy5pbGlrZSgndmVudWVfbmFtZScsIHYpO1xuICAgIGNvbnN0IHsgZGF0YTogdGlyYXMgfSA9IGF3YWl0IHFUaXJhcztcblxuICAgIGNvbnN0IGNvbmZpZ05vcm0gPSAoY29uZmlnIHx8IFtdKS5tYXAoKHI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgICAgLi4ucixcbiAgICAgIGNhbmNoYV9pZDogbm9ybWFsaXplQ2FuY2hhSWRLZXkoU3RyaW5nKHIuY2FuY2hhX2lkIHx8ICcnKSksXG4gICAgfSkpO1xuICAgIGNvbnN0IHRpcmFzTm9ybSA9ICh0aXJhcyB8fCBbXSkubWFwKChyOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gKHtcbiAgICAgIC4uLnIsXG4gICAgICBjYW5jaGFfaWQ6IG5vcm1hbGl6ZUNhbmNoYUlkS2V5KFN0cmluZyhyLmNhbmNoYV9pZCB8fCAnJykpLFxuICAgIH0pKTtcblxuICAgIHJldHVybiB7IG9rOiB0cnVlLCBhc3NpZ25tZW50cywgY29uZmlnOiBjb25maWdOb3JtLCB0aXJhczogdGlyYXNOb3JtIH07XG4gIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnRXJyb3IgYWwgY2FyZ2FyIGFzaWduYWNpb25lcy4nIH07XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoieVNBMEhzQiw4TEFBQSJ9
}),
"[project]/src/app/admin/publicidad/data:a5f478 [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "renameMediaAction",
    ()=>$$RSC_SERVER_ACTION_2
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"60ba3f4d8e8c83e0ef69208080d6c6966bf623b47c":"renameMediaAction"},"src/app/admin/publicidad/actions.ts",""] */ "use turbopack no side effects";
;
const $$RSC_SERVER_ACTION_2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("60ba3f4d8e8c83e0ef69208080d6c6966bf623b47c", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "renameMediaAction");
;
 //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcic7XG5cbmltcG9ydCB0eXBlIHsgU3VwYWJhc2VDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnO1xuaW1wb3J0IHsgZ2V0U3VwYWJhc2VTZXJ2aWNlQ2xpZW50IH0gZnJvbSAnQC9saWIvc3VwYWJhc2Uvc2VydmVyJztcbmltcG9ydCB7IHJldmFsaWRhdGVQYXRoIH0gZnJvbSAnbmV4dC9jYWNoZSc7XG5pbXBvcnQge1xuICBjYW5jaGFJZENhbmRpZGF0ZXMsXG4gIGNhbmNoYUlkU3RvcmVkRm9yUHVibGljaWRhZFRhYmxlcyxcbiAgbm9ybWFsaXplQ2FuY2hhSWRLZXksXG59IGZyb20gJ0AvbGliL2NvdXJ0UGxheWxpc3RzJztcblxudHlwZSBFcnIgPSB7IG9rOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9O1xuXG5mdW5jdGlvbiBzZXJ2aWNlTWlzc2luZygpOiBFcnIge1xuICByZXR1cm4ge1xuICAgIG9rOiBmYWxzZSxcbiAgICBlcnJvcjpcbiAgICAgICdTZXJ2aWRvciBzaW4gY3JlZGVuY2lhbGVzIFN1cGFiYXNlLiBBw7FhZGUgU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSBlbiBWZXJjZWwgKEVudmlyb25tZW50IFZhcmlhYmxlcykgeSB2dWVsdmUgYSBkZXNwbGVnYXIuJyxcbiAgfTtcbn1cblxuLyoqIFNvbG8gZXN0YXMgY29sdW1uYXMgZXhpc3RlbiBlbiBjYW5jaGFfcGxheWxpc3RfY29uZmlnOyBlbCByZXN0byBzZSBpZ25vcmEgKGV2aXRhIHAuIGVqLiBzcGxpdF9yYXRpbyDihpIgSU5URUdFUikuICovXG5jb25zdCBQTEFZTElTVF9DT05GSUdfSU5UX0tFWVMgPSBbXG4gICd2aWRlb19jYW1iaW9fY2FkYV9taW51dG9zJyxcbiAgJ2ltYWdlbl9jYW1iaW9fY2FkYV9taW51dG9zJyxcbiAgJ3RpcmFfY2FtYmlvX2NhZGFfbWludXRvcycsXG4gICdpbWFnZW5fcGF1c2FfZW50cmVfc2VndW5kb3MnLFxuXSBhcyBjb25zdDtcblxuZnVuY3Rpb24gc2FuaXRpemVQbGF5bGlzdENvbmZpZ1BhdGNoKHBhdGNoOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICBmb3IgKGNvbnN0IGtleSBvZiBQTEFZTElTVF9DT05GSUdfSU5UX0tFWVMpIHtcbiAgICBpZiAoa2V5IGluIHBhdGNoICYmIHBhdGNoW2tleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgb3V0W2tleV0gPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKE51bWJlcihwYXRjaFtrZXldKSB8fCAwKSk7XG4gICAgfVxuICB9XG4gIGlmICgnaW1hZ2VuX2xvb3AnIGluIHBhdGNoICYmIHBhdGNoLmltYWdlbl9sb29wICE9PSB1bmRlZmluZWQpIHtcbiAgICBvdXQuaW1hZ2VuX2xvb3AgPSBCb29sZWFuKHBhdGNoLmltYWdlbl9sb29wKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIGBjYW5jaGFfcHVibGljaWRhZGAgKHkgc2ltaWxhcmVzKSB0aWVuZW4gRksgYSBgcHVibGljLmNhbmNoYXMoY2FuY2hhX2lkKWAuXG4gKiBFbiBwcm9kdWNjacOzbiBwdWVkZSBleGlzdGlyIGAxYCBvIGBjYW5jaGFfMWA7IGRlYmVtb3MgZXNjcmliaXIgZXhhY3RhbWVudGUgZWwgaWQgcXVlIHlhIGVzdMOhIChvIGNyZWFyIGBjYW5jaGFfTmAgcG9yIGRlZmVjdG8pLlxuICovXG5hc3luYyBmdW5jdGlvbiByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoXG4gIHN1cGFiYXNlOiBTdXBhYmFzZUNsaWVudCxcbiAgY291cnRLZXk6IHN0cmluZyxcbik6IFByb21pc2U8eyBvazogdHJ1ZTsgc3RvcmFnZUlkOiBzdHJpbmc7IHZhcmlhbnRzOiBzdHJpbmdbXSB9IHwgRXJyPiB7XG4gIGNvbnN0IGNhbm9uaWNhbCA9IG5vcm1hbGl6ZUNhbmNoYUlkS2V5KGNvdXJ0S2V5LnRyaW0oKSk7XG4gIGNvbnN0IHZhcmlhbnRzID0gY2FuY2hhSWRDYW5kaWRhdGVzKGNhbm9uaWNhbCk7XG4gIGlmICghdmFyaWFudHMubGVuZ3RoKSByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiAnQ2FuY2hhIGludsOhbGlkYS4nIH07XG4gIGNvbnN0IHByZWZlcnJlZCA9IGNhbmNoYUlkU3RvcmVkRm9yUHVibGljaWRhZFRhYmxlcyhjb3VydEtleS50cmltKCkpO1xuXG4gIC8vIEFsZ3VuYXMgaW5zdGFuY2lhcyBubyBleHBvbmVuIGBwdWJsaWMuY2FuY2hhc2AgbyBsYSBjb2x1bW5hIGBjYW5jaGFfaWRgIGVuIGxhIEFQSSAoY2FjaMOpIFBvc3RnUkVTVCAvIGVzcXVlbWEgZGlzdGludG8pLlxuICAvLyBFbiBlc2UgY2FzbyBzZWd1aW1vcyBzaW4gZmFsbGFyOiBlc2NyaWJpbW9zIGBjYW5jaGFfTmAgeSBsYXMgY29uc3VsdGFzIHVzYW4gYGNhbmNoYUlkQ2FuZGlkYXRlc2AuXG4gIGxldCBoaXRzOiB7IGNhbmNoYV9pZD86IHN0cmluZyB9W10gfCBudWxsID0gbnVsbDtcbiAgY29uc3QgeyBkYXRhOiBzZWxEYXRhLCBlcnJvcjogc2VsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKCdjYW5jaGFzJylcbiAgICAuc2VsZWN0KCdjYW5jaGFfaWQnKVxuICAgIC5pbignY2FuY2hhX2lkJywgdmFyaWFudHMpO1xuXG4gIGlmIChzZWxFcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1twdWJsaWNpZGFkXSBjYW5jaGFzIGxvb2t1cCBvbWl0aWRvOicsIHNlbEVyci5tZXNzYWdlKTtcbiAgfSBlbHNlIHtcbiAgICBoaXRzID0gc2VsRGF0YTtcbiAgfVxuXG4gIGNvbnN0IGV4aXN0aW5nID0gbmV3IFNldChcbiAgICAoaGl0cyB8fCBbXSkubWFwKChyKSA9PiBTdHJpbmcocj8uY2FuY2hhX2lkID8/ICcnKS50cmltKCkpLmZpbHRlcihCb29sZWFuKSxcbiAgKTtcbiAgaWYgKGV4aXN0aW5nLnNpemUgPiAwKSB7XG4gICAgY29uc3QgcGlja09yZGVyID0gW3ByZWZlcnJlZCwgLi4udmFyaWFudHMuZmlsdGVyKCh2KSA9PiB2ICE9PSBwcmVmZXJyZWQpXTtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIHBpY2tPcmRlcikge1xuICAgICAgaWYgKGV4aXN0aW5nLmhhcyhpZCkpIHJldHVybiB7IG9rOiB0cnVlLCBzdG9yYWdlSWQ6IGlkLCB2YXJpYW50cyB9O1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGlzbyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgY29uc3QgeyBlcnJvcjogdXBFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYXMnKS51cHNlcnQoXG4gICAgeyBjYW5jaGFfaWQ6IHByZWZlcnJlZCwgbGFzdF9zZWVuOiBudWxsLCB1cGRhdGVkX2F0OiBpc28gfSxcbiAgICB7IG9uQ29uZmxpY3Q6ICdjYW5jaGFfaWQnIH0sXG4gICk7XG4gIGlmICh1cEVycikge1xuICAgIGNvbnNvbGUud2FybignW3B1YmxpY2lkYWRdIGNhbmNoYXMgdXBzZXJ0IG9taXRpZG86JywgdXBFcnIubWVzc2FnZSk7XG4gIH1cbiAgcmV0dXJuIHsgb2s6IHRydWUsIHN0b3JhZ2VJZDogcHJlZmVycmVkLCB2YXJpYW50cyB9O1xufVxuXG4vKipcbiAqIExhcyBTZXJ2ZXIgQWN0aW9ucyBubyBkZWJlbiB1c2FyIHRocm93IGhhY2lhIGVsIGNsaWVudGUgZW4gcHJvZHVjY2nDs246XG4gKiBOZXh0LmpzIG9jdWx0YSBlbCBtZW5zYWplIHJlYWwuIERldm9sdmVtb3MgeyBvaywgZXJyb3IgfSBzaWVtcHJlLlxuICovXG5cbmZ1bmN0aW9uIHNhbml0aXplTWVkaWFDb250ZW50SW5zZXJ0KHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICBjb25zdCByb3cgPSB7IC4uLnBheWxvYWQgfTtcbiAgaWYgKHJvdy5kdXJhY2lvbl9zZWd1bmRvcyAhPSBudWxsICYmIHJvdy5kdXJhY2lvbl9zZWd1bmRvcyAhPT0gJycpIHtcbiAgICByb3cuZHVyYWNpb25fc2VndW5kb3MgPSBNYXRoLm1heCgwLCBNYXRoLnJvdW5kKE51bWJlcihyb3cuZHVyYWNpb25fc2VndW5kb3MpIHx8IDApKTtcbiAgfVxuICBpZiAocm93LmZpbGVfc2l6ZV9ieXRlcyAhPSBudWxsICYmIHJvdy5maWxlX3NpemVfYnl0ZXMgIT09ICcnKSB7XG4gICAgcm93LmZpbGVfc2l6ZV9ieXRlcyA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IoTnVtYmVyKHJvdy5maWxlX3NpemVfYnl0ZXMpIHx8IDApKTtcbiAgfVxuICByZXR1cm4gcm93O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkTWVkaWFDb250ZW50QWN0aW9uKFxuICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbik6IFByb21pc2U8eyBvazogdHJ1ZTsgZGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCByb3cgPSBzYW5pdGl6ZU1lZGlhQ29udGVudEluc2VydChwYXlsb2FkKTtcbiAgICBjb25zdCB7IGVycm9yLCBkYXRhIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdtZWRpYV9jb250ZW50JykuaW5zZXJ0KFtyb3ddKS5zZWxlY3QoKS5zaW5nbGUoKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gY3JlYXIgZWwgY29udGVuaWRvLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSwgZGF0YTogZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGNyZWFyIGNvbnRlbmlkby4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZU1lZGlhQWN0aW9uKGlkOiBzdHJpbmcpOiBQcm9taXNlPHsgb2s6IHRydWUgfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdtZWRpYV9jb250ZW50JykuZGVsZXRlKCkuZXEoJ2lkJywgaWQpO1xuICAgIGlmIChlcnJvcikgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAnTm8gc2UgcHVkbyBlbGltaW5hci4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBlbGltaW5hci4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbmFtZU1lZGlhQWN0aW9uKGlkOiBzdHJpbmcsIG5vbWJyZTogc3RyaW5nKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdtZWRpYV9jb250ZW50JylcbiAgICAgIC51cGRhdGUoeyBub21icmUsIG5vbWJyZV9zcG9uc29yOiBub21icmUucmVwbGFjZSgvXFwuW14vLl0rJC8sICcnKSB9KVxuICAgICAgLmVxKCdpZCcsIGlkKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gcmVub21icmFyLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIHJlbm9tYnJhci4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZFRpY2tlckFjdGlvbihtZW5zYWplOiBzdHJpbmcsIG9yZGVuOiBudW1iZXIpOiBQcm9taXNlPHsgb2s6IHRydWUgfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgY29uc3Qgb3JkZW5JbnQgPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKE51bWJlcihvcmRlbikgfHwgMCkpO1xuICB0cnkge1xuICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ3RpcmFfaW5mb3JtYXRpdmEnKS5pbnNlcnQoeyBtZW5zYWplLCBvcmRlbjogb3JkZW5JbnQsIGFjdGl2bzogdHJ1ZSB9KTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gYcOxYWRpciBlbCBtZW5zYWplLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGHDsWFkaXIgdGlyYS4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVRpY2tlckFjdGlvbihpZDogc3RyaW5nKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbSgndGlyYV9pbmZvcm1hdGl2YScpLmRlbGV0ZSgpLmVxKCdpZCcsIGlkKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZWxpbWluYXIgZWwgbWVuc2FqZS4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBlbGltaW5hciB0aXJhLicgfTtcbiAgfVxufVxuXG4vKiogRmlsYXMgYHBsYXlsaXN0X3Nsb3QgPSBsZWdhY3lgOiBkZWNpZGlyIHNpIHBlcnRlbmVjZW4gYWwgc2xvdCB2w61kZW8gbyBpbWFnZW4gKG1pc21hIHJlZ2xhIHF1ZSBgcGFydGl0aW9uUGxheWxpc3RSb3dzYCkuICovXG5mdW5jdGlvbiBsZWdhY3lSb3dNYXRjaGVzUGxheWxpc3RTbG90KFxuICByb3c6IHtcbiAgICBtZWRpYV9jb250ZW50PzogeyB0aXBvPzogc3RyaW5nIHwgbnVsbCB9IHwgeyB0aXBvPzogc3RyaW5nIHwgbnVsbCB9W10gfCBudWxsO1xuICB9LFxuICBzbG90OiAndmlkZW8nIHwgJ2ltYWdlbicsXG4pOiBib29sZWFuIHtcbiAgY29uc3QgcmF3ID0gcm93Lm1lZGlhX2NvbnRlbnQ7XG4gIGNvbnN0IG1jID0gQXJyYXkuaXNBcnJheShyYXcpID8gcmF3WzBdIDogcmF3O1xuICBjb25zdCB0aXBvID0gU3RyaW5nKG1jPy50aXBvID8/ICcnKS50b0xvd2VyQ2FzZSgpO1xuICBpZiAodGlwbyA9PT0gJ2ltYWdlbicpIHJldHVybiBzbG90ID09PSAnaW1hZ2VuJztcbiAgcmV0dXJuIHNsb3QgPT09ICd2aWRlbyc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlUGxheWxpc3RBY3Rpb24oXG4gIGNvdXJ0S2V5OiBzdHJpbmcsXG4gIHZlbnVlTmFtZTogc3RyaW5nLFxuICBtZWRpYUlkczogc3RyaW5nW10sXG4gIHNsb3Q6ICd2aWRlbycgfCAnaW1hZ2VuJyxcbiAgZHVyU2Vjb25kczogbnVtYmVyLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgY2xlYW5WZW51ZU5hbWUgPSB2ZW51ZU5hbWUudHJpbSgpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoc3VwYWJhc2UsIGNvdXJ0S2V5LnRyaW0oKSk7XG4gICAgaWYgKCFyZXNvbHZlZC5vaykgcmV0dXJuIHJlc29sdmVkO1xuICAgIGNvbnN0IHsgc3RvcmFnZUlkOiBzdG9yYWdlQ2FuY2hhSWQsIHZhcmlhbnRzOiBjb3VydElkVmFyaWFudHMgfSA9IHJlc29sdmVkO1xuXG4gICAgLy8gMSkgUXVpdGFyIGZpbGFzIHlhIGV0aXF1ZXRhZGFzIGNvbiBlc3RlIHNsb3QgKG1pc21vIHZlbnVlIGV4YWN0byBxdWUgZWwgaW5zZXJ0KS5cbiAgICBjb25zdCB7IGVycm9yOiBkZWxTbG90RXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJylcbiAgICAgIC5kZWxldGUoKVxuICAgICAgLmluKCdjYW5jaGFfaWQnLCBjb3VydElkVmFyaWFudHMpXG4gICAgICAuZXEoJ3ZlbnVlX25hbWUnLCBjbGVhblZlbnVlTmFtZSlcbiAgICAgIC5lcSgncGxheWxpc3Rfc2xvdCcsIHNsb3QpO1xuXG4gICAgaWYgKGRlbFNsb3RFcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGFsIGJvcnJhciBwbGF5bGlzdCBwb3Igc2xvdDonLCBkZWxTbG90RXJyKTtcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGBBbCBsaW1waWFyIHBsYXlsaXN0OiAke2RlbFNsb3RFcnIubWVzc2FnZX1gIH07XG4gICAgfVxuXG4gICAgLy8gMikgUXVpdGFyIGZpbGFzIGxlZ2FjeSBxdWUgY29ycmVzcG9uZGFuIGEgZXN0ZSB0aXBvIGRlIG1lZGlvIChwbGF5bGlzdF9zbG90IGVzIE5PVCBOVUxMOyBudW5jYSBmdWUgTlVMTCkuXG4gICAgY29uc3QgeyBkYXRhOiBsZWdhY3lSb3dzLCBlcnJvcjogbGVnU2VsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJylcbiAgICAgIC5zZWxlY3QoJ2lkLCBtZWRpYV9jb250ZW50KHRpcG8pJylcbiAgICAgIC5pbignY2FuY2hhX2lkJywgY291cnRJZFZhcmlhbnRzKVxuICAgICAgLmVxKCd2ZW51ZV9uYW1lJywgY2xlYW5WZW51ZU5hbWUpXG4gICAgICAuZXEoJ3BsYXlsaXN0X3Nsb3QnLCAnbGVnYWN5Jyk7XG5cbiAgICBpZiAobGVnU2VsRXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBsaXN0YXIgbGVnYWN5IGNhbmNoYV9wdWJsaWNpZGFkOicsIGxlZ1NlbEVycik7XG4gICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBgQWwgbGltcGlhciBwbGF5bGlzdCBsZWdhY3k6ICR7bGVnU2VsRXJyLm1lc3NhZ2V9YCB9O1xuICAgIH1cblxuICAgIGNvbnN0IGxlZ2FjeUlkcyA9IChsZWdhY3lSb3dzIHx8IFtdKVxuICAgICAgLmZpbHRlcigocikgPT4gbGVnYWN5Um93TWF0Y2hlc1BsYXlsaXN0U2xvdChyLCBzbG90KSlcbiAgICAgIC5tYXAoKHIpID0+IHIuaWQpO1xuXG4gICAgaWYgKGxlZ2FjeUlkcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCB7IGVycm9yOiBkZWxMZWdFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJykuZGVsZXRlKCkuaW4oJ2lkJywgbGVnYWN5SWRzKTtcbiAgICAgIGlmIChkZWxMZWdFcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgYWwgYm9ycmFyIGZpbGFzIGxlZ2FjeTonLCBkZWxMZWdFcnIpO1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBgQWwgbGltcGlhciBwbGF5bGlzdCBhbnRpZ3VhOiAke2RlbExlZ0Vyci5tZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBvcmRlcmVkVW5pcXVlSWRzID0gKCgpID0+IHtcbiAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgIGNvbnN0IG91dDogc3RyaW5nW10gPSBbXTtcbiAgICAgIGZvciAoY29uc3QgaWQgb2YgbWVkaWFJZHMpIHtcbiAgICAgICAgY29uc3QgdCA9IFN0cmluZyhpZCB8fCAnJykudHJpbSgpO1xuICAgICAgICBpZiAoIXQgfHwgc2Vlbi5oYXModCkpIGNvbnRpbnVlO1xuICAgICAgICBzZWVuLmFkZCh0KTtcbiAgICAgICAgb3V0LnB1c2godCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH0pKCk7XG5cbiAgICBpZiAob3JkZXJlZFVuaXF1ZUlkcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBkdXJJbnQgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKE51bWJlcihkdXJTZWNvbmRzKSB8fCAxMCkpO1xuICAgICAgY29uc3Qgcm93cyA9IG9yZGVyZWRVbmlxdWVJZHMubWFwKChtaWQsIGkpID0+ICh7XG4gICAgICAgIGNhbmNoYV9pZDogc3RvcmFnZUNhbmNoYUlkLFxuICAgICAgICB2ZW51ZV9uYW1lOiBjbGVhblZlbnVlTmFtZSxcbiAgICAgICAgbWVkaWFfaWQ6IG1pZCxcbiAgICAgICAgb3JkZW46IGkgKyAxLFxuICAgICAgICBkdXJhY2lvbl9zZWd1bmRvczogZHVySW50LFxuICAgICAgICBwbGF5bGlzdF9zbG90OiBzbG90LFxuICAgICAgfSkpO1xuXG4gICAgICBjb25zdCB7IGVycm9yOiBpbnNFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJykuaW5zZXJ0KHJvd3MpO1xuICAgICAgaWYgKGluc0Vycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBpbnNlcnRhciBudWV2YSBwbGF5bGlzdDonLCBpbnNFcnIpO1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBpbnNFcnIubWVzc2FnZSB8fCAnRXJyb3IgYWwgZ3VhcmRhciBsYSBwbGF5bGlzdC4nIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBndWFyZGFyIHBsYXlsaXN0LicgfTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVRpcmFQbGF5bGlzdEFjdGlvbihcbiAgY291cnRLZXk6IHN0cmluZyxcbiAgdmVudWVOYW1lOiBzdHJpbmcsXG4gIHRpcmFJZHM6IHN0cmluZ1tdLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgY2xlYW5WZW51ZU5hbWUgPSB2ZW51ZU5hbWUudHJpbSgpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoc3VwYWJhc2UsIGNvdXJ0S2V5LnRyaW0oKSk7XG4gICAgaWYgKCFyZXNvbHZlZC5vaykgcmV0dXJuIHJlc29sdmVkO1xuICAgIGNvbnN0IHsgc3RvcmFnZUlkOiBzdG9yYWdlQ2FuY2hhSWQsIHZhcmlhbnRzOiBjb3VydElkVmFyaWFudHMgfSA9IHJlc29sdmVkO1xuXG4gICAgY29uc3QgeyBlcnJvcjogZGVsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV90aXJhJylcbiAgICAgIC5kZWxldGUoKVxuICAgICAgLmluKCdjYW5jaGFfaWQnLCBjb3VydElkVmFyaWFudHMpXG4gICAgICAuZXEoJ3ZlbnVlX25hbWUnLCBjbGVhblZlbnVlTmFtZSk7XG5cbiAgICBpZiAoZGVsRXJyKSByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBkZWxFcnIubWVzc2FnZSB8fCAnTm8gc2UgcHVkbyBsaW1waWFyIGxhIHRpcmEuJyB9O1xuXG4gICAgaWYgKHRpcmFJZHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3Qgcm93cyA9IHRpcmFJZHMubWFwKCh0aWQsIGkpID0+ICh7XG4gICAgICAgIGNhbmNoYV9pZDogc3RvcmFnZUNhbmNoYUlkLFxuICAgICAgICB2ZW51ZV9uYW1lOiBjbGVhblZlbnVlTmFtZSxcbiAgICAgICAgdGlyYV9pbmZvcm1hdGl2YV9pZDogdGlkLFxuICAgICAgICBvcmRlbjogaSArIDEsXG4gICAgICB9KSk7XG4gICAgICBjb25zdCB7IGVycm9yOiBpbnNFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV90aXJhJykuaW5zZXJ0KHJvd3MpO1xuICAgICAgaWYgKGluc0VycikgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogaW5zRXJyLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZ3VhcmRhciBsYSB0aXJhLicgfTtcbiAgICB9XG5cbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGd1YXJkYXIgdGlyYS4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwc2VydFBsYXlsaXN0Q29uZmlnQWN0aW9uKFxuICB2ZW51ZU5hbWU6IHN0cmluZyxcbiAgY2FuY2hhSWQ6IHN0cmluZyxcbiAgcGF0Y2g6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBzYWZlUGF0Y2ggPSBzYW5pdGl6ZVBsYXlsaXN0Q29uZmlnUGF0Y2gocGF0Y2gpO1xuICAgIGNvbnN0IHJlc29sdmVkID0gYXdhaXQgcmVzb2x2ZUNhbmNoYUlkRm9yUHVibGljaWRhZEZrKHN1cGFiYXNlLCBjYW5jaGFJZC50cmltKCkpO1xuICAgIGlmICghcmVzb2x2ZWQub2spIHJldHVybiByZXNvbHZlZDtcbiAgICBjb25zdCBzdG9yYWdlQ2FuY2hhSWQgPSByZXNvbHZlZC5zdG9yYWdlSWQ7XG4gICAgY29uc3QgaXNvID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbSgnY2FuY2hhX3BsYXlsaXN0X2NvbmZpZycpLnVwc2VydChcbiAgICAgIHtcbiAgICAgICAgdmVudWVfbmFtZTogdmVudWVOYW1lLnRyaW0oKSxcbiAgICAgICAgY2FuY2hhX2lkOiBzdG9yYWdlQ2FuY2hhSWQsXG4gICAgICAgIC4uLnNhZmVQYXRjaCxcbiAgICAgICAgdXBkYXRlZF9hdDogaXNvLFxuICAgICAgfSxcbiAgICAgIHsgb25Db25mbGljdDogJ3ZlbnVlX25hbWUsY2FuY2hhX2lkJyB9LFxuICAgICk7XG5cbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZ3VhcmRhciBsYSBjb25maWd1cmFjacOzbi4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBndWFyZGFyIGNvbmZpZ3VyYWNpw7NuLicgfTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBGZXRjaEFzc2lnbm1lbnRzT2sgPSB7XG4gIGFzc2lnbm1lbnRzOiB1bmtub3duW107XG4gIGNvbmZpZzogdW5rbm93bltdO1xuICB0aXJhczogdW5rbm93bltdO1xufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoQXNzaWdubWVudHNBY3Rpb24oXG4gIHZlbnVlTmFtZT86IHN0cmluZyxcbiAga2V5cz86IHN0cmluZ1tdLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gJiBGZXRjaEFzc2lnbm1lbnRzT2sgfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgdiA9IHZlbnVlTmFtZT8udHJpbSgpO1xuICB0cnkge1xuICAgIGxldCBxID0gc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdjYW5jaGFfcHVibGljaWRhZCcpXG4gICAgICAuc2VsZWN0KCdpZCwgY2FuY2hhX2lkLCB2ZW51ZV9uYW1lLCBtZWRpYV9pZCwgb3JkZW4sIGR1cmFjaW9uX3NlZ3VuZG9zLCBwbGF5bGlzdF9zbG90LCBtZWRpYV9jb250ZW50KCopJyk7XG5cbiAgICBpZiAodikgcSA9IHEuaWxpa2UoJ3ZlbnVlX25hbWUnLCB2KTtcbiAgICBpZiAoa2V5cyAmJiBrZXlzLmxlbmd0aCA+IDApIHEgPSBxLmluKCdjYW5jaGFfaWQnLCBrZXlzKTtcblxuICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHEub3JkZXIoJ29yZGVuJywgeyBhc2NlbmRpbmc6IHRydWUgfSk7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBmZXRjaEFzc2lnbm1lbnRzQWN0aW9uOicsIGVycm9yKTtcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZGllcm9uIGNhcmdhciBsYXMgYXNpZ25hY2lvbmVzLicgfTtcbiAgICB9XG5cbiAgICBjb25zdCBhc3NpZ25tZW50cyA9IChkYXRhIHx8IFtdKS5tYXAoKHI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgICAgLi4ucixcbiAgICAgIHZlbnVlX25hbWU6IFN0cmluZyhyLnZlbnVlX25hbWUgfHwgJycpLnRyaW0oKSxcbiAgICAgIGNhbmNoYV9pZDogbm9ybWFsaXplQ2FuY2hhSWRLZXkoU3RyaW5nKHIuY2FuY2hhX2lkIHx8ICcnKSksXG4gICAgfSkpO1xuXG4gICAgbGV0IHFDb25maWcgPSBzdXBhYmFzZS5mcm9tKCdjYW5jaGFfcGxheWxpc3RfY29uZmlnJykuc2VsZWN0KCcqJyk7XG4gICAgaWYgKHYpIHFDb25maWcgPSBxQ29uZmlnLmlsaWtlKCd2ZW51ZV9uYW1lJywgdik7XG4gICAgY29uc3QgeyBkYXRhOiBjb25maWcgfSA9IGF3YWl0IHFDb25maWc7XG5cbiAgICBsZXQgcVRpcmFzID0gc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdjYW5jaGFfdGlyYScpXG4gICAgICAuc2VsZWN0KCdjYW5jaGFfaWQsIHRpcmFfaW5mb3JtYXRpdmFfaWQsIG9yZGVuLCB2ZW51ZV9uYW1lJyk7XG4gICAgaWYgKHYpIHFUaXJhcyA9IHFUaXJhcy5pbGlrZSgndmVudWVfbmFtZScsIHYpO1xuICAgIGNvbnN0IHsgZGF0YTogdGlyYXMgfSA9IGF3YWl0IHFUaXJhcztcblxuICAgIGNvbnN0IGNvbmZpZ05vcm0gPSAoY29uZmlnIHx8IFtdKS5tYXAoKHI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgICAgLi4ucixcbiAgICAgIGNhbmNoYV9pZDogbm9ybWFsaXplQ2FuY2hhSWRLZXkoU3RyaW5nKHIuY2FuY2hhX2lkIHx8ICcnKSksXG4gICAgfSkpO1xuICAgIGNvbnN0IHRpcmFzTm9ybSA9ICh0aXJhcyB8fCBbXSkubWFwKChyOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gKHtcbiAgICAgIC4uLnIsXG4gICAgICBjYW5jaGFfaWQ6IG5vcm1hbGl6ZUNhbmNoYUlkS2V5KFN0cmluZyhyLmNhbmNoYV9pZCB8fCAnJykpLFxuICAgIH0pKTtcblxuICAgIHJldHVybiB7IG9rOiB0cnVlLCBhc3NpZ25tZW50cywgY29uZmlnOiBjb25maWdOb3JtLCB0aXJhczogdGlyYXNOb3JtIH07XG4gIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnRXJyb3IgYWwgY2FyZ2FyIGFzaWduYWNpb25lcy4nIH07XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoieVNBdUlzQiw4TEFBQSJ9
}),
"[project]/src/app/admin/publicidad/data:c036d5 [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addTickerAction",
    ()=>$$RSC_SERVER_ACTION_3
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"60f06574e9f652793eefffe7f9342febc29dad8643":"addTickerAction"},"src/app/admin/publicidad/actions.ts",""] */ "use turbopack no side effects";
;
const $$RSC_SERVER_ACTION_3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("60f06574e9f652793eefffe7f9342febc29dad8643", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "addTickerAction");
;
 //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcic7XG5cbmltcG9ydCB0eXBlIHsgU3VwYWJhc2VDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnO1xuaW1wb3J0IHsgZ2V0U3VwYWJhc2VTZXJ2aWNlQ2xpZW50IH0gZnJvbSAnQC9saWIvc3VwYWJhc2Uvc2VydmVyJztcbmltcG9ydCB7IHJldmFsaWRhdGVQYXRoIH0gZnJvbSAnbmV4dC9jYWNoZSc7XG5pbXBvcnQge1xuICBjYW5jaGFJZENhbmRpZGF0ZXMsXG4gIGNhbmNoYUlkU3RvcmVkRm9yUHVibGljaWRhZFRhYmxlcyxcbiAgbm9ybWFsaXplQ2FuY2hhSWRLZXksXG59IGZyb20gJ0AvbGliL2NvdXJ0UGxheWxpc3RzJztcblxudHlwZSBFcnIgPSB7IG9rOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9O1xuXG5mdW5jdGlvbiBzZXJ2aWNlTWlzc2luZygpOiBFcnIge1xuICByZXR1cm4ge1xuICAgIG9rOiBmYWxzZSxcbiAgICBlcnJvcjpcbiAgICAgICdTZXJ2aWRvciBzaW4gY3JlZGVuY2lhbGVzIFN1cGFiYXNlLiBBw7FhZGUgU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSBlbiBWZXJjZWwgKEVudmlyb25tZW50IFZhcmlhYmxlcykgeSB2dWVsdmUgYSBkZXNwbGVnYXIuJyxcbiAgfTtcbn1cblxuLyoqIFNvbG8gZXN0YXMgY29sdW1uYXMgZXhpc3RlbiBlbiBjYW5jaGFfcGxheWxpc3RfY29uZmlnOyBlbCByZXN0byBzZSBpZ25vcmEgKGV2aXRhIHAuIGVqLiBzcGxpdF9yYXRpbyDihpIgSU5URUdFUikuICovXG5jb25zdCBQTEFZTElTVF9DT05GSUdfSU5UX0tFWVMgPSBbXG4gICd2aWRlb19jYW1iaW9fY2FkYV9taW51dG9zJyxcbiAgJ2ltYWdlbl9jYW1iaW9fY2FkYV9taW51dG9zJyxcbiAgJ3RpcmFfY2FtYmlvX2NhZGFfbWludXRvcycsXG4gICdpbWFnZW5fcGF1c2FfZW50cmVfc2VndW5kb3MnLFxuXSBhcyBjb25zdDtcblxuZnVuY3Rpb24gc2FuaXRpemVQbGF5bGlzdENvbmZpZ1BhdGNoKHBhdGNoOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICBmb3IgKGNvbnN0IGtleSBvZiBQTEFZTElTVF9DT05GSUdfSU5UX0tFWVMpIHtcbiAgICBpZiAoa2V5IGluIHBhdGNoICYmIHBhdGNoW2tleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgb3V0W2tleV0gPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKE51bWJlcihwYXRjaFtrZXldKSB8fCAwKSk7XG4gICAgfVxuICB9XG4gIGlmICgnaW1hZ2VuX2xvb3AnIGluIHBhdGNoICYmIHBhdGNoLmltYWdlbl9sb29wICE9PSB1bmRlZmluZWQpIHtcbiAgICBvdXQuaW1hZ2VuX2xvb3AgPSBCb29sZWFuKHBhdGNoLmltYWdlbl9sb29wKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIGBjYW5jaGFfcHVibGljaWRhZGAgKHkgc2ltaWxhcmVzKSB0aWVuZW4gRksgYSBgcHVibGljLmNhbmNoYXMoY2FuY2hhX2lkKWAuXG4gKiBFbiBwcm9kdWNjacOzbiBwdWVkZSBleGlzdGlyIGAxYCBvIGBjYW5jaGFfMWA7IGRlYmVtb3MgZXNjcmliaXIgZXhhY3RhbWVudGUgZWwgaWQgcXVlIHlhIGVzdMOhIChvIGNyZWFyIGBjYW5jaGFfTmAgcG9yIGRlZmVjdG8pLlxuICovXG5hc3luYyBmdW5jdGlvbiByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoXG4gIHN1cGFiYXNlOiBTdXBhYmFzZUNsaWVudCxcbiAgY291cnRLZXk6IHN0cmluZyxcbik6IFByb21pc2U8eyBvazogdHJ1ZTsgc3RvcmFnZUlkOiBzdHJpbmc7IHZhcmlhbnRzOiBzdHJpbmdbXSB9IHwgRXJyPiB7XG4gIGNvbnN0IGNhbm9uaWNhbCA9IG5vcm1hbGl6ZUNhbmNoYUlkS2V5KGNvdXJ0S2V5LnRyaW0oKSk7XG4gIGNvbnN0IHZhcmlhbnRzID0gY2FuY2hhSWRDYW5kaWRhdGVzKGNhbm9uaWNhbCk7XG4gIGlmICghdmFyaWFudHMubGVuZ3RoKSByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiAnQ2FuY2hhIGludsOhbGlkYS4nIH07XG4gIGNvbnN0IHByZWZlcnJlZCA9IGNhbmNoYUlkU3RvcmVkRm9yUHVibGljaWRhZFRhYmxlcyhjb3VydEtleS50cmltKCkpO1xuXG4gIC8vIEFsZ3VuYXMgaW5zdGFuY2lhcyBubyBleHBvbmVuIGBwdWJsaWMuY2FuY2hhc2AgbyBsYSBjb2x1bW5hIGBjYW5jaGFfaWRgIGVuIGxhIEFQSSAoY2FjaMOpIFBvc3RnUkVTVCAvIGVzcXVlbWEgZGlzdGludG8pLlxuICAvLyBFbiBlc2UgY2FzbyBzZWd1aW1vcyBzaW4gZmFsbGFyOiBlc2NyaWJpbW9zIGBjYW5jaGFfTmAgeSBsYXMgY29uc3VsdGFzIHVzYW4gYGNhbmNoYUlkQ2FuZGlkYXRlc2AuXG4gIGxldCBoaXRzOiB7IGNhbmNoYV9pZD86IHN0cmluZyB9W10gfCBudWxsID0gbnVsbDtcbiAgY29uc3QgeyBkYXRhOiBzZWxEYXRhLCBlcnJvcjogc2VsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKCdjYW5jaGFzJylcbiAgICAuc2VsZWN0KCdjYW5jaGFfaWQnKVxuICAgIC5pbignY2FuY2hhX2lkJywgdmFyaWFudHMpO1xuXG4gIGlmIChzZWxFcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1twdWJsaWNpZGFkXSBjYW5jaGFzIGxvb2t1cCBvbWl0aWRvOicsIHNlbEVyci5tZXNzYWdlKTtcbiAgfSBlbHNlIHtcbiAgICBoaXRzID0gc2VsRGF0YTtcbiAgfVxuXG4gIGNvbnN0IGV4aXN0aW5nID0gbmV3IFNldChcbiAgICAoaGl0cyB8fCBbXSkubWFwKChyKSA9PiBTdHJpbmcocj8uY2FuY2hhX2lkID8/ICcnKS50cmltKCkpLmZpbHRlcihCb29sZWFuKSxcbiAgKTtcbiAgaWYgKGV4aXN0aW5nLnNpemUgPiAwKSB7XG4gICAgY29uc3QgcGlja09yZGVyID0gW3ByZWZlcnJlZCwgLi4udmFyaWFudHMuZmlsdGVyKCh2KSA9PiB2ICE9PSBwcmVmZXJyZWQpXTtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIHBpY2tPcmRlcikge1xuICAgICAgaWYgKGV4aXN0aW5nLmhhcyhpZCkpIHJldHVybiB7IG9rOiB0cnVlLCBzdG9yYWdlSWQ6IGlkLCB2YXJpYW50cyB9O1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGlzbyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgY29uc3QgeyBlcnJvcjogdXBFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYXMnKS51cHNlcnQoXG4gICAgeyBjYW5jaGFfaWQ6IHByZWZlcnJlZCwgbGFzdF9zZWVuOiBudWxsLCB1cGRhdGVkX2F0OiBpc28gfSxcbiAgICB7IG9uQ29uZmxpY3Q6ICdjYW5jaGFfaWQnIH0sXG4gICk7XG4gIGlmICh1cEVycikge1xuICAgIGNvbnNvbGUud2FybignW3B1YmxpY2lkYWRdIGNhbmNoYXMgdXBzZXJ0IG9taXRpZG86JywgdXBFcnIubWVzc2FnZSk7XG4gIH1cbiAgcmV0dXJuIHsgb2s6IHRydWUsIHN0b3JhZ2VJZDogcHJlZmVycmVkLCB2YXJpYW50cyB9O1xufVxuXG4vKipcbiAqIExhcyBTZXJ2ZXIgQWN0aW9ucyBubyBkZWJlbiB1c2FyIHRocm93IGhhY2lhIGVsIGNsaWVudGUgZW4gcHJvZHVjY2nDs246XG4gKiBOZXh0LmpzIG9jdWx0YSBlbCBtZW5zYWplIHJlYWwuIERldm9sdmVtb3MgeyBvaywgZXJyb3IgfSBzaWVtcHJlLlxuICovXG5cbmZ1bmN0aW9uIHNhbml0aXplTWVkaWFDb250ZW50SW5zZXJ0KHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICBjb25zdCByb3cgPSB7IC4uLnBheWxvYWQgfTtcbiAgaWYgKHJvdy5kdXJhY2lvbl9zZWd1bmRvcyAhPSBudWxsICYmIHJvdy5kdXJhY2lvbl9zZWd1bmRvcyAhPT0gJycpIHtcbiAgICByb3cuZHVyYWNpb25fc2VndW5kb3MgPSBNYXRoLm1heCgwLCBNYXRoLnJvdW5kKE51bWJlcihyb3cuZHVyYWNpb25fc2VndW5kb3MpIHx8IDApKTtcbiAgfVxuICBpZiAocm93LmZpbGVfc2l6ZV9ieXRlcyAhPSBudWxsICYmIHJvdy5maWxlX3NpemVfYnl0ZXMgIT09ICcnKSB7XG4gICAgcm93LmZpbGVfc2l6ZV9ieXRlcyA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IoTnVtYmVyKHJvdy5maWxlX3NpemVfYnl0ZXMpIHx8IDApKTtcbiAgfVxuICByZXR1cm4gcm93O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkTWVkaWFDb250ZW50QWN0aW9uKFxuICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbik6IFByb21pc2U8eyBvazogdHJ1ZTsgZGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCByb3cgPSBzYW5pdGl6ZU1lZGlhQ29udGVudEluc2VydChwYXlsb2FkKTtcbiAgICBjb25zdCB7IGVycm9yLCBkYXRhIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdtZWRpYV9jb250ZW50JykuaW5zZXJ0KFtyb3ddKS5zZWxlY3QoKS5zaW5nbGUoKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gY3JlYXIgZWwgY29udGVuaWRvLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSwgZGF0YTogZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGNyZWFyIGNvbnRlbmlkby4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZU1lZGlhQWN0aW9uKGlkOiBzdHJpbmcpOiBQcm9taXNlPHsgb2s6IHRydWUgfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdtZWRpYV9jb250ZW50JykuZGVsZXRlKCkuZXEoJ2lkJywgaWQpO1xuICAgIGlmIChlcnJvcikgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAnTm8gc2UgcHVkbyBlbGltaW5hci4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBlbGltaW5hci4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbmFtZU1lZGlhQWN0aW9uKGlkOiBzdHJpbmcsIG5vbWJyZTogc3RyaW5nKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdtZWRpYV9jb250ZW50JylcbiAgICAgIC51cGRhdGUoeyBub21icmUsIG5vbWJyZV9zcG9uc29yOiBub21icmUucmVwbGFjZSgvXFwuW14vLl0rJC8sICcnKSB9KVxuICAgICAgLmVxKCdpZCcsIGlkKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gcmVub21icmFyLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIHJlbm9tYnJhci4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZFRpY2tlckFjdGlvbihtZW5zYWplOiBzdHJpbmcsIG9yZGVuOiBudW1iZXIpOiBQcm9taXNlPHsgb2s6IHRydWUgfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgY29uc3Qgb3JkZW5JbnQgPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKE51bWJlcihvcmRlbikgfHwgMCkpO1xuICB0cnkge1xuICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ3RpcmFfaW5mb3JtYXRpdmEnKS5pbnNlcnQoeyBtZW5zYWplLCBvcmRlbjogb3JkZW5JbnQsIGFjdGl2bzogdHJ1ZSB9KTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gYcOxYWRpciBlbCBtZW5zYWplLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGHDsWFkaXIgdGlyYS4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVRpY2tlckFjdGlvbihpZDogc3RyaW5nKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbSgndGlyYV9pbmZvcm1hdGl2YScpLmRlbGV0ZSgpLmVxKCdpZCcsIGlkKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZWxpbWluYXIgZWwgbWVuc2FqZS4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBlbGltaW5hciB0aXJhLicgfTtcbiAgfVxufVxuXG4vKiogRmlsYXMgYHBsYXlsaXN0X3Nsb3QgPSBsZWdhY3lgOiBkZWNpZGlyIHNpIHBlcnRlbmVjZW4gYWwgc2xvdCB2w61kZW8gbyBpbWFnZW4gKG1pc21hIHJlZ2xhIHF1ZSBgcGFydGl0aW9uUGxheWxpc3RSb3dzYCkuICovXG5mdW5jdGlvbiBsZWdhY3lSb3dNYXRjaGVzUGxheWxpc3RTbG90KFxuICByb3c6IHtcbiAgICBtZWRpYV9jb250ZW50PzogeyB0aXBvPzogc3RyaW5nIHwgbnVsbCB9IHwgeyB0aXBvPzogc3RyaW5nIHwgbnVsbCB9W10gfCBudWxsO1xuICB9LFxuICBzbG90OiAndmlkZW8nIHwgJ2ltYWdlbicsXG4pOiBib29sZWFuIHtcbiAgY29uc3QgcmF3ID0gcm93Lm1lZGlhX2NvbnRlbnQ7XG4gIGNvbnN0IG1jID0gQXJyYXkuaXNBcnJheShyYXcpID8gcmF3WzBdIDogcmF3O1xuICBjb25zdCB0aXBvID0gU3RyaW5nKG1jPy50aXBvID8/ICcnKS50b0xvd2VyQ2FzZSgpO1xuICBpZiAodGlwbyA9PT0gJ2ltYWdlbicpIHJldHVybiBzbG90ID09PSAnaW1hZ2VuJztcbiAgcmV0dXJuIHNsb3QgPT09ICd2aWRlbyc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlUGxheWxpc3RBY3Rpb24oXG4gIGNvdXJ0S2V5OiBzdHJpbmcsXG4gIHZlbnVlTmFtZTogc3RyaW5nLFxuICBtZWRpYUlkczogc3RyaW5nW10sXG4gIHNsb3Q6ICd2aWRlbycgfCAnaW1hZ2VuJyxcbiAgZHVyU2Vjb25kczogbnVtYmVyLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgY2xlYW5WZW51ZU5hbWUgPSB2ZW51ZU5hbWUudHJpbSgpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoc3VwYWJhc2UsIGNvdXJ0S2V5LnRyaW0oKSk7XG4gICAgaWYgKCFyZXNvbHZlZC5vaykgcmV0dXJuIHJlc29sdmVkO1xuICAgIGNvbnN0IHsgc3RvcmFnZUlkOiBzdG9yYWdlQ2FuY2hhSWQsIHZhcmlhbnRzOiBjb3VydElkVmFyaWFudHMgfSA9IHJlc29sdmVkO1xuXG4gICAgLy8gMSkgUXVpdGFyIGZpbGFzIHlhIGV0aXF1ZXRhZGFzIGNvbiBlc3RlIHNsb3QgKG1pc21vIHZlbnVlIGV4YWN0byBxdWUgZWwgaW5zZXJ0KS5cbiAgICBjb25zdCB7IGVycm9yOiBkZWxTbG90RXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJylcbiAgICAgIC5kZWxldGUoKVxuICAgICAgLmluKCdjYW5jaGFfaWQnLCBjb3VydElkVmFyaWFudHMpXG4gICAgICAuZXEoJ3ZlbnVlX25hbWUnLCBjbGVhblZlbnVlTmFtZSlcbiAgICAgIC5lcSgncGxheWxpc3Rfc2xvdCcsIHNsb3QpO1xuXG4gICAgaWYgKGRlbFNsb3RFcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGFsIGJvcnJhciBwbGF5bGlzdCBwb3Igc2xvdDonLCBkZWxTbG90RXJyKTtcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGBBbCBsaW1waWFyIHBsYXlsaXN0OiAke2RlbFNsb3RFcnIubWVzc2FnZX1gIH07XG4gICAgfVxuXG4gICAgLy8gMikgUXVpdGFyIGZpbGFzIGxlZ2FjeSBxdWUgY29ycmVzcG9uZGFuIGEgZXN0ZSB0aXBvIGRlIG1lZGlvIChwbGF5bGlzdF9zbG90IGVzIE5PVCBOVUxMOyBudW5jYSBmdWUgTlVMTCkuXG4gICAgY29uc3QgeyBkYXRhOiBsZWdhY3lSb3dzLCBlcnJvcjogbGVnU2VsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJylcbiAgICAgIC5zZWxlY3QoJ2lkLCBtZWRpYV9jb250ZW50KHRpcG8pJylcbiAgICAgIC5pbignY2FuY2hhX2lkJywgY291cnRJZFZhcmlhbnRzKVxuICAgICAgLmVxKCd2ZW51ZV9uYW1lJywgY2xlYW5WZW51ZU5hbWUpXG4gICAgICAuZXEoJ3BsYXlsaXN0X3Nsb3QnLCAnbGVnYWN5Jyk7XG5cbiAgICBpZiAobGVnU2VsRXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBsaXN0YXIgbGVnYWN5IGNhbmNoYV9wdWJsaWNpZGFkOicsIGxlZ1NlbEVycik7XG4gICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBgQWwgbGltcGlhciBwbGF5bGlzdCBsZWdhY3k6ICR7bGVnU2VsRXJyLm1lc3NhZ2V9YCB9O1xuICAgIH1cblxuICAgIGNvbnN0IGxlZ2FjeUlkcyA9IChsZWdhY3lSb3dzIHx8IFtdKVxuICAgICAgLmZpbHRlcigocikgPT4gbGVnYWN5Um93TWF0Y2hlc1BsYXlsaXN0U2xvdChyLCBzbG90KSlcbiAgICAgIC5tYXAoKHIpID0+IHIuaWQpO1xuXG4gICAgaWYgKGxlZ2FjeUlkcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCB7IGVycm9yOiBkZWxMZWdFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJykuZGVsZXRlKCkuaW4oJ2lkJywgbGVnYWN5SWRzKTtcbiAgICAgIGlmIChkZWxMZWdFcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgYWwgYm9ycmFyIGZpbGFzIGxlZ2FjeTonLCBkZWxMZWdFcnIpO1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBgQWwgbGltcGlhciBwbGF5bGlzdCBhbnRpZ3VhOiAke2RlbExlZ0Vyci5tZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBvcmRlcmVkVW5pcXVlSWRzID0gKCgpID0+IHtcbiAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgIGNvbnN0IG91dDogc3RyaW5nW10gPSBbXTtcbiAgICAgIGZvciAoY29uc3QgaWQgb2YgbWVkaWFJZHMpIHtcbiAgICAgICAgY29uc3QgdCA9IFN0cmluZyhpZCB8fCAnJykudHJpbSgpO1xuICAgICAgICBpZiAoIXQgfHwgc2Vlbi5oYXModCkpIGNvbnRpbnVlO1xuICAgICAgICBzZWVuLmFkZCh0KTtcbiAgICAgICAgb3V0LnB1c2godCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH0pKCk7XG5cbiAgICBpZiAob3JkZXJlZFVuaXF1ZUlkcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBkdXJJbnQgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKE51bWJlcihkdXJTZWNvbmRzKSB8fCAxMCkpO1xuICAgICAgY29uc3Qgcm93cyA9IG9yZGVyZWRVbmlxdWVJZHMubWFwKChtaWQsIGkpID0+ICh7XG4gICAgICAgIGNhbmNoYV9pZDogc3RvcmFnZUNhbmNoYUlkLFxuICAgICAgICB2ZW51ZV9uYW1lOiBjbGVhblZlbnVlTmFtZSxcbiAgICAgICAgbWVkaWFfaWQ6IG1pZCxcbiAgICAgICAgb3JkZW46IGkgKyAxLFxuICAgICAgICBkdXJhY2lvbl9zZWd1bmRvczogZHVySW50LFxuICAgICAgICBwbGF5bGlzdF9zbG90OiBzbG90LFxuICAgICAgfSkpO1xuXG4gICAgICBjb25zdCB7IGVycm9yOiBpbnNFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJykuaW5zZXJ0KHJvd3MpO1xuICAgICAgaWYgKGluc0Vycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBpbnNlcnRhciBudWV2YSBwbGF5bGlzdDonLCBpbnNFcnIpO1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBpbnNFcnIubWVzc2FnZSB8fCAnRXJyb3IgYWwgZ3VhcmRhciBsYSBwbGF5bGlzdC4nIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBndWFyZGFyIHBsYXlsaXN0LicgfTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVRpcmFQbGF5bGlzdEFjdGlvbihcbiAgY291cnRLZXk6IHN0cmluZyxcbiAgdmVudWVOYW1lOiBzdHJpbmcsXG4gIHRpcmFJZHM6IHN0cmluZ1tdLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgY2xlYW5WZW51ZU5hbWUgPSB2ZW51ZU5hbWUudHJpbSgpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoc3VwYWJhc2UsIGNvdXJ0S2V5LnRyaW0oKSk7XG4gICAgaWYgKCFyZXNvbHZlZC5vaykgcmV0dXJuIHJlc29sdmVkO1xuICAgIGNvbnN0IHsgc3RvcmFnZUlkOiBzdG9yYWdlQ2FuY2hhSWQsIHZhcmlhbnRzOiBjb3VydElkVmFyaWFudHMgfSA9IHJlc29sdmVkO1xuXG4gICAgY29uc3QgeyBlcnJvcjogZGVsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV90aXJhJylcbiAgICAgIC5kZWxldGUoKVxuICAgICAgLmluKCdjYW5jaGFfaWQnLCBjb3VydElkVmFyaWFudHMpXG4gICAgICAuZXEoJ3ZlbnVlX25hbWUnLCBjbGVhblZlbnVlTmFtZSk7XG5cbiAgICBpZiAoZGVsRXJyKSByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBkZWxFcnIubWVzc2FnZSB8fCAnTm8gc2UgcHVkbyBsaW1waWFyIGxhIHRpcmEuJyB9O1xuXG4gICAgaWYgKHRpcmFJZHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3Qgcm93cyA9IHRpcmFJZHMubWFwKCh0aWQsIGkpID0+ICh7XG4gICAgICAgIGNhbmNoYV9pZDogc3RvcmFnZUNhbmNoYUlkLFxuICAgICAgICB2ZW51ZV9uYW1lOiBjbGVhblZlbnVlTmFtZSxcbiAgICAgICAgdGlyYV9pbmZvcm1hdGl2YV9pZDogdGlkLFxuICAgICAgICBvcmRlbjogaSArIDEsXG4gICAgICB9KSk7XG4gICAgICBjb25zdCB7IGVycm9yOiBpbnNFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV90aXJhJykuaW5zZXJ0KHJvd3MpO1xuICAgICAgaWYgKGluc0VycikgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogaW5zRXJyLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZ3VhcmRhciBsYSB0aXJhLicgfTtcbiAgICB9XG5cbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGd1YXJkYXIgdGlyYS4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwc2VydFBsYXlsaXN0Q29uZmlnQWN0aW9uKFxuICB2ZW51ZU5hbWU6IHN0cmluZyxcbiAgY2FuY2hhSWQ6IHN0cmluZyxcbiAgcGF0Y2g6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBzYWZlUGF0Y2ggPSBzYW5pdGl6ZVBsYXlsaXN0Q29uZmlnUGF0Y2gocGF0Y2gpO1xuICAgIGNvbnN0IHJlc29sdmVkID0gYXdhaXQgcmVzb2x2ZUNhbmNoYUlkRm9yUHVibGljaWRhZEZrKHN1cGFiYXNlLCBjYW5jaGFJZC50cmltKCkpO1xuICAgIGlmICghcmVzb2x2ZWQub2spIHJldHVybiByZXNvbHZlZDtcbiAgICBjb25zdCBzdG9yYWdlQ2FuY2hhSWQgPSByZXNvbHZlZC5zdG9yYWdlSWQ7XG4gICAgY29uc3QgaXNvID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbSgnY2FuY2hhX3BsYXlsaXN0X2NvbmZpZycpLnVwc2VydChcbiAgICAgIHtcbiAgICAgICAgdmVudWVfbmFtZTogdmVudWVOYW1lLnRyaW0oKSxcbiAgICAgICAgY2FuY2hhX2lkOiBzdG9yYWdlQ2FuY2hhSWQsXG4gICAgICAgIC4uLnNhZmVQYXRjaCxcbiAgICAgICAgdXBkYXRlZF9hdDogaXNvLFxuICAgICAgfSxcbiAgICAgIHsgb25Db25mbGljdDogJ3ZlbnVlX25hbWUsY2FuY2hhX2lkJyB9LFxuICAgICk7XG5cbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZ3VhcmRhciBsYSBjb25maWd1cmFjacOzbi4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBndWFyZGFyIGNvbmZpZ3VyYWNpw7NuLicgfTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBGZXRjaEFzc2lnbm1lbnRzT2sgPSB7XG4gIGFzc2lnbm1lbnRzOiB1bmtub3duW107XG4gIGNvbmZpZzogdW5rbm93bltdO1xuICB0aXJhczogdW5rbm93bltdO1xufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoQXNzaWdubWVudHNBY3Rpb24oXG4gIHZlbnVlTmFtZT86IHN0cmluZyxcbiAga2V5cz86IHN0cmluZ1tdLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gJiBGZXRjaEFzc2lnbm1lbnRzT2sgfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgdiA9IHZlbnVlTmFtZT8udHJpbSgpO1xuICB0cnkge1xuICAgIGxldCBxID0gc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdjYW5jaGFfcHVibGljaWRhZCcpXG4gICAgICAuc2VsZWN0KCdpZCwgY2FuY2hhX2lkLCB2ZW51ZV9uYW1lLCBtZWRpYV9pZCwgb3JkZW4sIGR1cmFjaW9uX3NlZ3VuZG9zLCBwbGF5bGlzdF9zbG90LCBtZWRpYV9jb250ZW50KCopJyk7XG5cbiAgICBpZiAodikgcSA9IHEuaWxpa2UoJ3ZlbnVlX25hbWUnLCB2KTtcbiAgICBpZiAoa2V5cyAmJiBrZXlzLmxlbmd0aCA+IDApIHEgPSBxLmluKCdjYW5jaGFfaWQnLCBrZXlzKTtcblxuICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHEub3JkZXIoJ29yZGVuJywgeyBhc2NlbmRpbmc6IHRydWUgfSk7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBmZXRjaEFzc2lnbm1lbnRzQWN0aW9uOicsIGVycm9yKTtcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZGllcm9uIGNhcmdhciBsYXMgYXNpZ25hY2lvbmVzLicgfTtcbiAgICB9XG5cbiAgICBjb25zdCBhc3NpZ25tZW50cyA9IChkYXRhIHx8IFtdKS5tYXAoKHI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgICAgLi4ucixcbiAgICAgIHZlbnVlX25hbWU6IFN0cmluZyhyLnZlbnVlX25hbWUgfHwgJycpLnRyaW0oKSxcbiAgICAgIGNhbmNoYV9pZDogbm9ybWFsaXplQ2FuY2hhSWRLZXkoU3RyaW5nKHIuY2FuY2hhX2lkIHx8ICcnKSksXG4gICAgfSkpO1xuXG4gICAgbGV0IHFDb25maWcgPSBzdXBhYmFzZS5mcm9tKCdjYW5jaGFfcGxheWxpc3RfY29uZmlnJykuc2VsZWN0KCcqJyk7XG4gICAgaWYgKHYpIHFDb25maWcgPSBxQ29uZmlnLmlsaWtlKCd2ZW51ZV9uYW1lJywgdik7XG4gICAgY29uc3QgeyBkYXRhOiBjb25maWcgfSA9IGF3YWl0IHFDb25maWc7XG5cbiAgICBsZXQgcVRpcmFzID0gc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdjYW5jaGFfdGlyYScpXG4gICAgICAuc2VsZWN0KCdjYW5jaGFfaWQsIHRpcmFfaW5mb3JtYXRpdmFfaWQsIG9yZGVuLCB2ZW51ZV9uYW1lJyk7XG4gICAgaWYgKHYpIHFUaXJhcyA9IHFUaXJhcy5pbGlrZSgndmVudWVfbmFtZScsIHYpO1xuICAgIGNvbnN0IHsgZGF0YTogdGlyYXMgfSA9IGF3YWl0IHFUaXJhcztcblxuICAgIGNvbnN0IGNvbmZpZ05vcm0gPSAoY29uZmlnIHx8IFtdKS5tYXAoKHI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgICAgLi4ucixcbiAgICAgIGNhbmNoYV9pZDogbm9ybWFsaXplQ2FuY2hhSWRLZXkoU3RyaW5nKHIuY2FuY2hhX2lkIHx8ICcnKSksXG4gICAgfSkpO1xuICAgIGNvbnN0IHRpcmFzTm9ybSA9ICh0aXJhcyB8fCBbXSkubWFwKChyOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gKHtcbiAgICAgIC4uLnIsXG4gICAgICBjYW5jaGFfaWQ6IG5vcm1hbGl6ZUNhbmNoYUlkS2V5KFN0cmluZyhyLmNhbmNoYV9pZCB8fCAnJykpLFxuICAgIH0pKTtcblxuICAgIHJldHVybiB7IG9rOiB0cnVlLCBhc3NpZ25tZW50cywgY29uZmlnOiBjb25maWdOb3JtLCB0aXJhczogdGlyYXNOb3JtIH07XG4gIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnRXJyb3IgYWwgY2FyZ2FyIGFzaWduYWNpb25lcy4nIH07XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoidVNBdUpzQiw0TEFBQSJ9
}),
"[project]/src/app/admin/publicidad/data:0a472c [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteTickerAction",
    ()=>$$RSC_SERVER_ACTION_4
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"40f4725878b7d31dab6b788de4448375535007ef0b":"deleteTickerAction"},"src/app/admin/publicidad/actions.ts",""] */ "use turbopack no side effects";
;
const $$RSC_SERVER_ACTION_4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("40f4725878b7d31dab6b788de4448375535007ef0b", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "deleteTickerAction");
;
 //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcic7XG5cbmltcG9ydCB0eXBlIHsgU3VwYWJhc2VDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnO1xuaW1wb3J0IHsgZ2V0U3VwYWJhc2VTZXJ2aWNlQ2xpZW50IH0gZnJvbSAnQC9saWIvc3VwYWJhc2Uvc2VydmVyJztcbmltcG9ydCB7IHJldmFsaWRhdGVQYXRoIH0gZnJvbSAnbmV4dC9jYWNoZSc7XG5pbXBvcnQge1xuICBjYW5jaGFJZENhbmRpZGF0ZXMsXG4gIGNhbmNoYUlkU3RvcmVkRm9yUHVibGljaWRhZFRhYmxlcyxcbiAgbm9ybWFsaXplQ2FuY2hhSWRLZXksXG59IGZyb20gJ0AvbGliL2NvdXJ0UGxheWxpc3RzJztcblxudHlwZSBFcnIgPSB7IG9rOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9O1xuXG5mdW5jdGlvbiBzZXJ2aWNlTWlzc2luZygpOiBFcnIge1xuICByZXR1cm4ge1xuICAgIG9rOiBmYWxzZSxcbiAgICBlcnJvcjpcbiAgICAgICdTZXJ2aWRvciBzaW4gY3JlZGVuY2lhbGVzIFN1cGFiYXNlLiBBw7FhZGUgU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSBlbiBWZXJjZWwgKEVudmlyb25tZW50IFZhcmlhYmxlcykgeSB2dWVsdmUgYSBkZXNwbGVnYXIuJyxcbiAgfTtcbn1cblxuLyoqIFNvbG8gZXN0YXMgY29sdW1uYXMgZXhpc3RlbiBlbiBjYW5jaGFfcGxheWxpc3RfY29uZmlnOyBlbCByZXN0byBzZSBpZ25vcmEgKGV2aXRhIHAuIGVqLiBzcGxpdF9yYXRpbyDihpIgSU5URUdFUikuICovXG5jb25zdCBQTEFZTElTVF9DT05GSUdfSU5UX0tFWVMgPSBbXG4gICd2aWRlb19jYW1iaW9fY2FkYV9taW51dG9zJyxcbiAgJ2ltYWdlbl9jYW1iaW9fY2FkYV9taW51dG9zJyxcbiAgJ3RpcmFfY2FtYmlvX2NhZGFfbWludXRvcycsXG4gICdpbWFnZW5fcGF1c2FfZW50cmVfc2VndW5kb3MnLFxuXSBhcyBjb25zdDtcblxuZnVuY3Rpb24gc2FuaXRpemVQbGF5bGlzdENvbmZpZ1BhdGNoKHBhdGNoOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICBmb3IgKGNvbnN0IGtleSBvZiBQTEFZTElTVF9DT05GSUdfSU5UX0tFWVMpIHtcbiAgICBpZiAoa2V5IGluIHBhdGNoICYmIHBhdGNoW2tleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgb3V0W2tleV0gPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKE51bWJlcihwYXRjaFtrZXldKSB8fCAwKSk7XG4gICAgfVxuICB9XG4gIGlmICgnaW1hZ2VuX2xvb3AnIGluIHBhdGNoICYmIHBhdGNoLmltYWdlbl9sb29wICE9PSB1bmRlZmluZWQpIHtcbiAgICBvdXQuaW1hZ2VuX2xvb3AgPSBCb29sZWFuKHBhdGNoLmltYWdlbl9sb29wKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIGBjYW5jaGFfcHVibGljaWRhZGAgKHkgc2ltaWxhcmVzKSB0aWVuZW4gRksgYSBgcHVibGljLmNhbmNoYXMoY2FuY2hhX2lkKWAuXG4gKiBFbiBwcm9kdWNjacOzbiBwdWVkZSBleGlzdGlyIGAxYCBvIGBjYW5jaGFfMWA7IGRlYmVtb3MgZXNjcmliaXIgZXhhY3RhbWVudGUgZWwgaWQgcXVlIHlhIGVzdMOhIChvIGNyZWFyIGBjYW5jaGFfTmAgcG9yIGRlZmVjdG8pLlxuICovXG5hc3luYyBmdW5jdGlvbiByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoXG4gIHN1cGFiYXNlOiBTdXBhYmFzZUNsaWVudCxcbiAgY291cnRLZXk6IHN0cmluZyxcbik6IFByb21pc2U8eyBvazogdHJ1ZTsgc3RvcmFnZUlkOiBzdHJpbmc7IHZhcmlhbnRzOiBzdHJpbmdbXSB9IHwgRXJyPiB7XG4gIGNvbnN0IGNhbm9uaWNhbCA9IG5vcm1hbGl6ZUNhbmNoYUlkS2V5KGNvdXJ0S2V5LnRyaW0oKSk7XG4gIGNvbnN0IHZhcmlhbnRzID0gY2FuY2hhSWRDYW5kaWRhdGVzKGNhbm9uaWNhbCk7XG4gIGlmICghdmFyaWFudHMubGVuZ3RoKSByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiAnQ2FuY2hhIGludsOhbGlkYS4nIH07XG4gIGNvbnN0IHByZWZlcnJlZCA9IGNhbmNoYUlkU3RvcmVkRm9yUHVibGljaWRhZFRhYmxlcyhjb3VydEtleS50cmltKCkpO1xuXG4gIC8vIEFsZ3VuYXMgaW5zdGFuY2lhcyBubyBleHBvbmVuIGBwdWJsaWMuY2FuY2hhc2AgbyBsYSBjb2x1bW5hIGBjYW5jaGFfaWRgIGVuIGxhIEFQSSAoY2FjaMOpIFBvc3RnUkVTVCAvIGVzcXVlbWEgZGlzdGludG8pLlxuICAvLyBFbiBlc2UgY2FzbyBzZWd1aW1vcyBzaW4gZmFsbGFyOiBlc2NyaWJpbW9zIGBjYW5jaGFfTmAgeSBsYXMgY29uc3VsdGFzIHVzYW4gYGNhbmNoYUlkQ2FuZGlkYXRlc2AuXG4gIGxldCBoaXRzOiB7IGNhbmNoYV9pZD86IHN0cmluZyB9W10gfCBudWxsID0gbnVsbDtcbiAgY29uc3QgeyBkYXRhOiBzZWxEYXRhLCBlcnJvcjogc2VsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKCdjYW5jaGFzJylcbiAgICAuc2VsZWN0KCdjYW5jaGFfaWQnKVxuICAgIC5pbignY2FuY2hhX2lkJywgdmFyaWFudHMpO1xuXG4gIGlmIChzZWxFcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1twdWJsaWNpZGFkXSBjYW5jaGFzIGxvb2t1cCBvbWl0aWRvOicsIHNlbEVyci5tZXNzYWdlKTtcbiAgfSBlbHNlIHtcbiAgICBoaXRzID0gc2VsRGF0YTtcbiAgfVxuXG4gIGNvbnN0IGV4aXN0aW5nID0gbmV3IFNldChcbiAgICAoaGl0cyB8fCBbXSkubWFwKChyKSA9PiBTdHJpbmcocj8uY2FuY2hhX2lkID8/ICcnKS50cmltKCkpLmZpbHRlcihCb29sZWFuKSxcbiAgKTtcbiAgaWYgKGV4aXN0aW5nLnNpemUgPiAwKSB7XG4gICAgY29uc3QgcGlja09yZGVyID0gW3ByZWZlcnJlZCwgLi4udmFyaWFudHMuZmlsdGVyKCh2KSA9PiB2ICE9PSBwcmVmZXJyZWQpXTtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIHBpY2tPcmRlcikge1xuICAgICAgaWYgKGV4aXN0aW5nLmhhcyhpZCkpIHJldHVybiB7IG9rOiB0cnVlLCBzdG9yYWdlSWQ6IGlkLCB2YXJpYW50cyB9O1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGlzbyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgY29uc3QgeyBlcnJvcjogdXBFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYXMnKS51cHNlcnQoXG4gICAgeyBjYW5jaGFfaWQ6IHByZWZlcnJlZCwgbGFzdF9zZWVuOiBudWxsLCB1cGRhdGVkX2F0OiBpc28gfSxcbiAgICB7IG9uQ29uZmxpY3Q6ICdjYW5jaGFfaWQnIH0sXG4gICk7XG4gIGlmICh1cEVycikge1xuICAgIGNvbnNvbGUud2FybignW3B1YmxpY2lkYWRdIGNhbmNoYXMgdXBzZXJ0IG9taXRpZG86JywgdXBFcnIubWVzc2FnZSk7XG4gIH1cbiAgcmV0dXJuIHsgb2s6IHRydWUsIHN0b3JhZ2VJZDogcHJlZmVycmVkLCB2YXJpYW50cyB9O1xufVxuXG4vKipcbiAqIExhcyBTZXJ2ZXIgQWN0aW9ucyBubyBkZWJlbiB1c2FyIHRocm93IGhhY2lhIGVsIGNsaWVudGUgZW4gcHJvZHVjY2nDs246XG4gKiBOZXh0LmpzIG9jdWx0YSBlbCBtZW5zYWplIHJlYWwuIERldm9sdmVtb3MgeyBvaywgZXJyb3IgfSBzaWVtcHJlLlxuICovXG5cbmZ1bmN0aW9uIHNhbml0aXplTWVkaWFDb250ZW50SW5zZXJ0KHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICBjb25zdCByb3cgPSB7IC4uLnBheWxvYWQgfTtcbiAgaWYgKHJvdy5kdXJhY2lvbl9zZWd1bmRvcyAhPSBudWxsICYmIHJvdy5kdXJhY2lvbl9zZWd1bmRvcyAhPT0gJycpIHtcbiAgICByb3cuZHVyYWNpb25fc2VndW5kb3MgPSBNYXRoLm1heCgwLCBNYXRoLnJvdW5kKE51bWJlcihyb3cuZHVyYWNpb25fc2VndW5kb3MpIHx8IDApKTtcbiAgfVxuICBpZiAocm93LmZpbGVfc2l6ZV9ieXRlcyAhPSBudWxsICYmIHJvdy5maWxlX3NpemVfYnl0ZXMgIT09ICcnKSB7XG4gICAgcm93LmZpbGVfc2l6ZV9ieXRlcyA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IoTnVtYmVyKHJvdy5maWxlX3NpemVfYnl0ZXMpIHx8IDApKTtcbiAgfVxuICByZXR1cm4gcm93O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkTWVkaWFDb250ZW50QWN0aW9uKFxuICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbik6IFByb21pc2U8eyBvazogdHJ1ZTsgZGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCByb3cgPSBzYW5pdGl6ZU1lZGlhQ29udGVudEluc2VydChwYXlsb2FkKTtcbiAgICBjb25zdCB7IGVycm9yLCBkYXRhIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdtZWRpYV9jb250ZW50JykuaW5zZXJ0KFtyb3ddKS5zZWxlY3QoKS5zaW5nbGUoKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gY3JlYXIgZWwgY29udGVuaWRvLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSwgZGF0YTogZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGNyZWFyIGNvbnRlbmlkby4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZU1lZGlhQWN0aW9uKGlkOiBzdHJpbmcpOiBQcm9taXNlPHsgb2s6IHRydWUgfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdtZWRpYV9jb250ZW50JykuZGVsZXRlKCkuZXEoJ2lkJywgaWQpO1xuICAgIGlmIChlcnJvcikgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAnTm8gc2UgcHVkbyBlbGltaW5hci4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBlbGltaW5hci4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbmFtZU1lZGlhQWN0aW9uKGlkOiBzdHJpbmcsIG5vbWJyZTogc3RyaW5nKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdtZWRpYV9jb250ZW50JylcbiAgICAgIC51cGRhdGUoeyBub21icmUsIG5vbWJyZV9zcG9uc29yOiBub21icmUucmVwbGFjZSgvXFwuW14vLl0rJC8sICcnKSB9KVxuICAgICAgLmVxKCdpZCcsIGlkKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gcmVub21icmFyLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIHJlbm9tYnJhci4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZFRpY2tlckFjdGlvbihtZW5zYWplOiBzdHJpbmcsIG9yZGVuOiBudW1iZXIpOiBQcm9taXNlPHsgb2s6IHRydWUgfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgY29uc3Qgb3JkZW5JbnQgPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKE51bWJlcihvcmRlbikgfHwgMCkpO1xuICB0cnkge1xuICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ3RpcmFfaW5mb3JtYXRpdmEnKS5pbnNlcnQoeyBtZW5zYWplLCBvcmRlbjogb3JkZW5JbnQsIGFjdGl2bzogdHJ1ZSB9KTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gYcOxYWRpciBlbCBtZW5zYWplLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGHDsWFkaXIgdGlyYS4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVRpY2tlckFjdGlvbihpZDogc3RyaW5nKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbSgndGlyYV9pbmZvcm1hdGl2YScpLmRlbGV0ZSgpLmVxKCdpZCcsIGlkKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZWxpbWluYXIgZWwgbWVuc2FqZS4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBlbGltaW5hciB0aXJhLicgfTtcbiAgfVxufVxuXG4vKiogRmlsYXMgYHBsYXlsaXN0X3Nsb3QgPSBsZWdhY3lgOiBkZWNpZGlyIHNpIHBlcnRlbmVjZW4gYWwgc2xvdCB2w61kZW8gbyBpbWFnZW4gKG1pc21hIHJlZ2xhIHF1ZSBgcGFydGl0aW9uUGxheWxpc3RSb3dzYCkuICovXG5mdW5jdGlvbiBsZWdhY3lSb3dNYXRjaGVzUGxheWxpc3RTbG90KFxuICByb3c6IHtcbiAgICBtZWRpYV9jb250ZW50PzogeyB0aXBvPzogc3RyaW5nIHwgbnVsbCB9IHwgeyB0aXBvPzogc3RyaW5nIHwgbnVsbCB9W10gfCBudWxsO1xuICB9LFxuICBzbG90OiAndmlkZW8nIHwgJ2ltYWdlbicsXG4pOiBib29sZWFuIHtcbiAgY29uc3QgcmF3ID0gcm93Lm1lZGlhX2NvbnRlbnQ7XG4gIGNvbnN0IG1jID0gQXJyYXkuaXNBcnJheShyYXcpID8gcmF3WzBdIDogcmF3O1xuICBjb25zdCB0aXBvID0gU3RyaW5nKG1jPy50aXBvID8/ICcnKS50b0xvd2VyQ2FzZSgpO1xuICBpZiAodGlwbyA9PT0gJ2ltYWdlbicpIHJldHVybiBzbG90ID09PSAnaW1hZ2VuJztcbiAgcmV0dXJuIHNsb3QgPT09ICd2aWRlbyc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlUGxheWxpc3RBY3Rpb24oXG4gIGNvdXJ0S2V5OiBzdHJpbmcsXG4gIHZlbnVlTmFtZTogc3RyaW5nLFxuICBtZWRpYUlkczogc3RyaW5nW10sXG4gIHNsb3Q6ICd2aWRlbycgfCAnaW1hZ2VuJyxcbiAgZHVyU2Vjb25kczogbnVtYmVyLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgY2xlYW5WZW51ZU5hbWUgPSB2ZW51ZU5hbWUudHJpbSgpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoc3VwYWJhc2UsIGNvdXJ0S2V5LnRyaW0oKSk7XG4gICAgaWYgKCFyZXNvbHZlZC5vaykgcmV0dXJuIHJlc29sdmVkO1xuICAgIGNvbnN0IHsgc3RvcmFnZUlkOiBzdG9yYWdlQ2FuY2hhSWQsIHZhcmlhbnRzOiBjb3VydElkVmFyaWFudHMgfSA9IHJlc29sdmVkO1xuXG4gICAgLy8gMSkgUXVpdGFyIGZpbGFzIHlhIGV0aXF1ZXRhZGFzIGNvbiBlc3RlIHNsb3QgKG1pc21vIHZlbnVlIGV4YWN0byBxdWUgZWwgaW5zZXJ0KS5cbiAgICBjb25zdCB7IGVycm9yOiBkZWxTbG90RXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJylcbiAgICAgIC5kZWxldGUoKVxuICAgICAgLmluKCdjYW5jaGFfaWQnLCBjb3VydElkVmFyaWFudHMpXG4gICAgICAuZXEoJ3ZlbnVlX25hbWUnLCBjbGVhblZlbnVlTmFtZSlcbiAgICAgIC5lcSgncGxheWxpc3Rfc2xvdCcsIHNsb3QpO1xuXG4gICAgaWYgKGRlbFNsb3RFcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGFsIGJvcnJhciBwbGF5bGlzdCBwb3Igc2xvdDonLCBkZWxTbG90RXJyKTtcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGBBbCBsaW1waWFyIHBsYXlsaXN0OiAke2RlbFNsb3RFcnIubWVzc2FnZX1gIH07XG4gICAgfVxuXG4gICAgLy8gMikgUXVpdGFyIGZpbGFzIGxlZ2FjeSBxdWUgY29ycmVzcG9uZGFuIGEgZXN0ZSB0aXBvIGRlIG1lZGlvIChwbGF5bGlzdF9zbG90IGVzIE5PVCBOVUxMOyBudW5jYSBmdWUgTlVMTCkuXG4gICAgY29uc3QgeyBkYXRhOiBsZWdhY3lSb3dzLCBlcnJvcjogbGVnU2VsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJylcbiAgICAgIC5zZWxlY3QoJ2lkLCBtZWRpYV9jb250ZW50KHRpcG8pJylcbiAgICAgIC5pbignY2FuY2hhX2lkJywgY291cnRJZFZhcmlhbnRzKVxuICAgICAgLmVxKCd2ZW51ZV9uYW1lJywgY2xlYW5WZW51ZU5hbWUpXG4gICAgICAuZXEoJ3BsYXlsaXN0X3Nsb3QnLCAnbGVnYWN5Jyk7XG5cbiAgICBpZiAobGVnU2VsRXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBsaXN0YXIgbGVnYWN5IGNhbmNoYV9wdWJsaWNpZGFkOicsIGxlZ1NlbEVycik7XG4gICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBgQWwgbGltcGlhciBwbGF5bGlzdCBsZWdhY3k6ICR7bGVnU2VsRXJyLm1lc3NhZ2V9YCB9O1xuICAgIH1cblxuICAgIGNvbnN0IGxlZ2FjeUlkcyA9IChsZWdhY3lSb3dzIHx8IFtdKVxuICAgICAgLmZpbHRlcigocikgPT4gbGVnYWN5Um93TWF0Y2hlc1BsYXlsaXN0U2xvdChyLCBzbG90KSlcbiAgICAgIC5tYXAoKHIpID0+IHIuaWQpO1xuXG4gICAgaWYgKGxlZ2FjeUlkcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCB7IGVycm9yOiBkZWxMZWdFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJykuZGVsZXRlKCkuaW4oJ2lkJywgbGVnYWN5SWRzKTtcbiAgICAgIGlmIChkZWxMZWdFcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgYWwgYm9ycmFyIGZpbGFzIGxlZ2FjeTonLCBkZWxMZWdFcnIpO1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBgQWwgbGltcGlhciBwbGF5bGlzdCBhbnRpZ3VhOiAke2RlbExlZ0Vyci5tZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBvcmRlcmVkVW5pcXVlSWRzID0gKCgpID0+IHtcbiAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgIGNvbnN0IG91dDogc3RyaW5nW10gPSBbXTtcbiAgICAgIGZvciAoY29uc3QgaWQgb2YgbWVkaWFJZHMpIHtcbiAgICAgICAgY29uc3QgdCA9IFN0cmluZyhpZCB8fCAnJykudHJpbSgpO1xuICAgICAgICBpZiAoIXQgfHwgc2Vlbi5oYXModCkpIGNvbnRpbnVlO1xuICAgICAgICBzZWVuLmFkZCh0KTtcbiAgICAgICAgb3V0LnB1c2godCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH0pKCk7XG5cbiAgICBpZiAob3JkZXJlZFVuaXF1ZUlkcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBkdXJJbnQgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKE51bWJlcihkdXJTZWNvbmRzKSB8fCAxMCkpO1xuICAgICAgY29uc3Qgcm93cyA9IG9yZGVyZWRVbmlxdWVJZHMubWFwKChtaWQsIGkpID0+ICh7XG4gICAgICAgIGNhbmNoYV9pZDogc3RvcmFnZUNhbmNoYUlkLFxuICAgICAgICB2ZW51ZV9uYW1lOiBjbGVhblZlbnVlTmFtZSxcbiAgICAgICAgbWVkaWFfaWQ6IG1pZCxcbiAgICAgICAgb3JkZW46IGkgKyAxLFxuICAgICAgICBkdXJhY2lvbl9zZWd1bmRvczogZHVySW50LFxuICAgICAgICBwbGF5bGlzdF9zbG90OiBzbG90LFxuICAgICAgfSkpO1xuXG4gICAgICBjb25zdCB7IGVycm9yOiBpbnNFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJykuaW5zZXJ0KHJvd3MpO1xuICAgICAgaWYgKGluc0Vycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBpbnNlcnRhciBudWV2YSBwbGF5bGlzdDonLCBpbnNFcnIpO1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBpbnNFcnIubWVzc2FnZSB8fCAnRXJyb3IgYWwgZ3VhcmRhciBsYSBwbGF5bGlzdC4nIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBndWFyZGFyIHBsYXlsaXN0LicgfTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVRpcmFQbGF5bGlzdEFjdGlvbihcbiAgY291cnRLZXk6IHN0cmluZyxcbiAgdmVudWVOYW1lOiBzdHJpbmcsXG4gIHRpcmFJZHM6IHN0cmluZ1tdLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgY2xlYW5WZW51ZU5hbWUgPSB2ZW51ZU5hbWUudHJpbSgpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoc3VwYWJhc2UsIGNvdXJ0S2V5LnRyaW0oKSk7XG4gICAgaWYgKCFyZXNvbHZlZC5vaykgcmV0dXJuIHJlc29sdmVkO1xuICAgIGNvbnN0IHsgc3RvcmFnZUlkOiBzdG9yYWdlQ2FuY2hhSWQsIHZhcmlhbnRzOiBjb3VydElkVmFyaWFudHMgfSA9IHJlc29sdmVkO1xuXG4gICAgY29uc3QgeyBlcnJvcjogZGVsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV90aXJhJylcbiAgICAgIC5kZWxldGUoKVxuICAgICAgLmluKCdjYW5jaGFfaWQnLCBjb3VydElkVmFyaWFudHMpXG4gICAgICAuZXEoJ3ZlbnVlX25hbWUnLCBjbGVhblZlbnVlTmFtZSk7XG5cbiAgICBpZiAoZGVsRXJyKSByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBkZWxFcnIubWVzc2FnZSB8fCAnTm8gc2UgcHVkbyBsaW1waWFyIGxhIHRpcmEuJyB9O1xuXG4gICAgaWYgKHRpcmFJZHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3Qgcm93cyA9IHRpcmFJZHMubWFwKCh0aWQsIGkpID0+ICh7XG4gICAgICAgIGNhbmNoYV9pZDogc3RvcmFnZUNhbmNoYUlkLFxuICAgICAgICB2ZW51ZV9uYW1lOiBjbGVhblZlbnVlTmFtZSxcbiAgICAgICAgdGlyYV9pbmZvcm1hdGl2YV9pZDogdGlkLFxuICAgICAgICBvcmRlbjogaSArIDEsXG4gICAgICB9KSk7XG4gICAgICBjb25zdCB7IGVycm9yOiBpbnNFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV90aXJhJykuaW5zZXJ0KHJvd3MpO1xuICAgICAgaWYgKGluc0VycikgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogaW5zRXJyLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZ3VhcmRhciBsYSB0aXJhLicgfTtcbiAgICB9XG5cbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGd1YXJkYXIgdGlyYS4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwc2VydFBsYXlsaXN0Q29uZmlnQWN0aW9uKFxuICB2ZW51ZU5hbWU6IHN0cmluZyxcbiAgY2FuY2hhSWQ6IHN0cmluZyxcbiAgcGF0Y2g6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBzYWZlUGF0Y2ggPSBzYW5pdGl6ZVBsYXlsaXN0Q29uZmlnUGF0Y2gocGF0Y2gpO1xuICAgIGNvbnN0IHJlc29sdmVkID0gYXdhaXQgcmVzb2x2ZUNhbmNoYUlkRm9yUHVibGljaWRhZEZrKHN1cGFiYXNlLCBjYW5jaGFJZC50cmltKCkpO1xuICAgIGlmICghcmVzb2x2ZWQub2spIHJldHVybiByZXNvbHZlZDtcbiAgICBjb25zdCBzdG9yYWdlQ2FuY2hhSWQgPSByZXNvbHZlZC5zdG9yYWdlSWQ7XG4gICAgY29uc3QgaXNvID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbSgnY2FuY2hhX3BsYXlsaXN0X2NvbmZpZycpLnVwc2VydChcbiAgICAgIHtcbiAgICAgICAgdmVudWVfbmFtZTogdmVudWVOYW1lLnRyaW0oKSxcbiAgICAgICAgY2FuY2hhX2lkOiBzdG9yYWdlQ2FuY2hhSWQsXG4gICAgICAgIC4uLnNhZmVQYXRjaCxcbiAgICAgICAgdXBkYXRlZF9hdDogaXNvLFxuICAgICAgfSxcbiAgICAgIHsgb25Db25mbGljdDogJ3ZlbnVlX25hbWUsY2FuY2hhX2lkJyB9LFxuICAgICk7XG5cbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZ3VhcmRhciBsYSBjb25maWd1cmFjacOzbi4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBndWFyZGFyIGNvbmZpZ3VyYWNpw7NuLicgfTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBGZXRjaEFzc2lnbm1lbnRzT2sgPSB7XG4gIGFzc2lnbm1lbnRzOiB1bmtub3duW107XG4gIGNvbmZpZzogdW5rbm93bltdO1xuICB0aXJhczogdW5rbm93bltdO1xufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoQXNzaWdubWVudHNBY3Rpb24oXG4gIHZlbnVlTmFtZT86IHN0cmluZyxcbiAga2V5cz86IHN0cmluZ1tdLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gJiBGZXRjaEFzc2lnbm1lbnRzT2sgfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgdiA9IHZlbnVlTmFtZT8udHJpbSgpO1xuICB0cnkge1xuICAgIGxldCBxID0gc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdjYW5jaGFfcHVibGljaWRhZCcpXG4gICAgICAuc2VsZWN0KCdpZCwgY2FuY2hhX2lkLCB2ZW51ZV9uYW1lLCBtZWRpYV9pZCwgb3JkZW4sIGR1cmFjaW9uX3NlZ3VuZG9zLCBwbGF5bGlzdF9zbG90LCBtZWRpYV9jb250ZW50KCopJyk7XG5cbiAgICBpZiAodikgcSA9IHEuaWxpa2UoJ3ZlbnVlX25hbWUnLCB2KTtcbiAgICBpZiAoa2V5cyAmJiBrZXlzLmxlbmd0aCA+IDApIHEgPSBxLmluKCdjYW5jaGFfaWQnLCBrZXlzKTtcblxuICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHEub3JkZXIoJ29yZGVuJywgeyBhc2NlbmRpbmc6IHRydWUgfSk7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBmZXRjaEFzc2lnbm1lbnRzQWN0aW9uOicsIGVycm9yKTtcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZGllcm9uIGNhcmdhciBsYXMgYXNpZ25hY2lvbmVzLicgfTtcbiAgICB9XG5cbiAgICBjb25zdCBhc3NpZ25tZW50cyA9IChkYXRhIHx8IFtdKS5tYXAoKHI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgICAgLi4ucixcbiAgICAgIHZlbnVlX25hbWU6IFN0cmluZyhyLnZlbnVlX25hbWUgfHwgJycpLnRyaW0oKSxcbiAgICAgIGNhbmNoYV9pZDogbm9ybWFsaXplQ2FuY2hhSWRLZXkoU3RyaW5nKHIuY2FuY2hhX2lkIHx8ICcnKSksXG4gICAgfSkpO1xuXG4gICAgbGV0IHFDb25maWcgPSBzdXBhYmFzZS5mcm9tKCdjYW5jaGFfcGxheWxpc3RfY29uZmlnJykuc2VsZWN0KCcqJyk7XG4gICAgaWYgKHYpIHFDb25maWcgPSBxQ29uZmlnLmlsaWtlKCd2ZW51ZV9uYW1lJywgdik7XG4gICAgY29uc3QgeyBkYXRhOiBjb25maWcgfSA9IGF3YWl0IHFDb25maWc7XG5cbiAgICBsZXQgcVRpcmFzID0gc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdjYW5jaGFfdGlyYScpXG4gICAgICAuc2VsZWN0KCdjYW5jaGFfaWQsIHRpcmFfaW5mb3JtYXRpdmFfaWQsIG9yZGVuLCB2ZW51ZV9uYW1lJyk7XG4gICAgaWYgKHYpIHFUaXJhcyA9IHFUaXJhcy5pbGlrZSgndmVudWVfbmFtZScsIHYpO1xuICAgIGNvbnN0IHsgZGF0YTogdGlyYXMgfSA9IGF3YWl0IHFUaXJhcztcblxuICAgIGNvbnN0IGNvbmZpZ05vcm0gPSAoY29uZmlnIHx8IFtdKS5tYXAoKHI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgICAgLi4ucixcbiAgICAgIGNhbmNoYV9pZDogbm9ybWFsaXplQ2FuY2hhSWRLZXkoU3RyaW5nKHIuY2FuY2hhX2lkIHx8ICcnKSksXG4gICAgfSkpO1xuICAgIGNvbnN0IHRpcmFzTm9ybSA9ICh0aXJhcyB8fCBbXSkubWFwKChyOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gKHtcbiAgICAgIC4uLnIsXG4gICAgICBjYW5jaGFfaWQ6IG5vcm1hbGl6ZUNhbmNoYUlkS2V5KFN0cmluZyhyLmNhbmNoYV9pZCB8fCAnJykpLFxuICAgIH0pKTtcblxuICAgIHJldHVybiB7IG9rOiB0cnVlLCBhc3NpZ25tZW50cywgY29uZmlnOiBjb25maWdOb3JtLCB0aXJhczogdGlyYXNOb3JtIH07XG4gIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnRXJyb3IgYWwgY2FyZ2FyIGFzaWduYWNpb25lcy4nIH07XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiMFNBcUtzQiwrTEFBQSJ9
}),
"[project]/src/app/admin/publicidad/data:22cb4c [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "savePlaylistAction",
    ()=>$$RSC_SERVER_ACTION_5
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"7c74923beca990696eef0f4b402134dfbce06c6960":"savePlaylistAction"},"src/app/admin/publicidad/actions.ts",""] */ "use turbopack no side effects";
;
const $$RSC_SERVER_ACTION_5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("7c74923beca990696eef0f4b402134dfbce06c6960", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "savePlaylistAction");
;
 //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcic7XG5cbmltcG9ydCB0eXBlIHsgU3VwYWJhc2VDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnO1xuaW1wb3J0IHsgZ2V0U3VwYWJhc2VTZXJ2aWNlQ2xpZW50IH0gZnJvbSAnQC9saWIvc3VwYWJhc2Uvc2VydmVyJztcbmltcG9ydCB7IHJldmFsaWRhdGVQYXRoIH0gZnJvbSAnbmV4dC9jYWNoZSc7XG5pbXBvcnQge1xuICBjYW5jaGFJZENhbmRpZGF0ZXMsXG4gIGNhbmNoYUlkU3RvcmVkRm9yUHVibGljaWRhZFRhYmxlcyxcbiAgbm9ybWFsaXplQ2FuY2hhSWRLZXksXG59IGZyb20gJ0AvbGliL2NvdXJ0UGxheWxpc3RzJztcblxudHlwZSBFcnIgPSB7IG9rOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9O1xuXG5mdW5jdGlvbiBzZXJ2aWNlTWlzc2luZygpOiBFcnIge1xuICByZXR1cm4ge1xuICAgIG9rOiBmYWxzZSxcbiAgICBlcnJvcjpcbiAgICAgICdTZXJ2aWRvciBzaW4gY3JlZGVuY2lhbGVzIFN1cGFiYXNlLiBBw7FhZGUgU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSBlbiBWZXJjZWwgKEVudmlyb25tZW50IFZhcmlhYmxlcykgeSB2dWVsdmUgYSBkZXNwbGVnYXIuJyxcbiAgfTtcbn1cblxuLyoqIFNvbG8gZXN0YXMgY29sdW1uYXMgZXhpc3RlbiBlbiBjYW5jaGFfcGxheWxpc3RfY29uZmlnOyBlbCByZXN0byBzZSBpZ25vcmEgKGV2aXRhIHAuIGVqLiBzcGxpdF9yYXRpbyDihpIgSU5URUdFUikuICovXG5jb25zdCBQTEFZTElTVF9DT05GSUdfSU5UX0tFWVMgPSBbXG4gICd2aWRlb19jYW1iaW9fY2FkYV9taW51dG9zJyxcbiAgJ2ltYWdlbl9jYW1iaW9fY2FkYV9taW51dG9zJyxcbiAgJ3RpcmFfY2FtYmlvX2NhZGFfbWludXRvcycsXG4gICdpbWFnZW5fcGF1c2FfZW50cmVfc2VndW5kb3MnLFxuXSBhcyBjb25zdDtcblxuZnVuY3Rpb24gc2FuaXRpemVQbGF5bGlzdENvbmZpZ1BhdGNoKHBhdGNoOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICBmb3IgKGNvbnN0IGtleSBvZiBQTEFZTElTVF9DT05GSUdfSU5UX0tFWVMpIHtcbiAgICBpZiAoa2V5IGluIHBhdGNoICYmIHBhdGNoW2tleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgb3V0W2tleV0gPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKE51bWJlcihwYXRjaFtrZXldKSB8fCAwKSk7XG4gICAgfVxuICB9XG4gIGlmICgnaW1hZ2VuX2xvb3AnIGluIHBhdGNoICYmIHBhdGNoLmltYWdlbl9sb29wICE9PSB1bmRlZmluZWQpIHtcbiAgICBvdXQuaW1hZ2VuX2xvb3AgPSBCb29sZWFuKHBhdGNoLmltYWdlbl9sb29wKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIGBjYW5jaGFfcHVibGljaWRhZGAgKHkgc2ltaWxhcmVzKSB0aWVuZW4gRksgYSBgcHVibGljLmNhbmNoYXMoY2FuY2hhX2lkKWAuXG4gKiBFbiBwcm9kdWNjacOzbiBwdWVkZSBleGlzdGlyIGAxYCBvIGBjYW5jaGFfMWA7IGRlYmVtb3MgZXNjcmliaXIgZXhhY3RhbWVudGUgZWwgaWQgcXVlIHlhIGVzdMOhIChvIGNyZWFyIGBjYW5jaGFfTmAgcG9yIGRlZmVjdG8pLlxuICovXG5hc3luYyBmdW5jdGlvbiByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoXG4gIHN1cGFiYXNlOiBTdXBhYmFzZUNsaWVudCxcbiAgY291cnRLZXk6IHN0cmluZyxcbik6IFByb21pc2U8eyBvazogdHJ1ZTsgc3RvcmFnZUlkOiBzdHJpbmc7IHZhcmlhbnRzOiBzdHJpbmdbXSB9IHwgRXJyPiB7XG4gIGNvbnN0IGNhbm9uaWNhbCA9IG5vcm1hbGl6ZUNhbmNoYUlkS2V5KGNvdXJ0S2V5LnRyaW0oKSk7XG4gIGNvbnN0IHZhcmlhbnRzID0gY2FuY2hhSWRDYW5kaWRhdGVzKGNhbm9uaWNhbCk7XG4gIGlmICghdmFyaWFudHMubGVuZ3RoKSByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiAnQ2FuY2hhIGludsOhbGlkYS4nIH07XG4gIGNvbnN0IHByZWZlcnJlZCA9IGNhbmNoYUlkU3RvcmVkRm9yUHVibGljaWRhZFRhYmxlcyhjb3VydEtleS50cmltKCkpO1xuXG4gIC8vIEFsZ3VuYXMgaW5zdGFuY2lhcyBubyBleHBvbmVuIGBwdWJsaWMuY2FuY2hhc2AgbyBsYSBjb2x1bW5hIGBjYW5jaGFfaWRgIGVuIGxhIEFQSSAoY2FjaMOpIFBvc3RnUkVTVCAvIGVzcXVlbWEgZGlzdGludG8pLlxuICAvLyBFbiBlc2UgY2FzbyBzZWd1aW1vcyBzaW4gZmFsbGFyOiBlc2NyaWJpbW9zIGBjYW5jaGFfTmAgeSBsYXMgY29uc3VsdGFzIHVzYW4gYGNhbmNoYUlkQ2FuZGlkYXRlc2AuXG4gIGxldCBoaXRzOiB7IGNhbmNoYV9pZD86IHN0cmluZyB9W10gfCBudWxsID0gbnVsbDtcbiAgY29uc3QgeyBkYXRhOiBzZWxEYXRhLCBlcnJvcjogc2VsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKCdjYW5jaGFzJylcbiAgICAuc2VsZWN0KCdjYW5jaGFfaWQnKVxuICAgIC5pbignY2FuY2hhX2lkJywgdmFyaWFudHMpO1xuXG4gIGlmIChzZWxFcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1twdWJsaWNpZGFkXSBjYW5jaGFzIGxvb2t1cCBvbWl0aWRvOicsIHNlbEVyci5tZXNzYWdlKTtcbiAgfSBlbHNlIHtcbiAgICBoaXRzID0gc2VsRGF0YTtcbiAgfVxuXG4gIGNvbnN0IGV4aXN0aW5nID0gbmV3IFNldChcbiAgICAoaGl0cyB8fCBbXSkubWFwKChyKSA9PiBTdHJpbmcocj8uY2FuY2hhX2lkID8/ICcnKS50cmltKCkpLmZpbHRlcihCb29sZWFuKSxcbiAgKTtcbiAgaWYgKGV4aXN0aW5nLnNpemUgPiAwKSB7XG4gICAgY29uc3QgcGlja09yZGVyID0gW3ByZWZlcnJlZCwgLi4udmFyaWFudHMuZmlsdGVyKCh2KSA9PiB2ICE9PSBwcmVmZXJyZWQpXTtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIHBpY2tPcmRlcikge1xuICAgICAgaWYgKGV4aXN0aW5nLmhhcyhpZCkpIHJldHVybiB7IG9rOiB0cnVlLCBzdG9yYWdlSWQ6IGlkLCB2YXJpYW50cyB9O1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGlzbyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgY29uc3QgeyBlcnJvcjogdXBFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYXMnKS51cHNlcnQoXG4gICAgeyBjYW5jaGFfaWQ6IHByZWZlcnJlZCwgbGFzdF9zZWVuOiBudWxsLCB1cGRhdGVkX2F0OiBpc28gfSxcbiAgICB7IG9uQ29uZmxpY3Q6ICdjYW5jaGFfaWQnIH0sXG4gICk7XG4gIGlmICh1cEVycikge1xuICAgIGNvbnNvbGUud2FybignW3B1YmxpY2lkYWRdIGNhbmNoYXMgdXBzZXJ0IG9taXRpZG86JywgdXBFcnIubWVzc2FnZSk7XG4gIH1cbiAgcmV0dXJuIHsgb2s6IHRydWUsIHN0b3JhZ2VJZDogcHJlZmVycmVkLCB2YXJpYW50cyB9O1xufVxuXG4vKipcbiAqIExhcyBTZXJ2ZXIgQWN0aW9ucyBubyBkZWJlbiB1c2FyIHRocm93IGhhY2lhIGVsIGNsaWVudGUgZW4gcHJvZHVjY2nDs246XG4gKiBOZXh0LmpzIG9jdWx0YSBlbCBtZW5zYWplIHJlYWwuIERldm9sdmVtb3MgeyBvaywgZXJyb3IgfSBzaWVtcHJlLlxuICovXG5cbmZ1bmN0aW9uIHNhbml0aXplTWVkaWFDb250ZW50SW5zZXJ0KHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICBjb25zdCByb3cgPSB7IC4uLnBheWxvYWQgfTtcbiAgaWYgKHJvdy5kdXJhY2lvbl9zZWd1bmRvcyAhPSBudWxsICYmIHJvdy5kdXJhY2lvbl9zZWd1bmRvcyAhPT0gJycpIHtcbiAgICByb3cuZHVyYWNpb25fc2VndW5kb3MgPSBNYXRoLm1heCgwLCBNYXRoLnJvdW5kKE51bWJlcihyb3cuZHVyYWNpb25fc2VndW5kb3MpIHx8IDApKTtcbiAgfVxuICBpZiAocm93LmZpbGVfc2l6ZV9ieXRlcyAhPSBudWxsICYmIHJvdy5maWxlX3NpemVfYnl0ZXMgIT09ICcnKSB7XG4gICAgcm93LmZpbGVfc2l6ZV9ieXRlcyA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IoTnVtYmVyKHJvdy5maWxlX3NpemVfYnl0ZXMpIHx8IDApKTtcbiAgfVxuICByZXR1cm4gcm93O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkTWVkaWFDb250ZW50QWN0aW9uKFxuICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbik6IFByb21pc2U8eyBvazogdHJ1ZTsgZGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCByb3cgPSBzYW5pdGl6ZU1lZGlhQ29udGVudEluc2VydChwYXlsb2FkKTtcbiAgICBjb25zdCB7IGVycm9yLCBkYXRhIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdtZWRpYV9jb250ZW50JykuaW5zZXJ0KFtyb3ddKS5zZWxlY3QoKS5zaW5nbGUoKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gY3JlYXIgZWwgY29udGVuaWRvLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSwgZGF0YTogZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGNyZWFyIGNvbnRlbmlkby4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZU1lZGlhQWN0aW9uKGlkOiBzdHJpbmcpOiBQcm9taXNlPHsgb2s6IHRydWUgfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdtZWRpYV9jb250ZW50JykuZGVsZXRlKCkuZXEoJ2lkJywgaWQpO1xuICAgIGlmIChlcnJvcikgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAnTm8gc2UgcHVkbyBlbGltaW5hci4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBlbGltaW5hci4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbmFtZU1lZGlhQWN0aW9uKGlkOiBzdHJpbmcsIG5vbWJyZTogc3RyaW5nKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdtZWRpYV9jb250ZW50JylcbiAgICAgIC51cGRhdGUoeyBub21icmUsIG5vbWJyZV9zcG9uc29yOiBub21icmUucmVwbGFjZSgvXFwuW14vLl0rJC8sICcnKSB9KVxuICAgICAgLmVxKCdpZCcsIGlkKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gcmVub21icmFyLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIHJlbm9tYnJhci4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZFRpY2tlckFjdGlvbihtZW5zYWplOiBzdHJpbmcsIG9yZGVuOiBudW1iZXIpOiBQcm9taXNlPHsgb2s6IHRydWUgfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgY29uc3Qgb3JkZW5JbnQgPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKE51bWJlcihvcmRlbikgfHwgMCkpO1xuICB0cnkge1xuICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ3RpcmFfaW5mb3JtYXRpdmEnKS5pbnNlcnQoeyBtZW5zYWplLCBvcmRlbjogb3JkZW5JbnQsIGFjdGl2bzogdHJ1ZSB9KTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gYcOxYWRpciBlbCBtZW5zYWplLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGHDsWFkaXIgdGlyYS4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVRpY2tlckFjdGlvbihpZDogc3RyaW5nKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbSgndGlyYV9pbmZvcm1hdGl2YScpLmRlbGV0ZSgpLmVxKCdpZCcsIGlkKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZWxpbWluYXIgZWwgbWVuc2FqZS4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBlbGltaW5hciB0aXJhLicgfTtcbiAgfVxufVxuXG4vKiogRmlsYXMgYHBsYXlsaXN0X3Nsb3QgPSBsZWdhY3lgOiBkZWNpZGlyIHNpIHBlcnRlbmVjZW4gYWwgc2xvdCB2w61kZW8gbyBpbWFnZW4gKG1pc21hIHJlZ2xhIHF1ZSBgcGFydGl0aW9uUGxheWxpc3RSb3dzYCkuICovXG5mdW5jdGlvbiBsZWdhY3lSb3dNYXRjaGVzUGxheWxpc3RTbG90KFxuICByb3c6IHtcbiAgICBtZWRpYV9jb250ZW50PzogeyB0aXBvPzogc3RyaW5nIHwgbnVsbCB9IHwgeyB0aXBvPzogc3RyaW5nIHwgbnVsbCB9W10gfCBudWxsO1xuICB9LFxuICBzbG90OiAndmlkZW8nIHwgJ2ltYWdlbicsXG4pOiBib29sZWFuIHtcbiAgY29uc3QgcmF3ID0gcm93Lm1lZGlhX2NvbnRlbnQ7XG4gIGNvbnN0IG1jID0gQXJyYXkuaXNBcnJheShyYXcpID8gcmF3WzBdIDogcmF3O1xuICBjb25zdCB0aXBvID0gU3RyaW5nKG1jPy50aXBvID8/ICcnKS50b0xvd2VyQ2FzZSgpO1xuICBpZiAodGlwbyA9PT0gJ2ltYWdlbicpIHJldHVybiBzbG90ID09PSAnaW1hZ2VuJztcbiAgcmV0dXJuIHNsb3QgPT09ICd2aWRlbyc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlUGxheWxpc3RBY3Rpb24oXG4gIGNvdXJ0S2V5OiBzdHJpbmcsXG4gIHZlbnVlTmFtZTogc3RyaW5nLFxuICBtZWRpYUlkczogc3RyaW5nW10sXG4gIHNsb3Q6ICd2aWRlbycgfCAnaW1hZ2VuJyxcbiAgZHVyU2Vjb25kczogbnVtYmVyLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgY2xlYW5WZW51ZU5hbWUgPSB2ZW51ZU5hbWUudHJpbSgpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoc3VwYWJhc2UsIGNvdXJ0S2V5LnRyaW0oKSk7XG4gICAgaWYgKCFyZXNvbHZlZC5vaykgcmV0dXJuIHJlc29sdmVkO1xuICAgIGNvbnN0IHsgc3RvcmFnZUlkOiBzdG9yYWdlQ2FuY2hhSWQsIHZhcmlhbnRzOiBjb3VydElkVmFyaWFudHMgfSA9IHJlc29sdmVkO1xuXG4gICAgLy8gMSkgUXVpdGFyIGZpbGFzIHlhIGV0aXF1ZXRhZGFzIGNvbiBlc3RlIHNsb3QgKG1pc21vIHZlbnVlIGV4YWN0byBxdWUgZWwgaW5zZXJ0KS5cbiAgICBjb25zdCB7IGVycm9yOiBkZWxTbG90RXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJylcbiAgICAgIC5kZWxldGUoKVxuICAgICAgLmluKCdjYW5jaGFfaWQnLCBjb3VydElkVmFyaWFudHMpXG4gICAgICAuZXEoJ3ZlbnVlX25hbWUnLCBjbGVhblZlbnVlTmFtZSlcbiAgICAgIC5lcSgncGxheWxpc3Rfc2xvdCcsIHNsb3QpO1xuXG4gICAgaWYgKGRlbFNsb3RFcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGFsIGJvcnJhciBwbGF5bGlzdCBwb3Igc2xvdDonLCBkZWxTbG90RXJyKTtcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGBBbCBsaW1waWFyIHBsYXlsaXN0OiAke2RlbFNsb3RFcnIubWVzc2FnZX1gIH07XG4gICAgfVxuXG4gICAgLy8gMikgUXVpdGFyIGZpbGFzIGxlZ2FjeSBxdWUgY29ycmVzcG9uZGFuIGEgZXN0ZSB0aXBvIGRlIG1lZGlvIChwbGF5bGlzdF9zbG90IGVzIE5PVCBOVUxMOyBudW5jYSBmdWUgTlVMTCkuXG4gICAgY29uc3QgeyBkYXRhOiBsZWdhY3lSb3dzLCBlcnJvcjogbGVnU2VsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJylcbiAgICAgIC5zZWxlY3QoJ2lkLCBtZWRpYV9jb250ZW50KHRpcG8pJylcbiAgICAgIC5pbignY2FuY2hhX2lkJywgY291cnRJZFZhcmlhbnRzKVxuICAgICAgLmVxKCd2ZW51ZV9uYW1lJywgY2xlYW5WZW51ZU5hbWUpXG4gICAgICAuZXEoJ3BsYXlsaXN0X3Nsb3QnLCAnbGVnYWN5Jyk7XG5cbiAgICBpZiAobGVnU2VsRXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBsaXN0YXIgbGVnYWN5IGNhbmNoYV9wdWJsaWNpZGFkOicsIGxlZ1NlbEVycik7XG4gICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBgQWwgbGltcGlhciBwbGF5bGlzdCBsZWdhY3k6ICR7bGVnU2VsRXJyLm1lc3NhZ2V9YCB9O1xuICAgIH1cblxuICAgIGNvbnN0IGxlZ2FjeUlkcyA9IChsZWdhY3lSb3dzIHx8IFtdKVxuICAgICAgLmZpbHRlcigocikgPT4gbGVnYWN5Um93TWF0Y2hlc1BsYXlsaXN0U2xvdChyLCBzbG90KSlcbiAgICAgIC5tYXAoKHIpID0+IHIuaWQpO1xuXG4gICAgaWYgKGxlZ2FjeUlkcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCB7IGVycm9yOiBkZWxMZWdFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJykuZGVsZXRlKCkuaW4oJ2lkJywgbGVnYWN5SWRzKTtcbiAgICAgIGlmIChkZWxMZWdFcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgYWwgYm9ycmFyIGZpbGFzIGxlZ2FjeTonLCBkZWxMZWdFcnIpO1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBgQWwgbGltcGlhciBwbGF5bGlzdCBhbnRpZ3VhOiAke2RlbExlZ0Vyci5tZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBvcmRlcmVkVW5pcXVlSWRzID0gKCgpID0+IHtcbiAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgIGNvbnN0IG91dDogc3RyaW5nW10gPSBbXTtcbiAgICAgIGZvciAoY29uc3QgaWQgb2YgbWVkaWFJZHMpIHtcbiAgICAgICAgY29uc3QgdCA9IFN0cmluZyhpZCB8fCAnJykudHJpbSgpO1xuICAgICAgICBpZiAoIXQgfHwgc2Vlbi5oYXModCkpIGNvbnRpbnVlO1xuICAgICAgICBzZWVuLmFkZCh0KTtcbiAgICAgICAgb3V0LnB1c2godCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH0pKCk7XG5cbiAgICBpZiAob3JkZXJlZFVuaXF1ZUlkcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBkdXJJbnQgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKE51bWJlcihkdXJTZWNvbmRzKSB8fCAxMCkpO1xuICAgICAgY29uc3Qgcm93cyA9IG9yZGVyZWRVbmlxdWVJZHMubWFwKChtaWQsIGkpID0+ICh7XG4gICAgICAgIGNhbmNoYV9pZDogc3RvcmFnZUNhbmNoYUlkLFxuICAgICAgICB2ZW51ZV9uYW1lOiBjbGVhblZlbnVlTmFtZSxcbiAgICAgICAgbWVkaWFfaWQ6IG1pZCxcbiAgICAgICAgb3JkZW46IGkgKyAxLFxuICAgICAgICBkdXJhY2lvbl9zZWd1bmRvczogZHVySW50LFxuICAgICAgICBwbGF5bGlzdF9zbG90OiBzbG90LFxuICAgICAgfSkpO1xuXG4gICAgICBjb25zdCB7IGVycm9yOiBpbnNFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJykuaW5zZXJ0KHJvd3MpO1xuICAgICAgaWYgKGluc0Vycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBpbnNlcnRhciBudWV2YSBwbGF5bGlzdDonLCBpbnNFcnIpO1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBpbnNFcnIubWVzc2FnZSB8fCAnRXJyb3IgYWwgZ3VhcmRhciBsYSBwbGF5bGlzdC4nIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBndWFyZGFyIHBsYXlsaXN0LicgfTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVRpcmFQbGF5bGlzdEFjdGlvbihcbiAgY291cnRLZXk6IHN0cmluZyxcbiAgdmVudWVOYW1lOiBzdHJpbmcsXG4gIHRpcmFJZHM6IHN0cmluZ1tdLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgY2xlYW5WZW51ZU5hbWUgPSB2ZW51ZU5hbWUudHJpbSgpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoc3VwYWJhc2UsIGNvdXJ0S2V5LnRyaW0oKSk7XG4gICAgaWYgKCFyZXNvbHZlZC5vaykgcmV0dXJuIHJlc29sdmVkO1xuICAgIGNvbnN0IHsgc3RvcmFnZUlkOiBzdG9yYWdlQ2FuY2hhSWQsIHZhcmlhbnRzOiBjb3VydElkVmFyaWFudHMgfSA9IHJlc29sdmVkO1xuXG4gICAgY29uc3QgeyBlcnJvcjogZGVsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV90aXJhJylcbiAgICAgIC5kZWxldGUoKVxuICAgICAgLmluKCdjYW5jaGFfaWQnLCBjb3VydElkVmFyaWFudHMpXG4gICAgICAuZXEoJ3ZlbnVlX25hbWUnLCBjbGVhblZlbnVlTmFtZSk7XG5cbiAgICBpZiAoZGVsRXJyKSByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBkZWxFcnIubWVzc2FnZSB8fCAnTm8gc2UgcHVkbyBsaW1waWFyIGxhIHRpcmEuJyB9O1xuXG4gICAgaWYgKHRpcmFJZHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3Qgcm93cyA9IHRpcmFJZHMubWFwKCh0aWQsIGkpID0+ICh7XG4gICAgICAgIGNhbmNoYV9pZDogc3RvcmFnZUNhbmNoYUlkLFxuICAgICAgICB2ZW51ZV9uYW1lOiBjbGVhblZlbnVlTmFtZSxcbiAgICAgICAgdGlyYV9pbmZvcm1hdGl2YV9pZDogdGlkLFxuICAgICAgICBvcmRlbjogaSArIDEsXG4gICAgICB9KSk7XG4gICAgICBjb25zdCB7IGVycm9yOiBpbnNFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV90aXJhJykuaW5zZXJ0KHJvd3MpO1xuICAgICAgaWYgKGluc0VycikgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogaW5zRXJyLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZ3VhcmRhciBsYSB0aXJhLicgfTtcbiAgICB9XG5cbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGd1YXJkYXIgdGlyYS4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwc2VydFBsYXlsaXN0Q29uZmlnQWN0aW9uKFxuICB2ZW51ZU5hbWU6IHN0cmluZyxcbiAgY2FuY2hhSWQ6IHN0cmluZyxcbiAgcGF0Y2g6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBzYWZlUGF0Y2ggPSBzYW5pdGl6ZVBsYXlsaXN0Q29uZmlnUGF0Y2gocGF0Y2gpO1xuICAgIGNvbnN0IHJlc29sdmVkID0gYXdhaXQgcmVzb2x2ZUNhbmNoYUlkRm9yUHVibGljaWRhZEZrKHN1cGFiYXNlLCBjYW5jaGFJZC50cmltKCkpO1xuICAgIGlmICghcmVzb2x2ZWQub2spIHJldHVybiByZXNvbHZlZDtcbiAgICBjb25zdCBzdG9yYWdlQ2FuY2hhSWQgPSByZXNvbHZlZC5zdG9yYWdlSWQ7XG4gICAgY29uc3QgaXNvID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbSgnY2FuY2hhX3BsYXlsaXN0X2NvbmZpZycpLnVwc2VydChcbiAgICAgIHtcbiAgICAgICAgdmVudWVfbmFtZTogdmVudWVOYW1lLnRyaW0oKSxcbiAgICAgICAgY2FuY2hhX2lkOiBzdG9yYWdlQ2FuY2hhSWQsXG4gICAgICAgIC4uLnNhZmVQYXRjaCxcbiAgICAgICAgdXBkYXRlZF9hdDogaXNvLFxuICAgICAgfSxcbiAgICAgIHsgb25Db25mbGljdDogJ3ZlbnVlX25hbWUsY2FuY2hhX2lkJyB9LFxuICAgICk7XG5cbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZ3VhcmRhciBsYSBjb25maWd1cmFjacOzbi4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBndWFyZGFyIGNvbmZpZ3VyYWNpw7NuLicgfTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBGZXRjaEFzc2lnbm1lbnRzT2sgPSB7XG4gIGFzc2lnbm1lbnRzOiB1bmtub3duW107XG4gIGNvbmZpZzogdW5rbm93bltdO1xuICB0aXJhczogdW5rbm93bltdO1xufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoQXNzaWdubWVudHNBY3Rpb24oXG4gIHZlbnVlTmFtZT86IHN0cmluZyxcbiAga2V5cz86IHN0cmluZ1tdLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gJiBGZXRjaEFzc2lnbm1lbnRzT2sgfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgdiA9IHZlbnVlTmFtZT8udHJpbSgpO1xuICB0cnkge1xuICAgIGxldCBxID0gc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdjYW5jaGFfcHVibGljaWRhZCcpXG4gICAgICAuc2VsZWN0KCdpZCwgY2FuY2hhX2lkLCB2ZW51ZV9uYW1lLCBtZWRpYV9pZCwgb3JkZW4sIGR1cmFjaW9uX3NlZ3VuZG9zLCBwbGF5bGlzdF9zbG90LCBtZWRpYV9jb250ZW50KCopJyk7XG5cbiAgICBpZiAodikgcSA9IHEuaWxpa2UoJ3ZlbnVlX25hbWUnLCB2KTtcbiAgICBpZiAoa2V5cyAmJiBrZXlzLmxlbmd0aCA+IDApIHEgPSBxLmluKCdjYW5jaGFfaWQnLCBrZXlzKTtcblxuICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHEub3JkZXIoJ29yZGVuJywgeyBhc2NlbmRpbmc6IHRydWUgfSk7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBmZXRjaEFzc2lnbm1lbnRzQWN0aW9uOicsIGVycm9yKTtcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZGllcm9uIGNhcmdhciBsYXMgYXNpZ25hY2lvbmVzLicgfTtcbiAgICB9XG5cbiAgICBjb25zdCBhc3NpZ25tZW50cyA9IChkYXRhIHx8IFtdKS5tYXAoKHI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgICAgLi4ucixcbiAgICAgIHZlbnVlX25hbWU6IFN0cmluZyhyLnZlbnVlX25hbWUgfHwgJycpLnRyaW0oKSxcbiAgICAgIGNhbmNoYV9pZDogbm9ybWFsaXplQ2FuY2hhSWRLZXkoU3RyaW5nKHIuY2FuY2hhX2lkIHx8ICcnKSksXG4gICAgfSkpO1xuXG4gICAgbGV0IHFDb25maWcgPSBzdXBhYmFzZS5mcm9tKCdjYW5jaGFfcGxheWxpc3RfY29uZmlnJykuc2VsZWN0KCcqJyk7XG4gICAgaWYgKHYpIHFDb25maWcgPSBxQ29uZmlnLmlsaWtlKCd2ZW51ZV9uYW1lJywgdik7XG4gICAgY29uc3QgeyBkYXRhOiBjb25maWcgfSA9IGF3YWl0IHFDb25maWc7XG5cbiAgICBsZXQgcVRpcmFzID0gc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdjYW5jaGFfdGlyYScpXG4gICAgICAuc2VsZWN0KCdjYW5jaGFfaWQsIHRpcmFfaW5mb3JtYXRpdmFfaWQsIG9yZGVuLCB2ZW51ZV9uYW1lJyk7XG4gICAgaWYgKHYpIHFUaXJhcyA9IHFUaXJhcy5pbGlrZSgndmVudWVfbmFtZScsIHYpO1xuICAgIGNvbnN0IHsgZGF0YTogdGlyYXMgfSA9IGF3YWl0IHFUaXJhcztcblxuICAgIGNvbnN0IGNvbmZpZ05vcm0gPSAoY29uZmlnIHx8IFtdKS5tYXAoKHI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgICAgLi4ucixcbiAgICAgIGNhbmNoYV9pZDogbm9ybWFsaXplQ2FuY2hhSWRLZXkoU3RyaW5nKHIuY2FuY2hhX2lkIHx8ICcnKSksXG4gICAgfSkpO1xuICAgIGNvbnN0IHRpcmFzTm9ybSA9ICh0aXJhcyB8fCBbXSkubWFwKChyOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gKHtcbiAgICAgIC4uLnIsXG4gICAgICBjYW5jaGFfaWQ6IG5vcm1hbGl6ZUNhbmNoYUlkS2V5KFN0cmluZyhyLmNhbmNoYV9pZCB8fCAnJykpLFxuICAgIH0pKTtcblxuICAgIHJldHVybiB7IG9rOiB0cnVlLCBhc3NpZ25tZW50cywgY29uZmlnOiBjb25maWdOb3JtLCB0aXJhczogdGlyYXNOb3JtIH07XG4gIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnRXJyb3IgYWwgY2FyZ2FyIGFzaWduYWNpb25lcy4nIH07XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiMFNBZ01zQiwrTEFBQSJ9
}),
"[project]/src/app/admin/publicidad/data:d7b584 [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "saveTiraPlaylistAction",
    ()=>$$RSC_SERVER_ACTION_6
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"70c2caba043da5f5afaf103d26cfec3755df267290":"saveTiraPlaylistAction"},"src/app/admin/publicidad/actions.ts",""] */ "use turbopack no side effects";
;
const $$RSC_SERVER_ACTION_6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("70c2caba043da5f5afaf103d26cfec3755df267290", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "saveTiraPlaylistAction");
;
 //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcic7XG5cbmltcG9ydCB0eXBlIHsgU3VwYWJhc2VDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnO1xuaW1wb3J0IHsgZ2V0U3VwYWJhc2VTZXJ2aWNlQ2xpZW50IH0gZnJvbSAnQC9saWIvc3VwYWJhc2Uvc2VydmVyJztcbmltcG9ydCB7IHJldmFsaWRhdGVQYXRoIH0gZnJvbSAnbmV4dC9jYWNoZSc7XG5pbXBvcnQge1xuICBjYW5jaGFJZENhbmRpZGF0ZXMsXG4gIGNhbmNoYUlkU3RvcmVkRm9yUHVibGljaWRhZFRhYmxlcyxcbiAgbm9ybWFsaXplQ2FuY2hhSWRLZXksXG59IGZyb20gJ0AvbGliL2NvdXJ0UGxheWxpc3RzJztcblxudHlwZSBFcnIgPSB7IG9rOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9O1xuXG5mdW5jdGlvbiBzZXJ2aWNlTWlzc2luZygpOiBFcnIge1xuICByZXR1cm4ge1xuICAgIG9rOiBmYWxzZSxcbiAgICBlcnJvcjpcbiAgICAgICdTZXJ2aWRvciBzaW4gY3JlZGVuY2lhbGVzIFN1cGFiYXNlLiBBw7FhZGUgU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSBlbiBWZXJjZWwgKEVudmlyb25tZW50IFZhcmlhYmxlcykgeSB2dWVsdmUgYSBkZXNwbGVnYXIuJyxcbiAgfTtcbn1cblxuLyoqIFNvbG8gZXN0YXMgY29sdW1uYXMgZXhpc3RlbiBlbiBjYW5jaGFfcGxheWxpc3RfY29uZmlnOyBlbCByZXN0byBzZSBpZ25vcmEgKGV2aXRhIHAuIGVqLiBzcGxpdF9yYXRpbyDihpIgSU5URUdFUikuICovXG5jb25zdCBQTEFZTElTVF9DT05GSUdfSU5UX0tFWVMgPSBbXG4gICd2aWRlb19jYW1iaW9fY2FkYV9taW51dG9zJyxcbiAgJ2ltYWdlbl9jYW1iaW9fY2FkYV9taW51dG9zJyxcbiAgJ3RpcmFfY2FtYmlvX2NhZGFfbWludXRvcycsXG4gICdpbWFnZW5fcGF1c2FfZW50cmVfc2VndW5kb3MnLFxuXSBhcyBjb25zdDtcblxuZnVuY3Rpb24gc2FuaXRpemVQbGF5bGlzdENvbmZpZ1BhdGNoKHBhdGNoOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICBmb3IgKGNvbnN0IGtleSBvZiBQTEFZTElTVF9DT05GSUdfSU5UX0tFWVMpIHtcbiAgICBpZiAoa2V5IGluIHBhdGNoICYmIHBhdGNoW2tleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgb3V0W2tleV0gPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKE51bWJlcihwYXRjaFtrZXldKSB8fCAwKSk7XG4gICAgfVxuICB9XG4gIGlmICgnaW1hZ2VuX2xvb3AnIGluIHBhdGNoICYmIHBhdGNoLmltYWdlbl9sb29wICE9PSB1bmRlZmluZWQpIHtcbiAgICBvdXQuaW1hZ2VuX2xvb3AgPSBCb29sZWFuKHBhdGNoLmltYWdlbl9sb29wKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIGBjYW5jaGFfcHVibGljaWRhZGAgKHkgc2ltaWxhcmVzKSB0aWVuZW4gRksgYSBgcHVibGljLmNhbmNoYXMoY2FuY2hhX2lkKWAuXG4gKiBFbiBwcm9kdWNjacOzbiBwdWVkZSBleGlzdGlyIGAxYCBvIGBjYW5jaGFfMWA7IGRlYmVtb3MgZXNjcmliaXIgZXhhY3RhbWVudGUgZWwgaWQgcXVlIHlhIGVzdMOhIChvIGNyZWFyIGBjYW5jaGFfTmAgcG9yIGRlZmVjdG8pLlxuICovXG5hc3luYyBmdW5jdGlvbiByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoXG4gIHN1cGFiYXNlOiBTdXBhYmFzZUNsaWVudCxcbiAgY291cnRLZXk6IHN0cmluZyxcbik6IFByb21pc2U8eyBvazogdHJ1ZTsgc3RvcmFnZUlkOiBzdHJpbmc7IHZhcmlhbnRzOiBzdHJpbmdbXSB9IHwgRXJyPiB7XG4gIGNvbnN0IGNhbm9uaWNhbCA9IG5vcm1hbGl6ZUNhbmNoYUlkS2V5KGNvdXJ0S2V5LnRyaW0oKSk7XG4gIGNvbnN0IHZhcmlhbnRzID0gY2FuY2hhSWRDYW5kaWRhdGVzKGNhbm9uaWNhbCk7XG4gIGlmICghdmFyaWFudHMubGVuZ3RoKSByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiAnQ2FuY2hhIGludsOhbGlkYS4nIH07XG4gIGNvbnN0IHByZWZlcnJlZCA9IGNhbmNoYUlkU3RvcmVkRm9yUHVibGljaWRhZFRhYmxlcyhjb3VydEtleS50cmltKCkpO1xuXG4gIC8vIEFsZ3VuYXMgaW5zdGFuY2lhcyBubyBleHBvbmVuIGBwdWJsaWMuY2FuY2hhc2AgbyBsYSBjb2x1bW5hIGBjYW5jaGFfaWRgIGVuIGxhIEFQSSAoY2FjaMOpIFBvc3RnUkVTVCAvIGVzcXVlbWEgZGlzdGludG8pLlxuICAvLyBFbiBlc2UgY2FzbyBzZWd1aW1vcyBzaW4gZmFsbGFyOiBlc2NyaWJpbW9zIGBjYW5jaGFfTmAgeSBsYXMgY29uc3VsdGFzIHVzYW4gYGNhbmNoYUlkQ2FuZGlkYXRlc2AuXG4gIGxldCBoaXRzOiB7IGNhbmNoYV9pZD86IHN0cmluZyB9W10gfCBudWxsID0gbnVsbDtcbiAgY29uc3QgeyBkYXRhOiBzZWxEYXRhLCBlcnJvcjogc2VsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKCdjYW5jaGFzJylcbiAgICAuc2VsZWN0KCdjYW5jaGFfaWQnKVxuICAgIC5pbignY2FuY2hhX2lkJywgdmFyaWFudHMpO1xuXG4gIGlmIChzZWxFcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1twdWJsaWNpZGFkXSBjYW5jaGFzIGxvb2t1cCBvbWl0aWRvOicsIHNlbEVyci5tZXNzYWdlKTtcbiAgfSBlbHNlIHtcbiAgICBoaXRzID0gc2VsRGF0YTtcbiAgfVxuXG4gIGNvbnN0IGV4aXN0aW5nID0gbmV3IFNldChcbiAgICAoaGl0cyB8fCBbXSkubWFwKChyKSA9PiBTdHJpbmcocj8uY2FuY2hhX2lkID8/ICcnKS50cmltKCkpLmZpbHRlcihCb29sZWFuKSxcbiAgKTtcbiAgaWYgKGV4aXN0aW5nLnNpemUgPiAwKSB7XG4gICAgY29uc3QgcGlja09yZGVyID0gW3ByZWZlcnJlZCwgLi4udmFyaWFudHMuZmlsdGVyKCh2KSA9PiB2ICE9PSBwcmVmZXJyZWQpXTtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIHBpY2tPcmRlcikge1xuICAgICAgaWYgKGV4aXN0aW5nLmhhcyhpZCkpIHJldHVybiB7IG9rOiB0cnVlLCBzdG9yYWdlSWQ6IGlkLCB2YXJpYW50cyB9O1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGlzbyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgY29uc3QgeyBlcnJvcjogdXBFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYXMnKS51cHNlcnQoXG4gICAgeyBjYW5jaGFfaWQ6IHByZWZlcnJlZCwgbGFzdF9zZWVuOiBudWxsLCB1cGRhdGVkX2F0OiBpc28gfSxcbiAgICB7IG9uQ29uZmxpY3Q6ICdjYW5jaGFfaWQnIH0sXG4gICk7XG4gIGlmICh1cEVycikge1xuICAgIGNvbnNvbGUud2FybignW3B1YmxpY2lkYWRdIGNhbmNoYXMgdXBzZXJ0IG9taXRpZG86JywgdXBFcnIubWVzc2FnZSk7XG4gIH1cbiAgcmV0dXJuIHsgb2s6IHRydWUsIHN0b3JhZ2VJZDogcHJlZmVycmVkLCB2YXJpYW50cyB9O1xufVxuXG4vKipcbiAqIExhcyBTZXJ2ZXIgQWN0aW9ucyBubyBkZWJlbiB1c2FyIHRocm93IGhhY2lhIGVsIGNsaWVudGUgZW4gcHJvZHVjY2nDs246XG4gKiBOZXh0LmpzIG9jdWx0YSBlbCBtZW5zYWplIHJlYWwuIERldm9sdmVtb3MgeyBvaywgZXJyb3IgfSBzaWVtcHJlLlxuICovXG5cbmZ1bmN0aW9uIHNhbml0aXplTWVkaWFDb250ZW50SW5zZXJ0KHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICBjb25zdCByb3cgPSB7IC4uLnBheWxvYWQgfTtcbiAgaWYgKHJvdy5kdXJhY2lvbl9zZWd1bmRvcyAhPSBudWxsICYmIHJvdy5kdXJhY2lvbl9zZWd1bmRvcyAhPT0gJycpIHtcbiAgICByb3cuZHVyYWNpb25fc2VndW5kb3MgPSBNYXRoLm1heCgwLCBNYXRoLnJvdW5kKE51bWJlcihyb3cuZHVyYWNpb25fc2VndW5kb3MpIHx8IDApKTtcbiAgfVxuICBpZiAocm93LmZpbGVfc2l6ZV9ieXRlcyAhPSBudWxsICYmIHJvdy5maWxlX3NpemVfYnl0ZXMgIT09ICcnKSB7XG4gICAgcm93LmZpbGVfc2l6ZV9ieXRlcyA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IoTnVtYmVyKHJvdy5maWxlX3NpemVfYnl0ZXMpIHx8IDApKTtcbiAgfVxuICByZXR1cm4gcm93O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkTWVkaWFDb250ZW50QWN0aW9uKFxuICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbik6IFByb21pc2U8eyBvazogdHJ1ZTsgZGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCByb3cgPSBzYW5pdGl6ZU1lZGlhQ29udGVudEluc2VydChwYXlsb2FkKTtcbiAgICBjb25zdCB7IGVycm9yLCBkYXRhIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdtZWRpYV9jb250ZW50JykuaW5zZXJ0KFtyb3ddKS5zZWxlY3QoKS5zaW5nbGUoKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gY3JlYXIgZWwgY29udGVuaWRvLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSwgZGF0YTogZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGNyZWFyIGNvbnRlbmlkby4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZU1lZGlhQWN0aW9uKGlkOiBzdHJpbmcpOiBQcm9taXNlPHsgb2s6IHRydWUgfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdtZWRpYV9jb250ZW50JykuZGVsZXRlKCkuZXEoJ2lkJywgaWQpO1xuICAgIGlmIChlcnJvcikgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAnTm8gc2UgcHVkbyBlbGltaW5hci4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBlbGltaW5hci4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbmFtZU1lZGlhQWN0aW9uKGlkOiBzdHJpbmcsIG5vbWJyZTogc3RyaW5nKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdtZWRpYV9jb250ZW50JylcbiAgICAgIC51cGRhdGUoeyBub21icmUsIG5vbWJyZV9zcG9uc29yOiBub21icmUucmVwbGFjZSgvXFwuW14vLl0rJC8sICcnKSB9KVxuICAgICAgLmVxKCdpZCcsIGlkKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gcmVub21icmFyLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIHJlbm9tYnJhci4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZFRpY2tlckFjdGlvbihtZW5zYWplOiBzdHJpbmcsIG9yZGVuOiBudW1iZXIpOiBQcm9taXNlPHsgb2s6IHRydWUgfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgY29uc3Qgb3JkZW5JbnQgPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKE51bWJlcihvcmRlbikgfHwgMCkpO1xuICB0cnkge1xuICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ3RpcmFfaW5mb3JtYXRpdmEnKS5pbnNlcnQoeyBtZW5zYWplLCBvcmRlbjogb3JkZW5JbnQsIGFjdGl2bzogdHJ1ZSB9KTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gYcOxYWRpciBlbCBtZW5zYWplLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGHDsWFkaXIgdGlyYS4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVRpY2tlckFjdGlvbihpZDogc3RyaW5nKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbSgndGlyYV9pbmZvcm1hdGl2YScpLmRlbGV0ZSgpLmVxKCdpZCcsIGlkKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZWxpbWluYXIgZWwgbWVuc2FqZS4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBlbGltaW5hciB0aXJhLicgfTtcbiAgfVxufVxuXG4vKiogRmlsYXMgYHBsYXlsaXN0X3Nsb3QgPSBsZWdhY3lgOiBkZWNpZGlyIHNpIHBlcnRlbmVjZW4gYWwgc2xvdCB2w61kZW8gbyBpbWFnZW4gKG1pc21hIHJlZ2xhIHF1ZSBgcGFydGl0aW9uUGxheWxpc3RSb3dzYCkuICovXG5mdW5jdGlvbiBsZWdhY3lSb3dNYXRjaGVzUGxheWxpc3RTbG90KFxuICByb3c6IHtcbiAgICBtZWRpYV9jb250ZW50PzogeyB0aXBvPzogc3RyaW5nIHwgbnVsbCB9IHwgeyB0aXBvPzogc3RyaW5nIHwgbnVsbCB9W10gfCBudWxsO1xuICB9LFxuICBzbG90OiAndmlkZW8nIHwgJ2ltYWdlbicsXG4pOiBib29sZWFuIHtcbiAgY29uc3QgcmF3ID0gcm93Lm1lZGlhX2NvbnRlbnQ7XG4gIGNvbnN0IG1jID0gQXJyYXkuaXNBcnJheShyYXcpID8gcmF3WzBdIDogcmF3O1xuICBjb25zdCB0aXBvID0gU3RyaW5nKG1jPy50aXBvID8/ICcnKS50b0xvd2VyQ2FzZSgpO1xuICBpZiAodGlwbyA9PT0gJ2ltYWdlbicpIHJldHVybiBzbG90ID09PSAnaW1hZ2VuJztcbiAgcmV0dXJuIHNsb3QgPT09ICd2aWRlbyc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlUGxheWxpc3RBY3Rpb24oXG4gIGNvdXJ0S2V5OiBzdHJpbmcsXG4gIHZlbnVlTmFtZTogc3RyaW5nLFxuICBtZWRpYUlkczogc3RyaW5nW10sXG4gIHNsb3Q6ICd2aWRlbycgfCAnaW1hZ2VuJyxcbiAgZHVyU2Vjb25kczogbnVtYmVyLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgY2xlYW5WZW51ZU5hbWUgPSB2ZW51ZU5hbWUudHJpbSgpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoc3VwYWJhc2UsIGNvdXJ0S2V5LnRyaW0oKSk7XG4gICAgaWYgKCFyZXNvbHZlZC5vaykgcmV0dXJuIHJlc29sdmVkO1xuICAgIGNvbnN0IHsgc3RvcmFnZUlkOiBzdG9yYWdlQ2FuY2hhSWQsIHZhcmlhbnRzOiBjb3VydElkVmFyaWFudHMgfSA9IHJlc29sdmVkO1xuXG4gICAgLy8gMSkgUXVpdGFyIGZpbGFzIHlhIGV0aXF1ZXRhZGFzIGNvbiBlc3RlIHNsb3QgKG1pc21vIHZlbnVlIGV4YWN0byBxdWUgZWwgaW5zZXJ0KS5cbiAgICBjb25zdCB7IGVycm9yOiBkZWxTbG90RXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJylcbiAgICAgIC5kZWxldGUoKVxuICAgICAgLmluKCdjYW5jaGFfaWQnLCBjb3VydElkVmFyaWFudHMpXG4gICAgICAuZXEoJ3ZlbnVlX25hbWUnLCBjbGVhblZlbnVlTmFtZSlcbiAgICAgIC5lcSgncGxheWxpc3Rfc2xvdCcsIHNsb3QpO1xuXG4gICAgaWYgKGRlbFNsb3RFcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGFsIGJvcnJhciBwbGF5bGlzdCBwb3Igc2xvdDonLCBkZWxTbG90RXJyKTtcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGBBbCBsaW1waWFyIHBsYXlsaXN0OiAke2RlbFNsb3RFcnIubWVzc2FnZX1gIH07XG4gICAgfVxuXG4gICAgLy8gMikgUXVpdGFyIGZpbGFzIGxlZ2FjeSBxdWUgY29ycmVzcG9uZGFuIGEgZXN0ZSB0aXBvIGRlIG1lZGlvIChwbGF5bGlzdF9zbG90IGVzIE5PVCBOVUxMOyBudW5jYSBmdWUgTlVMTCkuXG4gICAgY29uc3QgeyBkYXRhOiBsZWdhY3lSb3dzLCBlcnJvcjogbGVnU2VsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJylcbiAgICAgIC5zZWxlY3QoJ2lkLCBtZWRpYV9jb250ZW50KHRpcG8pJylcbiAgICAgIC5pbignY2FuY2hhX2lkJywgY291cnRJZFZhcmlhbnRzKVxuICAgICAgLmVxKCd2ZW51ZV9uYW1lJywgY2xlYW5WZW51ZU5hbWUpXG4gICAgICAuZXEoJ3BsYXlsaXN0X3Nsb3QnLCAnbGVnYWN5Jyk7XG5cbiAgICBpZiAobGVnU2VsRXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBsaXN0YXIgbGVnYWN5IGNhbmNoYV9wdWJsaWNpZGFkOicsIGxlZ1NlbEVycik7XG4gICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBgQWwgbGltcGlhciBwbGF5bGlzdCBsZWdhY3k6ICR7bGVnU2VsRXJyLm1lc3NhZ2V9YCB9O1xuICAgIH1cblxuICAgIGNvbnN0IGxlZ2FjeUlkcyA9IChsZWdhY3lSb3dzIHx8IFtdKVxuICAgICAgLmZpbHRlcigocikgPT4gbGVnYWN5Um93TWF0Y2hlc1BsYXlsaXN0U2xvdChyLCBzbG90KSlcbiAgICAgIC5tYXAoKHIpID0+IHIuaWQpO1xuXG4gICAgaWYgKGxlZ2FjeUlkcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCB7IGVycm9yOiBkZWxMZWdFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJykuZGVsZXRlKCkuaW4oJ2lkJywgbGVnYWN5SWRzKTtcbiAgICAgIGlmIChkZWxMZWdFcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgYWwgYm9ycmFyIGZpbGFzIGxlZ2FjeTonLCBkZWxMZWdFcnIpO1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBgQWwgbGltcGlhciBwbGF5bGlzdCBhbnRpZ3VhOiAke2RlbExlZ0Vyci5tZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBvcmRlcmVkVW5pcXVlSWRzID0gKCgpID0+IHtcbiAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgIGNvbnN0IG91dDogc3RyaW5nW10gPSBbXTtcbiAgICAgIGZvciAoY29uc3QgaWQgb2YgbWVkaWFJZHMpIHtcbiAgICAgICAgY29uc3QgdCA9IFN0cmluZyhpZCB8fCAnJykudHJpbSgpO1xuICAgICAgICBpZiAoIXQgfHwgc2Vlbi5oYXModCkpIGNvbnRpbnVlO1xuICAgICAgICBzZWVuLmFkZCh0KTtcbiAgICAgICAgb3V0LnB1c2godCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH0pKCk7XG5cbiAgICBpZiAob3JkZXJlZFVuaXF1ZUlkcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBkdXJJbnQgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKE51bWJlcihkdXJTZWNvbmRzKSB8fCAxMCkpO1xuICAgICAgY29uc3Qgcm93cyA9IG9yZGVyZWRVbmlxdWVJZHMubWFwKChtaWQsIGkpID0+ICh7XG4gICAgICAgIGNhbmNoYV9pZDogc3RvcmFnZUNhbmNoYUlkLFxuICAgICAgICB2ZW51ZV9uYW1lOiBjbGVhblZlbnVlTmFtZSxcbiAgICAgICAgbWVkaWFfaWQ6IG1pZCxcbiAgICAgICAgb3JkZW46IGkgKyAxLFxuICAgICAgICBkdXJhY2lvbl9zZWd1bmRvczogZHVySW50LFxuICAgICAgICBwbGF5bGlzdF9zbG90OiBzbG90LFxuICAgICAgfSkpO1xuXG4gICAgICBjb25zdCB7IGVycm9yOiBpbnNFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJykuaW5zZXJ0KHJvd3MpO1xuICAgICAgaWYgKGluc0Vycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBpbnNlcnRhciBudWV2YSBwbGF5bGlzdDonLCBpbnNFcnIpO1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBpbnNFcnIubWVzc2FnZSB8fCAnRXJyb3IgYWwgZ3VhcmRhciBsYSBwbGF5bGlzdC4nIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBndWFyZGFyIHBsYXlsaXN0LicgfTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVRpcmFQbGF5bGlzdEFjdGlvbihcbiAgY291cnRLZXk6IHN0cmluZyxcbiAgdmVudWVOYW1lOiBzdHJpbmcsXG4gIHRpcmFJZHM6IHN0cmluZ1tdLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgY2xlYW5WZW51ZU5hbWUgPSB2ZW51ZU5hbWUudHJpbSgpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoc3VwYWJhc2UsIGNvdXJ0S2V5LnRyaW0oKSk7XG4gICAgaWYgKCFyZXNvbHZlZC5vaykgcmV0dXJuIHJlc29sdmVkO1xuICAgIGNvbnN0IHsgc3RvcmFnZUlkOiBzdG9yYWdlQ2FuY2hhSWQsIHZhcmlhbnRzOiBjb3VydElkVmFyaWFudHMgfSA9IHJlc29sdmVkO1xuXG4gICAgY29uc3QgeyBlcnJvcjogZGVsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV90aXJhJylcbiAgICAgIC5kZWxldGUoKVxuICAgICAgLmluKCdjYW5jaGFfaWQnLCBjb3VydElkVmFyaWFudHMpXG4gICAgICAuZXEoJ3ZlbnVlX25hbWUnLCBjbGVhblZlbnVlTmFtZSk7XG5cbiAgICBpZiAoZGVsRXJyKSByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBkZWxFcnIubWVzc2FnZSB8fCAnTm8gc2UgcHVkbyBsaW1waWFyIGxhIHRpcmEuJyB9O1xuXG4gICAgaWYgKHRpcmFJZHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3Qgcm93cyA9IHRpcmFJZHMubWFwKCh0aWQsIGkpID0+ICh7XG4gICAgICAgIGNhbmNoYV9pZDogc3RvcmFnZUNhbmNoYUlkLFxuICAgICAgICB2ZW51ZV9uYW1lOiBjbGVhblZlbnVlTmFtZSxcbiAgICAgICAgdGlyYV9pbmZvcm1hdGl2YV9pZDogdGlkLFxuICAgICAgICBvcmRlbjogaSArIDEsXG4gICAgICB9KSk7XG4gICAgICBjb25zdCB7IGVycm9yOiBpbnNFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV90aXJhJykuaW5zZXJ0KHJvd3MpO1xuICAgICAgaWYgKGluc0VycikgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogaW5zRXJyLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZ3VhcmRhciBsYSB0aXJhLicgfTtcbiAgICB9XG5cbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGd1YXJkYXIgdGlyYS4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwc2VydFBsYXlsaXN0Q29uZmlnQWN0aW9uKFxuICB2ZW51ZU5hbWU6IHN0cmluZyxcbiAgY2FuY2hhSWQ6IHN0cmluZyxcbiAgcGF0Y2g6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBzYWZlUGF0Y2ggPSBzYW5pdGl6ZVBsYXlsaXN0Q29uZmlnUGF0Y2gocGF0Y2gpO1xuICAgIGNvbnN0IHJlc29sdmVkID0gYXdhaXQgcmVzb2x2ZUNhbmNoYUlkRm9yUHVibGljaWRhZEZrKHN1cGFiYXNlLCBjYW5jaGFJZC50cmltKCkpO1xuICAgIGlmICghcmVzb2x2ZWQub2spIHJldHVybiByZXNvbHZlZDtcbiAgICBjb25zdCBzdG9yYWdlQ2FuY2hhSWQgPSByZXNvbHZlZC5zdG9yYWdlSWQ7XG4gICAgY29uc3QgaXNvID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbSgnY2FuY2hhX3BsYXlsaXN0X2NvbmZpZycpLnVwc2VydChcbiAgICAgIHtcbiAgICAgICAgdmVudWVfbmFtZTogdmVudWVOYW1lLnRyaW0oKSxcbiAgICAgICAgY2FuY2hhX2lkOiBzdG9yYWdlQ2FuY2hhSWQsXG4gICAgICAgIC4uLnNhZmVQYXRjaCxcbiAgICAgICAgdXBkYXRlZF9hdDogaXNvLFxuICAgICAgfSxcbiAgICAgIHsgb25Db25mbGljdDogJ3ZlbnVlX25hbWUsY2FuY2hhX2lkJyB9LFxuICAgICk7XG5cbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZ3VhcmRhciBsYSBjb25maWd1cmFjacOzbi4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBndWFyZGFyIGNvbmZpZ3VyYWNpw7NuLicgfTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBGZXRjaEFzc2lnbm1lbnRzT2sgPSB7XG4gIGFzc2lnbm1lbnRzOiB1bmtub3duW107XG4gIGNvbmZpZzogdW5rbm93bltdO1xuICB0aXJhczogdW5rbm93bltdO1xufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoQXNzaWdubWVudHNBY3Rpb24oXG4gIHZlbnVlTmFtZT86IHN0cmluZyxcbiAga2V5cz86IHN0cmluZ1tdLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gJiBGZXRjaEFzc2lnbm1lbnRzT2sgfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgdiA9IHZlbnVlTmFtZT8udHJpbSgpO1xuICB0cnkge1xuICAgIGxldCBxID0gc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdjYW5jaGFfcHVibGljaWRhZCcpXG4gICAgICAuc2VsZWN0KCdpZCwgY2FuY2hhX2lkLCB2ZW51ZV9uYW1lLCBtZWRpYV9pZCwgb3JkZW4sIGR1cmFjaW9uX3NlZ3VuZG9zLCBwbGF5bGlzdF9zbG90LCBtZWRpYV9jb250ZW50KCopJyk7XG5cbiAgICBpZiAodikgcSA9IHEuaWxpa2UoJ3ZlbnVlX25hbWUnLCB2KTtcbiAgICBpZiAoa2V5cyAmJiBrZXlzLmxlbmd0aCA+IDApIHEgPSBxLmluKCdjYW5jaGFfaWQnLCBrZXlzKTtcblxuICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHEub3JkZXIoJ29yZGVuJywgeyBhc2NlbmRpbmc6IHRydWUgfSk7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBmZXRjaEFzc2lnbm1lbnRzQWN0aW9uOicsIGVycm9yKTtcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZGllcm9uIGNhcmdhciBsYXMgYXNpZ25hY2lvbmVzLicgfTtcbiAgICB9XG5cbiAgICBjb25zdCBhc3NpZ25tZW50cyA9IChkYXRhIHx8IFtdKS5tYXAoKHI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgICAgLi4ucixcbiAgICAgIHZlbnVlX25hbWU6IFN0cmluZyhyLnZlbnVlX25hbWUgfHwgJycpLnRyaW0oKSxcbiAgICAgIGNhbmNoYV9pZDogbm9ybWFsaXplQ2FuY2hhSWRLZXkoU3RyaW5nKHIuY2FuY2hhX2lkIHx8ICcnKSksXG4gICAgfSkpO1xuXG4gICAgbGV0IHFDb25maWcgPSBzdXBhYmFzZS5mcm9tKCdjYW5jaGFfcGxheWxpc3RfY29uZmlnJykuc2VsZWN0KCcqJyk7XG4gICAgaWYgKHYpIHFDb25maWcgPSBxQ29uZmlnLmlsaWtlKCd2ZW51ZV9uYW1lJywgdik7XG4gICAgY29uc3QgeyBkYXRhOiBjb25maWcgfSA9IGF3YWl0IHFDb25maWc7XG5cbiAgICBsZXQgcVRpcmFzID0gc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdjYW5jaGFfdGlyYScpXG4gICAgICAuc2VsZWN0KCdjYW5jaGFfaWQsIHRpcmFfaW5mb3JtYXRpdmFfaWQsIG9yZGVuLCB2ZW51ZV9uYW1lJyk7XG4gICAgaWYgKHYpIHFUaXJhcyA9IHFUaXJhcy5pbGlrZSgndmVudWVfbmFtZScsIHYpO1xuICAgIGNvbnN0IHsgZGF0YTogdGlyYXMgfSA9IGF3YWl0IHFUaXJhcztcblxuICAgIGNvbnN0IGNvbmZpZ05vcm0gPSAoY29uZmlnIHx8IFtdKS5tYXAoKHI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgICAgLi4ucixcbiAgICAgIGNhbmNoYV9pZDogbm9ybWFsaXplQ2FuY2hhSWRLZXkoU3RyaW5nKHIuY2FuY2hhX2lkIHx8ICcnKSksXG4gICAgfSkpO1xuICAgIGNvbnN0IHRpcmFzTm9ybSA9ICh0aXJhcyB8fCBbXSkubWFwKChyOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gKHtcbiAgICAgIC4uLnIsXG4gICAgICBjYW5jaGFfaWQ6IG5vcm1hbGl6ZUNhbmNoYUlkS2V5KFN0cmluZyhyLmNhbmNoYV9pZCB8fCAnJykpLFxuICAgIH0pKTtcblxuICAgIHJldHVybiB7IG9rOiB0cnVlLCBhc3NpZ25tZW50cywgY29uZmlnOiBjb25maWdOb3JtLCB0aXJhczogdGlyYXNOb3JtIH07XG4gIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnRXJyb3IgYWwgY2FyZ2FyIGFzaWduYWNpb25lcy4nIH07XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOFNBNFJzQixtTUFBQSJ9
}),
"[project]/src/app/admin/publicidad/data:5bf49c [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "upsertPlaylistConfigAction",
    ()=>$$RSC_SERVER_ACTION_7
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"70a91e9c6ea07eb0a4df594c26a9312045c552a285":"upsertPlaylistConfigAction"},"src/app/admin/publicidad/actions.ts",""] */ "use turbopack no side effects";
;
const $$RSC_SERVER_ACTION_7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("70a91e9c6ea07eb0a4df594c26a9312045c552a285", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "upsertPlaylistConfigAction");
;
 //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcic7XG5cbmltcG9ydCB0eXBlIHsgU3VwYWJhc2VDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnO1xuaW1wb3J0IHsgZ2V0U3VwYWJhc2VTZXJ2aWNlQ2xpZW50IH0gZnJvbSAnQC9saWIvc3VwYWJhc2Uvc2VydmVyJztcbmltcG9ydCB7IHJldmFsaWRhdGVQYXRoIH0gZnJvbSAnbmV4dC9jYWNoZSc7XG5pbXBvcnQge1xuICBjYW5jaGFJZENhbmRpZGF0ZXMsXG4gIGNhbmNoYUlkU3RvcmVkRm9yUHVibGljaWRhZFRhYmxlcyxcbiAgbm9ybWFsaXplQ2FuY2hhSWRLZXksXG59IGZyb20gJ0AvbGliL2NvdXJ0UGxheWxpc3RzJztcblxudHlwZSBFcnIgPSB7IG9rOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9O1xuXG5mdW5jdGlvbiBzZXJ2aWNlTWlzc2luZygpOiBFcnIge1xuICByZXR1cm4ge1xuICAgIG9rOiBmYWxzZSxcbiAgICBlcnJvcjpcbiAgICAgICdTZXJ2aWRvciBzaW4gY3JlZGVuY2lhbGVzIFN1cGFiYXNlLiBBw7FhZGUgU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSBlbiBWZXJjZWwgKEVudmlyb25tZW50IFZhcmlhYmxlcykgeSB2dWVsdmUgYSBkZXNwbGVnYXIuJyxcbiAgfTtcbn1cblxuLyoqIFNvbG8gZXN0YXMgY29sdW1uYXMgZXhpc3RlbiBlbiBjYW5jaGFfcGxheWxpc3RfY29uZmlnOyBlbCByZXN0byBzZSBpZ25vcmEgKGV2aXRhIHAuIGVqLiBzcGxpdF9yYXRpbyDihpIgSU5URUdFUikuICovXG5jb25zdCBQTEFZTElTVF9DT05GSUdfSU5UX0tFWVMgPSBbXG4gICd2aWRlb19jYW1iaW9fY2FkYV9taW51dG9zJyxcbiAgJ2ltYWdlbl9jYW1iaW9fY2FkYV9taW51dG9zJyxcbiAgJ3RpcmFfY2FtYmlvX2NhZGFfbWludXRvcycsXG4gICdpbWFnZW5fcGF1c2FfZW50cmVfc2VndW5kb3MnLFxuXSBhcyBjb25zdDtcblxuZnVuY3Rpb24gc2FuaXRpemVQbGF5bGlzdENvbmZpZ1BhdGNoKHBhdGNoOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICBmb3IgKGNvbnN0IGtleSBvZiBQTEFZTElTVF9DT05GSUdfSU5UX0tFWVMpIHtcbiAgICBpZiAoa2V5IGluIHBhdGNoICYmIHBhdGNoW2tleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgb3V0W2tleV0gPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKE51bWJlcihwYXRjaFtrZXldKSB8fCAwKSk7XG4gICAgfVxuICB9XG4gIGlmICgnaW1hZ2VuX2xvb3AnIGluIHBhdGNoICYmIHBhdGNoLmltYWdlbl9sb29wICE9PSB1bmRlZmluZWQpIHtcbiAgICBvdXQuaW1hZ2VuX2xvb3AgPSBCb29sZWFuKHBhdGNoLmltYWdlbl9sb29wKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIGBjYW5jaGFfcHVibGljaWRhZGAgKHkgc2ltaWxhcmVzKSB0aWVuZW4gRksgYSBgcHVibGljLmNhbmNoYXMoY2FuY2hhX2lkKWAuXG4gKiBFbiBwcm9kdWNjacOzbiBwdWVkZSBleGlzdGlyIGAxYCBvIGBjYW5jaGFfMWA7IGRlYmVtb3MgZXNjcmliaXIgZXhhY3RhbWVudGUgZWwgaWQgcXVlIHlhIGVzdMOhIChvIGNyZWFyIGBjYW5jaGFfTmAgcG9yIGRlZmVjdG8pLlxuICovXG5hc3luYyBmdW5jdGlvbiByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoXG4gIHN1cGFiYXNlOiBTdXBhYmFzZUNsaWVudCxcbiAgY291cnRLZXk6IHN0cmluZyxcbik6IFByb21pc2U8eyBvazogdHJ1ZTsgc3RvcmFnZUlkOiBzdHJpbmc7IHZhcmlhbnRzOiBzdHJpbmdbXSB9IHwgRXJyPiB7XG4gIGNvbnN0IGNhbm9uaWNhbCA9IG5vcm1hbGl6ZUNhbmNoYUlkS2V5KGNvdXJ0S2V5LnRyaW0oKSk7XG4gIGNvbnN0IHZhcmlhbnRzID0gY2FuY2hhSWRDYW5kaWRhdGVzKGNhbm9uaWNhbCk7XG4gIGlmICghdmFyaWFudHMubGVuZ3RoKSByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiAnQ2FuY2hhIGludsOhbGlkYS4nIH07XG4gIGNvbnN0IHByZWZlcnJlZCA9IGNhbmNoYUlkU3RvcmVkRm9yUHVibGljaWRhZFRhYmxlcyhjb3VydEtleS50cmltKCkpO1xuXG4gIC8vIEFsZ3VuYXMgaW5zdGFuY2lhcyBubyBleHBvbmVuIGBwdWJsaWMuY2FuY2hhc2AgbyBsYSBjb2x1bW5hIGBjYW5jaGFfaWRgIGVuIGxhIEFQSSAoY2FjaMOpIFBvc3RnUkVTVCAvIGVzcXVlbWEgZGlzdGludG8pLlxuICAvLyBFbiBlc2UgY2FzbyBzZWd1aW1vcyBzaW4gZmFsbGFyOiBlc2NyaWJpbW9zIGBjYW5jaGFfTmAgeSBsYXMgY29uc3VsdGFzIHVzYW4gYGNhbmNoYUlkQ2FuZGlkYXRlc2AuXG4gIGxldCBoaXRzOiB7IGNhbmNoYV9pZD86IHN0cmluZyB9W10gfCBudWxsID0gbnVsbDtcbiAgY29uc3QgeyBkYXRhOiBzZWxEYXRhLCBlcnJvcjogc2VsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKCdjYW5jaGFzJylcbiAgICAuc2VsZWN0KCdjYW5jaGFfaWQnKVxuICAgIC5pbignY2FuY2hhX2lkJywgdmFyaWFudHMpO1xuXG4gIGlmIChzZWxFcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1twdWJsaWNpZGFkXSBjYW5jaGFzIGxvb2t1cCBvbWl0aWRvOicsIHNlbEVyci5tZXNzYWdlKTtcbiAgfSBlbHNlIHtcbiAgICBoaXRzID0gc2VsRGF0YTtcbiAgfVxuXG4gIGNvbnN0IGV4aXN0aW5nID0gbmV3IFNldChcbiAgICAoaGl0cyB8fCBbXSkubWFwKChyKSA9PiBTdHJpbmcocj8uY2FuY2hhX2lkID8/ICcnKS50cmltKCkpLmZpbHRlcihCb29sZWFuKSxcbiAgKTtcbiAgaWYgKGV4aXN0aW5nLnNpemUgPiAwKSB7XG4gICAgY29uc3QgcGlja09yZGVyID0gW3ByZWZlcnJlZCwgLi4udmFyaWFudHMuZmlsdGVyKCh2KSA9PiB2ICE9PSBwcmVmZXJyZWQpXTtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIHBpY2tPcmRlcikge1xuICAgICAgaWYgKGV4aXN0aW5nLmhhcyhpZCkpIHJldHVybiB7IG9rOiB0cnVlLCBzdG9yYWdlSWQ6IGlkLCB2YXJpYW50cyB9O1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGlzbyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgY29uc3QgeyBlcnJvcjogdXBFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYXMnKS51cHNlcnQoXG4gICAgeyBjYW5jaGFfaWQ6IHByZWZlcnJlZCwgbGFzdF9zZWVuOiBudWxsLCB1cGRhdGVkX2F0OiBpc28gfSxcbiAgICB7IG9uQ29uZmxpY3Q6ICdjYW5jaGFfaWQnIH0sXG4gICk7XG4gIGlmICh1cEVycikge1xuICAgIGNvbnNvbGUud2FybignW3B1YmxpY2lkYWRdIGNhbmNoYXMgdXBzZXJ0IG9taXRpZG86JywgdXBFcnIubWVzc2FnZSk7XG4gIH1cbiAgcmV0dXJuIHsgb2s6IHRydWUsIHN0b3JhZ2VJZDogcHJlZmVycmVkLCB2YXJpYW50cyB9O1xufVxuXG4vKipcbiAqIExhcyBTZXJ2ZXIgQWN0aW9ucyBubyBkZWJlbiB1c2FyIHRocm93IGhhY2lhIGVsIGNsaWVudGUgZW4gcHJvZHVjY2nDs246XG4gKiBOZXh0LmpzIG9jdWx0YSBlbCBtZW5zYWplIHJlYWwuIERldm9sdmVtb3MgeyBvaywgZXJyb3IgfSBzaWVtcHJlLlxuICovXG5cbmZ1bmN0aW9uIHNhbml0aXplTWVkaWFDb250ZW50SW5zZXJ0KHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICBjb25zdCByb3cgPSB7IC4uLnBheWxvYWQgfTtcbiAgaWYgKHJvdy5kdXJhY2lvbl9zZWd1bmRvcyAhPSBudWxsICYmIHJvdy5kdXJhY2lvbl9zZWd1bmRvcyAhPT0gJycpIHtcbiAgICByb3cuZHVyYWNpb25fc2VndW5kb3MgPSBNYXRoLm1heCgwLCBNYXRoLnJvdW5kKE51bWJlcihyb3cuZHVyYWNpb25fc2VndW5kb3MpIHx8IDApKTtcbiAgfVxuICBpZiAocm93LmZpbGVfc2l6ZV9ieXRlcyAhPSBudWxsICYmIHJvdy5maWxlX3NpemVfYnl0ZXMgIT09ICcnKSB7XG4gICAgcm93LmZpbGVfc2l6ZV9ieXRlcyA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IoTnVtYmVyKHJvdy5maWxlX3NpemVfYnl0ZXMpIHx8IDApKTtcbiAgfVxuICByZXR1cm4gcm93O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkTWVkaWFDb250ZW50QWN0aW9uKFxuICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbik6IFByb21pc2U8eyBvazogdHJ1ZTsgZGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCByb3cgPSBzYW5pdGl6ZU1lZGlhQ29udGVudEluc2VydChwYXlsb2FkKTtcbiAgICBjb25zdCB7IGVycm9yLCBkYXRhIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdtZWRpYV9jb250ZW50JykuaW5zZXJ0KFtyb3ddKS5zZWxlY3QoKS5zaW5nbGUoKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gY3JlYXIgZWwgY29udGVuaWRvLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSwgZGF0YTogZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGNyZWFyIGNvbnRlbmlkby4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZU1lZGlhQWN0aW9uKGlkOiBzdHJpbmcpOiBQcm9taXNlPHsgb2s6IHRydWUgfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdtZWRpYV9jb250ZW50JykuZGVsZXRlKCkuZXEoJ2lkJywgaWQpO1xuICAgIGlmIChlcnJvcikgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAnTm8gc2UgcHVkbyBlbGltaW5hci4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBlbGltaW5hci4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbmFtZU1lZGlhQWN0aW9uKGlkOiBzdHJpbmcsIG5vbWJyZTogc3RyaW5nKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdtZWRpYV9jb250ZW50JylcbiAgICAgIC51cGRhdGUoeyBub21icmUsIG5vbWJyZV9zcG9uc29yOiBub21icmUucmVwbGFjZSgvXFwuW14vLl0rJC8sICcnKSB9KVxuICAgICAgLmVxKCdpZCcsIGlkKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gcmVub21icmFyLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIHJlbm9tYnJhci4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZFRpY2tlckFjdGlvbihtZW5zYWplOiBzdHJpbmcsIG9yZGVuOiBudW1iZXIpOiBQcm9taXNlPHsgb2s6IHRydWUgfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgY29uc3Qgb3JkZW5JbnQgPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKE51bWJlcihvcmRlbikgfHwgMCkpO1xuICB0cnkge1xuICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ3RpcmFfaW5mb3JtYXRpdmEnKS5pbnNlcnQoeyBtZW5zYWplLCBvcmRlbjogb3JkZW5JbnQsIGFjdGl2bzogdHJ1ZSB9KTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gYcOxYWRpciBlbCBtZW5zYWplLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGHDsWFkaXIgdGlyYS4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVRpY2tlckFjdGlvbihpZDogc3RyaW5nKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbSgndGlyYV9pbmZvcm1hdGl2YScpLmRlbGV0ZSgpLmVxKCdpZCcsIGlkKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZWxpbWluYXIgZWwgbWVuc2FqZS4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBlbGltaW5hciB0aXJhLicgfTtcbiAgfVxufVxuXG4vKiogRmlsYXMgYHBsYXlsaXN0X3Nsb3QgPSBsZWdhY3lgOiBkZWNpZGlyIHNpIHBlcnRlbmVjZW4gYWwgc2xvdCB2w61kZW8gbyBpbWFnZW4gKG1pc21hIHJlZ2xhIHF1ZSBgcGFydGl0aW9uUGxheWxpc3RSb3dzYCkuICovXG5mdW5jdGlvbiBsZWdhY3lSb3dNYXRjaGVzUGxheWxpc3RTbG90KFxuICByb3c6IHtcbiAgICBtZWRpYV9jb250ZW50PzogeyB0aXBvPzogc3RyaW5nIHwgbnVsbCB9IHwgeyB0aXBvPzogc3RyaW5nIHwgbnVsbCB9W10gfCBudWxsO1xuICB9LFxuICBzbG90OiAndmlkZW8nIHwgJ2ltYWdlbicsXG4pOiBib29sZWFuIHtcbiAgY29uc3QgcmF3ID0gcm93Lm1lZGlhX2NvbnRlbnQ7XG4gIGNvbnN0IG1jID0gQXJyYXkuaXNBcnJheShyYXcpID8gcmF3WzBdIDogcmF3O1xuICBjb25zdCB0aXBvID0gU3RyaW5nKG1jPy50aXBvID8/ICcnKS50b0xvd2VyQ2FzZSgpO1xuICBpZiAodGlwbyA9PT0gJ2ltYWdlbicpIHJldHVybiBzbG90ID09PSAnaW1hZ2VuJztcbiAgcmV0dXJuIHNsb3QgPT09ICd2aWRlbyc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlUGxheWxpc3RBY3Rpb24oXG4gIGNvdXJ0S2V5OiBzdHJpbmcsXG4gIHZlbnVlTmFtZTogc3RyaW5nLFxuICBtZWRpYUlkczogc3RyaW5nW10sXG4gIHNsb3Q6ICd2aWRlbycgfCAnaW1hZ2VuJyxcbiAgZHVyU2Vjb25kczogbnVtYmVyLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgY2xlYW5WZW51ZU5hbWUgPSB2ZW51ZU5hbWUudHJpbSgpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoc3VwYWJhc2UsIGNvdXJ0S2V5LnRyaW0oKSk7XG4gICAgaWYgKCFyZXNvbHZlZC5vaykgcmV0dXJuIHJlc29sdmVkO1xuICAgIGNvbnN0IHsgc3RvcmFnZUlkOiBzdG9yYWdlQ2FuY2hhSWQsIHZhcmlhbnRzOiBjb3VydElkVmFyaWFudHMgfSA9IHJlc29sdmVkO1xuXG4gICAgLy8gMSkgUXVpdGFyIGZpbGFzIHlhIGV0aXF1ZXRhZGFzIGNvbiBlc3RlIHNsb3QgKG1pc21vIHZlbnVlIGV4YWN0byBxdWUgZWwgaW5zZXJ0KS5cbiAgICBjb25zdCB7IGVycm9yOiBkZWxTbG90RXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJylcbiAgICAgIC5kZWxldGUoKVxuICAgICAgLmluKCdjYW5jaGFfaWQnLCBjb3VydElkVmFyaWFudHMpXG4gICAgICAuZXEoJ3ZlbnVlX25hbWUnLCBjbGVhblZlbnVlTmFtZSlcbiAgICAgIC5lcSgncGxheWxpc3Rfc2xvdCcsIHNsb3QpO1xuXG4gICAgaWYgKGRlbFNsb3RFcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGFsIGJvcnJhciBwbGF5bGlzdCBwb3Igc2xvdDonLCBkZWxTbG90RXJyKTtcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGBBbCBsaW1waWFyIHBsYXlsaXN0OiAke2RlbFNsb3RFcnIubWVzc2FnZX1gIH07XG4gICAgfVxuXG4gICAgLy8gMikgUXVpdGFyIGZpbGFzIGxlZ2FjeSBxdWUgY29ycmVzcG9uZGFuIGEgZXN0ZSB0aXBvIGRlIG1lZGlvIChwbGF5bGlzdF9zbG90IGVzIE5PVCBOVUxMOyBudW5jYSBmdWUgTlVMTCkuXG4gICAgY29uc3QgeyBkYXRhOiBsZWdhY3lSb3dzLCBlcnJvcjogbGVnU2VsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJylcbiAgICAgIC5zZWxlY3QoJ2lkLCBtZWRpYV9jb250ZW50KHRpcG8pJylcbiAgICAgIC5pbignY2FuY2hhX2lkJywgY291cnRJZFZhcmlhbnRzKVxuICAgICAgLmVxKCd2ZW51ZV9uYW1lJywgY2xlYW5WZW51ZU5hbWUpXG4gICAgICAuZXEoJ3BsYXlsaXN0X3Nsb3QnLCAnbGVnYWN5Jyk7XG5cbiAgICBpZiAobGVnU2VsRXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBsaXN0YXIgbGVnYWN5IGNhbmNoYV9wdWJsaWNpZGFkOicsIGxlZ1NlbEVycik7XG4gICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBgQWwgbGltcGlhciBwbGF5bGlzdCBsZWdhY3k6ICR7bGVnU2VsRXJyLm1lc3NhZ2V9YCB9O1xuICAgIH1cblxuICAgIGNvbnN0IGxlZ2FjeUlkcyA9IChsZWdhY3lSb3dzIHx8IFtdKVxuICAgICAgLmZpbHRlcigocikgPT4gbGVnYWN5Um93TWF0Y2hlc1BsYXlsaXN0U2xvdChyLCBzbG90KSlcbiAgICAgIC5tYXAoKHIpID0+IHIuaWQpO1xuXG4gICAgaWYgKGxlZ2FjeUlkcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCB7IGVycm9yOiBkZWxMZWdFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJykuZGVsZXRlKCkuaW4oJ2lkJywgbGVnYWN5SWRzKTtcbiAgICAgIGlmIChkZWxMZWdFcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgYWwgYm9ycmFyIGZpbGFzIGxlZ2FjeTonLCBkZWxMZWdFcnIpO1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBgQWwgbGltcGlhciBwbGF5bGlzdCBhbnRpZ3VhOiAke2RlbExlZ0Vyci5tZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBvcmRlcmVkVW5pcXVlSWRzID0gKCgpID0+IHtcbiAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgIGNvbnN0IG91dDogc3RyaW5nW10gPSBbXTtcbiAgICAgIGZvciAoY29uc3QgaWQgb2YgbWVkaWFJZHMpIHtcbiAgICAgICAgY29uc3QgdCA9IFN0cmluZyhpZCB8fCAnJykudHJpbSgpO1xuICAgICAgICBpZiAoIXQgfHwgc2Vlbi5oYXModCkpIGNvbnRpbnVlO1xuICAgICAgICBzZWVuLmFkZCh0KTtcbiAgICAgICAgb3V0LnB1c2godCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH0pKCk7XG5cbiAgICBpZiAob3JkZXJlZFVuaXF1ZUlkcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBkdXJJbnQgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKE51bWJlcihkdXJTZWNvbmRzKSB8fCAxMCkpO1xuICAgICAgY29uc3Qgcm93cyA9IG9yZGVyZWRVbmlxdWVJZHMubWFwKChtaWQsIGkpID0+ICh7XG4gICAgICAgIGNhbmNoYV9pZDogc3RvcmFnZUNhbmNoYUlkLFxuICAgICAgICB2ZW51ZV9uYW1lOiBjbGVhblZlbnVlTmFtZSxcbiAgICAgICAgbWVkaWFfaWQ6IG1pZCxcbiAgICAgICAgb3JkZW46IGkgKyAxLFxuICAgICAgICBkdXJhY2lvbl9zZWd1bmRvczogZHVySW50LFxuICAgICAgICBwbGF5bGlzdF9zbG90OiBzbG90LFxuICAgICAgfSkpO1xuXG4gICAgICBjb25zdCB7IGVycm9yOiBpbnNFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJykuaW5zZXJ0KHJvd3MpO1xuICAgICAgaWYgKGluc0Vycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBpbnNlcnRhciBudWV2YSBwbGF5bGlzdDonLCBpbnNFcnIpO1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBpbnNFcnIubWVzc2FnZSB8fCAnRXJyb3IgYWwgZ3VhcmRhciBsYSBwbGF5bGlzdC4nIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBndWFyZGFyIHBsYXlsaXN0LicgfTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVRpcmFQbGF5bGlzdEFjdGlvbihcbiAgY291cnRLZXk6IHN0cmluZyxcbiAgdmVudWVOYW1lOiBzdHJpbmcsXG4gIHRpcmFJZHM6IHN0cmluZ1tdLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgY2xlYW5WZW51ZU5hbWUgPSB2ZW51ZU5hbWUudHJpbSgpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoc3VwYWJhc2UsIGNvdXJ0S2V5LnRyaW0oKSk7XG4gICAgaWYgKCFyZXNvbHZlZC5vaykgcmV0dXJuIHJlc29sdmVkO1xuICAgIGNvbnN0IHsgc3RvcmFnZUlkOiBzdG9yYWdlQ2FuY2hhSWQsIHZhcmlhbnRzOiBjb3VydElkVmFyaWFudHMgfSA9IHJlc29sdmVkO1xuXG4gICAgY29uc3QgeyBlcnJvcjogZGVsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV90aXJhJylcbiAgICAgIC5kZWxldGUoKVxuICAgICAgLmluKCdjYW5jaGFfaWQnLCBjb3VydElkVmFyaWFudHMpXG4gICAgICAuZXEoJ3ZlbnVlX25hbWUnLCBjbGVhblZlbnVlTmFtZSk7XG5cbiAgICBpZiAoZGVsRXJyKSByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBkZWxFcnIubWVzc2FnZSB8fCAnTm8gc2UgcHVkbyBsaW1waWFyIGxhIHRpcmEuJyB9O1xuXG4gICAgaWYgKHRpcmFJZHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3Qgcm93cyA9IHRpcmFJZHMubWFwKCh0aWQsIGkpID0+ICh7XG4gICAgICAgIGNhbmNoYV9pZDogc3RvcmFnZUNhbmNoYUlkLFxuICAgICAgICB2ZW51ZV9uYW1lOiBjbGVhblZlbnVlTmFtZSxcbiAgICAgICAgdGlyYV9pbmZvcm1hdGl2YV9pZDogdGlkLFxuICAgICAgICBvcmRlbjogaSArIDEsXG4gICAgICB9KSk7XG4gICAgICBjb25zdCB7IGVycm9yOiBpbnNFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV90aXJhJykuaW5zZXJ0KHJvd3MpO1xuICAgICAgaWYgKGluc0VycikgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogaW5zRXJyLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZ3VhcmRhciBsYSB0aXJhLicgfTtcbiAgICB9XG5cbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGd1YXJkYXIgdGlyYS4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwc2VydFBsYXlsaXN0Q29uZmlnQWN0aW9uKFxuICB2ZW51ZU5hbWU6IHN0cmluZyxcbiAgY2FuY2hhSWQ6IHN0cmluZyxcbiAgcGF0Y2g6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBzYWZlUGF0Y2ggPSBzYW5pdGl6ZVBsYXlsaXN0Q29uZmlnUGF0Y2gocGF0Y2gpO1xuICAgIGNvbnN0IHJlc29sdmVkID0gYXdhaXQgcmVzb2x2ZUNhbmNoYUlkRm9yUHVibGljaWRhZEZrKHN1cGFiYXNlLCBjYW5jaGFJZC50cmltKCkpO1xuICAgIGlmICghcmVzb2x2ZWQub2spIHJldHVybiByZXNvbHZlZDtcbiAgICBjb25zdCBzdG9yYWdlQ2FuY2hhSWQgPSByZXNvbHZlZC5zdG9yYWdlSWQ7XG4gICAgY29uc3QgaXNvID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbSgnY2FuY2hhX3BsYXlsaXN0X2NvbmZpZycpLnVwc2VydChcbiAgICAgIHtcbiAgICAgICAgdmVudWVfbmFtZTogdmVudWVOYW1lLnRyaW0oKSxcbiAgICAgICAgY2FuY2hhX2lkOiBzdG9yYWdlQ2FuY2hhSWQsXG4gICAgICAgIC4uLnNhZmVQYXRjaCxcbiAgICAgICAgdXBkYXRlZF9hdDogaXNvLFxuICAgICAgfSxcbiAgICAgIHsgb25Db25mbGljdDogJ3ZlbnVlX25hbWUsY2FuY2hhX2lkJyB9LFxuICAgICk7XG5cbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZ3VhcmRhciBsYSBjb25maWd1cmFjacOzbi4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBndWFyZGFyIGNvbmZpZ3VyYWNpw7NuLicgfTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBGZXRjaEFzc2lnbm1lbnRzT2sgPSB7XG4gIGFzc2lnbm1lbnRzOiB1bmtub3duW107XG4gIGNvbmZpZzogdW5rbm93bltdO1xuICB0aXJhczogdW5rbm93bltdO1xufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoQXNzaWdubWVudHNBY3Rpb24oXG4gIHZlbnVlTmFtZT86IHN0cmluZyxcbiAga2V5cz86IHN0cmluZ1tdLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gJiBGZXRjaEFzc2lnbm1lbnRzT2sgfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgdiA9IHZlbnVlTmFtZT8udHJpbSgpO1xuICB0cnkge1xuICAgIGxldCBxID0gc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdjYW5jaGFfcHVibGljaWRhZCcpXG4gICAgICAuc2VsZWN0KCdpZCwgY2FuY2hhX2lkLCB2ZW51ZV9uYW1lLCBtZWRpYV9pZCwgb3JkZW4sIGR1cmFjaW9uX3NlZ3VuZG9zLCBwbGF5bGlzdF9zbG90LCBtZWRpYV9jb250ZW50KCopJyk7XG5cbiAgICBpZiAodikgcSA9IHEuaWxpa2UoJ3ZlbnVlX25hbWUnLCB2KTtcbiAgICBpZiAoa2V5cyAmJiBrZXlzLmxlbmd0aCA+IDApIHEgPSBxLmluKCdjYW5jaGFfaWQnLCBrZXlzKTtcblxuICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHEub3JkZXIoJ29yZGVuJywgeyBhc2NlbmRpbmc6IHRydWUgfSk7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBmZXRjaEFzc2lnbm1lbnRzQWN0aW9uOicsIGVycm9yKTtcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZGllcm9uIGNhcmdhciBsYXMgYXNpZ25hY2lvbmVzLicgfTtcbiAgICB9XG5cbiAgICBjb25zdCBhc3NpZ25tZW50cyA9IChkYXRhIHx8IFtdKS5tYXAoKHI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgICAgLi4ucixcbiAgICAgIHZlbnVlX25hbWU6IFN0cmluZyhyLnZlbnVlX25hbWUgfHwgJycpLnRyaW0oKSxcbiAgICAgIGNhbmNoYV9pZDogbm9ybWFsaXplQ2FuY2hhSWRLZXkoU3RyaW5nKHIuY2FuY2hhX2lkIHx8ICcnKSksXG4gICAgfSkpO1xuXG4gICAgbGV0IHFDb25maWcgPSBzdXBhYmFzZS5mcm9tKCdjYW5jaGFfcGxheWxpc3RfY29uZmlnJykuc2VsZWN0KCcqJyk7XG4gICAgaWYgKHYpIHFDb25maWcgPSBxQ29uZmlnLmlsaWtlKCd2ZW51ZV9uYW1lJywgdik7XG4gICAgY29uc3QgeyBkYXRhOiBjb25maWcgfSA9IGF3YWl0IHFDb25maWc7XG5cbiAgICBsZXQgcVRpcmFzID0gc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdjYW5jaGFfdGlyYScpXG4gICAgICAuc2VsZWN0KCdjYW5jaGFfaWQsIHRpcmFfaW5mb3JtYXRpdmFfaWQsIG9yZGVuLCB2ZW51ZV9uYW1lJyk7XG4gICAgaWYgKHYpIHFUaXJhcyA9IHFUaXJhcy5pbGlrZSgndmVudWVfbmFtZScsIHYpO1xuICAgIGNvbnN0IHsgZGF0YTogdGlyYXMgfSA9IGF3YWl0IHFUaXJhcztcblxuICAgIGNvbnN0IGNvbmZpZ05vcm0gPSAoY29uZmlnIHx8IFtdKS5tYXAoKHI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgICAgLi4ucixcbiAgICAgIGNhbmNoYV9pZDogbm9ybWFsaXplQ2FuY2hhSWRLZXkoU3RyaW5nKHIuY2FuY2hhX2lkIHx8ICcnKSksXG4gICAgfSkpO1xuICAgIGNvbnN0IHRpcmFzTm9ybSA9ICh0aXJhcyB8fCBbXSkubWFwKChyOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gKHtcbiAgICAgIC4uLnIsXG4gICAgICBjYW5jaGFfaWQ6IG5vcm1hbGl6ZUNhbmNoYUlkS2V5KFN0cmluZyhyLmNhbmNoYV9pZCB8fCAnJykpLFxuICAgIH0pKTtcblxuICAgIHJldHVybiB7IG9rOiB0cnVlLCBhc3NpZ25tZW50cywgY29uZmlnOiBjb25maWdOb3JtLCB0aXJhczogdGlyYXNOb3JtIH07XG4gIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnRXJyb3IgYWwgY2FyZ2FyIGFzaWduYWNpb25lcy4nIH07XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoia1RBcVVzQix1TUFBQSJ9
}),
"[project]/src/app/admin/publicidad/data:0663b2 [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchAssignmentsAction",
    ()=>$$RSC_SERVER_ACTION_8
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"604b798fb887bee94c18b6cd9fd4333e6934847c80":"fetchAssignmentsAction"},"src/app/admin/publicidad/actions.ts",""] */ "use turbopack no side effects";
;
const $$RSC_SERVER_ACTION_8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("604b798fb887bee94c18b6cd9fd4333e6934847c80", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "fetchAssignmentsAction");
;
 //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcic7XG5cbmltcG9ydCB0eXBlIHsgU3VwYWJhc2VDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnO1xuaW1wb3J0IHsgZ2V0U3VwYWJhc2VTZXJ2aWNlQ2xpZW50IH0gZnJvbSAnQC9saWIvc3VwYWJhc2Uvc2VydmVyJztcbmltcG9ydCB7IHJldmFsaWRhdGVQYXRoIH0gZnJvbSAnbmV4dC9jYWNoZSc7XG5pbXBvcnQge1xuICBjYW5jaGFJZENhbmRpZGF0ZXMsXG4gIGNhbmNoYUlkU3RvcmVkRm9yUHVibGljaWRhZFRhYmxlcyxcbiAgbm9ybWFsaXplQ2FuY2hhSWRLZXksXG59IGZyb20gJ0AvbGliL2NvdXJ0UGxheWxpc3RzJztcblxudHlwZSBFcnIgPSB7IG9rOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9O1xuXG5mdW5jdGlvbiBzZXJ2aWNlTWlzc2luZygpOiBFcnIge1xuICByZXR1cm4ge1xuICAgIG9rOiBmYWxzZSxcbiAgICBlcnJvcjpcbiAgICAgICdTZXJ2aWRvciBzaW4gY3JlZGVuY2lhbGVzIFN1cGFiYXNlLiBBw7FhZGUgU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSBlbiBWZXJjZWwgKEVudmlyb25tZW50IFZhcmlhYmxlcykgeSB2dWVsdmUgYSBkZXNwbGVnYXIuJyxcbiAgfTtcbn1cblxuLyoqIFNvbG8gZXN0YXMgY29sdW1uYXMgZXhpc3RlbiBlbiBjYW5jaGFfcGxheWxpc3RfY29uZmlnOyBlbCByZXN0byBzZSBpZ25vcmEgKGV2aXRhIHAuIGVqLiBzcGxpdF9yYXRpbyDihpIgSU5URUdFUikuICovXG5jb25zdCBQTEFZTElTVF9DT05GSUdfSU5UX0tFWVMgPSBbXG4gICd2aWRlb19jYW1iaW9fY2FkYV9taW51dG9zJyxcbiAgJ2ltYWdlbl9jYW1iaW9fY2FkYV9taW51dG9zJyxcbiAgJ3RpcmFfY2FtYmlvX2NhZGFfbWludXRvcycsXG4gICdpbWFnZW5fcGF1c2FfZW50cmVfc2VndW5kb3MnLFxuXSBhcyBjb25zdDtcblxuZnVuY3Rpb24gc2FuaXRpemVQbGF5bGlzdENvbmZpZ1BhdGNoKHBhdGNoOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICBmb3IgKGNvbnN0IGtleSBvZiBQTEFZTElTVF9DT05GSUdfSU5UX0tFWVMpIHtcbiAgICBpZiAoa2V5IGluIHBhdGNoICYmIHBhdGNoW2tleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgb3V0W2tleV0gPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKE51bWJlcihwYXRjaFtrZXldKSB8fCAwKSk7XG4gICAgfVxuICB9XG4gIGlmICgnaW1hZ2VuX2xvb3AnIGluIHBhdGNoICYmIHBhdGNoLmltYWdlbl9sb29wICE9PSB1bmRlZmluZWQpIHtcbiAgICBvdXQuaW1hZ2VuX2xvb3AgPSBCb29sZWFuKHBhdGNoLmltYWdlbl9sb29wKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIGBjYW5jaGFfcHVibGljaWRhZGAgKHkgc2ltaWxhcmVzKSB0aWVuZW4gRksgYSBgcHVibGljLmNhbmNoYXMoY2FuY2hhX2lkKWAuXG4gKiBFbiBwcm9kdWNjacOzbiBwdWVkZSBleGlzdGlyIGAxYCBvIGBjYW5jaGFfMWA7IGRlYmVtb3MgZXNjcmliaXIgZXhhY3RhbWVudGUgZWwgaWQgcXVlIHlhIGVzdMOhIChvIGNyZWFyIGBjYW5jaGFfTmAgcG9yIGRlZmVjdG8pLlxuICovXG5hc3luYyBmdW5jdGlvbiByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoXG4gIHN1cGFiYXNlOiBTdXBhYmFzZUNsaWVudCxcbiAgY291cnRLZXk6IHN0cmluZyxcbik6IFByb21pc2U8eyBvazogdHJ1ZTsgc3RvcmFnZUlkOiBzdHJpbmc7IHZhcmlhbnRzOiBzdHJpbmdbXSB9IHwgRXJyPiB7XG4gIGNvbnN0IGNhbm9uaWNhbCA9IG5vcm1hbGl6ZUNhbmNoYUlkS2V5KGNvdXJ0S2V5LnRyaW0oKSk7XG4gIGNvbnN0IHZhcmlhbnRzID0gY2FuY2hhSWRDYW5kaWRhdGVzKGNhbm9uaWNhbCk7XG4gIGlmICghdmFyaWFudHMubGVuZ3RoKSByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiAnQ2FuY2hhIGludsOhbGlkYS4nIH07XG4gIGNvbnN0IHByZWZlcnJlZCA9IGNhbmNoYUlkU3RvcmVkRm9yUHVibGljaWRhZFRhYmxlcyhjb3VydEtleS50cmltKCkpO1xuXG4gIC8vIEFsZ3VuYXMgaW5zdGFuY2lhcyBubyBleHBvbmVuIGBwdWJsaWMuY2FuY2hhc2AgbyBsYSBjb2x1bW5hIGBjYW5jaGFfaWRgIGVuIGxhIEFQSSAoY2FjaMOpIFBvc3RnUkVTVCAvIGVzcXVlbWEgZGlzdGludG8pLlxuICAvLyBFbiBlc2UgY2FzbyBzZWd1aW1vcyBzaW4gZmFsbGFyOiBlc2NyaWJpbW9zIGBjYW5jaGFfTmAgeSBsYXMgY29uc3VsdGFzIHVzYW4gYGNhbmNoYUlkQ2FuZGlkYXRlc2AuXG4gIGxldCBoaXRzOiB7IGNhbmNoYV9pZD86IHN0cmluZyB9W10gfCBudWxsID0gbnVsbDtcbiAgY29uc3QgeyBkYXRhOiBzZWxEYXRhLCBlcnJvcjogc2VsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKCdjYW5jaGFzJylcbiAgICAuc2VsZWN0KCdjYW5jaGFfaWQnKVxuICAgIC5pbignY2FuY2hhX2lkJywgdmFyaWFudHMpO1xuXG4gIGlmIChzZWxFcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1twdWJsaWNpZGFkXSBjYW5jaGFzIGxvb2t1cCBvbWl0aWRvOicsIHNlbEVyci5tZXNzYWdlKTtcbiAgfSBlbHNlIHtcbiAgICBoaXRzID0gc2VsRGF0YTtcbiAgfVxuXG4gIGNvbnN0IGV4aXN0aW5nID0gbmV3IFNldChcbiAgICAoaGl0cyB8fCBbXSkubWFwKChyKSA9PiBTdHJpbmcocj8uY2FuY2hhX2lkID8/ICcnKS50cmltKCkpLmZpbHRlcihCb29sZWFuKSxcbiAgKTtcbiAgaWYgKGV4aXN0aW5nLnNpemUgPiAwKSB7XG4gICAgY29uc3QgcGlja09yZGVyID0gW3ByZWZlcnJlZCwgLi4udmFyaWFudHMuZmlsdGVyKCh2KSA9PiB2ICE9PSBwcmVmZXJyZWQpXTtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIHBpY2tPcmRlcikge1xuICAgICAgaWYgKGV4aXN0aW5nLmhhcyhpZCkpIHJldHVybiB7IG9rOiB0cnVlLCBzdG9yYWdlSWQ6IGlkLCB2YXJpYW50cyB9O1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGlzbyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgY29uc3QgeyBlcnJvcjogdXBFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYXMnKS51cHNlcnQoXG4gICAgeyBjYW5jaGFfaWQ6IHByZWZlcnJlZCwgbGFzdF9zZWVuOiBudWxsLCB1cGRhdGVkX2F0OiBpc28gfSxcbiAgICB7IG9uQ29uZmxpY3Q6ICdjYW5jaGFfaWQnIH0sXG4gICk7XG4gIGlmICh1cEVycikge1xuICAgIGNvbnNvbGUud2FybignW3B1YmxpY2lkYWRdIGNhbmNoYXMgdXBzZXJ0IG9taXRpZG86JywgdXBFcnIubWVzc2FnZSk7XG4gIH1cbiAgcmV0dXJuIHsgb2s6IHRydWUsIHN0b3JhZ2VJZDogcHJlZmVycmVkLCB2YXJpYW50cyB9O1xufVxuXG4vKipcbiAqIExhcyBTZXJ2ZXIgQWN0aW9ucyBubyBkZWJlbiB1c2FyIHRocm93IGhhY2lhIGVsIGNsaWVudGUgZW4gcHJvZHVjY2nDs246XG4gKiBOZXh0LmpzIG9jdWx0YSBlbCBtZW5zYWplIHJlYWwuIERldm9sdmVtb3MgeyBvaywgZXJyb3IgfSBzaWVtcHJlLlxuICovXG5cbmZ1bmN0aW9uIHNhbml0aXplTWVkaWFDb250ZW50SW5zZXJ0KHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICBjb25zdCByb3cgPSB7IC4uLnBheWxvYWQgfTtcbiAgaWYgKHJvdy5kdXJhY2lvbl9zZWd1bmRvcyAhPSBudWxsICYmIHJvdy5kdXJhY2lvbl9zZWd1bmRvcyAhPT0gJycpIHtcbiAgICByb3cuZHVyYWNpb25fc2VndW5kb3MgPSBNYXRoLm1heCgwLCBNYXRoLnJvdW5kKE51bWJlcihyb3cuZHVyYWNpb25fc2VndW5kb3MpIHx8IDApKTtcbiAgfVxuICBpZiAocm93LmZpbGVfc2l6ZV9ieXRlcyAhPSBudWxsICYmIHJvdy5maWxlX3NpemVfYnl0ZXMgIT09ICcnKSB7XG4gICAgcm93LmZpbGVfc2l6ZV9ieXRlcyA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IoTnVtYmVyKHJvdy5maWxlX3NpemVfYnl0ZXMpIHx8IDApKTtcbiAgfVxuICByZXR1cm4gcm93O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkTWVkaWFDb250ZW50QWN0aW9uKFxuICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbik6IFByb21pc2U8eyBvazogdHJ1ZTsgZGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCByb3cgPSBzYW5pdGl6ZU1lZGlhQ29udGVudEluc2VydChwYXlsb2FkKTtcbiAgICBjb25zdCB7IGVycm9yLCBkYXRhIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdtZWRpYV9jb250ZW50JykuaW5zZXJ0KFtyb3ddKS5zZWxlY3QoKS5zaW5nbGUoKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gY3JlYXIgZWwgY29udGVuaWRvLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSwgZGF0YTogZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGNyZWFyIGNvbnRlbmlkby4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZU1lZGlhQWN0aW9uKGlkOiBzdHJpbmcpOiBQcm9taXNlPHsgb2s6IHRydWUgfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdtZWRpYV9jb250ZW50JykuZGVsZXRlKCkuZXEoJ2lkJywgaWQpO1xuICAgIGlmIChlcnJvcikgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAnTm8gc2UgcHVkbyBlbGltaW5hci4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBlbGltaW5hci4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbmFtZU1lZGlhQWN0aW9uKGlkOiBzdHJpbmcsIG5vbWJyZTogc3RyaW5nKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdtZWRpYV9jb250ZW50JylcbiAgICAgIC51cGRhdGUoeyBub21icmUsIG5vbWJyZV9zcG9uc29yOiBub21icmUucmVwbGFjZSgvXFwuW14vLl0rJC8sICcnKSB9KVxuICAgICAgLmVxKCdpZCcsIGlkKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gcmVub21icmFyLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIHJlbm9tYnJhci4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZFRpY2tlckFjdGlvbihtZW5zYWplOiBzdHJpbmcsIG9yZGVuOiBudW1iZXIpOiBQcm9taXNlPHsgb2s6IHRydWUgfSB8IEVycj4ge1xuICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlU2VydmljZUNsaWVudCgpO1xuICBpZiAoIXN1cGFiYXNlKSByZXR1cm4gc2VydmljZU1pc3NpbmcoKTtcbiAgY29uc3Qgb3JkZW5JbnQgPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKE51bWJlcihvcmRlbikgfHwgMCkpO1xuICB0cnkge1xuICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ3RpcmFfaW5mb3JtYXRpdmEnKS5pbnNlcnQoeyBtZW5zYWplLCBvcmRlbjogb3JkZW5JbnQsIGFjdGl2bzogdHJ1ZSB9KTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gYcOxYWRpciBlbCBtZW5zYWplLicgfTtcbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGHDsWFkaXIgdGlyYS4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVRpY2tlckFjdGlvbihpZDogc3RyaW5nKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbSgndGlyYV9pbmZvcm1hdGl2YScpLmRlbGV0ZSgpLmVxKCdpZCcsIGlkKTtcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZWxpbWluYXIgZWwgbWVuc2FqZS4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBlbGltaW5hciB0aXJhLicgfTtcbiAgfVxufVxuXG4vKiogRmlsYXMgYHBsYXlsaXN0X3Nsb3QgPSBsZWdhY3lgOiBkZWNpZGlyIHNpIHBlcnRlbmVjZW4gYWwgc2xvdCB2w61kZW8gbyBpbWFnZW4gKG1pc21hIHJlZ2xhIHF1ZSBgcGFydGl0aW9uUGxheWxpc3RSb3dzYCkuICovXG5mdW5jdGlvbiBsZWdhY3lSb3dNYXRjaGVzUGxheWxpc3RTbG90KFxuICByb3c6IHtcbiAgICBtZWRpYV9jb250ZW50PzogeyB0aXBvPzogc3RyaW5nIHwgbnVsbCB9IHwgeyB0aXBvPzogc3RyaW5nIHwgbnVsbCB9W10gfCBudWxsO1xuICB9LFxuICBzbG90OiAndmlkZW8nIHwgJ2ltYWdlbicsXG4pOiBib29sZWFuIHtcbiAgY29uc3QgcmF3ID0gcm93Lm1lZGlhX2NvbnRlbnQ7XG4gIGNvbnN0IG1jID0gQXJyYXkuaXNBcnJheShyYXcpID8gcmF3WzBdIDogcmF3O1xuICBjb25zdCB0aXBvID0gU3RyaW5nKG1jPy50aXBvID8/ICcnKS50b0xvd2VyQ2FzZSgpO1xuICBpZiAodGlwbyA9PT0gJ2ltYWdlbicpIHJldHVybiBzbG90ID09PSAnaW1hZ2VuJztcbiAgcmV0dXJuIHNsb3QgPT09ICd2aWRlbyc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlUGxheWxpc3RBY3Rpb24oXG4gIGNvdXJ0S2V5OiBzdHJpbmcsXG4gIHZlbnVlTmFtZTogc3RyaW5nLFxuICBtZWRpYUlkczogc3RyaW5nW10sXG4gIHNsb3Q6ICd2aWRlbycgfCAnaW1hZ2VuJyxcbiAgZHVyU2Vjb25kczogbnVtYmVyLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgY2xlYW5WZW51ZU5hbWUgPSB2ZW51ZU5hbWUudHJpbSgpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoc3VwYWJhc2UsIGNvdXJ0S2V5LnRyaW0oKSk7XG4gICAgaWYgKCFyZXNvbHZlZC5vaykgcmV0dXJuIHJlc29sdmVkO1xuICAgIGNvbnN0IHsgc3RvcmFnZUlkOiBzdG9yYWdlQ2FuY2hhSWQsIHZhcmlhbnRzOiBjb3VydElkVmFyaWFudHMgfSA9IHJlc29sdmVkO1xuXG4gICAgLy8gMSkgUXVpdGFyIGZpbGFzIHlhIGV0aXF1ZXRhZGFzIGNvbiBlc3RlIHNsb3QgKG1pc21vIHZlbnVlIGV4YWN0byBxdWUgZWwgaW5zZXJ0KS5cbiAgICBjb25zdCB7IGVycm9yOiBkZWxTbG90RXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJylcbiAgICAgIC5kZWxldGUoKVxuICAgICAgLmluKCdjYW5jaGFfaWQnLCBjb3VydElkVmFyaWFudHMpXG4gICAgICAuZXEoJ3ZlbnVlX25hbWUnLCBjbGVhblZlbnVlTmFtZSlcbiAgICAgIC5lcSgncGxheWxpc3Rfc2xvdCcsIHNsb3QpO1xuXG4gICAgaWYgKGRlbFNsb3RFcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGFsIGJvcnJhciBwbGF5bGlzdCBwb3Igc2xvdDonLCBkZWxTbG90RXJyKTtcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGBBbCBsaW1waWFyIHBsYXlsaXN0OiAke2RlbFNsb3RFcnIubWVzc2FnZX1gIH07XG4gICAgfVxuXG4gICAgLy8gMikgUXVpdGFyIGZpbGFzIGxlZ2FjeSBxdWUgY29ycmVzcG9uZGFuIGEgZXN0ZSB0aXBvIGRlIG1lZGlvIChwbGF5bGlzdF9zbG90IGVzIE5PVCBOVUxMOyBudW5jYSBmdWUgTlVMTCkuXG4gICAgY29uc3QgeyBkYXRhOiBsZWdhY3lSb3dzLCBlcnJvcjogbGVnU2VsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJylcbiAgICAgIC5zZWxlY3QoJ2lkLCBtZWRpYV9jb250ZW50KHRpcG8pJylcbiAgICAgIC5pbignY2FuY2hhX2lkJywgY291cnRJZFZhcmlhbnRzKVxuICAgICAgLmVxKCd2ZW51ZV9uYW1lJywgY2xlYW5WZW51ZU5hbWUpXG4gICAgICAuZXEoJ3BsYXlsaXN0X3Nsb3QnLCAnbGVnYWN5Jyk7XG5cbiAgICBpZiAobGVnU2VsRXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBsaXN0YXIgbGVnYWN5IGNhbmNoYV9wdWJsaWNpZGFkOicsIGxlZ1NlbEVycik7XG4gICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBgQWwgbGltcGlhciBwbGF5bGlzdCBsZWdhY3k6ICR7bGVnU2VsRXJyLm1lc3NhZ2V9YCB9O1xuICAgIH1cblxuICAgIGNvbnN0IGxlZ2FjeUlkcyA9IChsZWdhY3lSb3dzIHx8IFtdKVxuICAgICAgLmZpbHRlcigocikgPT4gbGVnYWN5Um93TWF0Y2hlc1BsYXlsaXN0U2xvdChyLCBzbG90KSlcbiAgICAgIC5tYXAoKHIpID0+IHIuaWQpO1xuXG4gICAgaWYgKGxlZ2FjeUlkcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCB7IGVycm9yOiBkZWxMZWdFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJykuZGVsZXRlKCkuaW4oJ2lkJywgbGVnYWN5SWRzKTtcbiAgICAgIGlmIChkZWxMZWdFcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgYWwgYm9ycmFyIGZpbGFzIGxlZ2FjeTonLCBkZWxMZWdFcnIpO1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBgQWwgbGltcGlhciBwbGF5bGlzdCBhbnRpZ3VhOiAke2RlbExlZ0Vyci5tZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBvcmRlcmVkVW5pcXVlSWRzID0gKCgpID0+IHtcbiAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgIGNvbnN0IG91dDogc3RyaW5nW10gPSBbXTtcbiAgICAgIGZvciAoY29uc3QgaWQgb2YgbWVkaWFJZHMpIHtcbiAgICAgICAgY29uc3QgdCA9IFN0cmluZyhpZCB8fCAnJykudHJpbSgpO1xuICAgICAgICBpZiAoIXQgfHwgc2Vlbi5oYXModCkpIGNvbnRpbnVlO1xuICAgICAgICBzZWVuLmFkZCh0KTtcbiAgICAgICAgb3V0LnB1c2godCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH0pKCk7XG5cbiAgICBpZiAob3JkZXJlZFVuaXF1ZUlkcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBkdXJJbnQgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKE51bWJlcihkdXJTZWNvbmRzKSB8fCAxMCkpO1xuICAgICAgY29uc3Qgcm93cyA9IG9yZGVyZWRVbmlxdWVJZHMubWFwKChtaWQsIGkpID0+ICh7XG4gICAgICAgIGNhbmNoYV9pZDogc3RvcmFnZUNhbmNoYUlkLFxuICAgICAgICB2ZW51ZV9uYW1lOiBjbGVhblZlbnVlTmFtZSxcbiAgICAgICAgbWVkaWFfaWQ6IG1pZCxcbiAgICAgICAgb3JkZW46IGkgKyAxLFxuICAgICAgICBkdXJhY2lvbl9zZWd1bmRvczogZHVySW50LFxuICAgICAgICBwbGF5bGlzdF9zbG90OiBzbG90LFxuICAgICAgfSkpO1xuXG4gICAgICBjb25zdCB7IGVycm9yOiBpbnNFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV9wdWJsaWNpZGFkJykuaW5zZXJ0KHJvd3MpO1xuICAgICAgaWYgKGluc0Vycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBpbnNlcnRhciBudWV2YSBwbGF5bGlzdDonLCBpbnNFcnIpO1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBpbnNFcnIubWVzc2FnZSB8fCAnRXJyb3IgYWwgZ3VhcmRhciBsYSBwbGF5bGlzdC4nIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBndWFyZGFyIHBsYXlsaXN0LicgfTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVRpcmFQbGF5bGlzdEFjdGlvbihcbiAgY291cnRLZXk6IHN0cmluZyxcbiAgdmVudWVOYW1lOiBzdHJpbmcsXG4gIHRpcmFJZHM6IHN0cmluZ1tdLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgY2xlYW5WZW51ZU5hbWUgPSB2ZW51ZU5hbWUudHJpbSgpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCByZXNvbHZlQ2FuY2hhSWRGb3JQdWJsaWNpZGFkRmsoc3VwYWJhc2UsIGNvdXJ0S2V5LnRyaW0oKSk7XG4gICAgaWYgKCFyZXNvbHZlZC5vaykgcmV0dXJuIHJlc29sdmVkO1xuICAgIGNvbnN0IHsgc3RvcmFnZUlkOiBzdG9yYWdlQ2FuY2hhSWQsIHZhcmlhbnRzOiBjb3VydElkVmFyaWFudHMgfSA9IHJlc29sdmVkO1xuXG4gICAgY29uc3QgeyBlcnJvcjogZGVsRXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2NhbmNoYV90aXJhJylcbiAgICAgIC5kZWxldGUoKVxuICAgICAgLmluKCdjYW5jaGFfaWQnLCBjb3VydElkVmFyaWFudHMpXG4gICAgICAuZXEoJ3ZlbnVlX25hbWUnLCBjbGVhblZlbnVlTmFtZSk7XG5cbiAgICBpZiAoZGVsRXJyKSByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBkZWxFcnIubWVzc2FnZSB8fCAnTm8gc2UgcHVkbyBsaW1waWFyIGxhIHRpcmEuJyB9O1xuXG4gICAgaWYgKHRpcmFJZHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3Qgcm93cyA9IHRpcmFJZHMubWFwKCh0aWQsIGkpID0+ICh7XG4gICAgICAgIGNhbmNoYV9pZDogc3RvcmFnZUNhbmNoYUlkLFxuICAgICAgICB2ZW51ZV9uYW1lOiBjbGVhblZlbnVlTmFtZSxcbiAgICAgICAgdGlyYV9pbmZvcm1hdGl2YV9pZDogdGlkLFxuICAgICAgICBvcmRlbjogaSArIDEsXG4gICAgICB9KSk7XG4gICAgICBjb25zdCB7IGVycm9yOiBpbnNFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhbmNoYV90aXJhJykuaW5zZXJ0KHJvd3MpO1xuICAgICAgaWYgKGluc0VycikgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogaW5zRXJyLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZ3VhcmRhciBsYSB0aXJhLicgfTtcbiAgICB9XG5cbiAgICByZXZhbGlkYXRlUGF0aCgnL2FkbWluL3B1YmxpY2lkYWQnKTtcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0Vycm9yIGFsIGd1YXJkYXIgdGlyYS4nIH07XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwc2VydFBsYXlsaXN0Q29uZmlnQWN0aW9uKFxuICB2ZW51ZU5hbWU6IHN0cmluZyxcbiAgY2FuY2hhSWQ6IHN0cmluZyxcbiAgcGF0Y2g6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBzYWZlUGF0Y2ggPSBzYW5pdGl6ZVBsYXlsaXN0Q29uZmlnUGF0Y2gocGF0Y2gpO1xuICAgIGNvbnN0IHJlc29sdmVkID0gYXdhaXQgcmVzb2x2ZUNhbmNoYUlkRm9yUHVibGljaWRhZEZrKHN1cGFiYXNlLCBjYW5jaGFJZC50cmltKCkpO1xuICAgIGlmICghcmVzb2x2ZWQub2spIHJldHVybiByZXNvbHZlZDtcbiAgICBjb25zdCBzdG9yYWdlQ2FuY2hhSWQgPSByZXNvbHZlZC5zdG9yYWdlSWQ7XG4gICAgY29uc3QgaXNvID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbSgnY2FuY2hhX3BsYXlsaXN0X2NvbmZpZycpLnVwc2VydChcbiAgICAgIHtcbiAgICAgICAgdmVudWVfbmFtZTogdmVudWVOYW1lLnRyaW0oKSxcbiAgICAgICAgY2FuY2hhX2lkOiBzdG9yYWdlQ2FuY2hhSWQsXG4gICAgICAgIC4uLnNhZmVQYXRjaCxcbiAgICAgICAgdXBkYXRlZF9hdDogaXNvLFxuICAgICAgfSxcbiAgICAgIHsgb25Db25mbGljdDogJ3ZlbnVlX25hbWUsY2FuY2hhX2lkJyB9LFxuICAgICk7XG5cbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gZ3VhcmRhciBsYSBjb25maWd1cmFjacOzbi4nIH07XG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9hZG1pbi9wdWJsaWNpZGFkJyk7XG4gICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdFcnJvciBhbCBndWFyZGFyIGNvbmZpZ3VyYWNpw7NuLicgfTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBGZXRjaEFzc2lnbm1lbnRzT2sgPSB7XG4gIGFzc2lnbm1lbnRzOiB1bmtub3duW107XG4gIGNvbmZpZzogdW5rbm93bltdO1xuICB0aXJhczogdW5rbm93bltdO1xufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoQXNzaWdubWVudHNBY3Rpb24oXG4gIHZlbnVlTmFtZT86IHN0cmluZyxcbiAga2V5cz86IHN0cmluZ1tdLFxuKTogUHJvbWlzZTx7IG9rOiB0cnVlIH0gJiBGZXRjaEFzc2lnbm1lbnRzT2sgfCBFcnI+IHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBnZXRTdXBhYmFzZVNlcnZpY2VDbGllbnQoKTtcbiAgaWYgKCFzdXBhYmFzZSkgcmV0dXJuIHNlcnZpY2VNaXNzaW5nKCk7XG5cbiAgY29uc3QgdiA9IHZlbnVlTmFtZT8udHJpbSgpO1xuICB0cnkge1xuICAgIGxldCBxID0gc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdjYW5jaGFfcHVibGljaWRhZCcpXG4gICAgICAuc2VsZWN0KCdpZCwgY2FuY2hhX2lkLCB2ZW51ZV9uYW1lLCBtZWRpYV9pZCwgb3JkZW4sIGR1cmFjaW9uX3NlZ3VuZG9zLCBwbGF5bGlzdF9zbG90LCBtZWRpYV9jb250ZW50KCopJyk7XG5cbiAgICBpZiAodikgcSA9IHEuaWxpa2UoJ3ZlbnVlX25hbWUnLCB2KTtcbiAgICBpZiAoa2V5cyAmJiBrZXlzLmxlbmd0aCA+IDApIHEgPSBxLmluKCdjYW5jaGFfaWQnLCBrZXlzKTtcblxuICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHEub3JkZXIoJ29yZGVuJywgeyBhc2NlbmRpbmc6IHRydWUgfSk7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBmZXRjaEFzc2lnbm1lbnRzQWN0aW9uOicsIGVycm9yKTtcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZGllcm9uIGNhcmdhciBsYXMgYXNpZ25hY2lvbmVzLicgfTtcbiAgICB9XG5cbiAgICBjb25zdCBhc3NpZ25tZW50cyA9IChkYXRhIHx8IFtdKS5tYXAoKHI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgICAgLi4ucixcbiAgICAgIHZlbnVlX25hbWU6IFN0cmluZyhyLnZlbnVlX25hbWUgfHwgJycpLnRyaW0oKSxcbiAgICAgIGNhbmNoYV9pZDogbm9ybWFsaXplQ2FuY2hhSWRLZXkoU3RyaW5nKHIuY2FuY2hhX2lkIHx8ICcnKSksXG4gICAgfSkpO1xuXG4gICAgbGV0IHFDb25maWcgPSBzdXBhYmFzZS5mcm9tKCdjYW5jaGFfcGxheWxpc3RfY29uZmlnJykuc2VsZWN0KCcqJyk7XG4gICAgaWYgKHYpIHFDb25maWcgPSBxQ29uZmlnLmlsaWtlKCd2ZW51ZV9uYW1lJywgdik7XG4gICAgY29uc3QgeyBkYXRhOiBjb25maWcgfSA9IGF3YWl0IHFDb25maWc7XG5cbiAgICBsZXQgcVRpcmFzID0gc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdjYW5jaGFfdGlyYScpXG4gICAgICAuc2VsZWN0KCdjYW5jaGFfaWQsIHRpcmFfaW5mb3JtYXRpdmFfaWQsIG9yZGVuLCB2ZW51ZV9uYW1lJyk7XG4gICAgaWYgKHYpIHFUaXJhcyA9IHFUaXJhcy5pbGlrZSgndmVudWVfbmFtZScsIHYpO1xuICAgIGNvbnN0IHsgZGF0YTogdGlyYXMgfSA9IGF3YWl0IHFUaXJhcztcblxuICAgIGNvbnN0IGNvbmZpZ05vcm0gPSAoY29uZmlnIHx8IFtdKS5tYXAoKHI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgICAgLi4ucixcbiAgICAgIGNhbmNoYV9pZDogbm9ybWFsaXplQ2FuY2hhSWRLZXkoU3RyaW5nKHIuY2FuY2hhX2lkIHx8ICcnKSksXG4gICAgfSkpO1xuICAgIGNvbnN0IHRpcmFzTm9ybSA9ICh0aXJhcyB8fCBbXSkubWFwKChyOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gKHtcbiAgICAgIC4uLnIsXG4gICAgICBjYW5jaGFfaWQ6IG5vcm1hbGl6ZUNhbmNoYUlkS2V5KFN0cmluZyhyLmNhbmNoYV9pZCB8fCAnJykpLFxuICAgIH0pKTtcblxuICAgIHJldHVybiB7IG9rOiB0cnVlLCBhc3NpZ25tZW50cywgY29uZmlnOiBjb25maWdOb3JtLCB0aXJhczogdGlyYXNOb3JtIH07XG4gIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnRXJyb3IgYWwgY2FyZ2FyIGFzaWduYWNpb25lcy4nIH07XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOFNBNFdzQixtTUFBQSJ9
}),
"[project]/src/lib/driveDossier.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Extrae el ID de carpeta de Google Drive desde ID suelto o URL. */ __turbopack_context__.s([
    "driveDossierUrls",
    ()=>driveDossierUrls,
    "parseGoogleDriveFolderId",
    ()=>parseGoogleDriveFolderId
]);
function parseGoogleDriveFolderId(input) {
    const t = input.trim();
    if (!t) return null;
    if (/^[a-zA-Z0-9_-]{20,80}$/.test(t)) return t;
    const folders = /\/folders\/([a-zA-Z0-9_-]+)/.exec(t);
    if (folders?.[1]) return folders[1];
    const idParam = /[?&]id=([a-zA-Z0-9_-]+)/.exec(t);
    if (idParam?.[1]) return idParam[1];
    return null;
}
function driveDossierUrls(folderId) {
    const id = encodeURIComponent(folderId);
    return {
        open: `https://drive.google.com/drive/folders/${id}`,
        embed: `https://drive.google.com/embeddedfolderview?id=${id}`
    };
}
}),
"[project]/src/app/admin/publicidad/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminPublicidadPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/react-dropzone/dist/es/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$publicidad$2f$CourtCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/publicidad/CourtCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtPlaylists$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/courtPlaylists.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$venuesFromTournaments$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/venuesFromTournaments.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-ssr] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-ssr] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open.js [app-ssr] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-ssr] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/copy.js [app-ssr] (ecmascript) <export default as Copy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-ssr] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$line$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pen-line.js [app-ssr] (ecmascript) <export default as Edit3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/external-link.js [app-ssr] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-ssr] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder-open.js [app-ssr] (ecmascript) <export default as FolderOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panels$2d$top$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layout$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panels-top-left.js [app-ssr] (ecmascript) <export default as Layout>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$link$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Link2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/link-2.js [app-ssr] (ecmascript) <export default as Link2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/monitor.js [app-ssr] (ecmascript) <export default as Monitor>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/share-2.js [app-ssr] (ecmascript) <export default as Share2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-ssr] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-ssr] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$data$3a$364588__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/src/app/admin/publicidad/data:364588 [app-ssr] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$data$3a$822aa1__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/src/app/admin/publicidad/data:822aa1 [app-ssr] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$data$3a$a5f478__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/src/app/admin/publicidad/data:a5f478 [app-ssr] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$data$3a$c036d5__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/src/app/admin/publicidad/data:c036d5 [app-ssr] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$data$3a$0a472c__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/src/app/admin/publicidad/data:0a472c [app-ssr] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$data$3a$22cb4c__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/src/app/admin/publicidad/data:22cb4c [app-ssr] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$data$3a$d7b584__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/src/app/admin/publicidad/data:d7b584 [app-ssr] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$data$3a$5bf49c__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/src/app/admin/publicidad/data:5bf49c [app-ssr] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$data$3a$0663b2__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/src/app/admin/publicidad/data:0663b2 [app-ssr] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$driveDossier$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/driveDossier.ts [app-ssr] (ecmascript)");
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
const mb = (bytes)=>{
    if (!bytes || Number(bytes) <= 0) return '—';
    return `${(Number(bytes) / (1024 * 1024)).toFixed(1)} MB`;
};
/** `fetchAssignmentsAction` filtra sede con ilike en servidor; el listado por cancha debe alinear el criterio (mayúsculas/espacios). */ function adminPublicidadVenueMatches(rowVenue, selectedVenue) {
    return String(rowVenue || '').trim().toLowerCase() === String(selectedVenue || '').trim().toLowerCase();
}
function adminPublicidadCanchaMatches(rowCancha, courtKey) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtPlaylists$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeCanchaIdKey"])(rowCancha) === (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtPlaylists$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeCanchaIdKey"])(courtKey);
}
const isVideoFile = (f)=>f.type.startsWith('video/');
const isImageFile = (f)=>f.type.startsWith('image/');
function AdminPublicidadPage() {
    const { isAdmin, loading: authLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])(), []);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [previewUrl, setPreviewUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [mediaList, setMediaList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [tiraList, setTiraList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [nuevoTicker, setNuevoTicker] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [editingMediaId, setEditingMediaId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editingMediaName, setEditingMediaName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [venues, setVenues] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedVenue, setSelectedVenue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [assignments, setAssignments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [savingCourtKey, setSavingCourtKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    /** last_seen ISO por cancha_id (heartbeat desde pizarra) */ const [canchasHealth, setCanchasHealth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [tiraLinksByCourt, setTiraLinksByCourt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [playlistConfigByCourt, setPlaylistConfigByCourt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    /** Partido asignado en `pizarra_cancha_state` por cancha (misma fuente que la pizarra en TV). */ const [previewMatchByCourt, setPreviewMatchByCourt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    /** Dossier Google Drive (admin_settings.publicidad_dossier_drive_id) */ const [dossierDraft, setDossierDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [dossierFolderId, setDossierFolderId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [savingDossier, setSavingDossier] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [dossierCopied, setDossierCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!authLoading && !isAdmin) router.push('/');
    }, [
        authLoading,
        isAdmin,
        router
    ]);
    const fetchMedia = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        const { data, error } = await supabase.from('media_content').select('*').order('created_at', {
            ascending: false
        });
        if (error) throw error;
        setMediaList(data || []);
    }, [
        supabase
    ]);
    const fetchTicker = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        const { data, error } = await supabase.from('tira_informativa').select('*').order('orden', {
            ascending: true
        });
        if (error) throw error;
        setTiraList(data || []);
    }, [
        supabase
    ]);
    const loadVenuesAndCourts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        const all = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].listAllTournaments();
        const list = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$venuesFromTournaments$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildVenuesAndCourtsFromTournaments"])(all || []);
        setVenues(list);
        if (!selectedVenue && list.length > 0) setSelectedVenue(list[0].name);
    }, [
        selectedVenue
    ]);
    const selectedVenueCourts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const want = String(selectedVenue || '').trim().toLowerCase();
        if (!want) return [];
        return venues.find((v)=>v.name.trim().toLowerCase() === want)?.courts ?? [];
    }, [
        venues,
        selectedVenue
    ]);
    const selectedVenueMonitorHref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const want = String(selectedVenue || '').trim().toLowerCase();
        if (!want) return null;
        const tid = venues.find((v)=>v.name.trim().toLowerCase() === want)?.tournamentId?.trim();
        return tid ? `/tournaments/${tid}/monitor` : null;
    }, [
        venues,
        selectedVenue
    ]);
    const courtKeySet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>new Set(selectedVenueCourts.map((c)=>c.key)), [
        selectedVenueCourts
    ]);
    const fetchAssignments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (!selectedVenue) return;
        const keys = selectedVenueCourts.map((c)=>String(c.key).trim());
        try {
            const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$data$3a$0663b2__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["fetchAssignmentsAction"])(selectedVenue);
            if (!res.ok) {
                console.error('fetchAssignmentsAction:', res.error);
                return;
            }
            const { assignments: data, config, tiras } = res;
            const filtered = (data || []).map((r)=>{
                const mc = r.media_content;
                const media_content = Array.isArray(mc) ? mc[0] ?? null : mc ?? null;
                return {
                    id: String(r.id),
                    cancha_id: String(r.cancha_id || '').trim(),
                    venue_name: String(r.venue_name || '').trim(),
                    orden: Number(r.orden),
                    duracion_segundos: Number(r.duracion_segundos),
                    playlist_slot: r.playlist_slot ?? undefined,
                    media_content
                };
            });
            setAssignments(filtered);
            const tmap = {};
            keys.forEach((k)=>{
                tmap[k] = [];
            });
            (tiras || []).forEach((row)=>{
                const cid = (row.cancha_id || '').trim();
                if (tmap[cid]) {
                    tmap[cid].push(row.tira_informativa_id);
                }
            });
            setTiraLinksByCourt(tmap);
            const cmap = {};
            (config || []).forEach((r)=>{
                const cid = (r.cancha_id || '').trim();
                cmap[cid] = {
                    imagen_loop: r.imagen_loop !== false,
                    imagen_pausa_entre_segundos: Math.max(0, Math.floor(Number(r.imagen_pausa_entre_segundos) || 0)),
                    video_cambio_cada_minutos: Math.max(0, Math.floor(Number(r.video_cambio_cada_minutos) || 0)),
                    imagen_cambio_cada_minutos: Math.max(0, Math.floor(Number(r.imagen_cambio_cada_minutos) || 0)),
                    tira_cambio_cada_minutos: Math.max(0, Math.floor(Number(r.tira_cambio_cada_minutos) || 0))
                };
            });
            setPlaylistConfigByCourt(cmap);
        } catch (e) {
            console.error('Error fetching assignments:', e);
        }
    }, [
        selectedVenue,
        selectedVenueCourts
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let mounted = true;
        (async ()=>{
            try {
                setLoading(true);
                setError(null);
                await Promise.all([
                    fetchMedia(),
                    fetchTicker(),
                    loadVenuesAndCourts(),
                    (async ()=>{
                        const s = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getAdminSettings();
                        if (!mounted) return;
                        const id = s?.publicidadDossierDriveId?.trim() || null;
                        if (id) {
                            setDossierFolderId(id);
                            setDossierDraft(id);
                        }
                    })()
                ]);
            } catch (e) {
                if (mounted) setError(e?.message || 'No se pudo cargar publicidad.');
            } finally{
                if (mounted) setLoading(false);
            }
        })();
        return ()=>{
            mounted = false;
        };
    }, [
        fetchMedia,
        fetchTicker,
        loadVenuesAndCourts
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const keys = selectedVenueCourts.map((c)=>String(c.key).trim());
        if (keys.length === 0) {
            setCanchasHealth({});
            return;
        }
        const load = async ()=>{
            const dbKeys = Array.from(new Set(keys.flatMap((k)=>k.toLowerCase().startsWith('cancha_') ? [
                    k
                ] : [
                    k,
                    `cancha_${k}`
                ])));
            const venueRow = String(selectedVenue || '').trim();
            const { data, error } = await supabase.from('canchas').select('cancha_id, last_seen').eq('venue_name', venueRow).in('cancha_id', dbKeys);
            if (error) return;
            const keySet = new Set(keys);
            const m = {};
            keys.forEach((k)=>{
                m[k] = null;
            });
            (data || []).forEach((r)=>{
                const nk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtPlaylists$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeCanchaIdKey"])(r.cancha_id);
                if (keySet.has(nk)) {
                    m[nk] = r.last_seen;
                }
            });
            setCanchasHealth(m);
        };
        void load();
        const id = window.setInterval(load, 15_000);
        return ()=>window.clearInterval(id);
    }, [
        selectedVenue,
        selectedVenueCourts,
        supabase
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchAssignments();
    }, [
        selectedVenue,
        selectedVenueCourts,
        fetchAssignments
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const courts = selectedVenueCourts;
        if (courts.length === 0) {
            setPreviewMatchByCourt({});
            return;
        }
        let cancelled = false;
        const tick = async ()=>{
            const next = {};
            await Promise.all(courts.map(async (court)=>{
                const canchaId = `cancha_${court.displayNum}`;
                try {
                    const row = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getPizarraCanchaState(canchaId);
                    const d = row?.data || {};
                    const mid = String(d.partido_id || d.active_match_id || '').trim();
                    const tid = String(d.torneo_id || '').trim();
                    if (!mid || mid.startsWith('live_')) {
                        next[court.key] = null;
                        return;
                    }
                    next[court.key] = {
                        tournamentId: tid,
                        matchId: mid
                    };
                } catch  {
                    next[court.key] = null;
                }
            }));
            if (!cancelled) setPreviewMatchByCourt(next);
        };
        void tick();
        const id = window.setInterval(tick, 8000);
        return ()=>{
            cancelled = true;
            window.clearInterval(id);
        };
    }, [
        selectedVenueCourts
    ]);
    const videos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>mediaList.filter((m)=>String(m.tipo).includes('video')), [
        mediaList
    ]);
    const carrusel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>mediaList.filter((m)=>m.tipo === 'imagen'), [
        mediaList
    ]);
    const saveVideoPlaylistForCourt = async (courtKey, orderedMediaIds, cambioMin)=>{
        if (!selectedVenue) return;
        setSavingCourtKey(courtKey);
        setError(null);
        try {
            const durSec = cambioMin > 0 ? cambioMin * 60 : 30;
            const s1 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$data$3a$22cb4c__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["savePlaylistAction"])(courtKey, selectedVenue, orderedMediaIds, 'video', durSec);
            if (!s1.ok) {
                setError(s1.error);
                return;
            }
            const s2 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$data$3a$5bf49c__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["upsertPlaylistConfigAction"])(selectedVenue, courtKey, {
                video_cambio_cada_minutos: Math.max(0, Math.floor(Number(cambioMin) || 0))
            });
            if (!s2.ok) {
                setError(s2.error);
                return;
            }
            await fetchAssignments();
        } catch (e) {
            setError(e?.message || 'No se pudo guardar videos.');
        } finally{
            setSavingCourtKey(null);
        }
    };
    const saveImagePlaylistForCourt = async (courtKey, orderedMediaIds, cambioMin, loop, pausaSeg)=>{
        if (!selectedVenue) return;
        setSavingCourtKey(courtKey);
        setError(null);
        try {
            const durSec = cambioMin > 0 ? cambioMin * 60 : 10;
            const s1 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$data$3a$22cb4c__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["savePlaylistAction"])(courtKey, selectedVenue, orderedMediaIds, 'imagen', durSec);
            if (!s1.ok) {
                setError(s1.error);
                return;
            }
            const s2 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$data$3a$5bf49c__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["upsertPlaylistConfigAction"])(selectedVenue, courtKey, {
                imagen_cambio_cada_minutos: Math.max(0, Math.floor(Number(cambioMin) || 0)),
                imagen_loop: loop,
                imagen_pausa_entre_segundos: Math.max(0, Math.floor(Number(pausaSeg) || 0))
            });
            if (!s2.ok) {
                setError(s2.error);
                return;
            }
            await fetchAssignments();
        } catch (e) {
            setError(e?.message || 'No se pudo guardar imágenes.');
        } finally{
            setSavingCourtKey(null);
        }
    };
    const saveTiraPlaylistForCourt = async (courtKey, orderedTiraIds, cambioMin)=>{
        if (!selectedVenue) return;
        setSavingCourtKey(courtKey);
        setError(null);
        try {
            const s1 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$data$3a$d7b584__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["saveTiraPlaylistAction"])(courtKey, selectedVenue, orderedTiraIds);
            if (!s1.ok) {
                setError(s1.error);
                return;
            }
            const s2 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$data$3a$5bf49c__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["upsertPlaylistConfigAction"])(selectedVenue, courtKey, {
                tira_cambio_cada_minutos: Math.max(0, Math.floor(Number(cambioMin) || 0))
            });
            if (!s2.ok) {
                setError(s2.error);
                return;
            }
            await fetchAssignments();
        } catch (e) {
            setError(e?.message || 'No se pudo guardar la tira.');
        } finally{
            setSavingCourtKey(null);
        }
    };
    const uploadFiles = async (files)=>{
        if (!files.length) return;
        setUploading(true);
        setError(null);
        try {
            const tryUploadToBuckets = async (path, file)=>{
                const buckets = [
                    'publicidad',
                    'ads',
                    'media'
                ];
                let lastErr = null;
                for (const bucket of buckets){
                    const up = await supabase.storage.from(bucket).upload(path, file, {
                        upsert: false
                    });
                    if (!up.error) {
                        const pub = supabase.storage.from(bucket).getPublicUrl(path);
                        return {
                            bucket,
                            publicUrl: pub.data.publicUrl
                        };
                    }
                    lastErr = up.error;
                    const msg = String(up.error?.message || '').toLowerCase();
                    if (!msg.includes('bucket') || !msg.includes('not found')) break;
                }
                throw lastErr;
            };
            for (const file of files){
                const fileExt = file.name.split('.').pop() || 'bin';
                const path = `ads/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
                const pub = await tryUploadToBuckets(path, file);
                const tipo = isVideoFile(file) ? 'video_file' : isImageFile(file) ? 'imagen' : 'video_file';
                const addRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$data$3a$364588__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["addMediaContentAction"])({
                    tipo,
                    url: pub.publicUrl,
                    nombre: file.name,
                    nombre_sponsor: file.name.replace(/\.[^/.]+$/, ''),
                    file_size_bytes: file.size,
                    duracion_segundos: tipo === 'imagen' ? 10 : null,
                    activa: true
                });
                if (!addRes.ok) {
                    setError(addRes.error);
                    return;
                }
            }
            await fetchMedia();
        } catch (e) {
            const msg = String(e?.message || '');
            if (msg.toLowerCase().includes('bucket') && msg.toLowerCase().includes('not found')) {
                setError('Bucket not found. Crea un bucket público llamado "publicidad" (o "ads") en Supabase Storage.');
            } else {
                setError(msg || 'No se pudo subir el archivo.');
            }
        } finally{
            setUploading(false);
        }
    };
    const drop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"])({
        onDrop: uploadFiles,
        accept: {
            'video/*': [
                '.mp4',
                '.webm',
                '.mov'
            ],
            'image/*': [
                '.png',
                '.jpg',
                '.jpeg',
                '.webp',
                '.gif'
            ]
        },
        disabled: uploading
    });
    const deleteMedia = async (id)=>{
        if (!confirm('¿Eliminar este medio?')) return;
        try {
            const r = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$data$3a$822aa1__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["deleteMediaAction"])(id);
            if (!r.ok) {
                setError(r.error);
                return;
            }
            await fetchMedia();
            await fetchAssignments();
        } catch (e) {
            setError(e.message);
        }
    };
    const renameMedia = async (id, nextNameRaw)=>{
        const nextName = nextNameRaw.trim();
        if (!nextName) return;
        setError(null);
        try {
            const r = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$data$3a$a5f478__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["renameMediaAction"])(id, nextName);
            if (!r.ok) {
                setError(r.error);
                return;
            }
            setEditingMediaId(null);
            setEditingMediaName('');
            await fetchMedia();
        } catch (e) {
            setError(e.message);
        }
    };
    const download = async (url, name)=>{
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = name || 'media';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(objectUrl);
        } catch  {
            window.open(url, '_blank');
        }
    };
    const addTicker = async ()=>{
        const msg = nuevoTicker.trim();
        if (!msg) return;
        try {
            const r = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$data$3a$c036d5__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["addTickerAction"])(msg, tiraList.length);
            if (!r.ok) {
                setError(r.error);
                return;
            }
            setNuevoTicker('');
            await fetchTicker();
        } catch (e) {
            setError(e.message);
        }
    };
    const saveDossier = async ()=>{
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$driveDossier$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseGoogleDriveFolderId"])(dossierDraft);
        if (!parsed) {
            setError('Introduce un ID de carpeta de Google Drive válido o una URL que contenga /folders/…');
            return;
        }
        setSavingDossier(true);
        setError(null);
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].setAdminSettings({
                publicidadDossierDriveId: parsed
            });
            setDossierFolderId(parsed);
            setDossierDraft(parsed);
        } catch (e) {
            setError(e?.message || 'No se pudo guardar el dossier.');
        } finally{
            setSavingDossier(false);
        }
    };
    const dossierOpenUrl = dossierFolderId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$driveDossier$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["driveDossierUrls"])(dossierFolderId).open : null;
    const dossierEmbedUrl = dossierFolderId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$driveDossier$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["driveDossierUrls"])(dossierFolderId).embed : null;
    const copyDossierLink = async ()=>{
        if (!dossierOpenUrl) return;
        try {
            await navigator.clipboard.writeText(dossierOpenUrl);
            setDossierCopied(true);
            window.setTimeout(()=>setDossierCopied(false), 2000);
        } catch  {
            setError('No se pudo copiar al portapapeles.');
        }
    };
    const shareDossier = async ()=>{
        if (!dossierOpenUrl) return;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Dossier de publicidad — Smart Padel',
                    text: 'Enlace al dossier de publicidad en Google Drive:',
                    url: dossierOpenUrl
                });
            } else {
                await copyDossierLink();
            }
        } catch (e) {
            if (String(e?.name || '') !== 'AbortError') {
                await copyDossierLink();
            }
        }
    };
    const deleteTicker = async (id)=>{
        try {
            const r = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$data$3a$0a472c__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["deleteTickerAction"])(id);
            if (!r.ok) {
                setError(r.error);
                return;
            }
            await fetchTicker();
        } catch (e) {
            setError(e.message);
        }
    };
    const renderMediaTable = (title, items, allowRename = false)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            className: "bg-white/[0.02] border border-white/10 rounded-3xl p-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-lg md:text-xl font-black uppercase tracking-wider mb-4",
                    children: title
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                    lineNumber: 603,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "overflow-auto rounded-2xl border border-white/10",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        className: "w-full text-left",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                className: "bg-black/40",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-3 py-2 text-[10px] uppercase text-white/60",
                                            children: "Nombre"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 608,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-3 py-2 text-[10px] uppercase text-white/60",
                                            children: "Tamaño"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 609,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-3 py-2 text-[10px] uppercase text-white/60 text-right",
                                            children: "Acciones"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 610,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                    lineNumber: 607,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                lineNumber: 606,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                children: [
                                    items.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            className: "border-t border-white/10",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-3 py-2 text-sm font-bold text-white/90",
                                                    children: allowRename && editingMediaId === m.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-1.5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                value: editingMediaName,
                                                                onChange: (e)=>setEditingMediaName(e.target.value),
                                                                className: "min-w-0 flex-1 bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-padel-primary"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                                lineNumber: 619,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>renameMedia(m.id, editingMediaName),
                                                                className: "p-1.5 rounded-lg bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 hover:bg-emerald-500/35",
                                                                title: "Guardar nombre",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                                    size: 12
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                                    lineNumber: 630,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                                lineNumber: 624,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>{
                                                                    setEditingMediaId(null);
                                                                    setEditingMediaName('');
                                                                },
                                                                className: "p-1.5 rounded-lg bg-white/20 text-white border border-white/30 hover:bg-white/30",
                                                                title: "Cancelar",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                    size: 12
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                                    lineNumber: 641,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                                lineNumber: 632,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                        lineNumber: 618,
                                                        columnNumber: 21
                                                    }, this) : m.nombre_sponsor || m.nombre || 'Sin nombre'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                    lineNumber: 616,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-3 py-2 text-xs text-white/70",
                                                    children: mb(m.file_size_bytes)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                    lineNumber: 648,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-3 py-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-end gap-2",
                                                        children: [
                                                            allowRename && editingMediaId !== m.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>{
                                                                    setEditingMediaId(m.id);
                                                                    setEditingMediaName(m.nombre_sponsor || m.nombre || '');
                                                                },
                                                                className: "p-2 rounded-lg bg-sky-500/25 text-sky-100 border border-sky-400/40 hover:bg-sky-500/35",
                                                                title: "Renombrar",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$line$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit3$3e$__["Edit3"], {
                                                                    size: 14
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                                    lineNumber: 661,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                                lineNumber: 652,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>setPreviewUrl(m.url),
                                                                className: "p-2 rounded-lg bg-white/20 text-white border border-white/30 hover:bg-white/30",
                                                                title: "Preview",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                                    size: 14
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                                    lineNumber: 664,
                                                                    columnNumber: 187
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                                lineNumber: 664,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>download(m.url, m.nombre || m.nombre_sponsor || 'media'),
                                                                className: "p-2 rounded-lg bg-indigo-500/25 text-indigo-100 border border-indigo-400/40 hover:bg-indigo-500/35",
                                                                title: "Download",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                                                    size: 14
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                                    lineNumber: 665,
                                                                    columnNumber: 244
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                                lineNumber: 665,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>deleteMedia(m.id),
                                                                className: "p-2 rounded-lg bg-red-500/25 text-red-100 border border-red-400/40 hover:bg-red-500/35",
                                                                title: "Delete",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                    size: 14
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                                    lineNumber: 666,
                                                                    columnNumber: 191
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                                lineNumber: 666,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                        lineNumber: 650,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                    lineNumber: 649,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, m.id, true, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 615,
                                            columnNumber: 15
                                        }, this)),
                                    items.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-3 py-8 text-center text-white/40 text-xs",
                                            colSpan: 3,
                                            children: "Sin elementos"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 672,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                        lineNumber: 672,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                lineNumber: 613,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/publicidad/page.tsx",
                        lineNumber: 605,
                        columnNumber: 9
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                    lineNumber: 604,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/admin/publicidad/page.tsx",
            lineNumber: 602,
            columnNumber: 5
        }, this);
    if (authLoading || loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-black flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                className: "w-8 h-8 animate-spin text-padel-primary"
            }, void 0, false, {
                fileName: "[project]/src/app/admin/publicidad/page.tsx",
                lineNumber: 681,
                columnNumber: 84
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/admin/publicidad/page.tsx",
            lineNumber: 681,
            columnNumber: 12
        }, this);
    }
    if (!isAdmin) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-[#050505] text-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "overflow-y-auto px-3 py-4 md:px-4 md:py-5",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>router.push('/admin'),
                                className: "inline-flex items-center justify-center gap-2 pl-2 pr-3 py-2.5 rounded-xl transition-colors border border-white/10 bg-black/30 hover:bg-white/10 hover:border-white/20 group",
                                "aria-label": "Volver atrás",
                                title: "Volver al inicio admin",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                    className: "w-5 h-5 shrink-0 text-white/80 group-hover:text-padel-primary transition-colors",
                                    strokeWidth: 2.25
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                    lineNumber: 697,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                lineNumber: 690,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                            lineNumber: 689,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                            className: "flex flex-col md:flex-row md:items-end justify-between gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "text-2xl md:text-3xl font-black uppercase italic leading-none",
                                            children: "Admin Publicidad"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 703,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[11px] text-white/60 uppercase tracking-wider leading-tight",
                                            children: "Playlist independiente por sede y cancha"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 704,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                    lineNumber: 702,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/admin/publicidad/manual",
                                            className: "px-4 py-2 rounded-xl bg-zinc-900 border border-[#ccff00]/25 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#ccff00]/10 hover:border-[#ccff00]/45 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-black/20",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                                    className: "w-4 h-4 text-padel-primary"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                    lineNumber: 712,
                                                    columnNumber: 17
                                                }, this),
                                                "Manual de ventas"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 708,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>router.push('/admin/display/templates'),
                                            className: "px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/20",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panels$2d$top$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layout$3e$__["Layout"], {
                                                    className: "w-4 h-4 text-padel-primary"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                    lineNumber: 720,
                                                    columnNumber: 17
                                                }, this),
                                                "Dynamic Studio"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 715,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                    lineNumber: 707,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                            lineNumber: 701,
                            columnNumber: 11
                        }, this),
                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300 flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                    size: 16
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                    lineNumber: 728,
                                    columnNumber: 15
                                }, this),
                                " ",
                                error
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                            lineNumber: 727,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            className: "rounded-2xl border border-padel-primary/35 bg-gradient-to-br from-padel-primary/[0.07] to-black/40 p-4 md:p-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-3 md:flex-row md:items-start md:justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start gap-3 min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-padel-primary/40 bg-black/50",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__["FolderOpen"], {
                                                        className: "h-5 w-5 text-padel-primary"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                        lineNumber: 736,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                    lineNumber: 735,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "min-w-0 space-y-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                            className: "text-lg font-black uppercase italic tracking-tight text-white",
                                                            children: "Dossier de publicidad"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                            lineNumber: 739,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[11px] text-white/60 uppercase tracking-wider leading-snug",
                                                            children: "Carpeta en Google Drive — guarda el ID o pega el enlace; visualiza y comparte desde aquí (solo administrador)."
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                            lineNumber: 740,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                    lineNumber: 738,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 734,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2 shrink-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    disabled: !dossierOpenUrl,
                                                    onClick: ()=>dossierOpenUrl && window.open(dossierOpenUrl, '_blank', 'noopener,noreferrer'),
                                                    className: "inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-white/10 disabled:opacity-40",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                                            className: "h-4 w-4 text-padel-primary"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                            lineNumber: 752,
                                                            columnNumber: 19
                                                        }, this),
                                                        "Abrir en Drive"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                    lineNumber: 746,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    disabled: !dossierOpenUrl,
                                                    onClick: ()=>void copyDossierLink(),
                                                    className: "inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-white/10 disabled:opacity-40",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                                            className: "h-4 w-4 text-padel-primary"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                            lineNumber: 761,
                                                            columnNumber: 19
                                                        }, this),
                                                        dossierCopied ? 'Copiado' : 'Copiar enlace'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                    lineNumber: 755,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    disabled: !dossierOpenUrl,
                                                    onClick: ()=>void shareDossier(),
                                                    className: "inline-flex items-center gap-2 rounded-xl border border-padel-primary/50 bg-padel-primary/15 px-3 py-2 text-xs font-black uppercase tracking-wide text-padel-primary hover:bg-padel-primary/25 disabled:opacity-40",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__["Share2"], {
                                                            className: "h-4 w-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                            lineNumber: 770,
                                                            columnNumber: 19
                                                        }, this),
                                                        "Enviar / compartir"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                    lineNumber: 764,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 745,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                    lineNumber: 733,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-4 flex flex-col gap-3 sm:flex-row sm:items-end",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "min-w-0 flex-1 space-y-1.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-[10px] font-black uppercase tracking-widest text-white/50",
                                                    children: "ID o URL de la carpeta"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                    lineNumber: 778,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: dossierDraft,
                                                    onChange: (e)=>setDossierDraft(e.target.value),
                                                    placeholder: "1gVX… o https://drive.google.com/drive/folders/…",
                                                    className: "w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2.5 text-sm text-white outline-none focus:border-padel-primary/60"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                    lineNumber: 779,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 777,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            disabled: savingDossier,
                                            onClick: ()=>void saveDossier(),
                                            className: "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-padel-primary px-5 py-2.5 text-sm font-black uppercase text-black hover:brightness-105 disabled:opacity-50",
                                            children: [
                                                savingDossier ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                    className: "h-4 w-4 animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                    lineNumber: 793,
                                                    columnNumber: 34
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$link$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Link2$3e$__["Link2"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                    lineNumber: 793,
                                                    columnNumber: 81
                                                }, this),
                                                "Guardar dossier"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 787,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                    lineNumber: 776,
                                    columnNumber: 13
                                }, this),
                                dossierEmbedUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-5 space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] font-black uppercase tracking-widest text-white/45",
                                            children: "Vista previa embebida"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 800,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] text-white/40",
                                            children: "Si la carpeta no es pública o Drive bloquea el iframe, usa «Abrir en Drive»."
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 801,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "overflow-hidden rounded-xl border border-white/10 bg-black/60",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                                                title: "Dossier Google Drive",
                                                src: dossierEmbedUrl,
                                                className: "h-[min(70vh,520px)] w-full bg-black",
                                                sandbox: "allow-scripts allow-same-origin allow-popups allow-forms"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                lineNumber: 805,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 804,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                    lineNumber: 799,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                            lineNumber: 732,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            className: "bg-white/[0.02] border border-white/10 rounded-2xl p-4 md:p-5",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        ...drop.getRootProps(),
                                        className: "cursor-pointer",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                ...drop.getInputProps()
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                lineNumber: 819,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "px-4 py-2 rounded-xl bg-padel-primary text-black font-black text-xs uppercase tracking-wider flex items-center gap-2",
                                                children: [
                                                    uploading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                        className: "w-4 h-4 animate-spin"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                        lineNumber: 821,
                                                        columnNumber: 32
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                        lineNumber: 821,
                                                        columnNumber: 79
                                                    }, this),
                                                    " Cargar Media"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                lineNumber: 820,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                        lineNumber: 818,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-white/50",
                                        children: "Videos e imágenes para la biblioteca y las playlists."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                        lineNumber: 824,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                lineNumber: 817,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                            lineNumber: 816,
                            columnNumber: 11
                        }, this),
                        renderMediaTable('Biblioteca de Videos', videos, true),
                        renderMediaTable('Biblioteca de Carrusel', carrusel, true),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            className: "bg-white/[0.02] border border-white/10 rounded-2xl p-4 md:p-5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg md:text-xl font-black uppercase tracking-wider mb-4",
                                    children: "Ticker"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                    lineNumber: 832,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-2 mb-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            value: nuevoTicker,
                                            onChange: (e)=>setNuevoTicker(e.target.value),
                                            placeholder: "Nuevo mensaje para la tira",
                                            className: "flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/45 outline-none focus:border-white/25"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 834,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: addTicker,
                                            className: "px-4 py-2 rounded-xl bg-padel-primary text-black font-black text-xs uppercase",
                                            children: "Agregar"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 840,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                    lineNumber: 833,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "overflow-auto rounded-2xl border border-white/10",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                        className: "w-full text-left",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                className: "bg-black/40",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-3 py-2 text-[10px] uppercase text-white/60",
                                                            children: "Nombre"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                            lineNumber: 846,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-3 py-2 text-[10px] uppercase text-white/60",
                                                            children: "Tamaño"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                            lineNumber: 847,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-3 py-2 text-[10px] uppercase text-white/60 text-right",
                                                            children: "Acciones"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                            lineNumber: 848,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                    lineNumber: 845,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                lineNumber: 844,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                children: [
                                                    tiraList.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            className: "border-t border-white/10",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    className: "px-3 py-2 text-sm font-bold text-white/90",
                                                                    children: t.mensaje
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                                    lineNumber: 854,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    className: "px-3 py-2 text-xs text-white/70",
                                                                    children: "—"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                                    lineNumber: 855,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    className: "px-3 py-2 text-right",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        onClick: ()=>deleteTicker(t.id),
                                                                        className: "p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                            size: 14
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                                            lineNumber: 857,
                                                                            columnNumber: 156
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                                        lineNumber: 857,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                                    lineNumber: 856,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, t.id, true, {
                                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                            lineNumber: 853,
                                                            columnNumber: 21
                                                        }, this)),
                                                    tiraList.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "px-3 py-8 text-center text-white/40 text-xs",
                                                            colSpan: 3,
                                                            children: "Sin mensajes"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                            lineNumber: 862,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                        lineNumber: 862,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                lineNumber: 851,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                        lineNumber: 843,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                    lineNumber: 842,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                            lineNumber: 831,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            className: "bg-white/[0.02] border border-white/10 rounded-2xl p-4 md:p-5 space-y-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg md:text-xl font-black uppercase tracking-wider",
                                    children: "Playlists por sede"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                    lineNumber: 870,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-white/50",
                                    children: "Sedes y nombres de pista se obtienen de los torneos. Al elegir una sede solo ves las canchas de ese club."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                    lineNumber: 871,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-end gap-2 max-w-xl",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "min-w-0 flex-1 max-w-md",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-[10px] uppercase text-white/60",
                                                    children: "Sede"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                    lineNumber: 876,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: selectedVenue,
                                                    onChange: (e)=>setSelectedVenue(e.target.value),
                                                    className: "w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-white/25",
                                                    children: venues.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "",
                                                        className: "bg-zinc-950 text-white",
                                                        children: "— Sin sedes en torneos —"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                        lineNumber: 883,
                                                        columnNumber: 21
                                                    }, this) : venues.map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: v.name,
                                                            className: "bg-zinc-950 text-white",
                                                            children: v.name
                                                        }, v.name, false, {
                                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                            lineNumber: 886,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                    lineNumber: 877,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 875,
                                            columnNumber: 15
                                        }, this),
                                        selectedVenue && (selectedVenueMonitorHref ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            href: selectedVenueMonitorHref,
                                            target: "_blank",
                                            rel: "noopener noreferrer",
                                            title: "Monitor de canchas / monitoreo de pantallas",
                                            className: "inline-flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-xl border border-padel-primary/40 bg-padel-primary/15 px-3 text-padel-primary transition hover:bg-padel-primary/25",
                                            "aria-label": "Abrir monitor de canchas",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"], {
                                                    className: "h-5 w-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                    lineNumber: 903,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "hidden font-black text-[10px] uppercase tracking-wider sm:inline",
                                                    children: "Monitor"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                    lineNumber: 904,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 895,
                                            columnNumber: 19
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            disabled: true,
                                            title: "Ningún torneo asociado a esta sede para abrir el monitor",
                                            className: "inline-flex h-[42px] shrink-0 cursor-not-allowed items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-white/30",
                                            "aria-label": "Monitor no disponible",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"], {
                                                className: "h-5 w-5"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                                lineNumber: 914,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 907,
                                            columnNumber: 19
                                        }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                    lineNumber: 874,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3",
                                    children: selectedVenueCourts.map((court)=>{
                                        const rows = assignments.filter((a)=>adminPublicidadCanchaMatches(a.cancha_id, court.key) && adminPublicidadVenueMatches(a.venue_name, selectedVenue));
                                        const { video, imagen } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtPlaylists$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["partitionPlaylistRows"])(rows);
                                        const cfg = playlistConfigByCourt[court.key];
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$publicidad$2f$CourtCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            venueName: selectedVenue,
                                            courtKey: court.key,
                                            displayCourtNum: court.displayNum,
                                            title: court.label,
                                            libraryVideos: videos,
                                            libraryImages: carrusel,
                                            videoRows: video,
                                            imageRows: imagen,
                                            tiraList: tiraList.map((t)=>({
                                                    id: t.id,
                                                    mensaje: t.mensaje
                                                })),
                                            linkedTiraIds: tiraLinksByCourt[court.key] || [],
                                            videoCambioMinutos: cfg?.video_cambio_cada_minutos ?? 0,
                                            imagenCambioMinutos: cfg?.imagen_cambio_cada_minutos ?? 0,
                                            tiraCambioMinutos: cfg?.tira_cambio_cada_minutos ?? 0,
                                            imagenLoop: cfg?.imagen_loop ?? true,
                                            imagenPausaSeg: cfg?.imagen_pausa_entre_segundos ?? 0,
                                            lastSeenIso: canchasHealth[court.key] ?? null,
                                            isSaving: savingCourtKey === court.key,
                                            onSaveVideoPlaylist: (ids, min)=>saveVideoPlaylistForCourt(court.key, ids, min),
                                            onSaveImagePlaylist: (ids, min, loop, pausa)=>saveImagePlaylistForCourt(court.key, ids, min, loop, pausa),
                                            onSaveTiraPlaylist: (ids, min)=>saveTiraPlaylistForCourt(court.key, ids, min),
                                            linkTournamentId: previewMatchByCourt[court.key]?.tournamentId ?? null,
                                            linkMatchId: previewMatchByCourt[court.key]?.matchId ?? null
                                        }, `${selectedVenue}-${court.key}`, false, {
                                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                            lineNumber: 929,
                                            columnNumber: 19
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                    lineNumber: 919,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                            lineNumber: 869,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                    lineNumber: 688,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/publicidad/page.tsx",
                lineNumber: 687,
                columnNumber: 7
            }, this),
            previewUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 relative",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>setPreviewUrl(null),
                            className: "absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/publicidad/page.tsx",
                                lineNumber: 966,
                                columnNumber: 140
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                            lineNumber: 966,
                            columnNumber: 13
                        }, this),
                        /\.(mp4|webm|mov|m4v)$/i.test(previewUrl) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                            src: previewUrl,
                            controls: true,
                            autoPlay: true,
                            className: "w-full h-full"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                            lineNumber: 968,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: previewUrl,
                            alt: "preview",
                            className: "w-full h-full object-contain"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/publicidad/page.tsx",
                            lineNumber: 970,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/publicidad/page.tsx",
                    lineNumber: 965,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/publicidad/page.tsx",
                lineNumber: 964,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/admin/publicidad/page.tsx",
        lineNumber: 686,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=src_105fdc0f._.js.map