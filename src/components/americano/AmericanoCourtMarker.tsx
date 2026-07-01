'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { Loader2, Minus, Plus, Trophy } from 'lucide-react';
import { tapAmericanoScore } from '@/app/actions/americanoActions';
import { resolveCurrentCourtMatch } from '@/lib/americano/courtMarker';
import { playerNameById } from '@/lib/americano/logic';
import { canTapAmericanoScore } from '@/lib/americano/americanoScoring';
import { useAmericanoRealtime } from '@/lib/americano/useAmericanoRealtime';
import type { AmericanoMatch } from '@/lib/americano/logic';

type Props = {
  sessionId: string;
  courtNumber: number;
};

function TeamTouchBlock({
  label,
  players,
  score,
  pointsGoal,
  team,
  disabled,
  onTap,
}: {
  label: string;
  players: string;
  score: number;
  pointsGoal: number;
  team: 'a' | 'b';
  disabled: boolean;
  onTap: (team: 'a' | 'b', action: 'increment' | 'decrement') => void;
}) {
  const won = score === pointsGoal && pointsGoal > 0;

  return (
    <div
      className={`flex flex-1 flex-col rounded-3xl border-2 bg-neutral-950/90 ${
        won ? 'border-emerald-400/60 shadow-[0_0_40px_rgba(52,211,153,0.15)]' : 'border-white/10'
      }`}
    >
      <div className="border-b border-white/10 px-4 py-3 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-amber-400">{label}</p>
        <p className="mt-1 text-sm font-bold leading-snug text-white">{players}</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-8">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onTap(team, 'increment')}
          className="flex h-20 w-full max-w-[200px] items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 transition-transform active:scale-95 disabled:opacity-40 touch-manipulation"
          aria-label="Sumar punto"
        >
          <Plus className="h-10 w-10" strokeWidth={2.5} />
        </button>

        <span className="text-7xl font-black tabular-nums tracking-tight text-white sm:text-8xl">
          {score}
        </span>

        <button
          type="button"
          disabled={disabled || score <= 0}
          onClick={() => onTap(team, 'decrement')}
          className="flex h-14 w-full max-w-[160px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-400 transition-transform active:scale-95 disabled:opacity-30 touch-manipulation"
          aria-label="Restar punto"
        >
          <Minus className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}

export function AmericanoCourtMarker({ sessionId, courtNumber }: Props) {
  const { loading, error, bundle, refresh } = useAmericanoRealtime(sessionId);
  const [pending, startTransition] = useTransition();
  const [tapError, setTapError] = useState<string | null>(null);
  const [localMatch, setLocalMatch] = useState<AmericanoMatch | null>(null);
  const pendingTapRef = useRef(false);

  const players = bundle?.players ?? [];
  const matches = bundle?.matches ?? [];
  const session = bundle?.session;

  const serverMatch = useMemo(
    () => resolveCurrentCourtMatch(matches, courtNumber),
    [matches, courtNumber],
  );

  useEffect(() => {
    if (serverMatch && !pendingTapRef.current) {
      setLocalMatch(serverMatch);
    }
  }, [serverMatch]);

  const match = localMatch ?? serverMatch;

  const teamALabel = match
    ? `${playerNameById(players, match.playerA1Id)} / ${playerNameById(players, match.playerA2Id)}`
    : '—';
  const teamBLabel = match
    ? `${playerNameById(players, match.playerB1Id)} / ${playerNameById(players, match.playerB2Id)}`
    : '—';

  const canTap = match
    ? canTapAmericanoScore({
        scoreA: match.scoreA,
        scoreB: match.scoreB,
        pointsGoal: match.pointsGoal,
      })
    : false;

  const handleTap = useCallback(
    (team: 'a' | 'b', action: 'increment' | 'decrement') => {
      if (!match || pendingTapRef.current || !canTap) return;

      setTapError(null);
      pendingTapRef.current = true;

      const optimistic = {
        ...match,
        scoreA: team === 'a' ? match.scoreA + (action === 'increment' ? 1 : -1) : match.scoreA,
        scoreB: team === 'b' ? match.scoreB + (action === 'increment' ? 1 : -1) : match.scoreB,
      };
      setLocalMatch(optimistic);

      startTransition(async () => {
        const result = await tapAmericanoScore({
          matchId: match.id,
          team,
          action,
        });
        pendingTapRef.current = false;

        if (!result.ok) {
          setTapError(result.error);
          setLocalMatch(serverMatch ?? null);
          return;
        }

        if (result.data.finished) {
          await refresh();
          setLocalMatch(null);
        } else {
          setLocalMatch((prev) =>
            prev
              ? { ...prev, scoreA: result.data.scoreA, scoreB: result.data.scoreB }
              : prev,
          );
        }
      });
    },
    [match, canTap, refresh, serverMatch],
  );

  if (loading && !bundle) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-neutral-400">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        Cargando cancha…
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300">
        {error ?? 'Sesión no encontrada.'}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <header className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-400">
              Marcador táctil · Cancha {courtNumber}
            </p>
            <h1 className="text-lg font-black uppercase italic tracking-tight">{session.name}</h1>
            <p className="text-xs text-neutral-500">
              Ronda {match?.roundNumber ?? '—'} · a {session.pointsGoal} pts
            </p>
          </div>
          <Link
            href={`/americano/session/${sessionId}`}
            className="rounded-xl border border-white/15 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-amber-300"
          >
            Panel admin
          </Link>
        </div>
      </header>

      {tapError ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {tapError}
        </p>
      ) : null}

      {!match ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
          <Trophy className="h-12 w-12 text-amber-400/30" />
          <p className="text-sm font-bold uppercase tracking-widest text-neutral-500">
            Sin partido activo en esta cancha
          </p>
          <p className="max-w-sm text-xs text-neutral-600">
            Espera la siguiente ronda o revisa el panel de control.
          </p>
        </div>
      ) : match.status === 'finished' ? (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
          <p className="text-sm font-black uppercase tracking-widest text-emerald-400">Partido finalizado</p>
          <p className="mt-4 text-5xl font-black tabular-nums text-white">
            {match.scoreA} – {match.scoreB}
          </p>
        </div>
      ) : (
        <>
          <div className="flex min-h-[55vh] flex-col gap-3 sm:flex-row sm:min-h-[60vh]">
            <TeamTouchBlock
              label="Equipo A"
              players={teamALabel}
              score={match.scoreA}
              pointsGoal={match.pointsGoal}
              team="a"
              disabled={pending || !canTap}
              onTap={handleTap}
            />
            <div className="flex items-center justify-center sm:w-12">
              <span className="text-2xl font-black text-neutral-600">VS</span>
            </div>
            <TeamTouchBlock
              label="Equipo B"
              players={teamBLabel}
              score={match.scoreB}
              pointsGoal={match.pointsGoal}
              team="b"
              disabled={pending || !canTap}
              onTap={handleTap}
            />
          </div>

          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-neutral-600">
            Toca + para sumar · Objetivo: {match.pointsGoal} puntos
          </p>
        </>
      )}
    </div>
  );
}
