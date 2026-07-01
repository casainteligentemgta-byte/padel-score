import type { AmericanoMatch } from '@/lib/americano/logic';

/** Partido activo en una cancha: el pending de menor ronda. */
export function resolveCurrentCourtMatch(
  matches: AmericanoMatch[],
  courtNumber: number,
): AmericanoMatch | null {
  const pending = matches
    .filter((m) => m.courtNumber === courtNumber && m.status === 'pending')
    .sort((a, b) => a.roundNumber - b.roundNumber);
  return pending[0] ?? null;
}

/** Último partido terminado en la cancha (para pantalla de espera). */
export function resolveLastFinishedCourtMatch(
  matches: AmericanoMatch[],
  courtNumber: number,
): AmericanoMatch | null {
  const finished = matches
    .filter((m) => m.courtNumber === courtNumber && m.status === 'finished')
    .sort((a, b) => b.roundNumber - a.roundNumber);
  return finished[0] ?? null;
}
