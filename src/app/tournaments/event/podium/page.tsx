'use client';

import React, { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { RefreshCw, Trophy, Share2 } from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { BackButton } from '@/components/BackButton';
import { EventPodiumView } from '../components/EventPodiumView';
import { exportEventPodiumPdf } from '@/lib/eventPodiumPdf';

function EventPodiumContent() {
    const searchParams = useSearchParams();
    const idsParam = searchParams.get('ids') ?? '';
    const tournamentIds = useMemo(
        () => (idsParam ? idsParam.split(',').filter(Boolean) : []),
        [idsParam]
    );

    const [tournaments, setTournaments] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [pdfBusy, setPdfBusy] = useState(false);

    useEffect(() => {
        if (tournamentIds.length === 0) {
            setLoading(false);
            return;
        }

        setTournaments({});
        setLoading(true);

        const loaded: Record<string, boolean> = {};
        const unsubs: (() => void)[] = [];

        tournamentIds.forEach((tid) => {
            loaded[tid] = false;

            const unsubT = dataService.subscribeToTournament(tid, (tourneyData) => {
                if (!tourneyData) {
                    setTournaments((prev) => {
                        const next = { ...prev };
                        delete next[tid];
                        return next;
                    });
                } else {
                    setTournaments((prev) => ({
                        ...prev,
                        [tid]: { ...(prev[tid] || {}), ...tourneyData, id: tid },
                    }));
                }
                loaded[tid] = true;
                if (Object.values(loaded).every(Boolean)) setLoading(false);
            });
            unsubs.push(unsubT);

            const unsubM = dataService.subscribeToMatches(tid, (tournamentMatches) => {
                setTournaments((prev) => ({
                    ...prev,
                    [tid]: { ...(prev[tid] || {}), id: tid, matches: tournamentMatches },
                }));
            });
            unsubs.push(unsubM);
        });

        return () => unsubs.forEach((u) => u());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idsParam]);

    const backHref = idsParam ? `/tournaments/event?ids=${encodeURIComponent(idsParam)}` : '/tournaments';

    if (tournamentIds.length === 0) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white font-outfit flex flex-col items-center justify-center gap-4 px-6">
                <Trophy className="w-16 h-16 text-[#ccff00]/20" />
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest text-center">
                    Indica las categorías del evento en la URL (?ids=id1,id2,…)
                </p>
                <Link href="/tournaments" className="text-[#ccff00] text-sm font-bold uppercase tracking-widest">
                    ← Volver a torneos
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-[#ccff00] animate-spin" />
            </div>
        );
    }

    const firstT = Object.values(tournaments)[0] as any;
    const eventTitle = firstT?.eventName ?? firstT?.name ?? firstT?.complexName ?? 'Evento';

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-outfit flex flex-col">
            <header className="flex-shrink-0 border-b border-white/[0.08] px-3 sm:px-4 py-4 flex items-center gap-3">
                <BackButton href={backHref} />
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Podio</p>
                    <h1 className="text-lg font-black uppercase italic tracking-tighter text-[#ccff00] truncate">
                        {eventTitle}
                    </h1>
                </div>
                <button
                    type="button"
                    disabled={pdfBusy}
                    aria-label="Compartir podio en PDF"
                    onClick={async () => {
                        setPdfBusy(true);
                        try {
                            await exportEventPodiumPdf(tournaments, eventTitle);
                        } catch (e) {
                            console.error('[exportEventPodiumPdf]', e);
                        } finally {
                            setPdfBusy(false);
                        }
                    }}
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-[#ccff00] text-black text-[9px] font-black uppercase tracking-widest hover:bg-[#b8e600] transition-colors disabled:opacity-50 active:scale-[0.98]"
                >
                    {pdfBusy ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Share2 className="w-4 h-4" />
                    )}
                    <span className="max-[340px]:sr-only">Compartir PDF</span>
                </button>
            </header>
            <div className="flex-1 overflow-y-auto py-6">
                <EventPodiumView tournaments={tournaments} />
            </div>
        </div>
    );
}

export default function EventPodiumPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-[#ccff00] animate-spin" />
                </div>
            }
        >
            <EventPodiumContent />
        </Suspense>
    );
}
