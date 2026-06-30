'use client';

import { BouncingBall } from '@/components/BouncingBall';

const brandTextClass =
  'truncate font-outfit text-sm font-bold uppercase leading-none tracking-tight text-white sm:text-base';

/** Marca TV Express — pelota a la izquierda de la «S» de SMARTPADEL58. */
export function ExpressTvBrandMark({ align = 'start' }: { align?: 'start' | 'end' }) {
  const wrap = align === 'end' ? 'flex justify-end' : '';
  return (
    <div className={wrap}>
      <div className="grid grid-cols-[auto_auto] items-end gap-x-1 gap-y-0 sm:gap-x-1.5">
        <BouncingBall
          size={18}
          duration={850}
          bounceHeight={1.35}
          className="col-start-1 row-start-1 shrink-0 -mb-0.5 self-end"
        />
        <span className={`col-start-2 row-start-1 ${brandTextClass}`}>SMARTPADEL58</span>
      </div>
    </div>
  );
}

/** Cabecera TV: SMARTPADEL58, club y cancha (derecha en pizarrón Express). */
export function ExpressTvTopLeftBlock({
  club,
  court,
  align = 'end',
}: {
  club: string;
  court: string;
  align?: 'start' | 'end';
}) {
  const wrap = align === 'end' ? 'flex justify-end' : '';
  return (
    <div className={`min-w-0 max-w-full ${wrap}`}>
      <div
        className={`grid grid-cols-[auto_auto] gap-x-1 gap-y-0.5 sm:gap-x-1.5 ${
          align === 'end' ? 'text-right' : 'text-left'
        }`}
      >
        <BouncingBall
          size={18}
          duration={850}
          bounceHeight={1.35}
          className="col-start-1 row-start-1 shrink-0 -mb-0.5 self-end"
        />
        <span className={`col-start-2 row-start-1 max-w-full truncate ${brandTextClass}`}>SMARTPADEL58</span>
        {club ? (
          <span className="col-start-2 row-start-2 max-w-full truncate text-[11px] font-black uppercase tracking-[0.12em] text-white sm:text-xs">
            {club}
          </span>
        ) : null}
        <span className="col-start-2 row-start-3 max-w-full truncate text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 sm:text-[10px]">
          {court}
        </span>
      </div>
    </div>
  );
}
