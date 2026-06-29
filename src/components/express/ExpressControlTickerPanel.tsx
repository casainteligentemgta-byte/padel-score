'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Megaphone, Plus, Trash2 } from 'lucide-react';
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
};

export function ExpressControlTickerPanel({ match, onPhrasesSaved }: Props) {
  const supabase = getSupabaseClient();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  useEffect(() => {
    setDraft([...match.display_ticker_phrases]);
  }, [match.display_ticker_phrases]);

  const addPhrase = () => {
    if (draft.length >= EXPRESS_TICKER_PHRASE_MAX) {
      setError(`Máximo ${EXPRESS_TICKER_PHRASE_MAX} frases por pizarra.`);
      return;
    }
    setDraft((prev) => [...prev, '']);
    setError(null);
  };

  const updatePhrase = (index: number, value: string) => {
    setDraft((prev) => prev.map((p, i) => (i === index ? value : p)));
  };

  const removePhrase = (index: number) => {
    setDraft((prev) => prev.filter((_, i) => i !== index));
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
    setOkMsg('Frases aplicadas a la TV.');
    setTimeout(() => setOkMsg(null), 2500);
  };

  return (
    <div className="mt-3 rounded-2xl border-2 border-neutral-600 bg-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors active:bg-neutral-700/60"
      >
        <span className="flex items-center gap-2.5 text-sm font-black uppercase tracking-widest text-white">
          <Megaphone className="h-5 w-5 text-padel-primary" />
          Tira informativa
        </span>
        {open ? (
          <ChevronUp className="h-5 w-5 text-neutral-200" />
        ) : (
          <ChevronDown className="h-5 w-5 text-neutral-200" />
        )}
      </button>

      {open && (
        <div className="space-y-3 border-t-2 border-neutral-600 px-4 pb-4 pt-3">
          {error && <p className="text-xs text-red-400">{error}</p>}
          {okMsg && <p className="text-xs text-padel-primary">{okMsg}</p>}

          <p className="text-[10px] leading-relaxed text-neutral-400">
            Frases solo para esta pizarra. Se muestran en la tira inferior{' '}
            <span className="text-neutral-300">además</span> de los mensajes que configure el admin.
          </p>

          <ul className="space-y-2">
            {draft.map((phrase, index) => (
              <li key={index} className="flex gap-2">
                <input
                  value={phrase}
                  maxLength={EXPRESS_TICKER_PHRASE_CHAR_MAX}
                  onChange={(e) => updatePhrase(index, e.target.value)}
                  placeholder={`Frase ${index + 1}`}
                  className="min-w-0 flex-1 rounded-xl border-2 border-neutral-500 bg-black/50 px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-padel-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removePhrase(index)}
                  className="shrink-0 rounded-xl border-2 border-neutral-500 bg-neutral-950 px-3 text-red-400 active:bg-neutral-800"
                  aria-label="Eliminar frase"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          {draft.length === 0 && (
            <p className="text-xs text-neutral-500">Sin frases propias. Solo verás los mensajes del admin.</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={addPhrase}
              disabled={draft.length >= EXPRESS_TICKER_PHRASE_MAX}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-neutral-500 bg-neutral-950 py-3 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" /> Añadir frase
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="flex-[1.2] rounded-xl border-2 border-padel-primary bg-padel-primary py-3 text-[10px] font-black uppercase tracking-widest text-black disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Aplicar a TV'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
