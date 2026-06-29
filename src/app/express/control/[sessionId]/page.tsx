'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRouteSegment } from '@/lib/useRouteSegment';
import { Plus, Minus, Power, Settings, Pencil } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ExpressMatch, normalizeExpressMatch } from '@/types/expressMatch';
import {
  buildExpressNewMatch,
  buildExpressSessionReset,
  calculateNextState,
  pickExpressScorePatch,
} from '@/lib/expressScoring';
import {
  expressPlayerPatch,
  expressPlayerDisplayName,
  formatExpressPlayerFieldsForSave,
  readExpressPlayerSlot,
  syncExpressTeamNameFields,
  type ExpressPlayerSlot,
} from '@/lib/expressPlayerNames';
import { SmartPadelBallIcon } from '@/components/SmartPadelBallIcon';
import { ExpressControlSettingsDrawer } from '@/components/express/ExpressControlSettingsDrawer';
import { ExpressServerStrip } from '@/components/express/ExpressServerStrip';
import { ExpressMatchEndPanel } from '@/components/express/ExpressMatchEndPanel';
import { ExpressSideChangeBanner } from '@/components/express/ExpressSideChangeBanner';
import { PizarraWarmupOverlay } from '@/components/PizarraWarmupOverlay';
import {
  expressChronoTotalSec,
  expressFormatDuration,
  expressIsSideChangeVisible,
  expressIsWarmupActive,
  expressMatchChronoCron,
  expressMatchEndedSummary,
  expressWarmupEndsAtMs,
} from '@/lib/expressSessionMeta';
import { PizarraCenterChrono } from '@/components/pizarra/PizarraDisplayParts';
import { EXPRESS_TV_BRAND } from '@/lib/expressSlug';
import { BouncingBall } from '@/components/BouncingBall';
import type { ExpressThirdSetMode } from '@/lib/expressThirdSetMode';
import {
  expressSlotToServer,
  normalizeExpressServer,
  type ExpressServer,
} from '@/lib/expressServer';

type PageStatus = 'loading' | 'ready' | 'missing' | 'config_error';

const TEAM_A_SLOTS: ExpressPlayerSlot[] = ['a_p1', 'a_p2'];
const TEAM_B_SLOTS: ExpressPlayerSlot[] = ['b_p1', 'b_p2'];

function PlayerNameFields({
  slot,
  match,
  onChange,
  onBlurField,
  compact,
  isServing,
}: {
  slot: ExpressPlayerSlot;
  match: ExpressMatch;
  onChange: (slot: ExpressPlayerSlot, field: 'first' | 'last', value: string) => void;
  onBlurField: (slot: ExpressPlayerSlot, field: 'first' | 'last') => void;
  compact?: boolean;
  isServing?: boolean;
}) {
  const { first, last } = readExpressPlayerSlot(match, slot);
  const labels =
    slot === 'a_p1'
      ? { title: 'J1', phFirst: 'Nombre', phLast: 'Apellido' }
      : slot === 'a_p2'
        ? { title: 'J2', phFirst: 'Nombre', phLast: 'Apellido' }
        : slot === 'b_p1'
          ? { title: 'J3', phFirst: 'Nombre', phLast: 'Apellido' }
          : { title: 'J4', phFirst: 'Nombre', phLast: 'Apellido' };

  const inputCls = compact
    ? `rounded-lg border bg-black/30 px-2 py-1.5 text-[11px] font-semibold uppercase text-white placeholder:text-neutral-600 focus:outline-none ${
        isServing ? 'border-padel-primary focus:border-padel-primary' : 'border-neutral-700 focus:border-padel-primary'
      }`
    : `rounded-xl border bg-black/30 px-3 py-2 text-sm font-semibold uppercase text-white placeholder:text-neutral-600 focus:outline-none ${
        isServing ? 'border-padel-primary focus:border-padel-primary' : 'border-neutral-700 focus:border-padel-primary'
      }`;

  return (
    <div className="space-y-1">
      <p
        className={`text-[9px] font-bold uppercase tracking-widest ${
          isServing ? 'text-padel-primary' : 'text-neutral-500'
        }`}
      >
        {labels.title}
        {isServing ? ' · Saque' : ''}
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        <input
          value={first}
          onChange={(e) => onChange(slot, 'first', e.target.value)}
          onBlur={() => onBlurField(slot, 'first')}
          className={inputCls}
          placeholder={labels.phFirst}
          autoComplete="off"
        />
        <input
          value={last}
          onChange={(e) => onChange(slot, 'last', e.target.value)}
          onBlur={() => onBlurField(slot, 'last')}
          className={inputCls}
          placeholder={labels.phLast}
          autoComplete="off"
        />
      </div>
    </div>
  );
}

