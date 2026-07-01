'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { Check, ExternalLink, Loader2, Smartphone, Tv } from 'lucide-react';
import { correctMatchResult, submitMatchResult } from '@/app/actions/americanoActions';
import { getAmericanoAccessToken } from '@/lib/americano/americanoClientAuth';
import { playerNameById } from '@/lib/americano/logic';
import { buildAmericanoPdfInputFromBundle } from '@/lib/americano/americanoSchedulePdf';
import { useAmericanoRealtime } from '@/lib/americano/useAmericanoRealtime';
import { AmericanoExportPdfButtons } from '@/components/americano/AmericanoExportPdfButtons';

type Props = {
  sessionId: string;
};

export function AmericanoSessionControl({ sessionId }: Props) {
  const { loading, error, bundle, refresh } = useAmericanoRealtime(sessionId);
  const [pending, startTransition] = useTransition();
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [scoreDraft, setScoreDraft] = useState<Record<string, { a: string; b: string }>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const players = bundle?.players ?? [];
  const matches = bundle?.matches ?? [];
  const session = bundle?.session;

  const rounds = useMemo(() => {
    const map = new Map<number, typeof matches>();
    for (const m of matches) {
      const list = map.get(m.roundNumber) ?? [];
      list.push(m);
      map.set(m.roundNumber, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [matches]);

  const courtLinks = useMemo(() => {
    const count = session?.courtCount ?? 1;
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [session?.courtCount]);

  const pdfInput = useMemo(
    () => (bundle ? buildAmericanoPdfInputFromBundle(bundle) : null),
    [bundle],
  );

  const handleSubmit = (matchId: string, isCorrection = false) => {
    const draft = scoreDraft[matchId] ?? { a: '', b: '' };
    const scoreA = Number(draft.a);
    const scoreB = Number(draft.b);
    setFormError(null);
    setEditingMatchId(matchId);

    startTransition(async () => {
      const accessToken = await getAmericanoAccessToken();
      const result = isCorrection
        ? await correctMatchResult({ matchId, scoreA, scoreB, accessToken })
        : await submitMatchResult({ matchId, scoreA, scoreB, accessToken });
      setEditingMatchId(null);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      await refresh();
    });
  };

  if (loading && !bundle) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-neutral-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Cargando sesión…
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300">
        {error ?? 'Sesión no encontrada.'}
      </div>
    );
  }

  const tvUrl = `/americano/tv/${sessionId}${session.baseVenue ? `?complex=${encodeURIComponent(session.baseVenue)}` : ''}`;

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-400">Control</p>
          <h1 className="text-xl font-black uppercase italic tracking-tight">{session.name}</h1>
          <p className="mt-1 text-xs text-neutral-400">
            {session.courtCount} cancha(s) · a {session.pointsGoal} pts · {players.length} jugadores
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AmericanoExportPdfButtons input={pdfInput} compact />
          <Link
            href={tvUrl}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:border-amber-400/40 hover:text-amber-300"
          >
            <Tv className="h-4 w-4" />
            Abrir TV
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-amber-300">
          <Smartphone className="h-4 w-4" />
          Marcadores táctiles por cancha
        </h2>
        <p className="mb-3 text-xs text-neutral-500">
          Abre en tablet o móvil junto a cada pista. Los puntos se sincronizan con la TV y el ranking.
        </p>
        <div className="flex flex-wrap gap-2">
          {courtLinks.map((court) => (
            <Link
              key={court}
              href={`/americano/marker/${sessionId}/${court}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-amber-300 hover:border-amber-400/50"
            >
              <Smartphone className="h-3.5 w-3.5" />
              Cancha {court}
            </Link>
          ))}
        </div>
      </section>

      {formError ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {formError}
        </p>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-amber-300">
          Clasificación en vivo
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {[...players]
            .sort((a, b) => b.totalPoints - a.totalPoints || a.sortOrder - b.sortOrder)
            .map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-sm"
              >
                <span className="text-neutral-500">{idx + 1}.</span>
                <span className="flex-1 px-2 font-medium">{p.name}</span>
                <span className="font-black tabular-nums text-amber-300">{p.totalPoints}</span>
              </div>
            ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wide">Rondas y resultados</h2>
        {rounds.map(([roundNumber, roundMatches]) => (
          <div
            key={roundNumber}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
          >
            <div className="border-b border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">
              Ronda {roundNumber}
            </div>
            <div className="divide-y divide-white/5">
              {roundMatches.map((match) => {
                const isFinished = match.status === 'finished';
                const draft = scoreDraft[match.id] ?? {
                  a: isFinished ? String(match.scoreA) : '',
                  b: isFinished ? String(match.scoreB) : '',
                };
                const teamALabel = `${playerNameById(players, match.playerA1Id)} / ${playerNameById(players, match.playerA2Id)}`;
                const teamBLabel = `${playerNameById(players, match.playerB1Id)} / ${playerNameById(players, match.playerB2Id)}`;
                const saving = pending && editingMatchId === match.id;

                return (
                  <div key={match.id} className="px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      Cancha {match.courtNumber}
                      <Link
                        href={`/americano/marker/${sessionId}/${match.courtNumber}`}
                        target="_blank"
                        className="ml-2 text-amber-400/80 hover:text-amber-300"
                      >
                        · Marcador
                      </Link>
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {teamALabel}
                      <span className="mx-2 text-neutral-500">vs</span>
                      {teamBLabel}
                    </p>

                    {isFinished ? (
                      <div className="mt-2 space-y-2">
                        <p className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-400">
                          <Check className="h-4 w-4" />
                          {match.scoreA} – {match.scoreB}
                        </p>
                        <div className="flex flex-wrap items-end gap-2">
                          <label className="space-y-1">
                            <span className="text-[9px] uppercase tracking-wider text-neutral-500">Corregir A</span>
                            <input
                              type="number"
                              min={0}
                              max={match.pointsGoal}
                              value={draft.a}
                              onChange={(e) =>
                                setScoreDraft((prev) => ({
                                  ...prev,
                                  [match.id]: { ...draft, a: e.target.value },
                                }))
                              }
                              className="w-20 rounded-lg border border-white/10 bg-black/50 px-2 py-1.5 text-sm outline-none focus:border-amber-400/50"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-[9px] uppercase tracking-wider text-neutral-500">Corregir B</span>
                            <input
                              type="number"
                              min={0}
                              max={match.pointsGoal}
                              value={draft.b}
                              onChange={(e) =>
                                setScoreDraft((prev) => ({
                                  ...prev,
                                  [match.id]: { ...draft, b: e.target.value },
                                }))
                              }
                              className="w-20 rounded-lg border border-white/10 bg-black/50 px-2 py-1.5 text-sm outline-none focus:border-amber-400/50"
                            />
                          </label>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => handleSubmit(match.id, true)}
                            className="rounded-lg border border-amber-500/30 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-amber-300 hover:bg-amber-500/10 disabled:opacity-50"
                          >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Corregir'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap items-end gap-2">
                        <label className="space-y-1">
                          <span className="text-[9px] uppercase tracking-wider text-neutral-500">A</span>
                          <input
                            type="number"
                            min={0}
                            max={match.pointsGoal}
                            value={draft.a}
                            onChange={(e) =>
                              setScoreDraft((prev) => ({
                                ...prev,
                                [match.id]: { ...draft, a: e.target.value },
                              }))
                            }
                            className="w-20 rounded-lg border border-white/10 bg-black/50 px-2 py-1.5 text-sm outline-none focus:border-amber-400/50"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[9px] uppercase tracking-wider text-neutral-500">B</span>
                          <input
                            type="number"
                            min={0}
                            max={match.pointsGoal}
                            value={draft.b}
                            onChange={(e) =>
                              setScoreDraft((prev) => ({
                                ...prev,
                                [match.id]: { ...draft, b: e.target.value },
                              }))
                            }
                            className="w-20 rounded-lg border border-white/10 bg-black/50 px-2 py-1.5 text-sm outline-none focus:border-amber-400/50"
                          />
                        </label>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => handleSubmit(match.id, false)}
                          className="rounded-lg bg-amber-500/20 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-amber-300 hover:bg-amber-500/30 disabled:opacity-50"
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
