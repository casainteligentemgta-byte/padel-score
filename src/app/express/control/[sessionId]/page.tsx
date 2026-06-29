'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRouteSegment } from '@/lib/useRouteSegment';
import { Plus, Minus, Power } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ExpressMatch, normalizeExpressMatch } from '@/types/expressMatch';
import {
  buildExpressSessionReset,
  calculateNextState,
  pickScorePatch,
} from '@/lib/expressScoring';
import {
  expressPlayerPatch,
  formatExpressPlayerFieldsForSave,
  normalizeExpressPlayerInput,
  readExpressPlayerSlot,
  syncExpressTeamNameFields,
  type ExpressPlayerSlot,
} from '@/lib/expressPlayerNames';
import { ExpressControlDisplayPanel } from '@/components/express/ExpressControlDisplayPanel';
import { ExpressControlThirdSetPanel } from '@/components/express/ExpressControlThirdSetPanel';
import { EXPRESS_TV_BRAND } from '@/lib/expressSlug';
import { BouncingBall } from '@/components/BouncingBall';

type PageStatus = 'loading' | 'ready' | 'missing' | 'config_error';

const TEAM_A_SLOTS: ExpressPlayerSlot[] = ['a_p1', 'a_p2'];
const TEAM_B_SLOTS: ExpressPlayerSlot[] = ['b_p1', 'b_p2'];

function PlayerNameFields({
  slot,
  match,
  onChange,
  onBlurField,
}: {
  slot: ExpressPlayerSlot;
  match: ExpressMatch;
  onChange: (slot: ExpressPlayerSlot, field: 'first' | 'last', value: string) => void;
  onBlurField: (slot: ExpressPlayerSlot, field: 'first' | 'last') => void;
}) {
  const { first, last } = readExpressPlayerSlot(match, slot);
  const labels =
    slot === 'a_p1'
        ? { title: 'Jugador 1', phFirst: 'Nombre (ej. MARIA JOSE)', phLast: 'Apellido (ej. DE LA ROSA)' }
      : slot === 'a_p2'
        ? { title: 'Jugador 2', phFirst: 'Nombre', phLast: 'Apellido' }
        : slot === 'b_p1'
          ? { title: 'Jugador 3', phFirst: 'Nombre', phLast: 'Apellido' }
          : { title: 'Jugador 4', phFirst: 'Nombre', phLast: 'Apellido' };

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{labels.title}</p>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={first}
          onChange={(e) => onChange(slot, 'first', e.target.value)}
          onBlur={() => onBlurField(slot, 'first')}
          className="rounded-xl border border-neutral-700 bg-black/30 px-3 py-2 text-sm font-semibold uppercase text-white placeholder:text-neutral-600 focus:border-padel-primary focus:outline-none"
          placeholder={labels.phFirst}
          autoComplete="off"
        />
        <input
          value={last}
          onChange={(e) => onChange(slot, 'last', e.target.value)}
          onBlur={() => onBlurField(slot, 'last')}
          className="rounded-xl border border-neutral-700 bg-black/30 px-3 py-2 text-sm font-semibold uppercase text-white placeholder:text-neutral-600 focus:border-padel-primary focus:outline-none"
          placeholder={labels.phLast}
          autoComplete="off"
        />
      </div>
    </div>
  );
}

