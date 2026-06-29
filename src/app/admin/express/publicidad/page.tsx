'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import CourtCard from '@/components/publicidad/CourtCard';
import type { CourtPlaylistRow } from '@/components/publicidad/CourtCard';
import { buildVenuesAndCourtsFromTournaments } from '@/lib/venuesFromTournaments';
import { normalizeCanchaIdKey, partitionPlaylistRows, type CourtPlaylistRowDb } from '@/lib/courtPlaylists';
import {
  buildExpressCourts,
  buildExpressDisplayUrl,
  DEFAULT_EXPRESS_COURT_COUNT,
  expressCourtCountForVenue,
  expressPublicidadVenueName,
  MAX_EXPRESS_COURT_COUNT,
  saveExpressCourtCount,
} from '@/lib/expressPublicidad';
import { getAppBaseUrl } from '@/lib/brand';
import {
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Loader2,
  Megaphone,
  Monitor,
  Trash2,
  Upload,
  Zap,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import type { MediaContent, TiraInformativa } from '@/lib/supabase/publicidad';
import {
  addMediaContentAction,
  addTickerAction,
  deleteTickerAction,
  fetchAssignmentsAction,
  savePlaylistAction,
  saveTiraPlaylistAction,
  upsertPlaylistConfigAction,
} from '@/app/admin/publicidad/actions';

const isVideoFile = (f: File) => f.type.startsWith('video/');
const isImageFile = (f: File) => f.type.startsWith('image/');

function venueMatches(rowVenue: string | null | undefined, selectedVenue: string | null | undefined): boolean {
  return String(rowVenue || '').trim().toLowerCase() === String(selectedVenue || '').trim().toLowerCase();
}

function canchaMatches(rowCancha: string | null | undefined, courtKey: string | null | undefined): boolean {
  return normalizeCanchaIdKey(rowCancha) === normalizeCanchaIdKey(courtKey);
}

export default function AdminExpressPublicidadPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [venueOptions, setVenueOptions] = useState<string[]>([]);
  const [selectedBaseVenue, setSelectedBaseVenue] = useState('');
  const [courtCount, setCourtCount] = useState(DEFAULT_EXPRESS_COURT_COUNT);
  const [mediaList, setMediaList] = useState<MediaContent[]>([]);
  const [tiraList, setTiraList] = useState<TiraInformativa[]>([]);
  const [assignments, setAssignments] = useState<CourtPlaylistRow[]>([]);
  const [tiraLinksByCourt, setTiraLinksByCourt] = useState<Record<string, string[]>>({});
  const [playlistConfigByCourt, setPlaylistConfigByCourt] = useState<
    Record<
      string,
      {
        imagen_loop: boolean;
        imagen_pausa_entre_segundos: number;
        video_cambio_cada_minutos: number;
        imagen_cambio_cada_minutos: number;
        tira_cambio_cada_minutos: number;
      }
    >
  >({});
  const [canchasHealth, setCanchasHealth] = useState<Record<string, string | null>>({});
  const [savingCourtKey, setSavingCourtKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [nuevoTicker, setNuevoTicker] = useState('');

  const expressVenue = useMemo(
    () => expressPublicidadVenueName(selectedBaseVenue),
    [selectedBaseVenue],
  );

  const expressCourts = useMemo(() => buildExpressCourts(courtCount), [courtCount]);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/');
  }, [authLoading, isAdmin, router]);

  const fetchMedia = useCallback(async () => {
    const { data, error: mediaError } = await supabase
      .from('media_content')
      .select('*')
      .order('created_at', { ascending: false });
    if (mediaError) throw mediaError;
    setMediaList((data as MediaContent[]) || []);
  }, [supabase]);

  const fetchTicker = useCallback(async () => {
    const { data, error: tiraError } = await supabase
      .from('tira_informativa')
      .select('*')
      .order('orden', { ascending: true });
    if (tiraError) throw tiraError;
    setTiraList((data as TiraInformativa[]) || []);
  }, [supabase]);

  const loadVenues = useCallback(async () => {
    const names = new Set<string>();
    try {
      const tournaments = await dataService.listAllTournaments();
      for (const v of buildVenuesAndCourtsFromTournaments(tournaments || [])) {
        if (v.name.trim()) names.add(v.name.trim());
      }
    } catch (e) {
      console.warn('[ExpressPublicidad] torneos:', e);
    }
    try {
      const sedes = await dataService.listVenues();
      for (const s of sedes || []) {
        if (s.name?.trim()) names.add(s.name.trim());
      }
    } catch (e) {
      console.warn('[ExpressPublicidad] sedes:', e);
    }
    const sorted = Array.from(names).sort((a, b) => a.localeCompare(b));
    setVenueOptions(sorted);
    if (!selectedBaseVenue && sorted.length > 0) {
      setSelectedBaseVenue(sorted[0]);
      setCourtCount(expressCourtCountForVenue(sorted[0]));
    }
  }, [selectedBaseVenue]);

  const fetchAssignments = useCallback(async () => {
    if (!expressVenue) return;
    const keys = expressCourts.map((c) => c.key);
    const res = await fetchAssignmentsAction(expressVenue, keys.map((k) => `cancha_${k}`));
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const { assignments: data, config, tiras } = res;

    const filtered: CourtPlaylistRow[] = ((data || []) as Record<string, unknown>[]).map((r) => {
      const mc = r.media_content;
      const media_content = Array.isArray(mc) ? mc[0] ?? null : mc ?? null;
      return {
        id: String(r.id),
        cancha_id: String(r.cancha_id || '').trim(),
        venue_name: String(r.venue_name || '').trim(),
        orden: Number(r.orden),
        duracion_segundos: Number(r.duracion_segundos),
        playlist_slot: (r.playlist_slot as string | null) ?? undefined,
        media_content: media_content as CourtPlaylistRow['media_content'],
      };
    });
    setAssignments(filtered);

    const tmap: Record<string, string[]> = {};
    keys.forEach((k) => {
      tmap[k] = [];
    });
    ((tiras || []) as Record<string, unknown>[]).forEach((row) => {
      const cid = normalizeCanchaIdKey(String(row.cancha_id || ''));
      if (tmap[cid]) {
        tmap[cid].push(String(row.tira_informativa_id));
      }
    });
    setTiraLinksByCourt(tmap);

    const cmap: Record<string, (typeof playlistConfigByCourt)[string]> = {};
    keys.forEach((k) => {
      cmap[k] = {
        imagen_loop: true,
        imagen_pausa_entre_segundos: 0,
        video_cambio_cada_minutos: 0,
        imagen_cambio_cada_minutos: 0,
        tira_cambio_cada_minutos: 0,
      };
    });
    ((config || []) as Record<string, unknown>[]).forEach((r) => {
      const cid = normalizeCanchaIdKey(String(r.cancha_id || ''));
      if (!cmap[cid]) return;
      cmap[cid] = {
        imagen_loop: r.imagen_loop !== false,
        imagen_pausa_entre_segundos: Math.max(0, Math.floor(Number(r.imagen_pausa_entre_segundos) || 0)),
        video_cambio_cada_minutos: Math.max(0, Math.floor(Number(r.video_cambio_cada_minutos) || 0)),
        imagen_cambio_cada_minutos: Math.max(0, Math.floor(Number(r.imagen_cambio_cada_minutos) || 0)),
        tira_cambio_cada_minutos: Math.max(0, Math.floor(Number(r.tira_cambio_cada_minutos) || 0)),
      };
    });
    setPlaylistConfigByCourt(cmap);
  }, [expressVenue, expressCourts]);

  useEffect(() => {
    if (!isAdmin) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchMedia(), fetchTicker(), loadVenues()]);
      } catch (e: unknown) {
        if (mounted) setError(e instanceof Error ? e.message : 'Error al cargar datos.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAdmin, fetchMedia, fetchTicker, loadVenues]);

  useEffect(() => {
    if (!selectedBaseVenue) return;
    setCourtCount(expressCourtCountForVenue(selectedBaseVenue));
  }, [selectedBaseVenue]);

  useEffect(() => {
    void fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    if (!supabase || !expressVenue || expressCourts.length === 0) return;
    const keys = expressCourts.map((c) => c.key);
    const dbKeys = keys.flatMap((k) => [`cancha_${k}`, k]);

    const load = async () => {
      const { data, error: healthError } = await supabase
        .from('canchas')
        .select('cancha_id, last_seen')
        .eq('venue_name', expressVenue)
        .in('cancha_id', dbKeys);
      if (healthError) return;
      const keySet = new Set(keys);
      const m: Record<string, string | null> = {};
      keys.forEach((k) => {
        m[k] = null;
      });
      (data || []).forEach((r: { cancha_id: string; last_seen: string | null }) => {
        const nk = normalizeCanchaIdKey(r.cancha_id);
        if (keySet.has(nk)) m[nk] = r.last_seen;
      });
      setCanchasHealth(m);
    };

    void load();
    const id = window.setInterval(load, 15_000);
    return () => window.clearInterval(id);
  }, [supabase, expressVenue, expressCourts]);

  const videos = useMemo(() => mediaList.filter((m) => String(m.tipo).includes('video')), [mediaList]);
  const carrusel = useMemo(() => mediaList.filter((m) => m.tipo === 'imagen'), [mediaList]);
  const appOrigin = useMemo(() => getAppBaseUrl(), []);

  const uploadFiles = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      const tryUploadToBuckets = async (path: string, file: File) => {
        const buckets = ['publicidad', 'ads', 'media'];
        let lastErr: unknown = null;
        for (const bucket of buckets) {
          const up = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
          if (!up.error) {
            const pub = supabase.storage.from(bucket).getPublicUrl(path);
            return pub.data.publicUrl;
          }
          lastErr = up.error;
          const msg = String(up.error?.message || '').toLowerCase();
          if (!msg.includes('bucket') || !msg.includes('not found')) break;
        }
        throw lastErr;
      };

      for (const file of files) {
        const fileExt = file.name.split('.').pop() || 'bin';
        const path = `ads/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const publicUrl = await tryUploadToBuckets(path, file);
        const tipo = isVideoFile(file) ? 'video_file' : isImageFile(file) ? 'imagen' : 'video_file';
        const addRes = await addMediaContentAction({
          tipo,
          url: publicUrl,
          nombre: file.name,
          nombre_sponsor: file.name.replace(/\.[^/.]+$/, ''),
          file_size_bytes: file.size,
          duracion_segundos: tipo === 'imagen' ? 10 : null,
          activa: true,
        });
        if (!addRes.ok) {
          setError(addRes.error);
          return;
        }
      }
      await fetchMedia();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo subir el archivo.');
    } finally {
      setUploading(false);
    }
  };

  const drop = useDropzone({
    onDrop: uploadFiles,
    accept: {
      'video/*': ['.mp4', '.webm', '.mov'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
    },
    disabled: uploading,
  });

  const addTicker = async () => {
    const msg = nuevoTicker.trim();
    if (!msg) return;
    const r = await addTickerAction(msg, tiraList.length);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setNuevoTicker('');
    await fetchTicker();
  };

  const deleteTicker = async (id: string) => {
    if (!confirm('¿Eliminar este mensaje?')) return;
    const r = await deleteTickerAction(id);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    await fetchTicker();
    await fetchAssignments();
  };

  const saveVideoPlaylistForCourt = async (courtKey: string, orderedMediaIds: string[], cambioMin: number) => {
    if (!expressVenue) return;
    setSavingCourtKey(courtKey);
    setError(null);
    try {
      const durSec = cambioMin > 0 ? cambioMin * 60 : 30;
      const s1 = await savePlaylistAction(courtKey, expressVenue, orderedMediaIds, 'video', durSec);
      if (!s1.ok) {
        setError(s1.error);
        return;
      }
      const s2 = await upsertPlaylistConfigAction(expressVenue, courtKey, {
        video_cambio_cada_minutos: Math.max(0, Math.floor(Number(cambioMin) || 0)),
      });
      if (!s2.ok) setError(s2.error);
      else await fetchAssignments();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar vídeos.');
    } finally {
      setSavingCourtKey(null);
    }
  };

  const saveImagePlaylistForCourt = async (
    courtKey: string,
    orderedMediaIds: string[],
    cambioMin: number,
    loop: boolean,
    pausaSeg: number,
  ) => {
    if (!expressVenue) return;
    setSavingCourtKey(courtKey);
    setError(null);
    try {
      const durSec = cambioMin > 0 ? cambioMin * 60 : 10;
      const s1 = await savePlaylistAction(courtKey, expressVenue, orderedMediaIds, 'imagen', durSec);
      if (!s1.ok) {
        setError(s1.error);
        return;
      }
      const s2 = await upsertPlaylistConfigAction(expressVenue, courtKey, {
        imagen_cambio_cada_minutos: Math.max(0, Math.floor(Number(cambioMin) || 0)),
        imagen_loop: loop,
        imagen_pausa_entre_segundos: Math.max(0, Math.floor(Number(pausaSeg) || 0)),
      });
      if (!s2.ok) setError(s2.error);
      else await fetchAssignments();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar imágenes.');
    } finally {
      setSavingCourtKey(null);
    }
  };

  const saveTiraPlaylistForCourt = async (courtKey: string, orderedTiraIds: string[], cambioMin: number) => {
    if (!expressVenue) return;
    setSavingCourtKey(courtKey);
    setError(null);
    try {
      const s1 = await saveTiraPlaylistAction(courtKey, expressVenue, orderedTiraIds);
      if (!s1.ok) {
        setError(s1.error);
        return;
      }
      const s2 = await upsertPlaylistConfigAction(expressVenue, courtKey, {
        tira_cambio_cada_minutos: Math.max(0, Math.floor(Number(cambioMin) || 0)),
      });
      if (!s2.ok) setError(s2.error);
      else await fetchAssignments();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la tira.');
    } finally {
      setSavingCourtKey(null);
    }
  };

  const handleCourtCountChange = (next: number) => {
    const n = Math.min(MAX_EXPRESS_COURT_COUNT, Math.max(1, Math.floor(next) || DEFAULT_EXPRESS_COURT_COUNT));
    setCourtCount(n);
    if (selectedBaseVenue) saveExpressCourtCount(selectedBaseVenue, n);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-padel-primary" />
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <main className="overflow-y-auto px-3 py-4 md:px-4 md:py-5">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="flex items-start">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 py-2.5 pl-2 pr-3 transition-colors hover:border-white/20 hover:bg-white/10"
              aria-label="Volver al admin"
            >
              <ArrowLeft
                className="h-5 w-5 shrink-0 text-white/80 transition-colors group-hover:text-padel-primary"
                strokeWidth={2.25}
              />
            </button>
          </div>

          <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="space-y-1">
              <h1 className="flex items-center gap-2 text-2xl font-black uppercase italic leading-none md:text-3xl">
                <Zap className="h-7 w-7 text-padel-primary" />
                Express · Publicidad
              </h1>
              <p className="text-[11px] uppercase leading-tight tracking-wider text-white/60">
                Playlists por sede para pantallas{' '}
                <span className="font-mono text-padel-primary/90">/display/express/scan-go-N</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/publicidad"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-zinc-800"
              >
                <Megaphone className="h-4 w-4 text-padel-primary" />
                Biblioteca global
              </Link>
            </div>
          </header>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <section className="rounded-2xl border border-padel-primary/25 bg-gradient-to-br from-padel-primary/[0.06] to-black/40 p-4 md:p-5">
            <h2 className="mb-2 text-sm font-black uppercase tracking-wider text-white/90">Cómo funciona</h2>
            <ul className="space-y-1.5 text-xs leading-relaxed text-white/55">
              <li>
                Los <strong className="text-white/80">nombres de jugadores</strong> se editan en el móvil al
                escanear el QR (4 jugadores: nombre + apellido).
              </li>
              <li>
                Sube vídeos/imágenes aquí abajo; en cada tarjeta <span className="font-mono">scan-go-N</span> elige{' '}
                <strong className="text-white/80">Video</strong>, <strong className="text-white/80">Imagen</strong>{' '}
                o <strong className="text-white/80">Texto</strong> (tira inferior).
              </li>
              <li>
                También puedes elegir vídeos desde el móvil: control Express →{' '}
                <strong className="text-white/80">Publicidad en TV</strong>.
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:p-5 space-y-4">
            <h2 className="text-lg font-black uppercase tracking-wider">Biblioteca Express</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div {...drop.getRootProps()} className="cursor-pointer">
                <input {...drop.getInputProps()} />
                <button type="button" className="flex items-center gap-2 rounded-xl bg-padel-primary px-4 py-2 text-xs font-black uppercase tracking-wider text-black">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Subir vídeo o imagen
                </button>
              </div>
              <p className="text-xs text-white/50">
                {videos.length} vídeos · {carrusel.length} imágenes en biblioteca
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-black uppercase tracking-wider text-white/80">Tira inferior (textos)</h3>
              <div className="mb-3 flex gap-2">
                <input
                  value={nuevoTicker}
                  onChange={(e) => setNuevoTicker(e.target.value)}
                  placeholder="Nuevo mensaje para la tira"
                  className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/45 outline-none focus:border-white/25"
                />
                <button
                  type="button"
                  onClick={() => void addTicker()}
                  className="rounded-xl bg-padel-primary px-4 py-2 text-xs font-black uppercase text-black"
                >
                  Agregar
                </button>
              </div>
              <ul className="max-h-36 space-y-1 overflow-y-auto">
                {tiraList.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
                  >
                    <span className="truncate text-white/90">{t.mensaje}</span>
                    <button
                      type="button"
                      onClick={() => void deleteTicker(t.id)}
                      className="shrink-0 rounded-lg p-1.5 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
                {tiraList.length === 0 && (
                  <li className="py-4 text-center text-xs text-white/40">Sin mensajes — créalos arriba</li>
                )}
              </ul>
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:p-5">
            <h2 className="text-lg font-black uppercase tracking-wider">Sede y canchas Express</h2>
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[200px] flex-1 max-w-md">
                <label className="text-[10px] uppercase text-white/60">Sede</label>
                <select
                  value={selectedBaseVenue}
                  onChange={(e) => setSelectedBaseVenue(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                >
                  {venueOptions.length === 0 ? (
                    <option value="">— Sin sedes (crea torneo o sede) —</option>
                  ) : (
                    venueOptions.map((v) => (
                      <option key={v} value={v} className="bg-zinc-950">
                        {v}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="w-28">
                <label className="text-[10px] uppercase text-white/60">Pistas Express</label>
                <input
                  type="number"
                  min={1}
                  max={MAX_EXPRESS_COURT_COUNT}
                  value={courtCount}
                  onChange={(e) => handleCourtCountChange(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                />
              </div>
            </div>
            {selectedBaseVenue && (
              <p className="text-[10px] text-white/45">
                Playlist venue: <span className="font-mono text-white/65">{expressVenue}</span>
              </p>
            )}
          </section>

          {selectedBaseVenue && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-padel-primary" />
                <h2 className="text-lg font-black uppercase tracking-wider">Playlists por pantalla</h2>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {expressCourts.map((court) => {
                  const rows = assignments.filter(
                    (a) =>
                      canchaMatches(a.cancha_id, court.key) && venueMatches(a.venue_name, expressVenue),
                  );
                  const { video, imagen } = partitionPlaylistRows(rows as CourtPlaylistRowDb[]);
                  const cfg = playlistConfigByCourt[court.key];
                  const tvPath = buildExpressDisplayUrl(court.displayNum, selectedBaseVenue);
                  const tvHref = `${appOrigin}${tvPath}`;

                  return (
                    <CourtCard
                      key={`${expressVenue}-${court.slug}`}
                      venueName={expressVenue}
                      courtKey={court.key}
                      displayCourtNum={court.displayNum}
                      title={court.label}
                      courtKeyBadge={court.slug}
                      libraryVideos={videos}
                      libraryImages={carrusel}
                      videoRows={video as CourtPlaylistRow[]}
                      imageRows={imagen as CourtPlaylistRow[]}
                      tiraList={tiraList.map((t) => ({ id: t.id, mensaje: t.mensaje }))}
                      linkedTiraIds={tiraLinksByCourt[court.key] || []}
                      videoCambioMinutos={cfg?.video_cambio_cada_minutos ?? 0}
                      imagenCambioMinutos={cfg?.imagen_cambio_cada_minutos ?? 0}
                      tiraCambioMinutos={cfg?.tira_cambio_cada_minutos ?? 0}
                      imagenLoop={cfg?.imagen_loop ?? true}
                      imagenPausaSeg={cfg?.imagen_pausa_entre_segundos ?? 0}
                      lastSeenIso={canchasHealth[court.key] ?? null}
                      isSaving={savingCourtKey === court.key}
                      onSaveVideoPlaylist={(ids, min) => saveVideoPlaylistForCourt(court.key, ids, min)}
                      onSaveImagePlaylist={(ids, min, loop, pausa) =>
                        saveImagePlaylistForCourt(court.key, ids, min, loop, pausa)
                      }
                      onSaveTiraPlaylist={(ids, min) => saveTiraPlaylistForCourt(court.key, ids, min)}
                      openDisplayHref={tvPath}
                      openDisplayHrefLabel={`${appOrigin.replace(/^https?:\/\//, '')}${tvPath}`}
                      previewIframeSrcOverride={tvPath}
                    />
                  );
                })}
              </div>
              <p className="flex items-center gap-1.5 text-[10px] text-white/40">
                <ExternalLink className="h-3 w-3" />
                Abre cada enlace en el navegador de la TV (Chromecast / Fire Stick / PC).
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
