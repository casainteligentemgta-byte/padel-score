'use client';

import { Trophy } from 'lucide-react';
import type { AmericanoPlayer } from '@/lib/americano/logic';

type Props = {
  players: AmericanoPlayer[];
  sessionName?: string;
  pointsGoal?: number;
  compact?: boolean;
};

export function AmericanoLeaderboard({ players, sessionName, pointsGoal, compact }: Props) {
  const ranked = [...players].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return a.sortOrder - b.sortOrder;
  });

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-black px-4 py-3 sm:px-8 sm:py-5">
      <header className="mb-3 shrink-0 border-b border-amber-500/25 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-400/90">
          Americano
        </p>
        {sessionName ? (
          <h1 className="truncate text-lg font-black uppercase italic tracking-tight text-white sm:text-2xl">
            {sessionName}
          </h1>
        ) : null}
        {pointsGoal ? (
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Clasificación · partidos a {pointsGoal} pts
          </p>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-auto">
        {ranked.length === 0 ? (
          <p className="text-sm text-neutral-500">Sin jugadores.</p>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-500">
                <th className="pb-2 pr-2">#</th>
                <th className="pb-2">Jugador</th>
                <th className="pb-2 text-right">Pts</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((player, idx) => {
                const isLeader = idx === 0 && player.totalPoints > 0;
                return (
                  <tr
                    key={player.id}
                    className={`border-t border-white/5 ${
                      isLeader ? 'bg-amber-500/10' : idx % 2 === 0 ? 'bg-white/[0.02]' : ''
                    }`}
                  >
                    <td className={`py-2 pr-2 font-black ${compact ? 'text-sm' : 'text-base'} text-neutral-500`}>
                      {idx + 1}
                    </td>
                    <td className={`py-2 font-semibold ${compact ? 'text-sm' : 'text-base sm:text-xl'}`}>
                      <span className="inline-flex items-center gap-2">
                        {isLeader ? <Trophy className="h-4 w-4 shrink-0 text-amber-400" /> : null}
                        {player.name}
                      </span>
                    </td>
                    <td
                      className={`py-2 text-right font-black tabular-nums ${
                        compact ? 'text-lg' : 'text-xl sm:text-3xl'
                      } ${isLeader ? 'text-amber-300' : 'text-white'}`}
                    >
                      {player.totalPoints}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
