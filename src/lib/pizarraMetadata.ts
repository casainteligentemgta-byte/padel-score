import type { Metadata, Viewport } from 'next';

/** Viewport y meta de documento para pantallas de pizarra / TV (kiosco, iframe, PWA). */
export const pizarraViewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const pizarraMetadata: Metadata = {
  title: 'Pizarra · Smart Padel',
  description: 'Marcador, publicidad y tira informativa a pantalla completa.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Pizarra Smart Padel',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};
