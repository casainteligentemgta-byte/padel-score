import type { AmericanoPointsGoal } from '@/types/americano';

export const AMERICANO_POINTS_PRESETS: {
  value: AmericanoPointsGoal;
  label: string;
  durationMin: number;
  durationMax: number;
}[] = [
  { value: 16, label: '16 pts · rápido', durationMin: 8, durationMax: 10 },
  { value: 24, label: '24 pts · estándar', durationMin: 12, durationMax: 15 },
  { value: 32, label: '32 pts · competitivo', durationMin: 18, durationMax: 22 },
  { value: 40, label: '40 pts · largo', durationMin: 25, durationMax: 30 },
];

export function americanoPointsDuration(points: AmericanoPointsGoal): { min: number; max: number } {
  const preset = AMERICANO_POINTS_PRESETS.find((p) => p.value === points);
  return preset ? { min: preset.durationMin, max: preset.durationMax } : { min: 12, max: 15 };
}
