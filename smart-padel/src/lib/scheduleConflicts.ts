/**
 * Lógica de cruce de horarios (check-in).
 * Evita que un jugador tenga dos partidos asignados a la misma hora.
 */

export interface ScheduledSlot {
  start: Date;
  end: Date;
  playerIds: string[];
}

export interface ExistingMatch {
  id: string;
  start: Date;
  end: Date;
  playerIds: string[];
}

/**
 * Comprueba si el intervalo [candidateStart, candidateEnd] se solapa
 * con [existingStart, existingEnd] (solapa si comparten algún momento).
 */
function intervalsOverlap(
  candidateStart: Date,
  candidateEnd: Date,
  existingStart: Date,
  existingEnd: Date
): boolean {
  return candidateStart.getTime() < existingEnd.getTime() && candidateEnd.getTime() > existingStart.getTime();
}

/**
 * Indica si asignar un partido en el slot dado provocaría que algún jugador
 * tenga dos partidos a la vez.
 * @param candidateSlot - Horario y jugadores del partido a asignar
 * @param existingMatches - Partidos ya asignados (con start, end, playerIds)
 * @returns true si hay conflicto (algún jugador ya tiene partido a esa hora)
 */
export function hasScheduleConflict(
  candidateSlot: ScheduledSlot,
  existingMatches: ExistingMatch[]
): boolean {
  const { start: cStart, end: cEnd, playerIds } = candidateSlot;
  for (const match of existingMatches) {
    if (!intervalsOverlap(cStart, cEnd, match.start, match.end)) continue;
    const hasSharedPlayer = playerIds.some((id) => match.playerIds.includes(id));
    if (hasSharedPlayer) return true;
  }
  return false;
}

/**
 * Filtra los partidos existentes que causarían conflicto para el slot candidato.
 * Útil para mostrar al usuario con qué partidos chocaría.
 */
export function getConflictingMatches(
  candidateSlot: ScheduledSlot,
  existingMatches: ExistingMatch[]
): ExistingMatch[] {
  return existingMatches.filter((match) => {
    if (!intervalsOverlap(candidateSlot.start, candidateSlot.end, match.start, match.end))
      return false;
    return candidateSlot.playerIds.some((id) => match.playerIds.includes(id));
  });
}

/**
 * Comprueba si se puede asignar un partido (no hay conflicto para ningún jugador).
 * Alias más legible para el check-in.
 */
export function canAssignMatch(
  candidateSlot: ScheduledSlot,
  existingMatches: ExistingMatch[]
): boolean {
  return !hasScheduleConflict(candidateSlot, existingMatches);
}
