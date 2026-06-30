'use client';

import { BouncingBall } from '@/components/BouncingBall';

/** Marca TV Express — texto alineado a la izquierda; pelota decorativa a la derecha. */
export function ExpressTvBrandMark() {
  return (
    <div className="flex min-w-0 max-w-full items-center gap-1.5 sm:gap-2">
      <span className="truncate font-outfit text-sm font-bold uppercase leading-none tracking-tight text-white sm:text-base">
        SMARTPADEL58
      </span>
      <BouncingBall size={18} duration={850} bounceHeight={1.35} className="shrink-0" />
    </div>
  );
}

/** Cabecera izquierda TV: SMARTPADEL58, club y cancha con el mismo margen inicial. */
export function ExpressTvTopLeftBlock({ club, court }: { club: string; court: string }) {
  return (
    <div className="flex min-w-0 w-full max-w-full flex-col items-start gap-0.5 text-left leading-tight">
      <ExpressTvBrandMark />
      {club ? (
        <span className="w-full max-w-full truncate text-[11px] font-black uppercase tracking-[0.12em] text-white sm:text-xs">
          {club}
        </span>
      ) : null}
      <span className="w-full max-w-full truncate text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 sm:text-[10px]">
        {court}
      </span>
    </div>
  );
}
