'use client';

import { BouncingBall } from '@/components/BouncingBall';

/** Marca TV Express: pelota rebotando + smartPADEL58 */
export function ExpressTvBrandMark() {
  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
      <BouncingBall size={22} duration={850} bounceHeight={1.4} className="shrink-0" />
      <span className="truncate font-outfit text-sm font-bold leading-none tracking-tight text-white sm:text-base">
        smart<span className="text-padel-primary">PADEL</span>58
      </span>
    </div>
  );
}
