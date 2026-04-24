module.exports = [
"[next]/internal/font/google/barlow_condensed_b8d6230f.module.css [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "className": "barlow_condensed_b8d6230f-module__sFjbpa__className",
});
}),
"[next]/internal/font/google/barlow_condensed_b8d6230f.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$barlow_condensed_b8d6230f$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[next]/internal/font/google/barlow_condensed_b8d6230f.module.css [app-ssr] (css module)");
;
const fontData = {
    className: __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$barlow_condensed_b8d6230f$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].className,
    style: {
        fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback'",
        fontWeight: 900,
        fontStyle: "normal"
    }
};
if (__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$barlow_condensed_b8d6230f$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].variable != null) {
    fontData.variable = __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$barlow_condensed_b8d6230f$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].variable;
}
const __TURBOPACK__default__export__ = fontData;
}),
"[project]/src/components/BouncingBall.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BouncingBall",
    ()=>BouncingBall,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
'use client';
;
function BouncingBall({ size = 36, duration = 700, bounceHeight = 2.2 }) {
    const travel = size * bounceHeight; // px que sube la pelota
    const shadowBase = size * 0.55; // ancho base de la sombra
    const animId = `bb-${size}-${duration}`; // ID único para los keyframes
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
                /* ── Contenedor vertical — ocupa la altura del viaje + pelota + sombra ── */
                .${animId}-wrap {
                    display: inline-flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-end;
                    height: ${travel + size + size * 0.28}px;
                    width: ${size * 1.2}px;
                    position: relative;
                    flex-shrink: 0;
                    margin-bottom: 2px;
                }

                /* ── PELOTA ── */
                .${animId}-ball {
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    background: radial-gradient(
                        circle at 35% 32%,
                        #e8ff6a 0%,
                        #c8f400 38%,
                        #86b000 75%,
                        #5a7800 100%
                    );
                    box-shadow:
                        inset -3px -4px 8px rgba(0,0,0,0.35),
                        inset 2px 2px 6px rgba(255,255,180,0.45),
                        0 0 ${size * 0.3}px rgba(180,255,0,0.25);
                    position: relative;
                    flex-shrink: 0;
                    transform-origin: center bottom;
                    animation: ${animId}-bounce ${duration}ms cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                }

                /* Líneas de costura */
                .${animId}-ball::before,
                .${animId}-ball::after {
                    content: '';
                    position: absolute;
                    border: 1.5px solid rgba(255,255,255,0.18);
                    border-radius: 50%;
                }
                .${animId}-ball::before {
                    width: 55%;
                    height: 100%;
                    left: 22%;
                    top: 0;
                    border-left-color: transparent;
                    border-right-color: transparent;
                    transform: rotate(12deg);
                }
                .${animId}-ball::after {
                    width: 100%;
                    height: 55%;
                    left: 0;
                    top: 22%;
                    border-top-color: transparent;
                    border-bottom-color: transparent;
                    transform: rotate(-12deg);
                }

                /* ── SOMBRA ── */
                .${animId}-shadow {
                    width: ${shadowBase}px;
                    height: ${size * 0.14}px;
                    background: radial-gradient(ellipse, rgba(180,255,0,0.45) 0%, rgba(0,0,0,0) 75%);
                    border-radius: 50%;
                    flex-shrink: 0;
                    animation: ${animId}-shadow ${duration}ms cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                }

                /* ── KEYFRAMES PELOTA ── */
                @keyframes ${animId}-bounce {
                    0%   { transform: translateY(0px) scaleX(1) scaleY(1); }
                    15%  { transform: translateY(-${travel * 0.25}px) scaleX(1) scaleY(1); }
                    45%  { transform: translateY(-${travel}px) scaleX(1) scaleY(1); }
                    75%  { transform: translateY(-${travel * 0.05}px) scaleX(1) scaleY(1); }
                    /* squash al tocar el suelo */
                    88%  { transform: translateY(${size * 0.05}px) scaleX(1.22) scaleY(0.82); }
                    100% { transform: translateY(0px) scaleX(1) scaleY(1); }
                }

                /* ── KEYFRAMES SOMBRA ── */
                @keyframes ${animId}-shadow {
                    /* pelota arriba = sombra pequeña y tenue */
                    0%   { transform: scaleX(1);    opacity: 0.65; }
                    15%  { transform: scaleX(0.75); opacity: 0.4;  }
                    45%  { transform: scaleX(0.35); opacity: 0.18; }
                    75%  { transform: scaleX(0.9);  opacity: 0.6;  }
                    /* squash: sombra ancha al máximo impacto */
                    88%  { transform: scaleX(1.25); opacity: 0.85; }
                    100% { transform: scaleX(1);    opacity: 0.65; }
                }
            `
            }, void 0, false, {
                fileName: "[project]/src/components/BouncingBall.tsx",
                lineNumber: 28,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `${animId}-wrap`,
                role: "img",
                "aria-label": "Pelota de pádel",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${animId}-ball`
                    }, void 0, false, {
                        fileName: "[project]/src/components/BouncingBall.tsx",
                        lineNumber: 126,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${animId}-shadow`,
                        style: {
                            marginTop: `${size * 0.05}px`
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/BouncingBall.tsx",
                        lineNumber: 127,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/BouncingBall.tsx",
                lineNumber: 125,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true);
}
const __TURBOPACK__default__export__ = BouncingBall;
}),
"[project]/src/lib/courtDisplayAdVideo.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * URLs de publicidad en pizarra: <video> solo reproduce archivos directos;
 * YouTube / embeds requieren iframe.
 */ __turbopack_context__.s([
    "courtAdVideoNeedsIframe",
    ()=>courtAdVideoNeedsIframe,
    "toCourtAdVideoIframeSrc",
    ()=>toCourtAdVideoIframeSrc
]);
function courtAdVideoNeedsIframe(url) {
    const u = (url || '').trim().toLowerCase();
    if (!u) return false;
    return u.includes('youtube.com') || u.includes('youtu.be') || u.includes('vimeo.com') || u.includes('twitch.tv') || u.includes('dailymotion.com') || u.includes('/embed/');
}
function toCourtAdVideoIframeSrc(url) {
    const u = url.trim();
    const lower = u.toLowerCase();
    if (lower.includes('youtube.com/watch?v=')) {
        const videoId = u.split('v=')[1]?.split('&')[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1`;
    }
    if (lower.includes('youtu.be/')) {
        const videoId = u.split('youtu.be/')[1]?.split('?')[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1`;
    }
    if (lower.includes('youtube.com/embed/')) {
        return u.includes('?') ? u : `${u}?autoplay=1&mute=1&playsinline=1`;
    }
    return u;
}
}),
"[project]/src/components/CourtAdVideoOrIframe.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CourtAdVideoOrIframe",
    ()=>CourtAdVideoOrIframe
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtDisplayAdVideo$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/courtDisplayAdVideo.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
function CourtAdVideoOrIframe({ url, videoKey, className = 'w-full h-full object-cover', loop, onEnded, onNativeVideoError, title = 'Publicidad vídeo' }) {
    const [forceIframe, setForceIframe] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setForceIframe(false);
    }, [
        url
    ]);
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtDisplayAdVideo$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["courtAdVideoNeedsIframe"])(url) || forceIframe) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
            src: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtDisplayAdVideo$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toCourtAdVideoIframeSrc"])(url),
            className: `border-0 ${className}`,
            allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
            allowFullScreen: true,
            title: title
        }, videoKey, false, {
            fileName: "[project]/src/components/CourtAdVideoOrIframe.tsx",
            lineNumber: 36,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
        src: url,
        className: className,
        autoPlay: true,
        muted: true,
        playsInline: true,
        loop: loop,
        onEnded: onEnded,
        onError: ()=>{
            setForceIframe(true);
            onNativeVideoError?.();
        }
    }, videoKey, false, {
        fileName: "[project]/src/components/CourtAdVideoOrIframe.tsx",
        lineNumber: 48,
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
"[project]/src/lib/resolveMatchTeamLines.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isGenericEquipoNombre",
    ()=>isGenericEquipoNombre,
    "resolveMatchTeamLines",
    ()=>resolveMatchTeamLines
]);
/**
 * Misma resolución de nombres que el marcador del torneo (score / grilla),
 * para rellenar marker y pizarra cuando solo hay match + tournament en BD.
 */ // Detecta placeholders tipo "Jugador 1", "Pareja 2", etc. para no mostrarlos como si fueran nombres reales.
const PH = /^(pareja\s*\d*|jugador\s*\d*|player\s*\d*|equipo\s*\d*|placeholder|tbd|\?|j\d+|p\d+)$/i;
function isReal(s) {
    if (!s) return false;
    const trimmed = s.trim();
    if (!trimmed || trimmed === '?' || trimmed === '-') return false;
    return !PH.test(trimmed);
}
function resolveNames(embeddedTeam, teamIdx, matchTeamName, matchTeamId, teams) {
    if (embeddedTeam) {
        if (embeddedTeam.isTBD) {
            return (embeddedTeam.teamLabel || 'TBD').trim() || 'TBD';
        }
        /** Master / cuadro suelen persistir la línea en `full` sin objetos p1/p2. */ const fullLine = typeof embeddedTeam.full === 'string' ? embeddedTeam.full.trim() : '';
        if (isReal(fullLine)) {
            const parts = fullLine.split(/\s*\/\s*/).map((s)=>s.trim()).filter(Boolean);
            if (parts.length >= 2) return fullLine;
            if (parts.length === 1 && isReal(parts[0])) return parts[0];
        }
        const altLine = typeof embeddedTeam.name === 'string' ? embeddedTeam.name.trim() : '';
        if (isReal(altLine)) {
            const parts = altLine.split(/\s*\/\s*/).map((s)=>s.trim()).filter(Boolean);
            if (parts.length >= 2) return altLine;
            if (parts.length === 1 && isReal(parts[0])) return parts[0];
        }
        const p1n = (embeddedTeam.p1?.name || embeddedTeam.p1Name || '').trim();
        const p2n = (embeddedTeam.p2?.name || embeddedTeam.p2Name || '').trim();
        if (isReal(p1n) || isReal(p2n)) {
            const p1f = isReal(p1n) ? p1n : '?';
            const p2f = isReal(p2n) ? p2n : '';
            return [
                p1f,
                p2f
            ].filter(Boolean).join(' / ');
        }
    }
    if (matchTeamName && isReal(matchTeamName)) {
        const parts = matchTeamName.split('/').map((s)=>s.trim()).filter(isReal);
        if (parts.length >= 2) return matchTeamName.trim();
        if (parts.length === 1) return parts[0];
    }
    const byId = matchTeamId ? teams.find((tm)=>tm.id === matchTeamId || tm.teamId === matchTeamId) : null;
    const byIdx = teamIdx > 0 ? teams[teamIdx - 1] : teams[teamIdx] ?? null;
    const tData = byId || byIdx || null;
    if (tData) {
        const fullLine = (tData.full || tData.teamName || tData.name || '').toString().trim();
        if (isReal(fullLine)) {
            const parts = fullLine.split(/\s*\/\s*/).map((s)=>s.trim()).filter(Boolean);
            if (parts.length >= 2) return fullLine;
            if (parts.length === 1 && isReal(parts[0])) return parts[0];
        }
        const p1n = (tData.p1?.name || tData.p1Name || '').trim();
        const p2n = (tData.p2?.name || tData.p2Name || '').trim();
        if (isReal(p1n) || isReal(p2n)) {
            return [
                p1n,
                p2n
            ].filter(isReal).join(' / ');
        }
    }
    return (matchTeamName || '').trim() || '';
}
function resolveMatchTeamLines(match, tournament) {
    const teams = tournament?.teams || [];
    const line1 = resolveNames(match?.team1, match?.team1Index ?? 0, match?.team1Name, match?.team1Id || match?.team1?.id, teams);
    const line2 = resolveNames(match?.team2, match?.team2Index ?? 0, match?.team2Name, match?.team2Id || match?.team2?.id, teams);
    return {
        team1: line1 || 'Equipo 1',
        team2: line2 || 'Equipo 2'
    };
}
function isGenericEquipoNombre(nombre, defaultLabel) {
    const s = (nombre || '').trim();
    if (!s) return true;
    if (s === defaultLabel) return true;
    if (/^(equipo|jugador|pareja|player|tbd)\s*\d*$/i.test(s)) return true;
    if (s === '?' || s === '-') return true;
    return false;
}
}),
"[project]/src/lib/pizarraHeaderLabels.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildCourtHeadline",
    ()=>buildCourtHeadline,
    "formatPizarraCategoryLevel",
    ()=>formatPizarraCategoryLevel,
    "formatPizarraGender",
    ()=>formatPizarraGender,
    "splitPizarraCategoryMeta",
    ()=>splitPizarraCategoryMeta
]);
/** Etiquetas de cabecera para pizarras por cancha (alineado con control / hub). */ const CAT_LEVEL_LABELS = {
    PRIMERA: '1ª',
    SEGUNDA: '2ª',
    TERCERA: '3ª',
    CUARTA: '4ª',
    QUINTA: '5ª',
    SEXTA: '6ª',
    SEPTIMA: '7ª',
    MAS_40: '+40',
    FEM_40: '+40',
    MIX_40: '+40',
    MAS_45: '+45',
    MAS_50: '+50',
    SUMA_7: 'Suma 7',
    SUMA_8: 'Suma 8',
    SUMA_9: 'Suma 9',
    SUMA_10: 'Suma 10',
    SUMA_11: 'Suma 11'
};
function formatPizarraGender(gender) {
    if (!gender) return '';
    const s = String(gender).trim();
    if (!s) return '';
    const u = s.toUpperCase();
    const n = s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
    if (u === 'MALE' || u === 'M' || n === 'masculine' || n === 'masculino' || n === 'male' || n === 'hombre' || n === 'masc') return 'Masculino';
    if (u === 'FEMALE' || u === 'F' || n === 'feminine' || n === 'femenino' || n === 'female' || n === 'mujer' || n === 'fem') return 'Femenino';
    if (u === 'MIXED' || n === 'mixed' || n === 'mixto' || n === 'mix' || n === 'mixta') return 'Mixto';
    if (u === 'MASCULINO') return 'Masculino';
    if (u === 'FEMENINO') return 'Femenino';
    if (u === 'MIXTO' || u === 'MIXTA') return 'Mixto';
    return s;
}
function formatPizarraCategoryLevel(cat) {
    if (!cat) return '';
    return CAT_LEVEL_LABELS[String(cat).toUpperCase()] ?? String(cat).replace(/_/g, ' ');
}
function splitPizarraCategoryMeta(t) {
    if (!t) return {
        levelLine: '',
        genderLine: ''
    };
    const cat = t.category ? String(t.category).toUpperCase() : '';
    const isGenderCat = [
        'MALE',
        'FEMALE',
        'MIXED'
    ].includes(cat);
    const genderLine = formatPizarraGender(t.gender) || (isGenderCat ? formatPizarraGender(t.category) : '');
    const levelLine = cat && !isGenderCat ? formatPizarraCategoryLevel(t.category) : '';
    return {
        levelLine,
        genderLine
    };
}
function buildCourtHeadline(venueName, courtId) {
    const v = (venueName || '').trim();
    if (v) return `${v} · Pista ${courtId}`;
    return `Pista ${courtId}`;
}
}),
"[project]/src/lib/resolveDisplayMatchId.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveMatchFromTournamentList",
    ()=>resolveMatchFromTournamentList
]);
/**
 * Misma resolución de `matchId` que la pizarra legacy
 * `/tournaments/[id]/display/[matchId]` (sin el fallback de partido simulado).
 */ function parseTimeFieldToMs(raw) {
    if (raw == null) return null;
    const r = raw;
    if (typeof r?.toDate === 'function') return r.toDate().getTime();
    if (typeof r?.seconds === 'number') return r.seconds * 1000 + (r.nanoseconds || 0) / 1e6;
    if (typeof raw === 'string' || typeof raw === 'number') return new Date(raw).getTime();
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d.getTime();
}
function getMatchStartTimeMs(m) {
    const raw = m?.startedAt ?? m?.actualStartTime ?? m?.startTime;
    return parseTimeFieldToMs(raw);
}
function resolveMatchFromTournamentList(matches, matchId) {
    const ms = Array.isArray(matches) ? matches : [];
    const mid = String(matchId ?? '').trim();
    if (!mid) return null;
    let found = ms.find((m)=>String(m.id) === String(mid)) ?? null;
    if (!found && /^match_(\d+)$/.test(mid)) {
        const idx = parseInt(mid.replace('match_', ''), 10);
        if (idx >= 0 && idx < ms.length) found = ms[idx];
    }
    if (!found && /^m_(\d+)$/.test(mid)) {
        const ts = parseInt(mid.replace('m_', ''), 10);
        found = ms.find((m)=>{
            const mTs = getMatchStartTimeMs(m);
            return mTs != null && Math.abs(mTs - ts) < 2000;
        }) ?? null;
    }
    if (!found && mid.startsWith('court_')) {
        const courtNum = parseInt(mid.replace('court_', ''), 10);
        if (!Number.isNaN(courtNum)) {
            found = ms.find((m)=>(m.court ?? (m.courtIndex != null ? m.courtIndex + 1 : null)) === courtNum) ?? ms.find((m)=>m.courtIndex === courtNum - 1) ?? null;
        }
    }
    return found;
}
}),
"[project]/src/lib/brand.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Logo por defecto del evento (Smart Padel); se puede sustituir desde la cabecera del evento. */ __turbopack_context__.s([
    "DEFAULT_EVENT_SPONSOR_LOGO_URL",
    ()=>DEFAULT_EVENT_SPONSOR_LOGO_URL
]);
const DEFAULT_EVENT_SPONSOR_LOGO_URL = 'https://smartpadel-assets.s3.amazonaws.com/logo-smart-padel-neon.png';
}),
"[project]/src/app/dev/pizarra-concept/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PizarraConceptPageWithSuspense
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$barlow_condensed_b8d6230f$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[next]/internal/font/google/barlow_condensed_b8d6230f.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$BouncingBall$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/BouncingBall.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$CourtAdVideoOrIframe$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/CourtAdVideoOrIframe.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtPlaylists$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/courtPlaylists.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolveMatchTeamLines$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resolveMatchTeamLines.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pizarraHeaderLabels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/pizarraHeaderLabels.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolveDisplayMatchId$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resolveDisplayMatchId.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchOrderMeta$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/matchOrderMeta.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$brand$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/brand.ts [app-ssr] (ecmascript)");
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
function getCourtNum(m) {
    const n = Number(m?.court ?? (m?.courtIndex != null ? m.courtIndex + 1 : null));
    return Number.isFinite(n) && n > 0 ? n : null;
}
function isLiveLike(m) {
    const s = String(m?.status ?? '').toUpperCase();
    return s === 'LIVE' || s === 'IN_PROGRESS' || s === 'EN_CURSO' || s === 'WARM_UP' || s === 'PAUSED';
}
/** Une `data` JSONB con campos de fila; el marcador escribe en la raíz del JSON interno. */ function normalizeMatchForBoard(m) {
    if (!m || typeof m !== 'object') return m;
    const inner = m.data && typeof m.data === 'object' ? m.data : {};
    const { data: _d, ...rest } = m;
    return {
        ...inner,
        ...rest,
        id: rest.id
    };
}
function sameTournamentId(a, b) {
    return String(a || '').replace(/-/g, '').toLowerCase() === String(b || '').replace(/-/g, '').toLowerCase();
}
function matchBelongsToTournamentRow(m, tournamentId) {
    const tid = String(tournamentId || '').trim();
    if (!tid) return true;
    const mt = String(m?.tournament_id ?? m?.tournamentId ?? '').trim();
    if (!mt) return true;
    return sameTournamentId(mt, tid);
}
/** El marker escribe el juego en vivo en `pizarra_cancha_state.data` (no siempre en tournament_matches). */ function canchaStateMatchesMatch(canchaData, tournamentId, matchId) {
    if (!canchaData || typeof canchaData !== 'object') return false;
    const mid = String(matchId || '').trim();
    const pid = String(canchaData.partido_id || canchaData.active_match_id || '').trim();
    if (!mid || pid !== mid) return false;
    return sameTournamentId(String(canchaData.torneo_id || ''), tournamentId);
}
/** Convierte marcador de cancha (local/visitante) al shape que usa computeBoardView (t1/t2). */ function mergeCanchaMarcadorIntoMatch(matchRaw, lm) {
    const m = normalizeMatchForBoard(matchRaw);
    if (!lm || typeof lm !== 'object') return m;
    const out = {
        ...m
    };
    const puntos = lm.puntos;
    if (puntos && typeof puntos === 'object') {
        out.points = {
            t1: String(puntos.local ?? m.points?.t1 ?? '0'),
            t2: String(puntos.visitante ?? m.points?.t2 ?? '0')
        };
    }
    if (lm.games && typeof lm.games === 'object') {
        out.games = {
            t1: Number(lm.games.local ?? 0),
            t2: Number(lm.games.visitante ?? 0)
        };
    }
    if (lm.sets && typeof lm.sets === 'object') {
        out.sets = {
            t1: Number(lm.sets.local ?? 0),
            t2: Number(lm.sets.visitante ?? 0)
        };
    }
    if (Array.isArray(lm.historico_sets) && lm.historico_sets.length > 0) {
        out.setScores = lm.historico_sets.map((h)=>({
                t1: h.local ?? 0,
                t2: h.visitante ?? 0
            }));
    }
    if (lm.saque && typeof lm.saque === 'object') {
        out.server = {
            team: Number(lm.saque.equipo ?? 1),
            player: Number(lm.saque.jugador ?? 1)
        };
    }
    return out;
}
/** Clave `cancha_N` alineada con la sala marker: `courtId` en URL o pista del partido. */ function resolvePizarraCanchaIdForBoard(match, courtIdParam) {
    const n = Number(courtIdParam);
    if (Number.isFinite(n) && n > 0) return `cancha_${Math.floor(n)}`;
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].courtToPizarraCanchaId(match);
}
/** Lee puntos con todas las variantes que usa el marcador / pizarra legacy. */ function extractDisplayPoints(match) {
    const m = match || {};
    const p = m.points;
    if (p && typeof p === 'object' && !Array.isArray(p) && ('t1' in p || 't2' in p)) {
        return [
            String(p.t1 ?? '0'),
            String(p.t2 ?? '0')
        ];
    }
    if (p && typeof p === 'object' && !Array.isArray(p)) {
        const a = p.team1 ?? p.local;
        const b = p.team2 ?? p.visitante;
        if (a != null || b != null) return [
            String(a ?? '0'),
            String(b ?? '0')
        ];
    }
    const pun = m.puntos;
    if (pun && typeof pun === 'object') {
        return [
            String(pun.local ?? pun.t1 ?? '0'),
            String(pun.visitante ?? pun.t2 ?? '0')
        ];
    }
    const tb = m.tiebreakScore;
    if (tb && typeof tb === 'object') {
        return [
            String(tb.t1 ?? '0'),
            String(tb.t2 ?? '0')
        ];
    }
    const stb = m.superTiebreakScore;
    if (stb && typeof stb === 'object') {
        return [
            String(stb.t1 ?? '0'),
            String(stb.t2 ?? '0')
        ];
    }
    return [
        String(m.currentPointsA ?? '0'),
        String(m.currentPointsB ?? '0')
    ];
}
function splitTeamLine(line, d1, d2) {
    const parts = line.split(/\s*\/\s*/).map((x)=>x.trim()).filter(Boolean);
    if (parts.length >= 2) return [
        parts[0].toUpperCase(),
        parts[1].toUpperCase()
    ];
    if (parts.length === 1) return [
        parts[0].toUpperCase(),
        d2
    ];
    return [
        d1,
        d2
    ];
}
const DEFAULT_BOARD = {
    teamA: [
        'JUGADOR 1',
        'JUGADOR 2'
    ],
    teamB: [
        'JUGADOR 3',
        'JUGADOR 4'
    ],
    set1A: '0',
    set1B: '0',
    set2A: '0',
    set2B: '0',
    pointsA: '0',
    pointsB: '0',
    serverPlayer: 'A1',
    tournamentNameLine: '—',
    courtHeaderLabel: '',
    venueLabel: '—',
    categoryGenderLine: '— · —',
    categoryLine: '—',
    genderLine: '—',
    tickerPrimary: 'SMART PADEL TV · MARCADOR EN VIVO',
    tickerSecondary: 'SMART PADEL TV'
};
/** Marcador neutro si falla la carga del partido (RLS / API / id). */ const FALLBACK_EMPTY_BOARD = {
    teamA: [
        'JUGADOR 1',
        'JUGADOR 2'
    ],
    teamB: [
        'JUGADOR 3',
        'JUGADOR 4'
    ],
    set1A: '0',
    set1B: '0',
    set2A: '0',
    set2B: '0',
    pointsA: '0',
    pointsB: '0',
    serverPlayer: 'A1',
    tournamentNameLine: '—',
    courtHeaderLabel: '',
    venueLabel: '—',
    categoryGenderLine: '— · —',
    categoryLine: '—',
    genderLine: '—',
    tickerPrimary: 'PARTIDO NO DISPONIBLE · REVISA ID / PERMISOS / CONEXIÓN',
    tickerSecondary: 'SMART PADEL TV'
};
function boardOnLoadError(complex, courtNum, courtIdParam) {
    const cn = courtNum != null && Number.isFinite(courtNum) && courtNum >= 1 ? Math.floor(courtNum) : (()=>{
        const n = Number(String(courtIdParam || '').trim());
        return Number.isFinite(n) && n >= 1 ? Math.floor(n) : null;
    })();
    const venue = String(complex || '').trim();
    return {
        ...FALLBACK_EMPTY_BOARD,
        courtHeaderLabel: cn != null ? `PISTA ${cn}` : '',
        venueLabel: (venue || 'SEDE').toUpperCase()
    };
}
function computeBoardView(matchRaw, tournament) {
    const match = normalizeMatchForBoard(matchRaw);
    const { team1: line1, team2: line2 } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolveMatchTeamLines$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveMatchTeamLines"])(match, tournament);
    const teamA = splitTeamLine(line1, 'JUGADOR A1', 'JUGADOR A2');
    const teamB = splitTeamLine(line2, 'JUGADOR B1', 'JUGADOR B2');
    const gs = Array.isArray(match?.games_sets) ? match.games_sets : [];
    const scoreSets = Array.isArray(match?.setScores) ? match.setScores : [];
    let set1A = '0';
    let set1B = '0';
    let set2A = '0';
    let set2B = '0';
    if (gs.length >= 1) {
        set1A = String(gs[0]?.t1 ?? 0);
        set1B = String(gs[0]?.t2 ?? 0);
    } else {
        const s1 = scoreSets[0] ?? {};
        set1A = String(s1.t1 ?? s1.team1 ?? '0');
        set1B = String(s1.t2 ?? s1.team2 ?? '0');
    }
    if (gs.length >= 2) {
        set2A = String(gs[1]?.t1 ?? 0);
        set2B = String(gs[1]?.t2 ?? 0);
    } else {
        const s2 = scoreSets[1] ?? {};
        set2A = String(s2.t1 ?? s2.team1 ?? '0');
        set2B = String(s2.t2 ?? s2.team2 ?? '0');
    }
    const [pt1, pt2] = extractDisplayPoints(match);
    const gNow = match?.games;
    const hasGs = gs.length > 0;
    const hasSs = scoreSets.length > 0;
    if (!hasGs && !hasSs && gNow && typeof gNow === 'object') {
        set1A = String(gNow.t1 ?? 0);
        set1B = String(gNow.t2 ?? 0);
        set2A = '0';
        set2B = '0';
    } else if (!hasGs && scoreSets.length === 1 && gNow && typeof gNow === 'object') {
        set2A = String(gNow.t1 ?? 0);
        set2B = String(gNow.t2 ?? 0);
    }
    const serveTeam = match?.serverTeam === 'B' || match?.server?.team === 2 || match?.saque?.equipo === 2 ? 'B' : 'A';
    const rawJ = match?.saque?.jugador ?? match?.serverPlayer ?? match?.server?.player ?? null;
    let sp;
    if (rawJ === 'A1' || rawJ === 'A2' || rawJ === 'B1' || rawJ === 'B2') sp = rawJ;
    else if (Number(rawJ) === 2) sp = `${serveTeam}2`;
    else sp = `${serveTeam}1`;
    const tName = String(match?.tournamentName ?? tournament?.name ?? tournament?.title ?? 'TORNEO').trim();
    const courtNameRaw = String(match?.courtName ?? '').trim();
    const courtNum = Number.isFinite(Number(match?.court)) ? Number(match.court) : Number.isFinite(Number(match?.courtIndex)) ? Number(match.courtIndex) + 1 : null;
    const courtHeaderLabel = (courtNameRaw ? courtNameRaw.toUpperCase() : courtNum != null && courtNum >= 1 ? `PISTA ${courtNum}` : '').trim();
    const tournamentNameLine = (tName.toUpperCase() || 'TORNEO').trim();
    const venue = String(match?.venueName ?? match?.complexName ?? tournament?.complexName ?? tournament?.venueName ?? tournament?.sede ?? '').trim();
    const venueLabel = (venue || 'SEDE').toUpperCase();
    const catRaw = String(match?.category ?? tournament?.category ?? '').trim();
    const [catPart, genPart] = catRaw.split('/').map((x)=>x.trim());
    const cat = catPart || 'CATEGORIA';
    const catLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pizarraHeaderLabels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatPizarraCategoryLevel"])(cat) || cat;
    const genRaw = genPart || String(match?.phase ?? match?.tournamentPhase ?? tournament?.gender ?? '').trim();
    const gen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pizarraHeaderLabels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatPizarraGender"])(genRaw) || (genRaw ? genRaw : 'GÉNERO');
    const genUpper = gen.toLocaleUpperCase('es');
    const categoryGenderLine = `${catLabel.toUpperCase()} · ${genUpper}`;
    const categoryLine = catLabel.toUpperCase();
    const tickerPrimary = `PARTIDO EN CURSO · ${tName.toUpperCase()} · ${venue.toUpperCase() || 'SEDE'}`;
    const tickerSecondary = `SMART PADEL TV · ${line1.toUpperCase()} VS ${line2.toUpperCase()}`;
    return {
        teamA,
        teamB,
        set1A,
        set1B,
        set2A,
        set2B,
        pointsA: pt1,
        pointsB: pt2,
        serverPlayer: sp,
        tournamentNameLine,
        courtHeaderLabel,
        venueLabel,
        categoryGenderLine,
        categoryLine,
        genderLine: genUpper,
        tickerPrimary,
        tickerSecondary
    };
}
function pickMatchFromList(matches, opts) {
    if (!matches?.length) return null;
    const complex = opts.complexFilter?.trim().toLowerCase() || '';
    const filterComplex = (m)=>{
        if (!complex) return true;
        const v = String(m?.venueName ?? m?.complexName ?? '').toLowerCase();
        return v.includes(complex) || complex.includes(v);
    };
    const list = complex ? matches.filter(filterComplex) : matches;
    // IDs: igual que display legacy (UUID, match_N, m_ts, court_N).
    if (opts.matchId?.trim()) {
        const mid = opts.matchId.trim();
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolveDisplayMatchId$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveMatchFromTournamentList"])(list, mid);
    }
    if (opts.courtNum != null && Number.isFinite(opts.courtNum)) {
        const onCourt = list.filter((m)=>getCourtNum(m) === opts.courtNum);
        const live = onCourt.find(isLiveLike);
        if (live) return live;
        if (onCourt[0]) return onCourt[0];
    }
    if (opts.viewBracket) {
        const live = list.find(isLiveLike);
        if (live) return live;
    }
    return list[0] ?? null;
}
function resolveWeatherZoneQuery(venueLabel) {
    const v = venueLabel.toLowerCase();
    // Regla operativa local:
    // - El Bodeguero pertenece a Arismendi.
    // - Resto de sedes en la zona: Maneiro.
    if (v.includes('bodeguero')) {
        return 'Municipio Arismendi, Nueva Esparta, Venezuela';
    }
    return 'Municipio Maneiro, Nueva Esparta, Venezuela';
}
/** Logo de cabecera: el mismo `sponsorLogoUrl` guardado al crear/editar el evento (hub / generador). */ function resolveTournamentHeaderLogoUrl(tournament) {
    if (!tournament || typeof tournament !== 'object') return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$brand$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_EVENT_SPONSOR_LOGO_URL"];
    const t = tournament;
    const direct = String(t.sponsorLogoUrl ?? '').trim();
    if (direct) return direct;
    const bs = t.broadcastingSettings;
    if (bs && typeof bs === 'object') {
        const sponsors = bs.sponsors;
        if (Array.isArray(sponsors) && sponsors[0]?.logoUrl) {
            const u = String(sponsors[0].logoUrl).trim();
            if (u) return u;
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$brand$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_EVENT_SPONSOR_LOGO_URL"];
}
/** Temperatura actual por municipio de la sede (geocodificación + Open-Meteo). */ async function fetchTemperatureForVenueName(venueLabel) {
    const base = venueLabel.trim();
    if (!base) return null;
    const zoneQuery = resolveWeatherZoneQuery(base);
    const tryNames = [
        zoneQuery,
        `${zoneQuery}, VE`,
        base,
        `${base}, Venezuela`
    ];
    for (const name of tryNames){
        try {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=es`, {
                cache: 'no-store'
            });
            if (!geoRes.ok) continue;
            const geo = await geoRes.json();
            const r0 = geo?.results?.[0];
            const lat = Number(r0?.latitude);
            const lon = Number(r0?.longitude);
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
            const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`, {
                cache: 'no-store'
            });
            if (!wRes.ok) continue;
            const w = await wRes.json();
            const v = Number(w?.current?.temperature_2m);
            if (Number.isFinite(v)) return `${Math.round(v)}°C`;
        } catch  {
        /* siguiente variante */ }
    }
    return null;
}
function PizarraConceptPage() {
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabaseClient"])(), []);
    const tournamentId = searchParams.get('tournamentId') || '';
    const matchIdParam = searchParams.get('matchId') || '';
    const courtIdParam = searchParams.get('courtId') || '';
    const viewParam = searchParams.get('view') || '';
    const tournamentIdsParam = searchParams.get('tournamentIds') || '';
    const complexParam = searchParams.get('complex') || searchParams.get('venue') || '';
    const courtNum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const n = Number(courtIdParam);
        return Number.isFinite(n) && n > 0 ? n : null;
    }, [
        courtIdParam
    ]);
    const viewBracket = viewParam.toLowerCase() === 'bracket';
    const multiTournamentIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>tournamentIdsParam.split(',').map((s)=>s.trim()).filter(Boolean), [
        tournamentIdsParam
    ]);
    const noUrlParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>!tournamentId.trim() && !matchIdParam.trim() && multiTournamentIds.length === 0, [
        tournamentId,
        matchIdParam,
        multiTournamentIds.length
    ]);
    const [matchSnapshot, setMatchSnapshot] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [tournamentSnapshot, setTournamentSnapshot] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const headerLogoUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>resolveTournamentHeaderLogoUrl(tournamentSnapshot), [
        tournamentSnapshot
    ]);
    const [loadError, setLoadError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    /** Marcador en vivo desde `pizarra_cancha_state` (misma fuente que el marker). */ const [canchaMarcador, setCanchaMarcador] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    /** Playlists desde `cancha_publicidad` (misma fuente que Smart Display / admin publicidad). */ const [adsPlaylist, setAdsPlaylist] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [carouselPlaylist, setCarouselPlaylist] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [carouselDurations, setCarouselDurations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [currentAdIdx, setCurrentAdIdx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [currentCarouselIdx, setCurrentCarouselIdx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    /** Mensajes de tira informativa (`cancha_tira` + `tira_informativa`), misma lógica que /display/court. */ const [tiraMessages, setTiraMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [now, setNow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Date());
    const [ambientTempC, setAmbientTempC] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('--°C');
    const tournamentCacheRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const publicidadCanchaId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (matchSnapshot) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtPlaylists$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["canchaIdStoredForPublicidadTables"])(resolvePizarraCanchaIdForBoard(matchSnapshot, courtIdParam));
        }
        const n = Number(courtIdParam);
        if (Number.isFinite(n) && n > 0) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtPlaylists$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["canchaIdStoredForPublicidadTables"])(String(Math.floor(n)));
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtPlaylists$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["canchaIdStoredForPublicidadTables"])('1');
    }, [
        matchSnapshot,
        courtIdParam
    ]);
    const publicidadVenueName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const fromUrl = complexParam.trim();
        if (fromUrl) return fromUrl;
        const t = tournamentSnapshot;
        return String(t?.complexName ?? t?.venueName ?? t?.complex?.name ?? '').trim();
    }, [
        complexParam,
        tournamentSnapshot
    ]);
    const loadPlaylists = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (!supabase) return;
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtPlaylists$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchCanchaPlaylistRows"])(supabase, publicidadCanchaId, publicidadVenueName || null);
        if (result.error || result.data == null) return;
        const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtPlaylists$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeCourtPlaylistRows"])(result.data || []);
        const { video, imagen } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtPlaylists$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["partitionPlaylistRows"])(rows);
        setAdsPlaylist(video.map((r)=>r.media_content?.url ?? '').filter(Boolean));
        const imgUrls = imagen.map((r)=>r.media_content?.url ?? '').filter(Boolean);
        const imgDurs = imagen.map((r)=>Math.max(3, Number(r.duracion_segundos) || 8));
        setCarouselPlaylist(imgUrls);
        setCarouselDurations(imgDurs);
        setCurrentAdIdx(0);
        setCurrentCarouselIdx(0);
    }, [
        supabase,
        publicidadCanchaId,
        publicidadVenueName
    ]);
    const loadTiraMessages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (!supabase) return;
        const msgs = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtPlaylists$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchCanchaTiraMessages"])(supabase, publicidadCanchaId, publicidadVenueName || null);
        setTiraMessages(Array.isArray(msgs) ? msgs : []);
    }, [
        supabase,
        publicidadCanchaId,
        publicidadVenueName
    ]);
    const effectiveMatchIdForCancha = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!matchSnapshot) return '';
        return matchIdParam.trim() || String(normalizeMatchForBoard(matchSnapshot).id ?? matchSnapshot?.id ?? '').trim();
    }, [
        matchIdParam,
        matchSnapshot
    ]);
    const effectiveTournamentIdForCancha = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const fromUrl = tournamentId.trim();
        if (fromUrl) return fromUrl;
        const m = matchSnapshot ? normalizeMatchForBoard(matchSnapshot) : null;
        return String(m?.tournament_id ?? matchSnapshot?.tournamentId ?? '').trim();
    }, [
        tournamentId,
        matchSnapshot
    ]);
    const board = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (loadError) {
            return boardOnLoadError(complexParam, courtNum, courtIdParam);
        }
        if (!matchSnapshot) return DEFAULT_BOARD;
        const merged = mergeCanchaMarcadorIntoMatch(matchSnapshot, canchaMarcador);
        return computeBoardView(merged, tournamentSnapshot);
    }, [
        loadError,
        complexParam,
        courtNum,
        courtIdParam,
        matchSnapshot,
        tournamentSnapshot,
        canchaMarcador
    ]);
    /** Nº de partido (orden en planilla); solo informativo en esquina. */ const matchOrderNumber = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const m = matchSnapshot ? normalizeMatchForBoard(matchSnapshot) : null;
        if (!m) return null;
        const raw = m.match_number ?? m.matchNumber ?? m.order ?? m.orden;
        const n = Number(raw);
        if (Number.isFinite(n) && n >= 1) return Math.floor(n);
        const fromId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchOrderMeta$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["inferMatchOrderFromId"])(m.id);
        if (fromId != null && fromId >= 1) return fromId;
        return null;
    }, [
        matchSnapshot
    ]);
    const boardHeaderMetaLine = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const timeStr = now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        return `${timeStr} · TEMP ${ambientTempC}`;
    }, [
        now,
        ambientTempC
    ]);
    /** Pista/cancha debajo de la sede: mismo criterio que el marcador o `?courtId=` en la URL. */ const headerCourtLine = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const fromBoard = String(board.courtHeaderLabel || '').trim();
        if (fromBoard) return fromBoard;
        if (courtNum != null && Number.isFinite(courtNum) && courtNum >= 1) {
            return `PISTA ${Math.floor(courtNum)}`;
        }
        return '';
    }, [
        board.courtHeaderLabel,
        courtNum
    ]);
    /** Texto para geoclima: sede del torneo/partido (no ubicación del dispositivo). */ const venueForWeather = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (complexParam.trim()) return complexParam.trim();
        if (publicidadVenueName.trim()) return publicidadVenueName.trim();
        const m = matchSnapshot ? normalizeMatchForBoard(matchSnapshot) : null;
        const fromMatch = String(m?.venueName ?? m?.complexName ?? '').trim();
        if (fromMatch) return fromMatch;
        const t = tournamentSnapshot;
        return String(t?.complexName ?? t?.venueName ?? t?.sede ?? t?.location ?? t?.complex?.name ?? '').trim();
    }, [
        complexParam,
        publicidadVenueName,
        matchSnapshot,
        tournamentSnapshot
    ]);
    /** Texto del marquee inferior: prioriza tira de admin; si no hay, tickers derivados del partido. */ const footerTickerSegments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const tiraParts = tiraMessages.map((m)=>String(m.mensaje ?? '').trim()).filter(Boolean);
        if (tiraParts.length > 0) return {
            source: 'tira',
            parts: tiraParts
        };
        const fromBoard = [
            board.tickerPrimary,
            board.tickerSecondary
        ].filter(Boolean);
        return {
            source: 'board',
            parts: fromBoard.length > 0 ? fromBoard : [
                board.tickerPrimary || 'SMART PADEL TV'
            ]
        };
    }, [
        tiraMessages,
        board.tickerPrimary,
        board.tickerSecondary
    ]);
    const refreshFromTournament = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (tid, matchesFromSub)=>{
        try {
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabaseClient"])()) {
                setLoadError('Falta Supabase en el cliente: define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY (.env.local) y reinicia el servidor.');
                return;
            }
            let tournament = tournamentCacheRef.current?.tid === tid ? tournamentCacheRef.current.data : null;
            if (!tournament) {
                tournament = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getTournament(tid);
                tournamentCacheRef.current = {
                    tid,
                    data: tournament
                };
            }
            const mid = matchIdParam.trim();
            if (mid) {
                let m = null;
                try {
                    const r = await fetch(`/api/pizarra/match?tournamentId=${encodeURIComponent(tid)}&matchId=${encodeURIComponent(mid)}`, {
                        cache: 'no-store'
                    });
                    if (r.ok) {
                        const j = await r.json();
                        m = j?.match ?? null;
                    }
                } catch  {
                /* fallback cliente */ }
                if (!m) m = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getMatchById(tid, mid);
                if (!m) {
                    const list = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getMatches(tid);
                    m = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolveDisplayMatchId$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveMatchFromTournamentList"])(list, mid);
                }
                if (!m) {
                    setLoadError('No se encontró el partido o no hay acceso de lectura (id / RLS / API).');
                    return;
                }
                if (!matchBelongsToTournamentRow(m, tid)) {
                    setLoadError('El partido no corresponde al torneo de la URL.');
                    return;
                }
                setLoadError(null);
                setTournamentSnapshot(tournament);
                setMatchSnapshot(m);
                return;
            }
            const list = matchesFromSub ?? await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getMatches(tid);
            // Si la vista viene por cancha, priorizar el partido activo que reporta pizarra_cancha_state.
            if (courtNum != null && Number.isFinite(courtNum)) {
                try {
                    const canchaState = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getPizarraCanchaState(`cancha_${Math.floor(courtNum)}`);
                    const stData = canchaState?.data || {};
                    const stMid = String(stData?.partido_id || stData?.active_match_id || '').trim();
                    const stTid = String(stData?.torneo_id || '').trim();
                    if (stMid && !stMid.startsWith('live_') && (!stTid || sameTournamentId(stTid, tid))) {
                        const byState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolveDisplayMatchId$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveMatchFromTournamentList"])(list, stMid);
                        if (byState && matchBelongsToTournamentRow(byState, tid)) {
                            setLoadError(null);
                            setTournamentSnapshot(tournament);
                            setMatchSnapshot(byState);
                            return;
                        }
                    }
                } catch  {
                // fallback normal por lista/status/cancha
                }
            }
            const picked = pickMatchFromList(list, {
                matchId: matchIdParam,
                courtNum,
                viewBracket,
                complexFilter: complexParam || null
            });
            if (!picked) {
                setLoadError('No hay partido para mostrar (revisa torneo, pista o ID).');
                return;
            }
            if (!matchBelongsToTournamentRow(picked, tid)) {
                setLoadError('El partido listado no corresponde al torneo de la URL.');
                return;
            }
            setLoadError(null);
            setTournamentSnapshot(tournament);
            setMatchSnapshot(picked);
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            console.warn('[pizarra-concept] refreshFromTournament', e);
            if (msg.includes('Supabase no configurado') || msg.includes('Falta')) {
                setLoadError('Supabase no está configurado. Revisa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.');
            } else {
                setLoadError(`Error al cargar: ${msg.slice(0, 120)}`);
            }
        }
    }, [
        matchIdParam,
        courtNum,
        viewBracket,
        complexParam
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const t = window.setInterval(()=>setNow(new Date()), 60_000);
        return ()=>window.clearInterval(t);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        const run = async ()=>{
            if (!venueForWeather) {
                if (!cancelled) setAmbientTempC('--°C');
                return;
            }
            const temp = await fetchTemperatureForVenueName(venueForWeather);
            if (!cancelled) setAmbientTempC(temp ?? '--°C');
        };
        void run();
        const id = window.setInterval(run, 15 * 60_000);
        return ()=>{
            cancelled = true;
            window.clearInterval(id);
        };
    }, [
        venueForWeather
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        tournamentCacheRef.current = null;
    }, [
        tournamentId
    ]);
    // Marker: el juego en vivo vive en `pizarra_cancha_state`; fusionamos `marcador` si coincide torneo+partido+pista.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const tid = effectiveTournamentIdForCancha;
        const mid = effectiveMatchIdForCancha;
        if (!tid || !matchSnapshot || !mid) {
            setCanchaMarcador(null);
            return;
        }
        const cid = resolvePizarraCanchaIdForBoard(matchSnapshot, courtIdParam);
        const apply = (d)=>{
            if (!canchaStateMatchesMatch(d, tid, mid)) {
                setCanchaMarcador(null);
                return;
            }
            setCanchaMarcador(d?.marcador ?? null);
        };
        void __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getPizarraCanchaState(cid).then((row)=>apply(row?.data));
        const unsub = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].subscribePizarraCanchaState(cid, (row)=>apply(row?.data));
        return ()=>{
            unsub?.();
        };
    }, [
        effectiveTournamentIdForCancha,
        effectiveMatchIdForCancha,
        matchSnapshot,
        courtIdParam
    ]);
    // Publicidad + tira informativa (mismas tablas que /admin/publicidad por sede/pista).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!supabase) return;
        void loadPlaylists();
        void loadTiraMessages();
        const poll = window.setInterval(()=>{
            void loadPlaylists();
            void loadTiraMessages();
        }, 45_000);
        const ch = supabase.channel(`pizarra_concept_pub_${publicidadCanchaId}`).on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'cancha_publicidad',
            filter: `cancha_id=eq.${publicidadCanchaId}`
        }, ()=>void loadPlaylists()).on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'cancha_tira'
        }, ()=>{
            void loadTiraMessages();
        }).on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'tira_informativa'
        }, ()=>{
            void loadTiraMessages();
        }).subscribe();
        return ()=>{
            window.clearInterval(poll);
            supabase.removeChannel(ch);
        };
    }, [
        supabase,
        loadPlaylists,
        loadTiraMessages,
        publicidadCanchaId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (carouselPlaylist.length <= 1) return;
        const dur = (carouselDurations[currentCarouselIdx] ?? 8) * 1000;
        const id = window.setTimeout(()=>{
            setCurrentCarouselIdx((prev)=>(prev + 1) % carouselPlaylist.length);
        }, dur);
        return ()=>window.clearTimeout(id);
    }, [
        carouselPlaylist,
        currentCarouselIdx,
        carouselDurations
    ]);
    // Un torneo: suscripción + polling (3s como la pizarra legacy display).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!tournamentId) return;
        let cancelled = false;
        void refreshFromTournament(tournamentId, null);
        const unsub = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].subscribeToMatches(tournamentId, ()=>{
            if (cancelled) return;
            void refreshFromTournament(tournamentId, null);
        });
        const pollMs = 3000;
        const poll = window.setInterval(()=>{
            if (cancelled) return;
            void refreshFromTournament(tournamentId, null);
        }, pollMs);
        return ()=>{
            cancelled = true;
            unsub?.();
            window.clearInterval(poll);
        };
    }, [
        tournamentId,
        matchIdParam,
        refreshFromTournament
    ]);
    // Varios torneos (p. ej. ?tournamentIds=a,b): primer partido en vivo entre ellos, refresco periódico
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (tournamentId || multiTournamentIds.length === 0) return;
        let cancelled = false;
        const tick = async ()=>{
            try {
                const live = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getLiveMatches();
                if (cancelled) return;
                const allowed = new Set(multiTournamentIds);
                const pick = live.find((m)=>allowed.has(String(m.tournamentId)));
                if (!pick) {
                    setLoadError('Ningún partido en vivo en los torneos seleccionados.');
                    return;
                }
                setLoadError(null);
                const tournament = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getTournament(String(pick.tournamentId));
                setTournamentSnapshot(tournament);
                setMatchSnapshot(pick);
            } catch  {
                if (!cancelled) setLoadError('No se pudo cargar el estado de los torneos.');
            }
        };
        void tick();
        const id = window.setInterval(tick, 8000);
        return ()=>{
            cancelled = true;
            window.clearInterval(id);
        };
    }, [
        tournamentId,
        multiTournamentIds
    ]);
    // Sin tournamentId: cargar por id de partido (UUID o slug m-…).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const mid = matchIdParam.trim();
        if (tournamentId || multiTournamentIds.length > 0 || !mid) return;
        if (!supabase) {
            setLoadError('Falta Supabase en el cliente: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.');
            return;
        }
        let cancelled = false;
        const load = async ()=>{
            try {
                const { data: row, error } = await supabase.from('tournament_matches').select('tournament_id, data').eq('id', mid).maybeSingle();
                if (cancelled) return;
                if (error || !row) {
                    setLoadError(error ? `Partido: ${error.message}` : 'Partido no encontrado.');
                    return;
                }
                const tid = String(row.tournament_id || '');
                const merged = {
                    id: mid,
                    ...row.data || {},
                    tournament_id: tid
                };
                const tournament = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getTournament(tid);
                setLoadError(null);
                setTournamentSnapshot(tournament);
                setMatchSnapshot(merged);
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                console.warn('[pizarra-concept] load by matchId', e);
                if (!cancelled) {
                    if (msg.includes('Supabase no configurado')) {
                        setLoadError('Supabase no configurado (.env.local).');
                    } else {
                        setLoadError(`No se pudo cargar el partido: ${msg.slice(0, 100)}`);
                    }
                }
            }
        };
        void load();
        return ()=>{
            cancelled = true;
        };
    }, [
        supabase,
        tournamentId,
        multiTournamentIds.length,
        matchIdParam
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative flex h-dvh w-screen flex-col overflow-hidden bg-[#0f1115] text-white",
        children: [
            matchOrderNumber != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pointer-events-none absolute left-0 top-0 z-[100] select-none px-[0.22rem] pt-[0.15rem] sm:px-1 sm:pt-0.5",
                "aria-hidden": true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-[clamp(0.42rem,0.85vh,0.55rem)] font-semibold tabular-nums tracking-[0.2em] text-white/[0.14]",
                    children: [
                        "P.",
                        matchOrderNumber
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                    lineNumber: 981,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                lineNumber: 977,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-auto flex min-h-0 w-full max-w-[1800px] flex-1 flex-col overflow-hidden px-4 pt-0 pb-2 sm:px-6 lg:px-10",
                children: [
                    loadError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-2 text-center text-xs font-bold uppercase tracking-widest text-amber-400/90",
                        children: loadError
                    }, void 0, false, {
                        fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                        lineNumber: 988,
                        columnNumber: 11
                    }, this),
                    noUrlParams && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-2 px-3 text-center text-[11px] leading-relaxed text-white/45",
                        children: [
                            "Añade en la URL",
                            ' ',
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-mono text-[#ccff00]/80",
                                children: '?tournamentId=…&matchId=…'
                            }, void 0, false, {
                                fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                lineNumber: 995,
                                columnNumber: 13
                            }, this),
                            ' ',
                            "(o solo ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-mono text-[#ccff00]/80",
                                children: "?matchId=…"
                            }, void 0, false, {
                                fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                lineNumber: 996,
                                columnNumber: 21
                            }, this),
                            " con el id del partido)."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                        lineNumber: 993,
                        columnNumber: 11
                    }, this),
                    matchSnapshot && String(normalizeMatchForBoard(matchSnapshot).status ?? '').toUpperCase().trim() === 'PENDING' && !canchaMarcador && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-2 max-w-2xl px-3 text-center text-[11px] font-semibold leading-snug text-amber-200/95",
                        children: [
                            "Este partido está ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-black",
                                children: "PENDING"
                            }, void 0, false, {
                                fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                lineNumber: 1005,
                                columnNumber: 33
                            }, this),
                            " (no iniciado en el cuadro). Si ya marcas desde la sala marker, la pizarra usará ese marcador; si no, en el panel del árbitro pulsa «Empezar partido» para sincronizar el estado en la base de datos."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                        lineNumber: 1004,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "mb-1 flex shrink-0 flex-col items-center gap-0.5 text-center pt-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 flex h-[clamp(2.3rem,4.4vh,3.5rem)] w-[clamp(2.3rem,4.4vh,3.5rem)] items-center justify-center overflow-hidden rounded-2xl border border-[#d6b35a]/50 bg-[#0e2238] shadow-[0_0_22px_rgba(214,179,90,0.25)]",
                                children: headerLogoUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: headerLogoUrl,
                                    alt: "Logo del torneo",
                                    className: "h-full w-full object-contain"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                    lineNumber: 1013,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex h-full w-full items-center justify-center bg-[#10243d] px-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#ccff00]",
                                    children: "EVENTO"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                    lineNumber: 1019,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                lineNumber: 1011,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "-mt-0.5 flex flex-col items-center gap-0.5 px-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-[clamp(1rem,2.6vh,1.8rem)] font-bold tracking-[0.03em] text-white/95",
                                        children: board.venueLabel
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                        lineNumber: 1025,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex max-w-[min(100%,36rem)] flex-col items-center gap-1 text-center sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-2 sm:gap-y-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "min-w-0 text-[clamp(0.85rem,1.9vh,1.25rem)] font-semibold tracking-[0.05em] text-white/85",
                                                children: board.tournamentNameLine
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                lineNumber: 1029,
                                                columnNumber: 15
                                            }, this),
                                            headerCourtLine ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "hidden text-white/40 sm:inline",
                                                        "aria-hidden": true,
                                                        children: "·"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                        lineNumber: 1034,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[clamp(0.75rem,1.65vh,1.05rem)] font-bold uppercase tracking-[0.08em] text-[#ccff00]/90",
                                                        children: headerCourtLine
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                        lineNumber: 1037,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true) : null
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                        lineNumber: 1028,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "-mt-0.5 text-[clamp(0.6rem,1.25vh,0.78rem)] font-semibold uppercase tracking-[0.12em] text-[#90b6da]",
                                        children: boardHeaderMetaLine
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                        lineNumber: 1043,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                lineNumber: 1024,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                        lineNumber: 1010,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex min-h-0 flex-1 flex-col gap-2 overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                                className: "flex min-h-0 max-h-[min(38vh,calc(100dvh-18rem))] shrink-0 items-start justify-center overflow-y-auto sm:max-h-[min(44vh,calc(100dvh-20rem))]",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                                    className: `w-full max-w-[980px] overflow-hidden rounded-3xl border border-[#ccff00]/35 bg-[#0e1014] p-[clamp(0.55rem,1.6vh,1.25rem)] shadow-[0_0_40px_rgba(0,0,0,0.9),0_0_55px_rgba(204,255,0,0.14),inset_0_0_45px_rgba(255,255,255,0.03)] ${__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$barlow_condensed_b8d6230f$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].className}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mb-2 grid grid-cols-[1fr_clamp(2.7rem,5.7vw,4.5rem)_clamp(2.7rem,5.7vw,4.5rem)_clamp(2.7rem,5.7vw,4.5rem)] gap-2 border-b border-[#ccff00]/30 pb-1 text-center text-[clamp(0.58rem,1.2vh,0.75rem)] font-extrabold uppercase tracking-[0.16em] text-[#ccff00] drop-shadow-[0_0_6px_rgba(204,255,0,0.28)]",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-left",
                                                    children: "Jugadores"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                    lineNumber: 1055,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Set 1"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                    lineNumber: 1056,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Set 2"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                    lineNumber: 1057,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "PUNTOS"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                    lineNumber: 1058,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                            lineNumber: 1054,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "grid grid-cols-[1fr_clamp(2.7rem,5.7vw,4.5rem)_clamp(2.7rem,5.7vw,4.5rem)_clamp(2.7rem,5.7vw,4.5rem)] items-center gap-2 rounded-2xl border border-[#ccff00]/45 bg-gradient-to-r from-[#171a20] via-[#1a1e25] to-[#1d2129] p-[clamp(0.52rem,1.45vh,0.95rem)] shadow-[0_0_18px_rgba(204,255,0,0.18),inset_0_0_18px_rgba(204,255,0,0.04)]",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex min-w-0 items-center gap-2.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "h-5 w-5 shrink-0",
                                                                    children: board.serverPlayer === 'A1' || board.serverPlayer === 'A2' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$BouncingBall$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                        size: 12,
                                                                        duration: 850,
                                                                        bounceHeight: 0.4
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                                        lineNumber: 1066,
                                                                        columnNumber: 23
                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "inline-block h-2.5 w-2.5 rounded-full bg-white/25"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                                        lineNumber: 1068,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                                    lineNumber: 1064,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: `truncate text-[clamp(1.02rem,min(2.85vh,4.8vw),1.58rem)] font-black uppercase tracking-[0.05em] antialiased leading-[1.02] ${board.serverPlayer === 'A1' ? 'text-[#ccff00] drop-shadow-[0_0_12px_rgba(204,255,0,0.75)]' : 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.22)]'}`,
                                                                    children: board.teamA[0]
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                                    lineNumber: 1071,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-white/70",
                                                                    children: "/"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                                    lineNumber: 1080,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: `truncate text-[clamp(1.02rem,min(2.85vh,4.8vw),1.58rem)] font-black uppercase tracking-[0.05em] antialiased leading-[1.02] ${board.serverPlayer === 'A2' ? 'text-[#ccff00] drop-shadow-[0_0_12px_rgba(204,255,0,0.75)]' : 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.22)]'}`,
                                                                    children: board.teamA[1]
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                                    lineNumber: 1081,
                                                                    columnNumber: 19
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                            lineNumber: 1063,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-center text-[clamp(1.25rem,4.1vh,2.35rem)] font-extrabold text-white drop-shadow-[0_0_12px_rgba(204,255,0,0.35)]",
                                                            children: board.set1A
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                            lineNumber: 1091,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-center text-[clamp(1.25rem,4.1vh,2.35rem)] font-extrabold text-white drop-shadow-[0_0_12px_rgba(204,255,0,0.35)]",
                                                            children: board.set2A
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                            lineNumber: 1094,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-center text-[clamp(1.55rem,4.9vh,3rem)] font-black text-white drop-shadow-[0_0_18px_rgba(204,255,0,0.5)]",
                                                            children: board.pointsA
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                            lineNumber: 1097,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                    lineNumber: 1062,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "grid grid-cols-[1fr_clamp(2.7rem,5.7vw,4.5rem)_clamp(2.7rem,5.7vw,4.5rem)_clamp(2.7rem,5.7vw,4.5rem)] items-center gap-2 rounded-2xl border border-white/25 bg-[#14171c] p-[clamp(0.52rem,1.45vh,0.95rem)] shadow-[inset_0_0_34px_rgba(255,255,255,0.03)]",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex min-w-0 items-center gap-2.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "h-5 w-5 shrink-0",
                                                                    children: board.serverPlayer === 'B1' || board.serverPlayer === 'B2' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$BouncingBall$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                        size: 12,
                                                                        duration: 850,
                                                                        bounceHeight: 0.4
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                                        lineNumber: 1106,
                                                                        columnNumber: 23
                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "inline-block h-2.5 w-2.5 rounded-full bg-white/25"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                                        lineNumber: 1108,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                                    lineNumber: 1104,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: `truncate text-[clamp(1.02rem,min(2.85vh,4.8vw),1.58rem)] font-black uppercase tracking-[0.05em] antialiased leading-[1.02] ${board.serverPlayer === 'B1' ? 'text-[#ccff00] drop-shadow-[0_0_12px_rgba(204,255,0,0.75)]' : 'text-white/90'}`,
                                                                    children: board.teamB[0]
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                                    lineNumber: 1111,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-white/70",
                                                                    children: "/"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                                    lineNumber: 1120,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: `truncate text-[clamp(1.02rem,min(2.85vh,4.8vw),1.58rem)] font-black uppercase tracking-[0.05em] antialiased leading-[1.02] ${board.serverPlayer === 'B2' ? 'text-[#ccff00] drop-shadow-[0_0_12px_rgba(204,255,0,0.75)]' : 'text-white/90'}`,
                                                                    children: board.teamB[1]
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                                    lineNumber: 1121,
                                                                    columnNumber: 19
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                            lineNumber: 1103,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-center text-[clamp(1.25rem,4.1vh,2.35rem)] font-extrabold text-white drop-shadow-[0_0_10px_rgba(204,255,0,0.22)]",
                                                            children: board.set1B
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                            lineNumber: 1131,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-center text-[clamp(1.25rem,4.1vh,2.35rem)] font-extrabold text-white drop-shadow-[0_0_10px_rgba(204,255,0,0.22)]",
                                                            children: board.set2B
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                            lineNumber: 1134,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-center text-[clamp(1.55rem,4.9vh,3rem)] font-black text-white drop-shadow-[0_0_14px_rgba(204,255,0,0.28)]",
                                                            children: board.pointsB
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                            lineNumber: 1137,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                    lineNumber: 1102,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                            lineNumber: 1061,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                    lineNumber: 1051,
                                    columnNumber: 11
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                lineNumber: 1050,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "grid min-h-0 w-full flex-1 grid-cols-1 gap-3 [grid-template-rows:minmax(0,1fr)_minmax(0,1fr)] sm:grid-cols-2 sm:[grid-template-rows:minmax(0,1fr)] sm:gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative order-1 flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-[#ccff00]/35 bg-black shadow-[0_0_20px_rgba(204,255,0,0.12)] sm:order-none",
                                        children: adsPlaylist.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$CourtAdVideoOrIframe$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CourtAdVideoOrIframe"], {
                                            videoKey: `ad-${currentAdIdx}`,
                                            url: adsPlaylist[currentAdIdx],
                                            className: "absolute inset-0 box-border h-full w-full object-contain bg-black",
                                            loop: adsPlaylist.length === 1,
                                            onEnded: ()=>{
                                                if (adsPlaylist.length > 1) {
                                                    setCurrentAdIdx((prev)=>(prev + 1) % adsPlaylist.length);
                                                }
                                            },
                                            title: "Publicidad vídeo"
                                        }, `ad-${currentAdIdx}`, false, {
                                            fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                            lineNumber: 1149,
                                            columnNumber: 15
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex min-h-0 flex-1 items-center justify-center text-white/45",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "px-3 text-center text-[clamp(0.6rem,1.35vh,0.95rem)] font-bold uppercase tracking-[0.12em]",
                                                children: "ESPACIO PUBLICITARIO DISPONIBLE"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                lineNumber: 1164,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                            lineNumber: 1163,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                        lineNumber: 1147,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative order-2 flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border-0 bg-transparent shadow-none sm:order-none",
                                        children: carouselPlaylist.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                            mode: "wait",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].img, {
                                                src: carouselPlaylist[currentCarouselIdx],
                                                alt: "",
                                                initial: {
                                                    opacity: 0,
                                                    scale: 1.02
                                                },
                                                animate: {
                                                    opacity: 1,
                                                    scale: 1
                                                },
                                                exit: {
                                                    opacity: 0,
                                                    scale: 0.98
                                                },
                                                transition: {
                                                    duration: 0.45
                                                },
                                                className: "absolute inset-0 box-border h-full w-full min-h-0 bg-transparent object-contain object-center"
                                            }, `carousel-${currentCarouselIdx}`, false, {
                                                fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                lineNumber: 1174,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                            lineNumber: 1173,
                                            columnNumber: 15
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex min-h-0 flex-1 items-center justify-center text-white/45",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "px-3 text-center text-[clamp(0.6rem,1.35vh,0.95rem)] font-bold uppercase tracking-[0.12em]",
                                                children: "ESPACIO PUBLICITARIO DISPONIBLE"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                lineNumber: 1187,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                            lineNumber: 1186,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                        lineNumber: 1171,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                lineNumber: 1146,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                        lineNumber: 1049,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                        className: "relative z-30 mt-2 w-full shrink-0 overflow-hidden rounded-2xl border border-[#ccff00]/25 bg-[#0a0c10]/95 py-[clamp(0.3rem,1vh,0.75rem)] shadow-[0_-10px_40px_rgba(0,0,0,0.75),0_0_20px_rgba(204,255,0,0.12)] backdrop-blur-sm",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex whitespace-nowrap animate-marquee",
                            children: [
                                0,
                                1
                            ].map((half)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex shrink-0 items-center",
                                    children: footerTickerSegments.parts.map((segment, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "mx-8 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[#ccff00] shadow-[0_0_10px_rgba(204,255,0,0.7)]"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                    lineNumber: 1203,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `mr-12 text-[clamp(0.72rem,1.55vh,1rem)] font-black uppercase tracking-[0.14em] ${footerTickerSegments.source === 'tira' ? i % 2 === 0 ? 'text-[#ccff00]' : 'text-white/90' : i === 0 ? 'text-white/90' : 'text-[#ccff00]'}`,
                                                    children: segment
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                                    lineNumber: 1204,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, `${half}-${i}`, true, {
                                            fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                            lineNumber: 1202,
                                            columnNumber: 19
                                        }, this))
                                }, half, false, {
                                    fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                                    lineNumber: 1200,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                            lineNumber: 1198,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                        lineNumber: 1197,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                lineNumber: 986,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
        lineNumber: 975,
        columnNumber: 5
    }, this);
}
function PizarraConceptPageWithSuspense() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex h-dvh w-screen flex-col items-center justify-center overflow-hidden bg-[#0f1115] text-[#ccff00]",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs font-black uppercase tracking-widest",
                children: "Cargando pizarra…"
            }, void 0, false, {
                fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
                lineNumber: 1233,
                columnNumber: 11
            }, void 0)
        }, void 0, false, {
            fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
            lineNumber: 1232,
            columnNumber: 9
        }, void 0),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PizarraConceptPage, {}, void 0, false, {
            fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
            lineNumber: 1237,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/dev/pizarra-concept/page.tsx",
        lineNumber: 1230,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__902b5206._.js.map