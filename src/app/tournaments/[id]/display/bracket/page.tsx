'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { dataService } from '@/lib/dataService';
import { useRouteSegment } from '@/lib/useRouteSegment';

type MatchRow = any;
type TournamentRow = any;

function roundUpperName(m: any): string {
    return String(m?.roundName ?? '').toUpperCase();
}

function getRoundOrder(name: string): number {
    const upper = (name || '').toUpperCase();
    if (upper.includes('DIECISEISAVOS') || upper.includes('16')) return 1;
    if (upper.includes('OCTAVOS') || upper.includes('8VO')) return 2;
    if (upper.includes('CUARTOS') || upper.includes('PRINCIPAL R1') || upper.includes('CONSOLACIÓN R1')) return 3;
    if (upper.includes('SEMIFINAL') && !upper.includes('FINAL')) return 4;
    if (upper.includes('CONSOLACIÓN FINAL')) return 4;
    if (upper.includes('FINAL') && (!upper.includes('SEMIFINAL') || upper.includes('PRINCIPAL FINAL'))) return 5;
    if (name === 'Principal R1' || name === 'Consolación R1') return 3;
    if (name === 'Principal SF') return 4;
    if (name === 'Principal FINAL' || name === 'FINAL') return 5;
    return 10;
}

function isKnockoutLike(m: any): boolean {
    const stage = String(m?.stage ?? '');
    const ru = roundUpperName(m);
    return (
        stage === 'SEMIFINAL' ||
        stage === 'FINAL' ||
        ru.includes('SEMIFINAL') ||
        ru === 'SEMIFINALES' ||
        ru === 'FINAL' ||
        stage === 'MAIN_DRAW' && (ru.includes('SEMIFINAL') || ru === 'FINAL') ||
        m?.isKnockout === true ||
        m?.isFinal === true
    );
}

function safeTeamName(tournament: TournamentRow | null, teamIndex: number | undefined, fallback?: string): string {
    if (!teamIndex || !tournament?.teams?.length) return fallback || 'TBD';
    const team = tournament.teams[teamIndex - 1];
    if (!team) return fallback || 'TBD';
    const p1 = team?.p1?.name;
    const p2 = team?.p2?.name;
    if (typeof p1 === 'string' && typeof p2 === 'string' && p1.trim() && p2.trim()) {
        return `${p1} / ${p2}`;
    }
    return team?.name || fallback || 'TBD';
}

