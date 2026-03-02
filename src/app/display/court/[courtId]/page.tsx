'use client';

import { useEffect, useState, use } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { rtdb } from '@/lib/rtdb';
import { useAdBanner } from '@/lib/useAdBanner';
import { MonitorOff, Megaphone, Wifi, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CourtDisplayPage({ params }: { params: Promise<{ courtId: string }> }) {
    const { courtId } = use(params);
    const canchaId = `cancha_${courtId}`;

    const [canchaData, setCanchaData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { currentImageUrl, isVisible: adVisible, mode: adMode } = useAdBanner();

    // ── Escuchar estado de la cancha en RTDB ───────────────────────────────
    useEffect(() => {
        if (!rtdb) return;
        const canchaRef = ref(rtdb, `canchas/${canchaId}`);
        const handler = (snap: any) => {
            setCanchaData(snap.val());
            setLoading(false);
        };
        onValue(canchaRef, handler, (err) => {
            console.error(`[CourtDisplay] Error:`, err);
            setLoading(false);
        });
        return () => off(canchaRef, 'value', handler);
    }, [canchaId]);

    const isEnVivo = canchaData?.estado === 'en_vivo';
    const marcador = canchaData?.marcador;

    // ── Loading ────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="h-screen bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-padel-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-padel-primary font-black uppercase tracking-[0.3em] text-[10px] italic">
                    Buscando Señal...
                </p>
            </div>
        </div>
    );

    // ── Estado ESPERA ──────────────────────────────────────────────────────
    if (!isEnVivo) {
        return (
            <div className="h-screen w-screen bg-[#050505] flex flex-col items-center justify-center text-white font-outfit relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_#ccff00_0%,_transparent_70%)]" />

                <div className="relative z-10 flex flex-col items-center gap-8">
                    <div className="p-12 bg-white/5 rounded-[4rem] border border-white/10 shadow-2xl backdrop-blur-xl relative">
                        <MonitorOff className="w-24 h-24 text-gray-700 animate-pulse" />
                        <div className="absolute -top-4 -right-4 bg-padel-primary text-black px-6 py-2 rounded-2xl font-black italic uppercase text-sm shadow-[0_10px_20px_rgba(204,255,0,0.3)]">
                            PISTA {courtId}
                        </div>
                    </div>
                    <div className="text-center">
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-2">
                            SEÑAL EN <span className="text-padel-primary">ESPERA</span>
                        </h1>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-sm">
                            No hay partidos en curso actualmente
                        </p>
                    </div>
                    <div className="mt-4 flex items-center gap-4 px-8 py-4 bg-white/5 rounded-2xl border border-white/10">
                        <Megaphone className="w-5 h-5 text-padel-primary" />
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                            Pronto volveremos con la mejor acción
                        </p>
                    </div>
                </div>

                {/* Publicidad en espera */}
                {adVisible && currentImageUrl && (
                    <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
                        <img
                            src={currentImageUrl}
                            alt="Publicidad"
                            className="w-full h-full object-cover opacity-40"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>
                )}

                <div className="absolute bottom-12 text-center opacity-20">
                    <p className="font-black italic uppercase tracking-[0.5em] text-xs">Smart Padel Pro System</p>
                </div>

                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                    .font-outfit { font-family: 'Outfit', sans-serif; }
                    body { background: #050505; margin: 0; overflow: hidden; }
                `}</style>
            </div>
        );
    }

    // ── Estado EN VIVO — Marcador completo ─────────────────────────────────
    return (
        <div className="h-screen w-screen bg-[#050505] text-white font-outfit flex flex-col overflow-hidden select-none">
            {/* Banda superior */}
            <div className="bg-black/60 backdrop-blur-xl border-b border-white/10 px-8 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">EN VIVO</span>
                    <Wifi className="w-3 h-3 text-green-400" />
                </div>
                <div className="bg-padel-primary text-black px-5 py-1 rounded-full font-black italic uppercase text-xs">
                    PISTA {courtId}
                </div>
                {marcador?.golden_point && (
                    <div className="flex items-center gap-2 text-yellow-400">
                        <Zap className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Punto de Oro</span>
                    </div>
                )}
            </div>

            {/* Marcador principal */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8">
                {/* Equipos y puntos */}
                <div className="w-full max-w-4xl">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-6">
                        {/* Equipo 1 */}
                        <TeamPanel
                            nombre={marcador?.equipo_1?.nombre || 'Equipo 1'}
                            color={marcador?.equipo_1?.color || '#CCFF00'}
                            sets={marcador?.sets?.local ?? 0}
                            games={marcador?.games?.local ?? 0}
                            puntos={marcador?.puntos?.local ?? '0'}
                            side="left"
                        />

                        {/* Divisor central */}
                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className="w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                            <span className="text-gray-700 font-black text-xl">VS</span>
                            <div className="w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                        </div>

                        {/* Equipo 2 */}
                        <TeamPanel
                            nombre={marcador?.equipo_2?.nombre || 'Equipo 2'}
                            color={marcador?.equipo_2?.color || '#FF5500'}
                            sets={marcador?.sets?.visitante ?? 0}
                            games={marcador?.games?.visitante ?? 0}
                            puntos={marcador?.puntos?.visitante ?? '0'}
                            side="right"
                        />
                    </div>
                </div>
            </div>

            {/* Banner de publicidad */}
            <AnimatePresence>
                {adVisible && currentImageUrl && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="relative h-28 border-t border-white/10 overflow-hidden flex-shrink-0"
                    >
                        <img
                            src={currentImageUrl}
                            alt="Publicidad"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
                        <div className="absolute top-2 right-4 text-[8px] font-black uppercase tracking-widest text-white/30">
                            {adMode === 'programada' ? '⏱ Promo' : 'Publicidad'}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                .font-outfit { font-family: 'Outfit', sans-serif; }
                body { background: #050505; margin: 0; overflow: hidden; }
            `}</style>
        </div>
    );
}

// ── Panel de equipo en el marcador ─────────────────────────────────────────
function TeamPanel({ nombre, color, sets, games, puntos, side }: {
    nombre: string;
    color: string;
    sets: number;
    games: number;
    puntos: string;
    side: 'left' | 'right';
}) {
    return (
        <div className={`flex flex-col items-center gap-4 ${side === 'right' ? 'text-right items-end' : 'text-left items-start'}`}>
            {/* Nombre */}
            <div
                className="font-black italic uppercase tracking-tighter text-2xl md:text-3xl truncate max-w-full"
                style={{ color }}
            >
                {nombre}
            </div>

            {/* Puntos grandes */}
            <motion.div
                key={puntos}
                initial={{ scale: 1.3, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-black italic text-[8rem] leading-none tracking-tighter"
                style={{ color }}
            >
                {puntos}
            </motion.div>

            {/* Games y Sets */}
            <div className="flex items-center gap-6">
                <div className="text-center">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-600">Sets</p>
                    <p className="font-black text-3xl" style={{ color }}>{sets}</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-600">Games</p>
                    <p className="font-black text-3xl text-white">{games}</p>
                </div>
            </div>
        </div>
    );
}
