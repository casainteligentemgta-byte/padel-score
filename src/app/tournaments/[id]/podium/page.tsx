'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Trophy, Share2 } from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { useRouteSegment } from '@/lib/useRouteSegment';
import { BackButton } from '@/components/BackButton';
import { EventPodiumView } from '@/app/tournaments/event/components/EventPodiumView';
import { exportEventPodiumPdf } from '@/lib/eventPodiumPdf';

export default function CategoryPodiumPage() {
    const id = useRouteSegment('id');
    const [tournament, setTournament] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [pdfBusy, setPdfBusy] = useState(false);

    useEffect(() => {
        if (!id) return;

        const unsubT = dataService.subscribeToTournament(String(id), (tourneyData) => {
            if (!tourneyData) {
                setTournament(null);
                setLoading(false);
                return;
            }
            setTournament((prev: any) => ({
                ...(typeof prev === 'object' ? prev : {}),
                ...tourneyData,
                id: String(id),
            }));
            setLoading(false);
        });

        const unsubM = dataService.subscribeToMatches(String(id), (tournamentMatches) => {
            setTournament((prev: any) => ({
                ...(prev && typeof prev === 'object' ? prev : {}),
                id: String(id),
                matches: tournamentMatches,
            }));
        });

        return () => {
            unsubT();
            unsubM();
        };
    }, [id]);

    if (!id) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
                <p className="text-gray-500 text-sm">Torneo no válido</p>
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

    if (!tournament) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center gap-4 px-6">
                <Trophy className="w-16 h-16 text-[#ccff00]/20" />
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">No se encontró el torneo</p>
                <Link href="/tournaments" className="text-[#ccff00] text-sm font-bold uppercase tracking-widest">
                    ← Volver
                </Link>
            </div>
        );
    }

    const title = tournament.name ?? 'Categoría';

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-outfit flex flex-col">
            <header className="flex-shrink-0 border-b border-white/[0.08] px-3 sm:px-4 py-4 flex items-center gap-3">
                <BackButton href={`/tournaments/${id}`} />
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Podio</p>
                    <h1 className="text-lg font-black uppercase italic tracking-tighter text-[#ccff00] truncate">{title}</h1>
                </div>
                <button
                    type="button"
                    disabled={pdfBusy}
                    aria-label="Compartir podio en PDF"
                    onClick={async () => {
                        setPdfBusy(true);
                        try {
                            await exportEventPodiumPdf({ [String(id)]: tournament }, title);
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
                <EventPodiumView tournaments={{ [String(id)]: tournament }} />
            </div>
        </div>
    );
}
