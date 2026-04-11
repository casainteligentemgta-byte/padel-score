'use client';

import { useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Trophy, Target, Activity, Zap } from 'lucide-react';

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
    /** Versión más baja y densa (p. ej. hub móvil sin scroll). */
    compact?: boolean;
};

export default function PlayerCard({ player, stats, className = '', static: isStatic = false, compact = false }: PlayerCardProps) {
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

    const displayName = [player.name, player.lastName].filter(Boolean).join(' ') || 'CRACK';
    const categoryLabel = player.category || (player.level != null ? `Nivel ${player.level}` : 'Sin categoría');
    const ranking = stats?.ranking ?? '0';
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
            className={`relative w-full ${compact ? 'max-w-[280px]' : 'max-w-[320px]'} mx-auto rounded-2xl overflow-hidden ${className}`}
        >
            <div
                className={`relative rounded-2xl overflow-hidden border-2 border-brand/40 bg-surface transition-colors duration-300 shadow-[0_0_20px_rgba(204,255,0,0.12),0_0_40px_rgba(204,255,0,0.08),inset_0_0_60px_rgba(0,0,0,0.5)] ${compact ? 'px-2 pb-2 pt-0.5' : 'px-4 pb-4 pt-1'}`}
            >
                <h3
                    className={`font-black uppercase tracking-tight text-white truncate font-outfit max-w-full text-center ${compact ? 'text-[11px] leading-tight' : 'text-[13px] sm:text-[15px] md:text-[18px]'}`}
                    style={{ letterSpacing: '-0.02em' }}
                >
                    {displayName}
                </h3>
                <p
                    className={`font-black uppercase tracking-[0.15em] truncate text-brand text-center ${compact ? 'text-[8px] mt-0' : 'text-[10px] tracking-[0.2em] mt-0.5'}`}
                >
                    {categoryLabel}
                </p>

                {/* Estadísticas: Ranking, Títulos, Partidos, Puntos */}
                <div className={`flex flex-row items-center justify-between gap-px ${compact ? 'mt-1' : 'mt-1.5'}`}>
                    <div className="flex flex-1 min-w-0 flex-col items-center justify-center rounded border border-white/10 bg-white/[0.03] py-px px-px sm:py-0.5 sm:px-0.5">
                        <Target className={`mb-px text-brand shrink-0 ${compact ? 'w-3.5 h-3.5' : 'w-5 h-5 mb-0.5'}`} />
                        <span className={`font-black uppercase text-white/50 leading-tight ${compact ? 'text-[5px] tracking-wide' : 'text-[6px] tracking-widest'}`}>
                            Ranking
                        </span>
                        <span className={`font-black text-white tabular-nums ${compact ? 'text-[7px]' : 'text-[8px]'}`}>{ranking}</span>
                    </div>
                    <div className="flex flex-1 min-w-0 flex-col items-center justify-center rounded border border-white/10 bg-white/[0.03] py-px px-px sm:py-0.5 sm:px-0.5">
                        <Trophy className={`mb-px text-brand shrink-0 ${compact ? 'w-3.5 h-3.5' : 'w-5 h-5 mb-0.5'}`} />
                        <span className={`font-black uppercase text-white/50 leading-tight ${compact ? 'text-[5px] tracking-wide' : 'text-[6px] tracking-widest'}`}>
                            Títulos
                        </span>
                        <span className={`font-black text-white tabular-nums ${compact ? 'text-[7px]' : 'text-[8px]'}`}>{titles}</span>
                    </div>
                    <div className="flex flex-1 min-w-0 flex-col items-center justify-center rounded border border-white/10 bg-white/[0.03] py-px px-px sm:py-0.5 sm:px-0.5">
                        <Activity className={`mb-px text-brand shrink-0 ${compact ? 'w-3.5 h-3.5' : 'w-5 h-5 mb-0.5'}`} />
                        <span className={`font-black uppercase text-white/50 leading-tight ${compact ? 'text-[5px] tracking-wide' : 'text-[6px] tracking-widest'}`}>
                            Partidos
                        </span>
                        <span className={`font-black text-white tabular-nums ${compact ? 'text-[7px]' : 'text-[8px]'}`}>{played}</span>
                    </div>
                    <div className="flex flex-1 min-w-0 flex-col items-center justify-center rounded border border-white/10 bg-white/[0.03] py-px px-px sm:py-0.5 sm:px-0.5">
                        <Zap className={`mb-px text-brand shrink-0 ${compact ? 'w-3.5 h-3.5' : 'w-5 h-5 mb-0.5'}`} />
                        <span className={`font-black uppercase text-white/50 leading-tight ${compact ? 'text-[5px] tracking-wide' : 'text-[6px] tracking-widest'}`}>
                            Puntos
                        </span>
                        <span className={`font-black text-white tabular-nums ${compact ? 'text-[7px]' : 'text-[8px]'}`}>{points}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
