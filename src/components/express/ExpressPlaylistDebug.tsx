'use client';

import { useEffect } from 'react';
import type { CourtPlaylistsState } from '@/lib/useCourtPlaylists';

type Props = {
  effectiveBaseVenue: string;
  playlistVenue: string | null;
  playlistVenueCandidates: string[];
  canchaId: string;
  playlists: CourtPlaylistsState;
};

export function ExpressPlaylistDebug({
  effectiveBaseVenue,
  playlistVenue,
  playlistVenueCandidates,
  canchaId,
  playlists,
}: Props) {
  useEffect(() => {
    console.log('--- [DEBUG SMARTPADEL58] ---');
    console.log('effectiveBaseVenue:', effectiveBaseVenue || '(vacío)');
    console.log('playlistVenue (1º candidato):', playlistVenue || '(vacío)');
    console.log('venue buscado en BD:', playlistVenue || '(sin filtro sede)');
    console.log('todos los candidatos:', playlistVenueCandidates);
    console.log('canchaId:', canchaId);
    console.log('rows BD (cancha_publicidad):', playlists.rows);
    console.log('imageItems:', playlists.imageItems);
    console.log('videoUrls:', playlists.videoUrls);
    console.log('currentImageUrl:', playlists.currentImageUrl);
    console.log('currentVideoUrl:', playlists.currentVideoUrl);

    if (playlists.rows.length === 0) {
      console.warn(
        '⚠️ Sin filas en cancha_publicidad. Revisa venue_name exacto (ej. "El Bodeguero · Express") y cancha_id.',
      );
    } else if (playlists.imageItems.length === 0) {
      console.warn(
        '⚠️ Hay filas pero sin imágenes. Revisa playlist_slot=imagen y media_content.tipo=imagen en admin.',
      );
    }
  }, [
    effectiveBaseVenue,
    playlistVenue,
    playlistVenueCandidates,
    canchaId,
    playlists.rows,
    playlists.imageItems,
    playlists.videoUrls,
    playlists.currentImageUrl,
    playlists.currentVideoUrl,
  ]);

  const venueHint = playlistVenue || effectiveBaseVenue || '(sin sede)';

  return (
    <div className="pointer-events-none fixed right-2 top-14 z-[100] max-w-[min(92vw,22rem)] rounded-lg border border-amber-500/50 bg-black/90 p-2.5 font-mono text-[9px] leading-relaxed text-amber-100 shadow-lg backdrop-blur-sm">
      <p className="mb-1 font-black uppercase tracking-widest text-amber-400">Debug playlist</p>
      <p>
        <span className="text-amber-500/80">sede:</span> {effectiveBaseVenue || '—'}
      </p>
      <p>
        <span className="text-amber-500/80">venue SQL:</span> {venueHint}
      </p>
      <p>
        <span className="text-amber-500/80">cancha:</span> {canchaId}
      </p>
      <p>
        <span className="text-amber-500/80">filas:</span> {playlists.rows.length} ·{' '}
        <span className="text-amber-500/80">imgs:</span> {playlists.imageItems.length} ·{' '}
        <span className="text-amber-500/80">vids:</span> {playlists.videoUrls.length}
      </p>
      {!playlists.currentImageUrl && !playlists.currentVideoUrl && (
        <p className="mt-1 text-red-400">Sin media en pantalla</p>
      )}
      <p className="mt-1 text-[8px] text-amber-500/60">Quita ?debug=1 en producción</p>
    </div>
  );
}
