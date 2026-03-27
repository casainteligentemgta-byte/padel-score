import { getSupabaseClient } from './supabase/client';
import { sanitizeString } from './apiValidation';
import { getAuthHeaders } from './apiAuth';
import { getScoringRules } from './matchScoringRules';

const supabase = () => {
    const c = getSupabaseClient();
    if (!c) {
        const urlMissing = !process.env.NEXT_PUBLIC_SUPABASE_URL;
        const keyMissing = !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        let details = '';
        if (urlMissing) details += ' (Falta URL)';
        if (keyMissing) details += ' (Falta Anon Key)';
        if (!urlMissing && !keyMissing && typeof window === 'undefined') details += ' (Error Server-Side)';

        throw new Error(`Supabase no configurado${details}. Asegúrate de reiniciar el servidor tras editar .env.local`);
    }
    return c;
};

/**
 * Convierte el objeto error de Supabase en un Error nativo para que
 * los stack traces muestren el mensaje real en lugar de "[object Object]".
 */
function throwIfError(error: any): void {
    if (!error) return;
    if (error instanceof Error) throw error;
    const msg = error?.message || error?.details || error?.hint || JSON.stringify(error);
    const err = new Error(msg);
    if (error?.code) (err as any).code = error.code;
    throw err;
}

const now = () => new Date().toISOString();

/** Valida UUID v4 (y variantes comunes en Supabase) para IDs de inscripción en URL. */
export function isValidInscriptionId(id: string | null | undefined): boolean {
    if (!id || typeof id !== 'string') return false;
    const s = id.trim();
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

// ── Time Synchronization (NTP-like using Supabase Headers) ─────────────
let globalClockOffset = 0;
let clockSynced = false;

// Replaced with object methods later in file

export const ROLES = {
    ADMIN: 'admin',
    PLAYER: 'player',
    MARKER: 'marker',
};

const generateUniqueCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

export type AdminSettings = {
    clubName?: string;
    appTitle?: string;
    timezone?: string;
    updatedAt?: any;
};

export type InscriptionData = {
    tournamentId: string;
    tournamentName?: string;
    categoryKey?: string;
    categoryPrice: number;
    participantName?: string;
    participantEmail?: string;
    participantId?: string;
    amountExtracted?: number | null;
    receiptUrl?: string | null;
    paymentStatus: 'pending' | 'paid' | 'alert';
    alertMessage?: string | null;
    // New payment details
    paymentMethod?: string;
    paymentDate?: string;
    paymentBank?: string;
    paymentAmount?: number;
    paymentReference?: string;
    partnerId?: string;
    partnerName?: string;
};

function sanitizeObject(obj: any): any {
    if (obj == null || typeof obj !== 'object') return obj;
    const result: any = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            result[key] = sanitizeString(obj[key]);
        } else if (typeof obj[key] === 'object') {
            result[key] = sanitizeObject(obj[key]);
        } else {
            result[key] = obj[key];
        }
    }
    return result;
}

