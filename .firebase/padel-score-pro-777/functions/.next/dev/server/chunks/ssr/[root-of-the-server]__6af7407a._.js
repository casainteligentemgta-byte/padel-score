module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/lib/supabase/client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient,
    "getSupabaseClient",
    ()=>getSupabaseClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-ssr] (ecmascript) <locals>");
;
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://cecwrpmoitxhfynpqhkc.supabase.co")?.trim();
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlY3dycG1vaXR4aGZ5bnBxaGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTg1NTcsImV4cCI6MjA4NzYzNDU1N30.AovaTFBtSCB-b6EDoP4YR8u8CdiWGYzbsYR7WXpHcGk")?.trim();
let client = null;
function createClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        const errorMsg = `ERROR CONFIG: ${!supabaseUrl ? 'Falta URL. ' : ''}${!supabaseAnonKey ? 'Falta Key.' : ''}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
    }
    if (!client) {
        client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
    }
    return client;
}
function getSupabaseClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        return null;
    }
    if (!client) client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
    return client;
}
}),
"[project]/src/lib/authErrorMessages.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearSupabaseBrowserStorage",
    ()=>clearSupabaseBrowserStorage,
    "getAuthErrorMessage",
    ()=>getAuthErrorMessage,
    "isInvalidRefreshTokenError",
    ()=>isInvalidRefreshTokenError
]);
const ERROR_MESSAGES = {
    'Invalid login credentials': 'Email o contraseña incorrectos.',
    'invalid_credentials': 'Email o contraseña incorrectos.',
    'Email not confirmed': 'Confirma tu correo antes de iniciar sesión.',
    'Signup disabled': 'El registro de nuevos usuarios está temporalmente deshabilitado.',
    'User already registered': 'Este email ya está registrado.',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.'
};
function isInvalidRefreshTokenError(err) {
    if (!err) return false;
    const code = typeof err?.code === 'string' ? String(err.code) : '';
    const msg = err instanceof Error ? err.message : String(err);
    const lower = `${code} ${msg}`.toLowerCase();
    return code === 'refresh_token_not_found' || lower.includes('invalid refresh token') || lower.includes('refresh token not found') || lower.includes('refresh_token_not_found');
}
function clearSupabaseBrowserStorage() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
    const strip = undefined;
}
function getAuthErrorMessage(err) {
    if (!err) return 'Ocurrió un error inesperado (no payload).';
    if (isInvalidRefreshTokenError(err)) {
        return 'Sesión expirada o no válida. Vuelve a iniciar sesión.';
    }
    const msg = err?.message || err?.error_description || err?.msg || (typeof err === 'string' ? err : JSON.stringify(err));
    const domName = typeof err?.name === 'string' ? err.name : '';
    const combinedLower = `${domName} ${msg}`.toLowerCase();
    // WebAuthn / Passkeys (DOMException y mensajes de Supabase)
    if (combinedLower.includes('notallowederror') || combinedLower.includes('not allowed') || combinedLower.includes('cancelled') || combinedLower.includes('canceled') || combinedLower.includes('aborted') || combinedLower.includes('user cancelled') || combinedLower.includes('user canceled')) {
        return 'Autenticación cancelada.';
    }
    if (combinedLower.includes('excludecredentials')) {
        return 'Este dispositivo ya está registrado';
    }
    if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
        return ERROR_MESSAGES['Invalid login credentials'];
    }
    if (msg.toLowerCase().includes('email not confirmed')) {
        return ERROR_MESSAGES['Email not confirmed'];
    }
    if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('email-already-in-use')) {
        return ERROR_MESSAGES['User already registered'];
    }
    if (msg.toLowerCase().includes('at least 6 characters')) {
        return ERROR_MESSAGES['Password should be at least 6 characters'];
    }
    if ("TURBOPACK compile-time truthy", 1) {
        return `Error de autenticación: ${msg}`;
    }
    //TURBOPACK unreachable
    ;
}
}),
"[project]/src/lib/apiValidation.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Validación básica de entradas para las APIs (evitar datos mal formados y límites razonables).
 */ /**
 * Sanitiza strings para eliminar etiquetas HTML y prevenir ataques XSS básicos.
 */ __turbopack_context__.s([
    "aiAgentIds",
    ()=>aiAgentIds,
    "emailTypes",
    ()=>emailTypes,
    "matchStatuses",
    ()=>matchStatuses,
    "participantLevels",
    ()=>participantLevels,
    "sanitizeString",
    ()=>sanitizeString,
    "tournamentCategories",
    ()=>tournamentCategories,
    "tournamentTypes",
    ()=>tournamentTypes,
    "validateAiBody",
    ()=>validateAiBody,
    "validateEmailBody",
    ()=>validateEmailBody,
    "validateInscriptionBody",
    ()=>validateInscriptionBody,
    "validateMatchBody",
    ()=>validateMatchBody,
    "validateMatchId",
    ()=>validateMatchId,
    "validateParticipantBody",
    ()=>validateParticipantBody,
    "validateTournamentBody",
    ()=>validateTournamentBody,
    "validateTournamentId",
    ()=>validateTournamentId
]);
function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/<[^>]*>?/gm, '') // Elimina etiquetas HTML
    .replace(/[&<>"']/g, (m)=>({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        })[m]).trim();
}
const MAX_STRING = (len)=>(v)=>typeof v === 'string' && v.length > 0 && v.length <= len;
const OPT_STRING = (max)=>(v)=>v == null || typeof v === 'string' && v.length <= max;
const NUM_RANGE = (min, max)=>(v)=>typeof v === 'number' && !Number.isNaN(v) && v >= min && v <= max;
const OPT_NUM_RANGE = (min, max)=>(v)=>v == null || typeof v === 'number' && !Number.isNaN(v) && v >= min && v <= max;
const ONE_OF = (allowed)=>(v)=>typeof v === 'string' && allowed.includes(v);
const ARRAY_MIN = (min)=>(v)=>Array.isArray(v) && v.length >= min;
const ARRAY_STRINGS = (v)=>Array.isArray(v) && v.every((item)=>typeof item === 'string');
const validDate = (v)=>{
    if (typeof v !== 'string') return false;
    const d = new Date(v);
    return !Number.isNaN(d.getTime());
};
const validEmail = (v)=>{
    if (typeof v !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
};
const tournamentTypes = [
    'AMERICANO_INDIVIDUAL',
    'AMERICANO_DUPLA',
    'KNOCKOUT',
    'ROUND_ROBIN',
    'CRUZADO'
];
const tournamentCategories = [
    'MALE',
    'FEMALE',
    'MIXED',
    'PRIMERA',
    'SEGUNDA',
    'TERCERA',
    'CUARTA',
    'QUINTA',
    'SEXTA',
    'SEPTIMA',
    'MAS_40',
    'FEM_40',
    'MIX_40',
    'MAS_45',
    'MAS_50',
    'SUMA_7',
    'SUMA_8',
    'SUMA_9',
    'SUMA_10',
    'SUMA_11'
];
const participantLevels = [
    '1.0',
    '1.5',
    '2.0',
    '2.5',
    '3.0',
    '3.5',
    '4.0',
    '4.5',
    '5.0',
    '5.5',
    '6.0',
    '7.0'
];
const matchStatuses = [
    'PENDING',
    'LIVE',
    'PAUSED',
    'FINISHED',
    'CANCELLED'
];
const aiAgentIds = [
    'safeguard',
    'media',
    'stats',
    'organizer',
    'midas',
    'aura',
    'reporter',
    'analyst',
    'coach'
];
const emailTypes = [
    'NEW_PLAYER',
    'NEW_INSCRIPTION'
];
function validateTournamentBody(body) {
    if (body == null || typeof body !== 'object') return {
        error: 'Body inválido'
    };
    const b = body;
    if (!MAX_STRING(200)(b.name)) return {
        error: 'Nombre requerido (máx. 200 caracteres)'
    };
    if (!validDate(b.startDate)) return {
        error: 'Fecha de inicio inválida'
    };
    if (!ARRAY_MIN(1)(b.teamIds)) return {
        error: 'teamIds debe ser un array con al menos un equipo'
    };
    if (b.totalCourts != null && !NUM_RANGE(1, 100)(b.totalCourts)) return {
        error: 'totalCourts debe estar entre 1 y 100'
    };
    if (b.bufferMinutes != null && !NUM_RANGE(0, 240)(b.bufferMinutes)) return {
        error: 'bufferMinutes debe estar entre 0 y 240'
    };
    if (b.type != null && !ONE_OF(tournamentTypes)(b.type)) return {
        error: 'Tipo de torneo no válido'
    };
    if (b.category != null && !ONE_OF(tournamentCategories)(b.category)) return {
        error: 'Categoría no válida'
    };
    // Validaciones adicionales para horarios y club
    if (b.clubHoursStart != null && !MAX_STRING(10)(b.clubHoursStart)) return {
        error: 'Hora inicio club inválida'
    };
    if (b.clubHoursEnd != null && !MAX_STRING(10)(b.clubHoursEnd)) return {
        error: 'Hora fin club inválida'
    };
    if (b.complexName != null && !MAX_STRING(200)(b.complexName)) return {
        error: 'Nombre del complejo demasiado largo'
    };
    return {};
}
function validateMatchBody(body) {
    if (body == null) return {};
    if (typeof body !== 'object') return {
        error: 'Body debe ser un objeto'
    };
    const b = body;
    if (b.status != null && !ONE_OF(matchStatuses)(b.status)) return {
        error: 'Estado de partido no válido'
    };
    if (b.score != null && typeof b.score !== 'string') return {
        error: 'score debe ser string'
    };
    if (b.score != null && b.score.length > 100) return {
        error: 'score demasiado largo'
    };
    if (b.actualStartTime != null && !validDate(b.actualStartTime)) return {
        error: 'actualStartTime inválido'
    };
    if (b.actualEndTime != null && !validDate(b.actualEndTime)) return {
        error: 'actualEndTime inválido'
    };
    return {};
}
/** Validar body de POST /api/ai */ const MAX_MESSAGE_LENGTH = 8000;
function validateAiBody(body) {
    if (body == null || typeof body !== 'object') return {
        error: 'Body inválido'
    };
    const b = body;
    const message = b.message ?? b.prompt ?? '';
    if (typeof message !== 'string' || message.trim().length === 0) return {
        error: 'message o prompt requerido'
    };
    if (message.length > MAX_MESSAGE_LENGTH) return {
        error: `Mensaje demasiado largo (máx. ${MAX_MESSAGE_LENGTH} caracteres)`
    };
    const agentId = String(b.agentId ?? b.role ?? 'organizer');
    if (!ONE_OF(aiAgentIds)(agentId)) return {
        error: 'agentId no válido'
    };
    return {};
}
function validateEmailBody(body) {
    if (body == null || typeof body !== 'object') return {
        error: 'Body inválido'
    };
    const b = body;
    if (!ONE_OF(emailTypes)(b.type)) return {
        error: 'Tipo de email no válido'
    };
    if (b.data == null || typeof b.data !== 'object') return {
        error: 'Datos de email requeridos'
    };
    return {};
}
function validateMatchId(id) {
    if (typeof id !== 'string' || id.length === 0 || id.length > 100) return {
        error: 'ID de partido inválido'
    };
    if (!/^[a-zA-Z0-9_\-]+$/.test(id)) return {
        error: 'ID de partido con caracteres no permitidos'
    };
    return {};
}
function validateTournamentId(id) {
    if (typeof id !== 'string' || id.length === 0 || id.length > 100) return {
        error: 'ID de torneo inválido'
    };
    if (!/^[a-zA-Z0-9_\-]+$/.test(id)) return {
        error: 'ID de torneo con caracteres no permitidos'
    };
    return {};
}
function validateParticipantBody(body) {
    if (body == null || typeof body !== 'object') return {
        error: 'Datos de participante inválidos'
    };
    const b = body;
    if (!MAX_STRING(100)(b.name)) return {
        error: 'Nombre es requerido'
    };
    if (b.email != null && !validEmail(b.email)) return {
        error: 'Email inválido'
    };
    if (b.phone != null && !MAX_STRING(20)(b.phone)) return {
        error: 'Teléfono inválido'
    };
    return {};
}
function validateInscriptionBody(body) {
    if (body == null || typeof body !== 'object') return {
        error: 'Datos de inscripción inválidos'
    };
    const b = body;
    if (!b.tournamentId) return {
        error: 'ID de torneo requerido'
    };
    if (!b.categoryKey) return {
        error: 'Categoría requerida'
    };
    if (!MAX_STRING(100)(b.participantName)) return {
        error: 'Nombre del participante requerido'
    };
    return {};
}
}),
"[project]/src/lib/apiAuth.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAuthHeaders",
    ()=>getAuthHeaders
]);
/**
 * Helpers para enviar el token de autenticación en las peticiones a las APIs protegidas.
 * Uso: headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) }
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/client.ts [app-ssr] (ecmascript)");
;
async function getAuthHeaders() {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
    if (!supabase) return {};
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return {};
        return {
            Authorization: `Bearer ${session.access_token}`
        };
    } catch  {
        return {};
    }
}
}),
"[project]/src/lib/matchScoringRules.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Reglas de marcador según el formato del torneo (creación en /new-tournament).
 *
 * Nombres en UI (referencia):
 * - ONE_SET_6: un set a 6 juegos.
 * - ONE_SET_9: un set “largo” a 9 juegos (TB de set en 8-8).
 * - TWO_SHORT_SETS: dos sets cortos a 4 juegos; si el partido va 1-1 en sets → tramo decisivo (STB o TB según tieBreakType).
 * - TWO_NORMAL_SETS: dos sets largos a 6 juegos; si 1-1 en sets → mismo decisivo.
 *
 * - Juego: puntos 0/15/30/40/AD (o punto de oro si aplica).
 * - Tie-break **dentro** de un set (6-6, 4-4, 8-8…): siempre a 7 con margen 2 (no usa tieBreakType del torneo).
 * - Tras **1-1 en sets** (solo formatos con usesSuperTiebreakDecider): tieBreakType STB → 10 puntos con margen 2; TB → 7.
 */ __turbopack_context__.s([
    "getScoringRules",
    ()=>getScoringRules,
    "isSetCompleteByGames",
    ()=>isSetCompleteByGames,
    "shouldEnterSetTiebreak",
    ()=>shouldEnterSetTiebreak,
    "winsTiebreakPoints",
    ()=>winsTiebreakPoints
]);
const DEFAULT_SET_TB = 7;
function getScoringRules(matchFormat, tieBreakType) {
    const stbPts = tieBreakType === 'STB' ? 10 : 7;
    const fmt = String(matchFormat || '').toUpperCase();
    switch(fmt){
        // Legacy aliases used by older generator records.
        case '2SETS_STB':
            return {
                gamesToWinSet: 6,
                tiebreakGamesEntry: 6,
                setTiebreakPointsToWin: DEFAULT_SET_TB,
                setsToWinMatch: 2,
                usesSuperTiebreakDecider: true,
                superTiebreakPointsToWin: stbPts
            };
        case '3SETS':
        case 'BEST_OF_3':
        case 'THREE_SETS':
            return {
                gamesToWinSet: 6,
                tiebreakGamesEntry: 6,
                setTiebreakPointsToWin: DEFAULT_SET_TB,
                setsToWinMatch: 2,
                usesSuperTiebreakDecider: false,
                superTiebreakPointsToWin: stbPts
            };
        case 'ONE_SET_9':
            return {
                gamesToWinSet: 9,
                tiebreakGamesEntry: 8,
                setTiebreakPointsToWin: DEFAULT_SET_TB,
                setsToWinMatch: 1,
                usesSuperTiebreakDecider: false,
                superTiebreakPointsToWin: stbPts
            };
        case 'TWO_SHORT_SETS':
            return {
                gamesToWinSet: 4,
                tiebreakGamesEntry: 4,
                setTiebreakPointsToWin: DEFAULT_SET_TB,
                setsToWinMatch: 2,
                usesSuperTiebreakDecider: true,
                superTiebreakPointsToWin: stbPts
            };
        case 'TWO_NORMAL_SETS':
            return {
                gamesToWinSet: 6,
                tiebreakGamesEntry: 6,
                setTiebreakPointsToWin: DEFAULT_SET_TB,
                setsToWinMatch: 2,
                usesSuperTiebreakDecider: true,
                superTiebreakPointsToWin: stbPts
            };
        case 'ONE_SET_6':
            return {
                gamesToWinSet: 6,
                tiebreakGamesEntry: 6,
                setTiebreakPointsToWin: DEFAULT_SET_TB,
                setsToWinMatch: 1,
                usesSuperTiebreakDecider: false,
                superTiebreakPointsToWin: stbPts
            };
        // Formato por defecto: 2 sets normales a 6 juegos con STB en caso de 1-1
        default:
            return {
                gamesToWinSet: 6,
                tiebreakGamesEntry: 6,
                setTiebreakPointsToWin: DEFAULT_SET_TB,
                setsToWinMatch: 2,
                usesSuperTiebreakDecider: true,
                superTiebreakPointsToWin: stbPts
            };
    }
}
function isSetCompleteByGames(g1, g2, gamesToWin) {
    const a = Math.max(g1, g2);
    const diff = Math.abs(g1 - g2);
    if (a >= gamesToWin && diff >= 2) return true;
    if (a > gamesToWin) return true;
    return false;
}
function shouldEnterSetTiebreak(g1, g2, tiebreakGamesEntry) {
    return g1 === tiebreakGamesEntry && g2 === tiebreakGamesEntry;
}
function winsTiebreakPoints(nextLeader, trailer, target) {
    return nextLeader >= target && nextLeader - trailer >= 2;
}
}),
"[project]/src/lib/matchOrderMeta.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "inferMatchOrderFromId",
    ()=>inferMatchOrderFromId,
    "syncMatchOrderFields",
    ()=>syncMatchOrderFields
]);
/**
 * Metadatos de orden de partido para hub, marker, SQL y exportaciones.
 * Mantiene alineados camelCase y snake_case.
 */ const ORDER_KEYS = [
    'match_number',
    'matchNumber',
    'order',
    'orden'
];
function firstDefinedOrder(data) {
    for (const k of ORDER_KEYS){
        const n = Number(data[k]);
        if (Number.isFinite(n) && n >= 1) return Math.floor(n);
    }
    return null;
}
function inferMatchOrderFromId(id) {
    if (typeof id !== 'string' || !id) return null;
    const m = id.match(/^m-[^-]+-(\d+)-/);
    if (m) {
        const k = parseInt(m[1], 10);
        if (!Number.isFinite(k)) return null;
        return k >= 1 ? k : k + 1;
    }
    const m2 = id.match(/^match-(\d+)-/);
    if (m2) {
        const idx = parseInt(m2[1], 10);
        return Number.isFinite(idx) ? idx + 1 : null;
    }
    const m3 = id.match(/^sf-[^-]+-(\d+)-/);
    if (m3) {
        const n = parseInt(m3[1], 10);
        return Number.isFinite(n) && n >= 1 ? 100 + n - 1 : null;
    }
    return null;
}
function syncMatchOrderFields(data) {
    const out = {
        ...data
    };
    let n = firstDefinedOrder(out);
    if (n == null) n = inferMatchOrderFromId(out.id);
    if (n != null && Number.isFinite(n) && n >= 1) {
        out.match_number = n;
        out.matchNumber = n;
        out.order = n;
        out.orden = n;
    }
    return out;
}
}),
"[project]/src/lib/canchaPublicidadQuery.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "selectCanchaPublicidadPlaylist",
    ()=>selectCanchaPublicidadPlaylist
]);
/** Con `venue_name` (migración 017+). */ const CANCHA_PUBLICIDAD_BASE_VENUE = 'id, cancha_id, venue_name, media_id, orden, duracion_segundos, posicion_pantalla';
/** Sin `venue_name` (tablas antiguas). */ const CANCHA_PUBLICIDAD_BASE = 'id, cancha_id, media_id, orden, duracion_segundos, posicion_pantalla';
async function selectCanchaPublicidadPlaylist(supabase, canchaId, venueName) {
    const vn = venueName?.trim() || null;
    let res = await (()=>{
        let q = supabase.from('cancha_publicidad').select(`${CANCHA_PUBLICIDAD_BASE_VENUE}, media_content(*)`).eq('cancha_id', canchaId);
        if (vn) q = q.eq('venue_name', vn);
        return q.order('orden', {
            ascending: true
        });
    })();
    if (!res.error) return res;
    res = await (()=>{
        let q = supabase.from('cancha_publicidad').select(`${CANCHA_PUBLICIDAD_BASE}, media_content(*)`).eq('cancha_id', canchaId);
        if (vn) q = q.eq('venue_name', vn);
        return q.order('orden', {
            ascending: true
        });
    })();
    if (!res.error) return res;
    res = await (()=>{
        let q = supabase.from('cancha_publicidad').select(`${CANCHA_PUBLICIDAD_BASE_VENUE}, publicidad(*)`).eq('cancha_id', canchaId);
        if (vn) q = q.eq('venue_name', vn);
        return q.order('orden', {
            ascending: true
        });
    })();
    if (!res.error) return res;
    let q = supabase.from('cancha_publicidad').select(`${CANCHA_PUBLICIDAD_BASE}, publicidad(*)`).eq('cancha_id', canchaId);
    if (vn) q = q.eq('venue_name', vn);
    return q.order('orden', {
        ascending: true
    });
}
}),
"[project]/src/lib/dataService.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ROLES",
    ()=>ROLES,
    "confirmReservedTeam",
    ()=>confirmReservedTeam,
    "dataService",
    ()=>dataService,
    "isValidInscriptionId",
    ()=>isValidInscriptionId
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/apiValidation.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/apiAuth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchScoringRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/matchScoringRules.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchOrderMeta$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/matchOrderMeta.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$canchaPublicidadQuery$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/canchaPublicidadQuery.ts [app-ssr] (ecmascript)");
;
;
;
;
;
;
const supabase = ()=>{
    const c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
    if (!c) {
        const urlMissing = !("TURBOPACK compile-time value", "https://cecwrpmoitxhfynpqhkc.supabase.co");
        const keyMissing = !("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlY3dycG1vaXR4aGZ5bnBxaGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTg1NTcsImV4cCI6MjA4NzYzNDU1N30.AovaTFBtSCB-b6EDoP4YR8u8CdiWGYzbsYR7WXpHcGk");
        let details = '';
        if (urlMissing) details += ' (Falta URL)';
        if (keyMissing) details += ' (Falta Anon Key)';
        if (!urlMissing && !keyMissing && ("TURBOPACK compile-time value", "undefined") === 'undefined') details += ' (Error Server-Side)';
        throw new Error(`Supabase no configurado${details}. Asegúrate de reiniciar el servidor tras editar .env.local`);
    }
    return c;
};
/**
 * Convierte el objeto error de Supabase en un Error nativo para que
 * los stack traces muestren el mensaje real en lugar de "[object Object]".
 */ function throwIfError(error) {
    if (!error) return;
    if (error instanceof Error) throw error;
    const msg = error?.message || error?.details || error?.hint || JSON.stringify(error);
    const err = new Error(msg);
    if (error?.code) err.code = error.code;
    throw err;
}
const now = ()=>new Date().toISOString();
function isValidInscriptionId(id) {
    if (!id || typeof id !== 'string') return false;
    const s = id.trim();
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}
// ── Time Synchronization (NTP-like using Supabase Headers) ─────────────
let globalClockOffset = 0;
let clockSynced = false;
const ROLES = {
    ADMIN: 'admin',
    PLAYER: 'player',
    MARKER: 'marker'
};
const generateUniqueCode = ()=>{
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for(let i = 0; i < 6; i++){
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};
function sanitizeObject(obj) {
    if (obj == null || typeof obj !== 'object') return obj;
    const result = Array.isArray(obj) ? [] : {};
    for(const key in obj){
        if (typeof obj[key] === 'string') {
            result[key] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(obj[key]);
        } else if (typeof obj[key] === 'object') {
            result[key] = sanitizeObject(obj[key]);
        } else {
            result[key] = obj[key];
        }
    }
    return result;
}
/**
 * Sets ganados desde setScores (+ STB si aún no hay ganador) cuando `sets.t1`/`t2` van desfasados
 * (simulación, merge realtime parcial, marcador que escribe solo setScores).
 */ function inferSetWinsFromMarks(m, need) {
    let w1 = 0;
    let w2 = 0;
    const scores = m?.setScores;
    if (Array.isArray(scores)) {
        for (const row of scores){
            if (!row || typeof row !== 'object') continue;
            const o = row;
            const a = Number(o.t1 ?? row.team1 ?? row.local);
            const b = Number(o.t2 ?? row.team2 ?? row.visitante);
            if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
            if (a > b) w1++;
            else if (b > a) w2++;
        }
    }
    const stb = m?.superTiebreakScore;
    if (stb && typeof stb === 'object' && w1 < need && w2 < need) {
        const o = stb;
        const a = Number(o.t1 ?? stb.team1);
        const b = Number(o.t2 ?? stb.team2);
        if (Number.isFinite(a) && Number.isFinite(b) && a !== b && (a > 0 || b > 0)) {
            if (a > b) w1++;
            else w2++;
        }
    }
    return {
        w1,
        w2
    };
}
function pickFirstNonEmptyString(r, keys) {
    for (const k of keys){
        const v = r[k];
        if (v != null && String(v).trim() !== '') return String(v);
    }
    return undefined;
}
/** Fila considerada activa si no hay columna booleana o viene verdadero. */ function isPaymentMethodRowActive(row) {
    const r = row;
    const v = r.is_active ?? r.active ?? r.enabled;
    if (v === undefined || v === null) return true;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    const s = String(v).toLowerCase();
    return s !== 'false' && s !== '0' && s !== 'no';
}
/**
 * `payment_methods` puede tener columnas distintas según el proyecto (sin `name`/`created_at`).
 * Unificamos lo que usa la UI: id, name, iban, instructions, is_active.
 */ function normalizePaymentMethodRow(row, index) {
    const r = row;
    const id = r.id != null ? String(r.id) : `payment-method-${index}`;
    const nameRaw = pickFirstNonEmptyString(r, [
        'name',
        'title',
        'label',
        'method_name',
        'display_name',
        'method',
        'tipo',
        'type',
        'descripcion_corta'
    ]);
    const iban = pickFirstNonEmptyString(r, [
        'iban',
        'account_number',
        'cuenta',
        'numero_cuenta',
        'account',
        'numero'
    ]);
    const instructions = pickFirstNonEmptyString(r, [
        'instructions',
        'notas',
        'description',
        'descripcion',
        'instrucciones'
    ]);
    return {
        id,
        name: (nameRaw || 'Método de pago').trim(),
        iban,
        instructions,
        is_active: isPaymentMethodRowActive(row)
    };
}
const dataService = {
    normalizeMatchStatus (status) {
        return String(status || '').trim().toUpperCase();
    },
    /** Partidos aún no iniciados: generación usa PENDING; flujo Marker/Hub puede usar SCHEDULED. */ isMatchPorComenzarStatus (status) {
        const s = this.normalizeMatchStatus(status);
        return s === 'SCHEDULED' || s === 'PENDING';
    },
    /**
     * En vivo en el hub: marker (WARM_UP / IN_PROGRESS) y flujos legacy (LIVE / PAUSED / STARTED).
     */ isMatchEnVivoStatus (status) {
        const s = this.normalizeMatchStatus(status);
        return s === 'WARM_UP' || s === 'IN_PROGRESS' || s === 'EN_CURSO' || s === 'LIVE' || s === 'PAUSED' || s === 'STARTED';
    },
    /**
     * Partidos que deben listarse como finalizados en el hub.
     * Incluye recuperación si `status` no llegó a FINISHED (merge, marcador sin setScores, etc.).
     */ isMatchFinishedLike (m) {
        const s = this.normalizeMatchStatus(m?.status);
        if (s === 'FINISHED' || s === 'FINALIZADO' || s === 'COMPLETE' || s === 'COMPLETED') return true;
        const endIso = m?.finishedAt || m?.actualEndTime;
        if (endIso) {
            const ms = new Date(endIso).getTime();
            if (!isNaN(ms) && ms > 0) return true;
        }
        const t1 = Number(m?.sets?.t1 ?? m?.sets?.local ?? 0) || 0;
        const t2 = Number(m?.sets?.t2 ?? m?.sets?.visitante ?? 0) || 0;
        const mf = m?.rrMatchFormat ?? m?.match_format ?? m?.matchFormat;
        const tbtRaw = m?.tieBreakType ?? m?.tie_break_type;
        const tbtUp = String(tbtRaw || '').toUpperCase();
        const tbtArg = tbtUp === 'STB' ? 'STB' : tbtUp === 'TB' ? 'TB' : undefined;
        const rules = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchScoringRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getScoringRules"])(mf, tbtArg);
        let need = rules.setsToWinMatch;
        const needRaw = Number(m?.sets_to_win_match ?? m?.setsToWinMatch);
        if (Number.isFinite(needRaw) && needRaw >= 1) need = needRaw;
        if (t1 >= need || t2 >= need) return true;
        const inferred = inferSetWinsFromMarks(m, need);
        if (inferred.w1 >= need || inferred.w2 >= need) return true;
        return false;
    },
    listMatchesPorComenzar (matches, excludedMatchIds) {
        const list = Array.isArray(matches) ? matches : [];
        const toOrder = (m, idx)=>{
            const n = Number(m?.match_number ?? m?.matchNumber ?? m?.order ?? m?.orden);
            return Number.isFinite(n) ? n : idx + 1;
        };
        return list.filter((m)=>this.isMatchPorComenzarStatus(m?.status)).filter((m)=>!this.isMatchEnVivoStatus(m?.status)).filter((m)=>!this.isMatchFinishedLike(m)).filter((m)=>{
            if (!excludedMatchIds || excludedMatchIds.size === 0) return true;
            return !excludedMatchIds.has(String(m?.id || ''));
        }).sort((a, b)=>toOrder(a, 0) - toOrder(b, 0));
    },
    listMatchesEnVivo (matches) {
        const list = Array.isArray(matches) ? matches : [];
        return list.filter((m)=>{
            // Prioridad: un partido cerrado nunca debe listarse como en vivo (p. ej. status desincronizado).
            if (this.isMatchFinishedLike(m)) return false;
            if (!this.isMatchEnVivoStatus(m?.status)) return false;
            return true;
        });
    },
    listMatchesTerminados (matches) {
        const list = Array.isArray(matches) ? matches : [];
        const toMs = (m)=>new Date(m?.updated_at || m?.updatedAt || m?.actualEndTime || m?.finishedAt || 0).getTime();
        return list.filter((m)=>this.isMatchFinishedLike(m)).sort((a, b)=>toMs(b) - toMs(a));
    },
    // Time Synchronization
    async syncSystemClock () {
        if (clockSynced) return;
        try {
            const url = ("TURBOPACK compile-time value", "https://cecwrpmoitxhfynpqhkc.supabase.co");
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const res = await fetch(`${url}/rest/v1/`, {
                method: 'HEAD',
                cache: 'no-store'
            });
            const serverDateStr = res.headers.get('Date');
            if (serverDateStr) {
                const serverMs = new Date(serverDateStr).getTime();
                if (!isNaN(serverMs)) {
                    globalClockOffset = serverMs - Date.now();
                    clockSynced = true;
                    console.log('[TimeSync] Offset applied:', globalClockOffset, 'ms');
                }
            }
        } catch (err) {
            console.warn('[TimeSync] Failed to sync clock:', err);
        }
    },
    getSyncedNow () {
        return Date.now() + globalClockOffset;
    },
    // Media & Ticker Management
    async getTiraInformativa (pantallaId) {
        const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
        if (!client) return [];
        try {
            let query = client.from('tira_informativa').select('*').eq('activo', true);
            if (pantallaId) {
                // Incluir mensajes específicos de la pantalla O mensajes globales (null)
                query = query.or(`pantalla_id.eq.${pantallaId},pantalla_id.is.null`);
            }
            const { data, error } = await query.order('orden', {
                ascending: true
            });
            if (error) {
                console.warn('[dataService] getTiraInformativa error:', error.message);
                return [];
            }
            return data || [];
        } catch (e) {
            console.warn('[dataService] getTiraInformativa exception:', e);
            return [];
        }
    },
    async getPantallas () {
        const { data, error } = await supabase().from('pantallas').select('*').order('nombre', {
            ascending: true
        });
        throwIfError(error);
        return data || [];
    },
    async getPantallaEstado (pantallaId) {
        const { data, error } = await supabase().from('display_estado').select('*, media_content(*)').ilike('pantalla_id', `${pantallaId}%`);
        throwIfError(error);
        return data || [];
    },
    async createTournament (data, ownerId) {
        const { id, ...rest } = data;
        const { data: row, error } = await supabase().from('tournaments').insert({
            owner_id: ownerId,
            data: rest,
            created_at: now(),
            updated_at: now()
        }).select('id').single();
        throwIfError(error);
        return {
            id: row?.id
        };
    },
    async updateTournament (id, data) {
        const { id: _, ownerId: __, createdAt: ___, updatedAt: ____, ...rest } = data;
        const { error } = await supabase().from('tournaments').update({
            data: rest,
            updated_at: now()
        }).eq('id', id);
        throwIfError(error);
    },
    async getMyTournaments (ownerId) {
        const { data, error } = await supabase().from('tournaments').select('*').eq('owner_id', ownerId).order('created_at', {
            ascending: false
        });
        throwIfError(error);
        return (data || []).map((r)=>({
                id: r.id,
                ownerId: r.owner_id,
                ...r.data || {},
                createdAt: r.created_at,
                updatedAt: r.updated_at
            }));
    },
    async listAllTournaments () {
        const { data, error } = await supabase().from('tournaments').select('*').order('created_at', {
            ascending: false
        });
        throwIfError(error);
        return (data || []).map((r)=>({
                id: r.id,
                ownerId: r.owner_id,
                ...r.data || {},
                createdAt: r.created_at,
                updatedAt: r.updated_at
            }));
    },
    async getTournament (id) {
        const { data, error } = await supabase().from('tournaments').select('*').eq('id', id).single();
        if (error || !data) return null;
        return {
            id: data.id,
            ownerId: data.owner_id,
            ...data.data,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    },
    async deleteTournament (id) {
        const db = supabase();
        await db.from('tournament_matches').delete().eq('tournament_id', id);
        const { error } = await db.from('tournaments').delete().eq('id', id);
        throwIfError(error);
    },
    async getMatches (tournamentId) {
        try {
            const { data, error } = await supabase().from('tournament_matches').select('*').eq('tournament_id', tournamentId);
            throwIfError(error);
            return (data || []).map((r)=>({
                    ...r.data || {},
                    tournament_id: r.tournament_id,
                    ownerId: r.owner_id,
                    createdAt: r.created_at,
                    updatedAt: r.updated_at,
                    id: r.id
                }));
        } catch (e) {
            // Evita romper la UI cuando hay fallas transitorias de red/Supabase.
            console.warn('[dataService] getMatches fallback (fetch error):', e);
            return [];
        }
    },
    /** Una fila de `tournament_matches` (mismo shape que `getMatches`). Útil para pizarra con matchId fijo. */ async getMatchById (tournamentId, matchId) {
        try {
            const { data, error } = await supabase().from('tournament_matches').select('*').eq('tournament_id', tournamentId).eq('id', matchId).maybeSingle();
            throwIfError(error);
            if (!data) return null;
            const r = data;
            return {
                ...r.data || {},
                tournament_id: r.tournament_id,
                ownerId: r.owner_id,
                createdAt: r.created_at,
                updatedAt: r.updated_at,
                id: r.id
            };
        } catch (e) {
            console.warn('[dataService] getMatchById:', e);
            return null;
        }
    },
    async getScheduledMatches (tournamentId) {
        const rows = await this.getMatches(tournamentId);
        return rows.filter((m)=>this.isMatchPorComenzarStatus(m?.status)).sort((a, b)=>{
            const aN = Number(a?.match_number ?? a?.matchNumber ?? a?.order ?? a?.orden);
            const bN = Number(b?.match_number ?? b?.matchNumber ?? b?.order ?? b?.orden);
            const aOrder = Number.isFinite(aN) ? aN : Number.MAX_SAFE_INTEGER;
            const bOrder = Number.isFinite(bN) ? bN : Number.MAX_SAFE_INTEGER;
            return aOrder - bOrder;
        });
    },
    async getLiveMatchesByTournament (tournamentId) {
        const rows = await this.getMatches(tournamentId);
        return rows.filter((m)=>this.isMatchEnVivoStatus(m?.status));
    },
    async getFinishedMatches (tournamentId) {
        const rows = await this.getMatches(tournamentId);
        return rows.filter((m)=>this.isMatchFinishedLike(m)).sort((a, b)=>{
            const aMs = new Date(a?.updated_at || a?.updatedAt || a?.actualEndTime || a?.finishedAt || 0).getTime();
            const bMs = new Date(b?.updated_at || b?.updatedAt || b?.actualEndTime || b?.finishedAt || 0).getTime();
            return bMs - aMs;
        });
    },
    /** Normaliza patch al cerrar partido para que el hub siempre detecte Finalizados. */ normalizeFinishedMatchPatch (patch) {
        const out = {
            ...patch
        };
        if (out.status == null) return out;
        const ns = this.normalizeMatchStatus(out.status);
        if (ns !== 'FINISHED' && ns !== 'COMPLETE' && ns !== 'COMPLETED' && ns !== 'FINALIZADO') return out;
        out.status = 'FINISHED';
        const nowIso = new Date().toISOString();
        const toIso = (v)=>{
            if (v == null) return null;
            if (v instanceof Date) return isNaN(v.getTime()) ? null : v.toISOString();
            if (typeof v === 'string' && v.trim()) return v;
            const d = new Date(v);
            return isNaN(d.getTime()) ? null : d.toISOString();
        };
        const endIso = toIso(out.actualEndTime) || toIso(out.finishedAt) || nowIso;
        if (!toIso(out.finishedAt)) out.finishedAt = endIso;
        if (!toIso(out.actualEndTime)) out.actualEndTime = endIso;
        return out;
    },
    async updateMatch (tournamentId, matchId, data) {
        const patch = data && typeof data === 'object' ? this.normalizeFinishedMatchPatch({
            ...data
        }) : data;
        const { data: row } = await supabase().from('tournament_matches').select('data').eq('tournament_id', tournamentId).eq('id', matchId).single();
        const currentStatus = this.normalizeMatchStatus(row?.data?.status);
        const nextStatus = this.normalizeMatchStatus(patch?.status ?? row?.data?.status);
        if (currentStatus === 'FINISHED' && nextStatus !== 'FINISHED') {
            throw new Error('El partido ya está FINISHED y no puede modificarse.');
        }
        const merged = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchOrderMeta$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["syncMatchOrderFields"])({
            ...row?.data || {},
            ...patch,
            id: matchId
        });
        if ('id' in merged) delete merged.id;
        const { error } = await supabase().from('tournament_matches').update({
            data: merged,
            updated_at: now()
        }).eq('tournament_id', tournamentId).eq('id', matchId);
        throwIfError(error);
    },
    async deleteMatch (tournamentId, matchId) {
        const { error } = await supabase().from('tournament_matches').delete().eq('tournament_id', tournamentId).eq('id', matchId);
        throwIfError(error);
    },
    async deleteTournamentMatches (tournamentId, filter) {
        let query = supabase().from('tournament_matches').delete().eq('tournament_id', tournamentId);
        if (filter) {
            // Simplistic filter application
            Object.entries(filter).forEach(([key, val])=>{
                query = query.eq(`data->>${key}`, val);
            });
        }
        const { error } = await query;
        throwIfError(error);
    },
    async createMatch (tournamentId, data) {
        const id = data.id || crypto.randomUUID?.() || `m_${Date.now()}`;
        const { id: _id, ...rest } = data;
        const synced = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchOrderMeta$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["syncMatchOrderFields"])({
            ...rest,
            id
        });
        const { id: _dropId, ...blob } = synced;
        const { error } = await supabase().from('tournament_matches').insert({
            id,
            tournament_id: tournamentId,
            data: blob,
            created_at: now(),
            updated_at: now()
        });
        throwIfError(error);
        return {
            id
        };
    },
    /** Inserción masiva de partidos (evita N round-trips en categorías grandes). */ async createMatchesBulk (tournamentId, matchesData) {
        if (!matchesData.length) return {
            inserted: 0
        };
        const rows = matchesData.map((data)=>{
            const id = data.id || crypto.randomUUID?.() || `m_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
            const { id: _id, ...rest } = data;
            const synced = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$matchOrderMeta$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["syncMatchOrderFields"])({
                ...rest,
                id
            });
            const { id: _dropId, ...blob } = synced;
            return {
                id,
                tournament_id: tournamentId,
                data: blob,
                created_at: now(),
                updated_at: now()
            };
        });
        const { error } = await supabase().from('tournament_matches').insert(rows);
        throwIfError(error);
        return {
            inserted: rows.length
        };
    },
    async assignPlayersToTournament (tournamentId, categoryKey, p1Name, p2Name, targetTeamIdHint) {
        const tournament = await this.getTournament(tournamentId);
        if (!tournament) throw new Error('Tournament not found');
        let targetTeamId = targetTeamIdHint != null && targetTeamIdHint !== '' ? String(targetTeamIdHint) : null;
        let categoryUpdated = false;
        let targetCategoryInfo = null;
        if (tournament.inscriptionCategories) {
            targetCategoryInfo = tournament.inscriptionCategories.find((c)=>c.key === categoryKey);
        }
        const normalize = (s)=>s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const isMatchingCategory = (cat)=>{
            // Check direct match
            if (cat.category === categoryKey || cat.id === categoryKey || `${cat.gender} - ${cat.category}` === categoryKey) return true;
            // Try to match inscription category name and gender
            if (targetCategoryInfo && targetCategoryInfo.name) {
                const normName = normalize(targetCategoryInfo.name);
                const normCat = normalize(cat.category);
                const hasCategoryName = normName.includes(normCat) || normCat.includes(normName);
                let hasGender = true;
                if (cat.gender) {
                    if (cat.gender === 'MALE' && !normName.includes('masc') && targetCategoryInfo.gender !== 'MALE') hasGender = false;
                    if (cat.gender === 'FEMALE' && !normName.includes('fem') && targetCategoryInfo.gender !== 'FEMALE') hasGender = false;
                    if (cat.gender === 'MIXED' && !normName.includes('mix') && targetCategoryInfo.gender !== 'MIXED') hasGender = false;
                }
                if (hasCategoryName && hasGender) return true;
            }
            return false;
        };
        const isP1Placeholder = (t)=>!t.p1?.name || t.p1.name.trim() === '' || t.p1.name.startsWith('TBD') || t.p1.name.startsWith('Jugador');
        const isP2PlaceholderOrMissing = (t)=>!t.p2?.name || t.p2.name.trim() === '' || t.p2.name.startsWith('TBD') || t.p2.name.startsWith('Jugador');
        // Emparejar por nombre: exacto o uno contiene al otro (ej. "Carla Di Matteo" en perfil vs "Carla" en torneo)
        const nameMatches = (storedName, assignedName)=>{
            const a = normalize((assignedName || '').trim());
            const b = normalize((storedName || '').trim());
            if (!a || !b) return false;
            return a === b || b.startsWith(a) || a.startsWith(b);
        };
        const p1NameMatches = (t)=>nameMatches(t.p1?.name ?? '', p1Name);
        const p2NameMatches = (t)=>nameMatches(t.p2?.name ?? '', p2Name ?? '');
        const updatedCategories = tournament.categories?.map((cat)=>{
            // Si tenemos enlace por código (tournament_team_id), actualizar ese equipo en la categoría si existe
            if (targetTeamId && cat.teams) {
                const linkedIdx = cat.teams.findIndex((t)=>String(t?.id) === String(targetTeamId));
                if (linkedIdx >= 0) {
                    const team = cat.teams[linkedIdx];
                    team.p1 = {
                        ...team.p1,
                        name: p1Name,
                        id: team.p1?.id || `p1_${Date.now()}`
                    };
                    if (p2Name) team.p2 = {
                        ...team.p2 || {},
                        name: p2Name,
                        id: team.p2?.id || `p2_${Date.now()}`
                    };
                    cat.teams[linkedIdx] = team;
                    categoryUpdated = true;
                    return cat;
                }
            }
            if (!categoryUpdated && isMatchingCategory(cat)) {
                // 1) Invitación aceptada: buscar equipo donde p1 = jugador A y p2 vacío
                let placeholderTeamIdx = -1;
                if (p2Name) {
                    placeholderTeamIdx = cat.teams?.findIndex((t)=>p1NameMatches(t) && isP2PlaceholderOrMissing(t)) ?? -1;
                    // Fallback: p1 en torneo puede ser el jugador B (ej. Carla Di Matteo); buscamos por p2Name
                    if (placeholderTeamIdx < 0) {
                        placeholderTeamIdx = cat.teams?.findIndex((t)=>p2NameMatches(t) && isP2PlaceholderOrMissing(t)) ?? -1;
                    }
                }
                // 2) Si no, primer equipo con p1 placeholder (flujo clásico)
                if (placeholderTeamIdx < 0) {
                    placeholderTeamIdx = cat.teams?.findIndex((t)=>isP1Placeholder(t)) ?? -1;
                }
                if (placeholderTeamIdx >= 0 && cat.teams) {
                    const team = cat.teams[placeholderTeamIdx];
                    targetTeamId = team.id;
                    team.p1 = {
                        ...team.p1,
                        name: p1Name,
                        id: team.p1?.id || `p1_${Date.now()}`
                    };
                    if (p2Name) {
                        team.p2 = {
                            ...team.p2 || {},
                            name: p2Name,
                            id: team.p2?.id || `p2_${Date.now()}`
                        };
                    }
                    cat.teams[placeholderTeamIdx] = team;
                    categoryUpdated = true;
                }
            }
            return cat;
        });
        // Si no encontramos en categorías pero tenemos p1+p2 (invitación aceptada), buscar en el array raíz
        let rootUpdateIndex = -1;
        if (!targetTeamId && tournament.teams && p2Name && (p1Name.trim() !== '' || p2Name.trim() !== '')) {
            let rootIdx = tournament.teams.findIndex((t)=>p1NameMatches(t) && isP2PlaceholderOrMissing(t));
            if (rootIdx < 0 && p2Name.trim() !== '') {
                rootIdx = tournament.teams.findIndex((t)=>p2NameMatches(t) && isP2PlaceholderOrMissing(t));
            }
            if (rootIdx < 0 && p2Name.trim() !== '') {
                rootIdx = tournament.teams.findIndex((t)=>isP2PlaceholderOrMissing(t));
            }
            if (rootIdx >= 0) {
                const t = tournament.teams[rootIdx];
                targetTeamId = t?.id != null ? String(t.id) : null;
                rootUpdateIndex = rootIdx;
            }
        }
        const sameTeamId = (a, b)=>a != null && b != null && (String(a) === String(b) || a === b);
        // Sincronizamos el array raíz de teams (grilla de grupos)
        let updatedTeams = tournament.teams;
        if (tournament.teams && (targetTeamId || rootUpdateIndex >= 0)) {
            updatedTeams = tournament.teams.map((team, idx)=>{
                const isTarget = targetTeamId ? sameTeamId(team?.id, targetTeamId) : idx === rootUpdateIndex;
                if (!isTarget) return team;
                const next = {
                    ...team
                };
                next.p1 = {
                    ...team.p1 || {},
                    name: p1Name,
                    id: team.p1?.id || `p1_${Date.now()}`
                };
                if (p2Name) {
                    next.p2 = {
                        name: p2Name,
                        id: team.p2?.id || `p2_${Date.now()}`
                    };
                }
                return next;
            });
        }
        const hasUpdate = categoryUpdated || targetTeamId || rootUpdateIndex >= 0;
        if (hasUpdate && (targetTeamId || rootUpdateIndex >= 0)) {
            const payload = {
                ...tournament,
                ...categoryUpdated && updatedCategories ? {
                    categories: updatedCategories
                } : {},
                ...updatedTeams ? {
                    teams: updatedTeams
                } : {}
            };
            await this.updateTournament(tournamentId, payload);
            const teamIdForMatches = targetTeamId || (rootUpdateIndex >= 0 && updatedTeams?.[rootUpdateIndex]?.id != null ? String(updatedTeams[rootUpdateIndex].id) : null);
            // Actualizar también los partidos que referencian a este equipo
            const matches = await this.getMatches(tournamentId);
            for (const match of matches){
                if (!teamIdForMatches) continue;
                let matchUpdated = false;
                const updateData = {};
                if (sameTeamId(match?.team1?.id, teamIdForMatches)) {
                    updateData.team1 = {
                        ...match.team1,
                        p1: {
                            ...match.team1.p1,
                            name: p1Name
                        },
                        p2: p2Name ? {
                            ...match.team1.p2,
                            name: p2Name
                        } : match.team1.p2
                    };
                    updateData.team1Name = p2Name ? `${p1Name} / ${p2Name}` : p1Name;
                    matchUpdated = true;
                }
                if (sameTeamId(match?.team2?.id, teamIdForMatches)) {
                    updateData.team2 = {
                        ...match.team2,
                        p1: {
                            ...match.team2.p1,
                            name: p1Name
                        },
                        p2: p2Name ? {
                            ...match.team2.p2,
                            name: p2Name
                        } : match.team2.p2
                    };
                    updateData.team2Name = p2Name ? `${p1Name} / ${p2Name}` : p1Name;
                    matchUpdated = true;
                }
                if (matchUpdated) {
                    await this.updateMatch(tournamentId, match.id, updateData);
                }
            }
        }
        return targetTeamId;
    },
    /**
     * Asigna un equipo (confirmado) a un grupo de la fase de grupos.
     * Si el Grupo 1 está lleno (groupSize), asigna al Grupo 2, y así sucesivamente.
     * Si no hay groupAssignments, inicializa con Grupo A.
     * Idempotente: si el equipo ya está en algún grupo, no hace nada.
     */ async assignTeamToGroup (tournamentId, teamId) {
        const tournament = await this.getTournament(tournamentId);
        if (!tournament) throw new Error('Torneo no encontrado');
        const groupSize = Math.max(1, tournament.groupSize ?? 4);
        const assignments = {
            ...tournament.groupAssignments || {}
        };
        const teamIdStr = String(teamId);
        const groupNames = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const existingGroup = groupNames.find((g)=>(assignments[g] || []).includes(teamIdStr));
        if (existingGroup) return;
        let targetGroup = null;
        for (const g of groupNames){
            const list = assignments[g] || [];
            if (list.length < groupSize) {
                targetGroup = g;
                break;
            }
        }
        if (!targetGroup) {
            const numGroups = Object.keys(assignments).length;
            targetGroup = groupNames[numGroups] ?? `G${numGroups + 1}`;
        }
        if (!assignments[targetGroup]) assignments[targetGroup] = [];
        if (assignments[targetGroup].includes(teamIdStr)) return;
        assignments[targetGroup].push(teamIdStr);
        await this.updateTournament(tournamentId, {
            ...tournament,
            groupAssignments: assignments
        });
    },
    async migrateTournamentMatches (tournamentId, legacyMatches) {
        const db = supabase();
        for (const m of legacyMatches){
            const matchId = m.id || `migrated_${Math.random().toString(36).slice(2, 11)}`;
            const { id: _id, ...matchData } = m;
            await db.from('tournament_matches').upsert({
                id: matchId,
                tournament_id: tournamentId,
                data: {
                    ...matchData,
                    migrated: true
                },
                updated_at: now()
            }, {
                onConflict: 'tournament_id,id'
            });
        }
    },
    async addExpense (data, ownerId) {
        const sanitized = sanitizeObject(data);
        const { data: row, error } = await supabase().from('expenses').insert({
            owner_id: ownerId,
            data: sanitized,
            created_at: now(),
            updated_at: now()
        }).select('id').single();
        throwIfError(error);
        return {
            id: row?.id
        };
    },
    async getMyExpenses (ownerId) {
        const { data, error } = await supabase().from('expenses').select('*').eq('owner_id', ownerId).order('created_at', {
            ascending: false
        });
        throwIfError(error);
        return (data || []).map((r)=>({
                id: r.id,
                ownerId: r.owner_id,
                ...r.data || {},
                createdAt: r.created_at,
                updatedAt: r.updated_at
            }));
    },
    async listAllExpenses () {
        const { data, error } = await supabase().from('expenses').select('*').order('created_at', {
            ascending: false
        });
        throwIfError(error);
        return (data || []).map((r)=>({
                id: r.id,
                ownerId: r.owner_id,
                ...r.data || {},
                createdAt: r.created_at,
                updatedAt: r.updated_at
            }));
    },
    async addParticipant (data, ownerId) {
        const sanitized = sanitizeObject(data);
        if (typeof sanitized.email === 'string') {
            sanitized.email = sanitized.email.trim().toLowerCase();
        }
        let uniqueCode;
        try {
            const authHeaders = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAuthHeaders"])();
            if (authHeaders.Authorization) {
                const res = await fetch('/api/participants/allocate-player-code', {
                    method: 'POST',
                    headers: {
                        ...authHeaders,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ownerUid: ownerId,
                        email: sanitized.email || null
                    })
                });
                if (res.ok) {
                    const j = await res.json();
                    if (j.uniqueCode) uniqueCode = j.uniqueCode;
                } else if (res.status === 409) {
                    const j = await res.json().catch(()=>({}));
                    throw new Error(j.error || 'Este email ya está registrado con otro usuario de la plataforma.');
                }
            }
        } catch (e) {
            if (e instanceof Error && e.message.includes('registrado')) throw e;
        }
        if (!uniqueCode) {
            const prof = await this.getUserProfile(ownerId);
            const mine = await this.getMyParticipants(ownerId);
            const used = new Set();
            if (prof?.uniqueCode) used.add(String(prof.uniqueCode).toUpperCase());
            (mine || []).forEach((p)=>{
                if (p.uniqueCode) used.add(String(p.uniqueCode).toUpperCase());
            });
            for(let i = 0; i < 48; i++){
                const c = generateUniqueCode().toUpperCase();
                if (!used.has(c)) {
                    uniqueCode = c;
                    break;
                }
            }
            if (!uniqueCode) uniqueCode = generateUniqueCode().toUpperCase();
        }
        sanitized.uniqueCode = uniqueCode;
        const { data: row, error } = await supabase().from('participants').insert({
            owner_id: ownerId,
            data: sanitized,
            created_at: now(),
            updated_at: now()
        }).select('id').single();
        throwIfError(error);
        return {
            id: row?.id
        };
    },
    async getMyParticipants (ownerId) {
        const c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
        if (!c) return [];
        const { data, error } = await c.from('participants').select('*').eq('owner_id', ownerId).order('created_at', {
            ascending: false
        });
        throwIfError(error);
        return (data || []).map((r)=>({
                id: r.id,
                ownerId: r.owner_id,
                ...r.data || {},
                createdAt: r.created_at,
                updatedAt: r.updated_at
            }));
    },
    async getAllParticipants () {
        const { data, error } = await supabase().from('participants').select('*').order('created_at', {
            ascending: false
        });
        throwIfError(error);
        return (data || []).map((r)=>({
                id: r.id,
                ownerId: r.owner_id,
                ...r.data || {},
                createdAt: r.created_at,
                updatedAt: r.updated_at
            }));
    },
    async searchParticipants (query, limit = 10) {
        const term = String(query || '').trim();
        if (term.length < 2) return [];
        const escaped = term.replace(/[%_]/g, '\\$&');
        const ilikePattern = `%${escaped}%`;
        const { data, error } = await supabase().from('participants').select('*').or(`data->>name.ilike.${ilikePattern},data->>lastName.ilike.${ilikePattern},data->>email.ilike.${ilikePattern}`).order('created_at', {
            ascending: false
        }).limit(Math.max(1, Math.min(25, limit)));
        throwIfError(error);
        return (data || []).map((r)=>({
                id: r.id,
                ownerId: r.owner_id,
                ...r.data || {},
                createdAt: r.created_at,
                updatedAt: r.updated_at
            }));
    },
    async updateParticipant (id, data) {
        const { id: _id, ...rest } = data;
        const { data: row } = await supabase().from('participants').select('data, owner_id').eq('id', id).single();
        const merged = {
            ...row?.data || {},
            ...sanitizeObject(rest)
        };
        if (typeof merged.email === 'string') {
            merged.email = merged.email.trim().toLowerCase();
        }
        try {
            const authHeaders = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAuthHeaders"])();
            if (authHeaders.Authorization && row?.owner_id) {
                const res = await fetch('/api/participants/allocate-player-code', {
                    method: 'POST',
                    headers: {
                        ...authHeaders,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ownerUid: row.owner_id,
                        email: merged.email || null
                    })
                });
                if (res.ok) {
                    const j = await res.json();
                    if (j.uniqueCode) merged.uniqueCode = j.uniqueCode;
                } else if (res.status === 409) {
                    const j = await res.json().catch(()=>({}));
                    throw new Error(j.error || 'Este email ya está registrado con otro usuario de la plataforma.');
                }
            }
        } catch (e) {
            if (e instanceof Error && e.message.includes('registrado')) throw e;
        }
        const prevCode = row?.data?.uniqueCode;
        if (!merged.uniqueCode && prevCode) {
            merged.uniqueCode = String(prevCode).toUpperCase();
        }
        const { error } = await supabase().from('participants').update({
            data: merged,
            updated_at: now()
        }).eq('id', id);
        throwIfError(error);
    },
    async getParticipant (id) {
        const { data, error } = await supabase().from('participants').select('*').eq('id', id).single();
        if (error || !data) return null;
        return {
            id: data.id,
            ...data.data,
            ownerId: data.owner_id,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    },
    async checkParticipantExistence (field, value, excludeId) {
        const { data, error } = await supabase().from('participants').select('id').eq(`data->>${field}`, value);
        throwIfError(error);
        if (!data || data.length === 0) return false;
        if (excludeId) {
            return data.some((p)=>p.id !== excludeId);
        }
        return data.length > 0;
    },
    async getPlayerStats (playerId) {
        // This is a complex calculation that fetches all matches for a player
        // and computes the requested metrics: played, won, lost, streak, effectiveness.
        try {
            // Get all matches from tournament_matches
            // In a real scenario, we might want to filter this by participant_id if we have a junction table
            // but since matches are stored in JSON 'data' field, we fetch all for now or filter if possible.
            const { data: matches, error } = await supabase().from('tournament_matches').select('*');
            throwIfError(error);
            let played = 0;
            let won = 0;
            let lost = 0;
            let streak = 0;
            let effectiveness = 0;
            const results = []; // true for win, false for loss
            (matches || []).forEach((m)=>{
                const matchData = m.data || {};
                const isTeam1 = matchData.team1?.player1?.id === playerId || matchData.team1?.player2?.id === playerId;
                const isTeam2 = matchData.team2?.player1?.id === playerId || matchData.team2?.player2?.id === playerId;
                const isSingle1 = matchData.player1?.id === playerId;
                const isSingle2 = matchData.player2?.id === playerId;
                if (isTeam1 || isTeam2 || isSingle1 || isSingle2) {
                    played++;
                    const winner = matchData.winner; // 1 or 2
                    const playerWon = winner === 1 && (isTeam1 || isSingle1) || winner === 2 && (isTeam2 || isSingle2);
                    if (playerWon) won++;
                    else lost++;
                    // Store results for streak (assuming matches come in chron order, but let's assume for now)
                    results.push(playerWon);
                }
            });
            // Calculate current streak
            if (results.length > 0) {
                const lastResult = results[results.length - 1];
                let count = 0;
                for(let i = results.length - 1; i >= 0; i--){
                    if (results[i] === lastResult) count++;
                    else break;
                }
                streak = count;
                effectiveness = Math.round(won / played * 100);
            }
            const points = played > 0 ? won * 3 + Math.floor(played * 0.5) : 0;
            return {
                played,
                won,
                lost,
                streak: `${streak}${results[results.length - 1] ? 'W' : 'L'}`,
                effectiveness: `${effectiveness}%`,
                ranking: '0',
                points
            };
        } catch (e) {
            console.error('Error calculating player stats:', e);
            return null;
        }
    },
    async deleteParticipant (id) {
        const authHeaders = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAuthHeaders"])();
        if (authHeaders.Authorization) {
            const res = await fetch(`/api/participants?id=${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: authHeaders
            });
            if (res.ok) return;
            if (res.status === 401 || res.status === 403) {
            // No es admin: intentar borrado como propietario (RLS) más abajo.
            } else if (res.status === 501) {
                const body = await res.json().catch(()=>({}));
                const msg = body.error || 'En el servidor falta SUPABASE_SERVICE_ROLE_KEY; el admin no puede borrar fichas de otros usuarios.';
                throw new Error(msg);
            } else {
                const body = await res.json().catch(()=>({}));
                const msg = body.error || `Error al eliminar (${res.status})`;
                throw new Error(msg);
            }
        }
        const { error } = await supabase().from('participants').delete().eq('id', id);
        throwIfError(error);
    },
    async addGroup (data, ownerId) {
        const { data: row, error } = await supabase().from('groups').insert({
            owner_id: ownerId,
            data,
            created_at: now(),
            updated_at: now()
        }).select('id').single();
        throwIfError(error);
        return {
            id: row?.id
        };
    },
    async getMyGroups (ownerId) {
        const { data, error } = await supabase().from('groups').select('*').eq('owner_id', ownerId).order('created_at', {
            ascending: false
        });
        throwIfError(error);
        return (data || []).map((r)=>({
                id: r.id,
                ownerId: r.owner_id,
                ...r.data || {},
                createdAt: r.created_at,
                updatedAt: r.updated_at
            }));
    },
    async deleteGroup (id) {
        const { error } = await supabase().from('groups').delete().eq('id', id);
        throwIfError(error);
    },
    async getUserProfile (uid) {
        const { data, error } = await supabase().from('profiles').select('*').eq('id', uid).single();
        if (error || !data) return null;
        return {
            role: data.role,
            name: data.name,
            email: data.email || null,
            markerCanchas: data.marker_canchas || [],
            uniqueCode: data.unique_code,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            acceptedTermsVersion: data.accepted_terms_version ?? null,
            signatureUrl: data.signature_url ?? null,
            biometricPhotoUrl: data.biometric_photo_url ?? null,
            statusLegal: data.status_legal ?? null,
            legalVersion: data.legal_version ?? null,
            legalTimestamp: data.legal_timestamp ?? null
        };
    },
    /** Smart-Legal: actualiza versión aceptada y rutas de evidencia en `profiles`. */ async updateProfileLegalAcceptance (uid, payload) {
        const row = {
            accepted_terms_version: payload.acceptedTermsVersion,
            updated_at: now()
        };
        if (payload.signaturePath !== undefined) {
            row.signature_url = payload.signaturePath;
        }
        if (payload.biometricPhotoPath !== undefined) {
            row.biometric_photo_url = payload.biometricPhotoPath;
        }
        const { error } = await supabase().from('profiles').update(row).eq('id', uid);
        throwIfError(error);
    },
    async setUserProfile (uid, data) {
        const { role, name, email, markerCanchas } = data;
        const payload = {
            id: uid,
            role: role ?? 'player',
            name: name ?? '',
            marker_canchas: Array.isArray(markerCanchas) ? markerCanchas : [],
            updated_at: now()
        };
        // Solo incluimos email si existe en la tabla. 
        // Nota: Si el usuario no ha añadido la columna 'email' en Supabase, esto fallará.
        if (email !== undefined) {
            payload.email = email;
        }
        // Si no se provee unique_code, intentamos mantener el existente o generar uno nuevo
        if (!data.uniqueCode) {
            const existing = await this.getUserProfile(uid);
            if (!existing?.uniqueCode) {
                payload.unique_code = generateUniqueCode();
            }
        } else {
            payload.unique_code = data.uniqueCode;
        }
        const { error } = await supabase().from('profiles').upsert(payload, {
            onConflict: 'id'
        });
        if (error) {
            // Si el error es por columna inexistente, reintentamos sin email para no romper el sistema
            if (error.code === '42703') {
                console.warn('[dataService] La tabla profiles no tiene columna email o unique_code. Reintentando sin campos conflictivos.');
                const cleanPayload = {
                    ...payload
                };
                delete cleanPayload.email;
                delete cleanPayload.unique_code;
                const { error: retryError } = await supabase().from('profiles').upsert(cleanPayload, {
                    onConflict: 'id'
                });
                if (retryError) throw retryError;
            } else {
                throw error;
            }
        }
    },
    async listAllUsersProfile () {
        const { data, error } = await supabase().from('profiles').select('id, role, name, email, marker_canchas, created_at, updated_at');
        if (error) {
            // Si falla por la columna email, reintentamos sin ella
            if (error.code === '42703') {
                const { data: retryData, error: retryError } = await supabase().from('profiles').select('id, role, name, marker_canchas, created_at, updated_at');
                if (retryError) throw retryError;
                return (retryData || []).map((r)=>({
                        uid: r.id,
                        role: r.role,
                        name: r.name,
                        email: null,
                        markerCanchas: r.marker_canchas,
                        createdAt: r.created_at,
                        updatedAt: r.updated_at
                    }));
            }
            throw error;
        }
        return (data || []).map((r)=>({
                uid: r.id,
                role: r.role,
                name: r.name,
                email: r.email,
                markerCanchas: r.marker_canchas,
                createdAt: r.created_at,
                updatedAt: r.updated_at
            }));
    },
    async getUserByUniqueCode (code) {
        const cleanedCode = code.trim().toUpperCase().replace(/\s/g, '');
        if (!/^[A-Z0-9]{6}$/.test(cleanedCode)) return null;
        try {
            const authHeaders = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAuthHeaders"])();
            if (authHeaders.Authorization) {
                const res = await fetch(`/api/resolve-player-code?code=${encodeURIComponent(cleanedCode)}`, {
                    headers: authHeaders
                });
                if (res.ok) return await res.json();
                if (res.status === 404 || res.status === 400) return null;
            }
        } catch  {
        /* fallback abajo */ }
        const { data, error } = await supabase().from('profiles').select('id, name, email').eq('unique_code', cleanedCode).single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    },
    /** Obtiene nombre completo para mostrar: prioriza ficha del jugador (participants name+lastName) para que en grupos, grilla y pizarra aparezca "Nombre Apellido" de A y de B; si no hay ficha, usa profiles.name */ async getDisplayNameForUser (userId) {
        const db = supabase();
        const { data: participants } = await db.from('participants').select('data').eq('owner_id', userId).limit(1);
        const d = participants?.[0]?.data;
        if (d) {
            const full = [
                d.name,
                d.lastName
            ].filter(Boolean).join(' ').trim();
            if (full) return full;
        }
        const { data: profile } = await db.from('profiles').select('name').eq('id', userId).single();
        const fromProfile = (profile?.name || '').trim();
        return fromProfile || '';
    },
    async createTeamInvitation (tournamentId, category, playerAId, playerBId, tournamentTeamId) {
        if (playerAId === playerBId) throw new Error('No puedes invitarte a ti mismo.');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 2);
        const row = {
            tournament_id: tournamentId,
            category: category,
            player_a_id: playerAId,
            player_b_id: playerBId,
            status: 'pending',
            expires_at: expiresAt.toISOString(),
            created_at: now(),
            updated_at: now()
        };
        if (tournamentTeamId != null && tournamentTeamId !== '') {
            row.tournament_team_id = tournamentTeamId;
        }
        let { data, error } = await supabase().from('teams').insert(row).select().single();
        if (error) {
            const msg = String(error.message || '').toLowerCase();
            if (msg.includes('tournament_team_id') || msg.includes('column') && msg.includes('does not exist')) {
                delete row.tournament_team_id;
                const retry = await supabase().from('teams').insert(row).select().single();
                if (retry.error) {
                    if (retry.error.code === '23505') throw new Error('Ya existe una inscripción o invitación para esta pareja en esta categoría.');
                    throw retry.error;
                }
                data = retry.data;
            } else {
                if (error.code === '23505') throw new Error('Ya existe una inscripción o invitación para esta pareja en esta categoría.');
                throw error;
            }
        }
        // Enviar notificación al Jugador B
        try {
            await this.sendNotification({
                user_id: playerBId,
                sender_id: playerAId,
                team_id: data.id,
                type: 'tournament_invite',
                message: `¡Tienes un lugar reservado! Acepta antes de que expire el tiempo para asegurar tu participación en el torneo.`
            });
        } catch (nError) {
            console.error('[dataService] Error sending notification:', nError);
        }
        return data;
    },
    async sendNotification (notif) {
        const { error } = await supabase().from('notifications').insert({
            ...notif,
            is_read: false,
            created_at: now()
        });
        if (error) {
            // Log error but don't crash the main flow
            console.error('[dataService] Error inserting notification (check if table notifications exists):', error);
        }
    },
    async getOccupiedSlots (tournamentId, category) {
        const currentTime = new Date().toISOString();
        // Contamos equipos aceptados + los pendientes que no han expirado
        // Nota: Si la columna expires_at es nula, se asume que no expira (o se maneja según lógica)
        const { data, error } = await supabase().from('teams').select('id, status, expires_at').eq('tournament_id', tournamentId).eq('category', category);
        throwIfError(error);
        const occupied = (data || []).filter((t)=>{
            if (t.status === 'accepted') return true;
            if (t.status === 'pending') {
                if (!t.expires_at) return true; // Si no tiene fecha, lo contamos como pendiente eterno (si aplica)
                return new Date(t.expires_at) > new Date();
            }
            return false;
        });
        return occupied.length;
    },
    async getMyInvitations (userId) {
        const { data, error } = await supabase().from('teams').select(`
                *,
                player_a:profiles!player_a_id(name),
                tournaments(id, data)
            `).eq('player_b_id', userId).eq('status', 'pending');
        throwIfError(error);
        return (data || []).map((inv)=>({
                ...inv,
                tournament_name: inv.tournaments?.data?.name || 'Torneo Sin Nombre',
                inviter_name: inv.player_a?.name || 'Jugador'
            }));
    },
    async getAllRegistrationCounts () {
        const { data, error } = await supabase().from('teams').select('tournament_id, status, expires_at');
        throwIfError(error);
        const counts = {};
        const now = new Date();
        (data || []).forEach((t)=>{
            const isAccepted = t.status === 'accepted';
            const isPendingValid = t.status === 'pending' && (!t.expires_at || new Date(t.expires_at) > now);
            if (isAccepted || isPendingValid) {
                counts[t.tournament_id] = (counts[t.tournament_id] || 0) + 1;
            }
        });
        return counts;
    },
    async respondToInvitation (teamId, status) {
        if (status === 'rejected') {
            const { error } = await supabase().from('teams').delete().eq('id', teamId);
            throwIfError(error);
        } else {
            // Verificar si ha expirado antes de aceptar
            const { data: team, error: fetchError } = await supabase().from('teams').select('id, expires_at, status, tournament_id, category, player_a_id, player_b_id, tournament_team_id').eq('id', teamId).single();
            if (fetchError || !team) {
                throw new Error('La reserva ha expirado o no existe, pide a tu compañero que te invite de nuevo.');
            }
            if (team.status === 'pending' && team.expires_at && new Date(team.expires_at) < new Date()) {
                // Borrar automáticamente el equipo expirado
                await supabase().from('teams').delete().eq('id', teamId);
                throw new Error('La reserva ha expirado, pide a tu compañero que te invite de nuevo.');
            }
            const { error } = await supabase().from('teams').update({
                status: 'accepted',
                updated_at: now()
            }).eq('id', teamId);
            throwIfError(error);
            // Sincronizar nombres en el torneo (rellenar pareja completa en la categoría/grupo)
            try {
                if (team.tournament_id && team.category && team.player_a_id && team.player_b_id) {
                    const p1Name = await this.getDisplayNameForUser(team.player_a_id) || 'Jugador A';
                    const p2Name = await this.getDisplayNameForUser(team.player_b_id) || 'Jugador B';
                    const tournamentTeamIdHint = team.tournament_team_id != null && team.tournament_team_id !== '' ? String(team.tournament_team_id) : undefined;
                    const updatedTeamId = await this.assignPlayersToTournament(team.tournament_id, team.category, p1Name, p2Name, tournamentTeamIdHint ?? null);
                    if (updatedTeamId) {
                        try {
                            await this.assignTeamToGroup(team.tournament_id, updatedTeamId);
                        } catch (groupErr) {
                            console.error('[dataService] Error assigning team to group:', groupErr);
                        }
                    }
                    // Notificar al Jugador A que la invitación fue aceptada
                    try {
                        await this.sendNotification({
                            user_id: team.player_a_id,
                            sender_id: team.player_b_id,
                            team_id: team.id,
                            type: 'tournament_invite_accepted',
                            message: `Tu compañero ha aceptado la invitación en la categoría ${team.category}.`
                        });
                    } catch (nError) {
                        console.error('[dataService] Error sending acceptance notification:', nError);
                    }
                }
            } catch (syncErr) {
                console.error('[dataService] Error syncing accepted team into tournament groups:', syncErr);
            }
        }
    },
    async getSentInvitations (tournamentId, playerAId) {
        const { data, error } = await supabase().from('teams').select(`
                *,
                player_b:profiles!player_b_id(name)
            `).eq('tournament_id', tournamentId).eq('player_a_id', playerAId).eq('status', 'pending');
        throwIfError(error);
        return (data || []).map((inv)=>({
                ...inv,
                partner_name: inv.player_b?.name || 'Jugador'
            }));
    },
    /**
     * Sincroniza en el torneo todas las parejas que ya aceptaron la invitación (status = 'accepted').
     * Actualiza tournament.teams y categories para que la grilla de grupos muestre ambos jugadores.
     */ async syncAcceptedTeamsToTournament (tournamentId) {
        const { data: acceptedTeams, error } = await supabase().from('teams').select('id, tournament_id, category, player_a_id, player_b_id, tournament_team_id').eq('tournament_id', tournamentId).eq('status', 'accepted');
        throwIfError(error);
        if (!acceptedTeams?.length) return {
            synced: 0,
            errors: []
        };
        const errors = [];
        let synced = 0;
        for (const row of acceptedTeams){
            if (!row.category || !row.player_a_id || !row.player_b_id) {
                errors.push(`Equipo ${row.id}: faltan category o jugadores.`);
                continue;
            }
            const p1Name = await this.getDisplayNameForUser(row.player_a_id) || 'Jugador A';
            const p2Name = await this.getDisplayNameForUser(row.player_b_id) || 'Jugador B';
            const teamIdHint = row.tournament_team_id != null ? String(row.tournament_team_id) : undefined;
            try {
                const updatedTeamId = await this.assignPlayersToTournament(tournamentId, row.category, p1Name, p2Name, teamIdHint ?? null);
                if (updatedTeamId) {
                    try {
                        await this.assignTeamToGroup(tournamentId, updatedTeamId);
                    } catch (_) {}
                }
                synced++;
            } catch (err) {
                errors.push(`Equipo ${row.id} (${p1Name} / ${p2Name}): ${err?.message || String(err)}`);
            }
        }
        return {
            synced,
            errors
        };
    },
    async removePasswordsFromAllUsers () {
        return 0;
    },
    async createAd (data, ownerId) {
        const sanitized = sanitizeObject(data);
        const { data: row, error } = await supabase().from('ads').insert({
            owner_id: ownerId,
            data: sanitized,
            created_at: now(),
            updated_at: now()
        }).select('id').single();
        throwIfError(error);
        return {
            id: row?.id
        };
    },
    async getAds () {
        const { data, error } = await supabase().from('ads').select('*').order('created_at', {
            ascending: false
        });
        throwIfError(error);
        return (data || []).map((r)=>({
                id: r.id,
                ownerId: r.owner_id,
                ...r.data || {},
                createdAt: r.created_at,
                updatedAt: r.updated_at
            }));
    },
    async deleteAd (id) {
        const { error } = await supabase().from('ads').delete().eq('id', id);
        throwIfError(error);
    },
    async uploadFile (file, path, bucketName) {
        const preferred = bucketName || typeof process !== 'undefined' && ("TURBOPACK compile-time value", "patrocinantes")?.trim() || 'patrocinantes';
        const bucketsToTry = [
            preferred
        ];
        // If preferred is not 'inscripciones', try it too for receipts if relevant
        if (preferred !== 'inscripciones') bucketsToTry.push('inscripciones');
        // Final fallback to public
        if (!bucketsToTry.includes('public')) bucketsToTry.push('public');
        let lastError = null;
        for (const bucket of bucketsToTry){
            try {
                const { data, error } = await supabase().storage.from(bucket).upload(path, file, {
                    upsert: true
                });
                if (!error) {
                    const { data: urlData } = supabase().storage.from(bucket).getPublicUrl(data.path);
                    return urlData.publicUrl;
                }
                lastError = error;
            } catch (e) {
                lastError = e;
            }
        }
        const errMsg = lastError?.message || String(lastError);
        throw new Error(`[Storage] ${errMsg} (Tried buckets: ${bucketsToTry.join(', ')})`);
    },
    async getAdminSettings () {
        const c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
        if (!c) return null;
        // Preferimos `app_settings` (como pide el spec), pero mantenemos compatibilidad
        // con `admin_settings` (estructura actual en tu base de código).
        const fetchFrom = async (table)=>{
            const { data, error } = await c.from(table).select('*').eq('id', 1).maybeSingle();
            if (error || !data) return null;
            return {
                appTitle: data.app_title,
                clubName: data.club_name,
                clubRif: data.club_rif ?? data.rif ?? null,
                clubBank: data.club_bank ?? data.bank ?? null,
                clubPhone: data.club_phone ?? data.telefono ?? data.phone ?? null,
                timezone: data.timezone ?? 'America/Caracas',
                updatedAt: data.updated_at,
                termsVersion: data.terms_version ?? undefined,
                publicidadDossierDriveId: data.publicidad_dossier_drive_id ?? null
            };
        };
        try {
            const app = await fetchFrom('app_settings');
            if (app) return app;
        } catch  {
        // ignore y probamos fallback
        }
        try {
            const admin = await fetchFrom('admin_settings');
            if (admin) return admin;
        } catch (e) {
            console.warn('[dataService] Error al obtener settings:', e);
        }
        return null;
    },
    async setAdminSettings (data) {
        const c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
        if (!c) return;
        const payload = {
            updated_at: now()
        };
        if (data.appTitle !== undefined) payload.app_title = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(data.appTitle);
        if (data.clubName !== undefined) payload.club_name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(data.clubName);
        if (data.timezone !== undefined) payload.timezone = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(data.timezone);
        if (data.termsVersion !== undefined) payload.terms_version = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(data.termsVersion);
        if (data.publicidadDossierDriveId !== undefined) {
            const v = data.publicidadDossierDriveId;
            payload.publicidad_dossier_drive_id = v === null || v === '' ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(String(v).trim());
        }
        const { error } = await c.from('admin_settings').update(payload).eq('id', 1);
        if (error?.code === '42703' && data.publicidadDossierDriveId !== undefined) {
            const { publicidad_dossier_drive_id: _drop, ...rest } = payload;
            const { error: err2 } = await c.from('admin_settings').update(rest).eq('id', 1);
            throwIfError(err2);
            return;
        }
        throwIfError(error);
    },
    async addInscription (data, ownerId) {
        const { data: row, error } = await supabase().from('inscriptions').insert({
            owner_id: ownerId,
            tournament_id: data.tournamentId || null,
            tournament_name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(data.tournamentName),
            category_key: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(data.categoryKey),
            category_price: data.categoryPrice,
            participant_name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(data.participantName),
            participant_email: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(data.participantEmail),
            participant_id: data.participantId,
            amount_extracted: data.amountExtracted,
            receipt_url: data.receiptUrl,
            payment_status: data.paymentStatus ?? 'pending',
            alert_message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(data.alertMessage),
            data: sanitizeObject({
                paymentMethod: data.paymentMethod,
                paymentDate: data.paymentDate,
                paymentBank: data.paymentBank,
                paymentAmount: data.paymentAmount,
                paymentReference: data.paymentReference,
                partnerId: data.partnerId,
                partnerName: data.partnerName,
                legalSignaturePath: data.legalSignaturePath,
                legalBiometricPath: data.legalBiometricPath,
                acceptedTermsVersion: data.acceptedTermsVersion
            }),
            created_at: now(),
            updated_at: now()
        }).select('id').single();
        throwIfError(error);
        return {
            id: row?.id
        };
    },
    /**
     * Sincroniza automáticamente los equipos (teams) de un torneo a partir de una inscripción.
     * Reemplaza el siguiente slot libre (placeholder "Jugador X") con los nombres reales del jugador/pareja.
     * Devuelve el id del equipo del torneo actualizado para enlazarlo con la invitación (código del compañero).
     */ async syncTeamsFromInscription (tournamentId, participant, partner) {
        const tournament = await this.getTournament(tournamentId);
        if (!tournament) return null;
        const teams = Array.isArray(tournament.teams) ? [
            ...tournament.teams
        ] : [];
        if (teams.length === 0) return null;
        const isPlaceholderPlayer = (p)=>!!p && typeof p.name === 'string' && p.name.toLowerCase().startsWith('jugador ');
        // Buscar el primer equipo cuyo p1 siga siendo un placeholder
        let slotIndex = teams.findIndex((team)=>!team.p1 || isPlaceholderPlayer(team.p1));
        if (slotIndex === -1) {
            return null;
        }
        const fullName = `${participant.name} ${participant.lastName || ''}`.trim();
        const partnerFullName = partner ? `${partner.name} ${partner.lastName || ''}`.trim() : '';
        const team = teams[slotIndex] || {};
        const updatedTeamId = team.id ?? null;
        const updatedTeam = {
            ...team,
            p1: {
                id: participant.id,
                name: fullName || participant.name
            },
            p2: partner ? {
                id: partner.id,
                name: partnerFullName || partner.name
            } : team.p2
        };
        teams[slotIndex] = updatedTeam;
        await this.updateTournament(tournamentId, {
            ...tournament,
            teams,
            updatedAt: now()
        });
        return updatedTeamId != null ? String(updatedTeamId) : null;
    },
    /** Próximo partido del usuario (hoy o futuro): inscripciones por participant_id → partidos donde juega → filtro por fecha hoy. */ async getNextMatchForUser (userId) {
        const participants = await this.getMyParticipants(userId);
        const participantId = participants?.[0]?.id;
        if (!participantId) return null;
        const { data: inscr } = await supabase().from('inscriptions').select('tournament_id').eq('participant_id', participantId);
        const tournamentIds = [
            ...new Set((inscr || []).map((r)=>r.tournament_id).filter(Boolean))
        ];
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);
        let best = null;
        for (const tid of tournamentIds){
            const matches = await this.getMatches(tid);
            const tournament = await this.getTournament(tid);
            const tournamentName = tournament?.name ?? '';
            for (const m of matches){
                const d = m;
                const st = d.scheduledTime ? new Date(d.scheduledTime).getTime() : 0;
                if (st < todayStart.getTime() || st >= todayEnd.getTime()) continue;
                const ids = [
                    d.team1?.p1?.id,
                    d.team1?.p2?.id,
                    d.team2?.p1?.id,
                    d.team2?.p2?.id
                ].filter(Boolean);
                if (!ids.includes(participantId)) continue;
                if (!best || st < best.at) {
                    best = {
                        tournamentId: tid,
                        matchId: d.id ?? m.id,
                        scheduledTime: d.scheduledTime,
                        team1Name: d.team1Name ?? (d.team1?.p1?.name ? [
                            d.team1.p1.name,
                            d.team1.p2?.name
                        ].filter(Boolean).join(' / ') : 'TBD'),
                        team2Name: d.team2Name ?? (d.team2?.p1?.name ? [
                            d.team2.p1.name,
                            d.team2.p2?.name
                        ].filter(Boolean).join(' / ') : 'TBD'),
                        tournamentName,
                        at: st
                    };
                }
            }
        }
        return best ? {
            tournamentId: best.tournamentId,
            matchId: best.matchId,
            scheduledTime: best.scheduledTime,
            team1Name: best.team1Name,
            team2Name: best.team2Name,
            tournamentName: best.tournamentName
        } : null;
    },
    async getInscriptionsByTournament (tournamentId) {
        const { data, error } = await supabase().from('inscriptions').select('*').eq('tournament_id', tournamentId);
        throwIfError(error);
        return (data || []).map((r)=>({
                id: r.id,
                tournamentId: r.tournament_id,
                tournamentName: r.tournament_name,
                categoryKey: r.category_key,
                categoryPrice: r.category_price,
                participantName: r.participant_name,
                participantEmail: r.participant_email,
                participantId: r.participant_id,
                amountExtracted: r.amount_extracted,
                receiptUrl: r.receipt_url,
                paymentStatus: r.payment_status,
                alertMessage: r.alert_message,
                isPlaceholder: r.is_placeholder === true,
                groupName: r.group_name ?? null,
                data: r.data ?? {},
                createdAt: r.created_at,
                updatedAt: r.updated_at
            }));
    },
    async getAllInscriptions () {
        const { data, error } = await supabase().from('inscriptions').select('*').order('created_at', {
            ascending: false
        });
        throwIfError(error);
        return (data || []).map((r)=>({
                id: r.id,
                tournamentId: r.tournament_id,
                tournamentName: r.tournament_name,
                categoryKey: r.category_key,
                categoryPrice: r.category_price,
                participantName: r.participant_name,
                participantEmail: r.participant_email,
                participantId: r.participant_id,
                amountExtracted: r.amount_extracted,
                receiptUrl: r.receipt_url,
                paymentStatus: r.payment_status,
                alertMessage: r.alert_message,
                paymentData: r.data,
                createdAt: r.created_at,
                updatedAt: r.updated_at
            }));
    },
    async getInscriptionById (id) {
        if (!isValidInscriptionId(id)) return null;
        const { data, error } = await supabase().from('inscriptions').select('*').eq('id', id.trim()).maybeSingle();
        throwIfError(error);
        if (!data) return null;
        const r = data;
        return {
            id: r.id,
            tournamentId: r.tournament_id,
            tournamentName: r.tournament_name,
            categoryKey: r.category_key,
            participantName: r.participant_name,
            partnerName: r.data?.partnerName ?? null,
            partnerId: r.data?.partnerId ?? null,
            paymentStatus: r.payment_status,
            inscriptionStatus: r.inscription_status ?? 'NORMAL'
        };
    },
    /**
     * Invitado (partnerId en data) confirma una inscripción RESERVED.
     * Acepta la invitación en `teams` si existe fila pending asociada, luego marca CONFIRMED y devuelve la fila actualizada.
     */ async confirmReservedTeam (inscriptionId) {
        const cleanId = inscriptionId?.trim() ?? '';
        if (!isValidInscriptionId(cleanId)) {
            throw new Error('El enlace de confirmación no es válido.');
        }
        const db = supabase();
        const { data: { user } } = await db.auth.getUser();
        if (!user?.id) {
            throw new Error('Debes iniciar sesión para confirmar tu lugar.');
        }
        const { data: ins, error: fetchErr } = await db.from('inscriptions').select('*, tournament:tournaments(name), player1:participants!player1_id(name, email)').eq('id', cleanId).maybeSingle();
        if (fetchErr) throw fetchErr;
        if (!ins) {
            throw new Error('No encontramos esta inscripción.');
        }
        const row = ins;
        const status = String(row.inscription_status ?? 'NORMAL').toUpperCase();
        if (status !== 'RESERVED') {
            if (status === 'CONFIRMED') {
                throw new Error('Este lugar ya fue confirmado.');
            }
            throw new Error('Esta inscripción no está pendiente de tu confirmación.');
        }
        const dataObj = row.data ?? {};
        const partnerId = row.partner_id != null ? String(row.partner_id) : dataObj.partnerId != null ? String(dataObj.partnerId) : '';
        if (partnerId !== user.id) {
            throw new Error('Tu cuenta no coincide con el invitado de esta reserva.');
        }
        const tournamentId = row.tournament_id;
        const categoryKey = row.category_key;
        const ownerId = String(row.owner_id);
        if (tournamentId && categoryKey) {
            const { data: team } = await db.from('teams').select('id, status').eq('tournament_id', tournamentId).eq('category', categoryKey).eq('player_a_id', ownerId).eq('player_b_id', user.id).maybeSingle();
            if (team?.id && team.status === 'pending') {
                await this.respondToInvitation(String(team.id), 'accepted');
            }
        }
        const ts = now();
        let updated = null;
        // Intento principal (especificación solicitada): status + embed tournament/player1.
        const primary = await db.from('inscriptions').update({
            status: 'CONFIRMED',
            confirmed_at: ts,
            updated_at: ts
        }).eq('id', cleanId).select('*, tournament:tournaments(name), player1:participants!player1_id(name, email)').single();
        if (primary.error) {
            // Fallback para esquemas existentes del proyecto (inscription_status / participant_name / tournament_name).
            const fb = await db.from('inscriptions').update({
                inscription_status: 'CONFIRMED',
                confirmed_at: ts,
                updated_at: ts
            }).eq('id', cleanId).eq('inscription_status', 'RESERVED').select('*').single();
            if (fb.error) throw fb.error;
            updated = fb.data;
        } else {
            updated = primary.data;
        }
        if (!updated) {
            throw new Error('No se pudo actualizar la inscripción (quizá ya fue confirmada).');
        }
        const u = updated;
        const tournamentNameFromEmbed = u?.tournament?.name != null && String(u.tournament.name).trim() !== '' ? String(u.tournament.name).trim() : null;
        const player1Name = u?.player1?.name != null ? String(u.player1.name) : null;
        const player1EmailFromEmbed = u?.player1?.email != null ? String(u.player1.email).trim() : '';
        const guestNameFromData = (u?.data?.partnerName != null ? String(u.data.partnerName) : '').trim();
        const guestNameForEmail = guestNameFromData || 'Tu pareja';
        const tournamentForEmail = (u?.tournament_name != null ? String(u.tournament_name) : '').trim() || tournamentNameFromEmbed || 'tu torneo';
        // Aviso por email al anfitrión (player1) sin WhatsApp/costos extra.
        try {
            const ownerProfile = await this.getUserProfile(String(u.owner_id));
            const ownerEmail = player1EmailFromEmbed || (ownerProfile?.email || '').trim();
            if (ownerEmail) {
                fetch('/api/partner-confirmed-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        to: ownerEmail,
                        hostName: player1Name,
                        guestName: guestNameForEmail,
                        tournamentName: tournamentForEmail
                    })
                }).catch((err)=>console.warn('[dataService] partner-confirmed-email warning:', err));
            }
        } catch (mailErr) {
            console.warn('[dataService] partner-confirmed-email warning:', mailErr);
        }
        return {
            id: u.id,
            ownerId: String(u.owner_id),
            tournamentId: u.tournament_id ?? null,
            tournamentName: u.tournament_name ?? null,
            tournamentLiveName: tournamentNameFromEmbed,
            player1Name,
            player1Email: player1EmailFromEmbed || null,
            categoryKey: u.category_key ?? null,
            participantName: u.participant_name ?? null,
            inscriptionStatus: String(u.inscription_status ?? u.status ?? 'CONFIRMED'),
            paymentStatus: String(u.payment_status ?? ''),
            data: u.data ?? {},
            updatedAt: u.updated_at ?? ts,
            confirmedAt: u.confirmed_at ?? ts
        };
    },
    async getInscriptionsWithAlerts () {
        const { data, error } = await supabase().from('inscriptions').select('*').eq('payment_status', 'alert');
        throwIfError(error);
        return (data || []).map((r)=>({
                id: r.id,
                tournamentId: r.tournament_id,
                paymentStatus: r.payment_status,
                alertMessage: r.alert_message,
                ...r
            }));
    },
    async updateInscription (id, data) {
        const upd = {
            updated_at: now()
        };
        if (data.paymentStatus != null) upd.payment_status = data.paymentStatus;
        if (data.alertMessage !== undefined) upd.alert_message = data.alertMessage ?? null;
        if (data.receiptUrl != null) upd.receipt_url = data.receiptUrl;
        const { error } = await supabase().from('inscriptions').update(upd).eq('id', id);
        throwIfError(error);
    },
    /**
     * Vincula una pareja manual (desde admin) al placeholder de inscripción con el mismo label.
     * Usa participant_id para jugador 1 y data.partnerId para jugador 2.
     */ async replacePlaceholderInscriptionByLabel (tournamentId, placeholderLabel, player1, player2, categoryKey) {
        const db = supabase();
        let query = db.from('inscriptions').select('id, data').eq('tournament_id', tournamentId).eq('participant_name', placeholderLabel)// En algunos proyectos el flag `is_placeholder` no existe en la tabla.
        // Los placeholders se distinguen por tener `participant_id` = null.
        .is('participant_id', null).order('created_at', {
            ascending: true
        }).limit(1);
        if (categoryKey) query = query.eq('category_key', categoryKey);
        const { data: placeholder, error: searchError } = await query.maybeSingle();
        if (searchError) throw searchError;
        if (!placeholder) return null;
        const oldData = placeholder.data ?? {};
        const mergedData = sanitizeObject({
            ...oldData,
            partnerId: player2.id,
            partnerName: player2.fullName,
            player1_id: player1.id,
            player2_id: player2.id,
            player1_email: player1.email ?? null,
            player2_email: player2.email ?? null
        });
        const { error: updateError } = await db.from('inscriptions').update({
            participant_name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(`${player1.fullName} / ${player2.fullName}`),
            participant_email: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(player1.email ?? null),
            participant_id: player1.id,
            payment_status: 'paid',
            data: mergedData,
            updated_at: now()
        }).eq('id', placeholder.id);
        if (updateError) throw updateError;
        return placeholder.id;
    },
    subscribeToTournament (id, callback) {
        const db = supabase();
        // Initial fetch
        this.getTournament(id).then(callback);
        const channel = db.channel(`tournament_${id}`).on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'tournaments',
            filter: `id=eq.${id}`
        }, (payload)=>{
            const r = payload.new;
            if (!r) return;
            callback({
                id: r.id,
                ownerId: r.owner_id,
                ...r.data,
                createdAt: r.created_at,
                updatedAt: r.updated_at
            });
        }).subscribe();
        return ()=>{
            channel.unsubscribe();
        };
    },
    subscribeToMatches (tournamentId, callback) {
        const db = supabase();
        // Initial load
        this.getMatches(tournamentId).then(callback);
        const channel = db.channel(`matches_${tournamentId}`).on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'tournament_matches',
            filter: `tournament_id=eq.${tournamentId}`
        }, async ()=>{
            // On update, reload all matches for simplicity and to ensure order/enrichment
            const matches = await this.getMatches(tournamentId);
            callback(matches);
        }).subscribe();
        return ()=>{
            channel.unsubscribe();
        };
    },
    async getAnimations (type) {
        let query = supabase().from('match_animations').select('*').eq('is_active', true);
        if (type) query = query.eq('type', type);
        const { data, error } = await query;
        throwIfError(error);
        return data || [];
    },
    /** Sustituye RTDB: animaciones del marcador (botones en pizarra). Upsert en match_animations con type 'animaciones_marcador'. */ async setAnimacionMarcador (animId, data) {
        try {
            if (!data) {
                await supabase().from('match_animations').update({
                    is_active: false
                }).eq('id', animId);
                return;
            }
            await supabase().from('match_animations').upsert({
                id: animId,
                type: 'animaciones_marcador',
                name: data.nombre,
                url: data.url,
                is_active: true,
                updated_at: now()
            }, {
                onConflict: 'id'
            });
        } catch (e) {
            console.warn('[dataService] setAnimacionMarcador (tabla match_animations puede no existir o tener otro esquema):', e);
        }
    },
    async getSponsorsByTournament (tournamentId) {
        try {
            const { data, error } = await supabase().from('sponsor_carousel').select('*').eq('tournament_id', tournamentId).eq('is_active', true).order('display_order', {
                ascending: true
            });
            if (error) {
                if (error.code === 'PGRST116' || error.code === '42P01') return [];
                throw error;
            }
            return data || [];
        } catch (e) {
            console.warn('[dataService] Error al obtener sponsors (posiblemente la tabla no existe):', e);
            return [];
        }
    },
    async getLiveMatches () {
        try {
            const { data: tournaments, error: tError } = await supabase().from('tournaments').select('*');
            if (tError) throw tError;
            let allLiveMatches = [];
            for (const t of tournaments || []){
                const { data: matches, error: mError } = await supabase().from('tournament_matches').select('*').eq('tournament_id', t.id);
                if (mError) continue;
                const live = (matches || []).filter((m)=>{
                    const status = m.data?.status;
                    return status === 'WARM_UP' || status === 'IN_PROGRESS';
                }).map((m)=>{
                    const tournament = {
                        id: t.id,
                        ...t.data
                    };
                    const matchData = m.data || {};
                    const t1Idx = matchData.team1Index;
                    const t2Idx = matchData.team2Index;
                    const team1 = t1Idx > 0 ? tournament.teams?.[t1Idx - 1] : matchData.team1;
                    const team2 = t2Idx > 0 ? tournament.teams?.[t2Idx - 1] : matchData.team2;
                    return {
                        ...matchData,
                        id: m.id,
                        tournamentId: t.id,
                        tournamentName: tournament.name,
                        complexName: tournament.complexName || tournament.complex,
                        category: tournament.category,
                        t1Name: team1 ? team1.p1?.name ? `${team1.p1.name} / ${team1.p2.name}` : team1.name : 'TBD',
                        t2Name: team2 ? team2.p1?.name ? `${team2.p1.name} / ${team2.p2.name}` : team2.name : 'TBD',
                        primaryColor: tournament.broadcastingSettings?.primaryColor || '#ccff00',
                        bannerText: tournament.broadcastingSettings?.bannerText || 'SMART PADEL PRO TV'
                    };
                });
                allLiveMatches = [
                    ...allLiveMatches,
                    ...live
                ];
            }
            return allLiveMatches;
        } catch (e) {
            console.error('[dataService] getLiveMatches failed:', e);
            return [];
        }
    },
    subscribeToLiveMatches (callback) {
        const db = supabase();
        // Initial load
        this.getLiveMatches().then(callback);
        const channel = db.channel('live_matches_global').on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'tournament_matches'
        }, async ()=>{
            const matches = await this.getLiveMatches();
            callback(matches);
        })// Also listen to tournament changes (colors, names, etc)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'tournaments'
        }, async ()=>{
            const matches = await this.getLiveMatches();
            callback(matches);
        }).subscribe();
        return ()=>{
            channel.unsubscribe();
        };
    },
    async getPaymentMethods () {
        const { data, error } = await supabase().from('payment_methods').select('*');
        throwIfError(error);
        const rows = data || [];
        return rows.filter(isPaymentMethodRowActive).map((row, i)=>normalizePaymentMethodRow(row, i)).sort((a, b)=>a.name.localeCompare(b.name, 'es'));
    },
    // ─── Pizarra / Cancha (reemplazo RTDB) ─────────────────────────────────────
    async getPizarraCanchaState (canchaId) {
        try {
            const { data, error } = await supabase().from('pizarra_cancha_state').select('cancha_id, data, updated_at').eq('cancha_id', canchaId).single();
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (e) {
            console.warn('[dataService] getPizarraCanchaState (tabla puede no existir):', e);
            return null;
        }
    },
    async setPizarraCanchaState (canchaId, data) {
        const db = supabase();
        const { error } = await db.from('pizarra_cancha_state').upsert({
            cancha_id: canchaId,
            data,
            updated_at: now()
        }, {
            onConflict: 'cancha_id'
        });
        throwIfError(error);
    },
    /**
     * Pone `estado: finalizado` y limpia ids en todas las pistas donde aún figure este partido.
     * Evita hub/pantallas colgadas en EN VIVO si se finalizó desde el hub, control con court=0, o hubo desfase de pista.
     */ /** Clave `cancha_N` para `pizarra_cancha_state` (coherente con sala de marcador: pista ≥ 1). */ courtToPizarraCanchaId (match) {
        const raw = match?.court ?? (match?.courtIndex != null ? Number(match.courtIndex) + 1 : undefined);
        const n = Number(raw);
        const c = Number.isFinite(n) && n >= 1 ? n : 1;
        return `cancha_${c}`;
    },
    /**
     * RPC atómico: fusiona resultado en `tournament_matches.data` y libera la pista en `pizarra_cancha_state`.
     * Requiere migración `023_finalizar_partido_y_liberar_cancha.sql` y sesión autenticada (dueño del torneo o admin).
     */ async finalizarPartidoYLiberarCanchaRpc (params) {
        const { data, error } = await supabase().rpc('finalizar_partido_y_liberar_cancha', {
            p_match_id: params.matchId,
            p_tournament_id: params.tournamentId,
            p_cancha_id: params.canchaId,
            p_final_data: params.finalData
        });
        throwIfError(error);
        const out = data;
        if (!out?.ok) {
            throw new Error(out?.error || 'finalizar_partido_y_liberar_cancha');
        }
    },
    async clearPizarraCanchaForMatch (tournamentId, matchId, maxCourts = 16) {
        const normTid = (s)=>String(s || '').replace(/-/g, '').toLowerCase();
        const tidWant = normTid(String(tournamentId || ''));
        const mid = String(matchId || '').trim();
        if (!tidWant || !mid) return;
        for(let c = 1; c <= maxCourts; c++){
            const canchaId = `cancha_${c}`;
            let state;
            try {
                state = await this.getPizarraCanchaState(canchaId);
            } catch  {
                continue;
            }
            const data = state?.data || {};
            const pid = String(data?.partido_id || '').trim();
            const active = String(data?.active_match_id || '').trim();
            const hit = pid === mid || active === mid;
            if (!hit) continue;
            const tidRow = normTid(String(data?.torneo_id || ''));
            if (tidRow && tidRow !== tidWant) continue;
            try {
                await this.setPizarraCanchaState(canchaId, {
                    ...data,
                    estado: 'finalizado',
                    torneo_id: tournamentId,
                    partido_id: null,
                    active_match_id: null,
                    pizarra_refresh_nonce: (Number(data.pizarra_refresh_nonce) || 0) + 1
                });
            } catch (e) {
                console.warn('[dataService] clearPizarraCanchaForMatch', canchaId, e);
            }
        }
    },
    /**
     * Monitor admin: libera la cancha en emergencia (debe existir el RPC en Supabase).
     * Ajusta la clave si tu función SQL usa otro nombre de parámetro (p. ej. p_cancha_id).
     */ async rpcResetearCanchaEmergencia (canchaId) {
        const { error } = await supabase().rpc('resetear_cancha_emergencia', {
            cancha_id: canchaId
        });
        throwIfError(error);
    },
    subscribePizarraCanchaState (canchaId, callback) {
        const db = supabase();
        this.getPizarraCanchaState(canchaId).then(callback);
        const channel = db.channel(`pizarra_${canchaId}`).on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'pizarra_cancha_state',
            filter: `cancha_id=eq.${canchaId}`
        }, (payload)=>{
            const r = payload.new;
            callback(r ? {
                cancha_id: r.cancha_id,
                data: r.data || {}
            } : null);
        }).subscribe();
        return ()=>channel.unsubscribe();
    },
    async getPublicidadByCancha (canchaId) {
        const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
        if (!client) return [];
        try {
            const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$canchaPublicidadQuery$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectCanchaPublicidadPlaylist"])(client, canchaId);
            if (error) {
                console.warn('[dataService] getPublicidadByCancha error:', error.message);
                return [];
            }
            // Retornar los items con el media_content cargado (ya sea por media_content(*) o publicidad(*))
            return (data || []).map((item)=>({
                    ...item,
                    media_content: item.media_content || item.publicidad
                }));
        } catch (e) {
            console.warn('[dataService] getPublicidadByCancha exception:', e);
            return [];
        }
    },
    async listVenues () {
        const { data, error } = await supabase().from('venues').select('*').order('created_at', {
            ascending: false
        });
        throwIfError(error);
        return (data || []).map((v)=>({
                id: String(v.id),
                name: String(v.name ?? ''),
                slug: String(v.slug ?? ''),
                rif: v.rif ?? null,
                contact: v.contact ?? null,
                phone: v.phone ?? null,
                email: v.email ?? null,
                instagram: v.instagram ?? null,
                city: v.city ?? null,
                courtsCount: Number(v.courts_count ?? 0),
                logoUrl: v.logo_url ?? null,
                brandPrimary: v.brand_primary ?? null,
                brandSecondary: v.brand_secondary ?? null,
                isActive: v.is_active !== false,
                createdAt: v.created_at,
                updatedAt: v.updated_at
            }));
    },
    async isVenueSlugAvailable (slug, excludeId) {
        let q = supabase().from('venues').select('id').eq('slug', slug).limit(1);
        if (excludeId) q = q.neq('id', excludeId);
        const { data, error } = await q;
        throwIfError(error);
        return !data || data.length === 0;
    },
    async createVenue (payload) {
        const row = {
            name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.name),
            slug: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.slug),
            rif: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.rif),
            contact: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.contact),
            phone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.phone),
            email: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.email),
            instagram: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.instagram),
            city: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.city),
            courts_count: Number(payload.courtsCount || 0),
            logo_url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.logoUrl),
            brand_primary: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.brandPrimary),
            brand_secondary: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.brandSecondary),
            is_active: payload.isActive !== false,
            created_at: now(),
            updated_at: now()
        };
        const { data, error } = await supabase().from('venues').insert(row).select('*').single();
        throwIfError(error);
        return data;
    },
    async updateVenue (id, payload) {
        const row = {
            updated_at: now()
        };
        if (payload.name !== undefined) row.name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.name);
        if (payload.slug !== undefined) row.slug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.slug);
        if (payload.rif !== undefined) row.rif = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.rif);
        if (payload.contact !== undefined) row.contact = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.contact);
        if (payload.phone !== undefined) row.phone = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.phone);
        if (payload.email !== undefined) row.email = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.email);
        if (payload.instagram !== undefined) row.instagram = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.instagram);
        if (payload.city !== undefined) row.city = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.city);
        if (payload.courtsCount !== undefined) row.courts_count = Number(payload.courtsCount || 0);
        if (payload.logoUrl !== undefined) row.logo_url = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.logoUrl);
        if (payload.brandPrimary !== undefined) row.brand_primary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.brandPrimary);
        if (payload.brandSecondary !== undefined) row.brand_secondary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(payload.brandSecondary);
        if (payload.isActive !== undefined) row.is_active = payload.isActive === true;
        const { error } = await supabase().from('venues').update(row).eq('id', id);
        throwIfError(error);
    },
    async deleteVenue (id) {
        const { error } = await supabase().from('venues').delete().eq('id', id);
        throwIfError(error);
    }
};
const confirmReservedTeam = async (inscriptionId)=>{
    const db = supabase();
    const cleanId = (inscriptionId || '').trim();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(cleanId)) {
        throw new Error('El enlace de invitación no tiene un formato válido.');
    }
    const { data: { user }, error: authError } = await db.auth.getUser();
    if (authError || !user) throw new Error('Debes iniciar sesión para confirmar tu lugar.');
    const { data: inscription, error: fetchErr } = await db.from('inscriptions').select('*, tournament:tournaments(name), player1:participants!player1_id(name, email)').eq('id', cleanId).single();
    if (fetchErr || !inscription) throw new Error('La invitación ya no está disponible.');
    const row = inscription;
    const partnerId = row.partner_id ?? row?.data?.partnerId ?? null;
    if (!partnerId || String(partnerId) !== user.id) {
        throw new Error('Esta invitación está dirigida a otro jugador.');
    }
    const currentStatus = String(row.inscription_status ?? row.status ?? '').toUpperCase();
    if (currentStatus === 'CONFIRMED') {
        return {
            alreadyConfirmed: true,
            ...row
        };
    }
    const ts = now();
    const updateData = {
        confirmed_at: ts,
        updated_at: ts
    };
    if (Object.prototype.hasOwnProperty.call(row, 'inscription_status')) {
        updateData.inscription_status = 'CONFIRMED';
    } else {
        updateData.status = 'CONFIRMED';
    }
    const { data: updated, error: updateErr } = await db.from('inscriptions').update(updateData).eq('id', cleanId).select().single();
    if (updateErr || !updated) {
        throw new Error('No se pudo procesar la confirmación. Intenta de nuevo.');
    }
    fetch('/api/partner-confirmed-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            to: row?.player1?.email,
            hostName: row?.player1?.name ?? null,
            guestName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Tu pareja',
            tournamentName: row?.tournament?.name ?? row.tournament_name ?? 'tu torneo'
        })
    }).catch((err)=>console.warn('Aviso al anfitrión falló (Email):', err));
    return updated;
};
}),
"[project]/src/lib/adminAccess.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/AuthContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authErrorMessages$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/authErrorMessages.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$adminAccess$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/adminAccess.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
function mapSupabaseUser(su) {
    if (!su) return null;
    const meta = su.user_metadata || {};
    return {
        uid: su.id,
        id: su.id,
        email: su.email || meta.email || null,
        displayName: meta.full_name || meta.name || su.email || null,
        photoURL: meta.avatar_url || meta.picture || null
    };
}
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    user: null,
    profile: null,
    loading: true,
    signInWithGoogle: async ()=>{},
    signInWithEmail: async ()=>{},
    signUpWithEmail: async ()=>{},
    forgotPassword: async ()=>{},
    enableDevMode: ()=>{},
    logout: async ()=>{},
    isAdmin: false,
    profileLoading: true,
    isPlayer: false,
    isMarker: false,
    markerCanchas: [],
    canMarkInCancha: ()=>false,
    refreshProfile: async ()=>{}
});
const AuthProvider = ({ children })=>{
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [profile, setProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [profileLoading, setProfileLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : true);
    const fetchProfile = async (uid, opts)=>{
        setProfileLoading(true);
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getUserProfile(uid);
            if (data) {
                // If profile exists but missing uniqueCode, generate and update it
                if (!data.uniqueCode) {
                    const code = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].setUserProfile(uid, {
                        ...data,
                        uniqueCode: undefined
                    });
                    // Re-fetch to get the new code properly updated in state
                    const updatedData = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getUserProfile(uid);
                    setProfile(updatedData);
                    return updatedData;
                }
                setProfile(data);
                return data;
            }
            const newProfile = {
                role: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ROLES"].PLAYER,
                email: opts?.email ?? '',
                name: opts?.name ?? 'Usuario',
                createdAt: new Date().toISOString()
            };
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].setUserProfile(uid, newProfile);
            setProfile(newProfile);
            return newProfile;
        } catch (error) {
            console.error('AuthContext: Error fetching user profile:', error);
            setProfile((prev)=>prev || {
                    role: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ROLES"].PLAYER,
                    name: 'Usuario (Offline)'
                });
        } finally{
            setProfileLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const el = document.getElementById('root-loading');
        if (el) el.style.setProperty('display', 'none');
        if (!supabase) {
            setLoading(false);
            return;
        }
        window.enableDevMode = enableDevMode;
        const safetyTimeout = setTimeout(()=>setLoading(false), 3000);
        let subscription = null;
        try {
            const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(async (event, session)=>{
                // Token inválido o expirado sin posibilidad de renovar → limpiar sesión silenciosamente
                if (event === 'TOKEN_REFRESHED' && !session) {
                    console.warn('[Auth] Sesión no renovada; cerrando sesión.');
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authErrorMessages$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearSupabaseBrowserStorage"])();
                    await supabase.auth.signOut();
                    setUser(null);
                    setProfile(null);
                    setLoading(false);
                    setProfileLoading(false);
                    return;
                }
                if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
                    setUser(null);
                    setProfile(null);
                    setLoading(false);
                    setProfileLoading(false);
                    return;
                }
                const appUser = session?.user ? mapSupabaseUser(session.user) : null;
                setUser(appUser);
                setLoading(false);
                clearTimeout(safetyTimeout);
                if (appUser) {
                    fetchProfile(appUser.uid, {
                        email: appUser.email ?? undefined,
                        name: appUser.displayName ?? undefined
                    }).catch((err)=>console.error('AuthContext: Profile fetch error', err));
                } else {
                    setProfile(null);
                    setProfileLoading(false);
                }
            });
            subscription = sub;
        } catch (e) {
            console.error('AuthContext: onAuthStateChange failed', e);
            setLoading(false);
        }
        supabase.auth.getSession().then(async ({ data: { session } })=>{
            const appUser = session?.user ? mapSupabaseUser(session.user) : null;
            setUser(appUser);
            setLoading(false); // Immediate resolution
            if (appUser) {
                fetchProfile(appUser.uid, {
                    email: appUser.email ?? undefined,
                    name: appUser.displayName ?? undefined
                }).catch(()=>setProfile({
                        role: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ROLES"].PLAYER,
                        name: 'Usuario'
                    }));
            }
            clearTimeout(safetyTimeout);
        }).catch((e)=>{
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authErrorMessages$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isInvalidRefreshTokenError"])(e)) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authErrorMessages$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearSupabaseBrowserStorage"])();
                void supabase.auth.signOut().catch(()=>{});
                setUser(null);
                setProfile(null);
                if ("TURBOPACK compile-time truthy", 1) {
                    console.warn('[Auth] Token de refresco inválido o ausente; sesión limpiada. Vuelve a iniciar sesión.');
                }
            } else {
                console.error('AuthContext: getSession failed', e);
            }
            setLoading(false);
            setProfileLoading(false);
            clearTimeout(safetyTimeout);
        });
        const onUnhandledRejection = (ev)=>{
            const r = ev.reason;
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authErrorMessages$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isInvalidRefreshTokenError"])(r)) return;
            ev.preventDefault();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authErrorMessages$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearSupabaseBrowserStorage"])();
            void supabase.auth.signOut().catch(()=>{});
            setUser(null);
            setProfile(null);
            setLoading(false);
            setProfileLoading(false);
            if ("TURBOPACK compile-time truthy", 1) {
                console.warn('[Auth] Error de token en segundo plano; sesión limpiada.');
            }
        };
        window.addEventListener('unhandledrejection', onUnhandledRejection);
        return ()=>{
            subscription?.unsubscribe();
            clearTimeout(safetyTimeout);
            window.removeEventListener('unhandledrejection', onUnhandledRejection);
        };
    }, [
        supabase
    ]);
    const enableDevMode = async ()=>{
        if (!supabase) {
            console.warn('AuthContext: enableDevMode ignorado (Supabase no configurado).');
            return;
        }
        const devEmail = ("TURBOPACK compile-time value", "admin@padelscore.pro")?.trim();
        const devPassword = ("TURBOPACK compile-time value", "padel2024")?.trim();
        if (devEmail && devPassword) {
            try {
                await supabase.auth.signInWithPassword({
                    email: devEmail,
                    password: devPassword
                });
                return;
            } catch (e) {
                console.warn('AuthContext: Simulación falló:', e);
            }
        }
    };
    const signInWithGoogle = async ()=>{
        if (!supabase) throw new Error('Supabase no está configurado. Revisa .env.local (NEXT_PUBLIC_SUPABASE_*).');
        const origin = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : '';
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : undefined
            }
        });
    };
    const signInWithEmail = async (email, pass)=>{
        if (!supabase) {
            const urlExists = !!("TURBOPACK compile-time value", "https://cecwrpmoitxhfynpqhkc.supabase.co");
            const keyExists = !!("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlY3dycG1vaXR4aGZ5bnBxaGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTg1NTcsImV4cCI6MjA4NzYzNDU1N30.AovaTFBtSCB-b6EDoP4YR8u8CdiWGYzbsYR7WXpHcGk");
            throw new Error(`Supabase no está configurado. URL:${urlExists} Key:${keyExists}. Revisa .env.local y reinicia el servidor de desarrollo.`);
        }
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: pass
        });
        if (error) throw error;
        if (data.user) await fetchProfile(data.user.id, {
            email: data.user.email ?? undefined,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name
        });
    };
    const signUpWithEmail = async (email, pass, name)=>{
        if (!supabase) {
            const urlExists = !!("TURBOPACK compile-time value", "https://cecwrpmoitxhfynpqhkc.supabase.co");
            const keyExists = !!("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlY3dycG1vaXR4aGZ5bnBxaGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTg1NTcsImV4cCI6MjA4NzYzNDU1N30.AovaTFBtSCB-b6EDoP4YR8u8CdiWGYzbsYR7WXpHcGk");
            throw new Error(`Supabase no está configurado. URL:${urlExists} Key:${keyExists}. Revisa .env.local y reinicia el servidor de desarrollo.`);
        }
        const { data, error } = await supabase.auth.signUp({
            email,
            password: pass,
            options: {
                data: {
                    full_name: name,
                    name
                }
            }
        });
        if (error) throw error;
        if (data.user) {
            const newProfile = {
                role: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ROLES"].PLAYER,
                email,
                name,
                createdAt: new Date().toISOString()
            };
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].setUserProfile(data.user.id, newProfile);
            setProfile(newProfile);
        }
    };
    const forgotPassword = async (email)=>{
        if (!supabase) throw new Error('Supabase no está configurado. Revisa .env.local (NEXT_PUBLIC_SUPABASE_*).');
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : ''}/login`
        });
        if (error) throw error;
    };
    const logout = async ()=>{
        if (supabase) {
            try {
                await supabase.auth.signOut();
            } catch (e) {
                console.error('AuthContext: Error during signOut:', e);
            }
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authErrorMessages$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearSupabaseBrowserStorage"])();
        setUser(null);
        setProfile(null);
    };
    const isAdmin = !!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$adminAccess$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isAdminAccess"])(profile?.role, user?.email ?? undefined);
    const isPlayer = !!(profile?.role === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ROLES"].PLAYER);
    const isMarker = !!(profile?.role === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ROLES"].MARKER);
    const markerCanchas = isMarker && Array.isArray(profile?.markerCanchas) ? profile.markerCanchas : [];
    // En este entorno, cualquier usuario autenticado (incluido tu usuario actual) puede ver/usar el marker en cualquier cancha.
    const canMarkInCancha = (canchaId)=>!!user || isAdmin || isMarker && markerCanchas.includes(canchaId);
    const refreshProfile = async ()=>{
        if (user?.uid) await fetchProfile(user.uid);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            profile,
            profileLoading,
            loading,
            signInWithGoogle,
            signInWithEmail,
            signUpWithEmail,
            forgotPassword,
            enableDevMode,
            logout,
            isAdmin,
            isPlayer,
            isMarker,
            markerCanchas,
            canMarkInCancha,
            refreshProfile
        },
        children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-[#0a0a0a] flex items-center justify-center text-2xl animate-pulse",
            style: {
                minHeight: '100dvh',
                background: '#0a0a0a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ccff00',
                fontWeight: 900
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: "Padel"
                }, void 0, false, {
                    fileName: "[project]/src/lib/AuthContext.tsx",
                    lineNumber: 337,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        color: '#fff',
                        marginLeft: 8
                    },
                    children: "Smart"
                }, void 0, false, {
                    fileName: "[project]/src/lib/AuthContext.tsx",
                    lineNumber: 338,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        marginLeft: 16,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: '#ccff00'
                    }
                }, void 0, false, {
                    fileName: "[project]/src/lib/AuthContext.tsx",
                    lineNumber: 339,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/lib/AuthContext.tsx",
            lineNumber: 325,
            columnNumber: 17
        }, ("TURBOPACK compile-time value", void 0)) : children
    }, void 0, false, {
        fileName: "[project]/src/lib/AuthContext.tsx",
        lineNumber: 304,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
const useAuth = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
}),
"[project]/src/lib/AppSettingsContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppSettingsProvider",
    ()=>AppSettingsProvider,
    "useAppSettings",
    ()=>useAppSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataService.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const DEFAULTS = {
    appTitle: 'Smart Padel',
    clubName: ''
};
const AppSettingsContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    ...DEFAULTS,
    timezone: '',
    loading: true,
    refresh: async ()=>{}
});
function AppSettingsProvider({ children }) {
    const [settings, setSettings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(DEFAULTS);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const load = async ()=>{
        const timeout = new Promise((_, reject)=>setTimeout(()=>reject(new Error('timeout')), 5000));
        try {
            const data = await Promise.race([
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].getAdminSettings(),
                timeout
            ]);
            setSettings({
                appTitle: data?.appTitle || DEFAULTS.appTitle,
                clubName: data?.clubName ?? DEFAULTS.clubName,
                clubRif: data?.clubRif ?? data?.club_rif ?? null,
                clubBank: data?.clubBank ?? data?.club_bank ?? null,
                clubPhone: data?.clubPhone ?? data?.club_phone ?? null,
                timezone: data?.timezone ?? ''
            });
        } catch  {
            setSettings(DEFAULTS);
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        load();
        const fallback = setTimeout(()=>setLoading(false), 6000);
        return ()=>clearTimeout(fallback);
    }, []);
    const value = {
        appTitle: settings.appTitle ?? DEFAULTS.appTitle,
        clubName: settings.clubName ?? DEFAULTS.clubName,
        clubRif: settings.clubRif ?? null,
        clubBank: settings.clubBank ?? null,
        clubPhone: settings.clubPhone ?? null,
        timezone: settings.timezone ?? '',
        loading,
        refresh: load
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AppSettingsContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/lib/AppSettingsContext.tsx",
        lineNumber: 67,
        columnNumber: 9
    }, this);
}
function useAppSettings() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AppSettingsContext);
    if (!ctx) throw new Error('useAppSettings must be used within AppSettingsProvider');
    return ctx;
}
}),
"[project]/src/app/RootErrorBoundary.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RootErrorBoundary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
class RootErrorBoundary extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Component {
    constructor(props){
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error
        };
    }
    componentDidCatch(error, info) {
        console.error('RootErrorBoundary:', error, info);
    }
    render() {
        if (this.state.hasError && this.state.error) {
            if (typeof document !== 'undefined') {
                const el = document.getElementById('root-loading');
                if (el) el.style.display = 'none';
            }
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    minHeight: '100vh',
                    background: '#0a0a0a',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24,
                    fontFamily: 'system-ui, sans-serif'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        style: {
                            fontSize: 20,
                            marginBottom: 12
                        },
                        children: "Algo falló al cargar la aplicación"
                    }, void 0, false, {
                        fileName: "[project]/src/app/RootErrorBoundary.tsx",
                        lineNumber: 42,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: 14,
                            color: '#888',
                            maxWidth: 400,
                            marginBottom: 16
                        },
                        children: this.state.error.message
                    }, void 0, false, {
                        fileName: "[project]/src/app/RootErrorBoundary.tsx",
                        lineNumber: 43,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: 12,
                            color: '#666'
                        },
                        children: "Si ya reiniciaste el servidor (npm run dev), intenta refrescar la página o limpia el caché del navegador."
                    }, void 0, false, {
                        fileName: "[project]/src/app/RootErrorBoundary.tsx",
                        lineNumber: 46,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>this.setState({
                                hasError: false,
                                error: null
                            }),
                        style: {
                            marginTop: 16,
                            padding: '10px 20px',
                            background: '#ccff00',
                            color: '#000',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 700,
                            cursor: 'pointer'
                        },
                        children: "Reintentar"
                    }, void 0, false, {
                        fileName: "[project]/src/app/RootErrorBoundary.tsx",
                        lineNumber: 50,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/RootErrorBoundary.tsx",
                lineNumber: 29,
                columnNumber: 17
            }, this);
        }
        return this.props.children;
    }
}
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

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
"[project]/src/components/InstallAppBanner.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InstallAppBanner",
    ()=>InstallAppBanner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smartphone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Smartphone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/smartphone.js [app-ssr] (ecmascript) <export default as Smartphone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
