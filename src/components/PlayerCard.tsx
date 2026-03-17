'use client';

import { useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { User, Trophy, Target, Activity, Zap } from 'lucide-react';

export type PlayerCardPlayer = {
    id: string;
    name: string;
    lastName?: string;
    photo?: string | null;
    level?: number;
    position?: string;
    category?: string;
};

export type PlayerCardStats = {
    ranking?: string;
    titles?: number;
    played?: number;
    points?: number;
};

type PlayerCardProps = {
    player: PlayerCardPlayer;
    stats?: PlayerCardStats | null;
    className?: string;
    /** Si es true, la carta no es clickeable y no hace tilt (solo visual). */
    static?: boolean;
};

export default function PlayerCard({ player, stats, className = '', static: isStatic = false }: PlayerCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-0.5, 0.5], [8, -8]);
    const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8]);
    const spring = { type: 'spring' as const, stiffness: 300, damping: 20 };
    const rotateXSpring = useSpring(rotateX, spring);
    const rotateYSpring = useSpring(rotateY, spring);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (isStatic || !cardRef.current) return;
            const rect = cardRef.current.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            const centerX = rect.left + w / 2;
            const centerY = rect.top + h / 2;
            const relX = (e.clientX - centerX) / w;
            const relY = (e.clientY - centerY) / h;
            x.set(relX);
            y.set(relY);
        },
        [isStatic, x, y]
    );
    const handleMouseLeave = useCallback(() => {
        x.set(0);
        y.set(0);
    }, [x, y]);

    const displayName = [player.name, player.lastName].filter(Boolean).join(' ') || 'Jugador';
    const categoryLabel = player.category || (player.level != null ? `Nivel ${player.level}` : 'Sin categoría');
    const ranking = stats?.ranking ?? '—';
    const titles = stats?.titles ?? 0;
    const played = stats?.played ?? 0;
    const points = stats?.points ?? 0;

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={
                isStatic
                    ? undefined
                    : {
                          rotateX: rotateXSpring,
                          rotateY: rotateYSpring,
                          transformPerspective: 800,
                      }
            }
            className={`relative w-full max-w-[320px] mx-auto rounded-2xl overflow-hidden ${className}`}
        >
            <div className="relative rounded-2xl overflow-hidden border-2 border-brand/40 bg-surface transition-colors duration-300 shadow-[0_0_20px_rgba(204,255,0,0.12),0_0_40px_rgba(204,255,0,0.08),inset_0_0_60px_rgba(0,0,0,0.5)]">
                {/* Foto con gradiente que funde con el fondo surface (#0a0a0a) */}
                <div className="relative h-44 sm:h-52 w-full">
                    {player.photo ? (
                        <img
                            src={player.photo}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover object-top"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                            <User className="w-16 h-16 text-zinc-600" strokeWidth={1.5} />
                        </div>
                    )}
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent 0%, transparent 35%, rgba(10,10,10,0.6) 70%, #0a0a0a 100%)' }} />
                    {/* Esquina tipo Panini */}
                    <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none border-l-2 border-b-2 border-brand/60 shadow-[_-2px_2px_12px_rgba(204,255,0,0.2)] bg-surface" style={{ background: 'linear-gradient(135deg, transparent 50%, #0a0a0a 50%)' }} />
                </div>

                {/* Contenido: nombre, categoría (badge #ccff00), stats con Ranking en brand */}
                <div className="relative px-4 pb-4 pt-1">
                    <h3 className="font-black uppercase tracking-tight text-white text-lg sm:text-xl truncate font-outfit" style={{ letterSpacing: '-0.02em' }}>
                        {displayName}
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-0.5 truncate text-brand">
                        {categoryLabel}
                    </p>

                    {/* Estadísticas: Ranking, Títulos, Partidos, Puntos (badges brand #ccff00) */}
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="flex flex-col items-center justify-center py-2 rounded-xl border border-white/10 bg-white/[0.03]">
                            <Target className="w-4 h-4 mb-1 text-brand" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Ranking</span>
                            <span className="text-sm font-black text-white tabular-nums mt-0.5">{ranking}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center py-2 rounded-xl border border-white/10 bg-white/[0.03]">
                            <Trophy className="w-4 h-4 mb-1 text-brand" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Títulos</span>
                            <span className="text-sm font-black text-white tabular-nums mt-0.5">{titles}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center py-2 rounded-xl border border-white/10 bg-white/[0.03]">
                            <Activity className="w-4 h-4 mb-1 text-brand" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Partidos</span>
                            <span className="text-sm font-black text-white tabular-nums mt-0.5">{played}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center py-2 rounded-xl border border-white/10 bg-white/[0.03]">
                            <Zap className="w-4 h-4 mb-1 text-brand" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Puntos</span>
                            <span className="text-sm font-black text-white tabular-nums mt-0.5">{points}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
