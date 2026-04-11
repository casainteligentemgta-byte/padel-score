'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { Mail, Check, X, Loader2, Award, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type InvitationManagerProps = {
    /** Hub móvil: tipografía y paddings reducidos, una columna */
    compact?: boolean;
};

export default function InvitationManager({ compact = false }: InvitationManagerProps) {
    const { user } = useAuth();
    const [invitations, setInvitations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

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

    return (
        <div className={compact ? 'space-y-2' : 'space-y-4'}>
            <div className={`flex items-center gap-2 ${compact ? 'mb-1' : 'mb-4'}`}>
                <Mail className="text-[#ccff00] shrink-0" size={compact ? 16 : 20} />
                <h2 className={`font-bold text-white leading-tight ${compact ? 'text-xs' : 'text-xl'}`}>
                    Invitaciones ({invitations.length})
                </h2>
            </div>

            <div
                className={
                    compact
                        ? 'grid grid-cols-1 gap-2'
                        : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                }
            >
                <AnimatePresence mode="popLayout">
                    {invitations.map((inv) => (
                        <motion.div
                            key={inv.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`bg-zinc-900 border border-zinc-800 relative overflow-hidden group ${compact ? 'rounded-xl p-3' : 'rounded-2xl p-5'}`}
                        >
                            {/* Accent highlight */}
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
                                        onClick={() => handleResponse(inv.id, 'accepted')}
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
                                        onClick={() => handleResponse(inv.id, 'rejected')}
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
        </div>
    );
}