export const dataService = {
    normalizeMatchStatus(status: unknown): string {
        return String(status || '').trim().toUpperCase();
    },

    /** Partidos aún no iniciados: generación usa PENDING; flujo Marker/Hub puede usar SCHEDULED. */
    isMatchPorComenzarStatus(status: unknown): boolean {
        const s = this.normalizeMatchStatus(status);
        return s === 'SCHEDULED' || s === 'PENDING';
    },

    /**
     * En vivo en el hub: marker (WARM_UP / IN_PROGRESS) y flujos legacy (LIVE / PAUSED / STARTED).
     */
    isMatchEnVivoStatus(status: unknown): boolean {
        const s = this.normalizeMatchStatus(status);
        return (
            s === 'WARM_UP' ||
            s === 'IN_PROGRESS' ||
            s === 'LIVE' ||
            s === 'PAUSED' ||
            s === 'STARTED'
        );
    },

    /**
     * Partidos que deben listarse como finalizados en el hub.
     * Incluye recuperación si `status` no llegó a FINISHED (merge, marcador sin setScores, etc.).
     */
    isMatchFinishedLike(m: any): boolean {
        const s = this.normalizeMatchStatus(m?.status);
        if (s === 'FINISHED' || s === 'FINALIZADO' || s === 'COMPLETE') return true;

        const endIso = m?.finishedAt || m?.actualEndTime;
        if (endIso) {
            const ms = new Date(endIso as string | Date).getTime();
            if (!isNaN(ms) && ms > 0) return true;
        }

        const t1 = Number(m?.sets?.t1 ?? m?.sets?.local ?? 0) || 0;
        const t2 = Number(m?.sets?.t2 ?? m?.sets?.visitante ?? 0) || 0;

        const mf = (m as any)?.rrMatchFormat ?? (m as any)?.match_format ?? (m as any)?.matchFormat;
        const tbtRaw = (m as any)?.tieBreakType ?? (m as any)?.tie_break_type;
        const tbtUp = String(tbtRaw || '').toUpperCase();
        const tbtArg: 'TB' | 'STB' | undefined =
            tbtUp === 'STB' ? 'STB' : tbtUp === 'TB' ? 'TB' : undefined;
        const rules = getScoringRules(mf, tbtArg);
        let need = rules.setsToWinMatch;
        const needRaw = Number(m?.sets_to_win_match ?? m?.setsToWinMatch);
        if (Number.isFinite(needRaw) && needRaw >= 1) need = needRaw;

        if (t1 >= need || t2 >= need) return true;

        const stb = m?.superTiebreakScore;
        if (stb && typeof stb === 'object' && (t1 >= 2 || t2 >= 2)) return true;
        const scores = m?.setScores;
        if (Array.isArray(scores) && scores.length >= 2 && (t1 >= 2 || t2 >= 2)) return true;
        return false;
    },

    listMatchesPorComenzar(matches: any[], excludedMatchIds?: Set<string>): any[] {
        const list = Array.isArray(matches) ? matches : [];
        const toOrder = (m: any, idx: number) => {
            const n = Number(m?.match_number ?? m?.matchNumber ?? m?.order ?? m?.orden);
            return Number.isFinite(n) ? n : idx + 1;
        };
        return list
            .filter((m: any) => this.isMatchPorComenzarStatus(m?.status))
            .filter((m: any) => !this.isMatchFinishedLike(m))
            .filter((m: any) => {
                if (!excludedMatchIds || excludedMatchIds.size === 0) return true;
                return !excludedMatchIds.has(String(m?.id || ''));
            })
            .sort((a: any, b: any) => toOrder(a, 0) - toOrder(b, 0));
    },

    listMatchesEnVivo(matches: any[]): any[] {
        const list = Array.isArray(matches) ? matches : [];
        return list.filter((m: any) => {
            if (!this.isMatchEnVivoStatus(m?.status)) return false;
            if (this.isMatchFinishedLike(m)) return false;
            return true;
        });
    },

    listMatchesTerminados(matches: any[]): any[] {
        const list = Array.isArray(matches) ? matches : [];
        const toMs = (m: any) =>
            new Date(m?.updated_at || m?.updatedAt || m?.actualEndTime || m?.finishedAt || 0).getTime();
        return list
            .filter((m: any) => this.isMatchFinishedLike(m))
            .sort((a: any, b: any) => toMs(b) - toMs(a));
    },

    // Time Synchronization
    async syncSystemClock() {
        if (clockSynced) return;
        try {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
            if (!url) return;
            const res = await fetch(`${url}/rest/v1/`, { method: 'HEAD', cache: 'no-store' });
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

    getSyncedNow() {
        return Date.now() + globalClockOffset;
    },

    // Media & Ticker Management
    async getTiraInformativa(pantallaId?: string | null) {
        const client = getSupabaseClient();
        if (!client) return [];

        try {
            let query = client
                .from('tira_informativa')
                .select('*')
                .eq('activo', true);

            if (pantallaId) {
                // Incluir mensajes específicos de la pantalla O mensajes globales (null)
                query = query.or(`pantalla_id.eq.${pantallaId},pantalla_id.is.null`);
            }

            const { data, error } = await query.order('orden', { ascending: true });
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

    async getPantallas() {
        const { data, error } = await supabase()
            .from('pantallas')
            .select('*')
            .order('nombre', { ascending: true });
        throwIfError(error);
        return data || [];
    },

    async getPantallaEstado(pantallaId: string) {
        const { data, error } = await supabase()
            .from('display_estado')
            .select('*, media_content(*)')
            .ilike('pantalla_id', `${pantallaId}%`);
        throwIfError(error);
        return data || [];
    },

    async createTournament(data: any, ownerId: string) {
        const { id, ...rest } = data;
        const { data: row, error } = await supabase()
            .from('tournaments')
            .insert({
                owner_id: ownerId,
                data: rest,
                created_at: now(),
                updated_at: now(),
            })
            .select('id')
            .single();
        throwIfError(error);
        return { id: (row as any)?.id };
    },

    async updateTournament(id: string, data: any) {
        const { id: _, ownerId: __, createdAt: ___, updatedAt: ____, ...rest } = data;
        const { error } = await supabase()
            .from('tournaments')
            .update({
                data: rest,
                updated_at: now(),
            })
            .eq('id', id);
        throwIfError(error);
    },

    async getMyTournaments(ownerId: string) {
        const { data, error } = await supabase()
            .from('tournaments')
            .select('*')
            .eq('owner_id', ownerId)
            .order('created_at', { ascending: false });
        throwIfError(error);
        return (data || []).map((r: any) => ({ id: r.id, ownerId: r.owner_id, ...(r.data || {}), createdAt: r.created_at, updatedAt: r.updated_at }));
    },

    async listAllTournaments() {
        const { data, error } = await supabase().from('tournaments').select('*').order('created_at', { ascending: false });
        throwIfError(error);
        return (data || []).map((r: any) => ({ id: r.id, ownerId: r.owner_id, ...(r.data || {}), createdAt: r.created_at, updatedAt: r.updated_at }));
    },

    async getTournament(id: string) {
        const { data, error } = await supabase().from('tournaments').select('*').eq('id', id).single();
        if (error || !data) return null;
        return { id: data.id, ownerId: data.owner_id, ...data.data, createdAt: data.created_at, updatedAt: data.updated_at };
    },

    async deleteTournament(id: string) {
        const db = supabase();
        await db.from('tournament_matches').delete().eq('tournament_id', id);
        const { error } = await db.from('tournaments').delete().eq('id', id);
        throwIfError(error);
    },

    async getMatches(tournamentId: string) {
        try {
            const { data, error } = await supabase()
                .from('tournament_matches')
                .select('*')
                .eq('tournament_id', tournamentId);
            throwIfError(error);
            return (data || []).map((r: any) => ({ id: r.id, ownerId: r.owner_id, ...(r.data || {}), createdAt: r.created_at, updatedAt: r.updated_at }));
        } catch (e) {
            // Evita romper la UI cuando hay fallas transitorias de red/Supabase.
            console.warn('[dataService] getMatches fallback (fetch error):', e);
            return [];
        }
    },

    async getScheduledMatches(tournamentId: string) {
        const rows = await this.getMatches(tournamentId);
        return rows
            .filter((m: any) => this.isMatchPorComenzarStatus(m?.status))
            .sort((a: any, b: any) => {
                const aN = Number(a?.match_number ?? a?.matchNumber ?? a?.order ?? a?.orden);
                const bN = Number(b?.match_number ?? b?.matchNumber ?? b?.order ?? b?.orden);
                const aOrder = Number.isFinite(aN) ? aN : Number.MAX_SAFE_INTEGER;
                const bOrder = Number.isFinite(bN) ? bN : Number.MAX_SAFE_INTEGER;
                return aOrder - bOrder;
            });
    },

    async getLiveMatchesByTournament(tournamentId: string) {
        const rows = await this.getMatches(tournamentId);
        return rows.filter((m: any) => {
            const s = this.normalizeMatchStatus(m?.status);
            return s === 'WARM_UP' || s === 'IN_PROGRESS';
        });
    },

    async getFinishedMatches(tournamentId: string) {
        const rows = await this.getMatches(tournamentId);
        return rows
            .filter((m: any) => this.isMatchFinishedLike(m))
            .sort((a: any, b: any) => {
                const aMs = new Date(a?.updated_at || a?.updatedAt || a?.actualEndTime || a?.finishedAt || 0).getTime();
                const bMs = new Date(b?.updated_at || b?.updatedAt || b?.actualEndTime || b?.finishedAt || 0).getTime();
                return bMs - aMs;
            });
    },

    async updateMatch(tournamentId: string, matchId: string, data: any) {
        const { data: row } = await supabase()
            .from('tournament_matches')
            .select('data')
            .eq('tournament_id', tournamentId)
            .eq('id', matchId)
            .single();
        const currentStatus = this.normalizeMatchStatus((row as any)?.data?.status);
        const nextStatus = this.normalizeMatchStatus(data?.status ?? (row as any)?.data?.status);
        if (currentStatus === 'FINISHED' && nextStatus !== 'FINISHED') {
            throw new Error('El partido ya está FINISHED y no puede modificarse.');
        }
        const merged = { ...(row?.data || {}), ...data };
        const { error } = await supabase()
            .from('tournament_matches')
            .update({ data: merged, updated_at: now() })
            .eq('tournament_id', tournamentId)
            .eq('id', matchId);
        throwIfError(error);
    },

    async deleteMatch(tournamentId: string, matchId: string) {
        const { error } = await supabase()
            .from('tournament_matches')
            .delete()
            .eq('tournament_id', tournamentId)
            .eq('id', matchId);
        throwIfError(error);
    },

    async deleteTournamentMatches(tournamentId: string, filter?: any) {
        let query = supabase().from('tournament_matches').delete().eq('tournament_id', tournamentId);
        if (filter) {
            // Simplistic filter application
            Object.entries(filter).forEach(([key, val]) => {
                query = query.eq(`data->>${key}`, val);
            });
        }
        const { error } = await query;
        throwIfError(error);
    },

    async createMatch(tournamentId: string, data: any) {
        const id = data.id || crypto.randomUUID?.() || `m_${Date.now()}`;
        const { id: _id, ...rest } = data;
        const { error } = await supabase()
            .from('tournament_matches')
            .insert({
                id,
                tournament_id: tournamentId,
                data: rest,
                created_at: now(),
                updated_at: now(),
            });
        throwIfError(error);
        return { id };
    },

    /** Inserción masiva de partidos (evita N round-trips en categorías grandes). */
    async createMatchesBulk(tournamentId: string, matchesData: any[]): Promise<{ inserted: number }> {
        if (!matchesData.length) return { inserted: 0 };
        const rows = matchesData.map((data) => {
            const id = data.id || crypto.randomUUID?.() || `m_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
            const { id: _id, ...rest } = data;
            return {
                id,
                tournament_id: tournamentId,
                data: rest,
                created_at: now(),
                updated_at: now(),
            };
        });
        const { error } = await supabase().from('tournament_matches').insert(rows);
        throwIfError(error);
        return { inserted: rows.length };
    },

    async assignPlayersToTournament(
        tournamentId: string,
        categoryKey: string,
        p1Name: string,
        p2Name?: string,
        targetTeamIdHint?: string | null,
    ) {
        const tournament = await this.getTournament(tournamentId);
        if (!tournament) throw new Error('Tournament not found');

        let targetTeamId: string | null =
            targetTeamIdHint != null && targetTeamIdHint !== '' ? String(targetTeamIdHint) : null;
        let categoryUpdated = false;

        let targetCategoryInfo: any = null;
        if (tournament.inscriptionCategories) {
            targetCategoryInfo = tournament.inscriptionCategories.find((c: any) => c.key === categoryKey);
        }

        const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        const isMatchingCategory = (cat: any) => {
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

        const isP1Placeholder = (t: any) =>
            !t.p1?.name || t.p1.name.trim() === '' || t.p1.name.startsWith('TBD') || t.p1.name.startsWith('Jugador');
        const isP2PlaceholderOrMissing = (t: any) =>
            !t.p2?.name || t.p2.name.trim() === '' || t.p2.name.startsWith('TBD') || t.p2.name.startsWith('Jugador');
        // Emparejar por nombre: exacto o uno contiene al otro (ej. "Carla Di Matteo" en perfil vs "Carla" en torneo)
        const nameMatches = (storedName: string, assignedName: string) => {
            const a = normalize((assignedName || '').trim());
            const b = normalize((storedName || '').trim());
            if (!a || !b) return false;
            return a === b || b.startsWith(a) || a.startsWith(b);
        };
        const p1NameMatches = (t: any) => nameMatches(t.p1?.name ?? '', p1Name);
        const p2NameMatches = (t: any) => nameMatches(t.p2?.name ?? '', p2Name ?? '');

        const updatedCategories = tournament.categories?.map((cat: any) => {
            // Si tenemos enlace por código (tournament_team_id), actualizar ese equipo en la categoría si existe
            if (targetTeamId && cat.teams) {
                const linkedIdx = cat.teams.findIndex((t: any) => String(t?.id) === String(targetTeamId));
                if (linkedIdx >= 0) {
                    const team = cat.teams[linkedIdx];
                    team.p1 = { ...team.p1, name: p1Name, id: team.p1?.id || `p1_${Date.now()}` };
                    if (p2Name) team.p2 = { ...(team.p2 || {}), name: p2Name, id: team.p2?.id || `p2_${Date.now()}` };
                    cat.teams[linkedIdx] = team;
                    categoryUpdated = true;
                    return cat;
                }
            }
            if (!categoryUpdated && isMatchingCategory(cat)) {
                // 1) Invitación aceptada: buscar equipo donde p1 = jugador A y p2 vacío
                let placeholderTeamIdx = -1;
                if (p2Name) {
                    placeholderTeamIdx = cat.teams?.findIndex((t: any) => p1NameMatches(t) && isP2PlaceholderOrMissing(t)) ?? -1;
                    // Fallback: p1 en torneo puede ser el jugador B (ej. Carla Di Matteo); buscamos por p2Name
                    if (placeholderTeamIdx < 0) {
                        placeholderTeamIdx = cat.teams?.findIndex((t: any) => p2NameMatches(t) && isP2PlaceholderOrMissing(t)) ?? -1;
                    }
                }
                // 2) Si no, primer equipo con p1 placeholder (flujo clásico)
                if (placeholderTeamIdx < 0) {
                    placeholderTeamIdx = cat.teams?.findIndex((t: any) => isP1Placeholder(t)) ?? -1;
                }

                if (placeholderTeamIdx >= 0 && cat.teams) {
                    const team = cat.teams[placeholderTeamIdx];
                    targetTeamId = team.id;
                    team.p1 = { ...team.p1, name: p1Name, id: team.p1?.id || `p1_${Date.now()}` };
                    if (p2Name) {
                        team.p2 = { ...(team.p2 || {}), name: p2Name, id: team.p2?.id || `p2_${Date.now()}` };
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
            let rootIdx = tournament.teams.findIndex((t: any) => p1NameMatches(t) && isP2PlaceholderOrMissing(t));
            if (rootIdx < 0 && p2Name.trim() !== '') {
                rootIdx = tournament.teams.findIndex((t: any) => p2NameMatches(t) && isP2PlaceholderOrMissing(t));
            }
            if (rootIdx < 0 && p2Name.trim() !== '') {
                rootIdx = tournament.teams.findIndex((t: any) => isP2PlaceholderOrMissing(t));
            }
            if (rootIdx >= 0) {
                const t = tournament.teams[rootIdx];
                targetTeamId = t?.id != null ? String(t.id) : null;
                rootUpdateIndex = rootIdx;
            }
        }

        const sameTeamId = (a: any, b: any) =>
            a != null && b != null && (String(a) === String(b) || a === b);

        // Sincronizamos el array raíz de teams (grilla de grupos)
        let updatedTeams = tournament.teams;
        if (tournament.teams && (targetTeamId || rootUpdateIndex >= 0)) {
            updatedTeams = tournament.teams.map((team: any, idx: number) => {
                const isTarget = targetTeamId ? sameTeamId(team?.id, targetTeamId) : idx === rootUpdateIndex;
                if (!isTarget) return team;
                const next = { ...team };
                next.p1 = { ...(team.p1 || {}), name: p1Name, id: team.p1?.id || `p1_${Date.now()}` };
                if (p2Name) {
                    next.p2 = { name: p2Name, id: team.p2?.id || `p2_${Date.now()}` };
                }
                return next;
            });
        }

        const hasUpdate = categoryUpdated || targetTeamId || rootUpdateIndex >= 0;
        if (hasUpdate && (targetTeamId || rootUpdateIndex >= 0)) {
            const payload: any = {
                ...tournament,
                ...(categoryUpdated && updatedCategories ? { categories: updatedCategories } : {}),
                ...(updatedTeams ? { teams: updatedTeams } : {}),
            };

            await this.updateTournament(tournamentId, payload);

            const teamIdForMatches = targetTeamId || (rootUpdateIndex >= 0 && updatedTeams?.[rootUpdateIndex]?.id != null ? String(updatedTeams[rootUpdateIndex].id) : null);

            // Actualizar también los partidos que referencian a este equipo
            const matches = await this.getMatches(tournamentId);
            for (const match of matches) {
                if (!teamIdForMatches) continue;
                let matchUpdated = false;
                const updateData: any = {};

                if (sameTeamId(match?.team1?.id, teamIdForMatches)) {
                    updateData.team1 = { 
                        ...match.team1, 
                        p1: { ...match.team1.p1, name: p1Name },
                        p2: p2Name ? { ...match.team1.p2, name: p2Name } : match.team1.p2
                    };
                    updateData.team1Name = p2Name ? `${p1Name} / ${p2Name}` : p1Name;
                    matchUpdated = true;
                }

                if (sameTeamId(match?.team2?.id, teamIdForMatches)) {
                    updateData.team2 = { 
                        ...match.team2, 
                        p1: { ...match.team2.p1, name: p1Name },
                        p2: p2Name ? { ...match.team2.p2, name: p2Name } : match.team2.p2
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
     */
    async assignTeamToGroup(tournamentId: string, teamId: string): Promise<void> {
        const tournament = await this.getTournament(tournamentId);
        if (!tournament) throw new Error('Torneo no encontrado');

        const groupSize = Math.max(1, (tournament as any).groupSize ?? 4);
        const assignments: Record<string, string[]> = { ...((tournament as any).groupAssignments || {}) };
        const teamIdStr = String(teamId);

        const groupNames = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const existingGroup = groupNames.find((g) => (assignments[g] || []).includes(teamIdStr));
        if (existingGroup) return;

        let targetGroup: string | null = null;
        for (const g of groupNames) {
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
            groupAssignments: assignments,
        });
    },

    async migrateTournamentMatches(tournamentId: string, legacyMatches: any[]) {
        const db = supabase();
        for (const m of legacyMatches) {
            const matchId = m.id || `migrated_${Math.random().toString(36).slice(2, 11)}`;
            const { id: _id, ...matchData } = m;
            await db.from('tournament_matches').upsert({
                id: matchId,
                tournament_id: tournamentId,
                data: { ...matchData, migrated: true },
                updated_at: now(),
            }, { onConflict: 'tournament_id,id' });
        }
    },

    async addExpense(data: any, ownerId: string) {
        const sanitized = sanitizeObject(data);
        const { data: row, error } = await supabase()
            .from('expenses')
            .insert({ owner_id: ownerId, data: sanitized, created_at: now(), updated_at: now() })
            .select('id')
            .single();
        throwIfError(error);
        return { id: (row as any)?.id };
    },

    async getMyExpenses(ownerId: string) {
        const { data, error } = await supabase()
            .from('expenses')
            .select('*')
            .eq('owner_id', ownerId)
            .order('created_at', { ascending: false });
        throwIfError(error);
        return (data || []).map((r: any) => ({ id: r.id, ownerId: r.owner_id, ...(r.data || {}), createdAt: r.created_at, updatedAt: r.updated_at }));
    },

    async listAllExpenses() {
        const { data, error } = await supabase()
            .from('expenses')
            .select('*')
            .order('created_at', { ascending: false });
        throwIfError(error);
        return (data || []).map((r: any) => ({ id: r.id, ownerId: r.owner_id, ...(r.data || {}), createdAt: r.created_at, updatedAt: r.updated_at }));
    },

    async addParticipant(data: any, ownerId: string) {
        const sanitized = sanitizeObject(data);
        if (typeof sanitized.email === 'string') {
            sanitized.email = sanitized.email.trim().toLowerCase();
        }

        let uniqueCode: string | undefined;
        try {
            const authHeaders = await getAuthHeaders();
            if (authHeaders.Authorization) {
                const res = await fetch('/api/participants/allocate-player-code', {
                    method: 'POST',
                    headers: { ...authHeaders, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ownerUid: ownerId,
                        email: sanitized.email || null,
                    }),
                });
                if (res.ok) {
                    const j = (await res.json()) as { uniqueCode?: string };
                    if (j.uniqueCode) uniqueCode = j.uniqueCode;
                } else if (res.status === 409) {
                    const j = (await res.json().catch(() => ({}))) as { error?: string };
                    throw new Error(j.error || 'Este email ya está registrado con otro usuario de la plataforma.');
                }
            }
        } catch (e) {
            if (e instanceof Error && e.message.includes('registrado')) throw e;
        }

        if (!uniqueCode) {
            const prof = await this.getUserProfile(ownerId);
            const mine = await this.getMyParticipants(ownerId);
            const used = new Set<string>();
            if (prof?.uniqueCode) used.add(String(prof.uniqueCode).toUpperCase());
            (mine || []).forEach((p: { uniqueCode?: string }) => {
                if (p.uniqueCode) used.add(String(p.uniqueCode).toUpperCase());
            });
            for (let i = 0; i < 48; i++) {
                const c = generateUniqueCode().toUpperCase();
                if (!used.has(c)) {
                    uniqueCode = c;
                    break;
                }
            }
            if (!uniqueCode) uniqueCode = generateUniqueCode().toUpperCase();
        }

        sanitized.uniqueCode = uniqueCode;

        const { data: row, error } = await supabase()
            .from('participants')
            .insert({ owner_id: ownerId, data: sanitized, created_at: now(), updated_at: now() })
            .select('id')
            .single();
        throwIfError(error);
        return { id: (row as any)?.id };
    },

    async getMyParticipants(ownerId: string) {
        const c = getSupabaseClient();
        if (!c) return [];
        const { data, error } = await c
            .from('participants')
            .select('*')
            .eq('owner_id', ownerId)
            .order('created_at', { ascending: false });
        throwIfError(error);
        return (data || []).map((r: any) => ({ id: r.id, ownerId: r.owner_id, ...(r.data || {}), createdAt: r.created_at, updatedAt: r.updated_at }));
    },

    async getAllParticipants() {
        const { data, error } = await supabase().from('participants').select('*').order('created_at', { ascending: false });
        throwIfError(error);
        return (data || []).map((r: any) => ({ id: r.id, ownerId: r.owner_id, ...(r.data || {}), createdAt: r.created_at, updatedAt: r.updated_at }));
    },

    async searchParticipants(query: string, limit = 10) {
        const term = String(query || '').trim();
        if (term.length < 2) return [];
        const escaped = term.replace(/[%_]/g, '\\$&');
        const ilikePattern = `%${escaped}%`;
        const { data, error } = await supabase()
            .from('participants')
            .select('*')
            .or(`data->>name.ilike.${ilikePattern},data->>lastName.ilike.${ilikePattern},data->>email.ilike.${ilikePattern}`)
            .order('created_at', { ascending: false })
            .limit(Math.max(1, Math.min(25, limit)));
        throwIfError(error);
        return (data || []).map((r: any) => ({ id: r.id, ownerId: r.owner_id, ...(r.data || {}), createdAt: r.created_at, updatedAt: r.updated_at }));
    },

    async updateParticipant(id: string, data: any) {
        const { id: _id, ...rest } = data;
        const { data: row } = await supabase().from('participants').select('data, owner_id').eq('id', id).single();
        const merged = { ...(row?.data || {}), ...sanitizeObject(rest) };
        if (typeof merged.email === 'string') {
            merged.email = merged.email.trim().toLowerCase();
        }

        try {
            const authHeaders = await getAuthHeaders();
            if (authHeaders.Authorization && row?.owner_id) {
                const res = await fetch('/api/participants/allocate-player-code', {
                    method: 'POST',
                    headers: { ...authHeaders, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ownerUid: row.owner_id,
                        email: merged.email || null,
                    }),
                });
                if (res.ok) {
                    const j = (await res.json()) as { uniqueCode?: string };
                    if (j.uniqueCode) merged.uniqueCode = j.uniqueCode;
                } else if (res.status === 409) {
                    const j = (await res.json().catch(() => ({}))) as { error?: string };
                    throw new Error(j.error || 'Este email ya está registrado con otro usuario de la plataforma.');
                }
            }
        } catch (e) {
            if (e instanceof Error && e.message.includes('registrado')) throw e;
        }

        const prevCode = (row?.data as { uniqueCode?: string } | undefined)?.uniqueCode;
        if (!merged.uniqueCode && prevCode) {
            merged.uniqueCode = String(prevCode).toUpperCase();
        }

        const { error } = await supabase()
            .from('participants')
            .update({ data: merged, updated_at: now() })
            .eq('id', id);
        throwIfError(error);
    },

    async getParticipant(id: string) {
        const { data, error } = await supabase().from('participants').select('*').eq('id', id).single();
        if (error || !data) return null;
        return { id: data.id, ...data.data, ownerId: data.owner_id, createdAt: data.created_at, updatedAt: data.updated_at };
    },

    async checkParticipantExistence(field: string, value: string, excludeId?: string) {
        const { data, error } = await supabase()
            .from('participants')
            .select('id')
            .eq(`data->>${field}`, value);
        throwIfError(error);
        if (!data || data.length === 0) return false;
        if (excludeId) {
            return data.some(p => p.id !== excludeId);
        }
        return data.length > 0;
    },

    async getPlayerStats(playerId: string) {
        // This is a complex calculation that fetches all matches for a player
        // and computes the requested metrics: played, won, lost, streak, effectiveness.

        try {
            // Get all matches from tournament_matches
            // In a real scenario, we might want to filter this by participant_id if we have a junction table
            // but since matches are stored in JSON 'data' field, we fetch all for now or filter if possible.
            const { data: matches, error } = await supabase()
                .from('tournament_matches')
                .select('*');

            throwIfError(error);

            let played = 0;
            let won = 0;
            let lost = 0;
            let streak = 0;
            let effectiveness = 0;
            const results: boolean[] = []; // true for win, false for loss

            (matches || []).forEach((m: any) => {
                const matchData = m.data || {};
                const isTeam1 = (matchData.team1?.player1?.id === playerId || matchData.team1?.player2?.id === playerId);
                const isTeam2 = (matchData.team2?.player1?.id === playerId || matchData.team2?.player2?.id === playerId);
                const isSingle1 = matchData.player1?.id === playerId;
                const isSingle2 = matchData.player2?.id === playerId;

                if (isTeam1 || isTeam2 || isSingle1 || isSingle2) {
                    played++;
                    const winner = matchData.winner; // 1 or 2
                    const playerWon = (winner === 1 && (isTeam1 || isSingle1)) || (winner === 2 && (isTeam2 || isSingle2));

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
                for (let i = results.length - 1; i >= 0; i--) {
                    if (results[i] === lastResult) count++;
                    else break;
                }
                streak = count;
                effectiveness = Math.round((won / played) * 100);
            }

            const points = played > 0 ? won * 3 + Math.floor(played * 0.5) : 0;
            return {
                played,
                won,
                lost,
                streak: `${streak}${results[results.length - 1] ? 'W' : 'L'}`,
                effectiveness: `${effectiveness}%`,
                ranking: '0',
                points,
            };
        } catch (e) {
            console.error('Error calculating player stats:', e);
            return null;
        }
    },

    async deleteParticipant(id: string) {
        const authHeaders = await getAuthHeaders();
        if (authHeaders.Authorization) {
            const res = await fetch(
                `/api/participants?id=${encodeURIComponent(id)}`,
                { method: 'DELETE', headers: authHeaders }
            );
            if (res.ok) return;
            if (res.status === 401 || res.status === 403) {
                // No es admin: intentar borrado como propietario (RLS) más abajo.
            } else if (res.status === 501) {
                const body = await res.json().catch(() => ({}));
                const msg =
                    (body as { error?: string }).error ||
                    'En el servidor falta SUPABASE_SERVICE_ROLE_KEY; el admin no puede borrar fichas de otros usuarios.';
                throw new Error(msg);
            } else {
                const body = await res.json().catch(() => ({}));
                const msg = (body as { error?: string }).error || `Error al eliminar (${res.status})`;
                throw new Error(msg);
            }
        }
        const { error } = await supabase().from('participants').delete().eq('id', id);
        throwIfError(error);
    },

    async addGroup(data: any, ownerId: string) {
        const { data: row, error } = await supabase()
            .from('groups')
            .insert({ owner_id: ownerId, data, created_at: now(), updated_at: now() })
            .select('id')
            .single();
        throwIfError(error);
        return { id: (row as any)?.id };
    },

    async getMyGroups(ownerId: string) {
        const { data, error } = await supabase()
            .from('groups')
            .select('*')
            .eq('owner_id', ownerId)
            .order('created_at', { ascending: false });
        throwIfError(error);
        return (data || []).map((r: any) => ({ id: r.id, ownerId: r.owner_id, ...(r.data || {}), createdAt: r.created_at, updatedAt: r.updated_at }));
    },

    async deleteGroup(id: string) {
        const { error } = await supabase().from('groups').delete().eq('id', id);
        throwIfError(error);
    },

    async getUserProfile(uid: string) {
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
        };
    },

    async setUserProfile(uid: string, data: any) {
        const { role, name, email, markerCanchas } = data;
        const payload: any = {
            id: uid,
            role: role ?? 'player',
            name: name ?? '',
            marker_canchas: Array.isArray(markerCanchas) ? markerCanchas : [],
            updated_at: now(),
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

        const { error } = await supabase()
            .from('profiles')
            .upsert(payload, { onConflict: 'id' });
        if (error) {
            // Si el error es por columna inexistente, reintentamos sin email para no romper el sistema
            if (error.code === '42703') {
                console.warn('[dataService] La tabla profiles no tiene columna email o unique_code. Reintentando sin campos conflictivos.');
                const cleanPayload = { ...payload };
                delete cleanPayload.email;
                delete cleanPayload.unique_code;
                const { error: retryError } = await supabase()
                    .from('profiles')
                    .upsert(cleanPayload, { onConflict: 'id' });
                if (retryError) throw retryError;
            } else {
                throw error;
            }
        }
    },

    async listAllUsersProfile() {
        const { data, error } = await supabase().from('profiles').select('id, role, name, email, marker_canchas, created_at, updated_at');
        if (error) {
            // Si falla por la columna email, reintentamos sin ella
            if (error.code === '42703') {
                const { data: retryData, error: retryError } = await supabase().from('profiles').select('id, role, name, marker_canchas, created_at, updated_at');
                if (retryError) throw retryError;
                return (retryData || []).map((r: any) => ({
                    uid: r.id,
                    role: r.role,
                    name: r.name,
                    email: null,
                    markerCanchas: r.marker_canchas,
                    createdAt: r.created_at,
                    updatedAt: r.updated_at,
                }));
            }
            throw error;
        }
        return (data || []).map((r: any) => ({
            uid: r.id,
            role: r.role,
            name: r.name,
            email: r.email,
            markerCanchas: r.marker_canchas,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
        }));
    },

    async getUserByUniqueCode(code: string) {
        const cleanedCode = code.trim().toUpperCase().replace(/\s/g, '');
        if (!/^[A-Z0-9]{6}$/.test(cleanedCode)) return null;

        try {
            const authHeaders = await getAuthHeaders();
            if (authHeaders.Authorization) {
                const res = await fetch(
                    `/api/resolve-player-code?code=${encodeURIComponent(cleanedCode)}`,
                    { headers: authHeaders }
                );
                if (res.ok) return await res.json();
                if (res.status === 404 || res.status === 400) return null;
            }
        } catch {
            /* fallback abajo */
        }

        const { data, error } = await supabase()
            .from('profiles')
            .select('id, name, email')
            .eq('unique_code', cleanedCode)
            .single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    },

    /** Obtiene nombre completo para mostrar: prioriza ficha del jugador (participants name+lastName) para que en grupos, grilla y pizarra aparezca "Nombre Apellido" de A y de B; si no hay ficha, usa profiles.name */
    async getDisplayNameForUser(userId: string): Promise<string> {
        const db = supabase();
        const { data: participants } = await db.from('participants').select('data').eq('owner_id', userId).limit(1);
        const d = participants?.[0]?.data as { name?: string; lastName?: string } | undefined;
        if (d) {
            const full = [d.name, d.lastName].filter(Boolean).join(' ').trim();
            if (full) return full;
        }
        const { data: profile } = await db.from('profiles').select('name').eq('id', userId).single();
        const fromProfile = (profile?.name || '').trim();
        return fromProfile || '';
    },

    async createTeamInvitation(
        tournamentId: string,
        category: string,
        playerAId: string,
        playerBId: string,
        tournamentTeamId?: string | null,
    ) {
        if (playerAId === playerBId) throw new Error('No puedes invitarte a ti mismo.');

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 2);

        const row: Record<string, unknown> = {
            tournament_id: tournamentId,
            category: category,
            player_a_id: playerAId,
            player_b_id: playerBId,
            status: 'pending',
            expires_at: expiresAt.toISOString(),
            created_at: now(),
            updated_at: now(),
        };
        if (tournamentTeamId != null && tournamentTeamId !== '') {
            row.tournament_team_id = tournamentTeamId;
        }

        let { data, error } = await supabase()
            .from('teams')
            .insert(row)
            .select()
            .single();

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
                message: `¡Tienes un lugar reservado! Acepta antes de que expire el tiempo para asegurar tu participación en el torneo.`,
            });
        } catch (nError) {
            console.error('[dataService] Error sending notification:', nError);
        }

        return data;
    },

    async sendNotification(notif: { user_id: string; sender_id: string; team_id: string; type: string; message: string }) {
        const { error } = await supabase()
            .from('notifications')
            .insert({
                ...notif,
                is_read: false,
                created_at: now(),
            });
        if (error) {
            // Log error but don't crash the main flow
            console.error('[dataService] Error inserting notification (check if table notifications exists):', error);
        }
    },

    async getOccupiedSlots(tournamentId: string, category: string) {
        const currentTime = new Date().toISOString();

        // Contamos equipos aceptados + los pendientes que no han expirado
        // Nota: Si la columna expires_at es nula, se asume que no expira (o se maneja según lógica)
        const { data, error } = await supabase()
            .from('teams')
            .select('id, status, expires_at')
            .eq('tournament_id', tournamentId)
            .eq('category', category);

        throwIfError(error);

        const occupied = (data || []).filter(t => {
            if (t.status === 'accepted') return true;
            if (t.status === 'pending') {
                if (!t.expires_at) return true; // Si no tiene fecha, lo contamos como pendiente eterno (si aplica)
                return new Date(t.expires_at) > new Date();
            }
            return false;
        });

        return occupied.length;
    },

    async getMyInvitations(userId: string) {
        const { data, error } = await supabase()
            .from('teams')
            .select(`
                *,
                player_a:profiles!player_a_id(name),
                tournaments(id, data)
            `)
            .eq('player_b_id', userId)
            .eq('status', 'pending');

        throwIfError(error);
        return (data || []).map((inv: any) => ({
            ...inv,
            tournament_name: inv.tournaments?.data?.name || 'Torneo Sin Nombre',
            inviter_name: inv.player_a?.name || 'Jugador'
        }));
    },

    async getAllRegistrationCounts(): Promise<Record<string, number>> {
        const { data, error } = await supabase()
            .from('teams')
            .select('tournament_id, status, expires_at');

        throwIfError(error);

        const counts: Record<string, number> = {};
        const now = new Date();
        (data || []).forEach(t => {
            const isAccepted = t.status === 'accepted';
            const isPendingValid = t.status === 'pending' && (!t.expires_at || new Date(t.expires_at) > now);

            if (isAccepted || isPendingValid) {
                counts[t.tournament_id] = (counts[t.tournament_id] || 0) + 1;
            }
        });

        return counts;
    },

    async respondToInvitation(teamId: string, status: 'accepted' | 'rejected') {
        if (status === 'rejected') {
            const { error } = await supabase()
                .from('teams')
                .delete()
                .eq('id', teamId);
            throwIfError(error);
        } else {
            // Verificar si ha expirado antes de aceptar
            const { data: team, error: fetchError } = await supabase()
                .from('teams')
                .select('id, expires_at, status, tournament_id, category, player_a_id, player_b_id, tournament_team_id')
                .eq('id', teamId)
                .single();

            if (fetchError || !team) {
                throw new Error('La reserva ha expirado o no existe, pide a tu compañero que te invite de nuevo.');
            }

            if (team.status === 'pending' && team.expires_at && new Date(team.expires_at) < new Date()) {
                // Borrar automáticamente el equipo expirado
                await supabase().from('teams').delete().eq('id', teamId);
                throw new Error('La reserva ha expirado, pide a tu compañero que te invite de nuevo.');
            }

            const { error } = await supabase()
                .from('teams')
                .update({ status: 'accepted', updated_at: now() })
                .eq('id', teamId);
            throwIfError(error);

            // Sincronizar nombres en el torneo (rellenar pareja completa en la categoría/grupo)
            try {
                if (team.tournament_id && team.category && team.player_a_id && team.player_b_id) {
                    const p1Name = (await this.getDisplayNameForUser(team.player_a_id)) || 'Jugador A';
                    const p2Name = (await this.getDisplayNameForUser(team.player_b_id)) || 'Jugador B';
                    const tournamentTeamIdHint = (team as any).tournament_team_id != null && (team as any).tournament_team_id !== ''
                        ? String((team as any).tournament_team_id)
                        : undefined;

                    const updatedTeamId = await this.assignPlayersToTournament(
                        team.tournament_id,
                        team.category,
                        p1Name,
                        p2Name,
                        tournamentTeamIdHint ?? null,
                    );

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
                            message: `Tu compañero ha aceptado la invitación en la categoría ${team.category}.`,
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

    async getSentInvitations(tournamentId: string, playerAId: string) {
        const { data, error } = await supabase()
            .from('teams')
            .select(`
                *,
                player_b:profiles!player_b_id(name)
            `)
            .eq('tournament_id', tournamentId)
            .eq('player_a_id', playerAId)
            .eq('status', 'pending');

        throwIfError(error);
        return (data || []).map((inv: any) => ({
            ...inv,
            partner_name: inv.player_b?.name || 'Jugador'
        }));
    },

    /**
     * Sincroniza en el torneo todas las parejas que ya aceptaron la invitación (status = 'accepted').
     * Actualiza tournament.teams y categories para que la grilla de grupos muestre ambos jugadores.
     */
    async syncAcceptedTeamsToTournament(tournamentId: string): Promise<{ synced: number; errors: string[] }> {
        const { data: acceptedTeams, error } = await supabase()
            .from('teams')
            .select('id, tournament_id, category, player_a_id, player_b_id, tournament_team_id')
            .eq('tournament_id', tournamentId)
            .eq('status', 'accepted');

        throwIfError(error);
        if (!acceptedTeams?.length) return { synced: 0, errors: [] };

        const errors: string[] = [];
        let synced = 0;

        for (const row of acceptedTeams) {
            if (!row.category || !row.player_a_id || !row.player_b_id) {
                errors.push(`Equipo ${row.id}: faltan category o jugadores.`);
                continue;
            }
            const p1Name = (await this.getDisplayNameForUser(row.player_a_id)) || 'Jugador A';
            const p2Name = (await this.getDisplayNameForUser(row.player_b_id)) || 'Jugador B';
            const teamIdHint = (row as any).tournament_team_id != null ? String((row as any).tournament_team_id) : undefined;
            try {
                const updatedTeamId = await this.assignPlayersToTournament(tournamentId, row.category, p1Name, p2Name, teamIdHint ?? null);
                if (updatedTeamId) {
                    try {
                        await this.assignTeamToGroup(tournamentId, updatedTeamId);
                    } catch (_) {}
                }
                synced++;
            } catch (err: any) {
                errors.push(`Equipo ${row.id} (${p1Name} / ${p2Name}): ${err?.message || String(err)}`);
            }
        }

        return { synced, errors };
    },

    async removePasswordsFromAllUsers(): Promise<number> {
        return 0;
    },

    async createAd(data: any, ownerId: string) {
        const sanitized = sanitizeObject(data);
        const { data: row, error } = await supabase()
            .from('ads')
            .insert({ owner_id: ownerId, data: sanitized, created_at: now(), updated_at: now() })
            .select('id')
            .single();
        throwIfError(error);
        return { id: (row as any)?.id };
    },

    async getAds() {
        const { data, error } = await supabase().from('ads').select('*').order('created_at', { ascending: false });
        throwIfError(error);
        return (data || []).map((r: any) => ({ id: r.id, ownerId: r.owner_id, ...(r.data || {}), createdAt: r.created_at, updatedAt: r.updated_at }));
    },

    async deleteAd(id: string) {
        const { error } = await supabase().from('ads').delete().eq('id', id);
        throwIfError(error);
    },

    async uploadFile(file: File, path: string, bucketName?: string) {
        const preferred = bucketName ||
            (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim()) ||
            'patrocinantes';

        const bucketsToTry = [preferred];
        // If preferred is not 'inscripciones', try it too for receipts if relevant
        if (preferred !== 'inscripciones') bucketsToTry.push('inscripciones');
        // Final fallback to public
        if (!bucketsToTry.includes('public')) bucketsToTry.push('public');

        let lastError: any = null;

        for (const bucket of bucketsToTry) {
            try {
                const { data, error } = await supabase().storage.from(bucket).upload(path, file, { upsert: true });
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

    async getAdminSettings(): Promise<AdminSettings | null> {
        try {
            const c = getSupabaseClient();
            if (!c) return null;
            const { data, error } = await c.from('admin_settings').select('*').eq('id', 1).maybeSingle();
            if (error || !data) return null;
            return {
                appTitle: data.app_title,
                clubName: data.club_name,
                timezone: data.timezone,
                updatedAt: data.updated_at,
            };
        } catch (e) {
            console.warn('[dataService] Error al obtener admin_settings (posiblemente la tabla no existe):', e);
            return null;
        }
    },

    async setAdminSettings(data: Partial<AdminSettings>): Promise<void> {
        const c = getSupabaseClient();
        if (!c) return;
        await c.from('admin_settings').update({
            app_title: sanitizeString(data.appTitle),
            club_name: sanitizeString(data.clubName),
            timezone: sanitizeString(data.timezone),
            updated_at: now(),
        }).eq('id', 1);
    },

    async addInscription(data: InscriptionData, ownerId: string) {
        const { data: row, error } = await supabase()
            .from('inscriptions')
            .insert({
                owner_id: ownerId,
                tournament_id: data.tournamentId || null,
                tournament_name: sanitizeString(data.tournamentName),
                category_key: sanitizeString(data.categoryKey),
                category_price: data.categoryPrice,
                participant_name: sanitizeString(data.participantName),
                participant_email: sanitizeString(data.participantEmail),
                participant_id: data.participantId,
                amount_extracted: data.amountExtracted,
                receipt_url: data.receiptUrl,
                payment_status: data.paymentStatus ?? 'pending',
                alert_message: sanitizeString(data.alertMessage),
                data: sanitizeObject({
                    paymentMethod: data.paymentMethod,
                    paymentDate: data.paymentDate,
                    paymentBank: data.paymentBank,
                    paymentAmount: data.paymentAmount,
                    paymentReference: data.paymentReference,
                    partnerId: data.partnerId,
                    partnerName: data.partnerName,
                }),
                created_at: now(),
                updated_at: now(),
            })
            .select('id')
            .single();
        throwIfError(error);
        return { id: (row as any)?.id };
    },

    /**
     * Sincroniza automáticamente los equipos (teams) de un torneo a partir de una inscripción.
     * Reemplaza el siguiente slot libre (placeholder "Jugador X") con los nombres reales del jugador/pareja.
     * Devuelve el id del equipo del torneo actualizado para enlazarlo con la invitación (código del compañero).
     */
    async syncTeamsFromInscription(
        tournamentId: string,
        participant: { id: string; name: string; lastName?: string },
        partner?: { id: string; name: string; lastName?: string } | null,
    ): Promise<string | null> {
        const tournament = await this.getTournament(tournamentId);
        if (!tournament) return null;

        const teams = Array.isArray(tournament.teams) ? [...tournament.teams] : [];
        if (teams.length === 0) return null;

        const isPlaceholderPlayer = (p: any) =>
            !!p &&
            typeof p.name === 'string' &&
            p.name.toLowerCase().startsWith('jugador ');

        // Buscar el primer equipo cuyo p1 siga siendo un placeholder
        let slotIndex = teams.findIndex(team => !team.p1 || isPlaceholderPlayer(team.p1));
        if (slotIndex === -1) {
            return null;
        }

        const fullName = `${participant.name} ${participant.lastName || ''}`.trim();
        const partnerFullName = partner
            ? `${partner.name} ${partner.lastName || ''}`.trim()
            : '';

        const team = teams[slotIndex] || {};
        const updatedTeamId = team.id ?? null;

        const updatedTeam: any = {
            ...team,
            p1: {
                id: participant.id,
                name: fullName || participant.name,
            },
            p2: partner
                ? {
                    id: partner.id,
                    name: partnerFullName || partner.name,
                }
                : team.p2,
        };

        teams[slotIndex] = updatedTeam;

        await this.updateTournament(tournamentId, {
            ...tournament,
            teams,
            updatedAt: now(),
        });
        return updatedTeamId != null ? String(updatedTeamId) : null;
    },

    /** Próximo partido del usuario (hoy o futuro): inscripciones por participant_id → partidos donde juega → filtro por fecha hoy. */
    async getNextMatchForUser(userId: string): Promise<{ tournamentId: string; matchId: string; scheduledTime?: string; team1Name?: string; team2Name?: string; tournamentName?: string } | null> {
        const participants = await this.getMyParticipants(userId);
        const participantId = participants?.[0]?.id;
        if (!participantId) return null;
        const { data: inscr } = await supabase().from('inscriptions').select('tournament_id').eq('participant_id', participantId);
        const tournamentIds = [...new Set((inscr || []).map((r: any) => r.tournament_id).filter(Boolean))];
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);
        let best: { tournamentId: string; matchId: string; scheduledTime?: string; team1Name?: string; team2Name?: string; tournamentName?: string; at: number } | null = null;
        for (const tid of tournamentIds) {
            const matches = await this.getMatches(tid);
            const tournament = await this.getTournament(tid);
            const tournamentName = (tournament as any)?.name ?? '';
            for (const m of matches) {
                const d = m as any;
                const st = d.scheduledTime ? new Date(d.scheduledTime).getTime() : 0;
                if (st < todayStart.getTime() || st >= todayEnd.getTime()) continue;
                const ids = [d.team1?.p1?.id, d.team1?.p2?.id, d.team2?.p1?.id, d.team2?.p2?.id].filter(Boolean);
                if (!ids.includes(participantId)) continue;
                if (!best || st < best.at) {
                    best = {
                        tournamentId: tid,
                        matchId: d.id ?? m.id,
                        scheduledTime: d.scheduledTime,
                        team1Name: d.team1Name ?? (d.team1?.p1?.name ? [d.team1.p1.name, d.team1.p2?.name].filter(Boolean).join(' / ') : 'TBD'),
                        team2Name: d.team2Name ?? (d.team2?.p1?.name ? [d.team2.p1.name, d.team2.p2?.name].filter(Boolean).join(' / ') : 'TBD'),
                        tournamentName,
                        at: st,
                    };
                }
            }
        }
        return best ? { tournamentId: best.tournamentId, matchId: best.matchId, scheduledTime: best.scheduledTime, team1Name: best.team1Name, team2Name: best.team2Name, tournamentName: best.tournamentName } : null;
    },

    async getInscriptionsByTournament(tournamentId: string) {
        const { data, error } = await supabase()
            .from('inscriptions')
            .select('*')
            .eq('tournament_id', tournamentId);
        throwIfError(error);
        return (data || []).map((r: any) => ({
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
            updatedAt: r.updated_at,
        }));
    },

    async getAllInscriptions() {
        const { data, error } = await supabase()
            .from('inscriptions')
            .select('*')
            .order('created_at', { ascending: false });
        throwIfError(error);
        return (data || []).map((r: any) => ({
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
            updatedAt: r.updated_at,
        }));
    },

    async getInscriptionById(id: string) {
        if (!isValidInscriptionId(id)) return null;
        const { data, error } = await supabase()
            .from('inscriptions')
            .select('*')
            .eq('id', id.trim())
            .maybeSingle();
        throwIfError(error);
        if (!data) return null;
        const r = data as any;
        return {
            id: r.id,
            tournamentId: r.tournament_id,
            tournamentName: r.tournament_name,
            categoryKey: r.category_key,
            participantName: r.participant_name,
            partnerName: r.data?.partnerName ?? null,
            partnerId: r.data?.partnerId ?? null,
            paymentStatus: r.payment_status,
            inscriptionStatus: (r.inscription_status as string) ?? 'NORMAL',
        };
    },

    /**
     * Invitado (partnerId en data) confirma una inscripción RESERVED.
     * Acepta la invitación en `teams` si existe fila pending asociada, luego marca CONFIRMED y devuelve la fila actualizada.
     */
    async confirmReservedTeam(inscriptionId: string): Promise<{
        id: string;
        ownerId: string;
        tournamentId: string | null;
        tournamentName: string | null;
        tournamentLiveName: string | null;
        player1Name: string | null;
        player1Email: string | null;
        categoryKey: string | null;
        participantName: string | null;
        inscriptionStatus: string;
        paymentStatus: string;
        data: Record<string, unknown>;
        updatedAt: string;
        confirmedAt: string | null;
    }> {
        const cleanId = inscriptionId?.trim() ?? '';
        if (!isValidInscriptionId(cleanId)) {
            throw new Error('El enlace de confirmación no es válido.');
        }

        const db = supabase();
        const { data: { user } } = await db.auth.getUser();
        if (!user?.id) {
            throw new Error('Debes iniciar sesión para confirmar tu lugar.');
        }

        const { data: ins, error: fetchErr } = await db
            .from('inscriptions')
            .select('*, tournament:tournaments(name), player1:participants!player1_id(name, email)')
            .eq('id', cleanId)
            .maybeSingle();

        if (fetchErr) throw fetchErr;
        if (!ins) {
            throw new Error('No encontramos esta inscripción.');
        }

        const row = ins as any;
        const status = String(row.inscription_status ?? 'NORMAL').toUpperCase();
        if (status !== 'RESERVED') {
            if (status === 'CONFIRMED') {
                throw new Error('Este lugar ya fue confirmado.');
            }
            throw new Error('Esta inscripción no está pendiente de tu confirmación.');
        }

        const dataObj = (row.data ?? {}) as Record<string, unknown>;
        const partnerId =
            row.partner_id != null
                ? String(row.partner_id)
                : dataObj.partnerId != null
                    ? String(dataObj.partnerId)
                    : '';
        if (partnerId !== user.id) {
            throw new Error('Tu cuenta no coincide con el invitado de esta reserva.');
        }

        const tournamentId = row.tournament_id as string | null;
        const categoryKey = row.category_key as string | null;
        const ownerId = String(row.owner_id);

        if (tournamentId && categoryKey) {
            const { data: team } = await db
                .from('teams')
                .select('id, status')
                .eq('tournament_id', tournamentId)
                .eq('category', categoryKey)
                .eq('player_a_id', ownerId)
                .eq('player_b_id', user.id)
                .maybeSingle();

            if (team?.id && (team as any).status === 'pending') {
                await this.respondToInvitation(String(team.id), 'accepted');
            }
        }

        const ts = now();
        let updated: any = null;

        // Intento principal (especificación solicitada): status + embed tournament/player1.
        const primary = await db
            .from('inscriptions')
            .update({
                status: 'CONFIRMED',
                confirmed_at: ts,
                updated_at: ts,
            } as any)
            .eq('id', cleanId)
            .select('*, tournament:tournaments(name), player1:participants!player1_id(name, email)')
            .single();

        if (primary.error) {
            // Fallback para esquemas existentes del proyecto (inscription_status / participant_name / tournament_name).
            const fb = await db
                .from('inscriptions')
                .update({
                    inscription_status: 'CONFIRMED',
                    confirmed_at: ts,
                    updated_at: ts,
                } as any)
                .eq('id', cleanId)
                .eq('inscription_status', 'RESERVED')
                .select('*')
                .single();
            if (fb.error) throw fb.error;
            updated = fb.data as any;
        } else {
            updated = primary.data as any;
        }

        if (!updated) {
            throw new Error('No se pudo actualizar la inscripción (quizá ya fue confirmada).');
        }

        const u = updated as any;
        const tournamentNameFromEmbed =
            u?.tournament?.name != null && String(u.tournament.name).trim() !== ''
                ? String(u.tournament.name).trim()
                : null;
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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: ownerEmail,
                        hostName: player1Name,
                        guestName: guestNameForEmail,
                        tournamentName: tournamentForEmail,
                    }),
                }).catch((err) => console.warn('[dataService] partner-confirmed-email warning:', err));
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
            data: (u.data ?? {}) as Record<string, unknown>,
            updatedAt: u.updated_at ?? ts,
            confirmedAt: u.confirmed_at ?? ts,
        };
    },

    async getInscriptionsWithAlerts() {
        const { data, error } = await supabase()
            .from('inscriptions')
            .select('*')
            .eq('payment_status', 'alert');
        throwIfError(error);
        return (data || []).map((r: any) => ({
            id: r.id,
            tournamentId: r.tournament_id,
            paymentStatus: r.payment_status,
            alertMessage: r.alert_message,
            ...r,
        }));
    },

    async updateInscription(id: string, data: Partial<InscriptionData>) {
        const upd: any = { updated_at: now() };
        if (data.paymentStatus != null) upd.payment_status = data.paymentStatus;
        if (data.alertMessage !== undefined) upd.alert_message = data.alertMessage ?? null;
        if (data.receiptUrl != null) upd.receipt_url = data.receiptUrl;
        const { error } = await supabase().from('inscriptions').update(upd).eq('id', id);
        throwIfError(error);
    },

    /**
     * Vincula una pareja manual (desde admin) al placeholder de inscripción con el mismo label.
     * Usa participant_id para jugador 1 y data.partnerId para jugador 2.
     */
    async replacePlaceholderInscriptionByLabel(
        tournamentId: string,
        placeholderLabel: string,
        player1: { id: string; fullName: string; email?: string | null },
        player2: { id: string; fullName: string; email?: string | null },
        categoryKey?: string
    ): Promise<string | null> {
        const db = supabase();
        let query = db
            .from('inscriptions')
            .select('id, data')
            .eq('tournament_id', tournamentId)
            .eq('participant_name', placeholderLabel)
            // En algunos proyectos el flag `is_placeholder` no existe en la tabla.
            // Los placeholders se distinguen por tener `participant_id` = null.
            .is('participant_id', null)
            .order('created_at', { ascending: true })
            .limit(1);
        if (categoryKey) query = query.eq('category_key', categoryKey);

        const { data: placeholder, error: searchError } = await query.maybeSingle();
        if (searchError) throw searchError;
        if (!placeholder) return null;

        const oldData = (placeholder as any).data ?? {};
        const mergedData = sanitizeObject({
            ...oldData,
            partnerId: player2.id,
            partnerName: player2.fullName,
            player1_id: player1.id,
            player2_id: player2.id,
            player1_email: player1.email ?? null,
            player2_email: player2.email ?? null,
        });

        const { error: updateError } = await db
            .from('inscriptions')
            .update({
                participant_name: sanitizeString(`${player1.fullName} / ${player2.fullName}`),
                participant_email: sanitizeString(player1.email ?? null),
                participant_id: player1.id,
                payment_status: 'paid',
                data: mergedData,
                updated_at: now(),
            })
            .eq('id', (placeholder as any).id);
        if (updateError) throw updateError;
        return (placeholder as any).id as string;
    },

    subscribeToTournament(id: string, callback: (t: any) => void) {
        const db = supabase();

        // Initial fetch
        this.getTournament(id).then(callback);

        const channel = db
            .channel(`tournament_${id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments', filter: `id=eq.${id}` }, (payload) => {
                const r = payload.new as any;
                if (!r) return;
                callback({ id: r.id, ownerId: r.owner_id, ...r.data, createdAt: r.created_at, updatedAt: r.updated_at });
            })
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    },

    subscribeToMatches(tournamentId: string, callback: (matches: any[]) => void) {
        const db = supabase();

        // Initial load
        this.getMatches(tournamentId).then(callback);

        const channel = db
            .channel(`matches_${tournamentId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_matches', filter: `tournament_id=eq.${tournamentId}` }, async () => {
                // On update, reload all matches for simplicity and to ensure order/enrichment
                const matches = await this.getMatches(tournamentId);
                callback(matches);
            })
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    },

    async getAnimations(type?: string) {
        let query = supabase().from('match_animations').select('*').eq('is_active', true);
        if (type) query = query.eq('type', type);
        const { data, error } = await query;
        throwIfError(error);
        return data || [];
    },

    /** Sustituye RTDB: animaciones del marcador (botones en pizarra). Upsert en match_animations con type 'animaciones_marcador'. */
    async setAnimacionMarcador(animId: string, data: { nombre: string; url: string } | null): Promise<void> {
        try {
            if (!data) {
                await supabase().from('match_animations').update({ is_active: false }).eq('id', animId);
                return;
            }
            await supabase().from('match_animations').upsert(
                { id: animId, type: 'animaciones_marcador', name: data.nombre, url: data.url, is_active: true, updated_at: now() },
                { onConflict: 'id' }
            );
        } catch (e) {
            console.warn('[dataService] setAnimacionMarcador (tabla match_animations puede no existir o tener otro esquema):', e);
        }
    },

    async getSponsorsByTournament(tournamentId: string) {
        try {
            const { data, error } = await supabase()
                .from('sponsor_carousel')
                .select('*')
                .eq('tournament_id', tournamentId)
                .eq('is_active', true)
                .order('display_order', { ascending: true });

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

    async getLiveMatches() {
        try {
            const { data: tournaments, error: tError } = await supabase().from('tournaments').select('*');
            if (tError) throw tError;

            let allLiveMatches: any[] = [];

            for (const t of (tournaments || [])) {
                const { data: matches, error: mError } = await supabase()
                    .from('tournament_matches')
                    .select('*')
                    .eq('tournament_id', t.id);

                if (mError) continue;

                const live = (matches || []).filter((m: any) => {
                    const status = m.data?.status;
                    return status === 'WARM_UP' || status === 'IN_PROGRESS';
                }).map((m: any) => {
                    const tournament = { id: t.id, ...t.data };
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
                        t1Name: team1 ? (team1.p1?.name ? `${team1.p1.name} / ${team1.p2.name}` : team1.name) : 'TBD',
                        t2Name: team2 ? (team2.p1?.name ? `${team2.p1.name} / ${team2.p2.name}` : team2.name) : 'TBD',
                        primaryColor: tournament.broadcastingSettings?.primaryColor || '#ccff00',
                        bannerText: tournament.broadcastingSettings?.bannerText || 'SMART PADEL PRO TV'
                    };
                });

                allLiveMatches = [...allLiveMatches, ...live];
            }
            return allLiveMatches;
        } catch (e) {
            console.error('[dataService] getLiveMatches failed:', e);
            return [];
        }
    },

    subscribeToLiveMatches(callback: (matches: any[]) => void) {
        const db = supabase();
        
        // Initial load
        this.getLiveMatches().then(callback);

        const channel = db
            .channel('live_matches_global')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_matches' }, async () => {
                const matches = await this.getLiveMatches();
                callback(matches);
            })
            // Also listen to tournament changes (colors, names, etc)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, async () => {
                const matches = await this.getLiveMatches();
                callback(matches);
            })
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    },

    async getPaymentMethods() {
        const { data, error } = await supabase()
            .from('payment_methods')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: true });
        throwIfError(error);
        return data || [];
    },

    // ─── Pizarra / Cancha (reemplazo RTDB) ─────────────────────────────────────
    async getPizarraCanchaState(canchaId: string): Promise<{ cancha_id: string; data: any; updated_at: string } | null> {
        try {
            const { data, error } = await supabase()
                .from('pizarra_cancha_state')
                .select('cancha_id, data, updated_at')
                .eq('cancha_id', canchaId)
                .single();
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (e) {
            console.warn('[dataService] getPizarraCanchaState (tabla puede no existir):', e);
            return null;
        }
    },

    async setPizarraCanchaState(canchaId: string, data: Record<string, unknown>): Promise<void> {
        const db = supabase();
        const { error } = await db.from('pizarra_cancha_state').upsert(
            { cancha_id: canchaId, data, updated_at: now() },
            { onConflict: 'cancha_id' }
        );
        throwIfError(error);
    },

    subscribePizarraCanchaState(canchaId: string, callback: (state: { cancha_id: string; data: any } | null) => void): () => void {
        const db = supabase();
        this.getPizarraCanchaState(canchaId).then(callback);
        const channel = db
            .channel(`pizarra_${canchaId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'pizarra_cancha_state', filter: `cancha_id=eq.${canchaId}` }, (payload) => {
                const r = payload.new as any;
                callback(r ? { cancha_id: r.cancha_id, data: r.data || {} } : null);
            })
            .subscribe();
        return () => channel.unsubscribe();
    },
};

/**
 * Confirma una inscripción en estado RESERVED y notifica al anfitrión.
 * Maneja fallbacks de esquema (status vs inscription_status).
 */
export const confirmReservedTeam = async (inscriptionId: string) => {
    const db = supabase();

    const cleanId = (inscriptionId || '').trim();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(cleanId)) {
        throw new Error('El enlace de invitación no tiene un formato válido.');
    }

    const { data: { user }, error: authError } = await db.auth.getUser();
    if (authError || !user) throw new Error('Debes iniciar sesión para confirmar tu lugar.');

    const { data: inscription, error: fetchErr } = await db
        .from('inscriptions')
        .select('*, tournament:tournaments(name), player1:participants!player1_id(name, email)')
        .eq('id', cleanId)
        .single();

    if (fetchErr || !inscription) throw new Error('La invitación ya no está disponible.');

    const row = inscription as any;
    const partnerId = row.partner_id ?? row?.data?.partnerId ?? null;
    if (!partnerId || String(partnerId) !== user.id) {
        throw new Error('Esta invitación está dirigida a otro jugador.');
    }

    const currentStatus = String(row.inscription_status ?? row.status ?? '').toUpperCase();
    if (currentStatus === 'CONFIRMED') {
        return { alreadyConfirmed: true, ...row };
    }

    const ts = now();
    const updateData: Record<string, unknown> = { confirmed_at: ts, updated_at: ts };
    if (Object.prototype.hasOwnProperty.call(row, 'inscription_status')) {
        updateData.inscription_status = 'CONFIRMED';
    } else {
        updateData.status = 'CONFIRMED';
    }

    const { data: updated, error: updateErr } = await db
        .from('inscriptions')
        .update(updateData)
        .eq('id', cleanId)
        .select()
        .single();

    if (updateErr || !updated) {
        throw new Error('No se pudo procesar la confirmación. Intenta de nuevo.');
    }

    fetch('/api/partner-confirmed-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            to: row?.player1?.email,
            hostName: row?.player1?.name ?? null,
            guestName: (user.user_metadata as Record<string, unknown> | null)?.full_name || user.email?.split('@')[0] || 'Tu pareja',
            tournamentName: row?.tournament?.name ?? row.tournament_name ?? 'tu torneo',
        }),
    }).catch((err) => console.warn('Aviso al anfitrión falló (Email):', err));

    return updated;
};
