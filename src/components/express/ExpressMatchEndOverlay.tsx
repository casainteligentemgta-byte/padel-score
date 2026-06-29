'use client';

import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ExpressMatch } from '@/types/expressMatch';
import {
  expressFormatDuration,
  expressChronoTotalSec,
  expressSetsSummary,
  expressWinnerLabel,
} from '@/lib/expressSessionMeta';

export function ExpressMatchEndOverlay({ match }: { match: ExpressMatch }) {
  const winner = expressWinnerLabel(match);
  const sets = expressSetsSummary(match);
  const duration = expressFormatDuration(expressChronoTotalSec(match));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pointer-events-none absolute inset-0 z-[90] flex items-end justify-center bg-gradient-to-t from-black via-black/70 to-transparent px-6 pb-16 pt-24"
    >
      <div className="max-w-2xl text-center">
        <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-padel-primary/40 bg-black/60 px-5 py-2 backdrop-blur-md">
          <Trophy className="h-5 w-5 text-padel-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.35em] text-padel-primary">
            Partido finalizado
          </span>
        </div>
        <h2
          className="font-black uppercase leading-tight text-white"
          style={{ fontSize: 'clamp(1.75rem, 5vw, 3.5rem)' }}
        >
          {winner}
        </h2>
        <p className="mt-3 text-sm font-bold uppercase tracking-[0.2em] text-neutral-400">
          {sets}
        </p>
        <p className="mt-2 font-mono text-lg font-black tabular-nums text-padel-primary">{duration}</p>
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-500">
          El marcador puede iniciar un nuevo partido desde el móvil
        </p>
      </div>
    </motion.div>
  );
}
