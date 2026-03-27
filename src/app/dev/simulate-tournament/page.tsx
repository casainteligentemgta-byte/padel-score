'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { dataService } from '@/lib/dataService';
import { useAuth } from '@/lib/AuthContext';
import { ScheduleEngine } from '@/services/ScheduleEngine';
import { MatchStatus } from '@/types/tournament';
import Sidebar from '@/components/Sidebar';
import { RefreshCw, Trophy, Zap, ChevronRight } from 'lucide-react';

function stripMatches(matches: any[]) {
    return matches.map(m => {
        const { team1, team2, ...rest } = m;
        return rest;
    });
}

/** Genera un resultado aleatorio: sets 2-0 o 2-1, games totales por equipo. */
function randomScore(winnerIsTeam1: boolean): { sets: { t1: number; t2: number }; games: { t1: number; t2: number }; score: string } {
    const t1Wins = winnerIsTeam1 ? 2 : Math.random() > 0.5 ? 0 : 1;
    const t2Wins = 2 - t1Wins;
    const sets = { t1: t1Wins, t2: t2Wins };
    let games = { t1: 0, t2: 0 };
    if (t1Wins === 2 && t2Wins === 0) {
        games = { t1: 6 + 6, t2: (Math.floor(Math.random() * 4) + 1) + (Math.floor(Math.random() * 4) + 1) };
    } else if (t1Wins === 0 && t2Wins === 2) {
        games = { t1: (Math.floor(Math.random() * 4) + 1) + (Math.floor(Math.random() * 4) + 1), t2: 6 + 6 };
    } else {
        games = { t1: 6 + (Math.floor(Math.random() * 4) + 1) + 6, t2: (Math.floor(Math.random() * 4) + 1) + 6 + (Math.floor(Math.random() * 4) + 1) };
    }
    const score = `${sets.t1}-${sets.t2} (${games.t1}-${games.t2})`;
    return { sets, games, score };
}

