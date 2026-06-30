'use client';

import { useEffect } from 'react';
import { PizarraPublicidadFooter } from '@/components/pizarra/PizarraDisplayParts';
import { expressPublicidadVenueName } from '@/lib/expressPublicidad';
import type { CourtPlaylistsState } from '@/lib/useCourtPlaylists';

type Props = {
  canchaId: string;
  baseVenue: string;
  playlistVenue: string | null;
  playlists: CourtPlaylistsState;
  minimalMode?: boolean;
  mediaScale?: number;
  tickerMessages: { id: string; mensaje: string }[];
  /** overlay = absolute bottom (standby/QR); inline = flujo flex (partido en vivo). */
  layout?: 'overlay' | 'inline';
  /** Solo en ?debug=1: aviso técnico mínimo al pie del dock. */
  showDiagnostics?: boolean;
};

function ExpressPublicidadDiagnostics({
  baseVenue,
  playlistVenue,
  canchaId,
  playlists,
}: {
  baseVenue: string;
  playlistVenue: string | null;
  canchaId: string;
  playlists: CourtPlaylistsState;
}) {
  const venueSql = playlistVenue || expressPublicidadVenueName(baseVenue) || '(sin sede)';
  const noRows = playlists.rows.length === 0;
  const noImages = playlists.imageItems.length === 0;
  const noVideos = playlists.videoUrls.length === 0;

  if (!noRows && !noImages && !noVideos) return null;

  return (
    <p className="border-t border-red-500/15 bg-black/90 px-2 py-1 text-center font-mono text-[7px] leading-snug text-red-300/70">
      Sin publicidad · venue: {venueSql} · {canchaId} · filas {playlists.rows.length}
    </p>
  );
}

export function ExpressTvPublicidadDock({
  canchaId,
  baseVenue,
  playlistVenue,
  playlists,
  minimalMode,
  mediaScale,
  tickerMessages,
  layout = 'overlay',
  showDiagnostics = false,
}: Props) {
  const expressVenueName = expressPublicidadVenueName(baseVenue);

  useEffect(() => {
    const noRows = playlists.rows.length === 0;
    const noImages = playlists.imageItems.length === 0;
    const noVideos = playlists.videoUrls.length === 0;
    if (!noRows && !noImages && !noVideos) return;

    console.warn('[ExpressTvPublicidadDock] Sin publicidad cargada', {
      baseVenue: baseVenue || '(vacío)',
      expressVenueName,
      playlistVenue: playlistVenue || '(vacío)',
      canchaId,
      rows: playlists.rows.length,
      images: playlists.imageItems.length,
      videos: playlists.videoUrls.length,
    });
  }, [baseVenue, expressVenueName, playlistVenue, canchaId, playlists]);

  if (minimalMode) return null;

  const shellClass =
    layout === 'inline'
      ? 'relative z-10 w-full min-w-0 max-w-none flex-shrink-0 overflow-hidden border-t border-white/10 bg-[#050505]'
      : 'absolute bottom-0 left-0 right-0 z-20 flex w-full min-w-0 max-w-none flex-col items-stretch border-t border-white/10 bg-[#050505]';

  return (
    <div className={shellClass}>
      <PizarraPublicidadFooter
        canchaId={canchaId}
        playlists={playlists}
        mediaScale={mediaScale}
        expressImageCarousel
        tickerMessagesOverride={tickerMessages}
      />
      {showDiagnostics ? (
        <ExpressPublicidadDiagnostics
          baseVenue={baseVenue}
          playlistVenue={playlistVenue}
          canchaId={canchaId}
          playlists={playlists}
        />
      ) : null}
    </div>
  );
}
