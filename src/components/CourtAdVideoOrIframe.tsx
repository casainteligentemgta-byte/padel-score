'use client';

import { useEffect, useState } from 'react';
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

/**
 * Reproductor de publicidad: archivo (mp4/webm/…) con <video>, YouTube/embed con <iframe>.
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

  useEffect(() => {
    setForceIframe(false);
  }, [url]);

  if (courtAdVideoNeedsIframe(url) || forceIframe) {
    return (
      <iframe
        key={videoKey}
        src={toCourtAdVideoIframeSrc(url)}
        className={`border-0 ${className}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={title}
      />
    );
  }

  return (
    <video
      key={videoKey}
      src={url}
      className={className}
      autoPlay
      muted
      playsInline
      loop={loop}
      onEnded={onEnded}
      onError={() => {
        setForceIframe(true);
        onNativeVideoError?.();
      }}
    />
  );
}
