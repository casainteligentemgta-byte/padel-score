'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { Trophy, Calendar, MapPin, ChevronRight, Plus, RefreshCw, LogOut, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import LoginButton from '@/components/LoginButton';
import BottomNav from '@/components/BottomNav';

import Sidebar from '@/components/Sidebar';

export default function MyTournamentsPage() {
    const { user, loading: authLoading } = useAuth();
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

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 flex-shrink-0 pl-24 md:pl-28">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
                        <span className="text-padel-primary">Torneos</span>
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium uppercase tracking-widest text-[10px]">Gestiona tus competencias.</p>
                </div>
                <Link
                    href="/new-tournament"
                    className="bg-padel-primary text-black px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 hover:scale-105 transition-transform uppercase italic"
                >
                    NUEVO TORNEO <Plus className="w-5 h-5" />
                </Link>
            </div>

            <div className="ipad-scroll-area pb-32">
                <div className="max-w-6xl mx-auto min-h-[calc(100%+1px)]">
                    {tournaments.length === 0 ? (
                        <div className="glass p-12 text-center border-dashed border-2 border-white/5 space-y-6">
                            <div className="inline-flex p-6 rounded-full bg-white/5 text-gray-600 mb-4">
                                <Trophy className="w-12 h-12" />
                            </div>
                            <h2 className="text-2xl font-bold">No tienes torneos aún</h2>
                            <p className="text-gray-500">Comienza creando tu primer torneo profesional ahora mismo.</p>
                            <Link
                                href="/new-tournament"
                                className="inline-block border border-padel-primary/50 text-padel-primary px-8 py-4 rounded-xl font-black uppercase text-xs"
                            >
                                Crear mi primer torneo
                            </Link>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: gIdx * 0.1 }}
                                            key={key}
                                            className="group relative"
                                        >
                                            <div className="glass p-8 h-full border-white/5 hover:border-padel-primary/30 transition-all relative overflow-hidden flex flex-col">
                                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                                    <Trophy className="w-20 h-20" />
                                                </div>

                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="px-2 py-1 bg-padel-primary/10 text-padel-primary text-[8px] font-black rounded uppercase tracking-widest leading-none">
                                                            {isGrouped ? 'EVENTO UNIFICADO' : (first.type || 'AMERICANO_INDIVIDUAL').replace('_', ' ')}
                                                        </div>
                                                        {!isGrouped && (
                                                            <div className="px-2 py-1 bg-white/5 text-gray-400 text-[8px] font-black rounded uppercase tracking-widest leading-none">
                                                                {first.category}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4 group-hover:text-padel-primary transition-colors">
                                                    {isGrouped ? `Torneo ${first.complexName || 'Margarita Padel'}` : first.name}
                                                </h3>

                                                <div className="space-y-3 mb-6">
                                                    <div className="flex items-center gap-3 text-gray-500 text-xs">
                                                        <Calendar className="w-4 h-4 text-padel-primary" />
                                                        <span>{first.startDate ? new Date(first.startDate).toLocaleDateString() : 'Sin fecha'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-gray-500 text-xs">
                                                        <MapPin className="w-4 h-4 text-padel-primary" />
                                                        <span>{first.complexName || 'Margarita Padel'}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-auto space-y-2">
                                                    {groupTournaments.map(t => (
                                                        <Link key={t.id} href={`/tournaments/${t.id}`}>
                                                            <div className="flex items-center justify-between p-3 bg-white/5 hover:bg-padel-primary/10 rounded-xl border border-white/5 hover:border-padel-primary/30 transition-all group/btn">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-2 h-2 rounded-full bg-padel-primary" />
                                                                    <span className="text-[10px] font-black uppercase italic tracking-wider text-gray-300 group-hover/btn:text-padel-primary">
                                                                        Categoría {t.category}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(e, t.id); }}
                                                                        className="p-1.5 rounded-lg text-gray-700 hover:text-red-500 transition-colors"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                    <ChevronRight className="w-4 h-4 text-padel-primary" />
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

                    <footer className="mt-16 pt-8 border-t border-white/5 text-center">
                        <p className="text-[9px] font-black tracking-[0.3em] uppercase text-gray-700 italic">PADEL SMART Pro System • 2024</p>
                    </footer>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
