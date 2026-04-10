/**
 * Misma resolución de `matchId` que la pizarra legacy
 * `/tournaments/[id]/display/[matchId]` (sin el fallback de partido simulado).
 */

function parseTimeFieldToMs(raw: unknown): number | null {
  if (raw == null) return null;
  const r = raw as { toDate?: () => Date; seconds?: number; nanoseconds?: number };
  if (typeof r?.toDate === 'function') return r.toDate().getTime();
  if (typeof r?.seconds === 'number')
    return r.seconds * 1000 + (r.nanoseconds || 0) / 1e6;
  if (typeof raw === 'string' || typeof raw === 'number') return new Date(raw).getTime();
  const d = new Date(raw as string | number | Date);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

function getMatchStartTimeMs(m: any): number | null {
  const raw = m?.startedAt ?? m?.actualStartTime ?? m?.startTime;
  return parseTimeFieldToMs(raw);
}

export function resolveMatchFromTournamentList(
  matches: any[] | null | undefined,
  matchId: string,
): any | null {
  const ms = Array.isArray(matches) ? matches : [];
  const mid = String(matchId ?? '').trim();
  if (!mid) return null;

  let found = ms.find((m: any) => String(m.id) === String(mid)) ?? null;

  if (!found && /^match_(\d+)$/.test(mid)) {
    const idx = parseInt(mid.replace('match_', ''), 10);
    if (idx >= 0 && idx < ms.length) found = ms[idx];
  }

  if (!found && /^m_(\d+)$/.test(mid)) {
    const ts = parseInt(mid.replace('m_', ''), 10);
    found =
      ms.find((m: any) => {
        const mTs = getMatchStartTimeMs(m);
        return mTs != null && Math.abs(mTs - ts) < 2000;
      }) ?? null;
  }

  if (!found && mid.startsWith('court_')) {
    const courtNum = parseInt(mid.replace('court_', ''), 10);
    if (!Number.isNaN(courtNum)) {
      found =
        ms.find(
          (m: any) =>
            (m.court ?? (m.courtIndex != null ? m.courtIndex + 1 : null)) === courtNum,
        ) ??
        ms.find((m: any) => m.courtIndex === courtNum - 1) ??
        null;
    }
  }

  return found;
}
