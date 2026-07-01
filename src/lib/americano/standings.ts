import { isAmericanoRotativeMatch } from '@/lib/americano/tournamentBridge';

type StandingsMap = Record<string, any>;

type UpdateStatsFn = (
  id: string,
  name: string,
  photo: string | null,
  gamesWon: number,
  gamesLost: number,
  setsWon?: number,
  setsLost?: number,
) => void;

/** Aplica puntos de un partido americano rotativo al mapa de standings. */
export function applyAmericanoRotativeMatchToStandings(
  match: any,
  updateStats: UpdateStatsFn,
): void {
  const scoreA = match.games?.t1 ?? match.scoreA ?? 0;
  const scoreB = match.games?.t2 ?? match.scoreB ?? 0;

  const sides: Array<{ idKey: string; nameKey: string; won: number; lost: number }> = [
    { idKey: 'playerA1Id', nameKey: 'playerA1Name', won: scoreA, lost: scoreB },
    { idKey: 'playerA2Id', nameKey: 'playerA2Name', won: scoreA, lost: scoreB },
    { idKey: 'playerB1Id', nameKey: 'playerB1Name', won: scoreB, lost: scoreA },
    { idKey: 'playerB2Id', nameKey: 'playerB2Name', won: scoreB, lost: scoreA },
  ];

  for (const side of sides) {
    const id = String(match[side.idKey] || '').trim();
    if (!id) continue;
    const name = String(match[side.nameKey] || id);
    updateStats(id, name, null, side.won, side.lost, 0, 0);
  }
}

export function sortStandingsByAmericanoPoints(standings: StandingsMap): any[] {
  return Object.values(standings).sort((a: any, b: any) => {
    const ptsA = (a.gamesWon ?? 0) - (a.gamesLost ?? 0);
    const ptsB = (b.gamesWon ?? 0) - (b.gamesLost ?? 0);
    if (ptsB !== ptsA) return ptsB - ptsA;
    if ((b.gamesWon ?? 0) !== (a.gamesWon ?? 0)) return (b.gamesWon ?? 0) - (a.gamesWon ?? 0);
    return String(a.name || '').localeCompare(String(b.name || ''));
  });
}

export function isAmericanoRotativeMatchForStandings(match: any): boolean {
  return isAmericanoRotativeMatch(match);
}
