'use client';

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import type { PublicTrophy } from '@/lib/profileAchievementsServer';

const tierStyles: Record<
  PublicTrophy['tier'],
  { ring: string; glow: string; icon: string; sheen: string }
> = {
  gold: {
    ring: 'ring-amber-400/90 shadow-[0_0_28px_rgba(251,191,36,0.55)]',
    glow: 'from-amber-200/30 via-yellow-500/20 to-amber-700/10',
    icon: 'text-amber-200 drop-shadow-[0_0_12px_rgba(252,211,77,0.9)]',
    sheen: 'from-white/50 via-transparent to-amber-400/20',
  },
  silver: {
    ring: 'ring-slate-300/90 shadow-[0_0_24px_rgba(203,213,225,0.45)]',
    glow: 'from-slate-200/25 via-slate-400/15 to-slate-600/10',
    icon: 'text-slate-100 drop-shadow-[0_0_10px_rgba(226,232,240,0.85)]',
    sheen: 'from-white/45 via-transparent to-slate-300/25',
  },
  bronze: {
    ring: 'ring-orange-700/80 shadow-[0_0_22px_rgba(180,83,9,0.4)]',
    glow: 'from-orange-300/20 via-amber-800/15 to-orange-950/20',
    icon: 'text-orange-200 drop-shadow-[0_0_10px_rgba(251,146,60,0.7)]',
    sheen: 'from-orange-100/35 via-transparent to-orange-900/25',
  },
};

function formatAwardedAt(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

export function TrophyShowcase({ trophies }: { trophies: PublicTrophy[] }) {
  if (!trophies.length) {
    return (
      <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 py-12 border border-dashed border-white/10 rounded-3xl bg-zinc-950/40">
        Sin trofeos aún
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
      {trophies.map((t, i) => {
        const s = tierStyles[t.tier];
        return (
          <motion.div
            key={t.rowId}
            tabIndex={0}
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 260, damping: 22 }}
            className="group relative flex flex-col items-center rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-padel-primary/60"
          >
            <div
              className={`
                relative flex h-24 w-24 md:h-28 md:w-28 items-center justify-center rounded-full
                bg-gradient-to-br ${s.glow} ring-4 ${s.ring}
                before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-tr ${s.sheen}
                before:opacity-60 before:pointer-events-none
              `}
            >
              <Trophy className={`relative z-10 h-11 w-11 md:h-14 md:w-14 ${s.icon}`} strokeWidth={1.75} />
            </div>
            <div
              className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-[min(100%,14rem)] -translate-x-1/2 rounded-xl border border-white/10 bg-zinc-950/95 px-3 py-2 text-center opacity-0 shadow-xl backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
              role="tooltip"
            >
              <p className="text-xs font-black uppercase tracking-tight text-white">{t.title}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {formatAwardedAt(t.awardedAt)}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
