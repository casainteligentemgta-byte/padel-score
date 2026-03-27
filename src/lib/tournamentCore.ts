/**
 * TournamentCore: Lógica pura para la gestión de torneos deportivos.
 * Implementa Round Robin (Fase de Grupos) y Playoff (Eliminación Directa).
 * 
 * Basado en las reglas:
 * 1. Round Robin: Algoritmo de Rotación (Circle Method).
 * 2. Clasificación: Puntos -> Diferencia -> H2H -> Goles a Favor.
 * 3. Playoffs: Cruce en X (1A vs 2B, 1B vs 2A).
 */

export { MatchStatus } from '@/types/tournament';
import { MatchStatus } from '@/types/tournament';

export interface Team {
  id: string;
  name: string;
}

export interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  score1?: number; 
  score2?: number; 
  status: MatchStatus;
  group?: string;
  round?: number;
  isBye?: boolean;
}

export interface RankedTeam extends Team {
  matchesPlayed: number;
  victories: number;
  draws: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  totalPoints: number;
}

export interface TournamentState {
  groups: { [key: string]: Team[] };
  matches: Match[];
}

/**
 * 1. Fase de Grupos: Algoritmo de Rotación (Circle Method)
 */
export function generateRoundRobin(teams: Team[], groupName: string): Match[] {
  const participants = [...teams];
  
  // Si n es impar, añadir participante BYE
  if (participants.length % 2 !== 0) {
    participants.push({ id: 'BYE', name: 'DESCANSO' });
  }

  const n = participants.length;
  const rounds = n - 1;
  const matches: Match[] = [];
  const matchesPerRound = n / 2;

  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < matchesPerRound; i++) {
      const homeIdx = (r + i) % (n - 1);
      const awayIdx = (n - 1 - i + r) % (n - 1);

      // El último equipo se mantiene fijo, los otros rotan
      const team1 = (i === 0) ? participants[n - 1] : participants[homeIdx];
      const team2 = participants[awayIdx];

      if (team1.id !== 'BYE' && team2.id !== 'BYE') {
        matches.push({
          id: `${groupName}-R${r + 1}-M${i + 1}`,
          team1Id: team1.id,
          team2Id: team2.id,
          status: MatchStatus.PENDING,
          group: groupName,
          round: r + 1,
          isBye: false
        });
      }
    }
  }

  return matches;
}

/**
 * 2. Lógica de Puntuación (P = V*3 + E*1)
 */
export function calculatePoints(victories: number, draws: number): number {
  return (victories * 3) + (draws * 1);
}

/**
 * 3. Lógica de Clasificación (Ranking) - Pura e Inmutable
 */
export function getRanking(teams: Team[], matches: Match[]): RankedTeam[] {
  const ranking: { [id: string]: RankedTeam } = {};

  // Inicializar ranking por equipo
  teams.forEach(t => {
    ranking[t.id] = {
      ...t,
      matchesPlayed: 0,
      victories: 0,
      draws: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointDiff: 0,
      totalPoints: 0,
    };
  });

  // Procesar partidos finalizados
  const finishedMatches = matches.filter(m => m.status === MatchStatus.FINISHED && m.team1Id !== 'BYE' && m.team2Id !== 'BYE');

  finishedMatches.forEach(m => {
    const s1 = m.score1 ?? 0;
    const s2 = m.score2 ?? 0;
    const t1 = ranking[m.team1Id];
    const t2 = ranking[m.team2Id];

    if (!t1 || !t2) return;

    t1.matchesPlayed++;
    t2.matchesPlayed++;
    t1.pointsFor += s1;
    t1.pointsAgainst += s2;
    t2.pointsFor += s2;
    t2.pointsAgainst += s1;

    if (s1 > s2) {
      t1.victories++;
      t2.losses++;
    } else if (s2 > s1) {
      t2.victories++;
      t1.losses++;
    } else {
      t1.draws++;
      t2.draws++;
    }
  });

  // Calcular totales finales
  Object.values(ranking).forEach(tr => {
    tr.totalPoints = calculatePoints(tr.victories, tr.draws);
    tr.pointDiff = tr.pointsFor - tr.pointsAgainst;
  });

  // Ordenar según criterios jerárquicos
  return Object.values(ranking).sort((a, b) => {
    // 1. Puntos totales (P)
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }

    // 2. Diferencia de puntos (Delta)
    if (b.pointDiff !== a.pointDiff) {
      return b.pointDiff - a.pointDiff;
    }

    // 3. Resultado Directo (Head-to-Head)
    // Buscamos el partido entre A y B
    const h2hMatch = finishedMatches.find(m => 
      (m.team1Id === a.id && m.team2Id === b.id) || 
      (m.team1Id === b.id && m.team2Id === a.id)
    );

    if (h2hMatch) {
      const winnerId = (h2hMatch.score1 ?? 0) > (h2hMatch.score2 ?? 0) ? h2hMatch.team1Id : 
                       (h2hMatch.score2 ?? 0) > (h2hMatch.score1 ?? 0) ? h2hMatch.team2Id : null;
      if (winnerId === a.id) return -1;
      if (winnerId === b.id) return 1;
    }

    // 4. Puntos a Favor (Total anotado)
    return b.pointsFor - a.pointsFor;
  });
}

/**
 * 4. Eliminación Directa: Cruce en X
 */
export function generateSemifinals(rankingA: RankedTeam[], rankingB: RankedTeam[]): Match[] {
  if (rankingA.length < 2 || rankingB.length < 2) {
    throw new Error("Se necesitan al menos 2 equipos clasificados por grupo.");
  }

  const a1 = rankingA[0];
  const a2 = rankingA[1];
  const b1 = rankingB[0];
  const b2 = rankingB[1];

  return [
    {
      id: "SF1-A1vB2",
      team1Id: a1.id,
      team2Id: b2.id,
      status: MatchStatus.PENDING,
      group: "PLAYOFFS",
      round: 1
    },
    {
      id: "SF2-B1vA2",
      team1Id: b1.id,
      team2Id: a2.id,
      status: MatchStatus.PENDING,
      group: "PLAYOFFS",
      round: 1
    }
  ];
}
