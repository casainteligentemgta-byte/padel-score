'use client';

import React, { useMemo } from 'react';
import { Trophy, Medal } from 'lucide-react';
import { getPodiumDisplayLines } from '@/lib/tournamentPodium';
import { buildEventPodiumRows } from '@/lib/buildEventPodiumRows';
import Link from 'next/link';

interface EventPodiumViewProps {
    tournaments: Record<string, any>;
}

export const EventPodiumView: React.FC<EventPodiumViewProps> = ({ tournaments }) => {
    const rows = useMemo(() => buildEventPodiumRows(tournaments), [tournaments]);

    if (rows.length === 0) {
        return (
            <div className="py-24 text-center space-y-4 px-4">
                <Trophy className="w-16 h-16 text-white/10 mx-auto" />
                <p className="text-gray-500 text-xs font-black uppercase tracking-widest">No hay categorías cargadas</p>
            </div>
        );
    }

    const mainHeading = rows.length > 1 ? 'Podio del evento' : 'Podio de la categoría';

    return (
        <div className="space-y-8 max-w-2xl mx-auto w-full px-2 sm:px-3 pb-16">
            <div className="text-center space-y-2 pt-2">
                <h2 className="text-lg font-black uppercase italic tracking-tighter text-[#ccff00]">{mainHeading}</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {rows.length > 1 ? 'Campeones y subcampeones por categoría' : 'Campeón y subcampeón'}
                </p>
            </div>

            <div className="space-y-5">
                {rows.map(({ id, title, podium }) => (
                    <div
                        key={id}
                        className="rounded-[2rem] border border-white/[0.08] bg-[#111] overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]"
                    >
                        <div className="px-5 py-3.5 bg-gradient-to-r from-[#ccff00]/90 to-[#b8e600] flex items-center justify-between gap-3">
                            <h3 className="font-black italic uppercase tracking-tighter text-sm text-black leading-tight truncate">
                                {title}
                            </h3>
                            <Link
                                href={`/tournaments/${id}?tab=ranking`}
                                className="flex-shrink-0 text-[9px] font-black uppercase tracking-widest text-black/70 hover:text-black underline-offset-2 hover:underline"
                            >
                                Ver categoría
                            </Link>
                        </div>

                        <div className="p-5 space-y-4">
                            {!podium ? (
                                <p className="text-center text-[11px] font-bold uppercase tracking-widest text-gray-600 py-6">
                                    Pendiente · aún no hay resultados para cerrar el podio
                                </p>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-[#ccff00]/35 bg-[#ccff00]/[0.07] p-4 flex gap-3 items-start">
                                            <div className="w-10 h-10 rounded-xl bg-[#ccff00]/20 flex items-center justify-center flex-shrink-0">
                                                <Trophy className="w-5 h-5 text-[#ccff00]" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-[#ccff00]">
                                                    Campeón
                                                </span>
                                                <div className="mt-1 space-y-0.5">
                                                    {getPodiumDisplayLines(podium.first).map((line, i) => (
                                                        <p
                                                            key={i}
                                                            className="text-sm font-black text-white leading-snug break-words"
                                                        >
                                                            {line}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex gap-3 items-start">
                                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                                <Medal className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                                                    Subcampeón
                                                </span>
                                                <div className="mt-1 space-y-0.5">
                                                    {podium.second ? (
                                                        getPodiumDisplayLines(podium.second).map((line, i) => (
                                                            <p
                                                                key={i}
                                                                className="text-sm font-black text-white leading-snug break-words"
                                                            >
                                                                {line}
                                                            </p>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm font-black text-white">—</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {podium.source === 'standings' && (
                                        <p className="text-[9px] text-center text-gray-600 font-bold uppercase tracking-wider">
                                            Por clasificación general (sin final de cuadro registrada)
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
