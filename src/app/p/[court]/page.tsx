'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tv } from 'lucide-react';

/**
 * URL corta por cancha: /p/{n}
 * El índice de cancha es dinámico (n >= 1) según cada sede/torneo.
 * Asignación desde el monitor del torneo ("Usar en cancha X").
 */
export default function PizarraCanchaPage() {
    const params = useParams();
    const router = useRouter();
    const court = String(params?.court ?? '');
    const num = parseInt(court, 10);
    const valid = Number.isFinite(num) && num >= 1;

    const [status, setStatus] = useState<'loading' | 'found' | 'empty' | 'error'>('loading');

    useEffect(() => {
        if (!valid) {
            router.replace('/pizarra');
            return;
        }
        fetch(`/api/pizarra-cancha/${num}`)
            .then((res) => res.json())
            .then((data: { tournamentId?: string | null; matchId?: string | null }) => {
                if (data?.tournamentId && data?.matchId) {
                    setStatus('found');
                    window.location.href = `/tournaments/${data.tournamentId}/display/${data.matchId}`;
                } else {
                    setStatus('empty');
                }
            })
            .catch(() => setStatus('error'));
    }, [num, valid, router]);

    if (!valid) return null;

    return (
        <div className="min-h-screen h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-[#ccff00]/10 flex items-center justify-center mb-4">
                <Tv className="w-7 h-7 text-[#ccff00]" />
            </div>
            {status === 'loading' && (
                <p className="text-sm text-white/60">Cargando pizarra cancha {num}…</p>
            )}
            {status === 'empty' && (
                <>
                    <p className="text-sm font-medium text-white/80">Cancha {num}</p>
                    <p className="text-xs text-white/50 mt-1">No hay partido asignado a esta cancha.</p>
                    <p className="text-[10px] text-white/40 mt-3 max-w-xs text-center">
                        Asigna un partido desde el monitor del torneo con «Usar en cancha {num}».
                    </p>
                    <a
                        href="/pizarra"
                        className="mt-6 text-xs font-bold text-[#ccff00] hover:underline"
                    >
                        Ir a pizarra
                    </a>
                </>
            )}
            {status === 'error' && (
                <>
                    <p className="text-sm text-amber-400">Error al cargar</p>
                    <a href="/pizarra" className="mt-4 text-xs text-[#ccff00] hover:underline">
                        Ir a pizarra
                    </a>
                </>
            )}
        </div>
    );
}