export default function MobileExpressControl() {
  const sessionId = useRouteSegment('sessionId');
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
        .update({ is_active: true, qr_expires_at: null })
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

      void fetch('/api/express/session-started', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      }).catch(() => {});
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

  const persistTeamPlayers = useCallback(
    (team: 'a' | 'b', snapshot: ExpressMatch) => {
      const formatted = formatExpressPlayerFieldsForSave(snapshot);
      const updates: Partial<ExpressMatch> = {
        ...(team === 'a'
          ? {
              team_a_p1_first: formatted.team_a_p1_first,
              team_a_p1_last: formatted.team_a_p1_last,
              team_a_p2_first: formatted.team_a_p2_first,
              team_a_p2_last: formatted.team_a_p2_last,
            }
          : {
              team_b_p1_first: formatted.team_b_p1_first,
              team_b_p1_last: formatted.team_b_p1_last,
              team_b_p2_first: formatted.team_b_p2_first,
              team_b_p2_last: formatted.team_b_p2_last,
            }),
        team_a_name: formatted.team_a_name,
        team_b_name: formatted.team_b_name,
      };
      void updateServer(updates, matchRef.current!);
    },
    [updateServer],
  );

  const handlePlayerChange = (slot: ExpressPlayerSlot, field: 'first' | 'last', raw: string) => {
    if (!matchRef.current) return;

    const previousState = { ...matchRef.current };
    const patch = expressPlayerPatch(slot, field, raw, false);
    const newState = normalizeExpressMatch({
      ...(previousState as unknown as Record<string, unknown>),
      ...patch,
      ...syncExpressTeamNameFields({ ...previousState, ...patch } as ExpressMatch),
    });

    applyMatch(newState);

    const team = slot.startsWith('a_') ? 'a' : 'b';
    if (debounceTimers.current[team]) clearTimeout(debounceTimers.current[team]!);
    debounceTimers.current[team] = setTimeout(() => {
      persistTeamPlayers(team, matchRef.current!);
    }, 400);
  };

  const handlePlayerBlur = (slot: ExpressPlayerSlot, field: 'first' | 'last') => {
    if (!matchRef.current) return;
    const previousState = { ...matchRef.current };
    const keys = readExpressPlayerSlot(matchRef.current, slot);
    const raw = field === 'first' ? keys.first : keys.last;
    const patch = expressPlayerPatch(slot, field, raw, true);
    const newState = normalizeExpressMatch({
      ...(previousState as unknown as Record<string, unknown>),
      ...patch,
      ...syncExpressTeamNameFields({ ...previousState, ...patch } as ExpressMatch),
    });
    applyMatch(newState);
    const team = slot.startsWith('a_') ? 'a' : 'b';
    persistTeamPlayers(team, newState);
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
        <p className="text-lg font-bold uppercase tracking-widest text-padel-primary">Sesión expirada</p>
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

  const teamBlocks: { team: 'a' | 'b'; label: string; slots: ExpressPlayerSlot[] }[] = [
    { team: 'a', label: 'Arriba · Pista', slots: TEAM_A_SLOTS },
    { team: 'b', label: 'Abajo · Pista', slots: TEAM_B_SLOTS },
  ];

  return (
    <div className="flex min-h-screen select-none flex-col bg-surface p-4 font-sans text-white">
      <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <h1 className="flex items-center gap-2 text-sm font-bold tracking-widest text-padel-primary">
            {EXPRESS_TV_BRAND}
            {match.modo_puntos === 'super_tiebreak' && (
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-400">SÚPER TB</span>
            )}
            {match.modo_puntos === 'tiebreak' && (
              <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-500">TIE-BREAK</span>
            )}
          </h1>
          <p className="text-xs uppercase text-neutral-400">{match.cancha_code}</p>
          <p className="mt-1 text-[10px] text-neutral-500">
            Nombre y apellido admiten varias palabras (ej. MARIA JOSE / DE LA ROSA)
          </p>
        </div>
        <button
          type="button"
          onClick={endSession}
          className="flex items-center gap-2 rounded-xl bg-red-500/10 p-2 text-xs font-bold uppercase text-red-500 active:bg-red-500/20"
        >
          <Power size={14} /> Finalizar
        </button>
      </div>

      {teamBlocks.map(({ team, label, slots }) => (
        <div
          key={team}
          className="mb-4 flex flex-col gap-4 rounded-3xl border border-neutral-800 bg-neutral-900 p-4"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-padel-primary/80">{label}</p>
            <div className="mt-3 space-y-3">
              {slots.map((slot) => (
                <PlayerNameFields
                  key={slot}
                  slot={slot}
                  match={match}
                  onChange={handlePlayerChange}
                  onBlurField={handlePlayerBlur}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
            <button
              type="button"
              onClick={() => handleScore(team, 'decrement')}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-400 transition-transform active:scale-95"
            >
              <Minus size={22} />
            </button>
            <div className="text-center">
              <span className="block text-6xl font-black leading-none text-padel-primary">
                {team === 'a' ? match.team_a_points : match.team_b_points}
              </span>
              <span className="mt-2 block text-xs font-bold uppercase text-neutral-500">
                Juegos: {team === 'a' ? match.team_a_games : match.team_b_games}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleScore(team, 'increment')}
              className="flex h-16 w-16 items-center justify-center rounded-3xl bg-padel-primary text-surface shadow-lg shadow-padel-primary/20 transition-transform active:scale-95"
            >
              <Plus size={32} strokeWidth={2.5} />
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

      <ExpressControlThirdSetPanel
        match={match}
        sessionId={sessionId}
        onModeSaved={(mode) => {
          if (!matchRef.current) return;
          const next = normalizeExpressMatch({
            ...(matchRef.current as unknown as Record<string, unknown>),
            third_set_mode: mode,
          });
          applyMatch(next);
        }}
      />

      <ExpressControlDisplayPanel
        match={match}
        sessionId={sessionId}
        onNameScaleSaved={(scale) => {
          if (!matchRef.current) return;
          const next = normalizeExpressMatch({
            ...(matchRef.current as unknown as Record<string, unknown>),
            display_name_scale: scale,
          });
          applyMatch(next);
        }}
        onMediaScaleSaved={(scale) => {
          if (!matchRef.current) return;
          const next = normalizeExpressMatch({
            ...(matchRef.current as unknown as Record<string, unknown>),
            display_media_scale: scale,
          });
          applyMatch(next);
        }}
      />
    </div>
  );
}
