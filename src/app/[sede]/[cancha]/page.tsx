'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { dataService } from '@/lib/dataService';
import { Monitor, MapPin, Loader2, AlertCircle } from 'lucide-react';

/** Mapa sede → nombre (orden alfabético = mismo que en el generador) */
const SEDE_MAP: Record<string, string> = {
    S1: 'El Bodeguero',
    S2: 'Elite',
    S3: 'Food Kart',
    S4: 'Margarita Padel',
    S5: 'Playa el Agua',
    S6: 'Sun Sol Costa Azul',
    S7: 'Sun Sol Pedro Gonzalez',
    S8: 'Tibisay',
};

type State = 'loading' | 'redirecting' | 'not_found' | 'invalid';

export default function ShortUrlPage() {
    const params = useParams();
    const router = useRouter();
    const sedeRaw = (params?.sede as string ?? '').toUpperCase();
    const canchaRaw = (params?.cancha as string ?? '').toUpperCase();

    const sedeMatch = sedeRaw.match(/^S(\d+)$/);
    const canchaMatch = canchaRaw.match(/^C(\d+)$/);
    const complexName = sedeMatch ? SEDE_MAP[sedeRaw] : null;
    const courtNumber = canchaMatch ? parseInt(canchaMatch[1]) : null;

    const [state, setState] = useState<State>(
        !complexName || !courtNumber ? 'invalid' : 'loading'
    );
    const [sedeLabel] = useState(sedeRaw);
    const [canchaLabel] = useState(canchaRaw);
    const [sedeName] = useState(complexName ?? '');

    useEffect(() => {
        if (!complexName || !courtNumber) { setState('invalid'); return; }

        let cancelled = false;
        (async () => {
            try {
                // 1. Traer todos los torneos y filtrar por sede
                const all = await dataService.listAllTournaments();
                const relevant = all.filter((t: any) => t.complexName === complexName);

                if (relevant.length === 0) { if (!cancelled) setState('not_found'); return; }

                const now = Date.now();

                type MatchCandidate = { tournamentId: string; matchId: string; scheduledMs: number; isLive: boolean };
                const candidates: MatchCandidate[] = [];

                for (const t of relevant) {
                    const matches: any[] = await dataService.getMatches(t.id);
                    for (const m of matches) {
                        const mCourt = m.court ?? (m.courtIndex != null ? m.courtIndex + 1 : null);
                        if (mCourt !== courtNumber) continue;
                        const isLive = m.status === 'LIVE';
                        const isPending = m.status === 'PENDING' || m.status === 'PROGRAMADO';
                        if (!isLive && !isPending) continue;
                        const scheduledMs = m.scheduledTime ? new Date(m.scheduledTime).getTime() : 0;
                        candidates.push({ tournamentId: t.id, matchId: m.id, scheduledMs, isLive });
                    }
                }

                if (cancelled) return;

                if (candidates.length === 0) { setState('not_found'); return; }

                // Prioridad: LIVE > el partido pendiente más próximo al momento actual
                const live = candidates.find(c => c.isLive);
                const target = live ?? candidates
                    .filter(c => !c.isLive)
                    .sort((a, b) => Math.abs(a.scheduledMs - now) - Math.abs(b.scheduledMs - now))[0];

                if (!target) { setState('not_found'); return; }

                setState('redirecting');
                router.replace(`/tournaments/${target.tournamentId}/display/${encodeURIComponent(target.matchId)}`);
            } catch (e) {
                console.error('[ShortUrl]', e);
                if (!cancelled) setState('not_found');
            }
        })();
        return () => { cancelled = true; };
    }, [complexName, courtNumber, router]);

    /* ─── UI ─────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-6 px-4 font-outfit">
            {/* Branding */}
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-[#ccff00] flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-black" />
                </div>
                <span className="text-white font-black uppercase tracking-widest text-lg">Smart Padel</span>
            </div>

            {/* Badge de ruta corta */}
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-[#ccff00]/30 bg-[#ccff00]/5">
                <MapPin className="w-4 h-4 text-[#ccff00] shrink-0" />
                <span className="text-[#ccff00] font-black uppercase tracking-widest text-sm">
                    {sedeLabel} / {canchaLabel}
                </span>
                {sedeName && (
                    <span className="text-white/40 text-xs font-bold ml-1 hidden sm:inline">— {sedeName}</span>
                )}
            </div>

            {/* Estado */}
            {(state === 'loading' || state === 'redirecting') && (
                <div className="flex flex-col items-center gap-3 text-center">
                    <Loader2 className="w-8 h-8 text-[#ccff00] animate-spin" />
                    <p className="text-white/60 text-sm font-bold uppercase tracking-widest">
                        {state === 'redirecting' ? 'Abriendo pizarra…' : 'Buscando partido activo…'}
                    </p>
                </div>
            )}

            {state === 'not_found' && (
                <div className="flex flex-col items-center gap-3 text-center max-w-xs">
                    <AlertCircle className="w-8 h-8 text-yellow-400" />
                    <p className="text-white font-black uppercase tracking-widest text-sm">Sin partido activo</p>
                    <p className="text-white/40 text-xs font-medium">
                        No hay ningún partido en vivo ni próximo en <strong className="text-white/70">{sedeName} — Cancha {courtNumber}</strong> ahora mismo.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="mt-2 px-5 py-2 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-xs font-black uppercase tracking-widest hover:bg-[#ccff00]/20 transition-all"
                    >
                        Ir al inicio
                    </button>
                </div>
            )}

            {state === 'invalid' && (
                <div className="flex flex-col items-center gap-3 text-center max-w-xs">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                    <p className="text-white font-black uppercase tracking-widest text-sm">URL no válida</p>
                    <p className="text-white/40 text-xs font-medium">
                        El formato correcto es <span className="text-[#ccff00] font-mono">smartpadel58.com/S1/C2</span>
                    </p>
                    <p className="text-white/30 text-[10px] font-mono">
                        S1–S8 = sede &nbsp;|&nbsp; C1–C6 = cancha
                    </p>
                </div>
            )}
        </div>
    );
}
