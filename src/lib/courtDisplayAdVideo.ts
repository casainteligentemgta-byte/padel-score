/**
 * URLs de publicidad en pizarra: <video> solo reproduce archivos directos;
 * YouTube / embeds requieren iframe.
 */

export function courtAdVideoNeedsIframe(url: string): boolean {
  const u = (url || '').trim().toLowerCase();
  if (!u) return false;
  return (
    u.includes('youtube.com') ||
    u.includes('youtu.be') ||
    u.includes('vimeo.com') ||
    u.includes('twitch.tv') ||
    u.includes('dailymotion.com') ||
    u.includes('/embed/')
  );
}

/** Convierte enlaces típicos de YouTube a URL embed con autoplay mute (pizarras). */
export function toCourtAdVideoIframeSrc(url: string): string {
  const u = url.trim();
  const lower = u.toLowerCase();
  const tvParams = 'autoplay=1&mute=1&playsinline=1&controls=0&modestbranding=1&rel=0&disablekb=1';
  if (lower.includes('youtube.com/watch?v=')) {
    const videoId = u.split('v=')[1]?.split('&')[0];
    if (videoId)
      return `https://www.youtube.com/embed/${videoId}?${tvParams}&loop=1&playlist=${videoId}`;
  }
  if (lower.includes('youtu.be/')) {
    const videoId = u.split('youtu.be/')[1]?.split('?')[0];
    if (videoId)
      return `https://www.youtube.com/embed/${videoId}?${tvParams}&loop=1&playlist=${videoId}`;
  }
  if (lower.includes('youtube.com/embed/')) {
    const base = u.includes('?') ? u : `${u}?${tvParams}`;
    return base.includes('controls=') ? base : `${base}${base.includes('?') ? '&' : '?'}${tvParams}`;
  }
  return u;
}
