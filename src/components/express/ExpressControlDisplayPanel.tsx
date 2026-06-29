'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, MonitorPlay, Type } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { ExpressMatch } from '@/types/expressMatch';
import {
  EXPRESS_DISPLAY_NAME_SCALE_MAX,
  EXPRESS_DISPLAY_NAME_SCALE_MIN,
  EXPRESS_DISPLAY_NAME_SCALE_STEP,
  EXPRESS_NAME_SCALE_PRESETS,
  expressPlayerNameFontSize,
  nearestExpressNameScalePresetId,
  normalizeExpressDisplayNameScale,
  type ExpressNameScalePresetId,
} from '@/lib/expressDisplayNameScale';
import {
  EXPRESS_DISPLAY_MEDIA_SCALE_MAX,
  EXPRESS_DISPLAY_MEDIA_SCALE_MIN,
  EXPRESS_DISPLAY_MEDIA_SCALE_STEP,
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
  embedded?: boolean;
  mode?: 'all' | 'names' | 'media';
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
            className={`rounded-xl border-2 py-3 text-center transition-colors disabled:opacity-50 ${
              on
                ? 'border-padel-primary bg-padel-primary text-black shadow-[0_0_14px_rgba(204,255,0,0.35)]'
                : 'border-neutral-500 bg-neutral-950 text-white active:bg-neutral-700'
            }`}
          >
            <span className="block text-sm font-black">{preset.shortLabel}</span>
            <span className="mt-0.5 block text-[8px] font-bold uppercase tracking-wide opacity-90">
              {preset.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function DisplayScaleSlider({
  label,
  value,
  min,
  max,
  step,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{label}</span>
        <span className="font-mono text-xs font-black tabular-nums text-padel-primary">{value.toFixed(2)}×</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-700 accent-padel-primary disabled:opacity-50"
        aria-label={label}
      />
      <div className="flex justify-between text-[9px] font-bold tabular-nums text-neutral-500">
        <span>{min.toFixed(2)}×</span>
        <span>{max.toFixed(2)}×</span>
      </div>
    </div>
  );
}

function useDebouncedScaleSave(saveFn: (scale: number) => Promise<void>, delayMs = 350) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRef = useRef(saveFn);
  saveRef.current = saveFn;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return useCallback((scale: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void saveRef.current(scale);
    }, delayMs);
  }, [delayMs]);
}

