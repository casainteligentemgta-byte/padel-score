'use client';

import React from 'react';
import {
    Tv, FileText, Share2, Calendar, Clock
} from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { DEFAULT_EVENT_SPONSOR_LOGO_URL } from '@/lib/brand';
import { formatCategory, formatGender } from '../utils';

interface TournamentHeaderProps {
    eventName: string;
    complexName?: string;
    category?: string;
    gender?: string;
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
    /** Doble clic en la pastilla «En Vivo» → abrir sala marker del primer partido en curso. */
    onDoubleClickLiveBadge?: () => void;
}

function SponsorLogoImage({ url, name }: { url?: string; name?: string }) {
    const def = DEFAULT_EVENT_SPONSOR_LOGO_URL;
    const [src, setSrc] = React.useState(() => (url?.trim() ? url.trim() : def));
    const [hideImg, setHideImg] = React.useState(false);

    React.useEffect(() => {
        setSrc(url?.trim() ? url.trim() : def);
        setHideImg(false);
    }, [url]);

    const onError = () => {
        if (src !== def) {
            setSrc(def);
            return;
        }
        setHideImg(true);
    };

    if (hideImg) {
        return <Tv className="w-8 h-8 text-gray-500" aria-hidden />;
    }

    return (
        <img
            src={src}
            alt={name || 'Patrocinador'}
            className="w-16 h-16 object-contain"
            onError={onError}
        />
    );
}

export const TournamentHeader: React.FC<TournamentHeaderProps> = ({
    eventName,
    complexName,
    category,
    gender,
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
    onShare,
    onDoubleClickLiveBadge,
}) => {
    return (
        <div className="flex-shrink-0 bg-[#0a0a0a] border-b border-white/[0.08] px-3 sm:px-4 pt-5 pb-4 w-full">
            <div className="flex items-center gap-3 mb-4">
                <BackButton className="flex-shrink-0" />

                {/* ── Patrocinador configurable ── */}
                <div className="flex flex-shrink-0 flex-col items-center gap-1" title="Patrocinador del evento">
                    <span className="max-w-[5.5rem] text-center text-[8px] font-black uppercase tracking-widest text-gray-500 leading-tight">
                        Logo del patrocinante
                    </span>
                    {sponsorLink ? (
                        <a
                            href={sponsorLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden hover:bg-white/10 transition-colors"
                        >
                            <SponsorLogoImage url={sponsorLogoUrl} name={sponsorName} />
                        </a>
                    ) : (
                        <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                            <SponsorLogoImage url={sponsorLogoUrl} name={sponsorName} />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none truncate text-[#ccff00]">
                        {eventName}
                    </h1>
                    {complexName && (
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-3 truncate">
                            {complexName}
                        </p>
                    )}
                    {(category || gender) && (
                        <div className="flex items-center gap-1.5 mt-0 text-[10px] font-black uppercase italic tracking-widest text-[#ccff00]/90">
                            {category && <span>{formatCategory(category)}</span>}
                            {category && gender && <span className="text-white/30">•</span>}
                            {gender && <span>{formatGender(gender)}</span>}
                        </div>
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
                {canManageTournament && (
                    <button
                        onClick={onShare}
                        className="w-10 h-10 rounded-2xl bg-[#ccff00] text-black shadow-[0_4px_16px_rgba(204,255,0,0.3)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                        title="Compartir planilla"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                )}
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
                <div
                    className={`flex-shrink-0 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 ${onDoubleClickLiveBadge && liveCnt > 0 ? 'cursor-pointer select-none' : ''}`}
                    title={onDoubleClickLiveBadge && liveCnt > 0 ? 'Doble clic: abrir sala marker (primer partido en vivo)' : undefined}
                    onDoubleClick={
                        onDoubleClickLiveBadge && liveCnt > 0
                            ? (e) => {
                                  e.preventDefault();
                                  onDoubleClickLiveBadge();
                              }
                            : undefined
                    }
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_4px_#10b981]" />
                    <span className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                        {liveCnt} En Vivo
                    </span>
                </div>
                <div className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    <span className="text-yellow-400 text-[9px] font-black uppercase tracking-widest">
                        {pendCnt} Por comenzar
                    </span>
                </div>
                <div className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                    <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest">
                        {finCnt} Finalizados
                    </span>
                </div>
            </div>
        </div>
    );
};
