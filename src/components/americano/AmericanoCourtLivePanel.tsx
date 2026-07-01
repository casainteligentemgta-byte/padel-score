'use client';

import { useMemo } from 'react';
import { resolveCurrentCourtMatch } from '@/lib/americano/courtMarker';
import { playerNameById } from '@/lib/americano/logic';
import type { AmericanoMatch, AmericanoPlayer } from '@/lib/americano/logic';

type Props = {
  matches: AmericanoMatch[];
  players: Pick<AmericanoPlayer, 'id' | 'name'>[];
  courtNumber: number;
  pointsGoal?: number;
};

export function AmericanoCourtLivePanel({ matches, players, courtNumber, pointsGoal }: Props) {
  const match = useMemo(
    () => resolveCurrentCourtMatch(matches, courtNumber),
    [matches, courtNumber],
  );

  if (!match) return null;

  const teamA = `${playerNameById(players, match.playerA1Id)} / ${playerNameById(players, match.playerA2Id)}`;
  const teamB = `${playerNameById(players, match.playerB1Id)} / ${playerNameById(players, match.playerB2Id)}`;
  const goal = pointsGoal ?? match.pointsGoal;

  return (
    <div className="border-b border-amber-500/20 bg-gradient-to-b from-amber-500/10 to-black px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-amber-400">
            En vivo · Cancha {courtNumber} · Ronda {match.roundNumber}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            a {goal} pts
          </p>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
          <div className="min-w-0 text-right">
            <p className="truncate text-xs font-bold text-neutral-400 sm:text-sm">{teamA}</p>
            <p className="text-4xl font-black tabular-nums text-white sm:text-5xl">{match.scoreA}</p>
          </div>
          <span className="text-xl font-black text-neutral-600">–</span>
          <div className="min-w-0 text-left">
            <p className="truncate text-xs font-bold text-neutral-400 sm:text-sm">{teamB}</p>
            <p className="text-4xl font-black tabular-nums text-white sm:text-5xl">{match.scoreB}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