export default function TVBracketDisplayPage() {
    const tournamentId = useRouteSegment('id');

    const [tournament, setTournament] = useState<TournamentRow | null>(null);
    const [matches, setMatches] = useState<MatchRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tournamentId) return;
        setLoading(true);

        const unsubT = dataService.subscribeToTournament(tournamentId, (t) => setTournament(t));
        const unsubM = dataService.subscribeToMatches(tournamentId, (ms) => {
            setMatches(ms || []);
            setLoading(false);
        });

        return () => {
            unsubT?.();
            unsubM?.();
        };
    }, [tournamentId]);

    const knockoutMatches = useMemo(() => matches.filter(isKnockoutLike), [matches]);

    const sortedRounds = useMemo(() => {
        const byRound: Record<string, MatchRow[]> = {};
        knockoutMatches.forEach((m: any) => {
            const key = m.roundName || (m.stage === 'FINAL' || roundUpperName(m) === 'FINAL' ? 'FINAL' : 'ELIMINATORIA');
            if (!byRound[key]) byRound[key] = [];
            byRound[key].push(m);
        });

        const rounds = Object.entries(byRound).map(([name, ms]) => ({ name, matches: ms }));
        rounds.sort((a, b) => getRoundOrder(a.name) - getRoundOrder(b.name));
        return rounds;
    }, [knockoutMatches]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-14 h-14 border-t-4 border-[#ccff00] rounded-full animate-spin mx-auto" />
                    <div className="mt-4 text-xs font-black uppercase tracking-[0.4em] text-gray-500">
                        Cargando Cuadro…
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black text-white overflow-hidden font-outfit">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&display=swap');
                body {
                    margin: 0;
                    padding: 0;
                    background: #000;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .font-digital {
                    font-family: 'Orbitron', sans-serif;
                    letter-spacing: 0.02em;
                }
            `}</style>

            <div className="absolute inset-0 opacity-25 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] rounded-full blur-[90px] bg-[#ccff00]/25" />
                <div className="absolute bottom-[-25%] right-[-10%] w-[55%] h-[55%] rounded-full blur-[110px] bg-blue-600/12" />
            </div>

            <div className="relative h-full p-8 md:p-12">
                <header className="flex items-start justify-between gap-6 mb-8">
                    <div>
                        <div className="text-[#ccff00] font-black italic uppercase tracking-tighter text-[clamp(18px,2.2vw,46px)]">
                            {tournament?.name || 'CUADRO GENERAL'}
                        </div>
                        <div className="mt-2 text-white/60 font-bold uppercase tracking-[0.35em] text-[clamp(10px,1.2vw,20px)]">
                            ELIMINATORIAS (TV)
                        </div>
                    </div>
                    <div className="text-white/40 text-[clamp(10px,1.2vw,18px)] font-black uppercase tracking-widest mt-2">
                        Actualiza en vivo
                    </div>
                </header>

                <div className="flex flex-row gap-10 overflow-x-auto no-scrollbar h-[calc(100%-110px)] px-2">
                    {sortedRounds.map((round) => (
                        <div
                            key={round.name}
                            className="flex flex-col flex-shrink-0 w-[clamp(220px,28vw,360px)]"
                        >
                            <div className="text-center text-[#ccff00] font-black uppercase tracking-widest text-[clamp(13px,1.6vw,22px)]">
                                {round.name}
                            </div>

                            <div className="mt-5 flex flex-col gap-4">
                                {round.matches.map((m: MatchRow, i: number) => {
                                    const t1 = safeTeamName(tournament, m?.team1Index, m?.t1Name);
                                    const t2 = safeTeamName(tournament, m?.team2Index, m?.t2Name);

                                    const score =
                                        (typeof m?.score === 'string' && m.score.trim()) ||
                                        (m?.sets && typeof m.sets?.t1 === 'number' ? `${m.sets.t1}-${m.sets.t2}` : '') ||
                                        (m?.games && typeof m.games?.t1 === 'number' ? `${m.games.t1}-${m.games.t2}` : '');

                                    const isLive = String(m?.status ?? '').toUpperCase() === 'LIVE';

                                    return (
                                        <motion.div
                                            key={m?.id ?? `${round.name}_${i}`}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className={`rounded-[2rem] border p-5 bg-white/[0.03] border-white/10 ${
                                                isLive ? 'shadow-[0_0_40px_rgba(204,255,0,0.15)] border-[#ccff00]/25' : ''
                                            }`}
                                        >
                                            <div className="text-white/40 font-black uppercase tracking-widest text-[10px]">
                                                {isLive ? 'EN VIVO' : ' '}
                                            </div>

                                            <div
                                                className="mt-2 font-black italic uppercase tracking-tighter leading-[1.0] text-[clamp(18px,3vw,120px)]"
                                                style={{ color: isLive ? '#ccff00' : '#ffffff' }}
                                            >
                                                {t1}
                                            </div>
                                            <div
                                                className="mt-2 font-black italic uppercase tracking-tighter leading-[1.0] font-digital text-[clamp(18px,3vw,120px)] text-white/70"
                                            >
                                                {t2}
                                            </div>

                                            <div className="mt-4 flex items-center justify-center">
                                                <div className="bg-black/40 border border-white/10 rounded-full px-6 py-2">
                                                    <span className="text-[#ccff00] font-black uppercase tracking-widest text-[clamp(12px,1.6vw,26px)]">
                                                        {score || '—'}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {sortedRounds.length === 0 && (
                        <div className="flex items-center justify-center w-full">
                            <div className="text-center">
                                <div className="text-white/20 text-3xl font-black">—</div>
                                <div className="mt-4 text-white/40 font-black uppercase tracking-widest">
                                    No hay eliminatorias para mostrar
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

