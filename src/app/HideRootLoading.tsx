'use client';

import { useEffect } from 'react';

/**
 * Oculta el overlay #root-loading cuando la app está lista.
 * Retraso mínimo 1.2s para que se vea "Smart Padel" y React tenga tiempo de pintar.
 */
export default function HideRootLoading() {
    useEffect(() => {
        const hide = () => {
            const el = document.getElementById('root-loading');
            if (el) el.style.setProperty('display', 'none');
        };
        const tid = setTimeout(hide, 1200);
        return () => clearTimeout(tid);
    }, []);
    return null;
}
