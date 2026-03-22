import { useState, useEffect, useCallback } from 'react';
import { dataService } from '@/lib/dataService';
import { MatchStatus, Tournament } from '@/types/tournament';

// ── Types ──────────────────────────────────────────────────────────────────
export interface RealtimeTeam {
    name: string;
    p1Name?: string;
    p2Name?: string;
    photo1?: string | null;
    photo2?: string | null;
    isTBD?: boolean;
    teamLabel?: string;
}

export interface RealtimeMatch {
    id: string;
    tournamentId?: string;
    status: string;
    court?: string | number;
    courtIndex?: number;
    stage?: string;
    groupName?: string;
    scheduledTime?: any;
    team1Index?: number;
    team2Index?: number;
    team1: RealtimeTeam;
    team2: RealtimeTeam;
    sets?: any;
    games?: any;
    points?: any;
    server?: any;
    actualStartTime?: any;
    actualEndTime?: any;
    [key: string]: any;
}

export interface RealtimeTournament {
    id: string;
    name: string;
    category?: string;
    gender?: string;
    status?: string;
    complexName?: string;
    broadcastingSettings?: {
        primaryColor?: string;
        adMediaUrls?: string[];
        adImageUrls?: string[];
    };
}

interface UseMatchRealtimeReturn {
    match: RealtimeMatch | null;
    tournament: RealtimeTournament | null;
    allMatches: RealtimeMatch[];
    loading: boolean;
    error: string | null;
    updateMatch: (fields: Partial<RealtimeMatch>) => Promise<void>;
    updateTournament: (fields: Partial<Tournament>) => Promise<void>;
}

// ── Sanitization & Mapping (Supabase) ────────────────────────────────────────

function sanitizeTournament(id: string, data: any): RealtimeTournament {
    return {
        id,
        name: data?.name || 'Torneo',
        category: typeof data?.category === 'string' ? data.category : undefined,
        gender: typeof data?.gender === 'string' ? data.gender : undefined,
        status: typeof data?.status === 'string' ? data.status : undefined,
        complexName: typeof data?.complexName === 'string' ? data.complexName : undefined,
        broadcastingSettings: data?.broadcastingSettings ? {
            primaryColor: data.broadcastingSettings.primaryColor,
            adMediaUrls: Array.isArray(data.broadcastingSettings.adMediaUrls) ? data.broadcastingSettings.adMediaUrls : [],
            adImageUrls: Array.isArray(data.broadcastingSettings.adImageUrls) ? data.broadcastingSettings.adImageUrls : [],
        } : undefined,
    };
}

function resolveTeam(mTeam: any, teamIdx: number, teams?: any[]): RealtimeTeam {
    if (mTeam && (mTeam.p1 || mTeam.p1Name || mTeam.isTBD || mTeam.teamLabel)) {
        if (mTeam.isTBD || mTeam.teamLabel) {
            return {
                name: mTeam.teamLabel || mTeam.p1?.name || '?',
                isTBD: true,
                teamLabel: mTeam.teamLabel
            };
        }
        const p1n = (mTeam.p1Name || mTeam.p1?.name || '').trim();
        const p2n = (mTeam.p2Name || mTeam.p2?.name || '').trim();
        return {
            name: [p1n, p2n].filter(Boolean).join(' · ') || '?',
            p1Name: p1n,
            p2Name: p2n,
            photo1: mTeam.p1?.photo || null,
            photo2: mTeam.p2?.photo || null,
        };
    }
    const t = (teamIdx > 0 && Array.isArray(teams)) ? teams[teamIdx - 1] : null;
    if (!t) return { name: teamIdx > 0 ? `Pareja ${teamIdx}` : '?' };
    const p1n = t.p1?.name?.trim() || `J${(teamIdx * 2) - 1}`;
    const p2n = t.p2?.name?.trim() || `J${teamIdx * 2}`;
    return {
        name: `${p1n} · ${p2n}`,
        p1Name: p1n,
        p2Name: p2n,
        photo1: t.p1?.photo || null,
        photo2: t.p2?.photo || null,
    };
}

