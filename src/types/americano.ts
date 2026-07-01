/** Puntos por partido en americano (rey de pista / individual). */
export type AmericanoPointsGoal = 16 | 24 | 32 | 40;

export type AmericanoMode = 'individual' | 'dupla_fija';

export interface AmericanoPlayer {
  id: string;
  name: string;
}

export interface AmericanoCourtMatch {
  court: number;
  teamA: [string, string];
  teamB: [string, string];
  pointsGoal: AmericanoPointsGoal;
}

export interface AmericanoRound {
  round: number;
  matches: AmericanoCourtMatch[];
  restingPlayerIds: string[];
}

export interface AmericanoScheduleConfig {
  name: string;
  mode: AmericanoMode;
  players: AmericanoPlayer[];
  numCourts: number;
  pointsGoal: AmericanoPointsGoal;
  /** Margen entre rondas (min). */
  bufferMinutes?: number;
}

export interface AmericanoScheduleResult {
  rounds: AmericanoRound[];
  totalRounds: number;
  restingPerRound: number;
  estimatedMinutes: number;
  warnings: string[];
}
