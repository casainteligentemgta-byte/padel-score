/**
 * Sedes y pistas derivadas de torneos (Admin Publicidad, Dynamic Studio).
 */

export type VenueWithCourts = {
  name: string;
  courts: { key: string; label: string; displayNum: number }[];
  /** Primer torneo encontrado para esta sede (enlaces a monitor / pizarra por club). */
  tournamentId?: string;
};

export function buildVenuesAndCourtsFromTournaments(tournaments: any[]): VenueWithCourts[] {
  const map = new Map<string, { maxN: number; bestNames: string[]; tournamentId?: string }>();

  for (const t of tournaments || []) {
    const name = String(t?.complexName || (t as any)?.complex || (t as any)?._complexName || '').trim();
    if (!name) continue;
    const tid = String(t?.id ?? '').trim();
    const courtNames = Array.isArray(t.courtNames) ? t.courtNames.map((x: any) => String(x).trim()) : [];
    const totalFromNum = Number(t.totalCourts) || 0;
    const n = Math.max(courtNames.length, totalFromNum, 1);
    const prev = map.get(name);
    const useNames = courtNames.length >= (prev?.bestNames.length ?? 0) ? courtNames : prev?.bestNames ?? courtNames;
    map.set(name, {
      maxN: Math.max(prev?.maxN ?? 0, n),
      bestNames: useNames,
      tournamentId: prev?.tournamentId || tid || undefined,
    });
  }

  return Array.from(map.entries())
    .map(([name, v]) => {
      const courts: { key: string; label: string; displayNum: number }[] = [];
      for (let i = 0; i < v.maxN; i++) {
        const displayNum = i + 1;
        const raw = v.bestNames[i]?.trim();
        let label: string;
        if (raw) {
          label = /^pista\s*\d/i.test(raw) ? raw : `Pista ${displayNum} — ${raw}`;
        } else {
          label = `Pista ${displayNum}`;
        }
        courts.push({ key: String(displayNum), label, displayNum });
      }
      return { name, courts, tournamentId: v.tournamentId };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
