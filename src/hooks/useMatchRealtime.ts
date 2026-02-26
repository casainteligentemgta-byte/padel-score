'use client';

/**
 * useMatchRealtime
 * ─────────────────────────────────────────────────────────────────────────────
 * Hook centralizado que encapsula la suscripción Firestore en tiempo real
 * a un partido específico dentro de un torneo.
 *
 * Uso:
 *   const { match, tournament, loading, error, updateMatch } = useMatchRealtime(tournamentId, matchId);
 */

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MatchStatus } from '@/types/tournament';

// ── Types ──────────────────────────────────────────────────────────────────
export interface RealtimeTeam {
    name: string;
    p1Name?: string;
    p2Name?: string;
    p1?: { name?: string; photo?: string | null };
    p2?: { name?: string; photo?: string | null };
    photo1?: string | null;
    photo2?: string | null;
    isTBD?: boolean;
    teamLabel?: string;
}

export interface RealtimeMatch {
    id: string;
    status: MatchStatus;
    court?: number | string;
    courtIndex?: number;
    stage?: string;
    groupName?: string;
    scheduledTime?: any;
    team1Index: number;
    team2Index: number;
    team1: RealtimeTeam;
    team2: RealtimeTeam;
    sets?: { t1: number; t2: number };
    games?: { t1: number; t2: number };
    points?: { t1: any; t2: any };
    server?: { team: 1 | 2; player: 1 | 2 };
    isStreaming?: boolean;
    forcedAds?: boolean;
    current_ad_url?: string;
    actualStartTime?: string;
    actualEndTime?: string;
    bracketPosition?: { round: number; position: number };
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
    teams?: any[];
    matches?: any[];
    [key: string]: any;
}

interface UseMatchRealtimeReturn {
    match: RealtimeMatch | null;
    tournament: RealtimeTournament | null;
    allMatches: RealtimeMatch[];
    loading: boolean;
    error: string | null;
    /** Actualiza campos del partido en Firestore (merge parcial) */
    updateMatch: (fields: Partial<RealtimeMatch>) => Promise<void>;
    /** Actualiza el torneo completo (broadcastingSettings, etc.) */
    updateTournament: (fields: Record<string, any>) => Promise<void>;
}

// ── Helper: enriquecer match con datos de equipo ───────────────────────────
function enrichMatch(m: any, idx: number, teams?: any[]): RealtimeMatch {
    const matchId = m.id || `match_${idx}`;

    const resolveTeam = (mTeam: any, teamIdx: number): RealtimeTeam => {
        // Formato nuevo: objeto embebido
        if (mTeam && (mTeam.p1 || mTeam.p1Name || mTeam.isTBD || mTeam.teamLabel)) {
            if (mTeam.isTBD || mTeam.teamLabel) {
                return { name: mTeam.teamLabel || mTeam.p1?.name || '?', isTBD: true, teamLabel: mTeam.teamLabel };
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
        // Formato legacy: índice → teams[]
        const t = (teamIdx > 0 && teams) ? teams[teamIdx - 1] : null;
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
    };

    return {
        ...m,
        id: matchId,
        court: m.court || (m.courtIndex !== undefined ? m.courtIndex + 1 : undefined),
        team1: resolveTeam(m.team1, m.team1Index),
        team2: resolveTeam(m.team2, m.team2Index),
    };
}

// ── Hook ───────────────────────────────────────────────────────────────────
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

        const unsub = onSnapshot(
            doc(db, 'tournaments', tournamentId),
            (snap) => {
                if (!snap.exists()) {
                    setError('Torneo no encontrado');
                    setLoading(false);
                    return;
                }

                const data = { id: snap.id, ...snap.data() } as any;
                const t: RealtimeTournament = {
                    id: snap.id,
                    name: data.name || 'Torneo',
                    category: data.category,
                    gender: data.gender,
                    status: data.status,
                    complexName: data.complexName,
                    broadcastingSettings: data.broadcastingSettings,
                    teams: data.teams || [],
                    matches: data.matches || [],
                    ...data,
                };
                setTournament(t);

                const enriched: RealtimeMatch[] = (data.matches || []).map(
                    (m: any, idx: number) => enrichMatch(m, idx, data.teams)
                );
                setAllMatches(enriched);

                if (matchId) {
                    const found = enriched.find(m => m.id === matchId) || null;
                    setMatch(found);
                }

                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error('[useMatchRealtime] Error:', err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsub();
    }, [tournamentId, matchId]);

    // ── updateMatch: escribe campos en el match correcto del array ──────────
    const updateMatch = useCallback(async (fields: Partial<RealtimeMatch>) => {
        if (!tournamentId || !matchId) return;
        const ref = doc(db, 'tournaments', tournamentId);

        // Leer el último estado del array desde el state
        setAllMatches(prev => {
            const updated = prev.map(m => m.id === matchId ? { ...m, ...fields } : m);
            // Escribir a Firestore en background (strip enriched team objects)
            const raw = updated.map(({ team1, team2, ...rest }) => rest);
            updateDoc(ref, { matches: raw, updatedAt: new Date() }).catch(console.error);
            return updated;
        });
    }, [tournamentId, matchId]);

    // ── updateTournament: escribe campos en el doc del torneo ───────────────
    const updateTournament = useCallback(async (fields: Record<string, any>) => {
        if (!tournamentId) return;
        await updateDoc(doc(db, 'tournaments', tournamentId), { ...fields, updatedAt: new Date() });
    }, [tournamentId]);

    return { match, tournament, allMatches, loading, error, updateMatch, updateTournament };
}
