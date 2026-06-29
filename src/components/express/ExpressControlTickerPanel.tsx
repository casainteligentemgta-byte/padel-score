'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { ExpressMatch } from '@/types/expressMatch';
import {
  EXPRESS_TICKER_PHRASE_CHAR_MAX,
  EXPRESS_TICKER_PHRASE_MAX,
  normalizeExpressTickerPhrases,
} from '@/lib/expressTickerMessages';

type Props = {
  match: ExpressMatch;
  onPhrasesSaved: (phrases: string[]) => void;
  embedded?: boolean;
};

export function ExpressControlTickerPanel({ match, onPhrasesSaved, embedded }: Props) {
  const supabase = getSupabaseClient();
  const [draft, setDraft] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  useEffect(() => {
    setDraft([...match.display_ticker_phrases]);
  }, [match.display_ticker_phrases]);

  const addPhrase = () => {
    if (draft.length >= EXPRESS_TICKER_PHRASE_MAX) {
      setError(`Máximo ${EXPRESS_TICKER_PHRASE_MAX} frases.`);
      return;
    }
    setDraft((prev) => [...prev, '']);
    setError(null);
  };

  const save = async () => {
    if (!supabase) {
      setError('Supabase no configurado.');
      return;
    }
    const phrases = normalizeExpressTickerPhrases(draft);
    setSaving(true);
    setError(null);
    const { error: upErr } = await supabase
      .from('express_matches')
      .update({ display_ticker_phrases: phrases })
      .eq('cancha_code', match.cancha_code);

    setSaving(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    setDraft(phrases);
    onPhrasesSaved(phrases);
    setOkMsg('Frases guardadas.');
    setTimeout(() => setOkMsg(null), 2000);
  };

  const body = (
    <div className="space-y-3">
      <p className="text-[10px] leading-relaxed text-neutral-400">
        Frases extra en la tira inferior de la TV (además de las del admin).
      </p>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      {okMsg ? <p className="text-xs text-padel-primary">{okMsg}</p> : null}
      <div className="space-y-2">
        {draft.map((phrase, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={phrase}
              maxLength={EXPRESS_TICKER_PHRASE_CHAR_MAX}
              onChange={(e) => setDraft((prev) => prev.map((p, i) => (i === index ? e.target.value : p)))}
              placeholder={`Frase ${index + 1}`}
              className="min-w-0 flex-1 rounded-xl border border-neutral-700 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-padel-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setDraft((prev) => prev.filter((_, i) => i !== index))}
              className="rounded-xl border border-neutral-700 px-2.5 text-neutral-400"
              aria-label="Eliminar frase"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addPhrase}
          className="inline-flex items-center gap-1 rounded-xl border border-neutral-600 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          Añadir
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="rounded-xl bg-padel-primary px-4 py-2 text-[10px] font-black uppercase tracking-wider text-black disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar tira'}
        </button>
      </div>
    </div>
  );

  if (embedded) return body;

  return (
    <div className="mt-3 rounded-2xl border-2 border-neutral-600 bg-neutral-800">
      <div className="px-4 py-4 text-sm font-black uppercase tracking-widest text-white">Tira informativa</div>
      <div className="border-t border-neutral-600 px-4 pb-4 pt-3">{body}</div>
    </div>
  );
}
