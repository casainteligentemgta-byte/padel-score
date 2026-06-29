'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { courtAdVideoNeedsIframe, toCourtAdVideoIframeSrc } from '@/lib/courtDisplayAdVideo';

type Props = {
  url: string;
  videoKey: string;
  className?: string;
  loop: boolean;
  onEnded?: () => void;
  onNativeVideoError?: () => void;
  title?: string;
};

function tryPlayVideo(el: HTMLVideoElement | null) {
  if (!el) return;
  const attempt = el.play();
  if (attempt && typeof attempt.catch === 'function') {
    attempt.catch(() => {});
  }
}

/**
 * Reproductor de publicidad: archivo (mp4/webm/…) con <video>, YouTube/embed con <iframe>.
 * Sin controles táctiles; autoplay continuo para TV.
 */
export function CourtAdVideoOrIframe({
  url,
  videoKey,
  className = 'w-full h-full object-cover',
  loop,
  onEnded,
  onNativeVideoError,
  title = 'Publicidad vídeo',
}: Props) {
  const [forceIframe, setForceIframe] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const ensurePlaying = useCallback(() => {
    tryPlayVideo(videoRef.current);
  }, []);

  useEffect(() => {
    setForceIframe(false);
  }, [url]);

  useEffect(() => {
    if (forceIframe || courtAdVideoNeedsIframe(url)) return;
    ensurePlaying();
  }, [url, videoKey, forceIframe, ensurePlaying]);

  useEffect(() => {
    if (forceIframe || courtAdVideoNeedsIframe(url)) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') ensurePlaying();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [url, forceIframe, ensurePlaying]);

  if (courtAdVideoNeedsIframe(url) || forceIframe) {
    return (
      <iframe
        key={videoKey}
        src={toCourtAdVideoIframeSrc(url)}
        className={`pointer-events-none border-0 ${className}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        title={title}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      key={videoKey}
      src={url}
      className={`pointer-events-none ${className}`}
      autoPlay
      muted
      playsInline
      loop={loop}
      controls={false}
      disablePictureInPicture
      controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
      onLoadedData={ensurePlaying}
      onCanPlay={ensurePlaying}
      onPause={(e) => {
        const el = e.currentTarget;
        if (el.ended && !loop) return;
        tryPlayVideo(el);
      }}
      onEnded={onEnded}
      onError={() => {
        setForceIframe(true);
        onNativeVideoError?.();
      }}
    />
  );
}