export default function SimulateTournamentPage() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [tournament, setTournament] = useState<any>(null);
    const [simulating, setSimulating] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const list = await dataService.listAllTournaments();
                setTournaments(list);
                if (list.length > 0 && !selectedId) setSelectedId(list[0].id);
            } catch (e) {
                console.error(e);
                setMessage('Error al cargar torneos.');
            }
        };
        if (user && isAdmin) load();
    }, [user, isAdmin]);

    useEffect(() => {
        if (!selectedId) {
            setTournament(null);
            return;
        }
        const load = async () => {
            try {
                const t = await dataService.getTournament(selectedId);
                setTournament(t);
            } catch (e) {
                console.error(e);
                setTournament(null);
            }
        };
        load();
    }, [selectedId]);

    const matches: any[] = tournament?.matches ?? [];
    const pending = matches.filter(m => m.status === MatchStatus.PENDING || m.status === 'PENDING');
    const groupPending = pending.filter(m => m.stage === 'GROUP_STAGE' || m.groupName != null);
    const bracketPending = pending.filter(m => m.stage === 'MAIN_DRAW' && m.bracketPosition);

    const getNextMatchToSimulate = (): any | null => {
        if (groupPending.length > 0) return groupPending[0];
        if (bracketPending.length === 0) return null;
        const byRound = bracketPending.slice().sort((a, b) => {
            const rA = a.bracketPosition?.round ?? 99;
            const rB = b.bracketPosition?.round ?? 99;
            if (rA !== rB) return rA - rB;
            return (a.bracketPosition?.position ?? 0) - (b.bracketPosition?.position ?? 0);
        });
        return byRound[0] ?? null;
    };

    const runOneSimulation = (currentMatches: any[], matchToFinish: any) => {
        const winnerIsTeam1 = Math.random() > 0.5;
        const { sets, games, score } = randomScore(winnerIsTeam1);
        const winnerIndex = winnerIsTeam1 ? matchToFinish.team1Index : matchToFinish.team2Index;

        let updated = currentMatches.map(m => {
            if (m.id === matchToFinish.id) {
                return {
                    ...m,
                    status: MatchStatus.FINISHED,
                    actualEndTime: new Date(),
                    score,
                    sets,
                    games
                };
            }
            if (matchToFinish.stage === 'MAIN_DRAW' && matchToFinish.bracketPosition && m.stage === 'MAIN_DRAW' && m.bracketPosition) {
                const nextRound = matchToFinish.bracketPosition.round + 1;
                const nextPos = Math.ceil(matchToFinish.bracketPosition.position / 2);
                const isTeam1 = matchToFinish.bracketPosition.position % 2 !== 0;
                if (m.bracketPosition.round === nextRound && m.bracketPosition.position === nextPos) {
                    return { ...m, [isTeam1 ? 'team1Index' : 'team2Index']: winnerIndex };
                }
            }
            return m;
        });

        const autocorrected = ScheduleEngine.recalculateRemainingMatches(updated, tournament?.bufferMinutes ?? 15);
        return updated.map(m => {
            const u = autocorrected.find((x: any) => x.id === m.id);
            return u ? { ...m, scheduledTime: u.scheduledTime } : m;
        });
    };

    const handleSimulateOne = async () => {
        if (!selectedId || !tournament) return;
        const next = getNextMatchToSimulate();
        if (!next) {
            setMessage('No hay partidos pendientes.');
            return;
        }
        setSimulating(true);
        setMessage(null);
        try {
            const updated = runOneSimulation(matches, next);
            await dataService.updateTournament(selectedId, {
                ...tournament,
                matches: stripMatches(updated)
            });
            setTournament({ ...tournament, matches: updated });
            setMessage(`Partido simulado: ${next.roundName || 'Grupo'} (${updated.find(m => m.id === next.id)?.score || ''}).`);
        } catch (e) {
            console.error(e);
            setMessage('Error al guardar.');
        } finally {
            setSimulating(false);
        }
    };

    const handleSimulateAll = async () => {
        if (!selectedId || !tournament) return;
        setSimulating(true);
        setMessage(null);
        try {
            let current = [...matches];
            let count = 0;
            for (;;) {
                const next = current.filter(m => m.status === MatchStatus.PENDING || m.status === 'PENDING');
                const groupNext = next.filter(m => m.stage === 'GROUP_STAGE' || m.groupName != null);
                const bracketNext = next.filter(m => m.stage === 'MAIN_DRAW' && m.bracketPosition);
                const pick = groupNext.length > 0 ? groupNext[0] : bracketNext.sort((a, b) =>
                    (a.bracketPosition?.round ?? 99) - (b.bracketPosition?.round ?? 99)
                )[0];
                if (!pick) break;
                current = runOneSimulation(current, pick);
                count++;
            }
            if (count === 0) {
                setMessage('No había partidos pendientes.');
                setSimulating(false);
                return;
            }
            await dataService.updateTournament(selectedId, {
                ...tournament,
                matches: stripMatches(current)
            });
            setTournament({ ...tournament, matches: current });
            setMessage(`Se simularon ${count} partido(s). Torneo listo hasta la final.`);
        } catch (e) {
            console.error(e);
            setMessage('Error al simular.');
        } finally {
            setSimulating(false);
        }
    };

    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white font-outfit relative">
            <Sidebar />

            <main className="ipad-scroll-area pl-20 md:pl-24 pr-4 pb-12">
                <div className="max-w-2xl mx-auto py-8 space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-padel-primary/10 flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-padel-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black italic uppercase tracking-tighter">
                                    Simular torneo
                                </h1>
                                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
                                    Completar partidos hasta la final
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/dev/seed-players"
                            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-padel-primary hover:underline"
                        >
                            <Zap className="w-4 h-4" /> 80 jugadores
                        </Link>
                    </div>

                    {authLoading ? (
                        <div className="flex items-center gap-3 text-gray-400 text-sm">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Verificando sesión...
                        </div>
                    ) : !user || !isAdmin ? (
                        <p className="text-sm text-gray-400">
                            Inicia sesión como administrador para simular torneos.
                        </p>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                                    Torneo
                                </label>
                                <select
                                    value={selectedId ?? ''}
                                    onChange={e => setSelectedId(e.target.value || null)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary"
                                >
                                    <option value="">Seleccionar...</option>
                                    {tournaments.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.name || t.title || t.id}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {tournament && (
                                <div className="bg-[#111] border border-white/10 rounded-2xl p-4 space-y-3">
                                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                                        Estado
                                    </p>
                                    <p className="text-sm text-gray-300">
                                        Pendientes: <span className="text-padel-primary font-black">{pending.length}</span>
                                        {groupPending.length > 0 && ` (${groupPending.length} grupos)`}
                                        {bracketPending.length > 0 && ` (${bracketPending.length} eliminatorias)`}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            disabled={simulating || pending.length === 0}
                                            onClick={handleSimulateOne}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-sm font-black uppercase tracking-widest hover:bg-padel-primary hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {simulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                                            Siguiente partido
                                        </button>
                                        <button
                                            type="button"
                                            disabled={simulating || pending.length === 0}
                                            onClick={handleSimulateAll}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-padel-primary text-black text-sm font-black uppercase tracking-widest hover:bg-padel-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {simulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                            Simular todos
                                        </button>
                                        <Link
                                            href={selectedId ? `/tournaments/${selectedId}` : '#'}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-sm font-black uppercase tracking-widest hover:bg-white/5 transition-colors"
                                        >
                                            Ver torneo
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {message && (
                                <p className="text-xs text-gray-300 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                                    {message}
                                </p>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
