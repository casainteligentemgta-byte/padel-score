import { expressMarcadorTeamNombre } from '@/lib/expressPlayerNames';
import { EXPRESS_SET_SLOTS, type ExpressMatch } from '@/types/expressMatch';

/** Calentamiento express: 5 minutos. */
export const EXPRESS_WARMUP_MS = 5 * 60 * 1000;

/** Duración del aviso de cambio de lado en pantalla. */
export const EXPRESS_SIDE_CHANGE_MS = 60 * 1000;

export function parseExpressTimestamp(raw: unknown): number | null {
  if (raw == null || raw === '') return null;
  const ms = new Date(String(raw)).getTime();
  return Number.isFinite(ms) ? ms : null;
}

export function expressIsWarmupActive(match: ExpressMatch, nowMs = Date.now()): boolean {
  const end = parseExpressTimestamp(match.warmup_ends_at);
  return end != null && end > nowMs;
}

export function expressWarmupEndsAtMs(match: ExpressMatch): number | null {
  const end = parseExpressTimestamp(match.warmup_ends_at);
  if (end == null || end <= Date.now()) return null;
  return end;
}

export function expressIsSideChangeVisible(match: ExpressMatch, nowMs = Date.now()): boolean {
  const end = parseExpressTimestamp(match.side_change_until);
  return end != null && end > nowMs;
}

export function expressMatchEndedSummary(match: ExpressMatch): boolean {
  return !match.is_active && match.match_ended_at != null && expressMatchWinner(match) != null;
}

export function expressMatchWinner(match: ExpressMatch): 'a' | 'b' | null {
  let setsWonA = 0;
  let setsWonB = 0;
  for (let i = 0; i < EXPRESS_SET_SLOTS; i++) {
    const a = match.sets_a[i] ?? 0;
    const b = match.sets_b[i] ?? 0;
    if (a > b) setsWonA++;
    else if (b > a) setsWonB++;
  }
  if (setsWonA >= 2) return 'a';
  if (setsWonB >= 2) return 'b';
  return null;
}

export function expressChronoTotalSec(match: ExpressMatch, nowMs = Date.now()): number {
  const base = Math.max(0, match.chrono_elapsed_sec ?? 0);
  if (!match.is_active || expressIsWarmupActive(match, nowMs)) return base;
  const started = parseExpressTimestamp(match.match_started_at);
  if (started == null) return base;
  return base + Math.max(0, Math.floor((nowMs - started) / 1000));
}

export function expressMatchChronoCron(
  match: ExpressMatch,
): { elapsedSec: number; running: boolean; startedAt: number | null } {
  const warmup = expressIsWarmupActive(match);
  const running = match.is_active && !warmup && match.match_started_at != null;
  const startedAt = parseExpressTimestamp(match.match_started_at);
  return {
    elapsedSec: match.chrono_elapsed_sec ?? 0,
    running,
    startedAt,
  };
}

export function expressFormatDuration(totalSec: number): string {
  const sec = Math.max(0, totalSec);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function expressWinnerLabel(match: ExpressMatch): string {
  const winner = expressMatchWinner(match);
  if (!winner) return '—';
  return expressMarcadorTeamNombre(match, winner);
}

export function expressSetsSummary(match: ExpressMatch): string {
  const parts: string[] = [];
  const maxSet = match.is_active ? match.current_set : EXPRESS_SET_SLOTS;
  for (let i = 0; i < maxSet; i++) {
    const a = match.sets_a[i] ?? 0;
    const b = match.sets_b[i] ?? 0;
    if (!match.is_active && a === 0 && b === 0 && i >= match.current_set) break;
    parts.push(`${a}-${b}`);
  }
  return parts.join(' · ') || '0-0';
}
