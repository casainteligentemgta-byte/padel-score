/**
 * Validación básica de entradas para las APIs (evitar datos mal formados y límites razonables).
 */

const MAX_STRING = (len: number) => (v: unknown) =>
    typeof v === 'string' && v.length > 0 && v.length <= len;

const OPT_STRING = (max: number) => (v: unknown) =>
    v == null || (typeof v === 'string' && v.length <= max);

const NUM_RANGE = (min: number, max: number) => (v: unknown) =>
    typeof v === 'number' && !Number.isNaN(v) && v >= min && v <= max;

const OPT_NUM_RANGE = (min: number, max: number) => (v: unknown) =>
    v == null || (typeof v === 'number' && !Number.isNaN(v) && v >= min && v <= max);

const ONE_OF = (allowed: string[]) => (v: unknown) =>
    typeof v === 'string' && allowed.includes(v);

const ARRAY_MIN = (min: number) => (v: unknown) =>
    Array.isArray(v) && v.length >= min;

const validDate = (v: unknown): v is string => {
    if (typeof v !== 'string') return false;
    const d = new Date(v);
    return !Number.isNaN(d.getTime());
};

export const tournamentTypes = [
    'AMERICANO_INDIVIDUAL', 'AMERICANO_DUPLA', 'KNOCKOUT', 'ROUND_ROBIN', 'CRUZADO'
] as const;

export const tournamentCategories = [
    'MALE', 'FEMALE', 'MIXED', 'PRIMERA', 'SEGUNDA', 'TERCERA', 'CUARTA', 'QUINTA', 'SEXTA', 'SEPTIMA',
    'MAS_45', 'MAS_50', 'SUMA_7', 'SUMA_8', 'SUMA_9', 'SUMA_10', 'SUMA_11'
] as const;

export const matchStatuses = ['PENDING', 'LIVE', 'PAUSED', 'FINISHED', 'CANCELLED'] as const;

export const aiAgentIds = [
    'safeguard', 'media', 'stats', 'organizer', 'midas', 'aura', 'reporter', 'analyst', 'coach'
] as const;

/** Validar body de POST /api/tournaments */
export function validateTournamentBody(body: unknown): { error?: string } {
    if (body == null || typeof body !== 'object') return { error: 'Body inválido' };
    const b = body as Record<string, unknown>;
    if (!MAX_STRING(200)(b.name)) return { error: 'Nombre requerido (máx. 200 caracteres)' };
    if (!validDate(b.startDate)) return { error: 'Fecha de inicio inválida' };
    if (!ARRAY_MIN(1)(b.teamIds)) return { error: 'teamIds debe ser un array con al menos un equipo' };
    if (b.totalCourts != null && !NUM_RANGE(1, 50)(b.totalCourts)) return { error: 'totalCourts debe estar entre 1 y 50' };
    if (b.bufferMinutes != null && !NUM_RANGE(0, 120)(b.bufferMinutes)) return { error: 'bufferMinutes debe estar entre 0 y 120' };
    if (b.type != null && !ONE_OF([...tournamentTypes])(b.type)) return { error: 'Tipo de torneo no válido' };
    if (b.category != null && !ONE_OF([...tournamentCategories])(b.category)) return { error: 'Categoría no válida' };
    return {};
}

/** Validar body de PATCH /api/matches/[id] */
export function validateMatchBody(body: unknown): { error?: string } {
    if (body == null) return {};
    if (typeof body !== 'object') return { error: 'Body debe ser un objeto' };
    const b = body as Record<string, unknown>;
    if (b.status != null && !ONE_OF([...matchStatuses])(b.status)) return { error: 'Estado de partido no válido' };
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
    if (agentId.length > 80) return { error: 'agentId no válido' };
    return {};
}

/** Validar id de match (UUID o string alfanumérico) */
export function validateMatchId(id: unknown): { error?: string } {
    if (typeof id !== 'string' || id.length === 0 || id.length > 100) return { error: 'ID de partido inválido' };
    return {};
}

/** Validar id de torneo */
export function validateTournamentId(id: unknown): { error?: string } {
    if (typeof id !== 'string' || id.length === 0 || id.length > 100) return { error: 'ID de torneo inválido' };
    return {};
}
