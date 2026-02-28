'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { Trophy, Calendar, MapPin, ChevronRight, Plus, RefreshCw, LogOut, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import LoginButton from '@/components/LoginButton';

import Sidebar from '@/components/Sidebar';
import { BouncingBall } from '@/components/BouncingBall';
import { formatDate } from '@/lib/formatters';

export default function MyTournamentsPage() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTournaments = async () => {
        if (user) {
            try {
                const data = await dataService.getMyTournaments(user.uid);
                setTournaments(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (!authLoading && user) loadTournaments();
        else if (!authLoading && !user) setLoading(false);
    }, [user, authLoading]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm('¿Estás seguro de eliminar este torneo? Esta acción no se puede deshacer.')) return;

        try {
            await dataService.deleteTournament(id);
            setTournaments(tournaments.filter(t => t.id !== id));
        } catch (error) {
            console.error(error);
            alert('Error al eliminar el torneo');
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-padel-primary animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
                <Trophy className="w-20 h-20 text-padel-primary/20 mb-8" />
                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Inicia Sesión</h1>
                <p className="text-gray-500 max-w-md mb-8">Necesitas estar autenticado para ver y gestionar tus torneos personalizados.</p>
                <LoginButton />
            </div>
        );
    }

    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white font-outfit relative">
            <Sidebar />

            {/* ── Header compacto ── */}
            <div className="flex items-center justify-between gap-3 mb-2 flex-shrink-0 pl-20 md:pl-24 pr-4">
                <div className="flex items-center gap-3">
                    <BouncingBall size={28} />
                    <div>
                        <h1 className="title-page leading-none">
                            <span className="text-padel-primary">Torneos</span>
                        </h1>
                        <p className="subtitle-page text-gray-600 mt-0.5">Gestiona tus competencias</p>
                    </div>
                </div>
            </div>

            {/* ── Lista scrollable ── */}
            <div className="ipad-scroll-area pb-2">
                <div className="max-w-6xl mx-auto">
                    {tournaments.length === 0 ? (
                        <div className="glass p-8 text-center border-dashed border-2 border-white/5 space-y-6">
                            <div className="inline-flex p-4 rounded-full bg-white/5 text-gray-600">
                                <Trophy className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold">No tienes torneos aún</h2>
                            <p className="text-gray-500 text-sm">Próximamente verás aquí la lista de tus competencias activas.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {(() => {
                                // Group tournaments by date and location
                                const groups: { [key: string]: any[] } = {};
                                tournaments.forEach(t => {
                                    const key = `${t.startDate || 'no-date'}_${t.complexName || 'Margarita Padel'}`;
                                    if (!groups[key]) groups[key] = [];
                                    groups[key].push(t);
                                });

                                return Object.entries(groups).map(([key, groupTournaments], gIdx) => {
                                    const first = groupTournaments[0];
                                    const isGrouped = groupTournaments.length > 1;

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: gIdx * 0.07 }}
                                            key={key}
                                            className="group relative"
                                        >
                                            <div className="glass p-4 h-full border-white/5 hover:border-padel-primary/30 transition-all relative overflow-hidden flex flex-col">
                                                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-15 transition-opacity">
                                                    <Trophy className="w-14 h-14" />
                                                </div>

                                                {/* Badge row */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="px-2 py-0.5 bg-padel-primary/10 text-padel-primary text-[8px] font-black rounded uppercase tracking-widest leading-none">
                                                        {isGrouped ? 'EVENTO UNIFICADO' : (first.type || 'AMERICANO_INDIVIDUAL').replace('_', ' ')}
                                                    </div>
                                                    {!isGrouped && (
                                                        <div className="px-2 py-0.5 bg-white/5 text-gray-400 text-[8px] font-black rounded uppercase tracking-widest leading-none">
                                                            {first.category}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Título */}
                                                <h3 className="text-base font-black italic uppercase tracking-tighter mb-2 group-hover:text-padel-primary transition-colors leading-tight">
                                                    {isGrouped ? `Torneo ${first.complexName || 'Margarita Padel'}` : first.name}
                                                </h3>

                                                {/* Meta info */}
                                                <div className="flex flex-col gap-1 mb-3">
                                                    <div className="flex items-center gap-2 text-gray-500 text-[11px]">
                                                        <Calendar className="w-3 h-3 text-padel-primary flex-shrink-0" />
                                                        <span>{formatDate(first.startDate)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-500 text-[11px]">
                                                        <MapPin className="w-3 h-3 text-padel-primary flex-shrink-0" />
                                                        <span>{first.complexName || 'Margarita Padel'}</span>
                                                    </div>
                                                </div>

                                                {/* Botones de acceso */}
                                                <div className="mt-auto space-y-1.5">
                                                    {isGrouped && (
                                                        <Link href={`/tournaments/event?ids=${groupTournaments.map(t => t.id).join(',')}`}>
                                                            <div className="flex items-center justify-between px-3 py-2 mb-1 bg-padel-primary/10 hover:bg-padel-primary/20 rounded-xl border border-padel-primary/30 hover:border-padel-primary/60 transition-all group/btn">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-5 h-5 rounded-full bg-padel-primary flex items-center justify-center flex-shrink-0">
                                                                        <Trophy className="w-2.5 h-2.5 text-black" />
                                                                    </div>
                                                                    <span className="text-[10px] font-black uppercase italic tracking-wider text-padel-primary">
                                                                        Ver Evento Completo
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <button
                                                                        onClick={async (e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            if (!confirm(`¿Eliminar este evento completo (${groupTournaments.length} categorías)? No se puede deshacer.`)) return;
                                                                            try {
                                                                                await Promise.all(groupTournaments.map(t => dataService.deleteTournament(t.id)));
                                                                                setTournaments(prev => prev.filter(t => !groupTournaments.some(g => g.id === t.id)));
                                                                            } catch {
                                                                                alert('Error al eliminar el evento');
                                                                            }
                                                                        }}
                                                                        className="p-1 rounded-lg text-padel-primary/40 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                                                        title="Eliminar evento completo"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                    <ChevronRight className="w-3.5 h-3.5 text-padel-primary" />
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    )}
                                                    {groupTournaments.map(t => (
                                                        <Link key={t.id} href={`/tournaments/${t.id}`}>
                                                            <div className="flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-padel-primary/10 rounded-xl border border-white/5 hover:border-padel-primary/30 transition-all group/btn">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-padel-primary flex-shrink-0" />
                                                                    <span className="text-[10px] font-black uppercase italic tracking-wider text-gray-300 group-hover/btn:text-padel-primary">
                                                                        Categoría {t.category}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <button
                                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(e, t.id); }}
                                                                        className="p-1 rounded-lg text-gray-700 hover:text-red-500 transition-colors"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                    <ChevronRight className="w-3.5 h-3.5 text-padel-primary" />
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                });
                            })()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
