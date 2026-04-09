'use client';

import { Monitor, Tablet } from 'lucide-react';

export type ScreenOrientation = 'landscape' | 'portrait';

type OrientationToggleProps = {
  currentOrientation: ScreenOrientation;
  onUpdate: (next: ScreenOrientation) => void;
};

export function OrientationToggle({ currentOrientation, onUpdate }: OrientationToggleProps) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-zinc-900/80 rounded-2xl border border-white/10">
      <span className="text-sm font-bold text-white/50 uppercase tracking-wider">
        Orientación de pantalla
      </span>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onUpdate('landscape')}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
            currentOrientation === 'landscape'
              ? 'border-padel-primary bg-padel-primary/10 text-padel-primary'
              : 'border-zinc-600 text-zinc-500 hover:border-zinc-500'
          }`}
        >
          <Monitor size={20} aria-hidden />
          <span className="font-bold">Horizontal</span>
        </button>

        <button
          type="button"
          onClick={() => onUpdate('portrait')}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
            currentOrientation === 'portrait'
              ? 'border-padel-primary bg-padel-primary/10 text-padel-primary'
              : 'border-zinc-600 text-zinc-500 hover:border-zinc-500'
          }`}
        >
          <Tablet size={20} className="rotate-90" aria-hidden />
          <span className="font-bold">Vertical</span>
        </button>
      </div>
      <p className="text-[11px] text-white/40 leading-snug">
        En vertical, el reparto del slider aplica al alto (vídeo arriba · imágenes abajo).
      </p>
    </div>
  );
}
