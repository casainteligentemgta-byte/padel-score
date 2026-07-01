'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Play, Plus, Trash2, Users, LayoutGrid, Trophy } from 'lucide-react';
import { createAmericanoSession } from '@/app/actions/americanoActions';
import { AMERICANO_POINTS_PRESETS } from '@/lib/americano/pointsPresets';
import {
  generateAmericanoIndividualSchedule,
  playerNameById,
} from '@/lib/americano/rotationEngine';
import type { AmericanoPlayer, AmericanoPointsGoal } from '@/types/americano';

function newPlayer(index: number): AmericanoPlayer {
  return { id: `p-${index}-${Date.now()}`, name: `Jugador ${index}` };
}

const fieldInputClass =
  'w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 caret-padel-primary outline-none focus:border-padel-primary/60 focus:ring-1 focus:ring-padel-primary/30';

const playerInputClass =
  'min-w-0 flex-1 rounded-lg border border-white/20 bg-slate-900 px-2.5 py-2 text-sm text-white placeholder:text-neutral-500 caret-padel-primary outline-none focus:border-padel-primary/60 focus:ring-1 focus:ring-padel-primary/30';

export default function AmericanoLabPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [createError, setCreateError] = useState<string | null>(null);
  const [eventName, setEventName] = useState('Americano de prueba');
  const [baseVenue, setBaseVenue] = useState('El Bodeguero');
  const [numCourts, setNumCourts] = useState(2);
  const [pointsGoal, setPointsGoal] = useState<AmericanoPointsGoal>(24);
  const [players, setPlayers] = useState<AmericanoPlayer[]>(() =>
    Array.from({ length: 8 }, (_, i) => newPlayer(i + 1)),
  );

  const schedule = useMemo(
    () =>
      generateAmericanoIndividualSchedule({
        name: eventName,
        mode: 'individual',
        players,
        numCourts,
        pointsGoal,
      }),
    [eventName, players, numCourts, pointsGoal],
  );

  const addPlayer = () => {
    setPlayers((prev) => [...prev, newPlayer(prev.length + 1)]);
  };

  const removePlayer = (id: string) => {
    setPlayers((prev) => (prev.length <= 4 ? prev : prev.filter((p) => p.id !== id)));
  };

  const updateName = (id: string, name: string) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const startSession = () => {
    setCreateError(null);
    startTransition(async () => {
      const result = await createAmericanoSession({
        name: eventName,
        baseVenue,
        courtCount: numCourts,
        pointsGoal,
        playerNames: players.map((p) => p.name),
      });
      if (!result.ok) {
        setCreateError(result.error);
        return;
      }
      router.push(`/americano/session/${result.data.sessionId}`);
    });
  };

  return (
    <div className="min-h-screen bg-black font-outfit text-white">
      <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-amber-300">
        Staging · módulo americano en pruebas — no es producción
      </div>

      <header className="border-b border-white/10 px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-padel-primary">
              Smart Padel
            </p>
            <h1 className="text-xl font-black uppercase italic tracking-tight">Americano</h1>
            <p className="mt-1 text-xs text-neutral-400">
              Rey de pista · parejas rotativas · generador de rondas
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-xl border border-white/15 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-300 hover:border-padel-primary/40 hover:text-padel-primary"
          >
            ← Admin
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-8">
        <section className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Nombre del evento
            </span>
            <input
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Ej. Americano viernes noche"
              className={fieldInputClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Sede (publicidad TV)
            </span>
            <input
              value={baseVenue}
              onChange={(e) => setBaseVenue(e.target.value)}
              placeholder="Ej. El Bodeguero"
              className={fieldInputClass}
            />
          </label>
          <label className="block space-y-1.5 sm:col-span-2 sm:max-w-xs">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              <LayoutGrid className="h-3.5 w-3.5" /> Canchas
            </span>
            <input
              type="number"
              min={1}
              max={12}
              value={numCourts}
              onChange={(e) => setNumCourts(Math.max(1, Number(e.target.value) || 1))}
              className={fieldInputClass}
            />
          </label>
        </section>

        <section className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Puntos por partido
          </span>
          <div className="flex flex-wrap gap-2">
            {AMERICANO_POINTS_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setPointsGoal(preset.value)}
                className={`rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                  pointsGoal === preset.value
                    ? 'border-padel-primary bg-padel-primary/15 text-padel-primary'
                    : 'border-white/10 bg-white/5 text-neutral-400 hover:border-white/20'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide">
              <Users className="h-4 w-4 text-padel-primary" />
              Jugadores ({players.length})
            </h2>
            <button
              type="button"
              onClick={addPlayer}
              className="flex items-center gap-1 rounded-lg bg-padel-primary/15 px-2.5 py-1.5 text-[10px] font-bold uppercase text-padel-primary"
            >
              <Plus className="h-3.5 w-3.5" /> Añadir
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {players.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-center text-[10px] font-bold text-neutral-500">
                  {idx + 1}
                </span>
                <input
                  value={p.name}
                  onChange={(e) => updateName(p.id, e.target.value)}
                  className={playerInputClass}
                />
                <button
                  type="button"
                  onClick={() => removePlayer(p.id)}
                  className="rounded-lg p-2 text-neutral-500 hover:bg-red-500/10 hover:text-red-400"
                  aria-label="Quitar jugador"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-padel-primary/25 bg-padel-primary/5 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-padel-primary">
              <Trophy className="h-4 w-4" />
              Resumen
            </h2>
            <button
              type="button"
              disabled={pending || schedule.rounds.length === 0}
              onClick={startSession}
              className="inline-flex items-center gap-2 rounded-xl bg-padel-primary px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-black disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Crear sesión y controlar
            </button>
          </div>
          {createError ? (
            <p className="mb-3 text-xs text-red-400">{createError}</p>
          ) : null}
          <ul className="space-y-1 text-sm text-neutral-300">
            <li>
              <strong>{schedule.totalRounds}</strong> rondas · ~
              <strong>{schedule.estimatedMinutes}</strong> min estimados
            </li>
            <li>
              <strong>{numCourts * 4}</strong> plazas por ronda ·{' '}
              <strong>{schedule.restingPerRound}</strong> en descanso
            </li>
          </ul>
          {schedule.warnings.map((w) => (
            <p key={w} className="mt-2 text-xs text-amber-400">
              {w}
            </p>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wide">Cuadrante de rondas</h2>
          {schedule.rounds.length === 0 ? (
            <p className="text-sm text-neutral-500">Ajusta jugadores y canchas para generar rondas.</p>
          ) : (
            schedule.rounds.map((round) => (
              <div
                key={round.round}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
              >
                <div className="border-b border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-padel-primary">
                  Ronda {round.round}
                </div>
                <div className="divide-y divide-white/5">
                  {round.matches.map((m) => (
                    <div key={`${round.round}-${m.court}`} className="px-4 py-3 text-sm">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        Cancha {m.court}
                      </span>
                      <p className="mt-1 font-medium">
                        {playerNameById(players, m.teamA[0])} / {playerNameById(players, m.teamA[1])}
                        <span className="mx-2 text-neutral-500">vs</span>
                        {playerNameById(players, m.teamB[0])} / {playerNameById(players, m.teamB[1])}
                      </p>
                      <p className="mt-0.5 text-[10px] text-neutral-500">a {m.pointsGoal} puntos</p>
                    </div>
                  ))}
                  {round.restingPlayerIds.length > 0 ? (
                    <div className="px-4 py-2 text-xs text-neutral-500">
                      Descanso:{' '}
                      {round.restingPlayerIds
                        .map((id) => playerNameById(players, id))
                        .join(', ')}
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
