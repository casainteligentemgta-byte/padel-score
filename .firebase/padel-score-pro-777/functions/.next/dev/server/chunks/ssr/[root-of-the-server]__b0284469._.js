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
            updatedAt: data.updated_at
        };
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
        try {
            const c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
            if (!c) return null;
            const { data, error } = await c.from('admin_settings').select('*').eq('id', 1).maybeSingle();
            if (error || !data) return null;
            return {
                appTitle: data.app_title,
                clubName: data.club_name,
                timezone: data.timezone,
                updatedAt: data.updated_at
            };
        } catch (e) {
            console.warn('[dataService] Error al obtener admin_settings (posiblemente la tabla no existe):', e);
            return null;
        }
    },
    async setAdminSettings (data) {
        const c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
        if (!c) return;
        await c.from('admin_settings').update({
            app_title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(data.appTitle),
            club_name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(data.clubName),
            timezone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeString"])(data.timezone),
            updated_at: now()
        }).eq('id', 1);
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
                partnerName: data.partnerName
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
        timezone: settings.timezone ?? '',
        loading,
        refresh: load
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AppSettingsContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/lib/AppSettingsContext.tsx",
        lineNumber: 58,
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
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b0284469._.js.map