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
};

function ExpressPublicidadEmptyHint({
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
    <div className="border-b border-red-500/30 bg-red-950/80 px-3 py-2 text-center backdrop-blur-sm">
      <p className="text-[10px] font-black uppercase tracking-widest text-red-400">
        Publicidad no cargada
      </p>
      <p className="mt-1 font-mono text-[9px] leading-relaxed text-red-200/90">
        Buscando venue: &apos;{venueSql}&apos;
      </p>
      <p className="font-mono text-[9px] text-red-200/70">
        cancha: {canchaId} · filas BD: {playlists.rows.length} · imgs: {playlists.imageItems.length}{' '}
        · vids: {playlists.videoUrls.length}
      </p>
      {noRows && (
        <p className="mt-1 text-[8px] text-red-300/80">
          Sin filas en cancha_publicidad — configura Admin → Express · Publicidad
        </p>
      )}
      {!noRows && noImages && (
        <p className="mt-1 text-[8px] text-red-300/80">
          Hay filas pero sin imágenes — revisa playlist_slot=imagen en admin
        </p>
      )}
    </div>
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
}: Props) {
  const expressVenueName = expressPublicidadVenueName(baseVenue);

  useEffect(() => {
    console.log('--- [ExpressTvPublicidadDock] ---');
    console.log('base_venue actual:', baseVenue || '(vacío)');
    console.log('expressPublicidadVenueName(base_venue):', expressVenueName);
    console.log('playlistVenue (filtro 1º en hook):', playlistVenue || '(vacío)');
    console.log('canchaId:', canchaId);
    console.log('playlists (CourtPlaylistsState):', playlists);
    console.log('imageItems:', playlists.imageItems);
    console.log('videoUrls:', playlists.videoUrls);
    console.log('rows cancha_publicidad:', playlists.rows);

    if (playlists.rows.length === 0) {
      console.warn(
        `⚠️ Sin filas para venue '${playlistVenue || expressVenueName}' y cancha '${canchaId}'.`,
      );
    } else if (playlists.imageItems.length === 0) {
      console.warn('⚠️ Filas presentes pero imageItems vacío — revisa tipo/slot imagen.');
    }
  }, [baseVenue, expressVenueName, playlistVenue, canchaId, playlists]);

  if (minimalMode) return null;

  const shellClass =
    layout === 'inline'
      ? 'relative z-10 w-full min-w-0 max-w-none flex-shrink-0 overflow-hidden border-t border-white/10 bg-[#050505]'
      : 'absolute bottom-0 left-0 right-0 z-20 flex w-full min-w-0 max-w-none flex-col items-stretch border-t border-white/10 bg-[#050505]';

  return (
    <div className={shellClass}>
      <ExpressPublicidadEmptyHint
        baseVenue={baseVenue}
        playlistVenue={playlistVenue}
        canchaId={canchaId}
        playlists={playlists}
      />
      <PizarraPublicidadFooter
        canchaId={canchaId}
        playlists={playlists}
        mediaScale={mediaScale}
        expressImageCarousel
        tickerMessagesOverride={tickerMessages}
      />
    </div>
  );
}
