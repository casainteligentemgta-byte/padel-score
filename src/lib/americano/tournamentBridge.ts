import type { AmericanoPointsGoal } from '@/types/americano';
import { TournamentType } from '@/types/tournament';
import type { RotativePlayer } from '@/lib/americano/logic';

export const AMERICANO_ROTATIVE_FORMAT = 'AMERICANO_ROTATIVE' as const;

export type FlatTournamentPlayer = {
  id: string;
  name: string;
  photo?: string | null;
};

/** Extrae jugadores individuales del modelo legacy (parejas con p1/p2). */
export function flattenPlayersFromTeams(teams: any[]): FlatTournamentPlayer[] {
  const players: FlatTournamentPlayer[] = [];
  const seen = new Set<string>();

  for (const team of teams ?? []) {
    for (const key of ['p1', 'p2'] as const) {
      const p = team?.[key];
      if (!p) continue;
      const id = String(p.id || '').trim();
      const name = String(p.name || p.fullName || '').trim();
      if (!id && !name) continue;
      const playerId = id || `player-${players.length + 1}`;
      if (seen.has(playerId)) continue;
      seen.add(playerId);
      players.push({
        id: playerId,
        name: name || `Jugador ${players.length + 1}`,
        photo: p.photo ?? null,
      });
    }
  }

  return players;
}

export function normalizeAmericanoPointsGoal(value: unknown): AmericanoPointsGoal {
  const n = Number(value);
  if (n === 16 || n === 24 || n === 32 || n === 40) return n;
  if (n <= 16) return 16;
  if (n <= 24) return 24;
  if (n <= 32) return 32;
  return 40;
}

export function isAmericanoRotativeMatch(match: any): boolean {
  if (!match) return false;
  if (match.format === AMERICANO_ROTATIVE_FORMAT) return true;
  return Boolean(
    match.playerA1Id &&
      match.playerA2Id &&
      match.playerB1Id &&
      match.playerB2Id &&
      (match.stage === 'AMERICANO' || match.roundName?.toString().startsWith('Ronda')),
  );
}

export function rotativePlayersFromFlat(players: FlatTournamentPlayer[]): RotativePlayer[] {
  return players.map((p) => ({ id: p.id, name: p.name }));
}

export function resolveCategoryTournamentType(tournamentType: string | undefined): TournamentType {
  switch (tournamentType) {
    case 'AMERICANO':
      return TournamentType.AMERICANO_INDIVIDUAL;
    case 'DUPLA_FIJA':
      return TournamentType.AMERICANO_DUPLA;
    case 'CUADRO_CONSOLACION':
      return TournamentType.CUADRO_CONSOLACION;
    default:
      return TournamentType.ROUND_ROBIN;
  }
}


export function playerDisplayFromMatch(
  match: any,
  side: 'A1' | 'A2' | 'B1' | 'B2',
  fallback = '?',
): string {
  const key = `player${side}Name`;
  const idKey = `player${side}Id`;
  return String(match?.[key] || match?.[idKey] || fallback);
}
