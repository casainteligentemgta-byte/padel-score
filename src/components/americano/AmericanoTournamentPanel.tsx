'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ExternalLink, Loader2, Play, Trophy, Tv } from 'lucide-react';
import {
  createAmericanoSessionFromTournament,
  finishAmericanoSession,
} from '@/app/actions/americanoActions';
import { getAmericanoAccessToken } from '@/lib/americano/americanoClientAuth';

type Props = {
  tournamentId: string;
  tournamentName: string;
  baseVenue?: string;
  courtCount?: number;
  pointsGoal?: number;
  americanoSessionId?: string | null;
  isOwner?: boolean;
};

export function AmericanoTournamentPanel({
  tournamentId,
  tournamentName,
  baseVenue = '',
  courtCount = 2,
  pointsGoal = 24,
  americanoSessionId,
  isOwner = false,
}: Props) {
  const [sessionId, setSessionId] = useState<string | null>(americanoSessionId ?? null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!isOwner) return null;

  const handleStart = () => {
    setError(null);
    startTransition(async () => {
      const accessToken = await getAmericanoAccessToken();
      const result = await createAmericanoSessionFromTournament({ tournamentId, accessToken });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSessionId(result.data.sessionId);
    });
  };

  const handleFinish = () => {
    if (!sessionId) return;
    setError(null);
    startTransition(async () => {
      const accessToken = await getAmericanoAccessToken();
      const result = await finishAmericanoSession({ sessionId, accessToken });
      if (!result.ok) {
        setError(result.error);
      }
    });
  };

  return (
    <section className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-400">Americano en vivo</p>
          <h2 className="text-sm font-black uppercase italic text-white">{tournamentName}</h2>
          <p className="mt-1 text-xs text-neutral-400">
            Control dedicado con rotación real, marcadores y TV en tiempo real.
          </p>
        </div>
        <Trophy className="h-5 w-5 text-amber-400 shrink-0" />
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>
      ) : null}

      {!sessionId ? (
        <button
          type="button"
          onClick={handleStart}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-black disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Iniciar sesión americano
        </button>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/americano/session/${sessionId}`}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:border-amber-400/40"
          >
            <ExternalLink className="h-4 w-4" />
            Panel de control
          </Link>
          <Link
            href={`/americano/tv/${sessionId}${baseVenue ? `?complex=${encodeURIComponent(baseVenue)}` : ''}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:border-amber-400/40"
          >
            <Tv className="h-4 w-4" />
            Abrir TV
          </Link>
          <button
            type="button"
            onClick={handleFinish}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-amber-300 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Cerrar sesión
          </button>
        </div>
      )}

      <p className="text-[10px] text-neutral-500">
        {courtCount} cancha(s) · a {pointsGoal} pts · vinculado al torneo
      </p>
    </section>
  );
}
