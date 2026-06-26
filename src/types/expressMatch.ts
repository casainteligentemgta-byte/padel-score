export type ExpressPoint = '0' | '15' | '30' | '40' | 'AD';

export type ExpressScoreMode = 'normal' | 'tiebreak';

export const EXPRESS_SET_SLOTS = 3 as const;

export interface ExpressMatch {
  id: string;
  cancha_code: string;
  session_id: string;
  team_a_name: string;
  team_b_name: string;
  team_a_avatar: string | null;
  team_b_avatar: string | null;
  team_a_points: ExpressPoint | string;
  team_b_points: ExpressPoint | string;
  team_a_games: number;
  team_b_games: number;
  sets_a: number[];
  sets_b: number[];
  current_set: number;
  modo_puntos: ExpressScoreMode;
  punto_de_oro: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function normalizeExpressMatch(row: Record<string, unknown>): ExpressMatch {
  const setsA = row.sets_a as number[] | null | undefined;
  const setsB = row.sets_b as number[] | null | undefined;
  return {
    ...(row as unknown as ExpressMatch),
    sets_a: setsA?.length === EXPRESS_SET_SLOTS ? setsA : [0, 0, 0],
    sets_b: setsB?.length === EXPRESS_SET_SLOTS ? setsB : [0, 0, 0],
  };
}

export function getExpressAppBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://smartpadel.app').replace(/\/+$/, '');
}

export function isValidExpressSlug(slug: string): boolean {
  return /^fast-\d+$/.test(slug);
}
