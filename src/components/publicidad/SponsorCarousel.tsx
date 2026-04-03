'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService } from '@/lib/dataService';

/**
 * Sponsor shape basada en la tabla sponsor_carousel.
 */
interface Sponsor {
  id: string;
  tournament_id: string;
  name: string;
  url: string;
  duration_seconds?: number;
  is_active: boolean;
  display_order: number;
}

interface SponsorCarouselProps {
  tournamentId: string;
  className?: string;
  fallbackDuration?: number;
}

export default function SponsorCarousel({
  tournamentId,
  className = '',
  fallbackDuration = 8,
}: SponsorCarouselProps) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // ── Carga de sponsors ─────────────────────────────────────────────────────
  const loadSponsors = async () => {
    if (!tournamentId) return;
    try {
      const data = await dataService.getSponsorsByTournament(tournamentId);
      setSponsors(data as Sponsor[]);
    } catch (error) {
      console.error('[SponsorCarousel] Error cargando sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSponsors();
    // Refresca la lista cada 2 min por si el Admin añade sponsors en vivo
    const interval = setInterval(loadSponsors, 120_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId]);

  // ── Rotación automática (respeta duration_seconds por sponsor) ─────────────
  useEffect(() => {
    if (sponsors.length <= 1) return;
    const current = sponsors[currentIndex];
    const ms = (current.duration_seconds ?? fallbackDuration) * 1000;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % sponsors.length);
    }, ms);
    return () => clearTimeout(timer);
  }, [currentIndex, sponsors, fallbackDuration]);

  // ── Fallback vacío ────────────────────────────────────────────────────────
  if (loading || sponsors.length === 0) {
    return (
      <div
        className={`h-full w-full flex items-center justify-center bg-zinc-900/50 rounded-2xl border border-white/10 ${className}`}
      >
        <span className="text-zinc-500 font-black uppercase tracking-widest text-sm italic">
          Smart Padel · Sponsors
        </span>
      </div>
    );
  }

  const current = sponsors[currentIndex];

  return (
    <div className={`relative h-full w-full overflow-hidden rounded-2xl bg-black/20 ${className}`}>

      {/* ── Imagen con transición slide + fade ─────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center p-4"
        >
          <img
            src={current.url}
            alt={current.name}
            className="max-w-full max-h-full object-contain filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Badge "Official Partner" (bottom-left) ─────────────────────────── */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold leading-none">
          Official Partner:{' '}
          <span className="text-white">{current.name}</span>
        </p>
      </div>

      {/* ── Dots de progreso con --neon-color (bottom-right) ──────────────── */}
      {sponsors.length > 1 && (
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1">
          {sponsors.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === currentIndex ? '1rem' : '0.25rem',
                backgroundColor:
                  i === currentIndex
                    ? 'var(--neon-color, #ccff00)'
                    : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
      )}

      {/* ── Barra de progreso lineal (tiempo restante del sponsor activo) ──── */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5 overflow-hidden z-10">
        <motion.div
          key={`bar-${currentIndex}-${current.id}`}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{
            duration: current.duration_seconds ?? fallbackDuration,
            ease: 'linear',
          }}
          className="h-full"
          style={{ backgroundColor: 'var(--neon-color, #ccff00)' }}
        />
      </div>

      {/* ── Badge "Sponsor" (top-right) ───────────────────────────────────── */}
      <div className="absolute top-2 right-4 z-10 flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/5">
        <div
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: 'var(--neon-color, #ccff00)' }}
        />
        <span className="text-[8px] font-black text-white/50 uppercase tracking-widest italic">
          Sponsor
        </span>
      </div>

    </div>
  );
}
