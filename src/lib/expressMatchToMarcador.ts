import { expressMarcadorTeamNombre } from '@/lib/expressPlayerNames';
import type { ExpressMatch } from '@/types/expressMatch';

/** Formato `marcador` de pizarra (compatible con PizarraTableScoreboard). */
export type PizarraMarcador = {
  equipo_1: { nombre: string; color?: string };
  equipo_2: { nombre: string; color?: string };
  puntos: { local: string; visitante: string };
  games: { local: number; visitante: number };
  sets: { local: number; visitante: number };
  historico_sets: { local: number; visitante: number }[];
  modo_puntos: 'normal' | 'tiebreak' | 'super_tiebreak';
  golden_point: boolean;
  match_format: string;
  saque?: { equipo: number; jugador: number };
};

export function expressMatchToMarcador(match: ExpressMatch): PizarraMarcador {
  const setsA = match.sets_a ?? [0, 0, 0];
  const setsB = match.sets_b ?? [0, 0, 0];
  const activeSetIdx = Math.max(0, match.current_set - 1);

  let setsWonA = 0;
  let setsWonB = 0;
  const historico_sets: { local: number; visitante: number }[] = [];

  for (let i = 0; i < activeSetIdx; i++) {
    const a = setsA[i] ?? 0;
    const b = setsB[i] ?? 0;
    historico_sets.push({ local: a, visitante: b });
    if (a > b) setsWonA++;
    else if (b > a) setsWonB++;
  }

  const modo_puntos =
    match.modo_puntos === 'tiebreak' ? ('tiebreak' as const) : ('normal' as const);

  return {
    equipo_1: { nombre: expressMarcadorTeamNombre(match, 'a'), color: '#CCFF00' },
    equipo_2: { nombre: expressMarcadorTeamNombre(match, 'b'), color: '#FF5500' },
    puntos: {
      local: String(match.team_a_points ?? '0'),
      visitante: String(match.team_b_points ?? '0'),
    },
    games: {
      local: match.team_a_games ?? 0,
      visitante: match.team_b_games ?? 0,
    },
    sets: { local: setsWonA, visitante: setsWonB },
    historico_sets,
    modo_puntos,
    golden_point: match.punto_de_oro,
    match_format: 'BEST_OF_3',
  };
}

import { courtNumFromExpressSlug } from '@/lib/expressSlug';

export { courtNumFromExpressSlug };

export function canchaIdFromExpressSlug(slug: string): string {
  return `cancha_${courtNumFromExpressSlug(slug)}`;
}
