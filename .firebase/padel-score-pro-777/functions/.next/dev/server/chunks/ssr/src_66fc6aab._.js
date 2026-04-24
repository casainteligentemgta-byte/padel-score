module.exports = [
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
"[project]/src/components/InvitationManager.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InvitationManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mail.js [app-ssr] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-ssr] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/award.js [app-ssr] (ecmascript) <export default as Award>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-ssr] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
function InvitationCards({ invitations, compact, processing, onRespond }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: compact ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
            mode: "popLayout",
            children: invitations.map((inv)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        y: 20
                    },
                    animate: {
                        opacity: 1,
                        y: 0
                    },
                    exit: {
                        opacity: 0,
                        scale: 0.95
                    },
                    className: `bg-zinc-900 border border-zinc-800 relative overflow-hidden group ${compact ? 'rounded-xl p-3' : 'rounded-2xl p-5'}`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute top-0 left-0 w-1 h-full bg-[#ccff00] opacity-50"
                        }, void 0, false, {
                            fileName: "[project]/src/components/InvitationManager.tsx",
                            lineNumber: 38,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `flex flex-col ${compact ? 'gap-2' : 'gap-4'}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: compact ? 'space-y-0.5' : 'space-y-1',
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `flex items-center gap-1.5 font-bold text-[#ccff00] uppercase tracking-wider ${compact ? 'text-[9px] leading-tight' : 'text-xs'}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                                    size: compact ? 10 : 12,
                                                    className: "shrink-0"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/InvitationManager.tsx",
                                                    lineNumber: 45,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "min-w-0 break-words",
                                                    children: inv.tournament_name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/InvitationManager.tsx",
                                                    lineNumber: 46,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/InvitationManager.tsx",
                                            lineNumber: 42,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: `font-bold text-white ${compact ? 'text-xs leading-snug' : 'text-lg'}`,
                                            children: [
                                                "De: ",
                                                inv.inviter_name
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/InvitationManager.tsx",
                                            lineNumber: 48,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `inline-flex items-center gap-1 rounded-full bg-zinc-800 text-zinc-300 font-medium border border-zinc-700 ${compact ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-0.5 text-xs gap-1.5'}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__["Award"], {
                                                    size: compact ? 10 : 12
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/InvitationManager.tsx",
                                                    lineNumber: 54,
                                                    columnNumber: 37
                                                }, this),
                                                inv.category
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/InvitationManager.tsx",
                                            lineNumber: 51,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/InvitationManager.tsx",
                                    lineNumber: 41,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `flex gap-1.5 ${compact ? 'flex-col' : 'flex-row'}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>onRespond(inv.id, 'accepted'),
                                            disabled: !!processing,
                                            className: `flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#ccff00] text-black font-bold hover:bg-[#b8e600] disabled:opacity-50 transition-all ${compact ? 'py-2 text-[11px]' : 'gap-2 py-2.5 text-sm'}`,
                                            children: processing === inv.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                size: compact ? 14 : 16,
                                                className: "animate-spin"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/InvitationManager.tsx",
                                                lineNumber: 67,
                                                columnNumber: 41
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                        size: compact ? 14 : 16
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/InvitationManager.tsx",
                                                        lineNumber: 70,
                                                        columnNumber: 45
                                                    }, this),
                                                    compact ? 'Aceptar' : 'Aceptar invitación'
                                                ]
                                            }, void 0, true)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InvitationManager.tsx",
                                            lineNumber: 60,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>onRespond(inv.id, 'rejected'),
                                            disabled: !!processing,
                                            className: `flex items-center justify-center rounded-xl border border-zinc-700 text-zinc-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all ${compact ? 'h-9 w-full text-[11px] font-bold' : 'aspect-square'}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                    size: compact ? 18 : 20
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/InvitationManager.tsx",
                                                    lineNumber: 81,
                                                    columnNumber: 37
                                                }, this),
                                                compact ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "ml-1",
                                                    children: "Rechazar"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/InvitationManager.tsx",
                                                    lineNumber: 82,
                                                    columnNumber: 48
                                                }, this) : null
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/InvitationManager.tsx",
                                            lineNumber: 75,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/InvitationManager.tsx",
                                    lineNumber: 59,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/InvitationManager.tsx",
                            lineNumber: 40,
                            columnNumber: 25
                        }, this)
                    ]
                }, inv.id, true, {
                    fileName: "[project]/src/components/InvitationManager.tsx",
                    lineNumber: 31,
                    columnNumber: 21
                }, this))
        }, void 0, false, {
            fileName: "[project]/src/components/InvitationManager.tsx",
            lineNumber: 29,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/InvitationManager.tsx",
        lineNumber: 28,
        columnNumber: 9
    }, this);
}
function InvitationManager({ compact = false, singlePageStrip = false }) {
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const [invitations, setInvitations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [processing, setProcessing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [stripModalOpen, setStripModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const fetchInvitations = async ()=>{
        if (!user) return;
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getMyInvitations(user.uid);
            setInvitations(data);
        } catch (err) {
            console.error('Error fetching invitations:', err);
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchInvitations();
    }, [
        user
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (invitations.length === 0) setStripModalOpen(false);
    }, [
        invitations.length
    ]);
    const handleResponse = async (id, status)=>{
        setProcessing(id);
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].respondToInvitation(id, status);
            setInvitations((prev)=>prev.filter((inv)=>inv.id !== id));
        } catch (err) {
            console.error('Error responding to invitation:', err);
        } finally{
            setProcessing(null);
        }
    };
    if (loading) {
        if (singlePageStrip) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-8 w-full shrink-0 items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                    className: "animate-spin text-[#ccff00]",
                    size: 16
                }, void 0, false, {
                    fileName: "[project]/src/components/InvitationManager.tsx",
                    lineNumber: 136,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/InvitationManager.tsx",
                lineNumber: 135,
                columnNumber: 17
            }, this);
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `flex items-center justify-center bg-zinc-900/30 rounded-2xl border border-zinc-800/50 ${compact ? 'p-4' : 'p-8'}`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                className: "text-[#ccff00] animate-spin",
                size: compact ? 18 : 24
            }, void 0, false, {
                fileName: "[project]/src/components/InvitationManager.tsx",
                lineNumber: 144,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/InvitationManager.tsx",
            lineNumber: 141,
            columnNumber: 13
        }, this);
    }
    // Sin invitaciones: no mostrar nada (accesos Ranking / Mi cuenta eliminados)
    if (invitations.length === 0) {
        return null;
    }
    if (singlePageStrip) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: ()=>setStripModalOpen(true),
                    className: "flex h-9 w-full shrink-0 items-center justify-between gap-2 rounded-lg border border-[#ccff00]/35 bg-zinc-900/70 px-2.5 py-1 text-left transition-colors hover:bg-zinc-900 active:scale-[0.99]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex min-w-0 items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                                    className: "shrink-0 text-[#ccff00]",
                                    size: 15
                                }, void 0, false, {
                                    fileName: "[project]/src/components/InvitationManager.tsx",
                                    lineNumber: 163,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "truncate text-[10px] font-black uppercase tracking-wide text-white",
                                    children: [
                                        invitations.length,
                                        " invitación",
                                        invitations.length > 1 ? 'es' : '',
                                        " pendiente",
                                        invitations.length > 1 ? 's' : ''
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/InvitationManager.tsx",
                                    lineNumber: 164,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/InvitationManager.tsx",
                            lineNumber: 162,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "shrink-0 text-[9px] font-black uppercase tracking-widest text-[#ccff00]",
                            children: "Ver"
                        }, void 0, false, {
                            fileName: "[project]/src/components/InvitationManager.tsx",
                            lineNumber: 169,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/InvitationManager.tsx",
                    lineNumber: 157,
                    columnNumber: 17
                }, this),
                stripModalOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "fixed inset-0 z-[200] flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4",
                    role: "dialog",
                    "aria-modal": "true",
                    "aria-labelledby": "hub-invitations-title",
                    onClick: ()=>setStripModalOpen(false),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex max-h-[88dvh] w-full max-w-lg flex-col rounded-t-2xl border border-white/10 bg-[#0c0c0c] shadow-2xl sm:rounded-2xl",
                        onClick: (e)=>e.stopPropagation(),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        id: "hub-invitations-title",
                                        className: "text-sm font-black uppercase tracking-tight text-white",
                                        children: "Invitaciones"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/InvitationManager.tsx",
                                        lineNumber: 185,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setStripModalOpen(false),
                                        className: "rounded-lg border border-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/80 hover:bg-white/10",
                                        children: "Cerrar"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/InvitationManager.tsx",
                                        lineNumber: 188,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/InvitationManager.tsx",
                                lineNumber: 184,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-h-0 max-h-[min(72dvh,520px)] overflow-y-auto overscroll-contain px-3 pb-6 pt-2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(InvitationCards, {
                                    invitations: invitations,
                                    compact: true,
                                    processing: processing,
                                    onRespond: handleResponse
                                }, void 0, false, {
                                    fileName: "[project]/src/components/InvitationManager.tsx",
                                    lineNumber: 197,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/InvitationManager.tsx",
                                lineNumber: 196,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/InvitationManager.tsx",
                        lineNumber: 180,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/InvitationManager.tsx",
                    lineNumber: 173,
                    columnNumber: 21
                }, this)
            ]
        }, void 0, true);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: compact ? 'space-y-2' : 'space-y-4',
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `flex items-center gap-2 ${compact ? 'mb-1' : 'mb-4'}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                        className: "text-[#ccff00] shrink-0",
                        size: compact ? 16 : 20
                    }, void 0, false, {
                        fileName: "[project]/src/components/InvitationManager.tsx",
                        lineNumber: 214,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: `font-bold text-white leading-tight ${compact ? 'text-xs' : 'text-xl'}`,
                        children: [
                            "Invitaciones (",
                            invitations.length,
                            ")"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/InvitationManager.tsx",
                        lineNumber: 215,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/InvitationManager.tsx",
                lineNumber: 213,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(InvitationCards, {
                invitations: invitations,
                compact: compact,
                processing: processing,
                onRespond: handleResponse
            }, void 0, false, {
                fileName: "[project]/src/components/InvitationManager.tsx",
                lineNumber: 220,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/InvitationManager.tsx",
        lineNumber: 212,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/components/PlayerCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PlayerCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-motion-value.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$transform$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-transform.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-spring.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trophy.js [app-ssr] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-ssr] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.js [app-ssr] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-ssr] (ecmascript) <export default as Zap>");
'use client';
;
;
;
;
function PlayerCard({ player, stats, className = '', static: isStatic = false, compact = false }) {
    const cardRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const x = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMotionValue"])(0);
    const y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMotionValue"])(0);
    const rotateX = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$transform$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTransform"])(y, [
        -0.5,
        0.5
    ], [
        8,
        -8
    ]);
    const rotateY = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$transform$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTransform"])(x, [
        -0.5,
        0.5
    ], [
        -8,
        8
    ]);
    const spring = {
        type: 'spring',
        stiffness: 300,
        damping: 20
    };
    const rotateXSpring = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSpring"])(rotateX, spring);
    const rotateYSpring = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSpring"])(rotateY, spring);
    const handleMouseMove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        if (isStatic || !cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        const centerX = rect.left + w / 2;
        const centerY = rect.top + h / 2;
        const relX = (e.clientX - centerX) / w;
        const relY = (e.clientY - centerY) / h;
        x.set(relX);
        y.set(relY);
    }, [
        isStatic,
        x,
        y
    ]);
    const handleMouseLeave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        x.set(0);
        y.set(0);
    }, [
        x,
        y
    ]);
    const displayName = [
        player.name,
        player.lastName
    ].filter(Boolean).join(' ') || 'CRACK';
    const categoryLabel = player.category || (player.level != null ? `Nivel ${player.level}` : 'Sin categoría');
    const ranking = stats?.ranking ?? '0';
    const titles = stats?.titles ?? 0;
    const played = stats?.played ?? 0;
    const points = stats?.points ?? 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
        ref: cardRef,
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave,
        style: isStatic ? undefined : {
            rotateX: rotateXSpring,
            rotateY: rotateYSpring,
            transformPerspective: 800
        },
        className: `relative w-full ${compact ? 'max-w-[280px]' : 'max-w-[320px]'} mx-auto rounded-2xl overflow-hidden ${className}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `relative rounded-2xl overflow-hidden border-2 border-brand/40 bg-surface transition-colors duration-300 shadow-[0_0_20px_rgba(204,255,0,0.12),0_0_40px_rgba(204,255,0,0.08),inset_0_0_60px_rgba(0,0,0,0.5)] ${compact ? 'px-2 pb-2 pt-0.5' : 'px-4 pb-4 pt-1'}`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: `font-black uppercase tracking-tight text-white truncate font-outfit max-w-full text-center ${compact ? 'text-[11px] leading-tight' : 'text-[13px] sm:text-[15px] md:text-[18px]'}`,
                    style: {
                        letterSpacing: '-0.02em'
                    },
                    children: displayName
                }, void 0, false, {
                    fileName: "[project]/src/components/PlayerCard.tsx",
                    lineNumber: 90,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: `font-black uppercase tracking-[0.15em] truncate text-brand text-center ${compact ? 'text-[8px] mt-0' : 'text-[10px] tracking-[0.2em] mt-0.5'}`,
                    children: categoryLabel
                }, void 0, false, {
                    fileName: "[project]/src/components/PlayerCard.tsx",
                    lineNumber: 96,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `flex flex-row items-center justify-between gap-px ${compact ? 'mt-1' : 'mt-1.5'}`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-1 min-w-0 flex-col items-center justify-center rounded border border-white/10 bg-white/[0.03] py-px px-px sm:py-0.5 sm:px-0.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                                    className: `mb-px text-brand shrink-0 ${compact ? 'w-3.5 h-3.5' : 'w-5 h-5 mb-0.5'}`
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PlayerCard.tsx",
                                    lineNumber: 105,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `font-black uppercase text-white/50 leading-tight ${compact ? 'text-[5px] tracking-wide' : 'text-[6px] tracking-widest'}`,
                                    children: "Ranking"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PlayerCard.tsx",
                                    lineNumber: 106,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `font-black text-white tabular-nums ${compact ? 'text-[7px]' : 'text-[8px]'}`,
                                    children: ranking
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PlayerCard.tsx",
                                    lineNumber: 109,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/PlayerCard.tsx",
                            lineNumber: 104,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-1 min-w-0 flex-col items-center justify-center rounded border border-white/10 bg-white/[0.03] py-px px-px sm:py-0.5 sm:px-0.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
                                    className: `mb-px text-brand shrink-0 ${compact ? 'w-3.5 h-3.5' : 'w-5 h-5 mb-0.5'}`
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PlayerCard.tsx",
                                    lineNumber: 112,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `font-black uppercase text-white/50 leading-tight ${compact ? 'text-[5px] tracking-wide' : 'text-[6px] tracking-widest'}`,
                                    children: "Títulos"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PlayerCard.tsx",
                                    lineNumber: 113,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `font-black text-white tabular-nums ${compact ? 'text-[7px]' : 'text-[8px]'}`,
                                    children: titles
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PlayerCard.tsx",
                                    lineNumber: 116,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/PlayerCard.tsx",
                            lineNumber: 111,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-1 min-w-0 flex-col items-center justify-center rounded border border-white/10 bg-white/[0.03] py-px px-px sm:py-0.5 sm:px-0.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                    className: `mb-px text-brand shrink-0 ${compact ? 'w-3.5 h-3.5' : 'w-5 h-5 mb-0.5'}`
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PlayerCard.tsx",
                                    lineNumber: 119,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `font-black uppercase text-white/50 leading-tight ${compact ? 'text-[5px] tracking-wide' : 'text-[6px] tracking-widest'}`,
                                    children: "Partidos"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PlayerCard.tsx",
                                    lineNumber: 120,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `font-black text-white tabular-nums ${compact ? 'text-[7px]' : 'text-[8px]'}`,
                                    children: played
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PlayerCard.tsx",
                                    lineNumber: 123,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/PlayerCard.tsx",
                            lineNumber: 118,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-1 min-w-0 flex-col items-center justify-center rounded border border-white/10 bg-white/[0.03] py-px px-px sm:py-0.5 sm:px-0.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                    className: `mb-px text-brand shrink-0 ${compact ? 'w-3.5 h-3.5' : 'w-5 h-5 mb-0.5'}`
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PlayerCard.tsx",
                                    lineNumber: 126,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `font-black uppercase text-white/50 leading-tight ${compact ? 'text-[5px] tracking-wide' : 'text-[6px] tracking-widest'}`,
                                    children: "Puntos"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PlayerCard.tsx",
                                    lineNumber: 127,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `font-black text-white tabular-nums ${compact ? 'text-[7px]' : 'text-[8px]'}`,
                                    children: points
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PlayerCard.tsx",
                                    lineNumber: 130,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/PlayerCard.tsx",
                            lineNumber: 125,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/PlayerCard.tsx",
                    lineNumber: 103,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/PlayerCard.tsx",
            lineNumber: 87,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/PlayerCard.tsx",
        lineNumber: 72,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/lib/matchFinishedScoreDisplay.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getFinishedMatchScoreLines",
    ()=>getFinishedMatchScoreLines,
    "inferStbFromSetScoresOnly",
    ()=>inferStbFromSetScoresOnly
]);
/**
 * Texto de resultado para partidos finalizados: el STB no es un "tercer set",
 * sino desempate a 10 cuando el marcador de sets va 1-1.
 */ function normSetRow(row) {
    if (!row || typeof row !== 'object') return null;
    const t1 = Number(row.t1 ?? row.local ?? row.team1);
    const t2 = Number(row.t2 ?? row.visitante ?? row.team2);
    if (!Number.isFinite(t1) || !Number.isFinite(t2)) return null;
    return {
        t1,
        t2
    };
}
function inferStbFromSetScoresOnly(match) {
    const setScores = match?.setScores;
    if (!Array.isArray(setScores) || setScores.length < 3) return false;
    const s1 = normSetRow(setScores[0]);
    const s2 = normSetRow(setScores[1]);
    const s3 = normSetRow(setScores[2]);
    if (!s1 || !s2 || !s3) return false;
    const w1 = (s1.t1 > s1.t2 ? 1 : 0) + (s2.t1 > s2.t2 ? 1 : 0);
    const w2 = (s1.t2 > s1.t1 ? 1 : 0) + (s2.t2 > s2.t1 ? 1 : 0);
    if (w1 !== 1 || w2 !== 1) return false;
    if (s3.t1 === s3.t2) return false;
    const mx = Math.max(s3.t1, s3.t2);
    return mx >= 7;
}
function matchHasSuperTiebreak(match) {
    const mf = match?.matchFormat;
    if (match?.superTiebreak === true) return true;
    if (mf === 'SET_3_STB' || mf === 'SUPER_TIEBREAK') return true;
    const stb = match?.superTiebreakScore;
    if (stb && typeof stb === 'object') {
        const a = Number(stb.t1 ?? 0);
        const b = Number(stb.t2 ?? 0);
        if (a > 0 || b > 0) return true;
    }
    const tbt = String(match?.tieBreakType ?? '').toUpperCase();
    if (tbt === 'STB') return true;
    return false;
}
function getFinishedMatchScoreLines(match) {
    const setScores = Array.isArray(match?.setScores) ? match.setScores : [];
    const explicitStb = matchHasSuperTiebreak(match);
    const inferredStb = inferStbFromSetScoresOnly(match);
    const useStbLayout = explicitStb || inferredStb;
    const stbObj = match?.superTiebreakScore;
    const lines = [];
    if (useStbLayout && setScores.length >= 2) {
        const s1 = normSetRow(setScores[0]);
        const s2 = normSetRow(setScores[1]);
        if (s1) lines.push(`SET 1 · ${s1.t1}-${s1.t2}`);
        if (s2) lines.push(`SET 2 · ${s2.t1}-${s2.t2}`);
        let stbT1 = Number(stbObj?.t1 ?? 0);
        let stbT2 = Number(stbObj?.t2 ?? 0);
        if (stbT1 === 0 && stbT2 === 0 && setScores.length >= 3) {
            const third = normSetRow(setScores[2]);
            if (third && (third.t1 > 0 || third.t2 > 0)) {
                stbT1 = third.t1;
                stbT2 = third.t2;
            }
        }
        lines.push(`STB · ${stbT1}-${stbT2}`);
        return lines;
    }
    for(let i = 0; i < setScores.length; i++){
        const r = normSetRow(setScores[i]);
        if (r) lines.push(`SET ${i + 1} · ${r.t1}-${r.t2}`);
    }
    if (lines.length === 0) {
        const t1 = Number(match?.sets?.t1 ?? 0);
        const t2 = Number(match?.sets?.t2 ?? 0);
        const g1 = match?.games?.t1;
        const g2 = match?.games?.t2;
        if (g1 != null && g2 != null) {
            lines.push(`Sets ${t1}-${t2} (${g1}-${g2})`);
        } else {
            lines.push(`Sets ${t1}-${t2}`);
        }
    }
    return lines;
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
"[project]/src/app/tournaments/event/components/MatchCards.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MatchCard",
    ()=>MatchCard,
    "NextMatchCard",
    ()=>NextMatchCard,
    "PlaceholderMatchCard",
    ()=>PlaceholderMatchCard,
    "buildMarkerRoomHref",
    ()=>buildMarkerRoomHref,
    "buildPizarraConceptHref",
    ()=>buildPizarraConceptHref
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trophy.js [app-ssr] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gamepad$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Gamepad2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/gamepad-2.js [app-ssr] (ecmascript) <export default as Gamepad2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/monitor.js [app-ssr] (ecmascript) <export default as Monitor>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/camera.js [app-ssr] (ecmascript) <export default as Camera>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tv$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Tv$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/tv.js [app-ssr] (ecmascript) <export default as Tv>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crosshair$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crosshair$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/crosshair.js [app-ssr] (ecmascript) <export default as Crosshair>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-ssr] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchFinishedScoreDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/matchFinishedScoreDisplay.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/tournament.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/tournaments/event/utils.ts [app-ssr] (ecmascript)");
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
// Sedes ordenadas alfabéticamente (igual que en el generador),
// mapeadas a su índice S1, S2, S3… para la URL corta de pizarra.
const SEDE_INDEX = {
    'El Bodeguero': 1,
    'Elite': 2,
    'Food Kart': 3,
    'Margarita Padel': 4,
    'Playa el Agua': 5,
    'Sun Sol Costa Azul': 6,
    'Sun Sol Pedro Gonzalez': 7,
    'Tibisay': 8
};
/** Construye la ruta corta: S{sedeIndex}/C{court}  */ function buildShortPath(complexName, court) {
    const sIdx = complexName && SEDE_INDEX[complexName] ? SEDE_INDEX[complexName] : null;
    const cNum = court != null ? Number(court) || court : null;
    if (sIdx && cNum) return `S${sIdx}/C${cNum}`;
    if (sIdx) return `S${sIdx}`;
    if (cNum) return `C${cNum}`;
    return '';
}
function buildMarkerRoomHref(match, rankFallback) {
    const [t1p1, t1p2] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveTeamNames"])(match.team1, match.team1Name);
    const [t2p1, t2p2] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveTeamNames"])(match.team2, match.team2Name);
    const p1Name = t1p1 !== '?' ? t1p1 : '';
    const p2Name = t1p2 || '';
    const p3Name = t2p1 !== '?' ? t2p1 : '';
    const p4Name = t2p2 || '';
    const controlParams = new URLSearchParams();
    if (p1Name) controlParams.set('p1', p1Name);
    if (p2Name) controlParams.set('p2', p2Name);
    if (p3Name) controlParams.set('p3', p3Name);
    if (p4Name) controlParams.set('p4', p4Name);
    if (!p1Name && !p3Name) {
        const t1Display = match.team1?.name ?? match.team1Name ?? '';
        const t2Display = match.team2?.name ?? match.team2Name ?? '';
        if (t1Display) controlParams.set('team1', t1Display);
        if (t2Display) controlParams.set('team2', t2Display);
    }
    if (!p1Name && !p3Name && (match.t1Name || match.t2Name)) {
        const splitPair = (s)=>String(s || '').split(/\s*\/\s*/).map((x)=>x.trim()).filter(Boolean);
        const a = splitPair(match.t1Name || '');
        const b = splitPair(match.t2Name || '');
        if (a[0]) controlParams.set('p1', a[0]);
        if (a[1]) controlParams.set('p2', a[1]);
        if (b[0]) controlParams.set('p3', b[0]);
        if (b[1]) controlParams.set('p4', b[1]);
    }
    const tid = match._tournamentId ?? match.tournamentId;
    if (tid) controlParams.set('t', String(tid));
    if (match.id) controlParams.set('m', String(match.id));
    const canchaId = `cancha_${match.court ?? (match.courtIndex != null ? match.courtIndex + 1 : rankFallback + 1)}`;
    return `/marker/${encodeURIComponent(canchaId)}?${controlParams.toString()}`;
}
function buildPizarraConceptHref(tournamentId, matchId) {
    return `/dev/pizarra-concept?tournamentId=${encodeURIComponent(String(tournamentId))}&matchId=${encodeURIComponent(String(matchId))}`;
}
function PlaceholderMatchCard({ rank, mode = 'pending' }) {
    const rankLabel = [
        '1°',
        '2°',
        '3°',
        '4°',
        '5°',
        '6°'
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-2xl border border-white/[0.05] bg-white/[0.02] flex flex-col h-full opacity-30 min-h-[140px]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-2 pt-2 pb-1.5 flex items-center justify-between border-b border-white/[0.04]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[8px] font-black text-gray-500 uppercase tracking-widest",
                        children: mode === 'live' ? `PISTA ${rank + 1}` : rankLabel[rank] ?? `${rank + 1}°`
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                        lineNumber: 92,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[7px] font-bold text-gray-600 uppercase tracking-tighter",
                        children: "Disponible"
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                        lineNumber: 95,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                lineNumber: 91,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex flex-col items-center justify-center p-3 opacity-20",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-8 h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-1",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
                            className: "w-3.5 h-3.5 text-gray-400"
                        }, void 0, false, {
                            fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                            lineNumber: 99,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                        lineNumber: 98,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "label-cancha-meta text-center leading-none text-gray-400",
                        children: "Pista Libre"
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                        lineNumber: 101,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                lineNumber: 97,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
        lineNumber: 90,
        columnNumber: 9
    }, this);
}
function NextMatchCard({ match, rank, compact = false, gameNumber, matchNumber, showControlDock = false, showDockAds = true, showPlayerPizarraDock = true }) {
    const [t1p1, t1p2] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveTeamNames"])(match.team1, match.team1Name);
    const [t2p1, t2p2] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveTeamNames"])(match.team2, match.team2Name);
    const isLive = match.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].LIVE;
    /** Mismo criterio amplio que el hub (`event/page`): LIVE / IN_PROGRESS / STARTED. */ const canOpenMarkerOnDblClick = match.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].LIVE || match.status === 'IN_PROGRESS' || match.status === 'STARTED';
    const rankColors = isLive ? [
        'text-emerald-400',
        'text-emerald-400',
        'text-emerald-400',
        'text-emerald-400',
        'text-emerald-400',
        'text-emerald-400'
    ] : [
        'text-[#ccff00]',
        'text-white/80',
        'text-white/50',
        'text-white/30',
        'text-white/20',
        'text-white/15'
    ];
    const rankBg = isLive ? [
        'bg-emerald-500/10 border-emerald-500/30 shadow-[0_4px_24px_rgba(16,185,129,0.1)]',
        'bg-emerald-500/5 border-emerald-500/25',
        'bg-emerald-500/5 border-emerald-500/20',
        'bg-emerald-500/5 border-emerald-500/15',
        'bg-emerald-500/5 border-emerald-500/10',
        'bg-emerald-500/5 border-emerald-500/10'
    ] : [
        'bg-yellow-400/10 border-yellow-400/30 shadow-[0_4px_24px_rgba(250,204,21,0.08)]',
        'bg-white/5 border-white/15',
        'bg-white/[0.03] border-white/10',
        'bg-white/[0.02] border-white/[0.07]',
        'bg-white/[0.02] border-white/[0.06]',
        'bg-white/[0.01] border-white/[0.05]'
    ];
    const rankLabel = isLive ? [
        'LIVE',
        'LIVE',
        'LIVE',
        'LIVE',
        'LIVE',
        'LIVE'
    ] : [
        '1°',
        '2°',
        '3°',
        '4°',
        '5°',
        '6°'
    ];
    const rankLabelFull = isLive ? [
        'Partido en Curso',
        'Partido en Curso',
        'Partido en Curso',
        'Partido en Curso',
        'Partido en Curso',
        'Partido en Curso'
    ] : [
        '1° Siguiente',
        '2° Salida',
        '3° Espera',
        '4° Cola',
        '5° Cola',
        '6° Cola'
    ];
    const safeRank = Math.min(rank, rankColors.length - 1);
    const matchKey = match.id || (match.court ? `court_${match.court}` : match.courtIndex != null ? `court_${match.courtIndex + 1}` : `court_${rank + 1}`);
    const canchaId = `cancha_${match.court ?? (match.courtIndex != null ? match.courtIndex + 1 : rank + 1)}`;
    const markerHref = buildMarkerRoomHref(match, rank);
    /** Con torneo + partido → sala de árbitro del torneo; si no, marker con query `t`/`m`/jugadores. */ const controlHref = match._tournamentId && match.id ? `/tournaments/${match._tournamentId}/score/${encodeURIComponent(String(match.id))}` : markerHref;
    const pizarraHref = buildPizarraConceptHref(String(match._tournamentId ?? ''), String(match.id || matchKey));
    const camasHref = `/tournaments/${match._tournamentId}/control/broadcasting`;
    const adsHref = `/admin/publicidad`;
    const dockItemCount = showControlDock ? 3 + (canOpenMarkerOnDblClick ? 1 : 0) + (showDockAds ? 1 : 0) : 0;
    const dockMobileGridClass = showControlDock && dockItemCount === 5 ? 'max-sm:grid-cols-2' : showControlDock && dockItemCount === 4 ? 'max-sm:grid-cols-4' : showControlDock && dockItemCount === 3 ? 'max-sm:grid-cols-3' : '';
    const dockLinkCompact = 'flex min-h-[48px] w-full min-w-0 max-w-full flex-row items-center justify-center gap-2 bg-[#ccff00]/10 px-2 py-2.5 text-[#ccff00] transition-all hover:bg-[#ccff00]/20 active:scale-[0.99] max-sm:min-h-[2.4rem] max-sm:gap-1 max-sm:px-1 max-sm:py-1 sm:min-h-0 sm:flex-col sm:items-center sm:justify-center sm:gap-1 sm:px-2 sm:py-2';
    const dockLinkFull = 'flex min-h-[52px] w-full min-w-0 max-w-full flex-row items-center justify-center gap-2 bg-[#ccff00]/10 px-2 py-3 text-[#ccff00] transition-all hover:bg-[#ccff00]/20 active:scale-[0.99] max-sm:min-h-[2.5rem] max-sm:gap-1 max-sm:px-1.5 max-sm:py-1.5 sm:min-h-0 sm:flex-col sm:items-center sm:justify-center sm:gap-1.5 sm:px-4 sm:py-3.5';
    // URL corta para la pizarra: www.smartpadel58.com/S1/C1
    const courtNum = match.court ?? (match.courtIndex != null ? match.courtIndex + 1 : rank + 1);
    const shortPath = buildShortPath(match._complexName, courtNum);
    const courtLabel = match.courtName ?? (courtNum != null ? `Pista ${courtNum}` : 'Pista –');
    const shortUrl = shortPath ? `smartpadel58.com/pizarra/${shortPath}` : '';
    if (compact) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: {
                opacity: 0,
                y: 8
            },
            animate: {
                opacity: 1,
                y: 0
            },
            exit: {
                opacity: 0,
                scale: 0.95
            },
            transition: {
                delay: rank * 0.06
            },
            className: `rounded-2xl border overflow-hidden flex flex-col ${rankBg[safeRank]}${canOpenMarkerOnDblClick ? ' cursor-pointer' : ''}`,
            title: canOpenMarkerOnDblClick ? 'Doble clic: abrir sala marker' : undefined,
            onDoubleClick: canOpenMarkerOnDblClick ? (e)=>{
                e.preventDefault();
                window.open(markerHref, '_blank', 'noopener,noreferrer');
            } : undefined,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "border-b-2 border-[#ccff00]/50 bg-[#ccff00]/10 px-2 pb-2 pt-2",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex-shrink-0 text-[8px] font-bold italic text-[#ccff00]/90",
                                        children: isLive ? `${match.score1 ?? 0} - ${match.score2 ?? 0}` : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatHHMM"])(match.scheduledTime)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                        lineNumber: 228,
                                        columnNumber: 29
                                    }, this),
                                    matchNumber != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[8px] text-[#ccff00]/50",
                                                children: "·"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                                lineNumber: 233,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[8px] font-black uppercase tracking-widest text-[#ccff00]/80",
                                                children: [
                                                    "Partido ",
                                                    matchNumber
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                                lineNumber: 234,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true),
                                    !isLive && gameNumber != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[8px] text-[#ccff00]/50",
                                                children: "·"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                                lineNumber: 241,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[8px] font-black italic text-[#ccff00]/90",
                                                children: [
                                                    gameNumber,
                                                    "º Juego"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                                lineNumber: 242,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 227,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1",
                                children: [
                                    match._category && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[8px] font-bold uppercase tracking-tight text-[#ccff00]/90",
                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCategory"])(match._category)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                        lineNumber: 248,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `rounded border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CAT_COLORS"][match._gender] ?? 'border-white/20 bg-white/10 text-[#ccff00]/90'}`,
                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatGender"])(match._gender) || '—'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                        lineNumber: 252,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 246,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                        lineNumber: 226,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                    lineNumber: 225,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-2 py-2 flex-1 bg-[#ccff00]/5 border-y-2 border-[#ccff00]/30 flex items-center justify-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-[1fr_auto_1fr] items-center gap-2 w-full",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[9px] font-black uppercase tracking-tight leading-tight truncate text-[#ccff00]",
                                        children: t1p1
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                        lineNumber: 265,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[9px] font-black uppercase tracking-tight leading-tight truncate text-[#ccff00]",
                                        children: t1p2 || '—'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                        lineNumber: 266,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 264,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-[9px] font-black text-[#ccff00]/40 text-center italic leading-none px-1",
                                children: "VS"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 268,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[9px] font-black uppercase tracking-tight leading-tight truncate text-[#ccff00]",
                                        children: t2p1
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                        lineNumber: 272,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[9px] font-black uppercase tracking-tight leading-tight truncate text-[#ccff00]",
                                        children: t2p2 || '—'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                        lineNumber: 273,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 271,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                        lineNumber: 263,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                    lineNumber: 262,
                    columnNumber: 17
                }, this),
                !showControlDock && match._tournamentId && showPlayerPizarraDock && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full min-w-0 border-t-2 border-[#ccff00]/30",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: pizarraHref,
                        target: "_blank",
                        className: "flex w-full min-w-0 flex-col items-stretch gap-1 bg-[#ccff00]/10 px-2 py-2 text-[#ccff00] transition-all hover:bg-[#ccff00]/20 active:scale-[0.99] sm:flex-row sm:items-center sm:justify-center sm:gap-2 sm:py-2.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex min-w-0 items-center justify-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"], {
                                        className: "h-3.5 w-3.5 shrink-0"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                        lineNumber: 288,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[7px] font-black uppercase tracking-tight leading-none",
                                        children: "Pizarra"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                        lineNumber: 289,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 287,
                                columnNumber: 29
                            }, this),
                            shortUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "block w-full min-w-0 truncate text-center text-[6px] font-mono text-[#ccff00]/70 sm:ml-1 sm:inline sm:w-auto sm:max-w-[min(100%,12rem)] sm:text-left",
                                children: shortUrl
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 292,
                                columnNumber: 33
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                        lineNumber: 282,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                    lineNumber: 281,
                    columnNumber: 21
                }, this),
                showControlDock && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `grid gap-px overflow-hidden border-t-2 border-[#ccff00]/40 bg-white/[0.04] ${dockMobileGridClass} ${canOpenMarkerOnDblClick ? 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-2 lg:grid-cols-4'}`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: controlHref,
                            className: dockLinkCompact,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gamepad$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Gamepad2$3e$__["Gamepad2"], {
                                    className: "h-4 w-4 shrink-0 max-sm:h-3 max-sm:w-3 sm:h-3.5 sm:w-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 310,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-center text-[10px] font-black uppercase tracking-wide max-sm:text-[6px] max-sm:leading-tight sm:text-center sm:text-[6px] sm:leading-none sm:tracking-tight",
                                    children: "Control"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 311,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                            lineNumber: 309,
                            columnNumber: 25
                        }, this),
                        canOpenMarkerOnDblClick && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: markerHref,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            title: "Sala de marcador (misma ventana que doble clic en la tarjeta)",
                            className: dockLinkCompact,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crosshair$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crosshair$3e$__["Crosshair"], {
                                    className: "h-4 w-4 shrink-0 max-sm:h-3 max-sm:w-3 sm:h-3.5 sm:w-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 323,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-center text-[10px] font-black uppercase tracking-wide max-sm:text-[6px] max-sm:leading-tight sm:text-center sm:text-[6px] sm:leading-none sm:tracking-tight",
                                    children: "Marcador"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 324,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                            lineNumber: 316,
                            columnNumber: 29
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: pizarraHref,
                            target: "_blank",
                            className: dockLinkCompact,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"], {
                                    className: "h-4 w-4 shrink-0 max-sm:h-3 max-sm:w-3 sm:h-3.5 sm:w-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 330,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-center text-[10px] font-black uppercase tracking-wide max-sm:text-[6px] max-sm:leading-tight sm:text-center sm:text-[6px] sm:leading-none sm:tracking-tight",
                                    children: "Pizarra"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 331,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                            lineNumber: 329,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: camasHref,
                            target: "_blank",
                            className: dockLinkCompact,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__["Camera"], {
                                    className: "h-4 w-4 shrink-0 max-sm:h-3 max-sm:w-3 sm:h-3.5 sm:w-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 336,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-center text-[10px] font-black uppercase tracking-wide max-sm:text-[6px] max-sm:leading-tight sm:text-center sm:text-[6px] sm:leading-none sm:tracking-tight",
                                    children: "Cámaras"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 337,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                            lineNumber: 335,
                            columnNumber: 25
                        }, this),
                        showDockAds && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: adsHref,
                            target: "_blank",
                            className: dockLinkCompact,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tv$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Tv$3e$__["Tv"], {
                                    className: "h-4 w-4 shrink-0 max-sm:h-3 max-sm:w-3 sm:h-3.5 sm:w-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 343,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-center text-[10px] font-black uppercase tracking-wide max-sm:text-[6px] max-sm:leading-tight sm:text-center sm:text-[6px] sm:leading-none sm:tracking-tight",
                                    children: "Ads"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 344,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                            lineNumber: 342,
                            columnNumber: 29
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                    lineNumber: 302,
                    columnNumber: 21
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
            lineNumber: 208,
            columnNumber: 13
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: {
            opacity: 0,
            y: 12
        },
        animate: {
            opacity: 1,
            y: 0
        },
        exit: {
            opacity: 0,
            scale: 0.95
        },
        transition: {
            delay: rank * 0.07
        },
        className: `rounded-[1.75rem] border overflow-hidden ${rankBg[safeRank]}${canOpenMarkerOnDblClick ? ' cursor-pointer' : ''}`,
        title: canOpenMarkerOnDblClick ? 'Doble clic: abrir sala marker' : undefined,
        onDoubleClick: canOpenMarkerOnDblClick ? (e)=>{
            e.preventDefault();
            window.open(markerHref, '_blank', 'noopener,noreferrer');
        } : undefined,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-b-2 border-[#ccff00]/50 bg-[#ccff00]/10 px-3 pb-2.5 pt-3 sm:px-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1",
                            children: [
                                matchNumber != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[9px] font-black uppercase tracking-widest text-[#ccff00]/90",
                                            children: [
                                                "Partido ",
                                                matchNumber
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                            lineNumber: 377,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[9px] text-[#ccff00]/50",
                                            children: "·"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                            lineNumber: 378,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[9px] font-bold italic text-[#ccff00]/90",
                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatHHMM"])(match.scheduledTime)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 381,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[9px] text-[#ccff00]/50",
                                    children: "·"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 382,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[9px] font-black uppercase tracking-[0.2em] text-[#ccff00]",
                                    children: rankLabelFull[safeRank] ?? 'Cancha'
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 383,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[9px] text-[#ccff00]/50",
                                    children: "·"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 386,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[9px] font-black uppercase tracking-[0.15em] text-[#ccff00]",
                                    children: courtLabel
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 387,
                                    columnNumber: 25
                                }, this),
                                gameNumber != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[9px] text-[#ccff00]/50",
                                            children: "·"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                            lineNumber: 390,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[9px] font-black italic text-[#ccff00]/90",
                                            children: [
                                                gameNumber,
                                                "º juego"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                            lineNumber: 391,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                            lineNumber: 374,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[9px] font-bold uppercase tracking-tight text-[#ccff00]/90",
                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCategory"])(match._category)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 396,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `rounded border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CAT_COLORS"][match._gender] ?? 'border-white/20 bg-white/10 text-[#ccff00]/90'}`,
                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatGender"])(match._gender) || '—'
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 399,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                            lineNumber: 395,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                    lineNumber: 373,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                lineNumber: 372,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-4 bg-[#ccff00]/5 border-y-2 border-[#ccff00]/30",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-right space-y-0.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[13px] font-black uppercase tracking-tight leading-tight text-[#ccff00]",
                                children: t1p1
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 410,
                                columnNumber: 21
                            }, this),
                            t1p2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] font-bold text-[#ccff00]/80 uppercase tracking-tight",
                                children: t1p2
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 411,
                                columnNumber: 30
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                        lineNumber: 409,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[11px] font-black text-[#ccff00]/70 uppercase italic tracking-widest px-2",
                        children: "vs"
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                        lineNumber: 413,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-left space-y-0.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[13px] font-black uppercase tracking-tight leading-tight text-[#ccff00]",
                                children: t2p1
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 415,
                                columnNumber: 21
                            }, this),
                            t2p2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] font-bold text-[#ccff00]/80 uppercase tracking-tight",
                                children: t2p2
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 416,
                                columnNumber: 30
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                        lineNumber: 414,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                lineNumber: 408,
                columnNumber: 13
            }, this),
            !showControlDock && match._tournamentId && showPlayerPizarraDock && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full min-w-0 border-t-2 border-[#ccff00]/30",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: pizarraHref,
                    target: "_blank",
                    className: "flex w-full min-w-0 flex-col items-stretch gap-1.5 bg-[#ccff00]/10 px-3 py-2.5 text-[#ccff00] transition-all hover:bg-[#ccff00]/20 active:scale-[0.99] sm:flex-row sm:items-center sm:justify-center sm:gap-2 sm:py-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex min-w-0 items-center justify-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"], {
                                    className: "h-4 w-4 shrink-0"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 429,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[8px] font-black uppercase leading-none tracking-widest",
                                    children: "Pizarra"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 430,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                            lineNumber: 428,
                            columnNumber: 25
                        }, this),
                        shortUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "block w-full min-w-0 truncate text-center text-[7px] font-mono text-[#ccff00]/70 sm:inline sm:w-auto sm:max-w-[min(100%,14rem)] sm:text-left",
                            children: shortUrl
                        }, void 0, false, {
                            fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                            lineNumber: 433,
                            columnNumber: 29
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                    lineNumber: 423,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                lineNumber: 422,
                columnNumber: 17
            }, this),
            showControlDock && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `grid gap-px border-t-2 border-[#ccff00]/40 bg-white/[0.04] ${dockMobileGridClass} ${canOpenMarkerOnDblClick ? 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-2 lg:grid-cols-4'}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: controlHref,
                        className: dockLinkFull,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gamepad$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Gamepad2$3e$__["Gamepad2"], {
                                className: "h-5 w-5 shrink-0 max-sm:h-3.5 max-sm:w-3.5 sm:h-4 sm:w-4"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 451,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-center text-[11px] font-black uppercase tracking-wide max-sm:text-[6px] max-sm:leading-tight sm:text-center sm:text-[8px] sm:leading-none sm:tracking-widest",
                                children: "Control"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 452,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                        lineNumber: 450,
                        columnNumber: 21
                    }, this),
                    canOpenMarkerOnDblClick && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: markerHref,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        title: "Sala de marcador (misma ventana que doble clic en la tarjeta)",
                        className: dockLinkFull,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crosshair$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crosshair$3e$__["Crosshair"], {
                                className: "h-5 w-5 shrink-0 max-sm:h-3.5 max-sm:w-3.5 sm:h-4 sm:w-4"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 464,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-center text-[11px] font-black uppercase tracking-wide max-sm:text-[6px] max-sm:leading-tight sm:text-center sm:text-[8px] sm:leading-none sm:tracking-widest",
                                children: "Marcador"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 465,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                        lineNumber: 457,
                        columnNumber: 25
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: pizarraHref,
                        target: "_blank",
                        className: dockLinkFull,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"], {
                                className: "h-5 w-5 shrink-0 max-sm:h-3.5 max-sm:w-3.5 sm:h-4 sm:w-4"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 471,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-center text-[11px] font-black uppercase tracking-wide max-sm:text-[6px] max-sm:leading-tight sm:text-center sm:text-[8px] sm:leading-none sm:tracking-widest",
                                children: "Pizarra"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 472,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                        lineNumber: 470,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: camasHref,
                        target: "_blank",
                        className: dockLinkFull,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__["Camera"], {
                                className: "h-5 w-5 shrink-0 max-sm:h-3.5 max-sm:w-3.5 sm:h-4 sm:w-4"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 477,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-center text-[11px] font-black uppercase tracking-wide max-sm:text-[6px] max-sm:leading-tight sm:text-center sm:text-[8px] sm:leading-none sm:tracking-widest",
                                children: "Cámaras"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 478,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                        lineNumber: 476,
                        columnNumber: 21
                    }, this),
                    showDockAds && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: adsHref,
                        target: "_blank",
                        className: dockLinkFull,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tv$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Tv$3e$__["Tv"], {
                                className: "h-5 w-5 shrink-0 max-sm:h-3.5 max-sm:w-3.5 sm:h-4 sm:w-4"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 484,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-center text-[11px] font-black uppercase tracking-wide max-sm:text-[6px] max-sm:leading-tight sm:text-center sm:text-[8px] sm:leading-none sm:tracking-widest",
                                children: "Publicidad"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 485,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                        lineNumber: 483,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                lineNumber: 443,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
        lineNumber: 356,
        columnNumber: 9
    }, this);
}
function MatchCard({ match, idx, isNextUp, isEffectivelyLive, matchNumber }) {
    const isLive = match.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].LIVE;
    const isDone = match.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED || match.status === 'COMPLETED';
    const isPending = match.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].PENDING;
    const finishedDetailLines = isDone ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchFinishedScoreDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFinishedMatchScoreLines"])(match) : [];
    const [t1p1, t1p2] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveTeamNames"])(match.team1, match.team1Name);
    const [t2p1, t2p2] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveTeamNames"])(match.team2, match.team2Name);
    const [ending, setEnding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const endMatch = async ()=>{
        if (!match._tournamentId) return;
        if (!confirm('¿Terminar este partido ahora?')) return;
        setEnding(true);
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(match._tournamentId, match.id, {
                status: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED
            });
        } catch (e) {
            console.error('[endMatch]', e);
            alert('Error al terminar el partido.');
        } finally{
            setEnding(false);
        }
    };
    const startMatch = async ()=>{
        if (!match._tournamentId) return;
        if (!confirm('¿Comenzar este partido ahora?')) return;
        setEnding(true);
        try {
            const nowIso = new Date().toISOString();
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateMatch(match._tournamentId, match.id, {
                status: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].LIVE,
                startedAt: nowIso,
                actualStartTime: nowIso,
                sets: {
                    t1: 0,
                    t2: 0
                },
                games: {
                    t1: 0,
                    t2: 0
                },
                points: {
                    t1: '0',
                    t2: '0'
                },
                server: {
                    team: 1,
                    player: 1
                }
            });
        } catch (e) {
            console.error('[startMatch]', e);
            alert('Error al comenzar el partido.');
        } finally{
            setEnding(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: {
            opacity: 0,
            y: 8
        },
        animate: {
            opacity: 1,
            y: 0
        },
        exit: {
            opacity: 0,
            scale: 0.95
        },
        layout: true,
        className: `rounded-[1.5rem] border overflow-hidden transition-all ${isEffectivelyLive ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STATUS_COLORS"][__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].LIVE] : isDone ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STATUS_COLORS"][__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$tournament$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MatchStatus"].FINISHED] : isLive && !isEffectivelyLive ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PENDING_NEXT_COLORS"] : isNextUp ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PENDING_NEXT_COLORS"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PENDING_LATER_COLORS"]}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-4 pt-2.5 pb-2 border-b border-white/[0.07] bg-white/[0.04] flex items-start justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex min-w-0 flex-1 flex-col gap-1 text-left",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap items-center gap-x-2 gap-y-1",
                                children: [
                                    matchNumber != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-black uppercase tracking-widest text-gray-400",
                                                children: [
                                                    "Partido ",
                                                    matchNumber
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                                lineNumber: 568,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-white/30",
                                                children: "·"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                                lineNumber: 569,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `text-[10px] font-bold ${isEffectivelyLive ? 'text-emerald-300/95' : 'italic text-gray-400'}`,
                                        children: [
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDateDDMM"])(match.scheduledTime ?? match.time),
                                            " · ",
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatHHMM"])(match.scheduledTime ?? match.time)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                        lineNumber: 572,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 565,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex w-full min-w-0 flex-col items-center gap-1.5 text-[8px] sm:text-[9px]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `w-full truncate text-center font-black uppercase italic tracking-tight ${isEffectivelyLive ? 'text-emerald-400' : isDone ? 'text-gray-600' : isLive || isNextUp ? 'text-yellow-300' : 'text-red-400/70'}`,
                                        children: match.courtName ?? (match.court != null ? `Pista ${match.court}` : 'Pista –')
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                        lineNumber: 577,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "max-w-[min(100%,12rem)] truncate rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-center font-bold uppercase tracking-tight text-gray-400",
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCategory"])(match._category)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                                lineNumber: 581,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `whitespace-nowrap rounded border px-1.5 py-0.5 font-black uppercase tracking-tight ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CAT_COLORS"][match._gender] ?? 'border-white/10 bg-white/5 text-gray-500'}`,
                                                children: match._gender === 'MALE' ? '♂ Masc' : match._gender === 'FEMALE' ? '♀ Fem' : match._gender === 'MIXED' ? '⚥ Mix' : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatGender"])(match._gender) || '—'
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                                lineNumber: 584,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                        lineNumber: 580,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 576,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                        lineNumber: 564,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-shrink-0 flex-col items-end gap-1.5",
                        children: [
                            isEffectivelyLive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[9px] font-black uppercase italic tracking-widest text-emerald-400 animate-pulse",
                                        children: "● En Vivo"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                        lineNumber: 593,
                                        columnNumber: 29
                                    }, this),
                                    match._tournamentId && match.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: `/tournaments/${match._tournamentId}/score/${match.id}`,
                                        className: "inline-flex items-center justify-center gap-0.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[7px] font-black uppercase tracking-widest text-emerald-300 transition-colors hover:bg-emerald-500/20",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                className: "h-2.5 w-2.5 shrink-0"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                                lineNumber: 599,
                                                columnNumber: 37
                                            }, this),
                                            "Marcador"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                        lineNumber: 595,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true),
                            isLive && !isEffectivelyLive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[9px] font-black text-yellow-400 uppercase italic tracking-widest",
                                children: "⏱ Próximo"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 605,
                                columnNumber: 54
                            }, this),
                            !isLive && isPending && isNextUp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[9px] font-black text-yellow-400 uppercase italic tracking-widest",
                                children: "⏱ Próximo"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 606,
                                columnNumber: 58
                            }, this),
                            !isLive && isPending && !isNextUp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[9px] font-black text-red-400/60 uppercase italic tracking-widest",
                                children: "En Cola"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 607,
                                columnNumber: 59
                            }, this),
                            isDone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[9px] font-black text-white/25 uppercase italic tracking-widest",
                                children: "✓ Fin"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 608,
                                columnNumber: 32
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                        lineNumber: 590,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                lineNumber: 563,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 bg-[#ccff00]/5 border-y-2 border-[#ccff00]/30",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-right space-y-0.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[12px] font-black uppercase tracking-tight leading-tight text-[#ccff00]",
                                children: t1p1
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 614,
                                columnNumber: 21
                            }, this),
                            t1p2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] font-bold text-[#ccff00]/80 uppercase tracking-tight",
                                children: t1p2
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 615,
                                columnNumber: 30
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                        lineNumber: 613,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5",
                        children: isLive || isDone ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `text-2xl font-black tabular-nums ${isLive ? 'text-[#ccff00]' : 'text-white'}`,
                                    children: match.score1 ?? 0
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 620,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-gray-700 font-black text-lg",
                                    children: "-"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 621,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `text-2xl font-black tabular-nums ${isLive ? 'text-[#ccff00]' : 'text-white'}`,
                                    children: match.score2 ?? 0
                                }, void 0, false, {
                                    fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                    lineNumber: 622,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[10px] font-black text-[#ccff00]/70 uppercase italic tracking-widest",
                            children: "vs"
                        }, void 0, false, {
                            fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                            lineNumber: 625,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                        lineNumber: 617,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-left space-y-0.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[12px] font-black uppercase tracking-tight leading-tight text-[#ccff00]",
                                children: t2p1
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 629,
                                columnNumber: 21
                            }, this),
                            t2p2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] font-bold text-[#ccff00]/80 uppercase tracking-tight",
                                children: t2p2
                            }, void 0, false, {
                                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                                lineNumber: 630,
                                columnNumber: 30
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                        lineNumber: 628,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                lineNumber: 612,
                columnNumber: 13
            }, this),
            isDone && finishedDetailLines.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-4 pb-2 flex flex-col gap-0.5 border-t border-white/[0.06] pt-2",
                children: finishedDetailLines.map((ln, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: `text-[8px] font-black uppercase tracking-tight text-center leading-tight ${ln.includes('STB') ? 'text-[#ccff00]' : 'text-gray-500'}`,
                        children: ln
                    }, i, false, {
                        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                        lineNumber: 637,
                        columnNumber: 25
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                lineNumber: 635,
                columnNumber: 17
            }, this),
            (isLive || isPending) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-1 bg-white/5"
            }, void 0, false, {
                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                lineNumber: 650,
                columnNumber: 17
            }, this),
            isDone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                href: `/tournaments/${match._tournamentId}`,
                className: "block px-4 py-1.5 border-t border-white/[0.05] text-[9px] font-bold uppercase tracking-widest text-gray-600 hover:text-[#ccff00] transition-colors text-center",
                children: "Ver categoría →"
            }, void 0, false, {
                fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
                lineNumber: 654,
                columnNumber: 17
            }, this)
        ]
    }, match.id ?? idx, true, {
        fileName: "[project]/src/app/tournaments/event/components/MatchCards.tsx",
        lineNumber: 550,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/app/hub/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HubPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trophy.js [app-ssr] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-ssr] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$medal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Medal$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/medal.js [app-ssr] (ecmascript) <export default as Medal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [app-ssr] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wallet$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wallet$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wallet.js [app-ssr] (ecmascript) <export default as Wallet>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-ssr] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ImageIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/image.js [app-ssr] (ecmascript) <export default as ImageIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/copy.js [app-ssr] (ecmascript) <export default as Copy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-ssr] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-ssr] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.js [app-ssr] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/apiAuth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$BouncingBall$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/BouncingBall.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$InvitationManager$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/InvitationManager.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PlayerCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/PlayerCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$components$2f$MatchCards$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/tournaments/event/components/MatchCards.tsx [app-ssr] (ecmascript)");
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
function HubPage() {
    const { user, profile, logout, loading: authLoading, isAdmin, profileLoading, refreshProfile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const tournamentId = searchParams.get('tournament_id');
    const matchId = searchParams.get('match_id');
    const [downloading, setDownloading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [nextMatch, setNextMatch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [codeCopied, setCodeCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [player, setPlayer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [playerStats, setPlayerStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [recentPartners, setRecentPartners] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    /** Hub móvil: carta y espaciados compactos para caber en 100dvh sin scroll de página. */ const [hubCompactLayout, setHubCompactLayout] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        const mq = undefined;
        const apply = undefined;
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!authLoading && isAdmin) {
            router.replace('/admin');
        }
    }, [
        authLoading,
        isAdmin,
        router
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!user?.uid) return;
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getNextMatchForUser(user.uid).then(setNextMatch).catch(()=>setNextMatch(null));
    }, [
        user?.uid
    ]);
    // Asegurar que el perfil esté cargado y tenga uniqueCode (generar si falta)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!user?.uid || authLoading) return;
        if (profileLoading) return;
        if (!profile) {
            refreshProfile().catch(()=>{});
            return;
        }
        if (!profile.uniqueCode) {
            refreshProfile().catch(()=>{});
        }
    }, [
        user?.uid,
        authLoading,
        profileLoading,
        profile,
        profile?.uniqueCode,
        refreshProfile
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!user?.uid) {
            setRecentPartners([]);
            return;
        }
        (async ()=>{
            try {
                const headers = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAuthHeaders"])();
                const res = await fetch('/api/recent-partners', {
                    headers
                });
                if (!res.ok) return;
                const json = await res.json();
                setRecentPartners(Array.isArray(json.partners) ? json.partners : []);
            } catch  {
                setRecentPartners([]);
            }
        })();
    }, [
        user?.uid
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!user?.uid) {
            setPlayer(null);
            setPlayerStats(null);
            return;
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getMyParticipants(user.uid).then((mine)=>{
            const p = mine?.[0] ?? null;
            setPlayer(p);
            if (p?.id) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getPlayerStats(p.id).then((s)=>{
                    setPlayerStats(s ? {
                        ranking: s.ranking,
                        played: s.played,
                        titles: s.won ?? 0,
                        points: s.points ?? 0
                    } : null);
                }).catch(()=>setPlayerStats(null));
            } else {
                setPlayerStats(null);
            }
        }).catch(()=>{
            setPlayer(null);
            setPlayerStats(null);
        });
    }, [
        user?.uid
    ]);
    const handleCopyCode = async ()=>{
        if (!profile?.uniqueCode) return;
        try {
            await navigator.clipboard.writeText(profile.uniqueCode);
            setCodeCopied(true);
            setTimeout(()=>setCodeCopied(false), 2000);
        } catch (_) {}
    };
    const handlePlayerClick = async ()=>{
        if (!user?.uid) {
            router.push('/login');
            return;
        }
        try {
            const mine = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getMyParticipants(user.uid);
            const player = mine?.[0];
            if (player?.id) {
                // Si ya tiene ficha, vamos al perfil del jugador
                router.push(`/players/${player.id}`);
            } else {
                // Si no tiene ficha, vamos al registro inicial
                router.push('/players/register');
            }
        } catch (e) {
            console.error('HubPage: error loading player profile', e);
            router.push('/players/register');
        }
    };
    const playerProfileHref = player?.id ? `/players/${player.id}` : '/players/register';
    /** Orden en rejilla 2 columnas: Perfil, Torneos, Partidos, Ranking, Tarjeta, Wallet. */ const hubNavColumnItems = [
        {
            name: 'Torneos',
            subtitle: 'EXPLORAR EVENTOS',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"],
            color: 'text-padel-primary',
            glow: 'shadow-padel-primary/20',
            bg: 'bg-padel-primary/15',
            border: 'border-padel-primary/40',
            hoverBorder: 'hover:border-padel-primary/70',
            href: '/tournaments'
        },
        {
            name: 'Partidos',
            subtitle: 'JUGADOS',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"],
            color: 'text-cyan-400',
            glow: 'shadow-cyan-400/20',
            bg: 'bg-cyan-400/15',
            border: 'border-cyan-400/40',
            hoverBorder: 'hover:border-cyan-400/70',
            href: playerProfileHref
        },
        {
            name: 'Ranking',
            subtitle: 'GLOBAL',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$medal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Medal$3e$__["Medal"],
            color: 'text-sky-400',
            glow: 'shadow-sky-400/20',
            bg: 'bg-sky-400/15',
            border: 'border-sky-400/40',
            hoverBorder: 'hover:border-sky-400/70',
            href: '/ranking'
        }
    ];
    const hubProfileItem = {
        name: 'Mi Perfil',
        subtitle: 'VER MI FICHA',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"],
        color: 'text-purple-400',
        glow: 'shadow-purple-400/20',
        bg: 'bg-purple-400/15',
        border: 'border-purple-400/40',
        hoverBorder: 'hover:border-purple-400/70',
        onClick: handlePlayerClick
    };
    const hubBottomItems = [
        {
            name: 'Tarjeta de victoria',
            subtitle: 'DESCARGAR IMAGEN',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ImageIcon$3e$__["ImageIcon"],
            color: 'text-amber-400',
            glow: 'shadow-amber-400/20',
            bg: 'bg-amber-400/15',
            border: 'border-amber-400/40',
            hoverBorder: 'hover:border-amber-400/70',
            href: '/hub/victory-card'
        },
        {
            name: 'Wallet',
            subtitle: 'PRÓXIMAMENTE',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wallet$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wallet$3e$__["Wallet"],
            color: 'text-emerald-400',
            glow: 'shadow-emerald-400/20',
            bg: 'bg-emerald-400/15',
            border: 'border-emerald-400/40',
            hoverBorder: 'hover:border-emerald-400/40',
            disabled: true
        }
    ];
    const HubProfileIcon = hubProfileItem.icon;
    const handleDownloadVictoryCard = async ()=>{
        if (!tournamentId || !matchId) return;
        setDownloading(true);
        try {
            const res = await fetch(`/api/generate-victory-card?match_id=${encodeURIComponent(matchId)}&tournament_id=${encodeURIComponent(tournamentId)}`);
            if (!res.ok) {
                const err = await res.json().catch(()=>({}));
                throw new Error(err?.error || 'Error al generar la imagen');
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `victoria-pro-${matchId}.png`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            alert(e?.message || 'No se pudo descargar la tarjeta');
        } finally{
            setDownloading(false);
        }
    };
    if (authLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-screen bg-[#080808] flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$BouncingBall$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                size: 32,
                bounceHeight: 2
            }, void 0, false, {
                fileName: "[project]/src/app/hub/page.tsx",
                lineNumber: 252,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/hub/page.tsx",
            lineNumber: 251,
            columnNumber: 13
        }, this);
    }
    // Sin usuario: redirigir a login para que el hub solo muestre contenido con sesión
    if (!user) {
        router.replace('/login');
        return null;
    }
    const photoUrl = player?.photo ?? user?.photoURL ?? null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative flex min-h-0 w-full flex-1 flex-col items-stretch overflow-x-hidden overflow-y-auto bg-[#080808] font-outfit text-white sm:min-h-0 sm:overflow-hidden   pl-[max(0.375rem,env(safe-area-inset-left))] pr-[max(0.375rem,env(safe-area-inset-right))]   pt-[max(0.25rem,env(safe-area-inset-top))] pb-[max(0.25rem,env(safe-area-inset-bottom))]   sm:pl-4 sm:pr-4 sm:pt-4 sm:pb-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-0 right-0 w-[600px] h-[600px] bg-padel-primary/5 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3 pointer-events-none"
            }, void 0, false, {
                fileName: "[project]/src/app/hub/page.tsx",
                lineNumber: 275,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-1/2 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] -translate-x-1/3 pointer-events-none"
            }, void 0, false, {
                fileName: "[project]/src/app/hub/page.tsx",
                lineNumber: 276,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 flex min-h-0 w-full min-w-0 flex-1 flex-col items-center overflow-hidden max-sm:h-full",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: `flex w-full max-w-md min-h-0 shrink-0 items-center justify-center px-2 sm:px-6 ${hubCompactLayout ? 'pt-0.5 pb-0' : 'pt-4 pb-2 sm:pt-10 sm:pb-4'}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex w-full flex-col items-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: `font-black italic uppercase tracking-tighter text-white text-center ${hubCompactLayout ? 'mb-0 text-[clamp(0.8rem,3.8vw,1rem)] leading-none' : 'mb-1 text-lg sm:mb-4 sm:text-2xl md:text-3xl'}`,
                                    children: [
                                        "HOLA, ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-padel-primary",
                                            children: "CRACK"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/hub/page.tsx",
                                            lineNumber: 288,
                                            columnNumber: 35
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/hub/page.tsx",
                                    lineNumber: 285,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        scale: 0.96
                                    },
                                    animate: {
                                        opacity: 1,
                                        scale: 1
                                    },
                                    className: `flex justify-center ${hubCompactLayout ? 'mb-1 mt-0.5' : 'mb-1 sm:mb-4'}`,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `relative rounded-full overflow-hidden border-2 border-brand/40 shadow-[0_0_24px_rgba(204,255,0,0.15)] ring-2 ring-black/20 bg-zinc-800 ${hubCompactLayout ? 'h-10 w-10' : 'h-24 w-24 sm:h-44 sm:w-44 md:h-48 md:w-48'}`,
                                        children: photoUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: photoUrl,
                                            alt: "",
                                            className: "absolute w-full h-full object-cover object-center"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/hub/page.tsx",
                                            lineNumber: 300,
                                            columnNumber: 37
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute inset-0 flex items-center justify-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                className: `text-zinc-600 ${hubCompactLayout ? 'h-5 w-5' : 'h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14'}`,
                                                strokeWidth: 1.5
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/hub/page.tsx",
                                                lineNumber: 303,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/hub/page.tsx",
                                            lineNumber: 302,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/hub/page.tsx",
                                        lineNumber: 296,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/hub/page.tsx",
                                    lineNumber: 291,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `flex w-full min-w-0 max-w-full flex-col items-center gap-0 px-1 ${hubCompactLayout ? 'mt-0.5' : 'mt-1 sm:mt-3 gap-1'}`,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `flex w-full max-w-[min(100%,20rem)] items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 pl-2 pr-1.5 backdrop-blur-xl sm:min-w-[160px] sm:rounded-full ${hubCompactLayout ? 'py-0.5' : 'py-2 sm:py-1.5'}`,
                                        children: profileLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm text-white/60",
                                            children: "Cargando código…"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/hub/page.tsx",
                                            lineNumber: 319,
                                            columnNumber: 37
                                        }, this) : profile?.uniqueCode ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `min-w-0 max-w-full text-center font-black text-white font-mono tabular-nums sm:text-lg sm:tracking-[0.25em] ${hubCompactLayout ? 'text-[clamp(0.8rem,4vw,0.95rem)] tracking-[0.1em]' : 'text-[clamp(0.95rem,5vw,1.125rem)] tracking-[0.12em]'}`,
                                                    "aria-label": `Código ${profile.uniqueCode}`,
                                                    children: profile.uniqueCode
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/hub/page.tsx",
                                                    lineNumber: 322,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: handleCopyCode,
                                                    className: `rounded-full bg-padel-primary/20 text-padel-primary transition-colors hover:bg-padel-primary/30 ${hubCompactLayout ? 'p-1' : 'p-2'}`,
                                                    "aria-label": "Copiar código",
                                                    children: codeCopied ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                        className: hubCompactLayout ? 'h-3.5 w-3.5' : 'h-4 w-4'
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/hub/page.tsx",
                                                        lineNumber: 335,
                                                        columnNumber: 49
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                                        className: hubCompactLayout ? 'h-3.5 w-3.5' : 'h-4 w-4'
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/hub/page.tsx",
                                                        lineNumber: 337,
                                                        columnNumber: 49
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/hub/page.tsx",
                                                    lineNumber: 328,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm text-white/50 mr-1",
                                                    children: "Sin código"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/hub/page.tsx",
                                                    lineNumber: 343,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>refreshProfile().catch(()=>{}),
                                                    className: "text-xs font-bold text-padel-primary hover:underline",
                                                    children: "Generar"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/hub/page.tsx",
                                                    lineNumber: 344,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/hub/page.tsx",
                                        lineNumber: 315,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/hub/page.tsx",
                                    lineNumber: 312,
                                    columnNumber: 25
                                }, this),
                                player && hubCompactLayout && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-1 max-w-full truncate px-1 text-center text-[9px] font-bold leading-tight text-white/85",
                                    children: [
                                        [
                                            player.name,
                                            player.lastName
                                        ].filter(Boolean).join(' '),
                                        player.category || player.level != null ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-padel-primary/90",
                                            children: [
                                                ' ',
                                                "· ",
                                                player.category ?? `Nivel ${player.level}`
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/hub/page.tsx",
                                            lineNumber: 360,
                                            columnNumber: 37
                                        }, this) : null
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/hub/page.tsx",
                                    lineNumber: 357,
                                    columnNumber: 29
                                }, this),
                                player && !hubCompactLayout && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        y: 12
                                    },
                                    animate: {
                                        opacity: 1,
                                        y: 0
                                    },
                                    className: "mt-2 w-full sm:mt-4",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PlayerCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        player: {
                                            id: player.id,
                                            name: player.name ?? '',
                                            lastName: player.lastName,
                                            photo: player.photo,
                                            level: player.level,
                                            position: player.position,
                                            category: player.category ?? (player.level != null ? `Nivel ${player.level}` : undefined)
                                        },
                                        stats: playerStats ? {
                                            ranking: playerStats.ranking,
                                            titles: playerStats.titles ?? 0,
                                            played: playerStats.played ?? 0,
                                            points: playerStats.points ?? 0
                                        } : undefined
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/hub/page.tsx",
                                        lineNumber: 373,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/hub/page.tsx",
                                    lineNumber: 368,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/hub/page.tsx",
                            lineNumber: 283,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/hub/page.tsx",
                        lineNumber: 280,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "flex min-h-0 w-full max-w-md flex-1 flex-col overflow-hidden px-2 pb-0.5 sm:px-6 sm:pb-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `flex min-h-0 w-full min-w-0 flex-1 flex-col gap-0.5 overflow-x-hidden order-2 sm:order-1 ${hubCompactLayout ? 'overflow-y-hidden' : 'overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]'}`,
                                    children: [
                                        recentPartners.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `shrink-0 ${hubCompactLayout ? 'mb-0' : 'mb-3 sm:mb-6'}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: `w-full text-center font-black uppercase tracking-widest text-white/50 ${hubCompactLayout ? 'mb-0.5 text-[8px]' : 'mb-1 text-[9px] sm:mb-2 sm:text-[10px]'}`,
                                                    children: "Inscribirse con un compañero"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/hub/page.tsx",
                                                    lineNumber: 400,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `flex flex-wrap justify-center gap-1.5 px-1 ${hubCompactLayout ? 'pb-0.5' : 'gap-1.5 sm:gap-2'}`,
                                                    children: recentPartners.map((partner)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: ()=>router.push(`/tournaments?partnerCode=${encodeURIComponent(partner.uniqueCode || '')}&partnerName=${encodeURIComponent(partner.name)}`),
                                                            className: `flex flex-col items-center rounded-lg border border-white/10 bg-white/5 transition-all hover:border-padel-primary/50 hover:bg-padel-primary/10 ${hubCompactLayout ? 'gap-0 p-0' : 'gap-0.5 p-0.5 sm:p-1 sm:rounded-xl'}`,
                                                            title: `Inscribirse con ${partner.name}`,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: `rounded-full overflow-hidden border border-padel-primary/30 bg-zinc-800 flex items-center justify-center ${hubCompactLayout ? 'h-5 w-5' : 'h-9 w-9 sm:h-12 sm:w-12'}`,
                                                                    children: partner.photo ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                        src: partner.photo,
                                                                        alt: "",
                                                                        className: "w-full h-full object-cover"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/hub/page.tsx",
                                                                        lineNumber: 420,
                                                                        columnNumber: 53
                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-sm sm:text-lg font-black text-padel-primary",
                                                                        children: (partner.name || '?').charAt(0).toUpperCase()
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/hub/page.tsx",
                                                                        lineNumber: 422,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/hub/page.tsx",
                                                                    lineNumber: 416,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: `truncate font-bold text-white/80 ${hubCompactLayout ? 'hidden' : 'max-w-[48px] text-[7px] sm:max-w-[56px] sm:text-[8px]'}`,
                                                                    children: partner.name?.split(' ')[0]
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/hub/page.tsx",
                                                                    lineNumber: 427,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, partner.userId, true, {
                                                            fileName: "[project]/src/app/hub/page.tsx",
                                                            lineNumber: 409,
                                                            columnNumber: 41
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/hub/page.tsx",
                                                    lineNumber: 405,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/hub/page.tsx",
                                            lineNumber: 399,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `min-h-0 shrink-0 ${hubCompactLayout ? 'mb-0.5' : 'mb-3 sm:mb-6'}`,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$InvitationManager$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                compact: hubCompactLayout,
                                                singlePageStrip: hubCompactLayout
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/hub/page.tsx",
                                                lineNumber: 440,
                                                columnNumber: 29
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/hub/page.tsx",
                                            lineNumber: 439,
                                            columnNumber: 25
                                        }, this),
                                        nextMatch && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                            initial: {
                                                opacity: 0,
                                                y: 10
                                            },
                                            animate: {
                                                opacity: 1,
                                                y: 0
                                            },
                                            className: `min-h-0 shrink-0 rounded-xl border border-padel-primary/30 bg-padel-primary/5 backdrop-blur-xl sm:rounded-2xl ${hubCompactLayout ? 'mb-0.5 p-1' : 'mb-3 p-3 sm:mb-6 sm:p-5'}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: `flex items-center gap-1 font-black uppercase tracking-widest text-padel-primary ${hubCompactLayout ? 'mb-0.5 text-[8px]' : 'mb-2 text-[10px] sm:mb-3 sm:text-xs'}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                            className: hubCompactLayout ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5 sm:h-4 sm:w-4'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/hub/page.tsx",
                                                            lineNumber: 453,
                                                            columnNumber: 37
                                                        }, this),
                                                        " Próximo Partido"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/hub/page.tsx",
                                                    lineNumber: 450,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: `text-white/60 ${hubCompactLayout ? 'mb-0.5 line-clamp-1 text-[7px]' : 'mb-1 text-[9px] sm:mb-2 sm:text-[10px]'}`,
                                                    children: nextMatch.tournamentName
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/hub/page.tsx",
                                                    lineNumber: 455,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `flex items-center justify-between gap-1 font-bold text-white ${hubCompactLayout ? 'mb-0.5 text-[9px] leading-tight' : 'mb-2 text-xs sm:mb-3 sm:text-sm'}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "min-w-0 truncate",
                                                            children: nextMatch.team1Name ?? 'TBD'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/hub/page.tsx",
                                                            lineNumber: 461,
                                                            columnNumber: 37
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-padel-primary shrink-0",
                                                            children: "vs"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/hub/page.tsx",
                                                            lineNumber: 462,
                                                            columnNumber: 37
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "min-w-0 truncate",
                                                            children: nextMatch.team2Name ?? 'TBD'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/hub/page.tsx",
                                                            lineNumber: 463,
                                                            columnNumber: 37
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/hub/page.tsx",
                                                    lineNumber: 458,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `flex gap-1 ${hubCompactLayout ? '' : 'gap-1.5 sm:gap-2'}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: ()=>router.push(`/tournaments/${nextMatch.tournamentId}`),
                                                            className: `flex-1 rounded-md border border-white/10 bg-white/5 font-bold uppercase text-white transition-colors hover:bg-white/10 ${hubCompactLayout ? 'py-1 text-[7px]' : 'py-2 text-[9px] sm:rounded-xl sm:py-2.5 sm:text-[10px]'}`,
                                                            children: "Ver torneo"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/hub/page.tsx",
                                                            lineNumber: 466,
                                                            columnNumber: 37
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: ()=>router.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$tournaments$2f$event$2f$components$2f$MatchCards$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildPizarraConceptHref"])(nextMatch.tournamentId, nextMatch.matchId)),
                                                            className: `flex-1 rounded-md bg-padel-primary font-black uppercase text-black transition-opacity hover:opacity-95 ${hubCompactLayout ? 'py-1 text-[7px]' : 'py-2 text-[9px] sm:rounded-xl sm:py-2.5 sm:text-[10px]'}`,
                                                            children: "Ver pizarra"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/hub/page.tsx",
                                                            lineNumber: 473,
                                                            columnNumber: 37
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/hub/page.tsx",
                                                    lineNumber: 465,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/hub/page.tsx",
                                            lineNumber: 445,
                                            columnNumber: 29
                                        }, this),
                                        tournamentId && matchId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                            initial: {
                                                opacity: 0,
                                                y: 10
                                            },
                                            animate: {
                                                opacity: 1,
                                                y: 0
                                            },
                                            className: `min-h-0 shrink-0 rounded-xl border-2 border-[#ccff00]/40 bg-[#ccff00]/5 sm:rounded-2xl ${hubCompactLayout ? 'mb-0.5 p-1' : 'mb-3 p-3 sm:mb-6 sm:p-4'}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: `font-black uppercase tracking-widest text-[#ccff00] ${hubCompactLayout ? 'mb-0.5 text-[8px]' : 'mb-1 text-[10px] sm:mb-2 sm:text-xs'}`,
                                                    children: "¡Partido finalizado!"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/hub/page.tsx",
                                                    lineNumber: 495,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: `text-white/70 ${hubCompactLayout ? 'mb-1 line-clamp-1 text-[7px]' : 'mb-2 text-[9px] sm:mb-3 sm:text-[10px]'}`,
                                                    children: "Descarga tu tarjeta de victoria (1080×1080)."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/hub/page.tsx",
                                                    lineNumber: 498,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: handleDownloadVictoryCard,
                                                    disabled: downloading,
                                                    className: `flex w-full items-center justify-center gap-1 rounded-lg bg-[#ccff00] font-black uppercase italic tracking-tight text-black disabled:opacity-50 ${hubCompactLayout ? 'py-1.5 text-[8px]' : 'gap-1.5 py-2.5 text-[10px] sm:rounded-xl sm:py-3 sm:text-xs'}`,
                                                    children: downloading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: "Generando imagen..."
                                                    }, void 0, false) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                                                className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/hub/page.tsx",
                                                                lineNumber: 511,
                                                                columnNumber: 45
                                                            }, this),
                                                            "Descargar tarjeta de victoria"
                                                        ]
                                                    }, void 0, true)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/hub/page.tsx",
                                                    lineNumber: 501,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/hub/page.tsx",
                                            lineNumber: 490,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/hub/page.tsx",
                                    lineNumber: 394,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                    "aria-label": "Acciones del hub",
                                    className: hubCompactLayout ? 'order-1 flex w-full min-w-0 shrink-0 flex-col gap-1 pb-1' : 'order-2 mt-1 flex w-full min-w-0 shrink-0 flex-col gap-2 pb-4 mb-6 sm:mt-2 sm:gap-3 sm:pb-8 sm:mb-12',
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `grid w-full min-w-0 grid-cols-2 items-stretch ${hubCompactLayout ? 'gap-0.5' : 'gap-1.5 sm:gap-2'}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                                type: "button",
                                                initial: {
                                                    opacity: 0,
                                                    y: 12
                                                },
                                                animate: {
                                                    opacity: 1,
                                                    y: 0
                                                },
                                                transition: {
                                                    delay: 0
                                                },
                                                onClick: hubProfileItem.onClick,
                                                className: `relative group flex min-h-0 w-full min-w-0 flex-col items-center justify-center border backdrop-blur-xl transition-all duration-200 active:scale-[0.97] shadow-md ${hubCompactLayout ? 'min-h-[2.65rem] gap-0 rounded-lg border p-0.5' : 'min-h-[56px] gap-0.5 rounded-xl border-2 p-1.5 sm:min-h-[72px] sm:p-2'} ${hubProfileItem.glow} bg-[#111] ${hubProfileItem.border} ${hubProfileItem.hoverBorder} hover:bg-[#181818]`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `rounded-md transition-transform group-hover:scale-110 ${hubProfileItem.bg} ${hubProfileItem.color} ${hubCompactLayout ? 'p-0.5' : 'p-1 sm:p-1.5'}`,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(HubProfileIcon, {
                                                            className: hubCompactLayout ? 'h-3 w-3' : 'h-4 w-4 sm:h-5 sm:w-5',
                                                            strokeWidth: 1.8
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/hub/page.tsx",
                                                            lineNumber: 543,
                                                            columnNumber: 41
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/hub/page.tsx",
                                                        lineNumber: 540,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-col items-center gap-0 px-0.5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: `text-center font-black italic leading-tight tracking-tight text-white ${hubCompactLayout ? 'text-[8px] leading-tight' : 'text-[10px] sm:text-[12px]'}`,
                                                                children: hubProfileItem.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/hub/page.tsx",
                                                                lineNumber: 549,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: `text-center font-bold uppercase tracking-widest ${hubCompactLayout ? 'text-[5px]' : 'text-[6px] sm:text-[7px]'} ${hubProfileItem.color} opacity-70`,
                                                                children: hubProfileItem.subtitle
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/hub/page.tsx",
                                                                lineNumber: 554,
                                                                columnNumber: 41
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/hub/page.tsx",
                                                        lineNumber: 548,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none ${hubProfileItem.bg} ${hubCompactLayout ? 'rounded-lg' : 'rounded-xl'}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/hub/page.tsx",
                                                        lineNumber: 560,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/hub/page.tsx",
                                                lineNumber: 532,
                                                columnNumber: 33
                                            }, this),
                                            hubNavColumnItems.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                                    type: "button",
                                                    initial: {
                                                        opacity: 0,
                                                        y: 12
                                                    },
                                                    animate: {
                                                        opacity: 1,
                                                        y: 0
                                                    },
                                                    transition: {
                                                        delay: 0.04 + index * 0.04
                                                    },
                                                    onClick: ()=>router.push(item.href),
                                                    className: `relative group flex min-h-0 w-full flex-col items-center justify-center border backdrop-blur-xl transition-all duration-200 active:scale-[0.97] shadow-md ${hubCompactLayout ? 'min-h-[2.65rem] gap-0 rounded-lg border p-0.5' : 'min-h-[56px] gap-0.5 rounded-xl border-2 p-1.5 sm:min-h-[72px] sm:p-2'} ${item.glow} bg-[#111] ${item.border} ${item.hoverBorder} hover:bg-[#181818]`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `rounded-md transition-transform group-hover:scale-110 ${item.bg} ${item.color} ${hubCompactLayout ? 'p-0.5' : 'p-1 sm:p-1.5'}`,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(item.icon, {
                                                                className: hubCompactLayout ? 'h-3 w-3' : 'h-4 w-4 sm:h-5 sm:w-5',
                                                                strokeWidth: 1.8
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/hub/page.tsx",
                                                                lineNumber: 577,
                                                                columnNumber: 45
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/hub/page.tsx",
                                                            lineNumber: 574,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex flex-col items-center gap-0",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                    className: `text-center font-black italic leading-tight tracking-tight text-white ${hubCompactLayout ? 'text-[8px] leading-tight' : 'text-[10px] sm:text-[12px]'}`,
                                                                    children: item.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/hub/page.tsx",
                                                                    lineNumber: 583,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: `text-center font-bold uppercase tracking-widest ${hubCompactLayout ? 'text-[5px]' : 'text-[6px] sm:text-[7px]'} ${item.color} opacity-70`,
                                                                    children: item.subtitle
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/hub/page.tsx",
                                                                    lineNumber: 588,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/hub/page.tsx",
                                                            lineNumber: 582,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none ${item.bg} ${hubCompactLayout ? 'rounded-lg' : 'rounded-xl'}`
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/hub/page.tsx",
                                                            lineNumber: 594,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, item.name, true, {
                                                    fileName: "[project]/src/app/hub/page.tsx",
                                                    lineNumber: 565,
                                                    columnNumber: 37
                                                }, this)),
                                            hubBottomItems.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                                    type: "button",
                                                    initial: {
                                                        opacity: 0,
                                                        y: 12
                                                    },
                                                    animate: {
                                                        opacity: 1,
                                                        y: 0
                                                    },
                                                    transition: {
                                                        delay: 0.16 + index * 0.04
                                                    },
                                                    onClick: ()=>{
                                                        if (item.disabled) return;
                                                        if (item.href) router.push(item.href);
                                                    },
                                                    className: `relative group flex min-h-0 w-full flex-col items-center justify-center border backdrop-blur-xl transition-all duration-200 active:scale-[0.97] shadow-md ${hubCompactLayout ? 'min-h-[2.65rem] gap-0 rounded-lg border p-0.5' : 'min-h-[56px] gap-0.5 rounded-xl border-2 p-1.5 sm:min-h-[72px] sm:p-2'} ${item.glow}
                                        ${item.disabled ? 'bg-white/3 border-white/10 opacity-40 cursor-not-allowed' : `bg-[#111] ${item.border} ${item.hoverBorder} hover:bg-[#181818]`}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `rounded-md transition-transform group-hover:scale-110 ${item.bg} ${item.color} ${hubCompactLayout ? 'p-0.5' : 'p-1 sm:p-1.5'}`,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(item.icon, {
                                                                className: hubCompactLayout ? 'h-3 w-3' : 'h-4 w-4 sm:h-5 sm:w-5',
                                                                strokeWidth: 1.8
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/hub/page.tsx",
                                                                lineNumber: 620,
                                                                columnNumber: 45
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/hub/page.tsx",
                                                            lineNumber: 617,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex flex-col items-center gap-0",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                    className: `text-center font-black italic leading-tight tracking-tight text-white ${hubCompactLayout ? 'text-[8px] leading-tight' : 'text-[10px] sm:text-[12px]'}`,
                                                                    children: item.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/hub/page.tsx",
                                                                    lineNumber: 626,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: `text-center font-bold uppercase tracking-widest ${hubCompactLayout ? 'text-[5px]' : 'text-[6px] sm:text-[7px]'} ${item.disabled ? 'text-zinc-600' : item.color} opacity-70`,
                                                                    children: item.subtitle
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/hub/page.tsx",
                                                                    lineNumber: 631,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/hub/page.tsx",
                                                            lineNumber: 625,
                                                            columnNumber: 41
                                                        }, this),
                                                        !item.disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none ${item.bg} ${hubCompactLayout ? 'rounded-lg' : 'rounded-xl'}`
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/hub/page.tsx",
                                                            lineNumber: 638,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, item.name, true, {
                                                    fileName: "[project]/src/app/hub/page.tsx",
                                                    lineNumber: 600,
                                                    columnNumber: 37
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/hub/page.tsx",
                                        lineNumber: 529,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/hub/page.tsx",
                                    lineNumber: 521,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `order-3 flex w-full items-center justify-center shrink-0 pb-[max(0.35rem,env(safe-area-inset-bottom))] ${hubCompactLayout ? 'pt-0.5' : 'pb-4 sm:pb-8'}`,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>logout(),
                                        className: `flex items-center justify-center rounded-full border border-[#FF2800]/40 bg-black font-black uppercase italic text-[#FF2800] transition-all hover:scale-105 ${hubCompactLayout ? 'gap-0.5 px-2.5 py-1 text-[7px] tracking-[0.1em]' : 'gap-1.5 px-4 py-2.5 text-[9px] tracking-[0.15em] sm:gap-2 sm:px-6 sm:py-3 sm:text-[10px] sm:tracking-[0.2em]'}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                                className: `text-[#FF2800] ${hubCompactLayout ? 'h-2.5 w-2.5' : 'h-3 w-3 sm:h-3.5 sm:w-3.5'}`
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/hub/page.tsx",
                                                lineNumber: 656,
                                                columnNumber: 33
                                            }, this),
                                            "FINALIZAR SESIÓN"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/hub/page.tsx",
                                        lineNumber: 651,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/hub/page.tsx",
                                    lineNumber: 648,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/hub/page.tsx",
                            lineNumber: 392,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/hub/page.tsx",
                        lineNumber: 391,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/hub/page.tsx",
                lineNumber: 278,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/hub/page.tsx",
        lineNumber: 266,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=src_66fc6aab._.js.map