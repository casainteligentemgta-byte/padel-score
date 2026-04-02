'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import CourtCard from '@/components/publicidad/CourtCard';
import type { CourtPlaylistRow } from '@/components/publicidad/CourtCard';
import {
  partitionPlaylistRows,
  playlistRowKind,
  upsertCanchaPlaylistConfig,
  type CourtPlaylistRowDb,
} from '@/lib/courtPlaylists';
import { AlertCircle, Check, ChevronLeft, Download, Edit3, Eye, Loader2, Trash2, Upload, X } from 'lucide-react';
import type { MediaContent, TiraInformativa } from '@/lib/supabase/publicidad';
import { 
  addMediaContentAction, 
  deleteMediaAction, 
  renameMediaAction, 
  addTickerAction, 
  deleteTickerAction, 
  savePlaylistAction, 
  saveTiraPlaylistAction, 
  upsertPlaylistConfigAction,
  fetchAssignmentsAction,
} from './actions';

type VenueWithCourts = {
  name: string;
  courts: { key: string; label: string; displayNum: number }[];
};

function buildVenuesAndCourtsFromTournaments(tournaments: any[]): VenueWithCourts[] {
  const map = new Map<string, { maxN: number; bestNames: string[] }>();

  for (const t of tournaments || []) {
    const name = String(t?.complexName || (t as any)?.complex || (t as any)?._complexName || '').trim();
    if (!name) continue;
    const courtNames = Array.isArray(t.courtNames) ? t.courtNames.map((x: any) => String(x).trim()) : [];
    const totalFromNum = Number(t.totalCourts) || 0;
    const n = Math.max(courtNames.length, totalFromNum, 1);
    const prev = map.get(name);
    const useNames = courtNames.length >= (prev?.bestNames.length ?? 0) ? courtNames : prev?.bestNames ?? courtNames;
    map.set(name, {
      maxN: Math.max(prev?.maxN ?? 0, n),
      bestNames: useNames,
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
      return { name, courts };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

const mb = (bytes?: number | null) => {
  if (!bytes || Number(bytes) <= 0) return '—';
  return `${(Number(bytes) / (1024 * 1024)).toFixed(1)} MB`;
};

const isVideoFile = (f: File) => f.type.startsWith('video/');
const isImageFile = (f: File) => f.type.startsWith('image/');

export default function AdminPublicidadPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [mediaList, setMediaList] = useState<MediaContent[]>([]);
  const [tiraList, setTiraList] = useState<TiraInformativa[]>([]);
  const [nuevoTicker, setNuevoTicker] = useState('');
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [editingMediaName, setEditingMediaName] = useState('');

  const [venues, setVenues] = useState<VenueWithCourts[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [assignments, setAssignments] = useState<CourtPlaylistRow[]>([]);

  const [savingCourtKey, setSavingCourtKey] = useState<string | null>(null);
  /** last_seen ISO por cancha_id (heartbeat desde pizarra) */
  const [canchasHealth, setCanchasHealth] = useState<Record<string, string | null>>({});
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

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/');
  }, [authLoading, isAdmin, router]);

  const fetchMedia = useCallback(async () => {
    const { data, error } = await supabase.from('media_content').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    setMediaList((data as MediaContent[]) || []);
  }, [supabase]);

  const fetchTicker = useCallback(async () => {
    const { data, error } = await supabase.from('tira_informativa').select('*').order('orden', { ascending: true });
    if (error) throw error;
    setTiraList((data as TiraInformativa[]) || []);
  }, [supabase]);

  const loadVenuesAndCourts = useCallback(async () => {
    const all = await dataService.listAllTournaments();
    const list = buildVenuesAndCourtsFromTournaments(all || []);
    setVenues(list);
    if (!selectedVenue && list.length > 0) setSelectedVenue(list[0].name);
  }, [selectedVenue]);

  const selectedVenueCourts = useMemo(() => {
    return venues.find((v) => v.name === selectedVenue)?.courts ?? [];
  }, [venues, selectedVenue]);

  const courtKeySet = useMemo(() => new Set(selectedVenueCourts.map((c) => c.key)), [selectedVenueCourts]);

  const fetchAssignments = useCallback(async () => {
    if (!selectedVenue) return;
    const keys = selectedVenueCourts.map((c) => String(c.key).trim());
    try {
      const { assignments: data, config, tiras } = await fetchAssignmentsAction(selectedVenue);
      
      const filtered: CourtPlaylistRow[] = (data || []).map((r: any) => {
        const mc = r.media_content;
        const media_content = Array.isArray(mc) ? mc[0] ?? null : mc ?? null;
        return {
          id: String(r.id),
          cancha_id: String(r.cancha_id || '').trim(),
          venue_name: String(r.venue_name || '').trim(),
          orden: Number(r.orden),
          duracion_segundos: Number(r.duracion_segundos),
          playlist_slot: r.playlist_slot ?? undefined,
          media_content,
        };
      });
      setAssignments(filtered);

      const tmap: Record<string, string[]> = {};
      keys.forEach((k) => { tmap[k] = []; });
      (tiras || []).forEach((row: any) => {
        const cid = (row.cancha_id || '').trim();
        if (tmap[cid]) {
          tmap[cid].push(row.tira_informativa_id);
        }
      });
      setTiraLinksByCourt(tmap);

      const cmap: Record<string, any> = {};
      (config || []).forEach((r: any) => {
        const cid = (r.cancha_id || '').trim();
        cmap[cid] = {
          imagen_loop: r.imagen_loop !== false,
          imagen_pausa_entre_segundos: Math.max(0, Number(r.imagen_pausa_entre_segundos) || 0),
          video_cambio_cada_minutos: Number(r.video_cambio_cada_minutos) || 0,
          imagen_cambio_cada_minutos: Number(r.imagen_cambio_cada_minutos) || 0,
          tira_cambio_cada_minutos: Number(r.tira_cambio_cada_minutos) || 0,
        };
      });
      setPlaylistConfigByCourt(cmap);
    } catch (e) {
      console.error('Error fetching assignments:', e);
    }
  }, [selectedVenue, selectedVenueCourts]);


  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([fetchMedia(), fetchTicker(), loadVenuesAndCourts()]);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'No se pudo cargar publicidad.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [fetchMedia, fetchTicker, loadVenuesAndCourts]);


  useEffect(() => {
    const keys = selectedVenueCourts.map((c) => c.key);
    if (keys.length === 0) {
      setCanchasHealth({});
      return;
    }
    const load = async () => {
      const { data, error } = await supabase.from('canchas').select('cancha_id, last_seen').in('cancha_id', keys);
      if (error) return;
      const m: Record<string, string | null> = {};
      keys.forEach((k) => {
        m[k] = null;
      });
      (data || []).forEach((r: { cancha_id: string; last_seen: string | null }) => {
        m[r.cancha_id] = r.last_seen;
      });
      setCanchasHealth(m);
    };
    void load();
    const id = window.setInterval(load, 15_000);
    return () => window.clearInterval(id);
  }, [selectedVenueCourts, supabase]);

  useEffect(() => {
    fetchAssignments();
  }, [selectedVenue, selectedVenueCourts, fetchAssignments]);

  const videos = useMemo(() => mediaList.filter((m) => String(m.tipo).includes('video')), [mediaList]);
  const carrusel = useMemo(() => mediaList.filter((m) => m.tipo === 'imagen'), [mediaList]);



  const saveVideoPlaylistForCourt = async (courtKey: string, orderedMediaIds: string[], cambioMin: number) => {
    if (!selectedVenue) return;
    setSavingCourtKey(courtKey);
    setError(null);
    try {
      const durSec = cambioMin > 0 ? cambioMin * 60 : 30;
      await savePlaylistAction(courtKey, selectedVenue, orderedMediaIds, 'video', durSec);
      await upsertPlaylistConfigAction(selectedVenue, courtKey, { video_cambio_cada_minutos: cambioMin });
      await fetchAssignments();
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar videos.');
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
    if (!selectedVenue) return;
    setSavingCourtKey(courtKey);
    setError(null);
    try {
      const durSec = cambioMin > 0 ? cambioMin * 60 : 10;
      await savePlaylistAction(courtKey, selectedVenue, orderedMediaIds, 'imagen', durSec);
      await upsertPlaylistConfigAction(selectedVenue, courtKey, {
        imagen_cambio_cada_minutos: cambioMin,
        imagen_loop: loop,
        imagen_pausa_entre_segundos: pausaSeg,
      });
      await fetchAssignments();
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar imágenes.');
    } finally {
      setSavingCourtKey(null);
    }
  };

  const saveTiraPlaylistForCourt = async (courtKey: string, orderedTiraIds: string[], cambioMin: number) => {
    if (!selectedVenue) return;
    setSavingCourtKey(courtKey);
    setError(null);
    try {
      await saveTiraPlaylistAction(courtKey, selectedVenue, orderedTiraIds);
      await upsertPlaylistConfigAction(selectedVenue, courtKey, {
        tira_cambio_cada_minutos: cambioMin,
      });
      await fetchAssignments();
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar la tira.');
    } finally {
      setSavingCourtKey(null);
    }
  };

  const uploadFiles = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      const tryUploadToBuckets = async (path: string, file: File) => {
        const buckets = ['publicidad', 'ads', 'media'];
        let lastErr: any = null;
        for (const bucket of buckets) {
          const up = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
          if (!up.error) {
            const pub = supabase.storage.from(bucket).getPublicUrl(path);
            return { bucket, publicUrl: pub.data.publicUrl };
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
        const pub = await tryUploadToBuckets(path, file);
        const tipo = isVideoFile(file) ? 'video_file' : isImageFile(file) ? 'imagen' : 'video_file';
        await addMediaContentAction({
          tipo,
          url: pub.publicUrl,
          nombre: file.name,
          nombre_sponsor: file.name.replace(/\.[^/.]+$/, ''),
          file_size_bytes: file.size,
          duracion_segundos: tipo === 'imagen' ? 10 : null,
          activa: true,
        });
      }
      await fetchMedia();
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.toLowerCase().includes('bucket') && msg.toLowerCase().includes('not found')) {
        setError('Bucket not found. Crea un bucket público llamado "publicidad" (o "ads") en Supabase Storage.');
      } else {
        setError(msg || 'No se pudo subir el archivo.');
      }
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

  const deleteMedia = async (id: string) => {
    if (!confirm('¿Eliminar este medio?')) return;
    try {
      await deleteMediaAction(id);
      await fetchMedia();
      await fetchAssignments();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const renameMedia = async (id: string, nextNameRaw: string) => {
    const nextName = nextNameRaw.trim();
    if (!nextName) return;
    setError(null);
    try {
      await renameMediaAction(id, nextName);
      setEditingMediaId(null);
      setEditingMediaName('');
      await fetchMedia();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const download = async (url: string, name: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = name || 'media';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  const addTicker = async () => {
    const msg = nuevoTicker.trim();
    if (!msg) return;
    try {
      await addTickerAction(msg, tiraList.length);
      setNuevoTicker('');
      await fetchTicker();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const deleteTicker = async (id: string) => {
    try {
      await deleteTickerAction(id);
      await fetchTicker();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const renderMediaTable = (title: string, items: MediaContent[], allowRename = false) => (
    <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6">
      <h2 className="text-lg md:text-xl font-black uppercase tracking-wider mb-4">{title}</h2>
      <div className="overflow-auto rounded-2xl border border-white/10">
        <table className="w-full text-left">
          <thead className="bg-black/40">
            <tr>
              <th className="px-3 py-2 text-[10px] uppercase text-white/60">Nombre</th>
              <th className="px-3 py-2 text-[10px] uppercase text-white/60">Tamaño</th>
              <th className="px-3 py-2 text-[10px] uppercase text-white/60 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id} className="border-t border-white/10">
                <td className="px-3 py-2 text-sm font-bold text-white/90">
                  {allowRename && editingMediaId === m.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        value={editingMediaName}
                        onChange={(e) => setEditingMediaName(e.target.value)}
                        className="min-w-0 flex-1 bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-padel-primary"
                      />
                      <button
                        type="button"
                        onClick={() => renameMedia(m.id, editingMediaName)}
                        className="p-1.5 rounded-lg bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 hover:bg-emerald-500/35"
                        title="Guardar nombre"
                      >
                        <Check size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMediaId(null);
                          setEditingMediaName('');
                        }}
                        className="p-1.5 rounded-lg bg-white/20 text-white border border-white/30 hover:bg-white/30"
                        title="Cancelar"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    m.nombre_sponsor || m.nombre || 'Sin nombre'
                  )}
                </td>
                <td className="px-3 py-2 text-xs text-white/70">{mb((m as any).file_size_bytes)}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-2">
                    {allowRename && editingMediaId !== m.id && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMediaId(m.id);
                          setEditingMediaName(m.nombre_sponsor || m.nombre || '');
                        }}
                        className="p-2 rounded-lg bg-sky-500/25 text-sky-100 border border-sky-400/40 hover:bg-sky-500/35"
                        title="Renombrar"
                      >
                        <Edit3 size={14} />
                      </button>
                    )}
                    <button type="button" onClick={() => setPreviewUrl(m.url)} className="p-2 rounded-lg bg-white/20 text-white border border-white/30 hover:bg-white/30" title="Preview"><Eye size={14} /></button>
                    <button type="button" onClick={() => download(m.url, m.nombre || m.nombre_sponsor || 'media')} className="p-2 rounded-lg bg-indigo-500/25 text-indigo-100 border border-indigo-400/40 hover:bg-indigo-500/35" title="Download"><Download size={14} /></button>
                    <button type="button" onClick={() => deleteMedia(m.id)} className="p-2 rounded-lg bg-red-500/25 text-red-100 border border-red-400/40 hover:bg-red-500/35" title="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td className="px-3 py-8 text-center text-white/40 text-xs" colSpan={3}>Sin elementos</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  if (authLoading || loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-padel-primary" /></div>;
  }
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <main className="overflow-y-auto px-3 py-4 md:px-4 md:py-5">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-start">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/70 hover:text-white transition-colors"
              aria-label="Atrás"
              title="Volver"
            >
              <ChevronLeft className="w-4 h-4 text-padel-primary" />
              Atrás
            </button>
          </div>

          <header className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black uppercase italic leading-none">Admin Publicidad</h1>
            <p className="text-[11px] text-white/60 uppercase tracking-wider leading-tight">Playlist independiente por sede y cancha</p>
          </header>

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300 flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 md:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <div {...drop.getRootProps()} className="cursor-pointer">
                <input {...drop.getInputProps()} />
                <button type="button" className="px-4 py-2 rounded-xl bg-padel-primary text-black font-black text-xs uppercase tracking-wider flex items-center gap-2">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Cargar Media
                </button>
              </div>
              <p className="text-xs text-white/50">Videos e imágenes para la biblioteca y las playlists.</p>
            </div>
          </section>

          {renderMediaTable('Biblioteca de Videos', videos, true)}
          {renderMediaTable('Biblioteca de Carrusel', carrusel, true)}

          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 md:p-5">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-wider mb-4">Ticker</h2>
            <div className="flex gap-2 mb-3">
              <input
                value={nuevoTicker}
                onChange={(e) => setNuevoTicker(e.target.value)}
                placeholder="Nuevo mensaje para la tira"
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/45 outline-none focus:border-white/25"
              />
              <button type="button" onClick={addTicker} className="px-4 py-2 rounded-xl bg-padel-primary text-black font-black text-xs uppercase">Agregar</button>
            </div>
            <div className="overflow-auto rounded-2xl border border-white/10">
              <table className="w-full text-left">
                <thead className="bg-black/40">
                  <tr>
                    <th className="px-3 py-2 text-[10px] uppercase text-white/60">Nombre</th>
                    <th className="px-3 py-2 text-[10px] uppercase text-white/60">Tamaño</th>
                    <th className="px-3 py-2 text-[10px] uppercase text-white/60 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tiraList.map((t) => (
                    <tr key={t.id} className="border-t border-white/10">
                      <td className="px-3 py-2 text-sm font-bold text-white/90">{t.mensaje}</td>
                      <td className="px-3 py-2 text-xs text-white/70">—</td>
                      <td className="px-3 py-2 text-right">
                        <button type="button" onClick={() => deleteTicker(t.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                  {tiraList.length === 0 && (
                    <tr><td className="px-3 py-8 text-center text-white/40 text-xs" colSpan={3}>Sin mensajes</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 md:p-5 space-y-3">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-wider">Playlists por sede</h2>
            <p className="text-xs text-white/50">
              Sedes y nombres de pista se obtienen de los torneos. Al elegir una sede solo ves las canchas de ese club.
            </p>
            <div className="max-w-md">
              <label className="text-[10px] uppercase text-white/60">Sede</label>
              <select
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-white/25"
              >
                {venues.length === 0 ? (
                  <option value="" className="bg-zinc-950 text-white">— Sin sedes en torneos —</option>
                ) : (
                  venues.map((v) => (
                    <option key={v.name} value={v.name} className="bg-zinc-950 text-white">
                      {v.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {selectedVenueCourts.map((court) => {
                const rows = assignments.filter((a: any) => 
                  String(a.cancha_id).trim() === String(court.key).trim() && 
                  String(a.venue_name || '').trim() === String(selectedVenue || '').trim()
                );
                const { video, imagen } = partitionPlaylistRows(rows as CourtPlaylistRowDb[]);
                const cfg = playlistConfigByCourt[court.key];
                return (
                  <CourtCard
                    key={`${selectedVenue}-${court.key}`}
                    venueName={selectedVenue}
                    courtKey={court.key}
                    displayCourtNum={court.displayNum}
                    title={court.label}
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
                  />
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 relative">
            <button type="button" onClick={() => setPreviewUrl(null)} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50"><X size={16} /></button>
            {/\.(mp4|webm|mov|m4v)$/i.test(previewUrl) ? (
              <video src={previewUrl} controls autoPlay className="w-full h-full" />
            ) : (
              <img src={previewUrl} alt="preview" className="w-full h-full object-contain" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
