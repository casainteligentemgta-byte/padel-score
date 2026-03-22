'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirige a la pantalla de Agentes IA (IA Hub).
 * El contenido real está en /agents; este enlace existe para el panel Admin.
 */
export default function AdminAgentsRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/agents');
    }, [router]);

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="text-center text-white">
                <p className="text-sm font-bold uppercase tracking-widest text-padel-primary">Redirigiendo a IA Hub...</p>
            </div>
        </div>
    );
}
