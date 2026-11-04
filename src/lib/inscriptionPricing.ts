/**
 * Precio de inscripción: solo datos de torneo / fila en BD (nunca el cliente).
 */

export type TournamentPriceSource = {
    inscriptionPrice?: unknown;
    inscriptionCategories?: unknown;
    category?: unknown;
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

function normalizeCategoryToken(value: unknown): string {
    return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '');
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

export function resolveInscriptionCategory(
    tournament: TournamentPriceSource | null | undefined,
    categoryKey: string | null | undefined
): { key: string; price: number } {
    const cats = categoriesFromTournament(tournament);
    const requested = (categoryKey || '').trim();
    const tournamentCategory = String(
        (tournament as { category?: unknown } | null | undefined)?.category ??
            tournament?.data?.category ??
            ''
    ).trim();

    const priceOf = (cat: { key?: string; price?: unknown } | undefined, fallbackKey: string) => ({
        key: String(cat?.key || fallbackKey || 'GENERAL'),
        price: toPositiveNumber(cat?.price) ?? 0,
    });

    if (requested && requested.toUpperCase() !== 'GENERAL') {
        const requestedNorm = normalizeCategoryToken(requested);
        const cat = cats.find((c) => {
            const key = String(c?.key || '').trim();
            const name = String((c as { name?: unknown }).name || '').trim();
            return key === requested || name === requested || normalizeCategoryToken(key) === requestedNorm || normalizeCategoryToken(name) === requestedNorm;
        });
        if (cat) return priceOf(cat, requested);
    }

    if (tournamentCategory) {
        const tournamentNorm = normalizeCategoryToken(tournamentCategory);
        const cat = cats.find((c) => {
            const key = String(c?.key || '').trim();
            const name = String((c as { name?: unknown }).name || '').trim();
            return (
                key === tournamentCategory ||
                name === tournamentCategory ||
                normalizeCategoryToken(key) === tournamentNorm ||
                normalizeCategoryToken(name).includes(tournamentNorm)
            );
        });
        if (cat) return priceOf(cat, String(cat.key || tournamentCategory));
    }

    if (cats.length === 1) {
        return priceOf(cats[0], requested || tournamentCategory || String(cats[0].key || 'GENERAL'));
    }

    const fallbackPrice =
        toPositiveNumber(tournament?.inscriptionPrice ?? tournament?.data?.inscriptionPrice) ?? 0;
    if (requested && requested.toUpperCase() !== 'GENERAL') {
        return { key: requested, price: fallbackPrice };
    }
    if (tournamentCategory) {
        return { key: tournamentCategory, price: fallbackPrice };
    }
    if (cats[0]?.key) {
        return priceOf(cats[0], String(cats[0].key));
    }
    return { key: requested || 'GENERAL', price: fallbackPrice };
}

export function categoryPriceFromTournament(
    tournament: TournamentPriceSource | null | undefined,
    categoryKey: string | null | undefined
): number {
    return resolveInscriptionCategory(tournament, categoryKey).price;
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
        category: (row as { category?: unknown }).category ?? data.category,
    };
}

export const PAYABLE_INSCRIPTION_STATUSES = new Set(['pending', 'alert', 'revision']);

export function isPayableInscriptionStatus(status: string | null | undefined): boolean {
    const s = String(status || 'pending').trim().toLowerCase();
    return PAYABLE_INSCRIPTION_STATUSES.has(s) || s === '';
}
