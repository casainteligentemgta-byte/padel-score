'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Loader2, MapPin, Video } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { courtNumFromExpressSlug } from '@/lib/expressMatchToMarcador';
import type { ExpressMatch } from '@/types/expressMatch';
import { expressPublicidadVenueName } from '@/lib/expressPublicidad';
import { normalizeCanchaIdKey, partitionPlaylistRows, type CourtPlaylistRowDb } from '@/lib/courtPlaylists';
import {
  fetchAssignmentsAction,
  savePlaylistAction,
  upsertPlaylistConfigAction,
} from '@/app/admin/publicidad/actions';

type VideoItem = {
  id: string;
  nombre: string;
  nombre_sponsor: string | null;
};

type Props = {
  match: ExpressMatch;
  sessionId: string;
  onVenueSaved: (baseVenue: string) => void;
};

export function ExpressControlAdsPanel({ match, sessionId, onVenueSaved }: Props) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const courtKey = courtNumFromExpressSlug(match.cancha_code);

  const [open, setOpen] = useState(false);
  const [venueDraft, setVenueDraft] = useState(match.base_venue || '');
  const [savingVenue, setSavingVenue] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [savingPlaylist, setSavingPlaylist] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const baseVenue = String(match.base_venue || '').trim();
  const expressVenue = baseVenue ? expressPublicidadVenueName(baseVenue) : '';

  useEffect(() => {
    setVenueDraft(match.base_venue || '');
  }, [match.base_venue]);

  const loadLibraryAndPlaylist = useCallback(async () => {
    if (!supabase || !baseVenue) return;
    setLoadingVideos(true);
    setError(null);
    try {
      const { data: media, error: mediaErr } = await supabase
        .from('media_content')
        .select('id, nombre, nombre_sponsor, tipo')
        .order('created_at', { ascending: false });
      if (mediaErr) throw mediaErr;

      const list = (media || [])
        .filter((m) => String(m.tipo || '').toLowerCase().includes('video'))
        .map((m) => ({
          id: String(m.id),
          nombre: String(m.nombre || m.nombre_sponsor || 'Vídeo'),
          nombre_sponsor: m.nombre_sponsor ? String(m.nombre_sponsor) : null,
        }));
      setVideos(list);

      const res = await fetchAssignmentsAction(expressVenue, [`cancha_${courtKey}`]);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const rows = (res.assignments || []) as CourtPlaylistRowDb[];
      const filtered = rows.filter(
        (r) =>
          normalizeCanchaIdKey(r.cancha_id) === courtKey &&
          String(r.venue_name || '').trim().toLowerCase() === expressVenue.toLowerCase(),
      );
      const { video } = partitionPlaylistRows(filtered);
      const ids = [...video]
        .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
        .map((r) => String(r.media_content?.id || r.media_id || ''))
        .filter(Boolean);
      setSelectedIds(ids);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los vídeos.');
    } finally {
      setLoadingVideos(false);
    }
  }, [supabase, baseVenue, expressVenue, courtKey]);

  useEffect(() => {
    if (open && baseVenue) void loadLibraryAndPlaylist();
  }, [open, baseVenue, loadLibraryAndPlaylist]);

  const saveVenue = async () => {
    if (!supabase) return;
    const v = venueDraft.trim();
    if (!v) {
      setError('Indica el nombre de la sede (ej. El Bodeguero).');
      return;
    }
    setSavingVenue(true);
    setError(null);
    const { error: upErr } = await supabase
      .from('express_matches')
      .update({ base_venue: v })
      .eq('session_id', sessionId);
    setSavingVenue(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    onVenueSaved(v);
    setOkMsg('Sede guardada.');
    setTimeout(() => setOkMsg(null), 2500);
  };

  const toggleVideo = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const applyVideos = async () => {
    if (!baseVenue) {
      setError('Guarda la sede antes de elegir vídeos.');
      return;
    }
    setSavingPlaylist(true);
    setError(null);
    try {
      const res = await savePlaylistAction(courtKey, expressVenue, selectedIds, 'video', 30);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      await upsertPlaylistConfigAction(expressVenue, courtKey, { video_cambio_cada_minutos: 0 });
      setOkMsg('Vídeos aplicados a la TV.');
      setTimeout(() => setOkMsg(null), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la playlist.');
    } finally {
      setSavingPlaylist(false);
    }
  };

  return (
    <div className="mt-2 rounded-2xl border border-neutral-800 bg-neutral-900">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-300">
          <Video className="h-4 w-4 text-padel-primary" />
          Publicidad en TV
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-neutral-500" /> : <ChevronDown className="h-4 w-4 text-neutral-500" />}
      </button>

      {open && (
        <div className="space-y-4 border-t border-neutral-800 px-4 pb-4 pt-3">
          {error && <p className="text-xs text-red-400">{error}</p>}
          {okMsg && <p className="text-xs text-padel-primary">{okMsg}</p>}

          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              <MapPin className="h-3 w-3" /> Sede (misma que la TV: ?complex=)
            </label>
            <div className="flex gap-2">
              <input
                value={venueDraft}
                onChange={(e) => setVenueDraft(e.target.value)}
                placeholder="Ej. El Bodeguero"
                className="min-w-0 flex-1 rounded-xl border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-padel-primary focus:outline-none"
              />
              <button
                type="button"
                disabled={savingVenue}
                onClick={() => void saveVenue()}
                className="shrink-0 rounded-xl bg-neutral-800 px-3 py-2 text-[10px] font-black uppercase text-white disabled:opacity-50"
              >
                {savingVenue ? '…' : 'OK'}
              </button>
            </div>
            {baseVenue ? (
              <p className="text-[10px] text-neutral-500">
                Playlist: <span className="text-neutral-400">{expressVenue}</span> · {match.cancha_code}
              </p>
            ) : (
              <p className="text-[10px] text-amber-500/90">
                La TV también puede fijar la sede si abre con ?complex=NombreSede
              </p>
            )}
          </div>

          {baseVenue && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                Vídeos disponibles
              </p>
              {loadingVideos ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-padel-primary" />
                </div>
              ) : videos.length === 0 ? (
                <p className="text-xs text-neutral-500">
                  No hay vídeos en la biblioteca. Súbelos en Admin → Express · Publicidad.
                </p>
              ) : (
                <ul className="max-h-48 space-y-2 overflow-y-auto">
                  {videos.map((v) => {
                    const on = selectedIds.includes(v.id);
                    return (
                      <li key={v.id}>
                        <button
                          type="button"
                          onClick={() => toggleVideo(v.id)}
                          className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                            on
                              ? 'border-padel-primary/50 bg-padel-primary/10'
                              : 'border-neutral-800 bg-black/30'
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                              on ? 'border-padel-primary bg-padel-primary text-black' : 'border-neutral-600'
                            }`}
                          >
                            {on && <Check className="h-3 w-3" strokeWidth={3} />}
                          </span>
                          <span className="truncate text-xs font-semibold text-white">
                            {v.nombre_sponsor || v.nombre}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <button
                type="button"
                disabled={savingPlaylist || loadingVideos}
                onClick={() => void applyVideos()}
                className="w-full rounded-xl bg-padel-primary py-3 text-xs font-black uppercase tracking-widest text-surface disabled:opacity-50"
              >
                {savingPlaylist ? 'Guardando…' : 'Aplicar vídeos a la pantalla'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
