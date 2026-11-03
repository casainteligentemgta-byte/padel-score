/**
 * Precio de inscripción: solo datos de torneo / fila en BD (nunca el cliente).
 */

export type TournamentPriceSource = {
    inscriptionPrice?: unknown;
    inscriptionCategories?: unknown;
    data?: Record<string, unknown> | null;
};

export type InscriptionPriceRow = {
    id: string;
    tournament_id?: string | null;
    category_key?: string | null;
    category_price?: unknown;
    payment_status?: string | null;
};

function toPositiveNumber(value: unknown): number | null {
    const n = typeof value === 'number' ? value : Number(String(value ?? '').replace(',', '.'));
    if (!Number.isFinite(n) || n < 0) return null;
    return n;
}

function categoriesFromTournament(tournament: TournamentPriceSource | null | undefined): Array<{
    key?: string;
    price?: unknown;
}> {
    if (!tournament) return [];
    const direct = tournament.inscriptionCategories;
    if (Array.isArray(direct)) return direct as Array<{ key?: string; price?: unknown }>;
    const nested = tournament.data?.inscriptionCategories;
    if (Array.isArray(nested)) return nested as Array<{ key?: string; price?: unknown }>;
    return [];
}

export function categoryPriceFromTournament(
    tournament: TournamentPriceSource | null | undefined,
    categoryKey: string | null | undefined
): number {
    const key = (categoryKey || '').trim();
    const cats = categoriesFromTournament(tournament);
    if (key) {
        const cat = cats.find((c) => String(c?.key || '') === key);
        const fromCat = toPositiveNumber(cat?.price);
        if (fromCat != null) return fromCat;
    }
    const fallback = toPositiveNumber(tournament?.inscriptionPrice ?? tournament?.data?.inscriptionPrice);
    return fallback ?? 0;
}

/**
 * Precio esperado de una inscripción: siempre el de la categoría del torneo.
 * Ignora `category_price` persistido (el cliente pudo haberlo escrito antes del
 * endurecimiento). El checkout y el webhook no deben fiarse de esa columna.
 */
export function expectedAmountForInscription(
    inscription: InscriptionPriceRow,
    tournament: TournamentPriceSource | null | undefined
): number {
    return categoryPriceFromTournament(tournament, inscription.category_key);
}

export function expectedAmountForInscriptions(
    inscriptions: InscriptionPriceRow[],
    tournamentById: Map<string, TournamentPriceSource>
): number {
    return inscriptions.reduce((sum, ins) => {
        const tid = ins.tournament_id ? String(ins.tournament_id) : '';
        return sum + expectedAmountForInscription(ins, tid ? tournamentById.get(tid) : undefined);
    }, 0);
}

export function flattenTournamentRow(row: {
    id?: string;
    data?: Record<string, unknown> | null;
    [key: string]: unknown;
}): TournamentPriceSource & { id?: string; name?: string } {
    const data = (row.data && typeof row.data === 'object' ? row.data : {}) as Record<string, unknown>;
    return {
        ...data,
        ...row,
        data,
        inscriptionCategories: row.inscriptionCategories ?? data.inscriptionCategories,
        inscriptionPrice: row.inscriptionPrice ?? data.inscriptionPrice,
        name: (row.name as string | undefined) ?? (data.name as string | undefined),
    };
}

export const PAYABLE_INSCRIPTION_STATUSES = new Set(['pending', 'alert', 'revision']);

export function isPayableInscriptionStatus(status: string | null | undefined): boolean {
    const s = String(status || 'pending').trim().toLowerCase();
    return PAYABLE_INSCRIPTION_STATUSES.has(s) || s === '';
}