function sanitizeMatch(m: any, idx: number, tournamentId: string, teams?: any[]): RealtimeMatch {
    const matchId = m.id || `match_${idx}`;
    return {
        id: matchId,
        tournamentId,
        status: m.status || MatchStatus.PENDING,
        court: m.court ?? (m.courtIndex !== undefined ? m.courtIndex + 1 : undefined),
        courtIndex: m.courtIndex,
        stage: m.stage,
        groupName: m.groupName,
        scheduledTime: m.scheduledTime,
        team1Index: m.team1Index ?? 0,
        team2Index: m.team2Index ?? 0,
        team1: resolveTeam(m.team1, m.team1Index ?? 0, teams),
        team2: resolveTeam(m.team2, m.team2Index ?? 0, teams),
        sets: m.sets,
        games: m.games,
        points: m.points,
        server: m.server,
        actualStartTime: m.actualStartTime,
        actualEndTime: m.actualEndTime,
    };
}

// ── Hook (Supabase Realtime) ────────────────────────────────────────────────
export function useMatchRealtime(
    tournamentId: string | null | undefined,
    matchId?: string | null
): UseMatchRealtimeReturn {
    const [match, setMatch] = useState<RealtimeMatch | null>(null);
    const [tournament, setTournament] = useState<RealtimeTournament | null>(null);
    const [allMatches, setAllMatches] = useState<RealtimeMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!tournamentId) {
            setLoading(false);
            return;
        }

        let isMounted = true;
        const tid = tournamentId;

        const applyTournament = (t: any) => {
            if (!t) {
                setError('El torneo solicitado no existe.');
                setLoading(false);
                return;
            }
            const sanitized = sanitizeTournament(t.id, t);
            setTournament(prev => (JSON.stringify(prev) !== JSON.stringify(sanitized) ? sanitized : prev));
        };

        const applyMatches = (matches: any[], t: any) => {
            const teams = t?.teams || [];
            const enriched = matches.map((m, idx) => sanitizeMatch(m, idx, tid, teams));
            setAllMatches(prev => (JSON.stringify(prev) !== JSON.stringify(enriched) ? enriched : prev));
            if (matchId) {
                const found = enriched.find((m: RealtimeMatch) => m.id === matchId) || null;
                setMatch(prev => (JSON.stringify(prev) !== JSON.stringify(found) ? found : prev));
            }
            setLoading(false);
            setError(null);
        };

        dataService.getTournament(tid)
            .then((t) => {
                if (!isMounted) return;
                applyTournament(t);
                return dataService.getMatches(tid).then((matches) => {
                    if (!isMounted) return;
                    applyMatches(matches, t);
                });
            })
            .catch((e) => {
                if (!isMounted) return;
                console.error('[useMatchRealtime] Error:', e);
                setError('Error de red al conectar con el torneo.');
                setLoading(false);
            });

        const unsubT = dataService.subscribeToTournament(tid, (t) => {
            if (!isMounted) return;
            applyTournament(t);
        });

        const unsubM = dataService.subscribeToMatches(tid, async (matches) => {
            if (!isMounted) return;
            const t = await dataService.getTournament(tid);
            applyMatches(matches, t || undefined);
        });

        return () => {
            isMounted = false;
            unsubT();
            unsubM();
        };
    }, [tournamentId, matchId]);

    const updateMatch = useCallback(async (fields: Partial<RealtimeMatch>) => {
        if (!tournamentId || !matchId) return;
        try {
            const { team1, team2, id: _id, ...rest } = fields as any;
            await dataService.updateMatch(tournamentId, matchId, { ...rest });
        } catch (e) {
            console.error('[useMatchRealtime] updateMatch failed:', e);
            setError('Error al actualizar el marcador del partido.');
        }
    }, [tournamentId, matchId]);

    const updateTournament = useCallback(async (fields: Partial<Tournament>) => {
        if (!tournamentId) return;
        try {
            const t = await dataService.getTournament(tournamentId);
            if (t) await dataService.updateTournament(tournamentId, { ...t, ...fields });
        } catch (e) {
            console.error('[useMatchRealtime] updateTournament failed:', e);
            setError('Error al actualizar la configuración del torneo.');
        }
    }, [tournamentId]);

    return { match, tournament, allMatches, loading, error, updateMatch, updateTournament };
}
