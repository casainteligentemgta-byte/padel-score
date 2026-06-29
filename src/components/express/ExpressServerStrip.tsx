'use client';

import { SmartPadelBallIcon } from '@/components/SmartPadelBallIcon';
import { expressServerLabel, type ExpressServer } from '@/lib/expressServer';

type Props = {
  server: ExpressServer;
  onSelect: (team: 1 | 2, player: 1 | 2) => void;
  onTogglePlayer: () => void;
  onToggleTeam: () => void;
};

const SERVER_BUTTONS: { team: 1 | 2; player: 1 | 2 }[] = [
  { team: 1, player: 1 },
  { team: 1, player: 2 },
  { team: 2, player: 1 },
  { team: 2, player: 2 },
];

export function ExpressServerStrip({ server, onSelect, onTogglePlayer, onToggleTeam }: Props) {
  return (
    <div className="shrink-0 space-y-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 px-2 py-1.5">
      <p className="text-center text-[8px] font-black uppercase tracking-[0.18em] text-neutral-500">
        Sacador: toca J1–J4
      </p>
      <div className="flex items-center justify-center gap-1">
        {SERVER_BUTTONS.map(({ team, player }) => {
          const active = server.team === team && server.player === player;
          const label = expressServerLabel(team, player);
          return (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(team, player)}
              className={`flex h-9 min-w-[2.5rem] flex-col items-center justify-center rounded-lg border-2 px-2 transition-colors ${
                active
                  ? 'border-padel-primary bg-padel-primary/10 text-padel-primary'
                  : 'border-neutral-700 bg-neutral-950 text-neutral-400 active:bg-neutral-800'
              }`}
              title={active ? 'Sacando' : `Asignar saque a ${label}`}
            >
              {active ? (
                <SmartPadelBallIcon size={14} title="Sacando" />
              ) : (
                <span className="text-[10px] font-black">{label}</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1">
        <button
          type="button"
          onClick={onTogglePlayer}
          className="rounded-lg border border-neutral-700 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-padel-primary/90 active:bg-neutral-800"
        >
          Otro jugador
        </button>
        <button
          type="button"
          onClick={onToggleTeam}
          className="rounded-lg border border-neutral-700 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-neutral-400 active:bg-neutral-800"
        >
          Cambiar pareja
        </button>
      </div>
    </div>
  );
}
