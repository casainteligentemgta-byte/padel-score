'use client';

import { useEffect } from 'react';

/**
 * Oculta el overlay #root-loading en cuanto el cliente hidrata.
 * Así la app se ve en local aunque AuthProvider tarde en resolver.
 * No elimina el nodo (evita insertBefore NotFoundError con React).
 */
export default function HideRootLoading() {
    useEffect(() => {
        const hide = () => {
            const el = document.getElementById('root-loading');
            if (el) el.style.setProperty('display', 'none');
        };
        hide();
        const id = requestAnimationFrame(hide);
        const tid = setTimeout(hide, 50);
        return () => {
            cancelAnimationFrame(id);
            clearTimeout(tid);
        };
    }, []);
    return null;
}
