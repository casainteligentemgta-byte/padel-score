/** Zona horaria del club (Venezuela, UTC−4, sin DST). */
export const CLUB_TIMEZONE = 'America/Caracas';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}/;

function partsInClubTz(date: Date): { year: string; month: string; day: string; hour: string; minute: string } {
    const fmt = new Intl.DateTimeFormat('en-CA', {
        timeZone: CLUB_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    });
    const bag: Record<string, string> = {};
    for (const p of fmt.formatToParts(date)) {
        if (p.type !== 'literal') bag[p.type] = p.value;
    }
    return {
        year: bag.year,
        month: bag.month,
        day: bag.day,
        hour: bag.hour,
        minute: bag.minute,
    };
}

/** Fecha civil de hoy en Caracas (`YYYY-MM-DD`). */
export function caracasTodayDateString(now: Date = new Date()): string {
    const p = partsInClubTz(now);
    return `${p.year}-${p.month}-${p.day}`;
}

/** Convierte un instante a fecha civil en Caracas. */
export function toCaracasDateString(input: Date | string | number): string {
    if (typeof input === 'string' && DATE_ONLY.test(input.trim())) {
        return input.trim().slice(0, 10);
    }
    const d = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(d.getTime())) return '';
    return caracasTodayDateString(d);
}

/** Suma días a una fecha civil `YYYY-MM-DD` sin pasar por UTC de `toISOString`. */
export function addCalendarDays(dateStr: string, days: number): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dateStr || '').trim());
    if (!m) return '';
    const utc = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + days));
    return utc.toISOString().slice(0, 10);
}

export function caracasTodayPlusDays(days: number, now: Date = new Date()): string {
    return addCalendarDays(caracasTodayDateString(now), days);
}

export function caracasClock(now: Date = new Date()): { dateStr: string; hours: number; minutes: number } {
    const p = partsInClubTz(now);
    return {
        dateStr: `${p.year}-${p.month}-${p.day}`,
        hours: Number(p.hour),
        minutes: Number(p.minute),
    };
}

/**
 * Inscripciones cierran a las 16:00 de Caracas del día del evento
 * (o si `registrationStatus === 'closed'`).
 */
export function isCaracasInscriptionClosed(
    startDate: string | null | undefined,
    registrationStatus?: string | null,
    now: Date = new Date(),
    closeHour = 16
): boolean {
    if (String(registrationStatus || 'open').toLowerCase() === 'closed') return true;
    if (!startDate) return false;
    const start = toCaracasDateString(startDate);
    if (!start) return false;
    const { dateStr, hours, minutes } = caracasClock(now);
    if (start < dateStr) return true;
    if (start === dateStr && (hours > closeHour || (hours === closeHour && minutes >= 0))) return true;
    return false;
}

/**
 * Timestamps naive (sin Z) salidos de `timestamp without time zone` se interpretan como UTC,
 * porque los escribimos con `toISOString()`.
 */
export function parseMaybeUtcTimestamp(raw: string | null | undefined): Date | null {
    if (raw == null) return null;
    const s = String(raw).trim();
    if (!s) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        return new Date(`${s}T00:00:00-04:00`);
    }
    const normalized = s.includes('T') ? s : s.replace(' ', 'T');
    const hasTz = /[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized);
    const d = new Date(hasTz ? normalized : `${normalized}Z`);
    return Number.isNaN(d.getTime()) ? null : d;
}

export function invitationExpiryMs(inv: {
    expires_at?: string | null;
    expiresAt?: string | null;
    created_at?: string | null;
    createdAt?: string | null;
} | null | undefined): number | null {
    if (!inv) return null;
    const direct = parseMaybeUtcTimestamp(inv.expires_at ?? inv.expiresAt ?? null);
    if (direct) return direct.getTime();
    const created = parseMaybeUtcTimestamp(inv.created_at ?? inv.createdAt ?? null);
    if (created) return created.getTime() + 2 * 60 * 60 * 1000;
    return null;
}