export function ExpressControlDisplayPanel({
  match,
  sessionId,
  onNameScaleSaved,
  onMediaScaleSaved,
  embedded,
  mode = 'all',
}: Props) {
  const supabase = getSupabaseClient();
  const [open, setOpen] = useState(!embedded);
  const [savingName, setSavingName] = useState<ExpressNameScalePresetId | 'slider' | null>(null);
  const [savingMedia, setSavingMedia] = useState<ExpressMediaScalePresetId | 'slider' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentNameScale = normalizeExpressDisplayNameScale(match.display_name_scale);
  const activeNamePreset = nearestExpressNameScalePresetId(currentNameScale);
  const currentMediaScale = normalizeExpressDisplayMediaScale(match.display_media_scale);
  const activeMediaPreset = nearestExpressMediaScalePresetId(currentMediaScale);
  const isSaving = savingName !== null || savingMedia !== null;

  const [nameDraft, setNameDraft] = useState(currentNameScale);
  const [mediaDraft, setMediaDraft] = useState(currentMediaScale);

  useEffect(() => {
    setNameDraft(currentNameScale);
  }, [currentNameScale]);

  useEffect(() => {
    setMediaDraft(currentMediaScale);
  }, [currentMediaScale]);

  const persistNameScale = useCallback(
    async (raw: number) => {
      if (!supabase) {
        setError('Supabase no configurado.');
        return;
      }
      const scale = normalizeExpressDisplayNameScale(raw);
      setSavingName('slider');
      setError(null);
      const { error: upErr } = await supabase
        .from('express_matches')
        .update({ display_name_scale: scale })
        .eq('session_id', sessionId);

      setSavingName(null);
      if (upErr) {
        setError(upErr.message);
        setNameDraft(currentNameScale);
        return;
      }
      onNameScaleSaved(scale);
    },
    [supabase, sessionId, onNameScaleSaved, currentNameScale],
  );

  const persistMediaScale = useCallback(
    async (raw: number) => {
      if (!supabase) {
        setError('Supabase no configurado.');
        return;
      }
      const scale = normalizeExpressDisplayMediaScale(raw);
      setSavingMedia('slider');
      setError(null);
      const { error: upErr } = await supabase
        .from('express_matches')
        .update({ display_media_scale: scale })
        .eq('session_id', sessionId);

      setSavingMedia(null);
      if (upErr) {
        setError(upErr.message);
        setMediaDraft(currentMediaScale);
        return;
      }
      onMediaScaleSaved(scale);
    },
    [supabase, sessionId, onMediaScaleSaved, currentMediaScale],
  );

  const debouncedSaveName = useDebouncedScaleSave(persistNameScale);
  const debouncedSaveMedia = useDebouncedScaleSave(persistMediaScale);

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
    setNameDraft(preset.value);
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
    setMediaDraft(preset.value);
    onMediaScaleSaved(preset.value);
  };

  const previewNameSize = expressPlayerNameFontSize(nameDraft);
  const mediaPreviewHeight = `${Math.round(48 * mediaDraft)}px`;

  const showNames = mode === 'all' || mode === 'names';
  const showMedia = mode === 'all' || mode === 'media';

  const content = (
    <div className={embedded ? 'space-y-4' : 'space-y-5 border-t-2 border-neutral-600 px-4 pb-4 pt-3'}>
      {error && <p className="text-xs text-red-400">{error}</p>}

      {showNames ? (
        <section className="space-y-3">
          {mode === 'all' ? (
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-200">Nombres en pizarra</p>
          ) : null}
          <p className="text-[10px] leading-relaxed text-neutral-400">
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
          <DisplayScaleSlider
            label="Escala nombres"
            value={nameDraft}
            min={EXPRESS_DISPLAY_NAME_SCALE_MIN}
            max={EXPRESS_DISPLAY_NAME_SCALE_MAX}
            step={EXPRESS_DISPLAY_NAME_SCALE_STEP}
            disabled={isSaving}
            onChange={(v) => {
              const next = normalizeExpressDisplayNameScale(v);
              setNameDraft(next);
              debouncedSaveName(next);
            }}
          />
          <ScalePresetGrid
            presets={EXPRESS_NAME_SCALE_PRESETS}
            activeId={activeNamePreset}
            savingId={savingName === 'slider' ? null : savingName}
            isSaving={isSaving}
            onSelect={(id) => void applyNamePreset(id)}
          />
        </section>
      ) : null}

      {showMedia ? (
        <section className={`space-y-3 ${showNames && mode === 'all' ? 'border-t border-neutral-600 pt-4' : ''}`}>
          {mode === 'all' ? (
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-200">
              <MonitorPlay className="h-3.5 w-3.5 text-padel-primary" />
              Vídeo e imágenes
            </p>
          ) : null}
          <p className="text-[10px] leading-relaxed text-neutral-400">
            Altura de la franja de publicidad en la parte inferior de la TV.
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
          <DisplayScaleSlider
            label="Escala publicidad"
            value={mediaDraft}
            min={EXPRESS_DISPLAY_MEDIA_SCALE_MIN}
            max={EXPRESS_DISPLAY_MEDIA_SCALE_MAX}
            step={EXPRESS_DISPLAY_MEDIA_SCALE_STEP}
            disabled={isSaving}
            onChange={(v) => {
              const next = normalizeExpressDisplayMediaScale(v);
              setMediaDraft(next);
              debouncedSaveMedia(next);
            }}
          />
          <ScalePresetGrid
            presets={EXPRESS_MEDIA_SCALE_PRESETS}
            activeId={activeMediaPreset}
            savingId={savingMedia === 'slider' ? null : savingMedia}
            isSaving={isSaving}
            onSelect={(id) => void applyMediaPreset(id)}
          />
        </section>
      ) : null}
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
          <Type className="h-5 w-5 text-padel-primary" />
          Ajustes de pantalla TV
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
