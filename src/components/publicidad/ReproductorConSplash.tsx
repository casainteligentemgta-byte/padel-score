'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MediaContent } from '@/lib/supabase/publicidad';

const SPLASH_TIMEOUT_MS = 15_000; // Si no carga en 15s, quitar splash igual

interface ReproductorConSplashProps {
  contenido: MediaContent | null;
  tiraTexto: string;
  /** Componente para la barra inferior (tira informativa) */
  renderTira?: (texto: string) => React.ReactNode;
}

function SplashScreen() {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900">
      <div className="w-48 h-48 mb-8 animate-pulse">
        <img src="/logo-smart-padel.png" alt="Logo" className="w-full h-full object-contain" />
      </div>
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-emerald-400 font-mono text-sm tracking-widest uppercase">
          Sincronizando Pista...
        </p>
      </div>
    </div>
  );
}

export function ReproductorConSplash({
  contenido,
  tiraTexto,
  renderTira,
}: ReproductorConSplashProps) {
  const [isReady, setIsReady] = useState(false);

  const markReady = useCallback(() => {
    setIsReady(true);
  }, []);

  // Al cambiar el contenido, volver a mostrar splash hasta que cargue el nuevo
  useEffect(() => {
    setIsReady(false);
  }, [contenido?.id]);

  // Timeout de seguridad: si no dispara onCanPlayThrough/onLoad, quitar splash
  useEffect(() => {
    if (!contenido?.url) return;
    const t = setTimeout(markReady, SPLASH_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [contenido?.url, contenido?.id, markReady]);

  const isVideo =
    contenido?.tipo === 'video_url' || contenido?.tipo === 'video_file';
  const isImagen = contenido?.tipo === 'imagen';

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {!contenido?.url ? (
        <>
          <SplashScreen />
          {renderTira?.(tiraTexto)}
        </>
      ) : (
        <>
          {!isReady && <SplashScreen />}

          <div className="w-full h-full">
            {isVideo && (
              <video
                src={contenido.url}
                autoPlay
                muted
                loop
                playsInline
                onCanPlayThrough={markReady}
                onError={markReady}
                className={`w-full h-full object-cover transition-opacity duration-1000 ${
                  isReady ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}
            {isImagen && (
              <img
                src={contenido.url}
                alt={contenido.nombre_sponsor || 'Publicidad'}
                onLoad={markReady}
                onError={markReady}
                className={`w-full h-full object-cover transition-opacity duration-1000 ${
                  isReady ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}
          </div>

          {renderTira?.(tiraTexto)}
        </>
      )}
    </div>
  );
}
