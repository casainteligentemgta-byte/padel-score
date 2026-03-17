'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { getAuthHeaders } from '@/lib/apiAuth';
import { Trophy, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import { BouncingBall } from '@/components/BouncingBall';

/**
 * Reporte de resultado vía QR: /match/[id]/report
 * id = "tournamentId--matchId" (delimitador --)
 * Solo uno de los 4 jugadores del partido puede cargar el resultado.
 * UI táctil (botones grandes), Dark Mode.
 */
export default function MatchReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: compositeId } = use(params);
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [status, setStatus] = useState<'loading' | 'forbidden' | 'ready' | 'sending' | 'done'>('loading');
    const [match, setMatch] = useState<any>(null);
    const [tournamentId, setTournamentId] = useState<string | null>(null);
    const [matchId, setMatchId] = useState<string | null>(null);
    const [myTeam, setMyTeam] = useState<1 | 2 | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !user?.uid) {
            if (!authLoading && !user) {
                router.replace('/login');
            }
            return;
        }

        const parts = compositeId?.split('--');
        const tid = parts?.[0];
        const mid = parts?.[1];
        if (!tid || !mid) {
            setStatus('forbidden');
            setError('Enlace inválido.');
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const [matches, participants] = await Promise.all([
                    dataService.getMatches(tid),
                    dataService.getMyParticipants(user!.uid),
                ]);
                if (cancelled) return;

                const m = (matches || []).find((x: any) => x.id === mid);
                if (!m) {
                    setStatus('forbidden');
                    setError('Partido no encontrado.');
                    return;
                }

                const participantIds = [
                    m.team1?.p1?.id,
                    m.team1?.p2?.id,
                    m.team2?.p1?.id,
                    m.team2?.p2?.id,
                ].filter(Boolean) as string[];

                const myParticipantId = participants?.[0]?.id;
                if (!myParticipantId || !participantIds.includes(myParticipantId)) {
                    setStatus('forbidden');
                    setError('Solo los 4 jugadores del partido pueden cargar el resultado.');
                    return;
                }

                const inTeam1 =
                    myParticipantId === m.team1?.p1?.id || myParticipantId === m.team1?.p2?.id;
                setTournamentId(tid);
                setMatchId(mid);
                setMatch(m);
                setMyTeam(inTeam1 ? 1 : 2);
                setStatus('ready');
            } catch (e) {
                if (!cancelled) {
                    setStatus('forbidden');
                    setError('Error al cargar el partido.');
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [compositeId, user?.uid, authLoading, router]);

    const submitResult = async (winnerTeam: 1 | 2) => {
        if (!tournamentId || !matchId || !match || status !== 'ready') return;
        setStatus('sending');
        setError(null);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/match/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...headers },
                body: JSON.stringify({
                    compositeId: `${tournamentId}--${matchId}`,
                    winnerTeam,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError((data.error as string) || 'No se pudo guardar el resultado. Intenta de nuevo.');
                setStatus('ready');
                return;
            }
            setStatus('done');
        } catch (e) {
            setError('No se pudo guardar el resultado. Intenta de nuevo.');
            setStatus('ready');
        }
    };

    if (authLoading || status === 'loading') {
        return (
            <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 overflow-hidden">
                <BouncingBall size={40} bounceHeight={2} />
                <p className="mt-4 text-sm text-white/60">Cargando partido...</p>
            </div>
        );
    }

    if (status === 'forbidden') {
        return (
            <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 overflow-hidden">
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 max-w-sm text-center">
                    <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <h1 className="text-lg font-black text-white uppercase tracking-tight mb-2">No autorizado</h1>
                    <p className="text-sm text-white/80">{error}</p>
                    <button
                        type="button"
                        onClick={() => router.push('/hub')}
                        className="mt-4 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm"
                    >
                        Volver al Hub
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'done') {
        return (
            <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 overflow-hidden">
                <div className="rounded-2xl border border-brand/40 bg-surfaceCard p-6 max-w-sm text-center">
                    <CheckCircle2 className="w-14 h-14 text-brand mx-auto mb-3" />
                    <h1 className="text-lg font-black text-white uppercase tracking-tight mb-2">Resultado guardado</h1>
                    <p className="text-sm text-white/70 mb-4">El marcador se ha actualizado correctamente.</p>
                    <button
                        type="button"
                        onClick={() => router.push(`/tournaments/${tournamentId}`)}
                        className="px-6 py-3 rounded-xl bg-brand text-black font-black text-sm uppercase"
                    >
                        Ver torneo
                    </button>
                </div>
            </div>
        );
    }

    if ((status !== 'ready' && status !== 'sending') || !match || myTeam === null) return null;

    const isSending = status === 'sending';
    const team1Name = match.team1Name || (match.team1?.p1?.name ? [match.team1.p1.name, match.team1.p2?.name].filter(Boolean).join(' / ') : 'Equipo 1');
    const team2Name = match.team2Name || (match.team2?.p1?.name ? [match.team2.p1.name, match.team2.p2?.name].filter(Boolean).join(' / ') : 'Equipo 2');

    return (
        <div className="min-h-screen bg-surface text-white flex flex-col items-center justify-center p-4 overflow-hidden">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surfaceCard p-6">
                <h1 className="text-center text-sm font-black uppercase tracking-widest text-white/60 mb-2">
                    Reportar resultado
                </h1>
                <p className="text-center text-xs text-white/50 mb-6">
                    ¿Quién ganó el partido?
                </p>

                <div className="space-y-3 mb-6">
                    <p className="text-[10px] font-bold text-white/40 uppercase">Equipo 1</p>
                    <p className="text-sm font-bold text-white truncate">{team1Name}</p>
                    <p className="text-[10px] font-bold text-white/40 uppercase mt-3">Equipo 2</p>
                    <p className="text-sm font-bold text-white truncate">{team2Name}</p>
                </div>

                {error && (
                    <p className="text-red-400 text-sm text-center mb-4">{error}</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        disabled={isSending}
                        onClick={() => submitResult(1)}
                        className="min-h-[72px] flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-brand/50 bg-brand/10 text-brand font-black uppercase text-sm tracking-tight active:scale-95 transition-transform touch-manipulation"
                    >
                        {isSending ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <Trophy className="w-7 h-7" />
                                <span>Ganó Equipo 1</span>
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        disabled={isSending}
                        onClick={() => submitResult(2)}
                        className="min-h-[72px] flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-brand/50 bg-brand/10 text-brand font-black uppercase text-sm tracking-tight active:scale-95 transition-transform touch-manipulation"
                    >
                        {isSending ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <Trophy className="w-7 h-7" />
                                <span>Ganó Equipo 2</span>
                            </>
                        )}
                    </button>
                </div>

                <p className="mt-4 text-[10px] text-white/40 text-center">
                    Solo los jugadores del partido pueden enviar el resultado.
                </p>
            </div>
        </div>
    );
}
