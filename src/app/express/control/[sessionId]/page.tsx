'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Power } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ExpressMatch, normalizeExpressMatch } from '@/types/expressMatch';
import {
  buildExpressSessionReset,
  calculateNextState,
  pickScorePatch,
} from '@/lib/expressScoring';
import { BouncingBall } from '@/components/BouncingBall';

type PageStatus = 'loading' | 'ready' | 'missing' | 'config_error';

export default function MobileExpressControl({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = React.use(params);
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [match, setMatch] = useState<ExpressMatch | null>(null);
  const [status, setStatus] = useState<PageStatus>(() => (supabase ? 'loading' : 'config_error'));

  const matchRef = useRef<ExpressMatch | null>(null);
  const pendingScoreRef = useRef(false);
  const debounceTimers = useRef<{ a: ReturnType<typeof setTimeout> | null; b: ReturnType<typeof setTimeout> | null }>({
    a: null,
    b: null,
  });

  const applyMatch = useCallback((m: ExpressMatch) => {
    const normalized = normalizeExpressMatch(m as unknown as Record<string, unknown>);
    setMatch(normalized);
    matchRef.current = normalized;
  }, []);

  const updateServer = useCallback(
    async (updates: Partial<ExpressMatch>, fallback: ExpressMatch): Promise<boolean> => {
      if (!supabase) return false;
      const { error } = await supabase
        .from('express_matches')
        .update(updates)
        .eq('session_id', sessionId);
      if (error) {
        console.error('[ExpressControl] update error:', error);
        applyMatch(fallback);
        return false;
      }
      return true;
    },
    [sessionId, supabase, applyMatch],
  );

  useEffect(() => {
    if (!supabase) return;

    const activateControl = async () => {
      setStatus('loading');
      const { data, error } = await supabase
        .from('express_matches')
        .update({ is_active: true })
        .eq('session_id', sessionId)
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('[ExpressControl] activate error:', error);
        setStatus('missing');
        return;
      }

      if (!data) {
        setStatus('missing');
        return;
      }

      applyMatch(data);
      setStatus('ready');
    };

    activateControl();
  }, [sessionId, supabase, applyMatch]);

  const handleScore = async (team: 'a' | 'b', action: 'increment' | 'decrement') => {
    if (!matchRef.current || pendingScoreRef.current) return;

    pendingScoreRef.current = true;
    const previousState = { ...matchRef.current };
    const patch = calculateNextState(previousState, team, action);
    const newState = { ...previousState, ...patch } as ExpressMatch;

    applyMatch(newState);

    const matchJustEnded = previousState.is_active && newState.is_active === false;
    const payload = matchJustEnded
      ? buildExpressSessionReset(crypto.randomUUID())
      : pickScorePatch(newState);

    const ok = await updateServer(payload, previousState);
    pendingScoreRef.current = false;

    if (ok && matchJustEnded) {
      router.push('/');
    }
  };

  const handleNameChange = (team: 'a' | 'b', val: string) => {
    if (!matchRef.current) return;

    const previousState = { ...matchRef.current };
    const newState = { ...previousState, [`team_${team}_name`]: val } as ExpressMatch;
    applyMatch(newState);

    if (debounceTimers.current[team]) clearTimeout(debounceTimers.current[team]!);
    debounceTimers.current[team] = setTimeout(() => {
      updateServer({ [`team_${team}_name`]: val }, previousState);
    }, 400);
  };

  const handlePuntoDeOroToggle = async () => {
    if (!matchRef.current) return;
    const previousState = { ...matchRef.current };
    const updates: Partial<ExpressMatch> = { punto_de_oro: !previousState.punto_de_oro };

    if (updates.punto_de_oro) {
      if (previousState.team_a_points === 'AD' || previousState.team_b_points === 'AD') {
        updates.team_a_points = '40';
        updates.team_b_points = '40';
      }
    }

    const newState = { ...previousState, ...updates } as ExpressMatch;
    applyMatch(newState);
    await updateServer(updates, previousState);
  };

  const endSession = async () => {
    if (!supabase || !window.confirm('¿Finalizar partido y limpiar TV?')) return;

    const newSessionId = crypto.randomUUID();
    const reset = buildExpressSessionReset(newSessionId);
    const { error } = await supabase
      .from('express_matches')
      .update(reset)
      .eq('session_id', sessionId);

    if (error) {
      console.error('[ExpressControl] end session error:', error);
      return;
    }

    router.push('/');
  };

  if (status === 'config_error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center text-white">
        <p className="text-sm text-neutral-400">
          Supabase no configurado. Revisa las variables de entorno.
        </p>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <BouncingBall />
      </div>
    );
  }

  if (status === 'missing' || !match) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center text-white">
        <p className="text-lg font-bold uppercase tracking-widest text-padel-primary">
          Sesión expirada
        </p>
        <p className="text-sm text-neutral-400">
          Escanea de nuevo el código QR en la pantalla de la cancha.
        </p>
        <Link
          href="/"
          className="mt-4 rounded-xl bg-padel-primary px-6 py-3 text-sm font-bold uppercase text-surface"
        >
          Ir al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen select-none flex-col bg-surface p-4 font-sans text-white">
      <div className="mb-6 flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <h1 className="flex items-center gap-2 text-sm font-bold tracking-widest text-padel-primary">
            EXPRESS MATCH
            {match.modo_puntos === 'tiebreak' && (
              <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-500">
                TIE-BREAK
              </span>
            )}
          </h1>
          <p className="text-xs uppercase text-neutral-400">{match.cancha_code}</p>
        </div>
        <button
          type="button"
          onClick={endSession}
          className="flex items-center gap-2 rounded-xl bg-red-500/10 p-2 text-xs font-bold uppercase text-red-500 active:bg-red-500/20"
        >
          <Power size={14} /> Finalizar
        </button>
      </div>

      {(['a', 'b'] as const).map((team) => (
        <div
          key={team}
          className="mb-4 flex flex-1 flex-col justify-between rounded-3xl border border-neutral-800 bg-neutral-900 p-5"
        >
          <input
            value={team === 'a' ? match.team_a_name : match.team_b_name}
            onChange={(e) => handleNameChange(team, e.target.value.toUpperCase())}
            className="border-b border-neutral-700 bg-transparent pb-2 text-xl font-black uppercase text-white focus:border-padel-primary focus:outline-none"
            placeholder={`EQUIPO ${team.toUpperCase()}`}
          />
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleScore(team, 'decrement')}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-400 transition-transform active:scale-95"
            >
              <Minus size={24} />
            </button>
            <div className="text-center">
              <span className="block text-7xl font-black leading-none text-padel-primary">
                {team === 'a' ? match.team_a_points : match.team_b_points}
              </span>
              <span className="mt-2 block text-xs font-bold uppercase text-neutral-500">
                Juegos: {team === 'a' ? match.team_a_games : match.team_b_games}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleScore(team, 'increment')}
              className="flex h-20 w-20 items-center justify-center rounded-3xl bg-padel-primary text-surface shadow-lg shadow-padel-primary/20 transition-transform active:scale-95"
            >
              <Plus size={36} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handlePuntoDeOroToggle}
        className="mt-2 w-full rounded-2xl border border-neutral-800 bg-neutral-900 py-4 text-sm font-bold uppercase tracking-widest text-neutral-400 transition-colors active:bg-neutral-800"
      >
        {match.punto_de_oro ? '⚡ Desactivar Punto de Oro' : 'Activar Punto de Oro'}
      </button>
    </div>
  );
}
