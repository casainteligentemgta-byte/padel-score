import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, updateDoc, collection, QuerySnapshot, DocumentSnapshot, FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MatchStatus, Tournament, Match, Team } from '@/types/tournament';

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

export interface RealtimeMatch extends Omit<Match, 'team1' | 'team2' | 'scheduledTime'> {
    team1: RealtimeTeam;
    team2: RealtimeTeam;
    scheduledTime: any; // Mantener como string/timestamp flexible para UI
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

// ── Sanitization & Mapping ───────────────────────────────────────────────

/** 
 * Extrae solo los campos necesarios del doc de Firestore para el Torneo.
 * Protege contra fuga de campos sensibles de administración (dueños, configuraciones internas).
 */
function sanitizeTournament(id: string, data: any): RealtimeTournament {
    return {
        id,
        name: data.name || 'Torneo',
        category: typeof data.category === 'string' ? data.category : undefined,
        gender: typeof data.gender === 'string' ? data.gender : undefined,
        status: typeof data.status === 'string' ? data.status : undefined,
        complexName: typeof data.complexName === 'string' ? data.complexName : undefined,
        broadcastingSettings: data.broadcastingSettings ? {
            primaryColor: data.broadcastingSettings.primaryColor,
            adMediaUrls: Array.isArray(data.broadcastingSettings.adMediaUrls) ? data.broadcastingSettings.adMediaUrls : [],
            adImageUrls: Array.isArray(data.broadcastingSettings.adImageUrls) ? data.broadcastingSettings.adImageUrls : [],
        } : undefined,
    };
}

/** 
 * Enriquece un match con datos de equipo de forma segura.
 */
function sanitizeMatch(m: any, idx: number, teams?: any[]): RealtimeMatch {
    const matchId = m.id || `match_${idx}`;

    const resolveTeam = (mTeam: any, teamIdx: number): RealtimeTeam => {
        // Si el partido ya tiene datos de equipo estáticos (ej: nombres editados manualmente)
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

        // Si no, resolver usando los equipos del torneo
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
    };

    return {
        id: matchId,
        tournamentId: m.tournamentId || '',
        status: m.status || MatchStatus.PENDING,
        court: m.court || (m.courtIndex !== undefined ? m.courtIndex + 1 : undefined),
        courtIndex: m.courtIndex,
        stage: m.stage,
        groupName: m.groupName,
        scheduledTime: m.scheduledTime,
        team1Index: m.team1Index || 0,
        team2Index: m.team2Index || 0,
        team1: resolveTeam(m.team1, m.team1Index),
        team2: resolveTeam(m.team2, m.team2Index),
        sets: m.sets,
        games: m.games,
        points: m.points,
        server: m.server,
        actualStartTime: m.actualStartTime,
        actualEndTime: m.actualEndTime,
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

        let teamsRaw: any[] = [];
        let isMounted = true;

        // 1. Suscripción al Torneo (Metadatos y Equipos)
        const unsubTournament = onSnapshot(
            doc(db, 'tournaments', tournamentId),
            (snap: DocumentSnapshot) => {
                if (!isMounted) return;

                if (!snap.exists()) {
                    setError('El torneo solicitado no existe.');
                    setLoading(false);
                    return;
                }
                const data = snap.data();
                teamsRaw = data?.teams || [];
                const sanitizedT = sanitizeTournament(snap.id, data);

                setTournament(prev => {
                    if (!prev || JSON.stringify(prev) !== JSON.stringify(sanitizedT)) {
                        return sanitizedT;
                    }
                    return prev;
                });
            },
            (err: FirestoreError) => {
                if (!isMounted) return;
                console.error('[useMatchRealtime] Tournament Error:', err);
                if (err.code === 'permission-denied') {
                    setError('Error de permisos: No puedes acceder a este torneo.');
                } else {
                    setError('Error de red al conectar con el torneo.');
                }
            }
        );

        // 2. Suscripción a la Sub-colección de Partidos
        const unsubMatches = onSnapshot(
            collection(db, 'tournaments', tournamentId, 'matches'),
            (snap: QuerySnapshot) => {
                if (!isMounted) return;

                const enrichedMatches = snap.docs.map((d, idx) =>
                    sanitizeMatch({ id: d.id, ...d.data() }, idx, teamsRaw)
                );

                setAllMatches(prev => {
                    if (JSON.stringify(prev) !== JSON.stringify(enrichedMatches)) {
                        return enrichedMatches;
                    }
                    return prev;
                });

                if (matchId) {
                    const found = enrichedMatches.find((m: RealtimeMatch) => m.id === matchId) || null;
                    setMatch(prev => {
                        if (JSON.stringify(prev) !== JSON.stringify(found)) {
                            return found;
                        }
                        return prev;
                    });
                }

                setLoading(false);
                setError(null);
            },
            (err: FirestoreError) => {
                if (!isMounted) return;
                console.error('[useMatchRealtime] Matches Sub-collection Error:', err);
                if (err.code === 'permission-denied') {
                    setError('Sin permisos para ver los partidos de este torneo.');
                } else {
                    setError('Error al recibir actualizaciones de partidos en tiempo real.');
                }
                setLoading(false);
            }
        );

        return () => {
            isMounted = false;
            unsubTournament();
            unsubMatches();
        };
    }, [tournamentId, matchId]);

    const updateMatch = useCallback(async (fields: Partial<RealtimeMatch>) => {
        if (!tournamentId || !matchId) return;
        const matchRef = doc(db, 'tournaments', tournamentId, 'matches', matchId);

        try {
            // Limpiar campos enriquecidos para no guardarlos accidentalmente en Firestore
            const { team1, team2, id, ...rest } = fields as any;
            await updateDoc(matchRef, {
                ...rest,
                updatedAt: new Date()
            });
        } catch (e) {
            console.error('[useMatchRealtime] updateMatch failed:', e);
            setError('Error al actualizar el marcador del partido.');
        }
    }, [tournamentId, matchId]);

    const updateTournament = useCallback(async (fields: Partial<Tournament>) => {
        if (!tournamentId) return;
        try {
            await updateDoc(doc(db, 'tournaments', tournamentId), {
                ...fields,
                updatedAt: new Date()
            });
        } catch (e) {
            console.error('[useMatchRealtime] updateTournament failed:', e);
            setError('Error al actualizar la configuración del torneo.');
        }
    }, [tournamentId]);

    return { match, tournament, allMatches, loading, error, updateMatch, updateTournament };
}

