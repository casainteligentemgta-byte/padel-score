'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Tras unos segundos muestra un mensaje de ayuda por si la pantalla queda en blanco.
 */
export default function FallbackIfBlank() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setShow(true), 3500);
        return () => clearTimeout(t);
    }, []);

    if (!show) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '12px 16px',
                background: 'rgba(0,0,0,0.85)',
                color: '#888',
                fontSize: 12,
                textAlign: 'center',
                zIndex: 99998,
                borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            ¿No carga? Abre la consola (F12) y recarga. Prueba también{' '}
            <Link href="/test" style={{ color: '#ccff00', fontWeight: 700 }}>
                /test
            </Link>
        </div>
    );
}
