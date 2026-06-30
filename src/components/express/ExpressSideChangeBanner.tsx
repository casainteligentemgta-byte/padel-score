'use client';

import { RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ExpressSideChangeBannerProps = {
  visible: boolean;
  onDismiss?: () => void;
  layout?: 'mobile' | 'tv';
};

export function ExpressSideChangeBanner({
  visible,
  onDismiss,
  layout = 'mobile',
}: ExpressSideChangeBannerProps) {
  const isTv = layout === 'tv';

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ y: isTv ? -24 : -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: isTv ? -24 : -80, opacity: 0 }}
          className={
            isTv
              ? 'pointer-events-none absolute inset-x-0 top-14 z-50 flex justify-center px-4'
              : 'pointer-events-none absolute inset-x-0 top-0 z-50 flex justify-center px-3 pt-1'
          }
        >
          <div
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl border-b-4 border-black/20 bg-padel-primary text-black shadow-2xl ${
              isTv ? 'px-8 py-4' : 'px-5 py-3'
            }`}
          >
            <RefreshCw
              className={`${isTv ? 'h-6 w-6' : 'h-5 w-5'} animate-spin`}
              style={{ animationDuration: '3s' }}
            />
            <div className="flex flex-col">
              <span className={`font-black italic uppercase leading-none ${isTv ? 'text-lg' : 'text-sm'}`}>
                Cambio de lado
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">
                Juego impar finalizado
              </span>
            </div>
            {onDismiss ? (
              <button
                type="button"
                onClick={onDismiss}
                className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/10 hover:bg-black/20"
                aria-label="Cerrar aviso"
              >
                <X className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
