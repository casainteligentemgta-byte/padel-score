'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import CourtCard from '@/components/publicidad/CourtCard';
import type { CourtPlaylistRow } from '@/components/publicidad/CourtCard';
import {
  partitionPlaylistRows,
  playlistRowKind,
  upsertCanchaPlaylistConfig,
  type CourtPlaylistRowDb,
} from '@/lib/courtPlaylists';
import { AlertCircle, ChevronLeft, Download, Eye, Loader2, Trash2, Upload, X } from 'lucide-react';
import type { MediaContent, TiraInformativa } from '@/lib/supabase/publicidad';

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
        courts.push({ key: `cancha_${displayNum}`, label, displayNum });
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
    if (!selectedVenue || selectedVenueCourts.length === 0) {
      setAssignments([]);
      return;
    }
    const keys = selectedVenueCourts.map((c) => c.key);

    const r1 = await supabase
      .from('cancha_publicidad')
      .select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, media_content(*)')
      .in('cancha_id', keys)
      .eq('venue_name', selectedVenue)
      .order('orden', { ascending: true });

    let raw: unknown[] = [];
    if (!r1.error && r1.data) {
      raw = r1.data as unknown[];
    } else {
      const r2 = await supabase
        .from('cancha_publicidad')
        .select('id, cancha_id, media_id, orden, duracion_segundos, media_content(*)')
        .in('cancha_id', keys)
        .order('orden', { ascending: true });
      if (r2.error) throw r2.error;
      raw = (r2.data as unknown[]) || [];
    }
    type RowIn = {
      id: string;
      cancha_id: string;
      orden: number;
      duracion_segundos: number;
      playlist_slot?: string | null;
      media_content?: MediaContent | MediaContent[] | null;
    };
    const filtered: CourtPlaylistRow[] = (raw as RowIn[])
      .filter((r) => courtKeySet.has(r.cancha_id))
      .map((r) => {
        const mc = r.media_content;
        const media_content = Array.isArray(mc) ? mc[0] ?? null : mc ?? null;
        return {
          id: String(r.id),
          cancha_id: String(r.cancha_id),
          orden: Number(r.orden),
          duracion_segundos: Number(r.duracion_segundos),
          playlist_slot: r.playlist_slot ?? undefined,
          media_content,
        };
      });
    setAssignments(filtered);

    const tmap: Record<string, string[]> = {};
    keys.forEach((k) => {
      tmap[k] = [];
    });
    const tr = await supabase
      .from('cancha_tira')
      .select('cancha_id, tira_informativa_id, orden')
      .eq('venue_name', selectedVenue)
      .order('orden', { ascending: true });
    if (!tr.error && tr.data) {
      (tr.data as { cancha_id: string; tira_informativa_id: string }[]).forEach((row) => {
        if (!tmap[row.cancha_id]) tmap[row.cancha_id] = [];
        tmap[row.cancha_id].push(row.tira_informativa_id);
      });
    }
    setTiraLinksByCourt(tmap);

    const cmap: Record<
      string,
      {
        imagen_loop: boolean;
        imagen_pausa_entre_segundos: number;
        video_cambio_cada_minutos: number;
        imagen_cambio_cada_minutos: number;
        tira_cambio_cada_minutos: number;
      }
    > = {};
    const cr = await supabase.from('cancha_playlist_config').select('*').eq('venue_name', selectedVenue);
    if (!cr.error && cr.data) {
      (cr.data as any[]).forEach((r) => {
        cmap[r.cancha_id] = {
          imagen_loop: r.imagen_loop !== false,
          imagen_pausa_entre_segundos: Math.max(0, Number(r.imagen_pausa_entre_segundos) || 0),
          video_cambio_cada_minutos: Math.max(0, Math.floor(Number(r.video_cambio_cada_minutos) || 0)),
          imagen_cambio_cada_minutos: Math.max(0, Math.floor(Number(r.imagen_cambio_cada_minutos) || 0)),
          tira_cambio_cada_minutos: Math.max(0, Math.floor(Number(r.tira_cambio_cada_minutos) || 0)),
        };
      });
    }
    setPlaylistConfigByCourt(cmap);
  }, [selectedVenue, selectedVenueCourts, supabase, courtKeySet]);

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
    fetchAssignments().catch((e: any) => setError(e?.message || 'No se pudo cargar asignaciones.'));
  }, [fetchAssignments]);

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

  const videos = useMemo(() => mediaList.filter((m) => String(m.tipo).includes('video')), [mediaList]);
  const carrusel = useMemo(() => mediaList.filter((m) => m.tipo === 'imagen'), [mediaList]);

  const insertCanchaPublicidadRow = async (base: Record<string, unknown>): Promise<string | null> => {
    const row: Record<string, unknown> = { ...base };
    if (selectedVenue) row.venue_name = selectedVenue;
    let { error } = await supabase.from('cancha_publicidad').insert(row);
    if (error && error.message?.toLowerCase().includes('venue')) {
      delete row.venue_name;
      ({ error } = await supabase.from('cancha_publicidad').insert(row));
    }
    if (error && (error.message?.includes('playlist_slot') || error.message?.includes('schema cache'))) {
      const row2 = { ...row };
      delete row2.playlist_slot;
      ({ error } = await supabase.from('cancha_publicidad').insert(row2));
    }
    return error?.message ?? null;
  };

  const saveVideoPlaylistForCourt = async (courtKey: string, orderedMediaIds: string[], cambioMin: number) => {
    if (!selectedVenue) return;
    setSavingCourtKey(courtKey);
    setError(null);
    try {
      const toRemove = assignments.filter((a) => a.cancha_id === courtKey && playlistRowKind(a) === 'video');
      for (const a of toRemove) {
        const { error } = await supabase.from('cancha_publicidad').delete().eq('id', a.id);
        if (error) throw new Error(error.message);
      }
      const durSec = cambioMin > 0 ? cambioMin * 60 : 30;
      for (let i = 0; i < orderedMediaIds.length; i++) {
        const err = await insertCanchaPublicidadRow({
          cancha_id: courtKey,
          media_id: orderedMediaIds[i],
          orden: i + 1,
          duracion_segundos: durSec,
          playlist_slot: 'video',
        });
        if (err) throw new Error(err);
      }
      const { error: cfgErr } = await upsertCanchaPlaylistConfig(supabase, selectedVenue, courtKey, {
        video_cambio_cada_minutos: cambioMin,
      });
      if (cfgErr) throw new Error(cfgErr.message);
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
      const toRemove = assignments.filter((a) => a.cancha_id === courtKey && playlistRowKind(a) === 'imagen');
      for (const a of toRemove) {
        const { error } = await supabase.from('cancha_publicidad').delete().eq('id', a.id);
        if (error) throw new Error(error.message);
      }
      const durSec = cambioMin > 0 ? cambioMin * 60 : 10;
      for (let i = 0; i < orderedMediaIds.length; i++) {
        const err = await insertCanchaPublicidadRow({
          cancha_id: courtKey,
          media_id: orderedMediaIds[i],
          orden: i + 1,
          duracion_segundos: durSec,
          playlist_slot: 'imagen',
        });
        if (err) throw new Error(err);
      }
      const { error: cfgErr } = await upsertCanchaPlaylistConfig(supabase, selectedVenue, courtKey, {
        imagen_cambio_cada_minutos: cambioMin,
        imagen_loop: loop,
        imagen_pausa_entre_segundos: pausaSeg,
      });
      if (cfgErr) throw new Error(cfgErr.message);
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
      let del = await supabase
        .from('cancha_tira')
        .delete()
        .eq('cancha_id', courtKey)
        .eq('venue_name', selectedVenue);
      if (del.error) {
        del = await supabase.from('cancha_tira').delete().eq('cancha_id', courtKey);
        if (del.error) throw new Error(del.error.message);
      }
      for (let i = 0; i < orderedTiraIds.length; i++) {
        const row: Record<string, unknown> = {
          cancha_id: courtKey,
          tira_informativa_id: orderedTiraIds[i],
          orden: i + 1,
        };
        if (selectedVenue) row.venue_name = selectedVenue;
        let ins = await supabase.from('cancha_tira').insert(row);
        if (ins.error && ins.error.message?.toLowerCase().includes('venue')) {
          delete row.venue_name;
          ins = await supabase.from('cancha_tira').insert(row);
        }
        if (ins.error) throw new Error(ins.error.message);
      }
      const { error: cfgErr } = await upsertCanchaPlaylistConfig(supabase, selectedVenue, courtKey, {
        tira_cambio_cada_minutos: cambioMin,
      });
      if (cfgErr) throw new Error(cfgErr.message);
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
      for (const file of files) {
        const fileExt = file.name.split('.').pop() || 'bin';
        const path = `ads/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const up = await supabase.storage.from('publicidad').upload(path, file, { upsert: false });
        if (up.error) throw up.error;
        const pub = supabase.storage.from('publicidad').getPublicUrl(path);
        const tipo = isVideoFile(file) ? 'video_file' : isImageFile(file) ? 'imagen' : 'video_file';
        const ins = await supabase.from('media_content').insert({
          tipo,
          url: pub.data.publicUrl,
          nombre: file.name,
          nombre_sponsor: file.name.replace(/\.[^/.]+$/, ''),
          file_size_bytes: file.size,
          duracion_segundos: tipo === 'imagen' ? 10 : null,
          activa: true,
        });
        if (ins.error) throw ins.error;
      }
      await fetchMedia();
    } catch (e: any) {
      setError(e?.message || 'No se pudo subir el archivo.');
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
    const { error } = await supabase.from('media_content').delete().eq('id', id);
    if (error) return setError(error.message);
    await fetchMedia();
    await fetchAssignments();
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
    const { error } = await supabase.from('tira_informativa').insert({
      mensaje: msg,
      activo: true,
      orden: tiraList.length,
      pantalla_id: null,
    });
    if (error) return setError(error.message);
    setNuevoTicker('');
    await fetchTicker();
  };

  const deleteTicker = async (id: string) => {
    const { error } = await supabase.from('tira_informativa').delete().eq('id', id);
    if (error) return setError(error.message);
    await fetchTicker();
  };

  const renderMediaTable = (title: string, items: MediaContent[]) => (
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
                <td className="px-3 py-2 text-sm font-bold text-white/90">{m.nombre_sponsor || m.nombre || 'Sin nombre'}</td>
                <td className="px-3 py-2 text-xs text-white/70">{mb((m as any).file_size_bytes)}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => setPreviewUrl(m.url)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10" title="Preview"><Eye size={14} /></button>
                    <button type="button" onClick={() => download(m.url, m.nombre || m.nombre_sponsor || 'media')} className="p-2 rounded-lg bg-white/5 hover:bg-white/10" title="Download"><Download size={14} /></button>
                    <button type="button" onClick={() => deleteMedia(m.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20" title="Delete"><Trash2 size={14} /></button>
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
    <div className="min-h-screen bg-[#050505] text-white flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
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

          <header>
            <h1 className="text-3xl font-black uppercase italic">Admin Publicidad</h1>
            <p className="text-xs text-white/60 uppercase tracking-wider">Playlist independiente por sede y cancha</p>
          </header>

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300 flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6">
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

          {renderMediaTable('Biblioteca de Videos', videos)}
          {renderMediaTable('Biblioteca de Carrusel', carrusel)}

          <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-wider mb-4">Ticker</h2>
            <div className="flex gap-2 mb-4">
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

          <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 space-y-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {selectedVenueCourts.map((court) => {
                const rows = assignments.filter((a) => a.cancha_id === court.key);
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
