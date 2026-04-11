'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { Mail, Check, X, Loader2, Award, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type InvitationManagerProps = {
    /** Hub móvil: tipografía y paddings reducidos, una columna */
    compact?: boolean;
    /** Una franja fija; el listado completo va a modal (pantalla hub sin scroll) */
    singlePageStrip?: boolean;
};

function InvitationCards({
    invitations,
    compact,
    processing,
    onRespond,
}: {
    invitations: any[];
    compact: boolean;
    processing: string | null;
    onRespond: (id: string, status: 'accepted' | 'rejected') => void;
}) {
    return (
        <div className={compact ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
            <AnimatePresence mode="popLayout">
                {invitations.map((inv) => (
                    <motion.div
                        key={inv.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`bg-zinc-900 border border-zinc-800 relative overflow-hidden group ${compact ? 'rounded-xl p-3' : 'rounded-2xl p-5'}`}
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#ccff00] opacity-50" />

                        <div className={`flex flex-col ${compact ? 'gap-2' : 'gap-4'}`}>
                            <div className={compact ? 'space-y-0.5' : 'space-y-1'}>
                                <div
                                    className={`flex items-center gap-1.5 font-bold text-[#ccff00] uppercase tracking-wider ${compact ? 'text-[9px] leading-tight' : 'text-xs'}`}
                                >
                                    <Calendar size={compact ? 10 : 12} className="shrink-0" />
                                    <span className="min-w-0 break-words">{inv.tournament_name}</span>
                                </div>
                                <h3 className={`font-bold text-white ${compact ? 'text-xs leading-snug' : 'text-lg'}`}>
                                    De: {inv.inviter_name}
                                </h3>
                                <div
                                    className={`inline-flex items-center gap-1 rounded-full bg-zinc-800 text-zinc-300 font-medium border border-zinc-700 ${compact ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-0.5 text-xs gap-1.5'}`}
                                >
                                    <Award size={compact ? 10 : 12} />
                                    {inv.category}
                                </div>
                            </div>

                            <div className={`flex gap-1.5 ${compact ? 'flex-col' : 'flex-row'}`}>
                                <button
                                    type="button"
                                    onClick={() => onRespond(inv.id, 'accepted')}
                                    disabled={!!processing}
                                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#ccff00] text-black font-bold hover:bg-[#b8e600] disabled:opacity-50 transition-all ${compact ? 'py-2 text-[11px]' : 'gap-2 py-2.5 text-sm'}`}
                                >
                                    {processing === inv.id ? (
                                        <Loader2 size={compact ? 14 : 16} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Check size={compact ? 14 : 16} />
                                            {compact ? 'Aceptar' : 'Aceptar invitación'}
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onRespond(inv.id, 'rejected')}
                                    disabled={!!processing}
                                    className={`flex items-center justify-center rounded-xl border border-zinc-700 text-zinc-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all ${compact ? 'h-9 w-full text-[11px] font-bold' : 'aspect-square'}`}
                                >
                                    <X size={compact ? 18 : 20} />
                                    {compact ? <span className="ml-1">Rechazar</span> : null}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

export default function InvitationManager({ compact = false, singlePageStrip = false }: InvitationManagerProps) {
    const { user } = useAuth();
    const [invitations, setInvitations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [stripModalOpen, setStripModalOpen] = useState(false);

    const fetchInvitations = async () => {
        if (!user) return;
        try {
            const data = await dataService.getMyInvitations(user.uid);
            setInvitations(data);
        } catch (err) {
            console.error('Error fetching invitations:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, [user]);

    useEffect(() => {
        if (invitations.length === 0) setStripModalOpen(false);
    }, [invitations.length]);

    const handleResponse = async (id: string, status: 'accepted' | 'rejected') => {
        setProcessing(id);
        try {
            await dataService.respondToInvitation(id, status);
            setInvitations(prev => prev.filter(inv => inv.id !== id));
        } catch (err) {
            console.error('Error responding to invitation:', err);
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        if (singlePageStrip) {
            return (
                <div className="flex h-8 w-full shrink-0 items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40">
                    <Loader2 className="animate-spin text-[#ccff00]" size={16} />
                </div>
            );
        }
        return (
            <div
                className={`flex items-center justify-center bg-zinc-900/30 rounded-2xl border border-zinc-800/50 ${compact ? 'p-4' : 'p-8'}`}
            >
                <Loader2 className="text-[#ccff00] animate-spin" size={compact ? 18 : 24} />
            </div>
        );
    }

    // Sin invitaciones: no mostrar nada (accesos Ranking / Mi cuenta eliminados)
    if (invitations.length === 0) {
        return null;
    }

    if (singlePageStrip) {
        return (
            <>
                <button
                    type="button"
                    onClick={() => setStripModalOpen(true)}
                    className="flex h-9 w-full shrink-0 items-center justify-between gap-2 rounded-lg border border-[#ccff00]/35 bg-zinc-900/70 px-2.5 py-1 text-left transition-colors hover:bg-zinc-900 active:scale-[0.99]"
                >
                    <span className="flex min-w-0 items-center gap-2">
                        <Mail className="shrink-0 text-[#ccff00]" size={15} />
                        <span className="truncate text-[10px] font-black uppercase tracking-wide text-white">
                            {invitations.length} invitación{invitations.length > 1 ? 'es' : ''} pendiente
                            {invitations.length > 1 ? 's' : ''}
                        </span>
                    </span>
                    <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-[#ccff00]">Ver</span>
                </button>

                {stripModalOpen && (
                    <div
                        className="fixed inset-0 z-[200] flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="hub-invitations-title"
                        onClick={() => setStripModalOpen(false)}
                    >
                        <div
                            className="flex max-h-[88dvh] w-full max-w-lg flex-col rounded-t-2xl border border-white/10 bg-[#0c0c0c] shadow-2xl sm:rounded-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
                                <h2 id="hub-invitations-title" className="text-sm font-black uppercase tracking-tight text-white">
                                    Invitaciones
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setStripModalOpen(false)}
                                    className="rounded-lg border border-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/80 hover:bg-white/10"
                                >
                                    Cerrar
                                </button>
                            </div>
                            <div className="min-h-0 max-h-[min(72dvh,520px)] overflow-y-auto overscroll-contain px-3 pb-6 pt-2">
                                <InvitationCards
                                    invitations={invitations}
                                    compact
                                    processing={processing}
                                    onRespond={handleResponse}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <div className={compact ? 'space-y-2' : 'space-y-4'}>
            <div className={`flex items-center gap-2 ${compact ? 'mb-1' : 'mb-4'}`}>
                <Mail className="text-[#ccff00] shrink-0" size={compact ? 16 : 20} />
                <h2 className={`font-bold text-white leading-tight ${compact ? 'text-xs' : 'text-xl'}`}>
                    Invitaciones ({invitations.length})
                </h2>
            </div>

            <InvitationCards
                invitations={invitations}
                compact={compact}
                processing={processing}
                onRespond={handleResponse}
            />
        </div>
    );
}
