'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VictoryCardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tournamentId, setTournamentId] = useState('');
  const [matchId, setMatchId] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const t = searchParams.get('tournament_id');
    const m = searchParams.get('match_id');
    if (t) setTournamentId(t);
    if (m) setMatchId(m);
  }, [searchParams]);

  const handleDownload = async () => {
    if (!tournamentId.trim() || !matchId.trim()) {
      alert('Indica el ID del torneo y el ID del partido.');
      return;
    }
    setDownloading(true);
    try {
      const res = await fetch(
        `/api/generate-victory-card?match_id=${encodeURIComponent(matchId.trim())}&tournament_id=${encodeURIComponent(tournamentId.trim())}`
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Error al generar la imagen');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `victoria-pro-${matchId.trim()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'No se pudo descargar la tarjeta');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white font-outfit p-6">
      <div className="max-w-md mx-auto">
        <Link
          href="/hub"
          className="inline-flex items-center gap-2 text-white/70 hover:text-[#ccff00] text-sm font-bold mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Hub
        </Link>
        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-[#ccff00] mb-2">
          Tarjeta de victoria
        </h1>
        <p className="text-sm text-white/70 mb-6">
          Introduce el ID del torneo y el ID del partido (los puedes copiar desde la URL del partido) para generar y descargar la imagen.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-white/60 mb-1">ID del torneo</label>
            <input
              type="text"
              value={tournamentId}
              onChange={(e) => setTournamentId(e.target.value)}
              placeholder="ej. abc123-def456..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-[#ccff00]/50 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-white/60 mb-1">ID del partido</label>
            <input
              type="text"
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
              placeholder="ej. m-grupos-0-abc..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-[#ccff00]/50 focus:outline-none text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || !tournamentId.trim() || !matchId.trim()}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-[#ccff00] text-black font-black text-sm uppercase italic tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              'Generando imagen...'
            ) : (
              <>
                <Download className="w-5 h-5" />
                Generar y descargar (PNG 1080×1080)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