const STORAGE_KEY = 'padel-score-install-banner-dismissed';
const HIDE_DAYS = 7;
function isStandalone() {
    if ("TURBOPACK compile-time truthy", 1) return true;
    //TURBOPACK unreachable
    ;
    const nav = undefined;
}
function wasDismissed() {
    if ("TURBOPACK compile-time truthy", 1) return true;
    //TURBOPACK unreachable
    ;
}
function dismiss() {
    try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch  {}
}
function InstallAppBanner() {
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const shouldHideOnPath = !!pathname && (pathname.startsWith('/display') || pathname.includes('/display/') || pathname.startsWith('/marker') || pathname.startsWith('/p/') || pathname.includes('/score/'));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Ocultar totalmente en pizarras/marcadores y pantallas de emisión
        if (shouldHideOnPath) {
            setVisible(false);
            return;
        }
        if (isStandalone()) return;
        if (wasDismissed()) return;
        setVisible(true);
    }, [
        shouldHideOnPath
    ]);
    if (shouldHideOnPath) return null;
    const handleClose = ()=>{
        dismiss();
        setVisible(false);
    };
    if (!visible) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed bottom-0 left-0 right-0 z-[9999] flex items-center justify-between gap-3 px-4 py-3 bg-[#111] border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]",
        role: "banner",
        "aria-label": "Instalar como app",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-shrink-0 w-9 h-9 rounded-xl bg-[#ccff00]/15 flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smartphone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Smartphone$3e$__["Smartphone"], {
                            className: "w-4 h-4 text-[#ccff00]"
                        }, void 0, false, {
                            fileName: "[project]/src/components/InstallAppBanner.tsx",
                            lineNumber: 81,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/InstallAppBanner.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs sm:text-sm text-white/90 truncate",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold text-[#ccff00]",
                                children: "Abre como app:"
                            }, void 0, false, {
                                fileName: "[project]/src/components/InstallAppBanner.tsx",
                                lineNumber: 84,
                                columnNumber: 11
                            }, this),
                            ' ',
                            "Añade a pantalla de inicio para usar sin barra de direcciones."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/InstallAppBanner.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/InstallAppBanner.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: handleClose,
                className: "flex-shrink-0 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors",
                "aria-label": "Cerrar",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                    className: "w-5 h-5"
                }, void 0, false, {
                    fileName: "[project]/src/components/InstallAppBanner.tsx",
                    lineNumber: 94,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/InstallAppBanner.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/InstallAppBanner.tsx",
        lineNumber: 74,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/lib/legal/termsVersion.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Versión canónica publicada de términos (Smart-Legal). */ __turbopack_context__.s([
    "CURRENT_TERMS_VERSION",
    ()=>CURRENT_TERMS_VERSION,
    "isProfileTermsStale",
    ()=>isProfileTermsStale
]);
const CURRENT_TERMS_VERSION = 'v2.0-2026';
function toSortable(version) {
    const m = /^v(\d+)\.(\d+)-(\d+)$/.exec(version.trim());
    if (!m) return 0;
    return Number(m[1]) * 1_000_000_000 + Number(m[2]) * 1_000_000 + Number(m[3]);
}
function isProfileTermsStale(accepted) {
    const a = accepted ? toSortable(accepted) : 0;
    return a < toSortable(CURRENT_TERMS_VERSION);
}
}),
"[project]/src/components/PuntitoIA.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PuntitoIA",
    ()=>PuntitoIA
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-ssr] (ecmascript) <export default as Sparkles>");
'use client';
;
;
;
;
const LEGAL_COPY = {
    inscription: '¡Epa! Firma aquí para que tu comprobante sea validado y entres al sorteo.',
    pro_player: '¡Estás a un paso de ser PRO! Lee esto para que juguemos bajo las reglas.'
};
const BUCHANANS_PRO = {
    bodyGradient: [
        '#004D40',
        '#00695C'
    ],
    seam: '#B71C1C',
    ledEye: '#CCFF00',
    gold: '#c9a227',
    goldSoft: 'rgba(201, 162, 39, 0.55)'
};
function resolveBubbleText(message, type) {
    if (message?.trim()) return message.trim();
    if (type) return LEGAL_COPY[type];
    return 'Smart Padel';
}
function SunRays({ color }) {
    const rays = 8;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
        "aria-hidden": true,
        style: {
            color
        },
        children: Array.from({
            length: rays
        }).map((_, i)=>{
            const a = i / rays * Math.PI * 2;
            const x2 = 20 + Math.cos(a) * 14;
            const y2 = 12 + Math.sin(a) * 14;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: 20,
                y1: 12,
                x2: x2,
                y2: y2,
                stroke: "currentColor",
                strokeWidth: 1.2,
                strokeLinecap: "round",
                opacity: 0.45
            }, i, false, {
                fileName: "[project]/src/components/PuntitoIA.tsx",
                lineNumber: 50,
                columnNumber: 21
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/src/components/PuntitoIA.tsx",
        lineNumber: 44,
        columnNumber: 9
    }, this);
}
function IceFrame() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
        x: 1,
        y: 1,
        width: 38,
        height: 38,
        rx: 10,
        fill: "none",
        stroke: "#7dd3fc",
        strokeWidth: 1.25,
        opacity: 0.85,
        style: {
            filter: 'drop-shadow(0 0 3px rgba(125,211,252,0.5))'
        }
    }, void 0, false, {
        fileName: "[project]/src/components/PuntitoIA.tsx",
        lineNumber: 69,
        columnNumber: 9
    }, this);
}
/** Curvas tipo costura de pelota de pádel (líneas rojo mate en preset Pro). */ function PadelSeamLines({ stroke, opacity = 0.92 }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
        fill: "none",
        stroke: stroke,
        strokeWidth: 1.15,
        strokeLinecap: "round",
        opacity: opacity,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M 10 22 Q 20 16 30 22"
            }, void 0, false, {
                fileName: "[project]/src/components/PuntitoIA.tsx",
                lineNumber: 88,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M 10 24 Q 20 30 30 24"
            }, void 0, false, {
                fileName: "[project]/src/components/PuntitoIA.tsx",
                lineNumber: 89,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/PuntitoIA.tsx",
        lineNumber: 87,
        columnNumber: 9
    }, this);
}
function PuntitoSponsorAvatar({ config, idle, celebrate, thinking, xEyes, gradientId }) {
    const isPro = config.premiumPartner === 'buchanans_pro';
    const eye = isPro ? BUCHANANS_PRO.ledEye : config.eyeColor ?? '#CCFF00';
    const acc = new Set(config.specialAccessories ?? []);
    const bodyFill = isPro ? `url(#${gradientId})` : config.bodyColor;
    const runIdle = idle && !celebrate;
    const runThinking = thinking && !celebrate;
    const runXEyes = xEyes && !celebrate;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].svg, {
        viewBox: "0 0 40 40",
        className: "h-9 w-9 shrink-0 overflow-visible",
        "aria-hidden": true,
        animate: runIdle ? {
            y: [
                0,
                -2.2,
                0,
                -1.2,
                0
            ]
        } : {
            y: 0
        },
        transition: {
            duration: 4.2,
            repeat: runIdle ? Infinity : 0,
            ease: 'easeInOut'
        },
        children: [
            isPro && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                    id: gradientId,
                    x1: "0%",
                    y1: "0%",
                    x2: "100%",
                    y2: "100%",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                            offset: "0%",
                            stopColor: BUCHANANS_PRO.bodyGradient[0]
                        }, void 0, false, {
                            fileName: "[project]/src/components/PuntitoIA.tsx",
                            lineNumber: 128,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                            offset: "100%",
                            stopColor: BUCHANANS_PRO.bodyGradient[1]
                        }, void 0, false, {
                            fileName: "[project]/src/components/PuntitoIA.tsx",
                            lineNumber: 129,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/PuntitoIA.tsx",
                    lineNumber: 127,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/PuntitoIA.tsx",
                lineNumber: 126,
                columnNumber: 17
            }, this),
            acc.has('sun-rays') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SunRays, {
                color: eye
            }, void 0, false, {
                fileName: "[project]/src/components/PuntitoIA.tsx",
                lineNumber: 134,
                columnNumber: 37
            }, this),
            acc.has('ice-frame') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(IceFrame, {}, void 0, false, {
                fileName: "[project]/src/components/PuntitoIA.tsx",
                lineNumber: 135,
                columnNumber: 38
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: 6,
                y: 10,
                width: 28,
                height: 24,
                rx: 9,
                ry: 9,
                fill: bodyFill,
                stroke: isPro ? 'rgba(201,162,39,0.35)' : 'rgba(255,255,255,0.18)',
                strokeWidth: isPro ? 1.2 : 1
            }, void 0, false, {
                fileName: "[project]/src/components/PuntitoIA.tsx",
                lineNumber: 137,
                columnNumber: 13
            }, this),
            isPro && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PadelSeamLines, {
                stroke: BUCHANANS_PRO.seam
            }, void 0, false, {
                fileName: "[project]/src/components/PuntitoIA.tsx",
                lineNumber: 149,
                columnNumber: 23
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].g, {
                animate: runThinking ? {
                    x: [
                        0,
                        0.7,
                        0,
                        -0.4,
                        0
                    ]
                } : runIdle ? {
                    x: [
                        0,
                        1.5,
                        0,
                        -1.5,
                        0
                    ]
                } : {
                    x: 0
                },
                transition: {
                    duration: 5.6,
                    repeat: runIdle || runThinking ? Infinity : 0,
                    ease: 'easeInOut'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].g, {
                    style: {
                        transformOrigin: '20px 19px'
                    },
                    animate: runThinking ? {
                        scaleY: [
                            1,
                            0.78,
                            0.96,
                            0.78,
                            1
                        ],
                        x: [
                            0,
                            0.6,
                            0
                        ]
                    } : runIdle ? {
                        scaleY: [
                            1,
                            1,
                            0.1,
                            1,
                            1
                        ],
                        x: 0
                    } : {
                        scaleY: 1,
                        x: 0
                    },
                    transition: {
                        duration: runThinking ? 1.6 : 3.4,
                        repeat: runIdle || runThinking ? Infinity : 0,
                        ease: 'easeInOut',
                        times: runThinking ? undefined : [
                            0,
                            0.86,
                            0.9,
                            0.94,
                            1
                        ]
                    },
                    children: runXEyes ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].path, {
                                d: "M 12.2 18.2 L 17.8 23.8",
                                stroke: eye,
                                strokeWidth: 1.9,
                                strokeLinecap: "round",
                                animate: {
                                    opacity: [
                                        1,
                                        0.65,
                                        1
                                    ],
                                    rotate: [
                                        0,
                                        -10,
                                        0
                                    ]
                                },
                                transition: {
                                    duration: 0.8,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/PuntitoIA.tsx",
                                lineNumber: 179,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].path, {
                                d: "M 17.8 18.2 L 12.2 23.8",
                                stroke: eye,
                                strokeWidth: 1.9,
                                strokeLinecap: "round",
                                animate: {
                                    opacity: [
                                        1,
                                        0.65,
                                        1
                                    ],
                                    rotate: [
                                        0,
                                        10,
                                        0
                                    ]
                                },
                                transition: {
                                    duration: 0.8,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/PuntitoIA.tsx",
                                lineNumber: 187,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].path, {
                                d: "M 22.2 18.2 L 27.8 23.8",
                                stroke: eye,
                                strokeWidth: 1.9,
                                strokeLinecap: "round",
                                animate: {
                                    opacity: [
                                        1,
                                        0.65,
                                        1
                                    ],
                                    rotate: [
                                        0,
                                        10,
                                        0
                                    ]
                                },
                                transition: {
                                    duration: 0.8,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/PuntitoIA.tsx",
                                lineNumber: 195,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].path, {
                                d: "M 27.8 18.2 L 22.2 23.8",
                                stroke: eye,
                                strokeWidth: 1.9,
                                strokeLinecap: "round",
                                animate: {
                                    opacity: [
                                        1,
                                        0.65,
                                        1
                                    ],
                                    rotate: [
                                        0,
                                        -10,
                                        0
                                    ]
                                },
                                transition: {
                                    duration: 0.8,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/PuntitoIA.tsx",
                                lineNumber: 203,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                cx: 14,
                                cy: 19,
                                r: 3.2,
                                fill: eye,
                                style: {
                                    filter: 'drop-shadow(0 0 2px currentColor)'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/PuntitoIA.tsx",
                                lineNumber: 214,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                cx: 26,
                                cy: 19,
                                r: 3.2,
                                fill: eye,
                                style: {
                                    filter: 'drop-shadow(0 0 2px currentColor)'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/PuntitoIA.tsx",
                                lineNumber: 215,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                cx: 13.2,
                                cy: 18.2,
                                r: 0.9,
                                fill: "rgba(255,255,255,0.85)"
                            }, void 0, false, {
                                fileName: "[project]/src/components/PuntitoIA.tsx",
                                lineNumber: 216,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                cx: 25.2,
                                cy: 18.2,
                                r: 0.9,
                                fill: "rgba(255,255,255,0.85)"
                            }, void 0, false, {
                                fileName: "[project]/src/components/PuntitoIA.tsx",
                                lineNumber: 217,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true)
                }, void 0, false, {
                    fileName: "[project]/src/components/PuntitoIA.tsx",
                    lineNumber: 161,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/PuntitoIA.tsx",
                lineNumber: 151,
                columnNumber: 13
            }, this),
            !isPro && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("image", {
                href: config.logoUrl,
                x: 9,
                y: 24,
                width: 22,
                height: 11,
                preserveAspectRatio: "xMidYMid meet"
            }, void 0, false, {
                fileName: "[project]/src/components/PuntitoIA.tsx",
                lineNumber: 224,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M 14 29 Q 20 33 26 29",
                fill: "none",
                stroke: isPro ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.35)',
                strokeWidth: 1.2,
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/src/components/PuntitoIA.tsx",
                lineNumber: 234,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/PuntitoIA.tsx",
        lineNumber: 118,
        columnNumber: 9
    }, this);
}
/** Sello flotante (SVG/PNG) en esquina de la pantalla LED — ultraligero: una sola `<img>` o `<image>`. */ function WaxSealFloat({ href }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
        className: "pointer-events-none absolute -bottom-1 -left-1 z-20 h-11 w-11 sm:h-12 sm:w-12",
        initial: false,
        animate: {
            y: [
                0,
                -4,
                0,
                -2,
                0
            ],
            rotate: [
                0,
                -2,
                0,
                2,
                0
            ]
        },
        transition: {
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut'
        },
        style: {
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5)) drop-shadow(0 0 6px rgba(201,162,39,0.35))'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
            src: href,
            alt: "",
            className: "h-full w-full object-contain",
            loading: "lazy",
            decoding: "async"
        }, void 0, false, {
            fileName: "[project]/src/components/PuntitoIA.tsx",
            lineNumber: 259,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/PuntitoIA.tsx",
        lineNumber: 248,
        columnNumber: 9
    }, this);
}
function PuntitoIA({ type, celebrate = false, message, sponsorConfig, idle: idleProp, thinking = false, xEyes = false, className = '' }) {
    const uid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useId"])().replace(/:/g, '');
    const gradientId = `bp-body-${uid}`;
    const bubbleText = resolveBubbleText(message, type);
    const isPro = sponsorConfig?.premiumPartner === 'buchanans_pro';
    const accent = isPro ? BUCHANANS_PRO.ledEye : sponsorConfig?.eyeColor ?? '#CCFF00';
    const idle = idleProp !== false && !!sponsorConfig;
    const ledFrameStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!isPro) {
            return {
                borderColor: `${accent}66`,
                backgroundColor: 'rgba(0,0,0,0.82)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.45)'
            };
        }
        return {
            borderColor: BUCHANANS_PRO.gold,
            backgroundColor: 'rgba(0, 20, 18, 0.88)',
            boxShadow: `
              0 0 0 1px ${BUCHANANS_PRO.goldSoft},
              0 0 0 2px rgba(0, 77, 64, 0.5),
              0 0 24px rgba(0, 105, 92, 0.55),
              0 0 48px rgba(0, 77, 64, 0.35),
              inset 0 1px 0 rgba(201, 162, 39, 0.25),
              inset 0 -12px 28px rgba(0, 0, 0, 0.45)
            `.replace(/\s+/g, ' ').trim()
        };
    }, [
        isPro,
        accent
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `pointer-events-none absolute right-2 top-2 z-30 flex max-w-[min(220px,55vw)] flex-col items-end gap-1 sm:right-3 sm:top-3 ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: celebrate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        scale: 0.5
                    },
                    animate: {
                        opacity: 1,
                        scale: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    className: "mb-1 flex flex-wrap justify-end gap-0.5",
                    children: Array.from({
                        length: 10
                    }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
                            className: "h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]",
                            style: {
                                backgroundColor: accent,
                                color: accent
                            },
                            initial: {
                                opacity: 1,
                                y: 0,
                                x: 0
                            },
                            animate: {
                                opacity: 0,
                                y: -28 - Math.random() * 18,
                                x: (i - 5) * 10 + (Math.random() * 8 - 4)
                            },
                            transition: {
                                duration: 0.75,
                                ease: 'easeOut'
                            }
                        }, i, false, {
                            fileName: "[project]/src/components/PuntitoIA.tsx",
                            lineNumber: 332,
                            columnNumber: 29
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/components/PuntitoIA.tsx",
                    lineNumber: 325,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/PuntitoIA.tsx",
                lineNumber: 323,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                className: `relative flex items-center gap-2 rounded-2xl border-2 px-2.5 py-2 backdrop-blur-md ${isPro ? 'ring-1 ring-amber-500/30 pl-11 sm:pl-12' : ''}`,
                style: ledFrameStyle,
                animate: celebrate ? {
                    scale: [
                        1,
                        1.06,
                        1
                    ],
                    rotate: [
                        0,
                        -2,
                        2,
                        0
                    ]
                } : isPro && idle ? {
                    scale: [
                        1,
                        1.012,
                        1
                    ]
                } : {
                    scale: 1
                },
                transition: celebrate ? {
                    duration: 0.45
                } : isPro && idle ? {
                    duration: 3.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                } : {
                    duration: 0.2
                },
                children: [
                    isPro && sponsorConfig.logoUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(WaxSealFloat, {
                        href: sponsorConfig.logoUrl
                    }, void 0, false, {
                        fileName: "[project]/src/components/PuntitoIA.tsx",
                        lineNumber: 369,
                        columnNumber: 51
                    }, this) : null,
                    sponsorConfig ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        className: "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 bg-black/30",
                        style: {
                            borderColor: accent,
                            boxShadow: `0 0 0 0 ${accent}80`
                        },
                        animate: celebrate ? {
                            boxShadow: [
                                `0 0 0 0 ${accent}80`,
                                `0 0 0 12px ${accent}00`
                            ]
                        } : {
                            boxShadow: '0 0 0 0 transparent'
                        },
                        transition: {
                            duration: 0.6,
                            repeat: celebrate ? 2 : 0
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PuntitoSponsorAvatar, {
                            config: sponsorConfig,
                            idle: idle,
                            celebrate: celebrate,
                            thinking: thinking,
                            xEyes: xEyes,
                            gradientId: gradientId
                        }, void 0, false, {
                            fileName: "[project]/src/components/PuntitoIA.tsx",
                            lineNumber: 382,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/PuntitoIA.tsx",
                        lineNumber: 372,
                        columnNumber: 21
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        className: "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#ccff00] bg-[#ccff00]/15",
                        animate: celebrate ? {
                            boxShadow: [
                                '0 0 0 0 rgba(204,255,0,0.5)',
                                '0 0 0 12px rgba(204,255,0,0)'
                            ]
                        } : {},
                        transition: {
                            duration: 0.6,
                            repeat: celebrate ? 2 : 0
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                            className: "h-4 w-4 text-[#ccff00]",
                            strokeWidth: 2.2
                        }, void 0, false, {
                            fileName: "[project]/src/components/PuntitoIA.tsx",
                            lineNumber: 401,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/PuntitoIA.tsx",
                        lineNumber: 392,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "pointer-events-auto relative z-10 pl-1 text-left text-[10px] font-semibold leading-snug tracking-tight text-zinc-200 sm:text-[11px]",
                        children: bubbleText
                    }, void 0, false, {
                        fileName: "[project]/src/components/PuntitoIA.tsx",
                        lineNumber: 405,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/PuntitoIA.tsx",
                lineNumber: 349,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/PuntitoIA.tsx",
        lineNumber: 320,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/components/legal/PuntitoIA.tsx [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
/**
 * Re-export: el avatar vive en `@/components/PuntitoIA` (sponsorConfig + legal).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PuntitoIA$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/PuntitoIA.tsx [app-ssr] (ecmascript)");
;
}),
"[project]/src/components/legal/SignaturePadField.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SignaturePadField",
    ()=>SignaturePadField
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
function SignaturePadField({ padRef, onStrokeEnd }) {
    const [Sig, setSig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let alive = true;
        void __turbopack_context__.A("[project]/node_modules/react-signature-canvas/dist/index.mjs [app-ssr] (ecmascript, async loader)").then((m)=>{
            if (alive) setSig(()=>m.default);
        });
        return ()=>{
            alive = false;
        };
    }, []);
    if (!Sig) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex h-36 w-full items-center justify-center rounded-xl border-2 border-dashed border-[#ccff00]/30 bg-zinc-900/80 text-xs text-zinc-500",
            children: "Cargando lienzo de firma…"
        }, void 0, false, {
            fileName: "[project]/src/components/legal/SignaturePadField.tsx",
            lineNumber: 27,
            columnNumber: 13
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative w-full overflow-hidden rounded-xl border-2 border-[#ccff00]/70 bg-[#0a0a0a] shadow-[inset_0_0_0_1px_rgba(204,255,0,0.08)]",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Sig, {
            ref: padRef,
            clearOnResize: true,
            minWidth: 0.55,
            maxWidth: 2.85,
            minDistance: 2,
            throttle: 16,
            velocityFilterWeight: 0.85,
            penColor: "#fafafa",
            backgroundColor: "#0a0a0a",
            onEnd: ()=>{
                const empty = padRef.current?.isEmpty() ?? true;
                onStrokeEnd?.(empty);
            },
            canvasProps: {
                className: 'block h-36 w-full touch-none cursor-crosshair',
                style: {
                    touchAction: 'none'
                }
            }
        }, void 0, false, {
            fileName: "[project]/src/components/legal/SignaturePadField.tsx",
            lineNumber: 35,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/legal/SignaturePadField.tsx",
        lineNumber: 34,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/components/legal/BiometricCapture.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BiometricCapture",
    ()=>BiometricCapture
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/camera.js [app-ssr] (ecmascript) <export default as Camera>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
'use client';
;
;
;
;
function BiometricCapture({ userId, onCapturedPath, accentClassName = 'border-[#ccff00] text-[#ccff00]' }) {
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [streaming, setStreaming] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const videoRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const stopStream = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const v = videoRef.current;
        if (v?.srcObject) {
            v.srcObject.getTracks().forEach((t)=>t.stop());
            v.srcObject = null;
        }
        setStreaming(false);
    }, []);
    const openCamera = async ()=>{
        if (!userId) {
            alert('Debes iniciar sesión para la validación facial.');
            return;
        }
        setOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: {
                        ideal: 640
                    },
                    height: {
                        ideal: 480
                    }
                },
                audio: false
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setStreaming(true);
        } catch (e) {
            console.error(e);
            alert('No se pudo acceder a la cámara.');
            setOpen(false);
        }
    };
    const capture = async ()=>{
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || !userId) return;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        stopStream();
        await new Promise((resolve, reject)=>{
            canvas.toBlob(async (blob)=>{
                try {
                    if (!blob) {
                        onCapturedPath(null);
                        resolve();
                        return;
                    }
                    const { uploadToLegalVault } = await __turbopack_context__.A("[project]/src/lib/legal/uploadLegalVault.ts [app-ssr] (ecmascript, async loader)");
                    const path = await uploadToLegalVault(userId, 'face-validation.jpg', blob, 'image/jpeg');
                    onCapturedPath(path);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            }, 'image/jpeg', 0.88);
        }).catch((err)=>{
            console.error(err);
            const msg = err instanceof Error ? err.message : String(err);
            alert(`No se pudo guardar la captura. ${msg}`);
            onCapturedPath(null);
        });
        setOpen(false);
    };
    const close = ()=>{
        stopStream();
        setOpen(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>void openCamera(),
                disabled: !userId,
                className: `flex w-full items-center justify-center gap-2 rounded-xl border-2 bg-zinc-950 py-3 text-xs font-black uppercase tracking-wider transition hover:bg-zinc-900 disabled:opacity-40 ${accentClassName}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__["Camera"], {
                        className: "h-4 w-4"
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/BiometricCapture.tsx",
                        lineNumber: 107,
                        columnNumber: 17
                    }, this),
                    "Capturar validación facial"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/legal/BiometricCapture.tsx",
                lineNumber: 101,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                ref: canvasRef,
                className: "hidden"
            }, void 0, false, {
                fileName: "[project]/src/components/legal/BiometricCapture.tsx",
                lineNumber: 110,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "fixed inset-0 z-[200] flex items-center justify-center p-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                            type: "button",
                            "aria-label": "Cerrar",
                            initial: {
                                opacity: 0
                            },
                            animate: {
                                opacity: 1
                            },
                            exit: {
                                opacity: 0
                            },
                            className: "absolute inset-0 bg-black/90",
                            onClick: close
                        }, void 0, false, {
                            fileName: "[project]/src/components/legal/BiometricCapture.tsx",
                            lineNumber: 115,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                opacity: 0,
                                scale: 0.94
                            },
                            animate: {
                                opacity: 1,
                                scale: 1
                            },
                            exit: {
                                opacity: 0,
                                scale: 0.94
                            },
                            className: "relative z-[201] w-full max-w-md overflow-hidden rounded-3xl border-2 border-[#ccff00]/50 bg-[#0a0a0a] p-4 shadow-2xl",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-3 flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-black uppercase text-white",
                                            children: "Validación facial"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/legal/BiometricCapture.tsx",
                                            lineNumber: 131,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: close,
                                            className: "rounded-full bg-white/10 p-2 hover:bg-white/15",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                className: "h-4 w-4 text-zinc-300"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/legal/BiometricCapture.tsx",
                                                lineNumber: 133,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/legal/BiometricCapture.tsx",
                                            lineNumber: 132,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/legal/BiometricCapture.tsx",
                                    lineNumber: 130,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                                            ref: videoRef,
                                            className: "h-full w-full object-cover",
                                            playsInline: true,
                                            muted: true
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/legal/BiometricCapture.tsx",
                                            lineNumber: 137,
                                            columnNumber: 33
                                        }, this),
                                        !streaming && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute inset-0 flex items-center justify-center text-xs text-zinc-500",
                                            children: "Iniciando cámara…"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/legal/BiometricCapture.tsx",
                                            lineNumber: 138,
                                            columnNumber: 48
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/legal/BiometricCapture.tsx",
                                    lineNumber: 136,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    disabled: !streaming,
                                    onClick: ()=>void capture(),
                                    className: "mt-4 w-full rounded-2xl bg-[#ccff00] py-3 text-sm font-black uppercase text-black disabled:opacity-40",
                                    children: "Guardar captura"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/legal/BiometricCapture.tsx",
                                    lineNumber: 140,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/legal/BiometricCapture.tsx",
                            lineNumber: 124,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/legal/BiometricCapture.tsx",
                    lineNumber: 114,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/legal/BiometricCapture.tsx",
                lineNumber: 112,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/src/components/legal/LegalTermsBodies.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LegalTermsInscriptionBody",
    ()=>LegalTermsInscriptionBody,
    "LegalTermsProPlayerBody",
    ()=>LegalTermsProPlayerBody
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
'use client';
;
;
function LegalTermsInscriptionBody() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4 text-sm leading-relaxed text-zinc-400 [text-wrap:pretty]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: "Al inscribirte en un torneo aceptas los siguientes términos. Lee con atención la información sobre comprobantes de pago y el uso de tus datos personales."
            }, void 0, false, {
                fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                lineNumber: 9,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "mb-1 text-xs font-black uppercase tracking-wider text-[#ccff00]",
                        children: "1. Aceptación de los términos"
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                        lineNumber: 14,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "La inscripción en cualquier torneo o evento gestionado a través de esta plataforma implica la aceptación íntegra de estos Términos y Condiciones. Si no estás de acuerdo, abstente de inscribirte."
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                        lineNumber: 15,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                lineNumber: 13,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "mb-1 text-xs font-black uppercase tracking-wider text-[#ccff00]",
                        children: "2. Veracidad de los comprobantes de pago"
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                        lineNumber: 21,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Al adjuntar un comprobante declaras bajo tu responsabilidad que:"
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                        lineNumber: 22,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                        className: "mt-2 list-disc space-y-1 pl-5 marker:text-[#ccff00]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                children: "El comprobante es auténtico y corresponde a un pago real realizado por ti o en tu nombre."
                            }, void 0, false, {
                                fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                                lineNumber: 24,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                children: "El monto y la referencia corresponden a la inscripción en la categoría seleccionada."
                            }, void 0, false, {
                                fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                                lineNumber: 25,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                children: "No has alterado ni falsificado el documento presentado."
                            }, void 0, false, {
                                fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                                lineNumber: 26,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                        lineNumber: 23,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2",
                        children: "La organización podrá verificar los comprobantes. La presentación de comprobantes falsos o manipulados puede anular la inscripción y excluirte de futuros eventos."
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                        lineNumber: 28,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                lineNumber: 20,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "mb-1 text-xs font-black uppercase tracking-wider text-[#ccff00]",
                        children: "3. Datos personales y privacidad (Venezuela)"
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                        lineNumber: 34,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Los datos que proporciones serán tratados para gestionar tu participación, comunicarte información del evento y, cuando la normativa lo permita, fines estadísticos o promocionales del deporte. No vendemos tus datos a terceros."
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                        lineNumber: 35,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                lineNumber: 33,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "mb-1 text-xs font-black uppercase tracking-wider text-[#ccff00]",
                        children: "4. Reglas deportivas y conducta"
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                        lineNumber: 41,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Te comprometes a respetar el reglamento del torneo y la conducta deportiva."
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                        lineNumber: 42,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                lineNumber: 40,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "mb-1 text-xs font-black uppercase tracking-wider text-[#ccff00]",
                        children: "5. Modificaciones"
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                        lineNumber: 45,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "La versión vigente es la publicada en la app. Consulta antes de cada inscripción."
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                        lineNumber: 46,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                lineNumber: 44,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-zinc-500",
                children: [
                    "Más detalle:",
                    ' ',
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/terminos-inscripcion",
                        className: "font-bold text-[#ccff00] underline",
                        target: "_blank",
                        rel: "noreferrer",
                        children: "Términos completos"
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                        lineNumber: 50,
                        columnNumber: 17
                    }, this),
                    "."
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                lineNumber: 48,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
        lineNumber: 8,
        columnNumber: 9
    }, this);
}
function LegalTermsProPlayerBody() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4 text-sm leading-relaxed text-zinc-400 [text-wrap:pretty]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "mb-1 text-xs font-black uppercase tracking-wider text-[#ccff00]",
                        children: "1. Exoneración de responsabilidad"
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                        lineNumber: 64,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Declaras estar en condiciones físicas óptimas para la alta competencia. Liberas irrevocablemente a Smart Padel, sus organizadores y patrocinadores de toda responsabilidad por lesiones, accidentes o percances médicos durante la competencia o en las instalaciones."
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                        lineNumber: 65,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                lineNumber: 63,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "mb-1 text-xs font-black uppercase tracking-wider text-[#ccff00]",
                        children: "2. Uso de imagen y marca"
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                        lineNumber: 72,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Autorizas el uso de tu nombre e imagen (fotos/videos) en redes sociales, transmisiones en vivo (Broadcasting PRO) y material publicitario de Smart Padel con fines promocionales globales."
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                        lineNumber: 73,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                lineNumber: 71,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "mb-1 text-xs font-black uppercase tracking-wider text-[#ccff00]",
                        children: "3. Protección de datos"
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                        lineNumber: 79,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Tus datos personales y médicos se almacenan para tu seguridad y la gestión operativa de los torneos. Smart Padel garantiza confidencialidad y no compartirá tu información con terceros sin consentimiento explícito."
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                        lineNumber: 80,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                lineNumber: 78,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "mb-1 text-xs font-black uppercase tracking-wider text-[#ccff00]",
                        children: "4. Conducta deportiva"
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                        lineNumber: 86,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Te comprometes al fair play. Conductas antideportivas pueden resultar en la expulsión inmediata del sistema oficial de Smart Padel."
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                        lineNumber: 87,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
                lineNumber: 85,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/legal/LegalTermsBodies.tsx",
        lineNumber: 62,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/lib/legal/uploadLegalVault.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LEGAL_VAULT_BUCKET",
    ()=>LEGAL_VAULT_BUCKET,
    "getLegalVaultSignedUrl",
    ()=>getLegalVaultSignedUrl,
    "uploadToLegalVault",
    ()=>uploadToLegalVault
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/client.ts [app-ssr] (ecmascript)");
;
const LEGAL_VAULT_BUCKET = 'legal_vault';
async function uploadToLegalVault(userId, fileName, body, contentType) {
    const path = `${userId}/${Date.now()}-${fileName}`;
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])();
    const { error } = await supabase.storage.from(LEGAL_VAULT_BUCKET).upload(path, body, {
        contentType,
        upsert: false,
        cacheControl: '3600'
    });
    if (error) {
        const details = [
            error.message,
            error.code,
            error.statusCode,
            error.error
        ].filter(Boolean).join(' | ');
        const hint404 = String(error.message || '').toLowerCase().includes('bucket') && String(details).includes('404') ? ' En Supabase: ejecuta la migración supabase/migrations/050_legal_vault_bucket_ensure.sql (SQL Editor) o crea el bucket "legal_vault" privado y sus políticas RLS.' : '';
        throw new Error(`[legal_vault] ${details}${hint404}`);
    }
    return path;
}
async function getLegalVaultSignedUrl(path, expiresInSec = 3600) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])();
    const { data, error } = await supabase.storage.from(LEGAL_VAULT_BUCKET).createSignedUrl(path, expiresInSec);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
}
}),
"[project]/src/components/legal/LegalContainer.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LegalContainer",
    ()=>LegalContainer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$legal$2f$PuntitoIA$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/legal/PuntitoIA.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PuntitoIA$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/PuntitoIA.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$legal$2f$SignaturePadField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/legal/SignaturePadField.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$legal$2f$BiometricCapture$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/legal/BiometricCapture.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$legal$2f$LegalTermsBodies$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/legal/LegalTermsBodies.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$legal$2f$uploadLegalVault$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/legal/uploadLegalVault.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$legal$2f$termsVersion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/legal/termsVersion.ts [app-ssr] (ecmascript)");
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
function LegalContainer({ type, userId, onAccept, title, children, className = '' }) {
    const scrollRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [scrollPct, setScrollPct] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [scrollComplete, setScrollComplete] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const padRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [sigEmpty, setSigEmpty] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [celebrate, setCelebrate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [bioPath, setBioPath] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [submitting, setSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const recomputeScroll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const el = scrollRef.current;
        if (!el) return;
        const max = el.scrollHeight - el.clientHeight;
        if (max <= 1) {
            setScrollPct(100);
            setScrollComplete(true);
            return;
        }
        const pct = el.scrollTop / max * 100;
        setScrollPct(Math.min(100, Math.max(0, pct)));
        const thr = 3;
        setScrollComplete(el.scrollTop >= max - thr);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        recomputeScroll();
    }, [
        recomputeScroll,
        children,
        type
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const el = scrollRef.current;
        if (!el) return;
        const ro = new ResizeObserver(()=>recomputeScroll());
        ro.observe(el);
        return ()=>ro.disconnect();
    }, [
        recomputeScroll
    ]);
    const onScroll = ()=>recomputeScroll();
    const hasValidation = !sigEmpty || !!bioPath;
    const canSubmit = scrollComplete && hasValidation && !!userId;
    const defaultTitle = type === 'inscription' ? 'Términos de inscripción' : 'Contrato Pro Smart';
    const clearSignature = ()=>{
        padRef.current?.clear();
        setSigEmpty(true);
        setCelebrate(false);
    };
    const handleAccept = async ()=>{
        if (!canSubmit || !userId) return;
        setSubmitting(true);
        try {
            let signaturePath = null;
            if (padRef.current && !padRef.current.isEmpty()) {
                const canvas = padRef.current.getTrimmedCanvas();
                const blob = await new Promise((res)=>canvas.toBlob((b)=>res(b), 'image/png'));
                if (blob) {
                    signaturePath = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$legal$2f$uploadLegalVault$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["uploadToLegalVault"])(userId, 'signature.png', blob, 'image/png');
                }
            }
            await onAccept({
                signaturePath,
                biometricPath: bioPath,
                version: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$legal$2f$termsVersion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CURRENT_TERMS_VERSION"]
            });
        } catch (e) {
            console.error(e);
            const msg = e instanceof Error ? e.message : String(e);
            alert(`Error al guardar la firma. ${msg}`);
        } finally{
            setSubmitting(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `relative flex min-h-0 flex-col rounded-3xl border border-white/10 bg-[#0a0a0a] font-sans text-zinc-100 ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PuntitoIA$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PuntitoIA"], {
                type: type,
                celebrate: celebrate
            }, void 0, false, {
                fileName: "[project]/src/components/legal/LegalContainer.tsx",
                lineNumber: 109,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-b border-white/10 px-5 pb-3 pt-5 pr-[min(240px,40%)]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-black uppercase italic tracking-tight text-white",
                        children: title ?? defaultTitle
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalContainer.tsx",
                        lineNumber: 112,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500",
                        children: [
                            "Versión ",
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$legal$2f$termsVersion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CURRENT_TERMS_VERSION"]
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/legal/LegalContainer.tsx",
                        lineNumber: 113,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/legal/LegalContainer.tsx",
                lineNumber: 111,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: scrollRef,
                onScroll: onScroll,
                className: "legal-scroll-area min-h-[180px] max-h-[min(42vh,320px)] flex-1 overflow-y-auto overflow-x-hidden px-5 py-4",
                children: children ?? (type === 'inscription' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$legal$2f$LegalTermsBodies$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LegalTermsInscriptionBody"], {}, void 0, false, {
                    fileName: "[project]/src/components/legal/LegalContainer.tsx",
                    lineNumber: 121,
                    columnNumber: 56
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$legal$2f$LegalTermsBodies$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LegalTermsProPlayerBody"], {}, void 0, false, {
                    fileName: "[project]/src/components/legal/LegalContainer.tsx",
                    lineNumber: 121,
                    columnNumber: 88
                }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/legal/LegalContainer.tsx",
                lineNumber: 116,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-1.5 border-t border-white/10 px-5 py-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Lectura del documento"
                            }, void 0, false, {
                                fileName: "[project]/src/components/legal/LegalContainer.tsx",
                                lineNumber: 126,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: scrollComplete ? 'text-[#ccff00]' : 'text-zinc-400',
                                children: [
                                    Math.round(scrollPct),
                                    "%"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/legal/LegalContainer.tsx",
                                lineNumber: 127,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/legal/LegalContainer.tsx",
                        lineNumber: 125,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-1.5 w-full overflow-hidden rounded-full bg-zinc-800",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                            className: "h-full rounded-full bg-[#ccff00]",
                            initial: false,
                            animate: {
                                width: `${scrollPct}%`
                            },
                            transition: {
                                type: 'spring',
                                stiffness: 300,
                                damping: 35
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/components/legal/LegalContainer.tsx",
                            lineNumber: 130,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalContainer.tsx",
                        lineNumber: 129,
                        columnNumber: 17
                    }, this),
                    !scrollComplete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[10px] text-amber-200/90",
                        children: "Desplázate hasta el final para habilitar la firma."
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalContainer.tsx",
                        lineNumber: 138,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/legal/LegalContainer.tsx",
                lineNumber: 124,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3 border-t border-white/10 px-5 py-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-2 flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-black uppercase tracking-widest text-[#ccff00]",
                                        children: "Firma digital"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/legal/LegalContainer.tsx",
                                        lineNumber: 145,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: clearSignature,
                                        className: "text-[10px] font-bold uppercase text-zinc-500 underline hover:text-white",
                                        children: "Limpiar"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/legal/LegalContainer.tsx",
                                        lineNumber: 146,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/legal/LegalContainer.tsx",
                                lineNumber: 144,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$legal$2f$SignaturePadField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SignaturePadField"], {
                                padRef: padRef,
                                onStrokeEnd: (empty)=>{
                                    setSigEmpty(empty);
                                    if (!empty) setCelebrate(true);
                                    else setCelebrate(false);
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/legal/LegalContainer.tsx",
                                lineNumber: 154,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/legal/LegalContainer.tsx",
                        lineNumber: 143,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500",
                                children: "Alternativa biométrica"
                            }, void 0, false, {
                                fileName: "[project]/src/components/legal/LegalContainer.tsx",
                                lineNumber: 165,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$legal$2f$BiometricCapture$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BiometricCapture"], {
                                userId: userId,
                                onCapturedPath: (p)=>{
                                    setBioPath(p);
                                    if (p) setCelebrate(true);
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/legal/LegalContainer.tsx",
                                lineNumber: 166,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/legal/LegalContainer.tsx",
                        lineNumber: 164,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        disabled: !canSubmit || submitting,
                        onClick: ()=>void handleAccept(),
                        className: "w-full rounded-2xl border-2 border-[#ccff00] bg-[#ccff00] py-3.5 text-sm font-black uppercase italic tracking-wide text-black shadow-[0_0_24px_rgba(204,255,0,0.25)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none",
                        children: submitting ? 'Guardando…' : 'Aceptar y firmar'
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalContainer.tsx",
                        lineNumber: 175,
                        columnNumber: 17
                    }, this),
                    !userId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-center text-[10px] text-amber-200",
                        children: "Inicia sesión para completar la firma."
                    }, void 0, false, {
                        fileName: "[project]/src/components/legal/LegalContainer.tsx",
                        lineNumber: 183,
                        columnNumber: 29
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/legal/LegalContainer.tsx",
                lineNumber: 142,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/legal/LegalContainer.tsx",
        lineNumber: 106,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/components/legal/TermsReacceptanceOverlay.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TermsReacceptanceOverlay",
    ()=>TermsReacceptanceOverlay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$legal$2f$LegalContainer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/legal/LegalContainer.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/AuthContext.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function TermsReacceptanceOverlay() {
    const { user, refreshProfile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const uid = user?.uid;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[500] flex items-center justify-center bg-[#0a0a0a] p-3 sm:p-6",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "smart-legal-title",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex max-h-[min(92dvh,880px)] w-full max-w-lg min-w-0 flex-col overflow-hidden rounded-[28px] border-2 border-[#ccff00]/40 shadow-[0_0_60px_rgba(204,255,0,0.12)]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    id: "smart-legal-title",
                    className: "sr-only",
                    children: "Actualización de términos y condiciones"
                }, void 0, false, {
                    fileName: "[project]/src/components/legal/TermsReacceptanceOverlay.tsx",
                    lineNumber: 19,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$legal$2f$LegalContainer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LegalContainer"], {
                    type: "inscription",
                    userId: uid,
                    className: "max-h-[min(92dvh,880px)] rounded-[26px] border-0",
                    onAccept: async (p)=>{
                        if (!uid) return;
                        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dataService"].updateProfileLegalAcceptance(uid, {
                            acceptedTermsVersion: p.version,
                            signaturePath: p.signaturePath,
                            biometricPhotoPath: p.biometricPath
                        });
                        await refreshProfile();
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/legal/TermsReacceptanceOverlay.tsx",
                    lineNumber: 22,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/legal/TermsReacceptanceOverlay.tsx",
            lineNumber: 18,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/legal/TermsReacceptanceOverlay.tsx",
        lineNumber: 12,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/components/TermsReacceptanceGate.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TermsReacceptanceGate",
    ()=>TermsReacceptanceGate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$legal$2f$termsVersion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/legal/termsVersion.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$legal$2f$TermsReacceptanceOverlay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/legal/TermsReacceptanceOverlay.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
const PUBLIC_PATH_PREFIXES = [
    '/login',
    '/auth',
    '/confirmar'
];
function shouldBypassTermsGate(pathname) {
    if (!pathname) return true;
    return PUBLIC_PATH_PREFIXES.some((p)=>pathname === p || pathname.startsWith(`${p}/`));
}
function TermsReacceptanceGate({ children }) {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const { user, profile, profileLoading, isAdmin } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    if (!user || profileLoading || shouldBypassTermsGate(pathname)) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: children
        }, void 0, false);
    }
    // Administradores no deben ver el flujo de términos de inscripción / re-aceptación global.
    if (isAdmin) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: children
        }, void 0, false);
    }
    const stale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$legal$2f$termsVersion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isProfileTermsStale"])(profile?.acceptedTermsVersion);
    if (!stale) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: children
        }, void 0, false);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative min-h-dvh w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pointer-events-none min-h-dvh select-none opacity-[0.22] blur-[1px]",
                children: children
            }, void 0, false, {
                fileName: "[project]/src/components/TermsReacceptanceGate.tsx",
                lineNumber: 35,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$legal$2f$TermsReacceptanceOverlay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TermsReacceptanceOverlay"], {}, void 0, false, {
                fileName: "[project]/src/components/TermsReacceptanceGate.tsx",
                lineNumber: 36,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/TermsReacceptanceGate.tsx",
        lineNumber: 34,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6af7407a._.js.map