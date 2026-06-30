'use client';

import { SmartPadelBallIcon } from '@/components/SmartPadelBallIcon';
import { expressServerLabel, type ExpressServer } from '@/lib/expressServer';

type Props = {
  server: ExpressServer;
  onSelect: (team: 1 | 2, player: 1 | 2) => void;
};

const SERVER_BUTTONS: { team: 1 | 2; player: 1 | 2 }[] = [
  { team: 1, player: 1 },
  { team: 1, player: 2 },
  { team: 2, player: 1 },
  { team: 2, player: 2 },
];

export function ExpressServerStrip({ server, onSelect }: Props) {
  return (
    <div className="shrink-0 rounded-xl border border-neutral-800 bg-neutral-900/80 px-2 py-1.5">
      <p className="mb-1 text-center text-[8px] font-black uppercase tracking-[0.18em] text-neutral-500">
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
                  ? 'border-padel-primary bg-padel-primary/20 text-padel-primary'
                  : 'border-neutral-600 bg-neutral-950 text-neutral-200 active:bg-neutral-800'
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
    </div>
  );
}
