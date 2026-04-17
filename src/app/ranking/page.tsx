'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { Medal, Trophy, RefreshCw } from 'lucide-react';
import { BackButton } from '@/components/BackButton';
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
            <header className="sticky top-0 z-50 flex items-center gap-2 border-b border-white/5 bg-[#0a0a0a]/95 px-3 py-2.5 backdrop-blur-xl pt-[max(0.35rem,env(safe-area-inset-top))] sm:gap-3 sm:px-4 sm:py-3">
                <BackButton href="/dashboard" ariaLabel="Volver al inicio" className="shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-center">
                    <span className="inline-flex shrink-0 sm:hidden">
                        <BouncingBall size={22} />
                    </span>
                    <h1 className="text-lg font-black italic uppercase tracking-tighter text-white sm:text-xl md:text-2xl">
                        Ranking
                    </h1>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 sm:text-[10px]">
                        General y por torneo
                    </p>
                </div>
                <div className="h-10 w-10 shrink-0 sm:w-10" aria-hidden />
            </header>
            <main className="ipad-scroll-area px-4 pb-12 pt-4 sm:px-6">
                <div className="mx-auto w-full max-w-lg space-y-5 sm:max-w-4xl sm:space-y-6">
                    <div className="flex w-full flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
                        <div className="mx-auto flex w-full max-w-sm flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 sm:mx-0 sm:max-w-none sm:flex-row sm:gap-0">
                            <button
                                type="button"
                                onClick={() => setVista('general')}
                                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest sm:w-auto sm:px-5 sm:py-2.5 ${vista === 'general' ? 'bg-padel-primary text-black' : 'text-gray-500 hover:text-white'}`}
                            >
                                <Trophy className="h-4 w-4 shrink-0" /> General
                            </button>
                            <button
                                type="button"
                                onClick={() => setVista('torneo')}
                                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest sm:w-auto sm:px-5 sm:py-2.5 ${vista === 'torneo' ? 'bg-padel-primary text-black' : 'text-gray-500 hover:text-white'}`}
                            >
                                <Medal className="h-4 w-4 shrink-0" /> Por torneo
                            </button>
                        </div>
                        {vista === 'torneo' && tournaments.length > 0 && (
                            <select
                                value={torneoSeleccionado}
                                onChange={(e) => setTorneoSeleccionado(e.target.value)}
                                className="w-full max-w-sm self-center rounded-xl border border-white/20 bg-black/50 py-3 pl-4 pr-10 text-sm font-bold text-white appearance-none focus:border-padel-primary focus:outline-none sm:max-w-xs sm:py-2.5"
                            >
                                {tournaments.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <AnimatePresence mode="wait">
                        {vista === 'general' ? (
                            <motion.section key="general" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:rounded-3xl sm:p-6 md:p-8">
                                <h2 className="mb-3 text-base font-black uppercase tracking-wider text-padel-primary sm:text-lg">Ranking general</h2>
                                <p className="mb-4 text-sm text-gray-500">Clasificación global según resultados en todos los torneos.</p>
                                <div className="rounded-xl border border-white/5 bg-black/30 px-4 py-8 text-center sm:p-8">
                                    <Medal className="mx-auto mb-3 h-10 w-10 text-padel-primary/30 sm:h-12 sm:w-12" />
                                    <p className="text-sm text-gray-500">Los datos de ranking general se mostrarán aquí cuando estén disponibles.</p>
                                </div>
                            </motion.section>
                        ) : (
                            <motion.section key="torneo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:rounded-3xl sm:p-6 md:p-8">
                                <h2 className="mb-3 text-base font-black uppercase tracking-wider text-padel-primary sm:text-lg">Ranking del torneo</h2>
                                {tournaments.length === 0 ? (
                                    <p className="text-sm text-gray-500">No tienes torneos. Crea o participa en uno para ver el ranking por torneo.</p>
                                ) : (
                                    <div className="rounded-xl border border-white/5 bg-black/30 px-4 py-8 text-center sm:p-8">
                                        <Trophy className="mx-auto mb-3 h-10 w-10 text-padel-primary/30 sm:h-12 sm:w-12" />
                                        <p className="text-sm text-gray-500">El ranking del torneo seleccionado se mostrará aquí.</p>
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
