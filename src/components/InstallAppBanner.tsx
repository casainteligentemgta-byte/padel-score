'use client';

import { useState, useEffect } from 'react';
import { X, Smartphone } from 'lucide-react';
import { usePathname } from 'next/navigation';

const STORAGE_KEY = 'padel-score-install-banner-dismissed';
const HIDE_DAYS = 7;

function isStandalone(): boolean {
  if (typeof window === 'undefined') return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return !!(
    nav.standalone ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches
  );
}

function wasDismissed(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const t = parseInt(raw, 10);
    if (Number.isNaN(t)) return false;
    return Date.now() - t < HIDE_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function dismiss(): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {}
}

export function InstallAppBanner() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  const shouldHideOnPath =
    !!pathname &&
    (
      pathname.startsWith('/display') ||
      pathname.includes('/display/') ||
      pathname.startsWith('/marker') ||
      pathname.startsWith('/p/') ||
      pathname.includes('/score/')
    );

  useEffect(() => {
    // Ocultar totalmente en pizarras/marcadores y pantallas de emisión
    if (shouldHideOnPath) {
      setVisible(false);
      return;
    }
    if (isStandalone()) return;
    if (wasDismissed()) return;
    setVisible(true);
  }, [shouldHideOnPath]);

  if (shouldHideOnPath) return null;

  const handleClose = () => {
    dismiss();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] flex items-center justify-between gap-3 px-4 py-3 bg-[#111] border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
      role="banner"
      aria-label="Instalar como app"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#ccff00]/15 flex items-center justify-center">
          <Smartphone className="w-4 h-4 text-[#ccff00]" />
        </div>
        <p className="text-xs sm:text-sm text-white/90 truncate">
          <span className="font-semibold text-[#ccff00]">Abre como app:</span>{' '}
          Añade a pantalla de inicio para usar sin barra de direcciones.
        </p>
      </div>
      <button
        type="button"
        onClick={handleClose}
        className="flex-shrink-0 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Cerrar"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
