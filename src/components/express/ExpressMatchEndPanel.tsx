'use client';

import { Trophy, Flame, Play, Power } from 'lucide-react';
import type { ExpressMatch } from '@/types/expressMatch';
import {
  expressFormatDuration,
  expressChronoTotalSec,
  expressSetsSummary,
  expressWinnerLabel,
} from '@/lib/expressSessionMeta';

type ExpressMatchEndPanelProps = {
  match: ExpressMatch;
  onNewMatchWithWarmup: () => void;
  onNewMatchDirect: () => void;
  onEndSession: () => void;
  busy?: boolean;
};

export function ExpressMatchEndPanel({
  match,
  onNewMatchWithWarmup,
  onNewMatchDirect,
  onEndSession,
  busy,
}: ExpressMatchEndPanelProps) {
  const duration = expressFormatDuration(expressChronoTotalSec(match));
  const winner = expressWinnerLabel(match);
  const sets = expressSetsSummary(match);

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-padel-primary/30 bg-neutral-950 p-4 shadow-2xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-padel-primary/15">
            <Trophy className="h-6 w-6 text-padel-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">Partido finalizado</p>
            <h2 className="truncate text-lg font-black uppercase text-white">{winner}</h2>
            <p className="mt-1 text-xs text-neutral-400">
              Sets {sets} · {duration}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            disabled={busy}
            onClick={onNewMatchWithWarmup}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-padel-primary py-3 text-xs font-black uppercase tracking-wider text-black disabled:opacity-50"
          >
            <Flame className="h-4 w-4" />
            Nuevo partido · Calentamiento 5 min
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onNewMatchDirect}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-600 bg-neutral-900 py-3 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50"
          >
            <Play className="h-4 w-4 text-padel-primary" />
            Nuevo partido · Empezar ya
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onEndSession}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-[10px] font-bold uppercase tracking-wider text-red-400 disabled:opacity-50"
          >
            <Power className="h-3.5 w-3.5" />
            Finalizar y limpiar TV
          </button>
        </div>
      </div>
    </div>
  );
}
