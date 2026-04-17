'use client';

import { useEffect } from 'react';

/**
 * Evita conflictos de chunks HMR en desarrollo cuando quedó un SW/caché viejo.
 * Solo corre en localhost + NODE_ENV=development.
 */
export function DevServiceWorkerReset() {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;
        if (typeof window === 'undefined') return;
        const isLocalhost =
            window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isLocalhost) return;

        (async () => {
            try {
                if ('serviceWorker' in navigator) {
                    const regs = await navigator.serviceWorker.getRegistrations();
                    await Promise.all(regs.map((r) => r.unregister()));
                }
                if ('caches' in window) {
                    const keys = await caches.keys();
                    await Promise.all(keys.map((k) => caches.delete(k)));
                }
            } catch {
                // Silencioso: es una protección best-effort para DX.
            }
        })();
    }, []);

    return null;
}

