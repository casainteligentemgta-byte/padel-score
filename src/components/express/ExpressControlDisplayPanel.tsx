'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, MonitorPlay, Type } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { ExpressMatch } from '@/types/expressMatch';
import {
  EXPRESS_NAME_SCALE_PRESETS,
  expressPlayerNameFontSize,
  nearestExpressNameScalePresetId,
  normalizeExpressDisplayNameScale,
  type ExpressNameScalePresetId,
} from '@/lib/expressDisplayNameScale';
import {
  EXPRESS_MEDIA_SCALE_PRESETS,
  nearestExpressMediaScalePresetId,
  normalizeExpressDisplayMediaScale,
  type ExpressMediaScalePresetId,
} from '@/lib/expressDisplayMediaScale';

type Props = {
  match: ExpressMatch;
  sessionId: string;
  onNameScaleSaved: (scale: number) => void;
  onMediaScaleSaved: (scale: number) => void;
};

function ScalePresetGrid<T extends string>({
  presets,
  activeId,
  savingId,
  isSaving,
  onSelect,
}: {
  presets: { id: T; label: string; shortLabel: string }[];
  activeId: T;
  savingId: T | null;
  isSaving: boolean;
  onSelect: (id: T) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {presets.map((preset) => {
        const on = activeId === preset.id;
        const busy = savingId === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            disabled={busy || isSaving}
            onClick={() => onSelect(preset.id)}
            className={`rounded-xl border py-3 text-center transition-colors disabled:opacity-50 ${
              on
                ? 'border-padel-primary bg-padel-primary/15 text-padel-primary'
                : 'border-neutral-700 bg-neutral-950 text-neutral-400 active:bg-neutral-800'
            }`}
          >
            <span className="block text-sm font-black">{preset.shortLabel}</span>
            <span className="mt-0.5 block text-[8px] font-bold uppercase tracking-wide opacity-80">
              {preset.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ExpressControlDisplayPanel({
  match,
  sessionId,
  onNameScaleSaved,
  onMediaScaleSaved,
}: Props) {
  const supabase = getSupabaseClient();
  const [open, setOpen] = useState(false);
  const [savingName, setSavingName] = useState<ExpressNameScalePresetId | null>(null);
  const [savingMedia, setSavingMedia] = useState<ExpressMediaScalePresetId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentNameScale = normalizeExpressDisplayNameScale(match.display_name_scale);
  const activeNamePreset = nearestExpressNameScalePresetId(currentNameScale);
  const currentMediaScale = normalizeExpressDisplayMediaScale(match.display_media_scale);
  const activeMediaPreset = nearestExpressMediaScalePresetId(currentMediaScale);
  const isSaving = savingName !== null || savingMedia !== null;

  const applyNamePreset = async (presetId: ExpressNameScalePresetId) => {
    if (!supabase) {
      setError('Supabase no configurado.');
      return;
    }
    const preset = EXPRESS_NAME_SCALE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSavingName(presetId);
    setError(null);
    const { error: upErr } = await supabase
      .from('express_matches')
      .update({ display_name_scale: preset.value })
      .eq('session_id', sessionId);

    setSavingName(null);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    onNameScaleSaved(preset.value);
  };

  const applyMediaPreset = async (presetId: ExpressMediaScalePresetId) => {
    if (!supabase) {
      setError('Supabase no configurado.');
      return;
    }
    const preset = EXPRESS_MEDIA_SCALE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSavingMedia(presetId);
    setError(null);
    const { error: upErr } = await supabase
      .from('express_matches')
      .update({ display_media_scale: preset.value })
      .eq('session_id', sessionId);

    setSavingMedia(null);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    onMediaScaleSaved(preset.value);
  };

  const previewNameSize = expressPlayerNameFontSize(currentNameScale);
  const mediaPreviewHeight = `${Math.round(48 * currentMediaScale)}px`;

  return (
    <div className="mt-2 rounded-2xl border border-neutral-800 bg-neutral-900">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-300">
          <Type className="h-4 w-4 text-padel-primary" />
          Ajustes de pantalla TV
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-neutral-500" /> : <ChevronDown className="h-4 w-4 text-neutral-500" />}
      </button>

      {open && (
        <div className="space-y-5 border-t border-neutral-800 px-4 pb-4 pt-3">
          {error && <p className="text-xs text-red-400">{error}</p>}

          <section className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Nombres en pizarra</p>
            <p className="text-[10px] leading-relaxed text-neutral-500">
              Tamaño de los nombres de jugadores en el marcador.
            </p>
            <div className="rounded-xl border border-neutral-800 bg-black/40 px-3 py-3">
              <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-neutral-500">Vista previa</p>
              <p
                className="font-black italic uppercase leading-snug tracking-tight text-padel-primary"
                style={{ fontSize: previewNameSize }}
              >
                JUAN GARCÍA / PEDRO LÓPEZ
              </p>
            </div>
            <ScalePresetGrid
              presets={EXPRESS_NAME_SCALE_PRESETS}
              activeId={activeNamePreset}
              savingId={savingName}
              isSaving={isSaving}
              onSelect={(id) => void applyNamePreset(id)}
            />
          </section>

          <section className="space-y-3 border-t border-neutral-800 pt-4">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              <MonitorPlay className="h-3.5 w-3.5 text-padel-primary" />
              Vídeo e imágenes
            </p>
            <p className="text-[10px] leading-relaxed text-neutral-500">
              Altura de la franja de publicidad (vídeo e imágenes) en la parte inferior de la TV.
            </p>
            <div className="rounded-xl border border-neutral-800 bg-black/40 px-3 py-3">
              <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-neutral-500">Vista previa</p>
              <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-lg border border-white/10">
                <div
                  className="flex items-center justify-center bg-neutral-950 text-[8px] font-bold uppercase tracking-wider text-neutral-500"
                  style={{ height: mediaPreviewHeight }}
                >
                  Vídeo
                </div>
                <div
                  className="flex items-center justify-center bg-neutral-950 text-[8px] font-bold uppercase tracking-wider text-neutral-500"
                  style={{ height: mediaPreviewHeight }}
                >
                  Imagen
                </div>
              </div>
            </div>
            <ScalePresetGrid
              presets={EXPRESS_MEDIA_SCALE_PRESETS}
              activeId={activeMediaPreset}
              savingId={savingMedia}
              isSaving={isSaving}
              onSelect={(id) => void applyMediaPreset(id)}
            />
          </section>
        </div>
      )}
    </div>
  );
}
