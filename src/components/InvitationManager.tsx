'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { Mail, Check, X, Loader2, Award, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InvitationManager() {
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
            <div className="flex items-center justify-center p-8 bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
                <Loader2 className="text-[#ccff00] animate-spin" size={24} />
            </div>
        );
    }

    // Sin invitaciones: no mostrar nada (accesos Ranking / Mi cuenta eliminados)
    if (invitations.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Mail className="text-[#ccff00]" size={20} />
                <h2 className="text-xl font-bold text-white">Invitaciones Pendientes ({invitations.length})</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                    {invitations.map((inv) => (
                        <motion.div
                            key={inv.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden group"
                        >
                            {/* Accent highlight */}
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#ccff00] opacity-50" />

                            <div className="flex flex-col gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs font-bold text-[#ccff00] uppercase tracking-wider">
                                        <Calendar size={12} />
                                        {inv.tournament_name}
                                    </div>
                                    <h3 className="text-lg font-bold text-white">
                                        De: {inv.inviter_name}
                                    </h3>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700">
                                        <Award size={12} />
                                        Categoría: {inv.category}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleResponse(inv.id, 'accepted')}
                                        disabled={!!processing}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#ccff00] text-black font-bold text-sm hover:bg-[#b8e600] disabled:opacity-50 transition-all"
                                    >
                                        {processing === inv.id ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <>
                                                <Check size={16} />
                                                Aceptar invitación
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleResponse(inv.id, 'rejected')}
                                        disabled={!!processing}
                                        className="aspect-square flex items-center justify-center rounded-xl border border-zinc-700 text-zinc-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all"
                                    >
                                        <X size={20} />
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
