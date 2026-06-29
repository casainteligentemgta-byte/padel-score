'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { ExpressMatch } from '@/types/expressMatch';
import {
  EXPRESS_THIRD_SET_MODE_OPTIONS,
  normalizeExpressThirdSetMode,
  type ExpressThirdSetMode,
} from '@/lib/expressThirdSetMode';

type Props = {
  match: ExpressMatch;
  sessionId: string;
  onModeSaved: (mode: ExpressThirdSetMode) => void;
  /** Sin acordeón: para panel de ajustes (engranaje). */
  embedded?: boolean;
};

export function ExpressControlThirdSetPanel({ match, sessionId, onModeSaved, embedded }: Props) {
  const supabase = getSupabaseClient();
  const [open, setOpen] = useState(!embedded);
  const [saving, setSaving] = useState<ExpressThirdSetMode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentMode = normalizeExpressThirdSetMode(match.third_set_mode);
  const locked = match.current_set >= 3;

  const applyMode = async (mode: ExpressThirdSetMode) => {
    if (!supabase || locked) return;
    if (mode === currentMode) return;

    setSaving(mode);
    setError(null);
    const { error: upErr } = await supabase
      .from('express_matches')
      .update({ third_set_mode: mode })
      .eq('session_id', sessionId);

    setSaving(null);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    onModeSaved(mode);
  };

  const content = (
    <div className={embedded ? 'space-y-3' : 'space-y-3 border-t-2 border-neutral-600 px-4 pb-4 pt-3'}>
      <p className="text-[10px] leading-relaxed text-neutral-400">
        Define cómo se juega el set decisivo si el marcador llega a 1-1 en sets.
      </p>
      {locked ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-amber-300">
          Bloqueado: el 3er set ya comenzó.
        </p>
      ) : null}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {EXPRESS_THIRD_SET_MODE_OPTIONS.map((option) => {
          const active = currentMode === option.id;
          const busy = saving === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={locked || busy || saving !== null}
              onClick={() => void applyMode(option.id)}
              className={`rounded-xl border-2 px-3 py-3 text-left transition-colors disabled:opacity-50 ${
                active
                  ? 'border-padel-primary bg-padel-primary text-black shadow-[0_0_14px_rgba(204,255,0,0.35)]'
                  : 'border-neutral-500 bg-neutral-950 text-white active:bg-neutral-700'
              }`}
            >
              <span className="block text-sm font-black">{option.shortLabel}</span>
              <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-wide opacity-90">
                {option.label}
              </span>
              <span
                className={`mt-1 block text-[8px] leading-snug ${
                  active ? 'text-black/70' : 'text-neutral-500'
                }`}
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <div className="mt-3 rounded-2xl border-2 border-neutral-600 bg-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors active:bg-neutral-700/60"
      >
        <span className="flex items-center gap-2.5 text-sm font-black uppercase tracking-widest text-white">
          <Trophy className="h-5 w-5 text-padel-primary" />
          Formato 3er set
        </span>
        {open ? (
          <ChevronUp className="h-5 w-5 text-neutral-200" />
        ) : (
          <ChevronDown className="h-5 w-5 text-neutral-200" />
        )}
      </button>

      {open ? content : null}
    </div>
  );
}
