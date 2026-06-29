import type { ExpressPlayerSlot } from '@/lib/expressPlayerNames';

export type ExpressServer = { team: 1 | 2; player: 1 | 2 };

export const EXPRESS_SERVER_DEFAULT: ExpressServer = { team: 1, player: 1 };

export function normalizeExpressServer(
  teamRaw: unknown,
  playerRaw: unknown,
): ExpressServer {
  const team = Number(teamRaw) === 2 ? 2 : 1;
  const player = Number(playerRaw) === 2 ? 2 : 1;
  return { team, player };
}

/** J1/J2 = equipo 1; J3/J4 = equipo 2. */
export function expressServerLabel(team: 1 | 2, player: 1 | 2): string {
  if (team === 1) return player === 1 ? 'J1' : 'J2';
  return player === 1 ? 'J3' : 'J4';
}

export function expressSlotToServer(slot: ExpressPlayerSlot): ExpressServer {
  if (slot === 'a_p1') return { team: 1, player: 1 };
  if (slot === 'a_p2') return { team: 1, player: 2 };
  if (slot === 'b_p1') return { team: 2, player: 1 };
  return { team: 2, player: 2 };
}

export function expressServerToSlot(server: ExpressServer): ExpressPlayerSlot {
  if (server.team === 1) return server.player === 1 ? 'a_p1' : 'a_p2';
  return server.player === 1 ? 'b_p1' : 'b_p2';
}

/** Rotación al ganar un juego (misma regla que torneos). */
export function expressServerAfterGameWon(totalGamesInSet: number): ExpressServer {
  const team = totalGamesInSet % 2 === 0 ? 1 : 2;
  const teamNumTurns = Math.floor(totalGamesInSet / 2);
  const player = teamNumTurns % 2 === 0 ? 1 : 2;
  return { team: team as 1 | 2, player: player as 1 | 2 };
}

/** Rotación en tie-break / súper tie-break tras un punto. */
export function expressServerAfterTiebreakPoint(
  totalPoints: number,
  current: ExpressServer,
): ExpressServer {
  if (totalPoints === 1 || (totalPoints > 1 && (totalPoints - 1) % 2 === 0)) {
    return {
      team: current.team === 1 ? 2 : 1,
      player: current.player === 1 ? 2 : 1,
    };
  }
  return current;
}

export function expressServerFields(server: ExpressServer): {
  server_team: 1 | 2;
  server_player: 1 | 2;
} {
  return { server_team: server.team, server_player: server.player };
}
