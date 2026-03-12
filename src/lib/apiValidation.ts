/**
 * Validación básica de entradas para las APIs (evitar datos mal formados y límites razonables).
 */

/**
 * Sanitiza strings para eliminar etiquetas HTML y prevenir ataques XSS básicos.
 */
export function sanitizeString(str: unknown): string {
    if (typeof str !== 'string') return '';
    return str
        .replace(/<[^>]*>?/gm, '') // Elimina etiquetas HTML
        .replace(/[&<>"']/g, (m) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m] as string))
        .trim();
}

const MAX_STRING = (len: number) => (v: unknown) =>
    typeof v === 'string' && v.length > 0 && v.length <= len;

const OPT_STRING = (max: number) => (v: unknown) =>
    v == null || (typeof v === 'string' && v.length <= max);

const NUM_RANGE = (min: number, max: number) => (v: unknown) =>
    typeof v === 'number' && !Number.isNaN(v) && v >= min && v <= max;

const OPT_NUM_RANGE = (min: number, max: number) => (v: unknown) =>
    v == null || (typeof v === 'number' && !Number.isNaN(v) && v >= min && v <= max);

const ONE_OF = (allowed: readonly string[]) => (v: unknown) =>
    typeof v === 'string' && allowed.includes(v);

const ARRAY_MIN = (min: number) => (v: unknown) =>
    Array.isArray(v) && v.length >= min;

const ARRAY_STRINGS = (v: unknown) =>
    Array.isArray(v) && v.every(item => typeof item === 'string');

const validDate = (v: unknown): v is string => {
    if (typeof v !== 'string') return false;
    const d = new Date(v);
    return !Number.isNaN(d.getTime());
};

const validEmail = (v: unknown): boolean => {
    if (typeof v !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
};

export const tournamentTypes = [
    'AMERICANO_INDIVIDUAL', 'AMERICANO_DUPLA', 'KNOCKOUT', 'ROUND_ROBIN', 'CRUZADO'
] as const;

export const tournamentCategories = [
    'MALE', 'FEMALE', 'MIXED', 'PRIMERA', 'SEGUNDA', 'TERCERA', 'CUARTA', 'QUINTA', 'SEXTA', 'SEPTIMA',
    'MAS_40', 'FEM_40', 'MIX_40', 'MAS_45', 'MAS_50', 'SUMA_7', 'SUMA_8', 'SUMA_9', 'SUMA_10', 'SUMA_11'
] as const;

export const participantLevels = ['1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0', '7.0'] as const;

export const matchStatuses = ['PENDING', 'LIVE', 'PAUSED', 'FINISHED', 'CANCELLED'] as const;

export const aiAgentIds = [
    'safeguard', 'media', 'stats', 'organizer', 'midas', 'aura', 'reporter', 'analyst', 'coach'
] as const;

export const emailTypes = ['NEW_PLAYER', 'NEW_INSCRIPTION'] as const;

/** Validar body de POST /api/tournaments */
export function validateTournamentBody(body: unknown): { error?: string } {
    if (body == null || typeof body !== 'object') return { error: 'Body inválido' };
    const b = body as Record<string, unknown>;
    
    if (!MAX_STRING(200)(b.name)) return { error: 'Nombre requerido (máx. 200 caracteres)' };
    if (!validDate(b.startDate)) return { error: 'Fecha de inicio inválida' };
    if (!ARRAY_MIN(1)(b.teamIds)) return { error: 'teamIds debe ser un array con al menos un equipo' };
    
    if (b.totalCourts != null && !NUM_RANGE(1, 100)(b.totalCourts)) return { error: 'totalCourts debe estar entre 1 y 100' };
    if (b.bufferMinutes != null && !NUM_RANGE(0, 240)(b.bufferMinutes)) return { error: 'bufferMinutes debe estar entre 0 y 240' };
    
    if (b.type != null && !ONE_OF(tournamentTypes)(b.type)) return { error: 'Tipo de torneo no válido' };
    if (b.category != null && !ONE_OF(tournamentCategories)(b.category)) return { error: 'Categoría no válida' };
    
    // Validaciones adicionales para horarios y club
    if (b.clubHoursStart != null && !MAX_STRING(10)(b.clubHoursStart)) return { error: 'Hora inicio club inválida' };
    if (b.clubHoursEnd != null && !MAX_STRING(10)(b.clubHoursEnd)) return { error: 'Hora fin club inválida' };
    if (b.complexName != null && !MAX_STRING(200)(b.complexName)) return { error: 'Nombre del complejo demasiado largo' };
    
    return {};
}

/** Validar body de PATCH /api/matches/[id] */
export function validateMatchBody(body: unknown): { error?: string } {
    if (body == null) return {};
    if (typeof body !== 'object') return { error: 'Body debe ser un objeto' };
    const b = body as Record<string, unknown>;
    
    if (b.status != null && !ONE_OF(matchStatuses)(b.status)) return { error: 'Estado de partido no válido' };
    if (b.score != null && typeof b.score !== 'string') return { error: 'score debe ser string' };
    if (b.score != null && (b.score as string).length > 100) return { error: 'score demasiado largo' };
    
    if (b.actualStartTime != null && !validDate(b.actualStartTime)) return { error: 'actualStartTime inválido' };
    if (b.actualEndTime != null && !validDate(b.actualEndTime)) return { error: 'actualEndTime inválido' };
    
    return {};
}

/** Validar body de POST /api/ai */
const MAX_MESSAGE_LENGTH = 8000;
export function validateAiBody(body: unknown): { error?: string } {
    if (body == null || typeof body !== 'object') return { error: 'Body inválido' };
    const b = body as Record<string, unknown>;
    
    const message = b.message ?? b.prompt ?? '';
    if (typeof message !== 'string' || message.trim().length === 0) return { error: 'message o prompt requerido' };
    if (message.length > MAX_MESSAGE_LENGTH) return { error: `Mensaje demasiado largo (máx. ${MAX_MESSAGE_LENGTH} caracteres)` };
    
    const agentId = String(b.agentId ?? b.role ?? 'organizer');
    if (!ONE_OF(aiAgentIds)(agentId)) return { error: 'agentId no válido' };
    
    return {};
}

/** Validar body de POST /api/send-email */
export function validateEmailBody(body: unknown): { error?: string } {
    if (body == null || typeof body !== 'object') return { error: 'Body inválido' };
    const b = body as Record<string, unknown>;
    
    if (!ONE_OF(emailTypes)(b.type)) return { error: 'Tipo de email no válido' };
    if (b.data == null || typeof b.data !== 'object') return { error: 'Datos de email requeridos' };
    
    return {};
}

/** Validar id de match (UUID o string alfanumérico) */
export function validateMatchId(id: unknown): { error?: string } {
    if (typeof id !== 'string' || id.length === 0 || id.length > 100) return { error: 'ID de partido inválido' };
    if (!/^[a-zA-Z0-9_\-]+$/.test(id)) return { error: 'ID de partido con caracteres no permitidos' };
    return {};
}

/** Validar id de torneo */
export function validateTournamentId(id: unknown): { error?: string } {
    if (typeof id !== 'string' || id.length === 0 || id.length > 100) return { error: 'ID de torneo inválido' };
    if (!/^[a-zA-Z0-9_\-]+$/.test(id)) return { error: 'ID de torneo con caracteres no permitidos' };
    return {};
}

/** Validar body de Participante */
export function validateParticipantBody(body: unknown): { error?: string } {
    if (body == null || typeof body !== 'object') return { error: 'Datos de participante inválidos' };
    const b = body as Record<string, unknown>;
    
    if (!MAX_STRING(100)(b.name)) return { error: 'Nombre es requerido' };
    if (b.email != null && !validEmail(b.email)) return { error: 'Email inválido' };
    if (b.phone != null && !MAX_STRING(20)(b.phone)) return { error: 'Teléfono inválido' };
    
    return {};
}

/** Validar body de Inscripción */
export function validateInscriptionBody(body: unknown): { error?: string } {
    if (body == null || typeof body !== 'object') return { error: 'Datos de inscripción inválidos' };
    const b = body as Record<string, unknown>;
    
    if (!b.tournamentId) return { error: 'ID de torneo requerido' };
    if (!b.categoryKey) return { error: 'Categoría requerida' };
    if (!MAX_STRING(100)(b.participantName)) return { error: 'Nombre del participante requerido' };
    
    return {};
}