function TeamScoreBlock({
  team,
  label,
  slots,
  match,
  onScore,
  onPlayerChange,
  onPlayerBlur,
  namesOpen,
  onToggleNames,
  server,
}: {
  team: 'a' | 'b';
  label: string;
  slots: ExpressPlayerSlot[];
  match: ExpressMatch;
  onScore: (team: 'a' | 'b', action: 'increment' | 'decrement') => void;
  onPlayerChange: (slot: ExpressPlayerSlot, field: 'first' | 'last', value: string) => void;
  onPlayerBlur: (slot: ExpressPlayerSlot, field: 'first' | 'last') => void;
  namesOpen: boolean;
  onToggleNames: () => void;
  server: ExpressServer;
}) {
  const points = team === 'a' ? match.team_a_points : match.team_b_points;
  const games = team === 'a' ? match.team_a_games : match.team_b_games;

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-neutral-700 bg-neutral-900">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-neutral-800 px-3 py-1.5">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-padel-primary">{label}</span>
        <button
          type="button"
          onClick={onToggleNames}
          className="inline-flex items-center gap-1 rounded-lg border border-neutral-600 bg-neutral-950 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-padel-primary active:bg-neutral-800"
        >
          <Pencil className="h-3 w-3" />
          {namesOpen ? 'Listo' : 'Editar'}
        </button>
      </div>

      {namesOpen ? (
        <div className="shrink-0 space-y-2 border-b border-neutral-800 bg-black/25 px-3 py-2">
          {slots.map((slot) => {
            const slotServer = expressSlotToServer(slot);
            const isServing = server.team === slotServer.team && server.player === slotServer.player;
            return (
              <PlayerNameFields
                key={slot}
                compact
                isServing={isServing}
                slot={slot}
                match={match}
                onChange={onPlayerChange}
                onBlurField={onPlayerBlur}
              />
            );
          })}
        </div>
      ) : (
        <div className="shrink-0 space-y-0.5 border-b border-neutral-800 px-3 py-1.5">
          {slots.map((slot) => {
            const slotServer = expressSlotToServer(slot);
            const isServing = server.team === slotServer.team && server.player === slotServer.player;
            const name = expressPlayerDisplayName(match, slot);
            return (
              <div
                key={slot}
                className={`flex items-center gap-1.5 truncate text-[11px] font-bold uppercase leading-tight ${
                  isServing ? 'text-padel-primary' : 'text-neutral-300'
                }`}
              >
                {isServing ? <SmartPadelBallIcon size={12} title="Saque" /> : null}
                <span className="truncate">{name}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex min-h-0 flex-1 items-center justify-between gap-2 px-2 py-1">
        <button
          type="button"
          onClick={() => onScore(team, 'decrement')}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-600 bg-neutral-950 text-neutral-200 transition-transform active:scale-95 active:bg-neutral-800"
        >
          <Minus size={18} />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <span className="block text-5xl font-black leading-none tracking-tight text-padel-primary sm:text-6xl">
            {points}
          </span>
          <div className="mt-0.5 text-[10px] font-bold uppercase text-neutral-400">
            Juegos {games}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onScore(team, 'increment')}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-padel-primary bg-padel-primary text-black shadow-md shadow-padel-primary/30 transition-transform active:scale-95"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [namesOpenA, setNamesOpenA] = useState(false);
  const [namesOpenB, setNamesOpenB] = useState(false);
  const [matchBusy, setMatchBusy] = useState(false);
  const [uiTick, setUiTick] = useState(() => Date.now());

  const matchRef = useRef<ExpressMatch | null>(null);
  const pendingScoreRef = useRef(false);
  const updateGenRef = useRef(0);
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
    async (
      updates: Partial<ExpressMatch>,
      fallback: ExpressMatch,
      updateGen?: number,
    ): Promise<boolean> => {
      if (!supabase) return false;
      const { error } = await supabase
        .from('express_matches')
        .update(updates)
        .eq('session_id', sessionId);
      if (error) {
        console.error('[ExpressControl] update error:', error);
        if (updateGen == null || updateGenRef.current === updateGen) {
          applyMatch(fallback);
        }
        return false;
      }
      return true;
    },
    [sessionId, supabase, applyMatch],
  );

  useEffect(() => {
    const id = setInterval(() => setUiTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!supabase || !matchRef.current) return;
    const m = matchRef.current;
    if (!m.is_active || !m.warmup_ends_at) return;
    const endMs = new Date(m.warmup_ends_at).getTime();
    if (!Number.isFinite(endMs) || endMs <= Date.now()) {
      if (!m.match_started_at) {
        void updateServer(
          { warmup_ends_at: null, match_started_at: new Date().toISOString() },
          m,
        );
      }
      return;
    }
    const delay = endMs - Date.now() + 50;
    const t = setTimeout(() => {
      const cur = matchRef.current;
      if (!cur?.warmup_ends_at) return;
      void updateServer(
        { warmup_ends_at: null, match_started_at: new Date().toISOString() },
        cur,
      );
    }, delay);
    return () => clearTimeout(t);
  }, [supabase, match?.warmup_ends_at, match?.is_active, updateServer]);

  useEffect(() => {
    if (!supabase || status !== 'ready') return;

    const channel = supabase
      .channel(`express-control-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'express_matches',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (pendingScoreRef.current) return;
          const row = payload.new as Record<string, unknown> | null;
          if (!row) return;
          applyMatch(row as unknown as ExpressMatch);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, sessionId, status, applyMatch]);

  useEffect(() => {
    if (!supabase) return;

    const activateControl = async () => {
      setStatus('loading');
      const { data: existing, error: fetchError } = await supabase
        .from('express_matches')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (fetchError) {
        console.error('[ExpressControl] fetch error:', fetchError);
        setStatus('missing');
        return;
      }

      if (!existing) {
        setStatus('missing');
        return;
      }

      const normalized = normalizeExpressMatch(existing);
      const endedSummary = expressMatchEndedSummary(normalized);

      if (!endedSummary && !normalized.is_active) {
        const { data: activated, error } = await supabase
          .from('express_matches')
          .update({ is_active: true, qr_expires_at: null, match_ended_at: null })
          .eq('session_id', sessionId)
          .select('*')
          .maybeSingle();

        if (error) {
          console.error('[ExpressControl] activate error:', error);
          setStatus('missing');
          return;
        }

        if (!activated) {
          setStatus('missing');
          return;
        }

        applyMatch(activated);
        setStatus('ready');

        void fetch('/api/express/session-started', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        }).catch(() => {});
        return;
      }

      applyMatch(existing);
      setStatus('ready');
    };

    activateControl();
  }, [sessionId, supabase, applyMatch]);

  const handleScore = async (team: 'a' | 'b', action: 'increment' | 'decrement') => {
    if (!matchRef.current || pendingScoreRef.current) return;
    if (expressMatchEndedSummary(matchRef.current)) return;
    if (expressIsWarmupActive(matchRef.current, uiTick)) return;

    pendingScoreRef.current = true;
    const previousState = { ...matchRef.current };
    const patch = calculateNextState(previousState, team, action);
    const newState = { ...previousState, ...patch } as ExpressMatch;

    applyMatch(newState);

    const matchJustEnded = previousState.is_active && newState.is_active === false;
    let payload: Partial<ExpressMatch> = pickExpressScorePatch(newState);

    if (
      action === 'increment' &&
      !previousState.match_started_at &&
      !expressIsWarmupActive(previousState, uiTick)
    ) {
      payload.match_started_at = new Date().toISOString();
    }

    if (matchJustEnded) {
      const chronoState = {
        ...newState,
        is_active: true,
        match_started_at:
          previousState.match_started_at ?? payload.match_started_at ?? newState.match_started_at,
      };
      const elapsed = expressChronoTotalSec(chronoState);
      payload = {
        ...payload,
        match_ended_at: new Date().toISOString(),
        chrono_elapsed_sec: elapsed,
        match_started_at: null,
        side_change_until: null,
        warmup_ends_at: null,
      };
    }

    const updateGen = ++updateGenRef.current;
    const ok = await updateServer(payload, previousState, updateGen);
    pendingScoreRef.current = false;
  };

  const startNewMatch = async (withWarmup: boolean) => {
    if (!matchRef.current || matchBusy) return;
    setMatchBusy(true);
    const previousState = { ...matchRef.current };
    const reset = buildExpressNewMatch(previousState, { withWarmup });
    const newState = { ...previousState, ...reset } as ExpressMatch;
    applyMatch(newState);
    const ok = await updateServer(reset, previousState);
    setMatchBusy(false);
    if (!ok) return;
  };

  const dismissSideChange = async () => {
    if (!matchRef.current) return;
    const previousState = { ...matchRef.current };
    const updates: Partial<ExpressMatch> = { side_change_until: null };
    applyMatch({ ...previousState, ...updates } as ExpressMatch);
    await updateServer(updates, previousState);
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

  const patchMatch = useCallback(
    (patch: Record<string, unknown>) => {
      if (!matchRef.current) return;
      const next = normalizeExpressMatch({
        ...(matchRef.current as unknown as Record<string, unknown>),
        ...patch,
      });
      applyMatch(next);
    },
    [applyMatch],
  );

  const setServer = useCallback(
    async (team: 1 | 2, player: 1 | 2) => {
      if (!matchRef.current) return;
      const previousState = { ...matchRef.current };
      const updates: Partial<ExpressMatch> = { server_team: team, server_player: player };
      const newState = { ...previousState, ...updates } as ExpressMatch;
      applyMatch(newState);
      await updateServer(updates, previousState);
    },
    [applyMatch, updateServer],
  );

  const toggleServingPlayer = useCallback(async () => {
    if (!matchRef.current) return;
    const s = normalizeExpressServer(matchRef.current.server_team, matchRef.current.server_player);
    await setServer(s.team, s.player === 1 ? 2 : 1);
  }, [setServer]);

  const toggleServingTeam = useCallback(async () => {
    if (!matchRef.current) return;
    const s = normalizeExpressServer(matchRef.current.server_team, matchRef.current.server_player);
    await setServer(s.team === 1 ? 2 : 1, s.player);
  }, [setServer]);

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

  const server = normalizeExpressServer(match.server_team, match.server_player);
  const showEndSummary = expressMatchEndedSummary(match);
  const warmupActive = expressIsWarmupActive(match, uiTick);
  const warmupEndsAt = expressWarmupEndsAtMs(match);
  const sideChangeVisible = expressIsSideChangeVisible(match, uiTick);
  const chronoCron = expressMatchChronoCron(match);
  const scoringLocked = showEndSummary || warmupActive;

  return (
    <div className="relative flex h-dvh select-none flex-col overflow-hidden bg-surface px-3 py-2 font-sans text-white">
      <PizarraWarmupOverlay endsAt={warmupEndsAt} layout="banner" />
      <ExpressSideChangeBanner visible={sideChangeVisible} onDismiss={() => void dismissSideChange()} />
      <header className="mb-2 flex shrink-0 items-center justify-between gap-2 border-b border-neutral-800 pb-2">
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-1.5 text-xs font-bold tracking-widest text-padel-primary">
            {EXPRESS_TV_BRAND}
            {match.modo_puntos === 'super_tiebreak' && (
              <span className="rounded bg-amber-500/20 px-1 py-0.5 text-[9px] text-amber-400">SÚPER TB</span>
            )}
            {match.modo_puntos === 'tiebreak' && (
              <span className="rounded bg-red-500/20 px-1 py-0.5 text-[9px] text-red-500">TIE-BREAK</span>
            )}
          </h1>
          <p className="truncate text-[10px] uppercase text-neutral-500">{match.cancha_code}</p>
          {!showEndSummary && match.is_active ? (
            <div className="mt-0.5 scale-[0.85] origin-left">
              <PizarraCenterChrono cron={chronoCron} compact />
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-200 active:bg-neutral-800"
            aria-label="Ajustes"
          >
            <Settings size={18} className="text-padel-primary" />
          </button>
          <button
            type="button"
            onClick={endSession}
            className="flex h-9 items-center gap-1 rounded-xl bg-red-500/10 px-2.5 text-[10px] font-bold uppercase text-red-500 active:bg-red-500/20"
          >
            <Power size={14} />
            Fin
          </button>
        </div>
      </header>

      <main className={`flex min-h-0 flex-1 flex-col gap-1.5 ${scoringLocked ? 'pointer-events-none opacity-60' : ''}`}>
        <TeamScoreBlock
          team="a"
          label="Arriba · Pista"
          slots={TEAM_A_SLOTS}
          match={match}
          onScore={handleScore}
          onPlayerChange={handlePlayerChange}
          onPlayerBlur={handlePlayerBlur}
          namesOpen={namesOpenA}
          onToggleNames={() => setNamesOpenA((v) => !v)}
          server={server}
        />

        <ExpressServerStrip
          server={server}
          onSelect={(team, player) => void setServer(team, player)}
          onTogglePlayer={() => void toggleServingPlayer()}
          onToggleTeam={() => void toggleServingTeam()}
        />

        <TeamScoreBlock
          team="b"
          label="Abajo · Pista"
          slots={TEAM_B_SLOTS}
          match={match}
          onScore={handleScore}
          onPlayerChange={handlePlayerChange}
          onPlayerBlur={handlePlayerBlur}
          namesOpen={namesOpenB}
          onToggleNames={() => setNamesOpenB((v) => !v)}
          server={server}
        />
      </main>

      <footer className={`mt-2 shrink-0 ${scoringLocked ? 'pointer-events-none opacity-60' : ''}`}>
        <button
          type="button"
          onClick={handlePuntoDeOroToggle}
          className={`w-full rounded-xl border py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors active:opacity-90 ${
            match.punto_de_oro
              ? 'border-padel-primary/50 bg-padel-primary/15 text-padel-primary'
              : 'border-neutral-800 bg-neutral-900 text-neutral-500'
          }`}
        >
          {match.punto_de_oro ? '⚡ Punto de Oro activo' : 'Activar Punto de Oro'}
        </button>
      </footer>

      <ExpressControlSettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        match={match}
        sessionId={sessionId}
        onThirdSetModeSaved={(mode: ExpressThirdSetMode) => patchMatch({ third_set_mode: mode })}
        onNameScaleSaved={(scale) => patchMatch({ display_name_scale: scale })}
        onMediaScaleSaved={(scale) => patchMatch({ display_media_scale: scale })}
        onTickerPhrasesSaved={(phrases) => patchMatch({ display_ticker_phrases: phrases })}
      />

      {showEndSummary ? (
        <ExpressMatchEndPanel
          match={match}
          busy={matchBusy}
          onNewMatchWithWarmup={() => void startNewMatch(true)}
          onNewMatchDirect={() => void startNewMatch(false)}
          onEndSession={() => void endSession()}
        />
      ) : null}

      {warmupActive ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-20 z-30 px-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-padel-primary">
            Calentamiento · {expressFormatDuration(Math.max(0, Math.ceil(((warmupEndsAt ?? uiTick) - uiTick) / 1000)))}
          </p>
        </div>
      ) : null}
    </div>
  );
}
