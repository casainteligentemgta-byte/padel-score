'use client';

import { Flame, Play } from 'lucide-react';
import { PizarraCenterChrono } from '@/components/pizarra/PizarraDisplayParts';
import { expressFormatDuration } from '@/lib/expressSessionMeta';

type ChronoCron = {
  elapsedSec?: number;
  running?: boolean;
  startedAt?: number | null;
};

type ExpressMatchCenterPanelProps = {
  warmupActive: boolean;
  warmupRemainingSec: number;
  awaitingStart: boolean;
  showChrono: boolean;
  chronoCron: ChronoCron | null;
  busy?: boolean;
  onStartMatch: () => void;
  onStartWarmup: () => void;
};

export function ExpressMatchCenterPanel({
  warmupActive,
  warmupRemainingSec,
  awaitingStart,
  showChrono,
  chronoCron,
  busy,
  onStartMatch,
  onStartWarmup,
}: ExpressMatchCenterPanelProps) {
  if (warmupActive) {
    return (
      <div className="flex flex-col items-center justify-center gap-0.5 py-0">
        <span className="text-[7px] font-black uppercase tracking-[0.28em] text-padel-primary sm:text-[8px] sm:tracking-[0.32em]">
          Calentamiento
        </span>
        <span className="font-mono text-[clamp(1rem,5.5vw,1.6rem)] font-black tabular-nums leading-none text-white">
          {expressFormatDuration(Math.max(0, warmupRemainingSec))}
        </span>
      </div>
    );
  }

  if (awaitingStart) {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <button
          type="button"
          disabled={busy}
          onClick={onStartMatch}
          className="flex min-w-[9.5rem] items-center justify-center gap-1.5 rounded-xl bg-padel-primary px-3 py-2 text-[10px] font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(204,255,0,0.2)] disabled:opacity-50"
        >
          <Play className="h-3.5 w-3.5 shrink-0" />
          Iniciar partido
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onStartWarmup}
          className="flex min-w-[9.5rem] items-center justify-center gap-1.5 rounded-xl border border-padel-primary/40 bg-padel-primary/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-padel-primary disabled:opacity-50"
        >
          <Flame className="h-3.5 w-3.5 shrink-0" />
          5 min calentamiento
        </button>
      </div>
    );
  }

  if (showChrono && chronoCron) {
    return <PizarraCenterChrono cron={chronoCron} compact />;
  }

  return null;
}
