'use client';

import React from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Tv, FileText, Share2, Calendar, Clock
} from 'lucide-react';

interface TournamentHeaderProps {
    eventName: string;
    complexName?: string;
    eventDate: any;
    allMatchesCount: number;
    liveCnt: number;
    pendCnt: number;
    finCnt: number;
    sponsorLogoUrl?: string;
    sponsorName?: string;
    sponsorLink?: string;
    canManageTournament: boolean;
    onEditSponsor: () => void;
    onEditRules: () => void;
    onShare: () => void;
}

export const TournamentHeader: React.FC<TournamentHeaderProps> = ({
    eventName,
    complexName,
    eventDate,
    allMatchesCount,
    liveCnt,
    pendCnt,
    finCnt,
    sponsorLogoUrl,
    sponsorName,
    sponsorLink,
    canManageTournament,
    onEditSponsor,
    onEditRules,
    onShare
}) => {
    return (
        <div className="flex-shrink-0 bg-[#0a0a0a] border-b border-white/[0.08] px-3 sm:px-4 pt-5 pb-4 w-full">
            <div className="flex items-center gap-3 mb-4">
                <Link href="/tournaments"
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0">
                    <ArrowLeft className="w-4 h-4" />
                </Link>

                {/* ── Patrocinador configurable ── */}
                <div className="flex-shrink-0 flex flex-col items-center" title="Patrocinador del evento">
                    {sponsorLink ? (
                        <a
                            href={sponsorLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden hover:bg-white/10 transition-colors"
                        >
                            <img
                                src={sponsorLogoUrl || '/sponsor-example.png'}
                                alt={sponsorName || 'Patrocinador'}
                                className="w-10 h-10 object-contain"
                            />
                        </a>
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                            <img
                                src={sponsorLogoUrl || '/sponsor-example.png'}
                                alt={sponsorName || 'Patrocinador'}
                                className="w-10 h-10 object-contain"
                            />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none truncate text-[#ccff00]">
                        {eventName}
                    </h1>
                    {complexName && (
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-1 truncate">
                            {complexName}
                        </p>
                    )}
                    {eventDate && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(eventDate).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                    )}
                </div>

                {canManageTournament && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={onEditSponsor}
                            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/15 transition-all"
                            title="Editar logo del patrocinante"
                        >
                            <Tv className="w-4 h-4" />
                            Logo evento
                        </button>
                        <button
                            onClick={onEditRules}
                            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 border border-[#ccff00]/30 text-[#ccff00] text-[10px] font-black uppercase tracking-widest hover:bg-[#ccff00]/10 transition-all"
                            title="Reglas generales del evento"
                        >
                            <FileText className="w-4 h-4" />
                            Reglas
                        </button>
                    </div>
                )}
                <button
                    onClick={onShare}
                    className="w-10 h-10 rounded-2xl bg-[#ccff00] text-black shadow-[0_4px_16px_rgba(204,255,0,0.3)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                    title="Compartir planilla"
                >
                    <Share2 className="w-5 h-5" />
                </button>
            </div>

            {/* Meta row: partidos (fecha ya va debajo del título) */}
            <div className="flex items-center gap-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4">
                <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {allMatchesCount} partidos
                </span>
            </div>

            {/* Stat pills */}
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar mb-1 flex-nowrap">
                {liveCnt > 0 && (
                    <span className="flex-shrink-0 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-widest animate-pulse">
                        ● {liveCnt} En Vivo
                    </span>
                )}
                <span className="flex-shrink-0 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-[9px] font-black uppercase tracking-widest">
                    {pendCnt} Por comenzar
                </span>
                <span className="flex-shrink-0 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-500 text-[9px] font-black uppercase tracking-widest">
                    {finCnt} Finalizados
                </span>
            </div>
        </div>
    );
};
