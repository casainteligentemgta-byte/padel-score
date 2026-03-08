import { getSupabaseClient } from './supabase/client';

const supabase = () => {
    const c = getSupabaseClient();
    if (!c) throw new Error('Supabase no configurado. Añade NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local');
    return c;
};

const now = () => new Date().toISOString();

export const ROLES = {
    ADMIN: 'admin',
    PLAYER: 'player',
    MARKER: 'marker',
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
};

export const dataService = {
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
        if (error) throw error;
        return { id: row.id };
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
        if (error) throw error;
    },

    async getMyTournaments(ownerId: string) {
        const { data, error } = await supabase()
            .from('tournaments')
            .select('*')
            .eq('owner_id', ownerId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map((r: any) => ({ id: r.id, ownerId: r.owner_id, ...(r.data || {}), createdAt: r.created_at, updatedAt: r.updated_at }));
    },

    async listAllTournaments() {
        const { data, error } = await supabase().from('tournaments').select('*').order('created_at', { ascending: false });
        if (error) throw error;
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
        if (error) throw error;
    },

    async getMatches(tournamentId: string) {
        const { data, error } = await supabase()
            .from('tournament_matches')
            .select('*')
            .eq('tournament_id', tournamentId);
        if (error) throw error;
        return (data || []).map((r: any) => ({ id: r.id, ownerId: r.owner_id, ...(r.data || {}), createdAt: r.created_at, updatedAt: r.updated_at }));
    },

    async updateMatch(tournamentId: string, matchId: string, data: any) {
        const { data: row } = await supabase()
            .from('tournament_matches')
            .select('data')
            .eq('tournament_id', tournamentId)
            .eq('id', matchId)
            .single();
        const merged = { ...(row?.data || {}), ...data };
        const { error } = await supabase()
            .from('tournament_matches')
            .update({ data: merged, updated_at: now() })
            .eq('tournament_id', tournamentId)
            .eq('id', matchId);
        if (error) throw error;
    },

    async deleteMatch(tournamentId: string, matchId: string) {
        const { error } = await supabase()
            .from('tournament_matches')
            .delete()
            .eq('tournament_id', tournamentId)
            .eq('id', matchId);
        if (error) throw error;
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
        if (error) throw error;
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
        if (error) throw error;
        return { id };
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
        const { data: row, error } = await supabase()
            .from('expenses')
            .insert({ owner_id: ownerId, data, created_at: now(), updated_at: now() })
            .select('id')
            .single();
        if (error) throw error;
        return { id: row.id };
    },

    async getMyExpenses(ownerId: string) {
        const { data, error } = await supabase()
            .from('expenses')
            .select('*')
            .eq('owner_id', ownerId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map((r: any) => ({ id: r.id, ownerId: r.owner_id, ...(r.data || {}), createdAt: r.created_at, updatedAt: r.updated_at }));
    },

    async addParticipant(data: any, ownerId: string) {
        const { data: row, error } = await supabase()
            .from('participants')
            .insert({ owner_id: ownerId, data, created_at: now(), updated_at: now() })
            .select('id')
            .single();
        if (error) throw error;
        return { id: row.id };
    },

    async getMyParticipants(ownerId: string) {
        const c = getSupabaseClient();
        if (!c) return [];
        const { data, error } = await c
            .from('participants')
            .select('*')
            .eq('owner_id', ownerId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map((r: any) => ({ id: r.id, ownerId: r.owner_id, ...(r.data || {}), createdAt: r.created_at, updatedAt: r.updated_at }));
    },

    async getAllParticipants() {
        const { data, error } = await supabase().from('participants').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map((r: any) => ({ id: r.id, ownerId: r.owner_id, ...(r.data || {}), createdAt: r.created_at, updatedAt: r.updated_at }));
    },

    async updateParticipant(id: string, data: any) {
        const { id: _id, ...rest } = data;
        const { data: row } = await supabase().from('participants').select('data').eq('id', id).single();
        const merged = { ...(row?.data || {}), ...rest };
        const { error } = await supabase()
            .from('participants')
            .update({ data: merged, updated_at: now() })
            .eq('id', id);
        if (error) throw error;
    },

    async getParticipant(id: string) {
        const { data, error } = await supabase().from('participants').select('*').eq('id', id).single();
        if (error || !data) return null;
        return { id: data.id, ...data.data, ownerId: data.owner_id, createdAt: data.created_at, updatedAt: data.updated_at };
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

            if (error) throw error;

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

            return {
                played,
                won,
                lost,
                streak: `${streak}${results[results.length - 1] ? 'W' : 'L'}`,
                effectiveness: `${effectiveness}%`,
                ranking: '#142', // Placeholder for now
            };
        } catch (e) {
            console.error('Error calculating player stats:', e);
            return null;
        }
    },

    async deleteParticipant(id: string) {
        const { error } = await supabase().from('participants').delete().eq('id', id);
        if (error) throw error;
    },

    async addGroup(data: any, ownerId: string) {
        const { data: row, error } = await supabase()
            .from('groups')
            .insert({ owner_id: ownerId, data, created_at: now(), updated_at: now() })
            .select('id')
            .single();
        if (error) throw error;
        return { id: row.id };
    },

    async getMyGroups(ownerId: string) {
        const { data, error } = await supabase()
            .from('groups')
            .select('*')
            .eq('owner_id', ownerId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map((r: any) => ({ id: r.id, ownerId: r.owner_id, ...(r.data || {}), createdAt: r.created_at, updatedAt: r.updated_at }));
    },

    async deleteGroup(id: string) {
        const { error } = await supabase().from('groups').delete().eq('id', id);
        if (error) throw error;
    },

    async getUserProfile(uid: string) {
        const { data, error } = await supabase().from('profiles').select('*').eq('id', uid).single();
        if (error || !data) return null;
        return {
            role: data.role,
            name: data.name,
            email: data.email || null,
            markerCanchas: data.marker_canchas || [],
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

        const { error } = await supabase()
            .from('profiles')
            .upsert(payload, { onConflict: 'id' });
        if (error) {
            // Si el error es por columna inexistente, reintentamos sin email para no romper el sistema
            if (error.code === '42703') {
                console.warn('[dataService] La tabla profiles no tiene columna email. Reintentando sin email.');
                delete payload.email;
                const { error: retryError } = await supabase()
                    .from('profiles')
                    .upsert(payload, { onConflict: 'id' });
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

    async removePasswordsFromAllUsers(): Promise<number> {
        return 0;
    },

    async createAd(data: any, ownerId: string) {
        const { data: row, error } = await supabase()
            .from('ads')
            .insert({ owner_id: ownerId, data, created_at: now(), updated_at: now() })
            .select('id')
            .single();
        if (error) throw error;
        return { id: row.id };
    },

    async getAds() {
        const { data, error } = await supabase().from('ads').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map((r: any) => ({ id: r.id, ownerId: r.owner_id, ...(r.data || {}), createdAt: r.created_at, updatedAt: r.updated_at }));
    },

    async deleteAd(id: string) {
        const { error } = await supabase().from('ads').delete().eq('id', id);
        if (error) throw error;
    },

    async uploadFile(file: File, path: string) {
        const preferred = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim()) || 'public';
        const bucketsToTry = [preferred];
        if (preferred !== 'public') bucketsToTry.push('public');

        for (const bucket of bucketsToTry) {
            const { data, error } = await supabase().storage.from(bucket).upload(path, file, { upsert: true });
            if (!error) {
                const { data: urlData } = supabase().storage.from(bucket).getPublicUrl(data.path);
                return urlData.publicUrl;
            }
            const isNotFound = (error.message || '').toLowerCase().includes('not found') || (error.message || '').toLowerCase().includes('bucket');
            if (!isNotFound || bucket === bucketsToTry[bucketsToTry.length - 1]) {
                throw new Error(`[Storage] ${error.message || String(error)} (bucket: "${bucket}")`);
            }
        }
        throw new Error('[Storage] Bucket not found');
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
            app_title: data.appTitle,
            club_name: data.clubName,
            timezone: data.timezone,
            updated_at: now(),
        }).eq('id', 1);
    },

    async addInscription(data: InscriptionData, ownerId: string) {
        const { data: row, error } = await supabase()
            .from('inscriptions')
            .insert({
                owner_id: ownerId,
                tournament_id: data.tournamentId || null,
                tournament_name: data.tournamentName,
                category_key: data.categoryKey,
                category_price: data.categoryPrice,
                participant_name: data.participantName,
                participant_email: data.participantEmail,
                participant_id: data.participantId,
                amount_extracted: data.amountExtracted,
                receipt_url: data.receiptUrl,
                payment_status: data.paymentStatus ?? 'pending',
                alert_message: data.alertMessage,
                data: {
                    paymentMethod: data.paymentMethod,
                    paymentDate: data.paymentDate,
                    paymentBank: data.paymentBank,
                    paymentAmount: data.paymentAmount,
                    paymentReference: data.paymentReference,
                },
                created_at: now(),
                updated_at: now(),
            })
            .select('id')
            .single();
        if (error) throw error;
        return { id: row.id };
    },

    async getInscriptionsByTournament(tournamentId: string) {
        const { data, error } = await supabase()
            .from('inscriptions')
            .select('*')
            .eq('tournament_id', tournamentId);
        if (error) throw error;
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
            createdAt: r.created_at,
            updatedAt: r.updated_at,
        }));
    },

    async getInscriptionsWithAlerts() {
        const { data, error } = await supabase()
            .from('inscriptions')
            .select('*')
            .eq('payment_status', 'alert');
        if (error) throw error;
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
        if (data.alertMessage != null) upd.alert_message = data.alertMessage;
        if (data.receiptUrl != null) upd.receipt_url = data.receiptUrl;
        const { error } = await supabase().from('inscriptions').update(upd).eq('id', id);
        if (error) throw error;
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
        if (error) throw error;
        return data || [];
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
                    return status === 'LIVE' || status === 'IN_PROGRESS' || status === 'STARTED';
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
    }
};
