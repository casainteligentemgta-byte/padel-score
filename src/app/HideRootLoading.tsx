'use client';

import { useEffect } from 'react';

function hideOverlay() {
    try {
        const el = document.getElementById('root-loading');
        if (el) el.style.setProperty('display', 'none');
    } catch (_) {}
}

/**
 * Oculta el overlay #root-loading en cuanto React monta en el cliente.
 */
export default function HideRootLoading() {
    useEffect(() => {
        hideOverlay();
        const tid = setTimeout(hideOverlay, 400);
        return () => clearTimeout(tid);
    }, []);
    return null;
}
