'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Tv, ExternalLink, Copy, Check } from 'lucide-react';

/**
 * Acceso rápido a la pizarra.
 * - /pizarra?t=ID_TORNEO&m=ID_PARTIDO → pizarra del partido
 * - /pizarra?t=ID_TORNEO → monitor del torneo (todas las canchas)
 * - /pizarra → formulario para pegar IDs y abrir
 */
export default function PizarraPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = searchParams.get('t')?.trim() || '';
    const m = searchParams.get('m')?.trim() || '';

    const [tournamentId, setTournamentId] = useState('');
    const [matchId, setMatchId] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (t) setTournamentId(t);
        if (m) setMatchId(m);
    }, [t, m]);

    useEffect(() => {
        if (!t) return;
        if (m) {
            router.replace(`/tournaments/${t}/display/${m}`);
            return;
        }
        router.replace(`/tournaments/${t}/monitor`);
    }, [t, m, router]);

    const handleOpen = () => {
        const tid = tournamentId.trim();
        const mid = matchId.trim();
        if (!tid) return;
        if (mid) {
            router.push(`/tournaments/${tid}/display/${mid}`);
        } else {
            router.push(`/tournaments/${tid}/monitor`);
        }
    };

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shortUrl = `${baseUrl}/p?t=${encodeURIComponent(tournamentId.trim())}${matchId.trim() ? `&m=${encodeURIComponent(matchId.trim())}` : ''}`;

    const copyShortUrl = () => {
        navigator.clipboard.writeText(shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (t && (m || !m)) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white/60">
                <p className="text-sm">Redirigiendo a la pizarra…</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-md space-y-6">
                <div className="flex items-center gap-3 justify-center">
                    <div className="w-12 h-12 rounded-xl bg-[#ccff00]/20 flex items-center justify-center">
                        <Tv className="w-6 h-6 text-[#ccff00]" />
                    </div>
                    <h1 className="text-xl font-black uppercase tracking-tight">Pizarra</h1>
                </div>
                <p className="text-center text-sm text-white/60">
                    Acceso rápido al marcador. Indica el torneo y, si quieres un partido concreto, el partido.
                </p>
                <p className="text-center text-[10px] text-white/40">
                    Una por cancha (asigna desde el monitor):<br />
                    <strong>www.smartpadel58.com/p/1</strong> · <strong>/p/2</strong> · <strong>/p/3</strong>
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1.5">
                            ID del torneo
                        </label>
                        <input
                            type="text"
                            value={tournamentId}
                            onChange={(e) => setTournamentId(e.target.value)}
                            placeholder="ej. abc123-def456..."
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#ccff00]/50 focus:outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1.5">
                            ID del partido <span className="text-white/30">(opcional)</span>
                        </label>
                        <input
                            type="text"
                            value={matchId}
                            onChange={(e) => setMatchId(e.target.value)}
                            placeholder="Si lo dejas vacío se abre el monitor de todas las canchas"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#ccff00]/50 focus:outline-none text-sm"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleOpen}
                        disabled={!tournamentId.trim()}
                        className="w-full py-3.5 rounded-xl bg-[#ccff00] text-black font-black uppercase tracking-widest text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 flex items-center justify-center gap-2"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Abrir pizarra
                    </button>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                        Enlace directo (guárdalo o compártelo)
                    </p>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            readOnly
                            value={shortUrl}
                            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white/80 truncate"
                        />
                        <button
                            type="button"
                            onClick={copyShortUrl}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/70"
                            title="Copiar"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className="text-[10px] text-white/40 mt-1.5">
                        <strong>/p?t=</strong>ID_TORNEO → monitor · <strong>&m=</strong>ID_PARTIDO → un partido
                    </p>
                </div>
            </div>
        </div>
    );
}
