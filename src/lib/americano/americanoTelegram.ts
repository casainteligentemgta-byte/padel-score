import { notifyTelegramAdmin } from '@/lib/telegramBot';

export type AmericanoStandingRow = {
  name: string;
  totalPoints: number;
  rank: number;
};

export function formatAmericanoPodiumMessage(input: {
  sessionName: string;
  baseVenue?: string;
  pointsGoal: number;
  standings: AmericanoStandingRow[];
  tournamentName?: string;
}): string {
  const top = input.standings.slice(0, 3);
  const medals = ['🥇', '🥈', '🥉'];
  const lines = top.map((row, idx) => {
    const medal = medals[idx] ?? `${row.rank}.`;
    return `${medal} *${row.name}* — ${row.totalPoints} pts`;
  });

  const header = input.tournamentName
    ? `🏆 *Americano finalizado*\n*${input.tournamentName}*`
    : `🏆 *Americano finalizado*\n*${input.sessionName}*`;

  const venue = input.baseVenue ? `\n📍 ${input.baseVenue}` : '';
  const format = `\n🎾 Formato: a ${input.pointsGoal} puntos`;

  return `${header}${venue}${format}\n\n*Podio*\n${lines.join('\n')}`;
}

export async function notifyAmericanoSessionFinished(payload: {
  sessionName: string;
  baseVenue?: string;
  pointsGoal: number;
  standings: AmericanoStandingRow[];
  tournamentName?: string;
}): Promise<void> {
  const text = formatAmericanoPodiumMessage(payload);
  await notifyTelegramAdmin(text);
}
