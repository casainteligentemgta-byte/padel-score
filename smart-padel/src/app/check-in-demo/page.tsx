'use client';

import {
  canAssignMatch,
  getConflictingMatches,
  hasScheduleConflict,
  type ExistingMatch,
  type ScheduledSlot,
} from '@/lib/scheduleConflicts';
import { useState } from 'react';

// Datos de ejemplo: partidos ya asignados
const existingMatches: ExistingMatch[] = [
  {
    id: '1',
    start: new Date('2025-06-15T10:00:00'),
    end: new Date('2025-06-15T11:00:00'),
    playerIds: ['player-a', 'player-b', 'player-c', 'player-d'],
  },
  {
    id: '2',
    start: new Date('2025-06-15T11:30:00'),
    end: new Date('2025-06-15T12:30:00'),
    playerIds: ['player-e', 'player-f', 'player-g', 'player-h'],
  },
  {
    id: '3',
    start: new Date('2025-06-15T10:30:00'),
    end: new Date('2025-06-15T11:30:00'),
    playerIds: ['player-a', 'player-x', 'player-y', 'player-z'],
  },
];

export default function CheckInDemoPage() {
  const [start, setStart] = useState('2025-06-15T10:15:00');
  const [end, setEnd] = useState('2025-06-15T11:15:00');
  const [playerIdsText, setPlayerIdsText] = useState('player-a, player-b, player-c, player-d');

  const candidateSlot: ScheduledSlot = {
    start: new Date(start),
    end: new Date(end),
    playerIds: playerIdsText.split(',').map((s) => s.trim()).filter(Boolean),
  };

  const conflict = hasScheduleConflict(candidateSlot, existingMatches);
  const canAssign = canAssignMatch(candidateSlot, existingMatches);
  const conflicting = getConflictingMatches(candidateSlot, existingMatches);

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-8">
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-xl font-semibold text-zinc-900">Demo: cruce de horarios (check-in)</h1>
        <p className="text-sm text-zinc-600">
          El algoritmo evita que un jugador tenga dos partidos a la misma hora. Prueba distintos
          horarios y jugadores; si alguno ya está en un partido que se solapa, habrá conflicto.
        </p>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-medium text-zinc-700">Partido a asignar</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-500">Inicio</label>
              <input
                type="datetime-local"
                value={start.slice(0, 16)}
                onChange={(e) => setStart(e.target.value + ':00')}
                className="mt-0.5 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500">Fin</label>
              <input
                type="datetime-local"
                value={end.slice(0, 16)}
                onChange={(e) => setEnd(e.target.value + ':00')}
                className="mt-0.5 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500">IDs de jugadores (separados por coma)</label>
              <input
                type="text"
                value={playerIdsText}
                onChange={(e) => setPlayerIdsText(e.target.value)}
                className="mt-0.5 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
                placeholder="player-a, player-b, player-c, player-d"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-medium text-zinc-700">Partidos ya asignados (ejemplo)</h2>
          <ul className="space-y-1 text-xs text-zinc-600">
            {existingMatches.map((m) => (
              <li key={m.id}>
                {m.start.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })} –{' '}
                {m.end.toLocaleTimeString('es-ES', { timeStyle: 'short' })} → {m.playerIds.join(', ')}
              </li>
            ))}
          </ul>
        </div>

        <div
          className={`rounded-xl p-4 ${
            conflict ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
          }`}
        >
          <p className="font-medium">
            {canAssign ? '✓ Se puede asignar el partido (sin conflicto).' : '✗ Conflicto: no asignar.'}
          </p>
          {conflicting.length > 0 && (
            <p className="mt-2 text-sm">
              Choca con partido(s): {conflicting.map((m) => m.id).join(', ')}
            </p>
          )}
        </div>

        <p className="text-xs text-zinc-500">
          Lógica en <code className="rounded bg-zinc-200 px-1">src/lib/scheduleConflicts.ts</code>:
          <code className="block mt-1 rounded bg-zinc-200 p-2">hasScheduleConflict()</code>,
          <code className="rounded bg-zinc-200 px-1">canAssignMatch()</code>,
          <code className="rounded bg-zinc-200 px-1">getConflictingMatches()</code>.
        </p>
      </div>
    </div>
  );
}
