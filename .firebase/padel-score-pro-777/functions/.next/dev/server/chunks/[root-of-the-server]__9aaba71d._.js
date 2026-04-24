module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/supabase/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSupabaseAnonServerClient",
    ()=>getSupabaseAnonServerClient,
    "getSupabaseServiceClient",
    ()=>getSupabaseServiceClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
let serviceClient = null;
let anonServerClient = null;
function getSupabaseServiceClient() {
    const url = ("TURBOPACK compile-time value", "https://cecwrpmoitxhfynpqhkc.supabase.co")?.trim();
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY)?.trim();
    if (!url || !key) return null;
    if (!serviceClient) {
        serviceClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, key);
    }
    return serviceClient;
}
function getSupabaseAnonServerClient() {
    const url = ("TURBOPACK compile-time value", "https://cecwrpmoitxhfynpqhkc.supabase.co")?.trim();
    const key = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlY3dycG1vaXR4aGZ5bnBxaGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTg1NTcsImV4cCI6MjA4NzYzNDU1N30.AovaTFBtSCB-b6EDoP4YR8u8CdiWGYzbsYR7WXpHcGk")?.trim();
    if (!url || !key) return null;
    if (!anonServerClient) {
        anonServerClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, key);
    }
    return anonServerClient;
}
}),
"[project]/src/lib/adminAccess.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Quién cuenta como administrador en la app.
 * Debe coincidir con AuthContext (acceso a /admin y acciones de admin).
 */ __turbopack_context__.s([
    "isAdminAccess",
    ()=>isAdminAccess,
    "isLegacyAdminEmail",
    ()=>isLegacyAdminEmail
]);
function isLegacyAdminEmail(email) {
    if (!email) return false;
    const e = email.toLowerCase();
    return e.includes('casainteligente') || e.includes('casanteligente') || e.includes('casainteligentemgta') || e === 'casainteligentemgta@gmail.com';
}
function isAdminAccess(role, email) {
    if ((role || '').toLowerCase() === 'admin') return true;
    return isLegacyAdminEmail(email);
}
}),
"[project]/src/lib/authServerSupabase.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAuthUser",
    ()=>getAuthUser,
    "getAuthUserWithRole",
    ()=>getAuthUserWithRole,
    "requireAuth",
    ()=>requireAuth,
    "requireRole",
    ()=>requireRole
]);
/**
 * Autenticación en APIs usando Supabase (JWT de sesión).
 * Sustituye authServer (Firebase) para que las rutas funcionen con login Supabase.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$adminAccess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/adminAccess.ts [app-route] (ecmascript)");
;
;
;
const getSupabaseServer = ()=>{
    const url = ("TURBOPACK compile-time value", "https://cecwrpmoitxhfynpqhkc.supabase.co")?.trim();
    const key = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlY3dycG1vaXR4aGZ5bnBxaGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTg1NTcsImV4cCI6MjA4NzYzNDU1N30.AovaTFBtSCB-b6EDoP4YR8u8CdiWGYzbsYR7WXpHcGk")?.trim();
    if (!url || !key) return null;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, key);
};
function getBearerToken(req) {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    return auth.slice(7).trim() || null;
}
async function getAuthUser(req) {
    const token = getBearerToken(req);
    if (!token) return null;
    const supabase = getSupabaseServer();
    if (!supabase) return null;
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return null;
        return {
            uid: user.id,
            email: user.email ?? undefined
        };
    } catch  {
        return null;
    }
}
async function getAuthUserWithRole(req) {
    const token = getBearerToken(req);
    if (!token) return null;
    const user = await getAuthUser(req);
    if (!user) return null;
    const url = ("TURBOPACK compile-time value", "https://cecwrpmoitxhfynpqhkc.supabase.co")?.trim();
    const key = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlY3dycG1vaXR4aGZ5bnBxaGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTg1NTcsImV4cCI6MjA4NzYzNDU1N30.AovaTFBtSCB-b6EDoP4YR8u8CdiWGYzbsYR7WXpHcGk")?.trim();
    if (!url || !key) {
        const role = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$adminAccess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAdminAccess"])(undefined, user.email) ? 'admin' : 'player';
        return {
            ...user,
            role
        };
    }
    try {
        const clientWithToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, key, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        });
        const { data: profile } = await clientWithToken.from('profiles').select('role').eq('id', user.uid).single();
        const dbRole = profile?.role ?? 'player';
        const role = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$adminAccess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAdminAccess"])(dbRole, user.email) ? 'admin' : dbRole;
        return {
            ...user,
            role
        };
    } catch  {
        const role = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$adminAccess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAdminAccess"])(undefined, user.email) ? 'admin' : 'player';
        return {
            ...user,
            role
        };
    }
}
function isAuthConfigured() {
    return Boolean(("TURBOPACK compile-time value", "https://cecwrpmoitxhfynpqhkc.supabase.co")?.trim() && ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlY3dycG1vaXR4aGZ5bnBxaGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTg1NTcsImV4cCI6MjA4NzYzNDU1N30.AovaTFBtSCB-b6EDoP4YR8u8CdiWGYzbsYR7WXpHcGk")?.trim());
}
async function requireAuth(req) {
    if (!isAuthConfigured()) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Error de configuración del servidor: faltan variables de Supabase (NEXT_PUBLIC_SUPABASE_*).'
        }, {
            status: 500
        });
    }
    const user = await getAuthUser(req);
    if (user) return user;
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: 'No autorizado. Inicia sesión e incluye el token en el header Authorization (Bearer).'
    }, {
        status: 401
    });
}
async function requireRole(req, allowedRoles) {
    if (!isAuthConfigured()) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Error de configuración del servidor: faltan variables de Supabase.'
        }, {
            status: 500
        });
    }
    const user = await getAuthUserWithRole(req);
    if (!user) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'No autorizado. Debes iniciar sesión para realizar esta acción.'
        }, {
            status: 401
        });
    }
    const role = user.role?.toLowerCase?.() ?? 'player';
    if (!allowedRoles.map((r)=>r.toLowerCase()).includes(role)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}.`
        }, {
            status: 403
        });
    }
    return user;
}
}),
"[project]/src/app/api/participants/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authServerSupabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/authServerSupabase.ts [app-route] (ecmascript)");
;
;
;
/** Quita fotos data:URL muy grandes del JSON del listado (pesan en red y bloquean el parseo/render). */ function lightenParticipantData(data) {
    const d = {
        ...data || {}
    };
    const photo = d.photo;
    if (typeof photo === 'string' && photo.startsWith('data:') && photo.length > 500000) {
        delete d.photo;
    }
    return d;
}
async function GET() {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseServiceClient"])();
    if (!supabase) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY).'
        }, {
            status: 501
        });
    }
    const { data, error } = await supabase.from('participants').select('*').order('created_at', {
        ascending: false
    });
    if (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
    const rows = data || [];
    const ownerIds = [
        ...new Set(rows.map((r)=>r.owner_id).filter(Boolean))
    ];
    let codeByOwner = {};
    let avatarByOwner = {};
    if (ownerIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, unique_code, avatar_url').in('id', ownerIds);
        (profiles || []).forEach((p)=>{
            if (p.unique_code) codeByOwner[p.id] = p.unique_code;
            if (p.avatar_url) avatarByOwner[p.id] = p.avatar_url;
        });
    }
    const list = rows.map((r)=>{
        const light = lightenParticipantData(r.data);
        const fromRow = typeof light.uniqueCode === 'string' && light.uniqueCode.trim() ? light.uniqueCode.trim().toUpperCase() : null;
        return {
            id: r.id,
            ownerId: r.owner_id,
            uid: r.owner_id,
            ...light,
            photo: light.photo || avatarByOwner[r.owner_id] || null,
            uniqueCode: fromRow || codeByOwner[r.owner_id] || null,
            createdAt: r.created_at,
            updatedAt: r.updated_at
        };
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(list);
}
async function DELETE(req) {
    const auth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authServerSupabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireRole"])(req, [
        'admin'
    ]);
    if (auth instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]) return auth;
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseServiceClient"])();
    if (!supabase) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY).'
        }, {
            status: 501
        });
    }
    const id = new URL(req.url).searchParams.get('id')?.trim();
    if (!id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Falta el parámetro id.'
        }, {
            status: 400
        });
    }
    const { error, count } = await supabase.from('participants').delete({
        count: 'exact'
    }).eq('id', id);
    if (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
    if (count === 0) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Participante no encontrado.'
        }, {
            status: 404
        });
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9aaba71d._.js.map