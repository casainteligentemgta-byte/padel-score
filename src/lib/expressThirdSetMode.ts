export type ExpressThirdSetMode = 'full' | 'tiebreak' | 'super';

export const EXPRESS_THIRD_SET_MODE_DEFAULT: ExpressThirdSetMode = 'full';

export const EXPRESS_THIRD_SET_MODE_OPTIONS: {
  id: ExpressThirdSetMode;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    id: 'full',
    label: 'Set completo',
    shortLabel: 'Set',
    description: 'Juegos normales; tie-break a 6-6',
  },
  {
    id: 'tiebreak',
    label: 'Tie-break 7 pts',
    shortLabel: 'TB 7',
    description: '3er set solo a puntos (a 7, dif. 2)',
  },
  {
    id: 'super',
    label: 'Súper TB 10 pts',
    shortLabel: 'STB 10',
    description: '3er set súper tie-break a 10',
  },
];

export function normalizeExpressThirdSetMode(raw: unknown): ExpressThirdSetMode {
  const t = String(raw ?? '').trim().toLowerCase();
  if (t === 'tiebreak' || t === 'super' || t === 'full') return t;
  return EXPRESS_THIRD_SET_MODE_DEFAULT;
}

export function expressThirdSetModeTvLabel(mode: ExpressThirdSetMode): string {
  switch (mode) {
    case 'full':
      return '3er Set: Set completo';
    case 'tiebreak':
      return '3er Set: Tie-break';
    case 'super':
      return '3er Set: Súper Tie-break';
    default:
      return '3er Set';
  }
}

export function isExpressThirdSetDeciderMode(mode: ExpressThirdSetMode): boolean {
  return mode === 'tiebreak' || mode === 'super';
}
