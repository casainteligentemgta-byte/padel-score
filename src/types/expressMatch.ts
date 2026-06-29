import { hydrateExpressPlayerFields } from '@/lib/expressPlayerNames';
import { normalizeExpressDisplayNameScale } from '@/lib/expressDisplayNameScale';
import { normalizeExpressDisplayMediaScale } from '@/lib/expressDisplayMediaScale';
import { normalizeExpressTickerPhrases } from '@/lib/expressTickerMessages';
import {
  EXPRESS_THIRD_SET_MODE_DEFAULT,
  normalizeExpressThirdSetMode,
  type ExpressThirdSetMode,
} from '@/lib/expressThirdSetMode';

export type ExpressPoint = '0' | '15' | '30' | '40' | 'AD';

export type ExpressScoreMode = 'normal' | 'tiebreak' | 'super_tiebreak';

export const EXPRESS_SET_SLOTS = 3 as const;

export interface ExpressMatch {
  id: string;
  cancha_code: string;
  session_id: string;
  team_a_name: string;
  team_b_name: string;
  team_a_p1_first: string;
  team_a_p1_last: string;
  team_a_p2_first: string;
  team_a_p2_last: string;
  team_b_p1_first: string;
  team_b_p1_last: string;
  team_b_p2_first: string;
  team_b_p2_last: string;
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
  /** Formato del 3er set (full | tiebreak | super). */
  third_set_mode: ExpressThirdSetMode;
  is_active: boolean;
  base_venue: string;
  /** Multiplicador tamaño nombres en TV (0.85–2.5). */
  display_name_scale: number;
  /** Multiplicador altura vídeo + imágenes en TV (0.5–2.5). */
  display_media_scale: number;
  /** Ventana temporal QR (Telegram). Null = QR siempre en standby. */
  qr_expires_at: string | null;
  /** Frases propias en tira informativa (además de mensajes admin). */
  display_ticker_phrases: string[];
  created_at: string;
  updated_at: string;
}

export function normalizeExpressMatch(row: Record<string, unknown>): ExpressMatch {
  const setsA = row.sets_a as number[] | null | undefined;
  const setsB = row.sets_b as number[] | null | undefined;
  const hydrated = hydrateExpressPlayerFields(row);
  return {
    ...(hydrated as unknown as ExpressMatch),
    team_a_p1_first: String(hydrated.team_a_p1_first ?? ''),
    team_a_p1_last: String(hydrated.team_a_p1_last ?? ''),
    team_a_p2_first: String(hydrated.team_a_p2_first ?? ''),
    team_a_p2_last: String(hydrated.team_a_p2_last ?? ''),
    team_b_p1_first: String(hydrated.team_b_p1_first ?? ''),
    team_b_p1_last: String(hydrated.team_b_p1_last ?? ''),
    team_b_p2_first: String(hydrated.team_b_p2_first ?? ''),
    team_b_p2_last: String(hydrated.team_b_p2_last ?? ''),
    base_venue: String(hydrated.base_venue ?? ''),
    display_name_scale: normalizeExpressDisplayNameScale(hydrated.display_name_scale),
    display_media_scale: normalizeExpressDisplayMediaScale(hydrated.display_media_scale),
    qr_expires_at: hydrated.qr_expires_at ? String(hydrated.qr_expires_at) : null,
    display_ticker_phrases: normalizeExpressTickerPhrases(hydrated.display_ticker_phrases),
    third_set_mode: normalizeExpressThirdSetMode(hydrated.third_set_mode),
    sets_a: setsA?.length === EXPRESS_SET_SLOTS ? setsA : [0, 0, 0],
    sets_b: setsB?.length === EXPRESS_SET_SLOTS ? setsB : [0, 0, 0],
  };
}

export { getAppBaseUrl as getExpressAppBaseUrl } from '@/lib/brand';
export { isValidExpressSlug } from '@/lib/expressSlug';
