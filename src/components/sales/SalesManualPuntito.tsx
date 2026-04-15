'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const MESSAGE = '¡Al ataque, Founder! Este club se cierra hoy.';

export function SalesManualPuntito() {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex max-w-[min(280px,88vw)] flex-col items-end sm:bottom-6 sm:right-6">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="rounded-2xl border border-[#ccff00]/45 bg-black/90 px-3 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-md sm:px-4 sm:py-3"
      >
        <div className="flex items-start gap-2.5 sm:gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#ccff00] bg-[#ccff00]/12 sm:h-10 sm:w-10">
            <Sparkles className="h-4 w-4 text-[#ccff00] sm:h-[18px] sm:w-[18px]" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#ccff00]/80">Puntito</p>
            <p className="text-left text-[12px] font-semibold leading-snug tracking-tight text-zinc-100 sm:text-[13px]">
              {MESSAGE}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
