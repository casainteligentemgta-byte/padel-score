'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { Medal, Trophy, RefreshCw, ChevronDown } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { BouncingBall } from '@/components/BouncingBall';
import LoginButton from '@/components/LoginButton';
import { motion, AnimatePresence } from 'framer-motion';

type VistaRanking = 'general' | 'torneo';

export default function RankingPage() {
    const { user, loading: authLoading } = useAuth();
    const [vista, setVista] = useState<VistaRanking>('general');
    const [tournaments, setTournaments] = useState<{ id: string; name: string }[]>([]);
    const [torneoSeleccionado, setTorneoSeleccionado] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const list = await dataService.getMyTournaments(user.uid);
                if (!cancelled) {
                    setTournaments(list.map((t: any) => ({ id: t.id, name: t.name || t.tournamentName || 'Sin nombre' })));
                    if (list.length > 0) setTorneoSeleccionado((prev) => prev || list[0].id);
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [user]);

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
                <Medal className="w-20 h-20 text-padel-primary/20 mb-8" />
                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Inicia Sesión</h1>
                <p className="text-gray-500 max-w-md mb-8">Inicia sesión para ver el ranking.</p>
                <LoginButton />
            </div>
        );
    }

    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white font-outfit relative">
            <Sidebar />
            <div className="flex items-center gap-3 mb-6 pl-20 md:pl-24 pr-4 pt-6">
                <BouncingBall size={28} />
                <div>
                    <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">Ranking</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">General y por torneo</p>
                </div>
            </div>
            <main className="ipad-scroll-area pl-20 md:pl-24 pr-4 pb-12">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10">
                            <button
                                onClick={() => setVista('general')}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ${vista === 'general' ? 'bg-padel-primary text-black' : 'text-gray-500 hover:text-white'}`}
                            >
                                <Trophy className="w-4 h-4" /> General
                            </button>
                            <button
                                onClick={() => setVista('torneo')}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ${vista === 'torneo' ? 'bg-padel-primary text-black' : 'text-gray-500 hover:text-white'}`}
                            >
                                <Medal className="w-4 h-4" /> Por torneo
                            </button>
                        </div>
                        {vista === 'torneo' && tournaments.length > 0 && (
                            <select
                                value={torneoSeleccionado}
                                onChange={(e) => setTorneoSeleccionado(e.target.value)}
                                className="bg-black/50 border border-white/20 rounded-xl pl-4 pr-10 py-2.5 text-sm font-bold text-white appearance-none focus:border-padel-primary focus:outline-none"
                            >
                                {tournaments.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <AnimatePresence mode="wait">
                        {vista === 'general' ? (
                            <motion.section key="general" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#111] border border-white/10 rounded-3xl p-6 md:p-8">
                                <h2 className="text-lg font-black uppercase tracking-wider text-padel-primary mb-4">Ranking general</h2>
                                <p className="text-gray-500 text-sm mb-6">Clasificación global según resultados en todos los torneos.</p>
                                <div className="rounded-xl bg-black/30 border border-white/5 p-8 text-center">
                                    <Medal className="w-12 h-12 text-padel-primary/30 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">Los datos de ranking general se mostrarán aquí cuando estén disponibles.</p>
                                </div>
                            </motion.section>
                        ) : (
                            <motion.section key="torneo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#111] border border-white/10 rounded-3xl p-6 md:p-8">
                                <h2 className="text-lg font-black uppercase tracking-wider text-padel-primary mb-4">Ranking del torneo</h2>
                                {tournaments.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No tienes torneos. Crea o participa en uno para ver el ranking por torneo.</p>
                                ) : (
                                    <div className="rounded-xl bg-black/30 border border-white/5 p-8 text-center">
                                        <Trophy className="w-12 h-12 text-padel-primary/30 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">El ranking del torneo seleccionado se mostrará aquí.</p>
                                    </div>
                                )}
                            </motion.section>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
