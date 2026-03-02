'use client';

import Image from 'next/image';

interface PublicidadImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

/**
 * Imagen de publicidad/sponsor desde Supabase Storage.
 * Usa next/image con priority para carga rápida en pantallas.
 */
export function PublicidadImage({
  src,
  alt = 'Publicidad Sponsor',
  width = 1920,
  height = 1080,
  priority = true,
  className = 'object-cover w-full h-full',
}: PublicidadImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
