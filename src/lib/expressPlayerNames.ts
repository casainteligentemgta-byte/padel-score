import type { ExpressMatch } from '@/types/expressMatch';

export type ExpressPlayerSlot = 'a_p1' | 'a_p2' | 'b_p1' | 'b_p2';

type ExpressPlayerNameField =
  | 'team_a_p1_first'
  | 'team_a_p1_last'
  | 'team_a_p2_first'
  | 'team_a_p2_last'
  | 'team_b_p1_first'
  | 'team_b_p1_last'
  | 'team_b_p2_first'
  | 'team_b_p2_last';

const PLAYER_FIELD: Record<
  ExpressPlayerSlot,
  { first: ExpressPlayerNameField; last: ExpressPlayerNameField }
> = {
  a_p1: { first: 'team_a_p1_first', last: 'team_a_p1_last' },
  a_p2: { first: 'team_a_p2_first', last: 'team_a_p2_last' },
  b_p1: { first: 'team_b_p1_first', last: 'team_b_p1_last' },
  b_p2: { first: 'team_b_p2_first', last: 'team_b_p2_last' },
};

const GENERIC_TEAM = /^(equipo|team|pareja|jugador|player)\s*[ab]?[\s\d]*$/i;

/** Mientras se escribe: conserva espacios (incl. al final), unifica espacios múltiples. */
export function normalizeExpressPlayerInput(raw: string): string {
  return String(raw ?? '')
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

/** Valor final guardado en BD (sin espacios al inicio/fin). */
export function formatExpressPlayerField(raw: string): string {
  return normalizeExpressPlayerInput(raw).trim();
}

export function buildExpressPlayerFullName(first: string, last: string): string {
  const f = formatExpressPlayerField(first);
  const l = formatExpressPlayerField(last);
  if (f && l) return `${f} ${l}`;
  return f || l;
}

export function expressTeamPairNombre(
  p1First: string,
  p1Last: string,
  p2First: string,
  p2Last: string,
): string {
  const p1 = buildExpressPlayerFullName(p1First, p1Last);
  const p2 = buildExpressPlayerFullName(p2First, p2Last);
  if (p1 && p2) return `${p1} / ${p2}`;
  return p1 || p2;
}

export function expressTeamNombreFromMatch(match: ExpressMatch, team: 'a' | 'b'): string {
  if (team === 'a') {
    const fromPlayers = expressTeamPairNombre(
      match.team_a_p1_first,
      match.team_a_p1_last,
      match.team_a_p2_first,
      match.team_a_p2_last,
    );
    if (fromPlayers) return fromPlayers;
    const legacy = formatExpressPlayerField(match.team_a_name);
    if (legacy && !GENERIC_TEAM.test(legacy)) return legacy;
    return '';
  }
  const fromPlayers = expressTeamPairNombre(
    match.team_b_p1_first,
    match.team_b_p1_last,
    match.team_b_p2_first,
    match.team_b_p2_last,
  );
  if (fromPlayers) return fromPlayers;
  const legacy = formatExpressPlayerField(match.team_b_name);
  if (legacy && !GENERIC_TEAM.test(legacy)) return legacy;
  return '';
}

/** Etiqueta pizarra cuando faltan nombres (no "EQUIPO A"). */
export function expressTeamFallbackLabel(team: 'a' | 'b'): string {
  return team === 'a' ? 'JUGADOR 1 / JUGADOR 2' : 'JUGADOR 3 / JUGADOR 4';
}

export function expressMarcadorTeamNombre(match: ExpressMatch, team: 'a' | 'b'): string {
  return expressTeamNombreFromMatch(match, team) || expressTeamFallbackLabel(team);
}

export function syncExpressTeamNameFields(match: ExpressMatch): Pick<ExpressMatch, 'team_a_name' | 'team_b_name'> {
  return {
    team_a_name: expressTeamNombreFromMatch(match, 'a'),
    team_b_name: expressTeamNombreFromMatch(match, 'b'),
  };
}

export function emptyExpressPlayerFields(): Pick<
  ExpressMatch,
  | 'team_a_p1_first'
  | 'team_a_p1_last'
  | 'team_a_p2_first'
  | 'team_a_p2_last'
  | 'team_b_p1_first'
  | 'team_b_p1_last'
  | 'team_b_p2_first'
  | 'team_b_p2_last'
  | 'team_a_name'
  | 'team_b_name'
> {
  return {
    team_a_p1_first: '',
    team_a_p1_last: '',
    team_a_p2_first: '',
    team_a_p2_last: '',
    team_b_p1_first: '',
    team_b_p1_last: '',
    team_b_p2_first: '',
    team_b_p2_last: '',
    team_a_name: '',
    team_b_name: '',
  };
}

export function parseLegacyTeamNameToSlots(
  teamName: string,
): [{ first: string; last: string }, { first: string; last: string }] {
  const raw = String(teamName || '').trim();
  if (!raw || GENERIC_TEAM.test(raw)) {
    return [
      { first: '', last: '' },
      { first: '', last: '' },
    ];
  }
  const parts = raw.split(/\s*\/\s*/).map((p) => p.trim()).filter(Boolean);
  const splitOne = (full: string) => {
    const tokens = full.split(/\s+/).filter(Boolean);
    if (tokens.length <= 1) return { first: tokens[0] || '', last: '' };
    return { first: tokens[0], last: tokens.slice(1).join(' ') };
  };
  if (parts.length >= 2) {
    return [splitOne(parts[0]), splitOne(parts[1])];
  }
  if (parts.length === 1) {
    return [splitOne(parts[0]), { first: '', last: '' }];
  }
  return [
    { first: '', last: '' },
    { first: '', last: '' },
  ];
}

export function hydrateExpressPlayerFields(row: Record<string, unknown>): Record<string, unknown> {
  const out = { ...row };
  const hasAnyPlayer =
    String(out.team_a_p1_first ?? '').trim() ||
    String(out.team_a_p1_last ?? '').trim() ||
    String(out.team_b_p1_first ?? '').trim();

  if (!hasAnyPlayer) {
    const [a1, a2] = parseLegacyTeamNameToSlots(String(out.team_a_name ?? ''));
    const [b1, b2] = parseLegacyTeamNameToSlots(String(out.team_b_name ?? ''));
    out.team_a_p1_first = a1.first;
    out.team_a_p1_last = a1.last;
    out.team_a_p2_first = a2.first;
    out.team_a_p2_last = a2.last;
    out.team_b_p1_first = b1.first;
    out.team_b_p1_last = b1.last;
    out.team_b_p2_first = b2.first;
    out.team_b_p2_last = b2.last;
  }

  return out;
}

export function expressPlayerPatch(
  slot: ExpressPlayerSlot,
  field: 'first' | 'last',
  value: string,
  finalize = false,
): Partial<ExpressMatch> {
  const key = PLAYER_FIELD[slot][field];
  const normalized = finalize ? formatExpressPlayerField(value) : normalizeExpressPlayerInput(value);
  return { [key]: normalized } as Partial<ExpressMatch>;
}

export function formatExpressPlayerFieldsForSave(match: ExpressMatch): Pick<
  ExpressMatch,
  | 'team_a_p1_first'
  | 'team_a_p1_last'
  | 'team_a_p2_first'
  | 'team_a_p2_last'
  | 'team_b_p1_first'
  | 'team_b_p1_last'
  | 'team_b_p2_first'
  | 'team_b_p2_last'
  | 'team_a_name'
  | 'team_b_name'
> {
  const draft = { ...match };
  for (const { slot } of EXPRESS_CONTROL_PLAYER_SLOTS) {
    const keys = PLAYER_FIELD[slot];
    draft[keys.first] = formatExpressPlayerField(String(match[keys.first] ?? ''));
    draft[keys.last] = formatExpressPlayerField(String(match[keys.last] ?? ''));
  }
  return {
    team_a_p1_first: draft.team_a_p1_first,
    team_a_p1_last: draft.team_a_p1_last,
    team_a_p2_first: draft.team_a_p2_first,
    team_a_p2_last: draft.team_a_p2_last,
    team_b_p1_first: draft.team_b_p1_first,
    team_b_p1_last: draft.team_b_p1_last,
    team_b_p2_first: draft.team_b_p2_first,
    team_b_p2_last: draft.team_b_p2_last,
    ...syncExpressTeamNameFields(draft),
  };
}

export const EXPRESS_CONTROL_PLAYER_SLOTS: {
  team: 'a' | 'b';
  slot: ExpressPlayerSlot;
  label: string;
}[] = [
  { team: 'a', slot: 'a_p1', label: 'Jugador 1' },
  { team: 'a', slot: 'a_p2', label: 'Jugador 2' },
  { team: 'b', slot: 'b_p1', label: 'Jugador 3' },
  { team: 'b', slot: 'b_p2', label: 'Jugador 4' },
];

export function readExpressPlayerSlot(
  match: ExpressMatch,
  slot: ExpressPlayerSlot,
): { first: string; last: string } {
  const keys = PLAYER_FIELD[slot];
  return {
    first: String(match[keys.first] ?? ''),
    last: String(match[keys.last] ?? ''),
  };
}

const SLOT_FALLBACK: Record<ExpressPlayerSlot, string> = {
  a_p1: 'Jugador 1',
  a_p2: 'Jugador 2',
  b_p1: 'Jugador 3',
  b_p2: 'Jugador 4',
};

export function expressPlayerDisplayName(match: ExpressMatch, slot: ExpressPlayerSlot): string {
  const { first, last } = readExpressPlayerSlot(match, slot);
  return buildExpressPlayerFullName(first, last) || SLOT_FALLBACK[slot];
}
