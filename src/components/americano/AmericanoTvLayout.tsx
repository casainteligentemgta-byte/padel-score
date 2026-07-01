'use client';

import { useMemo } from 'react';
import { ExpressTvPublicidadDock } from '@/components/express/ExpressTvPublicidadDock';
import { AmericanoLeaderboard } from '@/components/americano/AmericanoLeaderboard';
import { useAmericanoRealtime } from '@/lib/americano/useAmericanoRealtime';
import { useCourtPlaylists } from '@/lib/useCourtPlaylists';

type Props = {
  sessionId: string;
  baseVenue: string;
  /** Cancha para playlists de publicidad (reutiliza cancha_publicidad existente). */
  canchaId?: string;
  showDiagnostics?: boolean;
};

export function AmericanoTvLayout({
  sessionId,
  baseVenue,
  canchaId = 'cancha_1',
  showDiagnostics = false,
}: Props) {
  const { loading, error, bundle } = useAmericanoRealtime(sessionId);
  const effectiveBaseVenue = baseVenue.trim() || bundle?.session.baseVenue || '';
  const playlists = useCourtPlaylists(canchaId, effectiveBaseVenue);
  const tickerMessages = playlists.tickerMessages;

  const sessionName = bundle?.session.name;
  const pointsGoal = bundle?.session.pointsGoal;
  const players = bundle?.players ?? [];

  const statusLine = useMemo(() => {
    if (loading) return 'Cargando clasificación…';
    if (error) return error;
    return null;
  }, [loading, error]);

  return (
    <div className="relative flex h-screen min-h-0 w-full max-w-none min-w-0 flex-col overflow-hidden bg-black font-outfit text-white select-none">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-[1] flex-col overflow-hidden border-b border-white/10">
          {statusLine && !bundle ? (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-neutral-400">
              {statusLine}
            </div>
          ) : (
            <AmericanoLeaderboard
              players={players}
              sessionName={sessionName}
              pointsGoal={pointsGoal}
            />
          )}
        </div>

        <ExpressTvPublicidadDock
          layout="inline"
          fillHeight
          canchaId={canchaId}
          baseVenue={baseVenue}
          playlistVenue={null}
          playlists={playlists}
          tickerMessages={tickerMessages}
          showDiagnostics={showDiagnostics}
        />
      </div>
    </div>
  );
}
