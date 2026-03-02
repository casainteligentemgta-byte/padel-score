'use client';

interface TiraInformativaProps {
  texto: string;
  className?: string;
}

/**
 * Barra inferior con texto informativo (mensajes de la tira).
 * Si no hay texto, no ocupa espacio relevante.
 */
export function TiraInformativa({ texto, className = '' }: TiraInformativaProps) {
  if (!texto?.trim()) return null;

  return (
    <div
      className={
        'absolute bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-t border-white/10 py-2 overflow-hidden ' +
        className
      }
    >
      <p className="text-emerald-400/90 font-mono text-sm tracking-widest uppercase text-center whitespace-nowrap animate-marquee">
        {texto}
      </p>
    </div>
  );
}
