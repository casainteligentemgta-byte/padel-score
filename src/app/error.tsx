'use client';

import { useEffect } from 'react';

/** Errores en rutas: muestra mensaje en lugar de pantalla en blanco */
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('App error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <h2 className="text-xl font-bold text-white mb-2">Algo ha fallado</h2>
                <p className="text-sm text-gray-400 mb-6">{error?.message || 'Error desconocido'}</p>
                <button
                    onClick={() => reset()}
                    className="bg-[#ccff00] text-black font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity"
                >
                    Reintentar
                </button>
            </div>
        </div>
    );
}
